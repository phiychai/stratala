import type { CollectionConfig } from 'payload/types'

const BlockGalleryItems: CollectionConfig = {
  slug: 'block-gallery-items',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'blockGallery',
      type: 'relationship',
      relationTo: 'block-gallery',
      admin: {
        description: 'The id of the gallery block this item belongs to.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'The id of the file included in the gallery.',
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

export default BlockGalleryItems
