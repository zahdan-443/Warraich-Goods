import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

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

// Native PWA Service Worker auto-update and periodic background sync manager
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    console.log('Warraich Goods active Service Worker ready:', registration.scope);

    // 1. Periodically check for updates every 15 minutes
    setInterval(async () => {
      if (navigator.onLine) {
        try {
          await registration.update();
        } catch (e) {
          // Ignore network check errors
        }
      }
    }, 15 * 60 * 1000);

    // 2. Check for updates on visibility change
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        try {
          await registration.update();
        } catch (e) {
          // Ignore network check errors
        }
      }
    });

    // 3. Check for updates when coming online
    window.addEventListener('online', async () => {
      try {
        await registration.update();
      } catch (e) {
        // Ignore network check errors
      }
    });

    // 4. Background Sync registration for offline Bilty records
    if ('SyncManager' in window) {
      window.addEventListener('online', () => {
        (registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync
          ?.register('sync-bilty-data')
          .catch(() => {});
      });
    }
  }).catch((err) => {
    console.warn('SW ready handler notice:', err);
  });
}


