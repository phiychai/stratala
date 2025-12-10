import type { H3Event } from 'h3';
import { resolveUsernameToPayloadUserId } from './resolve-username';

export interface TenantContext {
  username: string | null;
  hostname: string;
  isSubdomain: boolean;
  isAdminSubdomain?: boolean;
  payloadUserId?: string | null;
}

/**
 * Get tenant context from event
 */
export function getTenantContext(event: H3Event): TenantContext {
  return (
    (event.context.tenant as TenantContext) || {
      username: null,
      hostname: getHeader(event, 'host') || '',
      isSubdomain: false,
    }
  );
}

/**
 * Get tenant username from event
 */
export function getTenantUsername(event: H3Event): string | null {
  const tenant = getTenantContext(event);
  return tenant.username;
}

/**
 * Resolve tenant to Payload user ID
 * Caches the result in event context to avoid multiple lookups
 */
export async function resolveTenantToPayloadUserId(event: H3Event): Promise<string | null> {
  const tenant = getTenantContext(event);

  // If already resolved, return cached value
  if (tenant.payloadUserId !== undefined) {
    return tenant.payloadUserId;
  }

  // If no username, no tenant
  if (!tenant.username) {
    tenant.payloadUserId = null;
    return null;
  }

  // Resolve username to Payload user ID
  const payloadUserId = await resolveUsernameToPayloadUserId(tenant.username);
  tenant.payloadUserId = payloadUserId;

  return payloadUserId;
}

/**
 * Check if request is from a tenant subdomain
 */
export function isTenantRequest(event: H3Event): boolean {
  const tenant = getTenantContext(event);
  return tenant.isSubdomain && tenant.username !== null;
}

/**
 * Check if request is from admin subdomain
 */
export function isAdminSubdomainRequest(event: H3Event): boolean {
  const tenant = getTenantContext(event);
  return tenant.isAdminSubdomain === true;
}
