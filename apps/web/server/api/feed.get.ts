/**
 * Feed API - Thin proxy to AdonisJS backend
 *
 * This endpoint proxies requests to the AdonisJS backend /api/feed endpoint.
 * All feed logic (fetching from Payload, sorting, pagination) is handled by AdonisJS.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Get backend URL and convert 0.0.0.0 to localhost for server-to-server calls
  const apiUrl = config.public.apiUrl || 'http://localhost:3333';
  const backendUrl = apiUrl.replace(/0\.0\.0\.0/g, 'localhost');

  // Get query parameters
  const query = getQuery(event);

  // Convert query params to URLSearchParams format
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  }
  const queryString = params.toString();
  const fullUrl = queryString ? `${backendUrl}/api/feed?${queryString}` : `${backendUrl}/api/feed`;

  // Prepare headers with cookies for backend requests
  const headers: Record<string, string> = {};
  const incomingHeaders = getHeaders(event);

  // Copy relevant headers, exclude host
  // This includes the cookie header which contains the session
  for (const [key, value] of Object.entries(incomingHeaders)) {
    if (key.toLowerCase() !== 'host' && value !== undefined) {
      headers[key] = String(value);
    }
  }

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.info('[Feed API] Proxying to:', fullUrl);
    console.info('[Feed API] Has cookie header:', !!headers.cookie);
    if (headers.cookie) {
      console.info('[Feed API] Cookie preview:', headers.cookie.substring(0, 100));
    }
  }

  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
    });

    // Forward response headers (especially Set-Cookie)
    const responseHeaders = response.headers;

    // Handle Set-Cookie specially - native fetch supports getSetCookie()
    const cookies = responseHeaders.getSetCookie?.() || [];
    if (cookies.length > 0) {
      for (const cookie of cookies) {
        appendResponseHeader(event, 'set-cookie', cookie);
      }
    }

    // Forward other headers
    for (const [key, value] of responseHeaders.entries()) {
      if (key.toLowerCase() !== 'set-cookie') {
        setHeader(event, key, value);
      }
    }

    // Set status code
    setResponseStatus(event, response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw createError({
          statusCode: 401,
          message:
            errorData.message ||
            'Authentication required. Please log in to view your personalized feed.',
        });
      }

      if (response.status === 400) {
        throw createError({
          statusCode: 400,
          message: errorData.message || 'Invalid query parameters',
          data: errorData.errors,
        });
      }

      throw createError({
        statusCode: response.status,
        message: errorData.message || 'Failed to fetch feed',
      });
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    // Re-throw H3 errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    console.error('[Feed API] Error:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to connect to backend server',
    });
  }
});
