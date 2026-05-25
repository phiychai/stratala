<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

definePageMeta({
  layout: 'auth',
});

useSeoMeta({
  title: 'Login',
  description: 'Login to your account to continue',
});

const toast = useToast();
const router = useRouter();
const route = useRoute();
const { login } = useAuth();

// Redirect if already authenticated
useAuthRedirect('/');

// Show success message if coming from email verification
onMounted(() => {
  if (route.query.verified === 'true') {
    toast.add({
      title: 'Email Verified',
      description: 'Your email has been verified successfully. Please login to continue.',
      color: 'success',
    });
    // Clean up query param
    router.replace({ query: {} });
  }
});

const fields = [
  {
    name: 'email',
    type: 'text' as const,
    label: 'Email',
    placeholder: 'Enter your email',
    required: true,
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password' as const,
    placeholder: 'Enter your password',
  },
  // {
  //   name: 'remember',
  //   label: 'Remember me',
  //   type: 'checkbox' as const,
  // },
];

const { providers } = useOAuthProviders();

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters'),
});

type Schema = z.output<typeof schema>;

const { submit: submitForm } = useFormSubmission({
  onSubmit: async (data) => {
    const values = data as Schema;
    return await login(values.email, values.password);
  },
  onSuccess: () => {
    // Redirect to / - it will show dashboard for authenticated users
    // or /admin for admin users
    router.push('/');
  },
  successMessage: 'Login successful!',
  errorMessage: 'Login failed',
});

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  await submitForm(payload.data);
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    title="Welcome back"
    icon="i-lucide-lock"
    @submit.prevent="onSubmit"
  >
    <template #description>
      Don't have an account? <ULink to="/signup" class="text-primary font-medium">Sign up</ULink>.
    </template>

    <template #password-hint>
      <div class="flex flex-col gap-2">
        <ULink to="/forgot-password" class="text-primary font-medium" tabindex="-1">
          Forgot password?
        </ULink>
        <ULink to="/verify-email" class="text-primary font-medium text-sm" tabindex="-1">
          Need to verify your email?
        </ULink>
      </div>
    </template>

    <template #footer>
      By signing in, you agree to our
      <ULink to="/" class="text-primary font-medium">Terms of Service</ULink>.
    </template>
  </UAuthForm>
</template>
