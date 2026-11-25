import { computed } from 'vue';
import type { Ref } from 'vue';
import type { UserProfile } from '@stratala/shared-types';

const FALLBACK_DISPLAY_NAME = 'User';

type UserDisplayNameFields = Pick<
  UserProfile,
  'firstName' | 'lastName' | 'username' | 'email' | 'fullName'
>;

type UserDisplayNameInput = UserDisplayNameFields | null | undefined;

function normalizeDisplayPart(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function getEmailLocalPart(email: string | null | undefined): string | undefined {
  const normalizedEmail = normalizeDisplayPart(email);
  if (!normalizedEmail) return undefined;

  const atIndex = normalizedEmail.indexOf('@');
  const localPart = atIndex === -1 ? normalizedEmail : normalizedEmail.slice(0, atIndex);

  return normalizeDisplayPart(localPart);
}

export function getUserDisplayName(user: UserDisplayNameInput): string {
  if (!user) return FALLBACK_DISPLAY_NAME;

  const fullName = normalizeDisplayPart(user.fullName);
  if (fullName) return fullName;

  const firstName = normalizeDisplayPart(user.firstName);
  const lastName = normalizeDisplayPart(user.lastName);

  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (lastName) return lastName;

  return (
    normalizeDisplayPart(user.username) ?? getEmailLocalPart(user.email) ?? FALLBACK_DISPLAY_NAME
  );
}

export function useUserDisplayName(user: Readonly<Ref<UserDisplayNameInput>>) {
  const displayName = computed(() => getUserDisplayName(user.value));

  return { displayName };
}
