import { getItems } from './payload-server';

/**
 * Resolve username to Payload user ID
 *
 * Flow:
 * 1. Query AdonisJS backend public API to get user by username
 * 2. Use email from AdonisJS user to find corresponding Payload user
 * 3. Return Payload user ID
 *
 * Note: Payload users are synced from AdonisJS via PayloadUserSyncService,
 * so we don't auto-create users here. Users should be synced through the backend.
 */
export async function resolveUsernameToPayloadUserId(username: string): Promise<string | null> {
  try {
    const {
      public: { apiUrl },
    } = useRuntimeConfig();

    // Step 1: Get user from AdonisJS by username
    const adonisUser = await $fetch<{
      id: number;
      username: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
      betterAuthUserId: string | null;
      payloadUserId: string | null;
    }>(`${apiUrl}/api/public/users/${username}`).catch(() => null);

    if (!adonisUser || !adonisUser.email) {
      return null;
    }

    // If Adonis user already has payloadUserId, use it
    if (adonisUser.payloadUserId) {
      return adonisUser.payloadUserId;
    }

    // Step 2: Find Payload user by email (most reliable matching field)
    const payloadUsersResult = await getItems<{ id?: string | number }>('users', {
      where: {
        email: {
          equals: adonisUser.email,
        },
      },
      limit: 1,
    });

    if (payloadUsersResult.docs.length > 0) {
      const userId = payloadUsersResult.docs[0]?.id;
      return userId ? String(userId) : null;
    }

    // If not found, user doesn't exist in Payload
    // Users should be synced through the backend PayloadUserSyncService
    console.warn(
      `Payload user not found for email: ${adonisUser.email}. ` +
        `User exists in AdonisJS but not in Payload. ` +
        `Consider syncing users through the backend admin panel.`
    );
    return null;
  } catch (error) {
    console.error('Error resolving username to Payload user ID:', error);
    return null;
  }
}
