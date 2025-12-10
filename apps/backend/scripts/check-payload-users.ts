import { PayloadUserSyncService } from '#services/payload_user_sync_service';
import payloadService from '#services/payload_service';
import User from '#models/user';

/**
 * Script to check Payload users and verify connectivity
 */
async function checkPayloadUsers() {
  try {
    console.log('🔍 Checking Payload CMS connectivity...\n');

    const payload = await payloadService.getPayload();

    // List all users in Payload
    const result = await payload.find({
      collection: 'users',
      limit: 100,
    });

    console.log(`✅ Found ${result.totalDocs} user(s) in Payload CMS:\n`);

    if (result.docs.length === 0) {
      console.log('⚠️  No users found in Payload CMS');
      return;
    }

    for (const user of result.docs) {
      console.log(`  📧 Email: ${user.email}`);
      console.log(`     Role: ${user.role || 'N/A'}`);
      console.log(`     ID: ${user.id}`);
      console.log(`     Name: ${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A');
      if (user.adonisUserId) {
        console.log(`     Adonis User ID: ${user.adonisUserId}`);
      }
      console.log('');
    }

    // Check for writer role users
    const writerUsers = result.docs.filter((u) => u.role === 'writer');
    if (writerUsers.length > 0) {
      console.log(`\n✅ Found ${writerUsers.length} writer(s):`);
      writerUsers.forEach((u) => {
        console.log(`   - ${u.email} (${u.id})`);
      });
    } else {
      console.log('\n⚠️  No users with writer role found');
    }

    // Check AdonisJS users with writer role
    console.log('\n🔍 Checking AdonisJS users with writer role...\n');
    const adonisWriters = await User.query().where('role', 'writer');
    console.log(`Found ${adonisWriters.length} writer(s) in AdonisJS:`);
    for (const user of adonisWriters) {
      console.log(`  📧 ${user.email}`);
      console.log(`     Adonis ID: ${user.id}`);
      console.log(`     Payload ID: ${user.payloadUserId || 'Not synced'}`);
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error checking Payload users:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

checkPayloadUsers()
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
