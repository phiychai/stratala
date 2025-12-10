<script setup lang="ts">
const {
  data: siteData,
  error: siteError,
  refresh,
} = await useFetch('/api/site-data', {
  key: 'site-data',
});

const { isVisualEditingEnabled, apply } = useVisualEditing();
const { isAuthenticated } = useAuth();
const route = useRoute();
const navigation = useTemplateRef('navigationRef');
const footer = useTemplateRef('footerRef');

if (siteError.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Failed to load site data. Please try again later.',
    fatal: true,
  });
}

useHead({
  style: [
    {
      id: 'accent-color',
      innerHTML: `:root { --accent-color: ${unref(siteData)?.globals.accent_color || '#6644ff'} !important; }`,
    },
  ],
  bodyAttrs: {
    class: 'antialiased font-sans',
  },
});

useSeoMeta({
  titleTemplate: `%s / ${unref(siteData)?.globals.title}`,
  ogSiteName: unref(siteData)?.globals.title,
});
// Dashboard sidebar links (only used when authenticated)
const open = ref(false);
const collapsed = ref(false);
const slideoverOpen = ref(false);
provide('sidebarCollapse', collapsed);
provide('slideoverOpen', slideoverOpen);

defineShortcuts({
  o: () => (open.value = !open.value),
});

const { links } = useAdminNavigation({
  closeSidebar: () => {
    open.value = false;
  },
});

onMounted(() => {
  if (!isVisualEditingEnabled.value) return;

  const elements = [navigation.value, footer.value].filter((el) => el !== null) as HTMLElement[];

  apply({
    elements,
    onSaved: () => {
      refresh();
    },
  });
});
</script>

<template>
  <div>
    <div ref="navigationRef">
      <AppHeader />
    </div>
    <!-- Dashboard Layout (Authenticated) -->
    <template v-if="isAuthenticated">
      <UDashboardGroup unit="rem" style="margin-top: 56px">
        <UDashboardSidebar
          v-if="!collapsed"
          id="default"
          resizable
          :style="{ minHeight: 'calc(100vh - 56px)' }"
          class="bg-elevated/25"
          :ui="{ footer: 'lg:border-t lg:border-default' }"
          :collapsed="collapsed"
          collapsible
          :collapsed-size="4.5"
          :default-size="20"
        >
          <template #default="{ collapsed: isSidebarCollapsed }">
            <UNavigationMenu
              :collapsed="isSidebarCollapsed"
              :items="links[0]"
              orientation="vertical"
              tooltip
              popover
              color="neutral"
            />

            <UNavigationMenu
              :collapsed="isSidebarCollapsed"
              :items="links[1]"
              orientation="vertical"
              tooltip
              class="mt-auto"
            />
          </template>
        </UDashboardSidebar>

        <slot />

        <NotificationsSlideover />
      </UDashboardGroup>
    </template>
    <!-- Default Layout (Anonymous) -->
    <template v-else>
      <UMain>
        <slot />
      </UMain>
      <div ref="footerRef">
        <AppFooter />
      </div>
    </template>
  </div>
</template>
