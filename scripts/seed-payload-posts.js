#!/usr/bin/env node

/**
 * Script to seed Payload CMS with 20 blog posts and images
 *
 * Usage:
 *   node scripts/seed-payload-posts.js
 *
 * Environment variables:
 *   PAYLOAD_URL - Your Payload instance URL (default: http://localhost:3002)
 *   PAYLOAD_EMAIL - Your Payload admin email (required)
 *   PAYLOAD_PASSWORD - Your Payload admin password (required)
 *   PAYLOAD_AUTHOR_ID - Author user ID (optional, will use first admin if not provided)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const PAYLOAD_URL = process.env.PAYLOAD_URL || 'http://localhost:3002';
const PAYLOAD_EMAIL = process.env.PAYLOAD_EMAIL;
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD;
const PAYLOAD_AUTHOR_ID = process.env.PAYLOAD_AUTHOR_ID;

if (!PAYLOAD_EMAIL || !PAYLOAD_PASSWORD) {
  console.error('❌ Error: PAYLOAD_EMAIL and PAYLOAD_PASSWORD environment variables are required');
  console.error('   Set them with:');
  console.error('   export PAYLOAD_EMAIL=admin@example.com');
  console.error('   export PAYLOAD_PASSWORD=your-password');
  process.exit(1);
}

let authToken = null;
let authorId = null;

// Sample posts data (20 posts)
const posts = [
  {
    title: "The Future of Web Development: AI-Powered Coding Assistants",
    slug: "future-of-web-development-ai-coding-assistants",
    description: "Exploring how AI coding assistants are revolutionizing the way developers write code.",
    content: "<p>The landscape of web development is rapidly evolving, and at the forefront of this transformation are AI-powered coding assistants.</p><h2>The Rise of AI Coding Assistants</h2><p>From GitHub Copilot to ChatGPT, AI coding assistants have become indispensable tools for modern developers.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Building Scalable Microservices: Best Practices and Patterns",
    slug: "building-scalable-microservices-best-practices",
    description: "A comprehensive guide to designing and implementing microservices architecture.",
    content: "<p>Microservices architecture has become the go-to approach for building large-scale applications.</p><h2>What Are Microservices?</h2><p>Microservices are an architectural approach where applications are built as a collection of loosely coupled services.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "The Art of Code Review: Building Better Software Together",
    slug: "art-of-code-review-building-better-software",
    description: "Master the craft of code review to improve code quality and build stronger teams.",
    content: "<p>Code review is one of the most valuable practices in software development.</p><h2>Why Code Reviews Matter</h2><p>Beyond finding bugs, code reviews serve multiple purposes including knowledge sharing and maintaining consistency.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "TypeScript vs JavaScript: When to Use Each",
    slug: "typescript-vs-javascript-when-to-use-each",
    description: "A practical guide to choosing between TypeScript and JavaScript for your next project.",
    content: "<p>The TypeScript vs JavaScript debate has been ongoing for years.</p><h2>What is TypeScript?</h2><p>TypeScript is a superset of JavaScript that adds static type checking.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Design Systems: Creating Consistency at Scale",
    slug: "design-systems-creating-consistency-at-scale",
    description: "Learn how to build and maintain design systems that scale with your organization.",
    content: "<p>Design systems have become essential for maintaining consistency across large applications.</p><h2>What is a Design System?</h2><p>A design system is a collection of reusable components, guided by clear standards.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Performance Optimization: Making Your Web Apps Lightning Fast",
    slug: "performance-optimization-lightning-fast-web-apps",
    description: "Essential techniques for optimizing web application performance.",
    content: "<p>Performance is crucial for user experience and SEO.</p><h2>Key Optimization Strategies</h2><p>From code splitting to image optimization, there are many ways to improve performance.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "The Power of Serverless: Building Scalable Applications",
    slug: "power-of-serverless-building-scalable-applications",
    description: "Understanding serverless architecture and when to use it.",
    content: "<p>Serverless computing has revolutionized how we build and deploy applications.</p><h2>What is Serverless?</h2><p>Serverless allows you to build and run applications without managing servers.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Accessibility First: Building Inclusive Web Experiences",
    slug: "accessibility-first-building-inclusive-web-experiences",
    description: "Why accessibility matters and how to build accessible web applications.",
    content: "<p>Accessibility is not optional—it's essential for creating inclusive web experiences.</p><h2>Why Accessibility Matters</h2><p>Building accessible websites ensures everyone can use your application.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "GraphQL vs REST: Choosing the Right API Architecture",
    slug: "graphql-vs-rest-choosing-right-api-architecture",
    description: "A comparison of GraphQL and REST APIs to help you choose the right approach.",
    content: "<p>Choosing between GraphQL and REST is one of the most important architectural decisions.</p><h2>Understanding REST</h2><p>REST has been the standard for API design for many years.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Modern CSS: Flexbox and Grid Layout Mastery",
    slug: "modern-css-flexbox-grid-layout-mastery",
    description: "Master modern CSS layout techniques with Flexbox and Grid.",
    content: "<p>Modern CSS layout tools have transformed how we build web interfaces.</p><h2>Flexbox Basics</h2><p>Flexbox provides a one-dimensional layout method.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "React Hooks: A Complete Guide",
    slug: "react-hooks-complete-guide",
    description: "Everything you need to know about React Hooks.",
    content: "<p>React Hooks revolutionized how we write React components.</p><h2>What are Hooks?</h2><p>Hooks are functions that let you use state and other React features.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Vue 3 Composition API: The Modern Way",
    slug: "vue-3-composition-api-modern-way",
    description: "Learn how to use Vue 3's Composition API effectively.",
    content: "<p>Vue 3's Composition API provides a more flexible way to organize component logic.</p><h2>Why Composition API?</h2><p>The Composition API solves problems with the Options API.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Database Design: Normalization and Best Practices",
    slug: "database-design-normalization-best-practices",
    description: "Essential database design principles for scalable applications.",
    content: "<p>Good database design is crucial for application performance and maintainability.</p><h2>Normalization Basics</h2><p>Normalization reduces data redundancy and improves data integrity.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Docker and Containerization: A Developer's Guide",
    slug: "docker-containerization-developers-guide",
    description: "Understanding Docker and containerization for modern development.",
    content: "<p>Docker has become essential for modern software development and deployment.</p><h2>What is Docker?</h2><p>Docker is a platform for developing, shipping, and running applications in containers.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "CI/CD Pipelines: Automating Your Deployment",
    slug: "cicd-pipelines-automating-deployment",
    description: "How to set up continuous integration and deployment pipelines.",
    content: "<p>CI/CD pipelines automate the process of testing and deploying code.</p><h2>What is CI/CD?</h2><p>Continuous Integration and Continuous Deployment streamline development workflows.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Security Best Practices for Web Applications",
    slug: "security-best-practices-web-applications",
    description: "Essential security practices every developer should know.",
    content: "<p>Web application security is more important than ever.</p><h2>Common Vulnerabilities</h2><p>Understanding common security vulnerabilities is the first step to prevention.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Testing Strategies: Unit, Integration, and E2E",
    slug: "testing-strategies-unit-integration-e2e",
    description: "A comprehensive guide to testing strategies for web applications.",
    content: "<p>Testing is crucial for maintaining code quality and preventing bugs.</p><h2>Types of Testing</h2><p>Different types of tests serve different purposes in the development lifecycle.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1532619675605-1ede6c9ed2d7?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "State Management in Modern Web Apps",
    slug: "state-management-modern-web-apps",
    description: "Exploring state management patterns and libraries.",
    content: "<p>State management is one of the most challenging aspects of modern web development.</p><h2>Why State Management?</h2><p>As applications grow, managing state becomes increasingly complex.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Progressive Web Apps: The Future of Mobile",
    slug: "progressive-web-apps-future-of-mobile",
    description: "Building Progressive Web Apps that work like native apps.",
    content: "<p>Progressive Web Apps combine the best of web and native applications.</p><h2>What are PWAs?</h2><p>PWAs are web applications that use modern web capabilities to provide app-like experiences.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "WebAssembly: High Performance in the Browser",
    slug: "webassembly-high-performance-browser",
    description: "Understanding WebAssembly and its use cases.",
    content: "<p>WebAssembly brings near-native performance to web applications.</p><h2>What is WebAssembly?</h2><p>WebAssembly is a binary instruction format for a stack-based virtual machine.</p>",
    status: "published",
    type: "article",
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Authenticate with Payload
 */
async function authenticate() {
  try {
    const axios = require('axios');
    const response = await axios.post(
      `${PAYLOAD_URL}/api/users/login`,
      {
        email: PAYLOAD_EMAIL,
        password: PAYLOAD_PASSWORD,
      },
      {
        withCredentials: true, // Important for cookie-based auth
      }
    );

    // Payload v3 may return token in response or use cookies
    // Try to get token from response first
    if (response.data.token) {
      authToken = response.data.token;
    } else if (response.data.user?.token) {
      authToken = response.data.user.token;
    } else {
      // If no token, we'll use cookies (stored automatically by axios)
      authToken = 'cookie'; // Marker to use cookies
    }

    // Get user ID from response
    if (response.data.user) {
      authorId = response.data.user.id;
    } else if (response.data.id) {
      authorId = response.data.id;
    }

    console.log('✅ Authenticated successfully');
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('   Please check your email and password are correct');
    }
    return false;
  }
}

/**
 * Download image from URL
 */
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      })
      .on('error', reject);
  });
}

/**
 * Upload image to Payload
 */
async function uploadImage(imageUrl, title) {
  try {
    console.log(`  📥 Downloading image for: ${title}`);
    const imageBuffer = await downloadImage(imageUrl);

    const FormData = require('form-data');
    const axios = require('axios');
    const form = new FormData();

    const filename = `${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}.jpg`;

    form.append('file', imageBuffer, {
      filename,
      contentType: 'image/jpeg',
    });

    const headers = {
      ...form.getHeaders(),
    };

    // Add authentication header if using token, otherwise rely on cookies
    if (authToken && authToken !== 'cookie') {
      headers.Authorization = `JWT ${authToken}`;
    }

    const uploadResponse = await axios.post(`${PAYLOAD_URL}/api/media`, form, {
      headers,
      withCredentials: true, // Important for cookie-based auth
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return uploadResponse.data.doc.id;
  } catch (error) {
    console.error(`  ❌ Error uploading image: ${error.message}`);
    if (error.response) {
      console.error(`  Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return null;
  }
}

/**
 * Create post in Payload
 */
async function createPost(postData, imageId) {
  try {
    const axios = require('axios');

    const postPayload = {
      title: postData.title,
      slug: postData.slug,
      description: postData.description,
      content: postData.content,
      status: postData.status,
      type: postData.type || 'article',
      publishedAt: postData.publishedAt,
      author: PAYLOAD_AUTHOR_ID || authorId,
    };

    if (imageId) {
      postPayload.image = imageId;
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    // Add authentication header if using token, otherwise rely on cookies
    if (authToken && authToken !== 'cookie') {
      headers.Authorization = `JWT ${authToken}`;
    }

    const response = await axios.post(`${PAYLOAD_URL}/api/posts`, postPayload, {
      headers,
      withCredentials: true, // Important for cookie-based auth
    });

    return response.data.doc;
  } catch (error) {
    console.error(`  ❌ Error creating post: ${error.message}`);
    if (error.response) {
      console.error(`  Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return null;
  }
}

/**
 * Get author ID if not provided
 */
async function getAuthorId() {
  if (PAYLOAD_AUTHOR_ID) {
    authorId = PAYLOAD_AUTHOR_ID;
    return;
  }

  try {
    const axios = require('axios');
    const headers = {};

    // Add authentication header if using token, otherwise rely on cookies
    if (authToken && authToken !== 'cookie') {
      headers.Authorization = `JWT ${authToken}`;
    }

    const response = await axios.get(`${PAYLOAD_URL}/api/users?where[role][equals]=admin&limit=1`, {
      headers,
      withCredentials: true, // Important for cookie-based auth
    });

    if (response.data.docs && response.data.docs.length > 0) {
      authorId = response.data.docs[0].id;
      console.log(`✅ Using author ID: ${authorId}`);
    } else {
      console.error('❌ No admin user found');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error fetching author:', error.message);
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Payload post seeding process...\n');

  // Authenticate
  const authenticated = await authenticate();
  if (!authenticated) {
    process.exit(1);
  }

  // Get author ID
  await getAuthorId();

  console.log(`📝 Processing ${posts.length} posts...\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`[${i + 1}/${posts.length}] Processing: ${post.title}`);

    try {
      // Upload image if URL is provided
      let imageId = null;
      if (post.image_url) {
        imageId = await uploadImage(post.image_url, post.title);
        if (!imageId) {
          console.log(`  ⚠️  Warning: Image upload failed, continuing without image`);
        } else {
          console.log(`  ✅ Image uploaded`);
        }
      }

      // Create post
      const createdPost = await createPost(post, imageId);

      if (createdPost) {
        console.log(`  ✅ Post created: ${createdPost.id}`);
        successCount++;
      } else {
        console.log(`  ❌ Failed to create post`);
        failCount++;
      }
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      failCount++;
    }

    // Small delay to avoid rate limiting
    if (i < posts.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Successfully created: ${successCount} posts`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount} posts`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Run the script
main().catch(console.error);

