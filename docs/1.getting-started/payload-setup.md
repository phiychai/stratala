---
title: 'Payload CMS Setup'
description: 'How to set up and run Payload CMS in the Turborepo SaaS Starter'
navigation:
  title: 'Payload CMS Setup'
  order: 2
---

## Overview

Payload CMS is the content management system used in this project. It runs as a separate Next.js application on port 3002 and provides both a REST API for public content and a Local API for backend operations.

## Quick Start

### Development

```bash
# From project root
cd apps/cms/payload

# Install dependencies (if not already installed)
pnpm install

# Start Payload CMS
pnpm dev
```

The Payload admin panel will be available at http://localhost:3002/admin

### Using Turborepo

```bash
# From project root
turbo dev --filter='@turborepo-saas-starter/payload'
```

## Environment Variables

Create a `.env` file in `apps/cms/payload/`:

```bash
# Database
DATABASE_URI=postgresql://postgres:postgres@localhost:5432/payload_db

# Payload Secret (generate a secure random string)
PAYLOAD_SECRET=your-secret-key-here

# Server URL
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3002

# Port
PORT=3002
```

## First-Time Setup

1. **Start Payload CMS**:
   ```bash
   cd apps/cms/payload
   pnpm dev
   ```

2. **Create First Admin User**:
   - Navigate to http://localhost:3002/admin
   - You'll be prompted to create the first admin user
   - Enter email and password

3. **Verify Setup**:
   - Check that collections are visible in the admin panel
   - Verify database connection is working

## Collections

Payload CMS includes the following collections:

- **Users** - User accounts for Payload admin access
- **Media** - File uploads and media management
- **Spaces** - User-owned content spaces (multi-tenant)
- **Posts** - Blog posts and articles
- **Pages** - Static pages
- **Categories** - Content categories
- **Tags** - Content tags
- **Redirects** - URL redirects
- **Forms** - Form definitions
- **FormFields** - Form field definitions
- **FormSubmissions** - Form submission data
- **FormSubmissionValues** - Form submission values
- **AiPrompts** - AI prompt templates

## Globals

- **SiteSettings** - Global site configuration
- **Navigation** - Site navigation structure
- **Globals** - Additional global settings

## Access Control

Payload CMS implements multi-tenant access control:

- **Users** can only access their own content (filtered by `createdBy`)
- **Admins** and **Content Admins** can access all content
- **Editors** and **Writers** can only access their own content

This is enforced through Payload's access hooks in each collection.

## API Access

### REST API (Public)

The Payload REST API is available at:

```
http://localhost:3002/api/*
```

**Example:**
```bash
# Get all posts
curl http://localhost:3002/api/posts

# Get a specific post
curl http://localhost:3002/api/posts/[id]
```

### Local API (Backend)

The backend uses Payload Local API for direct database access:

```typescript
import { getPayload } from 'payload'
import config from './payload.config'

const payload = await getPayload({ config })

// Query with user context
const posts = await payload.find({
  collection: 'posts',
  where: { createdBy: { equals: userId } }
})
```

## User Synchronization

Users with content roles (`admin`, `content_admin`, `editor`, `writer`) are automatically synced from Better Auth/AdonisJS to Payload CMS.

See [Payload Authentication](/docs/authentication/payload-authentication) for details.

## Troubleshooting

### Port Already in Use

If port 3002 is already in use:

```bash
# Check what's using the port
lsof -i :3002

# Kill the process or change PORT in .env
```

### Database Connection Errors

1. Verify PostgreSQL is running:
   ```bash
   docker-compose ps postgres
   ```

2. Check database exists:
   ```bash
   docker-compose exec postgres psql -U postgres -l | grep payload_db
   ```

3. Verify `DATABASE_URI` in `.env` is correct

### Admin Panel Not Loading

1. Check Payload is running:
   ```bash
   curl http://localhost:3002/admin
   ```

2. Check browser console for errors

3. Verify `PAYLOAD_PUBLIC_SERVER_URL` matches the actual server URL

4. Check Payload logs for errors

### Collections Not Showing

1. Verify collections are imported in `payload.config.ts`

2. Check for TypeScript errors:
   ```bash
   cd apps/cms/payload
   pnpm type-check
   ```

3. Restart Payload server

## Production

For production deployment, see [Production Deployment](/docs/deployment/production).

Key considerations:
- Set secure `PAYLOAD_SECRET`
- Use production database connection string
- Configure file storage (local or S3)
- Set up proper CORS settings
- Enable SSL/TLS

## Related Documentation

- [Payload Authentication](/docs/authentication/payload-authentication)
- [Architecture Overview](/docs/architecture/architecture)

