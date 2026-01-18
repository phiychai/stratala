import ContentLike from '#models/content_like';
import ContentView from '#models/content_view';
import env from '#start/env';

export interface TrendingContent {
  id: string;
  type: 'post' | 'video';
  content: any;
  trendingScore: number;
  viewCount: number;
  likeCount: number;
  isEditorsPick: boolean;
}

/**
 * Trending Service
 *
 * Calculates trending scores for content using a hybrid algorithm:
 * - View count (40% weight)
 * - Like count (60% weight)
 * - Recency boost (time-based)
 * - Manual boost (editor's picks)
 */
export default class TrendingService {
  /**
   * Calculate trending score for content
   */
  static async calculateTrendingScore(
    content: any,
    viewCount: number,
    likeCount: number,
    publishedAt: string | null,
    isEditorsPick: boolean = false
  ): Promise<number> {
    // Base score from engagement
    const engagementScore = viewCount * 0.4 + likeCount * 0.6;

    // Recency boost
    let recencyBoost = 0;
    if (publishedAt) {
      const publishedDate = new Date(publishedAt);
      const hoursSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);

      if (hoursSincePublished < 24) {
        recencyBoost = 10;
      } else if (hoursSincePublished < 168) {
        // 7 days
        recencyBoost = 5;
      }
    }

    // Manual boost for editor's picks
    const manualBoost = isEditorsPick ? 20 : 0;

    return engagementScore + recencyBoost + manualBoost;
  }

  /**
   * Helper to fetch items from Payload via HTTP
   */
  private static async fetchPayloadItems(
    collection: string,
    options: {
      where?: Record<string, any>;
      limit?: number;
      sort?: string;
      depth?: number;
    } = {}
  ): Promise<{ docs: any[]; totalDocs: number }> {
    const baseUrl = env.get('PAYLOAD_PUBLIC_SERVER_URL', 'http://localhost:3002');
    const queryParams = new URLSearchParams();

    if (options.where) {
      queryParams.append('where', JSON.stringify(options.where));
    }
    if (options.limit) {
      queryParams.append('limit', options.limit.toString());
    }
    if (options.sort) {
      queryParams.append('sort', options.sort);
    }
    if (options.depth) {
      queryParams.append('depth', options.depth.toString());
    }
    queryParams.append('draft', 'false');
    queryParams.append('trash', 'false');

    const url = `${baseUrl}/api/${collection}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${collection}: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Get trending content
   */
  static async getTrendingContent(
    type: 'post' | 'video' | 'all' = 'all',
    limit: number = 20
  ): Promise<TrendingContent[]> {
    const collections =
      type === 'all' ? ['posts', 'videos'] : [type === 'post' ? 'posts' : 'videos'];

    const allContent: TrendingContent[] = [];

    // Fetch ALL editors-picks ONCE before processing content
    // Since it's a collection, we can fetch all at once and filter in memory
    let allEditorsPicks: any[] = [];
    try {
      const editorsPicksResult = await this.fetchPayloadItems('editors-picks', {
        where: {},
        limit: 1000,
        depth: 1,
      });
      allEditorsPicks = editorsPicksResult.docs;
    } catch (error) {
      // If editor's picks check fails, continue without it
      console.warn('Failed to fetch editor picks:', error);
    }

    // Create a Set of editor's pick content IDs for fast lookup
    const editorsPickIds = new Set<string>();
    for (const pick of allEditorsPicks) {
      const pickContentId =
        pick.contentType === 'post'
          ? typeof pick.post === 'object'
            ? pick.post?.id
            : pick.post
          : typeof pick.video === 'object'
            ? pick.video?.id
            : pick.video;
      if (pickContentId) {
        editorsPickIds.add(String(pickContentId));
      }
    }

    for (const collection of collections) {
      // Fetch published content
      const result = await this.fetchPayloadItems(collection, {
        where: {
          status: {
            equals: 'published',
          },
        },
        limit: 100, // Get more to calculate scores
        sort: '-publishedAt',
        depth: 2,
      });

      // Get engagement metrics for each content item
      for (const item of result.docs) {
        const contentId = String(item.id);
        const contentType = collection === 'posts' ? 'post' : 'video';

        // Get view count
        const viewCount = await ContentView.query()
          .where('content_type', contentType)
          .where('content_id', contentId)
          .count('* as total')
          .first();

        // Get like count
        const likeCount = await ContentLike.query()
          .where('content_type', contentType)
          .where('content_id', contentId)
          .count('* as total')
          .first();

        const views = Number(viewCount?.$extras.total || 0);
        const likes = Number(likeCount?.$extras.total || 0);

        // Check if it's an editor's pick using the cached Set (O(1) lookup)
        const isEditorsPick = editorsPickIds.has(contentId);

        // Calculate trending score
        const trendingScore = await this.calculateTrendingScore(
          item,
          views,
          likes,
          item.publishedAt || null,
          isEditorsPick
        );

        allContent.push({
          id: contentId,
          type: contentType,
          content: item,
          trendingScore,
          viewCount: views,
          likeCount: likes,
          isEditorsPick,
        });
      }
    }

    // Sort by trending score and return top results
    return allContent.sort((a, b) => b.trendingScore - a.trendingScore).slice(0, limit);
  }

  /**
   * Get view count for content
   */
  static async getViewCount(contentType: 'post' | 'video', contentId: string): Promise<number> {
    const result = await ContentView.query()
      .where('content_type', contentType)
      .where('content_id', contentId)
      .count('* as total')
      .first();

    return Number(result?.$extras.total || 0);
  }

  /**
   * Get like count for content
   */
  static async getLikeCount(contentType: 'post' | 'video', contentId: string): Promise<number> {
    const result = await ContentLike.query()
      .where('content_type', contentType)
      .where('content_id', contentId)
      .count('* as total')
      .first();

    return Number(result?.$extras.total || 0);
  }
}
