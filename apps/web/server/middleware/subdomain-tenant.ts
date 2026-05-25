/**
 * Subdomain Tenant Middleware
 *
 * Extracts username from subdomain and stores tenant context
 * Examples:
 * - username.localhost -> tenant: { username: 'username' }
 * - username.example.com -> tenant: { username: 'username' }
 */
export default defineEventHandler(async (event) => {
  const rawHost = getHeader(event, 'host');
  const host = Array.isArray(rawHost) ? rawHost[0] || '' : rawHost || '';
  const hostname = host.split(':')[0]; // Remove port if present

  // Reserved subdomains that should not be treated as tenant usernames
  const reservedSubdomains = ['www', 'api', 'app', 'cdn', 'static', 'assets', 'mail'];

  // Extract subdomain
  const parts = hostname.split('.');

  // For localhost: username.localhost -> ['username', 'localhost']
  // For production: username.example.com -> ['username', 'example', 'com']
  if (parts.length >= 2) {
    const subdomain = parts[0]?.toLowerCase();
    if (!subdomain) {
      event.context.tenant = {
        username: null,
        hostname,
        isSubdomain: false,
      };
      return;
    }

    // Special handling for admin subdomain
    if (subdomain === 'admin') {
      event.context.tenant = {
        username: null,
        hostname,
        isSubdomain: true,
        isAdminSubdomain: true, // Add this flag
      };
      return;
    }

    // Skip reserved subdomains and empty strings
    event.context.tenant =
      subdomain && !reservedSubdomains.includes(subdomain)
        ? {
            username: subdomain,
            hostname,
            isSubdomain: true,
          }
        : {
            username: null,
            hostname,
            isSubdomain: false,
          };
  } else {
    // Single part hostname (localhost without subdomain, or IP address)
    event.context.tenant = {
      username: null,
      hostname,
      isSubdomain: false,
    };
  }
});
