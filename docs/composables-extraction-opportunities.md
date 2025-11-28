# Composables Extraction Opportunities

This document identifies patterns in Vue components that could be extracted into reusable composables.

## 1. Auth Pages Pattern (`useAuthRedirect`)

**Files affected:**
- `app/pages/login.vue`
- `app/pages/signup.vue`
- `app/pages/forgot-password.vue`
- `app/pages/reset-password.vue`
- `app/pages/verify-email.vue`

**Pattern:**
```typescript
// Repeated in all auth pages
onMounted(() => {
  if (isAuthenticated.value) {
    router.push('/');
  }
});
```

**Proposed composable:**
```typescript
// composables/useAuthRedirect.ts
export function useAuthRedirect(redirectTo: string = '/') {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  onMounted(() => {
    if (isAuthenticated.value) {
      router.push(redirectTo);
    }
  });
}
```

---

## 2. OTP Verification (`useOtpVerification`)

**Files affected:**
- `app/pages/verify-email.vue`
- `app/pages/reset-password.vue`

**Pattern:**
- OTP input handling
- Resend cooldown timer (60 seconds)
- Verification logic
- Error handling

**Proposed composable:**
```typescript
// composables/useOtpVerification.ts
export function useOtpVerification(options: {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
}) {
  const otp = ref('');
  const verifying = ref(false);
  const resending = ref(false);
  const resendCooldown = ref(0);
  const error = ref('');

  // Cooldown timer logic
  // Verification handler
  // Resend handler

  return {
    otp,
    verifying,
    resending,
    resendCooldown,
    error,
    handleVerify,
    handleResend,
  };
}
```

---

## 3. User Profile (`useUserProfile`)

**Files affected:**
- `app/pages/@[username]/index.vue`

**Pattern:**
- Fetching user profile data
- Computing display name
- Setting SEO meta
- Error handling

**Proposed composable:**
```typescript
// composables/useUserProfile.ts
export function useUserProfile(username: string) {
  const { data, error } = await useFetch(`/api/users/${username}`, {
    key: `user-profile-${username}`,
  });

  const displayName = computed(() => {
    const user = data.value?.user;
    return user?.fullName || user?.username || user?.email?.split('@')[0] || 'User';
  });

  useSeoMeta({
    title: `${displayName.value} - Profile`,
    description: data.value?.user?.bio || `View ${displayName.value}'s spaces and articles`,
  });

  return {
    data,
    error,
    displayName,
    user: computed(() => data.value?.user),
    spaces: computed(() => data.value?.spaces || []),
    recentPosts: computed(() => data.value?.recentPosts || []),
  };
}
```

---

## 4. Table Pagination (`useTablePagination`)

**Files affected:**
- `app/pages/admin/customers.vue`

**Pattern:**
- Pagination state management
- Complex pagination computed values
- Data transformation

**Proposed composable:**
```typescript
// composables/useTablePagination.ts
export function useTablePagination<T>(data: Ref<any>) {
  const pagination = ref({
    pageIndex: 0,
    pageSize: 25,
  });

  const total = computed(() => {
    // Extract total from various response structures
  });

  const page = computed(() => {
    // Extract current page
  });

  const perPage = computed(() => {
    // Extract per page
  });

  return {
    pagination,
    total,
    page,
    perPage,
  };
}
```

---

## 5. Form Submission (`useFormSubmission`)

**Files affected:**
- `app/components/customers/AddModal.vue`
- `app/components/customers/EditModal.vue`
- `app/pages/login.vue`
- `app/pages/signup.vue`
- `app/pages/forgot-password.vue`
- `app/pages/reset-password.vue`

**Pattern:**
- Loading state
- Error handling
- Toast notifications
- Success callbacks

**Proposed composable:**
```typescript
// composables/useFormSubmission.ts
export function useFormSubmission<T>(options: {
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  successMessage?: string;
}) {
  const submitting = ref(false);
  const error = ref('');
  const toast = useToast();

  async function submit(data: T) {
    submitting.value = true;
    error.value = '';

    try {
      const result = await options.onSubmit(data);

      if (!result.success) {
        error.value = result.error || 'Submission failed';
        toast.add({
          title: 'Error',
          description: result.error || 'Submission failed',
          color: 'error',
        });
        options.onError?.(result.error || 'Submission failed');
        return;
      }

      toast.add({
        title: 'Success',
        description: options.successMessage || 'Operation completed successfully',
        color: 'success',
      });

      options.onSuccess?.(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Submission failed';
      error.value = errorMessage;
      toast.add({
        title: 'Error',
        description: errorMessage,
        color: 'error',
      });
      options.onError?.(errorMessage);
    } finally {
      submitting.value = false;
    }
  }

  return {
    submitting,
    error,
    submit,
  };
}
```

---

## 6. OAuth Providers (`useOAuthProviders`)

**Files affected:**
- `app/pages/login.vue`
- `app/pages/signup.vue`

**Pattern:**
- OAuth provider configuration
- Provider click handlers

**Proposed composable:**
```typescript
// composables/useOAuthProviders.ts
export function useOAuthProviders() {
  const toast = useToast();

  const providers = [
    {
      label: 'Google',
      icon: 'i-simple-icons-google',
      onClick: () => {
        toast.add({ title: 'Google', description: 'Login with Google - Coming soon' });
      },
    },
    {
      label: 'GitHub',
      icon: 'i-simple-icons-github',
      onClick: () => {
        toast.add({ title: 'GitHub', description: 'Login with GitHub - Coming soon' });
      },
    },
  ];

  return { providers };
}
```

---

## 7. User Display Name (`useUserDisplayName`)

**Files affected:**
- `app/pages/@[username]/index.vue`
- `app/pages/admin/customers.vue` (similar pattern)

**Pattern:**
- Computing display name from firstName, lastName, username, email

**Proposed composable:**
```typescript
// composables/useUserDisplayName.ts
export function useUserDisplayName(user: Ref<{
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  email?: string | null;
  fullName?: string | null;
}>) {
  const displayName = computed(() => {
    const u = user.value;
    if (u?.fullName) return u.fullName;
    if (u?.firstName && u?.lastName) return `${u.firstName} ${u.lastName}`;
    if (u?.firstName) return u.firstName;
    if (u?.lastName) return u.lastName;
    if (u?.username) return u.username;
    if (u?.email) return u.email.split('@')[0];
    return 'User';
  });

  return { displayName };
}
```

---

## 8. Password Confirmation (`usePasswordConfirmation`)

**Files affected:**
- `app/pages/reset-password.vue`
- `app/pages/settings/security.vue`

**Pattern:**
- Password confirmation validation
- Password match checking

**Proposed composable:**
```typescript
// composables/usePasswordConfirmation.ts
export function usePasswordConfirmation() {
  const password = ref('');
  const confirmPassword = ref('');

  const passwordsMatch = computed(() => {
    if (!password.value || !confirmPassword.value) return true;
    return password.value === confirmPassword.value;
  });

  const passwordError = computed(() => {
    if (!confirmPassword.value) return '';
    if (!passwordsMatch.value) return "Passwords don't match";
    return '';
  });

  return {
    password,
    confirmPassword,
    passwordsMatch,
    passwordError,
  };
}
```

---

## Priority Order

1. **High Priority:**
   - `useAuthRedirect` - Used in 5 files
   - `useFormSubmission` - Used in 6+ files
   - `useOtpVerification` - Complex logic, used in 2 files

2. **Medium Priority:**
   - `useUserProfile` - Specific but reusable
   - `useUserDisplayName` - Simple but repeated
   - `useOAuthProviders` - Simple but repeated

3. **Low Priority:**
   - `useTablePagination` - Complex but specific to admin tables
   - `usePasswordConfirmation` - Simple, only 2 files

---

## Benefits

- **Reduced code duplication** - Common patterns extracted
- **Easier maintenance** - Update logic in one place
- **Better testing** - Composables can be unit tested
- **Consistency** - Same behavior across components
- **Type safety** - Shared types and interfaces

