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
  const pastelSlate = '#f1f5f9';
  const pastelMint = '#ecfdf5';
  const pastelIvory = '#fffbeb';
  const subtleTintBg = '#f8fafc';
  const navyPrimary = '#0f2942';
  const emeraldAccent = '#065f46';
  const emeraldHighlight = '#047857';
  const goldAccent = '#d97706';
  const borderNavy = '1.5px solid #0f2942';
  const borderLight = '1px solid #94a3b8';

  const urBodyFont = "'Jameel Noori Nastaleeq', 'PDMS Nastaleeq Nafees', 'Noto Nastaliq Urdu', serif";
  const urTitleFont = "'Akbar', 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif";
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
        border: '2.5px solid #0f2942',
        fontFamily: isEn ? enBodyFont : urBodyFont,
        lineHeight: isEn ? '1.3' : '1.55',
        width: '794px',
        height: '1120px',
        minWidth: '794px',
        maxWidth: '794px',
        minHeight: '1120px',
        maxHeight: '1120px',
        padding: '4px 14px 10px 14px',
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
            border: 2.5px solid #0f2942 !important;
            box-shadow: none !important;
            margin: 0 auto !important;
            padding: 2mm 6mm 5mm 6mm !important;
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

      {/* Inner Gold Line completing the Double Outer Frame */}
      <div
        aria-hidden="true"
        data-testid="bilty-double-inner-frame"
        style={{
          position: 'absolute',
          top: '3px',
          right: '3px',
          bottom: '3px',
          left: '3px',
          border: `1.5px solid ${goldAccent}`,
          pointerEvents: 'none',
          zIndex: 3
        }}
      />

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
        {/* 1. HEADER: Pure White Ornamental Pakistani Certificate Frame with Inside Logo & Fixed Top-Right NTN Stamp */}
        <div
          dir={isEn ? 'ltr' : 'rtl'}
          data-testid="pakistani-header-frame"
          style={{
            width: '100%',
            margin: '4px 0 6px 0',
            border: `1.5px solid ${navyPrimary}`,
            borderRadius: '4px',
            padding: '3px',
            backgroundColor: '#ffffff',
            position: 'relative',
            display: 'flex'
          }}
        >
          <div
            style={{
              flex: '1 1 0%',
              border: `1px solid ${goldAccent}`,
              borderRadius: '2px',
              backgroundColor: '#ffffff',
              padding: '16px 16px 9px 14px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Top-Center Pakistani Geometric Crest Divider */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '-7px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#ffffff',
                padding: '0 6px',
                lineHeight: 0,
                zIndex: 2
              }}
            >
              <svg width="76" height="14" viewBox="0 0 76 14" fill="none">
                <path d="M2 7H25" stroke={navyPrimary} strokeWidth="1.4" />
                <path d="M51 7H74" stroke={navyPrimary} strokeWidth="1.4" />
                <polygon points="38,1 44,7 38,13 32,7" fill={goldAccent} stroke={navyPrimary} strokeWidth="1.2" />
                <polygon points="28,3 31,7 28,11 25,7" fill={emeraldAccent} />
                <polygon points="48,3 51,7 48,11 45,7" fill={emeraldAccent} />
                <circle cx="38" cy="7" r="1.8" fill="#ffffff" />
              </svg>
            </div>

            {/* 4 Corner Pakistani Architectural Step-Brackets */}
            {[
              { top: '2px', left: '2px', transform: 'none' },
              { top: '2px', right: '2px', transform: 'scaleX(-1)' },
              { bottom: '2px', left: '2px', transform: 'scaleY(-1)' },
              { bottom: '2px', right: '2px', transform: 'scale(-1, -1)' }
            ].map((cornerPos, idx) => (
              <svg
                key={idx}
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                style={{
                  position: 'absolute',
                  ...cornerPos,
                  pointerEvents: 'none'
                }}
              >
                <path d="M1 15V4C1 2.34315 2.34315 1 4 1H15" stroke={navyPrimary} strokeWidth="1.5" />
                <path d="M4 13V5.5C4 4.67157 4.67157 4 5.5 4H13" stroke={goldAccent} strokeWidth="1.1" />
                <polygon points="7,7 9.5,4.5 12,7 9.5,9.5" fill={emeraldAccent} />
              </svg>
            ))}

            {/* Top-Right NTN Corner Stamp (Crisp White + Proper RTL/LTR BiDi Isolation) */}
            <div
              dir={isEn ? 'ltr' : 'rtl'}
              data-testid="ntn-corner-stamp"
              style={{
                position: 'absolute',
                top: '6px',
                right: '24px',
                border: `1.5px solid ${navyPrimary}`,
                borderBottom: `2px solid ${goldAccent}`,
                borderRadius: '3px',
                padding: isEn ? '2px 9px' : '2px 10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: isEn ? '9.5px' : '10.5px',
                fontWeight: 700,
                fontFamily: isEn ? monoFont : "'Noto Sans Arabic', 'Jameel Noori Nastaleeq', sans-serif",
                color: navyPrimary,
                backgroundColor: '#ffffff',
                letterSpacing: isEn ? '0.04em' : '0',
                lineHeight: '1.35',
                zIndex: 2
              }}
            >
              {isEn ? (
                <span style={{ fontWeight: 800 }}>NTN: 7779394-1</span>
              ) : (
                <>
                  <span>این ٹی این نمبر:</span>
                  <span
                    dir="ltr"
                    style={{
                      fontFamily: monoFont,
                      fontSize: '9.5px',
                      fontWeight: 800,
                      unicodeBidi: 'isolate'
                    }}
                  >
                    7779394-1
                  </span>
                </>
              )}
            </div>

            {/* Inner Frame Flex Row: Left Company Logo + Right/Center Bold Masthead */}
            <div
              dir="ltr"
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '12px',
                width: '100%'
              }}
            >
              {/* Company Logo neatly enclosed inside the Pakistani White Frame */}
              <div
                data-testid="header-logo-inside-frame"
                style={{
                  width: '132px',
                  height: '104px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                  margin: '0',
                  padding: '0'
                }}
              >
                {!logoFailed ? (
                  <img
                    src={activeLogoSrc}
                    alt={isEn ? 'Warraich Goods Transport Company Emblem' : 'وڑائچ گڈز ٹرانسپورٹ کمپنی لوگو'}
                    width={132}
                    height={104}
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
                      transform: 'scale(1.32)',
                      transformOrigin: 'center center',
                      border: 'none',
                      backgroundColor: 'transparent',
                      padding: '0',
                      display: 'block'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '104px',
                      height: '104px',
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

              {/* Bold, Distinctive Company Masthead + Clean White Proprietor + Contact */}
              <div
                dir={isEn ? 'ltr' : 'rtl'}
                style={{
                  flex: '1 1 0%',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: '10px',
                  paddingRight: '8px'
                }}
              >
                {/* Distinctive Calligraphic / Engraved Company Name */}
                <div
                  data-testid="company-masthead-title"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    borderBottom: `2px solid ${goldAccent}`,
                    paddingBottom: '4px',
                    marginBottom: '5px'
                  }}
                >
                  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                    <polygon points="6,0.5 11.5,6 6,11.5 0.5,6" fill={emeraldAccent} stroke={goldAccent} strokeWidth="1" />
                  </svg>
                  {isEn ? (
                    <h1
                      style={{
                        fontFamily: "'Cinzel', 'Libre Baskerville', Georgia, 'Times New Roman', serif",
                        fontSize: '20.5px',
                        fontWeight: 900,
                        letterSpacing: '0.035em',
                        color: navyPrimary,
                        margin: '0',
                        lineHeight: '1.16',
                        textTransform: 'uppercase',
                        textShadow: '0 1px 0 rgba(217, 119, 6, 0.25)'
                      }}
                    >
                      WARRAICH GOODS TRANSPORT COMPANY
                      <sup
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 800,
                          verticalAlign: 'super',
                          marginLeft: '2px',
                          fontFamily: enBodyFont,
                          color: emeraldAccent
                        }}
                      >
                        ®
                      </sup>
                    </h1>
                  ) : (
                    <h1
                      style={{
                        fontFamily: urTitleFont,
                        fontSize: '27px',
                        fontWeight: 800,
                        color: navyPrimary,
                        margin: '0',
                        lineHeight: '1.52',
                        textShadow: '0 1px 0 rgba(217, 119, 6, 0.22)'
                      }}
                    >
                      {cleanUrduCompanyName}
                      <sup
                        style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          verticalAlign: 'super',
                          marginRight: '3px',
                          fontFamily: enBodyFont,
                          color: emeraldAccent
                        }}
                      >
                        ®
                      </sup>
                    </h1>
                  )}
                  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                    <polygon points="6,0.5 11.5,6 6,11.5 0.5,6" fill={emeraldAccent} stroke={goldAccent} strokeWidth="1" />
                  </svg>
                </div>

                {/* Clean White-Background Proprietor Line (No Blue Strip) */}
                <div
                  data-testid="proprietor-clean-line"
                  style={{
                    backgroundColor: 'transparent',
                    color: navyPrimary,
                    padding: isEn ? '2px 12px' : '1px 12px',
                    fontSize: isEn ? '11.5px' : '13px',
                    fontWeight: 800,
                    fontFamily: isEn ? enBodyFont : urBodyFont,
                    letterSpacing: isEn ? '0.06em' : '0',
                    textTransform: isEn ? 'uppercase' : 'none',
                    borderBottom: '1px solid #cbd5e1',
                    lineHeight: isEn ? '1.35' : '1.55'
                  }}
                >
                  {isEn ? (
                    <>
                      <span style={{ color: emeraldAccent, fontWeight: 800 }}>PROPRIETOR:</span>{' '}
                      <span style={{ color: navyPrimary, fontWeight: 900 }}>ZAHDAN NASAR WARRAICH</span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: emeraldAccent, fontWeight: 800 }}>پروپرائیٹر:</span>{' '}
                      <span style={{ color: navyPrimary, fontWeight: 900 }}>زاہدان نصر وڑائچ</span>
                    </>
                  )}
                </div>

                {/* Single Samundri Office Address & Phone Numbers */}
                <div
                  style={{
                    marginTop: '4px',
                    fontSize: isEn ? '10.5px' : '11.5px',
                    fontWeight: 700,
                    fontFamily: isEn ? enBodyFont : urBodyFont,
                    color: navyPrimary,
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
                      color: emeraldAccent,
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    {isEn ? (
                      <span>Mobile: {branchInfo.phone}</span>
                    ) : (
                      <span>
                        فون نمبر:{' '}
                        <span dir="ltr" style={{ fontFamily: monoFont, fontSize: '10px', color: navyPrimary, unicodeBidi: 'isolate' }}>
                          {branchInfo.phone}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MASTER DOCUMENT GRID */}
        <div
          style={{
            border: `2px solid ${navyPrimary}`,
            borderTop: `2.5px solid ${goldAccent}`,
            backgroundColor: '#ffffff',
            flex: '1 1 0%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Row A: Bilty No | Truck No | Date (Soft Slate Pastel Tint) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              borderBottom: borderNavy,
              backgroundColor: pastelSlate,
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
                  color: emeraldAccent
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

          {/* Row B: Driver Details 4 Boxes (Soft Mint Pastel Tint directly below Vehicle row & above From/To row) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.25fr 1fr',
              borderBottom: borderNavy,
              backgroundColor: pastelMint,
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
            {/* Col 1: No of Articles (Navy Header + Gold Rule) */}
            <div style={{ borderInlineEnd: borderNavy, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  padding: '6px 6px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: isEn ? '11px' : '12px',
                  borderBottom: `2px solid ${goldAccent}`,
                  backgroundColor: navyPrimary,
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
                  fontSize: '14px',
                  color: '#0f172a',
                  flex: '1 1 0%'
                }}
              >
                {record.qty || emptyVal}
              </div>
            </div>

            {/* Col 2: Nature of Goods (Emerald Header + Gold Rule + Scoped 6% Company Logo Watermark) */}
            <div style={{ borderInlineEnd: borderNavy, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  padding: '6px 10px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: isEn ? '11px' : '12px',
                  borderBottom: `2px solid ${goldAccent}`,
                  backgroundColor: emeraldAccent,
                  color: '#ffffff'
                }}
              >
                {isEn ? 'Nature of Goods said to contain' : 'تفصیلِ سامان و پیکنگ'}
              </div>
              <div
                style={{
                  padding: '12px 14px',
                  flex: '1 1 0%',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  gap: '6px',
                  backgroundColor: cellBg,
                  fontSize: isEn ? '16px' : '18.5px',
                  lineHeight: isEn ? '1.45' : '1.78',
                  fontWeight: 800,
                  color: '#020617'
                }}
              >
                {/* Scoped 6% Opacity Company Logo Watermark exclusively inside Nature of Goods cell */}
                <div
                  aria-hidden="true"
                  className="cargo-box-watermark"
                  data-testid="cargo-box-watermark"
                  style={{
                    position: 'absolute',
                    inset: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    opacity: 0.06,
                    zIndex: 0
                  }}
                >
                  {!logoFailed ? (
                    <img
                      src={activeLogoSrc}
                      alt=""
                      style={{
                        width: '220px',
                        maxWidth: '88%',
                        maxHeight: '145px',
                        objectFit: 'contain',
                        transform: 'scale(1.35)',
                        display: 'block'
                      }}
                    />
                  ) : (
                    <CompanyLogo className="w-28 h-28" />
                  )}
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {record.itemDescription || (isEn ? 'General Goods Cargo' : 'جنرل کارگو سامان')}
                </div>
              </div>
            </div>

            {/* Col 3: Weight (Navy Header + Gold Rule) */}
            <div style={{ borderInlineEnd: borderNavy, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  padding: '6px 6px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: isEn ? '11px' : '12px',
                  borderBottom: `2px solid ${goldAccent}`,
                  backgroundColor: navyPrimary,
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

            {/* Col 4: Freight Summary (Top Freight beside Line 1 of Cargo + Bottom Conditional Total/Advance/Pending) */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div
                style={{
                  padding: '6px 8px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: isEn ? '11px' : '12px',
                  borderBottom: `2px solid ${goldAccent}`,
                  backgroundColor: emeraldAccent,
                  color: '#ffffff'
                }}
              >
                {isEn ? 'Freight Summary' : 'تفصیلِ کرایہ'}
              </div>

              <div style={{ flex: '1 1 0%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: isEn ? '11px' : '12px' }}>
                {/* Top Freight Line aligned opposite first line of Nature of Goods */}
                <div
                  data-testid="freight-top-line"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 10px 8px 10px',
                    borderBottom: borderLight,
                    backgroundColor: cellBg,
                    fontSize: isEn ? '12px' : '13px',
                    fontWeight: 800,
                    color: '#0f172a'
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#334155' }}>
                    {isEn ? 'Freight' : 'کرایہ'}
                  </span>
                  <span
                    dir={isEn ? 'ltr' : 'rtl'}
                    style={{ fontFamily: isEn ? monoFont : urBodyFont, fontWeight: 800, color: navyPrimary }}
                  >
                    {totalAmt > 0 ? formatAmount(totalAmt) : emptyVal}
                  </span>
                </div>

                {/* Bottom Conditional Summary */}
                <div>
                  {hasAdvance ? (
                    <>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '6px 10px',
                          borderTop: borderLight,
                          borderBottom: borderLight,
                          backgroundColor: cellBg
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
                          borderBottom: borderLight,
                          backgroundColor: pastelMint
                        }}
                      >
                        <span style={{ fontWeight: 700, color: emeraldAccent }}>
                          {isEn ? 'Advance Paid' : 'پیشگی وصول'}
                        </span>
                        <span
                          dir={isEn ? 'ltr' : 'rtl'}
                          style={{ fontFamily: isEn ? monoFont : urBodyFont, fontWeight: 700, color: emeraldHighlight }}
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
                          backgroundColor: pastelIvory,
                          borderTop: `1.5px solid ${goldAccent}`,
                          fontWeight: 700,
                          fontSize: isEn ? '11.5px' : '12.5px',
                          color: navyPrimary
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
                        borderTop: `1.5px solid ${goldAccent}`,
                        backgroundColor: pastelIvory,
                        fontWeight: 700,
                        fontSize: isEn ? '11.5px' : '12.5px',
                        color: navyPrimary
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
          </div>

          {/* Row F: Highlighted Bold Legal Remarks Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 12px',
              borderTop: `1.5px solid ${goldAccent}`,
              borderBottom: borderNavy,
              backgroundColor: '#fef3c7',
              fontSize: isEn ? '12px' : '13px'
            }}
          >
            <span style={{ fontWeight: 900, color: navyPrimary, whiteSpace: 'nowrap' }}>
              {isEn ? 'Remarks :' : 'ریمارکس :'}
            </span>
            <span style={{ fontWeight: 800, color: '#020617', flex: '1 1 0%' }}>
              {record.remarks || emptyVal}
            </span>
          </div>

          {/* Row G: BOLD LEGAL TERMS & CONDITIONS + SIGNATURE-ALIGNED QR WITH PURPOSE CAPTION & 3-PARTY SIGNATURES */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.36fr 1fr',
              backgroundColor: cellBg,
              alignItems: 'stretch'
            }}
          >
            {/* Left/Main: Bold Highlighted Legal Terms & Conditions */}
            <div style={{ padding: '7px 11px', borderInlineEnd: borderNavy, backgroundColor: '#fffdf5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div
                  style={{
                    fontFamily: isEn
                      ? "'Libre Baskerville', Georgia, serif"
                      : urBodyFont,
                    fontWeight: 900,
                    fontSize: isEn ? '12px' : '14.5px',
                    color: navyPrimary,
                    borderBottom: `2px solid ${goldAccent}`,
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
                    fontSize: isEn ? '9.4px' : '10.6px',
                    lineHeight: isEn ? '1.38' : '1.64',
                    fontWeight: 800,
                    color: '#020617',
                    textAlign: isEn ? 'left' : 'justify'
                  }}
                >
                  {termsList.map((term, idx) => (
                    <li key={idx} style={{ fontWeight: 800 }}>{term}</li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Right: 4 Verification Boxes in 2x2 Grid (1: QR Code aligned to opposite Driver Signature line + Caption, 2: Driver Sig, 3: Sender Sig, 4: Receiver Sig) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
                backgroundColor: '#ffffff'
              }}
            >
              {/* Box 1: QR Code resized cleanly to match opposite signature line level + QR purpose caption at bottom */}
              <div
                style={{
                  borderInlineEnd: borderLight,
                  borderBottom: borderLight,
                  padding: '8px 8px',
                  margin: '0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    flex: '1 1 0%',
                    minHeight: 0,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: '4px'
                  }}
                >
                  {activeQrUrl ? (
                    <img
                      src={activeQrUrl}
                      alt={isEn ? 'Bilty Verification QR Code' : 'بلٹی تصدیقی کیو آر کوڈ'}
                      style={{
                        width: '100%',
                        height: '100%',
                        maxWidth: '88px',
                        maxHeight: '88px',
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
                <div
                  data-testid="qr-purpose-caption"
                  style={{
                    width: '100%',
                    borderTop: '1px solid #64748b',
                    paddingTop: '4px',
                    textAlign: 'center',
                    fontSize: isEn ? '8.5px' : '10px',
                    fontWeight: 700,
                    color: navyPrimary,
                    lineHeight: '1.2'
                  }}
                >
                  {isEn ? 'Scan to verify Bilty' : 'تصدیقِ بلٹی کیلئے اسکین کریں'}
                </div>
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

        {/* 3. COMPLETE SINGLE-LANGUAGE FOOTER WITH SUBTLE GOLD TRIM */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '4px',
            paddingTop: '4px',
            borderTop: `1px solid ${goldAccent}`,
            fontSize: isEn ? '10px' : '11.5px',
            fontWeight: 700,
            fontFamily: isEn ? enBodyFont : urBodyFont,
            color: navyPrimary,
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
