/**
 * Script to migrate tenant_id columns to tenant columns
 * The multi-tenant plugin expects 'tenant' not 'tenant_id'
 *
 * Run: pnpm exec tsx src/scripts/migrate-tenant-id-to-tenant.ts
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

async function migrateTenantColumns() {
  const connectionString = process.env.PAYLOAD_DATABASE_URI || process.env.DATABASE_URI;

  if (!connectionString) {
    console.error('Error: PAYLOAD_DATABASE_URI or DATABASE_URI environment variable is required');
    process.exit(1);
  }

  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    console.log('🔄 Migrating tenant_id columns to tenant columns...\n');

    const collections = [
      'spaces',
      'posts',
      'pages',
      'categories',
      'tags',
      'forms',
      'form_fields',
      'form_submissions',
      'form_submission_values'
    ];

    for (const collection of collections) {
      try {
        // Check if tenant_id exists
        const tenantIdCheck = await client.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = $1 AND column_name = 'tenant_id';
        `, [collection]);

        // Check if tenant exists
        const tenantCheck = await client.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = $1 AND column_name = 'tenant';
        `, [collection]);

        if (tenantIdCheck.rows.length > 0 && tenantCheck.rows.length === 0) {
          // Rename tenant_id to tenant
          console.log(`  Migrating ${collection}...`);

          // Get the data type and constraints
          const columnInfo = await client.query(`
            SELECT data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = $1 AND column_name = 'tenant_id';
          `, [collection]);

          if (columnInfo.rows.length > 0) {
            const { data_type, is_nullable, column_default } = columnInfo.rows[0];

            // Rename the column
            await client.query(`
              ALTER TABLE ${collection}
              RENAME COLUMN tenant_id TO tenant;
            `);

            console.log(`    ✓ Renamed tenant_id to tenant in ${collection}`);
          }
        } else if (tenantIdCheck.rows.length > 0 && tenantCheck.rows.length > 0) {
          // Both exist - migrate data and drop tenant_id
          console.log(`  Migrating ${collection} (both columns exist)...`);

          // Copy data from tenant_id to tenant where tenant is null
          await client.query(`
            UPDATE ${collection}
            SET tenant = tenant_id
            WHERE tenant IS NULL AND tenant_id IS NOT NULL;
          `);

          // Drop tenant_id
          await client.query(`
            ALTER TABLE ${collection}
            DROP COLUMN tenant_id;
          `);

          console.log(`    ✓ Migrated data and dropped tenant_id in ${collection}`);
        } else if (tenantCheck.rows.length > 0) {
          console.log(`  ✓ ${collection} already has tenant column`);
        } else {
          console.log(`  ⚠ ${collection} has neither tenant_id nor tenant - will be created by plugin`);
        }
      } catch (error: any) {
        if (error.code === '42P01') {
          console.log(`  ⚠ ${collection} table does not exist yet`);
        } else {
          console.warn(`  ⚠ Error migrating ${collection}:`, error.message);
        }
      }
    }

    console.log('\n✅ Migration complete!');
    console.log('\nNext steps:');
    console.log('1. Restart your Payload dev server');
    console.log('2. The plugin will add the tenant field to the admin UI');
    console.log('3. A tenant selector dropdown will appear in the admin panel');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateTenantColumns()
    .then(() => {
      console.log('\n✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export default migrateTenantColumns;

