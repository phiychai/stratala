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

- `create-missing` (only mode): create missing posts and skip existing posts.

Seeding is refused in `NODE_ENV=production` unless `ALLOW_PRODUCTION_SEED=true`.

Examples:

```bash
pnpm seed
```

## Dataset and Content Quality

- Dataset contains **20 posts** from `apps/studio/src/seed-data/posts.ts` (15 published and 5 draft).
- Post dates use a fixed 2025-01-01 reference date and are stable across runs.
- Rich text JSON is built by `apps/studio/src/seed-data/lexical.ts`; some bodies include
  textual Unsplash URLs, not inline media relationship nodes.
- Each post is assigned to the tenant membership of its selected publisher author.

## Image Behavior

- `SEED_SKIP_IMAGES=true` disables image fetch/upload.
- Media is reused deterministically by the post slug filename (`<slug>.jpg`).
- Only `image/*` responses are accepted and downloads are limited to 10 MiB, including
  responses without a `Content-Length` header.
- Retry/timeout controls:
  - `SEED_IMAGE_RETRIES` (default `2`)
  - `SEED_IMAGE_TIMEOUT_MS` (default `15000`)
- If a media download/upload fails, seeding continues with graceful fallback (post without that image embed/featured image).

## Idempotency and Reruns

- Default mode is `create-missing`, so reruns skip existing slugs and do not duplicate posts.
- Existing slug matches and unique slug collisions are always skipped; the seed never updates
  or deletes existing posts.

## Summary Output

Studio seed prints:

- `summary created=<n> skipped=<n> failed=<n>`

Expected outcomes:

- First `create-missing` run: mostly `created`.
- Second `create-missing` run: mostly `skipped`, with no duplicate slugs.
- Subsequent runs: existing seeded posts are skipped and never updated.

## Quick Verification

1. Run seed in default mode: `pnpm seed`.
2. Verify the 20 known seed slugs in Payload admin.
3. Open multiple seeded posts and confirm body includes list + quote.
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
