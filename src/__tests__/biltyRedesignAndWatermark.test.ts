import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { formatBiltyWhatsAppSummary } from '../utils/pdfHelper';
import { sanitizeContactOrCnic } from '../utils/biltyHelpers';
import type { BiltyRecord } from '../types';

const readWorkspaceFile = (relPath: string): string => {
  return fs.readFileSync(path.resolve(process.cwd(), relPath), 'utf8');
};

describe('Warraich Goods Bilty PDF Edits, Watermark Sync & BiltyView Form Controls', () => {
  it('enforces all 9 PDF layout edits, frameless enlarged logo, pure language separation, and 2x2 QR + 3 signatures in PrintableBilty', () => {
    const printableSrc = readWorkspaceFile('src/components/PrintableBilty.tsx');

    // 1. Consignee CNIC replaces Receiving Point
    expect(printableSrc).toContain('Receiver CNIC :');
    expect(printableSrc).toContain('record.receiverCnic');
    expect(printableSrc).not.toContain('Receiving Point');
    expect(printableSrc).not.toContain('ریسیونگ پوائنٹ');

    // 2. Clean double border + gradient strip header enclosing directional 3-column layout, frameless centered official logo, NTN above company name + solid hairline + address, Proprietor + 2 stacked phones
    expect(printableSrc).toContain('header-three-column-grid');
    expect(printableSrc).toContain('header-identity-col');
    expect(printableSrc).toContain('header-logo-inside-frame');
    expect(printableSrc).toContain('header-proprietor-col');
    expect(printableSrc).toContain('biltyOfficialIconData');
    expect(printableSrc).toContain("border: 'none'");
    expect(printableSrc).toContain("backgroundColor: 'transparent'");
    expect(printableSrc).not.toContain("borderRadius: '50%'");
    expect(printableSrc).not.toContain('بسم اللہ');
    expect(printableSrc).toContain('ntn-corner-stamp');
    expect(printableSrc).toContain('این ٹی این نمبر:');
    expect(printableSrc).toContain("unicodeBidi: 'isolate'");
    expect(printableSrc).toContain('company-masthead-title');
    expect(printableSrc).toContain('company-name-hairline');
    expect(printableSrc).toContain('header-office-address');
    expect(printableSrc).toContain('proprietor-clean-line');
    expect(printableSrc).toContain('header-phone-stack');
    expect(printableSrc).toContain('header-phone-line-');
    expect(printableSrc).toContain('truck-art-ribbon');
    // NTN must appear before company masthead title inside the Identity column
    expect(printableSrc.indexOf('ntn-corner-stamp')).toBeLessThan(printableSrc.indexOf('company-masthead-title'));
    expect(printableSrc.indexOf('company-masthead-title')).toBeLessThan(printableSrc.indexOf('company-name-hairline'));
    expect(printableSrc.indexOf('company-name-hairline')).toBeLessThan(printableSrc.indexOf('header-office-address'));
    // Header frame uses clean double border + gradient strip only (no corner step-brackets or top-center diamond crest)
    expect(printableSrc).not.toContain('78 13');
    expect(printableSrc).not.toContain('20 20');

    // 3. Complete single-language footer sentence
    expect(printableSrc).toContain('This is a computer-generated Bilty, no signature required');
    expect(printableSrc).toContain('یہ کمپیوٹر سے تیار کردہ بلٹی ہے، دستخط کی ضرورت نہیں');

    // 4. Strict single-language mode without mixed tags or unnecessary dots + Proprietor & ® mark
    expect(printableSrc).toContain('WARRAICH GOODS TRANSPORT COMPANY');
    expect(printableSrc).toContain('PROPRIETOR:');
    expect(printableSrc).toContain('ZAHDAN NASAR WARRAICH');
    expect(printableSrc).toContain('پروپرائیٹر:');
    expect(printableSrc).toContain('زاہدان نصر وڑائچ');
    expect(printableSrc).toContain('®');
    expect(printableSrc).not.toContain('TRUSTED LOGISTICS & TRANSPORT SERVICE');
    expect(printableSrc).not.toContain('معتبر لاجسٹکس اور ٹرانسپورٹ سروس');
    expect(printableSrc).not.toContain('(REGD)');
    expect(printableSrc).not.toContain('Mo.');
    expect(printableSrc).not.toContain('D.L.');
    expect(printableSrc).not.toContain('Bilty No.');
    expect(printableSrc).not.toContain('Truck No.');
    expect(printableSrc).not.toContain('SERVICE.');

    // 5. Conditional Advance & Pending when advance > 0, Total Freight only when advance === 0
    expect(printableSrc).toContain('const hasAdvance = advanceAmt > 0');
    expect(printableSrc).toContain('Advance Paid');
    expect(printableSrc).toContain('Pending Amount');
    expect(printableSrc).toContain('پیشگی وصول');
    expect(printableSrc).toContain('بقایا رقم');

    // 6. Full-width Remarks replacing Delivery At
    expect(printableSrc).toContain('Remarks :');
    expect(printableSrc).toContain('ریمارکس :');
    expect(printableSrc).not.toContain('Delivery At');
    expect(printableSrc).not.toContain('مقامِ ترسیل');

    // 7. 2x2 Edge-to-Edge QR + 3-party Signature Grid (Driver, Sender, Receiver) without Zahdan / For Warraich Goods
    expect(printableSrc).toContain("width: '100%'");
    expect(printableSrc).toContain("height: '100%'");
    expect(printableSrc).toContain('Driver Signature');
    expect(printableSrc).toContain('Sender Signature');
    expect(printableSrc).toContain('Receiver Signature');
    expect(printableSrc).toContain('دستخط ڈرائیور');
    expect(printableSrc).toContain('دستخط بھیجنے والا');
    expect(printableSrc).toContain('دستخط وصول کنندہ');
    expect(printableSrc).not.toContain('ZahdanSignatureSvg');
    expect(printableSrc).not.toContain('Zahdan Nasr');
    expect(printableSrc).not.toContain('For WARRAICH GOODS');

    // 8. Bold Akbar + Noto Nastaliq Urdu title, Cinzel + Libre Baskerville English title, Jameel Noori Nastaleeq body & bold Terms
    expect(printableSrc).toContain('fontWeight: 700');
    expect(printableSrc).toContain('Cinzel');
    expect(printableSrc).toContain('Libre Baskerville');
    expect(printableSrc).toContain('IBM Plex Sans');
    expect(printableSrc).toContain('Akbar');
    expect(printableSrc).toContain('Noto Nastaliq Urdu');
    expect(printableSrc).toContain('Jameel Noori Nastaleeq');
    expect(printableSrc).not.toContain('Terms & Conditions (Warraich');
    expect(printableSrc).not.toContain('شرائط و ضوابط (وڑائچ');

    // 9. Driver 4-box row placed after Row A (Truck No) and BEFORE Row C (From | To)
    const rowAPos = printableSrc.indexOf('Row A: Bilty No | Truck No | Date');
    const rowBPos = printableSrc.indexOf('Row B: Driver Details 4 Boxes');
    const rowCPos = printableSrc.indexOf('Row C: From | To');
    expect(rowAPos).toBeGreaterThan(-1);
    expect(rowBPos).toBeGreaterThan(rowAPos);
    expect(rowCPos).toBeGreaterThan(rowBPos);

    // 10. Unified Single A4 Palette (Warm Ivory, Navy Blue, Maroon, Gold), Truck-Art Gradient Strips, and Scoped Transparent Cargo Watermark
    expect(printableSrc).toContain('UNIFIED_BILTY_PALETTE');
    expect(printableSrc).not.toContain('BILTY_COLOR_THEMES');
    expect(printableSrc).toContain("paperBg: '#fff9f0'");
    expect(printableSrc).toContain("primaryColor: '#1a477a'");
    expect(printableSrc).toContain("maroonAccent: '#881337'");
    expect(printableSrc).toContain("goldAccent: '#d97706'");
    expect(printableSrc).toContain('bilty-colored-canvas');
    expect(printableSrc).toContain('headerStripGrad');
    expect(printableSrc).toContain('remarksGrad');
    expect(printableSrc).toContain('bilty-double-inner-frame');
    expect(printableSrc).toContain('pakistani-header-frame');
    expect(printableSrc).toContain('cargo-box-watermark');
    expect(printableSrc).toContain('opacity: 0.09');
    expect(printableSrc).not.toContain('printable-bilty-watermark');
    expect(printableSrc).not.toContain('نگ / بوریاں');
    expect(printableSrc).not.toContain('Pkgs / Bags');
    expect(printableSrc).toContain('freight-top-line');
    expect(printableSrc).toContain("isEn ? 'Freight' : 'کرایہ'");
    expect(printableSrc).toContain("fontSize: isEn ? '16px' : '18.5px'");
    expect(printableSrc).toContain('qr-purpose-caption');
    expect(printableSrc).toContain('Scan to verify Bilty');
    expect(printableSrc).toContain('تصدیقِ بلٹی کیلئے اسکین کریں');
    expect(printableSrc).toContain('print-color-adjust: exact !important');
  });

  it('supports custom empty fallback in sanitizeContactOrCnic for pure Urdu output', () => {
    expect(sanitizeContactOrCnic('', '—')).toBe('—');
    expect(sanitizeContactOrCnic('0000', '—')).toBe('—');
    expect(sanitizeContactOrCnic('33301-1234567-1', '—')).toBe('33301-1234567-1');
  });

  it('renders conditional Advance/Pending in WhatsApp summary only when advance > 0 and keeps single-language output', () => {
    const baseRecord: BiltyRecord = {
      id: 2001,
      biltyNo: 'WG-1201',
      date: '16 Nov, 2026',
      vehicleNo: 'LHR-9090',
      driverName: 'Tariq Mahmood',
      mobileNo: '0300-1234567',
      driverCnic: '33301-1234567-1',
      driverLicense: 'FSD-4455',
      sendingCity: 'Samundri',
      receivingCity: 'Karachi',
      senderName: 'Al-Madina Mills',
      senderMobile: '0300-1112233',
      receiverName: 'Karachi Traders',
      receiverMobile: '0321-4445566',
      senderCnic: '33301-7654321-3',
      receiverCnic: '42101-1122334-5',
      qty: '120 Bags',
      itemDescription: 'Cotton Bales',
      weight: '6000',
      total: 45000,
      advance: 15000,
      payable: 30000,
      language: 'en'
    };

    const enWithAdvance = formatBiltyWhatsAppSummary(baseRecord);
    expect(enWithAdvance).toContain('WARRAICH GOODS TRANSPORT COMPANY®');
    expect(enWithAdvance).toContain('Proprietor:* Zahdan Nasar Warraich');
    expect(enWithAdvance).toContain('Okara Bypass, Near 466 Chock, Samundri');
    expect(enWithAdvance).toContain('Total Freight:* Rs 45,000');
    expect(enWithAdvance).toContain('Advance Paid:* Rs 15,000');
    expect(enWithAdvance).toContain('Pending Amount:* Rs 30,000');
    expect(enWithAdvance).toContain('This is a computer-generated Bilty, no signature required');

    const enZeroAdvance = formatBiltyWhatsAppSummary({
      ...baseRecord,
      advance: 0,
      payable: 45000
    });
    expect(enZeroAdvance).toContain('Total Freight:* Rs 45,000');
    expect(enZeroAdvance).not.toContain('Advance Paid');
    expect(enZeroAdvance).not.toContain('Pending Amount');

    const urWithAdvance = formatBiltyWhatsAppSummary({
      ...baseRecord,
      language: 'ur'
    });
    expect(urWithAdvance).toContain('وڑائچ گڈز ٹرانسپورٹ کمپنی®');
    expect(urWithAdvance).toContain('پروپرائیٹر:* زاہدان نصر وڑائچ');
    expect(urWithAdvance).toContain('اوکاڑہ بائی پاس، نزد 466 چوک، سمندری');
    expect(urWithAdvance).toContain('روپے 45,000');
    expect(urWithAdvance).toContain('پیشگی وصول:* روپے 15,000');
    expect(urWithAdvance).toContain('بقایا رقم:* روپے 30,000');
    expect(urWithAdvance).toContain('یہ کمپیوٹر سے تیار کردہ بلٹی ہے، دستخط کی ضرورت نہیں');
  });

  it('uses single Samundri office, Language-only setup modal, Receiver CNIC, optional Advance, and Remarks in BiltyView without multi-color selector', () => {
    const biltyViewSrc = readWorkspaceFile('src/components/views/BiltyView.tsx');
    const helpersSrc = readWorkspaceFile('src/utils/biltyHelpers.ts');

    expect(helpersSrc).toContain('Okara Bypass, Near 466 Chock, Samundri');
    expect(helpersSrc).not.toContain('Kamalia');
    expect(biltyViewSrc).not.toContain('Kamalia');
    expect(biltyViewSrc).not.toContain('کمالیہ');
    expect(biltyViewSrc).toContain('بلٹی کی زبان منتخب کریں');
    expect(biltyViewSrc).not.toContain('Select Branch & Language');

    expect(biltyViewSrc).toContain('preloadBiltyPdfAssets');
    expect(biltyViewSrc).toContain('cardDataUrl={preloadedAssets.card}');
    expect(biltyViewSrc).toContain('logoDataUrl={preloadedAssets.logo}');
    expect(biltyViewSrc).toContain('Receiver CNIC');
    expect(biltyViewSrc).toContain('Driver CNIC');
    expect(biltyViewSrc).toContain('Driver License No');
    expect(biltyViewSrc).toContain('Advance on Receipt (Optional)');
    expect(biltyViewSrc).toContain('Remarks (Optional)');
    expect(biltyViewSrc).not.toContain('Delivery At (Optional)');

    // Bilty archive list/KPIs remain free of financial settlement clutter
    expect(biltyViewSrc).not.toContain('paymentFilter');
    expect(biltyViewSrc).not.toContain('Balance Due');
    expect(biltyViewSrc).not.toContain('To-Pay');
    expect(biltyViewSrc).not.toContain('ٹو پے (بقایا)');

    // Multi-color Pink/Yellow/Green selector removed for single unified A4 Bilty design
    expect(biltyViewSrc).not.toContain('bilty-color-selector');
    expect(biltyViewSrc).not.toContain('گلابی کاپی');
    expect(biltyViewSrc).not.toContain('پیلی کاپی');
    expect(biltyViewSrc).not.toContain('سبز کاپی');
  });
});
