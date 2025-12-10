// plugins/auth.client.ts
// Initialize auth state on client-side
// Works for both SSR and client-only pages
export default defineNuxtPlugin(async () => {
  // Only run on client side (after hydration for SSR pages)
  if (import.meta.client) {
    const authStore = useAuthStore();

    // Initialize auth state on app load
    // Don't fetch if user was just logged out (initialized = true but user = null)
    if (!authStore.initialized) {
      await authStore.fetchUser();
    }
  }
});
