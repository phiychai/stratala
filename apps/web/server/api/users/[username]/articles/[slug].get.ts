import { getItems } from '~~/server/utils/payload-server';
import { resolveUsernameToPayloadUserId } from '~~/server/utils/resolve-username';

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username');
  const slug = getRouterParam(event, 'slug');

  if (!username || !slug) {
    throw createError({ statusCode: 400, message: 'Username and slug are required' });
  }

  // Handle live preview
  const query = getQuery(event);
  const { preview, token: rawToken } = query;
  const token = preview === 'true' && rawToken ? String(rawToken) : undefined;

  try {
    // Resolve username to Payload user ID
    const ownerId = await resolveUsernameToPayloadUserId(username);

    if (!ownerId) {
      throw createError({ statusCode: 404, message: 'User not found' });
    }

    // Find post by slug and author
    const postsResult = await getItems('posts', {
      where: {
        slug: {
          equals: slug,
        },
        author: {
          equals: ownerId,
        },
      },
      limit: 1,
      depth: 2, // Include relationships (author, space, categories)
    });

    if (!postsResult.docs.length) {
      throw createError({ statusCode: 404, message: 'Article not found' });
    }

    const post = postsResult.docs[0];

    // Related posts by the same author
    const relatedPostsResult = await getItems('posts', {
      where: {
        slug: {
          not_equals: slug,
        },
        author: {
          equals: ownerId,
        },
        status: {
          equals: 'published',
        },
      },
      limit: 2,
      sort: '-publishedAt',
      depth: 2, // Include relationships (author, space, categories)
    });

    return {
      post,
      relatedPosts: relatedPostsResult.docs,
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch article',
      data: error,
    });
  }
});
