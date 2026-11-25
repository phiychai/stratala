/**
 * Admin Health Check Endpoint
 *
 * Checks the health status of all critical services:
 * - Database (PostgreSQL via Adonis backend)
 * - Adonis API Backend
 * - Payload CMS
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
  timestamp: string;
}

export default defineEventHandler(async (): Promise<HealthCheckResult> => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.apiUrl || 'http://localhost:3333';
  const payloadUrl = config.public.payloadUrl || 'http://localhost:3002';

  const results: HealthCheckResult = {
    database: { status: 'unhealthy' },
    adonisApi: { status: 'unhealthy' },
    payloadCms: { status: 'unhealthy' },
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
    const { result, time } = await measureTime(async () => {
      const response = await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(5000) });
      return (await response.json()) as { status?: string; timestamp?: string };
    });

    results.adonisApi =
      result.status === 'ok'
        ? {
            status: 'healthy',
            message: 'Operational',
            responseTime: time,
          }
        : {
            status: 'degraded',
            message: 'API responded but status is not ok',
            responseTime: time,
          };
  } catch (error) {
    results.adonisApi = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }

  // Check Database via Adonis backend (we'll use a simple endpoint that requires DB)
  try {
    const { time } = await measureTime(async () => {
      await fetch(`${apiUrl}/`, { signal: AbortSignal.timeout(5000) });
      return true;
    });

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
    const { time } = await measureTime(async () => {
      await fetch(`${payloadUrl}`, { signal: AbortSignal.timeout(5000) });
      return true;
    });

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

  return results;
});
