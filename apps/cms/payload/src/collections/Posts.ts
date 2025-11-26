import type { CollectionConfig } from 'payload';

/**
 * Posts Collection
 *
 * Blog posts/articles that belong to a space and are authored by a user.
 *
 * Multi-tenant access control:
 * - Users can only read/edit their own posts
 * - Admins and content admins can read/edit all posts
 * - Editors can read/edit all posts (or can be restricted to own)
 * - Writers can only access their own posts
 */
const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'author', 'space', 'status', 'publishedAt', 'createdAt'],
  },
  versions: {
    drafts: true,
  },
  access: {
    // Admins and content admins can read all posts
    read: ({ req: { user } }) => {
      if (user && ['admin', 'content_admin'].includes(user.role)) {
        return true;
      }
      // Editors can read all posts (or restrict to own if preferred)
      if (user?.role === 'editor') {
        return true; // Or restrict to own: { author: { equals: user.id } }
      }
      // Writers can only read their own posts
      if (user?.role === 'writer') {
        return {
          author: {
            equals: user.id,
          },
        };
      }
      // Public read access for published posts (for frontend)
      return {
        status: {
          equals: 'published',
        },
      };
    },
    // Only authenticated users can create posts
    create: ({ req: { user } }) => !!user,
    // Users can update their own posts, admins/content admins can update any
    update: ({ req: { user } }) => {
      if (user && ['admin', 'content_admin'].includes(user.role)) {
        return true;
      }
      // Editors can update all posts (or restrict to own if preferred)
      if (user?.role === 'editor') {
        return true; // Or restrict to own: { author: { equals: user.id } }
      }
      // Writers can only update their own posts
      if (user?.role === 'writer') {
        return {
          author: {
            equals: user.id,
          },
        };
      }
      return false;
    },
    // Users can delete their own posts, admins can delete any
    delete: ({ req: { user } }) => {
      if (user && ['admin', 'content_admin'].includes(user.role)) {
        return true;
      }
      if (user?.role === 'writer') {
        return {
          author: {
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
        description: 'Title of the blog post',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique URL for this post (e.g., yoursite.com/posts/{{slug}})',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            // Auto-generate slug from title if not provided
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            }
            if (typeof value === 'string') {
              return value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Short summary of the blog post',
      },
    },
    {
      name: 'content',
      type: 'richText',
      admin: {
        description: 'Rich text content of your blog post',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Featured image for this post',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Select the team member who wrote this post',
      },
      // Automatically set to current user on create
      hooks: {
        beforeChange: [
          ({ req, value }) => {
            // If no value provided, use current user
            if (!value && req.user) {
              return req.user.id;
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      admin: {
        description: 'The space this post belongs to (if empty, defaults to author\'s default space)',
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
        description: 'Is this post published?',
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
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'article',
      options: [
        {
          label: 'Article',
          value: 'article',
        },
        {
          label: 'Audio',
          value: 'audio',
        },
        {
          label: 'Video',
          value: 'video',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Categories for this post',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        description: 'Tags for this post',
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
            description: 'SEO title (overrides post title)',
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

export default Posts;

