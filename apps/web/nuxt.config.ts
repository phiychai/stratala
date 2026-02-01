// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  telemetry: false,
  components: [
    { path: '~/components', pathPrefix: false },
    { path: '~/components/block', pathPrefix: false },
    { path: '~/components/shared', pathPrefix: false },
    { path: '~/components/base', pathPrefix: false },
    { path: '~/components/forms', pathPrefix: false },
    { path: '~/components/customers' }, // pathPrefix defaults to true, so components get "Customers" prefix
  ],

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    ['nuxt-og-image', { enabled: process.env.NODE_ENV !== 'test' }], // Disable in test environment
    'nuxt-security',
    '@nuxt/scripts',
    '@nuxtjs/mdc',
    '@nuxtjs/seo',
  ],

  devtools: {
    enabled: false,
  },
  // Enable SSR for SEO benefits on public pages
  // Authenticated pages can be client-side only via routeRules
  ssr: true,
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://0.0.0.0:3000',
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://0.0.0.0:3333',
      payloadUrl: process.env.NUXT_PUBLIC_PAYLOAD_URL || 'http://0.0.0.0:3002',
      enableVisualEditing: process.env.NUXT_PUBLIC_ENABLE_VISUAL_EDITING !== 'false',
    },
  },

  routeRules: {
    // Public pages - SSR enabled for SEO
    '/': { ssr: true, prerender: true },
    '/docs/**': { ssr: true, prerender: true },
    '/blog/**': { ssr: true, prerender: true },
    '/explore': { ssr: true, prerender: false }, // Dynamic content
    '/@*/**': { ssr: true, prerender: false }, // User profiles - dynamic

    // Auth pages - SSR enabled (no SEO needed but faster initial load)
    '/login': { ssr: true },
    '/signup': { ssr: true },
    '/forgot-password': { ssr: true },
    '/reset-password': { ssr: true },
    '/verify-email': { ssr: true },
    '/set-username': { ssr: true },

    // Authenticated pages - Client-side only (no SEO needed, faster for logged-in users)
    '/home': { ssr: false },
    '/admin/**': { ssr: false },
    '/settings/**': { ssr: false },
    '/library': { ssr: false },
    '/my-feed': { ssr: false },

    // API routes
    '/api/pages/**': { cors: true, headers: { 'Cache-Control': 's-maxage=300' } },
    '/api/posts/**': { cors: true, headers: { 'Cache-Control': 's-maxage=60' } },
    '/api/posts/categories': { cors: true, headers: { 'Cache-Control': 's-maxage=600' } },
    // Tenant-aware Payload CMS admin proxy
    '/publish/**': {
      cors: true,
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      prerender: false,
    },
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: false, // Disable link crawling to avoid prerender failures for dynamic pages
      failOnError: false, // Don't fail build on prerender errors
    },
    // Workaround for oxc-parser optional dependency resolution
    experimental: {
      wasm: true,
    },
  },

  vue: {
    propsDestructure: true,
  },

  // typescript: {
  //   typeCheck: true,
  // },
  // Image Configuration
  image: {
    providers: {
      payload: {
        provider: 'ipx',
        // Payload serves media at /media/{filename}
        // We'll use the Payload URL for media
      },
      local: {
        provider: 'ipx',
      },
    },
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL as string,
  },

  // Sitemap configuration (provided by @nuxtjs/seo)
  sitemap: {
    sources: ['/api/sitemap'],
    // Disable automatic Nuxt Content integration to avoid import errors
    exclude: [],
    autoI18n: false,
  },

  // Nuxt Content configuration
  content: {
    // Prevent sitemap auto-detection issues
    // experimental: {
    //   search: false,
    // },
  },

  security: {
    enabled: process.env.NODE_ENV === 'production',
    headers: {
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production'
          ? {
              'img-src': ["'self'", 'data:', '*'],
              'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
              'script-src-attr': ["'unsafe-inline'"],
              'style-src': ["'self'", "'unsafe-inline'"],
              'connect-src': [
                "'self'",
                'http://localhost:8055',
                'http://localhost:3333',
                process.env.NUXT_PUBLIC_API_URL || '',
                process.env.NUXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3002',
              ],
              'frame-ancestors': [
                "'self'",
                'http://localhost:8055',
                process.env.NUXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3002',
              ],
            }
          : false, // Disable CSP in development
    },
  },

  vite: {
    server: {
      allowedHosts: ['webdev.lan', 'admin.webdev.lan', 'cms.webdev.lan'],
    },
    optimizeDeps: {
      exclude: ['@nuxtjs/mdc'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  },

  // MDC configuration
  mdc: {
    components: {
      prose: true,
    },
    // Temporarily disable highlight to avoid Rollup parsing errors
    // Re-enable once the build issue is resolved
    highlight: false,
  },
});
