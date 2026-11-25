# Stratala Agent Instructions

## Scope

These instructions apply to the entire repository. More specific `AGENTS.md`
files override them for their subdirectories.

## Project Overview

Stratala is a pnpm/Turborepo monorepo containing:

- `apps/web`: Nuxt 4 frontend
- `apps/backend`: AdonisJS 6 API
- `apps/studio`: Payload CMS / Next.js application
- `packages/shared-types`: Shared TypeScript types
- `packages/shared-utils`: Shared utilities
- `packages/eslint-config`: Shared lint configuration
- `packages/shared-config`: Shared TypeScript configuration

Read `openspec/project.md` for architecture, conventions, domain context, and
environment requirements.

## Agent skills

### Issue tracker

Issues are tracked in the `Stratala` project in Linear through Linear MCP. See
`docs/agents/issue-tracker.md`.

### Triage labels

Use the five canonical Matt Pocock triage labels unchanged. See
`docs/agents/triage-labels.md`.

### Domain docs

This repository uses a single-context domain documentation layout. See
`docs/agents/domain.md`.

## Before Making Changes

1. Inspect the relevant application and existing patterns.
2. Read applicable documentation under `docs/`.
3. Check for a more specific `AGENTS.md` in the target directory.
4. For planned feature work, inspect the relevant OpenSpec change under
   `openspec/changes/`.
5. Do not modify unrelated files or overwrite existing user changes.

## Engineering Conventions

- Use TypeScript strict mode.
- Use single quotes and semicolons in JS/TS.
- Use two-space indentation.
- Keep lines within the repository's Prettier limits.
- Prefer existing abstractions and service-layer patterns.
- Use runtime validation for external input.
- Keep controllers focused on HTTP concerns.
- Put backend business logic in services.
- Use shared packages for types and utilities used across applications.
- Preserve SSR behavior for public Nuxt pages.

## Testing and Validation

Run the narrowest relevant checks first, then broader checks as practical:

```bash
pnpm lint
pnpm format:check
pnpm type-check
pnpm test
pnpm test:e2e
pnpm build
```

For focused work, use filters:

```bash
pnpm --filter web test
pnpm --filter backend test
pnpm --filter studio test
pnpm --filter web type-check
```

Add or update tests for behavior changes. Do not weaken or remove tests merely
to make validation pass.

## Security

- Never commit secrets, credentials, tokens, or real user data.
- Use environment variables for secrets and update the appropriate example file
  when adding configuration.
- Treat all external input as untrusted.
- Do not disable authentication, authorization, CSP, CORS, or validation without
  documenting the reason and security impact.
- Do not use production credentials in local development or tests.

## OpenSpec Workflow

For non-trivial changes:

1. Review or create an OpenSpec proposal.
2. Define behavior in a spec.
3. Break implementation into verifiable tasks.
4. Implement incrementally.
5. Run the relevant validation commands.
6. Update documentation when behavior or configuration changes.

## Git

- Use conventional commits, such as: `feat(web): add ...`, `fix(backend): ...`,
  or `docs: ...`.
- Do not commit, amend, reset, rebase, or push unless explicitly requested.
- Before reporting completion, summarize changed files and validation results.
