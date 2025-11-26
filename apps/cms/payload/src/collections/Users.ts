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
          label: 'Writer',
          value: 'writer',
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
  ],
  timestamps: true,
}
