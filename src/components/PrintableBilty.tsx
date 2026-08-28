import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { BiltyRecord } from '../types';
import { getCachedCompanyProfile } from '../utils/storage';
import { logoIconData } from '../assets/dashboardIcons';

interface PrintableBiltyProps {
  record: BiltyRecord;
  qrDataUrl?: string;
}

export const ZahdanSignatureSvg: React.FC<{ className?: string }> = ({ className = "w-36 h-10 inline-block" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 240 85"
    className={className}
    style={{ overflow: 'visible' }}
  >
    <g fill="none" stroke="#0f172a" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M 20 48 C 15 25, 45 15, 60 22 C 75 28, 30 58, 70 52 C 85 50, 90 32, 98 38 C 105 44, 108 52, 116 38 C 122 26, 130 32, 136 44 C 142 54, 150 36, 158 36 C 166 36, 170 48, 178 38 C 185 30, 192 36, 198 46"
        strokeWidth="2.8"
      />
      <path
        d="M 40 28 C 65 14, 115 12, 145 18 C 160 21, 185 22, 205 16"
        strokeWidth="2.0"
      />
      <circle cx="58" cy="12" r="2.4" fill="#0f172a" stroke="none" />
      <circle cx="150" cy="14" r="2.0" fill="#0f172a" stroke="none" />
      <circle cx="160" cy="12" r="1.6" fill="#0f172a" stroke="none" />
      <path
        d="M 18 62 Q 115 78 215 54 Q 130 82 25 66"
        strokeWidth="2.2"
        fill="#0f172a"
        fillOpacity="0.1"
      />
      <path
        d="M 205 52 C 220 45, 230 40, 235 48"
        strokeWidth="2.0"
      />
    </g>
  </svg>
);

export const PrintableBilty: React.FC<PrintableBiltyProps> = ({ record, qrDataUrl: propQrUrl }) => {
  const [internalQrUrl, setInternalQrUrl] = useState<string>('');
  const company = getCachedCompanyProfile();

  useEffect(() => {
    let isMounted = true;
    if (!propQrUrl && record) {
      const currentOrigin = typeof window !== 'undefined' && window.location && window.location.origin
        ? window.location.origin
        : '';

      const qrText = [
        company.nameUr || `ورائچ گڈز ٹرانسپورٹ کمپنی (رجسٹرڈ)`,
        company.nameEn || `WARRAICH GOODS TRANSPORT CO.`,
        `بلٹی نمبر: ${record.biltyNo}`,
        `تاریخ: ${record.date || '-'}`,
        `گاڑی نمبر: ${record.vehicleNo}`,
        `روٹ: ${record.sendingCity || '-'} تا ${record.receivingCity || '-'}`,
        `مال بھیجنے والا: ${record.senderName || record.consignor || '-'} (${record.senderMobile || '-'})`,
        `مال وصول کرنے والا: ${record.receiverName || record.consignee || '-'} (${record.receiverMobile || '-'})`,
        `تفصیل مال: ${record.itemDescription || '-'} (${record.qty || '-'} نگ)`,
        `وزن: ${record.weight || '-'} کلوگرام`,
        `کل کرایہ: Rs ${record.total ? record.total.toLocaleString('en-US') : '0'}`,
        `پیشگی: Rs ${record.advance ? record.advance.toLocaleString('en-US') : '0'}`,
        `بقایا: Rs ${record.payable ? record.payable.toLocaleString('en-US') : '0'}`,
        `ہیلپ لائن: ${company.phoneNumbers || '0300-5370443 | 0339-5370443'}`,
        currentOrigin ? `Verify: ${currentOrigin}` : ''
      ].filter(Boolean).join('\n');

      QRCode.toDataURL(qrText, {
        width: 350,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: { dark: '#000000', light: '#ffffff' }
      })
        .then(url => {
          if (isMounted) setInternalQrUrl(url);
        })
        .catch((err) => console.error('QR generation error:', err));
    }
    return () => { isMounted = false; };
  }, [propQrUrl, record]);

  const activeQrUrl = propQrUrl || internalQrUrl;
  const fmt = (n?: number) => (n !== undefined && n !== null ? n.toLocaleString('en-US') : '0');

  // Warraich Goods Standard 9 Urdu Terms & Conditions
  const termsList = [
    "بیوپاری کو چاہیے کہ مال وصول کرتے وقت اچھی طرح ملاحظہ کرے۔",
    "مال کو گاڑی میں بحفاظت لوڈ کرنے اور منزل پر ان لوڈ کرنے کی مکمل ذمہ داری اور لیبر کا خرچ متعلقہ پارٹی کا ہوگا۔",
    "فل ٹرک لوڈ کی صورت میں اگر روانگی کے وقت لگائی گئی سیل یا ترپال منزل پر درست حالت میں ہے، تو راستے میں مال کی کسی ڈیمیج کی کمپنی ذمہ دار نہ ہوگی۔",
    "انڈوں، تیل، گھی، مربہ جات و دیگر مال کے رسنے، ضائع ہونے یا لیک ہونے کی کمپنی ذمہ دار نہ ہوگی۔ محفوظ اور معیاری پیکنگ بھیجنے والے کی ذمہ داری ہے۔ راستے میں سڑک کی خرابی، جھٹکوں، اتفاقیہ حادثہ یا موسم کی وجہ سے انڈوں یا دیگر سامان کی ٹوٹ پھوٹ کی ٹرانسپورٹ کمپنی ہرگز ذمہ دار نہیں ہوگی۔",
    "قدرتی آفات، دھند، ہڑتال، ٹریفک جام یا سڑک بند ہونے کی وجہ سے گاڑی لیٹ ہونے پر مال کے خراب ہونے یا مارکیٹ ریٹ گرنے کا کلیم قبول نہیں ہوگا۔",
    "بلٹی پر لکھے گئے مال سے ہٹ کر کوئی غیر قانونی چیز نکلنے یا مقررہ حد سے زائد وزن ہونے پر اضافی کرایہ، تمام تر قانونی ذمہ داری، جرمانہ و چالان پارٹی ادا کرے گی۔",
    "منزل پر پہنچنے کے 24 گھنٹے کے اندر گاڑی خالی کرنا لازمی ہے، ورنہ یومیہ ڈیمرج چارجز وصول کیے جائیں گے۔",
    "جس مال کے ہمراہ بیوپاری یا اس کا نمائندہ خود موجود ہوگا، اس مال کے کسی قسم کے نقصان کی کمپنی ذمہ دار نہ ہوگی۔",
    "کسی بھی تنازعے کی صورت میں حتمی فیصلہ ٹرانسپورٹ کمپنی کے دفتر میں باہمی رضامندی سے طے کیا جائے گا۔"
  ];

  // Payment badge calculation
  const isPaid = (record.payable || 0) <= 0;
  const isAdvanceOnly = (record.advance || 0) > 0 && (record.payable || 0) > 0;

  return (
    <div
      dir="rtl"
      className="printable-bilty-container p-6 w-[794px] h-[1123px] mx-auto bg-white text-slate-900 border-2 border-slate-900 font-sans text-xs box-border flex flex-col justify-between print:p-3 print:w-full print:h-auto print:border-none"
      style={{
        backgroundColor: '#ffffff',
        color: '#0f172a',
        border: '2px solid #0f172a',
        fontFamily: "'Noto Sans Arabic', 'Inter', Arial, sans-serif",
        lineHeight: '1.3',
        width: '794px',
        height: '1123px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700;800;900&family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .printable-bilty-container {
            width: 100% !important;
            max-width: 100% !important;
            height: 100vh !important;
            max-height: 100vh !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 14px !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }
        .printable-bilty-container {
          font-family: 'Noto Sans Arabic', 'Inter', Arial, sans-serif !important;
        }
        .printable-bilty-container * {
          box-sizing: border-box !important;
        }
      `}</style>

      {/* 1. TOP HEADER (BRANDING & CONSIGNMENT NOTE CARD) */}
      <div className="pb-2.5 mb-2 border-b-2" style={{ borderColor: '#0f172a' }}>
        <div className="flex flex-row items-stretch justify-between gap-3 text-right">
          
          {/* Left / Main Branding Block */}
          <div className="flex items-center gap-3 flex-1">
            <img
              src={logoIconData}
              alt="وڑائچ گڈز لوگو"
              className="rounded-full p-0.5 shrink-0"
              style={{
                width: '68px',
                height: '68px',
                minWidth: '68px',
                minHeight: '68px',
                maxWidth: '68px',
                maxHeight: '68px',
                backgroundColor: '#ffffff',
                border: '2px solid #8b9d77',
                objectFit: 'contain'
              }}
            />
            <div className="flex flex-col justify-center text-right">
              {/* Urdu Big Title */}
              <h1
                className="text-[21px] font-black tracking-tight"
                style={{
                  fontFamily: "'Noto Sans Arabic', Arial, sans-serif",
                  lineHeight: '1.2',
                  color: '#0f2942',
                  margin: '0 0 1px 0',
                  padding: '0'
                }}
              >
                {company.nameUr || 'وڑائچ گڈز ٹرانسپورٹ کمپنی (رجسٹرڈ)'}
              </h1>

              {/* English Subtitle */}
              <div className="text-[11px] font-extrabold tracking-wider text-slate-700 font-sans uppercase">
                {company.nameEn || 'WARRAICH GOODS TRANSPORT CO.'}
              </div>

              {/* Tagline / Sub-description */}
              <p
                className="text-[10px] font-bold text-slate-600 mt-0.5"
                style={{ fontFamily: "'Noto Sans Arabic', Arial, sans-serif" }}
              >
                {company.taglineUr || 'ملک بھر میں مال برداری و لاجسٹکس سروس | آل پاکستان روڈ فریٹ'}
              </p>

              {/* Head Office & Phone Helpline */}
              <div className="flex flex-row items-center gap-2 mt-1 text-[10px] font-bold text-slate-800">
                <span>📍 <strong>ہیڈ آفس:</strong> {company.headOfficeUr || 'سمندری، فیصل آباد'}</span>
                <span className="text-slate-300">|</span>
                <span>📞 <strong>ہیلپ لائن:</strong> <span className="font-mono dir-ltr inline-block">0300-5370443, 0339-5370443</span></span>
              </div>
            </div>
          </div>

          {/* Right Navy Block: CONSIGNMENT NOTE / BILTY */}
          <div
            className="rounded-xs shrink-0 w-[240px] flex flex-col justify-between overflow-hidden"
            style={{ border: '2px solid #0f2942', backgroundColor: '#f8fafc' }}
          >
            {/* Header Banner */}
            <div
              className="py-1.5 px-2 text-center text-white"
              style={{ backgroundColor: '#0f2942' }}
            >
              <div className="text-xs font-black tracking-wider uppercase font-sans">
                CONSIGNMENT NOTE / BILTY
              </div>
              <div className="text-[10px] font-extrabold" style={{ fontFamily: "'Noto Sans Arabic', Arial" }}>
                با ضابطہ فریٹ بلٹی رسید
              </div>
            </div>

            {/* Meta Table Details */}
            <div className="p-1.5 space-y-1 text-[10.5px] font-bold">
              <div className="flex justify-between items-center border-b pb-0.5" style={{ borderColor: '#e2e8f0' }}>
                <span className="text-slate-500 font-medium">بلٹی نمبر (Bilty No):</span>
                <span className="font-black font-mono text-xs dir-ltr text-slate-900">{record.biltyNo}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-0.5" style={{ borderColor: '#e2e8f0' }}>
                <span className="text-slate-500 font-medium">تاریخ (Date):</span>
                <span className="font-bold font-mono text-[11px] dir-ltr text-slate-800">{record.date || '-'}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-0.5" style={{ borderColor: '#e2e8f0' }}>
                <span className="text-slate-500 font-medium">گاڑی نمبر (Vehicle No):</span>
                <span className="font-black font-mono text-xs dir-ltr text-slate-900">{record.vehicleNo}</span>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-slate-500 font-medium">طریقہ ادائیگی (Terms):</span>
                {isPaid ? (
                  <span className="px-2 py-0.5 rounded text-[9.5px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    PAID (ادا شدہ)
                  </span>
                ) : isAdvanceOnly ? (
                  <span className="px-2 py-0.5 rounded text-[9.5px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                    ADVANCE (پیشگی + بقایا)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[9.5px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                    TO BE PAID (بقایا بلٹی)
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. SENDER & RECEIVER BOXES (CONSIGNOR / CONSIGNEE) */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {/* Right / Consignor Box */}
        <div
          className="p-2.5 rounded-xs flex flex-col justify-between"
          style={{ border: '2px solid #0f2942', backgroundColor: '#ffffff' }}
        >
          <div
            className="font-black text-xs pb-1 mb-1.5 border-b-2 flex justify-between items-center"
            style={{ color: '#0f2942', borderColor: '#0f2942' }}
          >
            <span className="text-[12px]">مال بھیجنے والا (CONSIGNOR / SENDER)</span>
            <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-100 font-mono text-slate-700">کنسائنر</span>
          </div>
          <div className="space-y-1 font-bold text-[11px] text-slate-800">
            <div className="flex items-start justify-between">
              <span className="text-slate-500 font-normal shrink-0">نام (Name):</span>
              <span className="font-black text-slate-900 text-right">{record.senderName || record.consignor || '-'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-normal shrink-0">فون نمبر (Phone):</span>
              <span className="font-mono dir-ltr font-black text-slate-900">{record.senderMobile || '-'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-normal shrink-0">شناختی کارڈ (CNIC):</span>
              <span className="font-mono dir-ltr text-slate-800">{record.senderCnic || '-'}</span>
            </div>
            <div className="flex items-center justify-between pt-0.5 border-t border-slate-100">
              <span className="text-slate-500 font-normal shrink-0">روانگی مقام (Dispatch From):</span>
              <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">{record.sendingCity || '-'}</span>
            </div>
          </div>
        </div>

        {/* Left / Consignee Box */}
        <div
          className="p-2.5 rounded-xs flex flex-col justify-between"
          style={{ border: '2px solid #0f2942', backgroundColor: '#ffffff' }}
        >
          <div
            className="font-black text-xs pb-1 mb-1.5 border-b-2 flex justify-between items-center"
            style={{ color: '#0f2942', borderColor: '#0f2942' }}
          >
            <span className="text-[12px]">مال وصول کرنے والا (CONSIGNEE / RECEIVER)</span>
            <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-100 font-mono text-slate-700">کنسائنی</span>
          </div>
          <div className="space-y-1 font-bold text-[11px] text-slate-800">
            <div className="flex items-start justify-between">
              <span className="text-slate-500 font-normal shrink-0">نام (Name):</span>
              <span className="font-black text-slate-900 text-right">{record.receiverName || record.consignee || '-'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-normal shrink-0">فون نمبر (Phone):</span>
              <span className="font-mono dir-ltr font-black text-slate-900">{record.receiverMobile || '-'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-normal shrink-0">شناختی کارڈ (CNIC / NTN):</span>
              <span className="font-mono dir-ltr text-slate-800">-</span>
            </div>
            <div className="flex items-center justify-between pt-0.5 border-t border-slate-100">
              <span className="text-slate-500 font-normal shrink-0">منزل مقام (Destination Depot):</span>
              <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">{record.receivingCity || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. GOODS DESCRIPTION TABLE (جدولِ مال) */}
      <div className="mb-2 overflow-hidden rounded-xs" style={{ border: '2px solid #0f2942' }}>
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr
              className="font-black text-[11px] text-white"
              style={{ backgroundColor: '#0f2942' }}
            >
              <th className="p-2 border-l border-slate-600 w-12 text-center">Sr # (شمار)</th>
              <th className="p-2 border-l border-slate-600 w-28 text-center">No. of Pkgs (تعداد / نگ)</th>
              <th className="p-2 border-l border-slate-600 w-32 text-center">Packing Type (پیکنگ)</th>
              <th className="p-2 border-l border-slate-600 text-right">Description of Goods (تفصیلِ سامان)</th>
              <th className="p-2 border-l border-slate-600 w-28 text-center">Weight (وزن کلو)</th>
              <th className="p-2 w-28 text-center">Rate (ریٹ فی نگ/کلو)</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {/* Primary Cargo Row */}
            <tr className="font-bold text-[11px] text-slate-900 border-b border-slate-300">
              <td className="p-2 text-center border-l border-slate-300 font-mono">1</td>
              <td className="p-2 text-center border-l border-slate-300 font-mono font-black text-slate-900">
                {record.qty || '-'} {record.qty ? 'Pkgs' : ''}
              </td>
              <td className="p-2 text-center border-l border-slate-300 text-slate-700">
                بوری / کارٹن / مال
              </td>
              <td className="p-2 border-l border-slate-300 font-black text-slate-900">
                {record.itemDescription || 'جنرل کارگو ٹرانسپورٹ'}
              </td>
              <td className="p-2 text-center border-l border-slate-300 font-mono font-bold text-slate-900">
                {record.weight || '-'} {record.weight ? 'kg' : ''}
              </td>
              <td className="p-2 text-center font-mono text-slate-800">
                {record.total && record.qty ? `Rs ${(record.total / (parseFloat(record.qty) || 1)).toFixed(0)}` : '-'}
              </td>
            </tr>

            {/* Row 2 Placeholder */}
            <tr className="text-[11px] text-slate-400 border-b border-slate-200 bg-slate-50/50">
              <td className="p-1.5 text-center border-l border-slate-200 font-mono">2</td>
              <td className="p-1.5 text-center border-l border-slate-200">-</td>
              <td className="p-1.5 text-center border-l border-slate-200">-</td>
              <td className="p-1.5 border-l border-slate-200">-</td>
              <td className="p-1.5 text-center border-l border-slate-200">-</td>
              <td className="p-1.5 text-center">-</td>
            </tr>

            {/* Row 3 Placeholder */}
            <tr className="text-[11px] text-slate-400 border-b border-slate-200 bg-white">
              <td className="p-1.5 text-center border-l border-slate-200 font-mono">3</td>
              <td className="p-1.5 text-center border-l border-slate-200">-</td>
              <td className="p-1.5 text-center border-l border-slate-200">-</td>
              <td className="p-1.5 border-l border-slate-200">-</td>
              <td className="p-1.5 text-center border-l border-slate-200">-</td>
              <td className="p-1.5 text-center">-</td>
            </tr>

            {/* Summary Row */}
            <tr className="font-black text-xs bg-slate-100 text-slate-900 border-t-2 border-slate-900">
              <td className="p-2 text-center border-l border-slate-300 font-sans uppercase">TOTAL (ٹوٹل)</td>
              <td className="p-2 text-center border-l border-slate-300 font-mono font-black">
                {record.qty || '-'} {record.qty ? 'Pkgs' : ''}
              </td>
              <td colSpan={2} className="p-2 border-l border-slate-300 text-right text-[11px]">
                Total Actual Weight / Chargeable Weight (کل چارج ایبل وزن):
              </td>
              <td colSpan={2} className="p-2 text-center font-mono font-black text-slate-900">
                {record.weight || '-'} {record.weight ? 'kg' : ''}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. SPLIT GRID: FINANCIAL BREAKDOWN (LEFT) & TERMS & CONDITIONS (RIGHT) */}
      <div className="grid grid-cols-12 gap-2 mb-2 items-stretch">
        
        {/* Left Side: Financial Breakdown (5 Columns) */}
        <div
          className="col-span-5 p-2.5 rounded-xs flex flex-col justify-between"
          style={{ border: '2px solid #0f2942', backgroundColor: '#ffffff' }}
        >
          <div>
            <div
              className="font-black text-xs pb-1 mb-1.5 border-b-2 flex justify-between items-center"
              style={{ color: '#0f2942', borderColor: '#0f2942' }}
            >
              <span>مالیاتی تفصیلات (ACCOUNTS)</span>
              <span className="text-[9.5px] font-mono text-slate-500">PKR</span>
            </div>

            <div className="space-y-1 text-[11px] font-bold">
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                <span className="text-slate-600">بنیادی کرایہ (Freight Charges):</span>
                <span className="font-mono dir-ltr font-black text-slate-900">Rs {fmt(record.total)}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                <span className="text-slate-600">مزدوری / لوڈنگ (Labour Charges):</span>
                <span className="font-mono dir-ltr text-slate-700">Rs 0</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                <span className="text-slate-600">لوکل ڈیلیوری (Local Delivery):</span>
                <span className="font-mono dir-ltr text-slate-700">Rs 0</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                <span className="text-slate-600">سرچارج / دیگر (Surcharge):</span>
                <span className="font-mono dir-ltr text-slate-700">Rs 0</span>
              </div>
            </div>
          </div>

          <div className="pt-2 mt-1 space-y-1.5">
            {/* Grand Total Bar */}
            <div
              className="p-1.5 rounded-xs text-white flex justify-between items-center"
              style={{ backgroundColor: '#0f2942' }}
            >
              <span className="text-[11px] font-black uppercase">GRAND TOTAL (کل رقم):</span>
              <span className="text-sm font-mono font-black dir-ltr text-yellow-300">Rs {fmt(record.total)}</span>
            </div>

            {/* Advance & Balance */}
            <div className="grid grid-cols-2 gap-1.5 text-center font-bold text-[10.5px]">
              <div className="p-1 rounded-xs bg-slate-100 border border-slate-300">
                <span className="block text-[9px] text-slate-500 font-bold">پیشگی (Advance)</span>
                <span className="font-mono font-black text-slate-900 dir-ltr text-xs">Rs {fmt(record.advance)}</span>
              </div>
              <div className="p-1 rounded-xs bg-rose-50 border border-rose-300">
                <span className="block text-[9px] text-rose-800 font-black">بقایا (Balance Payable)</span>
                <span className="font-mono font-black text-rose-900 dir-ltr text-xs">Rs {fmt(record.payable)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Terms & Conditions (7 Columns) */}
        <div
          className="col-span-7 p-2.5 rounded-xs flex flex-col justify-between"
          style={{ border: '2px solid #0f2942', backgroundColor: '#ffffff' }}
        >
          <div>
            <div
              className="font-black text-xs pb-1 mb-1 border-b-2 flex justify-between items-center"
              style={{ color: '#0f2942', borderColor: '#0f2942' }}
            >
              <span className="text-[11.5px]">شرائط و ضوابط (TERMS & CONDITIONS)</span>
              <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">اہم ہدایات</span>
            </div>

            <ol className="list-decimal pr-3.5 space-y-0.5 font-semibold text-[9.5px] leading-tight text-justify text-slate-800">
              {termsList.map((term, idx) => (
                <li key={idx} className="leading-tight">{term}</li>
              ))}
            </ol>
          </div>

          <div className="mt-1 pt-1 border-t border-dashed border-slate-300 flex items-center justify-between text-[9px] font-black text-rose-700">
            <span>⚠️ اوورلوڈ، چالان و جرمانہ بدمعہ بیوپاری ہوگا۔</span>
            <span className="text-slate-900">🛑 بغیر اصل بلٹی مال ہرگز وصول نہ کریں۔</span>
          </div>
        </div>

      </div>

      {/* 5. DRIVER DETAILS BAR */}
      <div
        className="p-1.5 mb-2 rounded-xs font-bold text-[10.5px] flex items-center justify-between text-slate-800"
        style={{ border: '2px solid #0f2942', backgroundColor: '#f8fafc' }}
      >
        <div>
          <span className="text-slate-500 font-normal">ڈرائیور کا نام (Driver Name):</span>{' '}
          <span className="font-black text-slate-900">{record.driverName || '-'}</span>
        </div>
        <div className="border-r border-slate-300 pr-2">
          <span className="text-slate-500 font-normal">موبائل نمبر (Cell):</span>{' '}
          <span className="font-mono dir-ltr font-black text-slate-900">{record.mobileNo || '-'}</span>
        </div>
        <div className="border-r border-slate-300 pr-2">
          <span className="text-slate-500 font-normal">لائسنس نمبر (License):</span>{' '}
          <span className="font-mono dir-ltr text-slate-800">-</span>
        </div>
        <div className="border-r border-slate-300 pr-2">
          <span className="text-slate-500 font-normal">گیٹ پاس / ٹوکن:</span>{' '}
          <span className="font-mono dir-ltr text-slate-800">{record.biltyNo}</span>
        </div>
      </div>

      {/* 6. BOTTOM SIGNATURES & VERIFICATION (3 BOXES) */}
      <div className="grid grid-cols-3 gap-2 items-stretch">
        
        {/* Box 1: Consignor Signature */}
        <div
          className="p-2 text-center flex flex-col justify-between rounded-xs min-h-[76px]"
          style={{ border: '2px solid #0f2942', backgroundColor: '#ffffff' }}
        >
          <div className="flex-1 flex items-end justify-center pb-1">
            <div className="border-b-2 border-dashed w-4/5 text-[9px] italic text-slate-400">
              (دستخط / مہر مال بھیجنے والا)
            </div>
          </div>
          <div className="border-t border-slate-200 pt-1 font-black text-[11px] text-slate-900">
            Consignor Signature / Stamp
          </div>
        </div>

        {/* Box 2: Driver / Carrying Agent */}
        <div
          className="p-2 text-center flex flex-col justify-between rounded-xs min-h-[76px]"
          style={{ border: '2px solid #0f2942', backgroundColor: '#ffffff' }}
        >
          <div className="flex-1 flex items-end justify-center pb-1">
            <div className="border-b-2 border-dashed w-4/5 text-[9px] italic text-slate-400">
              (ڈرائیور / کیرئیر کا فزیکل سائن)
            </div>
          </div>
          <div className="border-t border-slate-200 pt-1 font-black text-[11px] text-slate-900">
            Driver / Carrying Agent
          </div>
        </div>

        {/* Box 3: Authorized Signature & Stamp with Zahdan Nasr Signature & QR Code */}
        <div
          className="p-1.5 text-center flex flex-row items-center justify-between gap-2 rounded-xs min-h-[76px]"
          style={{ border: '2px solid #0f2942', backgroundColor: '#f8fafc' }}
        >
          {/* Digital Signature */}
          <div className="flex-1 flex flex-col items-center justify-between h-full py-0.5">
            <ZahdanSignatureSvg className="w-32 h-8 inline-block" />
            <div className="border-t border-slate-300 pt-0.5 w-full font-black text-[10px] text-slate-900">
              Authorized Stamp (زاہدان نصر)
            </div>
          </div>

          {/* QR Code */}
          <div className="shrink-0 flex flex-col items-center justify-center pl-1 border-r border-slate-300">
            {activeQrUrl ? (
              <img
                src={activeQrUrl}
                alt="QR Verification"
                className="p-0.5 rounded-2xs"
                style={{
                  width: '54px',
                  height: '54px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #0f2942',
                  imageRendering: 'pixelated',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-slate-100 border border-slate-300 flex items-center justify-center text-[8px] font-mono">
                QR
              </div>
            )}
            <div className="text-[7.5px] font-black uppercase text-emerald-800 mt-0.5">
              VERIFIED BILTY
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

