/**
 * useFormSubmission Composable
 *
 * Handles form submission logic including:
 * - Loading states
 * - Error handling
 * - Toast notifications
 * - Success/error callbacks
 *
 * @param options - Configuration options
 * @returns Form submission utilities
 */
export function useFormSubmission<T>(options: {
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string } | undefined>;
  onSuccess?: (data: T) => void | Promise<void>;
  onError?: (error: string) => void;
  successMessage?: string;
  errorMessage?: string;
}) {
  const submitting = ref(false);
  const error = ref('');
  const toast = useToast();

  async function submit(data: T) {
    submitting.value = true;
    error.value = '';

    try {
      const result = await options.onSubmit(data);

      // If onSubmit returns void, assume success
      if (result === undefined) {
        toast.add({
          title: 'Success',
          description: options.successMessage || 'Operation completed successfully',
          color: 'success',
        });
        await options.onSuccess?.(data);
        return;
      }

      // If onSubmit returns result object
      if (!result.success) {
        const errorMessage = result.error || options.errorMessage || 'Submission failed';
        error.value = errorMessage;
        toast.add({
          title: 'Error',
          description: errorMessage,
          color: 'error',
        });
        options.onError?.(errorMessage);
        return;
      }

      toast.add({
        title: 'Success',
        description: options.successMessage || 'Operation completed successfully',
        color: 'success',
      });

      await options.onSuccess?.(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : options.errorMessage || 'Submission failed';
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
