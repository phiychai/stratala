/**
 * Initial setup script for multi-tenant system
 *
 * This script should be run AFTER the Payload server has started and created the schema.
 * It will:
 * 1. Verify default tenant exists
 * 2. Assign default tenant to all users
 * 3. Assign default tenant to all documents
 *
 * Run: pnpm exec tsx src/scripts/initial-setup.ts
 */

import pg from 'pg'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env') })

async function initialSetup() {
  const connectionString = process.env.PAYLOAD_DATABASE_URI || process.env.DATABASE_URI

  if (!connectionString) {
    console.error('Error: PAYLOAD_DATABASE_URI or DATABASE_URI environment variable is required')
    process.exit(1)
  }

  const client = new pg.Client({ connectionString })

  try {
    await client.connect()
    console.log('🚀 Starting multi-tenant initial setup...\n')

    // Step 1: Get or create default tenant
    console.log('Step 1: Checking for default tenant...')
    let tenantResult = await client.query(`
      SELECT id FROM tenants WHERE slug = 'default' LIMIT 1;
    `)

    let tenantId
    if (!tenantResult.rows || tenantResult.rows.length === 0) {
      console.log('  Creating default tenant...')
      const createResult = await client.query(`
        INSERT INTO tenants (name, slug, domain, created_at, updated_at)
        VALUES ('Default Tenant', 'default', 'localhost', NOW(), NOW())
        RETURNING id;
      `)
      tenantId = createResult.rows[0].id
      console.log(`  ✓ Created default tenant (ID: ${tenantId})`)
    } else {
      tenantId = tenantResult.rows[0].id
      console.log(`  ✓ Default tenant exists (ID: ${tenantId})`)
    }

    // Step 2: Check if tenants column exists on users
    console.log('\nStep 2: Checking schema...')
    const columnCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'tenants';
    `)

    if (columnCheck.rows.length === 0) {
      console.log('  ⚠ Tenants column does not exist yet.')
      console.log('  Please start your Payload dev server first to create the schema.')
      console.log('  Then run this script again.')
      return
    }

    console.log('  ✓ Schema is ready')

    // Step 3: Assign tenant to all users
    console.log('\nStep 3: Assigning tenant to users...')
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
          const tenantValue = typeof t === 'object' && t !== null ? t.tenant : t
          return tenantValue === tenantId || tenantValue === String(tenantId)
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

    if (usersUpdated === 0) {
      console.log('  ✓ All users already have tenant assigned')
    } else {
      console.log(`  ✓ Updated ${usersUpdated} users`)
    }

    // Step 4: Assign tenant to all documents
    console.log('\nStep 4: Assigning tenant to documents...')

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

    let totalDocsUpdated = 0
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
          continue // Table or column doesn't exist yet
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
          totalDocsUpdated += updateResult.rowCount
        }
      } catch (error: any) {
        // Table might not exist yet - that's okay
        if (error.code !== '42P01') {
          console.warn(`  ⚠ Error updating ${collection}:`, error.message)
        }
      }
    }

    if (totalDocsUpdated > 0) {
      console.log(`\n  ✓ Updated ${totalDocsUpdated} total documents`)
    } else {
      console.log('  ✓ All documents already have tenant assigned (or no documents exist yet)')
    }

    console.log('\n✅ Initial setup complete!')
    console.log('\nYou should now be able to:')
    console.log('1. Access all documents in the admin UI')
    console.log('2. Create new tenants')
    console.log('3. Register new users (tenants field is optional)')
  } catch (error) {
    console.error('Error during setup:', error)
    throw error
  } finally {
    await client.end()
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initialSetup()
    .then(() => {
      console.log('\nScript completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\nScript failed:', error)
      process.exit(1)
    })
}

export default initialSetup
