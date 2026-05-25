/**
 * Sitemap source for dynamic pages and posts from Payload
 * Used by @nuxtjs/seo sitemap module
 */
import { getItems } from '../utils/payload-server';
type PageDoc = {
  permalink?: string;
  updatedAt?: string;
  createdAt?: string;
};
type TenantDoc = {
  slug?: string;
};
type AuthorDoc = {
  email?: string;
};
type PostDoc = {
  slug?: string;
  updatedAt?: string;
  createdAt?: string;
  tenant?: number | TenantDoc | null;
  author?: number | AuthorDoc | null;
};

export default defineEventHandler(async () => {
  try {
    const [pagesResult, postsResult] = await Promise.all([
      getItems('pages', {
        where: {
          status: {
            equals: 'published',
          },
        },
        limit: 1000,
      }),

      // Get posts with space and author info
      getItems('posts', {
        where: {
          status: {
            equals: 'published',
          },
        },
        limit: 1000,
        depth: 2, // Include author and space relationships
      }),
    ]);

    const pages = pagesResult.docs;
    const posts = postsResult.docs;

    const pageUrls = (pages as PageDoc[]).map((page) => ({
      loc: page.permalink,
      lastmod: page.updatedAt || page.createdAt,
    }));

    // Legacy blog URLs (for backward compatibility)
    const legacyPostUrls = posts
      .filter((post: PostDoc) => !post.tenant) // Posts without spaces (plugin uses "tenant" field name)
      .map((post: PostDoc) => ({
        loc: `/blog/${post.slug}`,
        lastmod: post.updatedAt || post.createdAt,
      }));

    // New space-based URLs
    // TODO: Resolve username from author/owner - for now using email prefix as placeholder
    const spacePostUrls: Array<{ loc: string; lastmod: string | null }> = [];

    for (const post of posts as PostDoc[]) {
      if (!post.tenant || !post.author) continue; // Plugin uses "tenant" field name

      const space = typeof post.tenant === 'object' ? post.tenant : null;
      const author = typeof post.author === 'object' ? post.author : null;

      if (!space || !author) continue;

      // TODO: Get username from author - for now using email prefix
      // This needs proper username resolution implementation
      const authorEmail = author.email;
      const username = authorEmail?.split('@')[0] || 'user';

      // Space post: /@username/space-slug/slug
      spacePostUrls.push({
        loc: `/@${username}/${space.slug}/${post.slug}`,
        lastmod: post.updatedAt || post.createdAt || null,
      });
    }

    // Profile URLs (generated from posts to avoid duplicate spaces query)
    const profileUrls: Array<{ loc: string; lastmod: string | null }> = [];
    const processedUsernames = new Set<string>();

    for (const post of posts as PostDoc[]) {
      if (!post.author) continue;

      const author = typeof post.author === 'object' ? post.author : null;
      if (!author) continue;

      // TODO: Get username from author - for now using email prefix
      const authorEmail = author.email;
      const username = authorEmail?.split('@')[0] || 'user';

      // Add profile URL once per user
      if (!processedUsernames.has(username)) {
        profileUrls.push({
          loc: `/@${username}`,
          lastmod: null, // Profile pages don't have a specific lastmod
        });
        processedUsernames.add(username);
      }
    }

    return [...pageUrls, ...legacyPostUrls, ...spacePostUrls, ...profileUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [];
  }
});
