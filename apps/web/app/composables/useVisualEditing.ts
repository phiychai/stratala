import type { ApplyOptions } from '~/types/composables';

/**
 * Visual Editing composable for Payload CMS
 *
 * Note: Payload has preview mode for content preview.
 * This composable may need custom implementation or integration with Payload's preview mode.
 */
export default function useVisualEditing() {
  // Use useState for state that persists across navigation
  const isVisualEditingEnabled = useState('visual-editing-enabled', () => false);
  const route = useRoute();
  const {
    public: { enableVisualEditing },
  } = useRuntimeConfig();

  // Check query param on composable initialization.
  if (route.query['visual-editing'] === 'true' && enableVisualEditing) {
    isVisualEditingEnabled.value = true;
  } else if (route.query['visual-editing'] === 'false') {
    isVisualEditingEnabled.value = false;
  }

  const apply = (options: Pick<ApplyOptions, 'elements' | 'onSaved' | 'customClass'>) => {
    if (!isVisualEditingEnabled.value) return;
    // TODO: Implement visual editing for Payload
    // Payload doesn't have built-in visual editing, so this would need custom implementation
    console.warn('Visual editing not yet implemented for Payload CMS');
  };

  const setAttr = (element: HTMLElement, key: string, value: string) => {
    if (!isVisualEditingEnabled.value) return;
    element.setAttribute(key, value);
  };

  return {
    isVisualEditingEnabled,
    apply,
    setAttr,
  };
}
