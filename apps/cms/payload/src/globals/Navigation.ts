import type { GlobalConfig } from 'payload';

/**
 * Navigation Global
 *
 * Global navigation menu (singleton).
 */
const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: {
    read: () => true, // Public read access
    update: ({ req: { user } }) => {
      return user && ['admin', 'content_admin'].includes(user.role);
    },
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
            condition: (data) => data.type === 'page',
          },
        },
        {
          name: 'post',
          type: 'relationship',
          relationTo: 'posts',
          admin: {
            condition: (data) => data.type === 'post',
          },
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            condition: (data) => data.type === 'url',
            description: 'The URL to link to. Could be relative (ie /my-page) or a full external URL',
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
                condition: (data) => data.type === 'page',
              },
            },
            {
              name: 'post',
              type: 'relationship',
              relationTo: 'posts',
              admin: {
                condition: (data) => data.type === 'post',
              },
            },
            {
              name: 'url',
              type: 'text',
              admin: {
                condition: (data) => data.type === 'url',
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
};

export default Navigation;

