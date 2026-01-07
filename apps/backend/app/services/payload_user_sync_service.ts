import logger from '@adonisjs/core/services/logger';

import type User from '#models/user';

import payloadRestService from '#services/payload_rest_service';
import payloadService from '#services/payload_service';

/**
 * Payload User Sync Service
 *
 * Handles synchronization of users between AdonisJS and Payload CMS.
 * Only users with content roles (admin, content_admin, editor, publisher) are synced to Payload.
 *
 * See docs/2.authentication/payload-authentication.md for authentication strategy details.
 */
export class PayloadUserSyncService {
  /**
   * Map Adonis role to Payload role
   * Payload uses simple string roles, not role IDs
   */
  private static getPayloadRole(adonisRole: string): string | null {
    switch (adonisRole) {
      case 'admin':
        return 'admin';
      case 'content_admin':
        return 'content_admin';
      case 'editor':
        return 'editor';
      case 'publisher':
        return 'publisher';
      case 'user':
        return null; // General users don't get Payload accounts
      default:
        logger.warn(`Unknown role for Payload mapping: ${adonisRole}`);
        return null;
    }
  }

  /**
   * Check if a role requires Payload user
   */
  static requiresPayloadUser(role: string): boolean {
    return ['admin', 'content_admin', 'editor', 'publisher'].includes(role);
  }

  /**
   * Find Payload user by email using Local API
   */
  static async findPayloadUserByEmail(email: string): Promise<string | null> {
    try {
      const payload = await payloadService.getPayload();

      const result = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: email,
          },
        },
        limit: 1,
      });

      if (result.docs.length > 0 && result.docs[0].id) {
        return result.docs[0].id as string;
      }

      return null;
    } catch (error) {
      logger.error(`Failed to find Payload user by email: ${error}`);
      return null;
    }
  }

  /**
   * Verify if a Payload user exists by ID
   */
  static async verifyPayloadUserExists(payloadUserId: string): Promise<boolean> {
    try {
      const payload = await payloadService.getPayload();

      await payload.findByID({
        collection: 'users',
        id: payloadUserId,
      });

      return true;
    } catch (error) {
      // User doesn't exist or error occurred
      logger.debug(`Payload user ${payloadUserId} not found or error: ${error}`);
      return false;
    }
  }

  /**
   * Get Payload user ID from Adonis user
   */
  static async getPayloadUserId(user: User): Promise<string | null> {
    if (user.payloadUserId) {
      // Verify the user still exists in Payload
      const exists = await this.verifyPayloadUserExists(user.payloadUserId);
      if (!exists) {
        // User ID is stale, clear it
        logger.warn(
          `Payload user ${user.payloadUserId} not found for Adonis user ${user.id}, clearing stale ID`
        );
        user.payloadUserId = null;
        await user.save();
        return null;
      }
      return user.payloadUserId;
    }

    // Try to find by email
    const payloadUserId = await this.findPayloadUserByEmail(user.email);
    if (payloadUserId) {
      // Update Adonis user with Payload user ID
      user.payloadUserId = payloadUserId;
      await user.save();
      return payloadUserId;
    }

    return null;
  }

  /**
   * Create or update Payload user
   *
   * Note: Password handling depends on authentication strategy:
   * - Option A (Password Sync): Password is synced from AdonisJS
   * - Option B (Passwordless): User is created without password, requires separate setup
   *
   * For now, we'll use Option A (password sync) for simplicity.
   * See docs/2.authentication/payload-authentication.md for details.
   */
  static async syncUserToPayload(
    user: User,
    role: string,
    password?: string
  ): Promise<{ payloadUserId: string | null }> {
    // Only create Payload users for content roles
    if (!this.requiresPayloadUser(role)) {
      return { payloadUserId: null };
    }

    const payloadRole = this.getPayloadRole(role);
    if (!payloadRole) {
      logger.warn(`Cannot sync user ${user.id} to Payload: invalid role ${role}`);
      return { payloadUserId: null };
    }

    try {
      // Try Local API first, fallback to REST API if it fails
      let payloadUserId: string | null = null;
      let useRestApi = false;

      try {
        const payload = await payloadService.getPayload();

        // Check if Payload user already exists
        payloadUserId = user.payloadUserId || (await this.findPayloadUserByEmail(user.email));

        if (payloadUserId) {
          // Update existing Payload user
          const updateData: Record<string, any> = {
            email: user.email,
            role: payloadRole,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            adonisUserId: user.id.toString(),
          };

          // Update password if provided (Option A: Password Sync)
          if (password) {
            updateData.password = password;
          }

          await payload.update({
            collection: 'users',
            id: payloadUserId,
            data: updateData,
          });

          logger.info(`Updated Payload user ${payloadUserId} for Adonis user ${user.id}`);
        } else {
          // Create new Payload user
          const userData: Record<string, any> = {
            email: user.email,
            role: payloadRole,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            adonisUserId: user.id.toString(),
          };

          // Set password if provided (Option A: Password Sync)
          // If no password, user will need to set it separately (Option B: Passwordless)
          if (password) {
            userData.password = password;
          }

          const createdUser = await payload.create({
            collection: 'users',
            data: userData,
          });

          payloadUserId = createdUser.id as string;
          if (!payloadUserId) {
            throw new Error('Payload user created but no ID returned');
          }

          logger.info(`Created Payload user ${payloadUserId} for Adonis user ${user.id}`);

          // Create space for Publisher role
          if (role === 'publisher') {
            await this.createTenantForPublisher(payloadUserId, user);
          }
        }
      } catch (localApiError) {
        // Local API failed, fallback to REST API
        logger.warn('Payload Local API failed, falling back to REST API:', localApiError);
        useRestApi = true;

        // Find user via REST API
        const restUser = await payloadRestService.findUserByEmail(user.email);
        payloadUserId = restUser?.id || null;

        if (payloadUserId) {
          // Update existing user
          await payloadRestService.updateUser(payloadUserId, {
            email: user.email,
            role: payloadRole,
            firstName: user.firstName ?? undefined,
            lastName: user.lastName ?? undefined,
            adonisUserId: user.id.toString(),
            ...(password && { password }),
          });
          logger.info(
            `Updated Payload user ${payloadUserId} via REST API for Adonis user ${user.id}`
          );
        } else {
          // Create new user
          if (!password) {
            logger.warn('Password required for REST API user creation, skipping Payload sync');
            return { payloadUserId: null };
          }

          const createdUser = await payloadRestService.createUser({
            email: user.email,
            password,
            role: payloadRole,
            firstName: user.firstName ?? undefined,
            lastName: user.lastName ?? undefined,
            adonisUserId: user.id.toString(),
          });

          payloadUserId = createdUser.id;
          logger.info(
            `Created Payload user ${payloadUserId} via REST API for Adonis user ${user.id}`
          );

          // Create space for Publisher role (via REST API if needed)
          if (role === 'publisher') {
            // Note: Space creation via REST API would need to be implemented separately
            logger.info(
              `Note: Space creation for publisher requires Local API or separate REST call`
            );
          }
        }
      }

      // Update Adonis user with Payload user ID
      if (payloadUserId) {
        user.payloadUserId = payloadUserId;
        await user.save();

        // Create space for publisher if not already assigned (for both new and existing users)
        if (role === 'publisher' && !useRestApi) {
          await this.createTenantForPublisher(payloadUserId, user);
        }
      }

      return { payloadUserId };
    } catch (error) {
      logger.error(`Failed to sync user ${user.id} to Payload: ${error}`);
      return { payloadUserId: null };
    }
  }

  /**
   * Create space for Publisher role
   * Automatically creates a space (publication/stack) when a publisher user is synced to Payload
   */
  static async createTenantForPublisher(payloadUserId: string, adonisUser: User): Promise<void> {
    try {
      const payload = await payloadService.getPayload();

      // Get the Payload user to check existing tenants
      const payloadUser = await payload.findByID({
        collection: 'users',
        id: payloadUserId,
      });

      // Check if user already has spaces (tenants) assigned
      // Note: Plugin uses "tenants" field name internally, but collection is "spaces"
      const existingSpaces = (payloadUser as any).tenants || [];
      if (Array.isArray(existingSpaces) && existingSpaces.length > 0) {
        logger.info(
          `Publisher ${payloadUserId} already has ${existingSpaces.length} space(s) assigned`
        );
        return;
      }

      // Generate space slug from username or email
      const username = adonisUser.username || adonisUser.email.split('@')[0];
      if (!username) {
        logger.warn(`Cannot create space for publisher ${payloadUserId}: no username or email`);
        return;
      }

      const spaceSlug = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');

      // Check if space with this slug already exists (collection slug is 'tenants' for plugin compatibility)
      const existingSpacesBySlug = await payload.find({
        collection: 'tenants',
        where: {
          slug: {
            equals: spaceSlug,
          },
        },
        limit: 1,
      });

      let spaceId: string;

      if (existingSpacesBySlug.docs.length > 0) {
        // Use existing space
        spaceId = existingSpacesBySlug.docs[0].id as string;
        logger.info(`Using existing space ${spaceId} for publisher ${payloadUserId}`);
      } else {
        // Create new space with username as name (collection slug is 'tenants' for plugin compatibility)
        const spaceName = username.charAt(0).toUpperCase() + username.slice(1);

        const newSpace = await payload.create({
          collection: 'tenants',
          data: {
            name: spaceName,
            slug: spaceSlug,
            domain: '',
          },
        });

        spaceId = newSpace.id as string;
        logger.info(`Created space ${spaceId} (${spaceSlug}) for publisher ${payloadUserId}`);
      }

      // Assign space to user (plugin uses "tenants" field name internally)
      await payload.update({
        collection: 'users',
        id: payloadUserId,
        data: {
          tenants: [
            {
              tenant: spaceId,
            },
          ],
        },
      });

      logger.info(`Assigned space ${spaceId} to publisher ${payloadUserId}`);
    } catch (error) {
      logger.error(`Failed to create space for Payload user ${payloadUserId}: ${error}`);
      // Don't throw - space creation failure shouldn't block user sync
    }
  }

  /**
   * Delete space for a user when role changes from publisher
   */
  static async deleteTenantForPublisher(payloadUserId: string, adonisUser: User): Promise<void> {
    try {
      const payload = await payloadService.getPayload();

      // Get Payload user to find their spaces (plugin uses "tenants" field name)
      const payloadUser = await payload.findByID({
        collection: 'users',
        id: payloadUserId,
        depth: 2, // Include space relationships
      });

      if (!payloadUser) {
        logger.warn(`Payload user ${payloadUserId} not found for space deletion`);
        return;
      }

      // Get user's spaces (plugin field is called "tenants" but collection is "spaces")
      const userSpaces = (payloadUser as any).tenants || [];
      if (!Array.isArray(userSpaces) || userSpaces.length === 0) {
        logger.info(`No spaces found for Payload user ${payloadUserId}`);
        return;
      }

      // Generate space slug from username to find the matching space
      const username = adonisUser.username || adonisUser.email.split('@')[0];
      if (!username) {
        logger.warn(`Cannot find space to delete: no username for user ${adonisUser.id}`);
        return;
      }

      const spaceSlug = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');

      // Find space by slug (collection slug is 'tenants' for plugin compatibility)
      const spaceResult = await payload.find({
        collection: 'tenants',
        where: {
          slug: {
            equals: spaceSlug,
          },
        },
        limit: 1,
      });

      if (spaceResult.docs.length === 0) {
        logger.info(`Space with slug ${spaceSlug} not found for deletion`);
        return;
      }

      const spaceId = spaceResult.docs[0].id as string;

      // Remove space from user's spaces array (plugin uses "tenants" field name)
      const updatedSpaces = userSpaces.filter(
        (t: any) => (typeof t.tenant === 'object' ? t.tenant.id : t.tenant) !== spaceId
      );

      await payload.update({
        collection: 'users',
        id: payloadUserId,
        data: {
          tenants: updatedSpaces.map((t: any) => ({
            tenant: typeof t.tenant === 'object' ? t.tenant.id : t.tenant,
          })),
        },
      });

      // Delete the space (collection slug is 'tenants' for plugin compatibility)
      await payload.delete({
        collection: 'tenants',
        id: spaceId,
      });

      logger.info(`Deleted space ${spaceId} (${spaceSlug}) for user ${payloadUserId}`);
    } catch (error) {
      logger.error(`Failed to delete space for Payload user ${payloadUserId}: ${error}`);
      // Don't throw - space deletion failure shouldn't block role update
    }
  }

  /**
   * Update Payload user email
   */
  static async updatePayloadUserEmail(payloadUserId: string, email: string): Promise<boolean> {
    try {
      const payload = await payloadService.getPayload();

      await payload.update({
        collection: 'users',
        id: payloadUserId,
        data: {
          email,
        },
      });

      logger.info(`Updated Payload user ${payloadUserId} email to ${email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update Payload user ${payloadUserId} email: ${error}`);
      return false;
    }
  }

  /**
   * Update Payload user role
   */
  static async updatePayloadUserRole(payloadUserId: string, adonisRole: string): Promise<boolean> {
    const payloadRole = this.getPayloadRole(adonisRole);
    if (!payloadRole) {
      logger.warn(`Cannot update Payload user role: invalid role ${adonisRole}`);
      return false;
    }

    try {
      const payload = await payloadService.getPayload();

      await payload.update({
        collection: 'users',
        id: payloadUserId,
        data: {
          role: payloadRole,
        },
      });

      logger.info(`Updated Payload user ${payloadUserId} role to ${adonisRole}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update Payload user ${payloadUserId} role: ${error}`);
      return false;
    }
  }
}
