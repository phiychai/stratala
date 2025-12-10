<script setup lang="ts">
import type { PageBuilderProps } from '~/types/components';

const props = defineProps<PageBuilderProps>();

// Map Payload blockType to collection name
const blockTypeToCollection: Record<string, string> = {
  hero: 'block_hero',
  richtext: 'block_richtext',
  gallery: 'block_gallery',
  pricing: 'block_pricing',
  posts: 'block_posts',
  form: 'block_form',
};

// Transform Payload blocks to PageBuilder format
const validBlocks = computed(() =>
  props.sections
    .map((block) => {
      // If block already has collection (legacy format), use as-is
      if ('collection' in block && typeof block === 'object' && block !== null) {
        return block as unknown as {
          collection:
            | 'block_hero'
            | 'block_richtext'
            | 'block_gallery'
            | 'block_pricing'
            | 'block_posts'
            | 'block_form';
          item: object;
          id?: string | null;
          background?: string | null;
        };
      }

      // Payload format: has blockType, fields are direct properties
      if ('blockType' in block && typeof block === 'object' && block !== null) {
        const payloadBlock = block as {
          blockType?: string;
          id?: string | null;
          blockName?: string | null;
          background?: string | null;
          [key: string]: unknown;
        };

        const { blockType } = payloadBlock;
        const collection = blockType ? blockTypeToCollection[blockType] : null;

        if (!collection) {
          return null;
        }

        // Extract block data (everything except blockType, id, blockName, background)
        const { blockType: _bt, id, blockName: _bn, background, ...blockData } = payloadBlock;

        return {
          id: id || `block-${Date.now()}-${Math.random()}`,
          collection: collection as
            | 'block_hero'
            | 'block_richtext'
            | 'block_gallery'
            | 'block_pricing'
            | 'block_posts'
            | 'block_form',
          item: blockData,
          background: background || null,
        };
      }

      return null;
    })
    .filter(
      (
        block
      ): block is {
        collection:
          | 'block_hero'
          | 'block_richtext'
          | 'block_gallery'
          | 'block_pricing'
          | 'block_posts'
          | 'block_form';
        item: object;
        id?: string | null;
        background?: string | null;
      } => block !== null
    )
);
</script>
<template>
  <div
    v-for="block in validBlocks"
    :key="block.id"
    :data-background="block.background"
    class="flex flex-col"
  >
    <BaseBlock :block="block" />
  </div>
</template>
