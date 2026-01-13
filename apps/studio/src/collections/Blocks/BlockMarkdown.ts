import { CollectionConfig } from 'payload/types';

const BlockMarkdown: CollectionConfig = {
  slug: 'block-markdown',
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
      name: 'content',
      type: 'code',
      admin: {
        language: 'markdown',
      },
    },
  ],
  timestamps: true,
};

export default BlockMarkdown;

