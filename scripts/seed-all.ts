/**
 * Comprehensive seed script wrapper
 *
 * This script is a wrapper that calls the AdonisJS seed command.
 * The actual seeding logic is in apps/backend/commands/seed_all.ts
 *
 * Run: pnpm seed:all
 * Or with password: SEED_PASSWORD=yourpassword pnpm seed:all
 */

console.log('⚠️  This script is a wrapper. Use: pnpm seed:all');
console.log('   Or: cd apps/backend && node ace seed:all\n');
console.log('   The actual seeding logic is in apps/backend/commands/seed_all.ts\n');

process.exit(0);
