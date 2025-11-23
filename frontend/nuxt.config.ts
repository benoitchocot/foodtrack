
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt',
    '@pinia/nuxt',
    '@nuxt/icon',
    '@nuxtjs/i18n',
  ],

  i18n: {
    locales: [
      { code: 'fr', name: 'Français', file: 'fr.json', iso: 'fr-FR', flag: '🇫🇷' },
      { code: 'en', name: 'English', file: 'en.json', iso: 'en-US', flag: '🇬🇧' },
    ],
    defaultLocale: 'fr',
    strategy: 'no_prefix',
    langDir: 'locales',
    vueI18n: './i18n.config.ts',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'fr',
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
    },
  },

  app: {
    head: {
      title: 'FoodTrack - Meal Planning Made Easy',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Plan your meals and generate shopping lists automatically' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'FoodTrack',
      short_name: 'FoodTrack',
      description: 'Meal planning and shopping list app',
      theme_color: '#10b981',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: null,
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /\/recipes\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'recipes-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 7 jours
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
            networkTimeoutSeconds: 3,
          },
        },
        {
          urlPattern: /\/recipes$/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'recipes-list-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24, // 1 jour
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
            networkTimeoutSeconds: 3,
          },
        },
        {
          urlPattern: /\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60, // 1 heure
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
            networkTimeoutSeconds: 3,
          },
        },
      ],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20,
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js',
  },
})
