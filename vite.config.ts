import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: [
          'logo.png',
          'icon-192.png',
          'icon-512.png',
          'screenshot-mobile.png',
          'screenshot-desktop.png',
          'app-icon.png',
          'vehicle-icon.png',
          'trip-icon.png',
          'gari-hisaab-icon.png',
          'bilty-icon.png',
          'echallan-icon.png',
          'license-icon.png',
          'quick-ops-icon.png',
          'safar-diary-icon.png',
          'scan-me-qr.png',
          'splash.png',
          'splash-screen.png',
          'toll-icon.png',
          'toll_icon.png'
        ],
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            {
              // Navigation requests (index.html) use NetworkFirst so newly deployed versions are fetched immediately online, falling back to cache when offline
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'html-navigation-cache',
                networkTimeoutSeconds: 3,
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              // Google Fonts stylesheets & webfonts
              urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 15,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        manifest: {
          name: 'Warraich Goods - Road Freight & Fleet Management',
          short_name: 'Warraich Goods',
          description: 'Comprehensive bilingual (Urdu & English) cargo transport, fleet management, and digital Bilty generator system for Warraich Goods logistics.',
          id: './?source=pwa',
          start_url: './',
          scope: './',
          display: 'standalone',
          display_override: ['standalone', 'window-controls-overlay', 'minimal-ui', 'browser'],
          orientation: 'portrait-primary',
          lang: 'ur',
          dir: 'rtl',
          background_color: '#fdfbf7',
          theme_color: '#8b9d77',
          categories: ['business', 'productivity', 'utilities', 'logistics'],
          icons: [
            {
              src: 'icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: 'icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],
          screenshots: [
            {
              src: 'screenshot-mobile.png',
              sizes: '540x960',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'Warraich Goods Mobile Fleet & Calculator Screen'
            },
            {
              src: 'screenshot-desktop.png',
              sizes: '1280x720',
              type: 'image/png',
              form_factor: 'wide',
              label: 'Warraich Goods Desktop Dashboard & Trip Operations'
            }
          ],
          shortcuts: [
            {
              name: 'New Bilty (نئی بلٹی)',
              short_name: 'Bilty',
              description: 'Create a new transport waybill',
              url: './?tab=bilty',
              icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }]
            },
            {
              name: 'Trip Calculator (کیلکولیٹر)',
              short_name: 'Calculator',
              description: 'Calculate road freight diesel and trip expenses',
              url: './?tab=calculator',
              icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }]
            },
            {
              name: 'Vehicle Account (گاڑی کا حساب)',
              short_name: 'Account',
              description: 'Post-trip vehicle income and expense ledger',
              url: './?tab=vehicleAccount',
              icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }]
            },
            {
              name: 'Safar Diary (سفر ڈائری)',
              short_name: 'Diary',
              description: 'Track driver trips and highway logs',
              url: './?tab=safar',
              icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }]
            }
          ]
        }
      })
    ],
    build: {
      chunkSizeWarningLimit: 3000,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
