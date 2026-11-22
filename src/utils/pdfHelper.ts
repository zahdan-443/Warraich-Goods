/**
 * Helper utility for PDF rendering and Asset Conversion
 * Ensures official Warraich Goods logo & assets are rendered in PDF without CORS or missing image issues.
 * Eliminates 'oklch' color parse crashes via html-to-image native browser SVG rasterization + html2canvas-pro fallback.
 */

import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import DOMPurify from 'dompurify';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { shareOrDownloadBlob } from './nativeExport';
import { BiltyRecord } from '../types';
import { getCachedCompanyProfile } from './storage';
import { BILTY_BRANCHES, getBiltyVerificationUrl } from './biltyHelpers';
import { biltyWatermarkBgData } from '../assets/dashboardIcons';
import { buildPublicEmblemCandidates } from './assetResolver';
import { openWhatsAppMessage } from './externalLinks';

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
    const domPurifyModule = DOMPurify as unknown as {
      sanitize?: (dirty: string) => string;
      (win: Window): { sanitize: (dirty: string) => string };
    };
    const purify =
      typeof domPurifyModule.sanitize === 'function'
        ? domPurifyModule
        : domPurifyModule(window);
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

  const candidates = Array.from(
    new Set([
      ...buildPublicEmblemCandidates(cleanBase, origin),
      `${cleanBase}logo.png`,
      './logo.png',
      '/logo.png',
      `${origin}/logo.png`
    ])
  );

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
    biltyWatermarkBgData,
    `${cleanBase}warraich-card.png`,
    './warraich-card.png',
    '/warraich-card.png',
    'warraich-card.png',
    `${origin}/Warraich-Goods/warraich-card.png`,
    'https://zahdan-443.github.io/Warraich-Goods/warraich-card.png',
    `${origin}/warraich-card.png`
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

export async function preloadBiltyPdfAssets(): Promise<{ logo: string; card: string }> {
  const [logo, card] = await Promise.all([getLogoBase64(), getCompanyCardBase64()]);
  return { logo, card };
}

/**
 * Generate A4 PDF from a DOM element with zero 'oklch' errors.
 * Uses html-to-image (primary) with strict image decode synchronization so
 * background card watermarks and seals always render in exports.
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

  // Preload official seal & background card before capture
  await preloadBiltyPdfAssets().catch(() => ({ logo: '', card: '' }));

  // Ensure all fonts are fully loaded and layout has stabilized before capturing
  const fontDoc = typeof document !== 'undefined' ? (document as Document & { fonts?: FontFaceSet }) : null;
  if (fontDoc?.fonts?.ready) {
    try {
      await fontDoc.fonts.ready;
    } catch {
      // ignore font ready error
    }
  }

  // Wait for every embedded <img> (including warraich-card.png watermark & QR) to finish loading & decoding
  const imgs = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    imgs.map(async (img) => {
      if (!img.complete || img.naturalWidth === 0) {
        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, 2500);
          img.addEventListener('load', () => { clearTimeout(timer); resolve(); }, { once: true });
          img.addEventListener('error', () => { clearTimeout(timer); resolve(); }, { once: true });
        });
      }
      if (typeof img.decode === 'function') {
        await img.decode().catch(() => {});
      }
    })
  );

  // Brief stabilization pause to ensure painted frames reflect decoded images
  await new Promise((r) => setTimeout(r, 150));

  let imgDataUrl = '';

  // 1. Primary Engine: html-to-image (Uses native SVG foreignObject rasterization - completely immune to oklch / CSS parsing bugs)
  const resolvedExportBg = element.style?.backgroundColor || '#ffffff';
  try {
    imgDataUrl = await toJpeg(element, {
      quality,
      pixelRatio: scale,
      backgroundColor: resolvedExportBg,
      cacheBust: true,
      style: {
        backgroundColor: resolvedExportBg,
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
  const isEn = record.language === 'en';
  const totalAmt = Math.max(0, Number(record.total) || 0);
  const advanceAmt = Math.max(0, Number(record.advance) || 0);
  const pendingAmt = Math.max(0, Number(record.payable ?? (totalAmt - advanceAmt)) || 0);
  const hasAdvance = advanceAmt > 0;
  const verifyLink = getBiltyVerificationUrl(record);

  const cleanUrTitle = (company.nameUr || 'وڑائچ گڈز ٹرانسپورٹ کمپنی').replace(/\s*\(رجسٹرڈ\)\s*/g, '').trim();
  const officeInfo = BILTY_BRANCHES.samundri;

  const lines = isEn
    ? [
        `🚚 *WARRAICH GOODS TRANSPORT COMPANY®*`,
        `👤 *Proprietor:* Zahdan Nasar Warraich`,
        `🏛️ *NTN:* 7779394-1`,
        `───────────────────────`,
        `📄 *Bilty No:* ${record.biltyNo}`,
        `🚛 *Truck No:* ${record.vehicleNo}`,
        `📅 *Date:* ${record.date || '-'}`,
        `🛣️ *Route:* ${record.sendingCity || '-'} to ${record.receivingCity || '-'}`,
        `───────────────────────`,
        `👤 *Consignor:* ${record.senderName || record.consignor || '-'} (${record.senderMobile || '-'})`,
        `👤 *Consignee:* ${record.receiverName || record.consignee || '-'} (${record.receiverMobile || '-'})`,
        `📦 *Goods:* ${record.itemDescription || 'General Cargo'}`,
        `📦 *Qty:* ${record.qty || '-'}`,
        `⚖️ *Weight:* ${record.weight || '-'} KG`,
        totalAmt > 0 ? `💰 *Total Freight:* Rs ${fmt(totalAmt)}` : '',
        hasAdvance ? `💵 *Advance Paid:* Rs ${fmt(advanceAmt)}` : '',
        hasAdvance ? `⏳ *Pending Amount:* Rs ${fmt(pendingAmt)}` : '',
        `───────────────────────`,
        `📍 *Head Office:* ${officeInfo.addressEn}`,
        `📞 *Helpline:* ${officeInfo.phone}`,
        verifyLink ? `🌐 *Verify Online:* ${verifyLink}` : '',
        `───────────────────────`,
        `*(This is a computer-generated Bilty, no signature required)*`
      ]
    : [
        `🚚 *${cleanUrTitle}®*`,
        `👤 *پروپرائیٹر:* زاہدان نصر وڑائچ`,
        `🏛️ *این ٹی این:* 7779394-1`,
        `───────────────────────`,
        `📄 *بلٹی نمبر:* ${record.biltyNo}`,
        `🚛 *گاڑی نمبر:* ${record.vehicleNo}`,
        `📅 *تاریخ:* ${record.date || '-'}`,
        `🛣️ *روٹ:* ${record.sendingCity || '-'} تا ${record.receivingCity || '-'}`,
        `───────────────────────`,
        `👤 *بھیجنے والا:* ${record.senderName || record.consignor || '-'} (${record.senderMobile || '-'})`,
        `👤 *وصول کرنے والا:* ${record.receiverName || record.consignee || '-'} (${record.receiverMobile || '-'})`,
        `📦 *تفصیلِ سامان:* ${record.itemDescription || 'جنرل کارگو'}`,
        `📦 *تعداد:* ${record.qty || '-'} نگ / کارٹن`,
        `⚖️ *وزن:* ${record.weight || '-'} کلوگرام`,
        totalAmt > 0 ? `💰 *کل کرایہ:* روپے ${fmt(totalAmt)}` : '',
        hasAdvance ? `💵 *پیشگی وصول:* روپے ${fmt(advanceAmt)}` : '',
        hasAdvance ? `⏳ *بقایا رقم:* روپے ${fmt(pendingAmt)}` : '',
        `───────────────────────`,
        `📍 *ہیڈ آفس:* ${officeInfo.addressUr}`,
        `📞 *ہیلپ لائن:* ${officeInfo.phone}`,
        verifyLink ? `🌐 *آن لائن تصدیق:* ${verifyLink}` : '',
        `───────────────────────`,
        `*(یہ کمپیوٹر سے تیار کردہ بلٹی ہے، دستخط کی ضرورت نہیں)*`
      ];

  return lines.filter(Boolean).join('\n');
}

/**
 * Universal WhatsApp Sharing & Direct PDF Dispatch
 * 1. Native Capacitor Android: writes PDF to cache directory and dispatches directly to WhatsApp via Capacitor Share.
 * 2. Mobile Web Share API: dispatches PDF File directly without overriding text payload so WhatsApp receives the document.
 * 3. Fallback: downloads PDF to device and prompts user with prefilled WhatsApp message.
 */
export async function shareBiltyPdfOrWhatsApp(options: {
  record: BiltyRecord;
  pdfBlob?: Blob;
  pdfDoc?: jsPDF;
  onSuccess?: () => void;
}): Promise<void> {
  const { record, pdfBlob, pdfDoc, onSuccess } = options;
  const fileName = `Bilty_${record.biltyNo || 'WG-0000'}.pdf`;

  // 1. Native Android Capacitor Sharing (ensures direct PDF file attachment in WhatsApp)
  if (pdfBlob && Capacitor.isNativePlatform()) {
    try {
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res.split(',')[1] || '');
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      const safePdfName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const writeResult = await Filesystem.writeFile({
        path: `exports/${safePdfName}`,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      await Share.share({
        title: `Bilty_${record.biltyNo}.pdf`,
        url: writeResult.uri,
        dialogTitle: 'Share Bilty PDF in WhatsApp',
      });

      if (onSuccess) onSuccess();
      return;
    } catch (capErr: unknown) {
      const capObj = capErr as { name?: string; message?: string };
      if (capObj?.name === 'AbortError' || capObj?.message?.includes('canceled')) {
        return;
      }
      console.warn('Capacitor native share failed, falling back to Web Share API:', capErr);
    }
  }

  // 2. Mobile Web Share API with Direct PDF File
  if (pdfBlob && typeof navigator !== 'undefined') {
    try {
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        // NOTE: Providing ONLY the file (and title) ensures WhatsApp opens with the PDF document attached,
        // rather than dropping the file and only sending text!
        await navigator.share({
          title: `Bilty_${record.biltyNo}.pdf`,
          files: [pdfFile],
        });
        if (onSuccess) onSuccess();
        return;
      }
    } catch (err: unknown) {
      const errObj = err as { name?: string };
      if (errObj?.name === 'AbortError') {
        return; // User cancelled share sheet
      }
      console.warn('Web Share API with file failed, falling back to download + WhatsApp link:', err);
    }
  }

  // 3. Fallback for Desktop / Web without file share support:
  // Auto-download the PDF so user has it immediately, then open WhatsApp
  if (pdfBlob) {
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
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    } catch (saveErr) {
      console.warn('Could not auto-download PDF:', saveErr);
    }
  }

  const textSummary = formatBiltyWhatsAppSummary(record);
  openWhatsAppMessage(textSummary);

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
  lang?: 'ur' | 'en';
  onDownloadedFallback?: () => void;
}): Promise<void> {
  const { pdfBlob, fileName, title, textSummary, lang = 'ur', onDownloadedFallback } = options;

  const outcome = await shareOrDownloadBlob(pdfBlob, fileName, {
    title,
    text: textSummary,
    dialogTitle: title
  });

  if (outcome === 'shared' || outcome === 'cancelled') {
    return;
  }

  if (onDownloadedFallback) {
    onDownloadedFallback();
  }

  const attachNote =
    lang === 'en'
      ? '📄 *(Note: Complete PDF receipt has been downloaded, please attach the file in chat to send.)*'
      : '📄 *(نوٹ: مکمل پی ڈی ایف رسید ڈاؤن لوڈ ہو گئی ہے، برائے مہربانی چیٹ میں فائل اٹیچ کر کے بھیج دیں۔)*';

  openWhatsAppMessage(`${textSummary}\n\n${attachNote}`);
}
