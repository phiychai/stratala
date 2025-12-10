/**
 * Check users_tenants table structure and sequences
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const client = new pg.Client({
  connectionString: process.env.PAYLOAD_DATABASE_URI || process.env.DATABASE_URI
});

async function check() {
  await client.connect();

  // Check table structure
  const columns = await client.query(`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'users_tenants'
    ORDER BY ordinal_position;
  `);

  console.log('users_tenants columns:');
  columns.rows.forEach((r: any) => {
    console.log(`  ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable}, default: ${r.column_default || 'none'})`);
  });

  // Check sequences
  const sequences = await client.query(`
    SELECT sequence_name
    FROM information_schema.sequences
    WHERE sequence_name LIKE '%users_tenants%';
  `);

  console.log('\nSequences:');
  sequences.rows.forEach((r: any) => {
    console.log(`  - ${r.sequence_name}`);
  });

  // Check existing data
  const existing = await client.query('SELECT * FROM users_tenants LIMIT 3');
  console.log(`\nExisting rows: ${existing.rows.length}`);
  existing.rows.forEach((r: any) => {
    console.log('  ', r);
  });

  await client.end();
}

check().catch(console.error);

