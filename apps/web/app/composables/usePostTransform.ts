import type { Post } from '@stratala/shared-types';
import { usePayloadImage } from './usePayloadImage';

export type TransformedPost = Omit<Post, 'author' | 'image'> & {
  imageUrl?: string;
  author?: Post['author'];
};

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

      // Author is already properly typed as User from Post type
      const author = post.author && typeof post.author === 'object' ? post.author : null;

      return {
        ...post,
        // Only include imageUrl if it's a valid string
        ...(imageUrl ? { imageUrl } : {}),
        author: author || undefined,
      };
    });
  }

  return {
    transformPosts,
  };
}
