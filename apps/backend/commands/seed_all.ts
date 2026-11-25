import { BaseCommand } from '@adonisjs/core/ace';
import pg from 'pg';

import type { CommandOptions } from '@adonisjs/core/types/ace';
import type { UserRoleType } from '@stratala/shared-types';

import { auth } from '#config/better_auth';
import User from '#models/user';
import { PayloadUserSyncService } from '#services/payload_user_sync_service';
import { UserSyncService, type BetterAuthUser } from '#services/user_sync_service';

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRoleType;
}

const usersToCreate: UserData[] = [
  // Admin
  { email: 'alex.mercer@stratala.dev', firstName: 'Alex', lastName: 'Mercer', role: 'admin' },
  // Content Admin
  {
    email: 'nora.bennett@stratala.dev',
    firstName: 'Nora',
    lastName: 'Bennett',
    role: 'content_admin',
  },
  // Publishers (writers)
  {
    email: 'liam.carter@stratala.dev',
    firstName: 'Liam',
    lastName: 'Carter',
    role: 'publisher',
  },
  {
    email: 'maya.thompson@stratala.dev',
    firstName: 'Maya',
    lastName: 'Thompson',
    role: 'publisher',
  },
  {
    email: 'daniel.kim@stratala.dev',
    firstName: 'Daniel',
    lastName: 'Kim',
    role: 'publisher',
  },
  // Ordinary users
  { email: 'olivia.grant@stratala.dev', firstName: 'Olivia', lastName: 'Grant', role: 'user' },
  { email: 'ethan.price@stratala.dev', firstName: 'Ethan', lastName: 'Price', role: 'user' },
  { email: 'chloe.hughes@stratala.dev', firstName: 'Chloe', lastName: 'Hughes', role: 'user' },
  { email: 'benjamin.ross@stratala.dev', firstName: 'Benjamin', lastName: 'Ross', role: 'user' },
  { email: 'zoe.patel@stratala.dev', firstName: 'Zoe', lastName: 'Patel', role: 'user' },
  { email: 'samuel.reed@stratala.dev', firstName: 'Samuel', lastName: 'Reed', role: 'user' },
  { email: 'ava.morris@stratala.dev', firstName: 'Ava', lastName: 'Morris', role: 'user' },
  { email: 'james.cooper@stratala.dev', firstName: 'James', lastName: 'Cooper', role: 'user' },
  { email: 'amelia.ward@stratala.dev', firstName: 'Amelia', lastName: 'Ward', role: 'user' },
  { email: 'noah.parker@stratala.dev', firstName: 'Noah', lastName: 'Parker', role: 'user' },
  { email: 'harper.bailey@stratala.dev', firstName: 'Harper', lastName: 'Bailey', role: 'user' },
  { email: 'lucas.foster@stratala.dev', firstName: 'Lucas', lastName: 'Foster', role: 'user' },
  { email: 'grace.hill@stratala.dev', firstName: 'Grace', lastName: 'Hill', role: 'user' },
  { email: 'henry.brooks@stratala.dev', firstName: 'Henry', lastName: 'Brooks', role: 'user' },
  { email: 'ella.bryant@stratala.dev', firstName: 'Ella', lastName: 'Bryant', role: 'user' },
];

export default class SeedAll extends BaseCommand {
  static commandName = 'seed:all';
  static description =
    'Seed all databases with 20 users (1 admin, 1 content_admin, 3 publishers, 15 users)';

  static options: CommandOptions = {
    startApp: true,
  };

  async run() {
    const password = process.env.SEED_PASSWORD?.trim();
    if (!password) {
      this.logger.error('[seed:all] SEED_PASSWORD must be set and non-empty');
      this.exitCode = 1;
      return;
    }

    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
      this.logger.error(
        '[seed:all] refusing to seed in production; set ALLOW_PRODUCTION_SEED=true to continue'
      );
      this.exitCode = 1;
      return;
    }

    this.logger.info('[seed:all] starting comprehensive seed process\n');

    // Get database connection for direct email verification update
    const dbUri =
      process.env.DATABASE_URI ||
      `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_DATABASE || 'adonis_db'}`;

    const dbClient = new pg.Client({ connectionString: dbUri });

    try {
      await dbClient.connect();
      this.logger.info('✅ Connected to database\n');

      let createdCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      let failCount = 0;

      for (const userData of usersToCreate) {
        try {
          this.logger.info(`Creating ${userData.role}: ${userData.email}...`);

          // Check if user already exists
          let existingUser = await User.findBy('email', userData.email);
          if (existingUser) {
            this.logger.info(`  ⚠️  User ${userData.email} already exists`);
            let wasUpdated = false;

            const betterAuthRecord = await dbClient.query<{
              id: string;
              email: string;
              name: string | null;
              image: string | null;
              emailVerified: boolean;
              username?: string | null;
            }>(
              'SELECT id, email, name, image, "emailVerified", username FROM "user" WHERE email = $1',
              [userData.email]
            );
            const matchingBetterAuth = betterAuthRecord.rows[0];
            if (
              matchingBetterAuth &&
              existingUser.betterAuthUserId &&
              existingUser.betterAuthUserId !== matchingBetterAuth.id
            ) {
              throw new Error(
                `Identity collision: email ${userData.email} maps to Better Auth users ${existingUser.betterAuthUserId} and ${matchingBetterAuth.id}`
              );
            }
            if (matchingBetterAuth && !existingUser.betterAuthUserId) {
              const reconciled = await UserSyncService.syncUser({
                betterAuthUser: matchingBetterAuth,
                provider: 'email',
              });
              if (!reconciled) throw new Error('Failed to reconcile Better Auth identity');
              existingUser = reconciled;
              wasUpdated = true;
            }

            const previousRole = existingUser.role;
            const roleChanged = previousRole !== userData.role;
            if (roleChanged) {
              existingUser.role = userData.role;
              await existingUser.save();
              this.logger.info(`  ✓ Role reconciled to ${userData.role}`);
              wasUpdated = true;
            }

            if (
              !PayloadUserSyncService.requiresPayloadUser(userData.role) &&
              existingUser.payloadUserId
            ) {
              await PayloadUserSyncService.revokePayloadAccess(existingUser.payloadUserId, {
                throwOnError: true,
              });
              wasUpdated = true;
            }

            // Reconcile content-role Payload records on role changes and make
            // publisher tenant repair idempotent on every seed rerun.
            if (
              PayloadUserSyncService.requiresPayloadUser(userData.role) &&
              (!existingUser.payloadUserId || roleChanged || userData.role === 'publisher')
            ) {
              this.logger.info(
                '  Attempting to sync to Payload (previous sync may have failed)...'
              );
              await PayloadUserSyncService.syncUserToPayload(
                existingUser,
                userData.role,
                password,
                { throwOnError: true }
              );
              await existingUser.refresh();
              wasUpdated = true;
              if (existingUser.payloadUserId) {
                this.logger.success(`  ✓ Synced to Payload (ID: ${existingUser.payloadUserId})`);
              }
            }

            // Verify email if not already verified
            if (existingUser.betterAuthUserId) {
              try {
                const verification = await dbClient.query<{ emailVerified: boolean }>(
                  'SELECT "emailVerified" FROM "user" WHERE id = $1',
                  [existingUser.betterAuthUserId]
                );
                if (verification.rows[0] && !verification.rows[0].emailVerified) {
                  await dbClient.query('UPDATE "user" SET "emailVerified" = true WHERE id = $1', [
                    existingUser.betterAuthUserId,
                  ]);
                  this.logger.info('  ✓ Email verified');
                  wasUpdated = true;
                }
              } catch (error) {
                throw new Error(
                  `Failed to reconcile email verification: ${error instanceof Error ? error.message : String(error)}`
                );
              }
            }

            this.logger.info('  Skipping user creation (already exists)...');
            if (wasUpdated) {
              updatedCount++;
            } else {
              skippedCount++;
            }
            continue;
          }

          // Create user in Better Auth
          let betterAuthUser;
          const existingBetterAuth = await dbClient.query<{
            id: string;
            email: string;
            name: string | null;
            image: string | null;
            emailVerified: boolean;
            username?: string | null;
          }>(
            'SELECT id, email, name, image, "emailVerified", username FROM "user" WHERE email = $1',
            [userData.email]
          );
          betterAuthUser = existingBetterAuth.rows[0];
          try {
            if (!betterAuthUser && auth.api.signUpEmail) {
              const result = await auth.api.signUpEmail({
                body: {
                  email: userData.email,
                  password,
                  name: `${userData.firstName} ${userData.lastName}`.trim(),
                },
              });
              betterAuthUser = result?.user;
            } else {
              throw new Error('Better Auth sign-up API not available');
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
            if (
              errorMessage?.includes('verification code') ||
              errorMessage?.includes('OTP') ||
              errorMessage?.includes('Failed to send')
            ) {
              this.logger.info(`  ⚠️  Email verification failed (non-fatal): ${errorMessage}`);
              this.logger.info('  Checking if user was created despite email error...');

              // Wait a bit for user to be created
              await new Promise((resolve) => setTimeout(resolve, 1000));

              // Try to get the user that might have been created by the hook.
              const possibleUser = await User.findBy('email', userData.email);
              if (possibleUser && possibleUser.betterAuthUserId) {
                this.logger.info('  User found in database, continuing with sync...');
                betterAuthUser = {
                  id: possibleUser.betterAuthUserId,
                  email: possibleUser.email,
                  name:
                    possibleUser.firstName && possibleUser.lastName
                      ? `${possibleUser.firstName} ${possibleUser.lastName}`.trim()
                      : possibleUser.email,
                  image: possibleUser.avatarUrl || undefined,
                  emailVerified: false,
                  username: possibleUser.username || undefined,
                };
              } else {
                // A pre-existing Better Auth user may have no Adonis mapping yet.
                const existingBetterAuth = await dbClient.query<{
                  id: string;
                  email: string;
                  name: string | null;
                  image: string | null;
                  emailVerified: boolean;
                  username?: string | null;
                }>(
                  'SELECT id, email, name, image, "emailVerified", username FROM "user" WHERE email = $1',
                  [userData.email]
                );
                const baUser = existingBetterAuth.rows[0];
                if (!baUser) throw new Error(`Better Auth sign-up failed: ${errorMessage}`);
                betterAuthUser = baUser;
              }
            } else {
              throw new Error(`Better Auth sign-up failed: ${errorMessage}`);
            }
          }

          if (!betterAuthUser?.id) {
            throw new Error('Better Auth user creation succeeded but no user ID returned');
          }

          // Wait for Better Auth hook to potentially run
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Get the user that was created by the hook (if any)
          let adonisUser = await User.findBy('better_auth_user_id', betterAuthUser.id);

          if (!adonisUser) {
            // Create Adonis user manually with specified role
            const betterAuthUserData: BetterAuthUser = {
              id: betterAuthUser.id,
              email: betterAuthUser.email,
              name: betterAuthUser.name || undefined,
              image: betterAuthUser.image || undefined,
              emailVerified: betterAuthUser.emailVerified,
            };

            // Add username if it exists
            if ('username' in betterAuthUser && betterAuthUser.username) {
              betterAuthUserData.username = betterAuthUser.username;
            }

            adonisUser = await UserSyncService.syncUser({
              betterAuthUser: betterAuthUserData,
              provider: 'email',
              // Set the role below and perform Payload synchronization once.
              password,
            });
          }

          if (!adonisUser) {
            throw new Error('Failed to create user in AdonisJS');
          }

          // Update role if different
          if (adonisUser.role !== userData.role) {
            adonisUser.role = userData.role;
            await adonisUser.save();
          }

          // Set email as verified directly in Better Auth database
          await dbClient.query('UPDATE "user" SET "emailVerified" = true WHERE id = $1', [
            betterAuthUser.id,
          ]);
          this.logger.info('  ✓ Email verified');

          // Sync to Payload if role requires it
          if (PayloadUserSyncService.requiresPayloadUser(userData.role)) {
            this.logger.info('  Syncing to Payload...');
            const syncResult = await PayloadUserSyncService.syncUserToPayload(
              adonisUser,
              userData.role,
              password,
              { throwOnError: true }
            );
            await adonisUser.refresh(); // Refresh to get payloadUserId
            if (adonisUser.payloadUserId || syncResult.payloadUserId) {
              this.logger.success(
                `  ✓ Synced to Payload (ID: ${adonisUser.payloadUserId || syncResult.payloadUserId})`
              );
            }
          }

          this.logger.success(`  ✅ Created ${userData.role}: ${userData.email}`);
          if (adonisUser.username) {
            this.logger.info(`     Username: ${adonisUser.username}`);
          }
          createdCount++;
        } catch (error: unknown) {
          this.logger.error(
            `  ❌ Failed to create ${userData.email}: ${error instanceof Error ? error.message : String(error)}`
          );
          failCount++;
        }

        // Small delay between users
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      await dbClient.end();

      this.logger.info(
        `[seed:all] summary users created=${createdCount} updated=${updatedCount} skipped=${skippedCount} failed=${failCount}`
      );
      if (failCount > 0) this.exitCode = 1;
    } catch (error: unknown) {
      this.logger.error(
        `❌ Seed failed: ${error instanceof Error ? error.message : String(error)}`
      );
      await dbClient.end();
      this.exitCode = 1;
    }
  }
}
