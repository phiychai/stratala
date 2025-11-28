/**
 * Composable for converting Payload CMS media objects to URLs
 */
export function usePayloadImage() {
  const {
    public: { payloadUrl },
  } = useRuntimeConfig();

  /**
   * Convert Payload media to URL
   * Handles various Payload media formats:
   * - Media object with url property (populated with depth)
   * - Media object with filename property
   * - Media object with just id
   * - Number ID
   */
  function getImageUrl(
    image: number | { id: number; url?: string | null; filename?: string | null } | null | undefined
  ): string | undefined {
    if (!image) return undefined;

    // If it's a Payload Media object with a url property, use it directly (best case - populated with depth)
    if (typeof image === 'object' && 'url' in image && image.url) {
      return image.url;
    }

    // If it's a Media object with a filename but no url, construct the URL
    if (typeof image === 'object' && 'filename' in image && image.filename) {
      const baseUrl = (payloadUrl as string) || 'http://localhost:3002';
      return `${baseUrl}/api/media/file/${image.filename}`;
    }

    // If it's a Media object with just an id, we need to fetch it or use a fallback
    // For now, return undefined - the image should be populated with depth: 2
    if (typeof image === 'object' && 'id' in image) {
      console.warn(
        'Payload image object missing url/filename, ensure depth: 2 is used when fetching posts'
      );
      return undefined;
    }

    // If it's just a number (ID), we can't construct URL without filename
    // This shouldn't happen if depth: 2 is used, but handle gracefully
    if (typeof image === 'number') {
      console.warn('Payload image is just an ID, ensure depth: 2 is used when fetching posts');
      return undefined;
    }

    return undefined;
  }

  return {
    getImageUrl,
  };
}
