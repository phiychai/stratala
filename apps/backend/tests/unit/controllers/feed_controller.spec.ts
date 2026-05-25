import { test } from '@japa/runner';

import { createMockContext } from '../helpers/mock_context.js';

import FeedController from '#controllers/feed_controller';

test.group('FeedController.getPersonalizedFeed', (group) => {
  group.each.setup(async () => {
    // Reset mocks before each test
  });

  test('should return unauthorized when user is not authenticated', async ({ assert }) => {
    const controller = new FeedController();
    const ctx = createMockContext({
      auth: { user: null },
      request: { qs: () => ({}) },
    });

    await controller.getPersonalizedFeed(ctx);

    assert.equal(ctx.response.statusCode, 401);
    assert.deepEqual(ctx.response.responseBody, { message: 'Authentication required' });
  });

  test('should return personalized feed with valid user and default parameters', async ({
    assert,
  }) => {
    const controller = new FeedController();
    const mockUser = { id: 'user-123' };
    const mockFeed = {
      content: [{ id: 'post-1', title: 'Test Post' }],
      count: 1,
      totalDocs: 10,
    };

    // Mock the dependencies
    const ctx = createMockContext({
      auth: { user: mockUser },
      request: { qs: () => ({}) },
      response: {
        ok: (data: any) => {
          ctx.response.responseBody = data;
          ctx.response.statusCode = 200;
          return ctx.response;
        },
      },
    });

    // Mock FeedService.getPersonalizedFeed
    const FeedService = await import('#services/feed_service');
    FeedService.default.getPersonalizedFeed = async () => mockFeed;

    await controller.getPersonalizedFeed(ctx);

    assert.equal(ctx.response.statusCode, 200);
    assert.deepEqual(ctx.response.responseBody, mockFeed);
  });

  test('should handle query parameters correctly', async ({ assert }) => {
    const controller = new FeedController();
    const mockUser = { id: 'user-123' };
    const mockFeed = {
      content: [{ id: 'post-1', title: 'Test Post' }],
      count: 1,
      totalDocs: 10,
    };

    const ctx = createMockContext({
      auth: { user: mockUser },
      request: {
        qs: () => ({ limit: '10', page: '2', sortBy: 'popularity' }),
      },
      response: {
        ok: (data: any) => {
          ctx.response.responseBody = data;
          ctx.response.statusCode = 200;
          return ctx.response;
        },
      },
    });

    // Mock FeedService.getPersonalizedFeed
    const FeedService = await import('#services/feed_service');
    FeedService.default.getPersonalizedFeed = async (userId: string, options: any) => {
      assert.equal(userId, 'user-123');
      assert.deepEqual(options, {
        limit: 10,
        page: 2,
        sortBy: 'popularity',
      });
      return mockFeed;
    };

    await controller.getPersonalizedFeed(ctx);

    assert.equal(ctx.response.statusCode, 200);
    assert.deepEqual(ctx.response.responseBody, mockFeed);
  });

  test('should return bad request for invalid query parameters', async ({ assert }) => {
    const controller = new FeedController();
    const mockUser = { id: 'user-123' };

    const ctx = createMockContext({
      auth: { user: mockUser },
      request: {
        qs: () => ({ limit: 'invalid', page: '-1' }),
      },
      response: {
        badRequest: (data: any) => {
          ctx.response.responseBody = data;
          ctx.response.statusCode = 400;
          return ctx.response;
        },
      },
    });

    // Mock validator to throw error
    const validator = await import('#validators/feed_validator');
    validator.feedQueryValidator.validate = async () => {
      throw { messages: ['Invalid limit', 'Invalid page'] };
    };

    await controller.getPersonalizedFeed(ctx);

    assert.equal(ctx.response.statusCode, 400);
    assert.deepEqual(ctx.response.responseBody, {
      message: 'Invalid query parameters',
      errors: ['Invalid limit', 'Invalid page'],
    });
  });

  test('should handle FeedService errors gracefully', async ({ assert }) => {
    const controller = new FeedController();
    const mockUser = { id: 'user-123' };

    const ctx = createMockContext({
      auth: { user: mockUser },
      request: { qs: () => ({}) },
      response: {
        internalServerError: (data: any) => {
          ctx.response.responseBody = data;
          ctx.response.statusCode = 500;
          return ctx.response;
        },
      },
    });

    // Mock FeedService.getPersonalizedFeed to throw error
    const FeedService = await import('#services/feed_service');
    FeedService.default.getPersonalizedFeed = async () => {
      throw new Error('Database connection failed');
    };

    await controller.getPersonalizedFeed(ctx);

    assert.equal(ctx.response.statusCode, 500);
    assert.deepEqual(ctx.response.responseBody, {
      message: 'Failed to fetch personalized feed',
      error: 'Database connection failed',
    });
  });
});
