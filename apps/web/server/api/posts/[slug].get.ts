import { getItems, getItem } from '~~/server/utils/payload-server';

export default defineCachedEventHandler(
  async (event) => {
    const slug = getRouterParam(event, 'slug');
    const query = getQuery(event);

    if (!slug) {
      throw createError({ statusCode: 400, message: 'Slug is required' });
    }

    // Handle live preview - bypass cache for preview mode
    const { preview } = query;
    const isPreview = preview === 'true' || preview === true;

    try {
      // Payload's slug query seems to have issues, so we'll fetch more posts and filter client-side
      // This ensures we get the correct post even if Payload's query is buggy
      const postsResult = await getItems('posts', {
        where: {
          status: {
            equals: 'published',
          },
        },
        limit: 100, // Fetch more to ensure we find the post
        depth: 2, // Include relationships (author, categories, tenant)
        draft: isPreview ? true : false, // Allow drafts in preview mode
        trash: false, // Exclude trashed items (like Payload admin)
      });

      // Filter client-side to find the exact slug match
      const post = postsResult.docs.find((p: { slug: string }) => p.slug === slug);

      if (!post) {
        throw createError({ statusCode: 404, message: `Post not found: ${slug}` });
      }

      // Verify the post slug matches (safety check)
      if (post.slug !== slug) {
        console.error(`Slug mismatch: requested "${slug}", got "${post.slug}"`);
        throw createError({ statusCode: 404, message: `Post not found: ${slug}` });
      }

      // If tenant is just an ID, fetch the full tenant object
      if (post.tenant && typeof post.tenant === 'number') {
        try {
          const tenant = await getItem('tenants', String(post.tenant), { depth: 0 });
          if (tenant) {
            post.tenant = tenant;
          }
        } catch (error) {
          // If tenant fetch fails, keep the ID (don't break the request)
          console.warn(`Failed to fetch tenant ${post.tenant}:`, error);
        }
      }

      // Get related posts (exclude current post)
      const relatedPostsResult = await getItems('posts', {
        where: {
          and: [
            {
              slug: {
                not_equals: slug,
              },
            },
            {
              status: {
                equals: 'published',
              },
            },
          ],
        },
        limit: 2,
        sort: '-publishedAt',
        depth: 2, // Include relationships (author, categories)
      });

      return {
        post,
        relatedPosts: relatedPostsResult.docs,
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error;
      }
      throw createError({
        statusCode: 500,
        message: `Failed to fetch post: ${slug}`,
        data: error,
      });
    }
  },
  {
    // Reduce cache time for faster updates during development/editing
    maxAge: process.env.NODE_ENV === 'development' ? 10 : 30, // 10 seconds in dev, 30 seconds in prod
    getKey: (event) => {
      const slug = getRouterParam(event, 'slug');
      const query = getQuery(event);
      const { preview, _t } = query; // _t is a cache-busting timestamp

      // Include preview mode in cache key to separate cached/non-cached versions
      const previewKey = preview === 'true' || preview === true ? '-preview' : '';

      // If _t (timestamp) is provided, use it for cache busting
      const cacheBuster = _t ? `-${_t}` : '';

      // Use slug + preview + cache buster
      // Note: We can't include updatedAt here since getKey must be synchronous
      // Instead, we'll rely on shorter cache times and client-side cache invalidation
      return `post-${slug}${previewKey}${cacheBuster}`;
    },
    // Use swr (stale-while-revalidate) for better UX
    swr: true,
  }
);
