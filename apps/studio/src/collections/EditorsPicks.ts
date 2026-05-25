import type { CollectionConfig } from 'payload'

/**
 * EditorsPicks Collection
 *
 * Curated content selected by editors/admins to be featured on the homepage.
 * Supports both posts and videos.
 *
 * Multi-tenant access control:
 * - Only admins and content admins can manage editor's picks
 * - Public read access for published picks
 */
const EditorsPicks: CollectionConfig = {
  slug: 'editors-picks',
  admin: {
    useAsTitle: 'contentType',
    defaultColumns: ['contentType', 'post', 'video', 'featuredOrder', 'featuredAt', 'createdAt'],
  },
  access: {
    // Public read access for published picks
    read: () => true,
    // Only admins and content admins can create/update/delete
    create: ({ req: { user } }) => user && ['admin', 'content_admin'].includes(user.role),
    update: ({ req: { user } }) => user && ['admin', 'content_admin'].includes(user.role),
    delete: ({ req: { user } }) => user && ['admin', 'content_admin'].includes(user.role),
  },
  fields: [
    {
      name: 'contentType',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Post',
          value: 'post',
        },
        {
          label: 'Video',
          value: 'video',
        },
      ],
      admin: {
        description: 'Type of content being featured',
      },
    },
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      admin: {
        description: 'Select a post to feature',
        condition: (data) => data?.contentType === 'post',
      },
    },
    {
      name: 'video',
      type: 'relationship',
      relationTo: 'videos',
      admin: {
        description: 'Select a video to feature',
        condition: (data) => data?.contentType === 'video',
      },
    },
    {
      name: 'featuredOrder',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Order for displaying featured content (lower numbers appear first)',
      },
    },
    {
      name: 'featuredAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: 'Date when this content was featured',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about why this content was featured',
      },
    },
  ],
  timestamps: true,
}

export default EditorsPicks
