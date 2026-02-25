![Stratala](https://media.canva.com/v2/image-resize/format:JPG/height:912/quality:92/uri:ifs%3A%2F%2FM%2Fbfa71bf4-bce6-4a28-9993-1e5b45b503f3/watermark:F/width:1600?csig=AAAAAAAAAAAAAAAAAAAAAFy71lZI0QKDhEYPmrobzkZBmn_v82qsqBw9X_I1Rqou&exp=1770772306&osig=AAAAAAAAAAAAAAAAAAAAADG5stF6osoKjx2ZHlNHUbcQmc8nl32v7qZnn4J6DCEG&signer=media-rpc&x-canva-quality=screen_3x)
# Stratala - The modern content platform for creators



[![Turborepo](https://img.shields.io/badge/Built%20with-Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.0-00DC82?style=for-the-badge&logo=nuxt&logoColor=white)](https://nuxt.com)
[![AdonisJS](https://img.shields.io/badge/AdonisJS-6.0-5A45FF?style=for-the-badge&logo=adonisjs&logoColor=white)](https://adonisjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![pnpm](https://img.shields.io/badge/pnpm-10.15-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io)

**A unified space where writers, video creators, and storytellers publish, grow, and earn — all in one place.**

Stratala is a next-generation content platform that blends the best of Substack, YouTube, and Medium. It empowers creators to share their work in any format - text, video, or audio - while building direct relationships with their audiences. With built-in monetization tools, analytics, and community features, Stratala gives creators full control over their content and income.

[Features](#-features) • [Quick Start](#-quick-start) •
[Architecture](#-architecture) • [Testing](./TESTING.md) •
[Documentation](#-documentation)

---

## ✨ Features

### 📝 **Content Creation & Publishing**

- **Rich Text Editor** - Create beautiful articles with a powerful WYSIWYG
  editor
- **Video Support** - Upload and stream video content (like YouTube)
- **Newsletter Publishing** - Send posts directly to subscriber inboxes (like
  Substack)
- **Draft & Schedule** - Write drafts and schedule posts for later publication
- **Categories & Tags** - Organize content with a flexible taxonomy system
- **SEO Optimization** - Automatic meta tags, sitemaps, and structured data

### 👥 **Creator & Audience Features**

- **Creator Profiles** - Customizable profiles for writers and video creators
- **Follow System** - Readers can follow their favorite creators
- **Engagement Metrics** - Track views, likes, and reader engagement
- **Comments & Discussions** - Foster community around your content
- **Trending Content** - Algorithmic discovery of popular posts
- **Personalized Feeds** - Curated content based on user interests

### 💰 **Monetization**

- **Paid Subscriptions** - Offer premium content behind paywalls (like Substack)
- **Tiered Memberships** - Multiple subscription levels with different benefits
- **Usage-Based Billing** - Metered billing for premium features
- **Multi-Gateway Payments** - Stripe, PayPal, and Adyen support
- **Invoice Management** - Automatic invoicing with tax handling

### 🏗️ **Platform Architecture**

- **Turborepo** - High-performance build system with intelligent caching
- **pnpm Workspaces** - Fast, disk space efficient package management
- **Shared Packages** - Reusable types, utilities, and configurations

### 🎨 **Modern Frontend**

- **Nuxt 4** - The Intuitive Vue Framework with server-side rendering
- **Nuxt UI Pro** - Beautiful, accessible components built on Radix Vue
- **TypeScript** - Full type safety across the entire stack
- **Payload CMS** - Headless CMS for content management
- **Visual Editing** - Live preview and editing with Payload integration

### ⚡ **Powerful Backend**

- **AdonisJS 6** - Elegant Node.js framework with full TypeScript support
- **SQLite/PostgreSQL** - Flexible database options with Lucid ORM
- **Better Auth** - Modern authentication with email/password and OAuth (Google,
  GitHub)
- **API Documentation** - Auto-generated Swagger/OpenAPI docs

### 🛠️ **Developer Experience**

- **ESLint 9** - Modern flat config with shared rules across workspace
- **Prettier** - Consistent code formatting
- **TypeScript Project References** - Fast incremental builds
- **Hot Module Replacement** - Lightning-fast development workflow
- **Docker** - Containerized development and deployment
- **Testing** - Vitest for unit tests, Playwright for E2E tests

### 🔒 **Production Ready**

- **Type-safe APIs** - End-to-end type safety with TypeScript
- **Security Headers** - nuxt-security module configured
- **CDN Ready** - Optimized for global content delivery
- **Performance** - Optimized builds with tree-shaking and code splitting

---

## 📁 Project Structure

```
turborepo-saas-starter/
├── apps/
│   ├── web/                    # Nuxt 4 frontend application
│   │   ├── app/               # Nuxt app directory
│   │   ├── server/            # Nuxt server routes & API
│   │   ├── content/           # Content files (blog, docs, changelog)
│   │   └── shared/            # App-specific shared code
│   │
│   ├── backend/               # AdonisJS API server
│   │   ├── app/              # Controllers, models, middleware
│   │   ├── config/           # Configuration files
│   │   ├── database/         # Migrations and seeders
│   │   └── start/            # Kernel and routes
│   │
│   └── cms/                   # Payload CMS
│       └── payload/          # Payload CMS instance
│
├── packages/
│   ├── eslint-config/        # Shared ESLint configurations
│   │   ├── base.js          # Base rules for all projects
│   │   ├── typescript.js    # TypeScript-specific rules
│   │   ├── vue.js           # Vue/Nuxt rules
│   │   └── node.js          # Node.js/backend rules
│   │
│   ├── shared-config/        # Shared configurations
│   │   └── tsconfig.base.json  # Base TypeScript config
│   │
│   ├── shared-types/         # Shared TypeScript types
│   │   └── src/
│   │       ├── index.ts     # Common types
│   │       └── schema.ts    # Generated Payload schema
│   │
│   └── shared-utils/         # Shared utility functions
│       └── src/
│           └── index.ts     # Utility functions
│
└── docs/                      # Documentation
    ├── TOOLING_SETUP.md      # ESLint, Prettier, TypeScript setup
    ├── PACKAGE_FIXES.md      # Package configuration guide
    └── ...                   # Additional documentation
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0
- **Docker** (optional, for CMS)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/stratala.git
cd stratala

# Install dependencies
pnpm install

# Start Payload CMS (optional)
pnpm docker:up

# Start development servers
pnpm dev
```

This will start:

- 🌐 **Frontend** at http://localhost:3000
- 🔌 **Backend API** at http://localhost:3333
- 📦 **Payload CMS** at http://localhost:3001

### Environment Setup

Create `.env` files in each app:

```bash
# apps/web/.env
NUXT_PUBLIC_SITE_URL=http://localhost:3000
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
NUXT_PUBLIC_ENABLE_VISUAL_EDITING=true

# apps/backend/.env
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=your-secret-key-here
SESSION_DRIVER=cookie

# Better Auth Configuration
BETTER_AUTH_SECRET=your-32-char-secret-key
BETTER_AUTH_URL=http://localhost:3333

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Lago Billing Configuration
LAGO_API_URL=http://localhost:3100
LAGO_API_KEY=your-lago-api-key

# Payment Gateway (Stripe example)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### OAuth Setup (Optional)

To enable Google or GitHub authentication:

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URI: `http://localhost:3333/api/auth/callback/google`
6. Copy Client ID and Client Secret to your `.env`

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Authorization callback URL:
   `http://localhost:3333/api/auth/callback/github`
4. Copy Client ID and generate Client Secret
5. Add them to your `.env`

---

## 💻 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm dev --filter web # Start only the web app

# Building
pnpm build           # Build all apps for production
pnpm build --filter backend # Build only the backend

# Code Quality
pnpm lint            # Lint all packages
pnpm lint:fix        # Fix linting issues
pnpm format          # Format code with Prettier
pnpm type-check      # Type check with TypeScript

# Testing
pnpm test            # Run unit tests (Vitest)
cd apps/web && pnpm test:ui # Unit tests with UI
pnpm test:e2e        # Run E2E tests (Playwright)
pnpm test:e2e:ui     # E2E tests with UI

# See TESTING.md for full testing documentation

# Docker
pnpm docker:up       # Start Docker services
pnpm docker:down     # Stop Docker services
pnpm docker:build    # Rebuild Docker containers

# Cleanup
pnpm clean           # Remove build artifacts and node_modules
```

### Adding a New Package

```bash
# Create package directory
mkdir -p packages/my-package/src

# Create package.json
cat > packages/my-package/package.json << EOF
{
  "name": "@stratala/my-package",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "type-check": "tsc --noEmit"
  }
}
EOF

# Install dependencies
pnpm install
```

---

## 🏛️ Architecture

### Monorepo Benefits

- **Code Sharing** - Share types, utilities, and configs across apps
- **Atomic Changes** - Make changes across multiple packages in one PR
- **Consistent Tooling** - Single ESLint, Prettier, and TypeScript config
- **Optimized Builds** - Turborepo caches and parallelizes builds
- **Type Safety** - End-to-end type safety with TypeScript project references

### Tech Stack

#### Frontend (Nuxt App)

```typescript
Nuxt 4 + Vue 3
├── Nuxt UI Pro          // Component library
├── Pinia                // State management
├── Radix Vue            // Headless UI primitives
├── Tailwind CSS         // Utility-first CSS
├── VeeValidate + Zod    // Form validation
├── Payload Local API    // CMS integration for content
├── Video Player         // Video streaming support
├── Feed System          // Personalized content feeds
└── Engagement           // Likes, follows, comments
```

#### Backend (AdonisJS)

```typescript
AdonisJS 6
├── Lucid ORM           // Database ORM
├── Better Auth         // Modern authentication with OAuth
├── Content Management  // Posts, videos, media handling
├── Engagement APIs     // Follows, likes, views, comments
├── Feed Generation     // Personalized content feeds
├── Trending Engine     // Content discovery algorithms
├── Billing Service     // Subscriptions and payments
├── Validator (Vine)    // Request validation
├── Swagger             // API documentation
└── PostgreSQL/SQLite   // Database options
```

#### CMS (Payload)

```typescript
Payload CMS
├── PostgreSQL         // Database
├── Local API          // Server-side integration
├── REST API           // Client-side integration
└── Type Generation    // TypeScript types
```

#### Billing (Lago)

```typescript
Lago
├── Subscription Management   // Recurring billing, tiers
├── Usage-Based Billing      // Metered billing
├── Invoice Generation       // PDF invoices, tax
├── REST APIs                // Easy integration
├── Multi-Gateway Support    // Stripe, PayPal, Adyen
└── Admin Dashboard          // Billing management UI
```

### Package Dependencies

```mermaid
graph TD
    A[apps/web] --> E[shared-types]
    A --> F[eslint-config]
    B[apps/backend] --> E
    B --> F
    C[shared-utils] --> E
    E --> D[shared-config]
    F --> D
```

### Content Flow Architecture

```mermaid
graph LR
    A[Creator] -->|Writes| B[Payload CMS]
    B -->|Publishes| C[AdonisJS Backend]
    C -->|Generates| D[Personalized Feeds]
    C -->|Tracks| E[Engagement Metrics]
    D -->|Serves| F[Readers]
    F -->|Interacts| E
    E -->|Updates| D
```

---

## 💳 Monetization & Billing

Stratala provides flexible monetization options for creators, powered by Lago.

### Setup Lago

```bash
# Using Docker Compose (included in project)
docker-compose up -d

# Access Lago Admin Dashboard
open http://localhost:3001

# Create your first subscription plan via API
curl -X POST http://localhost:3100/api/v1/plans \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"plan": {"code": "creator-pro", "name": "Creator Pro", "interval": "monthly", "amount_cents": 999}}'
```

### Monetization Features

#### 💰 **Paid Subscriptions**

- **Premium Content** - Put articles and videos behind paywalls
- **Tiered Plans** - Offer multiple subscription levels (Basic, Pro, Premium)
- **Recurring Billing** - Monthly, yearly, or custom billing intervals
- **Free Trials** - Let readers try premium content before subscribing
- **Proration** - Handle plan upgrades/downgrades seamlessly

#### 📊 **Creator Analytics**

- **Subscriber Count** - Track total and active subscribers
- **Revenue Metrics** - MRR, ARR, and revenue growth
- **Engagement Stats** - Views, likes, and comments per post
- **Audience Insights** - Reader demographics and behavior

#### 🧾 **Payment Management**

- **Automatic Invoicing** - Generate invoices for all transactions
- **Multi-Currency** - Support for global audiences
- **Tax Handling** - Automatic tax calculation
- **Payment Recovery** - Dunning management for failed payments

#### 🔌 **Payment Gateways**

- **Stripe** - Credit cards, ACH, SEPA
- **PayPal** - PayPal accounts and cards
- **Adyen** - Global payment methods

### Example: Creating a Paid Newsletter

```typescript
// apps/backend/app/services/billing_service.ts
import BillingService from '#services/billing_service';

// 1. Set up creator's billing account
const customer = await BillingService.createCustomer({
  externalId: creator.id,
  name: creator.fullName,
  email: creator.email,
  currency: 'USD',
});

// 2. Create a subscription plan for premium content
const subscription = await BillingService.createSubscription({
  externalCustomerId: reader.id,
  planCode: 'newsletter-premium',
  name: 'Premium Newsletter Access',
});

// 3. Check if reader has access to premium content
const hasAccess = await BillingService.checkSubscription(
  reader.id,
  'newsletter-premium'
);

// 4. Get creator's revenue
const invoices = await BillingService.getInvoices(creator.id);
```

### Documentation

See [**LAGO_INTEGRATION.md**](./LAGO_INTEGRATION.md) for complete setup and
usage guide

---

## 📚 Documentation

> **📖 Documentation System:** All documentation lives in `docs/` and syncs to
> Nuxt Content. See [**Documentation Guide**](./DOCUMENTATION_GUIDE.md) for how
> to create and manage docs.

### Core Documentation

- [**Quick Start**](./docs/getting-started/QUICK_START.md) - Get up and running
  quickly
- [**Authentication**](./docs/authentication/AUTHENTICATION.md) - Complete guide
  to Better Auth integration
- [**Better Auth Architecture**](./docs/authentication/BETTER_AUTH_ARCHITECTURE.md) -
  Quick reference with flow diagrams
- [**Testing**](./docs/testing/TESTING.md) - Vitest and Playwright testing setup

### Architecture

- [**Architecture Overview**](./docs/architecture/ARCHITECTURE.md) - System
  architecture and design
- [**Implementation Summary**](./docs/architecture/IMPLEMENTATION_SUMMARY.md) -
  Key implementation details
- [**Package Structure**](./docs/architecture/PACKAGE_STRUCTURE.md) - Monorepo
  organization
- [**Pinia State Management**](./docs/architecture/PINIA_STATE_MANAGEMENT.md) -
  State management with Pinia stores
- [**Smart Routing System**](./docs/architecture/ROUTING_SYSTEM.md) - Dynamic
  routing based on auth status and roles
- [**Migration Progress**](./docs/architecture/MIGRATION_PROGRESS.md) -
  Development migration notes

### Tooling

- [**ESLint & Prettier Setup**](./docs/tooling/ESLINT_PRETTIER_SETUP.md) - Code
  formatting and linting
- [**Config Files**](./docs/tooling/CONFIG_FILES.md) - Configuration file
  documentation
- [**Module Types**](./docs/tooling/MODULE_TYPES.md) - Module system
  documentation

### Integration Guides

- [**Better Auth Integration**](./docs/authentication/BETTER_AUTH_INTEGRATION.md) -
  Technical implementation details
- [**Lago Setup & Configuration**](./docs/integrations/LAGO_SETUP.md) - Complete
  Lago billing setup guide
- [**Lago Integration**](./docs/integrations/LAGO_INTEGRATION.md) - Billing and
  subscription management API

### Deployment

- [**Production Deployment**](./docs/deployment/PRODUCTION_DEPLOYMENT.md) -
  Complete deployment guide

### Framework Documentation

- [Turborepo Docs](https://turbo.build/repo/docs)
- [Nuxt Documentation](https://nuxt.com/docs)
- [AdonisJS Documentation](https://docs.adonisjs.com)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Lago Documentation](https://docs.getlago.com)

### Guides & Tutorials

- [Adding a New Package](#adding-a-new-package)
- [Environment Configuration](#environment-setup)
- [Deployment Guide](./docs/DEPLOYMENT.md) _(coming soon)_
- [Contributing Guidelines](./CONTRIBUTING.md) _(coming soon)_

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm test --filter backend

# Run tests in watch mode
pnpm test --watch
```

---

## 🔄 CI/CD

### GitHub Actions Workflows

This project includes comprehensive CI/CD workflows:

#### 🧪 **Continuous Integration**

Runs on every push and PR:

- ✅ **Lint** - Code quality checks
- ✅ **Type Check** - TypeScript validation
- ✅ **Build** - Production builds
- ✅ **Test** - Automated testing

#### 🚀 **Automated Deployment**

- **Preview Deployments** - Automatic preview for PRs
- **Production Deploy** - Deploy to production on merge to main
- **Multi-platform Support** - Vercel, Netlify, Railway, Render

#### 🔒 **Security & Quality**

- **CodeQL Analysis** - Security vulnerability scanning
- **Dependency Review** - License and security checks
- **Dependabot** - Automated dependency updates

#### 📦 **Release Management**

- **Automated Releases** - Create releases from git tags
- **Changelog Generation** - Auto-generated release notes
- **Build Artifacts** - Downloadable builds

### Status Badges

[![CI](https://github.com/yourusername/turborepo-saas-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/turborepo-saas-starter/actions/workflows/ci.yml)
[![Deploy Production](https://github.com/yourusername/turborepo-saas-starter/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/yourusername/turborepo-saas-starter/actions/workflows/deploy-production.yml)
[![CodeQL](https://github.com/yourusername/turborepo-saas-starter/actions/workflows/codeql.yml/badge.svg)](https://github.com/yourusername/turborepo-saas-starter/actions/workflows/codeql.yml)

### Setup CI/CD

1. **Enable GitHub Actions** in repository settings
2. **Add required secrets**:
   ```bash
   PRODUCTION_URL       # Your production domain
   PAYLOAD_PUBLIC_SERVER_URL  # CMS URL
   VERCEL_TOKEN         # Deployment token (if using Vercel)
   ```
3. **Configure branch protection** for `main` branch
4. **Enable Dependabot** for automated updates

See [`.github/workflows/README.md`](./.github/workflows/README.md) for detailed
documentation.

---

## 🚢 Deployment

### Build for Production

```bash
# Build all apps
pnpm build

# Build specific app
pnpm build --filter web
```

### Docker Deployment

```bash
# Build production images
pnpm docker:build

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Recommended Platforms

- **Frontend (Nuxt)**: Vercel, Netlify, Cloudflare Pages
- **Backend (AdonisJS)**: Railway, Render, DigitalOcean App Platform
- **CMS (Payload)**: Self-hosted on any VPS or platform
- **Media Storage**: AWS S3, Cloudflare R2, or MinIO for video/images
- **Lago**: Docker Compose, Kubernetes, or managed hosting

### Scaling Considerations

- **CDN**: Use a CDN for media delivery and static assets
- **Database**: PostgreSQL with read replicas for high traffic
- **Caching**: Redis for session storage and feed caching
- **Video**: Consider dedicated video streaming services for high volume

---

## 🤝 Contributing

Contributions are welcome! Please read our
[Contributing Guidelines](./CONTRIBUTING.md) before submitting a PR.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting and tests (`pnpm lint && pnpm test`)
5. Commit using conventional commits
   (`git commit -m 'feat(web): add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📝 License

This project is licensed under the **ISC License**.

---

## 🙏 Acknowledgments

Built with amazing open-source technologies:

- [Turborepo](https://turbo.build/repo) - High-performance build system
- [Nuxt](https://nuxt.com) - The Intuitive Vue Framework
- [AdonisJS](https://adonisjs.com) - Elegant Node.js framework
- [Payload CMS](https://payloadcms.com) - TypeScript headless CMS
- [Lago](https://www.getlago.com) - Open-source billing platform
- [Radix Vue](https://www.radix-vue.com) - Unstyled, accessible components
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework

---

<div align="center">

**[⬆ back to top](#-stratala)**

Made with ❤️ for creators and readers everywhere

</div>
