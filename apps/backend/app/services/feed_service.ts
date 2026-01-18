import UserFollow from '#models/user_follow';
import env from '#start/env';

/**
 * Feed Service
 *
 * Manages personalized feeds based on user's followed spaces
 */
export default class FeedService {
  /**
   * Helper to fetch items from Payload via HTTP
   */
  private static async fetchPayloadItems(
    collection: string,
    options: {
      where?: Record<string, any>;
      limit?: number;
      page?: number;
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
    if (options.page) {
      queryParams.append('page', options.page.toString());
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
   * Get user's followed spaces
   */
  static async getFollowedSpaces(userId: number): Promise<string[]> {
    const follows = await UserFollow.query().where('user_id', userId).select('space_id');

    return follows.map((follow) => follow.spaceId);
  }

  /**
   * Get personalized feed content from followed spaces
   * Returns unified format: { content: Array<{type, content}>, count, totalDocs }
   */
  static async getPersonalizedFeed(
    userId: number,
    options: {
      limit?: number;
      page?: number;
      sortBy?: 'chronological' | 'engagement';
    } = {}
  ): Promise<{
    content: Array<{ type: 'post' | 'video'; content: any }>;
    count: number;
    totalDocs: number;
  }> {
    const { limit = 20, page = 1, sortBy = 'chronological' } = options;

    // Get user's followed spaces
    const followedSpaces = await this.getFollowedSpaces(userId);

    if (followedSpaces.length === 0) {
      return {
        content: [],
        count: 0,
        totalDocs: 0,
      };
    }

    // Build where clause for tenant filtering
    const tenantFilter = {
      tenant: {
        in: followedSpaces,
      },
    };

    // Fetch posts and videos from followed spaces
    const [postsResult, videosResult] = await Promise.all([
      this.fetchPayloadItems('posts', {
        where: {
          and: [
            {
              status: {
                equals: 'published',
              },
            },
            tenantFilter,
          ],
        },
        limit,
        page,
        sort: sortBy === 'chronological' ? '-publishedAt' : '-createdAt',
        depth: 2,
      }),
      this.fetchPayloadItems('videos', {
        where: {
          and: [
            {
              status: {
                equals: 'published',
              },
            },
            tenantFilter,
          ],
        },
        limit,
        page,
        sort: sortBy === 'chronological' ? '-publishedAt' : '-createdAt',
        depth: 2,
      }),
    ]);

    // Merge and sort by published date if chronological
    const allContent: Array<{ type: 'post' | 'video'; content: any; publishedAt: string | null }> =
      [
        ...postsResult.docs.map((post) => ({
          type: 'post' as const,
          content: post,
          publishedAt: post.publishedAt || null,
        })),
        ...videosResult.docs.map((video) => ({
          type: 'video' as const,
          content: video,
          publishedAt: video.publishedAt || null,
        })),
      ];

    if (sortBy === 'chronological') {
      allContent.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA; // Most recent first
      });
    }

    // Limit to requested amount
    const limitedContent = allContent.slice(0, limit);

    // Return unified format matching the spec
    return {
      content: limitedContent.map((item) => ({
        type: item.type,
        content: item.content,
      })),
      count: limitedContent.length,
      totalDocs: postsResult.totalDocs + videosResult.totalDocs,
    };
  }

  /**
   * Check if user is following a space
   */
  static async isFollowing(userId: number, spaceId: string): Promise<boolean> {
    const follow = await UserFollow.query()
      .where('user_id', userId)
      .where('space_id', spaceId)
      .first();

    return !!follow;
  }

  /**
   * Follow a space
   */
  static async followSpace(userId: number, spaceId: string): Promise<UserFollow> {
    // Check if already following
    const existing = await UserFollow.query()
      .where('user_id', userId)
      .where('space_id', spaceId)
      .first();

    if (existing) {
      return existing;
    }

    // Create new follow
    return await UserFollow.create({
      userId,
      spaceId,
    });
  }

  /**
   * Unfollow a space
   */
  static async unfollowSpace(userId: number, spaceId: string): Promise<void> {
    await UserFollow.query().where('user_id', userId).where('space_id', spaceId).delete();
  }
}
