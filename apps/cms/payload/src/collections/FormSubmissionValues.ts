import type { CollectionConfig } from 'payload';

const FormSubmissionValues: CollectionConfig = {
  slug: 'form-submission-values',
  admin: {
    useAsTitle: 'field',
    defaultColumns: ['field', 'value', 'submission'],
  },
  access: {
    read: ({ req: { user } }) => !!user,
    create: () => true,
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'submission',
      type: 'relationship',
      relationTo: 'form-submissions',
      required: true,
    },
    {
      name: 'field',
      type: 'relationship',
      relationTo: 'form-fields',
      required: true,
    },
    {
      name: 'value',
      type: 'textarea',
      required: true,
    },
  ],
  timestamps: true,
};

export default FormSubmissionValues;

