# Seed Payload Posts Script

This script creates 20 blog posts with images in your Payload CMS instance.

## Prerequisites

1. **Node.js dependencies**: Install required packages
   ```bash
   cd /path/to/turborepo-saas-starter
   pnpm add -D axios form-data
   ```

2. **Payload CMS running**: Make sure Payload is running on port 3002 (or your configured port)

3. **Admin credentials**: You need an admin user account in Payload CMS

## Usage

### Option 1: Using Environment Variables

```bash
export PAYLOAD_URL="http://localhost:3002"
export PAYLOAD_EMAIL="admin@example.com"
export PAYLOAD_PASSWORD="your-password"
node scripts/seed-payload-posts.js
```

### Option 2: Using Command Line Arguments

You can also set them inline:

```bash
PAYLOAD_URL="http://localhost:3002" PAYLOAD_EMAIL="admin@example.com" PAYLOAD_PASSWORD="your-password" node scripts/seed-payload-posts.js
```

## Configuration

The script uses these environment variables (with defaults):

- `PAYLOAD_URL` - Your Payload instance URL (default: `http://localhost:3002`)
- `PAYLOAD_EMAIL` - **Required** - Your Payload admin email
- `PAYLOAD_PASSWORD` - **Required** - Your Payload admin password
- `PAYLOAD_AUTHOR_ID` - Optional - Author user ID (will use first admin if not provided)

## What It Does

1. Authenticates with Payload CMS using email/password
2. Downloads 20 images from Unsplash URLs
3. Uploads images to Payload's media collection
4. Creates 20 posts with:
   - Titles, descriptions, and content
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

## Troubleshooting

### Authentication Failed

- Verify your Payload CMS is running
- Check that the email and password are correct
- Ensure the user has admin role in Payload

### Image Upload Failed

- Check your internet connection (images are downloaded from Unsplash)
- Verify Payload media collection is configured correctly
- Check Payload logs for detailed error messages

### Post Creation Failed

- Verify the Posts collection schema matches the script's data structure
- Check that required fields (title, slug, author) are provided
- Ensure the author user exists in Payload

### Port Already in Use

If port 3002 is already in use, update the `PAYLOAD_URL` environment variable:

```bash
export PAYLOAD_URL="http://localhost:YOUR_PORT"
```

## Notes

- The script includes a 1-second delay between posts to avoid rate limiting
- Images are downloaded from Unsplash (requires internet connection)
- All posts are created with "published" status
- Posts are assigned to the authenticated admin user (or specified author)

