/**
 * Script to check current database schema
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

async function checkSchema() {
  const connectionString = process.env.PAYLOAD_DATABASE_URI || process.env.DATABASE_URI;

  if (!connectionString) {
    console.error('Error: PAYLOAD_DATABASE_URI or DATABASE_URI environment variable is required');
    process.exit(1);
  }

  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    console.log('Checking database schema...\n');

    // List all tables
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('Tables:');
    if (tablesResult.rows.length === 0) {
      console.log('  ⚠ No tables found - schema has not been created yet');
    } else {
      tablesResult.rows.forEach((row: any) => {
        console.log(`  - ${row.table_name}`);
      });
    }

    // Check users table structure
    if (tablesResult.rows.some((r: any) => r.table_name === 'users')) {
      console.log('\nUsers table columns:');
      const columnsResult = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
      `);
      columnsResult.rows.forEach((row: any) => {
        console.log(`  - ${row.column_name} (${row.data_type})`);
      });

      // Check specifically for tenants column
      const tenantsColumn = columnsResult.rows.find((r: any) => r.column_name === 'tenants');
      if (tenantsColumn) {
        console.log('\n✓ Tenants column exists');
      } else {
        console.log('\n⚠ Tenants column does NOT exist');
        console.log('  The schema push may be stuck or failed.');
        console.log('  Try restarting the Payload dev server.');
      }
    }

    // Check tenants table
    if (tablesResult.rows.some((r: any) => r.table_name === 'tenants')) {
      console.log('\nTenants table exists');
      const tenantCount = await client.query('SELECT COUNT(*) FROM tenants');
      console.log(`  Total tenants: ${tenantCount.rows[0].count}`);
    } else {
      console.log('\n⚠ Tenants table does NOT exist');
    }

  } catch (error) {
    console.error('Error checking schema:', error);
    throw error;
  } finally {
    await client.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  checkSchema()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export default checkSchema;

