import type { HttpContext } from '@adonisjs/core/http';
import TrendingService from '#services/trending_service';

export default class TrendingController {
  /**
   * Get trending content
   */
  async getTrending({ request, response }: HttpContext) {
    const type = (request.qs().type as 'post' | 'video' | 'all') || 'all';
    const limit = Number(request.qs().limit) || 20;

    try {
      const trending = await TrendingService.getTrendingContent(type, limit);
      return response.ok({ content: trending });
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to fetch trending content',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
