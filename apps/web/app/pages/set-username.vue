<script setup lang="ts">
import UsernameChecker from '~/components/auth/UsernameChecker.vue';

definePageMeta({
  layout: 'auth',
  middleware: 'auth', // Require authentication to access this page
});

useSeoMeta({
  title: 'Choose Your Username',
  description: 'Set your username to complete your profile',
});

const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();
const { updateUsername } = useAuth();

// Get current username from user profile (prepopulated)
const username = ref(authStore.user?.username || '');
const updating = ref(false);

// Watch for user data to populate username if not already set
watch(
  () => authStore.user?.username,
  (newUsername) => {
    if (newUsername) {
      username.value = newUsername;
    }
  },
  { immediate: true }
);

// Ensure user data is loaded
onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchUser();
  }
  // Set username from user data if available
  if (authStore.user?.username && !username.value) {
    username.value = authStore.user.username;
  }
});

// Check if username is valid and available (only needed if different from current)
const isValid = ref(false);
const isAvailable = ref(false);

// Watch username changes to check availability (only if different from current)
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
watch(username, (value) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // If username is the same as current, no need to check
  if (value === authStore.user?.username) {
    isValid.value = true;
    isAvailable.value = true;
    return;
  }

  if (!value || value.length < 3) {
    isValid.value = false;
    isAvailable.value = false;
    return;
  }

  // Debounce the check for new username
  debounceTimer = setTimeout(async () => {
    try {
      const { authClient } = await import('~/lib/auth-client');
      const result = await authClient.isUsernameAvailable({ username: value });

      if (result.error) {
        isValid.value = false;
        isAvailable.value = false;
        return;
      }

      isValid.value = true;
      isAvailable.value = result.data?.available || false;
    } catch {
      isValid.value = false;
      isAvailable.value = false;
    }
  }, 500);
});

async function handleNext() {
  if (!username.value || username.value.trim().length < 3) {
    toast.add({
      title: 'Invalid Username',
      description: 'Username must be at least 3 characters long',
      color: 'error',
    });
    return;
  }

  // If username hasn't changed, just proceed to home
  if (username.value === authStore.user?.username) {
    router.push('/');
    return;
  }

  // Check if username is available
  if (!isAvailable.value || !isValid.value) {
    toast.add({
      title: 'Username Not Available',
      description: 'Please choose a different username',
      color: 'error',
    });
    return;
  }

  updating.value = true;

  try {
    const result = await updateUsername(username.value.trim());

    if (result.success) {
      toast.add({
        title: 'Success',
        description: 'Username updated successfully!',
        color: 'primary',
      });

      // Redirect to home
      router.push('/');
    } else {
      toast.add({
        title: 'Error',
        description: result.error || 'Failed to update username',
        color: 'error',
      });
    }
  } catch (error: unknown) {
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to update username',
      color: 'error',
    });
  } finally {
    updating.value = false;
  }
}

// Check if we can proceed (username is valid and available, or unchanged)
const canProceed = computed(() => {
  if (!username.value || username.value.trim().length < 3) {
    return false;
  }

  // If it's the current username, allow proceeding
  if (username.value === authStore.user?.username) {
    return true;
  }

  // Otherwise, check if it's valid and available
  return isValid.value && isAvailable.value;
});
</script>

<template>
  <div>
    <h2 class="text-center text-3xl font-bold tracking-tight">Choose Your Username</h2>
    <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
      Your username is how others will find you. You can change it later.
    </p>
  </div>

  <UForm class="mt-8 space-y-6" @submit.prevent="handleNext()">
    <div>
      <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Username
      </label>
      <div class="mt-1">
        <UsernameChecker v-model="username" placeholder="Enter your username" />
      </div>
      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Lowercase letters, numbers, and underscores only. 3-30 characters.
      </p>
    </div>

    <div>
      <UButton type="submit" :disabled="!canProceed || updating" block size="lg">
        {{ updating ? 'Updating...' : 'Next' }}
      </UButton>
    </div>
  </UForm>

  <div class="text-center mt-4">
    <UButton variant="ghost" size="sm" :disabled="updating" @click="router.push('/')">
      Skip for now
    </UButton>
  </div>
</template>
