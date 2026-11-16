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
import { shareOrDownloadBlob } from './nativeExport';
import {
  KhataBill,
  KhataEmployee,
  KhataEmployeeEntry,
  KhataReceivingEntry,
  KhataReceivingPoint,
  LedgerAccount,
  LedgerEntry
} from '../types';
import { calculateAccountBalance, formatPhoneForDisplay } from './ledgerStorage';
import {
  ReportsHubAnalytics,
  calculateEmployeeLedgerSummary,
  calculateReceivingPointSummary,
  isEmployeeCreditType
} from './khataModulesStorage';

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
  await shareOrDownloadBlob(blob, filename, {
    title: filename,
    text: 'Account Statement from Driver Dost Digital Khata',
    dialogTitle: filename
  });
}

// =========================================================================
// v1.3.0 KHATA EXPANSION PDF GENERATORS (100% LOCAL jsPDF)
// =========================================================================

export function generateBillPdf({
  bill,
  businessName
}: {
  bill: KhataBill;
  businessName?: string;
}): { doc: jsPDF; filename: string } {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const appTitle = businessName?.trim() ? `${businessName.trim()} | Driver Dost` : 'Driver Dost - Digital Khata';

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 595, 82, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(appTitle, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Tax / Freight Invoice • ${bill.billNumber}`, 40, 60);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(40, 96, 515, 76, 4, 4, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Bill To: ${bill.partyName}`, 54, 118);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Bill No: ${bill.billNumber}   |   Date: ${bill.date}`, 54, 136);
  const metaParts: string[] = [];
  if (bill.partyPhone) metaParts.push(`Phone: ${formatPhoneForDisplay(bill.partyPhone)}`);
  if (bill.vehicleNo) metaParts.push(`Vehicle: ${bill.vehicleNo}`);
  if (bill.linkedDocNo) metaParts.push(`Ref Doc: ${bill.linkedDocNo}`);
  if (metaParts.length > 0) {
    doc.text(metaParts.join('   |   '), 54, 154);
  }

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Balance Due:', 410, 118);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  if (bill.status === 'paid') {
    doc.setTextColor(5, 150, 105);
    doc.text('PAID', 410, 138);
  } else {
    doc.setTextColor(225, 29, 72);
    doc.text(`PKR ${bill.balance.toLocaleString('en-US')}`, 410, 138);
  }
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Status: ${bill.status.toUpperCase()}`, 410, 154);

  const rows = bill.lineItems.map((it, i) => [
    String(i + 1),
    it.description || '-',
    String(it.qty),
    `PKR ${it.rate.toLocaleString('en-US')}`,
    `PKR ${it.amount.toLocaleString('en-US')}`
  ]);

  autoTable(doc, {
    startY: 188,
    head: [['#', 'Description / Route', 'Qty', 'Rate', 'Amount (PKR)']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 9 },
    styles: { fontSize: 8.5, cellPadding: 6 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 255 },
      2: { cellWidth: 50, halign: 'right' },
      3: { cellWidth: 85, halign: 'right' },
      4: { cellWidth: 95, halign: 'right', fontStyle: 'bold' }
    }
  });

  const tableEndY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 18 : 340;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  let y = tableEndY;
  const printSummaryLine = (label: string, val: number, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(label, 350, y);
    doc.text(`PKR ${val.toLocaleString('en-US')}`, 545, y, { align: 'right' });
    y += 16;
  };
  printSummaryLine('Subtotal:', bill.subtotal);
  if (bill.extraCharges > 0) printSummaryLine('Extra Charges:', bill.extraCharges);
  if (bill.discount > 0) printSummaryLine('Discount:', -bill.discount);
  printSummaryLine('Total Bill:', bill.total, true);
  printSummaryLine('Advance / Paid:', bill.advance);
  printSummaryLine('Balance Payable:', bill.balance, true);

  if (bill.notes) {
    y += 10;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Notes: ${bill.notes}`, 40, y);
  }

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Generated locally by Driver Dost Digital Khata.', 40, Math.max(y + 28, 760));

  const cleanNo = bill.billNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  return { doc, filename: `Invoice_${cleanNo}_${bill.date}.pdf` };
}

export function generateEmployeeStatementPdf({
  employee,
  entries,
  businessName
}: {
  employee: KhataEmployee;
  entries: KhataEmployeeEntry[];
  businessName?: string;
}): { doc: jsPDF; filename: string } {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const appTitle = businessName?.trim() ? `${businessName.trim()} | Driver Dost` : 'Driver Dost - Digital Khata';
  const summary = calculateEmployeeLedgerSummary(entries);

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 595, 80, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(appTitle, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Employee Salary & Advance Statement • ${new Date().toISOString().split('T')[0]}`, 40, 60);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(40, 95, 515, 74, 4, 4, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(employee.name, 54, 118);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Role: ${employee.role.toUpperCase()}  |  Pay Basis: ${employee.payBasis === 'monthly' ? 'Monthly' : 'Per Trip'} (PKR ${employee.rateAmount.toLocaleString('en-US')})`, 54, 136);
  doc.text(`Joined: ${employee.joiningDate}${employee.phone ? `  |  Phone: ${formatPhoneForDisplay(employee.phone)}` : ''}`, 54, 152);

  doc.setFontSize(8);
  doc.text('Net Balance:', 410, 118);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  if (summary.netBalance > 0) doc.setTextColor(5, 150, 105);
  else if (summary.netBalance < 0) doc.setTextColor(225, 29, 72);
  else doc.setTextColor(71, 85, 105);
  doc.text(`PKR ${Math.abs(summary.netBalance).toLocaleString('en-US')}`, 410, 138);
  doc.setFontSize(8);
  doc.text(
    summary.netBalance > 0 ? '(Salary Payable)' : summary.netBalance < 0 ? '(Advance Recoverable)' : '(Settled)',
    410,
    152
  );

  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let running = 0;
  const rows = sorted.map(e => {
    const isCredit = isEmployeeCreditType(e.type);
    running += isCredit ? e.amount : -e.amount;
    return [
      e.date,
      e.type.replace('_', ' ').toUpperCase(),
      e.notes || '-',
      isCredit ? `PKR ${e.amount.toLocaleString('en-US')}` : '-',
      !isCredit ? `PKR ${e.amount.toLocaleString('en-US')}` : '-',
      `PKR ${running.toLocaleString('en-US')}`
    ];
  });

  autoTable(doc, {
    startY: 184,
    head: [['Date', 'Type', 'Notes', 'Earned (+)', 'Paid/Adv (-)', 'Balance']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 5 },
    foot: [[
      'TOTAL',
      `${entries.length} entries`,
      '',
      `PKR ${summary.totalEarned.toLocaleString('en-US')}`,
      `PKR ${summary.totalPaidAndDeducted.toLocaleString('en-US')}`,
      `PKR ${summary.netBalance.toLocaleString('en-US')}`
    ]],
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
  });

  const cleanName = employee.name.replace(/[^a-zA-Z0-9]/g, '_');
  return { doc, filename: `Employee_Statement_${cleanName}_${new Date().toISOString().split('T')[0]}.pdf` };
}

export function generateReceivingPointStatementPdf({
  point,
  entries,
  businessName
}: {
  point: KhataReceivingPoint;
  entries: KhataReceivingEntry[];
  businessName?: string;
}): { doc: jsPDF; filename: string } {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const appTitle = businessName?.trim() ? `${businessName.trim()} | Driver Dost` : 'Driver Dost - Digital Khata';
  const summary = calculateReceivingPointSummary(entries);

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 595, 80, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(appTitle, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Receiving Point Statement • ${new Date().toISOString().split('T')[0]}`, 40, 60);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(40, 95, 515, 72, 4, 4, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${point.name} (${point.city})`, 54, 118);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  if (point.contactPerson || point.phone) {
    doc.text(
      `${point.contactPerson ? `Contact: ${point.contactPerson}  ` : ''}${point.phone ? `Phone: ${formatPhoneForDisplay(point.phone)}` : ''}`,
      54,
      138
    );
  }

  doc.setFontSize(8);
  doc.text('Pending Balance:', 410, 118);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(summary.pendingBalance >= 0 ? 5 : 225, summary.pendingBalance >= 0 ? 150 : 29, summary.pendingBalance >= 0 ? 105 : 72);
  doc.text(`PKR ${summary.pendingBalance.toLocaleString('en-US')}`, 410, 138);

  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let running = 0;
  const rows = sorted.map(e => {
    running += e.type === 'received' ? e.amount : -e.amount;
    return [
      e.date,
      e.type === 'received' ? 'RECEIVED / BILLED' : 'PAID / REMITTED',
      e.notes || '-',
      e.type === 'received' ? `PKR ${e.amount.toLocaleString('en-US')}` : '-',
      e.type === 'paid' ? `PKR ${e.amount.toLocaleString('en-US')}` : '-',
      `PKR ${running.toLocaleString('en-US')}`
    ];
  });

  autoTable(doc, {
    startY: 182,
    head: [['Date', 'Type', 'Notes', 'Received', 'Paid', 'Pending']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 5 },
    foot: [[
      'TOTAL',
      `${entries.length} entries`,
      '',
      `PKR ${summary.totalReceived.toLocaleString('en-US')}`,
      `PKR ${summary.totalPaid.toLocaleString('en-US')}`,
      `PKR ${summary.pendingBalance.toLocaleString('en-US')}`
    ]],
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
  });

  const cleanName = point.name.replace(/[^a-zA-Z0-9]/g, '_');
  return { doc, filename: `ReceivingPoint_${cleanName}_${new Date().toISOString().split('T')[0]}.pdf` };
}

export function generateReportsSummaryPdf({
  analytics,
  businessName
}: {
  analytics: ReportsHubAnalytics;
  businessName?: string;
}): { doc: jsPDF; filename: string } {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const appTitle = businessName?.trim() ? `${businessName.trim()} | Driver Dost` : 'Driver Dost - Business Reports';

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 595, 80, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(appTitle, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Financial & Fleet Summary (${analytics.startDate} to ${analytics.endDate})`, 40, 60);

  const summaryRows = [
    ['1. Income vs Expenses', `Income: PKR ${analytics.incomeVsExpense.totalIncome.toLocaleString('en-US')} | Expenses: PKR ${analytics.incomeVsExpense.totalExpenses.toLocaleString('en-US')}`, `Net: PKR ${analytics.incomeVsExpense.netProfit.toLocaleString('en-US')}`],
    ['2. Party Receivable / Payable', `Receivable: PKR ${analytics.partyReceivablePayable.totalReceivable.toLocaleString('en-US')} | Payable: PKR ${analytics.partyReceivablePayable.totalPayable.toLocaleString('en-US')}`, `Net: PKR ${analytics.partyReceivablePayable.netBalance.toLocaleString('en-US')}`],
    ['3. Broker Commission Due', `Brokers: ${analytics.brokerCommissionDue.brokerCount} | Paid: PKR ${analytics.brokerCommissionDue.totalPaidToBrokers.toLocaleString('en-US')}`, `Due: PKR ${analytics.brokerCommissionDue.totalCommissionDue.toLocaleString('en-US')}`],
    ['4. Employees (Period)', `Due: PKR ${analytics.employeeSummary.totalSalaryDue.toLocaleString('en-US')} | Advances: PKR ${analytics.employeeSummary.totalAdvance.toLocaleString('en-US')}`, `Paid: PKR ${analytics.employeeSummary.totalSalaryPaid.toLocaleString('en-US')}`],
    ['5. Receiving Points', `Received: PKR ${analytics.receivingPointsSummary.totalReceived.toLocaleString('en-US')} | Paid: PKR ${analytics.receivingPointsSummary.totalPaid.toLocaleString('en-US')}`, `Pending: PKR ${analytics.receivingPointsSummary.totalPending.toLocaleString('en-US')}`],
    ['6. Bills Summary', `Bills: ${analytics.billsSummary.totalCount} (Paid: ${analytics.billsSummary.paidCount}, Unpaid: ${analytics.billsSummary.unpaidCount})`, `Balance: PKR ${analytics.billsSummary.totalPendingBalance.toLocaleString('en-US')}`]
  ];

  autoTable(doc, {
    startY: 98,
    head: [['Module', 'Breakdown', 'Key Metric']],
    body: summaryRows,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 9 },
    styles: { fontSize: 8.5, cellPadding: 6 }
  });

  if (analytics.vehicleProfitLoss.length > 0) {
    const startY = ((doc as any).lastAutoTable?.finalY || 260) + 18;
    autoTable(doc, {
      startY,
      head: [['Vehicle No', 'Trips / Exps', 'Income (PKR)', 'Expenses (PKR)', 'Net Profit (PKR)']],
      body: analytics.vehicleProfitLoss.map(v => [
        v.vehicleNo,
        `${v.tripsCount} trips / ${v.dailyExpensesCount} exp`,
        v.income.toLocaleString('en-US'),
        v.expenses.toLocaleString('en-US'),
        v.netProfit.toLocaleString('en-US')
      ]),
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 5 }
    });
  }

  if (analytics.expensesByCategory.items.length > 0) {
    const startY = ((doc as any).lastAutoTable?.finalY || 420) + 18;
    autoTable(doc, {
      startY,
      head: [['Expense Category', 'Amount (PKR)', 'Share (%)']],
      body: analytics.expensesByCategory.items.map(c => [
        c.category.toUpperCase(),
        `PKR ${c.amount.toLocaleString('en-US')}`,
        `${c.percentage}%`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255], fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 5 }
    });
  }

  return {
    doc,
    filename: `DriverDost_Reports_${analytics.startDate}_to_${analytics.endDate}.pdf`
  };
}

