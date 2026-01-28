export default defineEventHandler(async (event) => {
  const spaceId = getRouterParam(event, 'id');

  if (!spaceId) {
    throw createError({ statusCode: 400, message: 'Space ID is required' });
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

    const response = await fetch(`${backendUrl}/api/feed/spaces/${spaceId}`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw createError({
          statusCode: 401,
          message: 'Authentication required',
        });
      }
      throw createError({
        statusCode: response.status,
        message: 'Failed to follow space',
      });
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Error following space:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw createError({
      statusCode: 500,
      message: 'Failed to follow space',
      data: {
        error: errorMessage,
      },
    });
  }
});
