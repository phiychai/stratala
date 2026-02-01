/**
 * Tenant-aware Payload CMS Admin Proxy
 *
 * Proxies Payload CMS admin panel requests with tenant filtering
 * Access: username.localhost/publish/*
 *
 * Features:
 * - Extracts tenant from subdomain
 * - Resolves username to Payload user ID
 * - Proxies to Payload with tenant context
 * - Payload access control automatically filters content by owner
 */
import {
  getTenantContext,
  resolveTenantToPayloadUserId,
  isTenantRequest,
} from '~~/server/utils/tenant-context';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const payloadUrl = config.public.payloadUrl || 'http://localhost:3002';
  const proxyBasePath = '/publish';

  // Debug: Log the request path
  console.log('[Publish Proxy] Request path:', event.path, 'Method:', event.method);

  // Skip Next.js internal routes and error handling routes - these should not be proxied
  const nextJsInternalPaths = [
    '__nextjs_original-stack-frames',
    '__nextjs_original-error',
    '_nextjs',
    '__nextjs',
  ];

  const pathAfterPublish = event.path.replace(proxyBasePath, '');
  // Check if the path contains any Next.js internal route
  if (nextJsInternalPaths.some((internalPath) => pathAfterPublish.includes(internalPath))) {
    // Return 404 for Next.js internal routes - they shouldn't be accessed through proxy
    // These are Next.js error handling routes and shouldn't be proxied to Payload
    console.log('[Publish Proxy] Skipping Next.js internal route:', event.path);
    throw createError({
      statusCode: 404,
      statusMessage: 'Not found',
    });
  }

  const tenant = getTenantContext(event);

  // For tenant subdomains, require username
  if (isTenantRequest(event) && !tenant.username) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Subdomain required for tenant access',
    });
  }

  // Resolve tenant to Payload user ID (for tenant requests)
  let tenantUserId: string | null = null;
  if (tenant.username) {
    tenantUserId = await resolveTenantToPayloadUserId(event);

    if (!tenantUserId) {
      throw createError({
        statusCode: 404,
        statusMessage: `Tenant "${tenant.username}" not found in Payload CMS`,
      });
    }
  }

  // Note: Authentication is handled by Payload CMS itself
  // The proxy forwards cookies/headers, and Payload will authenticate the user
  // Payload's access control will automatically filter content by tenant ownership

  // Get the path after /publish
  // Handle both /publish and /publish/ paths
  let path = event.path.replace(proxyBasePath, '');
  if (!path || path === '/') {
    path = '';
  }

  // Special handling: _next static assets should go directly to Payload without /admin prefix
  // This is because Next.js serves static assets from /_next/ and they need to match the original paths
  if (path.startsWith('/_next/') || path === '/_next') {
    const targetPath = path;
    const targetUrl = `${payloadUrl}${targetPath}`;

    // Proxy static assets directly without modification
    try {
      const headers: Record<string, string> = {};
      const incomingHeaders = getHeaders(event);

      // Copy relevant headers, but request uncompressed content
      // We'll proxy the content as-is without decompression
      for (const [key, value] of Object.entries(incomingHeaders)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey !== 'host' &&
          lowerKey !== 'content-length' &&
          lowerKey !== 'accept-encoding' &&
          value !== undefined
        ) {
          headers[key] = value;
        }
      }

      // Request identity encoding (no compression) so we can proxy as-is
      headers['accept-encoding'] = 'identity';

      const response = await fetch(targetUrl, {
        method: event.method,
        headers,
        credentials: 'include',
      });

      // Forward all headers - since we requested identity, there should be no content-encoding
      for (const [key, value] of response.headers.entries()) {
        const lowerKey = key.toLowerCase();
        // Forward all headers except content-length (will be recalculated)
        if (lowerKey !== 'content-length') {
          setHeader(event, key, value);
        }
      }
      setResponseStatus(event, response.status);

      // Get the response as arrayBuffer to preserve binary data
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Set content-length after we know the size
      setHeader(event, 'content-length', String(buffer.length));

      return buffer;
    } catch (error) {
      throw createError({
        statusCode: 502,
        statusMessage: `Failed to proxy static asset: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  // For all other paths, add /admin prefix
  const targetPath = path === '' ? '/admin' : `/admin${path}`;
  const targetUrl = `${payloadUrl}${targetPath}`;

  // Get query parameters
  const query = getQuery(event);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        for (const v of value) params.append(key, String(v));
      } else {
        params.append(key, String(value));
      }
    }
  }
  const queryString = params.toString();
  const fullUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

  // Get request body for POST/PUT/PATCH/DELETE
  let body;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.method)) {
    try {
      body = await readBody(event);
    } catch {
      body = undefined;
    }
  }

  // Forward the request to Payload
  try {
    const headers: Record<string, string> = {};
    const incomingHeaders = getHeaders(event);

    // Copy relevant headers, exclude host and content-length
    for (const [key, value] of Object.entries(incomingHeaders)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey !== 'host' && lowerKey !== 'content-length' && value !== undefined) {
        headers[key] = value;
      }
    }

    // Ensure proper content-type for JSON body
    if (body && typeof body === 'object') {
      headers['content-type'] = 'application/json';
    }

    // If tenant request, add tenant context header (Payload can use this for additional filtering)
    if (tenantUserId) {
      headers['x-tenant-user-id'] = tenantUserId;
    }

    const response = await fetch(fullUrl, {
      method: event.method,
      headers,
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
      credentials: 'include',
      signal: AbortSignal.timeout(30000),
    });

    // Forward response headers (especially Set-Cookie for auth)
    const responseHeaders = response.headers;
    const cookies = responseHeaders.getSetCookie?.() || [];
    if (cookies.length > 0) {
      for (const cookie of cookies) {
        appendResponseHeader(event, 'set-cookie', cookie);
      }
    }

    // Forward other headers
    // IMPORTANT: Don't forward content-encoding for HTML responses
    // The browser needs to handle decompression, but we're modifying the content
    for (const [key, value] of responseHeaders.entries()) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey !== 'set-cookie' &&
        lowerKey !== 'content-encoding' && // Don't forward - we're modifying content
        lowerKey !== 'transfer-encoding' &&
        lowerKey !== 'content-length' // Will be recalculated after rewriting
      ) {
        setHeader(event, key, value);
      }
    }

    // Set status code
    setResponseStatus(event, response.status);

    // Read and return the response body
    const contentType = responseHeaders.get('content-type') || '';
    let responseText = await response.text();

    // Rewrite URLs in HTML responses to point to our proxy
    // Only rewrite HTML - JS/CSS should load from their original paths
    if (contentType.includes('text/html')) {
      const rewriteBase = proxyBasePath;

      // Rewrite absolute URLs pointing to Payload admin
      responseText = responseText.replace(new RegExp(`${payloadUrl}/admin`, 'g'), rewriteBase);

      // Rewrite relative URLs that start with /admin (but not /_next or /api which need special handling)
      responseText = responseText.replace(/href="\/admin\//g, `href="${rewriteBase}/`);
      responseText = responseText.replace(/src="\/admin\//g, `src="${rewriteBase}/`);
      responseText = responseText.replace(/url\(["']?\/admin\//g, `url(${rewriteBase}/`);

      // Rewrite login redirect URLs
      responseText = responseText.replace(
        /\/login\?redirect=\/admin/g,
        `${rewriteBase}/login?redirect=${rewriteBase}`
      );
      responseText = responseText.replace(
        /\/login\?redirect=\/admin\//g,
        `${rewriteBase}/login?redirect=${rewriteBase}/`
      );

      // Rewrite API calls to go through our proxy
      responseText = responseText.replace(/href="\/api\//g, `href="${rewriteBase}/api/`);
      responseText = responseText.replace(/src="\/api\//g, `src="${rewriteBase}/api/`);

      // IMPORTANT: Rewrite _next static assets to go through our proxy
      // This avoids CORS issues and ensures proper proxying
      // The browser will request /publish/_next/... which we'll proxy to Payload's /_next/...
      responseText = responseText.replace(/href="\/_next\//g, `href="${rewriteBase}/_next/`);
      responseText = responseText.replace(/src="\/_next\//g, `src="${rewriteBase}/_next/`);
      responseText = responseText.replace(/url\(["']?\/_next\//g, `url(${rewriteBase}/_next/`);

      // Also handle any absolute URLs that might reference _next
      responseText = responseText.replace(
        new RegExp(`${payloadUrl}/_next`, 'g'),
        `${rewriteBase}/_next`
      );
    }

    // Set appropriate content-type header
    if (contentType) {
      setHeader(event, 'content-type', contentType);
    }

    return responseText;
  } catch (error: unknown) {
    // Handle connection errors gracefully
    if (
      error instanceof Error && // ECONNRESET, ECONNREFUSED, etc. are connection errors
      (error.message.includes('ECONNRESET') || error.message.includes('ECONNREFUSED'))
    ) {
      console.error('❌ Payload CMS connection error:', error.message);
      throw createError({
        statusCode: 502,
        statusMessage: 'Payload CMS is not available',
        data: 'Failed to connect to Payload CMS. Please ensure it is running.',
      });
    }

    console.error('❌ Payload CMS proxy error:', error);
    const status =
      error && typeof error === 'object' && 'status' in error
        ? (error as { status?: number }).status
        : undefined;
    const message = error instanceof Error ? error.message : String(error);
    throw createError({
      statusCode: status || 500,
      statusMessage: 'Payload CMS proxy error',
      data: message,
    });
  }
});
