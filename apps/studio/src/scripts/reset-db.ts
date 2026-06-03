/**
 * Script to reset the database and set up multi-tenant from scratch
 *
 * WARNING: This will delete all data in the database!
 *
 * Run: pnpm exec tsx src/scripts/reset-db.ts
 */

import pg from 'pg'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env') })

async function resetDatabase() {
  const connectionString = process.env.PAYLOAD_DATABASE_URI || process.env.DATABASE_URI

  if (!connectionString) {
    console.error('Error: PAYLOAD_DATABASE_URI or DATABASE_URI environment variable is required')
    process.exit(1)
  }

  // Parse connection string to get database name
  const url = new URL(connectionString.replace('postgresql://', 'http://'))
  const dbName = url.pathname.slice(1) // Remove leading /
  const baseConnectionString = connectionString.replace(`/${dbName}`, '/postgres')

  const client = new pg.Client({ connectionString: baseConnectionString })

  try {
    await client.connect()
    console.log('⚠️  WARNING: This will delete all data in the database!')
    console.log(`Database: ${dbName}`)
    console.log('\nDropping database...')

    // Terminate all connections to the database first
    await client.query(
      `
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
        AND pid <> pg_backend_pid();
    `,
      [dbName],
    )

    // Drop the database
    await client.query(`DROP DATABASE IF EXISTS ${dbName};`)
    console.log(`✓ Dropped database: ${dbName}`)

    // Create the database
    await client.query(`CREATE DATABASE ${dbName};`)
    console.log(`✓ Created database: ${dbName}`)

    console.log('\n✅ Database reset complete!')
    console.log('\nNext steps:')
    console.log('1. Restart your Payload dev server')
    console.log('2. The schema will be automatically created')
    console.log('3. Create your first tenant in the admin UI')
    console.log('4. Assign users and documents to tenants')
  } catch (error) {
    console.error('Error resetting database:', error)
    throw error
  } finally {
    await client.end()
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  resetDatabase()
    .then(() => {
      console.log('\nScript completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\nScript failed:', error)
      process.exit(1)
    })
}

export default resetDatabase
