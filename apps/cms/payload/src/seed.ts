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
  // New posts with list content
  {
    title: "Essential JavaScript Array Methods: A Complete Guide",
    slug: "essential-javascript-array-methods-complete-guide",
    description: "Master the most important JavaScript array methods with practical examples.",
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
                text: "JavaScript arrays come with powerful built-in methods that make data manipulation easy. Here are the essential methods every developer should know:",
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
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "map() - Transform each element",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "filter() - Select elements that match criteria",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "reduce() - Accumulate values into a single result",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "find() - Locate the first matching element",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 4,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "some() and every() - Test array conditions",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 5,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "bullet",
            type: "list",
            version: 1,
            start: 1,
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
    publishedAt: new Date(Date.now() - 105 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Top 10 React Performance Optimization Techniques",
    slug: "top-10-react-performance-optimization-techniques",
    description: "Learn the most effective ways to optimize React application performance.",
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
                text: "React performance optimization is crucial for building fast, responsive applications. Here are the top techniques:",
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
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use React.memo() to prevent unnecessary re-renders",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Implement useMemo() for expensive calculations",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Leverage useCallback() for function memoization",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Code splitting with React.lazy() and Suspense",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 4,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Virtualize long lists with react-window",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 5,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Optimize images and use lazy loading",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 6,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Avoid inline object and function creation in render",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 7,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use React DevTools Profiler to identify bottlenecks",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 8,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Implement proper key props for list items",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 9,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Consider using state management libraries wisely",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 10,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "number",
            type: "list",
            version: 1,
            start: 1,
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
    publishedAt: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "CSS Grid vs Flexbox: When to Use Each",
    slug: "css-grid-vs-flexbox-when-to-use-each",
    description: "Understanding the differences between CSS Grid and Flexbox and when to use each layout method.",
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
                text: "Both CSS Grid and Flexbox are powerful layout tools, but they serve different purposes. Here's when to use each:",
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
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use Flexbox for one-dimensional layouts (row or column)",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use Grid for two-dimensional layouts (rows and columns)",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Flexbox is ideal for component-level layouts",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Grid excels at page-level layouts",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 4,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "bullet",
            type: "list",
            version: 1,
            start: 1,
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
    publishedAt: new Date(Date.now() - 115 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "5 Steps to Deploy Your First Node.js Application",
    slug: "5-steps-deploy-first-nodejs-application",
    description: "A beginner-friendly guide to deploying Node.js applications to production.",
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
                text: "Deploying a Node.js application can seem daunting, but it's actually straightforward. Follow these steps:",
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
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Prepare your application: Set NODE_ENV to production and ensure all environment variables are configured",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Choose a hosting platform: Options include Heroku, AWS, DigitalOcean, or Vercel",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Set up your database: Configure your production database and connection strings",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Configure CI/CD: Set up automated deployments using GitHub Actions or similar",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 4,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Monitor and optimize: Use tools like PM2, New Relic, or Datadog to monitor your application",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 5,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "number",
            type: "list",
            version: 1,
            start: 1,
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
    publishedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Essential Git Commands Every Developer Should Know",
    slug: "essential-git-commands-every-developer-should-know",
    description: "Master the Git commands that will make your development workflow more efficient.",
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
                text: "Git is an essential tool for version control. Here are the commands you'll use daily:",
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
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "git status - Check the status of your working directory",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "git add . - Stage all changes",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "git commit -m 'message' - Commit changes with a message",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "git push - Upload commits to remote repository",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 4,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "git pull - Download and merge remote changes",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 5,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "git branch - List, create, or delete branches",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 6,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "git merge - Combine branches",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 7,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "git log - View commit history",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 8,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "bullet",
            type: "list",
            version: 1,
            start: 1,
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
    publishedAt: new Date(Date.now() - 125 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "7 Principles of Clean Code",
    slug: "7-principles-of-clean-code",
    description: "Learn the fundamental principles that make code readable, maintainable, and elegant.",
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
                text: "Writing clean code is an art that improves with practice. These principles will guide you:",
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
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Meaningful names: Use descriptive variable and function names",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Small functions: Keep functions focused and do one thing well",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Comments when needed: Code should be self-documenting, but add comments for complex logic",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "DRY (Don't Repeat Yourself): Eliminate code duplication",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 4,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Error handling: Always handle errors gracefully",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 5,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Consistent formatting: Use linters and formatters",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 6,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Test your code: Write tests to ensure reliability",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 7,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "number",
            type: "list",
            version: 1,
            start: 1,
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
    publishedAt: new Date(Date.now() - 130 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Common JavaScript Mistakes and How to Avoid Them",
    slug: "common-javascript-mistakes-and-how-to-avoid-them",
    description: "Learn about frequent JavaScript pitfalls and best practices to avoid them.",
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
                text: "JavaScript has many quirks that can trip up developers. Here are common mistakes to watch out for:",
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
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Using == instead of === for comparisons",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Not understanding var vs let vs const",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Forgetting to handle async/await errors",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Mutating state directly in React",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 4,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Not understanding closure scope",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 5,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "bullet",
            type: "list",
            version: 1,
            start: 1,
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
    publishedAt: new Date(Date.now() - 135 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Getting Started with TypeScript: A Beginner's Guide",
    slug: "getting-started-with-typescript-beginners-guide",
    description: "Everything you need to know to start using TypeScript in your projects.",
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
                text: "TypeScript adds static typing to JavaScript, making your code more robust. Here's how to get started:",
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
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Install TypeScript globally: npm install -g typescript",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Create a tsconfig.json file for project configuration",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Learn basic types: string, number, boolean, array, object",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Understand interfaces and type aliases",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 4,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use generics for reusable code",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 5,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "number",
            type: "list",
            version: 1,
            start: 1,
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
    publishedAt: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "RESTful API Design Best Practices",
    slug: "restful-api-design-best-practices",
    description: "Learn how to design clean, maintainable REST APIs that developers will love to use.",
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
                text: "Designing a good REST API requires following established conventions and best practices:",
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
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use proper HTTP methods: GET, POST, PUT, PATCH, DELETE",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use nouns for endpoints, not verbs: /users not /getUsers",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Return appropriate status codes: 200, 201, 400, 404, 500",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Implement pagination for list endpoints",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 4,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use versioning: /api/v1/users",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 5,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Provide clear error messages",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 6,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "bullet",
            type: "list",
            version: 1,
            start: 1,
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
    publishedAt: new Date(Date.now() - 145 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Understanding Async/Await in JavaScript",
    slug: "understanding-async-await-in-javascript",
    description: "Master asynchronous JavaScript with async/await syntax and best practices.",
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
                text: "Async/await makes asynchronous code more readable. Here's what you need to know:",
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
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use async keyword before function declaration",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use await to pause execution until promise resolves",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Always wrap in try/catch for error handling",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use Promise.all() for parallel operations",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 4,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "bullet",
            type: "list",
            version: 1,
            start: 1,
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
    publishedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "6 Tips for Writing Better CSS",
    slug: "6-tips-for-writing-better-css",
    description: "Improve your CSS skills with these practical tips and techniques.",
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
                text: "Writing maintainable CSS is a skill that improves with practice. Follow these tips:",
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
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use a CSS methodology like BEM for naming",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Leverage CSS variables for theming",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Avoid deep nesting in preprocessors",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use flexbox and grid instead of floats",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 4,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Keep specificity low to avoid conflicts",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 5,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use mobile-first responsive design",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 6,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "number",
            type: "list",
            version: 1,
            start: 1,
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
    publishedAt: new Date(Date.now() - 155 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Database Indexing: What You Need to Know",
    slug: "database-indexing-what-you-need-to-know",
    description: "Understand how database indexes work and when to use them for optimal performance.",
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
                text: "Database indexes are crucial for query performance. Here's what every developer should understand:",
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
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Indexes speed up SELECT queries but slow down INSERT/UPDATE",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Index columns used in WHERE, JOIN, and ORDER BY clauses",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use composite indexes for multiple column queries",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Avoid over-indexing: too many indexes can hurt performance",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 4,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Monitor index usage and remove unused indexes",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 5,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "bullet",
            type: "list",
            version: 1,
            start: 1,
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
    publishedAt: new Date(Date.now() - 160 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Essential npm Packages for Node.js Development",
    slug: "essential-npm-packages-for-nodejs-development",
    description: "Discover the most useful npm packages that will boost your Node.js development productivity.",
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
                text: "The npm ecosystem is vast. Here are essential packages every Node.js developer should know:",
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
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "express - Fast, unopinionated web framework",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "dotenv - Load environment variables from .env file",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "nodemon - Automatically restart server during development",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "axios - Promise-based HTTP client",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 4,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "lodash - Utility library with helpful functions",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 5,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "winston - Comprehensive logging library",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 6,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "bullet",
            type: "list",
            version: 1,
            start: 1,
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
    publishedAt: new Date(Date.now() - 165 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Understanding HTTP Status Codes",
    slug: "understanding-http-status-codes",
    description: "A comprehensive guide to HTTP status codes and when to use each one.",
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
                text: "HTTP status codes communicate the result of a request. Here are the most important ones:",
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
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "200 OK - Request succeeded",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "201 Created - Resource created successfully",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "400 Bad Request - Invalid request syntax",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "401 Unauthorized - Authentication required",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 4,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "404 Not Found - Resource doesn't exist",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 5,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "500 Internal Server Error - Server error",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 6,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "number",
            type: "list",
            version: 1,
            start: 1,
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
    publishedAt: new Date(Date.now() - 170 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Vue.js Component Communication Patterns",
    slug: "vuejs-component-communication-patterns",
    description: "Learn different ways to share data and communicate between Vue components.",
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
                text: "Vue.js offers several patterns for component communication. Here are the most common approaches:",
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
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Props down - Pass data from parent to child",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Events up - Emit events from child to parent",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Provide/Inject - Share data across component tree",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Vuex/Pinia - Global state management",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 4,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Event Bus - Simple pub/sub pattern",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 5,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "bullet",
            type: "list",
            version: 1,
            start: 1,
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
    publishedAt: new Date(Date.now() - 175 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Security Best Practices for Web Applications",
    slug: "security-best-practices-for-web-applications-detailed",
    description: "Essential security practices to protect your web applications from common vulnerabilities.",
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
                text: "Web application security is critical. Follow these best practices to protect your applications:",
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
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Always validate and sanitize user input",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use HTTPS for all communications",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Implement proper authentication and authorization",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Protect against SQL injection with parameterized queries",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 4,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use Content Security Policy headers",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 5,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Keep dependencies updated and scan for vulnerabilities",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 6,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "bullet",
            type: "list",
            version: 1,
            start: 1,
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
    publishedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Mastering CSS Selectors",
    slug: "mastering-css-selectors",
    description: "Learn advanced CSS selector techniques to write more efficient and maintainable stylesheets.",
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
                text: "CSS selectors are powerful tools for targeting elements. Master these selector types:",
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
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Element selectors: target by tag name (div, p, h1)",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Class selectors: target by class (.my-class)",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "ID selectors: target by ID (#my-id)",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Attribute selectors: target by attributes ([data-role])",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 4,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Pseudo-classes: target states (:hover, :focus, :nth-child)",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 5,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "bullet",
            type: "list",
            version: 1,
            start: 1,
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
    publishedAt: new Date(Date.now() - 185 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Building Responsive Web Design: A Complete Guide",
    slug: "building-responsive-web-design-complete-guide",
    description: "Learn how to create websites that work beautifully on all devices and screen sizes.",
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
                text: "Responsive design is essential in today's multi-device world. Follow these steps:",
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
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Start with mobile-first approach",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use flexible grid systems",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 2,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Implement media queries for breakpoints",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 3,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use relative units (rem, em, %) instead of fixed pixels",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 4,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Test on real devices, not just browser dev tools",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "listitem",
                version: 1,
                value: 5,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "number",
            type: "list",
            version: 1,
            start: 1,
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
    publishedAt: new Date(Date.now() - 190 * 24 * 60 * 60 * 1000).toISOString(),
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

    // Get first tenant/space for posts (required by multi-tenant plugin)
    const tenantsResult = await payload.find({
      collection: 'tenants',
      limit: 1,
    });

    let tenantId: number | null = null;
    if (tenantsResult.docs && tenantsResult.docs.length > 0) {
      tenantId = typeof tenantsResult.docs[0].id === 'number'
        ? tenantsResult.docs[0].id
        : Number(tenantsResult.docs[0].id);
      console.log(`✅ Using tenant: ${tenantsResult.docs[0].name} (${tenantId})\n`);
    } else {
      console.warn(`⚠️  Warning: No tenants/spaces found. Posts will be created without tenant assignment.\n`);
      console.warn(`   This may cause errors if the multi-tenant plugin requires tenant assignment.\n`);
    }

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
          // Assign tenant if available (required by multi-tenant plugin)
          ...(tenantId && { tenant: tenantId }),
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

