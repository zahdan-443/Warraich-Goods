import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Global safety handler for benign browser/IndexedDB lifecycle events
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason || '');
    if (
      reason.includes('Database is closing') ||
      reason.includes('database is closing') ||
      reason.includes('Database is closing/hidden') ||
      reason.includes('The database is closing')
    ) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// PWA / TWA Auto-Update Service Worker Manager
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // Auto-update strategy: reload to immediately apply new scripts and UI updates
      console.log('New update downloaded. Activating latest version automatically...');
      updateSW(true);
    },
    onOfflineReady() {
      console.log('Warraich Goods is ready for offline use.');
    },
    onRegisteredSW(swScriptUrl, registration) {
      if (registration) {
        // 1. Periodically check for new releases on GitHub Pages every 15 minutes
        setInterval(async () => {
          if (navigator.onLine) {
            try {
              await registration.update();
            } catch (e) {
              // Ignore network check errors
            }
          }
        }, 15 * 60 * 1000);

        // 2. Check for updates whenever the user reopens or switches back to the app/TWA tab
        document.addEventListener('visibilitychange', async () => {
          if (document.visibilityState === 'visible' && navigator.onLine) {
            try {
              await registration.update();
            } catch (e) {
              // Ignore network check errors
            }
          }
        });

        // 3. Check for updates immediately when device comes back online
        window.addEventListener('online', async () => {
          try {
            await registration.update();
          } catch (e) {
            // Ignore network check errors
          }
        });

        // 4. Background Sync registration for offline Bilty records if supported
        if ('SyncManager' in window) {
          window.addEventListener('online', () => {
            (registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync
              ?.register('sync-bilty-data')
              .catch(() => {});
          });
        }
      }
    },
  });
}

