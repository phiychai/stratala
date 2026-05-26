import type { CollectionConfig } from 'payload'

/**
 * Gallery Block Collection
 *
 * Image gallery block with headline, tagline, and multiple images.
 */
const BlockGallery: CollectionConfig = {
  slug: 'block-gallery',
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
        description:
          'Smaller copy shown above the headline to label a section or add extra context',
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
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
      admin: {
        description: 'Images to include in the image gallery',
      },
    },
  ],
  timestamps: true,
}

export default BlockGallery
