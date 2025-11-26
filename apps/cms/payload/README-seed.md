# Payload CMS Seed Script

This script seeds 20 blog posts with images in your Payload CMS instance using Payload's Local API (recommended approach).

## Prerequisites

1. **Payload CMS configured**: Make sure your `.env` file in `apps/cms/payload/` has:
   - `PAYLOAD_SECRET` - Required
   - `DATABASE_URI` or `PAYLOAD_DATABASE_URI` - Required (PostgreSQL connection string)

2. **Admin user exists**: You need at least one admin user in Payload CMS. The script will use the first admin user as the author.

3. **Dependencies installed**: `tsx` is already installed as a dev dependency.

## Usage

From the project root:

```bash
cd apps/cms/payload
pnpm seed
```

Or from the Payload directory:

```bash
pnpm seed
```

## What It Does

1. Initializes Payload using the Local API (no HTTP overhead)
2. Finds the first admin user to use as the author
3. Downloads 20 images from Unsplash URLs
4. Uploads images to Payload's media collection
5. Creates 20 posts with:
   - Titles, descriptions, and content (Lexical format)
   - Featured images
   - Published status
   - Published dates (spread over the past 100 days)
   - Article type

## Posts Included

The script creates 20 posts covering various web development topics:

1. The Future of Web Development: AI-Powered Coding Assistants
2. Building Scalable Microservices: Best Practices and Patterns
3. The Art of Code Review: Building Better Software Together
4. TypeScript vs JavaScript: When to Use Each
5. Design Systems: Creating Consistency at Scale
6. Performance Optimization: Making Your Web Apps Lightning Fast
7. The Power of Serverless: Building Scalable Applications
8. Accessibility First: Building Inclusive Web Experiences
9. GraphQL vs REST: Choosing the Right API Architecture
10. Modern CSS: Flexbox and Grid Layout Mastery
11. React Hooks: A Complete Guide
12. Vue 3 Composition API: The Modern Way
13. Database Design: Normalization and Best Practices
14. Docker and Containerization: A Developer's Guide
15. CI/CD Pipelines: Automating Your Deployment
16. Security Best Practices for Web Applications
17. Testing Strategies: Unit, Integration, and E2E
18. State Management in Modern Web Apps
19. Progressive Web Apps: The Future of Mobile
20. WebAssembly: High Performance in the Browser

## Advantages of This Approach

✅ **Uses Payload Local API** - Direct database access, no HTTP overhead
✅ **No authentication needed** - Runs in the same process as Payload
✅ **Type-safe** - Written in TypeScript with full type checking
✅ **Integrated** - Uses Payload's own APIs and data structures
✅ **Faster** - No network requests, direct database operations

## Troubleshooting

### No Admin User Found

If you see "No admin user found", create an admin user first:

1. Start Payload: `pnpm dev`
2. Navigate to http://localhost:3002/admin
3. Create your first admin user

### Database Connection Error

Make sure your database is running and the connection string is correct:

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Verify DATABASE_URI in apps/cms/payload/.env
```

### Image Download Failed

- Check your internet connection (images are downloaded from Unsplash)
- Some images might fail to download - the script will continue without them

### Content Format

The script uses Lexical editor format for content. If you need to modify the content structure, edit the `content` field in `src/seed.ts`. The current format is minimal - you can expand it with more paragraphs, headings, etc.

## Notes

- The script includes a 500ms delay between posts to avoid overwhelming the system
- Images are downloaded from Unsplash (requires internet connection)
- All posts are created with "published" status
- Posts are assigned to the first admin user found
- Content uses Lexical editor format (JSON structure)

## Alternative: REST API Script

If you prefer using the REST API approach (useful for remote seeding), see `scripts/seed-payload-posts.js` in the project root.

