/**
 * Script to migrate tenant column to tenant_id
 * Payload's multi-tenant plugin expects tenant_id as the database column name
 *
 * Run: pnpm exec tsx src/scripts/migrate-tenant-to-tenant-id.ts
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

async function migrateToTenantId() {
  const connectionString = process.env.PAYLOAD_DATABASE_URI || process.env.DATABASE_URI;

  if (!connectionString) {
    console.error('Error: PAYLOAD_DATABASE_URI or DATABASE_URI environment variable is required');
    process.exit(1);
  }

  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    console.log('🔄 Migrating tenant columns to tenant_id (as expected by Payload plugin)...\n');

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
        // Check if tenant exists
        const tenantCheck = await client.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = $1 AND column_name = 'tenant';
        `, [collection]);

        // Check if tenant_id exists
        const tenantIdCheck = await client.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = $1 AND column_name = 'tenant_id';
        `, [collection]);

        if (tenantCheck.rows.length > 0 && tenantIdCheck.rows.length === 0) {
          // Rename tenant to tenant_id
          console.log(`  Migrating ${collection}...`);

          // First, drop the foreign key constraint if it exists
          const fkCheck = await client.query(`
            SELECT constraint_name
            FROM information_schema.table_constraints
            WHERE table_name = $1
              AND constraint_type = 'FOREIGN KEY'
              AND constraint_name LIKE '%tenant%';
          `, [collection]);

          if (fkCheck.rows.length > 0) {
            for (const fk of fkCheck.rows) {
              await client.query(`
                ALTER TABLE ${collection}
                DROP CONSTRAINT IF EXISTS ${fk.constraint_name};
              `);
            }
            console.log(`    ✓ Dropped foreign key constraints`);
          }

          // Rename the column
          await client.query(`
            ALTER TABLE ${collection}
            RENAME COLUMN tenant TO tenant_id;
          `);

          console.log(`    ✓ Renamed tenant to tenant_id in ${collection}`);
        } else if (tenantIdCheck.rows.length > 0) {
          console.log(`  ✓ ${collection} already has tenant_id column`);
        } else if (tenantCheck.rows.length > 0) {
          console.log(`  ⚠ ${collection} has tenant but migration needed - check manually`);
        } else {
          console.log(`  ⚠ ${collection} has neither - will be created by plugin`);
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
    console.log('2. Accept the schema push (it should now match)');
    console.log('3. The plugin will recreate the foreign key constraints');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToTenantId()
    .then(() => {
      console.log('\n✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export default migrateToTenantId;

