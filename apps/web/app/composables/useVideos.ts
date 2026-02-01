import type { Video } from '@stratala/shared-types';

export interface UseVideosOptions {
  limit?: number;
  page?: number;
  category?: string;
  key?: string;
}

export interface UseVideosReturn {
  videos: Ref<Video[]>;
  count: Ref<number>;
  totalPages: ComputedRef<number>;
  error: Ref<Error | null>;
  currentPage: Ref<number>;
  perPage: number;
  selectedCategory: ComputedRef<string | undefined>;
  handlePageChange: (page: number) => void;
  handleCategoryChange: (category: string | undefined) => void;
}

/**
 * Composable for fetching and managing videos with pagination and category filtering
 */
export function useVideos(options: UseVideosOptions = {}): UseVideosReturn {
  const route = useRoute();
  const router = useRouter();

  const perPage = options.limit || 12;
  const currentPage = ref(options.page || Number(route.query.page) || 1);
  const selectedCategory = computed(
    () => options.category || (route.query.category as string) || undefined
  );

  // Generate cache key dynamically based on current values
  const getCacheKey = () =>
    options.key
      ? `${options.key}-${currentPage.value}-${selectedCategory.value || 'all'}`
      : `videos-${route.path}-${currentPage.value}-${selectedCategory.value || 'all'}`;

  const { data: videosData, error } = useFetch<{
    videos: Video[];
    count: number;
  }>('/api/videos', {
    key: getCacheKey,
    query: {
      page: currentPage,
      limit: perPage,
      category: selectedCategory.value,
    },
    watch: [currentPage, selectedCategory],
    onResponseError({ response }) {
      console.error('Error fetching videos:', response.status, response.statusText, response._data);
    },
  });

  const videos = computed(() => videosData.value?.videos || []);
  const count = computed(() => videosData.value?.count || 0);
  const totalPages = computed(() => Math.ceil(count.value / perPage));

  function handlePageChange(page: number) {
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
      currentPage.value = page;
      router.push({ query: { ...route.query, page } });
    }
  }

  function handleCategoryChange(category: string | undefined) {
    router.push({
      path: route.path,
      query: {
        ...route.query,
        category,
        page: 1, // Reset to first page when filtering
      },
    });
  }

  return {
    videos,
    count,
    totalPages,
    error: error as Ref<Error | null>,
    currentPage,
    perPage,
    selectedCategory,
    handlePageChange,
    handleCategoryChange,
  };
}

