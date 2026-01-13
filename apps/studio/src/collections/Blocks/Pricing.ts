import type { Block } from 'payload';

/**
 * Pricing Block Collection
 *
 * Pricing section block with headline, tagline, and pricing cards.
 */
const BlockPricing: CollectionConfig = {
  slug: 'block-pricing',
  admin: {
    useAsTitle: 'headline',
    defaultColumns: ['headline', 'tagline', 'createdAt'],
  },
  access: {
    read: () => true, // Blocks are read through pages
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'tagline',
      type: 'text',
      admin: {
        description: 'Smaller copy shown above the headline to label a section or add extra context',
      },
    },
    {
      name: 'headline',
      type: 'text',
      admin: {
        description: 'Larger main headline for this page section',
      },
    },
    {
      name: 'pricingCards',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            description: 'Name of the pricing plan. Shown at the top of the card',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Short, one sentence description of the pricing plan and who it is for',
          },
        },
        {
          name: 'price',
          type: 'text',
          admin: {
            description: 'Price and term for the pricing plan. (ie $199/mo)',
          },
        },
        {
          name: 'badge',
          type: 'text',
          admin: {
            description: 'Badge that displays at the top of the pricing plan card to add helpful context',
          },
        },
        {
          name: 'features',
          type: 'array',
          fields: [
            {
              name: 'feature',
              type: 'text',
            },
          ],
          admin: {
            description: 'Short list of features included in this plan',
          },
        },
        {
          name: 'button',
          type: 'group',
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
            description: 'The action button / link shown at the bottom of the pricing card',
          },
        },
        {
          name: 'isHighlighted',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Highlight this pricing card',
          },
        },
      ],
      admin: {
        description: 'The individual pricing cards to display',
      },
    },
  ],
  timestamps: true,
};

export default BlockPricing;

