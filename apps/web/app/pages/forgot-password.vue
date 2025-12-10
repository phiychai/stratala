<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

definePageMeta({
  layout: 'auth',
});

useSeoMeta({
  title: 'Forgot Password',
  description: 'Reset your password',
});

const toast = useToast();
const router = useRouter();
const { requestPasswordReset } = useAuth();

// Redirect if already authenticated
useAuthRedirect('/home');

const fields = [
  {
    name: 'email',
    type: 'text' as const,
    label: 'Email',
    placeholder: 'Enter your email address',
    required: true,
  },
];

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type Schema = z.output<typeof schema>;

const success = ref(false);

const { submitting, submit: submitForm } = useFormSubmission<Schema>({
  onSubmit: async (data) => await requestPasswordReset(data.email),
  onSuccess: (data) => {
    success.value = true;
    toast.add({
      title: 'Code Sent',
      description: 'A password reset code has been sent to your email',
      color: 'primary',
    });

    // Redirect to reset password page after a short delay
    setTimeout(() => {
      router.push({
        path: '/reset-password',
        query: { email: data.email },
      });
    }, 2000);
  },
  successMessage: '', // We handle success message manually
  errorMessage: 'Failed to send password reset code',
});

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  await submitForm(payload.data);
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    title="Forgot Password"
    icon="i-lucide-lock"
    :submit="{ label: submitting ? 'Sending...' : 'Send Reset Code' }"
    :disabled="submitting || success"
    @submit.prevent="onSubmit"
  >
    <template #description>
      Enter your email address and we'll send you a code to reset your password.
    </template>

    <template v-if="success" #after-fields>
      <div class="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
        <p class="text-sm text-green-800 dark:text-green-200">
          Password reset code sent! Redirecting to reset page...
        </p>
      </div>
    </template>

    <template #footer>
      <div class="text-center">
        <ULink to="/login" class="text-sm text-primary hover:underline"> Back to login </ULink>
      </div>
    </template>
  </UAuthForm>
</template>
