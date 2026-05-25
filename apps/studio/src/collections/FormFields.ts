import type { CollectionConfig } from 'payload'

const FormFields: CollectionConfig = {
  slug: 'form-fields',
  admin: {
    useAsTitle: 'label',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique field identifier, not shown to users (lowercase, hyphenated)',
      },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description: 'Text label shown to form users.',
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Textarea', value: 'textarea' },
        { label: 'Checkbox', value: 'checkbox' },
        { label: 'Checkbox Group', value: 'checkbox_group' },
        { label: 'Radio', value: 'radio' },
        { label: 'File', value: 'file' },
        { label: 'Select', value: 'select' },
        { label: 'Hidden', value: 'hidden' },
      ],
      required: true,
      defaultValue: 'text',
      admin: {
        description: 'Input type for the field',
      },
    },
    {
      name: 'placeholder',
      type: 'text',
      admin: {
        description: 'Default text shown in empty input.',
      },
    },
    {
      name: 'help',
      type: 'textarea',
      admin: {
        description: 'Additional instructions shown below the input',
      },
    },
    {
      name: 'validation',
      type: 'text',
      admin: {
        description:
          'Available rules: `email`, `url`, `min:5`, `max:20`, `length:10`. Combine with pipes example: `email|max:255`',
      },
    },
    {
      name: 'required',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Make this field mandatory to complete.',
      },
    },
    {
      name: 'width',
      type: 'select',
      options: [
        { label: '100%', value: '100' },
        { label: '67%', value: '67' },
        { label: '50%', value: '50' },
        { label: '33%', value: '33' },
      ],
      admin: {
        description: 'Field width on the form',
      },
    },
    {
      name: 'choices',
      type: 'array',
      admin: {
        condition: (data) => ['radio', 'select', 'checkbox_group'].includes(data.type),
        description: 'Options for radio or select inputs',
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      admin: {
        description: 'Parent form this field belongs to.',
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

export default FormFields
