import type { CollectionConfig } from 'payload'

const BlockPricingCards: CollectionConfig = {
  slug: 'block-pricing-cards',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Name of the pricing plan. Shown at the top of the card.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Short, one sentence description of the pricing plan and who it is for.',
      },
    },
    {
      name: 'price',
      type: 'text',
      admin: {
        description: 'Price and term for the pricing plan. (ie `$199/mo`)',
      },
    },
    {
      name: 'badge',
      type: 'text',
      admin: {
        description:
          'Badge that displays at the top of the pricing plan card to add helpful context.',
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
        description:
          'Short list of features included in this plan. Press `Enter` to add another item to the list.',
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
            { label: 'Page', value: 'page' },
            { label: 'Post', value: 'post' },
            { label: 'URL', value: 'url' },
          ],
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          admin: {
            condition: (data: unknown) =>
              typeof data === 'object' &&
              data !== null &&
              'type' in data &&
              (data as { type?: string }).type === 'page',
          },
        },
        {
          name: 'post',
          type: 'relationship',
          relationTo: 'posts',
          admin: {
            condition: (data: unknown) =>
              typeof data === 'object' &&
              data !== null &&
              'type' in data &&
              (data as { type?: string }).type === 'post',
          },
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            condition: (data: unknown) =>
              typeof data === 'object' &&
              data !== null &&
              'type' in data &&
              (data as { type?: string }).type === 'url',
          },
        },
      ],
      admin: {
        description: 'The action button / link shown at the bottom of the pricing card.',
      },
    },
    {
      name: 'pricing',
      type: 'relationship',
      relationTo: 'block-pricing',
      admin: {
        description: 'The id of the pricing block this card belongs to.',
      },
    },
    {
      name: 'isHighlighted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Add highlighted border around the pricing plan to make it stand out.',
      },
    },
    {
      name: 'sort',
      type: 'number',
      admin: {
        hidden: true,
      },
    },
  ],
  timestamps: true,
}

export default BlockPricingCards
