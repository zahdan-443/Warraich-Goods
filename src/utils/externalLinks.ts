import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

export const PUBLIC_APP_SHARE_URL = 'https://zahdan-443.github.io/Warraich-Goods/';

/**
 * Resolves the canonical public HTTPS URL for sharing the app.
 * Prevents Android Capacitor APK or local environments from sharing `https://localhost/`.
 */
export function resolvePublicAppShareUrl(): string {
  if (typeof window === 'undefined') {
    return PUBLIC_APP_SHARE_URL;
  }

  try {
    if (Capacitor.isNativePlatform()) {
      return PUBLIC_APP_SHARE_URL;
    }
  } catch {
    // ignore Capacitor platform check errors in headless test environments
  }

  const { protocol, hostname, origin, pathname } = window.location;
  const lowerHost = (hostname || '').toLowerCase();

  if (
    !origin ||
    origin === 'null' ||
    protocol === 'file:' ||
    protocol === 'capacitor:' ||
    lowerHost === 'localhost' ||
    lowerHost === '127.0.0.1' ||
    lowerHost.startsWith('192.168.') ||
    lowerHost.startsWith('10.') ||
    lowerHost.endsWith('.local')
  ) {
    return PUBLIC_APP_SHARE_URL;
  }

  return `${origin}${pathname || '/'}`;
}

/**
 * Launches an external HTTP(S), WhatsApp, tel, or blob URL cleanly without relying on raw window.open().
 */
export function openExternalUrl(url: string, options?: { downloadFilename?: string; preferSameTabForSchemes?: boolean }): boolean {
  if (typeof window === 'undefined' || !url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  const isDirectScheme = /^(tel:|mailto:|whatsapp:|sms:)/i.test(trimmed);
  if (isDirectScheme && options?.preferSameTabForSchemes !== false) {
    try {
      window.location.href = trimmed;
      return true;
    } catch {
      return false;
    }
  }

  if (typeof document !== 'undefined' && document.body) {
    try {
      const link = document.createElement('a');
      link.href = trimmed;
      if (options?.downloadFilename) {
        link.download = options.downloadFilename;
      } else {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch {
      // Fallback below
    }
  }

  try {
    window.location.assign(trimmed);
    return true;
  } catch {
    return false;
  }
}

export function openWhatsAppMessage(text: string, cleanDigitsPhone?: string): boolean {
  const encoded = encodeURIComponent(text);
  const url = cleanDigitsPhone
    ? `https://wa.me/${cleanDigitsPhone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
  return openExternalUrl(url);
}

export async function shareTextOrUrl(options: {
  title: string;
  text: string;
  url: string;
  dialogTitle?: string;
}): Promise<'shared' | 'copied' | 'failed'> {
  const fullCopy = `${options.text}\n${options.url}`;

  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({
        title: options.title,
        text: options.text,
        url: options.url,
        dialogTitle: options.dialogTitle || options.title
      });
      return 'shared';
    }
  } catch (err: unknown) {
    const name = err && typeof err === 'object' && 'name' in err ? String((err as { name?: unknown }).name) : '';
    const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message?: unknown }).message) : '';
    if (name === 'AbortError' || /cancel/i.test(msg)) {
      return 'shared';
    }
    // Fall through to web share / clipboard
  }

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: options.title,
        text: options.text,
        url: options.url
      });
      return 'shared';
    } catch (err: unknown) {
      const name = err && typeof err === 'object' && 'name' in err ? String((err as { name?: unknown }).name) : '';
      if (name === 'AbortError') return 'shared';
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(fullCopy);
      return 'copied';
    } catch {
      // Fall through to legacy textarea copy
    }
  }

  if (typeof document !== 'undefined' && document.body) {
    try {
      const ta = document.createElement('textarea');
      ta.value = fullCopy;
      ta.setAttribute('readonly', 'true');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(ta);
      if (copied) return 'copied';
    } catch {
      // ignore
    }
  }

  return 'failed';
}
