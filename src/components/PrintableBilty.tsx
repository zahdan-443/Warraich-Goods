import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { BiltyRecord } from '../types';
import { getCachedCompanyProfile } from '../utils/storage';
import { logoIconData } from '../assets/dashboardIcons';

interface PrintableBiltyProps {
  record: BiltyRecord;
  qrDataUrl?: string;
}

export const ZahdanSignatureSvg: React.FC<{ className?: string }> = ({ className = "w-44 h-14 inline-block" }) => (
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
        company.nameEn || `WARRAICH GOODS TRANSPORT CO.`,
        `Bilty No: ${record.biltyNo}`,
        `Date: ${record.date || '-'}`,
        `Vehicle: ${record.vehicleNo}`,
        `Route: ${record.sendingCity || '-'} to ${record.receivingCity || '-'}`,
        `Sender: ${record.senderName || record.consignor || '-'} (${record.senderMobile || '-'})`,
        `Receiver: ${record.receiverName || record.consignee || '-'} (${record.receiverMobile || '-'})`,
        `Goods: ${record.itemDescription || '-'} (${record.qty || '-'} Pcs)`,
        `Weight: ${record.weight || '-'} KG`,
        `Freight: Rs ${record.total ? record.total.toLocaleString('en-US') : '0'}`,
        `Payable: Rs ${record.payable ? record.payable.toLocaleString('en-US') : '0'}`,
        `Helpline: ${company.phoneNumbers || '0300-5370443 | 0339-5370443'}`,
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

  const termsList = [
    "بیوپاری کو چاہیے کہ مال وصول کرتے وقت اچھی طرح ملاحظہ کرے۔",
    "مال کو گاڑی میں بحفاظت لوڈ کرنے اور منزل پر ان لوڈ کرنے کی مکمل ذمہ داری اور لیبر کا خرچ متعلقہ پارٹی کا ہوگا۔",
    "فل ٹرک لوڈ کی صورت میں اگر روانگی کے وقت لگائی گئی سیل یا ترپال منزل پر درست حالت میں ہے، تو راستے میں مال کی کسی ڈیمیج کی کمپنی ذمہ دار نہ ہوگی۔",
    "انڈوں، تیل، گھی، مربہ جات و دیگر مال کے رسنے، ضائع ہونے یا لیک ہونے کی کمپنی ذمہ دار نہ ہوگی۔ محفوظ اور معیاری پیکنگ بھیجنے والے کی ذمہ داری ہے۔ راستے میں سڑک کی خرابی، جھٹکوں، اتفاقیہ حادثہ یا موسم (گرمی/دھند) کی وجہ سے انڈوں یا دیگر سامان کی ٹوٹ پھوٹ یا خرابی کی ٹرانسپورٹ کمپنی ہرگز ذمہ دار نہیں ہوگی۔",
    "قدرتی آفات، دھند، ہڑتال، ٹریفک جام یا سڑک بند ہونے کی وجہ سے گاڑی لیٹ ہونے پر مال کے خراب ہونے یا مارکیٹ ریٹ گرنے کا ٹیم کلیم قبول نہیں کرے گی۔",
    "بلٹی پر لکھے گئے مال سے ہٹ کر کوئی غیر قانونی چیز نکلنے، یا مقررہ حد سے زیادہ وزن ہونے پر اضافی کرایہ، تمام تر قانونی ذمہ داری، جرمانہ (چالان) اور گاڑی بند ہونے کا نقصان بلنگ کروانے والی پارٹی ادا کرے گی۔",
    "منزل پر پہنچنے کے 24 گھنٹے کے اندر گاڑی خالی کرنا لازمی ہے۔ اس کے بعد روزانہ کے حساب سے ڈیمرج وصول کیا جائے گا۔",
    "جس مال کے ہمراہ بیوپاری یا اس کا نمائندہ خود موجود ہوگا، اس مال کے کسی قسم کے نقصان کی کمپنی ذمہ دار نہ ہوگی۔",
    "کسی بھی تنازعے یا کلیم کی صورت میں حتمی فیصلہ ٹرانسپورٹ کمپنی کے دفتر میں باہمی رضامندی سے طے کیا جائے گا۔"
  ];

  return (
    <div
      dir="rtl"
      className="printable-bilty-container p-5 w-[794px] h-[1123px] mx-auto bg-white text-slate-900 border-2 border-slate-900 font-sans text-xs box-border flex flex-col justify-between print:p-2 print:w-full print:h-auto print:border-none"
      style={{
        backgroundColor: '#ffffff',
        color: '#0f172a',
        border: '2px solid #0f172a',
        fontFamily: "'Noto Sans Arabic', Arial, sans-serif",
        lineHeight: '1.35',
        width: '794px',
        height: '1123px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700;800;900&display=swap');
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
            padding: 12px !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }
        .printable-bilty-container {
          font-family: 'Noto Sans Arabic', Arial, sans-serif !important;
        }
        .printable-bilty-container * {
          box-sizing: border-box !important;
        }
      `}</style>

      {/* 1. HEADER SECTION (لوگو، کمپنی کا نام، NTN، مالکانہ معلومات اور ایڈریس) */}
      <div className="pb-2.5 mb-2 border-b-2" style={{ borderColor: '#0f172a' }}>
        <div className="flex flex-row items-center justify-between gap-3 text-right">
          
          {/* Logo & Company Title Right/Center */}
          <div className="flex items-center gap-3">
            <img
              src={logoIconData}
              alt="وڑائچ گڈز لوگو"
              className="rounded-full p-0.5 shrink-0"
              style={{
                width: '64px',
                height: '64px',
                minWidth: '64px',
                minHeight: '64px',
                maxWidth: '64px',
                maxHeight: '64px',
                backgroundColor: '#ffffff',
                border: '2px solid #f59e0b',
                objectFit: 'contain'
              }}
            />
            <div className="flex flex-col justify-center text-right">
              {/* Company Name in Urdu with clean Noto Sans Arabic styling */}
              <h1
                className="text-xl font-black"
                style={{
                  fontFamily: "'Noto Sans Arabic', Arial, sans-serif",
                  lineHeight: '1.25',
                  color: '#0f172a',
                  margin: '0 0 2px 0',
                  padding: '0',
                  display: 'block'
                }}
              >
                {company.nameUr || 'وڑائچ گڈز ٹرانسپورٹ کمپنی (رجسٹرڈ)'}
              </h1>

              {/* Tagline */}
              <p
                className="text-[10.5px] font-bold"
                style={{
                  fontFamily: "'Noto Sans Arabic', Arial, sans-serif",
                  lineHeight: '1.25',
                  color: '#334155',
                  margin: '0 0 3px 0',
                  display: 'block'
                }}
              >
                {company.taglineUr || 'ملک بھر میں ہر قسم کے سامان کی محفوظ اور قابل اعتماد ٹرانسپورٹ سروس'}
              </p>

              {/* NTN Number Badge & Head Office */}
              <div className="flex flex-row items-center gap-2 justify-start" style={{ marginTop: '2px' }}>
                <span
                  className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold font-mono dir-ltr"
                  style={{ backgroundColor: '#f1f5f9', border: '1px solid #94a3b8', color: '#0f172a' }}
                >
                  این ٹی این نمبر: {company.ntn || '7779394-1'}
                </span>
                <span className="text-[10px] font-extrabold" style={{ color: '#1e293b' }}>
                  📍 <strong>ہیڈ آفس:</strong> {company.headOfficeUr || 'سمندری، فیصل آباد'}
                </span>
              </div>
            </div>
          </div>

          {/* Chief Executive / Proprietor & Mobile Numbers */}
          <div
            className="p-2 text-center rounded-xs shrink-0 w-[190px]"
            style={{ backgroundColor: '#f8fafc', border: '2px solid #0f172a' }}
          >
            <div className="text-[10.5px] font-black" style={{ color: '#be123c', lineHeight: '1.25' }}>
              چیف ایگزیکٹو: <span style={{ color: '#0f172a', fontWeight: '900' }}>{company.ownerName || 'زاہدان نصر وڑائچ'}</span>
            </div>
            {company.phoneNumbers ? (
              company.phoneNumbers.split(',').map((num, idx) => (
                <div key={idx} className="text-[11px] font-black font-mono dir-ltr" style={{ color: idx === 0 ? '#0f172a' : '#334155', marginTop: '1px', lineHeight: '1.2' }}>
                  {num.trim()}
                </div>
              ))
            ) : (
              <>
                <div className="text-[11px] font-black font-mono dir-ltr" style={{ color: '#0f172a', marginTop: '2px', lineHeight: '1.2' }}>
                  0300-5370443
                </div>
                <div className="text-[11px] font-black font-mono dir-ltr" style={{ color: '#334155', marginTop: '1px', lineHeight: '1.2' }}>
                  0339-5370443
                </div>
              </>
            )}
            <div
              className="mt-1 text-[8.5px] font-black px-1.5 py-0.2 rounded-2xs uppercase"
              style={{ backgroundColor: '#f59e0b', color: '#020617' }}
            >
              فون نمبرز
            </div>
          </div>

        </div>

        {/* Sub-Header Document Badge */}
        <div className="text-center mt-2 pt-1 border-t" style={{ borderColor: '#cbd5e1' }}>
          <span
            className="inline-block text-xs font-black px-4 py-0.5 rounded-full uppercase tracking-wider"
            style={{ backgroundColor: '#1e293b', color: '#ffffff' }}
          >
            با ضابطہ فریٹ بلٹی رسید
          </span>
        </div>
      </div>

      {/* 2. TOP ROW (Grid): بلٹی نمبر، تاریخ، از (روانگی)، تا (منزل) */}
      <div
        className="grid grid-cols-4 mb-2 text-center font-bold text-xs"
        style={{ backgroundColor: '#f8fafc', border: '2px solid #0f172a' }}
      >
        <div className="p-1.5 border-l-2" style={{ borderColor: '#0f172a' }}>
          <span className="block text-[9.5px] font-black" style={{ color: '#475569' }}>بلٹی نمبر</span>
          <span className="font-black text-sm font-mono dir-ltr inline-block" style={{ color: '#0f172a' }}>{record.biltyNo}</span>
        </div>
        <div className="p-1.5 border-l-2" style={{ borderColor: '#0f172a' }}>
          <span className="block text-[9.5px] font-black" style={{ color: '#475569' }}>تاریخ</span>
          <span className="font-bold font-mono dir-ltr inline-block text-xs" style={{ color: '#0f172a' }}>{record.date || '-'}</span>
        </div>
        <div className="p-1.5 border-l-2" style={{ borderColor: '#0f172a' }}>
          <span className="block text-[9.5px] font-black" style={{ color: '#475569' }}>از (روانگی)</span>
          <span className="font-bold text-xs" style={{ color: '#0f172a' }}>{record.sendingCity || '-'}</span>
        </div>
        <div className="p-1.5">
          <span className="block text-[9.5px] font-black" style={{ color: '#475569' }}>تا (منزل)</span>
          <span className="font-bold text-xs" style={{ color: '#0f172a' }}>{record.receivingCity || '-'}</span>
        </div>
      </div>

      {/* 3. SECOND ROW (Split Column): بھیجنے والا (کنسائنر) & وصول کرنے والا (کنسائنی) */}
      <div
        className="grid grid-cols-2 mb-2 text-xs"
        style={{ backgroundColor: '#ffffff', border: '2px solid #0f172a' }}
      >
        {/* Right / First Column: بھیجنے والا (کنسائنر) */}
        <div className="p-2 border-l-2" style={{ borderColor: '#0f172a' }}>
          <div className="font-black text-xs border-b-2 pb-0.5 mb-1 flex justify-between items-center" style={{ color: '#0f172a', borderColor: '#0f172a' }}>
            <span>بھیجنے والا (کنسائنر)</span>
            <span className="text-[9.5px] font-bold" style={{ color: '#475569' }}>CONSIGNOR</span>
          </div>
          <div className="space-y-0.5 font-bold text-[11px]" style={{ color: '#0f172a' }}>
            <div>
              <span style={{ color: '#475569', fontWeight: 'normal' }}>نام:</span>{' '}
              <span>{record.senderName || record.consignor || '-'}</span>
            </div>
            <div>
              <span style={{ color: '#475569', fontWeight: 'normal' }}>فون نمبر:</span>{' '}
              <span className="font-mono dir-ltr inline-block">{record.senderMobile || '-'}</span>
            </div>
            <div>
              <span style={{ color: '#475569', fontWeight: 'normal' }}>شناختی کارڈ (CNIC):</span>{' '}
              <span className="font-mono dir-ltr inline-block">{record.senderCnic || '-'}</span>
            </div>
          </div>
        </div>

        {/* Left / Second Column: وصول کرنے والا (کنسائنی) */}
        <div className="p-2">
          <div className="font-black text-xs border-b-2 pb-0.5 mb-1 flex justify-between items-center" style={{ color: '#0f172a', borderColor: '#0f172a' }}>
            <span>وصول کرنے والا (کنسائنی)</span>
            <span className="text-[9.5px] font-bold" style={{ color: '#475569' }}>CONSIGNEE</span>
          </div>
          <div className="space-y-0.5 font-bold text-[11px]" style={{ color: '#0f172a' }}>
            <div>
              <span style={{ color: '#475569', fontWeight: 'normal' }}>نام:</span>{' '}
              <span>{record.receiverName || record.consignee || '-'}</span>
            </div>
            <div>
              <span style={{ color: '#475569', fontWeight: 'normal' }}>فون نمبر:</span>{' '}
              <span className="font-mono dir-ltr inline-block">{record.receiverMobile || '-'}</span>
            </div>
            <div>
              <span style={{ color: '#475569', fontWeight: 'normal' }}>منزل شہر:</span>{' '}
              <span>{record.receivingCity || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. THIRD ROW: گاڑی نمبر، ڈرائیور کا نام، فون نمبر */}
      <div
        className="grid grid-cols-3 mb-2 text-center font-bold text-xs"
        style={{ backgroundColor: '#f8fafc', border: '2px solid #0f172a' }}
      >
        <div className="p-1.5 border-l-2" style={{ borderColor: '#0f172a' }}>
          <span className="block text-[9.5px] font-black" style={{ color: '#475569' }}>گاڑی نمبر</span>
          <span className="font-black text-sm font-mono dir-ltr inline-block" style={{ color: '#0f172a' }}>{record.vehicleNo}</span>
        </div>
        <div className="p-1.5 border-l-2" style={{ borderColor: '#0f172a' }}>
          <span className="block text-[9.5px] font-black" style={{ color: '#475569' }}>ڈرائیور کا نام</span>
          <span className="font-bold text-xs" style={{ color: '#0f172a' }}>{record.driverName || '-'}</span>
        </div>
        <div className="p-1.5">
          <span className="block text-[9.5px] font-black" style={{ color: '#475569' }}>فون نمبر</span>
          <span className="font-bold font-mono dir-ltr inline-block text-xs" style={{ color: '#0f172a' }}>{record.mobileNo || '-'}</span>
        </div>
      </div>

      {/* 5. GOODS SECTION: جدول مال (شمار، تعداد، تفصیل مال، وزن) */}
      <div className="mb-2 overflow-hidden" style={{ border: '2px solid #0f172a' }}>
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="font-black text-[11px] border-b-2" style={{ backgroundColor: '#1e293b', color: '#ffffff', borderColor: '#1e293b' }}>
              <th className="p-1.5 border-l w-10 text-center" style={{ borderColor: '#475569', color: '#ffffff' }}>شمار</th>
              <th className="p-1.5 border-l w-28 text-center" style={{ borderColor: '#475569', color: '#ffffff' }}>تعداد (نپ/نوش)</th>
              <th className="p-1.5 border-l" style={{ borderColor: '#475569', color: '#ffffff' }}>تفصیلِ مال</th>
              <th className="p-1.5 text-center w-28" style={{ color: '#ffffff' }}>وزن (کلوگرام)</th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#ffffff' }}>
            <tr className="font-bold text-[11px]" style={{ color: '#0f172a', borderTop: '1px solid #cbd5e1' }}>
              <td className="p-1.5 text-center border-l font-mono" style={{ borderColor: '#cbd5e1' }}>1</td>
              <td className="p-1.5 text-center border-l font-mono" style={{ borderColor: '#cbd5e1' }}>{record.qty || '-'}</td>
              <td className="p-1.5 border-l font-bold" style={{ borderColor: '#cbd5e1', color: '#0f172a' }}>{record.itemDescription || '-'}</td>
              <td className="p-1.5 text-center font-mono">{record.weight || '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 6. FREIGHT DETAILS: کرایہ کی تفصیلات (کل کرایہ، ایڈوانس، بقایا) */}
      <div className="mb-2 p-2" style={{ backgroundColor: '#f8fafc', border: '2px solid #0f172a' }}>
        <div className="font-black text-xs border-b pb-0.5 mb-1.5 flex justify-between items-center" style={{ color: '#0f172a', borderColor: '#cbd5e1' }}>
          <span>کرایہ کی تفصیلات</span>
          <span className="text-[9.5px] font-bold" style={{ color: '#475569' }}>FREIGHT DETAILS</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center font-bold">
          <div className="p-1.5 rounded-xs" style={{ backgroundColor: '#ffffff', border: '1px solid #94a3b8' }}>
            <span className="block text-[9.5px] font-black" style={{ color: '#475569' }}>کل کرایہ (روپے)</span>
            <span className="font-black text-sm font-mono dir-ltr inline-block" style={{ color: '#0f172a' }}>
              Rs {fmt(record.total)}
            </span>
          </div>
          <div className="p-1.5 rounded-xs" style={{ backgroundColor: '#ffffff', border: '1px solid #94a3b8' }}>
            <span className="block text-[9.5px] font-black" style={{ color: '#475569' }}>ایڈوانس (روپے)</span>
            <span className="font-black text-sm font-mono dir-ltr inline-block" style={{ color: '#0f172a' }}>
              Rs {fmt(record.advance)}
            </span>
          </div>
          <div className="p-1.5 rounded-xs" style={{ backgroundColor: '#1e293b', color: '#ffffff', border: '1px solid #1e293b' }}>
            <span className="block text-[9.5px] font-black" style={{ color: '#e2e8f0' }}>بقایا (روپے)</span>
            <span className="font-black text-sm font-mono dir-ltr inline-block" style={{ color: '#fef08a' }}>
              Rs {fmt(record.payable)}
            </span>
          </div>
        </div>
      </div>

      {/* 7. TERMS & CONDITIONS SECTION (شرائط و ضوابط) */}
      <div className="p-2 mb-2 text-[9.5px] leading-snug" style={{ backgroundColor: '#ffffff', border: '2px solid #0f172a' }}>
        <div className="font-black text-xs border-b pb-0.5 mb-1 flex justify-between items-center" style={{ color: '#be123c', borderColor: '#cbd5e1' }}>
          <span>شرائط و ضوابط:</span>
          <span className="text-[9px] font-bold" style={{ color: '#475569' }}>TERMS & CONDITIONS</span>
        </div>
        <ol className="list-decimal pr-3.5 space-y-0.5 font-semibold text-justify" style={{ color: '#0f172a' }}>
          {termsList.map((term, idx) => (
            <li key={idx}>{term}</li>
          ))}
        </ol>
        <div className="mt-1.5 pt-1 border-t border-dashed font-black text-[9.5px] flex items-center justify-between" style={{ borderColor: '#cbd5e1', color: '#9f1239' }}>
          <span>⚠️ اورلوڈ، چالان، جرمانہ وخرچہ بدمعہ بیوپاری ہوگا</span>
          <span style={{ color: '#0f172a' }}>🛑 بغیر بلٹی مال ہرگز نہ دیں۔</span>
        </div>
      </div>

      {/* 8. FOOTER SECTION: SIGNATURES & QR CODE AT RIGHT SIDE */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t-2 items-stretch" style={{ borderColor: '#0f172a' }}>
        
        {/* Box 1: دستخط ڈرائیور */}
        <div className="p-2 text-center flex flex-col justify-between min-h-[75px]" style={{ backgroundColor: '#ffffff', border: '2px solid #0f172a' }}>
          <div className="flex-1 flex items-end justify-center pb-1">
            <div className="border-b-2 border-dashed w-4/5 text-[9px] italic" style={{ borderColor: '#94a3b8', color: '#94a3b8' }}>
              (ڈرائیور کا فزیکل سائن)
            </div>
          </div>
          <div className="border-t pt-0.5 font-black text-xs" style={{ borderColor: '#cbd5e1', color: '#0f172a' }}>
            دستخط ڈرائیور
          </div>
        </div>

        {/* Box 2: دستخط مینیجر WITH ARTISTIC ZAHDAN SIGNATURE */}
        <div className="p-1.5 text-center flex flex-col justify-between min-h-[75px] relative overflow-hidden" style={{ backgroundColor: '#f8fafc', border: '2px solid #0f172a' }}>
          <div className="flex-1 flex items-center justify-center relative py-0.5">
            <ZahdanSignatureSvg className="w-36 h-10 inline-block" />
          </div>
          <div className="border-t-2 pt-0.5 font-black text-xs flex items-center justify-center gap-1" style={{ borderColor: '#0f172a', color: '#0f172a' }}>
            <span>دستخط مینیجر</span>
            <span className="text-[9.5px] font-extrabold" style={{ color: '#334155' }}>(زاہدان نصر وڑائچ)</span>
          </div>
        </div>

        {/* Box 3: QR CODE AT RIGHT SIDE OF SIGNATURE */}
        <div className="p-1.5 text-center flex flex-col items-center justify-center min-h-[75px]" style={{ backgroundColor: '#ffffff', border: '2px solid #0f172a' }}>
          {activeQrUrl ? (
            <img
              src={activeQrUrl}
              alt="Bilty QR Verification"
              className="p-0.5 rounded-2xs mb-0.5"
              style={{
                width: '76px',
                height: '76px',
                minWidth: '76px',
                minHeight: '76px',
                maxWidth: '76px',
                maxHeight: '76px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #0f172a',
                imageRendering: 'pixelated',
                objectFit: 'contain'
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-2xs flex items-center justify-center text-[9px] font-mono mb-0.5" style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', color: '#64748b' }}>
              QR CODE
            </div>
          )}
          <div className="text-[8px] font-black px-1.5 py-0.2 rounded-2xs uppercase tracking-wider mb-0.5" style={{ backgroundColor: '#047857', color: '#ffffff' }}>
            VERIFIED BUILTY
          </div>
          <div className="text-[8.5px] font-black tracking-tight" style={{ color: '#065f46' }}>
            آن لائن تصدیق
          </div>
        </div>

      </div>

    </div>
  );
};
