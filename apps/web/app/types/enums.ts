/**
 * Enums and Constants
 *
 * Centralized definitions of enums and constants used throughout the application.
 * This prevents magic strings and ensures type safety.
 */

import { UserRole, type UserRoleType, ROLE_LABELS } from '@stratala/shared-types';

/**
 * User Status Enum
 * Represents the subscription/account status of a user
 */
export const UserStatus = {
  SUBSCRIBED: 'subscribed',
  UNSUBSCRIBED: 'unsubscribed',
  BOUNCED: 'bounced',
} as const;

export type UserStatusType = (typeof UserStatus)[keyof typeof UserStatus];

/**
 * User Status Labels (for UI display)
 */
export const USER_STATUS_LABELS: Record<UserStatusType, string> = {
  [UserStatus.SUBSCRIBED]: 'Active',
  [UserStatus.UNSUBSCRIBED]: 'Inactive',
  [UserStatus.BOUNCED]: 'Bounced',
} as const;

/**
 * User Status Colors (for UI badges)
 */
export const USER_STATUS_COLORS: Record<UserStatusType, 'success' | 'error' | 'warning'> = {
  [UserStatus.SUBSCRIBED]: 'success',
  [UserStatus.UNSUBSCRIBED]: 'error',
  [UserStatus.BOUNCED]: 'warning',
} as const;

/**
 * Toast Color Enum
 * Colors used for toast notifications
 */
export const ToastColor = {
  PRIMARY: 'primary',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export type ToastColorType = (typeof ToastColor)[keyof typeof ToastColor];

/**
 * Form Field Type Enum
 * Types of form fields supported
 */
export const FormFieldType = {
  TEXT: 'text',
  PASSWORD: 'password',
  EMAIL: 'email',
  TEXTAREA: 'textarea',
  CHECKBOX: 'checkbox',
  CHECKBOX_GROUP: 'checkbox_group',
  RADIO: 'radio',
  SELECT: 'select',
  FILE: 'file',
} as const;

export type FormFieldTypeType = (typeof FormFieldType)[keyof typeof FormFieldType];

/**
 * Request Status Enum
 * Status values for async operations
 */
export const RequestStatus = {
  IDLE: 'idle',
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export type RequestStatusType = (typeof RequestStatus)[keyof typeof RequestStatus];

/**
 * Role Options for Forms
 * Helper to generate role options for select dropdowns
 */
export function getRoleOptions(includeAllRoles = false) {
  const allRoles: UserRoleType[] = [
    UserRole.USER,
    UserRole.ADMIN,
    UserRole.CONTENT_ADMIN,
    UserRole.EDITOR,
    UserRole.PUBLISHER,
  ];

  const roles = includeAllRoles ? allRoles : [UserRole.USER, UserRole.ADMIN];

  return roles.map((role) => ({
    label: ROLE_LABELS[role],
    value: role,
  }));
}

/**
 * User Status Options for Forms
 * Helper to generate status options for select dropdowns
 */
export function getUserStatusOptions() {
  return [
    { label: 'All', value: 'all' },
    { label: USER_STATUS_LABELS[UserStatus.SUBSCRIBED], value: UserStatus.SUBSCRIBED },
    { label: USER_STATUS_LABELS[UserStatus.UNSUBSCRIBED], value: UserStatus.UNSUBSCRIBED },
  ];
}

/**
 * Re-export UserRole and related types from shared-types for convenience
 */
export { UserRole, type UserRoleType, ROLE_LABELS, USER_ROLES } from '@stratala/shared-types';
