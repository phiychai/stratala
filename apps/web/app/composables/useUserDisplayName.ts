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
export function useUserDisplayName(user: Ref<{
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  email?: string | null;
  fullName?: string | null;
}>) {
  const displayName = computed(() => {
    const u = user.value;
    if (!u) return 'User';

    // Priority 1: fullName
    if (u.fullName) return u.fullName;

    // Priority 2: firstName + lastName
    if (u.firstName && u.lastName) {
      return `${u.firstName} ${u.lastName}`;
    }

    // Priority 3: firstName only
    if (u.firstName) return u.firstName;

    // Priority 4: lastName only
    if (u.lastName) return u.lastName;

    // Priority 5: username
    if (u.username) return u.username;

    // Priority 6: email (username part)
    if (u.email) return u.email.split('@')[0];

    // Fallback
    return 'User';
  });

  return { displayName };
}

