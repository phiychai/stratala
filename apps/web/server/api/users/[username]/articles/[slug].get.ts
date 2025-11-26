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

    // Find user's default "articles" space
    const spacesResult = await getItems('spaces', {
      where: {
        owner: {
          equals: ownerId,
        },
        isDefault: {
          equals: true,
        },
      },
      limit: 1,
    });

    if (!spacesResult.docs.length) {
      throw createError({ statusCode: 404, message: 'Default articles space not found' });
    }

    const articlesSpaceId = spacesResult.docs[0].id;

    // Find post in the articles space
    const postsResult = await getItems('posts', {
      where: {
        slug: {
          equals: slug,
        },
        space: {
          equals: articlesSpaceId,
        },
      },
      limit: 1,
      depth: 2, // Include relationships (author, space, categories)
    });

    if (!postsResult.docs.length) {
      throw createError({ statusCode: 404, message: 'Article not found' });
    }

    const post = postsResult.docs[0];

    // Related posts in the same space
    const relatedPostsResult = await getItems('posts', {
      where: {
        slug: {
          not_equals: slug,
        },
        space: {
          equals: articlesSpaceId,
        },
        status: {
          equals: 'published',
        },
      },
      limit: 2,
      sort: '-publishedAt',
      depth: 2, // Include relationships (author, categories)
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
