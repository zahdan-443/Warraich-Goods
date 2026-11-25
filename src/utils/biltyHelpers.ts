/**
 * Bilty Helper Utilities for Dynamic QR Verification & Data Sanitization
 */
import QRCode from 'qrcode';
import { BiltyRecord } from '../types';

/**
 * Returns clean sanitized value or "N/A" if empty or placeholder "0000" / "0"
 */
export function sanitizeContactOrCnic(val?: string | null, fallback = 'N/A'): string {
  if (!val) return fallback;
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
    return fallback;
  }
  return trimmed;
}

/**
 * Automatically formats Pakistani mobile numbers with a separator after 4 operator code digits:
 * e.g. "03001234567" -> "0300-1234567"
 * Also gracefully normalizes if user typed a slash or hyphen: "0300/1234567" -> "0300-1234567"
 * Caps at 11 digits (4 operator digits + 7 subscriber digits).
 */
export function formatBiltyMobile(val: string): string {
  if (!val) return '';
  // Convert Eastern Arabic / Urdu numerals to Western digits if pasted
  const westernVal = val.replace(/[٠-٩۰-۹]/g, (d) => String(d.charCodeAt(0) & 0xf));
  // Keep only digits
  let digits = westernVal.replace(/\D/g, '');
  if (digits.startsWith('92')) {
    digits = '0' + digits.slice(2);
  }
  // Max 11 digits in Pakistan mobile format (03XX-XXXXXXX)
  digits = digits.slice(0, 11);

  if (digits.length <= 4) {
    return digits;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

/**
 * Converts Eastern Arabic / Urdu numerals to Western ASCII digits.
 */
export function toWesternDigits(val: string): string {
  return String(val || '').replace(/[٠-٩۰-۹]/g, (d) => String(d.charCodeAt(0) & 0xf));
}

/**
 * Normalizes a Bilty number and preserves 4-digit padding for <10000,
 * full 5+ digits (WG-10000, WG-10001, ...) without truncation, and optional branch code (WG-LHR-1001).
 */
export function formatStrictBiltyNumber(val: string | number, branchCode?: string): string {
  if (!val && val !== 0) return 'WG-1001';
  const western = toWesternDigits(String(val)).trim().toUpperCase().replace(/\s+/g, '');
  if (!western) return 'WG-1001';

  const explicitCode = String(branchCode || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3);
  const embeddedMatch = western.match(/^WG-([A-Z]{2,3})-(\d+)$/);
  const resolvedCode =
    explicitCode && explicitCode !== 'WG' && explicitCode !== 'HEA'
      ? explicitCode
      : embeddedMatch && embeddedMatch[1] !== 'WG'
      ? embeddedMatch[1]
      : '';

  const trailingMatch = western.match(/(\d+)$/);
  const digits = trailingMatch ? trailingMatch[1] : western.replace(/\D/g, '');
  if (!digits) {
    return resolvedCode ? `WG-${resolvedCode}-1001` : 'WG-1001';
  }

  const parsed = parseInt(digits, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return resolvedCode ? `WG-${resolvedCode}-1001` : 'WG-1001';
  }
  const formattedDigits = parsed > 9999 ? String(parsed) : String(parsed).padStart(4, '0');
  return resolvedCode ? `WG-${resolvedCode}-${formattedDigits}` : `WG-${formattedDigits}`;
}

/**
 * Validates Bilty verification number formats (including 4-digit, 5+ digit, and branch-coded WG-LHR-1001).
 */
export function isValidBiltyVerifyFormat(rawTerm: string): boolean {
  const clean = toWesternDigits(String(rawTerm || '')).trim().toUpperCase().replace(/\s+/g, '');
  return (
    /^(?:WG|WGT|AH)-(?:[A-Z]{2,3}-)?\d{4,}$/.test(clean) ||
    /^WG-2026-\d{4,}$/.test(clean) ||
    /^(?:[A-Z]{2,3}-)?\d{4,}$/.test(clean)
  );
}

/**
 * Builds ordered Firestore document ID candidates for public Bilty verification lookup.
 * Supports WG-1001, WG-10001+, WG-LHR-1001, WG-LHR-10001, and legacy prefixes.
 */
export function buildBiltyVerificationCandidates(rawTerm: string): string[] {
  const clean = toWesternDigits(String(rawTerm || '')).trim().toUpperCase().replace(/\s+/g, '');
  if (!clean) return [];

  const cleanAlpha = clean.replace(/[^A-Z0-9]/g, '');
  const candidates: string[] = [clean, cleanAlpha];

  const branchCodeDigits = clean.match(/^([A-Z]{2,3})-(\d+)$/);
  if (branchCodeDigits && !['WG', 'WGT', 'AH'].includes(branchCodeDigits[1])) {
    candidates.push(`WG-${branchCodeDigits[1]}-${branchCodeDigits[2]}`);
    candidates.push(`WG-${branchCodeDigits[1]}-${branchCodeDigits[2].padStart(4, '0')}`);
  }

  if (/^\d+$/.test(clean)) {
    const padded = clean.length >= 4 ? clean : clean.padStart(4, '0');
    candidates.push(`WG-${clean}`);
    candidates.push(`WG-${padded}`);
    candidates.push(`WG-2026-${padded}`);
    candidates.push(`WGT-${clean}`);
    candidates.push(`AH-${clean}`);
  } else {
    if (!clean.startsWith('WG-') && !clean.startsWith('WGT-') && !clean.startsWith('AH-')) {
      candidates.push(`WG-${clean}`);
      candidates.push(`WGT-${clean}`);
      candidates.push(`AH-${clean}`);
    }
  }

  return Array.from(new Set(candidates.filter(Boolean)));
}

/**
 * Official canonical base URL for public bilty verification on company website
 */
export const OFFICIAL_APP_BASE_URL = 'https://warraichgoods.eu.cc/';

/**
 * Generates official verification URL in the required secure format:
 * https://warraichgoods.eu.cc/?page=verify&bilty={BILTY_NUMBER}
 * 
 * Contains ONLY the company website verification URL and normalized bilty number.
 * Excludes party details, financial amounts, Base64 records, or vdata tokens.
 */
export function getBiltyVerificationUrl(biltyInput: string | Partial<BiltyRecord>): string {
  const isObj = typeof biltyInput === 'object' && biltyInput !== null;
  const rawBiltyNo = (isObj ? (biltyInput.biltyNo || '') : String(biltyInput || '')).trim();
  const normalizedNo = rawBiltyNo.toUpperCase();

  return `https://warraichgoods.eu.cc/?page=verify&bilty=${encodeURIComponent(normalizedNo)}`;
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
    console.warn('QR DataURL generation fallback:', err);
    try {
      return await QRCode.toDataURL(url, { margin: 1 });
    } catch {
      return '';
    }
  }
}

import { BiltyBranch } from '../types';

export interface BiltyBranchInfo {
  id: BiltyBranch;
  nameUr: string;
  nameEn: string;
  addressUr: string;
  addressEn: string;
  phone: string;
}

const HEAD_OFFICE_BRANCH_INFO: BiltyBranchInfo = {
  id: 'head',
  nameUr: 'سمندری',
  nameEn: 'Samundri',
  addressUr: 'اوکاڑہ بائی پاس، نزد 466 چوک، سمندری',
  addressEn: 'Okara Bypass, Near 466 Chock, Samundri',
  phone: '0300-5370443, 0339-5370443'
};

export const BILTY_BRANCHES: Record<'head' | 'samundri', BiltyBranchInfo> = {
  head: HEAD_OFFICE_BRANCH_INFO,
  samundri: {
    ...HEAD_OFFICE_BRANCH_INFO,
    id: 'samundri'
  }
};

export const BILTY_TERMS_UR = [
  "بیوپاری کو چاہیے کہ مال وصول کرتے وقت اچھی طرح ملاحظہ کرے",
  "مال کو گاڑی میں بحفاظت لوڈ کرنے اور منزل پر ان لوڈ کرنے کی مکمل ذمہ داری اور لیبر کا خرچ متعلقہ پارٹی کا ہوگا",
  "فل ٹرک لوڈ کی صورت میں اگر روانگی کے وقت لگائی گئی سیل یا ترپال منزل پر درست حالت میں ہے، تو راستے میں مال کی کسی ڈیمیج کی کمپنی ذمہ دار نہ ہوگی",
  "انڈوں، تیل، گھی، مربہ جات و دیگر مال کے رسنے، ضائع ہونے یا لیک ہونے کی کمپنی ذمہ دار نہ ہوگی اور محفوظ پیکنگ بھیجنے والے کی ذمہ داری ہے",
  "قدرتی آفات، دھند، ہڑتال، ٹریفک جام یا سڑک بند ہونے کی وجہ سے گاڑی لیٹ ہونے پر مال کے خراب ہونے یا مارکیٹ ریٹ گرنے کا کلیم قبول نہیں ہوگا",
  "بلٹی پر درج مال سے ہٹ کر کوئی غیر قانونی چیز نکلنے یا مقررہ حد سے زائد وزن ہونے پر اضافی کرایہ، جرمانہ و چالان پارٹی ادا کرے گی",
  "منزل پر پہنچنے کے 24 گھنٹے کے اندر گاڑی خالی کرنا لازمی ہے، ورنہ یومیہ ڈیمرج چارجز وصول کیے جائیں گے",
  "جس مال کے ہمراہ بیوپاری یا اس کا نمائندہ خود موجود ہوگا، اس مال کے کسی قسم کے نقصان کی کمپنی ذمہ دار نہ ہوگی",
  "کسی بھی تنازعے کی صورت میں حتمی فیصلہ ٹرانسپورٹ کمپنی کے دفتر میں باہمی رضامندی سے طے کیا جائے گا"
];

export const BILTY_TERMS_EN = [
  "Merchant / consignee must thoroughly inspect and verify cargo at the time of taking delivery",
  "Complete responsibility and labor expenses for safe loading and unloading at destination lie with the respective party",
  "For Full Truck Load (FTL), if the seal and tarpaulin are intact upon arrival at destination, the company is not liable for intermediate damages",
  "Company shall not be responsible for leakage or spillage of eggs, oil, ghee, syrups, liquids, or perishable goods; proper packing is the sender's obligation",
  "No claims will be accepted for market rate depreciation or spoilage due to natural disasters, fog, strikes, traffic blocks, or route closures",
  "If cargo differs from bilty declaration or exceeds legal axle load limits, all legal penalties, fines, challans, and excess freight shall be paid by the party",
  "Vehicle must be unloaded within 24 hours of reaching destination; otherwise standard daily demurrage charges will apply",
  "Company bears no responsibility for any kind of loss or damage if the merchant or their representative travels along with the cargo",
  "In case of any dispute, the matter shall be amicably settled at the transport company's registered office"
];

