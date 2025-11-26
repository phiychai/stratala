import type { CollectionConfig } from 'payload';

const Forms: CollectionConfig = {
  slug: 'forms',
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
      required: true,
      admin: {
        description: 'Form name (for internal reference).',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show or hide this form from the site.',
      },
    },
    {
      name: 'fields',
      type: 'relationship',
      relationTo: 'form-fields',
      hasMany: true,
    },
    {
      name: 'submitLabel',
      type: 'text',
      admin: {
        description: 'Text shown on submit button.',
      },
    },
    {
      name: 'onSuccess',
      type: 'select',
      options: [
        { label: 'Redirect', value: 'redirect' },
        { label: 'Message', value: 'message' },
      ],
      defaultValue: 'message',
      admin: {
        description: 'Action after successful submission.',
      },
    },
    {
      name: 'successMessage',
      type: 'textarea',
      admin: {
        condition: (data) => data.onSuccess === 'message',
        description: 'Message shown after successful submission.',
      },
    },
    {
      name: 'successRedirectUrl',
      type: 'text',
      admin: {
        condition: (data) => data.onSuccess === 'redirect',
        description: 'Destination URL after successful submission.',
      },
    },
    {
      name: 'emails',
      type: 'array',
      admin: {
        description: 'Setup email notifications when forms are submitted.',
      },
      fields: [
        {
          name: 'to',
          type: 'array',
          fields: [
            {
              name: 'email',
              type: 'email',
            },
          ],
        },
        {
          name: 'subject',
          type: 'text',
        },
        {
          name: 'message',
          type: 'textarea',
        },
      ],
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
};

export default Forms;

