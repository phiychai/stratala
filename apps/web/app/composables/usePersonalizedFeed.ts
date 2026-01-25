import type { UnifiedContent } from '~/types/content';

export interface UsePersonalizedFeedOptions {
  limit?: number;
  page?: number;
  sortBy?: 'chronological' | 'engagement';
  key?: string;
}

export interface UsePersonalizedFeedReturn {
  content: Ref<UnifiedContent[]>;
  count: Ref<number>;
  pending: Ref<boolean>;
  error: Ref<Error | null>;
  currentPage: Ref<number>;
  totalPages: ComputedRef<number>;
  perPage: number;
  sortBy: Ref<'chronological' | 'engagement'>;
  handlePageChange: (page: number) => void;
  handleSortChange: (sort: 'chronological' | 'engagement') => void;
  refresh: () => Promise<void>;
}

/**
 * Composable for fetching personalized feed from followed spaces
 */
export function usePersonalizedFeed(
  options: UsePersonalizedFeedOptions = {}
): UsePersonalizedFeedReturn {
  const route = useRoute();
  const router = useRouter();

  const perPage = options.limit || 20;
  const currentPage = ref(options.page || Number(route.query.page) || 1);
  const sortBy = ref(
    options.sortBy || (route.query.sortBy as 'chronological' | 'engagement') || 'chronological'
  );

  const _cacheKey = options.key || `feed-${currentPage.value}-${sortBy.value}`;

  const {
    data,
    pending,
    error,
    refresh: refreshData,
  } = useFetch<{
    content: UnifiedContent[];
    count: number;
    totalDocs: number;
  }>('/api/feed', {
    key: () => `feed-${currentPage.value}-${sortBy.value}`,
    query: {
      page: currentPage,
      limit: perPage,
      sortBy: sortBy.value,
    },
    watch: [currentPage, sortBy],
    credentials: 'include', // Include cookies for authentication
  });

  const content = computed(() => data.value?.content || []);
  const count = computed(() => data.value?.count || 0);
  const totalPages = computed(() => Math.ceil(count.value / perPage));

  function handlePageChange(page: number) {
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
      currentPage.value = page;
      router.push({ query: { ...route.query, page } });
    }
  }

  function handleSortChange(sort: 'chronological' | 'engagement') {
    sortBy.value = sort;
    currentPage.value = 1;
    router.push({ query: { ...route.query, sortBy: sort, page: 1 } });
  }

  async function refresh() {
    await refreshData();
  }

  return {
    content,
    count,
    pending,
    error: error as Ref<Error | null>,
    currentPage,
    totalPages,
    perPage,
    sortBy,
    handlePageChange,
    handleSortChange,
    refresh,
  };
}
