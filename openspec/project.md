# Project Context

## Purpose

Stratala is a monorepo template for building modern SaaS applications. It
provides a fully-featured, enterprise-grade foundation with a frontend
application, backend API, headless CMS, and shared packages—all managed with
Turborepo and pnpm workspaces.

**Current Status**: Under active development, not production-ready.

## Tech Stack

### Core Infrastructure

- **Turborepo** - High-performance build system with intelligent caching
- **pnpm 10.x** - Package manager with workspaces
- **Docker** - Containerized development and deployment
- **TypeScript 5.8+** - Full type safety across the entire stack

### Frontend (`apps/web`)

- **Nuxt 4** - Vue meta-framework with SSR support
- **Vue 3** - Composition API with `<script setup>`
- **Nuxt UI 4** - Component library built on Radix Vue
- **Pinia** - State management with persisted state
- **VeeValidate + Zod** - Form validation
- **Tailwind CSS** - Utility-first styling
- **VueUse** - Composable utilities
- **Nuxt Content** - File-based CMS for docs/blog
- **Better Auth** - Client-side authentication

### Backend (`apps/backend`)

- **AdonisJS 6** - Full-featured Node.js framework
- **Lucid ORM** - Database ORM with migrations/seeders
- **Better Auth** - Authentication (email/password, Google, GitHub OAuth)
- **VineJS** - Request validation
- **SQLite/PostgreSQL** - Database options
- **Redis** - Session storage and caching
- **Auto-Swagger** - API documentation generation

### Studio (`apps/studio`)

- **Payload CMS 3.x** - TypeScript headless CMS
- **Next.js 15** - Admin panel framework
- **React 19** - Admin UI
- **PostgreSQL** - Database
- **Lexical** - Rich text editor

### Shared Packages

- `@stratala/eslint-config` - ESLint 9 flat config and Prettier
- `@stratala/shared-types` - Cross-app TypeScript types
- `@stratala/shared-utils` - Utility functions
- `@stratala/shared-config` - Base TypeScript config

## Project Conventions

### Code Style

- **Line width**: 100 characters (80 for JSON/Markdown)
- **Indentation**: 2 spaces
- **Quotes**: Single quotes (JS/TS), double quotes (JSX)
- **Semicolons**: Always
- **Trailing commas**: ES5 style
- **Line endings**: LF
- **Imports**: Auto-organized via Prettier plugin

### File Naming

- **Components**: PascalCase (e.g., `UserProfile.vue`, `AppHeader.vue`)
- **Composables**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utils/Services**: snake_case (backend) or camelCase (frontend)
- **Routes/Pages**: kebab-case directories (e.g., `pages/forgot-password.vue`)

### TypeScript

- Strict mode enabled
- Explicit return types on public APIs
- Interfaces preferred over types for object shapes
- Zod schemas for runtime validation

### Vue/Nuxt Conventions

- `<script setup>` syntax for components
- Props destructuring enabled (`vue.propsDestructure: true`)
- Components auto-imported (no explicit imports needed)
- Composables for reusable logic

### AdonisJS Conventions

- Services for business logic (e.g., `TrendingService`)
- Controllers for HTTP handling
- Models for database entities (Lucid ORM)
- Path aliases: `#controllers/*`, `#services/*`, `#models/*`, etc.

### Architecture Patterns

- **Monorepo**: Shared code via workspace packages
- **SSR/CSR Hybrid**: Public pages SSR for SEO, authenticated pages CSR
- **Service Layer**: Business logic in dedicated service classes
- **API-First**: Backend exposes RESTful APIs consumed by frontend
- **Multi-tenant CMS**: Payload supports tenant-aware content

### Testing Strategy

- **Unit Tests**: Vitest for frontend, Japa for backend
- **E2E Tests**: Playwright at monorepo root
- **Test Files**: `*.spec.ts` or `*.test.ts`
- **Coverage**: Run with `--coverage` flag

### Git Workflow

- **Branching**: Feature branches from `main`
- **Commits**: Conventional commits format
  - `feat(scope): description` - New features
  - `fix(scope): description` - Bug fixes
  - `docs(scope): description` - Documentation
  - `refactor(scope): description` - Code refactoring
  - `test(scope): description` - Test additions
  - `chore(scope): description` - Maintenance
- **Scopes**: `web`, `backend`, `cms`, `shared`, `docs`

## Domain Context

### Application Structure

The platform is a content-focused SaaS with:

- **User Profiles**: User accounts with usernames (`/@username` routes)
- **Content Types**: Posts and Videos managed via Payload CMS
- **Engagement**: Views, likes, trending algorithms
- **Library**: User-saved content
- **Feed**: Personalized content discovery
- **Explore**: Public content browsing

### Authentication Flow

- Better Auth handles all authentication
- Supports email/password and OAuth (Google, GitHub)
- Sessions stored in Redis/cookies
- Frontend uses `useAuth()` composable

### Content Management

- Payload CMS is the source of truth for content
- Frontend fetches via Payload REST API
- Backend tracks engagement (views, likes) in SQLite/PostgreSQL
- Trending scores calculated from engagement + recency

## Important Constraints

### Technical Constraints

- Node.js >= 18.0.0 required
- pnpm >= 9.0.0 required (currently 10.x)
- TypeScript strict mode enforced
- ESLint errors must be resolved before commit

### Performance Constraints

- Public pages must be SSR-enabled for SEO
- Authenticated routes use CSR for faster navigation
- Prerendering enabled for static pages (`/`, `/docs/**`, `/blog/**`)

### Security Constraints

- CSP headers enabled in production
- `nuxt-security` module configured
- OAuth credentials stored in environment variables
- Better Auth secret must be 32+ characters

## External Dependencies

### Required Services

| Service            | Purpose            | Local Port |
| ------------------ | ------------------ | ---------- |
| Frontend (Nuxt)    | Web application    | 3000       |
| Backend (AdonisJS) | API server         | 3333       |
| Payload CMS        | Content management | 3002       |
| PostgreSQL         | Payload database   | 5432       |
| Redis              | Sessions/cache     | 6379       |

### Optional Services

| Service | Purpose               | Local Port |
| ------- | --------------------- | ---------- |
| Lago    | Billing/subscriptions | 3100       |

### Environment Variables

Key environment variables (see `env.example` in each app):

- `BETTER_AUTH_SECRET` - Auth encryption key
- `BETTER_AUTH_URL` - Backend URL for auth
- `NUXT_PUBLIC_API_URL` - Backend API URL
- `NUXT_PUBLIC_PAYLOAD_URL` - Payload CMS URL
- `GOOGLE_CLIENT_ID/SECRET` - Google OAuth
- `GITHUB_CLIENT_ID/SECRET` - GitHub OAuth
- `DATABASE_URL` - PostgreSQL connection (Payload)

## Commands Reference

```bash
# Development
pnpm dev                    # Start all apps
pnpm dev --filter web       # Start frontend only
pnpm dev --filter backend   # Start backend only

# Building
pnpm build                  # Build all apps
pnpm type-check             # TypeScript validation

# Code Quality
pnpm lint                   # Lint all packages
pnpm lint:fix               # Auto-fix lint issues
pnpm format                 # Format with Prettier

# Testing
pnpm test                   # Unit tests
pnpm test:e2e               # E2E tests (Playwright)
pnpm test:e2e:ui            # E2E with UI

# Docker
pnpm docker:up              # Start services
pnpm docker:down            # Stop services

# Database
pnpm seed:all               # Run seeders
pnpm seed:reset             # Reset databases
```
