<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import type { Navigation } from '@turborepo-saas-starter/shared-types/payload-types';

const route = useRoute();
const { isAuthenticated } = useAuth();

// Fetch navigation from Payload CMS
// Note: Using same key as layouts, so we access the shared cache
const { data: siteData } = await useFetch<{
  headerNavigation: Navigation | null;
}>('/api/site-data', {
  key: 'site-data',
});

type NavigationItem = NonNullable<Navigation['items']>[0];

/**
 * Transform Payload navigation item to UNavigationMenu format
 */
function transformNavigationItem(item: NavigationItem): NavigationMenuItem {
  let to: string | undefined;
  let active: boolean | undefined;

  // Determine URL based on type
  if (item.type === 'url' && item.url) {
    to = item.url;
  } else if (item.type === 'page' && item.page) {
    // Handle both object and ID reference
    const page = typeof item.page === 'object' ? item.page : null;
    if (page?.permalink) {
      to = page.permalink;
      active = route.path === page.permalink || route.path.startsWith(`${page.permalink}/`);
    }
  } else if (item.type === 'post' && item.post) {
    // Handle both object and ID reference
    const post = typeof item.post === 'object' ? item.post : null;
    if (post?.slug) {
      to = `/blog/${post.slug}`;
      active = route.path === `/blog/${post.slug}`;
    }
  }

  const menuItem: NavigationMenuItem = {
    label: item.label,
    ...(to && { to }),
    ...(active !== undefined && { active }),
    ...(item.badge?.label && {
      badge: {
        label: item.badge.label,
        color: (item.badge.color || 'primary') as
          | 'primary'
          | 'success'
          | 'warning'
          | 'error'
          | 'info',
      },
    }),
  };

  // Handle nested children
  if (item.children && item.children.length > 0) {
    menuItem.children = item.children.map((child: NavigationItem) =>
      transformNavigationItem(child)
    );
  }

  return menuItem;
}

// Transform Payload navigation to UNavigationMenu format
const items = computed<NavigationMenuItem[]>(() => {
  const navigation = siteData.value?.headerNavigation;

  if (!navigation?.items || !Array.isArray(navigation.items)) {
    // Fallback to empty array if navigation is not available
    return [];
  }

  return navigation.items.map((item: NavigationItem) => transformNavigationItem(item));
});

const headerUI = computed(() => ({
  container: 'max-w-none flex items-center justify-between gap-3 h-full',
}));
// Inject the sidebar open state from the layout
const collapsed = inject<Ref<boolean>>('sidebarCollapse', ref(false));
const slideoverOpen = inject<Ref<boolean>>('slideoverOpen', ref(false));

// Toggle function
const toggleSidebar = () => {
  collapsed.value = !collapsed.value;
};

const _toggleSlideover = () => {
  slideoverOpen.value = !slideoverOpen.value;
};
</script>

<template>
  <UHeader :ui="{ ...headerUI, right: 'gap-4' }">
    <template #left>
      <UButton
        v-if="isAuthenticated"
        icon="tabler:menu-2"
        color="neutral"
        variant="ghost"
        square
        class="flex ml-[-8px]"
        @click="toggleSidebar"
      />
      <NuxtLink to="/">
        <LogoPro class="w-auto h-6 shrink-0 ml-2" />
      </NuxtLink>
      <!-- <TemplateMenu /> -->
    </template>
    <UContentSearchButton
      v-if="isAuthenticated"
      :collapsed="false"
      class="w-full min-w-[480px]"
      variant="subtle"
      icon="tabler:search"
    />
    <UNavigationMenu v-else :items="items" variant="link" />

    <template v-if="!isAuthenticated" #right>
      <!-- <UColorModeButton /> -->

      <UButton
        icon="tabler:door-exit"
        color="neutral"
        variant="ghost"
        to="/login"
        class="lg:hidden"
      />

      <UButton
        label="Sign in"
        color="neutral"
        variant="outline"
        to="/login"
        class="hidden lg:inline-flex"
      />

      <UButton
        label="Sign up"
        color="neutral"
        trailing-icon="tabler:arrow-right"
        class="hidden lg:inline-flex"
        to="/signup"
      />
    </template>
    <template v-else #right>
      <UPopover>
        <UButton
          label="Create"
          color="neutral"
          variant="subtle"
          icon="tabler:plus"
          class="rounded-full"
        />

        <!-- <template #content>
          <Placeholder class="size-48 m-4 inline-flex" />
        </template> -->
      </UPopover>
      <UPopover
        arrow
        :content="{
          align: 'end',
          side: 'bottom',
          sideOffset: 0,
        }"
      >
        <UButton icon="tabler:bell" color="neutral" variant="ghost" class="rounded-full" />
        <template #content>
          <UPageList divide>
            <UPageCard variant="ghost">
              <template #body />
            </UPageCard>
          </UPageList>
        </template>
      </UPopover>

      <UserMenu :collapsed="true" />
    </template>
    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />

      <USeparator class="my-6" />

      <UButton label="Sign in" color="neutral" variant="subtle" to="/login" block class="mb-3" />
      <UButton label="Sign up" color="neutral" to="/signup" block />
    </template>
  </UHeader>
</template>
