import type { CollectionConfig } from 'payload';

/**
 * Tenants Collection
 *
 * Tenants represent individual sites/publications in the multi-tenant system.
 * Each tenant can have multiple users and owns its own content.
 */
const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'domain', 'createdAt'],
  },
  // Tenants collection should NOT be tenant-scoped
  // It's the collection that defines tenants, so it must be global
  access: {
    // Allow all authenticated users to read tenants
    read: ({ req: { user } }) => !!user,
    // Allow all authenticated users to create tenants (for initial setup)
    // You can restrict this later if needed
    create: ({ req: { user } }) => !!user,
    // Allow all authenticated users to update tenants
    update: ({ req: { user } }) => !!user,
    // Only admins can delete tenants
    delete: ({ req: { user } }) => {
      return user && ['admin', 'content_admin'].includes(user.role);
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name for the tenant/site',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier for the tenant',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            // Ensure slug is lowercase and URL-friendly
            if (typeof value === 'string') {
              return value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'domain',
      type: 'text',
      required: true,
      admin: {
        description: 'Custom domain for this tenant',
      },
    },
  ],
  timestamps: true,
};

export default Tenants;

