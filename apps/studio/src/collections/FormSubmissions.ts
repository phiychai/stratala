import type { CollectionConfig } from 'payload';

const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['form', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => !!user, // Only authenticated users can read
    create: () => true, // Public can submit forms
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
    },
    {
      name: 'values',
      type: 'relationship',
      relationTo: 'form-submission-values',
      hasMany: true,
    },
    {
      name: 'ip',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
};

export default FormSubmissions;

