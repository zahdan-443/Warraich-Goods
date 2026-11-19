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

interface BiltyPalette {
  id: BiltyColorTheme;
  labelUr: string;
  labelEn: string;
  paperBg: string;
  paperGrad: string;
  headerGrad: string;
  cellBg: string;
  pastelRowA: string;
  pastelRowB: string;
  pastelRowC: string;
  remarksGrad: string;
  termsBg: string;
  freightTotalGrad: string;
  primaryColor: string;
  secondaryColor: string;
  emeraldAccent: string;
  emeraldHighlight: string;
  goldAccent: string;
  headerStripGrad: string;
  colGradLeft: string;
  colGradRight: string;
  lightRule: string;
}

export const BILTY_COLOR_THEMES: Record<BiltyColorTheme, BiltyPalette> = {
  pink: {
    id: 'pink',
    labelUr: 'گلابی (Gulabi)',
    labelEn: 'Rose Pink',
    paperBg: '#fff0f5',
    paperGrad: 'linear-gradient(180deg, #fff6f9 0%, #ffe4ef 52%, #fff3f7 100%)',
    headerGrad: 'linear-gradient(135deg, #fff8fb 0%, #ffe3ee 55%, #fff3db 100%)',
    cellBg: '#fff8fb',
    pastelRowA: '#ffdce9',
    pastelRowB: '#ffedd5',
    pastelRowC: '#e6f6ef',
    remarksGrad: 'linear-gradient(90deg, #fde68a 0%, #fbcfe8 50%, #fde68a 100%)',
    termsBg: '#fffaf3',
    freightTotalGrad: 'linear-gradient(90deg, #fde68a 0%, #fbcfe8 100%)',
    primaryColor: '#881337',
    secondaryColor: '#1a477a',
    emeraldAccent: '#065f46',
    emeraldHighlight: '#047857',
    goldAccent: '#d97706',
    headerStripGrad: 'linear-gradient(90deg, #9f1239 0%, #d97706 34%, #065f46 67%, #1a477a 100%)',
    colGradLeft: 'linear-gradient(135deg, #881337 0%, #be123c 58%, #9f1239 100%)',
    colGradRight: 'linear-gradient(135deg, #1a477a 0%, #0f2942 58%, #065f46 100%)',
    lightRule: '#d8b4c4'
  },
  yellow: {
    id: 'yellow',
    labelUr: 'پیلا (Golden)',
    labelEn: 'Golden Buff',
    paperBg: '#fef9c3',
    paperGrad: 'linear-gradient(180deg, #fffef2 0%, #fef0c7 52%, #fffbeb 100%)',
    headerGrad: 'linear-gradient(135deg, #fffef6 0%, #fdecc2 54%, #eaf3ff 100%)',
    cellBg: '#fffef5',
    pastelRowA: '#fde68a',
    pastelRowB: '#e0f2fe',
    pastelRowC: '#dcfce7',
    remarksGrad: 'linear-gradient(90deg, #fed7aa 0%, #fef08a 50%, #fed7aa 100%)',
    termsBg: '#fffcf0',
    freightTotalGrad: 'linear-gradient(90deg, #fed7aa 0%, #fef08a 100%)',
    primaryColor: '#1a477a',
    secondaryColor: '#9a3412',
    emeraldAccent: '#065f46',
    emeraldHighlight: '#047857',
    goldAccent: '#c9972c',
    headerStripGrad: 'linear-gradient(90deg, #9a3412 0%, #d97706 34%, #065f46 67%, #1a477a 100%)',
    colGradLeft: 'linear-gradient(135deg, #1a477a 0%, #1e3a8a 58%, #0f2942 100%)',
    colGradRight: 'linear-gradient(135deg, #9a3412 0%, #b45309 58%, #d97706 100%)',
    lightRule: '#d4b483'
  },
  green: {
    id: 'green',
    labelUr: 'سبز (Green)',
    labelEn: 'Emerald Green',
    paperBg: '#dcfce7',
    paperGrad: 'linear-gradient(180deg, #f2fdf7 0%, #dcfce7 52%, #ecfdf5 100%)',
    headerGrad: 'linear-gradient(135deg, #f6fff9 0%, #d1fae5 54%, #fef3c7 100%)',
    cellBg: '#f6fff9',
    pastelRowA: '#bbf7d0',
    pastelRowB: '#fef3c7',
    pastelRowC: '#e0f2fe',
    remarksGrad: 'linear-gradient(90deg, #a7f3d0 0%, #fde68a 50%, #a7f3d0 100%)',
    termsBg: '#f3fcf6',
    freightTotalGrad: 'linear-gradient(90deg, #a7f3d0 0%, #fde68a 100%)',
    primaryColor: '#065f46',
    secondaryColor: '#1a477a',
    emeraldAccent: '#047857',
    emeraldHighlight: '#065f46',
    goldAccent: '#d97706',
    headerStripGrad: 'linear-gradient(90deg, #065f46 0%, #10b981 33%, #d97706 67%, #9f1239 100%)',
    colGradLeft: 'linear-gradient(135deg, #065f46 0%, #047857 58%, #064e3b 100%)',
    colGradRight: 'linear-gradient(135deg, #1a477a 0%, #0f2942 56%, #9f1239 100%)',
    lightRule: '#94c9b2'
  }
};

export const PrintableBilty: React.FC<PrintableBiltyProps> = ({
  record,
  qrDataUrl: propQrUrl,
  logoDataUrl: propLogoUrl,
  language: propLanguage,
  colorTheme: propColorTheme
}) => {
  const [internalQrUrl, setInternalQrUrl] = useState<string>('');
  const [resolvedLogo, setResolvedLogo] = useState<string>(propLogoUrl || '');
  const [logoFailed, setLogoFailed] = useState<boolean>(false);
  const company = getCachedCompanyProfile();

  const activeLang: BiltyLanguage = record.language || propLanguage || 'ur';
  const isEn = activeLang === 'en';
  const activeColorKey: BiltyColorTheme = propColorTheme || record.colorTheme || 'pink';
  const theme = BILTY_COLOR_THEMES[activeColorKey] || BILTY_COLOR_THEMES.pink;

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

  const urBodyFont = "'Jameel Noori Nastaleeq', 'PDMS Nastaleeq Nafees', 'Noto Nastaliq Urdu', serif";
  const urTitleFont = "'Akbar', 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif";
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
        lineHeight: isEn ? '1.3' : '1.55',
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

      {/* Full-Canvas Colored Pakistani Paper Layer */}
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
        {/* 1. HEADER: Pakistani Truck-Art Frame with Right Company Name | Center Shield Logo | Left Proprietor & Phones */}
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
              padding: '15px 14px 10px 14px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Top Truck-Art Geometric Chamak-Patti Ribbon */}
            <div
              aria-hidden="true"
              data-testid="truck-art-ribbon"
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '5px',
                backgroundImage: theme.headerStripGrad,
                zIndex: 1
              }}
            />

            {/* Top-Center Pakistani Geometric Crest Divider */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '1px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: theme.cellBg,
                padding: '1px 8px',
                borderRadius: '0 0 8px 8px',
                borderBottom: `1px solid ${theme.goldAccent}`,
                lineHeight: 0,
                zIndex: 2
              }}
            >
              <svg width="78" height="13" viewBox="0 0 78 13" fill="none">
                <path d="M2 6.5H24" stroke={theme.primaryColor} strokeWidth="1.4" />
                <path d="M54 6.5H76" stroke={theme.primaryColor} strokeWidth="1.4" />
                <polygon points="39,1 45,6.5 39,12 33,6.5" fill={theme.goldAccent} stroke={theme.primaryColor} strokeWidth="1.2" />
                <polygon points="28,2.5 31.5,6.5 28,10.5 24.5,6.5" fill={theme.emeraldAccent} />
                <polygon points="50,2.5 53.5,6.5 50,10.5 46.5,6.5" fill={theme.secondaryColor} />
                <circle cx="39" cy="6.5" r="1.7" fill="#ffffff" />
              </svg>
            </div>

            {/* 4 Corner Pakistani Truck-Art Floral Step-Brackets */}
            {[
              { top: '7px', left: '4px', transform: 'none' },
              { top: '7px', right: '4px', transform: 'scaleX(-1)' },
              { bottom: '4px', left: '4px', transform: 'scaleY(-1)' },
              { bottom: '4px', right: '4px', transform: 'scale(-1, -1)' }
            ].map((cornerPos, idx) => (
              <svg
                key={idx}
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                style={{
                  position: 'absolute',
                  ...cornerPos,
                  pointerEvents: 'none',
                  zIndex: 2
                }}
              >
                <path d="M1 17V4.5C1 2.567 2.567 1 4.5 1H17" stroke={theme.primaryColor} strokeWidth="1.6" />
                <path d="M4.5 14V6C4.5 5.17157 5.17157 4.5 6 4.5H14" stroke={theme.goldAccent} strokeWidth="1.2" />
                <polygon points="8,8 10.5,5.5 13,8 10.5,10.5" fill={theme.emeraldAccent} />
                <circle cx="15.5" cy="1.8" r="1.3" fill={theme.secondaryColor} />
              </svg>
            ))}

            {/* Top-Right NTN Corner Stamp (Crisp White Badge + BiDi Isolated Urdu Number) */}
            <div
              dir={isEn ? 'ltr' : 'rtl'}
              data-testid="ntn-corner-stamp"
              style={{
                position: 'absolute',
                top: '10px',
                right: '28px',
                border: `1.5px solid ${theme.primaryColor}`,
                borderBottom: `2px solid ${theme.goldAccent}`,
                borderRadius: '3px',
                padding: isEn ? '2px 9px' : '2px 10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: isEn ? '9.5px' : '10.5px',
                fontWeight: 700,
                fontFamily: isEn ? monoFont : "'Noto Sans Arabic', 'Jameel Noori Nastaleeq', sans-serif",
                color: theme.primaryColor,
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
                      color: theme.secondaryColor,
                      unicodeBidi: 'isolate'
                    }}
                  >
                    7779394-1
                  </span>
                </>
              )}
            </div>

            {/* Inner Frame 3-Column Row: Right Company Name & Address | Center Logo | Left Proprietor & Phones */}
            <div
              dir={isEn ? 'ltr' : 'rtl'}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.45fr 0.75fr 1.25fr',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                marginTop: '14px'
              }}
            >
              {/* Column 1 (Right in Urdu / Left in English): Company Name & Head Office Address */}
              <div
                style={{
                  textAlign: isEn ? 'left' : 'right',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  paddingInlineStart: '6px'
                }}
              >
                <div
                  data-testid="company-masthead-title"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderBottom: `2px solid ${theme.goldAccent}`,
                    paddingBottom: '4px',
                    marginBottom: '5px'
                  }}
                >
                  {isEn ? (
                    <h1
                      style={{
                        fontFamily: "'Cinzel', 'Libre Baskerville', Georgia, 'Times New Roman', serif",
                        fontSize: '16.5px',
                        fontWeight: 900,
                        letterSpacing: '0.02em',
                        color: theme.primaryColor,
                        margin: '0',
                        lineHeight: '1.18',
                        textTransform: 'uppercase',
                        textShadow: '0 1px 0 rgba(217, 119, 6, 0.25)'
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
                          color: theme.emeraldAccent
                        }}
                      >
                        ®
                      </sup>
                    </h1>
                  ) : (
                    <h1
                      style={{
                        fontFamily: urTitleFont,
                        fontSize: '21px',
                        fontWeight: 800,
                        color: theme.primaryColor,
                        margin: '0',
                        lineHeight: '1.42',
                        textShadow: '0 1px 0 rgba(217, 119, 6, 0.24)'
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
                          color: theme.emeraldAccent
                        }}
                      >
                        ®
                      </sup>
                    </h1>
                  )}
                </div>

                {/* Head Office Address neatly placed directly below Company Name */}
                <div
                  style={{
                    fontSize: isEn ? '10.5px' : '11.5px',
                    fontWeight: 700,
                    fontFamily: isEn ? enBodyFont : urBodyFont,
                    color: theme.secondaryColor,
                    lineHeight: isEn ? '1.35' : '1.5'
                  }}
                >
                  {isEn ? branchInfo.addressEn : branchInfo.addressUr}
                </div>
              </div>

              {/* Column 2 (Center): Official Emblem / Shield Logo */}
              <div
                data-testid="header-logo-inside-frame"
                style={{
                  width: '100%',
                  height: '92px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  backgroundColor: 'transparent',
                  margin: '0',
                  padding: '0'
                }}
              >
                {!logoFailed ? (
                  <img
                    src={activeLogoSrc}
                    alt={isEn ? 'Warraich Goods Transport Company Emblem' : 'وڑائچ گڈز ٹرانسپورٹ کمپنی لوگو'}
                    width={96}
                    height={92}
                    onError={(e) => handleEmblemImgError(e.currentTarget, () => setLogoFailed(true))}
                    style={{
                      width: '100%',
                      height: '100%',
                      maxWidth: '96px',
                      maxHeight: '92px',
                      objectFit: 'contain',
                      border: 'none',
                      backgroundColor: 'transparent',
                      padding: '0',
                      display: 'block'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '84px',
                      height: '84px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'transparent'
                    }}
                  >
                    <CompanyLogo className="w-20 h-20" />
                  </div>
                )}
              </div>

              {/* Column 3 (Left in Urdu / Right in English): Proprietor & Phone Numbers */}
              <div
                style={{
                  textAlign: isEn ? 'right' : 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: isEn ? 'flex-end' : 'flex-start',
                  borderInlineStart: `1.5px dashed ${theme.goldAccent}`,
                  paddingInlineStart: '12px',
                  paddingInlineEnd: '6px'
                }}
              >
                {/* Proprietor Line */}
                <div
                  data-testid="proprietor-clean-line"
                  style={{
                    backgroundColor: 'transparent',
                    color: theme.secondaryColor,
                    paddingBottom: '4px',
                    marginBottom: '4px',
                    fontSize: isEn ? '11.5px' : '13px',
                    fontWeight: 800,
                    fontFamily: isEn ? enBodyFont : urBodyFont,
                    letterSpacing: isEn ? '0.03em' : '0',
                    textTransform: isEn ? 'uppercase' : 'none',
                    borderBottom: `1px solid ${theme.lightRule}`,
                    lineHeight: isEn ? '1.35' : '1.5',
                    width: '100%'
                  }}
                >
                  {isEn ? (
                    <>
                      <span style={{ color: theme.emeraldAccent, fontWeight: 800 }}>PROPRIETOR:</span>{' '}
                      <span style={{ color: theme.primaryColor, fontWeight: 900 }}>ZAHDAN NASAR WARRAICH</span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: theme.emeraldAccent, fontWeight: 800 }}>پروپرائیٹر:</span>{' '}
                      <span style={{ color: theme.primaryColor, fontWeight: 900 }}>زاہدان نصر وڑائچ</span>
                    </>
                  )}
                </div>

                {/* Mobile Numbers */}
                <div
                  dir={isEn ? 'ltr' : 'rtl'}
                  style={{
                    fontFamily: isEn ? monoFont : urBodyFont,
                    fontSize: isEn ? '10.5px' : '11.5px',
                    color: theme.emeraldAccent,
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: '1.45'
                  }}
                >
                  {isEn ? (
                    <span>☎ {branchInfo.phone}</span>
                  ) : (
                    <span>
                      فون نمبر:{' '}
                      <span
                        dir="ltr"
                        style={{
                          fontFamily: monoFont,
                          fontSize: '10.5px',
                          color: theme.primaryColor,
                          fontWeight: 800,
                          unicodeBidi: 'isolate'
                        }}
                      >
                        {branchInfo.phone}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
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
