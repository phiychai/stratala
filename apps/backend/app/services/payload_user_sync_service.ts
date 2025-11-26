import logger from '@adonisjs/core/services/logger';

import type User from '#models/user';

import payloadService from '#services/payload_service';

/**
 * Payload User Sync Service
 *
 * Handles synchronization of users between AdonisJS and Payload CMS.
 * Only users with content roles (admin, content_admin, editor, writer) are synced to Payload.
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
      case 'writer':
        return 'writer';
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
    return ['admin', 'content_admin', 'editor', 'writer'].includes(role);
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
   * Get Payload user ID from Adonis user
   */
  static async getPayloadUserId(user: User): Promise<string | null> {
    if (user.payloadUserId) {
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
      const payload = await payloadService.getPayload();

      // Check if Payload user already exists
      let payloadUserId = user.payloadUserId || (await this.findPayloadUserByEmail(user.email));

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

        // Create default space for Writer role
        if (role === 'writer') {
          await this.createDefaultSpaceForWriter(payloadUserId, user);
        }
      }

      // Update Adonis user with Payload user ID
      user.payloadUserId = payloadUserId;
      await user.save();

      return { payloadUserId };
    } catch (error) {
      logger.error(`Failed to sync user ${user.id} to Payload: ${error}`);
      return { payloadUserId: null };
    }
  }

  /**
   * Create default space for Writer role
   */
  static async createDefaultSpaceForWriter(
    payloadUserId: string,
    adonisUser: User
  ): Promise<void> {
    try {
      const payload = await payloadService.getPayload();

      // Check if default space already exists
      const existingSpaces = await payload.find({
        collection: 'spaces',
        where: {
          owner: {
            equals: payloadUserId,
          },
          isDefault: {
            equals: true,
          },
        },
        limit: 1,
      });

      if (existingSpaces.docs.length > 0) {
        logger.info(`Default space already exists for Payload user ${payloadUserId}`);
        return;
      }

      // Create default "articles" space
      const spaceName = adonisUser.firstName
        ? `${adonisUser.firstName}'s Articles`
        : 'Articles';

      await payload.create({
        collection: 'spaces',
        data: {
          slug: 'articles',
          name: spaceName,
          description: 'Default space for general articles',
          owner: payloadUserId,
          isDefault: true,
        },
      });

      logger.info(`Created default space for Payload user ${payloadUserId}`);
    } catch (error) {
      logger.error(`Failed to create default space for Payload user ${payloadUserId}: ${error}`);
      // Don't throw - space creation failure shouldn't block user sync
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
  static async updatePayloadUserRole(
    payloadUserId: string,
    adonisRole: string
  ): Promise<boolean> {
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

