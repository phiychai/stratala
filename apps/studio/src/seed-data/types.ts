export type SeedMode = 'create-missing' | 'refresh' | 'reset-seeded'

export interface SeedPost {
  title: string
  slug: string
  description: string
  content: Record<string, unknown>
  status: 'draft' | 'in_review' | 'published'
  type: 'article' | 'audio' | 'video'
  imageUrl?: string
  publishedAt: string
}

export interface SeedSummary {
  created: number
  updated: number
  skipped: number
  failed: number
}
