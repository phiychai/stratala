/**
 * Payload CMS Seed Script
 *
 * Seeds 20 blog posts with images using Payload's Local API
 *
 * Usage:
 *   cd apps/cms/payload
 *   pnpm seed
 *
 * Environment variables:
 *   PAYLOAD_SECRET - Required
 *   DATABASE_URI or PAYLOAD_DATABASE_URI - Required
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`⚠️  Warning: Could not load .env file from ${envPath}`);
  console.warn(`   Error: ${result.error.message}`);
} else {
  console.log(`✅ Loaded .env from: ${envPath}`);
}

// Verify required environment variables
if (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET === 'your-secret-key-here') {
  console.error('❌ Error: PAYLOAD_SECRET is not set or is using placeholder value');
  console.error('   Please set PAYLOAD_SECRET in your .env file');
  console.error(`   Current .env path: ${envPath}`);
  console.error('');
  console.error('   Generate a secret with:');
  console.error('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  console.error('');
  console.error('   Then update PAYLOAD_SECRET in your .env file');
  process.exit(1);
}

if (!process.env.DATABASE_URI && !process.env.PAYLOAD_DATABASE_URI) {
  console.error('❌ Error: DATABASE_URI or PAYLOAD_DATABASE_URI is not set');
  console.error('   Please set one of these in your .env file');
  process.exit(1);
}

// Import after dotenv has loaded
import { getPayload } from 'payload';
import https from 'https';
import http from 'http';

// Dynamic import of config to ensure env vars are loaded first
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let config: any;

const posts = [
  {
    title: "The Future of Web Development: AI-Powered Coding Assistants",
    slug: "future-of-web-development-ai-coding-assistants",
    description: "Exploring how AI coding assistants are revolutionizing the way developers write code.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "The landscape of web development is rapidly evolving, and at the forefront of this transformation are AI-powered coding assistants.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Building Scalable Microservices: Best Practices and Patterns",
    slug: "building-scalable-microservices-best-practices",
    description: "A comprehensive guide to designing and implementing microservices architecture.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Microservices architecture has become the go-to approach for building large-scale applications.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "The Art of Code Review: Building Better Software Together",
    slug: "art-of-code-review-building-better-software",
    description: "Master the craft of code review to improve code quality and build stronger teams.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Code review is one of the most valuable practices in software development.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "TypeScript vs JavaScript: When to Use Each",
    slug: "typescript-vs-javascript-when-to-use-each",
    description: "A practical guide to choosing between TypeScript and JavaScript for your next project.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "The TypeScript vs JavaScript debate has been ongoing for years.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Design Systems: Creating Consistency at Scale",
    slug: "design-systems-creating-consistency-at-scale",
    description: "Learn how to build and maintain design systems that scale with your organization.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Design systems have become essential for maintaining consistency across large applications.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Performance Optimization: Making Your Web Apps Lightning Fast",
    slug: "performance-optimization-lightning-fast-web-apps",
    description: "Essential techniques for optimizing web application performance.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Performance is crucial for user experience and SEO.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "The Power of Serverless: Building Scalable Applications",
    slug: "power-of-serverless-building-scalable-applications",
    description: "Understanding serverless architecture and when to use it.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Serverless computing has revolutionized how we build and deploy applications.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Accessibility First: Building Inclusive Web Experiences",
    slug: "accessibility-first-building-inclusive-web-experiences",
    description: "Why accessibility matters and how to build accessible web applications.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Accessibility is not optional—it's essential for creating inclusive web experiences.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "GraphQL vs REST: Choosing the Right API Architecture",
    slug: "graphql-vs-rest-choosing-right-api-architecture",
    description: "A comparison of GraphQL and REST APIs to help you choose the right approach.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Choosing between GraphQL and REST is one of the most important architectural decisions.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Modern CSS: Flexbox and Grid Layout Mastery",
    slug: "modern-css-flexbox-grid-layout-mastery",
    description: "Master modern CSS layout techniques with Flexbox and Grid.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Modern CSS layout tools have transformed how we build web interfaces.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "React Hooks: A Complete Guide",
    slug: "react-hooks-complete-guide",
    description: "Everything you need to know about React Hooks.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "React Hooks revolutionized how we write React components.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Vue 3 Composition API: The Modern Way",
    slug: "vue-3-composition-api-modern-way",
    description: "Learn how to use Vue 3's Composition API effectively.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Vue 3's Composition API provides a more flexible way to organize component logic.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Database Design: Normalization and Best Practices",
    slug: "database-design-normalization-best-practices",
    description: "Essential database design principles for scalable applications.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Good database design is crucial for application performance and maintainability.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Docker and Containerization: A Developer's Guide",
    slug: "docker-containerization-developers-guide",
    description: "Understanding Docker and containerization for modern development.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Docker has become essential for modern software development and deployment.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "CI/CD Pipelines: Automating Your Deployment",
    slug: "cicd-pipelines-automating-deployment",
    description: "How to set up continuous integration and deployment pipelines.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "CI/CD pipelines automate the process of testing and deploying code.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Security Best Practices for Web Applications",
    slug: "security-best-practices-web-applications",
    description: "Essential security practices every developer should know.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Web application security is more important than ever.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Testing Strategies: Unit, Integration, and E2E",
    slug: "testing-strategies-unit-integration-e2e",
    description: "A comprehensive guide to testing strategies for web applications.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Testing is crucial for maintaining code quality and preventing bugs.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1532619675605-1ede6c9ed2d7?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "State Management in Modern Web Apps",
    slug: "state-management-modern-web-apps",
    description: "Exploring state management patterns and libraries.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "State management is one of the most challenging aspects of modern web development.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Progressive Web Apps: The Future of Mobile",
    slug: "progressive-web-apps-future-of-mobile",
    description: "Building Progressive Web Apps that work like native apps.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Progressive Web Apps combine the best of web and native applications.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "WebAssembly: High Performance in the Browser",
    slug: "webassembly-high-performance-browser",
    description: "Understanding WebAssembly and its use cases.",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "WebAssembly brings near-native performance to web applications.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Download image from URL
 */
function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      })
      .on('error', reject);
  });
}

/**
 * Main seed function
 */
async function seed() {
  console.log('🚀 Starting Payload post seeding process...\n');

  try {
    // Dynamically import config after env vars are loaded
    if (!config) {
      const configModule = await import('./payload.config.js');
      config = configModule.default;
    }

    // Initialize Payload
    const payload = await getPayload({ config });
    console.log('✅ Payload initialized\n');

    // Get first admin user for author
    const usersResult = await payload.find({
      collection: 'users',
      where: {
        role: {
          equals: 'admin',
        },
      },
      limit: 1,
    });

    if (!usersResult.docs || usersResult.docs.length === 0) {
      throw new Error('No admin user found. Please create an admin user first.');
    }

    // Author field expects a number (ID)
    const authorId = typeof usersResult.docs[0].id === 'number'
      ? usersResult.docs[0].id
      : Number(usersResult.docs[0].id);
    console.log(`✅ Using author: ${usersResult.docs[0].email} (${authorId})\n`);

    console.log(`📝 Processing ${posts.length} posts...\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      console.log(`[${i + 1}/${posts.length}] Processing: ${post.title}`);

      try {
        // Download and upload image
        let imageId: number | null = null;
        if (post.image_url) {
          try {
            console.log(`  📥 Downloading image...`);
            const imageBuffer = await downloadImage(post.image_url);

            const filename = `${post.slug}.jpg`;

            const uploadedMedia = await payload.create({
              collection: 'media',
              data: {
                alt: post.title,
              },
              file: {
                data: imageBuffer,
                mimetype: 'image/jpeg',
                name: filename,
                size: imageBuffer.length,
              },
            });

            // Image field expects a number (ID), not a string
            imageId = typeof uploadedMedia.id === 'number' ? uploadedMedia.id : Number(uploadedMedia.id);
            console.log(`  ✅ Image uploaded: ${imageId}`);
          } catch (error) {
            console.error(`  ⚠️  Warning: Image upload failed: ${error instanceof Error ? error.message : String(error)}`);
            console.log(`  Continuing without image...`);
          }
        }

        // Create post
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const postData: any = {
          title: post.title,
          slug: post.slug,
          description: post.description,
          content: post.content,
          status: post.status,
          type: post.type,
          publishedAt: post.publishedAt,
          author: authorId,
          ...(imageId && { image: imageId }),
        };

        const createdPost = await payload.create({
          collection: 'posts',
          data: postData,
        });

        console.log(`  ✅ Post created: ${createdPost.id}`);
        successCount++;
      } catch (error) {
        console.error(`  ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
        failCount++;
      }

      // Small delay to avoid overwhelming the system
      if (i < posts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Successfully created: ${successCount} posts`);
    if (failCount > 0) {
      console.log(`❌ Failed: ${failCount} posts`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run the seed
seed();

