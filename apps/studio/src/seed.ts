import crypto from 'node:crypto'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import { getPayload } from 'payload'

import { buildLexicalContent } from './seed-data/content-builders'
import { seedMediaLibrary, seededPosts, seededPostSlugs } from './seed-data/posts'
import type { SeedMediaSummary, SeedMode, SeedPost, SeedSummary } from './seed-data/types'

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

const summary: SeedSummary = { created: 0, updated: 0, skipped: 0, failed: 0 }
const mediaSummary: SeedMediaSummary = { created: 0, reused: 0, failed: 0, skipped: 0 }
const statusFallbackMap: Record<string, 'draft' | 'published'> = {
  in_review: 'draft',
}

const log = (message: string) => console.log(`[seed] ${message}`)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const toNumericId = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value)
  return null
}

const fetchWithTimeout = async (url: string, timeoutMs: number): Promise<ArrayBuffer> => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
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
      if (attempt < imageRetries) await delay(300 * attempt)
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

const getMediaFilename = (seedKey: string, url: string) => {
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 12)
  const extension = extname(new URL(url).pathname) || '.jpg'
  return `seed-${seedKey}-${hash}${extension}`
}

const mediaCache = new Map<string, number | null>()

const getOrCreateMediaId = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  seedKey?: string,
): Promise<number | null> => {
  if (!seedKey || skipImages) {
    mediaSummary.skipped++
    return null
  }

  if (mediaCache.has(seedKey)) {
    return mediaCache.get(seedKey) ?? null
  }

  const mediaDef = seedMediaLibrary.find((entry) => entry.key === seedKey)
  if (!mediaDef) {
    mediaSummary.failed++
    log(`media key not found: ${seedKey}`)
    mediaCache.set(seedKey, null)
    return null
  }

  const filename = getMediaFilename(seedKey, mediaDef.url)

  const existing = await payload.find({
    collection: 'media',
    overrideAccess: true,
    where: { filename: { equals: filename } },
    limit: 1,
  })

  if (existing.docs[0]) {
    const existingId = toNumericId(existing.docs[0].id)
    if (existingId !== null) {
      mediaSummary.reused++
      mediaCache.set(seedKey, existingId)
      return existingId
    }
  }

  try {
    const imageBuffer = await downloadImageWithRetry(mediaDef.url)
    const uploaded = await payload.create({
      collection: 'media',
      overrideAccess: true,
      data: { alt: mediaDef.alt },
      file: {
        data: imageBuffer,
        mimetype: 'image/jpeg',
        name: filename,
        size: imageBuffer.length,
      },
    })

    const uploadedId = toNumericId(uploaded.id)
    if (uploadedId === null) {
      throw new Error(`Uploaded media returned non-numeric id for key ${seedKey}`)
    }

    mediaSummary.created++
    mediaCache.set(seedKey, uploadedId)
    return uploadedId
  } catch (error) {
    mediaSummary.failed++
    log(`media upload failed for ${seedKey}: ${error instanceof Error ? error.message : String(error)}`)
    mediaCache.set(seedKey, null)
    return null
  }
}

const ensureMediaExists = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  mediaId: number | null,
): Promise<number | null> => {
  if (mediaId === null) return null

  const existing = await payload
    .findByID({
      collection: 'media',
      id: mediaId,
      overrideAccess: true,
    })
    .catch(() => null)

  if (!existing) {
    log(`media id ${mediaId} no longer exists; omitting relation`)
    return null
  }

  return mediaId
}

const resolvePublisherAuthorIds = async (payload: Awaited<ReturnType<typeof getPayload>>): Promise<number[]> => {
  const users = await payload.find({
    collection: 'users',
    overrideAccess: true,
    where: { role: { equals: 'publisher' } },
    limit: 100,
  })

  const publisherIds = users.docs
    .map((user) => toNumericId(user.id))
    .filter((id): id is number => id !== null)

  if (publisherIds.length === 0) {
    throw new Error('No publisher user found. Run backend seed first to create publishers.')
  }

  return publisherIds
}

const resolveTenantId = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  authorId: number,
): Promise<number> => {
  const tenants = await payload.find({
    collection: 'tenants',
    overrideAccess: true,
    limit: 1,
  })

  if (tenants.docs[0]) {
    const existingTenantId = toNumericId(tenants.docs[0].id)
    if (existingTenantId !== null) return existingTenantId
  }

  const createdTenant = await payload.create({
    collection: 'tenants',
    overrideAccess: true,
    data: {
      name: 'Default Space',
      slug: 'default-space',
      domain: 'default.localhost',
      createdBy: authorId,
    },
  })

  const createdTenantId = toNumericId(createdTenant.id)
  if (createdTenantId === null) {
    throw new Error('Default tenant created with non-numeric id')
  }

  return createdTenantId
}

const createPostWithTenantFallback = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  data: Record<string, unknown>,
) => {
  try {
    return await payload.create({
      collection: 'posts',
      overrideAccess: true,
      data,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const isTenantShapeError = /(tenant|tenants).*(invalid|required|expected|relationship)/i.test(message)

    if (!isTenantShapeError || typeof data.tenant !== 'number') {
      throw error
    }

    const withTenants = {
      ...data,
      tenants: [{ tenant: data.tenant }],
    }

    return await payload.create({
      collection: 'posts',
      overrideAccess: true,
      data: withTenants,
    })
  }
}

const updatePostWithTenantFallback = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  id: number,
  data: Record<string, unknown>,
) => {
  try {
    return await payload.update({
      collection: 'posts',
      overrideAccess: true,
      id,
      data,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const isTenantShapeError = /(tenant|tenants).*(invalid|required|expected|relationship)/i.test(message)

    if (!isTenantShapeError || typeof data.tenant !== 'number') {
      throw error
    }

    const withTenants = {
      ...data,
      tenants: [{ tenant: data.tenant }],
    }

    return await payload.update({
      collection: 'posts',
      overrideAccess: true,
      id,
      data: withTenants,
    })
  }
}

const buildPostData = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  post: SeedPost,
  authorId: number,
  tenantId: number,
) => {
  const featuredImageId = await ensureMediaExists(payload, await getOrCreateMediaId(payload, post.featuredImageKey))
  const inlineImageId = post.content.inlineImageKey
    ? await ensureMediaExists(payload, await getOrCreateMediaId(payload, post.content.inlineImageKey))
    : null

  const data: Record<string, unknown> = {
    title: post.title,
    slug: post.slug,
    description: post.description,
    content: buildLexicalContent(post.content, inlineImageId),
    status: statusFallbackMap[post.status] ?? post.status,
    type: post.type,
    publishedAt: post.publishedAt,
    author: authorId,
    tenant: tenantId,
  }

  if (featuredImageId !== null) {
    data.image = featuredImageId
  }

  if (statusFallbackMap[post.status]) {
    log(`status fallback for ${post.slug}: ${post.status} -> ${statusFallbackMap[post.status]}`)
  }

  return data
}

const createOrUpdatePost = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  post: SeedPost,
  authorId: number,
  tenantId: number,
) => {
  const existing = await payload.find({
    collection: 'posts',
    overrideAccess: true,
    where: { slug: { equals: post.slug } },
    limit: 1,
  })

  const existingDoc = existing.docs[0]

  if (seedMode === 'create-missing' && existingDoc) {
    summary.skipped++
    return
  }

  const postData = await buildPostData(payload, post, authorId, tenantId)

  if (!existingDoc) {
    await createPostWithTenantFallback(payload, postData)
    summary.created++
    return
  }

  const existingId = toNumericId(existingDoc.id)
  if (existingId === null) {
    throw new Error(`existing post id is invalid for slug ${post.slug}`)
  }

  await updatePostWithTenantFallback(payload, existingId, postData)
  summary.updated++
}

const removeSeededPosts = async (payload: Awaited<ReturnType<typeof getPayload>>) => {
  for (const slug of seededPostSlugs) {
    const existing = await payload.find({
      collection: 'posts',
      overrideAccess: true,
      where: { slug: { equals: slug } },
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

  log(`mode=${seedMode} skipImages=${skipImages} posts=${seededPosts.length}`)

  try {
    const publisherIds = await resolvePublisherAuthorIds(payload)
    const tenantId = await resolveTenantId(payload, publisherIds[0])

    if (seedMode === 'reset-seeded') {
      await removeSeededPosts(payload)
      log(`reset removed posts for ${seededPostSlugs.length} known seed slugs`)
    }

    for (let index = 0; index < seededPosts.length; index++) {
      const post = seededPosts[index]
      const authorId = publisherIds[index % publisherIds.length]

      try {
        await createOrUpdatePost(payload, post, authorId, tenantId)
      } catch (error) {
        summary.failed++
        const message = error instanceof Error ? error.message : String(error)
        const cause =
          error && typeof error === 'object' && 'cause' in error
            ? String((error as { cause?: unknown }).cause)
            : null

        log(`failed ${post.slug}: ${message}`)
        if (cause && cause !== 'undefined') {
          log(`failed ${post.slug} cause: ${cause}`)
        }
      }

      await delay(500)
    }

    log(`summary posts created=${summary.created} updated=${summary.updated} skipped=${summary.skipped} failed=${summary.failed}`)
    log(`summary media created=${mediaSummary.created} reused=${mediaSummary.reused} failed=${mediaSummary.failed} skipped=${mediaSummary.skipped}`)

    process.exit(summary.failed > 0 ? 1 : 0)
  } catch (error) {
    console.error(`[seed] failed: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }
}

seed()
