import type { UserProfile } from '@stratala/shared-types';

type UserDisplayNameInput =
  | Pick<UserProfile, 'firstName' | 'lastName' | 'username' | 'email' | 'fullName'>
  | null
  | undefined;

/**
 * useUserDisplayName Composable
 *
 * Computes a user's display name from various fields.
 * Priority order:
 * 1. fullName (if provided)
 * 2. firstName + lastName
 * 3. firstName only
 * 4. lastName only
 * 5. username
 * 6. email (username part before @)
 * 7. 'User' (fallback)
 *
 * @param user - User object with name fields
 * @returns Computed display name
 */
export function useUserDisplayName(user: Ref<UserDisplayNameInput>) {
  const displayName = computed(() => {
    const u = user.value;
    if (!u) return 'User';

    // Priority 1: fullName
    if (u.fullName?.trim()) return u.fullName.trim();

    // Priority 2: firstName + lastName
    const firstName = u.firstName?.trim();
    const lastName = u.lastName?.trim();
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }

    // Priority 3: firstName only
    if (firstName) return firstName;

    // Priority 4: lastName only
    if (lastName) return lastName;

    // Priority 5: username
    if (u.username?.trim()) return u.username.trim();

    // Priority 6: email (username part) - safer parsing
    if (u.email?.trim()) {
      const emailPart = u.email.split('@')[0]?.trim();
      if (emailPart) return emailPart;
    }

    // Fallback
    return 'User';
  });

  return { displayName };
}
