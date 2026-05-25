import { useRuntimeConfig } from '#imports';

/**
 * Get Payload media URL
 * Payload serves media at /api/media/file/{filename} or can use ID
 */
export function getPayloadMediaURL(
  fileIdOrFilename: string | number | null | undefined,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
  }
): string {
  if (!fileIdOrFilename) {
    return '';
  }

  const {
    public: { payloadUrl },
  } = useRuntimeConfig();

  const baseUrl = (payloadUrl as string) || 'http://localhost:3002';

  // Convert to string if it's a number
  const idOrFilename = String(fileIdOrFilename);

  // Payload media URL format: /api/media/file/{filename}
  // If it's already a full URL, return it
  if (idOrFilename.startsWith('http://') || idOrFilename.startsWith('https://')) {
    return idOrFilename;
  }

  // If it looks like a filename (has extension), use /api/media/file/{filename}
  // Otherwise, use /api/media/{id}
  const hasExtension = /\.(?:jpg|jpeg|png|gif|webp|svg)$/i.test(idOrFilename);
  const url = hasExtension
    ? `${baseUrl}/api/media/file/${idOrFilename}`
    : `${baseUrl}/api/media/${idOrFilename}`;

  // Add query parameters for image transformations if needed
  const params = new URLSearchParams();
  if (options?.width) {
    params.append('width', options.width.toString());
  }
  if (options?.height) {
    params.append('height', options.height.toString());
  }
  if (options?.quality) {
    params.append('quality', options.quality.toString());
  }

  if (params.toString()) {
    return `${url}?${params.toString()}`;
  }

  return url;
}

/**
 * Get Payload asset URL (alias for media URL)
 */
export function getPayloadAssetURL(fileId: string | number | null | undefined): string {
  return getPayloadMediaURL(fileId);
}
