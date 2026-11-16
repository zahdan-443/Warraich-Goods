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
  const formatAmount = (amount: number) => (isEn ? `Rs ${fmt(amount)}` : `${fmt(amount)} روپے`);
  const emptyVal = isEn ? 'N/A' : '—';

  const totalAmt = Math.max(0, Number(record.total) || 0);
  const advanceAmt = Math.max(0, Number(record.advance) || 0);
  const pendingAmt = Math.max(0, Number(record.payable ?? (totalAmt - advanceAmt)) || 0);
  const hasAdvance = advanceAmt > 0;

  const termsList = isEn ? BILTY_TERMS_EN : BILTY_TERMS_UR;

  const cellBg = 'transparent';
  const subtleTintBg = 'rgba(248, 250, 252, 0.22)';
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
          ? "'Plus Jakarta Sans', Arial, sans-serif"
          : "'Noto Sans Arabic', 'Jameel Noori Nastaleeq', 'PDMS Nastaleeq Nafees', Arial, sans-serif",
        lineHeight: '1.3',
        width: '794px',
        height: '1120px',
        minWidth: '794px',
        maxWidth: '794px',
        minHeight: '1120px',
        maxHeight: '1120px',
        padding: '12px 16px',
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
            padding: 7mm 9mm !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .printable-bilty-watermark {
            opacity: 0.95 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        .printable-bilty-container * {
          box-sizing: border-box !important;
        }
      `}</style>

      {/* Official Background Card Watermark ("public/warraich-card.png") - full A4 bleed */}
      <div
        className="printable-bilty-watermark"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          opacity: 0.95,
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
          overflow: 'hidden'
        }}
      >
        <img
          src={activeCardSrc}
          alt={isEn ? 'Warraich Goods Official Background Card' : 'وڑائچ گڈز آفیشل بیک گراؤنڈ کارڈ'}
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
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block'
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
        {/* 1. HEADER: Single-Language Company Branding + Frameless Enlarged Logo */}
        <div
          style={{
            paddingBottom: '6px',
            position: 'relative'
          }}
        >
          {/* Top-corner badge: NTN: 7779394-1 */}
          <div
            style={{
              display: 'flex',
              justifyContent: isEn ? 'flex-end' : 'flex-start',
              marginBottom: '2px'
            }}
          >
            <div
              dir={isEn ? 'ltr' : 'rtl'}
              style={{
                border: '1.5px solid #0f2942',
                borderRadius: '999px',
                padding: '2px 13px',
                fontSize: '10px',
                fontWeight: 800,
                fontFamily: isEn
                  ? "'JetBrains Mono', monospace"
                  : "'Noto Sans Arabic', 'JetBrains Mono', sans-serif",
                color: '#0f2942',
                backgroundColor: cellBg,
                letterSpacing: isEn ? '0.04em' : '0'
              }}
            >
              {isEn ? 'NTN: 7779394-1' : 'این ٹی این: 7779394-1'}
            </div>
          </div>

          {/* Frameless Enlarged Logo + Single-Language Header Title */}
          <div
            style={{
              display: 'flex',
              flexDirection: isEn ? 'row' : 'row-reverse',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {!logoFailed ? (
                <img
                  src={activeLogoSrc}
                  alt={isEn ? 'Warraich Goods Transport Company Emblem' : 'وڑائچ گڈز ٹرانسپورٹ کمپنی لوگو'}
                  width={106}
                  height={106}
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
                    width: '106px',
                    height: '106px',
                    objectFit: 'contain',
                    border: 'none',
                    backgroundColor: 'transparent',
                    padding: '0'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '106px',
                    height: '106px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent'
                  }}
                >
                  <CompanyLogo className="w-24 h-24" />
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
                    fontSize: '23px',
                    fontWeight: 900,
                    letterSpacing: '0.02em',
                    color: '#0f2942',
                    margin: '0 0 6px 0',
                    lineHeight: '1.15',
                    textTransform: 'uppercase'
                  }}
                >
                  WARRAICH GOODS TRANSPORT COMPANY (REGD)
                </h1>
              ) : (
                <h1
                  style={{
                    fontFamily:
                      "'Jameel Noori Nastaleeq', 'jameel-noori-nastaleeq', 'PDMS Nastaleeq Nafees', 'Noto Sans Arabic', serif",
                    fontSize: '29px',
                    fontWeight: 700,
                    color: '#0f2942',
                    margin: '0 0 6px 0',
                    lineHeight: '1.45'
                  }}
                >
                  {company.nameUr || 'وڑائچ گڈز ٹرانسپورٹ کمپنی (رجسٹرڈ)'}
                </h1>
              )}

              {/* Solid Navy Ribbon Tagline Strip (100% single language, no dots) */}
              <div
                style={{
                  backgroundColor: '#0f2942',
                  color: '#ffffff',
                  padding: '4px 20px',
                  fontSize: isEn ? '11.5px' : '12.5px',
                  fontWeight: 800,
                  letterSpacing: isEn ? '0.08em' : '0',
                  textTransform: isEn ? 'uppercase' : 'none',
                  borderRadius: '2px',
                  width: '92%',
                  maxWidth: '520px'
                }}
              >
                {isEn
                  ? 'TRUSTED LOGISTICS & TRANSPORT SERVICE'
                  : 'معتبر لاجسٹکس اور ٹرانسپورٹ سروس'}
              </div>

              {/* Branch Address & Phone Numbers (100% single language, no dots) */}
              <div
                style={{
                  marginTop: '5px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: '#0f2942',
                  lineHeight: '1.4'
                }}
              >
                <div>{isEn ? branchInfo.addressEn : branchInfo.addressUr}</div>
                <div
                  dir={isEn ? 'ltr' : 'rtl'}
                  style={{
                    fontFamily: isEn
                      ? "'JetBrains Mono', monospace"
                      : "'Noto Sans Arabic', 'JetBrains Mono', sans-serif",
                    fontSize: '10.5px',
                    marginTop: '1px'
                  }}
                >
                  {isEn ? (
                    <span>Mobile: {branchInfo.phone}</span>
                  ) : (
                    <span>فون نمبر: <span dir="ltr">{branchInfo.phone}</span></span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MASTER DOCUMENT GRID */}
        <div
          style={{
            border: '2px solid #0f2942',
            backgroundColor: 'transparent',
            flex: '1 1 0%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Row A: Bilty No | Truck No | Date */}
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
              <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'Bilty No :' : 'بلٹی نمبر :'}</span>
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
              <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'Truck No :' : 'گاڑی نمبر :'}</span>
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
                {record.vehicleNo || emptyVal}
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
                {record.date || emptyVal}
              </span>
            </div>
          </div>

          {/* Row B: Driver Details 4 Boxes (Directly below Vehicle row & above From/To row) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.25fr 1fr',
              borderBottom: borderNavy,
              backgroundColor: subtleTintBg,
              fontSize: '11px'
            }}
          >
            <div style={{ borderInlineEnd: borderNavy, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '5px 10px', borderBottom: borderLight, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'Driver Name :' : 'ڈرائیور کا نام :'}</span>
                <span style={{ fontWeight: 900, color: '#0f172a' }}>{record.driverName || emptyVal}</span>
              </div>
              <div style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'Driver Mobile :' : 'ڈرائیور موبائل :'}</span>
                <span dir="ltr" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: '#0f172a' }}>
                  {sanitizeContactOrCnic(record.mobileNo, emptyVal)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '5px 10px', borderBottom: borderLight, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'License No :' : 'لائسنس نمبر :'}</span>
                <span dir="ltr" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: '#0f172a' }}>
                  {sanitizeContactOrCnic(record.driverLicense, emptyVal)}
                </span>
              </div>
              <div style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'Driver CNIC :' : 'ڈرائیور شناختی کارڈ :'}</span>
                <span dir="ltr" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: '#0f172a' }}>
                  {sanitizeContactOrCnic(record.driverCnic, emptyVal)}
                </span>
              </div>
            </div>
          </div>

          {/* Row C: From | To */}
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
                {record.receivingCity || emptyVal}
              </span>
            </div>
          </div>

          {/* Row D: Consignor | Consignee (with Receiver CNIC) */}
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
            <div style={{ padding: '7px 10px', borderInlineEnd: borderNavy, display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: '92px' }}>
                  {isEn ? 'Consignor :' : 'بھیجنے والا :'}
                </span>
                <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '12px' }}>
                  {record.senderName || record.consignor || emptyVal}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: '92px' }}>
                  {isEn ? 'Mobile :' : 'فون نمبر :'}
                </span>
                <span dir="ltr" style={{ fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#0f172a' }}>
                  {sanitizeContactOrCnic(record.senderMobile, emptyVal)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: '92px' }}>
                  {isEn ? 'Sender CNIC :' : 'شناختی کارڈ :'}
                </span>
                <span dir="ltr" style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#334155' }}>
                  {sanitizeContactOrCnic(record.senderCnic, emptyVal)}
                </span>
              </div>
            </div>

            {/* Consignee (Receiver) */}
            <div style={{ padding: '7px 10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: '96px' }}>
                  {isEn ? 'Consignee :' : 'وصول کرنے والا :'}
                </span>
                <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '12px' }}>
                  {record.receiverName || record.consignee || emptyVal}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: '96px' }}>
                  {isEn ? 'Mobile :' : 'فون نمبر :'}
                </span>
                <span dir="ltr" style={{ fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#0f172a' }}>
                  {sanitizeContactOrCnic(record.receiverMobile, emptyVal)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: '96px' }}>
                  {isEn ? 'Receiver CNIC :' : 'شناختی کارڈ :'}
                </span>
                <span dir="ltr" style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#334155' }}>
                  {sanitizeContactOrCnic(record.receiverCnic, emptyVal)}
                </span>
              </div>
            </div>
          </div>

          {/* Row E: CARGO & CONDITIONAL PAYMENT FREIGHT SUMMARY */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '95px 1fr 110px 215px',
              borderBottom: borderNavy,
              flex: '1 1 0%',
              minHeight: '205px',
              backgroundColor: cellBg
            }}
          >
            {/* Col 1: No of Articles */}
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
                {isEn ? 'No of Articles' : 'تعداد نگ'}
              </div>
              <div
                style={{
                  padding: '16px 8px',
                  textAlign: 'center',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 900,
                  fontSize: '13px',
                  color: '#0f172a',
                  flex: '1 1 0%'
                }}
              >
                {record.qty || emptyVal}
                {record.qty ? (
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#475569',
                      marginTop: '3px',
                      fontFamily: isEn ? "'Plus Jakarta Sans', sans-serif" : "'Noto Sans Arabic', sans-serif"
                    }}
                  >
                    {isEn ? 'Pkgs / Bags' : 'نگ / بوریاں'}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Col 2: Nature of Goods */}
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
                  padding: '16px 12px',
                  flex: '1 1 0%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  gap: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: '#0f172a'
                }}
              >
                <div>{record.itemDescription || (isEn ? 'General Goods Cargo' : 'جنرل کارگو سامان')}</div>
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
                {isEn ? 'Weight (kg)' : 'وزن (کلوگرام)'}
              </div>
              <div
                style={{
                  padding: '16px 8px',
                  textAlign: 'center',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 900,
                  fontSize: '13px',
                  color: '#0f172a',
                  flex: '1 1 0%'
                }}
              >
                {record.weight || emptyVal}
                {record.weight ? (
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#475569',
                      marginTop: '3px',
                      fontFamily: isEn ? "'Plus Jakarta Sans', sans-serif" : "'Noto Sans Arabic', sans-serif"
                    }}
                  >
                    {isEn ? 'KG' : 'کلوگرام'}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Col 4: Freight Summary (Conditional Advance & Pending when advance > 0; Total Freight only when advance === 0) */}
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
                {isEn ? 'Freight Summary' : 'تفصیلِ کرایہ'}
              </div>

              <div style={{ flex: '1 1 0%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', fontSize: '11px' }}>
                {hasAdvance ? (
                  <>
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
                      <span style={{ fontWeight: 700, color: '#334155' }}>
                        {isEn ? 'Total Freight' : 'کل کرایہ'}
                      </span>
                      <span
                        dir={isEn ? 'ltr' : 'rtl'}
                        style={{ fontFamily: "'JetBrains Mono', 'Noto Sans Arabic', monospace", fontWeight: 800, color: '#0f172a' }}
                      >
                        {totalAmt > 0 ? formatAmount(totalAmt) : emptyVal}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 10px',
                        borderBottom: borderLight
                      }}
                    >
                      <span style={{ fontWeight: 700, color: '#334155' }}>
                        {isEn ? 'Advance Paid' : 'پیشگی وصول'}
                      </span>
                      <span
                        dir={isEn ? 'ltr' : 'rtl'}
                        style={{ fontFamily: "'JetBrains Mono', 'Noto Sans Arabic', monospace", fontWeight: 800, color: '#0f2942' }}
                      >
                        {formatAmount(advanceAmt)}
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
                      <span>{isEn ? 'Pending Amount' : 'بقایا رقم'}</span>
                      <span
                        dir={isEn ? 'ltr' : 'rtl'}
                        style={{ fontFamily: "'JetBrains Mono', 'Noto Sans Arabic', monospace", fontWeight: 900 }}
                      >
                        {formatAmount(pendingAmt)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      borderTop: borderLight,
                      backgroundColor: subtleTintBg,
                      fontWeight: 900,
                      fontSize: '11.5px',
                      color: '#0f2942'
                    }}
                  >
                    <span>{isEn ? 'TOTAL FREIGHT' : 'کل کرایہ'}</span>
                    <span
                      dir={isEn ? 'ltr' : 'rtl'}
                      style={{ fontFamily: "'JetBrains Mono', 'Noto Sans Arabic', monospace", fontWeight: 900 }}
                    >
                      {totalAmt > 0 ? formatAmount(totalAmt) : emptyVal}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row F: Full-Width Remarks Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderBottom: borderNavy,
              backgroundColor: cellBg,
              fontSize: '11px'
            }}
          >
            <span style={{ fontWeight: 800, color: '#0f2942', whiteSpace: 'nowrap' }}>
              {isEn ? 'Remarks :' : 'ریمارکس :'}
            </span>
            <span style={{ fontWeight: 700, color: '#0f172a', flex: '1 1 0%' }}>
              {record.remarks || emptyVal}
            </span>
          </div>

          {/* Row G: REFINED TERMS & CONDITIONS + 2x2 QR & 3-PARTY SIGNATURE GRID */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.42fr 1fr',
              backgroundColor: cellBg,
              alignItems: 'stretch'
            }}
          >
            {/* Left/Main: Terms & Conditions (Clean heading without company name, elevated typography) */}
            <div style={{ padding: '9px 11px', borderInlineEnd: borderNavy, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div
                  style={{
                    fontFamily: isEn
                      ? "'Plus Jakarta Sans', sans-serif"
                      : "'Noto Sans Arabic', 'Jameel Noori Nastaleeq', sans-serif",
                    fontWeight: 800,
                    fontSize: isEn ? '11.5px' : '12.5px',
                    color: '#0f2942',
                    borderBottom: '1.5px solid #0f2942',
                    paddingBottom: '4px',
                    marginBottom: '6px',
                    letterSpacing: isEn ? '0.04em' : '0',
                    textTransform: isEn ? 'uppercase' : 'none'
                  }}
                >
                  {isEn ? 'Terms & Conditions' : 'شرائط و ضوابط'}
                </div>
                <ol
                  style={{
                    paddingLeft: isEn ? '16px' : '0',
                    paddingRight: isEn ? '0' : '16px',
                    margin: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isEn ? '3px' : '3.5px',
                    fontFamily: isEn
                      ? "'Plus Jakarta Sans', Arial, sans-serif"
                      : "'Noto Sans Arabic', 'Jameel Noori Nastaleeq', Arial, sans-serif",
                    fontSize: isEn ? '8.8px' : '9.5px',
                    lineHeight: isEn ? '1.38' : '1.48',
                    fontWeight: 500,
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

            {/* Right: 4 Verification Boxes in 2x2 Grid (1: QR Code, 2: Driver Sig, 3: Sender Sig, 4: Receiver Sig) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
                backgroundColor: subtleTintBg
              }}
            >
              {/* Box 1: QR Code */}
              <div
                style={{
                  borderInlineEnd: borderLight,
                  borderBottom: borderLight,
                  padding: '8px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: '4px'
                }}
              >
                {activeQrUrl ? (
                  <img
                    src={activeQrUrl}
                    alt={isEn ? 'Bilty Verification QR Code' : 'بلٹی تصدیقی کیو آر کوڈ'}
                    width={64}
                    height={64}
                    style={{
                      width: '64px',
                      height: '64px',
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
                      width: '60px',
                      height: '60px',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      fontFamily: isEn ? "'JetBrains Mono', monospace" : "'Noto Sans Arabic', sans-serif"
                    }}
                  >
                    {isEn ? 'QR' : 'کوڈ'}
                  </div>
                )}
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#0f2942' }}>
                  {isEn ? 'Scan to Verify' : 'تصدیقی کیو آر'}
                </span>
              </div>

              {/* Box 2: Driver Signature */}
              <div
                style={{
                  borderBottom: borderLight,
                  padding: '8px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <div style={{ width: '100%', borderTop: '1px solid #64748b', paddingTop: '5px', fontSize: '9.5px', fontWeight: 800, color: '#0f2942' }}>
                  {isEn ? 'Driver Signature' : 'دستخط ڈرائیور'}
                </div>
              </div>

              {/* Box 3: Sender Signature */}
              <div
                style={{
                  borderInlineEnd: borderLight,
                  padding: '8px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <div style={{ width: '100%', borderTop: '1px solid #64748b', paddingTop: '5px', fontSize: '9.5px', fontWeight: 800, color: '#0f2942' }}>
                  {isEn ? 'Sender Signature' : 'دستخط بھیجنے والا'}
                </div>
              </div>

              {/* Box 4: Receiver Signature */}
              <div
                style={{
                  padding: '8px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <div style={{ width: '100%', borderTop: '1px solid #64748b', paddingTop: '5px', fontSize: '9.5px', fontWeight: 800, color: '#0f2942' }}>
                  {isEn ? 'Receiver Signature' : 'دستخط وصول کنندہ'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. COMPLETE SINGLE-LANGUAGE FOOTER */}
        <div
          style={{
            textAlign: 'center',
            paddingTop: '5px',
            fontSize: isEn ? '10px' : '11px',
            fontWeight: 800,
            color: '#0f2942',
            letterSpacing: isEn ? '0.02em' : '0'
          }}
        >
          {isEn
            ? 'This is a computer-generated Bilty, no signature required'
            : 'یہ کمپیوٹر سے تیار کردہ بلٹی ہے، دستخط کی ضرورت نہیں'}
        </div>
      </div>
    </div>
  );
};
