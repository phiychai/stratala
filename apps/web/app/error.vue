<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    required: true,
  },
});

const { isAuthenticated } = useAuth();
const route = useRoute();

// Determine error type and appropriate messaging
const statusCode = computed(() => props.error.statusCode || 500);
const is404 = computed(() => statusCode.value === 404);
const is403 = computed(() => statusCode.value === 403);
const is500 = computed(() => statusCode.value === 500);
const isOffline = computed(
  () => props.error.message?.includes('network') || props.error.message?.includes('fetch')
);

// Error messages and icons based on status code
const errorConfig = computed(() => {
  if (is404.value) {
    return {
      title: props.error.statusMessage || 'Page Not Found',
      description:
        props.error.message || "The page you're looking for doesn't exist or has been moved.",
      icon: 'lucide:file-question',
      color: 'muted' as const,
    };
  }
  if (is403.value) {
    return {
      title: props.error.statusMessage || 'Access Forbidden',
      description:
        props.error.message ||
        "You don't have permission to access this page. Please contact an administrator if you believe this is an error.",
      icon: 'lucide:shield-x',
      color: 'error' as const,
    };
  }
  if (is500.value || isOffline.value) {
    return {
      title: props.error.statusMessage || 'Server Error',
      description:
        props.error.message || 'Something went wrong on our end. Please try again later.',
      icon: 'lucide:alert-circle',
      color: 'warning' as const,
    };
  }
  return {
    title: props.error.statusMessage || 'An Error Occurred',
    description: props.error.message || 'Something unexpected happened. Please try again.',
    icon: 'lucide:alert-triangle',
    color: 'warning' as const,
  };
});

// SEO meta tags
const pageTitle = computed(() => {
  if (is404.value) return 'Page Not Found';
  if (is403.value) return 'Access Forbidden';
  if (is500.value) return 'Server Error';
  return 'Error';
});

useHead({
  htmlAttrs: {
    lang: 'en',
  },
});

useSeoMeta({
  title: pageTitle.value,
  description: errorConfig.value.description,
  robots: 'noindex, nofollow', // Don't index error pages
});

// Navigation links for unauthenticated users
const links = [
  {
    label: 'Home',
    icon: 'lucide:home',
    to: '/',
  },
  {
    label: 'Docs',
    icon: 'lucide:book',
    to: '/docs',
  },
  {
    label: 'Blog',
    icon: 'lucide:pencil',
    to: '/blog',
  },
];

// Try to load navigation data, but don't fail if it doesn't work
// Only load if authenticated (for search functionality)
const navigation = ref([]);
const files = ref([]);

if (isAuthenticated.value) {
  try {
    const { data: navData } = await useAsyncData(
      'error-navigation',
      () => queryCollectionNavigation('docs'),
      {
        transform: (data) => data.find((item) => item.path === '/docs')?.children || [],
        default: () => [],
      }
    );
    if (navData.value) {
      navigation.value = navData.value;
    }
  } catch {
    // Navigation data not available - that's okay
  }

  try {
    const { data: filesData } = useLazyAsyncData(
      'error-search',
      () => queryCollectionSearchSections('docs'),
      {
        server: false,
        default: () => [],
      }
    );
    if (filesData.value) {
      files.value = filesData.value;
    }
  } catch {
    // Search files not available - that's okay
  }
}

// Handle error clearing
const handleError = () => {
  clearError({ redirect: isAuthenticated.value ? '/home' : '/' });
};
</script>

<template>
  <div>
    <AppHeader />

    <!-- Authenticated users: Use dashboard layout -->
    <template v-if="isAuthenticated">
      <UDashboardGroup unit="rem" style="margin-top: 56px">
        <UDashboardPanel>
          <UContainer>
            <UPage>
              <div
                class="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center py-12 text-center"
              >
                <Icon
                  :name="errorConfig.icon"
                  class="mx-auto mb-6 size-16"
                  :class="{
                    'text-muted': errorConfig.color === 'muted',
                    'text-warning': errorConfig.color === 'warning',
                    'text-error': errorConfig.color === 'error',
                  }"
                />
                <h1 class="mb-2 text-4xl font-bold tracking-tight">
                  {{ statusCode }}
                </h1>
                <h2 class="mb-4 text-2xl font-semibold">
                  {{ errorConfig.title }}
                </h2>
                <p class="mb-8 max-w-md text-muted">
                  {{ errorConfig.description }}
                </p>
                <div class="flex flex-wrap gap-4 justify-center">
                  <UButton
                    :to="isAuthenticated ? '/home' : '/'"
                    color="primary"
                    size="lg"
                    @click="handleError"
                  >
                    Go to Home
                  </UButton>
                  <UButton v-if="is404" to="/explore" color="neutral" variant="outline" size="lg">
                    Browse Content
                  </UButton>
                  <UButton
                    v-else
                    color="neutral"
                    variant="outline"
                    size="lg"
                    @click="() => window.location.reload()"
                  >
                    Try Again
                  </UButton>
                </div>
              </div>
            </UPage>
          </UContainer>
        </UDashboardPanel>
      </UDashboardGroup>
    </template>

    <!-- Unauthenticated users: Use default layout -->
    <template v-else>
      <UMain>
        <UContainer>
          <UPage>
            <div
              class="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center py-12 text-center"
            >
              <Icon
                :name="errorConfig.icon"
                class="mx-auto mb-6 size-16"
                :class="{
                  'text-muted': errorConfig.color === 'muted',
                  'text-warning': errorConfig.color === 'warning',
                  'text-error': errorConfig.color === 'error',
                }"
              />
              <h1 class="mb-2 text-4xl font-bold tracking-tight">
                {{ statusCode }}
              </h1>
              <h2 class="mb-4 text-2xl font-semibold">
                {{ errorConfig.title }}
              </h2>
              <p class="mb-8 max-w-md text-muted">
                {{ errorConfig.description }}
              </p>
              <div class="flex flex-wrap gap-4 justify-center">
                <UButton to="/" color="primary" size="lg" @click="handleError">
                  Go to Home
                </UButton>
                <UButton v-if="is404" to="/explore" color="neutral" variant="outline" size="lg">
                  Browse Content
                </UButton>
                <UButton
                  v-else
                  color="neutral"
                  variant="outline"
                  size="lg"
                  @click="() => window.location.reload()"
                >
                  Try Again
                </UButton>
              </div>
            </div>
          </UPage>
        </UContainer>
      </UMain>

      <AppFooter />
    </template>

    <!-- Search functionality (only for authenticated users) -->
    <ClientOnly>
      <LazyUContentSearch
        v-if="isAuthenticated && files.length > 0 && navigation.length > 0"
        :files="files"
        shortcut="meta_k"
        :navigation="navigation"
        :links="links"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>

    <UToaster />
  </div>
</template>
