## 1. Backend Implementation

- [x] 1.1 Add `getPersonalizedFeed` action to `FeedController`
- [x] 1.2 Add `GET /api/feed` route in `routes.ts` with auth middleware
- [x] 1.3 Update `FeedService.getPersonalizedFeed()` to return unified
      `{ content, count, totalDocs }` format
- [x] 1.4 Add request validation for query params (limit, page, sortBy) using
      VineJS

## 2. Frontend Migration

- [x] 2.1 Update Nuxt feed composable/page to call `/api/feed` on backend
      directly
- [x] 2.2 Remove or convert `apps/web/server/api/feed.get.ts` to a thin proxy
      (if CORS requires)
- [x] 2.3 Test authenticated feed requests work correctly

## 3. Cleanup & Testing

- [x] 3.1 Remove duplicate Payload fetch logic from Nuxt
- [x] 3.2 Add unit tests for `FeedController.getPersonalizedFeed`
- [x] 3.3 Verify feed works in development and production environments
