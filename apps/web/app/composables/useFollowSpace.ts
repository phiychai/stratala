/**
 * Composable for following/unfollowing spaces
 */
export function useFollowSpace() {
  const isFollowing = ref<Record<string, boolean>>({});
  const loading = ref<Record<string, boolean>>({});

  /**
   * Check if user is following a space
   */
  async function checkFollowStatus(spaceId: string): Promise<boolean> {
    try {
      const data = await $fetch<{ isFollowing: boolean }>(`/api/spaces/${spaceId}/follow`);
      isFollowing.value[spaceId] = data.isFollowing;
      return data.isFollowing;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }

  /**
   * Follow a space
   */
  async function followSpace(spaceId: string): Promise<boolean> {
    if (loading.value[spaceId]) return false;

    loading.value[spaceId] = true;
    try {
      await $fetch(`/api/spaces/${spaceId}/follow`, {
        method: 'POST',
      });
      isFollowing.value[spaceId] = true;
      return true;
    } catch (error) {
      console.error('Error following space:', error);
      return false;
    } finally {
      loading.value[spaceId] = false;
    }
  }

  /**
   * Unfollow a space
   */
  async function unfollowSpace(spaceId: string): Promise<boolean> {
    if (loading.value[spaceId]) return false;

    loading.value[spaceId] = true;
    try {
      await $fetch(`/api/spaces/${spaceId}/follow`, {
        method: 'DELETE',
      });
      isFollowing.value[spaceId] = false;
      return true;
    } catch (error) {
      console.error('Error unfollowing space:', error);
      return false;
    } finally {
      loading.value[spaceId] = false;
    }
  }

  /**
   * Toggle follow status
   */
  async function toggleFollow(spaceId: string): Promise<boolean> {
    const currentlyFollowing = isFollowing.value[spaceId] ?? false;
    return await (currentlyFollowing ? unfollowSpace(spaceId) : followSpace(spaceId));
  }

  return {
    isFollowing: computed(() => isFollowing.value),
    loading: computed(() => loading.value),
    checkFollowStatus,
    followSpace,
    unfollowSpace,
    toggleFollow,
  };
}
