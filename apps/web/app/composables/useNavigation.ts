import type { NavigationMenuItem } from '@nuxt/ui';

/**
 * Navigation Composable
 *
 * Provides navigation menu items for dashboard layouts.
 * Handles route-based icon states and sidebar close callbacks.
 */
export default function useNavigation(options?: { closeSidebar?: () => void; homeRoute?: string }) {
  const route = useRoute();
  const closeSidebar = options?.closeSidebar || (() => {});
  const homeRoute = options?.homeRoute || '/';

  const links = computed<NavigationMenuItem[][]>(() => [
    [
      {
        label: 'Home',
        icon:
          route.path === homeRoute || route.path.startsWith('/home')
            ? 'tabler:home-filled'
            : 'tabler:home',
        to: '/home',
        class: 'p-3',
        color: 'neutral',
        onSelect: closeSidebar,
      },
      {
        label: 'My Feed',
        icon: 'tabler:rss',
        to: '/my-feed',
        class: 'p-3',
        onSelect: closeSidebar,
      },
      {
        label: 'Explore',
        icon: 'tabler:search',
        to: '/explore',
        class: 'p-3',
        onSelect: closeSidebar,
      },
      {
        label: 'Library',
        icon: 'tabler:bookmarks',
        to: '/library',
        class: 'p-3',
        onSelect: closeSidebar,
      },
      {
        label: 'Profile',
        icon:
          route.path.startsWith('/profile') || route.path.startsWith('/dashboard/favorites')
            ? 'tabler:user-filled'
            : 'tabler:user',
        to: '/dashboard/favorites',
        class: 'p-3',
        onSelect: closeSidebar,
      },
      {
        label: 'Store',
        to: '/store',
        class: 'p-3',
        icon: 'tabler:garden-cart',
        defaultOpen: false,
        type: 'trigger' as const,
      },
    ],
    [
      {
        label: 'Settings',
        to: '/settings',
        class: 'p-3',
        icon: 'tabler:settings-cog',
        defaultOpen: false,
        type: 'trigger' as const,
      },

      {
        label: 'Help',
        icon: 'tabler:help',
        to: '/dashboard/favorites',
        class: 'p-3',
        onSelect: closeSidebar,
      },
    ],
  ]);

  return {
    links,
  };
}

/**
 * Admin Navigation Composable
 *
 * Provides navigation menu items specifically for admin dashboard layouts.
 * Uses /admin as the home route.
 */
export function useAdminNavigation(options?: { closeSidebar?: () => void }) {
  return useNavigation({
    ...options,
    homeRoute: '/admin',
  });
}
