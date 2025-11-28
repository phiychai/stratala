<script setup lang="ts">
/**
 * Posts - Migrated to Nuxt UI
 * Uses composables for posts, categories, and image transformation
 */
import { formatDistanceToNow } from 'date-fns';
import type { PostsProps } from '~/types/components';
import { usePosts } from '~/composables/usePosts';
import { usePostCategories } from '~/composables/usePostCategories';
import { usePostTransform } from '~/composables/usePostTransform';

const props = defineProps<PostsProps>();

// Use posts composable for fetching and pagination
const { posts, error } = usePosts({
  limit: props.data.limit || 12,
  key: `block-posts-${useRoute().path}-${props.data?.id || 'default'}`,
});

// Use categories composable
const { menuItems: items } = usePostCategories(posts);

// Transform posts to include image URLs and formatted authors
const { transformPosts } = usePostTransform();
const postsWithImageUrls = computed(() => transformPosts(posts.value));

const feedOrientation = ref<'vertical' | 'horizontal'>('horizontal');
</script>
<template>
  <UDashboardNavbar :ui="{ right: 'gap-3' }" class="border-b-0">
    <template #left> <UNavigationMenu :items="items" color="neutral" /></template>
  </UDashboardNavbar>
  <UContainer ref="articleContentRef" class="max-w-none overflow-auto pt-4">
    <!-- Show error if posts failed to load -->
    <div v-if="error" class="flex items-center justify-center py-12">
      <UAlert
        color="error"
        variant="soft"
        title="Error loading posts"
        :description="error.message || 'Failed to fetch posts'"
      />
    </div>
    <!-- Show empty state if no posts -->
    <div v-else-if="postsWithImageUrls.length === 0" class="flex items-center justify-center py-12">
      <UAlert
        color="neutral"
        variant="soft"
        title="No posts found"
        description="There are no published posts available at this time."
      />
    </div>
    <!-- Show posts -->
    <UBlogPosts v-else :orientation="feedOrientation">
      <UBlogPost
        v-for="(post, index) in postsWithImageUrls"
        :key="post.id"
        :to="`/blog/${post.slug}`"
        :title="post.title"
        :description="post.description || undefined"
        v-bind="post.imageUrl ? { image: post.imageUrl } : {}"
        :date="
          post.published_at
            ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true })
            : undefined
        "
        :authors="
          post.author && typeof post.author === 'object'
            ? [
                {
                  name: `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim(),
                  avatar: post.author.avatar, // Use the already-transformed value
                },
              ]
            : undefined
        "
        :badge="
          post.categories && post.categories.length > 0 && post.categories[0]
            ? {
                label:
                  typeof post.categories[0] === 'string'
                    ? post.categories[0]
                    : typeof post.categories[0] === 'object' &&
                        post.categories[0] !== null &&
                        'title' in post.categories[0]
                      ? String((post.categories[0] as { title?: string }).title || '')
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
