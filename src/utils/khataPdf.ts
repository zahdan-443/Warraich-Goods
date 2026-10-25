/**
 * Driver Dost - Digital Khata PDF Generator
 * 
 * Generates high-fidelity PDF statements and summaries using jsPDF and jspdf-autotable.
 * Adheres strictly to policies:
 * - Never prints "Warraich Goods" (uses "Driver Dost" + optional business name)
 * - Zero occurrences of restricted terms
 * - Clean, professional layout for Pakistani transport & logistics businesses
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LedgerAccount, LedgerEntry } from '../types';
import { calculateAccountBalance, formatPhoneForDisplay } from './ledgerStorage';

export interface GenerateAccountStatementOptions {
  account: LedgerAccount;
  entries: LedgerEntry[];
  businessName?: string;
  startDate?: string;
  endDate?: string;
}

export interface GenerateAllAccountsSummaryOptions {
  accounts: LedgerAccount[];
  allEntries: LedgerEntry[];
  businessName?: string;
}

export function generateAccountStatementPdf({
  account,
  entries,
  businessName,
  startDate,
  endDate
}: GenerateAccountStatementOptions): { doc: jsPDF; filename: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const appTitle = businessName && businessName.trim() ? `${businessName.trim()} | Driver Dost` : 'Driver Dost - Digital Khata';
  const cleanPhone = formatPhoneForDisplay(account.phone);
  const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Filter entries if date range is specified
  const filteredEntries = entries.filter(e => {
    if (startDate && e.date < startDate) return false;
    if (endDate && e.date > endDate) return false;
    return true;
  });

  // Calculate balance
  const { balance, totalGave, totalGot } = calculateAccountBalance(account, filteredEntries);

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 595, 80, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(appTitle, 40, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`Account Statement • Generated: ${nowStr}`, 40, 62);

  // Account Details Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(40, 95, 515, 75, 4, 4, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(account.name, 55, 118);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Type: ${account.kind === 'broker' ? 'Broker / Commission Agent' : 'Customer / Party'}`, 55, 136);
  if (cleanPhone) {
    doc.text(`Phone: ${cleanPhone}`, 55, 152);
  }
  if (account.dueDate) {
    doc.text(`Due Date: ${account.dueDate}`, 220, 152);
  }

  // Summary Metrics inside top box
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Current Net Balance:', 390, 118);

  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  if (balance > 0) {
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text(`PKR ${balance.toLocaleString('en-US')}`, 390, 138);
    doc.setFontSize(8);
    doc.text('(Receivable / You will get)', 390, 152);
  } else if (balance < 0) {
    doc.setTextColor(225, 29, 72); // rose-600
    doc.text(`PKR ${Math.abs(balance).toLocaleString('en-US')}`, 390, 138);
    doc.setFontSize(8);
    doc.text('(Payable / You will give)', 390, 152);
  } else {
    doc.setTextColor(71, 85, 105);
    doc.text('PKR 0', 390, 138);
    doc.setFontSize(8);
    doc.text('(Settled)', 390, 152);
  }

  // Running balance table calculation
  let runningBal = (account.openingDirection === 'get' ? 1 : -1) * (Number(account.openingAmount) || 0);

  // Sort chronological for statement
  const sortedChronological = [...filteredEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const tableRows: any[] = [];

  // Opening balance row
  if (account.openingAmount > 0) {
    tableRows.push([
      account.createdAt ? account.createdAt.split('T')[0] : 'Opening',
      `Opening Balance (${account.openingDirection === 'get' ? 'Receivable' : 'Advance/Payable'})`,
      account.openingDirection === 'get' ? account.openingAmount.toLocaleString('en-US') : '-',
      account.openingDirection === 'give' ? account.openingAmount.toLocaleString('en-US') : '-',
      runningBal.toLocaleString('en-US')
    ]);
  }

  for (const entry of sortedChronological) {
    const amt = Number(entry.amount) || 0;
    let gaveStr = '-';
    let gotStr = '-';

    if (entry.type === 'gave') {
      gaveStr = amt.toLocaleString('en-US');
      runningBal += amt;
    } else {
      gotStr = amt.toLocaleString('en-US');
      runningBal -= amt;
    }

    tableRows.push([
      entry.date,
      entry.note || (entry.type === 'gave' ? 'Gave / Debit' : 'Got / Payment Received'),
      gaveStr,
      gotStr,
      runningBal.toLocaleString('en-US')
    ]);
  }

  const gaveHeader = account.kind === 'broker' ? 'Paid (PKR)' : 'You Gave (PKR)';
  const gotHeader = account.kind === 'broker' ? 'Comm. Due (PKR)' : 'You Got (PKR)';

  autoTable(doc, {
    startY: 185,
    head: [['Date', 'Description / Note', gaveHeader, gotHeader, 'Balance (PKR)']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    styles: {
      fontSize: 8,
      cellPadding: 6,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 205 },
      2: { cellWidth: 80, halign: 'right' },
      3: { cellWidth: 80, halign: 'right' },
      4: { cellWidth: 80, halign: 'right', fontStyle: 'bold' }
    },
    foot: [
      [
        'Total',
        `Transactions: ${filteredEntries.length}`,
        totalGave.toLocaleString('en-US'),
        totalGot.toLocaleString('en-US'),
        balance.toLocaleString('en-US')
      ]
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold'
    }
  });

  // Footer note
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 30 : 500;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated digital khata statement powered by Driver Dost. No signature required.', 40, finalY);

  const cleanName = account.name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Statement_${cleanName}_${new Date().toISOString().split('T')[0]}.pdf`;

  return { doc, filename };
}

export function generateAllAccountsSummaryPdf({
  accounts,
  allEntries,
  businessName
}: GenerateAllAccountsSummaryOptions): { doc: jsPDF; filename: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const appTitle = businessName && businessName.trim() ? `${businessName.trim()} | Driver Dost` : 'Driver Dost - Digital Khata';
  const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 595, 80, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(appTitle, 40, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`All Accounts Ledger Summary • Generated: ${nowStr}`, 40, 62);

  // Group entries
  const entriesByAccount = new Map<string, LedgerEntry[]>();
  for (const entry of allEntries) {
    const list = entriesByAccount.get(entry.accountId) || [];
    list.push(entry);
    entriesByAccount.set(entry.accountId, list);
  }

  let totalReceivable = 0;
  let totalPayable = 0;

  const tableRows = accounts.map((acc, index) => {
    const entries = entriesByAccount.get(acc.id) || [];
    const { balance } = calculateAccountBalance(acc, entries);

    if (balance > 0) totalReceivable += balance;
    else if (balance < 0) totalPayable += Math.abs(balance);

    const statusText = balance > 0 ? 'Receivable' : balance < 0 ? 'Payable' : 'Settled';

    return [
      String(index + 1),
      acc.name,
      acc.kind === 'broker' ? 'Broker' : 'Party',
      formatPhoneForDisplay(acc.phone) || '-',
      acc.dueDate || '-',
      `PKR ${Math.abs(balance).toLocaleString('en-US')}`,
      statusText
    ];
  });

  const netBalance = totalReceivable - totalPayable;

  // Summary Metrics Banner
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(40, 95, 515, 60, 4, 4, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Total Receivable (To Get):', 55, 118);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`PKR ${totalReceivable.toLocaleString('en-US')}`, 55, 135);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Total Payable (To Give):', 230, 118);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72);
  doc.text(`PKR ${totalPayable.toLocaleString('en-US')}`, 230, 135);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Net Balance:', 400, 118);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`PKR ${netBalance.toLocaleString('en-US')}`, 400, 135);

  autoTable(doc, {
    startY: 170,
    head: [['#', 'Account Name', 'Type', 'Phone', 'Due Date', 'Balance', 'Status']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    styles: {
      fontSize: 8,
      cellPadding: 5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 160 },
      2: { cellWidth: 60 },
      3: { cellWidth: 80 },
      4: { cellWidth: 65 },
      5: { cellWidth: 75, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 50, halign: 'center' }
    }
  });

  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 30 : 500;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Confidential Digital Khata Summary • Powered by Driver Dost', 40, finalY);

  const filename = `All_Accounts_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
  return { doc, filename };
}

/**
 * Downloads the PDF directly or invokes native Web Share API
 */
export async function downloadOrSharePdf(doc: jsPDF, filename: string): Promise<void> {
  const blob = doc.output('blob');
  const file = new File([blob], filename, { type: 'application/pdf' });

  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: filename,
        text: 'Account Statement from Driver Dost Digital Khata'
      });
      return;
    } catch {
      // User cancelled or share failed, fallback to direct download
    }
  }

  doc.save(filename);
}
