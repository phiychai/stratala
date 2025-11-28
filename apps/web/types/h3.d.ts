import type { TenantContext } from '~/server/utils/tenant-context';

declare module 'h3' {
  interface H3EventContext {
    tenant?: TenantContext;
  }
}

