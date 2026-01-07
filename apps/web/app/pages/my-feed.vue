<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});

// Create data object for Posts component
const postsData = computed(() => ({
  id: 'posts-home',
  limit: 20,
  tagline: undefined,
  headline: 'Posts',
  posts: [], // Empty array - Posts component will fetch its own
  orientation: 'vertical' as const,
}));

useSeoMeta({
  title: 'Home',
  description: 'Your dashboard',
});
</script>

<template>
  <UDashboardPanel class="pb-[64px]" variant="ghost">
    <Posts :data="postsData" />
  </UDashboardPanel>
</template>
