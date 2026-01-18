import type { HttpContext } from '@adonisjs/core/http';

import FeedService from '#services/feed_service';
import { feedQueryValidator } from '#validators/feed_validator';

export default class FeedController {
  /**
   * Get personalized feed content from followed spaces
   * GET /api/feed
   */
  async getPersonalizedFeed({ auth, request, response }: HttpContext) {
    const { user } = auth;
    if (!user) {
      return response.unauthorized({ message: 'Authentication required' });
    }

    try {
      // Parse and validate query parameters
      const rawQuery = request.qs();
      const query = await feedQueryValidator.validate({
        limit: rawQuery.limit ? Number(rawQuery.limit) : undefined,
        page: rawQuery.page ? Number(rawQuery.page) : undefined,
        sortBy: rawQuery.sortBy,
      });

      const feed = await FeedService.getPersonalizedFeed(user.id, {
        limit: query.limit ?? 20,
        page: query.page ?? 1,
        sortBy: query.sortBy ?? 'chronological',
      });

      return response.ok(feed);
    } catch (error) {
      // Handle validation errors
      if (error && typeof error === 'object' && 'messages' in error) {
        return response.badRequest({
          message: 'Invalid query parameters',
          errors: error.messages,
        });
      }

      return response.internalServerError({
        message: 'Failed to fetch personalized feed',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get user's followed spaces
   */
  async getFollowedSpaces({ auth, response }: HttpContext) {
    const { user } = auth;
    if (!user) {
      return response.unauthorized({ message: 'Authentication required' });
    }

    try {
      const spaces = await FeedService.getFollowedSpaces(user.id);
      return response.ok({ spaces });
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to fetch followed spaces',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Check if user is following a space
   */
  async checkFollowStatus({ auth, params, response }: HttpContext) {
    const { user } = auth;
    if (!user) {
      return response.unauthorized({ message: 'Authentication required' });
    }

    const { spaceId } = params;

    try {
      const isFollowing = await FeedService.isFollowing(user.id, spaceId);
      return response.ok({ isFollowing });
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to check follow status',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Follow a space
   */
  async followSpace({ auth, params, response }: HttpContext) {
    const { user } = auth;
    if (!user) {
      return response.unauthorized({ message: 'Authentication required' });
    }

    const { spaceId } = params;

    try {
      const follow = await FeedService.followSpace(user.id, spaceId);
      return response.ok({ success: true, follow });
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to follow space',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Unfollow a space
   */
  async unfollowSpace({ auth, params, response }: HttpContext) {
    const { user } = auth;
    if (!user) {
      return response.unauthorized({ message: 'Authentication required' });
    }

    const { spaceId } = params;

    ary {
      await FeedService.unfollowSpace(user.id, spaceId);
      return response.ok({ success: true });
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to unfollow space',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
