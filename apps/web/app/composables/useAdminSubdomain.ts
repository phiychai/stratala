/**
 * Composable to check if current request is on admin subdomain
 */
export const useAdminSubdomain = () => {
  const isAdminSubdomain = computed(() => {
    if (import.meta.server) {
      // Server-side: check from event context
      try {
        const event = useRequestEvent();
        if (event) {
          const tenant = (event.context.tenant as { isAdminSubdomain?: boolean }) || {};
          return tenant.isAdminSubdomain === true;
        }
      } catch {
        // useRequestEvent() not available in this context
        // Fall back to checking headers
        const headers = useRequestHeaders();
        const host = headers.host || '';
        const hostname = host.split(':')[0];
        const parts = hostname.split('.');

        if (parts.length >= 2) {
          return parts[0].toLowerCase() === 'admin';
        }
      }
      return false;
    } else {
      // Client-side: check from window.location
      if (typeof window === 'undefined') return false;

      const hostname = window.location.hostname;
      const parts = hostname.split('.');

      // Check if first part is 'admin'
      // admin.localhost or admin.example.com
      if (parts.length >= 2) {
        return parts[0].toLowerCase() === 'admin';
      }

      return false;
    }
  });

  const redirectToAdminSubdomain = (path: string = '') => {
    if (import.meta.server) return;

    if (typeof window === 'undefined') return;

    const currentHost = window.location.hostname;
    const parts = currentHost.split('.');

    // If already on admin subdomain, just navigate
    if (parts[0].toLowerCase() === 'admin') {
      navigateTo(path || '/admin');
      return;
    }

    // Build admin subdomain URL
    // For localhost: admin.localhost
    // For production: admin.example.com
    let adminHost: string;
    if (currentHost === 'localhost' || currentHost.startsWith('127.0.0.1')) {
      adminHost = 'admin.localhost';
    } else {
      // Replace first subdomain with 'admin' or prepend 'admin.'
      if (parts.length >= 2) {
        parts[0] = 'admin';
        adminHost = parts.join('.');
      } else {
        adminHost = `admin.${currentHost}`;
      }
    }

    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    const adminUrl = `${protocol}//${adminHost}${port}${path || '/admin'}`;

    window.location.href = adminUrl;
  };

  return {
    isAdminSubdomain,
    redirectToAdminSubdomain,
  };
};

