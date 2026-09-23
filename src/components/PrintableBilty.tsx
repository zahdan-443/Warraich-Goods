import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { BiltyRecord, BiltyBranch, BiltyLanguage } from '../types';
import { getCachedCompanyProfile } from '../utils/storage';
import { logoIconData, biltyOfficialIconData, companyCardData } from '../assets/dashboardIcons';
import { getLogoBase64, getCompanyCardBase64 } from '../utils/pdfHelper';
import { CompanyLogo } from './CompanyLogo';
import {
  sanitizeContactOrCnic,
  generateBiltyVerificationQrDataUrl,
  getBiltyVerificationUrl,
  BILTY_BRANCHES,
  BILTY_TERMS_UR,
  BILTY_TERMS_EN
} from '../utils/biltyHelpers';

interface PrintableBiltyProps {
  record: BiltyRecord;
  qrDataUrl?: string;
  branch?: BiltyBranch;
  language?: BiltyLanguage;
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

export const PrintableBilty: React.FC<PrintableBiltyProps> = ({
  record,
  qrDataUrl: propQrUrl,
  branch: propBranch,
  language: propLanguage
}) => {
  const [internalQrUrl, setInternalQrUrl] = useState<string>('');
  const [resolvedLogo, setResolvedLogo] = useState<string>('');
  const [resolvedCard, setResolvedCard] = useState<string>('');
  const [logoFailed, setLogoFailed] = useState<boolean>(false);
  const company = getCachedCompanyProfile();

  // Selected Branch and Language resolution
  const activeBranch: BiltyBranch = record.branch || propBranch || 'samundri';
  const activeLang: BiltyLanguage = record.language || propLanguage || 'ur';
  const isEn = activeLang === 'en';
  const branchInfo = BILTY_BRANCHES[activeBranch] || BILTY_BRANCHES.samundri;

  useEffect(() => {
    let isMounted = true;
    getLogoBase64().then((b64) => {
      if (isMounted && b64) {
        setResolvedLogo(b64);
      }
    });
    getCompanyCardBase64().then((b64) => {
      if (isMounted && b64) {
        setResolvedCard(b64);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!propQrUrl && record?.biltyNo) {
      generateBiltyVerificationQrDataUrl(record.biltyNo)
        .then((url) => {
          if (isMounted) setInternalQrUrl(url);
        })
        .catch((err) => {
          console.error('QR generation error:', err);
          if (isMounted) {
            const fallback = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(getBiltyVerificationUrl(record.biltyNo))}&size=150x150`;
            setInternalQrUrl(fallback);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [propQrUrl, record?.biltyNo]);

  const activeQrUrl = propQrUrl || internalQrUrl;
  const fmt = (n?: number) => (n !== undefined && n !== null ? n.toLocaleString('en-US') : '0');

  // Terms based on selected Language
  const termsList = isEn ? BILTY_TERMS_EN : BILTY_TERMS_UR;

  // Payment badge calculation
  const isPaid = (record.payable || 0) <= 0;
  const isAdvanceOnly = (record.advance || 0) > 0 && (record.payable || 0) > 0;

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

      {/* Official Warraich Goods Transport Company Card Background Watermark ("public/warraich-card.png") */}
      <div
        style={{
          position: 'absolute',
          top: '51%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.13,
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
          width: '620px',
          maxWidth: '85%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img
          src={resolvedCard || companyCardData || './warraich-card.png'}
          alt="Warraich Goods Transport Company Card"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.triedBase) {
              target.dataset.triedBase = '1';
              const base = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL ? import.meta.env.BASE_URL : './';
              const clean = base.endsWith('/') ? base : base + '/';
              target.src = `${clean}warraich-card.png`;
            } else if (!target.dataset.triedGh) {
              target.dataset.triedGh = '1';
              target.src = 'https://zahdan-443.github.io/Warraich-Goods/warraich-card.png';
            } else if (!target.dataset.triedRoot) {
              target.dataset.triedRoot = '1';
              target.src = '/warraich-card.png';
            }
          }}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '430px',
            objectFit: 'contain',
            borderRadius: '12px'
          }}
        />
      </div>

      {/* 1. TOP HEADER (BRANDING & CONSIGNMENT NOTE CARD) */}
      <div
        style={{
          paddingBottom: '10px',
          marginBottom: '8px',
          borderBottom: '2px solid #0f2942',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            gap: '12px',
            textAlign: isEn ? 'left' : 'right'
          }}
        >
          {/* Main Branding Block */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 0%' }}>
            {!logoFailed ? (
              <img
                src={resolvedLogo || biltyOfficialIconData || './bilty-official-icon.png'}
                alt="Warraich Goods Transport Company Official Bilty Seal"
                width={74}
                height={74}
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
                  width: '74px',
                  height: '74px',
                  minWidth: '74px',
                  minHeight: '74px',
                  maxWidth: '74px',
                  maxHeight: '74px',
                  borderRadius: '50%',
                  padding: '2px',
                  backgroundColor: '#ffffff',
                  border: '2.5px solid #0f2942',
                  boxShadow: '0 2px 8px rgba(15, 41, 66, 0.18)',
                  objectFit: 'contain',
                  flexShrink: 0
                }}
              />
            ) : (
              <div
                style={{
                  width: '74px',
                  height: '74px',
                  minWidth: '74px',
                  minHeight: '74px',
                  borderRadius: '50%',
                  padding: '4px',
                  backgroundColor: '#ffffff',
                  border: '2.5px solid #0f2942',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CompanyLogo className="w-14 h-14" />
              </div>
            )}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: isEn ? 'left' : 'right'
              }}
            >
              {isEn ? (
                <>
                  {/* English Big Title */}
                  <h1
                    style={{
                      fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
                      fontSize: '22px',
                      fontWeight: 900,
                      letterSpacing: '0.02em',
                      lineHeight: '1.2',
                      color: '#0f2942',
                      margin: '0 0 3px 0',
                      padding: '0',
                      textTransform: 'uppercase'
                    }}
                  >
                    WARRAICH GOODS TRANSPORT CO. (REGD.)
                  </h1>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      color: '#1e293b',
                      textTransform: 'uppercase'
                    }}
                  >
                    ALL PAKISTAN FREIGHT & CARGO LOGISTICS NETWORK
                  </div>
                  <p
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#475569',
                      marginTop: '2px',
                      marginBottom: '0'
                    }}
                  >
                    Reliable, Direct & Safe Heavy Transport Service Across Pakistan
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '4px',
                      fontSize: '10.5px',
                      fontWeight: 600,
                      color: '#1e293b'
                    }}
                  >
                    <span>
                      📍 <strong>Address ({branchInfo.nameEn}):</strong> {branchInfo.addressEn}
                    </span>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <span>
                      📞 <strong>Helpline:</strong>{' '}
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                        {branchInfo.phone}
                      </span>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* Urdu Big Title with Authentic Nastaliq Typography */}
                  <h1
                    style={{
                      fontFamily:
                        "'Jameel Noori Nastaleeq', 'jameel-noori-nastaleeq', 'Alvi Lahori Nastaleeq', 'PDMS Nastaleeq Nafees', 'Noto Nastaliq Urdu', serif",
                      fontSize: '25px',
                      fontWeight: 700,
                      letterSpacing: '0',
                      lineHeight: '1.7',
                      color: '#0f2942',
                      margin: '0 0 2px 0',
                      padding: '0'
                    }}
                  >
                    {company.nameUr || 'وڑائچ گڈز ٹرانسپورٹ کمپنی (رجسٹرڈ)'}
                  </h1>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      color: '#1e293b',
                      textTransform: 'uppercase'
                    }}
                  >
                    {company.nameEn || 'WARRAICH GOODS TRANSPORT CO.'}
                  </div>
                  <p
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 600,
                      color: '#475569',
                      marginTop: '1px',
                      marginBottom: '0'
                    }}
                  >
                    {company.taglineUr || 'ملک بھر میں مال برداری و لاجسٹکس سروس | آل پاکستان روڈ فریٹ'}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '3px',
                      fontSize: '10.5px',
                      fontWeight: 600,
                      color: '#1e293b'
                    }}
                  >
                    <span>
                      📍 <strong>پتہ ({branchInfo.nameUr}):</strong> {branchInfo.addressUr}
                    </span>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <span>
                      📞 <strong>ہیلپ لائن:</strong>{' '}
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          direction: 'ltr',
                          display: 'inline-block',
                          fontWeight: 700
                        }}
                      >
                        {branchInfo.phone}
                      </span>
                    </span>
                  </div>
                </>
              )}
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
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 900,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase'
                }}
              >
                {isEn ? 'CONSIGNMENT NOTE / BILTY' : 'با ضابطہ فریٹ بلٹی رسید'}
              </div>
              <div
                style={{
                  fontSize: isEn ? '10px' : '11px',
                  fontWeight: 700,
                  marginTop: '2px',
                  opacity: 0.95
                }}
              >
                {isEn ? 'OFFICIAL GOODS RECEIPT' : 'وڑائچ گڈز کنٹریکٹ بلٹی'}
              </div>
            </div>

            {/* Meta Table Details */}
            <div
              style={{
                padding: '6px 8px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '3px'
                }}
              >
                <span style={{ color: '#64748b', fontWeight: 600 }}>
                  {isEn ? 'Bilty No:' : 'بلٹی نمبر:'}
                </span>
                <span
                  style={{
                    fontWeight: 900,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '12px',
                    direction: 'ltr',
                    color: '#0f172a'
                  }}
                >
                  {record.biltyNo}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '3px'
                }}
              >
                <span style={{ color: '#64748b', fontWeight: 600 }}>
                  {isEn ? 'Date:' : 'تاریخ:'}
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '11px',
                    direction: 'ltr',
                    color: '#1e293b'
                  }}
                >
                  {record.date || '-'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '3px'
                }}
              >
                <span style={{ color: '#64748b', fontWeight: 600 }}>
                  {isEn ? 'Vehicle No:' : 'گاڑی نمبر:'}
                </span>
                <span
                  style={{
                    fontWeight: 900,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '12px',
                    direction: 'ltr',
                    color: '#0f172a'
                  }}
                >
                  {record.vehicleNo}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '2px'
                }}
              >
                <span style={{ color: '#64748b', fontWeight: 600 }}>
                  {isEn ? 'Payment Status:' : 'طریقہ ادائیگی:'}
                </span>
                {isPaid ? (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '9.5px',
                      fontWeight: 900,
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      border: '1px solid #86efac'
                    }}
                  >
                    {isEn ? 'PAID' : 'ادا شدہ (PAID)'}
                  </span>
                ) : isAdvanceOnly ? (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '9.5px',
                      fontWeight: 900,
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      border: '1px solid #fcd34d'
                    }}
                  >
                    {isEn ? 'ADVANCE (PARTIAL)' : 'پیشگی + بقایا (ADVANCE)'}
                  </span>
                ) : (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '9.5px',
                      fontWeight: 900,
                      backgroundColor: '#ffe4e6',
                      color: '#9f1239',
                      border: '1px solid #fda4af'
                    }}
                  >
                    {isEn ? 'TO BE PAID' : 'بقایا بلٹی (TO PAY)'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SENDER & RECEIVER BOXES (CONSIGNOR / CONSIGNEE) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '8px',
          marginBottom: '8px'
        }}
      >
        {/* Consignor / Sender Box */}
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
            <span>{isEn ? 'CONSIGNOR (SENDER)' : 'مال بھیجنے والا (کنسائنر)'}</span>
            <span
              style={{
                fontSize: '9.5px',
                padding: '1px 6px',
                borderRadius: '3px',
                backgroundColor: '#f1f5f9',
                fontFamily: "'JetBrains Mono', monospace",
                color: '#334155'
              }}
            >
              {isEn ? 'SENDER' : 'کنسائنر'}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontWeight: 700,
              fontSize: '11px',
              color: '#1e293b'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>{isEn ? 'Name:' : 'نام:'}</span>
              <span style={{ fontWeight: 900, color: '#0f172a', textAlign: isEn ? 'left' : 'right' }}>
                {record.senderName || record.consignor || 'N/A'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>{isEn ? 'Phone No:' : 'فون نمبر:'}</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  direction: 'ltr',
                  fontWeight: 900,
                  color: '#0f172a'
                }}
              >
                {sanitizeContactOrCnic(record.senderMobile)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>{isEn ? 'CNIC:' : 'شناختی کارڈ:'}</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  direction: 'ltr',
                  color: '#334155'
                }}
              >
                {sanitizeContactOrCnic(record.senderCnic)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '3px',
                borderTop: '1px solid #f1f5f9'
              }}
            >
              <span style={{ color: '#64748b', fontWeight: 500 }}>
                {isEn ? 'Dispatch From:' : 'روانگی مقام:'}
              </span>
              <span
                style={{
                  fontWeight: 900,
                  color: '#0f172a',
                  backgroundColor: '#f1f5f9',
                  padding: '2px 8px',
                  borderRadius: '3px',
                  fontSize: '11px'
                }}
              >
                {record.sendingCity || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Consignee / Receiver Box */}
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
            <span>{isEn ? 'CONSIGNEE (RECEIVER)' : 'مال وصول کرنے والا (کنسائنی)'}</span>
            <span
              style={{
                fontSize: '9.5px',
                padding: '1px 6px',
                borderRadius: '3px',
                backgroundColor: '#f1f5f9',
                fontFamily: "'JetBrains Mono', monospace",
                color: '#334155'
              }}
            >
              {isEn ? 'RECEIVER' : 'کنسائنی'}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontWeight: 700,
              fontSize: '11px',
              color: '#1e293b'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>{isEn ? 'Name:' : 'نام:'}</span>
              <span style={{ fontWeight: 900, color: '#0f172a', textAlign: isEn ? 'left' : 'right' }}>
                {record.receiverName || record.consignee || 'N/A'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>{isEn ? 'Phone No:' : 'فون نمبر:'}</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  direction: 'ltr',
                  fontWeight: 900,
                  color: '#0f172a'
                }}
              >
                {sanitizeContactOrCnic(record.receiverMobile)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>{isEn ? 'CNIC / NTN:' : 'شناختی کارڈ / این ٹی این:'}</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  direction: 'ltr',
                  color: '#334155'
                }}
              >
                N/A
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '3px',
                borderTop: '1px solid #f1f5f9'
              }}
            >
              <span style={{ color: '#64748b', fontWeight: 500 }}>
                {isEn ? 'Destination Depot:' : 'منزل مقام:'}
              </span>
              <span
                style={{
                  fontWeight: 900,
                  color: '#0f172a',
                  backgroundColor: '#f1f5f9',
                  padding: '2px 8px',
                  borderRadius: '3px',
                  fontSize: '11px'
                }}
              >
                {record.receivingCity || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. GOODS DESCRIPTION TABLE */}
      <div style={{ marginBottom: '8px', overflow: 'hidden', border: '2px solid #0f2942' }}>
        <table
          style={{
            width: '100%',
            textAlign: isEn ? 'left' : 'right',
            borderCollapse: 'collapse',
            fontSize: '11px'
          }}
        >
          <thead>
            <tr style={{ fontWeight: 900, fontSize: '11px', color: '#ffffff', backgroundColor: '#0f2942' }}>
              <th style={{ padding: '6px 8px', borderRight: isEn ? '1px solid #334155' : 'none', borderLeft: isEn ? 'none' : '1px solid #334155', width: '48px', textAlign: 'center' }}>
                {isEn ? 'Sr #' : 'شمار'}
              </th>
              <th style={{ padding: '6px 8px', borderRight: isEn ? '1px solid #334155' : 'none', borderLeft: isEn ? 'none' : '1px solid #334155', width: '110px', textAlign: 'center' }}>
                {isEn ? 'No. of Pkgs' : 'تعداد / نگ'}
              </th>
              <th style={{ padding: '6px 8px', borderRight: isEn ? '1px solid #334155' : 'none', borderLeft: isEn ? 'none' : '1px solid #334155', width: '120px', textAlign: 'center' }}>
                {isEn ? 'Packing Type' : 'پیکنگ کی قسم'}
              </th>
              <th style={{ padding: '6px 8px', borderRight: isEn ? '1px solid #334155' : 'none', borderLeft: isEn ? 'none' : '1px solid #334155', textAlign: isEn ? 'left' : 'right' }}>
                {isEn ? 'Description of Goods' : 'تفصیلِ سامان'}
              </th>
              <th style={{ padding: '6px 8px', borderRight: isEn ? '1px solid #334155' : 'none', borderLeft: isEn ? 'none' : '1px solid #334155', width: '100px', textAlign: 'center' }}>
                {isEn ? 'Weight (kg)' : 'وزن (کلو)'}
              </th>
              <th style={{ padding: '6px 8px', width: '100px', textAlign: 'center' }}>
                {isEn ? 'Rate (Rs)' : 'ریٹ (روپے)'}
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#ffffff' }}>
            <tr style={{ fontWeight: 700, fontSize: '11.5px', color: '#0f172a', borderBottom: '1px solid #cbd5e1' }}>
              <td style={{ padding: '7px 8px', textAlign: 'center', borderRight: isEn ? '1px solid #cbd5e1' : 'none', borderLeft: isEn ? 'none' : '1px solid #cbd5e1', fontFamily: "'JetBrains Mono', monospace" }}>
                1
              </td>
              <td style={{ padding: '7px 8px', textAlign: 'center', borderRight: isEn ? '1px solid #cbd5e1' : 'none', borderLeft: isEn ? 'none' : '1px solid #cbd5e1', fontFamily: "'JetBrains Mono', monospace", fontWeight: 900 }}>
                {record.qty || 'N/A'} {record.qty ? (isEn ? 'Pkgs' : 'نگ') : ''}
              </td>
              <td style={{ padding: '7px 8px', textAlign: 'center', borderRight: isEn ? '1px solid #cbd5e1' : 'none', borderLeft: isEn ? 'none' : '1px solid #cbd5e1', color: '#334155' }}>
                {isEn ? 'Bags / Cartons / Cargo' : 'بوری / کارٹن / مال'}
              </td>
              <td style={{ padding: '7px 8px', borderRight: isEn ? '1px solid #cbd5e1' : 'none', borderLeft: isEn ? 'none' : '1px solid #cbd5e1', fontWeight: 900, color: '#0f172a' }}>
                {record.itemDescription || (isEn ? 'General Goods Cargo' : 'جنرل کارگو ٹرانسپورٹ')}
              </td>
              <td style={{ padding: '7px 8px', textAlign: 'center', borderRight: isEn ? '1px solid #cbd5e1' : 'none', borderLeft: isEn ? 'none' : '1px solid #cbd5e1', fontFamily: "'JetBrains Mono', monospace", fontWeight: 900 }}>
                {record.weight || 'N/A'} {record.weight ? (isEn ? 'kg' : 'کلو') : ''}
              </td>
              <td style={{ padding: '7px 8px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", color: '#334155' }}>
                {record.total && record.qty ? `Rs ${(record.total / (parseFloat(record.qty) || 1)).toFixed(0)}` : '-'}
              </td>
            </tr>

            {/* Summary Row */}
            <tr style={{ fontWeight: 900, fontSize: '12px', backgroundColor: '#f1f5f9', color: '#0f172a', borderTop: '2px solid #0f2942' }}>
              <td style={{ padding: '7px 8px', textAlign: 'center', borderRight: isEn ? '1px solid #cbd5e1' : 'none', borderLeft: isEn ? 'none' : '1px solid #cbd5e1', textTransform: 'uppercase' }}>
                {isEn ? 'TOTAL' : 'ٹوٹل'}
              </td>
              <td style={{ padding: '7px 8px', textAlign: 'center', borderRight: isEn ? '1px solid #cbd5e1' : 'none', borderLeft: isEn ? 'none' : '1px solid #cbd5e1', fontFamily: "'JetBrains Mono', monospace", fontWeight: 900 }}>
                {record.qty || 'N/A'} {record.qty ? (isEn ? 'Pkgs' : 'نگ') : ''}
              </td>
              <td colSpan={2} style={{ padding: '7px 8px', borderRight: isEn ? '1px solid #cbd5e1' : 'none', borderLeft: isEn ? 'none' : '1px solid #cbd5e1', textAlign: isEn ? 'left' : 'right', fontSize: '11px' }}>
                {isEn ? 'Total Chargeable Freight Weight:' : 'کل چارج ایبل وزن:'}
              </td>
              <td colSpan={2} style={{ padding: '7px 8px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontWeight: 900, color: '#0f172a' }}>
                {record.weight || 'N/A'} {record.weight ? (isEn ? 'kg' : 'کلو') : ''}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. SPLIT GRID: FINANCIAL BREAKDOWN (LEFT) & TERMS & CONDITIONS (RIGHT) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          gap: '8px',
          marginBottom: '8px',
          alignItems: 'stretch'
        }}
      >
        {/* Financial Breakdown (5 Columns) */}
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
              <span>{isEn ? 'FINANCIAL DETAILS (ACCOUNTS)' : 'مالیاتی تفصیلات (اکاؤنٹس)'}</span>
              <span style={{ fontSize: '9.5px', fontFamily: "'JetBrains Mono', monospace", color: '#64748b' }}>
                {isEn ? 'PKR' : 'روپے'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', fontWeight: 700 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '3px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#475569' }}>{isEn ? 'Freight Charges:' : 'بنیادی کرایہ:'}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', fontWeight: 900, color: '#0f172a' }}>
                  Rs {fmt(record.total)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '3px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#475569' }}>{isEn ? 'Labour / Loading:' : 'مزدوری / لوڈنگ:'}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', color: '#334155' }}>
                  Rs 0
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '3px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#475569' }}>{isEn ? 'Local Delivery:' : 'لوکل ڈیلیوری:'}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', color: '#334155' }}>
                  Rs 0
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '3px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#475569' }}>{isEn ? 'Surcharge / Other:' : 'سرچارج / دیگر:'}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', color: '#334155' }}>
                  Rs 0
                </span>
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
              <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>
                {isEn ? 'GRAND TOTAL:' : 'کل رقم (گرینڈ ٹوٹل):'}
              </span>
              <span
                style={{
                  fontSize: '13.5px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 900,
                  direction: 'ltr',
                  color: '#fde047'
                }}
              >
                Rs {fmt(record.total)}
              </span>
            </div>

            {/* Advance & Balance */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '6px',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '10.5px'
              }}
            >
              <div style={{ padding: '4px 6px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                <span style={{ display: 'block', fontSize: '9px', color: '#64748b', fontWeight: 700 }}>
                  {isEn ? 'Advance Paid' : 'پیشگی رقم'}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 900,
                    color: '#0f172a',
                    direction: 'ltr',
                    fontSize: '11.5px'
                  }}
                >
                  Rs {fmt(record.advance)}
                </span>
              </div>
              <div style={{ padding: '4px 6px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3' }}>
                <span style={{ display: 'block', fontSize: '9px', color: '#9f1239', fontWeight: 900 }}>
                  {isEn ? 'Balance Payable' : 'بقایا رقم'}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 900,
                    color: '#9f1239',
                    direction: 'ltr',
                    fontSize: '11.5px'
                  }}
                >
                  Rs {fmt(record.payable)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions (7 Columns) */}
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
              <span style={{ fontSize: '11.5px' }}>
                {isEn ? 'TERMS & CONDITIONS' : 'شرائط و ضوابط'}
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#be123c',
                  backgroundColor: '#ffe4e6',
                  padding: '1px 6px',
                  borderRadius: '3px'
                }}
              >
                {isEn ? 'IMPORTANT NOTICE' : 'اہم ہدایات'}
              </span>
            </div>

            <ol
              style={{
                paddingLeft: isEn ? '16px' : '0',
                paddingRight: isEn ? '0' : '14px',
                margin: '0',
                display: 'flex',
                flexDirection: 'column',
                gap: '2.5px',
                fontWeight: 600,
                fontSize: '9px',
                lineHeight: '1.3',
                textAlign: isEn ? 'left' : 'justify',
                color: '#1e293b'
              }}
            >
              {termsList.map((term, idx) => (
                <li key={idx} style={{ lineHeight: '1.3' }}>
                  {term}
                </li>
              ))}
            </ol>
          </div>

          <div
            style={{
              marginTop: '4px',
              paddingTop: '4px',
              borderTop: '1px dashed #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '8.5px',
              fontWeight: 900,
              color: '#be123c'
            }}
          >
            <span>
              {isEn
                ? '⚠️ Overloading, challans & fines are strictly the party’s liability.'
                : '⚠️ اوورلوڈ، چالان و جرمانہ بدمعہ بیوپاری ہوگا۔'}
            </span>
            <span style={{ color: '#0f172a' }}>
              {isEn
                ? '🛑 Never deliver/take cargo without the original bilty.'
                : '🛑 بغیر اصل بلٹی مال ہرگز وصول نہ کریں۔'}
            </span>
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
          <span style={{ color: '#64748b', fontWeight: 500 }}>
            {isEn ? 'Driver Name:' : 'ڈرائیور کا نام:'}
          </span>{' '}
          <span style={{ fontWeight: 900, color: '#0f172a' }}>{record.driverName || 'N/A'}</span>
        </div>
        <div style={{ borderLeft: isEn ? '1px solid #cbd5e1' : 'none', borderRight: isEn ? 'none' : '1px solid #cbd5e1', paddingLeft: isEn ? '8px' : '0', paddingRight: isEn ? '0' : '8px' }}>
          <span style={{ color: '#64748b', fontWeight: 500 }}>
            {isEn ? 'Cell No:' : 'موبائل نمبر:'}
          </span>{' '}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', fontWeight: 900, color: '#0f172a' }}>
            {sanitizeContactOrCnic(record.mobileNo)}
          </span>
        </div>
        <div style={{ borderLeft: isEn ? '1px solid #cbd5e1' : 'none', borderRight: isEn ? 'none' : '1px solid #cbd5e1', paddingLeft: isEn ? '8px' : '0', paddingRight: isEn ? '0' : '8px' }}>
          <span style={{ color: '#64748b', fontWeight: 500 }}>
            {isEn ? 'License No:' : 'لائسنس نمبر:'}
          </span>{' '}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', color: '#334155' }}>
            N/A
          </span>
        </div>
        <div style={{ borderLeft: isEn ? '1px solid #cbd5e1' : 'none', borderRight: isEn ? 'none' : '1px solid #cbd5e1', paddingLeft: isEn ? '8px' : '0', paddingRight: isEn ? '0' : '8px' }}>
          <span style={{ color: '#64748b', fontWeight: 500 }}>
            {isEn ? 'Gate Pass / Token:' : 'گیٹ پاس / ٹوکن:'}
          </span>{' '}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", direction: 'ltr', color: '#334155' }}>
            {record.biltyNo}
          </span>
        </div>
      </div>

      {/* 6. BOTTOM SIGNATURES & VERIFICATION (3 BOXES) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '8px',
          alignItems: 'stretch'
        }}
      >
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
              {isEn ? '(Signature / Stamp Consignor)' : '(دستخط / مہر مال بھیجنے والا)'}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '4px', fontWeight: 900, fontSize: '11px', color: '#0f172a' }}>
            {isEn ? 'Consignor Signature & Stamp' : 'دستخط و مہر بھیجنے والا (کنسائنر)'}
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
              {isEn ? '(Driver Physical Signature)' : '(ڈرائیور کا فزیکل سائن)'}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '4px', fontWeight: 900, fontSize: '11px', color: '#0f172a' }}>
            {isEn ? 'Driver / Carrying Agent' : 'دستخط ڈرائیور / کیرئیر ایجنٹ'}
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
          <div
            style={{
              flex: '1 1 0%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '100%',
              padding: '2px 0'
            }}
          >
            <ZahdanSignatureSvg className="w-32 h-8 inline-block" />
            <div
              style={{
                borderTop: '1px solid #cbd5e1',
                paddingTop: '2px',
                width: '100%',
                fontWeight: 900,
                fontSize: '10px',
                color: '#0f172a',
                textAlign: 'center'
              }}
            >
              {isEn ? 'Authorized Stamp (Zahdan Nasr)' : 'بااختیار مہر و دستخط (زاہدان نصر)'}
            </div>
          </div>

          {/* QR Code */}
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: isEn ? '4px' : '0',
              paddingRight: isEn ? '0' : '4px',
              borderLeft: isEn ? '1px solid #cbd5e1' : 'none',
              borderRight: isEn ? 'none' : '1px solid #cbd5e1'
            }}
          >
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
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8px',
                  fontFamily: 'monospace'
                }}
              >
                QR
              </div>
            )}
            <div
              style={{
                fontSize: '7.5px',
                fontWeight: 900,
                textTransform: 'uppercase',
                color: '#166534',
                marginTop: '2px'
              }}
            >
              {isEn ? 'VERIFIED BILTY' : 'تصدیق شدہ بلٹی'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
