import type { CollectionConfig } from 'payload';

/**
 * Redirects Collection
 *
 * URL redirects for the site.
 * Only admins can manage redirects.
 */
const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: {
    useAsTitle: 'urlFrom',
    defaultColumns: ['urlFrom', 'urlTo', 'responseCode', 'createdAt'],
  },
  access: {
    // Everyone can read redirects (for frontend routing)
    read: () => true,
    // Only admins can create redirects
    create: ({ req: { user } }) => user?.role === 'admin',
    // Only admins can update redirects
    update: ({ req: { user } }) => user?.role === 'admin',
    // Only admins can delete redirects
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'urlFrom',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Old URL (relative to site, e.g., /blog or /news)',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            // Ensure URL starts with /
            if (typeof value === 'string' && !value.startsWith('/')) {
              return `/${value}`;
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'urlTo',
      type: 'text',
      required: true,
      admin: {
        description: 'The URL you\'re redirecting to (can be relative or full URL)',
      },
    },
    {
      name: 'responseCode',
      type: 'select',
      required: true,
      defaultValue: '301',
      options: [
        {
          label: '301 - Permanent Redirect',
          value: '301',
        },
        {
          label: '302 - Temporary Redirect',
          value: '302',
        },
      ],
      admin: {
        description: 'HTTP response code for the redirect',
      },
    },
    {
      name: 'note',
      type: 'textarea',
      admin: {
        description: 'Short explanation of why the redirect was created',
      },
    },
  ],
  timestamps: true,
};

export default Redirects;
