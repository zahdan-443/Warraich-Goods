import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { DICTIONARY, Language, Vehicle, Driver, BiltyRecord } from '../../types';
import {
  ShieldCheck,
  ExternalLink,
  Building2,
  Car,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Search,
  Copy,
  Check,
  Clock,
  FileText,
  Trash2,
  Truck,
  Users,
  Info,
  CalendarCheck,
  QrCode,
  Share2,
  Camera,
  Lock,
  Upload
} from 'lucide-react';
import { BiltyVerificationCard } from './BiltyVerificationCard';
import { PublicImage } from '../PublicImage';
import { getStoredBilties, extractPublicBiltyVerification, PublicBiltyVerification } from '../../utils/storage';
import { getBiltyVerificationUrl } from '../../utils/biltyHelpers';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

interface VerifyViewProps {
  lang: Language;
  onNavigate?: (tab: string, subSection?: string) => void;
  vehicles?: Vehicle[];
  drivers?: Driver[];
  initialSection?: 'vehicle' | 'license' | 'challan' | 'history' | 'bilty';
  initialBiltyNo?: string;
  initialBiltyToken?: string;
}

interface VerificationAuditRecord {
  id: string;
  type: 'vehicle' | 'license' | 'challan';
  title: string;
  identifier: string;
  category: string;
  status: 'verified' | 'valid' | 'pending' | 'clear';
  date: string;
  notes: string;
}

const INITIAL_AUDIT_RECORDS: VerificationAuditRecord[] = [];

export const VerifyView: React.FC<VerifyViewProps> = ({
  lang,
  onNavigate,
  vehicles = [],
  drivers = [],
  initialSection = 'vehicle',
  initialBiltyNo = '',
  initialBiltyToken = ''
}) => {
  const isUrdu = lang === 'ur';

  const [activeSubTab, setActiveSubTab] = useState<'vehicle' | 'license' | 'challan' | 'history' | 'bilty'>(
    initialBiltyNo || initialBiltyToken ? 'bilty' : initialSection
  );

  // Bilty Verification State
  const [biltyQuery, setBiltyQuery] = useState(initialBiltyNo || '');
  const [verifiedBilty, setVerifiedBilty] = useState<PublicBiltyVerification | null>(null);
  const [biltySearchAttempted, setBiltySearchAttempted] = useState(false);
  const [isBiltyLoading, setIsBiltyLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVerifyBilty = async (q?: string, tokenInput?: string) => {
    const rawTerm = (q !== undefined ? q : biltyQuery).trim();
    const token = (tokenInput !== undefined ? tokenInput : initialBiltyToken).trim();

    if (!rawTerm && !token) return;

    setBiltySearchAttempted(true);
    setIsBiltyLoading(true);
    setVerifiedBilty(null);

    const cleanLower = rawTerm.toLowerCase();
    const normalizedTerm = cleanLower.replace(/[^a-z0-9]/g, '');

    // 1. Check local getStoredBilties (and extract strictly sanitized public fields)
    const allBilties = getStoredBilties();
    const localMatch = allBilties.find((b) => {
      const bNo = String(b.biltyNo || '').toLowerCase();
      const bId = String(b.id ?? '').toLowerCase();
      const vNo = String(b.vehicleNo || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return (
        bNo === cleanLower ||
        bNo.replace(/[^a-z0-9]/g, '') === normalizedTerm ||
        bId === cleanLower ||
        (normalizedTerm.length > 3 && vNo === normalizedTerm)
      );
    });

    if (localMatch) {
      setVerifiedBilty(extractPublicBiltyVerification(localMatch));
      setIsBiltyLoading(false);
      return;
    }

    // 2. Check top-level Firestore collection publicBiltyVerifications/{biltyNo}
    try {
      if (db) {
        const upper = rawTerm.toUpperCase().trim();
        const cleanAlpha = upper.replace(/[^A-Z0-9]/g, '');
        const candidateKeys = [upper, cleanAlpha, upper.replace(/\s+/g, '')];

        if (!upper.startsWith('WG-')) candidateKeys.push(`WG-${upper}`);
        if (!upper.startsWith('WGT-')) candidateKeys.push(`WGT-${upper}`);
        if (!upper.startsWith('AH-')) candidateKeys.push(`AH-${upper}`);

        let remoteDocData: any = null;
        for (const docKey of candidateKeys) {
          try {
            const snap = await getDoc(doc(db, 'publicBiltyVerifications', docKey));
            if (snap.exists() && snap.data()) {
              remoteDocData = snap.data();
              break;
            }
          } catch {
            // keep trying candidate keys
          }
        }

        if (remoteDocData) {
          setVerifiedBilty(extractPublicBiltyVerification(remoteDocData));
          setIsBiltyLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Public cloud bilty verification lookup notice:', err);
    }

    setVerifiedBilty(null);
    setIsBiltyLoading(false);
  };

  const processScannedQrData = (dataStr: string) => {
    let clean = dataStr.trim();
    let extractedBilty = '';
    let extractedToken = '';

    if (clean.includes('?') || clean.includes('&')) {
      try {
        const url = new URL(clean, 'https://example.com');
        extractedBilty = url.searchParams.get('bilty') || url.searchParams.get('biltyNo') || '';
        extractedToken = url.searchParams.get('vdata') || url.searchParams.get('data') || url.searchParams.get('d') || '';
      } catch {
        const matchBilty = clean.match(/[?&](bilty|biltyNo)=([^&]+)/i);
        if (matchBilty) extractedBilty = decodeURIComponent(matchBilty[2]);
        const matchToken = clean.match(/[?&](vdata|data|d)=([^&]+)/i);
        if (matchToken) extractedToken = decodeURIComponent(matchToken[2]);
      }
    } else {
      extractedBilty = clean;
    }

    if (extractedBilty) {
      setBiltyQuery(extractedBilty);
    }
    handleVerifyBilty(extractedBilty, extractedToken);
  };

  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanStatus(isUrdu ? 'کیو آر کوڈ کا تجزیہ کیا جا رہا ہے...' : 'Analyzing QR code image...');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setScanStatus(isUrdu ? 'کینوس شروع نہیں ہو سکا۔' : 'Canvas context unavailable.');
          return;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });

        if (code && code.data) {
          setScanStatus(isUrdu ? 'کیو آر کوڈ کامیابی سے اسکین ہو گیا!' : 'QR Code read successfully!');
          processScannedQrData(code.data);
        } else {
          setScanStatus(
            isUrdu
              ? 'تصویر میں کیو آر کوڈ نہیں مل سکا۔ براہ کرم واضع تصویر لیں۔'
              : 'No QR code found in the image. Please upload a clear photo.'
          );
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    if (initialBiltyToken || initialBiltyNo) {
      setActiveSubTab('bilty');
      if (initialBiltyNo) setBiltyQuery(initialBiltyNo);
      handleVerifyBilty(initialBiltyNo, initialBiltyToken);
    } else if (initialSection) {
      setActiveSubTab(initialSection);
    }
  }, [initialSection, initialBiltyNo, initialBiltyToken]);

  // Vehicle Tab State
  const [vehicleReg, setVehicleReg] = useState('LES-20-4124');
  const [vehicleProvince, setVehicleProvince] = useState<'punjab' | 'sindh' | 'islamabad' | 'kpk'>('punjab');

  // License Tab State
  const [licenseQuery, setLicenseQuery] = useState('LHR-48291-HTV');
  const [licenseType, setLicenseType] = useState('HTV');

  // Challan Tab State
  const [challanQuery, setChallanQuery] = useState('LES-20-4124');
  const [challanCity, setChallanCity] = useState<'lahore' | 'islamabad' | 'rawalpindi' | 'faisalabad'>('lahore');

  // Audit History State
  const [auditRecords, setAuditRecords] = useState<VerificationAuditRecord[]>(() => {
    try {
      const stored = localStorage.getItem('wg_verification_audits');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_AUDIT_RECORDS;
  });

  const handleDeleteAuditRecord = (id: string) => {
    const updated = auditRecords.filter(r => r.id !== id);
    setAuditRecords(updated);
    try {
      localStorage.setItem('wg_verification_audits', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex-1 p-3 sm:p-5 max-w-5xl mx-auto w-full space-y-4">
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] shadow-xs border border-[#ecece0] space-y-4">
        <header className="border-b border-[#ecece0] pb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#ecece0] p-0.5 flex items-center justify-center text-[#8b9d77] shadow-2xs shrink-0 overflow-hidden">
              <PublicImage
                fileName={
                  activeSubTab === 'license' 
                    ? 'license-icon.png' 
                    : activeSubTab === 'challan' 
                    ? 'echallan-icon.png' 
                    : 'vehicle-icon.png'
                }
                alt="Verification Tool"
                width={40}
                height={40}
                fitMode="contain"
                className="w-full h-full"
                fallbackIcon={<ShieldCheck className="w-5 h-5 text-[#4a5e38]" />}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-serif font-bold text-[#4a4a35]">
                  {activeSubTab === 'license'
                    ? (isUrdu ? 'ڈرائیور لائسنس پورٹل گائیڈ (DLIMS)' : 'Driver License Portal Guide (DLIMS)')
                    : activeSubTab === 'challan'
                    ? (isUrdu ? 'ای چالان پورٹل گائیڈ (Safe City)' : 'E-Challan Portal Guide (Safe City)')
                    : activeSubTab === 'vehicle'
                    ? (isUrdu ? 'گاڑی رجسٹریشن پورٹل گائیڈ (MTMIS)' : 'Vehicle MTMIS Portal Guide')
                    : (isUrdu ? 'تصدیقی مرکز' : 'Verification Hub')}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8b9d77]/15 text-[#4a5e38] border border-[#8b9d77]/30">
                  {isUrdu ? 'آفیشل لنکس' : 'Official Portals'}
                </span>
              </div>
              <p className="text-[11px] text-[#8e8e75] font-sans mt-0.5">
                {activeSubTab === 'license'
                  ? (isUrdu ? 'سرکاری ڈی ایل آئی ایم ایس پورٹل پر لائسنس چیک کریں' : 'Official DLIMS driving license portal redirection')
                  : activeSubTab === 'challan'
                  ? (isUrdu ? 'پنجاب سیف سٹی اتھارٹی کے آفیشل پورٹل پر ای چالان چیک کریں' : 'Official PSCA Safe City electronic challan lookup')
                  : (isUrdu ? 'سرکاری ایکسائز ایم ٹی ایم آئی ایس پورٹل سے گاڑی کے ریکارڈ کی تصدیق' : 'Official Excise MTMIS vehicle registration lookup')}
              </p>
            </div>
          </div>
        </header>

        {/* Sub-Tab Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('vehicle')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
              activeSubTab === 'vehicle'
                ? 'bg-[#4a5e38] text-white border-[#4a5e38] shadow-xs'
                : 'bg-[#fdfbf7] text-[#5a5a40] border-[#ecece0] hover:border-[#8b9d77]'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>{isUrdu ? 'گاڑی رجسٹریشن (MTMIS)' : 'Vehicle Excise (MTMIS)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('license')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
              activeSubTab === 'license'
                ? 'bg-[#4a5e38] text-white border-[#4a5e38] shadow-xs'
                : 'bg-[#fdfbf7] text-[#5a5a40] border-[#ecece0] hover:border-[#8b9d77]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{isUrdu ? 'ڈرائیور لائسنس (DLIMS)' : 'Driver License (DLIMS)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('challan')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
              activeSubTab === 'challan'
                ? 'bg-[#4a5e38] text-white border-[#4a5e38] shadow-xs'
                : 'bg-[#fdfbf7] text-[#5a5a40] border-[#ecece0] hover:border-[#8b9d77]'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{isUrdu ? 'ای چالان (Safe City)' : 'Safe City E-Challan'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('bilty')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
              activeSubTab === 'bilty'
                ? 'bg-[#4a5e38] text-white border-[#4a5e38] shadow-xs'
                : 'bg-[#fdfbf7] text-[#5a5a40] border-[#ecece0] hover:border-[#8b9d77]'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{isUrdu ? 'پبلک ریکارڈ تصدیق' : 'Public Transport Verification'}</span>
          </button>

          {auditRecords.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveSubTab('history')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                activeSubTab === 'history'
                  ? 'bg-[#4a5e38] text-white border-[#4a5e38] shadow-xs'
                  : 'bg-[#fdfbf7] text-[#5a5a40] border-[#ecece0] hover:border-[#8b9d77]'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{isUrdu ? `لاگز (${auditRecords.length})` : `Saved Logs (${auditRecords.length})`}</span>
            </button>
          )}
        </div>

        {/* TAB 1: VEHICLE REGISTRATION PORTAL */}
        {activeSubTab === 'vehicle' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/40 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-slate-800">
                      {isUrdu ? 'آفیشل ایکسائز و وہیکل رجسٹریشن پورٹل (MTMIS)' : 'Official MTMIS Vehicle Registration Portals'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isUrdu
                        ? 'سرکاری ایکسائز ویب سائٹ پر اپنی گاڑی کی ملکیت اور ٹوکن ٹیکس کی براہ راست تصدیق کریں'
                        : 'Direct link to official provincial excise websites for genuine vehicle ownership & tax checking'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <a
                  href="https://mtmis.excise.punjab.gov.pk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center justify-between no-underline transition-all active:scale-95"
                >
                  <span>🇵🇰 MTMIS Punjab Excise</span>
                  <ExternalLink className="w-4 h-4 text-emerald-700" />
                </a>

                <a
                  href="https://excise.gos.pk/vehicle/vehicle_search"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center justify-between no-underline transition-all active:scale-95"
                >
                  <span>🇵🇰 Sindh Excise Portal</span>
                  <ExternalLink className="w-4 h-4 text-emerald-700" />
                </a>

                <a
                  href="https://islamabadexcise.gov.pk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center justify-between no-underline transition-all active:scale-95"
                >
                  <span>🇵🇰 ICT Islamabad Excise</span>
                  <ExternalLink className="w-4 h-4 text-emerald-700" />
                </a>
              </div>

              {/* Anti-Impersonation Disclaimer */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  {isUrdu
                    ? 'نوٹس: ڈرائیور دوست نجی ٹرانسپورٹ فلیٹ ایپ ہے۔ ہم کسی بھی سرکاری ادارے کی نمائندگی نہیں کرتے اور نہ ہی کسی سرکاری ڈیٹا بیس کی میزبانی کرتے ہیں۔ گاڑی کے تمام سرکاری ریکارڈز صرف اوپر دیے گئے آفیشل پورٹلز پر ہی تصدیق کیے جا سکتے ہیں۔'
                    : 'Notice: Driver Dost is an independent fleet management application. It does not represent any government entity or host government databases. Official vehicle records can only be verified directly on the official portals listed above.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DRIVER LICENSE PORTAL */}
        {activeSubTab === 'license' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/40 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-slate-800">
                      {isUrdu ? 'آفیشل ڈی ایل آئی ایم ایس (DLIMS) پورٹل' : 'Official DLIMS Driving License Verification'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isUrdu
                        ? 'پنجاب ٹریفک پولیس کی آفیشل ڈی ایل آئی ایم ایس ویب سائٹ پر ڈرائیونگ لائسنس کی تصدیق کریں'
                        : 'Check driving license validity directly on the official Traffic Police DLIMS portal'}
                    </p>
                  </div>
                </div>

                <a
                  href="https://dlims.punjab.gov.pk/verify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs no-underline active:scale-95 shrink-0"
                >
                  <span>{isUrdu ? 'آفیشل DLIMS پورٹل کھولیں' : 'Open DLIMS Portal'}</span>
                  <ExternalLink className="w-4 h-4 text-white" />
                </a>
              </div>

              {/* Anti-Impersonation Disclaimer */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  {isUrdu
                    ? 'نوٹس: یہ ایپ کسی پولیس یا ڈرائیونگ لائسنسنگ اتھارٹی سے وابستہ نہیں ہے۔ لائسنس کی حتمی اور مستند تصدیق اوپر دیے گئے آفیشل ڈی ایل آئی ایم ایس پورٹل پر ہوتی ہے۔'
                    : 'Notice: This app is not affiliated with any police or driving license authority. Official verification of driving license records is provided strictly on the official DLIMS portal above.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: E-CHALLAN PORTAL */}
        {activeSubTab === 'challan' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/40 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-slate-800">
                      {isUrdu ? 'آفیشل سیف سٹی ای چالان پورٹل (PSCA)' : 'Official PSCA Safe City E-Challan Portal'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isUrdu
                        ? 'پنجاب سیف سٹی اتھارٹی کے آفیشل پورٹل پر الیکٹرانک چالان کی جانچ کریں'
                        : 'Verify electronic camera challans and speed penalties directly on the official PSCA portal'}
                    </p>
                  </div>
                </div>

                <a
                  href="https://echallan.psca.gop.pk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs no-underline active:scale-95 shrink-0"
                >
                  <span>{isUrdu ? 'آفیشل سیف سٹی پورٹل کھولیں' : 'Open PSCA Portal'}</span>
                  <ExternalLink className="w-4 h-4 text-white" />
                </a>
              </div>

              {/* Anti-Impersonation Disclaimer */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  {isUrdu
                    ? 'نوٹس: ڈرائیور دوست نجی ٹرانسپورٹ فلیٹ ایپ ہے۔ چالان اور جرمانے کی تمام معلومات کا باضابطہ ذریعہ پنجاب سیف سٹی اتھارٹی (PSCA) کا ویب پورٹل ہے۔'
                    : 'Notice: Driver Dost is an independent fleet management application. Official e-challan status and penalties are provided strictly via the official PSCA web portal.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SAVED AUDIT RECORDS */}
        {activeSubTab === 'history' && auditRecords.length > 0 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#ecece0]">
              <span className="text-xs font-bold text-[#4a4a35]">
                {isUrdu ? 'محفوظ شدہ لاگز:' : 'Saved Audit Logs:'}
              </span>
              <span className="text-xs text-[#8e8e75] font-mono">
                {auditRecords.length} {isUrdu ? 'ریکارڈز' : 'records'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {auditRecords.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] flex items-center justify-between gap-2"
                >
                  <div>
                    <h4 className="font-bold text-xs text-[#4a4a35]">{item.title}</h4>
                    <span className="text-[11px] font-mono text-[#8b9d77]">{item.identifier}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteAuditRecord(item.id)}
                    className="p-1 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PUBLIC VERIFICATION & LOAD LOOKUP */}
        {activeSubTab === 'bilty' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {verifiedBilty ? (
              <div className="space-y-4">
                <BiltyVerificationCard
                  bilty={verifiedBilty}
                  lang={lang}
                  onBack={() => {
                    setVerifiedBilty(null);
                    setBiltySearchAttempted(false);
                  }}
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Search Form Card */}
                <div className="bg-[#fdfbf7] p-5 sm:p-6 rounded-3xl border border-[#ecece0] space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="font-serif font-bold text-base sm:text-lg text-[#4a4a35] flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-[#8b9d77]" />
                        <span>{isUrdu ? 'آفیشل کیریئر پورٹل و سرٹیفکیٹ تصدیق' : 'Public Transport Verification Registry'}</span>
                      </h2>
                      <p className="text-xs text-[#8e8e75] mt-1">
                        {isUrdu
                          ? 'پرنٹ شدہ QR کوڈ اسکین کریں یا ریکارڈ نمبر درج کر کے روانگی اور گاڑی کی تصدیق حاصل کریں۔'
                          : 'Scan printed QR code or enter document number to verify dispatch route & cargo details.'}
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 self-start sm:self-auto font-mono">
                      {isUrdu ? 'مستند پورٹل' : 'VERIFIED REGISTRY'}
                    </span>
                  </div>

                  {/* Input form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleVerifyBilty();
                    }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#4a4a35]">
                        {isUrdu ? 'ریکارڈ نمبر درج کریں:' : 'Enter Document / Bilty Number:'}
                      </label>
                      <span className="text-[11px] text-[#8e8e75]">
                        {isUrdu ? 'مثال: AH-0001' : 'e.g. AH-0001'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={biltyQuery}
                          onChange={(e) => setBiltyQuery(e.target.value)}
                          placeholder={isUrdu ? 'مثال: AH-0001 یا LES-20-4124' : 'e.g. AH-0001 or LES-20-4124'}
                          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-[#ecece0] focus:border-[#8b9d77] focus:ring-1 focus:ring-[#8b9d77] outline-hidden text-sm font-mono font-bold text-[#4a4a35] transition-all"
                        />
                        <Search className="w-4 h-4 text-[#8e8e75] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-3 rounded-2xl bg-[#4a5e38] text-white hover:bg-[#3d4e2e] text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isUrdu ? 'تصدیق کریں' : 'Verify Consignment'}</span>
                      </button>
                    </div>

                    {/* QR Code Scanner */}
                    <div className="pt-2 border-t border-[#ecece0]/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        capture="environment"
                        onChange={handleQrImageUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all active:scale-95"
                      >
                        <Camera className="w-4 h-4 text-emerald-100" />
                        <span>{isUrdu ? '📷 کیمرے یا تصویر سے QR اسکین کریں' : '📷 Scan QR Code (Camera/Photo)'}</span>
                      </button>

                      <p className="text-[11px] text-[#8e8e75] text-center sm:text-right">
                        {isUrdu 
                          ? 'پرنٹ شدہ کاغذ پر موجود کیو آر کوڈ کی تصویر اپلوڈ کریں'
                          : 'Point camera or upload image of printed document QR code'}
                      </p>
                    </div>

                    {scanStatus && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium animate-in fade-in">
                        {scanStatus}
                      </div>
                    )}
                  </form>
                </div>

                {/* Cloud Search Loading */}
                {isBiltyLoading && (
                  <div className="p-6 rounded-3xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-center justify-center gap-3 animate-in fade-in">
                    <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs sm:text-sm font-bold text-emerald-900">
                      {isUrdu ? 'کلاؤڈ ریکارڈ سے تصدیق جاری ہے...' : 'Checking verified public records...'}
                    </span>
                  </div>
                )}

                {/* Search Not Found */}
                {!isBiltyLoading && biltySearchAttempted && !verifiedBilty && (
                  <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-3 animate-in fade-in">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif font-bold text-sm text-amber-900">
                          {isUrdu ? 'ریکارڈ نہیں ملا' : 'Record Not Found'}
                        </h4>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          {isUrdu
                            ? `نمبر "${biltyQuery}" کے تحت کوئی عمومی ریکارڈ نہیں مل سکا۔ براہ کرم نمبر کی درستگی چیک کریں۔`
                            : `No public transport record matched "${biltyQuery}". Please double check the input.`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Selection of Registered Bilties */}
                {(() => {
                  const stored = getStoredBilties();
                  if (stored.length === 0) return null;
                  return (
                    <div className="bg-[#fdfbf7] p-5 sm:p-6 rounded-3xl border border-[#ecece0] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#4a4a35] flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-[#8b9d77]" />
                          {isUrdu ? 'حالیہ رجسٹرڈ بلٹیاں (فوری تصدیق کیلئے کلک کریں):' : 'Recent Registered Bilties (Click to verify):'}
                        </span>
                        <span className="text-[11px] font-mono text-[#8e8e75]">
                          {stored.length} {isUrdu ? 'کل بلٹیاں' : 'total'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {stored.slice(0, 6).map((b) => (
                          <button
                            key={b.id || b.biltyNo}
                            type="button"
                            onClick={() => {
                              setBiltyQuery(b.biltyNo);
                              handleVerifyBilty(b.biltyNo);
                            }}
                            className="p-3 rounded-2xl bg-white border border-[#ecece0] hover:border-[#8b9d77] hover:shadow-2xs text-left cursor-pointer transition-all flex items-center justify-between gap-2 group"
                          >
                            <div className="overflow-hidden">
                              <span className="font-mono font-bold text-xs text-[#4a5e38] block group-hover:text-[#3d4e2e]">
                                {b.biltyNo}
                              </span>
                              <span className="text-[11px] text-[#8e8e75] truncate block">
                                {b.sendingCity} → {b.receivingCity}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                              {b.vehicleNo || (isUrdu ? 'تصدیق شدہ' : 'Verified')}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Google Sheets Load Tracker & Apps Script Banner */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#ecece0] space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#8b9d77]" />
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[#4a4a35]">
                      {isUrdu ? 'گوگل شیٹس لوڈ ٹریکر سسٹم انٹیگریشن' : 'Google Sheets Load Tracker Integration'}
                    </h4>
                  </div>
                  <p className="text-xs text-[#5a5a40] leading-relaxed">
                    {isUrdu
                      ? 'تمام تیار کردہ بلٹیوں پر متحرک کیو آر کوڈ پرنٹ ہوتا ہے جو براہ راست ورائچ گڈز کے لوڈ ٹریکر سسٹم اور آن لائن تصدیق سے منسلک ہے۔ کسی بھی کیمرہ یا اسکینر سے فوری طور طور پر مالکانہ تفصیلات کی تصدیق کی جا سکتی ہے۔'
                      : 'Every generated Bilty carries an official dynamic QR code linked to Warraich Goods online verification portal and Load Tracker. Consignors, drivers, and consignees can verify cargo authenticity from any smartphone.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
