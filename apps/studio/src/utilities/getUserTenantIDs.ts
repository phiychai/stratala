import type { PayloadUser, Tenant } from '@stratala/shared-types'

/**
 * Returns array of all tenant IDs assigned to a user
 *
 * @param user - User object with tenants field
 * @param role - Optional role to filter by
 */
export const getUserTenantIDs = (user: null | PayloadUser, role?: string): Tenant['id'][] => {
  if (!user) {
    return []
  }

  return (
    user?.tenants?.reduce<Tenant['id'][]>((acc, membership) => {
      const { roles } = membership as { roles?: string[] | null }
      if (role && (!Array.isArray(roles) || !roles.includes(role))) {
        return acc
      }

      if (membership.tenant) {
        const { tenant } = membership
        const tenantID = typeof tenant === 'object' ? tenant.id : tenant
        acc.push(tenantID as Tenant['id'])
      }

      return acc
    }, []) || []
  )
}
