---
title: 'Migrate from Directus to Payload CMS'
description: 'Complete migration plan for replacing Directus CMS with Payload CMS v3 in a multi-tenant architecture'
navigation:
  title: 'Directus to Payload Migration'
  order: 1
---

# Migrate from Directus to Payload CMS (Multi-Tenant)

## Migration Status

**Status**: ✅ **In Progress** - Core Payload CMS setup completed

### Completed Steps ✅

- ✅ **Step 0**: Pre-Migration Audit
- ✅ **Step 1**: Setup Payload CMS v3
  - ✅ Created Payload package structure
  - ✅ Configured Payload with all collections and globals
  - ✅ Set up multi-tenant access control
  - ✅ Configured Payload admin panel (port 3002)
  - ✅ Migrated all collections from `payload.old`
  - ✅ Updated Users collection with role field
- ✅ **Step 6**: Update Docker Configuration
- ✅ **Step 7**: Update Environment Variables
- ✅ **Step 8**: Update Dependencies
- ✅ **Step 11**: File Storage Migration (structure ready)
- ✅ **Step 12**: Cleanup (old payload moved to `payload.old`)

### In Progress 🚧

- 🚧 **Step 2**: Create Payload Service in AdonisJS
- 🚧 **Step 3**: Create Payload User Sync Service
- 🚧 **Step 4**: Update Backend Controllers
- 🚧 **Step 5**: Update Frontend (Nuxt)
- 🚧 **Step 9**: Update Documentation (in progress)

### Pending ⏳

- ⏳ **Step 10**: Data Migration (if applicable)

## Overview

This migration replaces Directus CMS with Payload CMS v3 in a multi-tenant architecture. Users are synced from Better Auth/Adonis to Payload for proper content ownership and tenant isolation. Payload runs as a separate service, accessible via Local API from AdonisJS and REST API from the frontend.

**Current Setup:**
- Payload CMS running on port 3002
- Admin panel accessible at http://localhost:3002/admin
- All collections and globals migrated
- Next.js-based Payload v3 application structure

## Architecture Changes

**Current:**
- Directus service (Docker) → Directus SDK → AdonisJS proxy → Frontend
- Directus stores: spaces, posts, pages, blocks, categories, etc.
- Users synced to Directus for content roles

**New:**
- Payload service (Node.js app) → Payload Local API → AdonisJS service → Frontend
- Payload stores: spaces, posts, pages, blocks, categories, etc.
- Users synced to Payload for multi-tenant content ownership
- Access control based on `createdBy` field for tenant isolation

## Pre-Migration Audit

### Step 0: Audit Directus Usage

**Before starting migration, audit all Directus usage:**

**Backend files to audit:**
- `apps/backend/app/services/directus_service.ts`
- `apps/backend/app/services/directus_user_sync_service.ts`
- `apps/backend/app/controllers/cms_proxy_controller.ts`
- `apps/backend/app/controllers/admin/admin_controller.ts`
- `apps/backend/app/controllers/user_controller.ts`
- `apps/backend/app/services/user_sync_service.ts`
- `apps/backend/app/services/email_sync_service.ts`
- `apps/backend/app/models/user.ts`
- `apps/backend/database/migrations/*directus*.ts`
- `apps/backend/commands/create_admin.ts`

**Frontend files to audit:**
- `apps/web/server/utils/directus-server.ts`
- `apps/web/server/utils/directus-utils.ts`
- `apps/web/server/api/**/*.ts` (all API routes)
- `apps/web/app/composables/useVisualEditing.ts`
- `apps/web/app/composables/useLivePreview.ts`
- `apps/web/app/components/**/*.vue` (components using Directus)
- `apps/web/app/pages/**/*.vue` (pages using Directus)
- `apps/web/nuxt.config.ts` (Directus config)
- `apps/web/env.example` (Directus env vars)

**Documentation to audit:**
- All docs referencing Directus
- API documentation
- Setup instructions

**Create migration checklist:**
- List all Directus collections and their fields
- Document all Directus API endpoints in use
- List all Directus-specific features (visual editing, live preview, etc.)
- Document file storage configuration
- Note any custom Directus extensions

## Implementation Steps

### 1. Setup Payload CMS v3

**Files to create:**
- `apps/cms/payload/package.json` - Payload dependencies
- `apps/cms/payload/payload.config.ts` - Payload configuration with multi-tenant access control
- `apps/cms/payload/src/collections/Spaces.ts` - Spaces collection with access hooks for tenant isolation
- `apps/cms/payload/src/collections/Posts.ts` - Posts collection with access hooks for tenant isolation
- `apps/cms/payload/src/collections/Pages.ts` - Pages collection with access hooks for tenant isolation
- `apps/cms/payload/src/collections/Categories.ts` - Categories collection (may be shared or tenant-isolated)
- `apps/cms/payload/src/collections/Tags.ts` - Tags collection (may be shared or tenant-isolated)
- `apps/cms/payload/src/collections/Blocks/*.ts` - Block collections with access hooks

**Access Control Implementation Example:**
```typescript
// Example: apps/cms/payload/src/collections/Posts.ts
import { CollectionConfig } from 'payload/types';

const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    // Read access: Writers see only their own, admins see all
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin' || user.role === 'content_admin') return true;
      // Writers and editors see only their own content
      return { createdBy: { equals: user.id } };
    },
    // Create access: Writers and above can create
    create: ({ req: { user } }) => {
      if (!user) return false;
      return ['admin', 'content_admin', 'editor', 'writer'].includes(user.role);
    },
    // Update access: Writers can update own, editors+ can update all
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin' || user.role === 'content_admin' || user.role === 'editor') {
        return true; // Can update all
      }
      if (user.role === 'writer') {
        return { createdBy: { equals: user.id } }; // Can only update own
      }
      return false;
    },
    // Delete access: Similar to update
    delete: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin' || user.role === 'content_admin') return true;
      if (user.role === 'editor') return true; // Or restrict to own if preferred
      if (user.role === 'writer') {
        return { createdBy: { equals: user.id } };
      }
      return false;
    },
  },
  // Automatically set createdBy on create
  hooks: {
    beforeChange: [
      ({ req: { user }, operation, data }) => {
        if (operation === 'create' && user) {
          data.createdBy = user.id;
        }
        return data;
      },
    ],
  },
  // ... rest of collection config
};
```
- `apps/cms/payload/src/globals/SiteSettings.ts` - Site settings global
- `apps/cms/payload/src/globals/Navigation.ts` - Navigation global
- `apps/cms/payload/server.ts` - Payload server entry point
- `apps/cms/payload/Dockerfile` - Docker configuration

**Key configuration:**
- Use PostgreSQL database (separate `payload_db`)
- Enable Payload user system (users synced from Better Auth/Adonis)
- Configure access control in collections:
  - **Writers**: Can only read/edit their own content (`createdBy` field)
  - **Editors**: Can read/edit all content (or can be restricted to their own)
  - **Admins** (`admin`, `content_admin`): Can access all content
  - Implement tenant isolation via access hooks in collections
  - Access hooks filter queries by `createdBy` for non-admin users
- Configure Local API access from AdonisJS (with user context)
- Set up file storage (local or S3) - migrate existing files if needed
- Payload admin accessible at separate URL (`http://localhost:3001/admin`)
  - **Tenant access**: Writers, editors, and admins can access admin UI
  - **Tenant isolation**: Admin UI respects access control (writers see only their content)
- Configure Payload preview mode for live preview functionality

**Block collections to migrate:**
- Audit existing Directus block collections
- Map Directus block structure to Payload block structure
- Common blocks: Hero, Markdown, RichText, Gallery, Posts, Form, Pricing, etc.

### 2. Create Payload Service in AdonisJS

**Files to create:**
- `apps/backend/app/services/payload_service.ts` - Replace `directus_service.ts`
  - Initialize Payload Local API using `getPayload()` from Payload config
  - Create singleton instance or per-request instance (recommend singleton)
  - Implement methods: `getItems()`, `getItem()`, `createItem()`, `updateItem()`, `deleteItem()`
  - Handle multi-tenant context:
    - Map Better Auth user ID to Payload user ID via `PayloadUserSyncService`
    - Pass user context to Payload queries using `context` parameter
    - Filter queries by `createdBy` field for tenant isolation
    - Set `createdBy` automatically on create operations
    - Handle admin override for full access
  - Error handling for Payload API errors
  - Response format transformation (Payload → AdonisJS format)

**Implementation details:**
```typescript
// Example structure
import { getPayload } from 'payload';
import type { Payload } from 'payload';
import config from '../../../cms/payload/payload.config';

class PayloadService {
  private payload: Payload | null = null;

  async initialize() {
    if (!this.payload) {
      // Initialize Payload Local API - runs in same process as AdonisJS
      this.payload = await getPayload({ config });
    }
    return this.payload;
  }

  async getItems(collection: string, options: {
    user?: User,
    filter?: object,
    limit?: number,
    page?: number,
    sort?: string
  }) {
    const payload = await this.initialize();

    // Map AdonisJS user to Payload user ID
    const payloadUserId = options.user?.payloadUserId;

    // Build query with tenant isolation
    const where = {
      ...options.filter,
      // Add tenant isolation unless admin
      ...(options.user?.role !== 'admin' && payloadUserId
        ? { createdBy: { equals: payloadUserId } }
        : {}),
    };

    // Execute query using Local API (direct database access)
    return await payload.find({
      collection,
      where,
      limit: options.limit,
      page: options.page,
      sort: options.sort,
    });
  }
}
```

**Key Points:**
- `getPayload()` is imported from `'payload'` (not from a database adapter)
- Payload config is imported from `apps/cms/payload/payload.config.ts`
- Local API runs in the same Node.js process as AdonisJS
- No HTTP calls needed - direct database access
- User context is passed directly to queries

**Files to remove:**
- `apps/backend/app/services/directus_service.ts`
- `apps/backend/app/services/directus_user_sync_service.ts`

### 3. Create Payload User Sync Service

**Files to create:**
- `apps/backend/app/services/payload_user_sync_service.ts`
  - Sync users from Better Auth/Adonis to Payload
  - Map Better Auth user IDs to Payload user IDs
  - Handle tenant/user context for content ownership
  - Methods:
    - `syncUserToPayload()` - Create/update Payload user from Adonis user
    - `findPayloadUserByEmail()` - Find Payload user by email
    - `getPayloadUserId()` - Get Payload user ID from Adonis user
    - `requiresPayloadUser()` - Check if role needs Payload user (admin, content_admin, editor, writer)
    - `createDefaultSpaceForWriter()` - Create default space for Writer role
    - `updatePayloadUserEmail()` - Update Payload user email
    - `updatePayloadUserRole()` - Update Payload user role

**Files to modify:**
- `apps/backend/app/services/user_sync_service.ts`
  - Replace `DirectusUserSyncService` with `PayloadUserSyncService`
  - Update user sync logic to use Payload
  - Update role mapping logic

- `apps/backend/app/controllers/admin/admin_controller.ts`
  - Replace `DirectusUserSyncService.syncUserToDirectus()` with `PayloadUserSyncService.syncUserToPayload()`
  - Update `directusUserId` field references to `payloadUserId`
  - Update all Directus-related comments and documentation

- `apps/backend/app/models/user.ts`
  - Replace `directusUserId` field with `payloadUserId`
  - Update migration to rename column
  - Store mapping between Adonis user and Payload user

- `apps/backend/app/services/email_sync_service.ts`
  - Replace Directus email sync with Payload email sync
  - Update `syncEmailToDirectus()` to `syncEmailToPayload()`

- `apps/backend/database/migrations/*directus*.ts`
  - Create new migration to rename `directus_user_id` to `payload_user_id`

### 4. Update Backend Controllers

**Files to modify:**
- `apps/backend/app/controllers/cms_proxy_controller.ts`
  - Replace `directusService` with `payloadService`
  - Update API calls to use Payload Local API
  - Adjust response formats to match Payload structure
  - Pass user context for multi-tenant queries
  - Update query parameter handling (Payload uses different query syntax)
  - Update error handling

- `apps/backend/app/controllers/user_controller.ts`
  - Update any Directus references to Payload

**Files to create/update:**
- `apps/backend/app/controllers/space_controller.ts` (check if exists first)
  - If exists: Update to use Payload service
  - If not exists: Create with Payload service
  - Implement space CRUD operations using Payload service
  - Map Better Auth user IDs to Payload document ownership
  - Enforce tenant isolation

### 5. Update Frontend (Nuxt)

**Files to modify:**
- `apps/web/server/utils/directus-server.ts` → Rename to `payload-server.ts`
  - Replace Directus SDK with Payload REST API client
  - Use `fetch` or Payload REST client library
  - Update all query methods to Payload format
  - Handle authentication for public vs authenticated endpoints
  - Transform Payload response format to match expected frontend format

**Files to update:**
- `apps/web/server/api/**/*.ts` - All API routes using Directus:
  - `apps/web/server/api/users/[username]/index.get.ts`
  - `apps/web/server/api/users/[username]/articles/[slug].get.ts`
  - `apps/web/server/api/posts/index.get.ts`
  - `apps/web/server/api/posts/[slug].get.ts`
  - `apps/web/server/api/posts/categories.get.ts`
  - `apps/web/server/api/posts/tags.get.ts`
  - `apps/web/server/api/pages/one.get.ts`
  - `apps/web/server/api/sitemap.get.ts`
  - `apps/web/server/api/search.get.ts` - Update search query syntax for Payload
  - `apps/web/server/api/site-data.get.ts`
  - `apps/web/server/api/forms/submit.post.ts`

- `apps/web/server/utils/resolve-username.ts`
  - Update to use Payload instead of Directus

- `apps/web/server/utils/directus-utils.ts` → Rename to `payload-utils.ts`
  - Update all utility functions

**Composables to update:**
- `apps/web/app/composables/useVisualEditing.ts`
  - Remove `@directus/visual-editing` dependency
  - Remove or replace with Payload preview mode if needed
  - Update types in `apps/web/app/types/composables.ts`

- `apps/web/app/composables/useLivePreview.ts`
  - Update to work with Payload preview mode
  - Update token handling if Payload uses different preview tokens

**Components to update:**
- `apps/web/app/components/shared/DirectusImage.vue` → Rename to `PayloadImage.vue`
  - Update image URL handling for Payload file structure

- All block components using Directus:
  - `apps/web/app/components/block/Hero.vue`
  - `apps/web/app/components/block/RichText.vue`
  - `apps/web/app/components/block/Gallery.vue`
  - `apps/web/app/components/block/Posts.vue`
  - `apps/web/app/components/block/FormBlock.vue`
  - `apps/web/app/components/block/Pricing.vue`
  - `apps/web/app/components/block/PricingCard.vue`
  - `apps/web/app/components/forms/DynamicForm.vue`

**Pages to update:**
- `apps/web/app/pages/[...permalink].vue`
- `apps/web/app/pages/blog/[slug].vue`
- `apps/web/app/pages/@[username]/index.vue`
- `apps/web/app/pages/@[username]/article/[slug].vue`
- `apps/web/app/pages/explore.vue`

**Configuration files:**
- `apps/web/nuxt.config.ts`
  - Remove Directus runtime config
  - Add Payload runtime config
  - Update `directusUrl` to `payloadUrl`

- `apps/web/env.example`
  - Remove Directus environment variables
  - Add Payload environment variables

**Files to remove:**
- Directus SDK imports and usage throughout frontend
- `apps/web/scripts/generate-types.js` (if Directus-specific)

### 6. Update Docker Configuration

**Files to modify:**
- `docker-compose.yml`
  - Remove `directus` service
  - Add `payload` service on port 3001 (for admin UI and REST API)
  - Update `POSTGRES_MULTIPLE_DATABASES` (remove `directus_db`, add `payload_db`)
  - Remove Directus volumes (`directus_uploads`, `directus_extensions`)
  - Add Payload volumes if needed (`payload_uploads`)
  - Update backend service:
    - Ensure backend container has access to `apps/cms/payload/` (already mounted via `- .:/app`)
    - Remove directus dependency
    - Add payload service dependency (for admin UI access)
    - Update environment variables (remove Directus, add Payload)
  - Payload service configuration:
    - Mount `apps/cms/payload/` directory
    - Set up environment variables for Payload
    - Expose port 3001 for admin UI and REST API

**Important Architecture Notes:**
- **Development**:
  - AdonisJS runs locally (not in Docker) via `pnpm dev`
  - Payload Local API is imported directly (same Node.js process)
  - Infrastructure (PostgreSQL, Redis) runs in Docker
  - Payload admin UI runs in Docker on port 3001
- **Production (Docker)**:
  - Backend container: Runs AdonisJS + Payload Local API (same process, via import)
  - Payload container: Runs Payload admin UI + REST API (separate service for browser access)
  - Both containers share the same PostgreSQL database
  - Backend container mounts entire monorepo, so it can import Payload config

**Files to create:**
- `apps/cms/payload/Dockerfile` - Create Payload Dockerfile for admin service
- `apps/cms/payload/.dockerignore` - Docker ignore file

### 7. Update Environment Variables

**Files to modify:**
- `apps/backend/env.example`
  - Remove: `DIRECTUS_URL`, `DIRECTUS_ADMIN_EMAIL`, `DIRECTUS_ADMIN_PASSWORD`, `DIRECTUS_STATIC_TOKEN`
  - Add:
    - `PAYLOAD_URL` - Payload service URL
    - `PAYLOAD_SECRET` - Payload secret key
    - `PAYLOAD_DATABASE_URI` - PostgreSQL connection string for Payload
    - `PAYLOAD_CONFIG_PATH` - Path to Payload config (if needed)

- `env.example` (root)
  - Remove all Directus-related variables
  - Add Payload configuration variables:
    - `PAYLOAD_URL`
    - `PAYLOAD_SECRET`
    - `PAYLOAD_DATABASE_URI`
    - `PAYLOAD_PUBLIC_SERVER_URL` - Public URL for file serving

- `apps/backend/start/env.ts`
  - Update environment schema to remove Directus vars, add Payload vars
  - Add validation for Payload environment variables

- `apps/web/env.example`
  - Remove Directus variables
  - Add Payload variables:
    - `NUXT_PUBLIC_PAYLOAD_URL` - Public Payload API URL

- `apps/web/nuxt.config.ts`
  - Update runtime config to use Payload variables

### 8. Update Dependencies

**Files to modify:**
- `apps/backend/package.json`
  - Remove: `@directus/sdk` (if present)
  - Add: `payload` (v3)
  - Add: `@payloadcms/db-postgres` (if using PostgreSQL adapter)

- `apps/web/package.json`
  - Remove: `@directus/sdk`, `@directus/visual-editing`, `@directus/types`, `directus-sdk-typegen`
  - Remove Directus-related dependencies
  - Add: Payload REST client or use native `fetch` (no additional dependency needed)

- `packages/shared-types/package.json`
  - Remove Directus schema types
  - Add Payload collection types
  - Consider using Payload's type generation: `@payloadcms/tsconfig`

**Type generation:**
- Update `packages/shared-types/src/schema.ts` or create new Payload types
- Use Payload's type generation if available
- Export Payload collection types for use across monorepo
- Update all type imports from Directus types to Payload types

### 9. Update Documentation

**Files to modify:**
- `docs/3.architecture/3.spaces-profile-system.md`
  - Update to reference Payload instead of Directus
  - Update data model descriptions
  - Update API flow diagrams
  - Document multi-tenant access control

- `docs/3.architecture/2.api-architecture.md`
  - Replace Directus references with Payload
  - Update architecture diagrams

- `docs/2.authentication/roles-and-user-management.md`
  - Replace Directus role synchronization with Payload user sync
  - Update user management flows
  - Document multi-tenant user mapping

- `docs/1.getting-started/1.index.md`
  - Update setup instructions
  - Remove Directus setup steps
  - Add Payload setup steps

**Additional documentation:**
- Update API documentation (Swagger/OpenAPI) if present
- Update README with Payload setup instructions
- Update any migration guides or tutorials

### 10. Data Migration (If Applicable)

**If migrating existing data:**
- Create migration script to export Directus data
- Transform Directus data format to Payload format
- Import data into Payload collections
- Verify data integrity
- Update file references in content

**If starting fresh:**
- Document that existing Directus data will not be migrated
- Provide backup instructions for Directus data
- Note that users will need to recreate content

### 11. File Storage Migration

**If migrating existing files:**
- Export files from Directus storage
- Import files into Payload storage
- Update file URLs in content
- Verify file accessibility

**If starting fresh:**
- Document file storage configuration
- Set up Payload file storage (local or S3)
- Configure file URL generation

### 12. Cleanup

**Files/directories to remove:**
- `apps/cms/directus/` - Entire Directus directory
- All Directus-related documentation references
- Directus type definitions in `packages/shared-types/src/schema.ts`
- Directus migration files (after verification)

**Database:**
- Optionally drop `directus_db` database (after migration verification)
- Keep backup of Directus database until migration is fully verified

**Code cleanup:**
- Remove all unused Directus imports
- Remove Directus-related comments
- Update all code comments referencing Directus

## Key Technical Decisions

1. **Payload Deployment & API Access Strategy**:

   **How Local API Works:**

   Payload Local API is **not** about HTTP communication. Instead, it means importing Payload code directly into AdonisJS and using it in the **same Node.js process**. This bypasses HTTP and accesses the database directly.

   **Development (Local - Recommended):**
   - AdonisJS runs locally (via `pnpm dev`, not in Docker)
   - Payload code is in the monorepo at `apps/cms/payload/`
   - AdonisJS imports Payload config directly
   - Both run in the same Node.js process locally
   - **Simplest setup** - everything in one process
   - Infrastructure services (PostgreSQL, Redis) run in Docker
   - Payload admin UI runs in Docker on port 3001

   **Production (Docker):**
   - Backend container mounts the entire monorepo (`- .:/app` in docker-compose.yml)
   - AdonisJS can import Payload config from `apps/cms/payload/payload.config.ts`
   - Both AdonisJS and Payload code run in the same Node.js process in the backend container
   - Local API bypasses HTTP and accesses the database directly

   **Architecture:**
   ```
   Development (Local):
   Node.js Process (local)
   ├── AdonisJS application
   └── Payload Local API (imported, same process)
       └── Direct database access (PostgreSQL in Docker)

   Production (Docker):
   Backend Container (Node.js process)
   ├── AdonisJS application
   └── Payload Local API (imported, same process)
       └── Direct database access (PostgreSQL)

   Payload Admin Container (separate service, dev & prod)
   └── Payload admin UI (for browser access)
       └── HTTP REST API on port 3001
   ```

   **Implementation:**
   ```typescript
   // In AdonisJS service (apps/backend/app/services/payload_service.ts)
   import { getPayload } from 'payload';
   import config from '../../../cms/payload/payload.config';

   class PayloadService {
     private payload: Payload;

     async initialize() {
       this.payload = await getPayload({ config });
     }

     async getItems(collection: string, options: { user?: User }) {
       // Use Local API - direct database access, no HTTP
       return await this.payload.find({
         collection,
         where: { createdBy: { equals: options.user?.payloadUserId } },
         // ... other options
       });
     }
   }
   ```

   **Setup:**
   - **Development**:
     - Run `pnpm dev` locally (AdonisJS + Payload Local API in same process)
     - Infrastructure services (PostgreSQL, Redis) run in Docker
     - Payload admin UI runs in Docker on port 3001
   - **Production**:
     - Backend container has access to `apps/cms/payload/` via mounted volume
     - Payload admin service: Separate container on port 3001 for admin UI
     - Both share the same PostgreSQL database
     - Frontend uses REST API to call Payload admin service for public content

   **Benefits:**
   - ✅ Faster (no HTTP overhead, direct database access)
   - ✅ Type-safe (TypeScript types from Payload config)
   - ✅ Better performance for backend operations
   - ✅ User context can be passed directly
   - ✅ Works the same in development (local) and production (Docker)

   **Note**: The Payload admin UI runs as a separate service (in Docker) because it needs to be accessible via HTTP for browser access. The Local API is only used by AdonisJS backend code.

2. **Payload Admin**: Accessible at separate URL (`http://localhost:3001/admin`) - not embedded in AdonisJS
   - **Tenant Access**: Yes, users with content roles can access Payload admin
   - **Who can access**: Users with roles `admin`, `content_admin`, `editor`, `writer` (synced to Payload)
   - **Tenant Isolation in Admin**:
     - **Admins** (`admin`, `content_admin`): Can see and edit all content
     - **Editors**: Can see and edit all content (or can be restricted to their own)
     - **Writers**: Can only see and edit their own content (filtered by `createdBy`)
   - **Access Control**: Implemented via Payload access hooks in collections
   - **Authentication**: Users authenticate with synced credentials (same email/password as main app)
   - **SSO**: Not implemented initially (can be added later)
   - **Note**: Even with Local API, admin UI runs as separate service for browser access
3. **Multi-Tenant Architecture**:
   - Users are synced from Better Auth/Adonis to Payload (for content roles only)
   - Payload collections use `createdBy` field for ownership tracking
   - Access control based on user/tenant context
   - Content queries filtered by user ownership
   - **Admin UI**: Tenant isolation enforced via Payload access hooks
     - Writers see only their own content in admin UI
     - Admins see all content in admin UI
4. **Authentication**:
   - Better Auth handles user authentication for the main app
   - Payload admin uses Payload's built-in authentication (users synced from Better Auth)
   - Users can access Payload admin with their synced credentials
5. **Database**: Use same PostgreSQL instance, separate `payload_db` database
6. **API Access**:
   - **Backend (AdonisJS)**:
     - Uses **Payload Local API** - imports Payload config and initializes in same Node.js process
     - Direct database access (no HTTP overhead)
     - User context passed directly to queries for multi-tenant isolation
     - Implementation: `import { getPayload } from 'payload'` and `await getPayload({ config })`
   - **Frontend (Nuxt)**:
     - Uses **Payload REST API** (HTTP calls to Payload admin service)
     - Use native `fetch` for REST API calls (no additional client library needed)
     - Calls go to Payload service URL (e.g., `http://payload:3001/api/...` in Docker network, or public URL)
   - **Payload Admin UI**:
     - Runs as separate service on port 3001
     - Provides REST API endpoints for frontend
     - Accessible via browser at `http://localhost:3001/admin`
7. **User Mapping**:
   - Store `payloadUserId` in Adonis User model (replaces `directusUserId`)
   - Map Better Auth user IDs to Payload user IDs
   - Use Payload user ID for `createdBy` field in collections
8. **File Storage**: Configure Payload to use same storage strategy (local or S3)
9. **Type Generation**: Use Payload's type generation capabilities or manually maintain types
10. **Visual Editing**: Remove Directus visual editing, use Payload preview mode if needed

## Migration Notes

- **Data Migration**: Starting fresh (no existing data migration)
- **API Response Formats**: Will change (Directus vs Payload structure)
- **Query Syntax**: Payload uses different query syntax than Directus
- **Frontend Components**: May need updates for new data structure
- **User Sync**: Required for all content roles (admin, content_admin, editor, writer)
- **Testing**: Required for all content-related features and tenant isolation
- **Performance**: Benchmark Payload performance vs Directus
- **Rollback**: Keep Directus service available during transition period

## Rollback Strategy

**If migration fails or issues arise:**

1. **Keep Directus service running** during initial migration period
2. **Database backup**: Keep backup of Directus database
3. **Code versioning**: Use Git branches for migration work
4. **Feature flags**: Consider feature flags to toggle between Directus/Payload
5. **Rollback steps**:
   - Revert code changes
   - Restore Directus service in docker-compose
   - Restore Directus environment variables
   - Restore Directus database from backup
   - Update frontend to use Directus again

## Testing Checklist

### Backend Testing
- [ ] User sync from Better Auth/Adonis to Payload
- [ ] Payload user creation/update/delete
- [ ] Payload service initialization
- [ ] Multi-tenant query filtering
- [ ] Admin override for full access
- [ ] Error handling in Payload service

### Content Operations
- [ ] Spaces CRUD operations with tenant isolation
- [ ] Posts CRUD operations with tenant isolation
- [ ] Pages CRUD operations with tenant isolation
- [ ] Categories CRUD operations
- [ ] Tags CRUD operations
- [ ] Block collections CRUD operations

### Frontend Testing
- [ ] User profile pages with spaces/posts (filtered by owner)
- [ ] Search functionality (tenant-aware, Payload query syntax)
- [ ] Sitemap generation (tenant-aware)
- [ ] Block rendering (hero, markdown, richtext, gallery, etc.)
- [ ] File uploads and display (tenant-aware)
- [ ] Image component with Payload file URLs
- [ ] Live preview functionality
- [ ] All API routes working with Payload

### Access Control Testing
- [ ] Users can only access their own content
- [ ] Admins can access all content
- [ ] Tenant isolation verified
- [ ] Payload admin panel access with synced users
- [ ] **Tenant access to Payload admin UI**:
  - [ ] Writers can access admin UI and see only their own content
  - [ ] Editors can access admin UI and see all content (or restricted as configured)
  - [ ] Admins can access admin UI and see all content
  - [ ] Regular users (`user` role) cannot access Payload admin UI
- [ ] Role-based access control working in admin UI
- [ ] Access hooks properly filter content by `createdBy` in admin UI

### Integration Testing
- [ ] End-to-end content creation flow
- [ ] End-to-end content editing flow
- [ ] User registration and sync flow
- [ ] Email change synchronization
- [ ] Role update and sync flow

### Performance Testing
- [ ] Payload query performance vs Directus
- [ ] Payload admin panel performance
- [ ] Frontend API response times
- [ ] File upload/download performance

### Migration Verification
- [ ] All Directus references removed
- [ ] All Payload services working
- [ ] No broken imports or references
- [ ] Documentation updated
- [ ] Environment variables updated
- [ ] Docker services running correctly

## Performance Considerations

1. **Payload Local API**: Should be faster than REST API for backend operations
2. **Query Optimization**: Payload queries may need optimization for large datasets
3. **Caching**: Consider caching strategies for public content
4. **File Storage**: Ensure file serving performance is maintained
5. **Database Indexing**: Ensure proper indexes on `createdBy` fields for tenant isolation

## Monitoring

1. **Payload Service**: Monitor Payload service health
2. **User Sync**: Monitor user sync operations for errors
3. **API Performance**: Monitor API response times
4. **Error Logging**: Set up error logging for Payload operations
5. **Database Performance**: Monitor Payload database performance

