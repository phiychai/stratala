/**
 * User Roles
 *
 * Centralized definition of all user roles in the system.
 * This is the single source of truth for role values.
 *
 * Roles are used across:
 * - AdonisJS backend (canonical source)
 * - Payload CMS (content management)
 * - Payload CMS (content management)
 * - Better Auth (simplified to admin/user)
 */

/**
 * All available user roles
 */
export const UserRole = {
  /** General user - default role for frontend registrations */
  USER: 'user',
  /** Administrator - full system access */
  ADMIN: 'admin',
  /** Content Admin - full content management rights */
  CONTENT_ADMIN: 'content_admin',
  /** Editor - can edit and publish all content */
  EDITOR: 'editor',
  /** Publisher - can create and publish mixed content (posts, pages, etc.) */
  PUBLISHER: 'publisher',
} as const;

/**
 * Type for user role values
 */
export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

/**
 * Array of all role values (useful for validation, dropdowns, etc.)
 */
export const USER_ROLES = Object.values(UserRole) as readonly UserRoleType[];

/**
 * Array of content roles (roles that require Payload user)
 * These roles have access to content management systems
 */
export const CONTENT_ROLES: readonly UserRoleType[] = [
  UserRole.ADMIN,
  UserRole.CONTENT_ADMIN,
  UserRole.EDITOR,
  UserRole.PUBLISHER,
] as const;

/**
 * Check if a role is a content role (requires Payload user)
 */
export function isContentRole(role: string): role is UserRoleType {
  return CONTENT_ROLES.includes(role as UserRoleType);
}

/**
 * Role display labels (for UI)
 */
export const ROLE_LABELS: Record<UserRoleType, string> = {
  [UserRole.USER]: 'User',
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.CONTENT_ADMIN]: 'Content Admin',
  [UserRole.EDITOR]: 'Editor',
  [UserRole.PUBLISHER]: 'Publisher',
} as const;

/**
 * Role descriptions (for documentation/UI)
 */
export const ROLE_DESCRIPTIONS: Record<UserRoleType, string> = {
  [UserRole.USER]: 'General user with basic application access',
  [UserRole.ADMIN]: 'Full system access, can manage all users',
  [UserRole.CONTENT_ADMIN]: 'Full content management rights',
  [UserRole.EDITOR]: 'Can edit and publish all content',
  [UserRole.PUBLISHER]: 'Can create and publish mixed content (posts, pages, etc.)',
} as const;
