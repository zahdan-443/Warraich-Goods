import React from 'react';
import type { AddaBillRecord, BranchConfig, CompanyProfile, Language } from '../types';
import { resolveEffectiveCompanyDetails } from '../utils/addaBillingStorage';

interface PrintableAddaBillProps {
  bill: AddaBillRecord;
  lang: Language;
  branchConfig?: BranchConfig | null;
  companyProfile?: CompanyProfile | null;
  elementId?: string;
}

export function formatAddaBillWhatsAppText(
  bill: AddaBillRecord,
  lang: Language,
  branchConfig?: BranchConfig | null,
  companyProfile?: CompanyProfile | null
): string {
  const co = branchConfig || companyProfile
    ? resolveEffectiveCompanyDetails(branchConfig, companyProfile)
    : {
        nameUr: bill.companySnapshot.nameUr,
        nameEn: bill.companySnapshot.nameEn,
        proprietorUr: bill.companySnapshot.proprietorUr,
        proprietorEn: bill.companySnapshot.proprietorEn,
        addressUr: bill.companySnapshot.addressUr,
        addressEn: bill.companySnapshot.addressEn,
        phone: bill.companySnapshot.phone,
        ntn: bill.companySnapshot.ntn
      };

  const fmt = (n: number) => Math.max(0, Number(n) || 0).toLocaleString('en-US');
  const isEn = lang === 'en';
  const itemLines = bill.items.map(
    (it, idx) =>
      `${idx + 1}. [${it.itemType === 'freight' ? (isEn ? 'Freight' : 'کرایہ') : (isEn ? 'Commission' : 'کمیشن')}] ${it.biltyNo} (${it.date}) — Rs ${fmt(it.amount)}`
  );

  if (isEn) {
    return [
      `🧾 *${co.nameEn}*`,
      `📍 ${co.addressEn}`,
      `📞 ${co.phone} | NTN: ${co.ntn}`,
      `───────────────────────`,
      `📄 *Bill No:* ${bill.billNumber}`,
      `📅 *Date:* ${bill.date}`,
      `👤 *Party:* ${bill.partyName}${bill.partyMobile ? ` (${bill.partyMobile})` : ''}`,
      `📌 *Status:* ${bill.status === 'paid' ? 'PAID ✅' : 'PENDING / BILLED ⏳'}`,
      `───────────────────────`,
      ...itemLines,
      `───────────────────────`,
      `💰 *Subtotal:* Rs ${fmt(bill.subtotal)}`,
      bill.extraCharges > 0 ? `➕ *Extra Charges:* Rs ${fmt(bill.extraCharges)}` : '',
      bill.discount > 0 ? `➖ *Discount:* Rs ${fmt(bill.discount)}` : '',
      `💵 *Grand Total:* Rs ${fmt(bill.totalAmount)}`,
      bill.notes ? `📝 *Note:* ${bill.notes}` : '',
      `───────────────────────`,
      `Thank you for your business.`
    ]
      .filter(Boolean)
      .join('\n');
  }

  return [
    `🧾 *${co.nameUr}*`,
    `📍 ${co.addressUr}`,
    `📞 ${co.phone} | این ٹی این: ${co.ntn}`,
    `───────────────────────`,
    `📄 *بل نمبر:* ${bill.billNumber}`,
    `📅 *تاریخ:* ${bill.date}`,
    `👤 *پارٹی:* ${bill.partyName}${bill.partyMobile ? ` (${bill.partyMobile})` : ''}`,
    `📌 *اسٹیٹس:* ${bill.status === 'paid' ? 'ادا شدہ (PAID) ✅' : 'بقایا / بل جاری (BILLED) ⏳'}`,
    `───────────────────────`,
    ...itemLines,
    `───────────────────────`,
    `💰 *کل رقم (ذیلی):* روپے ${fmt(bill.subtotal)}`,
    bill.extraCharges > 0 ? `➕ *اضافی چارجز:* روپے ${fmt(bill.extraCharges)}` : '',
    bill.discount > 0 ? `➖ *رعایت (ڈسکاؤنٹ):* روپے ${fmt(bill.discount)}` : '',
    `💵 *کل قابلِ ادائیگی:* روپے ${fmt(bill.totalAmount)}`,
    bill.notes ? `📝 *نوٹ:* ${bill.notes}` : '',
    `───────────────────────`,
    `تشریف آوری اور اعتماد کا شکریہ۔`
  ]
    .filter(Boolean)
    .join('\n');
}

export const PrintableAddaBill: React.FC<PrintableAddaBillProps> = ({
  bill,
  lang,
  branchConfig,
  companyProfile,
  elementId = 'printable-adda-bill-dom'
}) => {
  const isEn = lang === 'en';
  const liveCo =
    branchConfig || companyProfile
      ? resolveEffectiveCompanyDetails(branchConfig, companyProfile)
      : {
          nameUr: bill.companySnapshot.nameUr,
          nameEn: bill.companySnapshot.nameEn,
          proprietorUr: bill.companySnapshot.proprietorUr,
          proprietorEn: bill.companySnapshot.proprietorEn,
          addressUr: bill.companySnapshot.addressUr,
          addressEn: bill.companySnapshot.addressEn,
          phone: bill.companySnapshot.phone,
          ntn: bill.companySnapshot.ntn
        };

  const fmt = (n: number) => Math.max(0, Number(n) || 0).toLocaleString('en-US');

  return (
    <div
      id={elementId}
      dir={isEn ? 'ltr' : 'rtl'}
      className="bg-white text-slate-900 border-2 border-[#0f2942] rounded-xl p-5 sm:p-6 shadow-xs mx-auto"
      style={{
        width: '100%',
        maxWidth: '760px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: isEn
          ? "'IBM Plex Sans', 'Segoe UI', Arial, sans-serif"
          : "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', sans-serif"
      }}
    >
      {/* Header */}
      <div className="border-b-2 border-[#d97706] pb-3.5 mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-[11px] font-mono font-bold text-[#0f2942]">
            NTN: {liveCo.ntn}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#881337] leading-snug">
            {isEn ? liveCo.nameEn : liveCo.nameUr}
          </h2>
          <p className="text-xs font-semibold text-slate-700">
            {isEn ? liveCo.addressEn : liveCo.addressUr}
          </p>
          <p className="text-xs font-mono font-bold text-[#0f2942]" dir="ltr">
            📞 {liveCo.phone}
          </p>
        </div>

        <div className="text-start sm:text-end space-y-1 shrink-0">
          <div className="inline-block px-3 py-1 rounded-lg bg-[#0f2942] text-amber-300 text-xs font-black tracking-wider uppercase">
            {isEn ? 'FREIGHT & COMMISSION BILL' : 'بل کرایہ و کمیشن'}
          </div>
          <div className="text-xs font-bold text-slate-800">
            <span>{isEn ? 'Proprietor:' : 'پروپرائیٹر:'} </span>
            <span className="text-[#0f2942]">
              {isEn ? liveCo.proprietorEn : liveCo.proprietorUr}
            </span>
          </div>
          <div>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                bill.status === 'paid'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              {bill.status === 'paid'
                ? isEn
                  ? 'PAID'
                  : 'ادا شدہ (PAID)'
                : isEn
                ? 'BILLED / UNPAID'
                : 'بل جاری / بقایا'}
            </span>
          </div>
        </div>
      </div>

      {/* Bill Meta & Party Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 text-xs">
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase">
            {isEn ? 'Bill No' : 'بل نمبر'}
          </div>
          <div className="font-mono font-black text-sm text-[#0f2942]">{bill.billNumber}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase">
            {isEn ? 'Date' : 'تاریخ'}
          </div>
          <div className="font-mono font-bold text-slate-800">{bill.date}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase">
            {isEn ? 'Party / Payee' : 'پارٹی / وصول کنندہ'}
          </div>
          <div className="font-bold text-slate-900">{bill.partyName}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase">
            {isEn ? 'Mobile No' : 'موبائل نمبر'}
          </div>
          <div className="font-mono font-bold text-slate-800" dir="ltr">
            {bill.partyMobile || '—'}
          </div>
        </div>
      </div>

      {/* Itemized Table */}
      <div className="overflow-x-auto border border-slate-300 rounded-lg mb-4">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[#0f2942] text-white">
              <th className="py-2 px-2.5 text-start font-bold">#</th>
              <th className="py-2 px-2.5 text-start font-bold">{isEn ? 'Type' : 'قسم'}</th>
              <th className="py-2 px-2.5 text-start font-bold">{isEn ? 'Bilty No' : 'بلٹی نمبر'}</th>
              <th className="py-2 px-2.5 text-start font-bold">{isEn ? 'Date' : 'تاریخ'}</th>
              <th className="py-2 px-2.5 text-start font-bold">{isEn ? 'Details / Route' : 'تفصیل / روٹ'}</th>
              <th className="py-2 px-2.5 text-end font-bold">{isEn ? 'Amount (Rs)' : 'رقم (روپے)'}</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, idx) => (
              <tr
                key={`${item.itemId}_${idx}`}
                className={idx % 2 === 0 ? 'bg-white border-t border-slate-200' : 'bg-slate-50/70 border-t border-slate-200'}
              >
                <td className="py-2 px-2.5 font-mono text-slate-500">{idx + 1}</td>
                <td className="py-2 px-2.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.itemType === 'freight'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {item.itemType === 'freight'
                      ? isEn
                        ? 'Freight'
                        : 'کرایہ'
                      : isEn
                      ? 'Commission'
                      : 'کمیشن'}
                  </span>
                </td>
                <td className="py-2 px-2.5 font-mono font-bold text-[#0f2942]">{item.biltyNo}</td>
                <td className="py-2 px-2.5 font-mono text-slate-600">{item.date}</td>
                <td className="py-2 px-2.5 text-slate-800">
                  {item.vehicleNo ? `[${item.vehicleNo}] ` : ''}
                  {item.description}
                </td>
                <td className="py-2 px-2.5 text-end font-mono font-bold tabular-nums text-slate-900">
                  {fmt(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals & Notes */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 border-t border-slate-200 pt-3">
        <div className="flex-1 text-xs text-slate-600 space-y-1">
          {bill.notes && (
            <div>
              <span className="font-bold text-slate-800">{isEn ? 'Notes: ' : 'نوٹ: '}</span>
              <span>{bill.notes}</span>
            </div>
          )}
          <div className="pt-4 text-[11px] text-slate-500">
            {isEn
              ? 'This is a computer-generated freight & commission bill.'
              : 'یہ کمپیوٹر سے تیار کردہ باضابطہ بل کرایہ و کمیشن ہے۔'}
          </div>
        </div>

        <div className="w-full sm:w-64 bg-amber-50/70 border border-amber-300 rounded-xl p-3 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-700">
            <span>{isEn ? 'Subtotal' : 'ذیلی میزان'}</span>
            <span className="font-mono font-bold tabular-nums">Rs {fmt(bill.subtotal)}</span>
          </div>
          {bill.extraCharges > 0 && (
            <div className="flex items-center justify-between text-slate-700">
              <span>{isEn ? 'Extra Charges' : 'اضافی چارجز'}</span>
              <span className="font-mono font-bold tabular-nums">+ Rs {fmt(bill.extraCharges)}</span>
            </div>
          )}
          {bill.discount > 0 && (
            <div className="flex items-center justify-between text-rose-700">
              <span>{isEn ? 'Discount' : 'رعایت'}</span>
              <span className="font-mono font-bold tabular-nums">- Rs {fmt(bill.discount)}</span>
            </div>
          )}
          <div className="border-t border-amber-300 pt-1.5 flex items-center justify-between text-sm font-black text-[#0f2942]">
            <span>{isEn ? 'Grand Total' : 'کل رقم'}</span>
            <span className="font-mono tabular-nums">Rs {fmt(bill.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
