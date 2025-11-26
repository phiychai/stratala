import type { CollectionConfig } from 'payload';

/**
 * Pages Collection
 *
 * Static pages with page builder blocks.
 *
 * Multi-tenant access control:
 * - Users can only read/edit their own pages
 * - Admins and content admins can read/edit all pages
 * - Editors can read/edit all pages
 * - Writers can only access their own pages
 */
const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'permalink', 'status', 'publishedAt', 'createdAt'],
  },
  versions: {
    drafts: true,
  },
  access: {
    // Admins and content admins can read all pages
    read: ({ req: { user } }) => {
      if (user && ['admin', 'content_admin'].includes(user.role)) {
        return true;
      }
      // Editors can read all pages
      if (user?.role === 'editor') {
        return true;
      }
      // Writers can only read their own pages
      if (user?.role === 'writer') {
        return {
          createdBy: {
            equals: user.id,
          },
        };
      }
      // Public read access for published pages (for frontend)
      return {
        status: {
          equals: 'published',
        },
      };
    },
    // Only authenticated users can create pages
    create: ({ req: { user } }) => !!user,
    // Users can update their own pages, admins/content admins can update any
    update: ({ req: { user } }) => {
      if (user && ['admin', 'content_admin'].includes(user.role)) {
        return true;
      }
      // Editors can update all pages
      if (user?.role === 'editor') {
        return true;
      }
      // Writers can only update their own pages
      if (user?.role === 'writer') {
        return {
          createdBy: {
            equals: user.id,
          },
        };
      }
      return false;
    },
    // Users can delete their own pages, admins can delete any
    delete: ({ req: { user } }) => {
      if (user && ['admin', 'content_admin'].includes(user.role)) {
        return true;
      }
      if (user?.role === 'writer') {
        return {
          createdBy: {
            equals: user.id,
          },
        };
      }
      return false;
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'The title of this page',
      },
    },
    {
      name: 'permalink',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique URL for this page (start with /, can have multiple segments /about/me)',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            // Ensure permalink starts with /
            if (typeof value === 'string' && !value.startsWith('/')) {
              return `/${value}`;
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'In Review',
          value: 'in_review',
        },
        {
          label: 'Published',
          value: 'published',
        },
      ],
      admin: {
        description: 'Is this page published?',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        description: 'Publish now or schedule for later',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'blocks',
      type: 'blocks',
      minRows: 0,
      blocks: [
        {
          slug: 'hero',
          fields: [
            {
              name: 'tagline',
              type: 'text',
            },
            {
              name: 'headline',
              type: 'text',
            },
            {
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'layout',
              type: 'select',
              options: [
                { label: 'Image Left', value: 'image_left' },
                { label: 'Image Center', value: 'image_center' },
                { label: 'Image Right', value: 'image_right' },
              ],
            },
            {
              name: 'buttons',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'type', type: 'select', required: true, options: [
                  { label: 'Page', value: 'page' },
                  { label: 'Post', value: 'post' },
                  { label: 'URL', value: 'url' },
                ]},
                { name: 'page', type: 'relationship', relationTo: 'pages', admin: { condition: (data) => data.type === 'page' }},
                { name: 'post', type: 'relationship', relationTo: 'posts', admin: { condition: (data) => data.type === 'post' }},
                { name: 'url', type: 'text', admin: { condition: (data) => data.type === 'url' }},
                { name: 'variant', type: 'select', options: [
                  { label: 'Default', value: 'default' },
                  { label: 'Outline', value: 'outline' },
                  { label: 'Soft', value: 'soft' },
                  { label: 'Ghost', value: 'ghost' },
                  { label: 'Link', value: 'link' },
                ]},
              ],
            },
          ],
        },
        {
          slug: 'richtext',
          fields: [
            {
              name: 'content',
              type: 'richText',
              required: true,
            },
          ],
        },
        {
          slug: 'gallery',
          fields: [
            { name: 'tagline', type: 'text' },
            { name: 'headline', type: 'text' },
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true },
                { name: 'caption', type: 'text' },
              ],
            },
          ],
        },
        {
          slug: 'posts',
          fields: [
            { name: 'tagline', type: 'text' },
            { name: 'headline', type: 'text' },
            { name: 'collection', type: 'select', required: true, defaultValue: 'posts', options: [{ label: 'Posts', value: 'posts' }]},
            { name: 'limit', type: 'number', defaultValue: 6 },
          ],
        },
        {
          slug: 'pricing',
          fields: [
            { name: 'tagline', type: 'text' },
            { name: 'headline', type: 'text' },
            {
              name: 'pricingCards',
              type: 'array',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
                { name: 'price', type: 'text' },
                { name: 'badge', type: 'text' },
                {
                  name: 'features',
                  type: 'array',
                  fields: [{ name: 'feature', type: 'text' }],
                },
                {
                  name: 'button',
                  type: 'group',
                  fields: [
                    { name: 'label', type: 'text', required: true },
                    { name: 'type', type: 'select', required: true, options: [
                      { label: 'Page', value: 'page' },
                      { label: 'Post', value: 'post' },
                      { label: 'URL', value: 'url' },
                    ]},
                    { name: 'page', type: 'relationship', relationTo: 'pages', admin: { condition: (data) => data.type === 'page' }},
                    { name: 'post', type: 'relationship', relationTo: 'posts', admin: { condition: (data) => data.type === 'post' }},
                    { name: 'url', type: 'text', admin: { condition: (data) => data.type === 'url' }},
                  ],
                },
                { name: 'isHighlighted', type: 'checkbox', defaultValue: false },
              ],
            },
          ],
        },
        {
          slug: 'form',
          fields: [
            { name: 'tagline', type: 'text' },
            { name: 'headline', type: 'text' },
            { name: 'form', type: 'relationship', relationTo: 'forms' },
          ],
        },
      ],
      admin: {
        description: 'Create and arrange different content blocks to build your page',
      },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'SEO title (overrides page title)',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          admin: {
            description: 'SEO meta description',
          },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Open Graph image',
          },
        },
      ],
    },
  ],
  timestamps: true,
};

export default Pages;

