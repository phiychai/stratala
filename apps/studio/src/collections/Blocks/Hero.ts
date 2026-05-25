import type { Block } from 'payload'

/**
 * Hero Block
 *
 * Hero section block with headline, description, image, and buttons.
 */
const Hero: Block = {
  slug: 'hero',
  labels: {
    singular: 'Hero Block',
    plural: 'Hero Blocks',
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
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Supporting copy that shows below the headline',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Featured image in the hero',
      },
    },
    {
      name: 'layout',
      type: 'select',
      options: [
        {
          label: 'Image Left',
          value: 'image_left',
        },
        {
          label: 'Image Center',
          value: 'image_center',
        },
        {
          label: 'Image Right',
          value: 'image_right',
        },
      ],
      admin: {
        description:
          'The layout for the component. You can set the image to display left, right, or in the center of page',
      },
    },
    {
      name: 'buttons',
      type: 'array',
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
            description:
              'The URL to link to. Could be relative (ie /my-page) or a full external URL',
          },
        },
        {
          name: 'variant',
          type: 'select',
          options: [
            {
              label: 'Default',
              value: 'default',
            },
            {
              label: 'Outline',
              value: 'outline',
            },
            {
              label: 'Soft',
              value: 'soft',
            },
            {
              label: 'Ghost',
              value: 'ghost',
            },
            {
              label: 'Link',
              value: 'link',
            },
          ],
          admin: {
            description: 'What type of button',
          },
        },
      ],
      admin: {
        description: 'Action buttons that show below headline and description',
      },
    },
  ],
}

export default Hero
