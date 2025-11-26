<script setup lang="ts">
/**
 * PricingCard - Migrated to Nuxt UI
 * Uses UBadge and UIcon for features
 */
import Button from '../base/BaseButton.vue';
import type { PricingCardProps } from '~/types/components';

defineProps<PricingCardProps>();
</script>

<template>
  <div
    :class="[
      'flex flex-col max-w-[600px] md:min-h-[424px] border rounded-lg p-6',
      card.is_highlighted ? 'border-accent' : 'border-input',
    ]"
  >
    <div class="flex justify-between items-start gap-2 mb-4">
      <h3 class="text-xl font-heading text-foreground">
        {{ card.title }}
      </h3>
      <div class="flex-shrink-0">
        <UBadge
          v-if="card.badge"
          :color="card.is_highlighted ? 'primary' : 'neutral'"
          variant="subtle"
          class="text-xs font-medium uppercase"
        >
          {{ card.badge }}
        </UBadge>
      </div>
    </div>

    <p v-if="card.price" class="text-h2 mt-2 font-semibold">
      {{ card.price }}
    </p>

    <p v-if="card.description" class="text-description mt-2 line-clamp-2">
      {{ card.description }}
    </p>

    <hr class="my-4" />

    <div class="flex-grow">
      <ul v-if="card.features" class="space-y-4">
        <li
          v-for="(feature, index) in card.features"
          :key="index"
          class="flex items-center gap-3 text-regular"
        >
          <UIcon
            name="i-lucide-check-circle"
            class="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-1"
          />
          <p class="leading-relaxed">{{ feature }}</p>
        </li>
      </ul>
    </div>

    <div class="mt-auto pt-4">
      <Button
        v-if="card.button"
        id="card.button.uuid"
        class="w-full"
        :label="card.button.label"
        :variant="card.button.variant"
      />
    </div>
  </div>
</template>
