<script setup lang="ts">
import { useRoute } from 'vue-router';
import type { UnifiedContent } from '~/types/content';
import ContentCard from '~/components/content/ContentCard.vue';
import { useFollowSpace } from '~/composables/useFollowSpace';

definePageMeta({
  middleware: 'auth',
});

const route = useRoute();

// Query parameters
const searchQuery = computed(() => (route.query.search as string) || '');
const selectedCategory = computed(() => (route.query.category as string) || '');
const selectedTag = computed(() => (route.query.tag as string) || '');
const contentType = computed(() => (route.query.type as 'post' | 'video' | 'all') || 'all');

// Fetch explore content
const {
  data,
  error,
  refresh: _refresh,
} = useFetch<{
  content: UnifiedContent[];
  count: number;
  categories: Array<{ id: string; name: string; slug: string }>;
  tags: Array<{ id: string; name: string; slug: string }>;
}>('/api/explore', {
  query: {
    search: searchQuery,
    category: selectedCategory,
    tag: selectedTag,
    type: contentType,
    limit: 80,
    page: 1,
  },
  watch: [searchQuery, selectedCategory, selectedTag, contentType],
});

const content = computed(() => data.value?.content || []);
const _tags = computed(() => data.value?.tags || []);

// View mode (grid/list)
const viewMode = ref<'grid' | 'list'>('grid');

// Fetch spaces for creator directory
const { data: spacesData } = useFetch<{
  spaces: Array<{ id: string; name: string; slug: string; description?: string }>;
}>('/api/explore/spaces', {
  key: 'explore-spaces',
});

const spaces = computed(() => spacesData.value?.spaces || []);

// Follow space functionality
const { isFollowing: isFollowingMap, toggleFollow, loading: followLoading } = useFollowSpace();

useSeoMeta({
  title: 'Explore - Discover Content',
  description: 'Browse categories, tags, and search for posts and videos',
});
</script>

<template>
  <UDashboardPanel class="pb-[64px]" variant="ghost">
    <UContainer ref="articleContentRef" class="max-w-none overflow-auto pt-4">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold mb-4">Explore</h1>
      </div>

      <!-- Error State -->
      <div v-if="error" class="flex items-center justify-center py-12">
        <UAlert
          color="error"
          variant="soft"
          title="Error loading content"
          :description="error.message || 'Failed to fetch explore content'"
        />
      </div>

      <!-- Empty State -->
      <div v-else-if="content.length === 0" class="flex items-center justify-center py-12">
        <UAlert
          color="neutral"
          variant="soft"
          title="No content found"
          description="Try adjusting your search or filters."
        />
      </div>

      <!-- Content Section with View Mode Toggle -->
      <div v-else>
        <!-- View Mode Toggle -->
        <div class="flex items-center justify-end mb-4">
          <div class="flex gap-2">
            <UButton
              :icon="viewMode === 'grid' ? 'i-heroicons-squares-2x2' : 'i-heroicons-squares-2x2'"
              :variant="viewMode === 'grid' ? 'solid' : 'outline'"
              size="sm"
              @click="viewMode = 'grid'"
            >
              Grid
            </UButton>
            <UButton
              :icon="viewMode === 'list' ? 'i-heroicons-bars-3' : 'i-heroicons-bars-3'"
              :variant="viewMode === 'list' ? 'solid' : 'outline'"
              size="sm"
              @click="viewMode = 'list'"
            >
              List
            </UButton>
          </div>
        </div>

        <!-- Content Grid/List -->
        <UBlogPosts :orientation="viewMode === 'grid' ? 'horizontal' : 'vertical'">
          <ContentCard
            v-for="(item, index) in content"
            :key="`explore-${item.type}-${item.content.id}`"
            :content="item"
            :orientation="
              viewMode === 'grid' && index === 0
                ? 'horizontal'
                : viewMode === 'grid'
                  ? 'vertical'
                  : 'horizontal'
            "
          />
        </UBlogPosts>
      </div>

      <!-- Creator Directory Section -->
      <div v-if="spaces.length > 0" class="mt-12">
        <h2 class="text-2xl font-bold mb-6">Creator Directory</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UCard
            v-for="space in spaces"
            :key="`space-${space.id}`"
            class="hover:shadow-lg transition-shadow"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-lg">{{ space.name }}</h3>
                <UButton
                  :icon="isFollowingMap[space.id] ? 'i-heroicons-check' : 'i-heroicons-plus'"
                  :variant="isFollowingMap[space.id] ? 'solid' : 'outline'"
                  :color="isFollowingMap[space.id] ? 'primary' : 'neutral'"
                  size="sm"
                  :loading="followLoading[space.id]"
                  @click="toggleFollow(space.id)"
                >
                  {{ isFollowingMap[space.id] ? 'Following' : 'Follow' }}
                </UButton>
              </div>
            </template>
            <p v-if="space.description" class="text-sm text-gray-600 mb-2">
              {{ space.description }}
            </p>
            <UButton :to="`/@${space.slug}`" variant="ghost" size="sm" class="w-full">
              View Space
            </UButton>
          </UCard>
        </div>
      </div>
    </UContainer>
  </UDashboardPanel>
</template>
