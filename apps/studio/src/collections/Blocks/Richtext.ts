import type { CollectionConfig } from 'payload'

/**
 * Rich Text Block Collection
 *
 * Rich text content block for pages.
 */
const BlockRichtext: CollectionConfig = {
  slug: 'block-richtext',
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['createdAt'],
  },
  access: {
    read: () => true, // Blocks are read through pages
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Rich text content',
      },
    },
  ],
  timestamps: true,
}

export default BlockRichtext
