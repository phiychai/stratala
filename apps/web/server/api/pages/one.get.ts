import { withoutTrailingSlash, withLeadingSlash } from 'ufo';
import { getItems } from '~~/server/utils/payload-server';

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);

    // Handle live preview
    const { preview: _preview, token: _rawToken, permalink: rawPermalink } = query;

    // Ensure the permalink is formatted correctly
    const permalink = withoutTrailingSlash(withLeadingSlash(String(rawPermalink)));

    try {
      // Find page by permalink
      const pagesResult = await getItems('pages', {
        where: {
          permalink: {
            equals: permalink,
          },
          status: {
            equals: 'published',
          },
        },
        limit: 100, // Fetch more to filter client-side (Payload query might be unreliable)
        depth: 3, // Deep depth to include all block relationships
      });

      if (!pagesResult.docs.length) {
        throw createError({ statusCode: 404, statusMessage: 'Page not found' });
      }

      // Filter client-side to find exact permalink match (Payload query might return wrong results)
      const page = pagesResult.docs.find((p: { permalink?: string }) => p.permalink === permalink);

      if (!page) {
        throw createError({ statusCode: 404, statusMessage: 'Page not found' });
      }

      // Verify the page permalink matches (safety check)
      if (page.permalink !== permalink) {
        console.error(`Permalink mismatch: requested "${permalink}", got "${page.permalink}"`);
        throw createError({ statusCode: 404, statusMessage: 'Page not found' });
      }

      // Fetch posts for block_posts blocks
      if (Array.isArray(page?.blocks)) {
        const postBlockPromises = page.blocks
          .filter((block: { blockType?: string }) => block.blockType === 'posts')
          .map(async (block: { blockType?: string; limit?: number }) => {
            const limit = block.limit ?? 12;

            const postsResult = await getItems('posts', {
              where: {
                status: {
                  equals: 'published',
                },
              },
              sort: '-publishedAt',
              limit,
              depth: 2, // Include relationships (author, categories)
            });

            return { block, posts: postsResult.docs };
          });

        const results = await Promise.all(postBlockPromises);

        results.forEach(({ block, posts }) => {
          // Attach posts to the block
          block.posts = posts;
        });
      }

      return page;
    } catch (error: unknown) {
      // If it's already a createError with statusCode, re-throw it
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error;
      }
      // Check if it's a network/connection error (CMS unavailable)
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (
          errorMessage.includes('fetch') ||
          errorMessage.includes('network') ||
          errorMessage.includes('connection') ||
          errorMessage.includes('econnrefused') ||
          errorMessage.includes('timeout')
        ) {
          throw createError({
            statusCode: 500,
            statusMessage: 'Content Management System is currently unavailable',
          });
        }
      }
      // Otherwise, it's an unexpected error
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch page' });
    }
  },
  {
    // Custom cache key that includes permalink to ensure unique caching per page
    getKey: (event) => {
      const query = getQuery(event);
      const permalink = withoutTrailingSlash(withLeadingSlash(String(query.permalink || '')));
      const preview = query.preview === 'true' ? 'preview' : 'published';
      return `pages-one-${permalink}-${preview}`;
    },
    // Cache for 5 minutes, but allow manual invalidation
    maxAge: 5 * 60,
    swr: true, // Enable stale-while-revalidate
  }
);
