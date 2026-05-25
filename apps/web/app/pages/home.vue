<script setup lang="ts">
import { useTrendingContent } from '~/composables/useTrendingContent';
import ContentCard from '~/components/content/ContentCard.vue';

// Remove auth middleware for casual visitors
// definePageMeta({
//   middleware: 'auth',
// });

// Fetch trending content
const { content, error } = useTrendingContent({
  type: 'all',
  limit: 30,
});

// Group content by source
const editorsPicks = computed(() =>
  content.value.filter((item) => item.source === 'editors-pick').slice(0, 5)
);
const trending = computed(() =>
  content.value.filter((item) => item.source === 'trending').slice(0, 20)
);

useSeoMeta({
  title: 'Home - Discovery Hub',
  description: 'Discover trending content, editor picks, and featured posts and videos',
});
</script>

<template>
  <UDashboardPanel class="pb-[64px]" variant="ghost">
    <UContainer ref="articleContentRef" class="max-w-none overflow-auto pt-4">
      <!-- Editor's Picks Section -->
      <div v-if="editorsPicks.length > 0" class="mb-12">
        <h2 class="text-2xl font-bold mb-6">Editor's Picks</h2>
        <UBlogPosts orientation="horizontal">
          <ContentCard
            v-for="item in editorsPicks"
            :key="`editor-${item.content.id}`"
            :content="item"
          />
        </UBlogPosts>
      </div>

      <!-- Trending Section -->
      <div v-if="trending.length > 0" class="mb-12">
        <h2 class="text-2xl font-bold mb-6">Trending Now</h2>
        <UBlogPosts
          orientation="horizontal"
          :ui="{
            base: 'flex flex-col gap-4 lg:gap-y-4',
          }"
        >
          <ContentCard
            v-for="item in trending"
            :key="`trending-${item.content.id}`"
            :content="item"
          />
        </UBlogPosts>
      </div>

      <!-- Error State -->
      <div v-if="error" class="flex items-center justify-center py-12">
        <UAlert
          color="error"
          variant="soft"
          title="Error loading content"
          :description="error.message || 'Failed to fetch content'"
        />
      </div>

      <!-- Empty State -->
      <div v-else-if="content.length === 0" class="flex items-center justify-center py-12">
        <UAlert
          color="neutral"
          variant="soft"
          title="No content found"
          description="There is no content available at this time."
        />
      </div>
    </UContainer>
  </UDashboardPanel>
</template>
