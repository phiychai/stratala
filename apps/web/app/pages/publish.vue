<script setup lang="ts">
/**
 * Payload CMS Admin Panel - Tenant-aware
 *
 * Access via:
 * - Main domain: /publish (admin access to all content)
 * - Tenant subdomain: username.localhost/publish (tenant-specific content)
 *
 * This page is a placeholder - the actual content is served by the server route
 * at server/routes/publish/[...].ts which proxies to Payload CMS.
 */
definePageMeta({
  layout: false, // No layout - Payload admin has its own UI
  // No middleware - Payload CMS handles authentication itself
  // The server route proxies requests with cookies, and Payload authenticates
});

// Redirect to the server route which will proxy to Payload
// The server route handles all /publish/* requests
const route = useRoute();
const router = useRouter();

// For the exact /publish path, we need to fetch from the server route
onMounted(() => {
  // The server route should handle this, but if we're here, fetch the proxied content
  window.location.reload();
});
</script>

<template>
  <div>
    <p>Loading Payload CMS...</p>
    <p v-if="route.path !== '/publish'">Redirecting...</p>
  </div>
</template>
