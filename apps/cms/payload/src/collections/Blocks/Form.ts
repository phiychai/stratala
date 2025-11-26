import type { Block } from 'payload';

/**
 * Form Block
 *
 * Block that displays a form.
 */
const FormBlock: Block = {
  slug: 'formBlock',
  labels: {
    singular: 'Form Block',
    plural: 'Form Blocks',
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
      name: 'form',
      type: 'relationship',
      relationTo: 'forms', // Forms collection needs to be created
      admin: {
        description: 'Form to show within block',
      },
    },
  ],
};

export default FormBlock;

