import type { Block } from 'payload';

/**
 * Posts Block Collection
 *
 * Block that displays a collection of posts.
 */
const BlockPosts: CollectionConfig = {
  slug: 'block-posts',
  admin: {
    useAsTitle: 'headline',
    defaultColumns: ['headline', 'tagline', 'limit', 'createdAt'],
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
      name: 'collection',
      type: 'select',
      required: true,
      defaultValue: 'posts',
      options: [
        {
          label: 'Posts',
          value: 'posts',
        },
      ],
      admin: {
        description: 'The collection of content to fetch and display on the page within this block',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 6,
      admin: {
        description: 'Maximum number of posts to display',
      },
    },
  ],
  timestamps: true,
};

export default BlockPosts;

