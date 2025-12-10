<script setup lang="ts">
import type { Page, PageBlock } from '@turborepo-saas-starter/shared-types';
import { withLeadingSlash, withoutTrailingSlash } from 'ufo';

const { isAuthenticated } = useAuth();

const route = useRoute();
const { enabled, state } = useLivePreview();
const pageUrl = useRequestURL();
const { isVisualEditingEnabled, apply } = useVisualEditing();

const permalink = withoutTrailingSlash(withLeadingSlash(route.path));

// Redirect authenticated users from root to /home
if (isAuthenticated.value && permalink === '/') {
  await navigateTo('/home');
}

// Exclude @username routes - these are handled by specific pages
// if (route.path.startsWith('/@')) {
//   throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
// }

const {
  data: page,
  error,
  refresh,
} = await useFetch<Page>('/api/pages/one', {
  key: `pages-${permalink}`,
  query: {
    permalink,
    preview: enabled.value ? true : undefined,
    token: enabled.value ? state.token : undefined,
  },
  // Don't throw errors - handle them gracefully with fallback
  onResponseError: ({ response }) => {
    // Log error but don't throw - we'll show fallback UI
    console.warn('Failed to fetch page from CMS:', response.status, response.statusText);
  },
});

// Check if CMS is unavailable or page doesn't exist
const cmsUnavailable = computed(
  () => error.value?.statusCode === 500 // 500 errors indicate CMS is down/unavailable
);

const pageNotFound = computed(() => !page.value && error.value?.statusCode === 404);

const hasPageContent = computed(
  () => page.value && Array.isArray(page.value.blocks) && page.value.blocks.length > 0
);

const pageBlocks = computed(() => (page.value?.blocks as PageBlock[]) || []);

// Throw proper errors to be handled by error.vue
if (cmsUnavailable.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Content Management System Unavailable',
    message:
      "We're having trouble connecting to our content management system. Please try again later.",
    fatal: true,
  });
}

if (pageNotFound.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    message: "The page you're looking for doesn't exist or has been moved.",
    fatal: true,
  });
}

// Page exists but has no content - also treat as 404
if (page.value && !hasPageContent.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    message: "This page exists but doesn't have any content blocks yet.",
    fatal: true,
  });
}

useSeoMeta({
  title: page.value?.seo?.title || page.value?.title || '',
  description: page.value?.seo?.meta_description || '',
  ogTitle: page.value?.seo?.title || page.value?.title || '',
  ogDescription: page.value?.seo?.meta_description || '',
  ogUrl: pageUrl.toString(),
});

// Helper functions for Visual Editing
function applyVisualEditing() {
  apply({
    onSaved: async () => {
      await refresh();
    },
  });
}

function applyVisualEditingButton() {
  apply({
    elements: document.querySelector('#visual-editing-button'),
    customClass: 'visual-editing-button-class',
    onSaved: async () => {
      await refresh();
      // This makes sure the visual editor elements are updated after the page is refreshed. In case you've added new blocks to the page.
      await nextTick();
      applyVisualEditing();
    },
  });
}

onMounted(() => {
  if (!isVisualEditingEnabled.value) return;
  applyVisualEditingButton();
  applyVisualEditing();
});
</script>

<template>
  <!-- Normal Page Content -->
  <PageBuilder v-if="hasPageContent" :sections="pageBlocks" />
</template>
