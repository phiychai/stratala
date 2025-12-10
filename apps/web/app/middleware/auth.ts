/**
 * Auth Middleware
 *
 * Protects routes - only accessible to authenticated users
 * Redirects to home page if not authenticated
 */
export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const { fetchUser, isAuthenticated } = useAuth();

  // Try to fetch user if not already authenticated
  if (!isAuthenticated.value) {
    await fetchUser();
  }

  // If still not authenticated after fetch, redirect to home
  if (!isAuthenticated.value) {
    return navigateTo('/');
  }
});
