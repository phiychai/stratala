<script setup lang="ts">
/**
 * RichText - Block component for rich text content (no migration needed)
 * Already uses migrated base components
 */
import Text from '~/components/base/Text.vue';
import type { RichTextProps } from '~/types/components';

withDefaults(defineProps<RichTextProps>(), {
  data: () => ({
    alignment: 'left',
  }),
});
</script>

<template>
  <div
    :class="[
      'mx-auto max-w-[600px] space-y-6',
      {
        'text-center': data.alignment === 'center',
        'text-right': data.alignment === 'right',
        'text-left': data.alignment === 'left',
      },
      data.className,
    ]"
  >
    <Tagline v-if="data.tagline" :tagline="data.tagline" />
    <Headline v-if="data.headline" :headline="data.headline" />
    <Text v-if="data.content" :content="data.content" />
  </div>
</template>
