import type { CollectionConfig, Where } from 'payload'

/**
 * Videos Collection
 *
 * Video content that belongs to a tenant (publication/stack) and is authored by a user.
 * Supports video upload, embed code, or external URL.
 *
 * Multi-tenant access control:
 * - Users can only read/edit their own videos
 * - Admins and content admins can read/edit all videos
 * - Editors can read/edit all videos (or can be restricted to own)
 * - Publishers can only access their own videos
 */
const Videos: CollectionConfig = {
  slug: 'videos',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'author', 'tenant', 'status', 'publishedAt', 'createdAt'],
  },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
  access: {
    // Admins and content admins can read all videos
    read: ({ req: { user } }) => {
      if (user && ['admin', 'content_admin'].includes(user.role)) {
        return true
      }
      // Editors can read all videos (or restrict to own if preferred)
      if (user?.role === 'editor') {
        return true // Or restrict to own: { author: { equals: user.id } }
      }
      // Publishers can only read their own videos
      if (user?.role === 'publisher') {
        return {
          author: {
            equals: user.id,
          },
        } as Where
      }
      // Public read access for published videos (for frontend)
      return {
        status: {
          equals: 'published',
        },
      } as Where
    },
    // Only authenticated users can create videos
    create: ({ req: { user } }) => !!user,
    // Users can update their own videos, admins/content admins can update any
    update: ({ req: { user } }) => {
      if (user && ['admin', 'content_admin'].includes(user.role)) {
        return true
      }
      // Editors can update all videos (or restrict to own if preferred)
      if (user?.role === 'editor') {
        return true // Or restrict to own: { author: { equals: user.id } }
      }
      // Publishers can only update their own videos
      if (user?.role === 'publisher') {
        return {
          author: {
            equals: user.id,
          },
        } as Where
      }
      return false
    },
    // Users can delete their own videos, admins can delete any
    delete: ({ req: { user } }) => {
      if (user && ['admin', 'content_admin'].includes(user.role)) {
        return true
      }
      if (user?.role === 'publisher') {
        return {
          author: {
            equals: user.id,
          },
        } as Where
      }
      return false
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Title of the video',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique URL for this video (e.g., yoursite.com/videos/{{slug}})',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            // Auto-generate slug from title if not provided
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/[^\da-z]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            if (typeof value === 'string') {
              return value.toLowerCase().replace(/[^\da-z-]/g, '-')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Short summary of the video',
      },
    },
    {
      name: 'videoSource',
      type: 'select',
      required: true,
      defaultValue: 'upload',
      options: [
        {
          label: 'Upload Video',
          value: 'upload',
        },
        {
          label: 'Embed Code',
          value: 'embed',
        },
        {
          label: 'Video URL',
          value: 'url',
        },
      ],
      admin: {
        description: 'Choose how to provide the video content',
      },
    },
    {
      name: 'videoUpload',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Upload a video file',
        condition: (data) => data?.videoSource === 'upload',
      },
    },
    {
      name: 'embedCode',
      type: 'textarea',
      admin: {
        description: 'Paste embed code (e.g., YouTube iframe, Vimeo embed)',
        condition: (data) => data?.videoSource === 'embed',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        description: 'External video URL (e.g., YouTube, Vimeo link)',
        condition: (data) => data?.videoSource === 'url',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Thumbnail image for this video',
      },
    },
    {
      name: 'content',
      type: 'richText',
      admin: {
        description: 'Additional content or transcript for the video',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Select the team member who created this video',
      },
      // Automatically set to current user on create
      hooks: {
        beforeChange: [
          ({ req, value }) => {
            // If no value provided, use current user
            if (!value && req.user) {
              return req.user.id
            }
            return value
          },
        ],
      },
    },
    // Note: The 'tenant' field is automatically added by the multi-tenant plugin
    // No need to define it manually here
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
        description: 'Is this video published?',
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
      name: 'duration',
      type: 'number',
      admin: {
        description: 'Video duration in seconds',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Categories for this video',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        description: 'Tags for this video',
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
            description: 'SEO title (overrides video title)',
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
}

export default Videos
