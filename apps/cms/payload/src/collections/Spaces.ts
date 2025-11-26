import type { CollectionConfig } from 'payload';

/**
 * Spaces Collection
 *
 * Spaces are user-owned collections for organizing posts.
 * Each user can create multiple spaces, with one marked as "default" for general articles.
 *
 * Multi-tenant access control:
 * - Users can only read/edit their own spaces
 * - Admins and content admins can read/edit all spaces
 * - Writers can only access their own spaces
 */
const Spaces: CollectionConfig = {
  slug: 'spaces',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'owner', 'isDefault', 'createdAt'],
  },
  access: {
    // Admins and content admins can read all spaces
    read: ({ req: { user } }) => {
      if (user && ['admin', 'content_admin'].includes(user.role)) {
        return true;
      }
      // Writers and editors can only read their own spaces
      if (user) {
        return {
          owner: {
            equals: user.id,
          },
        };
      }
      return false;
    },
    // Only authenticated users can create spaces (for their own account)
    create: ({ req: { user } }) => !!user,
    // Users can update their own spaces, admins can update any
    update: ({ req: { user } }) => {
      if (user && ['admin', 'content_admin'].includes(user.role)) {
        return true;
      }
      if (user) {
        return {
          owner: {
            equals: user.id,
          },
        };
      }
      return false;
    },
    // Users can delete their own spaces, admins can delete any
    delete: ({ req: { user } }) => {
      if (user && ['admin', 'content_admin'].includes(user.role)) {
        return true;
      }
      if (user) {
        return {
          owner: {
            equals: user.id,
          },
        };
      }
      return false;
    },
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (unique per owner)',
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
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name for the space',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional description of the space',
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who owns this space',
      },
      // Automatically set to current user on create
      hooks: {
        beforeChange: [
          ({ req, value }) => {
            // If no value provided, use current user
            if (!value && req.user) {
              return req.user.id;
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'If true, this is the default space for articles',
      },
    },
  ],
  timestamps: true,
};

export default Spaces;

