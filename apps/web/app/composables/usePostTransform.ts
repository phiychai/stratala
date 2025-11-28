import type { Post } from '@turborepo-saas-starter/shared-types';
import { usePayloadImage } from './usePayloadImage';

export interface TransformedPost extends Post {
  imageUrl?: string;
  author?: {
    firstName?: string;
    lastName?: string;
    avatar?: {
      src: string;
      alt: string;
    };
  };
}

/**
 * Composable for transforming posts to include image URLs and properly formatted authors
 */
export function usePostTransform() {
  const { getImageUrl } = usePayloadImage();

  /**
   * Transform posts to include image URLs and properly formatted authors
   */
  function transformPosts(posts: Post[]): TransformedPost[] {
    return posts.map((post) => {
      // Handle Payload image format (number ID or Media object)
      const imageUrl = getImageUrl(
        typeof post.image === 'object' && post.image !== null
          ? post.image
          : typeof post.image === 'number'
            ? post.image
            : null
      );

      const author = post.author && typeof post.author === 'object' ? post.author : null;
      // Author avatar might be in a different format, handle accordingly
      const authorAvatarUrl =
        author && 'avatar' in author ? getImageUrl(author.avatar as any) : undefined;

      return {
        ...post,
        // Only include imageUrl if it's a valid string (not undefined or empty)
        ...(imageUrl ? { imageUrl } : {}),
        author: author
          ? {
              ...author,
              avatar: authorAvatarUrl
                ? {
                    src: authorAvatarUrl,
                    alt: `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Author',
                  }
                : undefined,
            }
          : undefined,
      };
    });
  }

  return {
    transformPosts,
  };
}
