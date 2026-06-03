/**
 * Script to drop tenant_id column from users table
 *
 * This removes the old tenant_id column so the multi-tenant plugin
 * can add the new tenants array field without conflicts.
 *
 * Run: tsx src/scripts/drop-tenant-id-column.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'

async function dropTenantIdColumn() {
  const payload = await getPayload({ config })
  const db = payload.db

  try {
    console.log('Dropping tenant_id column from users table...')

    // Use Drizzle to drop the column
    // The db object has access to the Drizzle instance
    const sql = db.drizzle

    // Execute raw SQL to drop the column
    await db.drizzle.execute(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS tenant_id;
    `)

    console.log('✓ Successfully dropped tenant_id column')
    console.log('You can now restart the dev server and the schema push should complete')
  } catch (error) {
    console.error('Error dropping column:', error)
    throw error
  } finally {
    // Don't close the connection as Payload manages it
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  dropTenantIdColumn()
    .then(() => {
      console.log('Script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Script failed:', error)
      process.exit(1)
    })
}

export default dropTenantIdColumn
