import { z } from 'zod';
import { getItems } from '~~/server/utils/payload-server';
interface ContentRecord {
  id?: string | number;
  title?: string;
  slug?: string;
}
interface NamedRecord {
  id?: string | number;
  title?: string;
  slug?: string;
}

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  page: z.coerce.number().min(1).default(1),
  category: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  type: z.enum(['post', 'video', 'all']).default('all'),
});

export default defineCachedEventHandler(async (event) => {
  const query = await getValidatedQuery(event, querySchema.safeParse);

  if (!query.success) {
    throw createError({ statusCode: 400, message: 'Invalid query parameters' });
  }

  const { limit, page, category, tag, search, type } = query.data;

  // Build where clause
  const where: Record<string, unknown> = {
    status: {
      equals: 'published',
    },
  };

  if (category) {
    where.categories = {
      slug: {
        equals: category,
      },
    };
  }

  if (tag) {
    where.tags = {
      slug: {
        equals: tag,
      },
    };
  }

  if (search) {
    where.or = [
      { title: { contains: search } },
      { description: { contains: search } },
      { slug: { contains: search } },
    ];
  }

  try {
    const collections =
      type === 'all' ? ['posts', 'videos'] : [type === 'post' ? 'posts' : 'videos'];
    const allContent: Array<{ type: 'post' | 'video'; content: ContentRecord }> = [];

    for (const collection of collections) {
      const result = await getItems<ContentRecord>(collection, {
        where,
        limit,
        page,
        sort: '-publishedAt',
        depth: 2,
      });

      allContent.push(
        ...result.docs.map((item) => ({
          type: collection === 'posts' ? ('post' as const) : ('video' as const),
          content: item,
        }))
      );
    }

    // Get category and tag counts for filters
    const [categoriesResult, tagsResult] = await Promise.all([
      getItems('categories', {
        limit: 1000,
        sort: 'title',
      }),
      getItems('tags', {
        limit: 1000,
        sort: 'title',
      }),
    ]);

    return {
      content: allContent,
      count: allContent.length,
      categories: categoriesResult.docs.map((cat: NamedRecord) => ({
        id: String(cat.id),
        name: cat.title,
        slug: cat.slug,
      })),
      tags: tagsResult.docs.map((tag: NamedRecord) => ({
        id: String(tag.id),
        name: tag.title,
        slug: tag.slug,
      })),
    };
  } catch (error: unknown) {
    console.error('Error fetching explore content:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch explore content',
      data: {
        error: errorMessage,
      },
    });
  }
});
