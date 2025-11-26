import { withoutTrailingSlash, withLeadingSlash } from 'ufo';
import { getItems } from '~~/server/utils/payload-server';

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event);

  // Handle live preview
  const { preview, token: rawToken, permalink: rawPermalink } = query;

  // Ensure the permalink is formatted correctly
  const permalink = withoutTrailingSlash(withLeadingSlash(String(rawPermalink)));

  const token = preview === 'true' && rawToken ? String(rawToken) : null;

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
      limit: 1,
      depth: 3, // Deep depth to include all block relationships
    });

    if (!pagesResult.docs.length) {
      throw createError({ statusCode: 404, statusMessage: 'Page not found' });
    }

    const page = pagesResult.docs[0];

    // Fetch posts for block_posts blocks
    if (Array.isArray(page?.blocks)) {
      const postBlockPromises = page.blocks
        .filter((block: any) => block.blockType === 'posts')
        .map(async (block: any) => {
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
    // Otherwise, it's an unexpected error
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch page' });
  }
});
