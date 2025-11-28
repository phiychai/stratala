import type { Space, Post } from '@turborepo-saas-starter/shared-types';

/**
 * useUserProfile Composable
 *
 * Fetches and manages user profile data including:
 * - User information
 * - User's spaces
 * - Recent posts
 * - Display name computation
 * - SEO meta tags
 *
 * @param username - Username to fetch profile for
 * @returns User profile data and utilities
 */
export function useUserProfile(username: string) {
  const { data, error } = useFetch<{
    user: {
      id: number;
      username: string;
      firstName: string | null;
      lastName: string | null;
      fullName: string;
      avatarUrl: string | null;
      bio: string | null;
      email: string;
    };
    spaces: Space[];
    recentPosts: Post[];
  }>(() => `/api/users/${username}`, {
    key: `user-profile-${username}`,
  });

  // Handle errors
  if (error.value) {
    const statusCode = error.value.statusCode || error.value.status || 404;
    const message = error.value.message || error.value.statusMessage || 'User not found';
    throw createError({ statusCode, statusMessage: message, fatal: true });
  }

  if (!data.value) {
    throw createError({
      statusCode: 404,
      statusMessage: `User "${username}" not found`,
      fatal: true,
    });
  }

  // Compute display name
  const userRef = computed(() => data.value?.user);
  const { displayName } = useUserDisplayName(userRef);

  // Set SEO meta
  useSeoMeta({
    title: `${displayName.value} - Profile`,
    description: data.value?.user?.bio || `View ${displayName.value}'s spaces and articles`,
    ogTitle: `${displayName.value} - Profile`,
    ogDescription: data.value?.user?.bio || `View ${displayName.value}'s spaces and articles`,
  });

  return {
    data,
    error,
    user: computed(() => data.value?.user),
    spaces: computed(() => data.value?.spaces || []),
    recentPosts: computed(() => data.value?.recentPosts || []),
    displayName,
  };
}
