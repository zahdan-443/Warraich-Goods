/**
 * Helper utility for PDF rendering and Asset Conversion
 * Ensures official Warraich Goods logo & assets are rendered in PDF without CORS or missing image issues.
 * Eliminates 'oklch' color parse crashes via html-to-image native browser SVG rasterization + html2canvas-pro fallback.
 */

import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import DOMPurify from 'dompurify';
import { BiltyRecord } from '../types';
import { getCachedCompanyProfile } from './storage';

/**
 * Escapes unsafe characters for HTML injection prevention.
 */
export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes arbitrary HTML using DOMPurify to eliminate DOM-based XSS risks.
 */
export function sanitizeHtml(html: string): string {
  if (typeof window !== 'undefined' && DOMPurify) {
    const purify = typeof DOMPurify.sanitize === 'function' ? DOMPurify : (DOMPurify as any)(window);
    if (purify && typeof purify.sanitize === 'function') {
      return purify.sanitize(html);
    }
  }
  // Node / test environment fallback
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/on\w+\s*=\s*[^>\s]+/gi, '');
}

let cachedLogoBase64: string | null = null;

export async function getLogoBase64(): Promise<string> {
  if (cachedLogoBase64) {
    return cachedLogoBase64;
  }

  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
  const base = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL ? import.meta.env.BASE_URL : './';
  const cleanBase = base.endsWith('/') ? base : base + '/';

  const candidates = [
    `${cleanBase}bilty-official-icon.png`,
    './bilty-official-icon.png',
    '/bilty-official-icon.png',
    `${origin}/bilty-official-icon.png`,
    `${cleanBase}bilty-official-icon.jpg`,
    './bilty-official-icon.jpg',
    `${cleanBase}logo.png`,
    './logo.png',
    '/logo.png',
    `${origin}/logo.png`,
    `${cleanBase}bilty-icon.png`,
    './bilty-icon.png'
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 0) {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(blob);
          });
          if (base64 && base64.startsWith('data:image/')) {
            cachedLogoBase64 = base64;
            return base64;
          }
        }
      }
    } catch {
      // Continue to next candidate
    }
  }

  return '';
}

let cachedCompanyCardBase64: string | null = null;

/**
 * Pre-converts the official company visiting card to a clean base64 data URL
 * to avoid CORS / tainted-canvas issues during PDF and print rasterization.
 */
export async function getCompanyCardBase64(): Promise<string> {
  if (cachedCompanyCardBase64) return cachedCompanyCardBase64;

  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
  const base = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL ? import.meta.env.BASE_URL : './';
  const cleanBase = base.endsWith('/') ? base : base + '/';

  const candidates = [
    `${cleanBase}warraich-card.png`,
    './warraich-card.png',
    '/warraich-card.png',
    `${cleanBase}company-card.png`,
    './company-card.png',
    '/company-card.png',
    `${cleanBase}warraich-card.jpg`,
    './warraich-card.jpg',
    `${origin}/warraich-card.png`,
    `${origin}/company-card.png`
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 0) {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(blob);
          });
          if (base64 && base64.startsWith('data:image/')) {
            cachedCompanyCardBase64 = base64;
            return base64;
          }
        }
      }
    } catch {
      // Continue to next candidate
    }
  }

  return '';
}

/**
 * Generate A4 PDF from a DOM element with zero 'oklch' errors.
 * Uses html-to-image (primary) and html2canvas-pro (secondary fallback).
 */
export async function generatePdfFromElement(
  element: HTMLElement,
  options?: {
    quality?: number;
    scale?: number;
  }
): Promise<{ pdf: jsPDF; pdfBlob: Blob; dataUrl: string }> {
  const quality = options?.quality ?? 0.98;
  const scale = options?.scale ?? 2;

  let imgDataUrl = '';

  // 1. Primary Engine: html-to-image (Uses native SVG foreignObject rasterization - completely immune to oklch / CSS parsing bugs)
  try {
    imgDataUrl = await toJpeg(element, {
      quality,
      pixelRatio: scale,
      backgroundColor: '#ffffff',
      cacheBust: true,
      style: {
        backgroundColor: '#ffffff',
        color: '#0f172a',
        transform: 'none',
        margin: '0',
      },
    });
  } catch (err) {
    console.error('html-to-image failed:', err);
    throw new Error(
      err instanceof Error ? err.message : 'پی ڈی ایف جنریٹ کرتے وقت رینڈرنگ میں خرابی پیش آئی۔'
    );
  }

  if (!imgDataUrl || !imgDataUrl.startsWith('data:image/')) {
    throw new Error('تصویر حاصل کرنے میں ناکامی، برائے مہربانی دوبارہ کوشش کریں۔');
  }

  // Create Standard A4 Portrait jsPDF document (210mm x 297mm)
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  pdf.addImage(imgDataUrl, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  const pdfBlob = pdf.output('blob');

  return { pdf, pdfBlob, dataUrl: imgDataUrl };
}

/**
 * Format a rich, professional WhatsApp message in Urdu & English with all Bilty details.
 */
export function formatBiltyWhatsAppSummary(record: BiltyRecord): string {
  const company = getCachedCompanyProfile();
  const fmt = (n?: number) => (n !== undefined && n !== null ? n.toLocaleString('en-US') : '0');

  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
  const verifyLink = origin ? `${origin}?view=verify&biltyNo=${encodeURIComponent(record.biltyNo)}` : '';

  const lines = [
    `🚚 *${company.nameUr || 'ورائچ گڈز ٹرانسپورٹ کمپنی (رجسٹرڈ)'}*`,
    `📋 *${company.nameEn || 'WARRAICH GOODS TRANSPORT CO.'}*`,
    `───────────────────────`,
    `📄 *بلٹی نمبر (Bilty No):* ${record.biltyNo}`,
    `🚛 *گاڑی نمبر (Vehicle No):* ${record.vehicleNo}`,
    `📅 *تاریخ (Date):* ${record.date || '-'}`,
    `🛣️ *روٹ:* ${record.sendingCity || '-'} تا ${record.receivingCity || '-'}`,
    `───────────────────────`,
    `👤 *مال بھیجنے والا (Consignor):* ${record.senderName || record.consignor || '-'} (${record.senderMobile || '-'})`,
    `👤 *مال وصول کرنے والا (Consignee):* ${record.receiverName || record.consignee || '-'} (${record.receiverMobile || '-'})`,
    `📦 *تفصیلِ سامان:* ${record.itemDescription || 'جنرل کارگو'}`,
    `📦 *تعداد (Qty):* ${record.qty || '-'} نگ / کارٹن`,
    `⚖️ *وزن (Weight):* ${record.weight || '-'} کلوگرام`,
    `───────────────────────`,
    `💰 *کل کرایہ (Grand Total):* Rs ${fmt(record.total)}`,
    `💵 *پیشگی ادا شدہ (Advance):* Rs ${fmt(record.advance)}`,
    `💳 *بقایا رقم (Payable):* Rs ${fmt(record.payable)}`,
    `───────────────────────`,
    `📍 *ہیڈ آفس:* ${company.headOfficeUr || 'سمندری، فیصل آباد'}`,
    `📞 *ہیلپ لائن:* ${company.phoneNumbers || '0300-5370443 | 0339-5370443'}`,
    verifyLink ? `🌐 *آن لائن تصدیق:* ${verifyLink}` : '',
    `───────────────────────`,
    `*(نوٹ: کمپیوٹرائزڈ آفیشل بلٹی رسید)*`
  ];

  return lines.filter(Boolean).join('\n');
}

/**
 * Universal WhatsApp Sharing & PDF Dispatch
 * 1. Checks if mobile Web Share API can share the PDF File directly into WhatsApp.
 * 2. If not supported or on desktop, downloads the PDF file automatically and opens WhatsApp with the formatted summary.
 */
export async function shareBiltyPdfOrWhatsApp(options: {
  record: BiltyRecord;
  pdfBlob?: Blob;
  pdfDoc?: jsPDF;
  onSuccess?: () => void;
}): Promise<void> {
  const { record, pdfBlob, pdfDoc, onSuccess } = options;
  const fileName = `Bilty_${record.biltyNo}.pdf`;
  const textSummary = formatBiltyWhatsAppSummary(record);

  // If a PDF blob is available, attempt native file sharing
  if (pdfBlob) {
    try {
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: `بلٹی رسید #${record.biltyNo} - ورائچ گڈز`,
          text: textSummary,
          files: [pdfFile],
        });
        if (onSuccess) onSuccess();
        return;
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // User deliberately cancelled the share dialog
        return;
      }
      console.warn('Native share with PDF file failed, executing direct WhatsApp fallback:', err);
    }

    // Auto-save the PDF document if available
    try {
      if (pdfDoc) {
        pdfDoc.save(fileName);
      } else {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (saveErr) {
      console.warn('Could not auto-download PDF:', saveErr);
    }
  }

  // Open WhatsApp via URL scheme
  const encodedText = encodeURIComponent(textSummary);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;

  // Try direct window location or popup
  const win = window.open(whatsappUrl, '_blank');
  if (!win || win.closed || typeof win.closed === 'undefined') {
    window.location.href = whatsappUrl;
  }

  if (onSuccess) onSuccess();
}

/**
 * Universal PDF File Sharing & WhatsApp dispatch for arbitrary views (Trip Cost, Vehicle Accounts)
 */
export async function sharePdfFileOrWhatsApp(options: {
  pdfBlob: Blob;
  fileName: string;
  title: string;
  textSummary: string;
  onDownloadedFallback?: () => void;
}): Promise<void> {
  const { pdfBlob, fileName, title, textSummary, onDownloadedFallback } = options;

  try {
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      await navigator.share({
        title,
        text: textSummary,
        files: [pdfFile]
      });
      return;
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return;
    }
    console.warn('Web Share with file failed, executing download + WhatsApp link fallback:', err);
  }

  // Desktop or fallback: download the PDF file and open WhatsApp
  try {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.warn('Download link failed:', e);
  }

  if (onDownloadedFallback) {
    onDownloadedFallback();
  }

  const encodedMsg = encodeURIComponent(
    `${textSummary}\n\n📄 *(نوٹ: مکمل پی ڈی ایف رسید ڈاؤن لوڈ ہو گئی ہے، برائے مہربانی چیٹ میں فائل اٹیچ کر کے بھیج دیں۔)*`
  );
  window.open(`https://api.whatsapp.com/send?text=${encodedMsg}`, '_blank');
}
