import { getItems } from '~~/server/utils/payload-server';
import { resolveUsernameToPayloadUserId } from '~~/server/utils/resolve-username';

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username');

  if (!username) {
    throw createError({ statusCode: 400, message: 'Username is required' });
  }

  try {
    const {
      public: { apiUrl },
    } = useRuntimeConfig();

    // Step 1: Get user info from AdonisJS
    let adonisUser: {
      id: number;
      username: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
      bio: string | null;
      betterAuthUserId: string | null;
    } | null = null;

    try {
      adonisUser = await $fetch<typeof adonisUser>(`${apiUrl}/api/public/users/${username}`);
    } catch (error: any) {
      console.error(`Error fetching user from AdonisJS for username "${username}":`, error);
      if (error.statusCode === 404 || error.status === 404) {
        throw createError({ statusCode: 404, message: `User "${username}" not found` });
      }
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch user information',
        data: error,
      });
    }

    if (!adonisUser) {
      throw createError({ statusCode: 404, message: `User "${username}" not found` });
    }

    // Step 2: Resolve to Payload user ID
    const payloadUserId = await resolveUsernameToPayloadUserId(username);

    if (!payloadUserId) {
      console.warn(
        `User "${username}" found in AdonisJS but not in Payload. Email: ${adonisUser.email}`
      );
      // Return profile with empty spaces/posts if user exists in AdonisJS but not in Payload
      return {
        user: {
          id: adonisUser.id,
          username: adonisUser.username,
          firstName: adonisUser.firstName,
          lastName: adonisUser.lastName,
          fullName:
            adonisUser.firstName && adonisUser.lastName
              ? `${adonisUser.firstName} ${adonisUser.lastName}`
              : adonisUser.firstName || adonisUser.lastName || adonisUser.username || 'User',
          avatarUrl: adonisUser.avatarUrl,
          bio: adonisUser.bio,
          email: adonisUser.email,
        },
        spaces: [],
        recentPosts: [],
      };
    }

    // Step 3: Get user's spaces (publications/stacks)
    // Get the Payload user to access their spaces relationship (plugin uses "tenants" field name)
    let spacesResult = { docs: [], totalDocs: 0, limit: 10, totalPages: 0 };
    try {
      const payloadUser = await getItems('users', {
        where: {
          id: {
            equals: payloadUserId,
          },
        },
        depth: 2, // Include space relationships
        limit: 1,
      });

      if (payloadUser.docs.length > 0) {
        const user = payloadUser.docs[0];
        // Extract spaces from user's tenants relationship (plugin uses "tenants" field name internally)
        if (user.tenants && Array.isArray(user.tenants)) {
          const spaceIds = user.tenants
            .map((t: any) => (typeof t.tenant === 'object' ? t.tenant.id : t.tenant))
            .filter(Boolean);

          if (spaceIds.length > 0) {
            // Collection slug is 'tenants' for plugin compatibility, but we call them "spaces"
            spacesResult = await getItems('tenants', {
              where: {
                id: {
                  in: spaceIds,
                },
              },
              sort: '-createdAt',
              depth: 1,
            });
          }
        }
      }
    } catch (error: unknown) {
      // If spaces query fails, return empty spaces array - this is a public endpoint
      console.warn(
        `Failed to fetch spaces for user ${payloadUserId}:`,
        error instanceof Error ? error.message : String(error)
      );
    }

    // Step 4: Get recent posts across all spaces (limit to 10 most recent)
    const recentPostsResult = await getItems('posts', {
      where: {
        author: {
          equals: payloadUserId,
        },
        status: {
          equals: 'published',
        },
      },
      sort: '-publishedAt',
      limit: 10,
      depth: 2, // Include space relationship
    });

    return {
      user: {
        id: adonisUser.id,
        username: adonisUser.username,
        firstName: adonisUser.firstName,
        lastName: adonisUser.lastName,
        fullName:
          adonisUser.firstName && adonisUser.lastName
            ? `${adonisUser.firstName} ${adonisUser.lastName}`
            : adonisUser.firstName || adonisUser.lastName || adonisUser.username || 'User',
        avatarUrl: adonisUser.avatarUrl,
        bio: adonisUser.bio,
        email: adonisUser.email, // Include for display name fallback
      },
      spaces: spacesResult.docs,
      recentPosts: recentPostsResult.docs,
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch user profile',
      data: error,
    });
  }
});
