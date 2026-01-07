import type { GlobalConfig } from 'payload';

/**
 * Site Settings Global
 *
 * Global site configuration (singleton).
 */
const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    // Hide Site Settings global from non-admin users in admin UI
    hidden: ({ user }) => user?.role !== 'admin',
  },
  access: {
    read: () => true, // Public read access
    // Only admins can update site settings
    update: ({ req: { user } }) => user?.role === 'admin',
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

