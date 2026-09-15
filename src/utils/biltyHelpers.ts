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
 * Generates dynamic verification URL in the standard format:
 * https://[app-url]?page=verify&bilty=[BiltyNo]
 */
export function getBiltyVerificationUrl(biltyNo: string): string {
  const cleanBilty = (biltyNo || '').trim();
  const origin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://driver-dost.web.app';
  
  return `${origin}?page=verify&bilty=${encodeURIComponent(cleanBilty)}`;
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
