import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import { getPayload } from 'payload'

import { seededPosts, seededPostSlugs } from './seed-data/posts'
import type { SeedMode, SeedSummary } from './seed-data/types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = resolve(__dirname, '../.env')
const envResult = dotenv.config({ path: envPath })

if (envResult.error) {
  console.warn(`[seed] warning: failed to load .env at ${envPath}: ${envResult.error.message}`)
}

if (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET === 'your-secret-key-here') {
  console.error('[seed] PAYLOAD_SECRET is required')
  process.exit(1)
}

if (!process.env.DATABASE_URI && !process.env.PAYLOAD_DATABASE_URI) {
  console.error('[seed] DATABASE_URI or PAYLOAD_DATABASE_URI is required')
  process.exit(1)
}

const seedMode = (process.env.SEED_MODE || 'create-missing') as SeedMode
const skipImages = process.env.SEED_SKIP_IMAGES === 'true'
const imageRetries = Number(process.env.SEED_IMAGE_RETRIES || 2)
const imageTimeoutMs = Number(process.env.SEED_IMAGE_TIMEOUT_MS || 15000)

const summary: SeedSummary = {
  created: 0,
  updated: 0,
  skipped: 0,
  failed: 0,
}

const log = (message: string) => {
  console.log(`[seed] ${message}`)
}

const fetchWithTimeout = async (url: string, timeoutMs: number): Promise<ArrayBuffer> => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.arrayBuffer()
  } finally {
    clearTimeout(timeout)
  }
}

const downloadImageWithRetry = async (url: string): Promise<Buffer> => {
  let lastError: unknown

  for (let attempt = 1; attempt <= imageRetries; attempt++) {
    try {
      const data = await fetchWithTimeout(url, imageTimeoutMs)
      return Buffer.from(data)
    } catch (error) {
      lastError = error
      if (attempt < imageRetries) {
        await new Promise((resolve) => setTimeout(resolve, 250 * attempt))
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

const getOrCreateImageId = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  slug: string,
  title: string,
  imageUrl?: string,
): Promise<number | null> => {
  if (skipImages || !imageUrl) {
    return null
  }

  const filename = `${slug}.jpg`

  const existingMedia = await payload.find({
    collection: 'media',
    overrideAccess: true,
    where: {
      filename: {
        equals: filename,
      },
    },
    limit: 1,
  })

  if (existingMedia.docs.length > 0) {
    return Number(existingMedia.docs[0].id)
  }

  try {
    const imageBuffer = await downloadImageWithRetry(imageUrl)
    const uploadedMedia = await payload.create({
      collection: 'media',
      overrideAccess: true,
      data: {
        alt: title,
      },
      file: {
        data: imageBuffer,
        mimetype: 'image/jpeg',
        name: filename,
        size: imageBuffer.length,
      },
    })

    return Number(uploadedMedia.id)
  } catch (error) {
    log(
      `image fetch failed for ${slug}: ${error instanceof Error ? error.message : String(error)}; continuing without image`,
    )
    return null
  }
}

const resolvePublisherAuthorIds = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<number[]> => {
  const usersResult = await payload.find({
    collection: 'users',
    overrideAccess: true,
    where: {
      role: {
        equals: 'publisher',
      },
    },
    limit: 100,
  })

  if (usersResult.docs.length === 0) {
    throw new Error('No publisher user found. Run backend seed first to create publishers.')
  }

  return usersResult.docs.map((user) => Number(user.id))
}

const resolveTenantId = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  authorId: number,
): Promise<number> => {
  const tenantsResult = await payload.find({
    collection: 'tenants',
    overrideAccess: true,
    limit: 1,
  })

  if (tenantsResult.docs.length > 0) {
    return Number(tenantsResult.docs[0].id)
  }

  const tenant = await payload.create({
    collection: 'tenants',
    overrideAccess: true,
    data: {
      name: 'Default Space',
      slug: 'default-space',
      domain: 'default.localhost',
      createdBy: authorId,
    },
  })

  return Number(tenant.id)
}

const buildPostData = (post: (typeof seededPosts)[number], authorId: number, tenantId: number) => ({
  title: post.title,
  slug: post.slug,
  description: post.description,
  content: post.content,
  status: post.status,
  type: post.type,
  publishedAt: post.publishedAt,
  author: authorId,
  tenant: tenantId,
})

const createOrUpdatePost = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  post: (typeof seededPosts)[number],
  authorId: number,
  tenantId: number,
) => {
  const existing = await payload.find({
    collection: 'posts',
    overrideAccess: true,
    where: {
      slug: {
        equals: post.slug,
      },
    },
    limit: 1,
  })

  const existingDoc = existing.docs[0]
  const imageId = await getOrCreateImageId(payload, post.slug, post.title, post.imageUrl)
  const baseData = buildPostData(post, authorId, tenantId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const postData: any = {
    ...baseData,
    ...(imageId ? { image: imageId } : {}),
  }

  if (!existingDoc) {
    try {
      await payload.create({
        collection: 'posts',
        overrideAccess: true,
        data: postData,
      })
      summary.created++
      return
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (/invalid:\s*slug/i.test(message) || /field is invalid:\s*slug/i.test(message)) {
        if (seedMode === 'create-missing') {
          summary.skipped++
          log(`slug already exists for ${post.slug}; treating as skipped`)
          return
        }

        const bySlug = await payload.find({
          collection: 'posts',
          overrideAccess: true,
          where: {
            slug: {
              equals: post.slug,
            },
          },
          limit: 1,
        })

        if (bySlug.docs[0]) {
          await payload.update({
            collection: 'posts',
            overrideAccess: true,
            id: bySlug.docs[0].id,
            data: postData,
          })
          summary.updated++
          log(`slug collision for ${post.slug}; updated existing record`)
          return
        }
      }

      throw error
    }
  }

  if (seedMode === 'create-missing') {
    summary.skipped++
    return
  }

  await payload.update({
    collection: 'posts',
    overrideAccess: true,
    id: existingDoc.id,
    data: postData,
  })
  summary.updated++
}

const removeSeededPosts = async (payload: Awaited<ReturnType<typeof getPayload>>) => {
  for (const slug of seededPostSlugs) {
    const existing = await payload.find({
      collection: 'posts',
      overrideAccess: true,
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
    })

    if (existing.docs[0]) {
      await payload.delete({
        collection: 'posts',
        overrideAccess: true,
        id: existing.docs[0].id,
      })
    }
  }
}

const seed = async () => {
  if (!['create-missing', 'refresh', 'reset-seeded'].includes(seedMode)) {
    console.error(`[seed] invalid SEED_MODE: ${seedMode}`)
    process.exit(1)
  }

  const configModule = await import('./payload.config.js')
  const payload = await getPayload({ config: configModule.default })

  log(`mode=${seedMode}, skipImages=${skipImages}`)

  try {
    const publisherAuthorIds = await resolvePublisherAuthorIds(payload)
    const tenantId = await resolveTenantId(payload, publisherAuthorIds[0])

    if (seedMode === 'reset-seeded') {
      await removeSeededPosts(payload)
      log(`reset removed posts for ${seededPostSlugs.length} known seed slugs`)
    }

    for (let index = 0; index < seededPosts.length; index++) {
      const post = seededPosts[index]
      const authorId = publisherAuthorIds[index % publisherAuthorIds.length]
      try {
        await createOrUpdatePost(payload, post, authorId, tenantId)
      } catch (error) {
        summary.failed++
        log(
          `failed ${post.slug}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }

    log(
      `summary created=${summary.created} updated=${summary.updated} skipped=${summary.skipped} failed=${summary.failed}`,
    )
    process.exit(summary.failed > 0 ? 1 : 0)
  } catch (error) {
    console.error(`[seed] failed: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }
}

seed()
