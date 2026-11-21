import JSZip from 'jszip';
import { Capacitor } from '@capacitor/core';
import { shareOrDownloadBlob } from './nativeExport';
import { BiltyAttachmentSlot, BiltyRecord } from '../types';
import { getBiltyVerificationUrl } from './biltyHelpers';
import { getAttachmentsForBilty } from './biltyAttachments';

function dataUrlToBinary(dataUrl: string): { data: Uint8Array; ext: string } {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0]?.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1].toLowerCase() : 'image/jpeg';

  let ext = 'jpg';
  if (mime.includes('png')) ext = 'png';
  else if (mime.includes('webp')) ext = 'webp';
  else if (mime.includes('pdf')) ext = 'pdf';
  else if (mime.includes('mp3') || mime.includes('mpeg')) ext = 'mp3';
  else if (mime.includes('wav')) ext = 'wav';
  else if (mime.includes('ogg')) ext = 'ogg';
  else if (mime.includes('webm')) ext = 'webm';
  else if (mime.includes('m4a') || mime.includes('mp4')) ext = 'm4a';

  const base64Data = parts[1] || '';
  const binaryStr = atob(base64Data);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return { data: bytes, ext };
}

const SLOT_LABELS: Record<BiltyAttachmentSlot, string> = {
  driverPhoto: '01_Driver_Photo',
  driverLicense: '02_Driver_License',
  driverCnic: '03_Driver_CNIC',
  vehiclePhoto: '04_Vehicle_Photo',
  senderPhoto: '05_Sender_Photo',
  senderCnic: '06_Sender_CNIC',
  receiverPhoto: '07_Receiver_Photo',
  receiverCnic: '08_Receiver_CNIC',
  legalDoc: '09_Legal_Document',
  voiceNote: 'Voice_Note'
};

/**
 * Creates a complete ZIP package for a Bilty containing:
 * 1. Official Bilty PDF
 * 2. All attached legal photos (loaded from separated IndexedDB storage or legacy vault)
 * 3. Attached call audio recordings
 * 4. Human-readable text summary of all Bilty details and verification link
 */
export async function generateBiltyLegalZip(options: {
  record: BiltyRecord;
  pdfBlob?: Blob;
}): Promise<Blob> {
  const { record, pdfBlob } = options;
  const zip = new JSZip();
  const biltyNo = record.biltyNo || 'WG-0000';

  // 1. Add official Bilty PDF
  if (pdfBlob) {
    zip.file(`Bilty_${biltyNo}.pdf`, pdfBlob);
  }

  // 2. Add text summary
  const summaryContent = [
    `============================================================`,
    `WARRAICH GOODS TRANSPORT COMPANY - LEGAL EVIDENCE ARCHIVE`,
    `============================================================`,
    `Bilty No:          ${biltyNo}`,
    `Date:              ${record.date || 'N/A'}`,
    `Vehicle No:        ${record.vehicleNo || 'N/A'}`,
    `Driver Name:       ${record.driverName || 'N/A'}`,
    `Driver Mobile:     ${record.mobileNo || 'N/A'}`,
    `Route:             ${record.sendingCity || 'N/A'} -> ${record.receivingCity || 'N/A'}`,
    `------------------------------------------------------------`,
    `Sender (Consignor):`,
    `  Name:            ${record.senderName || record.consignor || 'N/A'}`,
    `  Mobile:          ${record.senderMobile || 'N/A'}`,
    `  CNIC:            ${record.senderCnic || 'N/A'}`,
    `------------------------------------------------------------`,
    `Receiver (Consignee):`,
    `  Name:            ${record.receiverName || record.consignee || 'N/A'}`,
    `  Mobile:          ${record.receiverMobile || 'N/A'}`,
    `------------------------------------------------------------`,
    `Cargo & Financials:`,
    `  Item Description: ${record.itemDescription || 'N/A'}`,
    `  Quantity:        ${record.qty || 'N/A'}`,
    `  Weight:          ${record.weight || 'N/A'}`,
    `  Total Freight:   Rs. ${record.total || 0}`,
    `  Advance Paid:    Rs. ${record.advance || 0}`,
    `  Payable Balance: Rs. ${record.payable || 0}`,
    `------------------------------------------------------------`,
    `Legal Hold:        ${record.legalHold ? 'ENABLED (Protected)' : 'Standard 180-Day Retention'}`,
    `Online Public Verification:`,
    `  URL: ${getBiltyVerificationUrl(record)}`,
    `Archive Generated At: ${new Date().toISOString()}`,
    `============================================================`
  ].join('\n');

  zip.file(`Bilty_${biltyNo}_Summary.txt`, summaryContent);

  // 3. Load isolated attachments (auto-falls back to legacy legalVault if unmigrated)
  const attachments = await getAttachmentsForBilty(record);
  if (attachments.length > 0) {
    const docsFolder = zip.folder('legal_documents');
    const audioFolder = zip.folder('audio_notes');
    let audioIdx = 0;

    for (const att of attachments) {
      if (!att?.dataUrl || !att.dataUrl.startsWith('data:')) continue;
      try {
        const { data, ext } = dataUrlToBinary(att.dataUrl);
        if (att.kind === 'audio') {
          audioIdx++;
          const safeName = (att.name || `Recording_${audioIdx}`).replace(/[^a-zA-Z0-9_-]/g, '_');
          audioFolder?.file(`${safeName}.${ext}`, data);
        } else {
          const baseLabel = SLOT_LABELS[att.slot] || att.slot;
          docsFolder?.file(`${baseLabel}.${ext}`, data);
        }
      } catch (e) {
        console.warn(`Failed adding attachment ${att.id} to zip:`, e);
      }
    }
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

/**
 * Downloads Bilty ZIP package to the user's device
 */
export async function downloadBiltyLegalZip(record: BiltyRecord, pdfBlob?: Blob): Promise<void> {
  const zipBlob = await generateBiltyLegalZip({ record, pdfBlob });
  const fileName = `Bilty_${record.biltyNo || 'WG-0000'}_Legal_Vault.zip`;

  await shareOrDownloadBlob(zipBlob, fileName, {
    title: fileName,
    dialogTitle: fileName,
    preferDownloadOnDesktop: !Capacitor.isNativePlatform()
  });
}
