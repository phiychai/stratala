import { z } from 'zod';
import { getItems } from '~~/server/utils/payload-server';

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(12),
  page: z.coerce.number().min(1).default(1),
  category: z.string().optional(),
});

export default defineCachedEventHandler(async (event) => {
  const query = await getValidatedQuery(event, querySchema.safeParse);

  if (!query.success) {
    throw createError({ statusCode: 400, message: 'Invalid query parameters' });
  }

  const { limit, page, category } = query.data;

  // Build Payload where filter
  const where: Record<string, unknown> = {
    status: {
      equals: 'published',
    },
  };

  if (category) {
    // Filter by category slug (categories is a relationship field in Payload)
    where.categories = {
      slug: {
        equals: category,
      },
    };
  }

  try {
    const result = await getItems('posts', {
      where,
      limit,
      page,
      sort: '-publishedAt',
      depth: 2, // Include relationships (author, categories)
    });

    return {
      posts: result.docs,
      count: result.totalDocs,
    };
  } catch (error: unknown) {
    console.error('Error fetching posts:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch paginated posts',
      data: {
        error: errorMessage,
      },
    });
  }
});
