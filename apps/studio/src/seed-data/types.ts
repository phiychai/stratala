export type SeedMode = 'create-missing' | 'refresh' | 'reset-seeded'

export interface SeedMediaRef {
  key: string
  url: string
  alt: string
}

export interface SeedContentSpec {
  intro: string
  body: string[]
  listType: 'bullet' | 'number'
  listItems: string[]
  quote: {
    text: string
    by?: string
  }
  code?: {
    language: string
    snippet: string
  }
  inlineImageKey?: string
}

export interface SeedPost {
  title: string
  slug: string
  description: string
  content: Record<string, unknown>
  status: 'draft' | 'in_review' | 'published'
  type: 'article' | 'audio' | 'video'
  imageUrl?: string
  featuredImageKey?: string
  publishedAt: string
}

export interface SeedSummary {
  created: number
  updated: number
  skipped: number
  failed: number
}

export interface SeedMediaSummary {
  created: number
  reused: number
  failed: number
  skipped: number
}
