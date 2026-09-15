/**
 * Bilty Helper Utilities for Dynamic QR Verification & Data Sanitization
 */
import QRCode from 'qrcode';
import { BiltyRecord } from '../types';

/**
 * Returns clean sanitized value or "N/A" if empty or placeholder "0000" / "0"
 */
export function sanitizeContactOrCnic(val?: string | null): string {
  if (!val) return 'N/A';
  const trimmed = val.trim();
  if (
    !trimmed ||
    trimmed === '-' ||
    trimmed === '0' ||
    trimmed === '0000' ||
    trimmed === '00000000' ||
    trimmed === '0000-0000000-0' ||
    /^0+$/.test(trimmed)
  ) {
    return 'N/A';
  }
  return trimmed;
}

/**
 * Official canonical base URL for the Warraich Goods live deployment on GitHub Pages
 */
export const OFFICIAL_APP_BASE_URL = 'https://zahdan-443.github.io/Warraich-Goods/';

/**
 * Generates dynamic verification URL in the standard format:
 * https://[app-url]?page=verify&bilty=[BiltyNo]
 * 
 * Accurately includes the repo path (/Warraich-Goods/) on GitHub Pages
 * so scanned QR codes always navigate to the exact verification portal.
 */
export function getBiltyVerificationUrl(biltyNo: string): string {
  const cleanBilty = (biltyNo || '').trim();
  let baseUrl = OFFICIAL_APP_BASE_URL;

  if (typeof window !== 'undefined' && window.location) {
    const { origin, pathname, hostname } = window.location;

    if (hostname.includes('github.io')) {
      // GitHub Pages hosting: ensure repository slug is retained
      const segments = pathname.split('/').filter(Boolean);
      const repoSlug = segments.length > 0 ? segments[0] : 'Warraich-Goods';
      baseUrl = `${origin}/${repoSlug}/`;
    } else if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.includes('run.app') ||
      hostname.includes('web.app')
    ) {
      // Local dev server or Cloud Run / Firebase preview container
      const basePath = pathname.endsWith('/')
        ? pathname
        : pathname.substring(0, pathname.lastIndexOf('/') + 1);
      baseUrl = `${origin}${basePath || '/'}`;
    } else {
      // Default to official production base
      baseUrl = OFFICIAL_APP_BASE_URL;
    }
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}?page=verify&bilty=${encodeURIComponent(cleanBilty)}`;
}

/**
 * Generates dynamic QR Data URL encoding the verification link
 * Fallback to standard high-resolution QR with client-side qrcode library
 */
export async function generateBiltyVerificationQrDataUrl(biltyNo: string): Promise<string> {
  const url = getBiltyVerificationUrl(biltyNo);
  try {
    return await QRCode.toDataURL(url, {
      width: 320,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.warn('QR DataURL generation fallback to API:', err);
    // Reliable online fallback URL as noted in user prompt
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=150x150`;
  }
}
