import React, { useState, useEffect } from 'react';
import { BiltyRecord, BiltyBranch, BiltyLanguage } from '../types';
import { getCachedCompanyProfile } from '../utils/storage';
import { biltyOfficialIconData, companyCardData } from '../assets/dashboardIcons';
import { getLogoBase64, getCompanyCardBase64 } from '../utils/pdfHelper';
import { CompanyLogo } from './CompanyLogo';
import {
  sanitizeContactOrCnic,
  generateBiltyVerificationQrDataUrl,
  BILTY_BRANCHES,
  BILTY_TERMS_UR,
  BILTY_TERMS_EN
} from '../utils/biltyHelpers';

interface PrintableBiltyProps {
  record: BiltyRecord;
  qrDataUrl?: string;
  cardDataUrl?: string;
  logoDataUrl?: string;
  branch?: BiltyBranch;
  language?: BiltyLanguage;
}

export const ZahdanSignatureSvg: React.FC<{ className?: string }> = ({ className = 'w-32 h-9 inline-block' }) => (
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

export const PrintableBilty: React.FC<PrintableBiltyProps> = ({
  record,
  qrDataUrl: propQrUrl,
  cardDataUrl: propCardUrl,
  logoDataUrl: propLogoUrl,
  branch: propBranch,
  language: propLanguage
}) => {
  const [internalQrUrl, setInternalQrUrl] = useState<string>('');
  const [resolvedLogo, setResolvedLogo] = useState<string>(propLogoUrl || '');
  const [resolvedCard, setResolvedCard] = useState<string>(propCardUrl || '');
  const [logoFailed, setLogoFailed] = useState<boolean>(false);
  const company = getCachedCompanyProfile();

  const activeBranch: BiltyBranch = record.branch || propBranch || 'samundri';
  const activeLang: BiltyLanguage = record.language || propLanguage || 'ur';
  const isEn = activeLang === 'en';
  const branchInfo = BILTY_BRANCHES[activeBranch] || BILTY_BRANCHES.samundri;

  useEffect(() => {
    let isMounted = true;
    if (propLogoUrl) {
      setResolvedLogo(propLogoUrl);
    } else {
      getLogoBase64().then((b64) => {
        if (isMounted && b64) setResolvedLogo(b64);
      });
    }
    if (propCardUrl) {
      setResolvedCard(propCardUrl);
    } else {
      getCompanyCardBase64().then((b64) => {
        if (isMounted && b64) setResolvedCard(b64);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [propLogoUrl, propCardUrl]);

  useEffect(() => {
    let isMounted = true;
    if (!propQrUrl && record?.biltyNo) {
      generateBiltyVerificationQrDataUrl(record)
        .then((url) => {
          if (isMounted) setInternalQrUrl(url);
        })
        .catch((err) => {
          console.error('QR generation error:', err);
          if (isMounted) setInternalQrUrl('');
        });
    }
    return () => {
      isMounted = false;
    };
  }, [propQrUrl, record?.biltyNo, record?.vehicleNo]);

  const activeQrUrl = propQrUrl || internalQrUrl;
  const activeCardSrc = propCardUrl || resolvedCard || './warraich-card.png';
  const activeLogoSrc = propLogoUrl || resolvedLogo || biltyOfficialIconData || './bilty-official-icon.png';
  const fmt = (n?: number) => (n !== undefined && n !== null ? n.toLocaleString('en-US') : '0');
  const termsList = isEn ? BILTY_TERMS_EN : BILTY_TERMS_UR;

  const cellBg = 'rgba(255, 255, 255, 0.72)';
  const subtleTintBg = 'rgba(248, 250, 252, 0.72)';
  const borderNavy = '1.5px solid #0f2942';
  const borderLight = '1px solid #94a3b8';

  return (
    <div
      dir={isEn ? 'ltr' : 'rtl'}
      id="printable-bilty-inner"
      className="printable-bilty-container mx-auto box-border flex flex-col justify-between"
      style={{
        backgroundColor: '#ffffff',
        color: '#0f172a',
        border: '2px solid #0f2942',
        fontFamily: isEn
          ? "'Plus Jakarta Sans', 'Inter', Arial, sans-serif"
          : "'Noto Sans Arabic', 'Jameel Noori Nastaleeq', 'PDMS Nastaleeq Nafees', 'Plus Jakarta Sans', Arial, sans-serif",
        lineHeight: '1.28',
        width: '794px',
        height: '1120px',
        minWidth: '794px',
        maxWidth: '794px',
        minHeight: '1120px',
        maxHeight: '1120px',
        padding: '14px 18px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        pageBreakInside: 'avoid',
        pageBreakAfter: 'avoid',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact'
      }}
    >
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            overflow: hidden !important;
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .printable-bilty-container {
            width: 210mm !important;
            max-width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            border: 2px solid #0f2942 !important;
            box-shadow: none !important;
            margin: 0 auto !important;
            padding: 8mm 10mm !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .printable-bilty-watermark {
            opacity: 0.16 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        .printable-bilty-container * {
          box-sizing: border-box !important;
        }
      `}</style>

      {/* Official Background Card Watermark ("public/warraich-card.png") */}
      <div
        className="printable-bilty-watermark"
        style={{
          position: 'absolute',
          top: '53%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.17,
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
          width: '620px',
          maxWidth: '84%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img
          src={activeCardSrc}
          alt="Warraich Goods Official Background Card"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.triedBase) {
              target.dataset.triedBase = '1';
              target.src = './warraich-card.png';
            } else if (!target.dataset.triedRoot) {
              target.dataset.triedRoot = '1';
              target.src = '/warraich-card.png';
            } else if (!target.dataset.triedFallback) {
              target.dataset.triedFallback = '1';
              target.src = companyCardData;
            }
          }}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '460px',
            objectFit: 'contain',
            borderRadius: '10px',
            mixBlendMode: 'multiply'
          }}
        />
      </div>

      {/* Main Content Layer */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%'
        }}
      >
        {/* 1. CLASSIC BOXED HEADER (Matched to reference layout, Warraich Goods data only) */}
        <div
          style={{
            paddingBottom: '8px',
            position: 'relative'
          }}
        >
          {/* Top-right pill: NTN: 7779394-1 */}
          <div
            style={{
              display: 'flex',
              justifyContent: isEn ? 'flex-end' : 'flex-start',
              marginBottom: '4px'
            }}
          >
            <div
              dir="ltr"
              style={{
                border: '1.5px solid #0f2942',
                borderRadius: '999px',
                padding: '3px 14px',
                fontSize: '10.5px',
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                color: '#0f2942',
                backgroundColor: cellBg,
                letterSpacing: '0.04em'
              }}
            >
              NTN: 7779394-1
            </div>
          </div>

          {/* Logo + Main Centered Company Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: isEn ? 'row' : 'row-reverse',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <div style={{ flexShrink: 0 }}>
              {!logoFailed ? (
                <img
                  src={activeLogoSrc}
                  alt="Warraich Goods Official Seal"
                  width={78}
                  height={78}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.triedOfficialPng) {
                      target.dataset.triedOfficialPng = '1';
                      target.src = './bilty-official-icon.png';
                    } else if (!target.dataset.triedBilty) {
                      target.dataset.triedBilty = '1';
                      target.src = './bilty-icon.png';
                    } else {
                      setLogoFailed(true);
                    }
                  }}
                  style={{
                    width: '78px',
                    height: '78px',
                    borderRadius: '50%',
                    padding: '2px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #0f2942',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '78px',
                    height: '78px',
                    borderRadius: '50%',
                    padding: '4px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #0f2942',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CompanyLogo className="w-14 h-14" />
                </div>
              )}
            </div>

            <div
              style={{
                flex: '1 1 0%',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              {isEn ? (
                <h1
                  style={{
                    fontFamily: "'Plus Jakarta Sans', Georgia, serif",
                    fontSize: '23.5px',
                    fontWeight: 900,
                    letterSpacing: '0.02em',
                    color: '#0f2942',
                    margin: '0 0 4px 0',
                    lineHeight: '1.15',
                    textTransform: 'uppercase'
                  }}
                >
                  WARRAICH GOODS TRANSPORT COMPANY (REGD.)
                </h1>
              ) : (
                <>
                  <h1
                    style={{
                      fontFamily:
                        "'Jameel Noori Nastaleeq', 'jameel-noori-nastaleeq', 'PDMS Nastaleeq Nafees', 'Noto Nastaliq Urdu', serif",
                      fontSize: '26px',
                      fontWeight: 700,
                      color: '#0f2942',
                      margin: '0',
                      lineHeight: '1.55'
                    }}
                  >
                    {company.nameUr || 'وڑائچ گڈز ٹرانسپورٹ کمپنی (رجسٹرڈ)'}
                  </h1>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      color: '#0f2942',
                      marginBottom: '4px',
                      textTransform: 'uppercase'
                    }}
                  >
                    WARRAICH GOODS TRANSPORT COMPANY (REGD.)
                  </div>
                </>
              )}

              {/* Solid Navy Ribbon Tagline Strip */}
              <div
                style={{
                  backgroundColor: '#0f2942',
                  color: '#ffffff',
                  padding: '4px 20px',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  letterSpacing: isEn ? '0.08em' : '0',
                  textTransform: isEn ? 'uppercase' : 'none',
                  borderRadius: '2px',
                  width: '92%',
                  maxWidth: '520px'
                }}
              >
                {isEn
                  ? 'TRUSTED LOGISTICS & TRANSPORT SERVICE.'
                  : 'معتبر لاجسٹکس اور ٹرانسپورٹ سروس • TRUSTED LOGISTICS & TRANSPORT SERVICE.'}
              </div>

              {/* Branch Address & Helpline Line */}
              <div
                style={{
                  marginTop: '5px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: '#0f2942',
                  lineHeight: '1.35'
                }}
              >
                <div>{isEn ? branchInfo.addressEn : branchInfo.addressUr}</div>
                <div dir="ltr" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10.5px', marginTop: '1px' }}>
                  Mo. {branchInfo.phone}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MASTER DOCUMENT GRID (All Outer Bordered Cells) */}
        <div
          style={{
            border: '2px solid #0f2942',
            backgroundColor: 'transparent',
            flex: '1 1 0%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Row A: Bilty No | Vehicle No | Date */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              borderBottom: borderNavy,
              backgroundColor: subtleTintBg,
              fontSize: '11.5px'
            }}
          >
            <div
              style={{
                padding: '6px 10px',
                borderInlineEnd: borderNavy,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'Bilty No. :' : 'بلٹی نمبر :'}</span>
              <span
                dir="ltr"
                style={{
                  fontWeight: 900,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '13px',
                  color: '#0f2942'
                }}
              >
                {record.biltyNo}
              </span>
            </div>
            <div
              style={{
                padding: '6px 10px',
                borderInlineEnd: borderNavy,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'Truck No. :' : 'گاڑی نمبر :'}</span>
              <span
                dir="ltr"
                style={{
                  fontWeight: 900,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12.5px',
                  color: '#0f172a',
                  textTransform: 'uppercase'
                }}
              >
                {record.vehicleNo || 'N/A'}
              </span>
            </div>
            <div
              style={{
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'Date :' : 'تاریخ :'}</span>
              <span
                dir="ltr"
                style={{
                  fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  color: '#0f172a'
                }}
              >
                {record.date || '-'}
              </span>
            </div>
          </div>

          {/* Row B: From | To */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              borderBottom: borderNavy,
              backgroundColor: cellBg,
              fontSize: '11.5px'
            }}
          >
            <div style={{ padding: '6px 10px', borderInlineEnd: borderNavy, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'From :' : 'از مقام :'}</span>
              <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '12px' }}>
                {record.sendingCity || (isEn ? branchInfo.nameEn : branchInfo.nameUr)}
              </span>
            </div>
            <div style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'To :' : 'تا مقام :'}</span>
              <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '12px' }}>
                {record.receivingCity || 'N/A'}
              </span>
            </div>
          </div>

          {/* Row C: Consignor | Consignee Boxed Columns */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              borderBottom: borderNavy,
              backgroundColor: cellBg,
              fontSize: '11px'
            }}
          >
            {/* Consignor (Sender) */}
            <div style={{ padding: '8px 10px', borderInlineEnd: borderNavy, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: '88px' }}>
                  {isEn ? 'Consignor :' : 'بھیجنے والا :'}
                </span>
                <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '12px' }}>
                  {record.senderName || record.consignor || 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: '88px' }}>
                  {isEn ? 'Mobile No. :' : 'فون نمبر :'}
                </span>
                <span dir="ltr" style={{ fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#0f172a' }}>
                  {sanitizeContactOrCnic(record.senderMobile)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: '88px' }}>
                  {isEn ? 'Sender CNIC :' : 'شناختی کارڈ :'}
                </span>
                <span dir="ltr" style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#334155' }}>
                  {sanitizeContactOrCnic(record.senderCnic)}
                </span>
              </div>
            </div>

            {/* Consignee (Receiver) */}
            <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: '94px' }}>
                  {isEn ? 'Consignee :' : 'وصول کرنے والا :'}
                </span>
                <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '12px' }}>
                  {record.receiverName || record.consignee || 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: '94px' }}>
                  {isEn ? 'Mobile No. :' : 'فون نمبر :'}
                </span>
                <span dir="ltr" style={{ fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#0f172a' }}>
                  {sanitizeContactOrCnic(record.receiverMobile)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: '94px' }}>
                  {isEn ? 'Receiving Point :' : 'ریسیونگ پوائنٹ :'}
                </span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>
                  {record.receivingPointName || record.receivingCity || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Row D: EXPANDED GOODS TABLE + CLEAN FREIGHT COLUMN (No Rate column, No Bank/GST boxes) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '95px 1fr 110px 210px',
              borderBottom: borderNavy,
              flex: '1 1 0%',
              minHeight: '220px',
              backgroundColor: cellBg
            }}
          >
            {/* Col 1: No. of Articles / Pkgs */}
            <div style={{ borderInlineEnd: borderNavy, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  padding: '7px 6px',
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: '11px',
                  borderBottom: borderNavy,
                  backgroundColor: '#0f2942',
                  color: '#ffffff'
                }}
              >
                {isEn ? 'No. of Articles' : 'تعداد / نگ'}
              </div>
              <div
                style={{
                  padding: '18px 8px',
                  textAlign: 'center',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 900,
                  fontSize: '13px',
                  color: '#0f172a',
                  flex: '1 1 0%'
                }}
              >
                {record.qty || '-'}
                {record.qty ? <div style={{ fontSize: '10px', fontWeight: 700, color: '#475569', marginTop: '2px' }}>{isEn ? 'Pkgs / Bags' : 'نگ / بوریاں'}</div> : null}
              </div>
            </div>

            {/* Col 2: Nature of Goods said to contain (Generous expanded space) */}
            <div style={{ borderInlineEnd: borderNavy, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  padding: '7px 10px',
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: '11px',
                  borderBottom: borderNavy,
                  backgroundColor: '#0f2942',
                  color: '#ffffff'
                }}
              >
                {isEn ? 'Nature of Goods said to contain' : 'تفصیلِ سامان و پیکنگ'}
              </div>
              <div
                style={{
                  padding: '18px 12px',
                  flex: '1 1 0%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  gap: '8px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: '#0f172a'
                }}
              >
                <div>{record.itemDescription || (isEn ? 'General Goods Cargo' : 'جنرل کارگو ٹرانسپورٹ')}</div>
                {record.remarks ? (
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#334155', marginTop: '4px' }}>
                    {isEn ? `Note: ${record.remarks}` : `نوٹ: ${record.remarks}`}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Col 3: Weight */}
            <div style={{ borderInlineEnd: borderNavy, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  padding: '7px 6px',
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: '11px',
                  borderBottom: borderNavy,
                  backgroundColor: '#0f2942',
                  color: '#ffffff'
                }}
              >
                {isEn ? 'Weight (kg)' : 'وزن (کلو)'}
              </div>
              <div
                style={{
                  padding: '18px 8px',
                  textAlign: 'center',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 900,
                  fontSize: '13px',
                  color: '#0f172a',
                  flex: '1 1 0%'
                }}
              >
                {record.weight || '-'}
                {record.weight ? <div style={{ fontSize: '10px', fontWeight: 700, color: '#475569', marginTop: '2px' }}>{isEn ? 'KG' : 'کلوگرام'}</div> : null}
              </div>
            </div>

            {/* Col 4: Freight Summary (Clean Freight Total only — zero GST, Advance, Balance, or Paid/Pending pills) */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div
                style={{
                  padding: '7px 8px',
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: '11px',
                  borderBottom: borderNavy,
                  backgroundColor: '#0f2942',
                  color: '#ffffff'
                }}
              >
                {isEn ? 'Total Freight (PKR)' : 'کرایہ تفصیل (روپے)'}
              </div>

              <div style={{ flex: '1 1 0%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', fontSize: '11px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 10px',
                    borderTop: borderLight,
                    borderBottom: borderLight
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'Freight' : 'بنیادی کرایہ'}</span>
                  <span dir="ltr" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: '#0f172a' }}>
                    {Number(record.total) > 0 ? `Rs ${fmt(record.total)}` : '-'}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '7px 10px',
                    backgroundColor: subtleTintBg,
                    fontWeight: 900,
                    fontSize: '11.5px',
                    color: '#0f2942'
                  }}
                >
                  <span>{isEn ? 'TOTAL FREIGHT RS.' : 'کل کرایہ روپے'}</span>
                  <span dir="ltr" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 900 }}>
                    {Number(record.total) > 0 ? `Rs ${fmt(record.total)}` : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row E: Delivery At | Gate Pass / Ref */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              borderBottom: borderNavy,
              backgroundColor: cellBg,
              fontSize: '11px'
            }}
          >
            <div style={{ padding: '6px 10px', borderInlineEnd: borderNavy, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'Delivery At :' : 'مقامِ ترسیل :'}</span>
              <span style={{ fontWeight: 800, color: '#0f172a' }}>
                {record.deliveryAt || record.receivingPointName || record.receivingCity || 'N/A'}
              </span>
            </div>
            <div style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'Remark :' : 'ریمارکس :'}</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>
                {record.remarks || '-'}
              </span>
            </div>
          </div>

          {/* Row F: Driver Details (Name, D.L. No., Mobile No., Driver CNIC) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.3fr 1fr',
              borderBottom: borderNavy,
              backgroundColor: subtleTintBg,
              fontSize: '11px'
            }}
          >
            <div style={{ borderInlineEnd: borderNavy, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '5px 10px', borderBottom: borderLight, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'Driver Name :' : 'ڈرائیور کا نام :'}</span>
                <span style={{ fontWeight: 900, color: '#0f172a' }}>{record.driverName || 'N/A'}</span>
              </div>
              <div style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'Driver Mobile No. :' : 'ڈرائیور موبائل نمبر :'}</span>
                <span dir="ltr" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: '#0f172a' }}>
                  {sanitizeContactOrCnic(record.mobileNo)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '5px 10px', borderBottom: borderLight, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'D.L. No. :' : 'ڈرائیونگ لائسنس :'}</span>
                <span dir="ltr" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: '#0f172a' }}>
                  {sanitizeContactOrCnic(record.driverLicense)}
                </span>
              </div>
              <div style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'Driver CNIC No. :' : 'ڈرائیور شناختی کارڈ :'}</span>
                <span dir="ltr" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: '#0f172a' }}>
                  {sanitizeContactOrCnic(record.driverCnic)}
                </span>
              </div>
            </div>
          </div>

          {/* Row G: EXPANDED TERMS & CONDITIONS + QR VERIFICATION & AUTHORIZED SIGNATORY */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.65fr 1fr',
              backgroundColor: cellBg,
              alignItems: 'stretch'
            }}
          >
            {/* Left/Main: Warraich Goods Terms & Conditions (Expanded area) */}
            <div style={{ padding: '8px 10px', borderInlineEnd: borderNavy, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: '10.5px',
                    color: '#0f2942',
                    borderBottom: '1px solid #cbd5e1',
                    paddingBottom: '3px',
                    marginBottom: '4px',
                    textTransform: 'uppercase'
                  }}
                >
                  {isEn ? 'Terms & Conditions (Warraich Goods Transport Company)' : 'شرائط و ضوابط (وڑائچ گڈز ٹرانسپورٹ کمپنی)'}
                </div>
                <ol
                  style={{
                    paddingLeft: isEn ? '15px' : '0',
                    paddingRight: isEn ? '0' : '15px',
                    margin: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    fontSize: isEn ? '8.5px' : '9px',
                    lineHeight: isEn ? '1.25' : '1.35',
                    fontWeight: 600,
                    color: '#1e293b',
                    textAlign: isEn ? 'left' : 'justify'
                  }}
                >
                  {termsList.map((term, idx) => (
                    <li key={idx}>{term}</li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Right: QR Verification + For WARRAICH GOODS + Signature */}
            <div
              style={{
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'center',
                backgroundColor: subtleTintBg
              }}
            >
              <div style={{ fontWeight: 900, fontSize: '9.5px', color: '#0f2942', lineHeight: '1.25' }}>
                For WARRAICH GOODS TRANSPORT COMPANY (REGD.)
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '4px 0' }}>
                {/* QR Block */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {activeQrUrl ? (
                    <img
                      src={activeQrUrl}
                      alt="Bilty Verification QR Code"
                      width={60}
                      height={60}
                      style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #0f2942',
                        padding: '2px',
                        imageRendering: 'pixelated',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontFamily: 'monospace'
                      }}
                    >
                      QR
                    </div>
                  )}
                  <span style={{ fontSize: '7.5px', fontWeight: 900, color: '#166534', marginTop: '2px' }}>
                    {isEn ? 'SCAN TO VERIFY' : 'تصدیق QR'}
                  </span>
                </div>

                {/* Signature */}
                <div style={{ flex: '1 1 0%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <ZahdanSignatureSvg className="w-28 h-9 inline-block" />
                  <div style={{ fontSize: '8.5px', color: '#334155', fontWeight: 700, borderTop: '1px solid #94a3b8', paddingTop: '2px', width: '100%' }}>
                    Zahdan Nasr
                  </div>
                </div>
              </div>

              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #cbd5e1', paddingTop: '4px', fontSize: '9.5px', fontWeight: 800, color: '#0f2942' }}>
                <span>{isEn ? 'Driver Sign' : 'دستخط ڈرائیور'}</span>
                <span>{isEn ? 'Authorized Signatory' : 'مجاز دستخط و مہر'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. COMPUTER GENERATED FOOTER */}
        <div
          style={{
            textAlign: 'center',
            paddingTop: '5px',
            fontSize: '10.5px',
            fontWeight: 900,
            color: '#0f2942',
            letterSpacing: '0.02em'
          }}
        >
          {isEn
            ? 'This is a Computer Generated Bilty'
            : 'This is a Computer Generated Bilty • کمپیوٹرائزڈ آفیشل بلٹی دستاویز'}
        </div>
      </div>
    </div>
  );
};
