/**
 * useOtpVerification Composable
 *
 * Handles OTP (One-Time Password) verification logic including:
 * - OTP input state
 * - Resend cooldown timer
 * - Verification and resend handlers
 * - Error handling
 *
 * @param options - Configuration options
 * @returns OTP verification utilities
 */
export function useOtpVerification(options: {
  email: string;
  onVerify: (otp: string) => Promise<{ success: boolean; error?: string } | void>;
  onResend: () => Promise<{ success: boolean; error?: string } | void>;
  cooldownSeconds?: number;
}) {
  const otp = ref('');
  const verifying = ref(false);
  const resending = ref(false);
  const resendCooldown = ref(0);
  const error = ref('');
  const toast = useToast();

  const cooldownSeconds = options.cooldownSeconds || 60;
  let cooldownInterval: ReturnType<typeof setInterval> | null = null;

  // Watch cooldown and start timer
  watch(resendCooldown, (value) => {
    if (value > 0 && !cooldownInterval) {
      cooldownInterval = setInterval(() => {
        resendCooldown.value--;
        if (resendCooldown.value <= 0) {
          if (cooldownInterval) {
            clearInterval(cooldownInterval);
            cooldownInterval = null;
          }
        }
      }, 1000);
    }
  });

  // Cleanup on unmount
  onUnmounted(() => {
    if (cooldownInterval) {
      clearInterval(cooldownInterval);
    }
  });

  async function handleVerify() {
    if (!otp.value || otp.value.length !== 6) {
      error.value = 'Please enter a valid 6-digit code';
      return;
    }

    if (!options.email) {
      error.value = 'Email address is required';
      return;
    }

    verifying.value = true;
    error.value = '';

    try {
      const result = await options.onVerify(otp.value);

      if (result === undefined) {
        // Assume success if no result returned
        return;
      }

      if (!result.success) {
        error.value = result.error || 'Verification failed';
        toast.add({
          title: 'Error',
          description: result.error || 'Verification failed',
          color: 'error',
        });
        return;
      }

      toast.add({
        title: 'Success',
        description: 'Verification successful',
        color: 'success',
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      error.value = errorMessage;
      toast.add({
        title: 'Error',
        description: errorMessage,
        color: 'error',
      });
    } finally {
      verifying.value = false;
    }
  }

  async function handleResend() {
    if (resendCooldown.value > 0) return;

    if (!options.email) {
      error.value = 'Email address is required';
      return;
    }

    resending.value = true;
    error.value = '';

    try {
      const result = await options.onResend();

      if (result === undefined) {
        // Assume success if no result returned
        resendCooldown.value = cooldownSeconds;
        toast.add({
          title: 'Code Sent',
          description: 'A new code has been sent to your email',
          color: 'primary',
        });
        return;
      }

      if (!result.success) {
        error.value = result.error || 'Failed to resend code';
        toast.add({
          title: 'Error',
          description: result.error || 'Failed to resend code',
          color: 'error',
        });
        return;
      }

      // Set cooldown
      resendCooldown.value = cooldownSeconds;

      toast.add({
        title: 'Code Sent',
        description: 'A new code has been sent to your email',
        color: 'primary',
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend code';
      error.value = errorMessage;
      toast.add({
        title: 'Error',
        description: errorMessage,
        color: 'error',
      });
    } finally {
      resending.value = false;
    }
  }

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
