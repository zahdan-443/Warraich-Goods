import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { formatBiltyWhatsAppSummary } from '../utils/pdfHelper';
import type { BiltyRecord } from '../types';

const readWorkspaceFile = (relPath: string): string => {
  return fs.readFileSync(path.resolve(process.cwd(), relPath), 'utf8');
};

describe('Warraich Goods Redesigned Bilty Template, Watermark Sync & BiltyView Declutter', () => {
  it('enforces all 7 template revisions and transparent warraich-card.png watermark in PrintableBilty', () => {
    const printableSrc = readWorkspaceFile('src/components/PrintableBilty.tsx');

    // Required additions / replacements
    expect(printableSrc).toContain('NTN: 7779394-1');
    expect(printableSrc).toContain('WARRAICH GOODS TRANSPORT COMPANY (REGD.)');
    expect(printableSrc).toContain('TRUSTED LOGISTICS & TRANSPORT SERVICE.');
    expect(printableSrc).toContain('Driver CNIC No.');
    expect(printableSrc).toContain('D.L. No.');
    expect(printableSrc).toContain('This is a Computer Generated Bilty');

    // Semi-transparent cell backing + exact print color adjust so warraich-card.png shows in Preview, Print & PDF
    expect(printableSrc).toContain('rgba(255, 255, 255, 0.72)');
    expect(printableSrc).toContain('warraich-card.png');
    expect(printableSrc).toContain('print-color-adjust: exact !important');

    // Removed elements per user instructions
    expect(printableSrc).not.toContain('CONSIGNOR COPY');
    expect(printableSrc).not.toContain("AT OWNER'S RISK");
    expect(printableSrc).not.toContain('Order By');
    expect(printableSrc).not.toContain('Rate Per Ton');
    expect(printableSrc).not.toContain('Rate (Rs)');
    expect(printableSrc).not.toContain('BALAJI');
    expect(printableSrc).not.toContain('GSTIN');
    expect(printableSrc).not.toContain('SGST');
    expect(printableSrc).not.toContain('CGST');
    expect(printableSrc).not.toContain('Bank Details');
    expect(printableSrc).not.toContain('Advance Paid');
    expect(printableSrc).not.toContain('Balance Payable');
    expect(printableSrc).not.toContain('TO BE PAID');
    expect(printableSrc).not.toContain('PAID IN FULL');
  });

  it('preloads and decodes background assets cleanly in pdfHelper and removes settlement lines from WhatsApp summary', () => {
    const pdfHelperSrc = readWorkspaceFile('src/utils/pdfHelper.ts');
    expect(pdfHelperSrc).toContain('export async function preloadBiltyPdfAssets');
    expect(pdfHelperSrc).toContain('img.decode');

    const recordWithFreight: BiltyRecord = {
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
      qty: '120 Bags',
      itemDescription: 'Cotton Bales',
      weight: '6000',
      total: 45000,
      advance: 15000,
      payable: 30000
    };

    const summaryWithFreight = formatBiltyWhatsAppSummary(recordWithFreight);
    expect(summaryWithFreight).toContain('WARRAICH GOODS TRANSPORT COMPANY (REGD.)');
    expect(summaryWithFreight).toContain('NTN:* 7779394-1');
    expect(summaryWithFreight).toContain('*(This is a Computer Generated Bilty)*');
    expect(summaryWithFreight).toContain('Rs 45,000');
    expect(summaryWithFreight).not.toContain('Advance');
    expect(summaryWithFreight).not.toContain('Payable');
    expect(summaryWithFreight).not.toContain('پیشگی');
    expect(summaryWithFreight).not.toContain('بقایا');

    const summaryZeroFreight = formatBiltyWhatsAppSummary({
      ...recordWithFreight,
      total: 0
    });
    expect(summaryZeroFreight).not.toContain('Freight');
  });

  it('removes payment settlement UI from BiltyView while keeping Dispatch stats, Driver CNIC/DL inputs, and asset sync', () => {
    const biltyViewSrc = readWorkspaceFile('src/components/views/BiltyView.tsx');

    expect(biltyViewSrc).toContain('preloadBiltyPdfAssets');
    expect(biltyViewSrc).toContain('cardDataUrl={preloadedAssets.card}');
    expect(biltyViewSrc).toContain('logoDataUrl={preloadedAssets.logo}');
    expect(biltyViewSrc).toContain('Driver CNIC No.');
    expect(biltyViewSrc).toContain('Driver License (D.L. No.)');
    expect(biltyViewSrc).toContain('Delivery At (Optional)');
    expect(biltyViewSrc).toContain('Remark (Optional)');

    // Settlement UI elements must be absent from Bilty section
    expect(biltyViewSrc).not.toContain('paymentFilter');
    expect(biltyViewSrc).not.toContain('Balance Due');
    expect(biltyViewSrc).not.toContain('Total Freight (Rs)');
    expect(biltyViewSrc).not.toContain('Advance Paid (Rs)');
    expect(biltyViewSrc).not.toContain('To-Pay');
    expect(biltyViewSrc).not.toContain('ٹو پے (بقایا)');
  });
});
