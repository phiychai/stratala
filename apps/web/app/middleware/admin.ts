import { UserRole } from '~/types/enums';

/**
 * Admin Middleware
 *
 * Protects admin routes - only accessible to users with admin role
 * and only via admin subdomain
 */
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  const { isAdminSubdomain, redirectToAdminSubdomain } = useAdminSubdomain();

  // Check if we're on admin subdomain
  if (!isAdminSubdomain.value) {
    // Not on admin subdomain - redirect to admin subdomain
    redirectToAdminSubdomain(to.fullPath);
    return;
  }

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    });
  }

  // Check if user has admin role
  if (authStore.user?.role !== UserRole.ADMIN) {
    // Not an admin - redirect to regular dashboard
    return createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    });
  }

  // User is admin and on admin subdomain - allow access
});
