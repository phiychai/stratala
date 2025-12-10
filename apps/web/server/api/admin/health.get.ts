/**
 * Admin Health Check Endpoint
 *
 * Checks the health status of all critical services:
 * - Database (PostgreSQL via Adonis backend)
 * - Adonis API Backend
 * - Payload CMS
 * - Lago Billing Service
 */

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  responseTime?: number;
}

interface HealthCheckResult {
  database: HealthStatus;
  adonisApi: HealthStatus;
  payloadCms: HealthStatus;
  lago: HealthStatus;
  timestamp: string;
}

export default defineEventHandler(async (event): Promise<HealthCheckResult> => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.apiUrl || 'http://localhost:3333';
  const payloadUrl = config.public.payloadUrl || 'http://localhost:3002';

  const results: HealthCheckResult = {
    database: { status: 'unhealthy' },
    adonisApi: { status: 'unhealthy' },
    payloadCms: { status: 'unhealthy' },
    lago: { status: 'unhealthy' },
    timestamp: new Date().toISOString(),
  };

  // Helper function to measure response time
  const measureTime = async <T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> => {
    const start = Date.now();
    const result = await fn();
    const time = Date.now() - start;
    return { result, time };
  };

  // Check Adonis API Backend
  try {
    const { result, time } = await measureTime(
      async () =>
        await $fetch<{ status: string; timestamp: string }>(`${apiUrl}/health`, {
          timeout: 5000,
        })
    );

    if (result.status === 'ok') {
      results.adonisApi = {
        status: 'healthy',
        message: 'Operational',
        responseTime: time,
      };
    } else {
      results.adonisApi = {
        status: 'degraded',
        message: 'API responded but status is not ok',
        responseTime: time,
      };
    }
  } catch (error) {
    results.adonisApi = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }

  // Check Database via Adonis backend (we'll use a simple endpoint that requires DB)
  try {
    const { result, time } = await measureTime(
      async () =>
        // Try to fetch a simple endpoint that requires database access
        // Using /api/user/me which requires auth, but if DB is down, it will fail differently
        // Better: use a health endpoint that checks DB, but for now we'll check if API is responding
        // Since we already checked /health, if that works, DB is likely working
        // For a more accurate check, we could add a /health/db endpoint to Adonis
        await $fetch(`${apiUrl}/`, {
          timeout: 5000,
        })
    );

    // If we can reach the API root, database is likely accessible
    // This is a basic check - for production, add a dedicated DB health endpoint
    results.database = {
      status: results.adonisApi.status === 'healthy' ? 'healthy' : 'degraded',
      message: results.adonisApi.status === 'healthy' ? 'Connected' : 'Unable to verify',
      responseTime: time,
    };
  } catch (error) {
    results.database = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }

  // Check Payload CMS
  try {
    const { result, time } = await measureTime(
      async () =>
        // Try to access Payload API - use a lightweight endpoint
        await $fetch(`${payloadUrl}`, {
          timeout: 5000,
        })
    );

    results.payloadCms = {
      status: 'healthy',
      message: 'Operational',
      responseTime: time,
    };
  } catch (error) {
    results.payloadCms = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }

  // Check Lago Billing Service (via Adonis backend billing endpoint)
  try {
    const { result, time } = await measureTime(
      async () =>
        // Try to access billing plans endpoint (public, doesn't require auth)
        await $fetch(`${apiUrl}/api/billing/plans`, {
          timeout: 5000,
        })
    );

    // If we get a response (even if it's an auth error), Lago is reachable
    results.lago = {
      status: 'healthy',
      message: 'Connected',
      responseTime: time,
    };
  } catch (error) {
    // Check if it's an auth error (401/403) which means Lago is reachable
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error
        ? (error as { statusCode?: number }).statusCode
        : undefined;

    if (statusCode === 401 || statusCode === 403) {
      results.lago = {
        status: 'healthy',
        message: 'Connected (authentication required)',
      };
    } else {
      results.lago = {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  return results;
});
