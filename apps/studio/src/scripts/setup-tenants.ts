/**
 * Setup script for multi-tenant migration
 *
 * This script:
 * 1. Creates a default tenant if none exists
 * 2. Assigns all users to the default tenant
 * 3. Assigns all existing documents to the default tenant
 *
 * Run: pnpm exec tsx src/scripts/setup-tenants.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env') })

async function setupTenants() {
  if (!process.env.PAYLOAD_SECRET) {
    console.error('Error: PAYLOAD_SECRET environment variable is required')
    process.exit(1)
  }

  const payload = await getPayload({ config })

  try {
    console.log('Setting up multi-tenant system...\n')

    // Step 1: Create default tenant if it doesn't exist
    console.log('Step 1: Creating default tenant...')
    let defaultTenant

    const existingTenants = await payload.find({
      collection: 'tenants',
      where: {
        slug: {
          equals: 'default',
        },
      },
      limit: 1,
    })

    if (existingTenants.docs.length > 0) {
      defaultTenant = existingTenants.docs[0]
      console.log(`✓ Default tenant already exists (ID: ${defaultTenant.id})`)
    } else {
      defaultTenant = await payload.create({
        collection: 'tenants',
        data: {
          name: 'Default Tenant',
          slug: 'default',
          domain: '',
        },
      })
      console.log(`✓ Created default tenant (ID: ${defaultTenant.id})`)
    }

    // Step 2: Assign all users to the default tenant
    console.log('\nStep 2: Assigning users to default tenant...')
    const users = await payload.find({
      collection: 'users',
      limit: 1000,
    })

    let usersUpdated = 0
    for (const user of users.docs) {
      const tenants = (user as any).tenants || []
      const hasDefaultTenant = tenants.some(
        (t: any) => (typeof t === 'string' ? t : t.tenant) === defaultTenant.id,
      )

      if (!hasDefaultTenant) {
        await payload.update({
          collection: 'users',
          id: user.id,
          data: {
            tenants: [
              ...tenants,
              {
                tenant: defaultTenant.id,
              },
            ],
          },
        })
        usersUpdated++
        console.log(`  ✓ Assigned user ${user.email} to default tenant`)
      }
    }

    console.log(`✓ Updated ${usersUpdated} users`)

    // Step 3: Assign existing documents to the default tenant
    console.log('\nStep 3: Assigning existing documents to default tenant...')

    const tenantScopedCollections = ['spaces', 'posts', 'pages', 'categories', 'tags']

    for (const collectionSlug of tenantScopedCollections) {
      try {
        const items = await payload.find({
          collection: collectionSlug as any,
          where: {
            tenant: {
              exists: false,
            },
          },
          limit: 1000,
        })

        if (items.docs.length > 0) {
          console.log(`  Processing ${items.docs.length} items in ${collectionSlug}...`)

          for (const item of items.docs) {
            try {
              await payload.update({
                collection: collectionSlug as any,
                id: item.id,
                data: {
                  tenant: defaultTenant.id,
                },
              })
            } catch (error) {
              console.warn(
                `    ⚠ Failed to update ${collectionSlug} item ${item.id}:`,
                (error as Error).message,
              )
            }
          }

          console.log(`  ✓ Updated ${items.docs.length} items in ${collectionSlug}`)
        }
      } catch (error) {
        console.warn(`  ⚠ Could not process ${collectionSlug}:`, (error as Error).message)
      }
    }

    console.log('\n✓ Multi-tenant setup completed!')
    console.log('\nNext steps:')
    console.log('1. Restart your dev server')
    console.log('2. Log in to Payload admin')
    console.log('3. You should now be able to see documents')
    console.log('4. Create additional tenants as needed')
  } catch (error) {
    console.error('Error setting up tenants:', error)
    throw error
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupTenants()
    .then(() => {
      console.log('\nScript completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\nScript failed:', error)
      process.exit(1)
    })
}

export default setupTenants
