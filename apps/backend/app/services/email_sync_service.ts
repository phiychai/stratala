import logger from '@adonisjs/core/services/logger';

import User from '#models/user';
import { PayloadUserSyncService } from '#services/payload_user_sync_service';

/**
 * Email Sync Service
 *
 * Synchronizes email changes across Better Auth, AdonisJS, and Payload.
 * Email changes should flow from Better Auth → Adonis → Payload (one-way).
 * Better Auth handles email verification, so it should be the source of truth for email.
 */
export class EmailSyncService {
  /**
   * Sync email from Better Auth to Adonis and Payload
   * Called after Better Auth email is verified and updated
   */
  static async syncEmailFromBetterAuth(
    betterAuthUserId: string,
    newEmail: string
  ): Promise<boolean> {
    try {
      // Find Adonis user by Better Auth user ID
      const user = await User.findBy('better_auth_user_id', betterAuthUserId);

      if (!user) {
        logger.warn(`No Adonis user found for Better Auth user ${betterAuthUserId}`);
        return false;
      }

      // Update email in Adonis (canonical)
      user.email = newEmail;
      await user.save();

      // Sync to Payload if user has Payload account
      if (user.payloadUserId) {
        await PayloadUserSyncService.updatePayloadUserEmail(user.payloadUserId, newEmail);
      }

      logger.info(`Email synced from Better Auth to Adonis and Payload for user ${user.id}`);
      return true;
    } catch (error) {
      logger.error(`Failed to sync email from Better Auth: ${error}`);
      return false;
    }
  }

  /**
   * Sync email to Payload
   * Helper method for updating Payload email when Adonis email changes
   */
  static async syncEmailToPayload(payloadUserId: string, email: string): Promise<boolean> {
    return await PayloadUserSyncService.updatePayloadUserEmail(payloadUserId, email);
  }

  /**
   * Sync email to Adonis and Payload
   * Used when email is updated in Adonis (should be rare - email should change via Better Auth)
   * This is a fallback for admin operations or edge cases
   */
  static async syncEmailToAdonisAndPayload(
    user: User,
    newEmail: string
  ): Promise<{ adonisUpdated: boolean; payloadUpdated: boolean }> {
    try {
      // Update Adonis email
      user.email = newEmail;
      await user.save();

      // Sync to Payload if user has Payload account
      let payloadUpdated = false;
      if (user.payloadUserId) {
        payloadUpdated = await PayloadUserSyncService.updatePayloadUserEmail(
          user.payloadUserId,
          newEmail
        );
      }

      logger.info(`Email synced to Adonis and Payload for user ${user.id}`);
      return { adonisUpdated: true, payloadUpdated };
    } catch (error) {
      logger.error(`Failed to sync email to Adonis and Payload: ${error}`);
      return { adonisUpdated: false, payloadUpdated: false };
    }
  }

  /**
   * Note: Better Auth email changes should go through Better Auth's email change flow
   * which includes verification. After Better Auth email is verified, this service
   * should be called to sync to Adonis and Payload.
   *
   * If Better Auth provides email change hooks, they should call syncEmailFromBetterAuth.
   * Otherwise, email changes should be initiated through Better Auth's API/UI.
   */
}
