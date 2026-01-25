<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns';
import type { UnifiedContent } from '~/types/content';
import type { Post, Video } from '@stratala/shared-types';
import type { DropdownMenuItem } from '@nuxt/ui';
import { usePayloadImage } from '~/composables/usePayloadImage';
import { useContentLike } from '~/composables/useContentLike';

const props = defineProps<{
  content: UnifiedContent;
  orientation?: 'horizontal' | 'vertical';
  showActions?: boolean;
}>();

const toast = useToast();
const { getImageUrl } = usePayloadImage();
const { toggleLike, getLikeStatus, isLiked, getLikeCount, loading: likeLoading } = useContentLike();

// Content ID for like/share functionality
const contentId = computed(() => {
  const { content } = props.content;
  return content.id;
});

// Initialize like status on mount (only when actions are shown)
onMounted(async () => {
  if (props.showActions && contentId.value) {
    await getLikeStatus(props.content.type, contentId.value);
  }
});

// Like state
const liked = computed(() => isLiked(props.content.type, contentId.value));
const likeCount = computed(() => getLikeCount(props.content.type, contentId.value));
const isLikeLoading = computed(() => likeLoading.value[`${props.content.type}-${contentId.value}`]);

// Handle like toggle
async function handleLike() {
  if (!contentId.value) return;
  await toggleLike(props.content.type, contentId.value);
}

// Share dropdown items
const shareItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Copy link',
      icon: 'i-lucide-link',
      onSelect: () => copyLink(),
    },
    {
      label: 'Share on X',
      icon: 'i-simple-icons-x',
      onSelect: () => shareToX(),
    },
    {
      label: 'Share on Facebook',
      icon: 'i-simple-icons-facebook',
      onSelect: () => shareToFacebook(),
    },
    {
      label: 'Share on LinkedIn',
      icon: 'i-simple-icons-linkedin',
      onSelect: () => shareToLinkedIn(),
    },
  ],
]);

// Share functions
function getShareUrl() {
  const baseUrl = window.location.origin;
  return `${baseUrl}${link.value}`;
}

function copyLink() {
  navigator.clipboard.writeText(getShareUrl());
  toast.add({
    title: 'Link copied',
    description: 'The link has been copied to your clipboard.',
    icon: 'i-lucide-check',
    color: 'success',
  });
}

function shareToX() {
  const url = encodeURIComponent(getShareUrl());
  const text = encodeURIComponent(props.content.content.title || '');
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareToFacebook() {
  const url = encodeURIComponent(getShareUrl());
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareToLinkedIn() {
  const url = encodeURIComponent(getShareUrl());
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
}

// Get thumbnail/image URL
const thumbnailUrl = computed(() => {
  const { content } = props.content;
  const imageField =
    props.content.type === 'post' ? (content as Post).image : (content as Video).thumbnail;
  return getImageUrl(
    typeof imageField === 'object' && imageField !== null
      ? imageField
      : typeof imageField === 'number'
        ? imageField
        : null
  );
});

// Get author info
const author = computed(() => {
  const { content } = props.content;
  const postOrVideo = content as Post | Video;
  if ('author' in postOrVideo && postOrVideo.author && typeof postOrVideo.author === 'object') {
    return postOrVideo.author;
  }
  return null;
});

const authorName = computed(() => {
  if (!author.value) return '';
  const firstName = author.value.firstName || '';
  const lastName = author.value.lastName || '';
  return `${firstName} ${lastName}`.trim() || 'Unknown';
});

// Get author avatar/image
const authorAvatar = computed(() => {
  if (!author.value) return null;
  const authorObj = author.value as any;
  // Check for various possible avatar/image fields
  return authorObj.avatar || authorObj.image || authorObj.profileImage || null;
});

// Get link
const link = computed(() => {
  const { content } = props.content;
  const postOrVideo = content as Post | Video;
  if ('slug' in postOrVideo && postOrVideo.slug) {
    if (props.content.type === 'post') {
      return `/blog/${postOrVideo.slug}`;
    }
    return `/videos/${postOrVideo.slug}`;
  }
  return '#';
});

// Format published date
const publishedDate = computed(() => {
  const { content } = props.content;
  if (content.publishedAt) {
    return formatDistanceToNow(new Date(content.publishedAt), { addSuffix: true });
  }
  return;
});
</script>

<template>
  <div class="relative group">
    <UBlogPost
      :to="link"
      v-bind="thumbnailUrl ? { image: thumbnailUrl } : {}"
      variant="ghost"
      :orientation="orientation || 'vertical'"
      :ui="{ body: 'p-0' }"
    >
      <template #title>
        <slot name="title">{{ content.content.title }}</slot>
      </template>

      <!-- Body slot - heading + avatar/name/date + video icon on same line -->
      <template #body>
        <div class="text-lg text-pretty font-semibold text-highlighted mb-1">
          <slot name="title">{{ content.content.title }}</slot>
        </div>
        <!-- Title is already rendered by the component -->
        <!-- Author name, date, and video icon on same line -->
        <div class="flex items-center gap-2 text-sm">
          <UAvatar
            :src="typeof authorAvatar === 'string' ? authorAvatar : undefined"
            :alt="authorName"
            variant="flat"
          />
          <span v-if="authorName">{{ authorName }}</span>
          <span v-if="authorName && publishedDate">•</span>
          <span v-if="publishedDate">{{ publishedDate }}</span>
          <span v-if="content.type === 'video'" class="ml-auto text-xs text-gray-500">
            <UIcon name="i-heroicons-play-circle" class="w-4 h-4 inline mr-1" />
            Video
          </span>
        </div>

        <!-- Action bar: Like, Comment, Share (only shown when showActions is true) -->
        <div v-if="showActions" class="flex items-center gap-1 mt-3 pt-3 border-t border-default">
          <!-- Like button -->
          <UButton
            :icon="liked ? 'i-lucide-heart' : 'i-lucide-heart'"
            :color="liked ? 'error' : 'neutral'"
            variant="ghost"
            size="sm"
            :loading="isLikeLoading"
            :class="liked ? 'text-error' : ''"
            @click.prevent="handleLike"
          >
            <template #leading>
              <UIcon
                :name="liked ? 'i-lucide-heart' : 'i-lucide-heart'"
                :class="[liked ? 'fill-current text-error' : '', 'size-4']"
              />
            </template>
            <span v-if="likeCount > 0" class="text-xs">{{ likeCount }}</span>
          </UButton>

          <!-- Comment button -->
          <UButton
            :to="link"
            icon="i-lucide-message-circle"
            color="neutral"
            variant="ghost"
            size="sm"
          >
            <template #leading>
              <UIcon name="i-lucide-message-circle" class="size-4" />
            </template>
          </UButton>

          <!-- Share dropdown -->
          <UDropdownMenu :items="shareItems" :content="{ align: 'start' }">
            <UButton icon="i-lucide-share" color="neutral" variant="ghost" size="sm" @click.prevent>
              <template #leading>
                <UIcon name="i-lucide-share" class="size-4" />
              </template>
            </UButton>
          </UDropdownMenu>
        </div>
      </template>
    </UBlogPost>
    <!-- Video play icon overlay -->
    <div
      v-if="content.type === 'video' && thumbnailUrl"
      class="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors rounded-lg pointer-events-none z-10"
    >
      <UIcon name="i-heroicons-play-circle" class="w-16 h-16 text-white drop-shadow-lg" />
    </div>
  </div>
</template>
