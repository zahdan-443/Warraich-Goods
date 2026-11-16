import React, { useState, useEffect } from 'react';
import { BiltyRecord, BiltyBranch, BiltyLanguage } from '../types';
import { getCachedCompanyProfile } from '../utils/storage';
import { biltyOfficialIconData } from '../assets/dashboardIcons';
import { getLogoBase64 } from '../utils/pdfHelper';
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
  logoDataUrl: propLogoUrl,
  language: propLanguage
}) => {
  const [internalQrUrl, setInternalQrUrl] = useState<string>('');
  const [resolvedLogo, setResolvedLogo] = useState<string>(propLogoUrl || '');
  const [logoFailed, setLogoFailed] = useState<boolean>(false);
  const company = getCachedCompanyProfile();

  const activeLang: BiltyLanguage = record.language || propLanguage || 'ur';
  const isEn = activeLang === 'en';
  const branchInfo = BILTY_BRANCHES.samundri;
  const cleanUrduCompanyName = (company.nameUr || 'وڑائچ گڈز ٹرانسپورٹ کمپنی')
    .replace(/\s*\(رجسٹرڈ\)\s*/g, '')
    .trim();

  useEffect(() => {
    let isMounted = true;
    if (propLogoUrl) {
      setResolvedLogo(propLogoUrl);
    } else {
      getLogoBase64().then((b64) => {
        if (isMounted && b64) setResolvedLogo(b64);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [propLogoUrl]);

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
  const activeLogoSrc = propLogoUrl || resolvedLogo || biltyOfficialIconData || './bilty-official-icon.png';

  const fmt = (n?: number) => (n !== undefined && n !== null ? n.toLocaleString('en-US') : '0');
  const formatAmount = (amount: number) => (isEn ? `Rs ${fmt(amount)}` : `${fmt(amount)} روپے`);
  const emptyVal = isEn ? 'N/A' : '—';

  const totalAmt = Math.max(0, Number(record.total) || 0);
  const advanceAmt = Math.max(0, Number(record.advance) || 0);
  const pendingAmt = Math.max(0, Number(record.payable ?? (totalAmt - advanceAmt)) || 0);
  const hasAdvance = advanceAmt > 0;

  const termsList = isEn ? BILTY_TERMS_EN : BILTY_TERMS_UR;

  const cellBg = '#ffffff';
  const subtleTintBg = '#f8fafc';
  const borderNavy = '1.5px solid #0f2942';
  const borderLight = '1px solid #94a3b8';

  const urBodyFont = "'Jameel Noori Nastaleeq', 'PDMS Nastaleeq Nafees', 'Noto Nastaliq Urdu', serif";
  const urTitleFont = "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'PDMS Nastaleeq Nafees', serif";
  const enBodyFont = "'IBM Plex Sans', 'Segoe UI', Arial, sans-serif";
  const monoFont = "'JetBrains Mono', 'Courier New', monospace";

  return (
    <div
      dir={isEn ? 'ltr' : 'rtl'}
      id="printable-bilty-inner"
      className="printable-bilty-container mx-auto box-border flex flex-col justify-between"
      style={{
        backgroundColor: '#ffffff',
        color: '#0f172a',
        border: '2px solid #0f2942',
        fontFamily: isEn ? enBodyFont : urBodyFont,
        lineHeight: isEn ? '1.3' : '1.55',
        width: '794px',
        height: '1120px',
        minWidth: '794px',
        maxWidth: '794px',
        minHeight: '1120px',
        maxHeight: '1120px',
        padding: '0px 14px 10px 14px',
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
            background-color: #ffffff !important;
            border: 2px solid #0f2942 !important;
            box-shadow: none !important;
            margin: 0 auto !important;
            padding: 0mm 6mm 5mm 6mm !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        .printable-bilty-container * {
          box-sizing: border-box !important;
        }
      `}</style>

      {/* Main Content Layer on Clean White Background */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          backgroundColor: '#ffffff'
        }}
      >
        {/* 1. HEADER: 3-Edge Expanded Logo (Top, Side, Date-Row Line) + Top-Right NTN Badge */}
        <div
          dir="ltr"
          style={{
            padding: '0',
            marginLeft: '-14px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: '8px'
          }}
        >
          {/* NTN Badge restored in original top-right corner */}
          <div
            dir={isEn ? 'ltr' : 'rtl'}
            style={{
              position: 'absolute',
              top: '7px',
              right: '0px',
              border: '1.5px solid #0f2942',
              borderRadius: '999px',
              padding: '1px 12px',
              fontSize: '9.5px',
              fontWeight: 800,
              fontFamily: isEn ? monoFont : urBodyFont,
              color: '#0f2942',
              backgroundColor: '#ffffff',
              letterSpacing: isEn ? '0.04em' : '0',
              zIndex: 2
            }}
          >
            {isEn ? 'NTN: 7779394-1' : 'این ٹی این: 7779394-1'}
          </div>

          {/* Enlarged Logo flush to Top Edge, Left Side Edge, and Bottom Date-Box Border Line */}
          <div
            style={{
              width: '180px',
              minHeight: '132px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              margin: '0',
              padding: '0'
            }}
          >
            {!logoFailed ? (
              <img
                src={activeLogoSrc}
                alt={isEn ? 'Warraich Goods Transport Company Emblem' : 'وڑائچ گڈز ٹرانسپورٹ کمپنی لوگو'}
                width={180}
                height={132}
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
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transform: 'scale(1.6)',
                  transformOrigin: '44% center',
                  border: 'none',
                  backgroundColor: 'transparent',
                  padding: '0',
                  display: 'block'
                }}
              />
            ) : (
              <div
                style={{
                  width: '124px',
                  height: '124px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent'
                }}
              >
                <CompanyLogo className="w-28 h-28" />
              </div>
            )}
          </div>

          {/* Centered Masthead Title, Proprietor Strip & Samundri Address */}
          <div
            dir={isEn ? 'ltr' : 'rtl'}
            style={{
              flex: '1 1 0%',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '16px',
              paddingBottom: '6px'
            }}
          >
            {isEn ? (
              <h1
                style={{
                  fontFamily: "'Libre Baskerville', Georgia, 'Times New Roman', serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '0.015em',
                  color: '#0f2942',
                  margin: '0 0 5px 0',
                  lineHeight: '1.15',
                  textTransform: 'uppercase'
                }}
              >
                WARRAICH GOODS TRANSPORT COMPANY
                <sup
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    verticalAlign: 'super',
                    marginLeft: '2px',
                    fontFamily: enBodyFont
                  }}
                >
                  ®
                </sup>
              </h1>
            ) : (
              <h1
                style={{
                  fontFamily: urTitleFont,
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#0f2942',
                  margin: '0 0 6px 0',
                  lineHeight: '1.85'
                }}
              >
                {cleanUrduCompanyName}
                <sup
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    verticalAlign: 'super',
                    marginRight: '3px',
                    fontFamily: enBodyFont
                  }}
                >
                  ®
                </sup>
              </h1>
            )}

            {/* Solid Navy Proprietor Ribbon Strip */}
            <div
              style={{
                backgroundColor: '#0f2942',
                color: '#ffffff',
                padding: isEn ? '4px 20px' : '2px 20px',
                fontSize: isEn ? '11.5px' : '13px',
                fontWeight: 700,
                fontFamily: isEn ? enBodyFont : urBodyFont,
                letterSpacing: isEn ? '0.07em' : '0',
                textTransform: isEn ? 'uppercase' : 'none',
                borderRadius: '2px',
                width: '94%',
                maxWidth: '520px',
                lineHeight: isEn ? '1.3' : '1.6'
              }}
            >
              {isEn
                ? 'PROPRIETOR: ZAHDAN NASAR WARRAICH'
                : 'پروپرائیٹر: زاہدان نصر وڑائچ'}
            </div>

            {/* Single Samundri Office Address & Phone Numbers */}
            <div
              style={{
                marginTop: '4px',
                fontSize: isEn ? '10.5px' : '11.5px',
                fontWeight: 700,
                fontFamily: isEn ? enBodyFont : urBodyFont,
                color: '#0f2942',
                lineHeight: isEn ? '1.35' : '1.55'
              }}
            >
              <div>{isEn ? branchInfo.addressEn : branchInfo.addressUr}</div>
              <div
                dir={isEn ? 'ltr' : 'rtl'}
                style={{
                  fontFamily: isEn ? monoFont : urBodyFont,
                  fontSize: isEn ? '10.5px' : '11px',
                  marginTop: '1px',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {isEn ? (
                  <span>Mobile: {branchInfo.phone}</span>
                ) : (
                  <span>
                    فون نمبر: <span dir="ltr" style={{ fontFamily: monoFont, fontSize: '10px' }}>{branchInfo.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. MASTER DOCUMENT GRID */}
        <div
          style={{
            border: '2px solid #0f2942',
            backgroundColor: '#ffffff',
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
              fontSize: isEn ? '11.5px' : '12px'
            }}
          >
            <div
              style={{
                padding: '5px 10px',
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
                  fontFamily: monoFont,
                  fontSize: '13px',
                  color: '#0f2942'
                }}
              >
                {record.biltyNo}
              </span>
            </div>
            <div
              style={{
                padding: '5px 10px',
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
                  fontFamily: monoFont,
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
                padding: '5px 10px',
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
                  fontFamily: monoFont,
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
              fontSize: isEn ? '11px' : '11.5px'
            }}
          >
            <div style={{ borderInlineEnd: borderNavy, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '4px 10px', borderBottom: borderLight, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'Driver Name :' : 'ڈرائیور کا نام :'}</span>
                <span style={{ fontWeight: 900, color: '#0f172a' }}>{record.driverName || emptyVal}</span>
              </div>
              <div style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'Driver Mobile :' : 'ڈرائیور موبائل :'}</span>
                <span dir="ltr" style={{ fontFamily: monoFont, fontWeight: 800, color: '#0f172a' }}>
                  {sanitizeContactOrCnic(record.mobileNo, emptyVal)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '4px 10px', borderBottom: borderLight, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'License No :' : 'لائسنس نمبر :'}</span>
                <span dir="ltr" style={{ fontFamily: monoFont, fontWeight: 800, color: '#0f172a' }}>
                  {sanitizeContactOrCnic(record.driverLicense, emptyVal)}
                </span>
              </div>
              <div style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'Driver CNIC :' : 'ڈرائیور شناختی کارڈ :'}</span>
                <span dir="ltr" style={{ fontFamily: monoFont, fontWeight: 800, color: '#0f172a' }}>
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
              fontSize: isEn ? '11.5px' : '12px'
            }}
          >
            <div style={{ padding: '5px 10px', borderInlineEnd: borderNavy, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'From :' : 'از مقام :'}</span>
              <span style={{ fontWeight: 900, color: '#0f172a', fontSize: isEn ? '12px' : '12.5px' }}>
                {record.sendingCity || (isEn ? branchInfo.nameEn : branchInfo.nameUr)}
              </span>
            </div>
            <div style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, color: '#334155' }}>{isEn ? 'To :' : 'تا مقام :'}</span>
              <span style={{ fontWeight: 900, color: '#0f172a', fontSize: isEn ? '12px' : '12.5px' }}>
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
              fontSize: isEn ? '11px' : '11.5px'
            }}
          >
            {/* Consignor (Sender) */}
            <div style={{ padding: '6px 10px', borderInlineEnd: borderNavy, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px' }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: '92px' }}>
                  {isEn ? 'Consignor :' : 'بھیجنے والا :'}
                </span>
                <span style={{ fontWeight: 900, color: '#0f172a', fontSize: isEn ? '12px' : '12.5px' }}>
                  {record.senderName || record.consignor || emptyVal}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px' }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: '92px' }}>
                  {isEn ? 'Mobile :' : 'فون نمبر :'}
                </span>
                <span dir="ltr" style={{ fontWeight: 800, fontFamily: monoFont, color: '#0f172a' }}>
                  {sanitizeContactOrCnic(record.senderMobile, emptyVal)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: '92px' }}>
                  {isEn ? 'Sender CNIC :' : 'شناختی کارڈ :'}
                </span>
                <span dir="ltr" style={{ fontWeight: 700, fontFamily: monoFont, color: '#334155' }}>
                  {sanitizeContactOrCnic(record.senderCnic, emptyVal)}
                </span>
              </div>
            </div>

            {/* Consignee (Receiver) */}
            <div style={{ padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px' }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: '96px' }}>
                  {isEn ? 'Consignee :' : 'وصول کرنے والا :'}
                </span>
                <span style={{ fontWeight: 900, color: '#0f172a', fontSize: isEn ? '12px' : '12.5px' }}>
                  {record.receiverName || record.consignee || emptyVal}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px' }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: '96px' }}>
                  {isEn ? 'Mobile :' : 'فون نمبر :'}
                </span>
                <span dir="ltr" style={{ fontWeight: 800, fontFamily: monoFont, color: '#0f172a' }}>
                  {sanitizeContactOrCnic(record.receiverMobile, emptyVal)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: '96px' }}>
                  {isEn ? 'Receiver CNIC :' : 'شناختی کارڈ :'}
                </span>
                <span dir="ltr" style={{ fontWeight: 700, fontFamily: monoFont, color: '#334155' }}>
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
              minHeight: '150px',
              backgroundColor: cellBg
            }}
          >
            {/* Col 1: No of Articles */}
            <div style={{ borderInlineEnd: borderNavy, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  padding: '6px 6px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: isEn ? '11px' : '12px',
                  borderBottom: borderNavy,
                  backgroundColor: '#0f2942',
                  color: '#ffffff'
                }}
              >
                {isEn ? 'No of Articles' : 'تعداد نگ'}
              </div>
              <div
                style={{
                  padding: '14px 8px',
                  textAlign: 'center',
                  fontFamily: monoFont,
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
                      fontSize: isEn ? '10px' : '11px',
                      fontWeight: 700,
                      color: '#475569',
                      marginTop: '3px',
                      fontFamily: isEn ? enBodyFont : urBodyFont
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
                  padding: '6px 10px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: isEn ? '11px' : '12px',
                  borderBottom: borderNavy,
                  backgroundColor: '#0f2942',
                  color: '#ffffff'
                }}
              >
                {isEn ? 'Nature of Goods said to contain' : 'تفصیلِ سامان و پیکنگ'}
              </div>
              <div
                style={{
                  padding: '14px 12px',
                  flex: '1 1 0%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  gap: '6px',
                  fontSize: isEn ? '12.5px' : '13px',
                  fontWeight: 700,
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
                  padding: '6px 6px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: isEn ? '11px' : '12px',
                  borderBottom: borderNavy,
                  backgroundColor: '#0f2942',
                  color: '#ffffff'
                }}
              >
                {isEn ? 'Weight (kg)' : 'وزن (کلوگرام)'}
              </div>
              <div
                style={{
                  padding: '14px 8px',
                  textAlign: 'center',
                  fontFamily: monoFont,
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
                      fontSize: isEn ? '10px' : '11px',
                      fontWeight: 700,
                      color: '#475569',
                      marginTop: '3px',
                      fontFamily: isEn ? enBodyFont : urBodyFont
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
                  padding: '6px 8px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: isEn ? '11px' : '12px',
                  borderBottom: borderNavy,
                  backgroundColor: '#0f2942',
                  color: '#ffffff'
                }}
              >
                {isEn ? 'Freight Summary' : 'تفصیلِ کرایہ'}
              </div>

              <div style={{ flex: '1 1 0%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', fontSize: isEn ? '11px' : '12px' }}>
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
                        style={{ fontFamily: isEn ? monoFont : urBodyFont, fontWeight: 700, color: '#0f172a' }}
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
                        style={{ fontFamily: isEn ? monoFont : urBodyFont, fontWeight: 700, color: '#0f2942' }}
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
                        fontWeight: 700,
                        fontSize: isEn ? '11.5px' : '12.5px',
                        color: '#0f2942'
                      }}
                    >
                      <span>{isEn ? 'Pending Amount' : 'بقایا رقم'}</span>
                      <span
                        dir={isEn ? 'ltr' : 'rtl'}
                        style={{ fontFamily: isEn ? monoFont : urBodyFont, fontWeight: 700 }}
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
                      fontWeight: 700,
                      fontSize: isEn ? '11.5px' : '12.5px',
                      color: '#0f2942'
                    }}
                  >
                    <span>{isEn ? 'TOTAL FREIGHT' : 'کل کرایہ'}</span>
                    <span
                      dir={isEn ? 'ltr' : 'rtl'}
                      style={{ fontFamily: isEn ? monoFont : urBodyFont, fontWeight: 700 }}
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
              padding: '6px 10px',
              borderBottom: borderNavy,
              backgroundColor: cellBg,
              fontSize: isEn ? '11px' : '11.5px'
            }}
          >
            <span style={{ fontWeight: 700, color: '#0f2942', whiteSpace: 'nowrap' }}>
              {isEn ? 'Remarks :' : 'ریمارکس :'}
            </span>
            <span style={{ fontWeight: 700, color: '#0f172a', flex: '1 1 0%' }}>
              {record.remarks || emptyVal}
            </span>
          </div>

          {/* Row G: BOLD NOORI NASTALEEQ TERMS & CONDITIONS + EDGE-TO-EDGE QR & 3-PARTY SIGNATURE GRID */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.36fr 1fr',
              backgroundColor: cellBg,
              alignItems: 'stretch'
            }}
          >
            {/* Left/Main: Terms & Conditions (Bold Jameel Noori Nastaleeq in Urdu / Bold IBM Plex in English) */}
            <div style={{ padding: '7px 11px', borderInlineEnd: borderNavy, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div
                  style={{
                    fontFamily: isEn
                      ? "'Libre Baskerville', Georgia, serif"
                      : urBodyFont,
                    fontWeight: 700,
                    fontSize: isEn ? '11.5px' : '14px',
                    color: '#0f2942',
                    borderBottom: '2px solid #0f2942',
                    paddingBottom: '3px',
                    marginBottom: '5px',
                    letterSpacing: isEn ? '0.04em' : '0',
                    textTransform: isEn ? 'uppercase' : 'none',
                    lineHeight: isEn ? '1.3' : '1.5'
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
                    gap: isEn ? '3px' : '3px',
                    fontFamily: isEn ? enBodyFont : urBodyFont,
                    fontSize: isEn ? '9px' : '10.2px',
                    lineHeight: isEn ? '1.36' : '1.62',
                    fontWeight: 700,
                    color: '#0f172a',
                    textAlign: isEn ? 'left' : 'justify'
                  }}
                >
                  {termsList.map((term, idx) => (
                    <li key={idx} style={{ fontWeight: 700 }}>{term}</li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Right: 4 Verification Boxes in 2x2 Grid (1: Edge-to-Edge QR Code, 2: Driver Sig, 3: Sender Sig, 4: Receiver Sig) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
                backgroundColor: '#ffffff'
              }}
            >
              {/* Box 1: Edge-to-Edge QR Code filling entire box */}
              <div
                style={{
                  borderInlineEnd: borderLight,
                  borderBottom: borderLight,
                  padding: '0',
                  margin: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff',
                  overflow: 'hidden'
                }}
              >
                {activeQrUrl ? (
                  <img
                    src={activeQrUrl}
                    alt={isEn ? 'Bilty Verification QR Code' : 'بلٹی تصدیقی کیو آر کوڈ'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      imageRendering: 'pixelated',
                      display: 'block',
                      padding: '0',
                      border: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 800,
                      fontFamily: isEn ? monoFont : urBodyFont
                    }}
                  >
                    {isEn ? 'QR' : 'کوڈ'}
                  </div>
                )}
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
                  textAlign: 'center',
                  backgroundColor: subtleTintBg
                }}
              >
                <div style={{ width: '100%', borderTop: '1px solid #64748b', paddingTop: '4px', fontSize: isEn ? '9.5px' : '11px', fontWeight: 700, color: '#0f2942' }}>
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
                  textAlign: 'center',
                  backgroundColor: subtleTintBg
                }}
              >
                <div style={{ width: '100%', borderTop: '1px solid #64748b', paddingTop: '4px', fontSize: isEn ? '9.5px' : '11px', fontWeight: 700, color: '#0f2942' }}>
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
                  textAlign: 'center',
                  backgroundColor: subtleTintBg
                }}
              >
                <div style={{ width: '100%', borderTop: '1px solid #64748b', paddingTop: '4px', fontSize: isEn ? '9.5px' : '11px', fontWeight: 700, color: '#0f2942' }}>
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
            fontSize: isEn ? '10px' : '11.5px',
            fontWeight: 700,
            fontFamily: isEn ? enBodyFont : urBodyFont,
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
