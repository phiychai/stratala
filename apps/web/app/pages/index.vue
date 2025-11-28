<script setup lang="ts">
const { isAuthenticated, fetchUser } = useAuth();

// Try to fetch user first
await fetchUser();

// Redirect authenticated users to their dashboard
if (isAuthenticated.value) {
  await navigateTo('/home');
} else {
  // For unauthenticated users, redirect to login page
  // This prevents the catch-all route from trying to fetch a page from Payload
  await navigateTo('/login');
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <p class="text-gray-500">Redirecting...</p>
    </div>
  </div>
</template>

