# Payload CMS Seed Script

This script seeds deterministic studio posts using Payload Local API with rerun-safe behavior and explicit modes.

## Prerequisites

1. `apps/studio/.env` must include:
   - `PAYLOAD_SECRET`
   - `DATABASE_URI` or `PAYLOAD_DATABASE_URI`
2. Publisher users must exist (created by backend `seed:all`).
3. Network access is required for remote image download unless image mode is skipped.

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

Examples:

```bash
SEED_MODE=refresh pnpm seed
SEED_MODE=reset-seeded pnpm seed
```

## Dataset and Content Quality

- Dataset contains **40 posts** from `apps/studio/src/seed-data/posts.ts`.
- Posts are generated from structured content specs (intro, body, list, quote, optional code).
- Rich text JSON is built by `apps/studio/src/seed-data/content-builders.ts`.
- Post bodies demonstrate:
  - ordered/unordered lists,
  - quote blocks,
  - inline image embeds (media relation nodes in content, not external URL links).

## Image Behavior

- `SEED_SKIP_IMAGES=true` disables image fetch/upload.
- Media is reused deterministically by hashed filename: `seed-<key>-<hash>.<ext>`.
- Retry/timeout controls:
  - `SEED_IMAGE_RETRIES` (default `2`)
  - `SEED_IMAGE_TIMEOUT_MS` (default `15000`)
- If a media download/upload fails, seeding continues with graceful fallback (post without that image embed/featured image).

## Idempotency and Reruns

- Default mode is `create-missing`, so reruns skip existing slugs and do not duplicate posts.
- `refresh` can be used when you need to overwrite seeded records by slug.
- `reset-seeded` removes known seed slugs and recreates the full dataset.

## Summary Output

Studio seed prints:

- `summary posts created=<n> updated=<n> skipped=<n> failed=<n>`
- `summary media created=<n> reused=<n> failed=<n> skipped=<n>`

Expected outcomes:

- First `create-missing` run: mostly `created`.
- Second `create-missing` run: mostly `skipped`, with no duplicate slugs.
- `refresh` run: existing seeded posts move to `updated`.

## Quick Verification

1. Run seed in default mode: `pnpm seed`.
2. Verify total post count is 40 in Payload admin.
3. Open multiple seeded posts and confirm body includes list + quote; inline image appears in a strong subset.
4. Re-run `pnpm seed` and confirm summary shows mostly `skipped`.
5. Run `SEED_SKIP_IMAGES=true pnpm seed` and confirm seed still completes.

## Troubleshooting

### No publisher user found

Run backend user seed first:

```bash
cd apps/backend
node ace seed:all
```

### Database connection error

Verify PostgreSQL is running and `DATABASE_URI` is valid.

### Image download failures

- Use `SEED_SKIP_IMAGES=true` for offline/fast local runs.
- Increase `SEED_IMAGE_TIMEOUT_MS` or `SEED_IMAGE_RETRIES` for unstable network conditions.
