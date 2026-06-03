/**
 * Script to assign default tenant to all users and documents
 *
 * Run: pnpm exec tsx src/scripts/assign-default-tenant.ts
 */

import pg from 'pg'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env') })

async function assignDefaultTenant() {
  const connectionString = process.env.PAYLOAD_DATABASE_URI || process.env.DATABASE_URI

  if (!connectionString) {
    console.error('Error: PAYLOAD_DATABASE_URI or DATABASE_URI environment variable is required')
    process.exit(1)
  }

  const client = new pg.Client({ connectionString })

  try {
    await client.connect()
    console.log('Assigning default tenant to users and documents...\n')

    // Get default tenant
    const tenantResult = await client.query(`
      SELECT id FROM tenants WHERE slug = 'default' LIMIT 1;
    `)

    if (!tenantResult.rows || tenantResult.rows.length === 0) {
      console.error('Error: Default tenant not found. Please create a tenant first.')
      process.exit(1)
    }

    const tenantId = tenantResult.rows[0].id
    console.log(`✓ Found default tenant (ID: ${tenantId})\n`)

    // Check if tenants column exists
    const columnCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'tenants';
    `)

    if (columnCheck.rows.length === 0) {
      console.log('⚠ Tenants column does not exist yet.')
      console.log('  Please start your Payload dev server first to create the schema.')
      console.log('  Then run this script again to assign tenants.')
      return
    }

    // Assign tenant to all users (add to tenants array)
    console.log('Step 1: Assigning tenant to users...')
    const usersResult = await client.query(`
      SELECT id, email, tenants FROM users;
    `)

    let usersUpdated = 0
    for (const user of usersResult.rows) {
      let tenants = user.tenants || []

      // Check if tenant is already assigned
      const hasTenant =
        Array.isArray(tenants) &&
        tenants.some((t: any) => {
          const tenantValue = typeof t === 'object' ? t.tenant : t
          return tenantValue === tenantId
        })

      if (!hasTenant) {
        // Add tenant to array
        const updatedTenants = [...tenants, { tenant: tenantId }]

        await client.query(
          `
          UPDATE users
          SET tenants = $1::jsonb
          WHERE id = $2;
        `,
          [JSON.stringify(updatedTenants), user.id],
        )

        usersUpdated++
        console.log(`  ✓ Assigned tenant to user: ${user.email}`)
      }
    }

    console.log(`✓ Updated ${usersUpdated} users\n`)

    // Assign tenant to all tenant-scoped documents
    console.log('Step 2: Assigning tenant to documents...')

    const tenantScopedCollections = [
      'spaces',
      'posts',
      'pages',
      'categories',
      'tags',
      'forms',
      'form_fields',
      'form_submissions',
      'form_submission_values',
    ]

    for (const collection of tenantScopedCollections) {
      try {
        // Check if table exists and has tenant column
        const tableCheck = await client.query(
          `
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = $1 AND column_name = 'tenant';
        `,
          [collection],
        )

        if (tableCheck.rows.length === 0) {
          console.log(`  ⚠ Skipping ${collection} - no tenant column (may not exist yet)`)
          continue
        }

        // Update documents without tenant
        const updateResult = await client.query(
          `
          UPDATE ${collection}
          SET tenant = $1
          WHERE tenant IS NULL;
        `,
          [tenantId],
        )

        if (updateResult.rowCount && updateResult.rowCount > 0) {
          console.log(`  ✓ Updated ${updateResult.rowCount} documents in ${collection}`)
        }
      } catch (error: any) {
        // Table might not exist yet
        if (error.code === '42P01') {
          console.log(`  ⚠ Skipping ${collection} - table does not exist yet`)
        } else {
          console.warn(`  ⚠ Error updating ${collection}:`, error.message)
        }
      }
    }

    console.log('\n✅ Default tenant assignment complete!')
    console.log('\nNext steps:')
    console.log('1. Restart your Payload dev server')
    console.log('2. You should now be able to see documents')
    console.log('3. Users can register without selecting a tenant (will be assigned later)')
  } catch (error) {
    console.error('Error assigning tenant:', error)
    throw error
  } finally {
    await client.end()
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  assignDefaultTenant()
    .then(() => {
      console.log('\nScript completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\nScript failed:', error)
      process.exit(1)
    })
}

export default assignDefaultTenant
