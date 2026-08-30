import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { BiltyRecord } from '../types';
import { getCachedCompanyProfile } from '../utils/storage';
import { logoIconData } from '../assets/dashboardIcons';
import { getLogoBase64 } from '../utils/pdfHelper';
import { AlHadiLogo } from './AlHadiLogo';

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
  const [resolvedLogo, setResolvedLogo] = useState<string>('');
  const [logoFailed, setLogoFailed] = useState<boolean>(false);
  const company = getCachedCompanyProfile();

  useEffect(() => {
    let isMounted = true;
    getLogoBase64().then((b64) => {
      if (isMounted && b64) {
        setResolvedLogo(b64);
      }
    });
    return () => { isMounted = false; };
  }, []);

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
    "انڈوں، تیل، گھی، مربہ جات و دیگر مال کے رسنے، ضائع ہونے یا لیک ہونے کی کمپنی ذمہ دار نہ ہوگی۔ محفوظ اور معیاری پیکنگ بھیجنے والے کی ذمہ داری ہے۔ راستے میں سڑک کی خرابی، جھٹکوں، اتفاقیہ حادثہ یا موسم کی وجہ سے سامان کی ٹوٹ پھوٹ کی ٹرانسپورٹ کمپنی ذمہ دار نہ ہوگی۔",
    "قدرتی آفات، دھند، ہڑتال، ٹریفک جام یا سڑک بند ہونے کی وجہ سے گاڑی لیٹ ہونے پر مال کے خراب ہونے یا مارکیٹ ریٹ گرنے کا کلیم قبول نہیں ہوگا۔",
    "بلٹی پر درج مال سے ہٹ کر کوئی غیر قانونی چیز نکلنے یا مقررہ حد سے زائد وزن ہونے پر اضافی کرایہ، تمام تر قانونی ذمہ داری، جرمانہ و چالان پارٹی ادا کرے گی۔",
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
      id="printable-bilty-inner"
      className="printable-bilty-container mx-auto box-border flex flex-col justify-between"
      style={{
        backgroundColor: '#ffffff',
        color: '#0f172a',
        border: '2px solid #0f2942',
        fontFamily: "'Noto Sans Arabic', 'Plus Jakarta Sans', 'Inter', Arial, sans-serif",
        lineHeight: '1.3',
        width: '794px',
        height: '1123px',
        minWidth: '794px',
        maxWidth: '794px',
        minHeight: '1123px',
        maxHeight: '1123px',
        padding: '20px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <style>{`
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
            padding: 16px !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }
        .printable-bilty-container * {
          box-sizing: border-box !important;
        }
      `}</style>

      {/* 1. TOP HEADER (BRANDING & CONSIGNMENT NOTE CARD) */}
      <div style={{ paddingBottom: '10px', marginBottom: '8px', borderBottom: '2px solid #0f2942' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between', gap: '12px', textAlign: 'right' }}>
          
          {/* Left / Main Branding Block */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 0%' }}>
            {!logoFailed ? (
              <img
                src={resolvedLogo || logoIconData}
                alt="Warraich Goods Transport Company Official Logo"
                width={64}
                height={64}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.triedBackup) {
                    target.dataset.triedBackup = '1';
                    target.src = './logo.png';
                  } else if (!target.dataset.triedIcon) {
                    target.dataset.triedIcon = '1';
                    target.src = './app-icon.png';
                  } else {
                    setLogoFailed(true);
                  }
                }}
                style={{
                  width: '68px',
                  height: '68px',
                  minWidth: '68px',
                  minHeight: '68px',
                  maxWidth: '68px',
                  maxHeight: '68px',
                  borderRadius: '50%',
                  padding: '2px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #8b9d77',
                  objectFit: 'contain',
                  flexShrink: 0
                }}
              />
            ) : (
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  minWidth: '68px',
                  minHeight: '68px',
                  borderRadius: '50%',
                  padding: '4px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #8b9d77',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <AlHadiLogo className="w-14 h-14" />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'right' }}>
              {/* Urdu Big Title */}
              <h1
                style={{
                  fontFamily: "'Noto Sans Arabic', 'Noto Nastaliq Urdu', Arial, sans-serif",
                  fontSize: '22px',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  lineHeight: '1.2',
                  color: '#0f2942',
                  margin: '0 0 2px 0',
                  padding: '0'
                }}
              >
                {company.nameUr || 'وڑائچ گڈز ٹرانسپورٹ کمپنی (رجسٹرڈ)'}
              </h1>

              {/* English Subtitle */}
              <div style={{ fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.05em', color: '#334155', textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
                {company.nameEn || 'WARRAICH GOODS TRANSPORT CO.'}
              </div>

              {/* Tagline / Sub-description */}
              <p
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#475569',
                  marginTop: '2px',
                  marginBottom: '0',
                  fontFamily: "'Noto Sans Arabic', Arial, sans-serif"
                }}
              >
                {company.taglineUr || 'ملک بھر میں مال برداری و لاجسٹکس سروس | آل پاکستان روڈ فریٹ'}
              </p>

              {/* Head Office & Phone Helpline */}
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '10px', fontWeight: 700, color: '#1e293b' }}>
                <span>📍 <strong>ہیڈ آفس:</strong> {company.headOfficeUr || 'سمندری، فیصل آباد'}</span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span>📞 <strong>ہیلپ لائن:</strong> <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', display: 'inline-block' }}>0300-5370443, 0339-5370443</span></span>
              </div>
            </div>
          </div>

          {/* Right Navy Block: CONSIGNMENT NOTE / BILTY */}
          <div
            style={{
              width: '240px',
              border: '2px solid #0f2942',
              backgroundColor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            {/* Header Banner */}
            <div
              style={{
                backgroundColor: '#0f2942',
                color: '#ffffff',
                padding: '6px 8px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
                CONSIGNMENT NOTE / BILTY
              </div>
              <div style={{ fontSize: '10.5px', fontWeight: 800, fontFamily: "'Noto Sans Arabic', Arial, sans-serif" }}>
                با ضابطہ فریٹ بلٹی رسید
              </div>
            </div>

            {/* Meta Table Details */}
            <div style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 700, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>بلٹی نمبر (Bilty No):</span>
                <span style={{ fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', direction: 'ltr', color: '#0f172a' }}>{record.biltyNo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>تاریخ (Date):</span>
                <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', direction: 'ltr', color: '#1e293b' }}>{record.date || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>گاڑی نمبر (Vehicle No):</span>
                <span style={{ fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', direction: 'ltr', color: '#0f172a' }}>{record.vehicleNo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>طریقہ ادائیگی (Terms):</span>
                {isPaid ? (
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '9.5px', fontWeight: 900, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}>
                    PAID (ادا شدہ)
                  </span>
                ) : isAdvanceOnly ? (
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '9.5px', fontWeight: 900, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}>
                    ADVANCE (پیشگی + بقایا)
                  </span>
                ) : (
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '9.5px', fontWeight: 900, backgroundColor: '#ffe4e6', color: '#9f1239', border: '1px solid #fda4af' }}>
                    TO BE PAID (بقایا بلٹی)
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. SENDER & RECEIVER BOXES (CONSIGNOR / CONSIGNEE) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', marginBottom: '8px' }}>
        {/* Right / Consignor Box */}
        <div
          style={{
            border: '2px solid #0f2942',
            backgroundColor: '#ffffff',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div
            style={{
              fontWeight: 900,
              fontSize: '12px',
              paddingBottom: '4px',
              marginBottom: '6px',
              borderBottom: '2px solid #0f2942',
              color: '#0f2942',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>مال بھیجنے والا (CONSIGNOR / SENDER)</span>
            <span style={{ fontSize: '9.5px', padding: '1px 6px', borderRadius: '3px', backgroundColor: '#f1f5f9', fontFamily: "'JetBrains Mono', monospace", color: '#334155' }}>کنسائنر</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: 700, fontSize: '11px', color: '#1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>نام (Name):</span>
              <span style={{ fontWeight: 900, color: '#0f172a', textAlign: 'right' }}>{record.senderName || record.consignor || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>فون نمبر (Phone):</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', fontWeight: 900, color: '#0f172a' }}>{record.senderMobile || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>شناختی کارڈ (CNIC):</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', color: '#334155' }}>{record.senderCnic || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '3px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>روانگی مقام (Dispatch From):</span>
              <span style={{ fontWeight: 900, color: '#0f172a', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '3px', fontSize: '11px' }}>{record.sendingCity || '-'}</span>
            </div>
          </div>
        </div>

        {/* Left / Consignee Box */}
        <div
          style={{
            border: '2px solid #0f2942',
            backgroundColor: '#ffffff',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div
            style={{
              fontWeight: 900,
              fontSize: '12px',
              paddingBottom: '4px',
              marginBottom: '6px',
              borderBottom: '2px solid #0f2942',
              color: '#0f2942',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>مال وصول کرنے والا (CONSIGNEE / RECEIVER)</span>
            <span style={{ fontSize: '9.5px', padding: '1px 6px', borderRadius: '3px', backgroundColor: '#f1f5f9', fontFamily: "'JetBrains Mono', monospace", color: '#334155' }}>کنسائنی</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: 700, fontSize: '11px', color: '#1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>نام (Name):</span>
              <span style={{ fontWeight: 900, color: '#0f172a', textAlign: 'right' }}>{record.receiverName || record.consignee || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>فون نمبر (Phone):</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', fontWeight: 900, color: '#0f172a' }}>{record.receiverMobile || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>شناختی کارڈ (CNIC / NTN):</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', color: '#334155' }}>-</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '3px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>منزل مقام (Destination Depot):</span>
              <span style={{ fontWeight: 900, color: '#0f172a', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '3px', fontSize: '11px' }}>{record.receivingCity || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. GOODS DESCRIPTION TABLE (جدولِ مال) */}
      <div style={{ marginBottom: '8px', overflow: 'hidden', border: '2px solid #0f2942' }}>
        <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ fontWeight: 900, fontSize: '11px', color: '#ffffff', backgroundColor: '#0f2942' }}>
              <th style={{ padding: '6px 8px', borderLeft: '1px solid #334155', width: '48px', textAlign: 'center' }}>Sr # (شمار)</th>
              <th style={{ padding: '6px 8px', borderLeft: '1px solid #334155', width: '110px', textAlign: 'center' }}>No. of Pkgs (تعداد / نگ)</th>
              <th style={{ padding: '6px 8px', borderLeft: '1px solid #334155', width: '120px', textAlign: 'center' }}>Packing Type (پیکنگ)</th>
              <th style={{ padding: '6px 8px', borderLeft: '1px solid #334155', textAlign: 'right' }}>Description of Goods (تفصیلِ سامان)</th>
              <th style={{ padding: '6px 8px', borderLeft: '1px solid #334155', width: '100px', textAlign: 'center' }}>Weight (وزن کلو)</th>
              <th style={{ padding: '6px 8px', width: '100px', textAlign: 'center' }}>Rate (ریٹ فی نگ/کلو)</th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#ffffff' }}>
            {/* Primary Cargo Row */}
            <tr style={{ fontWeight: 700, fontSize: '11.5px', color: '#0f172a', borderBottom: '1px solid #cbd5e1' }}>
              <td style={{ padding: '7px 8px', textAlign: 'center', borderLeft: '1px solid #cbd5e1', fontFamily: "'JetBrains Mono', monospace" }}>1</td>
              <td style={{ padding: '7px 8px', textAlign: 'center', borderLeft: '1px solid #cbd5e1', fontFamily: "'JetBrains Mono', monospace", fontWeight: 900 }}>
                {record.qty || '-'} {record.qty ? 'Pkgs' : ''}
              </td>
              <td style={{ padding: '7px 8px', textAlign: 'center', borderLeft: '1px solid #cbd5e1', color: '#334155' }}>
                بوری / کارٹن / مال
              </td>
              <td style={{ padding: '7px 8px', borderLeft: '1px solid #cbd5e1', fontWeight: 900, color: '#0f172a' }}>
                {record.itemDescription || 'جنرل کارگو ٹرانسپورٹ'}
              </td>
              <td style={{ padding: '7px 8px', textAlign: 'center', borderLeft: '1px solid #cbd5e1', fontFamily: "'JetBrains Mono', monospace", fontWeight: 900 }}>
                {record.weight || '-'} {record.weight ? 'kg' : ''}
              </td>
              <td style={{ padding: '7px 8px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", color: '#334155' }}>
                {record.total && record.qty ? `Rs ${(record.total / (parseFloat(record.qty) || 1)).toFixed(0)}` : '-'}
              </td>
            </tr>

            {/* Row 2 Placeholder */}
            <tr style={{ fontSize: '11px', color: '#94a3b8', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <td style={{ padding: '5px 8px', textAlign: 'center', borderLeft: '1px solid #e2e8f0', fontFamily: "'JetBrains Mono', monospace" }}>2</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>-</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>-</td>
              <td style={{ padding: '5px 8px', borderLeft: '1px solid #e2e8f0' }}>-</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>-</td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}>-</td>
            </tr>

            {/* Row 3 Placeholder */}
            <tr style={{ fontSize: '11px', color: '#94a3b8', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
              <td style={{ padding: '5px 8px', textAlign: 'center', borderLeft: '1px solid #e2e8f0', fontFamily: "'JetBrains Mono', monospace" }}>3</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>-</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>-</td>
              <td style={{ padding: '5px 8px', borderLeft: '1px solid #e2e8f0' }}>-</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>-</td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}>-</td>
            </tr>

            {/* Summary Row */}
            <tr style={{ fontWeight: 900, fontSize: '12px', backgroundColor: '#f1f5f9', color: '#0f172a', borderTop: '2px solid #0f2942' }}>
              <td style={{ padding: '7px 8px', textAlign: 'center', borderLeft: '1px solid #cbd5e1', textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>TOTAL (ٹوٹل)</td>
              <td style={{ padding: '7px 8px', textAlign: 'center', borderLeft: '1px solid #cbd5e1', fontFamily: "'JetBrains Mono', monospace", fontWeight: 900 }}>
                {record.qty || '-'} {record.qty ? 'Pkgs' : ''}
              </td>
              <td colSpan={2} style={{ padding: '7px 8px', borderLeft: '1px solid #cbd5e1', textAlign: 'right', fontSize: '11px' }}>
                Total Actual Weight / Chargeable Weight (کل چارج ایبل وزن):
              </td>
              <td colSpan={2} style={{ padding: '7px 8px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontWeight: 900, color: '#0f172a' }}>
                {record.weight || '-'} {record.weight ? 'kg' : ''}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. SPLIT GRID: FINANCIAL BREAKDOWN (LEFT) & TERMS & CONDITIONS (RIGHT) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '8px', marginBottom: '8px', alignItems: 'stretch' }}>
        
        {/* Left Side: Financial Breakdown (5 Columns) */}
        <div
          style={{
            gridColumn: 'span 5 / span 5',
            border: '2px solid #0f2942',
            backgroundColor: '#ffffff',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 900,
                fontSize: '12px',
                paddingBottom: '4px',
                marginBottom: '6px',
                borderBottom: '2px solid #0f2942',
                color: '#0f2942',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>مالیاتی تفصیلات (ACCOUNTS)</span>
              <span style={{ fontSize: '9.5px', fontFamily: "'JetBrains Mono', monospace", color: '#64748b' }}>PKR</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', fontWeight: 700 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '3px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#475569' }}>بنیادی کرایہ (Freight Charges):</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', fontWeight: 900, color: '#0f172a' }}>Rs {fmt(record.total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '3px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#475569' }}>مزدوری / لوڈنگ (Labour Charges):</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', color: '#334155' }}>Rs 0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '3px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#475569' }}>لوکل ڈیلیوری (Local Delivery):</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', color: '#334155' }}>Rs 0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '3px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#475569' }}>سرچارج / دیگر (Surcharge):</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', color: '#334155' }}>Rs 0</span>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '6px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Grand Total Bar */}
            <div
              style={{
                backgroundColor: '#0f2942',
                color: '#ffffff',
                padding: '6px 8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>GRAND TOTAL (کل رقم):</span>
              <span style={{ fontSize: '13.5px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 900, direction: 'ltr', color: '#fde047' }}>Rs {fmt(record.total)}</span>
            </div>

            {/* Advance & Balance */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px', textAlign: 'center', fontWeight: 700, fontSize: '10.5px' }}>
              <div style={{ padding: '4px 6px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                <span style={{ display: 'block', fontSize: '9px', color: '#64748b', fontWeight: 700 }}>پیشگی (Advance)</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 900, color: '#0f172a', direction: 'ltr', fontSize: '11.5px' }}>Rs {fmt(record.advance)}</span>
              </div>
              <div style={{ padding: '4px 6px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3' }}>
                <span style={{ display: 'block', fontSize: '9px', color: '#9f1239', fontWeight: 900 }}>بقایا (Balance Payable)</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 900, color: '#9f1239', direction: 'ltr', fontSize: '11.5px' }}>Rs {fmt(record.payable)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Terms & Conditions (7 Columns) */}
        <div
          style={{
            gridColumn: 'span 7 / span 7',
            border: '2px solid #0f2942',
            backgroundColor: '#ffffff',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 900,
                fontSize: '12px',
                paddingBottom: '4px',
                marginBottom: '4px',
                borderBottom: '2px solid #0f2942',
                color: '#0f2942',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '11.5px' }}>شرائط و ضوابط (TERMS & CONDITIONS)</span>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#be123c', backgroundColor: '#ffe4e6', padding: '1px 6px', borderRadius: '3px' }}>اہم ہدایات</span>
            </div>

            <ol style={{ paddingRight: '14px', margin: '0', display: 'flex', flexDirection: 'column', gap: '2px', fontWeight: 600, fontSize: '9.5px', lineHeight: '1.25', textAlign: 'justify', color: '#1e293b' }}>
              {termsList.map((term, idx) => (
                <li key={idx} style={{ lineHeight: '1.25' }}>{term}</li>
              ))}
            </ol>
          </div>

          <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9px', fontWeight: 900, color: '#be123c' }}>
            <span>⚠️ اوورلوڈ، چالان و جرمانہ بدمعہ بیوپاری ہوگا۔</span>
            <span style={{ color: '#0f172a' }}>🛑 بغیر اصل بلٹی مال ہرگز وصول نہ کریں۔</span>
          </div>
        </div>

      </div>

      {/* 5. DRIVER DETAILS BAR */}
      <div
        style={{
          padding: '6px 10px',
          marginBottom: '8px',
          border: '2px solid #0f2942',
          backgroundColor: '#f8fafc',
          fontWeight: 700,
          fontSize: '10.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#1e293b'
        }}
      >
        <div>
          <span style={{ color: '#64748b', fontWeight: 500 }}>ڈرائیور کا نام (Driver Name):</span>{' '}
          <span style={{ fontWeight: 900, color: '#0f172a' }}>{record.driverName || '-'}</span>
        </div>
        <div style={{ borderRight: '1px solid #cbd5e1', paddingRight: '8px' }}>
          <span style={{ color: '#64748b', fontWeight: 500 }}>موبائل نمبر (Cell):</span>{' '}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', fontWeight: 900, color: '#0f172a' }}>{record.mobileNo || '-'}</span>
        </div>
        <div style={{ borderRight: '1px solid #cbd5e1', paddingRight: '8px' }}>
          <span style={{ color: '#64748b', fontWeight: 500 }}>لائسنس نمبر (License):</span>{' '}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', color: '#334155' }}>-</span>
        </div>
        <div style={{ borderRight: '1px solid #cbd5e1', paddingRight: '8px' }}>
          <span style={{ color: '#64748b', fontWeight: 500 }}>گیٹ پاس / ٹوکن:</span>{' '}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', color: '#334155' }}>{record.biltyNo}</span>
        </div>
      </div>

      {/* 6. BOTTOM SIGNATURES & VERIFICATION (3 BOXES) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px', alignItems: 'stretch' }}>
        
        {/* Box 1: Consignor Signature */}
        <div
          style={{
            border: '2px solid #0f2942',
            backgroundColor: '#ffffff',
            padding: '8px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '76px'
          }}
        >
          <div style={{ flex: '1 1 0%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '4px' }}>
            <div style={{ borderBottom: '2px dashed #94a3b8', width: '80%', fontSize: '9px', fontStyle: 'italic', color: '#94a3b8' }}>
              (دستخط / مہر مال بھیجنے والا)
            </div>
          </div>
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '4px', fontWeight: 900, fontSize: '11px', color: '#0f172a' }}>
            Consignor Signature / Stamp
          </div>
        </div>

        {/* Box 2: Driver / Carrying Agent */}
        <div
          style={{
            border: '2px solid #0f2942',
            backgroundColor: '#ffffff',
            padding: '8px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '76px'
          }}
        >
          <div style={{ flex: '1 1 0%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '4px' }}>
            <div style={{ borderBottom: '2px dashed #94a3b8', width: '80%', fontSize: '9px', fontStyle: 'italic', color: '#94a3b8' }}>
              (ڈرائیور / کیرئیر کا فزیکل سائن)
            </div>
          </div>
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '4px', fontWeight: 900, fontSize: '11px', color: '#0f172a' }}>
            Driver / Carrying Agent
          </div>
        </div>

        {/* Box 3: Authorized Signature & Stamp with Zahdan Nasr Signature & QR Code */}
        <div
          style={{
            border: '2px solid #0f2942',
            backgroundColor: '#f8fafc',
            padding: '6px 8px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            minHeight: '76px'
          }}
        >
          {/* Digital Signature */}
          <div style={{ flex: '1 1 0%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '2px 0' }}>
            <ZahdanSignatureSvg className="w-32 h-8 inline-block" />
            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '2px', width: '100%', fontWeight: 900, fontSize: '10px', color: '#0f172a', textAlign: 'center' }}>
              Authorized Stamp (زاہدان نصر)
            </div>
          </div>

          {/* QR Code */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: '4px', borderRight: '1px solid #cbd5e1' }}>
            {activeQrUrl ? (
              <img
                src={activeQrUrl}
                alt="Bilty Consignment Verification and Tracking QR Code"
                width={54}
                height={54}
                style={{
                  width: '54px',
                  height: '54px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #0f2942',
                  imageRendering: 'pixelated',
                  objectFit: 'contain',
                  padding: '2px'
                }}
              />
            ) : (
              <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontFamily: 'monospace' }}>
                QR
              </div>
            )}
            <div style={{ fontSize: '7.5px', fontWeight: 900, textTransform: 'uppercase', color: '#166534', marginTop: '2px' }}>
              VERIFIED BILTY
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
