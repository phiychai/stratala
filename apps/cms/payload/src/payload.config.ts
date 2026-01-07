// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'

import { getUserTenantIDs } from './utilities/getUserTenantIDs'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Collections
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import Spaces from './collections/Spaces'
import Posts from './collections/Posts'
import Videos from './collections/Videos'
import Pages from './collections/Pages'
import Categories from './collections/Categories'
import Tags from './collections/Tags'
import Redirects from './collections/Redirects'
import Forms from './collections/Forms'
import FormFields from './collections/FormFields'
import FormSubmissions from './collections/FormSubmissions'
import FormSubmissionValues from './collections/FormSubmissionValues'

// Globals
import SiteSettings from './globals/SiteSettings'
import Navigation from './globals/Navigation'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
// Resolve to workspace root: apps/cms/payload/src -> root (4 levels up)
const rootDir = path.resolve(dirname, '../../../../')

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // Disable auto-save to prevent POST requests on every keystroke
    // Users will need to manually save changes
    // Note: This may not be available in all Payload versions
  },
  collections: [
    Spaces,
    Users,
    Media,
    Posts,
    Videos,
    Pages,
    Categories,
    Tags,
    Redirects,
    Forms,
    FormFields,
    FormSubmissions,
    FormSubmissionValues,
  ],
  globals: [SiteSettings, Navigation],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://0.0.0.0:3002',
  typescript: {
    outputFile: path.resolve(rootDir, 'packages', 'shared-types', 'src', 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(dirname, '../schema.graphql'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.PAYLOAD_DATABASE_URI || process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  upload: {
    limits: {
      fileSize: 20000000, // 20MB
    },
  },
  // Enable preview mode for live preview functionality
  preview: {
    enabled: true,
  },
  plugins: [
    multiTenantPlugin({
      // Collections that should be tenant-scoped
      // NOTE: 'tenants' collection is NOT in this list, so it should NOT be filtered by the plugin
      // The 'tenants' collection (Spaces) is global and all authenticated users can read all spaces
      // According to the official docs, only collections in this list get the tenant field and filtering
      collections: {
        'posts': {},
        'videos': {},
        'pages': {},
        'categories': {},
        'tags': {},
        'forms': {},
        'form-fields': {},
        'form-submissions': {},
        'form-submission-values': {},
      },
      // Allow all authenticated users to access all tenants/spaces
      // The tenants collection is NOT in the tenant-scoped collections list,
      // so it should NOT be filtered, but the plugin might still check userHasAccessToAllTenants
      // By returning true for all authenticated users, we ensure all spaces are visible
      userHasAccessToAllTenants: (user: User) => {
        return user?.role === 'admin' || user?.role === 'content_admin' || user?.role === 'publisher';
      },
      tenantsArrayField: {
        includeDefaultField: true,
      },
      // The plugin automatically uses 'tenants' as the collection slug for the tenant collection
      // Our Spaces collection uses slug: 'tenants' which matches the plugin's expectation
    }),
    // storage-adapter-placeholder
  ],
})
