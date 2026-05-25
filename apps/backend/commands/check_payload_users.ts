import { BaseCommand } from '@adonisjs/core/ace';

import type { CommandOptions } from '@adonisjs/core/types/ace';

import User from '#models/user';
import payloadService from '#services/payload_service';

export default class CheckPayloadUsers extends BaseCommand {
  static commandName = 'check:payload-users';
  static description = 'Check Payload CMS users and verify connectivity';

  static options: CommandOptions = {
    startApp: true,
  };

  async run() {
    try {
      this.logger.info('🔍 Checking Payload CMS connectivity...\n');

      const payload = await payloadService.getPayload();

      // List all users in Payload
      const result = await payload.find({
        collection: 'users',
        limit: 100,
      });

      this.logger.info(`✅ Found ${result.totalDocs} user(s) in Payload CMS:\n`);

      if (result.docs.length === 0) {
        this.logger.warning('⚠️  No users found in Payload CMS');
      } else {
        for (const user of result.docs) {
          this.logger.info(`  📧 Email: ${user.email}`);
          this.logger.info(`     Role: ${user.role || 'N/A'}`);
          this.logger.info(`     ID: ${user.id}`);
          this.logger.info(
            `     Name: ${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'
          );
          if (user.adonisUserId) {
            this.logger.info(`     Adonis User ID: ${user.adonisUserId}`);
          }
          this.logger.info('');
        }

        // Check for publisher role users
        const publisherUsers = result.docs.filter((u) => u.role === 'publisher');
        if (publisherUsers.length > 0) {
          this.logger.success(`\n✅ Found ${publisherUsers.length} publisher(s):`);
          for (const u of publisherUsers) {
            this.logger.info(`   - ${u.email} (${u.id})`);
          }
        } else {
          this.logger.warning('\n⚠️  No users with publisher role found');
        }
      }

      // Check AdonisJS users with publisher role
      this.logger.info('\n🔍 Checking AdonisJS users with publisher role...\n');
      const adonisPublishers = await User.query().where('role', 'publisher');
      this.logger.info(`Found ${adonisPublishers.length} publisher(s) in AdonisJS:`);
      for (const user of adonisPublishers) {
        this.logger.info(`  📧 ${user.email}`);
        this.logger.info(`     Adonis ID: ${user.id}`);
        this.logger.info(`     Payload ID: ${user.payloadUserId || 'Not synced'}`);
        this.logger.info('');
      }

      this.logger.success('\n✅ Check complete');
    } catch (error) {
      this.logger.error('❌ Error checking Payload users:', error);
      if (error instanceof Error) {
        this.logger.error('   Message:', error.message);
      }
      this.exitCode = 1;
    }
  }
}
