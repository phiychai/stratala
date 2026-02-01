/**
 * Admin Subdomain Middleware
 *
 * Ensures admin routes are only accessible via admin subdomain
 * Blocks access to /admin/* and /api/admin/* routes if not on admin subdomain
 */
import { isAdminSubdomainRequest } from '../utils/tenant-context';

export default defineEventHandler((event) => {
  const path = event.path || '';

  // Check if this is an admin route
  const isAdminPageRoute = path.startsWith('/admin');
  const isAdminApiRoute = path.startsWith('/api/admin');

  if (
    (isAdminPageRoute || isAdminApiRoute) && // Check if request is from admin subdomain
    !isAdminSubdomainRequest(event)
  ) {
    // Not on admin subdomain - block access
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin routes are only accessible via admin subdomain',
      data: {
        message: 'Please access admin routes through the admin subdomain (e.g., admin.example.com)',
      },
    });
  }
});
