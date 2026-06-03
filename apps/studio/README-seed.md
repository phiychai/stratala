# Payload CMS Seed Script

This script seeds deterministic studio posts using Payload's Local API with idempotent behavior and explicit seed modes.

## Prerequisites

1. **Payload CMS configured**: `apps/studio/.env` must include:
   - `PAYLOAD_SECRET`
   - `DATABASE_URI` or `PAYLOAD_DATABASE_URI`
2. **Admin user exists**: The seed uses the first `admin` user as author.

## Usage

```bash
cd apps/studio
pnpm seed
```

## Seed Modes

`SEED_MODE` controls behavior for existing posts (lookup key: `slug`).

- `create-missing` (default): create only missing posts, skip existing posts.
- `refresh`: update existing seeded posts by slug and create missing posts.
- `reset-seeded`: delete known seed slugs first, then recreate from dataset.

Example:

```bash
SEED_MODE=refresh pnpm seed
```

## Image Behavior

- `SEED_SKIP_IMAGES=true` disables image download/upload.
- Images are reused by deterministic filename (`<slug>.jpg`) when already present in `media`.
- Download behavior:
  - `SEED_IMAGE_RETRIES` (default `2`)
  - `SEED_IMAGE_TIMEOUT_MS` (default `15000`)
- If image download/upload fails, seeding continues without image.

## What It Seeds

- Post dataset lives in `apps/studio/src/seed-data/posts.ts`.
- Lexical content helpers live in `apps/studio/src/seed-data/lexical.ts`.
- Runtime orchestration lives in `apps/studio/src/seed.ts`.

## Run Output

The script prints a summary in this format:

- `created=<n>`
- `updated=<n>`
- `skipped=<n>`
- `failed=<n>`

Expected behavior:

- First run in `create-missing`: mostly `created`.
- Re-run in `create-missing`: mostly `skipped`, no duplicate posts.
- Re-run in `refresh`: existing posts move to `updated`.

## Troubleshooting

### No admin user found

Create an admin user in Payload first (`pnpm dev` then use `/admin`).

### Database connection error

Verify PostgreSQL is running and `DATABASE_URI` is valid.

### Image download failures

Set `SEED_SKIP_IMAGES=true` for offline/fast seeding.
