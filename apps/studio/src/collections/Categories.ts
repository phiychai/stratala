import type { CollectionConfig } from 'payload'

/**
 * Categories Collection
 *
 * Categories for organizing posts.
 * Categories may be shared across all users or tenant-isolated.
 * For now, we'll make them shared (admins can manage, all can read).
 */
const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'createdAt'],
  },
  access: {
    // Everyone can read categories (for frontend)
    read: () => true,
    // Only admins and content admins can create categories
    create: ({ req: { user } }) => user && ['admin', 'content_admin'].includes(user.role),
    // Only admins and content admins can update categories
    update: ({ req: { user } }) => user && ['admin', 'content_admin'].includes(user.role),
    // Only admins can delete categories
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Category title',
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
            // Auto-generate slug from title if not provided
            if (!value && data?.title) {
              return data.title
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
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional description',
      },
    },
  ],
  timestamps: true,
}

export default Categories
