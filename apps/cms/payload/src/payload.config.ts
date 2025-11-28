// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Collections
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import Tenants from './collections/Tenants'
import Spaces from './collections/Spaces'
import Posts from './collections/Posts'
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

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Tenants,
    Users,
    Media,
    Spaces,
    Posts,
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
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3002',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
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
      collections: {
        'spaces': {},
        'posts': {},
        'pages': {},
        'categories': {},
        'tags': {},
        'forms': {},
        'form-fields': {},
        'form-submissions': {},
        'form-submission-values': {},
      },
      // Allow admins to access all tenants
      userHasAccessToAllTenants: ({ user }) => {
        return user?.role === 'admin' || user?.role === 'content_admin';
      },
      // Configure the tenants field on users
      tenantsArrayField: {
        // Make tenants optional during registration
        // Users can be assigned to tenants later by admins
        required: false,
      },
    }),
    // storage-adapter-placeholder
  ],
})
