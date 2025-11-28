import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'createdAt'],
  },
  access: {
    // Allow anyone to create a user (e.g., via API for sync)
    create: () => true,
    // Admins can read all users
    // Public can read users (needed for author relationships in posts)
    // Users can read their own profile
    read: ({ req: { user } }) => {
      if (user && user.role === 'admin') {
        return true
      }
      // Allow public read access for author relationships in published content
      // Users can also read their own profile
      if (user) {
        return {
          id: {
            equals: user.id,
          },
        }
      }
      // Public access - allow reading users (needed for populating author in posts)
      return true
    },
    // Only admins can update users
    update: ({ req: { user } }) => user?.role === 'admin',
    // Only admins can delete users
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Content Admin',
          value: 'content_admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'Publisher',
          value: 'publisher',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
      defaultValue: 'user',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    // Email and password are added by default by auth: true
    // The multi-tenant plugin will automatically add a 'tenants' field
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation, payload }) => {
        // During registration (create operation without existing user),
        // automatically assign default tenant if none provided
        // Based on official Payload multi-tenant example:
        // https://github.com/payloadcms/payload/tree/main/examples/multi-tenant
        if (operation === 'create' && !req.user) {
          // If no tenants provided, assign default tenant
          if (!data.tenants || (Array.isArray(data.tenants) && data.tenants.length === 0)) {
            try {
              // Find default tenant
              const defaultTenant = await payload.find({
                collection: 'tenants',
                where: {
                  slug: {
                    equals: 'default',
                  },
                },
                limit: 1,
              });

              if (defaultTenant.docs && defaultTenant.docs.length > 0) {
                // Assign tenant ID directly (plugin handles the relationship)
                data.tenants = [defaultTenant.docs[0].id];
              }
            } catch (error) {
              // If tenant lookup fails, allow empty tenants (will be assigned later)
              console.warn('Could not assign default tenant:', error);
              data.tenants = [];
            }
          }
        }
        return data;
      },
    ],
  },
  timestamps: true,
}
