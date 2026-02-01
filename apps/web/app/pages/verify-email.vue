<script setup lang="ts">
import { authClient } from '~/lib/auth-client';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: 'auth',
});

useSeoMeta({
  title: 'Verify Email',
  description: 'Verify your email address to complete registration',
});

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

// Get email from query or allow user to enter it
const emailFromQuery = (route.query.email as string) || '';
const emailInput = ref(emailFromQuery);
const showEmailInput = !emailFromQuery;
const currentEmail = computed(() => emailFromQuery || emailInput.value);

// Helper to get current email for API calls
const getEmail = () => {
  const email = currentEmail.value;
  if (!email) {
    throw new Error('Email address is required');
  }
  return email;
};

// Create composable for OTP verification
const { otp, verifying, resending, resendCooldown, error, handleVerify } = useOtpVerification({
  email: currentEmail.value || '', // Will be updated when user enters email
  onVerify: async (otpValue) => {
    const emailToUse = getEmail();

    // Use verifyEmail method for email verification with OTP
    // According to Better Auth docs: /email-otp/verify-email endpoint
    const result = await authClient.emailOtp.verifyEmail({
      email: emailToUse,
      otp: otpValue,
    });

    if (result.error) {
      return { success: false, error: result.error.message || 'Verification failed' };
    }

    toast.add({
      title: 'Success',
      description: 'Email verified successfully!',
      color: 'primary',
    });

    // Better Auth may auto-sign in after verification (if autoSignInAfterVerification is enabled)
    // Check if user is now logged in by fetching session
    try {
      // Wait a moment for session cookie to be set
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Fetch user data to check if session exists
      const fetchResult = await authStore.fetchUser();

      // If user is authenticated, redirect to username setup page
      if (fetchResult.success && authStore.isAuthenticated) {
        router.push('/set-username');
        return { success: true };
      }
    } catch {
      // If fetch fails, continue to login redirect
      // Session check failed - user will be redirected to login
    }

    // If not auto-signed in, redirect to login with success message
    // This shouldn't happen if autoSignInAfterVerification is enabled
    router.push({
      path: '/login',
      query: { verified: 'true' },
    });

    return { success: true };
  },
  onResend: async () => {
    // This won't be called directly - we use custom handleResend instead
    // But keeping it for composable compatibility
    const emailToUse = getEmail();
    const result = await authClient.emailOtp.sendVerificationOtp({
      email: emailToUse,
      type: 'email-verification',
    });
    if (result.error) {
      return { success: false, error: result.error.message || 'Failed to send code' };
    }
    return { success: true };
  },
});

// Wrapper for handleResend that uses current email
// This bypasses the composable's email check and uses the current email value
const handleResend = async () => {
  if (!currentEmail.value) {
    error.value = 'Please enter your email address first';
    toast.add({
      title: 'Email Required',
      description: 'Please enter your email address to receive a verification code',
      color: 'warning',
    });
    return;
  }

  // Call the onResend callback directly to bypass composable's email check
  if (resendCooldown.value > 0) return;

  resending.value = true;
  error.value = '';

  try {
    const emailToUse = getEmail();

    const result = await authClient.emailOtp.sendVerificationOtp({
      email: emailToUse,
      type: 'email-verification',
    });

    if (result.error) {
      error.value = result.error.message || 'Failed to send code';
      toast.add({
        title: 'Error',
        description: result.error.message || 'Failed to send code',
        color: 'error',
      });
      return;
    }

    // Set cooldown
    resendCooldown.value = 60;

    // Update URL with email for bookmarking/sharing
    if (showEmailInput && emailInput.value) {
      router.replace({ query: { ...route.query, email: emailInput.value } });
    }

    toast.add({
      title: 'Code Sent',
      description: 'A new code has been sent to your email',
      color: 'primary',
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to send code';
    error.value = errorMessage;
    toast.add({
      title: 'Error',
      description: errorMessage,
      color: 'error',
    });
  } finally {
    resending.value = false;
  }
};

// Watch email input changes to update URL
watch(emailInput, (newEmail) => {
  if (newEmail && showEmailInput) {
    // Update URL with email for bookmarking/sharing
    router.replace({ query: { ...route.query, email: newEmail } });
  }
});

// Auto-focus OTP input (using autofocus attribute on UInput)
</script>

<template>
  <div>
    <h2 class="text-center text-3xl font-bold tracking-tight">Verify Your Email</h2>
    <p v-if="currentEmail" class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
      We've sent a verification code to
      <span class="font-medium">{{ currentEmail }}</span>
    </p>
    <p v-else class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
      Enter your email address to receive a verification code
    </p>
  </div>

  <UForm class="mt-8 space-y-6" @submit.prevent="handleVerify()">
    <div v-if="showEmailInput">
      <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Email Address
      </label>
      <div class="mt-1">
        <UInput
          id="email"
          v-model="emailInput"
          type="email"
          placeholder="you@example.com"
          :disabled="verifying || resending"
          required
          autofocus
          @keyup.enter="handleResend()"
        />
      </div>
      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Enter the email address you used to register
      </p>
      <div class="mt-3">
        <UButton
          type="button"
          :disabled="!emailInput || resending || resendCooldown > 0"
          block
          @click="handleResend()"
        >
          {{
            resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : resending
                ? 'Sending...'
                : 'Send Verification Code'
          }}
        </UButton>
      </div>
    </div>
    <div>
      <label for="otp" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Enter verification code
      </label>
      <div class="mt-1">
        <UInput
          id="otp"
          v-model="otp"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="6"
          placeholder="000000"
          class="text-center text-2xl font-mono tracking-widest"
          :disabled="verifying"
          autofocus
          required
        />
      </div>
      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Enter the 6-digit code sent to your email
      </p>
    </div>

    <div v-if="error" class="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
      <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
    </div>

    <div>
      <UButton
        type="submit"
        :disabled="verifying || !otp || otp.length !== 6 || !currentEmail"
        block
      >
        {{ verifying ? 'Verifying...' : 'Verify Email' }}
      </UButton>
    </div>
  </UForm>

  <div class="text-center">
    <p class="text-sm text-gray-600 dark:text-gray-400">Didn't receive the code?</p>
    <UButton
      variant="ghost"
      size="sm"
      :disabled="resending || resendCooldown > 0"
      class="mt-2"
      @click="handleResend()"
    >
      {{
        resendCooldown > 0
          ? `Resend in ${resendCooldown}s`
          : resending
            ? 'Sending...'
            : 'Resend Code'
      }}
    </UButton>
  </div>

  <div class="text-center">
    <ULink to="/login" class="text-sm text-primary hover:underline"> Back to login </ULink>
  </div>
</template>
