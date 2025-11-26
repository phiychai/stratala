<script setup lang="ts">
/**
 * FormBlock - Block component for displaying forms (migrated to Nuxt UI)
 * Uses FormBuilder component which now uses Nuxt UI
 */
import type { CustomFormData } from '~/types/components';

defineProps<{ data: CustomFormData }>();
</script>

<template>
  <section v-if="data.form" class="mx-auto">
    <Tagline v-if="data.tagline" :tagline="data.tagline" />

    <Headline v-if="data.headline" :headline="data.headline" />

    <div>
      <FormBuilder :form="data.form" class="mt-8" />
    </div>
  </section>
</template>
