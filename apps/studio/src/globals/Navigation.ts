import type { GlobalConfig } from 'payload'

/**
 * Navigation Global
 *
 * Global navigation menu (singleton).
 */
const Navigation: GlobalConfig = {
  slug: 'navigation',
  admin: {
    // Hide Navigation global from non-admin users in admin UI
    hidden: ({ user }) => user?.role !== 'admin',
  },
  access: {
    read: () => true, // Public read access
    // Only admins can update navigation
    update: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Page',
              value: 'page',
            },
            {
              label: 'Post',
              value: 'post',
            },
            {
              label: 'URL',
              value: 'url',
            },
          ],
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          admin: {
            condition: (data, siblingData) =>
              // In array fields, use siblingData to access other fields in the same array item
              siblingData?.type === 'page',
            description: 'Select a page to link to',
          },
        },
        {
          name: 'post',
          type: 'relationship',
          relationTo: 'posts',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'post',
            description: 'Select a post to link to',
          },
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'url',
            description:
              'The URL to link to. Could be relative (ie /my-page) or a full external URL',
          },
        },
        {
          name: 'badge',
          type: 'group',
          fields: [
            {
              name: 'label',
              type: 'text',
              admin: {
                description: 'Badge text (e.g., "New", "Beta", "Pro")',
              },
            },
            {
              name: 'color',
              type: 'select',
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Success', value: 'success' },
                { label: 'Warning', value: 'warning' },
                { label: 'Error', value: 'error' },
                { label: 'Info', value: 'info' },
              ],
              defaultValue: 'primary',
              admin: {
                description: 'Badge color',
              },
            },
          ],
          admin: {
            description: 'Optional badge to display next to the navigation item',
          },
        },
        {
          name: 'children',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'type',
              type: 'select',
              required: true,
              options: [
                {
                  label: 'Page',
                  value: 'page',
                },
                {
                  label: 'Post',
                  value: 'post',
                },
                {
                  label: 'URL',
                  value: 'url',
                },
              ],
            },
            {
              name: 'page',
              type: 'relationship',
              relationTo: 'pages',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'page',
                description: 'Select a page to link to',
              },
            },
            {
              name: 'post',
              type: 'relationship',
              relationTo: 'posts',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'post',
                description: 'Select a post to link to',
              },
            },
            {
              name: 'url',
              type: 'text',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'url',
                description: 'The URL to link to',
              },
            },
          ],
          admin: {
            description: 'Nested navigation items',
          },
        },
      ],
      admin: {
        description: 'Navigation menu items',
      },
    },
  ],
}

export default Navigation
