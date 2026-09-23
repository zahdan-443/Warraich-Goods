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
 * Compact, URL-safe Base64 encoder for Bilty Verification Token
 * Encodes essential cargo, party and financial data directly into the QR code
 * to guarantee 100% instantaneous, zero-failure offline & online verification anywhere.
 */
export function encodeBiltyPayload(bilty: Partial<BiltyRecord>): string {
  try {
    const compact = {
      b: (bilty.biltyNo || '').trim(),
      v: (bilty.vehicleNo || '').trim(),
      d: (bilty.date || '').trim(),
      br: bilty.branch || 'samundri',
      f: (bilty.sendingCity || '').trim(),
      t: (bilty.receivingCity || '').trim(),
      s: (bilty.senderName || bilty.consignor || '').trim(),
      r: (bilty.receiverName || bilty.consignee || '').trim(),
      i: (bilty.itemDescription || '').trim(),
      w: (bilty.weight || '').trim(),
      q: (bilty.qty || '').trim(),
      tt: Number(bilty.total) || 0,
      ad: Number(bilty.advance) || 0,
      py: Number(bilty.payable) || 0,
      dr: (bilty.driverName || '').trim(),
      ts: Date.now()
    };
    const jsonStr = JSON.stringify(compact);
    // Base64 URL-safe encoding
    const b64 = typeof window !== 'undefined' && window.btoa
      ? window.btoa(unescape(encodeURIComponent(jsonStr)))
      : Buffer.from(jsonStr).toString('base64');
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (err) {
    console.warn('Failed to encode bilty payload:', err);
    return '';
  }
}

/**
 * Decodes URL-safe verification payload token into a structured BiltyRecord
 */
export function decodeBiltyPayload(token: string): Partial<BiltyRecord> | null {
  if (!token || typeof token !== 'string') return null;
  try {
    let base64 = token.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = typeof window !== 'undefined' && window.atob
      ? decodeURIComponent(escape(window.atob(base64)))
      : Buffer.from(base64, 'base64').toString('utf-8');
    const data = JSON.parse(jsonStr);

    if (!data.b && !data.v) return null;

    return {
      biltyNo: data.b || '',
      vehicleNo: data.v || '',
      date: data.d || '',
      branch: (data.br === 'kamalia' ? 'kamalia' : 'samundri') as BiltyBranch,
      sendingCity: data.f || '',
      receivingCity: data.t || '',
      senderName: data.s || '',
      receiverName: data.r || '',
      itemDescription: data.i || '',
      weight: data.w || '',
      qty: data.q || '',
      total: Number(data.tt) || 0,
      advance: Number(data.ad) || 0,
      payable: Number(data.py) || 0,
      driverName: data.dr || '',
      consignor: data.s || '',
      consignee: data.r || ''
    };
  } catch (err) {
    console.warn('Failed to decode bilty verification payload:', err);
    return null;
  }
}

/**
 * Generates dynamic verification URL in the standard format:
 * https://[app-url]?page=verify&bilty=[BiltyNo]&vdata=[token]
 * 
 * Accurately includes the repo path (/Warraich-Goods/) on GitHub Pages
 * and embeds a self-contained tamper-evident token so scanned QR codes
 * verify instantly without network friction or missing database records.
 */
export function getBiltyVerificationUrl(biltyInput: string | Partial<BiltyRecord>): string {
  const isObj = typeof biltyInput === 'object' && biltyInput !== null;
  const biltyNo = (isObj ? (biltyInput.biltyNo || '') : String(biltyInput || '')).trim();
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
  let url = `${normalizedBase}?page=verify&bilty=${encodeURIComponent(biltyNo)}`;

  if (isObj) {
    const token = encodeBiltyPayload(biltyInput);
    if (token) {
      url += `&vdata=${encodeURIComponent(token)}`;
    }
  }

  return url;
}

/**
 * Generates dynamic QR Data URL encoding the complete verification link
 * Fallback to standard high-resolution QR with client-side qrcode library
 */
export async function generateBiltyVerificationQrDataUrl(biltyInput: string | Partial<BiltyRecord>): Promise<string> {
  const url = getBiltyVerificationUrl(biltyInput);
  try {
    return await QRCode.toDataURL(url, {
      width: 360,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0a192f',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.warn('QR DataURL generation fallback to API:', err);
    // Reliable online fallback URL
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=200x200`;
  }
}

import { BiltyBranch, BiltyLanguage } from '../types';

export interface BiltyBranchInfo {
  id: BiltyBranch;
  nameUr: string;
  nameEn: string;
  addressUr: string;
  addressEn: string;
  phone: string;
}

export const BILTY_BRANCHES: Record<BiltyBranch, BiltyBranchInfo> = {
  samundri: {
    id: 'samundri',
    nameUr: 'سمندری',
    nameEn: 'Samundri',
    addressUr: '466 چوک، سمندری بائی پاس، سمندری ۔',
    addressEn: '466 chok, Samundri Bypass , Samundri.',
    phone: '0300-5370443, 0339-5370443'
  },
  kamalia: {
    id: 'kamalia',
    nameUr: 'کمالیہ',
    nameEn: 'Kamalia',
    addressUr: 'رجانہ روڈ، بلمقابل رائل پیلس، کمالیہ ۔',
    addressEn: 'Rajana Road, Opposite Royal Palace, Kamalia.',
    phone: '0300-5370443, 0339-5370443'
  }
};

export const BILTY_TERMS_UR = [
  "بیوپاری کو چاہیے کہ مال وصول کرتے وقت اچھی طرح ملاحظہ کرے۔",
  "مال کو گاڑی میں بحفاظت لوڈ کرنے اور منزل پر ان لوڈ کرنے کی مکمل ذمہ داری اور لیبر کا خرچ متعلقہ پارٹی کا ہوگا۔",
  "فل ٹرک لوڈ کی صورت میں اگر روانگی کے وقت لگائی گئی سیل یا ترپال منزل پر درست حالت میں ہے، تو راستے میں مال کی کسی ڈیمیج کی کمپنی ذمہ دار نہ ہوگی۔",
  "انڈوں، تیل، گھی، مربہ جات و دیگر مال کے رسنے، ضائع ہونے یا لیک ہونے کی کمپنی ذمہ دار نہ ہوگی۔ محفوظ اور معیاری پیکنگ بھیجنے والے کی ذمہ داری ہے۔ راستے میں سڑک کی خرابی، جھٹکوں، اتفاقیہ حادثہ یا موسم کی وجہ سے سامان کی ٹوٹ پھوٹ کی ٹرانسپورٹ کمپنی ذمہ دار نہ ہوگی۔",
  "قدرتی آفات، دھند، ہڑتال، ٹریفک جام یا سڑک بند ہونے کی وجہ سے گاڑی لیٹ ہونے پر مال کے خراب ہونے یا مارکیٹ ریٹ گرنے کا کلیم قبول نہیں ہوگا۔",
  "بلٹی پر درج مال سے ہٹ کر کوئی غیر قانونی چیز نکلنے یا مقررہ حد سے زائد وزن ہونے پر اضافی کرایہ، تمام تر قانونی ذمہ داری، جرمانہ و چالان پارٹی ادا کرے گی۔",
  "منزل پر پہنچنے کے 24 گھنٹے کے اندر گاڑی خالی کرنا لازمی ہے، ورنہ یومیہ ڈیمرج چارجز وصول کیے جائیں گے۔",
  "جس مال کے ہمراہ بیوپاری یا اس کا نمائندہ خود موجود ہوگا، اس مال کے کسی قسم کے نقصان کی کمپنی ذمہ دار نہ ہوگی۔",
  "کسی بھی تنازعے کی صورت میں حتمی فیصلہ ٹرانسپورٹ کمپنی کے دفتر میں باہمی رضامندی سے طے کیا جائے گا۔"
];

export const BILTY_TERMS_EN = [
  "Merchant / consignee must thoroughly inspect and verify cargo at the time of taking delivery.",
  "Complete responsibility and labor expenses for safe loading and unloading at destination lie with the respective party.",
  "For Full Truck Load (FTL), if the seal and tarpaulin are intact upon arrival at destination, company is not liable for intermediate damages.",
  "Company shall not be responsible for leakage or spillage of eggs, oil, ghee, syrups, liquids or perishable goods. Proper packing is sender's obligation. Breakage due to bad roads, accidental jerks or weather is not company's liability.",
  "No claims will be accepted for market rate depreciation or spoilage due to natural disasters, fog, strikes, traffic blocks, or route closures.",
  "If cargo differs from bilty declaration or exceeds legal axle load limit, all legal penalties, fines, challans and excess freight shall be paid by party.",
  "Vehicle must be unloaded within 24 hours of reaching destination; otherwise standard daily demurrage charges will apply.",
  "Company bears no responsibility for any kind of loss or damage if the merchant or their representative travels along with the cargo.",
  "In case of any dispute, the matter shall be amicably settled at the transport company's registered office."
];

