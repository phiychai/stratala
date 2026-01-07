import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'createdAt'],
    // Hide Users collection from non-admin users in admin UI
    hidden: ({ user }) => user?.role !== 'admin',
  },
  access: {
    // Only admins can create users (via API for sync, this is handled by backend)
    create: ({ req: { user } }) => user?.role === 'admin',
    // Only admins can read all users
    // Public can read users (needed for author relationships in posts)
    // Users can read their own profile
    read: ({ req: { user } }) => {
      // Admins have full access
      if (user?.role === 'admin') {
        return true
      }
      // Users can read their own profile
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
  // Note: Space assignment is handled by PayloadUserSyncService in the backend
  // No hooks needed here as the sync service manages space creation and assignment
  timestamps: true,
}
