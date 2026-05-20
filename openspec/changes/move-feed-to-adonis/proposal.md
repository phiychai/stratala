# Change: Move Feed API to AdonisJS Backend

## Why
The personalized feed logic is currently duplicated between the Nuxt server API (`apps/web/server/api/feed.get.ts`) and AdonisJS (`FeedService`). The Nuxt API acts as a proxy that authenticates with the backend, fetches followed spaces, then queries Payload directly. This creates unnecessary complexity, duplication, and an extra network hop. Moving the feed endpoint to AdonisJS consolidates all feed logic in one place and simplifies the architecture.

## What Changes
- Add `GET /api/feed` endpoint to AdonisJS that returns personalized content
- Update `FeedController` to expose the personalized feed endpoint
- Modify `FeedService.getPersonalizedFeed()` to return the unified content format
- Update Nuxt frontend to call AdonisJS `/api/feed` directly (or via a thin proxy)
- Remove or simplify `apps/web/server/api/feed.get.ts`

## Impact
- Affected specs: `feed` (new capability spec)
- Affected code:
  - `apps/backend/app/controllers/feed_controller.ts`
  - `apps/backend/app/services/feed_service.ts`
  - `apps/backend/start/routes.ts`
  - `apps/web/server/api/feed.get.ts` (remove or simplify)
  - `apps/web/app/composables/useFeed.ts` (if exists, update API URL)
