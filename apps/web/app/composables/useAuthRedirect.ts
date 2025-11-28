/**
 * useAuthRedirect Composable
 *
 * Handles redirect logic for authenticated/unauthenticated users.
 * Used in auth pages (login, signup, forgot-password, etc.) to redirect
 * authenticated users away from auth pages.
 *
 * @param redirectTo - Where to redirect authenticated users (default: '/')
 * @param options - Additional options
 */
export function useAuthRedirect(redirectTo: string = '/', options?: { immediate?: boolean }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const redirect = () => {
    if (isAuthenticated.value) {
      router.push(redirectTo);
    }
  };

  if (options?.immediate) {
    redirect();
  } else {
    onMounted(() => {
      redirect();
    });
  }
}
