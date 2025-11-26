<script setup lang="ts">
/**
 * Posts - Migrated to Nuxt UI
 * Uses UPagination for pagination controls
 */
import { formatDistanceToNow } from 'date-fns';
import type { Post } from '@turborepo-saas-starter/shared-types';
import type { PostsProps } from '~/types/components';

const props = defineProps<PostsProps>();

const route = useRoute();
const router = useRouter();

const perPage = props.data.limit || 12;
const currentPage = ref(Number(route.query.page) || 1);

const selectedCategory = computed(() => (route.query.category as string) || undefined);

const { data: postsData, error } = await useFetch<{
  posts: Post[];
  count: number;
}>('/api/posts', {
  key: `block-posts-${route.path}-${props.data?.id || 'default'}-${currentPage.value}-${selectedCategory.value || 'all'}`,
  query: {
    page: currentPage,
    limit: perPage,
    category: selectedCategory.value,
  },
  watch: [currentPage, selectedCategory],
  onResponseError({ response }) {
    console.error('Error fetching posts:', response.status, response.statusText, response._data);
  },
});

const posts = computed(() => postsData.value?.posts || []);
const totalPages = computed(() => Math.ceil((postsData.value?.count || 0) / perPage));

function handlePageChange(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    router.push({ query: { page } });
  }
}

// Fetch all categories for navigation menu
const { data: categoriesData, error: categoriesError } = await useFetch<{
  categories: Array<{ id: string; name: string; slug: string }>;
}>('/api/posts/categories', {
  key: 'posts-categories',
  onResponseError({ response }) {
    console.error(
      'Error fetching categories:',
      response.status,
      response.statusText,
      response._data
    );
  },
});

// Fallback: Extract unique categories from posts if categories API fails
const categoriesFromPosts = computed(() => {
  if (categoriesData.value?.categories && categoriesData.value.categories.length > 0) {
    return categoriesData.value.categories;
  }

  // Extract categories from posts categories field as fallback
  const categoryMap = new Map<string, { id: string; name: string; slug: string }>();

  if (posts.value) {
    posts.value.forEach((post) => {
      if (post.categories) {
        const postCategories = Array.isArray(post.categories) ? post.categories : [];
        postCategories.forEach((cat) => {
          if (typeof cat === 'string') {
            // If it's a string, create a category from it
            const slug = cat.toLowerCase().replace(/\s+/g, '-');
            if (!categoryMap.has(slug)) {
              categoryMap.set(slug, {
                id: slug,
                name: cat,
                slug,
              });
            }
          } else if (typeof cat === 'object' && cat !== null) {
            // Handle PostsCategory type (id can be number or string)
            const catId = typeof cat.id === 'number' ? String(cat.id) : String(cat.id || '');
            const catTitle = 'title' in cat ? String(cat.title || '') : '';
            const category = {
              id: catId,
              name: catTitle,
              slug:
                'slug' in cat && cat.slug
                  ? String(cat.slug)
                  : catTitle.toLowerCase().replace(/\s+/g, '-'),
            };
            if (category.id && category.name && !categoryMap.has(category.id)) {
              categoryMap.set(category.id, category);
            }
          }
        });
      }
    });
  }

  return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
});

// Debug: Log categories data
watch(
  [categoriesData, categoriesFromPosts],
  ([data, fromPosts]) => {
    console.log('Categories from API:', data?.categories?.length || 0);
    console.log('Categories from posts:', fromPosts.length);
  },
  { immediate: true }
);

// Function to handle category filter clicks
function handleCategoryClick(categorySlug: string | undefined) {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      category: categorySlug,
      page: 1, // Reset to first page when filtering
    },
  });
}

// Create navigation menu items from categories
const items = computed(() => {
  const menuItems: Array<{
    label: string;
    active: boolean;
    click: () => void;
  }> = [
    {
      label: 'All',
      active: !route.query.category,
      click: () => handleCategoryClick(undefined),
    },
  ];

  // Use categories from API if available, otherwise use categories extracted from posts
  const categoriesToUse = categoriesFromPosts.value;

  if (categoriesToUse && categoriesToUse.length > 0) {
    const categoryItems = categoriesToUse.map((category) => ({
      label: category.name,
      active: route.query.category === category.slug,
      click: () => handleCategoryClick(category.slug),
    }));

    menuItems.push(...categoryItems);
  }

  return menuItems;
});

const {
  public: { payloadUrl },
} = useRuntimeConfig();

// Helper function to convert Payload media to URL
function getImageUrl(
  image: number | { id: number; url?: string | null; filename?: string | null } | null | undefined
): string | undefined {
  if (!image) return undefined;

  // If it's a Payload Media object with a url property, use it directly (best case - populated with depth)
  if (typeof image === 'object' && 'url' in image && image.url) {
    return image.url;
  }

  // If it's a Media object with a filename but no url, construct the URL
  if (typeof image === 'object' && 'filename' in image && image.filename) {
    const baseUrl = (payloadUrl as string) || 'http://localhost:3002';
    return `${baseUrl}/api/media/file/${image.filename}`;
  }

  // If it's a Media object with just an id, we need to fetch it or use a fallback
  // For now, return undefined - the image should be populated with depth: 2
  if (typeof image === 'object' && 'id' in image) {
    console.warn(
      'Payload image object missing url/filename, ensure depth: 2 is used when fetching posts'
    );
    return undefined;
  }

  // If it's just a number (ID), we can't construct URL without filename
  // This shouldn't happen if depth: 2 is used, but handle gracefully
  if (typeof image === 'number') {
    console.warn('Payload image is just an ID, ensure depth: 2 is used when fetching posts');
    return undefined;
  }

  return undefined;
}

// Transform posts to include image URLs and properly formatted authors
const postsWithImageUrls = computed(() =>
  posts.value.map((post) => {
    // Handle Payload image format (number ID or Media object)
    const imageUrl = getImageUrl(
      typeof post.image === 'object' && post.image !== null
        ? post.image
        : typeof post.image === 'number'
          ? post.image
          : null
    );
    const author = post.author && typeof post.author === 'object' ? post.author : null;
    // Author avatar might be in a different format, handle accordingly
    const authorAvatarUrl =
      author && 'avatar' in author ? getImageUrl(author.avatar as any) : undefined;

    return {
      ...post,
      // Only include imageUrl if it's a valid string (not undefined or empty)
      ...(imageUrl ? { imageUrl } : {}),
      author: author
        ? {
            ...author,
            avatar: authorAvatarUrl
              ? {
                  src: authorAvatarUrl,
                  alt: `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Author',
                }
              : undefined,
          }
        : undefined,
    };
  })
);
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
          post.categories && post.categories.length > 0
            ? {
                label:
                  post.categories && post.categories.length > 0 && post.categories[0]
                    ? typeof post.categories[0] === 'string'
                      ? post.categories[0]
                      : 'title' in post.categories[0]
                        ? String(post.categories[0].title || '')
                        : ''
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
