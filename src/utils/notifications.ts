/**
 * Web & Mobile Push Notification Utility for Warraich Goods Transport Co.
 * Handles Native Browser & Mobile Status Bar Notifications via Service Worker & Notifications API
 * Adheres strictly to Chromium PWA Notification standards to prevent spam filtering.
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface SystemNotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  vibrate?: number[];
  silent?: boolean;
  renotify?: boolean;
}

let lastNotificationTime = 0;

export function isNotificationSupported(): boolean {
  if (Capacitor.isNativePlatform()) {
    return true;
  }
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (Capacitor.isNativePlatform()) {
    return 'granted';
  }
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await LocalNotifications.requestPermissions();
      return res.display === 'granted' ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  }

  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported in this browser environment.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Dispatches a native notification to the device's system status bar and notification panel.
 * Rate-limited and grouped to comply with Android Chrome Anti-Spam heuristics.
 */
export async function sendSystemNotification(
  title: string,
  body?: string,
  options: SystemNotificationOptions = {}
): Promise<boolean> {
  // Throttle notifications (at least 1.5 seconds between system toasts) to prevent spam
  const now = Date.now();
  if (now - lastNotificationTime < 1500) {
    return false;
  }
  lastNotificationTime = now;

  // On Native Android Platform (Capacitor APK), dispatch directly via LocalNotifications
  if (Capacitor.isNativePlatform()) {
    try {
      const notifId = (Date.now() % 1000000) + Math.floor(Math.random() * 1000);
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title,
            body: body || '',
            smallIcon: 'ic_launcher',
            sound: 'default'
          }
        ]
      });
      return true;
    } catch (nativeErr) {
      console.warn('Native LocalNotifications delivery failed:', nativeErr);
    }
  }

  if (!isNotificationSupported()) return false;

  if (Notification.permission !== 'granted') {
    return false;
  }

  // Use clean static icon path
  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
  const defaultIcon = `${origin}/icon-192.png`;
  const defaultBadge = `${origin}/icon-192.png`;

  const notificationOptions: any = {
    body: body || '',
    icon: options.icon || defaultIcon,
    badge: options.badge || defaultBadge,
    tag: options.tag || 'warraich-goods-update',
    renotify: options.renotify ?? false,
    vibrate: options.vibrate || [100, 50, 100],
    data: options.data || { url: './' },
    silent: options.silent || false
  };

  try {
    // Prefer ServiceWorkerRegistration.showNotification for Mobile Status Bar & Background support
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && typeof registration.showNotification === 'function') {
        await registration.showNotification(title, notificationOptions);
        return true;
      }
    }

    // Fallback to standard desktop Notification constructor
    new Notification(title, notificationOptions);
    return true;
  } catch (err) {
    console.warn('System notification delivery fallback failed:', err);
    try {
      new Notification(title, {
        body: notificationOptions.body,
        icon: notificationOptions.icon,
        tag: notificationOptions.tag
      });
      return true;
    } catch {
      return false;
    }
  }
}

