export default defineEventHandler(async (event) => {
  const contentType = getRouterParam(event, 'type') as 'post' | 'video';
  const contentId = getRouterParam(event, 'id');

  if (!contentType || !contentId) {
    throw createError({ statusCode: 400, message: 'Content type and ID are required' });
  }

  if (contentType !== 'post' && contentType !== 'video') {
    throw createError({ statusCode: 400, message: 'Content type must be "post" or "video"' });
  }

  const config = useRuntimeConfig();
  const backendUrl = config.public.apiUrl || 'http://localhost:3333';

  try {
    const headers: Record<string, string> = {};
    const incomingHeaders = getHeaders(event);
    for (const [key, value] of Object.entries(incomingHeaders)) {
      if (key.toLowerCase() !== 'host' && value !== undefined) {
        headers[key] = String(value);
      }
    }

    const response = await fetch(
      `${backendUrl}/api/engagement/content/${contentType}/${contentId}/view`,
      {
        method: 'POST',
        headers,
        credentials: 'include',
      }
    );

    // Don't fail the request if view tracking fails
    if (!response.ok) {
      return { success: false };
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    // Don't throw error - view tracking shouldn't break the page
    console.error('Error tracking view:', error);
    return { success: false };
  }
});
