<script setup lang="ts">
import type { ProseProps } from '~/types/components';
import { lexicalToHtml, isLexicalContent } from '~/utils/lexicalToHtml';

const props = withDefaults(defineProps<ProseProps>(), {
  size: 'md',
});
const contentEl = ref<HTMLElement | null>(null);

// Use a ref to store markdown content for better reactivity
const markdownContent = ref<string | null>(null);
const useConvertedMarkdown = ref(false);

// Create a reactive key that changes when content or markdown changes
const mdcKey = computed(() => {
  // Include both content and markdownContent in the key to force re-render
  const contentHash = props.content ? JSON.stringify(props.content).slice(0, 50) : 'empty';
  const markdownHash = markdownContent.value ? markdownContent.value.slice(0, 50) : 'no-md';
  return `mdc-${contentHash}-${markdownHash}`;
});

// Convert Lexical content to Markdown reactively
const updateMarkdownContent = () => {
  if (!props.content) {
    markdownContent.value = null;
    useConvertedMarkdown.value = false;
    return;
  }

  // Check if content is Lexical format
  if (isLexicalContent(props.content)) {
    // Convert Lexical to Markdown for MDC
    try {
      markdownContent.value = lexicalToHtml(props.content);
      useConvertedMarkdown.value = true;
    } catch (error) {
      console.warn('Failed to convert Lexical content:', error);
      markdownContent.value = null;
      useConvertedMarkdown.value = false;
    }
  } else {
    // Otherwise, use original content (already markdown)
    markdownContent.value = null;
    useConvertedMarkdown.value = false;
  }
};

// Watch content deeply to catch nested changes (like images being populated)
watch(
  () => props.content,
  (newContent, oldContent) => {
    // Only update if content actually changed
    if (newContent !== oldContent) {
      // Use nextTick to ensure any nested data (like images) is fully loaded
      nextTick(() => {
        updateMarkdownContent();
      });
    }
  },
  { deep: true, immediate: true }
);

// Also watch markdownContent to ensure reactivity
watch(markdownContent, () => {
  // The key will change automatically, forcing MDC to re-render
});

onMounted(() => {
  const config = useRuntimeConfig();
  if (!contentEl.value) return;

  const anchors = Array.from(contentEl.value.getElementsByTagName('a'));

  for (const anchor of anchors) {
    const href = anchor.getAttribute('href');
    if (!href) continue;

    const url = new URL(href, window.location.origin);
    const isLocal = url.hostname === config.public.siteUrl;

    if (isLocal) {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo({
          path: url.pathname,
          hash: url.hash,
          query: Object.fromEntries(url.searchParams.entries()),
        });
      });
    } else {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    }
  }
});

// Re-run anchor setup when content changes
watch(
  () => props.content,
  () => {
    nextTick(() => {
      if (!contentEl.value) return;
      const config = useRuntimeConfig();
      const anchors = Array.from(contentEl.value.getElementsByTagName('a'));

      for (const anchor of anchors) {
        const href = anchor.getAttribute('href');
        if (!href) continue;

        const url = new URL(href, window.location.origin);
        const isLocal = url.hostname === config.public.siteUrl;

        if (isLocal) {
          anchor.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo({
              path: url.pathname,
              hash: url.hash,
              query: Object.fromEntries(url.searchParams.entries()),
            });
          });
        } else {
          anchor.setAttribute('target', '_blank');
          anchor.setAttribute('rel', 'noopener noreferrer');
        }
      }
    });
  }
);
</script>

<template>
  <div ref="contentEl">
    <!-- Render Markdown content (converted from Lexical or original) -->
    <MDC
      v-if="content && (useConvertedMarkdown ? markdownContent : content)"
      :key="`${mdcKey}-${useConvertedMarkdown ? markdownContent?.length || 0 : content?.length || 0}`"
      :value="useConvertedMarkdown ? markdownContent : content"
      :class="[
        'prose dark:prose-invert max-w-none',
        {
          'prose-sm': size === 'sm',
          'md:prose-base lg:prose-lg': size === 'md',
          'prose-lg lg:prose-xl': size === 'lg',
        },
      ]"
    />
    <div v-else class="text-muted italic">No content available</div>
  </div>
</template>
