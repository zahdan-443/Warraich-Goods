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

