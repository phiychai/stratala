/**
 * Script to create a default tenant directly via database
 * This bypasses Payload access control to solve the chicken-and-egg problem
 *
 * Run: pnpm exec tsx src/scripts/create-default-tenant-ts.ts
 */

import pg from 'pg'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env') })

async function createDefaultTenant() {
  const connectionString = process.env.PAYLOAD_DATABASE_URI || process.env.DATABASE_URI

  if (!connectionString) {
    console.error('Error: PAYLOAD_DATABASE_URI or DATABASE_URI environment variable is required')
    process.exit(1)
  }

  const client = new pg.Client({ connectionString })

  try {
    await client.connect()
    console.log('Creating default tenant directly in database...')

    // Create tenant (id is auto-generated, so we don't specify it)
    const insertResult = await client.query(`
      INSERT INTO tenants (name, slug, domain, created_at, updated_at)
      VALUES (
        'Default Tenant',
        'default',
        '',
        NOW(),
        NOW()
      )
      ON CONFLICT (slug) DO NOTHING
      RETURNING id, name, slug;
    `)

    if (insertResult.rows && insertResult.rows.length > 0) {
      const tenant = insertResult.rows[0]
      console.log(`✓ Created default tenant:`)
      console.log(`  ID: ${tenant.id}`)
      console.log(`  Name: ${tenant.name}`)
      console.log(`  Slug: ${tenant.slug}`)
      console.log('\nNext steps:')
      console.log('1. Restart your Payload dev server')
      console.log('2. Go to Collections → Users → Edit your user')
      console.log('3. Add the default tenant to your "Tenants" field')
      console.log('4. Assign existing documents to this tenant')
    } else {
      console.log('✓ Default tenant already exists')
      const existing = await client.query(`
        SELECT id, name, slug FROM tenants WHERE slug = 'default';
      `)
      if (existing.rows && existing.rows.length > 0) {
        const tenant = existing.rows[0]
        console.log(`  ID: ${tenant.id}`)
        console.log(`  Name: ${tenant.name}`)
        console.log(`  Slug: ${tenant.slug}`)
      }
    }
  } catch (error) {
    console.error('Error creating tenant:', error)
    throw error
  } finally {
    await client.end()
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createDefaultTenant()
    .then(() => {
      console.log('\nScript completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\nScript failed:', error)
      process.exit(1)
    })
}

export default createDefaultTenant
