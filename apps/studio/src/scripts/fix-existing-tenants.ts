/**
 * Script to assign default tenant to existing users and documents
 * Works with the junction table structure created by the multi-tenant plugin
 *
 * Run: pnpm exec tsx src/scripts/fix-existing-tenants.ts
 */

import pg from 'pg'
import dotenv from 'dotenv'
import { resolve } from 'path'
import { randomUUID } from 'crypto'

dotenv.config({ path: resolve(process.cwd(), '.env') })

async function fixExistingTenants() {
  const connectionString = process.env.PAYLOAD_DATABASE_URI || process.env.DATABASE_URI

  if (!connectionString) {
    console.error('Error: PAYLOAD_DATABASE_URI or DATABASE_URI environment variable is required')
    process.exit(1)
  }

  const client = new pg.Client({ connectionString })

  try {
    await client.connect()
    console.log('🔧 Fixing tenant assignments for existing users and documents...\n')

    // Get default tenant
    const tenantResult = await client.query(`
      SELECT id FROM tenants WHERE slug = 'default' LIMIT 1;
    `)

    if (!tenantResult.rows || tenantResult.rows.length === 0) {
      console.error(
        '❌ Error: Default tenant not found. Please create a tenant with slug "default" first.',
      )
      process.exit(1)
    }

    const tenantId = tenantResult.rows[0].id
    console.log(`✓ Found default tenant (ID: ${tenantId})\n`)

    // Step 1: Assign tenant to all users via junction table
    console.log('Step 1: Assigning tenant to users...')
    const usersResult = await client.query(`
      SELECT id, email FROM users;
    `)

    let usersUpdated = 0
    for (const user of usersResult.rows) {
      // Check if relationship already exists
      const existing = await client.query(
        `
        SELECT id FROM users_tenants
        WHERE _parent_id = $1 AND tenant_id = $2;
      `,
        [user.id, tenantId],
      )

      if (existing.rows.length === 0) {
        // Insert relationship - id is VARCHAR (UUID), so generate one
        try {
          await client.query(
            `
            INSERT INTO users_tenants (id, _parent_id, tenant_id, _order)
            VALUES ($1, $2, $3, 0);
          `,
            [randomUUID(), user.id, tenantId],
          )

          usersUpdated++
          console.log(`  ✓ Assigned tenant to user: ${user.email}`)
        } catch (error: any) {
          // Ignore duplicate key errors
          if (error.code !== '23505') {
            console.warn(`  ⚠ Error assigning tenant to ${user.email}:`, error.message)
          }
        }
      }
    }

    if (usersUpdated === 0) {
      console.log('  ✓ All users already have tenant assigned')
    } else {
      console.log(`  ✓ Updated ${usersUpdated} users`)
    }

    // Step 2: Assign tenant to all tenant-scoped documents
    console.log('\nStep 2: Assigning tenant to documents...')

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
      console.log('\n  ✓ All documents already have tenant assigned (or no documents exist yet)')
    }

    console.log('\n✅ Tenant assignment complete!')
    console.log('\nNext steps:')
    console.log('1. Restart your Payload dev server')
    console.log('2. You should now be able to see documents')
    console.log('3. New users will automatically get the default tenant via the hook')
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await client.end()
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixExistingTenants()
    .then(() => {
      console.log('\n✅ Script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error)
      process.exit(1)
    })
}

export default fixExistingTenants
