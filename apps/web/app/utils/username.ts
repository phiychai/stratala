import type { DirectusUser } from '@turborepo-saas-starter/shared-types';

interface UserNameOptions {
  abbrev?: boolean;
}

export function userName(
  user: Partial<DirectusUser>,
  { abbrev = false }: UserNameOptions = {}
): string {
  if (!user) {
    return 'Unknown User' as string;
  }

  if (user.firstName && user.lastName) {
    return `${user.firstName} ${abbrev ? `${user.lastName[0]}.` : user.lastName}`;
  }

  if (user.firstName) {
    return user.firstName;
  }

  if (user.email) {
    return user.email;
  }

  return 'Unknown User' as string;
}

export function userInitials(user: Partial<DirectusUser>): string {
  if (!user) {
    return 'NA' as string;
  }

  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`;
  }

  if (user.firstName) {
    return user.firstName[0] || 'NA';
  }

  if (user.email) {
    return user.email[0] || 'NA';
  }

  return 'NA' as string;
}
