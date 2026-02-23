import type { HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import ContentView from '#models/content_view';
import ContentLike from '#models/content_like';

export default class EngagementController {
  /**
   * Track a content view
   */
  async trackView({ auth, params, request, response }: HttpContext) {
    const { contentType, contentId } = params;

    if (!contentType || !contentId) {
      return response.badRequest({ message: 'Content type and ID are required' });
    }

    if (contentType !== 'post' && contentType !== 'video') {
      return response.badRequest({ message: 'Content type must be "post" or "video"' });
    }

    const user = auth.user;
    const ipAddress = request.ip();

    try {
      await ContentView.create({
        contentType: contentType as 'post' | 'video',
        contentId,
        userId: user?.id || null,
        ipAddress: ipAddress || null,
        viewedAt: DateTime.now(),
      });

      return response.ok({ success: true });
    } catch (error) {
      // Don't fail the request if view tracking fails
      console.error('Error tracking view:', error);
      return response.ok({ success: false });
    }
  }

  /**
   * Like content
   */
  async likeContent({ auth, params, response }: HttpContext) {
    const user = auth.user;
    if (!user) {
      return response.unauthorized({ message: 'Authentication required' });
    }

    const { contentType, contentId } = params;

    if (!contentType || !contentId) {
      return response.badRequest({ message: 'Content type and ID are required' });
    }

    if (contentType !== 'post' && contentType !== 'video') {
      return response.badRequest({ message: 'Content type must be "post" or "video"' });
    }

    try {
      // Check if already liked
      const existing = await ContentLike.query()
        .where('content_type', contentType)
        .where('content_id', contentId)
        .where('user_id', user.id)
        .first();

      if (existing) {
        return response.ok({ success: true, liked: true });
      }

      // Create like record
      await ContentLike.create({
        contentType: contentType as 'post' | 'video',
        contentId,
        userId: user.id,
      });

      return response.ok({ success: true, liked: true });
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to like content',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Unlike content
   */
  async unlikeContent({ auth, params, response }: HttpContext) {
    const user = auth.user;
    if (!user) {
      return response.unauthorized({ message: 'Authentication required' });
    }

    const { contentType, contentId } = params;

    if (!contentType || !contentId) {
      return response.badRequest({ message: 'Content type and ID are required' });
    }

    if (contentType !== 'post' && contentType !== 'video') {
      return response.badRequest({ message: 'Content type must be "post" or "video"' });
    }

    try {
      await ContentLike.query()
        .where('content_type', contentType)
        .where('content_id', contentId)
        .where('user_id', user.id)
        .delete();

      return response.ok({ success: true, liked: false });
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to unlike content',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get like status and count
   */
  async getLikeStatus({ auth, params, response }: HttpContext) {
    const { contentType, contentId } = params;

    if (!contentType || !contentId) {
      return response.badRequest({ message: 'Content type and ID are required' });
    }

    if (contentType !== 'post' && contentType !== 'video') {
      return response.badRequest({ message: 'Content type must be "post" or "video"' });
    }

    const user = auth.user;

    try {
      // Get like count
      const likeCount = await ContentLike.query()
        .where('content_type', contentType)
        .where('content_id', contentId)
        .count('* as total')
        .first();

      const count = Number(likeCount?.$extras.total || 0);

      // Check if current user has liked (if authenticated)
      let isLiked = false;
      if (user) {
        const userLike = await ContentLike.query()
          .where('content_type', contentType)
          .where('content_id', contentId)
          .where('user_id', user.id)
          .first();
        isLiked = !!userLike;
      }

      return response.ok({
        count,
        isLiked,
      });
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to get like status',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
