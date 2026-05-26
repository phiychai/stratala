// storage-adapter-import-placeholder

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

// Collections
import BlockGalleryItems from './collections/Blocks/BlockGalleryItems'
import BlockGallery from './collections/Blocks/Gallery'
import BlockPricing from './collections/Blocks/Pricing'
import Categories from './collections/Categories'
import EditorsPicks from './collections/EditorsPicks'
import FormFields from './collections/FormFields'
import Forms from './collections/Forms'
import FormSubmissions from './collections/FormSubmissions'
import FormSubmissionValues from './collections/FormSubmissionValues'
import { Media } from './collections/Media'
import Pages from './collections/Pages'
import Posts from './collections/Posts'
import Redirects from './collections/Redirects'
import Spaces from './collections/Spaces'
import Tags from './collections/Tags'
import { Users } from './collections/Users'
import Videos from './collections/Videos'
import Navigation from './globals/Navigation'
import SiteSettings from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
// Resolve to workspace root: apps/studio/src -> root (3 levels up)
const rootDir = path.resolve(dirname, '../../../')

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
    EditorsPicks,
    Pages,
    Categories,
    Tags,
    Redirects,
    Forms,
    FormFields,
    FormSubmissions,
    FormSubmissionValues,
    BlockGallery,
    BlockGalleryItems,
    BlockPricing,
  ],
  globals: [SiteSettings, Navigation],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://0.0.0.0:3002',
  typescript: {
    outputFile: path.resolve(rootDir, 'packages/shared-types/src/payload-types.ts'),
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
  plugins: [
    multiTenantPlugin({
      // Collections that should be tenant-scoped
      // NOTE: 'tenants' collection is NOT in this list, so it should NOT be filtered by the plugin
      // The 'tenants' collection (Spaces) is global and all authenticated users can read all spaces
      // According to the official docs, only collections in this list get the tenant field and filtering
      collections: {
        posts: {},
        videos: {},
        pages: {},
        categories: {},
        tags: {},
        forms: {},
        'form-fields': {},
        'form-submissions': {},
        'form-submission-values': {},
      },
      // Allow all authenticated users to access all tenants/spaces
      // The tenants collection is NOT in the tenant-scoped collections list,
      // so it should NOT be filtered, but the plugin might still check userHasAccessToAllTenants
      // By returning true for all authenticated users, we ensure all spaces are visible
      userHasAccessToAllTenants: (user: { role?: string } | null) =>
        user?.role === 'admin' || user?.role === 'content_admin' || user?.role === 'publisher',
      tenantsArrayField: {
        includeDefaultField: true,
      },
      // The plugin automatically uses 'tenants' as the collection slug for the tenant collection
      // Our Spaces collection uses slug: 'tenants' which matches the plugin's expectation
    }),
    // storage-adapter-placeholder
  ],
})
