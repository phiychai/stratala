<script setup lang="ts">
/**
 * Videos - Migrated to Nuxt UI
 * Uses composables for videos, categories, and image transformation
 */
import { formatDistanceToNow } from 'date-fns';
import type { VideosProps } from '~/types/components';
import { useVideos } from '~/composables/useVideos';
import { useVideoCategories } from '~/composables/useVideoCategories';
import { useVideoTransform } from '~/composables/useVideoTransform';

const props = defineProps<VideosProps>();

// Use videos composable for fetching and pagination
const { videos, error } = useVideos({
  limit: props.data?.limit || 12, // Add optional chaining
  key: `block-videos-${useRoute().path}-${props.data?.id || 'default'}`,
});

// Use categories composable
const { menuItems: items } = useVideoCategories(videos);

// Transform videos to include thumbnail URLs and formatted authors
const { transformVideos } = useVideoTransform();
const videosWithThumbnailUrls = computed(() => transformVideos(videos.value));

const feedOrientation = computed(() => props.data?.orientation || 'horizontal');
</script>
<template>
  <UDashboardNavbar :ui="{ right: 'gap-3' }" class="border-b-0">
    <template #left> <UNavigationMenu :items="items" color="neutral" /></template>
  </UDashboardNavbar>
  <UContainer ref="articleContentRef" class="max-w-none overflow-auto pt-4">
    <!-- Show error if videos failed to load -->
    <div v-if="error" class="flex items-center justify-center py-12">
      <UAlert
        color="error"
        variant="soft"
        title="Error loading videos"
        :description="error.message || 'Failed to fetch videos'"
      />
    </div>

    <!-- Show empty state if no videos -->
    <div
      v-else-if="videosWithThumbnailUrls.length === 0"
      class="flex items-center justify-center py-12"
    >
      <UAlert
        color="neutral"
        variant="soft"
        title="No videos found"
        description="There are no published videos available at this time."
      />
    </div>
    <!-- Show videos -->
    <UBlogPosts v-else :orientation="feedOrientation">
      <UBlogPost
        v-for="(video, index) in videosWithThumbnailUrls"
        :key="video.id"
        :to="`/videos/${video.slug}`"
        :title="video.title"
        :description="video.description || undefined"
        v-bind="video.thumbnailUrl ? { image: video.thumbnailUrl } : {}"
        :date="
          video.publishedAt
            ? formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })
            : undefined
        "
        :authors="
          video.author && typeof video.author === 'object'
            ? [
                {
                  name: `${video.author.firstName || ''} ${video.author.lastName || ''}`.trim(),
                  avatar: video.author.avatar, // Use the already-transformed value
                },
              ]
            : undefined
        "
        :badge="
          video.categories && video.categories.length > 0 && video.categories[0]
            ? {
                label:
                  typeof video.categories[0] === 'string'
                    ? video.categories[0]
                    : typeof video.categories[0] === 'object' &&
                        video.categories[0] !== null &&
                        'title' in video.categories[0]
                      ? String((video.categories[0] as { title?: string }).title || '')
                      : '',
              }
            : undefined
        "
        :orientation="index === 0 ? 'horizontal' : 'vertical'"
        :class="[index === 0 && 'col-span-full']"
        :ui="{
          description: 'line-clamp-2',
        }"
      />
    </UBlogPosts>
  </UContainer>
</template>
