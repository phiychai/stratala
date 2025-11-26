<script setup lang="ts">
import { getPayloadAssetURL } from '@@/server/utils/payload-utils';
import { watch, ref, computed } from 'vue';
import type { DirectusImageProps } from '~/types/components';
import type { Media } from '@turborepo-saas-starter/shared-types';

const props = withDefaults(defineProps<DirectusImageProps>(), {
  width: undefined,
  height: undefined,
});

// Extract UUID/ID/filename from props.uuid - can be string, number, or Media object
const imageId = computed(() => {
  if (!props.uuid) return null;

  // If it's already a string, use it (could be UUID, filename, or URL)
  if (typeof props.uuid === 'string') {
    return props.uuid;
  }

  // If it's a number, convert to string (Payload Media ID)
  if (typeof props.uuid === 'number') {
    return String(props.uuid);
  }

  // If it's a Media object, extract the URL, filename, or ID
  if (typeof props.uuid === 'object' && props.uuid !== null) {
    const media = props.uuid as Media;
    // Prefer URL if available (already full URL)
    if (media.url) {
      return media.url;
    }
    // Otherwise use filename if available
    if (media.filename) {
      return media.filename;
    }
    // Fall back to ID
    if ('id' in media && media.id !== undefined) {
      return String(media.id);
    }
  }

  return null;
});

const src = computed(() => {
  const id = imageId.value;
  if (!id) return '';

  // If it's already a full URL, return it directly
  if (typeof id === 'string' && (id.startsWith('http://') || id.startsWith('https://'))) {
    return id;
  }

  // Otherwise, use getPayloadAssetURL to construct the URL
  return getPayloadAssetURL(id);
});
</script>

<template>
  <img :src="src" v-bind="{ ...props, uuid: undefined }" />
</template>
