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
      `${backendUrl}/api/engagement/content/${contentType}/${contentId}/like`,
      {
        method: 'DELETE',
        headers,
        credentials: 'include',
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw createError({
          statusCode: 401,
          message: 'Authentication required to unlike content',
        });
      }
      throw createError({
        statusCode: response.status,
        message: 'Failed to unlike content',
      });
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Error unliking content:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw createError({
      statusCode: 500,
      message: 'Failed to unlike content',
      data: {
        error: errorMessage,
      },
    });
  }
});
