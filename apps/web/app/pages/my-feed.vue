<script setup lang="ts">
import type { TimelineItem, DropdownMenuItem } from '@nuxt/ui';
import { useTimeAgo } from '@vueuse/core';
import { usePersonalizedFeed } from '~/composables/usePersonalizedFeed';
import { usePayloadImage } from '~/composables/usePayloadImage';
import { useContentLike } from '~/composables/useContentLike';

const { getImageUrl } = usePayloadImage();
const { toggleLike, getLikeStatus, isLiked, getLikeCount, loading: likeLoading } = useContentLike();
const toast = useToast();

definePageMeta({
  middleware: 'auth',
});

// Fetch personalized feed
const {
  content,
  pending,
  error,
  currentPage,
  totalPages,
  sortBy,
  handlePageChange,
  handleSortChange,
} = usePersonalizedFeed({
  limit: 20,
});

// Transform content into timeline items
const timelineItems = computed(() =>
  content.value.map((item): TimelineItem => {
    const itemContent = item.content;
    const postOrVideo = itemContent as unknown as Record<string, unknown>;

    // Get author info - author can be number | User
    let authorName = 'Unknown';
    let avatar: string | undefined;

    const authorField = postOrVideo.author;
    if (authorField && typeof authorField === 'object') {
      const authorObj = authorField as Record<string, unknown>;
      authorName =
        `${(authorObj.firstName as string) || ''} ${(authorObj.lastName as string) || ''}`.trim() ||
        (authorObj.email as string) ||
        'Unknown';
      // Check for various possible avatar/image fields like ContentCard does
      avatar =
        (authorObj.avatar as string) ||
        (authorObj.image as string) ||
        (authorObj.profileImage as string) ||
        (authorObj.avatarUrl as string);
    }

    // Get thumbnail URL for posts/videos using proper image resolver
    const imageField = item.type === 'post' ? postOrVideo.image : postOrVideo.thumbnail;
    const thumbnailUrl = getImageUrl(
      typeof imageField === 'object' && imageField !== null
        ? (imageField as any)
        : typeof imageField === 'number'
          ? imageField
          : null
    );

    // Get content type info
    const isVideo = item.type === 'video';
    const action = isVideo ? 'published a video' : 'published a post';
    const icon = isVideo ? 'i-heroicons-video-camera' : 'i-heroicons-document-text';

    return {
      username: authorName,
      date: (postOrVideo.publishedAt as string) || new Date().toISOString(),
      action,
      icon,
      avatar: avatar ? { src: avatar } : undefined,
      description: (postOrVideo.title as string) || 'Untitled',
      // Add custom data for navigation and images
      contentId: itemContent.id as number,
      contentSlug: postOrVideo.slug as string,
      contentType: item.type,
      thumbnailUrl,
    };
  })
);

// Fetch like status for all items
watch(
  content,
  async (items) => {
    for (const item of items) {
      await getLikeStatus(item.type, item.content.id);
    }
  },
  { immediate: true }
);

// Like helpers
function handleLike(type: 'post' | 'video', id: number) {
  toggleLike(type, id);
}

function getIsLiked(type: 'post' | 'video', id: number) {
  return isLiked(type, id);
}

function getItemLikeCount(type: 'post' | 'video', id: number) {
  return getLikeCount(type, id);
}

function getIsLikeLoading(type: 'post' | 'video', id: number) {
  return likeLoading.value[`${type}-${id}`];
}

// Share functions
function getShareUrl(type: 'post' | 'video', slug: string) {
  const baseUrl = window.location.origin;
  return `${baseUrl}${type === 'post' ? `/blog/${slug}` : `/videos/${slug}`}`;
}

function copyLink(type: 'post' | 'video', slug: string) {
  navigator.clipboard.writeText(getShareUrl(type, slug));
  toast.add({
    title: 'Link copied',
    description: 'The link has been copied to your clipboard.',
    icon: 'i-lucide-check',
    color: 'success',
  });
}

function shareToX(type: 'post' | 'video', slug: string, title: string) {
  const url = encodeURIComponent(getShareUrl(type, slug));
  const text = encodeURIComponent(title);
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareToFacebook(type: 'post' | 'video', slug: string) {
  const url = encodeURIComponent(getShareUrl(type, slug));
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareToLinkedIn(type: 'post' | 'video', slug: string) {
  const url = encodeURIComponent(getShareUrl(type, slug));
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
}

function getShareItems(type: 'post' | 'video', slug: string, title: string): DropdownMenuItem[][] {
  return [
    [
      {
        label: 'Copy link',
        icon: 'i-lucide-link',
        onSelect: () => copyLink(type, slug),
      },
      {
        label: 'Share on X',
        icon: 'i-simple-icons-x',
        onSelect: () => shareToX(type, slug, title),
      },
      {
        label: 'Share on Facebook',
        icon: 'i-simple-icons-facebook',
        onSelect: () => shareToFacebook(type, slug),
      },
      {
        label: 'Share on LinkedIn',
        icon: 'i-simple-icons-linkedin',
        onSelect: () => shareToLinkedIn(type, slug),
      },
    ],
  ];
}

useSeoMeta({
  title: 'My Feed - Personalized Content',
  description: 'Content from spaces you follow',
});
</script>

<template>
  <UDashboardPanel class="pb-[64px]" variant="ghost">
    <UContainer ref="articleContentRef" class="max-w-none overflow-auto pt-4">
      <!-- Header with sort toggle -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">My Feed</h1>
        <div class="flex items-center gap-4">
          <UToggle
            :model-value="sortBy === 'engagement'"
            @update:model-value="handleSortChange($event ? 'engagement' : 'chronological')"
          >
            Sort by Engagement
          </UToggle>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="flex items-center justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-muted" />
        <span class="ml-2 text-muted">Loading your feed...</span>
      </div>

      <!-- Empty State - No Followed Spaces -->
      <div
        v-else-if="!error && !pending && content.length === 0"
        class="flex flex-col items-center justify-center py-12"
      >
        <UAlert
          color="neutral"
          variant="soft"
          title="Your feed is empty"
          description="Start following spaces to see personalized content in your feed."
          class="mb-6"
        />
        <UButton to="/explore" color="primary" variant="solid"> Discover Spaces </UButton>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center py-12">
        <UAlert
          color="error"
          variant="soft"
          title="Error loading feed"
          :description="error.message || 'Failed to fetch your personalized feed'"
        />
      </div>

      <!-- Feed Content -->
      <div v-else-if="!pending && !error && content.length > 0">
        <UTimeline
          :items="timelineItems"
          size="md"
          :ui="{
            date: 'float-end ms-2 text-xs text-muted',
            description:
              ' ring ring-default mt-2 rounded-md text-default hover:bg-muted/50 cursor-pointer transition-colors',
          }"
          class="max-w-1/2 mx-auto"
        >
          <template #title="{ item }">
            <span class="font-medium">{{ item.username }}</span>
            <span class="font-normal text-muted">&nbsp;{{ item.action }}</span>
          </template>

          <template #date="{ item }">
            {{ useTimeAgo(new Date(item.date || new Date())) }}
          </template>

          <template #description="{ item }">
            <div class="space-y-3">
              <!-- Full width thumbnail image on top -->
              <div v-if="item.thumbnailUrl" class="w-full">
                <div class="relative">
                  <img
                    :src="item.thumbnailUrl"
                    :alt="item.description"
                    class="w-full h-80 object-cover rounded-md"
                  />
                  <!-- Video play overlay -->
                  <div
                    v-if="item.contentType === 'video'"
                    class="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md"
                  >
                    <UIcon name="i-heroicons-play-circle" class="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <!-- Content below the image -->
              <div>
                <NuxtLink
                  :to="
                    item.contentType === 'post'
                      ? `/blog/${item.contentSlug}`
                      : `/videos/${item.contentSlug}`
                  "
                  class="block hover:text-primary transition-colors"
                >
                  <div class="font-medium text-sm">{{ item.description }}</div>
                </NuxtLink>
              </div>

              <!-- Action bar: Like, Comment, Share -->
              <div class="flex items-center gap-1 pt-2 border-t border-default">
                <!-- Like button -->
                <UButton
                  :color="getIsLiked(item.contentType, item.contentId) ? 'error' : 'neutral'"
                  variant="ghost"
                  size="xs"
                  :loading="getIsLikeLoading(item.contentType, item.contentId)"
                  :class="getIsLiked(item.contentType, item.contentId) ? 'text-error' : ''"
                  @click.prevent="handleLike(item.contentType, item.contentId)"
                >
                  <template #leading>
                    <UIcon
                      name="i-lucide-heart"
                      :class="[
                        getIsLiked(item.contentType, item.contentId)
                          ? 'fill-current text-error'
                          : '',
                        'size-4',
                      ]"
                    />
                  </template>
                  <span
                    v-if="getItemLikeCount(item.contentType, item.contentId) > 0"
                    class="text-xs"
                  >
                    {{ getItemLikeCount(item.contentType, item.contentId) }}
                  </span>
                </UButton>

                <!-- Comment button -->
                <UButton
                  :to="
                    item.contentType === 'post'
                      ? `/blog/${item.contentSlug}`
                      : `/videos/${item.contentSlug}`
                  "
                  color="neutral"
                  variant="ghost"
                  size="xs"
                >
                  <template #leading>
                    <UIcon name="i-lucide-message-circle" class="size-4" />
                  </template>
                </UButton>

                <!-- Share dropdown -->
                <UDropdownMenu
                  :items="getShareItems(item.contentType, item.contentSlug, item.description)"
                  :content="{ align: 'start' }"
                >
                  <UButton color="neutral" variant="ghost" size="xs" @click.prevent>
                    <template #leading>
                      <UIcon name="i-lucide-share" class="size-4" />
                    </template>
                  </UButton>
                </UDropdownMenu>
              </div>
            </div>
          </template>
        </UTimeline>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center mt-8">
          <UPagination
            v-model="currentPage"
            :page-count="totalPages"
            :total="content.length"
            @update:model-value="handlePageChange"
          />
        </div>
      </div>
    </UContainer>
  </UDashboardPanel>
</template>
