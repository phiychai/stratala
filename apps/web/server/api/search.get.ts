import { getItems } from '~~/server/utils/payload-server';

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const search = query.search as string;

    if (!search || search.length < 3) {
      throw createError({ statusCode: 400, message: 'Query must be at least 3 characters.' });
    }

    try {
      // Payload search uses where filters with contains
      const [pagesResult, postsResult] = await Promise.all([
        getItems('pages', {
          where: {
            or: [
              { title: { contains: search } },
              { permalink: { contains: search } },
            ],
          },
          limit: 50,
        }),

        getItems('posts', {
          where: {
            and: [
              { status: { equals: 'published' } },
              {
                or: [
                  { title: { contains: search } },
                  { description: { contains: search } },
                  { slug: { contains: search } },
                ],
              },
            ],
          },
          limit: 50,
          depth: 2, // Include relationships (author, categories)
        }),
      ]);

      const results = [
        ...pagesResult.docs.map((page: any) => ({
          id: page.id,
          title: page.title,
          type: 'Page',
          link: `/${page.permalink.replace(/^\/+/, '')}`,
          content: '',
        })),

        ...postsResult.docs.map((post: any) => ({
          id: post.id,
          title: post.title,
          description: post.description,
          type: 'Post',
          link: `/blog/${post.slug}`,
          content: post.content || '',
        })),
      ];

      return results;
    } catch {
      throw createError({ statusCode: 500, message: 'Failed to fetch search results.' });
    }
  },
  {
    maxAge: 60, // 1 minute
    getKey: (event) => {
      const query = getQuery(event);
      return `search-${query.search}`;
    },
  }
);
