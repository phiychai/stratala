import { BaseCommand, args } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';

import User from '#models/user';

export default class CheckUser extends BaseCommand {
  static commandName = 'check:user';
  static description = 'Check if a user exists in the database';

  static options: CommandOptions = {
    startApp: true,
  };

  @args.string({ description: 'Email address to check' })
  declare email: string;

  async run() {
    try {
      const user = await User.findBy('email', this.email);

      if (!user) {
        this.logger.error(`User with email ${this.email} not found`);
        return;
      }

      this.logger.success(`✅ User found!`);
      this.logger.info(`  ID: ${user.id}`);
      this.logger.info(`  Email: ${user.email}`);
      this.logger.info(`  Username: ${user.username || 'N/A'}`);
      this.logger.info(`  Role: ${user.role}`);
      this.logger.info(`  Better Auth User ID: ${user.betterAuthUserId || 'N/A'}`);
      this.logger.info(`  Payload User ID: ${user.payloadUserId || 'Not synced'}`);
      this.logger.info(`  Is Active: ${user.isActive}`);
    } catch (error) {
      this.logger.error('Error checking user:', error);
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      this.exitCode = 1;
    }
  }
}
