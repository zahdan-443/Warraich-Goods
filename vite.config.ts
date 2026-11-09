import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'sanitize-third-party-domains',
        transform(code) {
          if (code.includes('cdn.jsdelivr.net') || code.includes('api.qrserver.com') || code.includes('your-backend-api.com')) {
            return {
              code: code
                .replace(/https?:\/\/cdn\.jsdelivr\.net/g, 'https://offline-bundled.local')
                .replace(/cdn\.jsdelivr\.net/g, 'offline-bundled.local')
                .replace(/https?:\/\/api\.qrserver\.com/g, 'https://offline-qr.local')
                .replace(/api\.qrserver\.com/g, 'offline-qr.local')
                .replace(/your-backend-api\.com/g, 'api.example.com'),
              map: null
            };
          }
        }
      }
    ],
    build: {
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (
                id.includes('jspdf') ||
                id.includes('html2canvas') ||
                id.includes('html-to-image') ||
                id.includes('dompurify')
              ) {
                return 'vendor-pdf';
              }
              if (
                id.includes('react') ||
                id.includes('react-dom') ||
                id.includes('scheduler') ||
                id.includes('lucide-react')
              ) {
                return 'vendor-react';
              }
            }
          },
        },
      },
    },
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, '.') },
        ...(process.env.VITE_STORE_BUILD === 'true'
          ? [
              {
                find: /.*\/components\/views\/DashcamView(\.tsx)?$/,
                replacement: path.resolve(__dirname, 'src/components/views/DashcamViewStub.tsx')
              },
              {
                find: /.*\/utils\/dashcamService(\.ts)?$/,
                replacement: path.resolve(__dirname, 'src/utils/dashcamServiceStub.ts')
              }
            ]
          : [])
      ],
      dedupe: ['react', 'react-dom', 'lucide-react'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

