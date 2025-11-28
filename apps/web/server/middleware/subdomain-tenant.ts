/**
 * Subdomain Tenant Middleware
 *
 * Extracts username from subdomain and stores tenant context
 * Examples:
 * - username.localhost -> tenant: { username: 'username' }
 * - username.example.com -> tenant: { username: 'username' }
 */
export default defineEventHandler(async (event) => {
  const host = getHeader(event, 'host') || '';
  const hostname = host.split(':')[0]; // Remove port if present

  // Reserved subdomains that should not be treated as tenant usernames
  const reservedSubdomains = ['www', 'api', 'admin', 'app', 'cdn', 'static', 'assets', 'mail'];

  // Extract subdomain
  const parts = hostname.split('.');

  // For localhost: username.localhost -> ['username', 'localhost']
  // For production: username.example.com -> ['username', 'example', 'com']
  if (parts.length >= 2) {
    const subdomain = parts[0].toLowerCase();

    // Skip reserved subdomains and empty strings
    if (subdomain && !reservedSubdomains.includes(subdomain)) {
      // Store tenant info in event context
      event.context.tenant = {
        username: subdomain,
        hostname,
        isSubdomain: true,
      };
    } else {
      // Main domain (no tenant)
      event.context.tenant = {
        username: null,
        hostname,
        isSubdomain: false,
      };
    }
  } else {
    // Single part hostname (localhost without subdomain, or IP address)
    event.context.tenant = {
      username: null,
      hostname,
      isSubdomain: false,
    };
  }
});

