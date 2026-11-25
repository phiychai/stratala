import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import { getPayload } from 'payload'

import { seededPosts } from './seed-data/posts'

import type { SeedMode, SeedSummary } from './seed-data/types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = resolve(__dirname, '../.env')
const envResult = dotenv.config({ path: envPath })

if (envResult.error) {
  console.warn(`[seed] warning: failed to load .env at ${envPath}: ${envResult.error.message}`)
}

const parseBoundedPositiveInteger = (name: string, fallback: number, min: number, max: number) => {
  const raw = process.env[name]
  if (raw === undefined || raw === '') return fallback
  if (!/^\d+$/.test(raw)) {
    throw new Error(`${name} must be a positive integer between ${min} and ${max}`)
  }
  const value = Number(raw)
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be a positive integer between ${min} and ${max}`)
  }
  return value
}

const seedMode = (process.env.SEED_MODE || 'create-missing') as SeedMode
const skipImages = process.env.SEED_SKIP_IMAGES === 'true'
const imageRetries = parseBoundedPositiveInteger('SEED_IMAGE_RETRIES', 2, 1, 10)
const imageTimeoutMs = parseBoundedPositiveInteger('SEED_IMAGE_TIMEOUT_MS', 15000, 1000, 120000)
const maxImageBytes = 10 * 1024 * 1024

const summary: SeedSummary = {
  created: 0,
  skipped: 0,
  failed: 0,
}

const log = (message: string) => {
  console.log(`[seed] ${message}`)
}

const fetchWithTimeout = async (
  url: string,
  timeoutMs: number,
): Promise<{ data: Buffer; mimetype: string }> => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const contentType = response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase()
    if (!contentType?.startsWith('image/')) {
      throw new Error(`unexpected content type ${contentType || 'missing'} (expected image/*)`)
    }
    const contentLength = Number(response.headers.get('content-length'))
    if (Number.isFinite(contentLength) && contentLength > maxImageBytes) {
      throw new Error(`image exceeds ${maxImageBytes} byte limit`)
    }
    if (!response.body) throw new Error('image response has no body')
    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let total = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > maxImageBytes) {
        await reader.cancel()
        throw new Error(`image exceeds ${maxImageBytes} byte limit`)
      }
      chunks.push(value)
    }
    return {
      data: Buffer.concat(
        chunks.map((chunk) => Buffer.from(chunk)),
        total,
      ),
      mimetype: contentType,
    }
  } finally {
    clearTimeout(timeout)
  }
}

const downloadImageWithRetry = async (url: string): Promise<{ data: Buffer; mimetype: string }> => {
  let lastError: unknown

  for (let attempt = 1; attempt <= imageRetries; attempt++) {
    try {
      const data = await fetchWithTimeout(url, imageTimeoutMs)
      return data
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
    const { data: imageBuffer, mimetype } = await downloadImageWithRetry(imageUrl)
    const uploadedMedia = await payload.create({
      collection: 'media',
      overrideAccess: true,
      data: {
        alt: title,
      },
      file: {
        data: imageBuffer,
        mimetype,
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

type Publisher = {
  id: string | number
  email?: string
  tenants?: Array<{ tenant?: string | number | { id: string | number } }>
}

const resolvePublisherAuthors = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<Publisher[]> => {
  const usersResult = await payload.find({
    collection: 'users',
    overrideAccess: true,
    where: {
      role: {
        equals: 'publisher',
      },
    },
    limit: 100,
    depth: 1,
  })

  if (usersResult.docs.length === 0) {
    throw new Error('No publisher user found. Run backend seed first to create publishers.')
  }

  return (usersResult.docs as unknown as Publisher[]).sort((left, right) => {
    const leftKey = (left.email || '').toLowerCase()
    const rightKey = (right.email || '').toLowerCase()
    if (leftKey < rightKey) return -1
    if (leftKey > rightKey) return 1
    const leftID = String(left.id)
    const rightID = String(right.id)
    return leftID < rightID ? -1 : leftID > rightID ? 1 : 0
  })
}

const resolveTenantId = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  author: Publisher,
): Promise<number> => {
  const membership = author.tenants?.find((entry) => entry.tenant)
  const tenant = membership?.tenant
  const id = typeof tenant === 'object' ? tenant?.id : tenant
  if (id !== undefined && id !== null) {
    const tenantId = Number(id)
    if (Number.isSafeInteger(tenantId) && tenantId > 0) return tenantId
  }

  const existing = await payload.find({
    collection: 'tenants',
    overrideAccess: true,
    limit: 1,
  })
  if (existing.docs[0]) return Number(existing.docs[0].id)

  const created = await payload.create({
    collection: 'tenants',
    overrideAccess: true,
    data: {
      name: 'Default Space',
      slug: 'default-space',
      domain: 'default.localhost',
      createdBy: Number(author.id),
    },
  })

  const tenantId = Number(created.id)
  if (!Number.isSafeInteger(tenantId) || tenantId <= 0) {
    throw new Error('Created tenant has an invalid ID')
  }
  return tenantId
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

const createPostIfMissing = async (
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
  if (existingDoc) {
    summary.skipped++
    log(`post already exists for ${post.slug}; treating as skipped`)
    return
  }

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
      if (/unique|duplicate|invalid:\s*slug|field is invalid:\s*slug/i.test(message)) {
        summary.skipped++
        log(`slug collision for ${post.slug}; treating as skipped`)
        return
      }

      throw error
    }
  }
}

const seed = async () => {
  if (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET === 'your-secret-key-here') {
    throw new Error('PAYLOAD_SECRET is required')
  }
  if (!process.env.DATABASE_URI && !process.env.PAYLOAD_DATABASE_URI) {
    throw new Error('DATABASE_URI or PAYLOAD_DATABASE_URI is required')
  }
  if (seedMode !== 'create-missing') {
    throw new Error(`invalid SEED_MODE: ${seedMode}`)
  }

  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    throw new Error('refusing to seed NODE_ENV=production without ALLOW_PRODUCTION_SEED=true')
  }
  const configModule = await import('./payload.config.js')
  const payload = await getPayload({ config: configModule.default })

  log(`mode=${seedMode}, skipImages=${skipImages}`)

  try {
    const publisherAuthors = await resolvePublisherAuthors(payload)

    for (let index = 0; index < seededPosts.length; index++) {
      const { [index]: post } = seededPosts
      const author = publisherAuthors[index % publisherAuthors.length]
      const authorId = Number(author.id)
      const tenantId = await resolveTenantId(payload, author)
      try {
        await createPostIfMissing(payload, post, authorId, tenantId)
      } catch (error) {
        summary.failed++
        log(`failed ${post.slug}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    log(`summary created=${summary.created} skipped=${summary.skipped} failed=${summary.failed}`)
    if (summary.failed > 0) process.exitCode = 1
  } catch (error) {
    console.error(`[seed] failed: ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  } finally {
    // Payload's database adapter owns the connection; close it when supported.
    const { destroy } = payload as { destroy?: () => Promise<void> }
    if (destroy) await destroy.call(payload)
  }
}

seed().catch((error) => {
  console.error(`[seed] failed: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
