import type { CollectionConfig } from 'payload'

/**
 * Spaces Collection
 *
 * Spaces represent individual publications/stacks (like Substack publications).
 * Each space can have multiple users and owns its own content.
 *
 * Based on the official Payload multi-tenant example:
 * https://github.com/payloadcms/payload/blob/main/examples/multi-tenant/src/collections/Tenants/index.ts
 */
const Spaces: CollectionConfig = {
  slug: 'tenants', // Must be 'tenants' for multi-tenant plugin compatibility
  labels: {
    singular: 'Space',
    plural: 'Spaces',
  },
  access: {
    // Public read access for discovery/browsing (needed for explore page)
    // Authenticated users can also read all spaces
    // The tenants collection is NOT in the tenant-scoped collections list,
    // so the multi-tenant plugin should NOT filter it
    read: () => true, // Public read access for discovery
    // All authenticated users can create spaces
    create: ({ req: { user } }) => !!user,
    // Publishers can update spaces they created or are assigned to
    // Admins and content admins can update all spaces
    update: ({ req: { user } }) => {
      if (!user) return false
      // Admins and content admins can update all
      if (user.role === 'admin' || user.role === 'content_admin') return true
      // Publishers and other users can update (access will be checked per document)
      return true
    },
    // Only admins can delete spaces
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'domain', 'createdAt'],
    description: 'Spaces represent individual publications/stacks (like Substack publications)',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name for the space/publication',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly identifier for the space',
      },
    },
    {
      name: 'domain',
      type: 'text',
      required: true,
      admin: {
        description: 'Custom domain for this space',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who created this space',
        hidden: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        // Auto-set createdBy to current user on create
        if (operation === 'create' && req.user && !data.createdBy) {
          data.createdBy = req.user.id
        }
        // Remove tenant field if plugin tries to add it (tenants collection IS the tenant)
        if ('tenant' in data) {
          delete data.tenant
        }
        return data
      },
    ],
  },
  timestamps: true,
}

export default Spaces
