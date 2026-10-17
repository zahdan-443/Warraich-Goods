/**
 * Web & Mobile Push Notification Utility for Warraich Goods Transport Co.
 * Handles Native Android Status Bar Notifications via Capacitor LocalNotifications &
 * Web PWA Status Bar Notifications via Service Worker & Notifications API.
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
let channelCreated = false;

export const NOTIFICATION_CHANNEL_ID = 'driver_dost_channel';

/**
 * Ensures the Android Notification Channel exists with High Importance.
 * Android 8.0+ (API 26+) REQUIRES a notification channel, otherwise notifications are silently ignored.
 */
export async function ensureNotificationChannel(): Promise<void> {
  if (!Capacitor.isNativePlatform() || channelCreated) return;
  try {
    await LocalNotifications.createChannel({
      id: NOTIFICATION_CHANNEL_ID,
      name: 'Driver Dost Transport Alerts',
      description: 'Trip cost, fuel logs, vehicle accounts, document expiry and transport alerts',
      importance: 5, // High importance (heads-up banner and sound)
      visibility: 1, // Public on lock screen
      vibration: true,
      sound: 'default',
      lights: true,
      lightColor: '#162A4D'
    });
    channelCreated = true;
  } catch (err) {
    console.warn('LocalNotifications channel setup note:', err);
  }
}

export function isNotificationSupported(): boolean {
  if (Capacitor.isNativePlatform()) {
    return true;
  }
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Checks current notification permission without triggering a prompt.
 */
export async function getNotificationPermission(): Promise<NotificationPermission> {
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await LocalNotifications.checkPermissions();
      return res.display === 'granted' ? 'granted' : res.display === 'denied' ? 'denied' : 'default';
    } catch {
      return 'default';
    }
  }
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Explicitly requests notification permissions from the user.
 * On Android 13+ (API 33+), triggers the OS runtime dialog.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (Capacitor.isNativePlatform()) {
    try {
      await ensureNotificationChannel();
      const res = await LocalNotifications.requestPermissions();
      return res.display === 'granted' ? 'granted' : 'denied';
    } catch (err) {
      console.warn('Native requestPermissions failed:', err);
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
 */
export async function sendSystemNotification(
  title: string,
  body?: string,
  options: SystemNotificationOptions = {}
): Promise<boolean> {
  // Gentle throttle (at least 500ms between system toasts) to prevent flood
  const now = Date.now();
  if (now - lastNotificationTime < 500) {
    return false;
  }
  lastNotificationTime = now;

  // On Native Android Platform (Capacitor APK), dispatch directly via LocalNotifications
  if (Capacitor.isNativePlatform()) {
    try {
      await ensureNotificationChannel();

      // Check permissions, request if needed
      const currentPerm = await LocalNotifications.checkPermissions();
      if (currentPerm.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') {
          return false;
        }
      }

      const notifId = Math.floor(Math.random() * 1000000) + 1;
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title,
            body: body || '',
            channelId: NOTIFICATION_CHANNEL_ID,
            sound: 'default',
            isExactNotification: false,
            isExactMandatory: false
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
    tag: options.tag || 'driver-dost-update',
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
