import type { Post, Video } from '@stratala/shared-types';

/**
 * Unified content type that can be either a post or video
 * Structure matches what's returned from API endpoints
 */
export interface UnifiedContent {
  type: 'post' | 'video';
  content: Post | Video;
  source?: 'trending' | 'editors-pick';
  score?: number;
  featuredOrder?: number;
}

/**
 * Trending content with score
 */
export interface TrendingContent extends UnifiedContent {
  trendingScore: number;
  viewCount: number;
  likeCount: number;
  isEditorsPick: boolean;
}

/**
 * Editor's pick content
 */
export interface EditorPick {
  id: string;
  contentType: 'post' | 'video';
  content: Post | Video;
  featuredOrder: number;
  featuredAt: string;
}
