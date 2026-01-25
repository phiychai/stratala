import type { UnifiedContent } from '~/types/content';

export interface UseTrendingContentOptions {
  type?: 'post' | 'video' | 'all';
  limit?: number;
  key?: string;
}

export interface UseTrendingContentReturn {
  content: Ref<UnifiedContent[]>;
  error: Ref<Error | null>;
  refresh: () => Promise<void>;
}

/**
 * Composable for fetching trending content
 */
export function useTrendingContent(
  options: UseTrendingContentOptions = {}
): UseTrendingContentReturn {
  const { type = 'all', limit = 20, key } = options;

  const cacheKey = key || `trending-${type}-${limit}`;

  const {
    data,
    error,
    refresh: refreshData,
  } = useFetch<{
    content: UnifiedContent[];
    count: number;
  }>('/api/home', {
    key: cacheKey,
    query: {
      type,
      limit,
    },
  });

  const content = computed(() => data.value?.content || []);

  async function refresh() {
    await refreshData();
  }

  return {
    content,
    error: error as Ref<Error | null>,
    refresh,
  };
}
