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

    // 2. Frameless enlarged logo extending to 3 edges (top, left side, and Date box border)
    expect(printableSrc).toContain("width: '180px'");
    expect(printableSrc).toContain("minHeight: '132px'");
    expect(printableSrc).toContain("transform: 'scale(1.6)'");
    expect(printableSrc).toContain("border: 'none'");
    expect(printableSrc).not.toContain("borderRadius: '50%'");

    // 3. Complete single-language footer sentence
    expect(printableSrc).toContain('This is a computer-generated Bilty, no signature required');
    expect(printableSrc).toContain('یہ کمپیوٹر سے تیار کردہ بلٹی ہے، دستخط کی ضرورت نہیں');

    // 4. Strict single-language mode without mixed tags or unnecessary dots + Proprietor & ® mark
    expect(printableSrc).toContain('WARRAICH GOODS TRANSPORT COMPANY');
    expect(printableSrc).toContain('PROPRIETOR: ZAHDAN NASAR WARRAICH');
    expect(printableSrc).toContain('پروپرائیٹر: زاہدان نصر وڑائچ');
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

    // 8. Bold Noto Nastaliq Urdu title + Jameel Noori Nastaleeq body & bold Terms
    expect(printableSrc).toContain('fontWeight: 700');
    expect(printableSrc).toContain('Libre Baskerville');
    expect(printableSrc).toContain('IBM Plex Sans');
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

    // Pure crisp white canvas with Double Outer Frame, Pakistani Header Frame, Navy/Gold/Emerald accents, Soft Pastel Row Tints, and Scoped 6% Cargo Watermark
    expect(printableSrc).toContain("const cellBg = '#ffffff'");
    expect(printableSrc).toContain("const pastelSlate = '#f1f5f9'");
    expect(printableSrc).toContain("const pastelMint = '#ecfdf5'");
    expect(printableSrc).toContain("const pastelIvory = '#fffbeb'");
    expect(printableSrc).toContain("const emeraldAccent = '#065f46'");
    expect(printableSrc).toContain("const goldAccent = '#d97706'");
    expect(printableSrc).toContain('bilty-double-inner-frame');
    expect(printableSrc).toContain('pakistani-header-frame');
    expect(printableSrc).toContain('cargo-box-watermark');
    expect(printableSrc).toContain('opacity: 0.06');
    expect(printableSrc).toContain("backgroundColor: '#ffffff'");
    expect(printableSrc).not.toContain('printable-bilty-watermark');
    expect(printableSrc).not.toContain('نگ / بوریاں');
    expect(printableSrc).not.toContain('Pkgs / Bags');
    expect(printableSrc).toContain('freight-top-line');
    expect(printableSrc).toContain("isEn ? 'Freight' : 'کرایہ'");
    expect(printableSrc).toContain("fontSize: isEn ? '16px' : '18.5px'");
    expect(printableSrc).toContain("backgroundColor: '#fef3c7'");
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
    expect(urWithAdvance).toContain('اوکاڑہ بائی پاس، نزدیک 466 چوک، سمندری');
    expect(urWithAdvance).toContain('روپے 45,000');
    expect(urWithAdvance).toContain('پیشگی وصول:* روپے 15,000');
    expect(urWithAdvance).toContain('بقایا رقم:* روپے 30,000');
    expect(urWithAdvance).toContain('یہ کمپیوٹر سے تیار کردہ بلٹی ہے، دستخط کی ضرورت نہیں');
  });

  it('uses single Samundri office, Language-only setup modal, Receiver CNIC, optional Advance, and Remarks in BiltyView', () => {
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
  });
});
