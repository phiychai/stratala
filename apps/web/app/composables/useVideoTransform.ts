import type { Video } from '@stratala/shared-types';
import { usePayloadImage } from './usePayloadImage';

export interface TransformedVideo extends Video {
  thumbnailUrl?: string;
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
 * Composable for transforming videos to include thumbnail URLs and properly formatted authors
 */
export function useVideoTransform() {
  const { getImageUrl } = usePayloadImage();

  /**
   * Transform videos to include thumbnail URLs and properly formatted authors
   */
  function transformVideos(videos: Video[]): TransformedVideo[] {
    return videos.map((video) => {
      // Handle Payload thumbnail format (number ID or Media object)
      const thumbnailUrl = getImageUrl(
        typeof video.thumbnail === 'object' && video.thumbnail !== null
          ? video.thumbnail
          : typeof video.thumbnail === 'number'
            ? video.thumbnail
            : null
      );

      const author = video.author && typeof video.author === 'object' ? video.author : null;
      // Author avatar might be in a different format, handle accordingly
      const authorAvatarUrl =
        author && 'avatar' in author ? getImageUrl(author.avatar as any) : undefined;

      return {
        ...video,
        // Only include thumbnailUrl if it's a valid string (not undefined or empty)
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
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
    transformVideos,
  };
}

