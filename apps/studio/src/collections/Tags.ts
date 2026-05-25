import type { CollectionConfig } from 'payload'

/**
 * Tags Collection
 *
 * Tags for organizing posts.
 * Tags may be shared across all users or tenant-isolated.
 * For now, we'll make them shared (admins can manage, all can read).
 */
const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'color', 'createdAt'],
  },
  access: {
    // Everyone can read tags (for frontend)
    read: () => true,
    // Only admins and content admins can create tags
    create: ({ req: { user } }) => user && ['admin', 'content_admin'].includes(user.role),
    // Only admins and content admins can update tags
    update: ({ req: { user } }) => user && ['admin', 'content_admin'].includes(user.role),
    // Only admins can delete tags
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Tag name',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            // Auto-generate slug from name if not provided
            if (!value && data?.name) {
              return data.name
                .toLowerCase()
                .replace(/[^\da-z]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            if (typeof value === 'string') {
              return value.toLowerCase().replace(/[^\da-z-]/g, '-')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Optional color (e.g., #AABBCC)',
      },
    },
  ],
  timestamps: true,
}

export default Tags
