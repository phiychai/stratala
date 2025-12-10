/**
 * useOAuthProviders Composable
 *
 * Provides OAuth provider configuration for authentication forms.
 * Currently shows "Coming soon" messages, but can be extended to
 * handle actual OAuth flows.
 *
 * @returns OAuth providers array
 */
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
      label: 'X',
      icon: 'i-simple-icons-x',
      onClick: () => {
        toast.add({ title: 'GitHub', description: 'Login with GitHub - Coming soon' });
      },
    },
  ];

  return { providers };
}
