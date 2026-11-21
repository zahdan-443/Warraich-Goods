import React, { useState, useEffect } from 'react';
import { BiltyRecord, BiltyBranch, BiltyLanguage, BiltyColorTheme } from '../types';
import { getCachedCompanyProfile } from '../utils/storage';
import { biltyOfficialIconData } from '../assets/dashboardIcons';
import { handleEmblemImgError } from '../utils/assetResolver';
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
  colorTheme?: BiltyColorTheme;
}

export const UNIFIED_BILTY_PALETTE = {
  id: 'unified',
  paperBg: '#fff9f0',
  paperGrad: 'linear-gradient(180deg, #fffdf9 0%, #fff4e3 52%, #fffaf2 100%)',
  headerGrad: 'linear-gradient(135deg, #fffef9 0%, #fff4e0 56%, #f8eef0 100%)',
  cellBg: '#fffcf7',
  pastelRowA: '#f9e8ec',
  pastelRowB: '#fef1d6',
  pastelRowC: '#e7f4ee',
  remarksGrad: 'linear-gradient(90deg, #fde68a 0%, #f9e8ec 50%, #fde68a 100%)',
  termsBg: '#fffaf0',
  freightTotalGrad: 'linear-gradient(90deg, #fde68a 0%, #f9e8ec 100%)',
  primaryColor: '#1a477a',
  maroonAccent: '#881337',
  secondaryColor: '#881337',
  emeraldAccent: '#065f46',
  emeraldHighlight: '#047857',
  goldAccent: '#d97706',
  headerStripGrad: 'linear-gradient(90deg, #881337 0%, #d97706 34%, #065f46 67%, #1a477a 100%)',
  colGradLeft: 'linear-gradient(135deg, #1a477a 0%, #0f2942 58%, #1e3a8a 100%)',
  colGradRight: 'linear-gradient(135deg, #881337 0%, #9f1239 58%, #1a477a 100%)',
  lightRule: '#d6c3b0'
} as const;

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
  const theme = UNIFIED_BILTY_PALETTE;

  const branchInfo = BILTY_BRANCHES.samundri;
  const cleanUrduCompanyName = (company.nameUr || 'وڑائچ گڈز ٹرانسپورٹ کمپنی')
    .replace(/\s*\(رجسٹرڈ\)\s*/g, '')
    .trim();
  const phoneLines = branchInfo.phone
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

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
  const activeLogoSrc = propLogoUrl || resolvedLogo || biltyOfficialIconData;

  const fmt = (n?: number) => (n !== undefined && n !== null ? n.toLocaleString('en-US') : '0');
  const formatAmount = (amount: number) => (isEn ? `Rs ${fmt(amount)}` : `${fmt(amount)} روپے`);
  const emptyVal = isEn ? 'N/A' : '—';

  const totalAmt = Math.max(0, Number(record.total) || 0);
  const advanceAmt = Math.max(0, Number(record.advance) || 0);
  const pendingAmt = Math.max(0, Number(record.payable ?? (totalAmt - advanceAmt)) || 0);
  const hasAdvance = advanceAmt > 0;

  const termsList = isEn ? BILTY_TERMS_EN : BILTY_TERMS_UR;

  const borderPrimary = `1.5px solid ${theme.primaryColor}`;
  const borderLight = `1px solid ${theme.lightRule}`;

  const urBodyFont = "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'PDMS Nastaleeq Nafees', serif";
  const urTitleFont = "'Akbar', 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'PDMS Nastaleeq Nafees', serif";
  const enBodyFont = "'IBM Plex Sans', 'Segoe UI', Arial, sans-serif";
  const monoFont = "'JetBrains Mono', 'Courier New', monospace";

  return (
    <div
      dir={isEn ? 'ltr' : 'rtl'}
      id="printable-bilty-inner"
      data-color-theme={theme.id}
      className="printable-bilty-container mx-auto box-border flex flex-col justify-between"
      style={{
        backgroundColor: theme.paperBg,
        backgroundImage: theme.paperGrad,
        color: '#0f172a',
        border: `2.5px solid ${theme.primaryColor}`,
        fontFamily: isEn ? enBodyFont : urBodyFont,
        lineHeight: isEn ? '1.3' : '1.68',
        width: '794px',
        height: '1120px',
        minWidth: '794px',
        maxWidth: '794px',
        minHeight: '1120px',
        maxHeight: '1120px',
        padding: '6px 14px 10px 14px',
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
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .printable-bilty-container {
            width: 210mm !important;
            max-width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
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
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
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
          border: `1.5px solid ${theme.goldAccent}`,
          pointerEvents: 'none',
          zIndex: 3
        }}
      />

      {/* Full-Canvas Warm Ivory Paper Layer */}
      <div
        data-testid="bilty-colored-canvas"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          backgroundColor: theme.paperBg,
          backgroundImage: theme.paperGrad
        }}
      >
        {/* 1. HEADER: Clean Double Border + Gradient Strip with Directional 3-Column Layout & Frameless Centered Logo */}
        <div
          dir={isEn ? 'ltr' : 'rtl'}
          data-testid="pakistani-header-frame"
          style={{
            width: '100%',
            margin: '3px 0 6px 0',
            border: `2px solid ${theme.primaryColor}`,
            borderRadius: '5px',
            padding: '3px',
            backgroundColor: theme.paperBg,
            backgroundImage: theme.headerStripGrad,
            position: 'relative',
            display: 'flex'
          }}
        >
          <div
            style={{
              flex: '1 1 0%',
              border: `1.5px solid ${theme.goldAccent}`,
              borderRadius: '3px',
              backgroundColor: theme.cellBg,
              backgroundImage: theme.headerGrad,
              padding: '9px 12px 9px 12px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Top Gradient Strip Ribbon */}
            <div
              aria-hidden="true"
              data-testid="truck-art-ribbon"
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '4px',
                backgroundImage: theme.headerStripGrad,
                zIndex: 1
              }}
            />

            {/* Directional 3-Column Header Grid: [Identity Column] [Center Frameless Logo] [Proprietor & 2-Line Contacts] */}
            <div
              dir={isEn ? 'ltr' : 'rtl'}
              data-testid="header-three-column-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.55fr) 108px minmax(0, 1fr)',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                position: 'relative',
                zIndex: 2
              }}
            >
              {/* Column 1 (Right in Urdu RTL, Left in English LTR): NTN above Business Name + Hairline + Address */}
              <div
                data-testid="header-identity-col"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minWidth: 0,
                  textAlign: isEn ? 'left' : 'right'
                }}
              >
                {/* NTN directly above Business Name */}
                <div
                  dir="ltr"
                  style={{
                    display: 'flex',
                    justifyContent: isEn ? 'flex-start' : 'flex-end',
                    marginBottom: '3px'
                  }}
                >
                  <div
                    dir={isEn ? 'ltr' : 'rtl'}
                    data-testid="ntn-corner-stamp"
                    style={{
                      border: `1.5px solid ${theme.primaryColor}`,
                      borderBottom: `2px solid ${theme.goldAccent}`,
                      borderRadius: '3px',
                      padding: isEn ? '1.5px 8px' : '1.5px 9px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: isEn ? '9.5px' : '10.5px',
                      fontWeight: 700,
                      fontFamily: isEn ? monoFont : urBodyFont,
                      color: theme.primaryColor,
                      backgroundColor: '#ffffff',
                      letterSpacing: isEn ? '0.04em' : '0',
                      lineHeight: isEn ? '1.3' : '1.45'
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
                            color: theme.maroonAccent,
                            unicodeBidi: 'isolate'
                          }}
                        >
                          7779394-1
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Company Name — Bold, Dominated Pakistani Typography */}
                <div data-testid="company-masthead-title">
                  {isEn ? (
                    <h1
                      style={{
                        fontFamily: "'Cinzel', 'Libre Baskerville', Georgia, 'Times New Roman', serif",
                        fontSize: '15px',
                        fontWeight: 900,
                        letterSpacing: '0.02em',
                        color: theme.maroonAccent,
                        margin: '0',
                        lineHeight: '1.2',
                        textTransform: 'uppercase',
                        textAlign: 'left',
                        textShadow: '0 1px 0 rgba(217, 119, 6, 0.22)'
                      }}
                    >
                      WARRAICH GOODS TRANSPORT COMPANY
                      <sup
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          verticalAlign: 'super',
                          marginLeft: '2px',
                          fontFamily: enBodyFont,
                          color: theme.primaryColor
                        }}
                      >
                        ®
                      </sup>
                    </h1>
                  ) : (
                    <h1
                      style={{
                        fontFamily: urTitleFont,
                        fontSize: '23.5px',
                        fontWeight: 900,
                        color: theme.maroonAccent,
                        margin: '0',
                        lineHeight: '1.52',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        textShadow: '0 1px 0 rgba(217, 119, 6, 0.22)'
                      }}
                    >
                      {cleanUrduCompanyName}
                      <sup
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          verticalAlign: 'super',
                          marginRight: '3px',
                          fontFamily: enBodyFont,
                          color: theme.primaryColor
                        }}
                      >
                        ®
                      </sup>
                    </h1>
                  )}
                </div>

                {/* Simple Solid Accent Hairline directly under Business Name */}
                <div
                  aria-hidden="true"
                  data-testid="company-name-hairline"
                  style={{
                    width: '100%',
                    height: '1.5px',
                    backgroundColor: theme.goldAccent,
                    margin: '3px 0 4px 0'
                  }}
                />

                {/* Office Address below the hairline */}
                <div
                  data-testid="header-office-address"
                  style={{
                    fontSize: isEn ? '10.5px' : '12px',
                    fontWeight: 700,
                    fontFamily: isEn ? enBodyFont : urBodyFont,
                    color: theme.primaryColor,
                    lineHeight: isEn ? '1.32' : '1.55',
                    textAlign: isEn ? 'left' : 'right'
                  }}
                >
                  {isEn ? branchInfo.addressEn : branchInfo.addressUr}
                </div>
              </div>

              {/* Column 2 (Center): Official Icon Centered WITHOUT any inner frame or box */}
              <div
                data-testid="header-logo-inside-frame"
                style={{
                  width: '108px',
                  height: '92px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  border: 'none',
                  margin: '0 auto',
                  padding: '0'
                }}
              >
                {!logoFailed ? (
                  <img
                    src={activeLogoSrc}
                    alt={isEn ? 'Warraich Goods Transport Company Emblem' : 'وڑائچ گڈز ٹرانسپورٹ کمپنی لوگو'}
                    width={104}
                    height={90}
                    onError={(e) => handleEmblemImgError(e.currentTarget, () => setLogoFailed(true))}
                    style={{
                      width: '104px',
                      height: '90px',
                      objectFit: 'contain',
                      border: 'none',
                      backgroundColor: 'transparent',
                      padding: '0',
                      display: 'block'
                    }}
                  />
                ) : (
                  <CompanyLogo className="w-20 h-20" />
                )}
              </div>

              {/* Column 3 (Left in Urdu RTL, Right in English LTR): Proprietor + 2 Stacked Phone Numbers */}
              <div
                data-testid="header-proprietor-col"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minWidth: 0,
                  textAlign: isEn ? 'right' : 'left'
                }}
              >
                {/* Proprietor Name */}
                <div
                  data-testid="proprietor-clean-line"
                  dir={isEn ? 'ltr' : 'rtl'}
                  style={{
                    backgroundColor: 'transparent',
                    fontSize: isEn ? '11px' : '13px',
                    fontWeight: 800,
                    fontFamily: isEn ? enBodyFont : urBodyFont,
                    lineHeight: isEn ? '1.28' : '1.58',
                    textAlign: isEn ? 'right' : 'left',
                    marginBottom: '4px'
                  }}
                >
                  {isEn ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ color: theme.maroonAccent, fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.06em' }}>
                        PROPRIETOR:
                      </span>
                      <span style={{ color: theme.primaryColor, fontSize: '11.5px', fontWeight: 900, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
                        ZAHDAN NASAR WARRAICH
                      </span>
                    </div>
                  ) : (
                    <div style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ color: theme.maroonAccent, fontWeight: 800 }}>پروپرائیٹر:</span>{' '}
                      <span style={{ color: theme.primaryColor, fontWeight: 900 }}>زاہدان نصر وڑائچ</span>
                    </div>
                  )}
                </div>

                {/* Clean 2 Stacked Phone Numbers with Compact Vector Phone Icon */}
                <div
                  dir="ltr"
                  data-testid="header-phone-stack"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                    alignItems: isEn ? 'flex-end' : 'flex-start'
                  }}
                >
                  {phoneLines.map((phoneNum, idx) => (
                    <div
                      key={phoneNum}
                      data-testid={`header-phone-line-${idx + 1}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontFamily: monoFont,
                        fontSize: '11.5px',
                        fontWeight: 800,
                        color: theme.primaryColor,
                        fontVariantNumeric: 'tabular-nums',
                        lineHeight: '1.25'
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={theme.maroonAccent}
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0 }}
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span dir="ltr" style={{ unicodeBidi: 'isolate' }}>{phoneNum}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Gradient Strip Ribbon */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                height: '3px',
                backgroundImage: theme.headerStripGrad,
                zIndex: 1
              }}
            />
          </div>
        </div>

        {/* 2. MASTER DOCUMENT GRID */}
        <div
          style={{
            border: `2px solid ${theme.primaryColor}`,
            borderTop: `3px solid ${theme.goldAccent}`,
            backgroundColor: theme.cellBg,
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
              borderBottom: borderPrimary,
              backgroundColor: theme.pastelRowA,
              fontSize: isEn ? '11.5px' : '12px'
            }}
          >
            <div
              style={{
                padding: '5px 10px',
                borderInlineEnd: borderPrimary,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ fontWeight: 700, color: theme.primaryColor }}>{isEn ? 'Bilty No :' : 'بلٹی نمبر :'}</span>
              <span
                dir="ltr"
                style={{
                  fontWeight: 900,
                  fontFamily: monoFont,
                  fontSize: '13.5px',
                  color: theme.emeraldAccent
                }}
              >
                {record.biltyNo}
              </span>
            </div>
            <div
              style={{
                padding: '5px 10px',
                borderInlineEnd: borderPrimary,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ fontWeight: 700, color: theme.primaryColor }}>{isEn ? 'Truck No :' : 'گاڑی نمبر :'}</span>
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
              <span style={{ fontWeight: 700, color: theme.primaryColor }}>{isEn ? 'Date :' : 'تاریخ :'}</span>
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

          {/* Row B: Driver Details 4 Boxes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.25fr 1fr',
              borderBottom: borderPrimary,
              backgroundColor: theme.pastelRowB,
              fontSize: isEn ? '11px' : '11.5px'
            }}
          >
            <div style={{ borderInlineEnd: borderPrimary, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '4px 10px', borderBottom: borderLight, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: theme.secondaryColor }}>{isEn ? 'Driver Name :' : 'ڈرائیور کا نام :'}</span>
                <span style={{ fontWeight: 900, color: '#0f172a' }}>{record.driverName || emptyVal}</span>
              </div>
              <div style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: theme.secondaryColor }}>{isEn ? 'Driver Mobile :' : 'ڈرائیور موبائل :'}</span>
                <span dir="ltr" style={{ fontFamily: monoFont, fontWeight: 800, color: '#0f172a' }}>
                  {sanitizeContactOrCnic(record.mobileNo, emptyVal)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '4px 10px', borderBottom: borderLight, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: theme.secondaryColor }}>{isEn ? 'License No :' : 'لائسنس نمبر :'}</span>
                <span dir="ltr" style={{ fontFamily: monoFont, fontWeight: 800, color: '#0f172a' }}>
                  {sanitizeContactOrCnic(record.driverLicense, emptyVal)}
                </span>
              </div>
              <div style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: theme.secondaryColor }}>{isEn ? 'Driver CNIC :' : 'ڈرائیور شناختی کارڈ :'}</span>
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
              borderBottom: borderPrimary,
              backgroundColor: theme.cellBg,
              fontSize: isEn ? '11.5px' : '12px'
            }}
          >
            <div style={{ padding: '5px 10px', borderInlineEnd: borderPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, color: theme.primaryColor }}>{isEn ? 'From :' : 'از مقام :'}</span>
              <span style={{ fontWeight: 900, color: '#0f172a', fontSize: isEn ? '12px' : '12.5px' }}>
                {record.sendingCity || (isEn ? branchInfo.nameEn : branchInfo.nameUr)}
              </span>
            </div>
            <div style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, color: theme.primaryColor }}>{isEn ? 'To :' : 'تا مقام :'}</span>
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
              borderBottom: borderPrimary,
              backgroundColor: theme.cellBg,
              fontSize: isEn ? '11px' : '11.5px'
            }}
          >
            {/* Consignor (Sender) */}
            <div style={{ padding: '6px 10px', borderInlineEnd: borderPrimary, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', borderBottom: borderLight, paddingBottom: '3px' }}>
                <span style={{ fontWeight: 700, color: theme.secondaryColor, minWidth: '92px' }}>
                  {isEn ? 'Consignor :' : 'بھیجنے والا :'}
                </span>
                <span style={{ fontWeight: 900, color: '#0f172a', fontSize: isEn ? '12px' : '12.5px' }}>
                  {record.senderName || record.consignor || emptyVal}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: borderLight, paddingBottom: '3px' }}>
                <span style={{ fontWeight: 700, color: theme.secondaryColor, minWidth: '92px' }}>
                  {isEn ? 'Mobile :' : 'فون نمبر :'}
                </span>
                <span dir="ltr" style={{ fontWeight: 800, fontFamily: monoFont, color: '#0f172a' }}>
                  {sanitizeContactOrCnic(record.senderMobile, emptyVal)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, color: theme.secondaryColor, minWidth: '92px' }}>
                  {isEn ? 'Sender CNIC :' : 'شناختی کارڈ :'}
                </span>
                <span dir="ltr" style={{ fontWeight: 700, fontFamily: monoFont, color: '#334155' }}>
                  {sanitizeContactOrCnic(record.senderCnic, emptyVal)}
                </span>
              </div>
            </div>

            {/* Consignee (Receiver) */}
            <div style={{ padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', borderBottom: borderLight, paddingBottom: '3px' }}>
                <span style={{ fontWeight: 700, color: theme.secondaryColor, minWidth: '96px' }}>
                  {isEn ? 'Consignee :' : 'وصول کرنے والا :'}
                </span>
                <span style={{ fontWeight: 900, color: '#0f172a', fontSize: isEn ? '12px' : '12.5px' }}>
                  {record.receiverName || record.consignee || emptyVal}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: borderLight, paddingBottom: '3px' }}>
                <span style={{ fontWeight: 700, color: theme.secondaryColor, minWidth: '96px' }}>
                  {isEn ? 'Mobile :' : 'فون نمبر :'}
                </span>
                <span dir="ltr" style={{ fontWeight: 800, fontFamily: monoFont, color: '#0f172a' }}>
                  {sanitizeContactOrCnic(record.receiverMobile, emptyVal)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, color: theme.secondaryColor, minWidth: '96px' }}>
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
              borderBottom: borderPrimary,
              flex: '1 1 0%',
              minHeight: '150px',
              backgroundColor: theme.cellBg
            }}
          >
            {/* Col 1: No of Articles (Pakistani Offset Gradient Header + Gold Rule) */}
            <div style={{ borderInlineEnd: borderPrimary, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  padding: '6px 6px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: isEn ? '11px' : '12px',
                  borderBottom: `2px solid ${theme.goldAccent}`,
                  backgroundColor: theme.primaryColor,
                  backgroundImage: theme.colGradLeft,
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

            {/* Col 2: Nature of Goods (Rich Gradient Header + Scoped Transparent Logo Watermark) */}
            <div style={{ borderInlineEnd: borderPrimary, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  padding: '6px 10px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: isEn ? '11px' : '12px',
                  borderBottom: `2px solid ${theme.goldAccent}`,
                  backgroundColor: theme.secondaryColor,
                  backgroundImage: theme.colGradRight,
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
                  backgroundColor: theme.cellBg,
                  fontSize: isEn ? '16px' : '18.5px',
                  lineHeight: isEn ? '1.45' : '1.78',
                  fontWeight: 800,
                  color: '#020617'
                }}
              >
                {/* Scoped Transparent Company Logo Watermark inside Nature of Goods cell */}
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
                    opacity: 0.09,
                    zIndex: 0
                  }}
                >
                  {!logoFailed ? (
                    <img
                      src={activeLogoSrc}
                      alt=""
                      onError={(e) => handleEmblemImgError(e.currentTarget)}
                      style={{
                        width: '260px',
                        maxWidth: '90%',
                        maxHeight: '145px',
                        objectFit: 'contain',
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

            {/* Col 3: Weight (Gradient Header + Gold Rule) */}
            <div style={{ borderInlineEnd: borderPrimary, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  padding: '6px 6px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: isEn ? '11px' : '12px',
                  borderBottom: `2px solid ${theme.goldAccent}`,
                  backgroundColor: theme.primaryColor,
                  backgroundImage: theme.colGradLeft,
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
                      color: theme.secondaryColor,
                      marginTop: '3px',
                      fontFamily: isEn ? enBodyFont : urBodyFont
                    }}
                  >
                    {isEn ? 'KG' : 'کلوگرام'}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Col 4: Freight Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div
                style={{
                  padding: '6px 8px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: isEn ? '11px' : '12px',
                  borderBottom: `2px solid ${theme.goldAccent}`,
                  backgroundColor: theme.secondaryColor,
                  backgroundImage: theme.colGradRight,
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
                    backgroundColor: theme.cellBg,
                    fontSize: isEn ? '12px' : '13px',
                    fontWeight: 800,
                    color: '#0f172a'
                  }}
                >
                  <span style={{ fontWeight: 700, color: theme.primaryColor }}>
                    {isEn ? 'Freight' : 'کرایہ'}
                  </span>
                  <span
                    dir={isEn ? 'ltr' : 'rtl'}
                    style={{ fontFamily: isEn ? monoFont : urBodyFont, fontWeight: 800, color: theme.secondaryColor }}
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
                          backgroundColor: theme.cellBg
                        }}
                      >
                        <span style={{ fontWeight: 700, color: theme.primaryColor }}>
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
                          backgroundColor: theme.pastelRowC
                        }}
                      >
                        <span style={{ fontWeight: 700, color: theme.emeraldAccent }}>
                          {isEn ? 'Advance Paid' : 'پیشگی وصول'}
                        </span>
                        <span
                          dir={isEn ? 'ltr' : 'rtl'}
                          style={{ fontFamily: isEn ? monoFont : urBodyFont, fontWeight: 700, color: theme.emeraldHighlight }}
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
                          backgroundColor: theme.pastelRowB,
                          backgroundImage: theme.freightTotalGrad,
                          borderTop: `1.5px solid ${theme.goldAccent}`,
                          fontWeight: 700,
                          fontSize: isEn ? '11.5px' : '12.5px',
                          color: theme.primaryColor
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
                        borderTop: `1.5px solid ${theme.goldAccent}`,
                        backgroundColor: theme.pastelRowB,
                        backgroundImage: theme.freightTotalGrad,
                        fontWeight: 700,
                        fontSize: isEn ? '11.5px' : '12.5px',
                        color: theme.primaryColor
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

          {/* Row F: Highlighted Bold Legal Remarks Row with Pakistani Gradient Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 12px',
              borderTop: `1.5px solid ${theme.goldAccent}`,
              borderBottom: borderPrimary,
              backgroundColor: theme.pastelRowB,
              backgroundImage: theme.remarksGrad,
              fontSize: isEn ? '12px' : '13px'
            }}
          >
            <span style={{ fontWeight: 900, color: theme.primaryColor, whiteSpace: 'nowrap' }}>
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
              backgroundColor: theme.cellBg,
              alignItems: 'stretch'
            }}
          >
            {/* Left/Main: Bold Highlighted Legal Terms & Conditions */}
            <div style={{ padding: '7px 11px', borderInlineEnd: borderPrimary, backgroundColor: theme.termsBg, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div
                  style={{
                    fontFamily: isEn
                      ? "'Libre Baskerville', Georgia, serif"
                      : urBodyFont,
                    fontWeight: 900,
                    fontSize: isEn ? '12px' : '14.5px',
                    color: theme.primaryColor,
                    borderBottom: `2px solid ${theme.goldAccent}`,
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
                    gap: '3px',
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

            {/* Right: 4 Verification Boxes in 2x2 Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
                backgroundColor: theme.cellBg
              }}
            >
              {/* Box 1: QR Code on crisp white quiet-zone pad + purpose caption */}
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
                    borderTop: `1px solid ${theme.primaryColor}`,
                    paddingTop: '4px',
                    textAlign: 'center',
                    fontSize: isEn ? '8.5px' : '10px',
                    fontWeight: 700,
                    color: theme.primaryColor,
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
                  backgroundColor: theme.pastelRowC
                }}
              >
                <div style={{ width: '100%', borderTop: `1px solid ${theme.primaryColor}`, paddingTop: '4px', fontSize: isEn ? '9.5px' : '11px', fontWeight: 700, color: theme.primaryColor }}>
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
                  backgroundColor: theme.pastelRowA
                }}
              >
                <div style={{ width: '100%', borderTop: `1px solid ${theme.primaryColor}`, paddingTop: '4px', fontSize: isEn ? '9.5px' : '11px', fontWeight: 700, color: theme.primaryColor }}>
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
                  backgroundColor: theme.pastelRowB
                }}
              >
                <div style={{ width: '100%', borderTop: `1px solid ${theme.primaryColor}`, paddingTop: '4px', fontSize: isEn ? '9.5px' : '11px', fontWeight: 700, color: theme.primaryColor }}>
                  {isEn ? 'Receiver Signature' : 'دستخط وصول کنندہ'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. TRUCK-ART GRADIENT ACCENT FOOTER */}
        <div
          style={{
            marginTop: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px'
          }}
        >
          <div
            style={{
              textAlign: 'center',
              paddingTop: '3px',
              borderTop: `1.5px solid ${theme.goldAccent}`,
              fontSize: isEn ? '10px' : '11.5px',
              fontWeight: 700,
              fontFamily: isEn ? enBodyFont : urBodyFont,
              color: theme.primaryColor,
              letterSpacing: isEn ? '0.02em' : '0'
            }}
          >
            {isEn
              ? 'This is a computer-generated Bilty, no signature required'
              : 'یہ کمپیوٹر سے تیار کردہ بلٹی ہے، دستخط کی ضرورت نہیں'}
          </div>
          <div
            aria-hidden="true"
            style={{
              height: '4px',
              width: '100%',
              borderRadius: '2px',
              backgroundImage: theme.headerStripGrad
            }}
          />
        </div>
      </div>
    </div>
  );
};
