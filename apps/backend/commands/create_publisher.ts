import { BaseCommand, args, flags } from '@adonisjs/core/ace';
import logger from '@adonisjs/core/services/logger';

import type { CommandOptions } from '@adonisjs/core/types/ace';

import { auth } from '#config/better_auth';
import User from '#models/user';
import { BetterAuthSyncService } from '#services/better_auth_sync_service';
import { PayloadUserSyncService } from '#services/payload_user_sync_service';
import { UserSyncService } from '#services/user_sync_service';

export default class CreatePublisher extends BaseCommand {
  static commandName = 'create:publisher';
  static description = 'Create a new user with publisher role and sync to Payload CMS';

  static options: CommandOptions = {
    startApp: true,
  };

  @args.string({ description: 'Email address for the new user' })
  declare email: string;

  @args.string({ description: 'Password for the new user' })
  declare password: string;

  @flags.string({ description: 'First name' })
  declare firstName?: string;

  @flags.string({ description: 'Last name' })
  declare lastName?: string;

  @flags.string({ description: 'Username' })
  declare username?: string;

  async run() {
    try {
      this.logger.info(`Creating publisher user: ${this.email}`);

      // Check if user already exists
      const existingUser = await User.findBy('email', this.email);
      if (existingUser) {
        this.logger.error(`User with email ${this.email} already exists`);
        return;
      }

      // Create user in Better Auth
      let betterAuthUser;
      try {
        if (auth.api.signUpEmail) {
          const result = await auth.api.signUpEmail({
            body: {
              email: this.email,
              password: this.password,
              name:
                this.firstName && this.lastName
                  ? `${this.firstName} ${this.lastName}`.trim()
                  : this.firstName || this.lastName || this.email,
              ...(this.username && { username: this.username }),
            },
          });
          betterAuthUser = result?.user;
        } else {
          this.logger.error('Better Auth sign-up API not available');
          return;
        }
      } catch (error: unknown) {
        const errorMessage =
          (error instanceof Error && error.message) ||
          (typeof error === 'object' &&
          error !== null &&
          'error' in error &&
          typeof (error as { error?: { message?: string } }).error?.message === 'string'
            ? (error as { error: { message: string } }).error.message
            : undefined) ||
          'Unknown error';

        // Email OTP errors are non-fatal - user may still be created
        if (errorMessage?.includes('verification code') || errorMessage?.includes('OTP') || errorMessage?.includes('Failed to send')) {
          this.logger.info(`Email verification failed (non-fatal): ${errorMessage}`);
          this.logger.info('Checking if user was created despite email error...');

          // Wait a bit for user to be created
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Try to get the user that might have been created
          const possibleUser = await User.findBy('email', this.email);
          if (possibleUser && possibleUser.betterAuthUserId) {
            this.logger.info('User found in database, continuing with sync...');
            betterAuthUser = {
              id: possibleUser.betterAuthUserId,
              email: possibleUser.email,
              name: possibleUser.firstName && possibleUser.lastName
                ? `${possibleUser.firstName} ${possibleUser.lastName}`.trim()
                : possibleUser.firstName || possibleUser.lastName || possibleUser.email,
              image: possibleUser.avatarUrl || undefined,
              emailVerified: false,
              username: possibleUser.username || undefined,
            } as any;
          } else {
            this.logger.error(`Better Auth sign-up failed and user not found: ${errorMessage}`);
            this.logger.info('Note: Email service may need to be configured. User creation may have partially succeeded.');
            return;
          }
        } else {
          this.logger.error(`Better Auth sign-up failed: ${errorMessage}`);
          return;
        }
      }

      if (!betterAuthUser?.id) {
        this.logger.error('Better Auth user creation succeeded but no user ID returned');
        return;
      }

      // Wait a bit for Better Auth hook to potentially run
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get the user that was created by the hook (if any)
      let adonisUser = await User.findBy('better_auth_user_id', betterAuthUser.id);

      if (!adonisUser) {
        // Create Adonis user manually with publisher role
        adonisUser = await UserSyncService.syncUser({
          betterAuthUser: {
            id: betterAuthUser.id,
            email: betterAuthUser.email,
            name: betterAuthUser.name || undefined,
            image: betterAuthUser.image || undefined,
            emailVerified: betterAuthUser.emailVerified,
            username: this.username || undefined,
          },
          provider: 'email',
          role: 'publisher',
        });
      }

      if (!adonisUser) {
        this.logger.error('Failed to create user in AdonisJS');
        return;
      }

      // Update role to publisher if different
      if (adonisUser.role !== 'publisher') {
        adonisUser.role = 'publisher';
        await adonisUser.save();
      }

      // Sync role to Better Auth
      if (adonisUser.betterAuthUserId) {
        await BetterAuthSyncService.syncRole(adonisUser.id, 'publisher', null);
      }

      // Sync to Payload (publisher role requires Payload user)
      await PayloadUserSyncService.syncUserToPayload(adonisUser, 'publisher', this.password);

      // Reload user to get Payload user ID if created
      await adonisUser.refresh();

      this.logger.success(`Publisher user created successfully!`);
      this.logger.info(`  Email: ${adonisUser.email}`);
      this.logger.info(`  Username: ${adonisUser.username || 'N/A'}`);
      this.logger.info(`  Role: ${adonisUser.role}`);
      this.logger.info(`  Adonis User ID: ${adonisUser.id}`);
      this.logger.info(`  Payload User ID: ${adonisUser.payloadUserId || 'Not synced'}`);
      this.logger.info(`  Better Auth User ID: ${adonisUser.betterAuthUserId}`);

      if (adonisUser.payloadUserId) {
        this.logger.success(`✓ User synced to Payload CMS with ID: ${adonisUser.payloadUserId}`);
      } else {
        this.logger.info(`⚠ User not synced to Payload CMS (Payload may not be running)`);
      }
    } catch (error: unknown) {
      this.logger.error('Failed to create publisher user:', error);
      if (error instanceof Error) {
        this.logger.error(error.message);
        this.logger.error(error.stack);
      }
    }
  }
}
