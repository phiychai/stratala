/**
 * Composable for tracking content views
 */
export function useContentView() {
  const trackedViews = ref<Set<string>>(new Set());

  /**
   * Track a view for content
   */
  async function trackView(type: 'post' | 'video', id: string | number): Promise<void> {
    const contentId = String(id);
    const viewKey = `${type}-${contentId}`;

    // Don't track the same view twice in the same session
    if (trackedViews.value.has(viewKey)) {
      return;
    }

    try {
      await $fetch(`/api/content/${type}/${contentId}/view`, {
        method: 'POST',
      });
      trackedViews.value.add(viewKey);
    } catch (error) {
      // Silently fail - view tracking shouldn't break the page
      console.error('Error tracking view:', error);
    }
  }

  return {
    trackView,
  };
}
