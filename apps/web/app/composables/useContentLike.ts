/**
 * Composable for liking/unliking content
 */
export function useContentLike() {
  const likes = ref<Record<string, { count: number; isLiked: boolean }>>({});
  const loading = ref<Record<string, boolean>>({});

  /**
   * Get like status for content
   */
  async function getLikeStatus(
    type: 'post' | 'video',
    id: string | number
  ): Promise<{ count: number; isLiked: boolean }> {
    const contentId = String(id);
    const likeKey = `${type}-${contentId}`;

    try {
      const data = await $fetch<{ count: number; isLiked: boolean }>(
        `/api/content/${type}/${contentId}/like`
      );
      likes.value[likeKey] = data;
      return data;
    } catch (error) {
      console.error('Error getting like status:', error);
      return { count: 0, isLiked: false };
    }
  }

  /**
   * Like content
   */
  async function likeContent(type: 'post' | 'video', id: string | number): Promise<boolean> {
    const contentId = String(id);
    const likeKey = `${type}-${contentId}`;

    if (loading.value[likeKey]) return false;

    loading.value[likeKey] = true;
    try {
      await $fetch(`/api/content/${type}/${contentId}/like`, {
        method: 'POST',
      });

      // Update local state
      likes.value[likeKey] = likes.value[likeKey]
        ? {
            count: likes.value[likeKey].count + 1,
            isLiked: true,
          }
        : {
            count: 1,
            isLiked: true,
          };
      return true;
    } catch (error) {
      console.error('Error liking content:', error);
      return false;
    } finally {
      loading.value[likeKey] = false;
    }
  }

  /**
   * Unlike content
   */
  async function unlikeContent(type: 'post' | 'video', id: string | number): Promise<boolean> {
    const contentId = String(id);
    const likeKey = `${type}-${contentId}`;

    if (loading.value[likeKey]) return false;

    loading.value[likeKey] = true;
    try {
      await $fetch(`/api/content/${type}/${contentId}/like`, {
        method: 'DELETE',
      });

      // Update local state
      if (likes.value[likeKey]) {
        likes.value[likeKey] = {
          count: Math.max(0, likes.value[likeKey].count - 1),
          isLiked: false,
        };
      }
      return true;
    } catch (error) {
      console.error('Error unliking content:', error);
      return false;
    } finally {
      loading.value[likeKey] = false;
    }
  }

  /**
   * Toggle like status
   */
  async function toggleLike(type: 'post' | 'video', id: string | number): Promise<boolean> {
    const contentId = String(id);
    const likeKey = `${type}-${contentId}`;
    const currentlyLiked = likes.value[likeKey]?.isLiked ?? false;

    return await (currentlyLiked ? unlikeContent(type, id) : likeContent(type, id));
  }

  /**
   * Check if content is liked
   */
  function isLiked(type: 'post' | 'video', id: string | number): boolean {
    const contentId = String(id);
    const likeKey = `${type}-${contentId}`;
    return likes.value[likeKey]?.isLiked ?? false;
  }

  /**
   * Get like count
   */
  function getLikeCount(type: 'post' | 'video', id: string | number): number {
    const contentId = String(id);
    const likeKey = `${type}-${contentId}`;
    return likes.value[likeKey]?.count ?? 0;
  }

  return {
    likes: computed(() => likes.value),
    loading: computed(() => loading.value),
    getLikeStatus,
    likeContent,
    unlikeContent,
    toggleLike,
    isLiked,
    getLikeCount,
  };
}
