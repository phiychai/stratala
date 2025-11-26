import type { GlobalConfig } from 'payload';

/**
 * Site Settings Global
 *
 * Global site configuration (singleton).
 */
const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true, // Public read access
    update: ({ req: { user } }) => {
      return user && ['admin', 'content_admin'].includes(user.role);
    },
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      admin: {
        description: 'Site name',
      },
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      admin: {
        description: 'Site description',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Site logo',
      },
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Site favicon',
      },
    },
  ],
};

export default SiteSettings;

