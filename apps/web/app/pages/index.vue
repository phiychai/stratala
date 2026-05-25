<script setup lang="ts">
const { isAuthenticated, fetchUser: _fetchUser } = useAuth();

// Redirect authenticated users to their dashboard
if (isAuthenticated.value) {
  await navigateTo('/home');
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <!-- CMS Unavailable Fallback -->
    <div class="flex min-h-screen items-center justify-center p-8">
      <div class="max-w-md text-center">
        <Icon name="lucide:alert-circle" class="mx-auto mb-4 size-12 text-warning" />
        <h1 class="mb-2 text-2xl font-bold">Content System Unavailable</h1>
        <p class="mb-6 text-muted">
          We're having trouble connecting to our content system. Please try again later.
        </p>
        <UButton to="/" color="primary">Go to Home</UButton>
      </div>
    </div>
  </div>
</template>
