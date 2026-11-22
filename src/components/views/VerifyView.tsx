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
  ArrowLeft,
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
  const t = DICTIONARY[lang].verify;

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

    // 2. Check local getStoredBilties (creator's device, offline capable)
    const allBilties = getStoredBilties();
    const localMatch = allBilties.find((b) => {
      const bNo = String(b.biltyNo || '').toLowerCase();
      const bId = String(b.id ?? '').toLowerCase();
      return (
        bNo === cleanLower ||
        bNo.replace(/[^a-z0-9]/g, '') === normalizedTerm ||
        bId === cleanLower
      );
    });

    if (localMatch) {
      setVerifiedBilty(extractPublicBiltyVerification(localMatch));
      setIsBiltyLoading(false);
      return;
    }

    // 3. Fallback to public Firestore collection: publicBiltyVerifications/{BILTY_NO_UPPERCASE}
    try {
      if (db) {
        const upper = rawTerm.toUpperCase().trim();
        const cleanAlpha = upper.replace(/[^A-Z0-9]/g, '');
        const candidateKeys = [
          upper,
          cleanAlpha,
          upper.replace(/\s+/g, ''),
        ];

        if (!upper.startsWith('WG-')) {
          candidateKeys.push(`WG-${upper}`);
          candidateKeys.push(`WG-2026-${upper.padStart(4, '0')}`);
        }
        if (!upper.startsWith('WGT-')) {
          candidateKeys.push(`WGT-${upper}`);
        }
        if (!upper.startsWith('AH-')) {
          candidateKeys.push(`AH-${upper}`);
        }

        let remoteDocData: any = null;
        for (const docKey of candidateKeys) {
          try {
            const snap = await getDoc(doc(db, 'publicBiltyVerifications', docKey));
            if (snap.exists() && snap.data()) {
              remoteDocData = snap.data();
              break;
            }
          } catch {
            // Keep trying next candidate key
          }
        }

        if (remoteDocData) {
          setVerifiedBilty(extractPublicBiltyVerification({
            biltyNo: remoteDocData.biltyNo || upper,
            ...remoteDocData
          }));
          setIsBiltyLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Public cloud bilty verification lookup error:', err);
    }

    setVerifiedBilty(null);
    setIsBiltyLoading(false);
  };

  // Process Scanned QR String (from Camera or Uploaded Image)
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
          setScanStatus(isUrdu ? 'کیو آر کوڈ کامیابی سے اسکین ہو گیا!' : 'QR Code verified successfully!');
          processScannedQrData(code.data);
        } else {
          setScanStatus(
            isUrdu
              ? 'تصویر میں کیو آر کوڈ نہیں مل سکا۔ براہ کرم دستاویز کے نچلے حصے پر موجود واضح کیو آر کی تصویر لیں۔'
              : 'No QR code found in the image. Please take a clear, well-lit photo of the QR code on the consignment document.'
          );
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input so user can scan again if needed
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
  const [vehicleAuditResult, setVehicleAuditResult] = useState<any | null>(null);

  // License Tab State
  const [licenseQuery, setLicenseQuery] = useState('LHR-48291-HTV');
  const [licenseType, setLicenseType] = useState('HTV');
  const [licenseAuditResult, setLicenseAuditResult] = useState<any | null>(null);

  // Challan Tab State
  const [challanQuery, setChallanQuery] = useState('LES-20-4124');
  const [challanCity, setChallanCity] = useState<'lahore' | 'islamabad' | 'rawalpindi' | 'faisalabad'>('lahore');
  const [challanAuditResult, setChallanAuditResult] = useState<any | null>(null);

  // Audit History State
  const [auditRecords, setAuditRecords] = useState<VerificationAuditRecord[]>(() => {
    try {
      const stored = localStorage.getItem('wg_verification_audits');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_AUDIT_RECORDS;
  });

  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      // Fallback copy unavailable in restricted webview contexts
    }
  };

  // Perform Vehicle Verification (Direct Official Portal Launcher)
  const handleVerifyVehicle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanReg = vehicleReg.trim().toUpperCase();
    if (!cleanReg) return;

    handleCopy(cleanReg);

    const matchedFleet = vehicles.find(v => v.reg.toUpperCase() === cleanReg);
    const modelDesc = matchedFleet
      ? matchedFleet.model
      : (isUrdu ? 'کمرشل ہیوی گڈز ٹرانسپورٹ ٹرک' : 'Commercial Heavy Goods Transport Truck');

    const officialUrl = vehicleProvince === 'punjab'
      ? 'https://mtmis.excise.punjab.gov.pk'
      : vehicleProvince === 'sindh'
      ? 'https://excise.gos.pk/vehicle/vehicle_search'
      : 'https://islamabadexcise.gov.pk';

    const provinceLabel = vehicleProvince === 'punjab'
      ? (isUrdu ? 'پنجاب ایم ٹی ایم آئی ایس' : 'Punjab MTMIS')
      : vehicleProvince === 'sindh'
      ? (isUrdu ? 'سندھ ایکسائز' : 'Sindh Excise')
      : vehicleProvince === 'islamabad'
      ? (isUrdu ? 'اسلام آباد ایکسائز' : 'ICT Excise')
      : (isUrdu ? 'خیبر پختونخواہ ایکسائز' : 'KPK Excise');

    const result = {
      reg: cleanReg,
      province: provinceLabel,
      model: modelDesc,
      officialUrl,
      checkedAt: new Date().toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    setVehicleAuditResult(result);
  };

  // Save Vehicle Audit to History
  const handleSaveVehicleAudit = () => {
    if (!vehicleAuditResult) return;
    const newRecord: VerificationAuditRecord = {
      id: `veh-${Date.now()}`,
      type: 'vehicle',
      title: vehicleAuditResult.model,
      identifier: vehicleAuditResult.reg,
      category: vehicleAuditResult.province,
      status: 'verified',
      date: vehicleAuditResult.checkedAt,
      notes: isUrdu
        ? `${vehicleAuditResult.province} پورٹل کی براہ راست جانچ کی گئی`
        : `Direct portal verification checked on ${vehicleAuditResult.province}`
    };
    const updated = [newRecord, ...auditRecords];
    setAuditRecords(updated);
    try {
      localStorage.setItem('wg_verification_audits', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Perform Driver License Verification (Direct Official Portal Launcher)
  const handleVerifyLicense = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = licenseQuery.trim().toUpperCase();
    if (!cleanQuery) return;

    handleCopy(cleanQuery);

    const matchedDriver = drivers.find(d => d.license.toUpperCase().includes(cleanQuery) || d.cnic.includes(cleanQuery));
    const driverName = matchedDriver
      ? matchedDriver.name
      : (isUrdu ? 'کمرشل ٹرانسپورٹ ڈرائیور' : 'Commercial Transport Driver');

    const result = {
      identifier: cleanQuery,
      driverName,
      lictype: licenseType,
      officialUrl: 'https://dlims.punjab.gov.pk/verify',
      checkedAt: new Date().toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    setLicenseAuditResult(result);
  };

  // Save License Audit to History
  const handleSaveLicenseAudit = () => {
    if (!licenseAuditResult) return;
    const newRecord: VerificationAuditRecord = {
      id: `lic-${Date.now()}`,
      type: 'license',
      title: licenseAuditResult.driverName,
      identifier: licenseAuditResult.identifier,
      category: licenseAuditResult.lictype,
      status: 'valid',
      date: licenseAuditResult.checkedAt,
      notes: isUrdu
        ? 'ڈی ایل آئی ایم ایس پنجاب پورٹل سے لائسنس چیک کیا گیا'
        : 'Driving license verified via DLIMS Punjab portal'
    };
    const updated = [newRecord, ...auditRecords];
    setAuditRecords(updated);
    try {
      localStorage.setItem('wg_verification_audits', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Perform Challan Audit (Direct Official Portal Launcher)
  const handleVerifyChallan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = challanQuery.trim().toUpperCase();
    if (!cleanQuery) return;

    handleCopy(cleanQuery);

    const cityLabel = challanCity === 'lahore'
      ? (isUrdu ? 'لاہور سیف سٹی' : 'PSCA Lahore')
      : challanCity === 'islamabad'
      ? (isUrdu ? 'اسلام آباد سیف سٹی' : 'Safe City ICT')
      : challanCity === 'rawalpindi'
      ? (isUrdu ? 'راولپنڈی ٹریفک ہیڈکوارٹر' : 'Rawalpindi Traffic HQ')
      : (isUrdu ? 'فیصل آباد سٹی ٹریفک' : 'Faisalabad City Traffic');

    const result = {
      identifier: cleanQuery,
      city: cityLabel,
      officialUrl: 'https://echallan.psca.gop.pk',
      checkedAt: new Date().toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    setChallanAuditResult(result);
  };

  // Save Challan Audit to History
  const handleSaveChallanAudit = () => {
    if (!challanAuditResult) return;
    const newRecord: VerificationAuditRecord = {
      id: `cha-${Date.now()}`,
      type: 'challan',
      title: isUrdu ? `${challanAuditResult.city} آڈٹ` : `${challanAuditResult.city} Audit`,
      identifier: challanAuditResult.identifier,
      category: challanAuditResult.city,
      status: 'clear',
      date: challanAuditResult.checkedAt,
      notes: isUrdu
        ? `${challanAuditResult.city} ای چالان پورٹل چیکنگ مکمل`
        : `${challanAuditResult.city} e-challan portal check completed`
    };
    const updated = [newRecord, ...auditRecords];
    setAuditRecords(updated);
    try {
      localStorage.setItem('wg_verification_audits', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

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
    <div dir={isUrdu ? 'rtl' : 'ltr'} className="flex-1 p-3 sm:p-5 max-w-5xl mx-auto w-full space-y-4">
      
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#1a1c22] p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] shadow-sm border border-[#ecece0] dark:border-[#2d313b] space-y-4">
        <header className="border-b border-[#ecece0] dark:border-[#2d313b] pb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#16181e] border border-[#ecece0] dark:border-[#2d313b] p-0.5 flex items-center justify-center text-[#8b9d77] dark:text-emerald-400 shadow-2xs shrink-0 overflow-hidden">
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
                fallbackIcon={<ShieldCheck className="w-5 h-5 text-[#4a5e38] dark:text-emerald-400" />}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-serif font-bold text-[#4a4a35] dark:text-white">
                  {activeSubTab === 'license'
                    ? (isUrdu ? 'ڈرائیونگ لائسنس کی تصدیق' : 'Driver License Verification (DLIMS)')
                    : activeSubTab === 'challan'
                    ? (isUrdu ? 'ای چالان چیکنگ' : 'E-Challan Verification (Safe City)')
                    : (isUrdu ? 'گاڑیوں کی تصدیق' : 'Vehicle Verification (MTMIS Excise)')}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8b9d77]/15 dark:bg-emerald-950/60 text-[#4a5e38] dark:text-emerald-300 border border-[#8b9d77]/30 dark:border-emerald-700/50">
                  {isUrdu ? 'ان-ایپ سسٹم' : 'In-App Hub'}
                </span>
              </div>
              <p className="text-[11px] text-[#8e8e75] dark:text-slate-400 font-sans mt-0.5">
                {activeSubTab === 'license'
                  ? (isUrdu ? 'ٹریفک پولیس ڈی ایل آئی ایم ایس لائسنس ریکارڈ تصدیق' : 'Traffic police driving license verification & audit')
                  : activeSubTab === 'challan'
                  ? (isUrdu ? 'پنجاب سیف سٹی اتھارٹی الیکٹرانک چالان ریکارڈ' : 'Punjab Safe City electronic traffic violation records')
                  : (isUrdu ? 'ایکسائز وہیکل رجسٹریشن اور ٹوکن ٹیکس کی لائیو جانچ' : 'Excise vehicle registration & token tax inspection')}
              </p>
            </div>
          </div>

        </header>

        {/* Sub-Tab Navigation Pills - Removed from the 3 Government Verification Pages per user instruction */}
        {(activeSubTab === 'history' || activeSubTab === 'bilty') && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setActiveSubTab('history')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                activeSubTab === 'history'
                  ? 'bg-[#4a5e38] dark:bg-emerald-700 text-white border-[#4a5e38] dark:border-emerald-600 shadow-xs'
                  : 'bg-[#fdfbf7] dark:bg-[#16181e] text-[#5a5a40] dark:text-slate-300 border-[#ecece0] dark:border-[#2d313b] hover:border-[#8b9d77] dark:hover:border-emerald-500/60'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{isUrdu ? `محفوظ ریکارڈز (${auditRecords.length})` : `Saved Audits (${auditRecords.length})`}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('bilty')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                activeSubTab === 'bilty'
                  ? 'bg-[#4a5e38] dark:bg-emerald-700 text-white border-[#4a5e38] dark:border-emerald-600 shadow-xs'
                  : 'bg-[#fdfbf7] dark:bg-[#16181e] text-[#5a5a40] dark:text-slate-300 border-[#ecece0] dark:border-[#2d313b] hover:border-[#8b9d77] dark:hover:border-emerald-500/60'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>{isUrdu ? 'دستاویز تصدیق' : 'Document Verification (QR & No)'}</span>
            </button>
          </div>
        )}

        {/* TAB 1: VEHICLE REGISTRATION CHECK */}
        {activeSubTab === 'vehicle' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Pinned Official Portal Link Banner & Google Play Policy Disclaimer */}
            <div className="bg-white dark:bg-[#16181e] p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/40 dark:border-emerald-600/50 shadow-xs space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-bold text-sm sm:text-base text-slate-800 dark:text-white">
                        {isUrdu ? 'آفیشل ایکسائز و وہیکل رجسٹریشن پورٹل' : 'Official MTMIS Vehicle Registration Portal'}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/60">
                        {vehicleProvince === 'punjab' ? 'mtmis.excise.punjab.gov.pk' : vehicleProvince === 'sindh' ? 'excise.gos.pk' : 'islamabadexcise.gov.pk'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {isUrdu 
                        ? 'سرکاری ایکسائز ریکارڈ، ٹوکن ٹیکس اور روٹ پرمٹ کی براہ راست تصدیق'
                        : 'Direct official verification of ownership, token tax and fitness on government database'}
                    </p>
                  </div>
                </div>

                <a
                  href={
                    vehicleProvince === 'punjab'
                      ? 'https://mtmis.excise.punjab.gov.pk'
                      : vehicleProvince === 'sindh'
                      ? 'https://excise.gos.pk/vehicle/vehicle_search'
                      : 'https://islamabadexcise.gov.pk'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs no-underline shrink-0 active:scale-95"
                >
                  <span>{isUrdu ? 'آفیشل پورٹل کھولیں' : 'Open Official Portal'}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/90" />
                </a>
              </div>

              {/* Prominent Play Store Government Non-Affiliation Disclaimer Banner */}
              <div className="p-3.5 sm:p-4 bg-amber-500/10 dark:bg-amber-950/40 rounded-2xl border-2 border-amber-500/40 dark:border-amber-600/50 text-amber-950 dark:text-amber-200 space-y-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-bold font-serif text-amber-900 dark:text-amber-200">
                    {isUrdu ? '⚠️ غیر سرکاری نجی پلیٹ فارم' : '⚠️ Independent Private Application (Non-Government Entity Declaration)'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                  {isUrdu
                    ? 'ڈرائیور دوست وڑائچ گڈز ٹرانسپورٹ کمپنی کا ایک نجی لاجسٹکس و فلیٹ مینجمنٹ سسٹم ہے اور یہ ایپ کسی سرکاری ادارے، ایکسائز، پنجاب پولیس، یا سیف سٹی اتھارٹی کی نمائندگی نہیں کرتی اور نہ ہی ان سے الحاق شدہ ہے۔ گاڑی کی رجسٹریشن اور ٹوکن ٹیکس کی تصدیق سرکاری پورٹل کے ذریعے براہ راست حاصل کی جاتی ہے۔'
                    : 'Driver Dost is an independent private fleet logistics application developed by Warraich Goods Transport Company. It does NOT represent, nor is it affiliated with or authorized by, the Government of Pakistan, Punjab Excise & Taxation, or any government entity. Official registration and token records are verified directly on the official portal below.'}
                </p>
                <div className="flex items-center gap-2 pt-1 border-t border-amber-500/20 text-[10.5px] font-mono text-amber-800 dark:text-amber-300">
                  <span className="font-sans font-semibold">{isUrdu ? 'باضابطہ سرکاری ویب سائٹ:' : 'Official Government Source:'}</span>
                  <a
                    href={
                      vehicleProvince === 'punjab'
                        ? 'https://mtmis.excise.punjab.gov.pk'
                        : vehicleProvince === 'sindh'
                        ? 'https://excise.gos.pk/vehicle/vehicle_search'
                        : 'https://islamabadexcise.gov.pk'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-bold inline-flex items-center gap-1 hover:text-amber-950 dark:hover:text-amber-100"
                  >
                    <span>{vehicleProvince === 'punjab' ? 'mtmis.excise.punjab.gov.pk' : vehicleProvince === 'sindh' ? 'excise.gos.pk' : 'islamabadexcise.gov.pk'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-[#fdfbf7] dark:bg-[#16181e] p-5 sm:p-6 rounded-3xl border border-[#ecece0] dark:border-[#2d313b] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="font-serif font-bold text-base sm:text-lg text-[#4a4a35] dark:text-white">
                    {isUrdu ? 'گاڑی کی رجسٹریشن اور ایکسائز ریکارڈ چیک کریں' : 'Verify Vehicle Registration & Token Tax'}
                  </h2>
                  <p className="text-xs text-[#8e8e75] dark:text-slate-400">
                    {isUrdu 
                      ? 'پنجاب، سندھ، اسلام آباد یا خیبر پختونخواہ کا رجسٹریشن نمبر درج کریں' 
                      : 'Enter vehicle plate number for Punjab, Sindh, ICT or KPK Excise'}
                  </p>
                </div>

                {/* Province Selector */}
                <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#1a1c22] rounded-xl border border-[#ecece0] dark:border-[#2d313b] self-start sm:self-auto text-xs">
                  <button
                    type="button"
                    onClick={() => setVehicleProvince('punjab')}
                    className={`min-h-[38px] px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      vehicleProvince === 'punjab' ? 'bg-[#8b9d77] dark:bg-emerald-700 text-white shadow-2xs' : 'text-[#5a5a40] dark:text-slate-300'
                    }`}
                  >
                    {isUrdu ? 'پنجاب' : 'Punjab'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleProvince('sindh')}
                    className={`min-h-[38px] px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      vehicleProvince === 'sindh' ? 'bg-[#8b9d77] dark:bg-emerald-700 text-white shadow-2xs' : 'text-[#5a5a40] dark:text-slate-300'
                    }`}
                  >
                    {isUrdu ? 'سندھ' : 'Sindh'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleProvince('islamabad')}
                    className={`min-h-[38px] px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      vehicleProvince === 'islamabad' ? 'bg-[#8b9d77] dark:bg-emerald-700 text-white shadow-2xs' : 'text-[#5a5a40] dark:text-slate-300'
                    }`}
                  >
                    {isUrdu ? 'اسلام آباد' : 'Islamabad'}
                  </button>
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleVerifyVehicle} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={vehicleReg}
                    onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                    placeholder={isUrdu ? 'مثال: LES-20-4124 یا FSD-19-8832' : 'e.g. LES-20-4124'}
                    className="w-full ps-4 pe-11 py-3 bg-white dark:bg-[#1a1c22] border border-[#ecece0] dark:border-[#333844] focus:border-[#8b9d77] rounded-2xl text-sm font-mono font-bold text-[#4a4a35] dark:text-white uppercase outline-none shadow-2xs"
                  />
                  <Car className="w-5 h-5 text-[#8e8e75] dark:text-slate-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-[#4a5e38] hover:bg-[#394a2b] text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>{isUrdu ? 'تصدیقی آڈٹ کریں' : 'Run In-App Audit'}</span>
                </button>
              </form>

              {/* Quick Fleet Vehicle Picker */}
              {vehicles.length > 0 && (
                <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-[#ecece0] dark:border-[#2d313b]">
                  <span className="text-[11px] font-bold text-[#8e8e75] dark:text-slate-400 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#8b9d77] dark:text-emerald-400" />
                    {isUrdu ? 'فلیٹ کی گاڑیاں:' : 'Fleet Trucks:'}
                  </span>
                  {vehicles.map(v => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setVehicleReg(v.reg);
                        setTimeout(() => handleVerifyVehicle(), 50);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#1a1c22] border border-[#ecece0] dark:border-[#2d313b] hover:border-[#8b9d77] text-xs font-mono font-bold text-[#4a4a35] dark:text-slate-200 shadow-2xs cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      {v.reg}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Official Vehicle Portal Launcher Card */}
            {vehicleAuditResult && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#16181e] border-2 border-[#8b9d77] dark:border-emerald-600/60 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ecece0] dark:border-[#2d313b]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-[#8b9d77]/20 dark:bg-emerald-950/60 text-[#4a5e38] dark:text-emerald-300">
                      <ExternalLink className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#8b9d77] dark:text-emerald-400 uppercase tracking-wider font-mono">
                        {vehicleAuditResult.province}
                      </span>
                      <h3 className="font-serif font-bold text-xl text-[#4a4a35] dark:text-white flex items-center gap-2">
                        <span>{vehicleAuditResult.reg}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(vehicleAuditResult.reg)}
                          className="min-w-[38px] min-h-[38px] p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22252c] text-gray-500 dark:text-slate-300 cursor-pointer inline-flex items-center justify-center"
                          title={isUrdu ? 'کاپی کریں' : 'Copy'}
                        >
                          {copiedText === vehicleAuditResult.reg ? <Check className="w-4 h-4 text-green-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </h3>
                      <p className="text-xs text-[#5a5a40] dark:text-slate-300 font-medium">{vehicleAuditResult.model}</p>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto px-3 py-1 bg-blue-100 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-800/60 text-blue-800 dark:text-blue-200 text-xs font-bold rounded-full flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    {isUrdu ? 'براہ راست پورٹل ری ڈائریکٹ' : 'Direct Portal Redirect'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{isUrdu ? 'گاڑی نمبر کاپی ہو چکا ہے!' : 'Plate Number Copied to Clipboard!'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-200/90">
                    {isUrdu
                      ? 'سرکاری ایکسائز پورٹل پر گاڑی کی رجسٹریشن، ٹوکن ٹیکس اور فٹنس کی تفصیلات لائیو دیکھنے کے لیے نیچے دیا گیا بٹن دبائیں۔'
                      : 'To view live vehicle registration, token tax and fitness records, click the button below to launch the official excise portal.'}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSaveVehicleAudit}
                    className="px-4 py-2 bg-[#8b9d77]/20 dark:bg-emerald-950/60 hover:bg-[#8b9d77]/30 dark:hover:bg-emerald-900/60 text-[#4a5e38] dark:text-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-transparent dark:border-emerald-800/60"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isUrdu ? 'آڈٹ لاگ میں نوٹ محفوظ کریں' : 'Save Note to Audit Log'}</span>
                  </button>

                  <a
                    href={vehicleAuditResult.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm no-underline active:scale-95"
                  >
                    <span>{isUrdu ? 'آفیشل ایکسائز پورٹل پر چیک کریں' : 'Verify on Official Excise Portal'}</span>
                    <ExternalLink className="w-4 h-4 text-white" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DRIVER LICENSE CHECK */}
        {activeSubTab === 'license' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Pinned Official Portal Link Banner & Google Play Policy Disclaimer */}
            <div className="bg-white dark:bg-[#16181e] p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/40 dark:border-emerald-600/50 shadow-xs space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-bold text-sm sm:text-base text-slate-800 dark:text-white">
                        {isUrdu ? 'آفیشل ڈرائیونگ لائسنس پورٹل' : 'Official DLIMS Punjab Driving License Portal'}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/60">
                        dlims.punjab.gov.pk/verify
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {isUrdu 
                        ? 'پنجاب و موٹروے پولیس کے کمپیوٹرائزڈ کمرشل لائسنس کی سرکاری تصدیق'
                        : 'Official verification of computerized commercial HTV/LTV driving license records'}
                    </p>
                  </div>
                </div>

                <a
                  href="https://dlims.punjab.gov.pk/verify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs no-underline shrink-0 active:scale-95"
                >
                  <span>{isUrdu ? 'آفیشل پورٹل کھولیں' : 'Open Official Portal'}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/90" />
                </a>
              </div>

              {/* Prominent Play Store Government Non-Affiliation Disclaimer Banner */}
              <div className="p-3.5 sm:p-4 bg-amber-500/10 dark:bg-amber-950/40 rounded-2xl border-2 border-amber-500/40 dark:border-amber-600/50 text-amber-950 dark:text-amber-200 space-y-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-bold font-serif text-amber-900 dark:text-amber-200">
                    {isUrdu ? '⚠️ غیر سرکاری نجی پلیٹ فارم' : '⚠️ Independent Private Application (Non-Government Entity Declaration)'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                  {isUrdu
                    ? 'ڈرائیور دوست وڑائچ گڈز ٹرانسپورٹ کمپنی کا ایک آزاد نجی سسٹم ہے اور کسی پولیس، ٹریفک ہیڈکوارٹرز، یا ڈرائیونگ لائسنس اتھارٹی کی نمائندگی نہیں کرتا۔ ڈرائیور لائسنس اور فٹنس کی باضابطہ تصدیق پنجاب پولیس کی آفیشل ڈی ایل آئی ایم ایس (DLIMS) ویب سائٹ کے ذریعے کی جاتی ہے۔'
                    : 'Driver Dost is an independent private fleet logistics application developed by Warraich Goods Transport Company. It does NOT represent, nor is it affiliated with, Punjab Police or any licensing authority. Driving license status is verified directly via the official DLIMS Punjab portal.'}
                </p>
                <div className="flex items-center gap-2 pt-1 border-t border-amber-500/20 text-[10.5px] font-mono text-amber-800 dark:text-amber-300">
                  <span className="font-sans font-semibold">{isUrdu ? 'باضابطہ سرکاری ویب سائٹ:' : 'Official Government Source:'}</span>
                  <a
                    href="https://dlims.punjab.gov.pk/verify"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-bold inline-flex items-center gap-1 hover:text-amber-950 dark:hover:text-amber-100"
                  >
                    <span>dlims.punjab.gov.pk</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-[#fdfbf7] dark:bg-[#16181e] p-5 sm:p-6 rounded-3xl border border-[#ecece0] dark:border-[#2d313b] space-y-5">
              <div>
                <h2 className="font-serif font-bold text-base sm:text-lg text-[#4a4a35] dark:text-white">
                  {isUrdu ? 'ڈرائیور لائسنس و ڈی ایل آئی ایم ایس تصدیق' : 'DLIMS Driver License & Fitness Check'}
                </h2>
                <p className="text-xs text-[#8e8e75] dark:text-slate-400">
                  {isUrdu 
                    ? 'ڈرائیور کا شناختی کارڈ نمبر یا لائسنس نمبر درج کریں' 
                    : 'Enter Driver CNIC (e.g. 35201-XXXXXXXX-X) or License No'}
                </p>
              </div>

              {/* Form Input */}
              <form onSubmit={handleVerifyLicense} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={licenseQuery}
                    onChange={(e) => setLicenseQuery(e.target.value)}
                    placeholder={isUrdu ? 'مثال: LHR-48291-HTV یا 35201-1849201-3' : 'License / CNIC Number'}
                    className="w-full ps-4 pe-11 py-3 bg-white dark:bg-[#1a1c22] border border-[#ecece0] dark:border-[#333844] focus:border-[#8b9d77] rounded-2xl text-sm font-mono font-bold text-[#4a4a35] dark:text-white outline-none shadow-2xs"
                  />
                  <CreditCard className="w-5 h-5 text-[#8e8e75] dark:text-slate-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <select
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value)}
                  className="w-full sm:w-auto px-3 py-3 bg-white dark:bg-[#1a1c22] border border-[#ecece0] dark:border-[#333844] rounded-2xl text-xs font-bold text-[#4a4a35] dark:text-white outline-none cursor-pointer"
                >
                  <option value="HTV">{isUrdu ? 'ہیوی ٹرانسپورٹ لائسنس' : 'HTV Heavy Transport'}</option>
                  <option value="Trailer">{isUrdu ? 'آرٹیکولیٹڈ ٹرالر' : 'Articulated Trailer'}</option>
                  <option value="LTV">{isUrdu ? 'لائٹ کمرشل لائسنس' : 'LTV Commercial'}</option>
                  <option value="PSV">{isUrdu ? 'پیسنجر / بس لائسنس' : 'PSV Passenger / Bus'}</option>
                </select>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-[#4a5e38] hover:bg-[#394a2b] text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>{isUrdu ? 'لائسنس چیک کریں' : 'Verify License'}</span>
                </button>
              </form>

              {/* Quick Driver Picker */}
              {drivers.length > 0 && (
                <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-[#ecece0] dark:border-[#2d313b]">
                  <span className="text-[11px] font-bold text-[#8e8e75] dark:text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#8b9d77] dark:text-emerald-400" />
                    {isUrdu ? 'رجسٹرڈ ڈرائیورز:' : 'Registered Drivers:'}
                  </span>
                  {drivers.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setLicenseQuery(d.license || d.cnic);
                        setTimeout(() => handleVerifyLicense(), 50);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#1a1c22] border border-[#ecece0] dark:border-[#2d313b] hover:border-[#8b9d77] text-xs font-mono font-bold text-[#4a4a35] dark:text-slate-200 shadow-2xs cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      {d.name} ({d.lictype || 'HTV'})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Official DLIMS Portal Launcher Card */}
            {licenseAuditResult && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#16181e] border-2 border-[#8b9d77] dark:border-emerald-600/60 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ecece0] dark:border-[#2d313b]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      <ExternalLink className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider font-mono">
                        {isUrdu ? `${licenseAuditResult.lictype} کمرشل` : `${licenseAuditResult.lictype} Commercial`}
                      </span>
                      <h3 className="font-serif font-bold text-xl text-[#4a4a35] dark:text-white flex items-center gap-2">
                        <span>{licenseAuditResult.driverName}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(licenseAuditResult.identifier)}
                          className="min-w-[38px] min-h-[38px] p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22252c] text-gray-500 dark:text-slate-300 cursor-pointer inline-flex items-center justify-center"
                          title={isUrdu ? 'کاپی کریں' : 'Copy'}
                        >
                          {copiedText === licenseAuditResult.identifier ? <Check className="w-4 h-4 text-green-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </h3>
                      <p className="text-xs text-[#8e8e75] dark:text-slate-400 font-mono">{licenseAuditResult.identifier}</p>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto px-3 py-1 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {isUrdu ? 'براہ راست پورٹل ری ڈائریکٹ' : 'Direct Portal Redirect'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{isUrdu ? 'لائسنس / شناختی کارڈ نمبر کاپی ہو چکا ہے!' : 'Identifier Copied to Clipboard!'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-200/90">
                    {isUrdu
                      ? 'پنجاب ٹریفک پولیس کے آفیشل ڈی ایل آئی ایم ایس (DLIMS) پورٹل پر لائسنس کی لائیو میعاد اور کیٹیگری چیک کرنے کے لیے نیچے بٹن دبائیں۔'
                      : 'To verify computerized driving license validity and traffic records directly on DLIMS, click the button below.'}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSaveLicenseAudit}
                    className="px-4 py-2 bg-[#8b9d77]/20 dark:bg-emerald-950/60 hover:bg-[#8b9d77]/30 dark:hover:bg-emerald-900/60 text-[#4a5e38] dark:text-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-transparent dark:border-emerald-800/60"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isUrdu ? 'آڈٹ لاگ میں نوٹ محفوظ کریں' : 'Save Note to Audit Log'}</span>
                  </button>

                  <a
                    href={licenseAuditResult.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm no-underline active:scale-95"
                  >
                    <span>{isUrdu ? 'آفیشل DLIMS پورٹل پر چیک کریں' : 'Verify on DLIMS Portal'}</span>
                    <ExternalLink className="w-4 h-4 text-white" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: E-CHALLAN CHECK */}
        {activeSubTab === 'challan' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Pinned Official Portal Link Banner & Google Play Policy Disclaimer */}
            <div className="bg-white dark:bg-[#16181e] p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/40 dark:border-emerald-600/50 shadow-xs space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-bold text-sm sm:text-base text-slate-800 dark:text-white">
                        {isUrdu ? 'آفیشل سیف سٹی ای چالان پورٹل' : 'Official PSCA Safe City E-Challan Portal'}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/60">
                        echallan.psca.gop.pk
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {isUrdu 
                        ? 'پنجاب سیف سٹی اتھارٹی کے کیمرہ چالان و جرمانہ کی آفیشل تصدیق'
                        : 'Official camera speed, signal & violation penalty verification on PSCA portal'}
                    </p>
                  </div>
                </div>

                <a
                  href="https://echallan.psca.gop.pk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs no-underline shrink-0 active:scale-95"
                >
                  <span>{isUrdu ? 'آفیشل پورٹل کھولیں' : 'Open Official Portal'}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/90" />
                </a>
              </div>

              {/* Prominent Play Store Government Non-Affiliation Disclaimer Banner */}
              <div className="p-3.5 sm:p-4 bg-amber-500/10 dark:bg-amber-950/40 rounded-2xl border-2 border-amber-500/40 dark:border-amber-600/50 text-amber-950 dark:text-amber-200 space-y-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-bold font-serif text-amber-900 dark:text-amber-200">
                    {isUrdu ? '⚠️ غیر سرکاری نجی پلیٹ فارم' : '⚠️ Independent Private Application (Non-Government Entity Declaration)'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                  {isUrdu
                    ? 'ڈرائیور دوست نجی ٹرانسپورٹ فلیٹ سسٹم ہے اور پنجاب سیف سٹی اتھارٹی (PSCA) یا ٹریفک پولیس کی نمائندگی نہیں کرتا۔ ٹریفک چالان اور کیمرہ جرمانوں کی باضابطہ جانچ براہ راست سرکاری ای چالان پورٹل پر ہوتی ہے۔'
                    : 'Driver Dost is an independent private fleet application and does NOT represent Punjab Safe Cities Authority (PSCA) or traffic police. E-challan status and camera violation records are inspected directly on the official PSCA portal.'}
                </p>
                <div className="flex items-center gap-2 pt-1 border-t border-amber-500/20 text-[10.5px] font-mono text-amber-800 dark:text-amber-300">
                  <span className="font-sans font-semibold">{isUrdu ? 'باضابطہ سرکاری ویب سائٹ:' : 'Official Government Source:'}</span>
                  <a
                    href="https://echallan.psca.gop.pk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-bold inline-flex items-center gap-1 hover:text-amber-950 dark:hover:text-amber-100"
                  >
                    <span>echallan.psca.gop.pk</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-[#fdfbf7] dark:bg-[#16181e] p-5 sm:p-6 rounded-3xl border border-[#ecece0] dark:border-[#2d313b] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="font-serif font-bold text-base sm:text-lg text-[#4a4a35] dark:text-white">
                    {isUrdu ? 'سیف سٹی ای چالان و ٹریفک خلاف ورزی آڈٹ' : 'Safe City E-Challan & Penalty Audit'}
                  </h2>
                  <p className="text-xs text-[#8e8e75] dark:text-slate-400">
                    {isUrdu 
                      ? 'گاڑی کا رجسٹریشن نمبر یا چالان آئی ڈی درج کریں' 
                      : 'Enter vehicle number or challan ID for Safe City checking'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#1a1c22] rounded-xl border border-[#ecece0] dark:border-[#2d313b] text-xs">
                  <button
                    type="button"
                    onClick={() => setChallanCity('lahore')}
                    className={`min-h-[38px] px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      challanCity === 'lahore' ? 'bg-[#8b9d77] dark:bg-emerald-700 text-white shadow-2xs' : 'text-[#5a5a40] dark:text-slate-300'
                    }`}
                  >
                    {isUrdu ? 'لاہور سیف سٹی' : 'Lahore PSCA'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setChallanCity('islamabad')}
                    className={`min-h-[38px] px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      challanCity === 'islamabad' ? 'bg-[#8b9d77] dark:bg-emerald-700 text-white shadow-2xs' : 'text-[#5a5a40] dark:text-slate-300'
                    }`}
                  >
                    {isUrdu ? 'اسلام آباد' : 'Islamabad'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setChallanCity('rawalpindi')}
                    className={`min-h-[38px] px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      challanCity === 'rawalpindi' ? 'bg-[#8b9d77] dark:bg-emerald-700 text-white shadow-2xs' : 'text-[#5a5a40] dark:text-slate-300'
                    }`}
                  >
                    {isUrdu ? 'راولپنڈی' : 'Rawalpindi'}
                  </button>
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleVerifyChallan} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={challanQuery}
                    onChange={(e) => setChallanQuery(e.target.value.toUpperCase())}
                    placeholder={isUrdu ? 'مثال: LES-20-4124 یا چالان نمبر' : 'e.g. LES-20-4124'}
                    className="w-full ps-4 pe-11 py-3 bg-white dark:bg-[#1a1c22] border border-[#ecece0] dark:border-[#333844] focus:border-[#8b9d77] rounded-2xl text-sm font-mono font-bold text-[#4a4a35] dark:text-white uppercase outline-none shadow-2xs"
                  />
                  <AlertTriangle className="w-5 h-5 text-[#8e8e75] dark:text-slate-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-[#4a5e38] hover:bg-[#394a2b] text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>{isUrdu ? 'چالان اسٹیٹس دیکھیں' : 'Check Challan'}</span>
                </button>
              </form>

              {/* Highway Penalty Tariffs Info Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-[#231707] border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1 font-sans">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>{isUrdu ? 'کمرشل گاڑیوں کے اہم چالان ریٹس (موٹروے و ہائی وے):' : 'Commercial Highway Challan Tariffs:'}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div className="bg-white dark:bg-[#16181e] p-2 rounded-xl border border-amber-200 dark:border-amber-900/50">
                    <span className="block text-gray-500 dark:text-slate-400 font-sans">{isUrdu ? 'اوور اسپیڈنگ:' : 'Over-speeding:'}</span>
                    <span className="font-bold text-[#4a4a35] dark:text-white">Rs. 2,500</span>
                  </div>
                  <div className="bg-white dark:bg-[#16181e] p-2 rounded-xl border border-amber-200 dark:border-amber-900/50">
                    <span className="block text-gray-500 dark:text-slate-400 font-sans">{isUrdu ? 'اوور لوڈنگ ایکسل:' : 'Axle Overload:'}</span>
                    <span className="font-bold text-[#4a4a35] dark:text-white">Rs. 5,000</span>
                  </div>
                  <div className="bg-white dark:bg-[#16181e] p-2 rounded-xl border border-amber-200 dark:border-amber-900/50">
                    <span className="block text-gray-500 dark:text-slate-400 font-sans">{isUrdu ? 'لین کی خلاف ورزی:' : 'Lane Violation:'}</span>
                    <span className="font-bold text-[#4a4a35] dark:text-white">Rs. 1,000</span>
                  </div>
                  <div className="bg-white dark:bg-[#16181e] p-2 rounded-xl border border-amber-200 dark:border-amber-900/50">
                    <span className="block text-gray-500 dark:text-slate-400 font-sans">{isUrdu ? 'بغیر M-Tag انٹری:' : 'No M-Tag Pass:'}</span>
                    <span className="font-bold text-[#4a4a35] dark:text-white">Rs. 1,500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Official Safe City E-Challan Portal Launcher Card */}
            {challanAuditResult && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#16181e] border-2 border-[#8b9d77] dark:border-emerald-600/60 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ecece0] dark:border-[#2d313b]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300">
                      <ExternalLink className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider font-mono">
                        {challanAuditResult.city}
                      </span>
                      <h3 className="font-serif font-bold text-xl text-[#4a4a35] dark:text-white flex items-center gap-2">
                        <span>{challanAuditResult.identifier}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(challanAuditResult.identifier)}
                          className="min-w-[38px] min-h-[38px] p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22252c] text-gray-500 dark:text-slate-300 cursor-pointer inline-flex items-center justify-center"
                          title={isUrdu ? 'کاپی کریں' : 'Copy'}
                        >
                          {copiedText === challanAuditResult.identifier ? <Check className="w-4 h-4 text-green-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </h3>
                      <p className="text-xs text-[#5a5a40] dark:text-slate-300 font-medium">{challanAuditResult.city}</p>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto px-3 py-1 bg-blue-100 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-800/60 text-blue-800 dark:text-blue-200 text-xs font-bold rounded-full flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    {isUrdu ? 'براہ راست پورٹل ری ڈائریکٹ' : 'Direct Portal Redirect'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-[#0f1d31] border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{isUrdu ? 'گاڑی نمبر کاپی ہو چکا ہے!' : 'Vehicle Identifier Copied!'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
                    {isUrdu
                      ? 'پنجاب سیف سٹی اتھارٹی (PSCA) کے پورٹل پر لائیو ای چالان، جرمانے اور ویڈیو کیمرہ ریکارڈز چیک کرنے کے لیے نیچے بٹن دبائیں۔'
                      : 'To inspect live e-challans, traffic violations and speed camera penalties on the official PSCA portal, click the button below.'}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSaveChallanAudit}
                    className="px-4 py-2 bg-[#8b9d77]/20 dark:bg-emerald-950/60 hover:bg-[#8b9d77]/30 dark:hover:bg-emerald-900/60 text-[#4a5e38] dark:text-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-transparent dark:border-emerald-800/60"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isUrdu ? 'آڈٹ لاگ میں نوٹ محفوظ کریں' : 'Save Note to Audit Log'}</span>
                  </button>

                  <a
                    href={challanAuditResult.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm no-underline active:scale-95"
                  >
                    <span>{isUrdu ? 'آفیشل سیف سٹی پورٹل پر چیک کریں' : 'Verify on Official PSCA Portal'}</span>
                    <ExternalLink className="w-4 h-4 text-white" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SAVED AUDIT RECORDS */}
        {activeSubTab === 'history' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#ecece0] dark:border-[#2d313b]">
              <span className="text-xs font-bold text-[#4a4a35] dark:text-white">
                {isUrdu ? 'محفوظ شدہ تصدیقی لاگز اور آڈٹ تاریخ:' : 'Saved Compliance & Verification Audits:'}
              </span>
              <span className="text-xs text-[#8e8e75] dark:text-slate-400 font-mono">
                {auditRecords.length} {isUrdu ? 'ریکارڈز' : 'records'}
              </span>
            </div>

            {auditRecords.length === 0 ? (
              <div className="p-12 text-center bg-[#fdfbf7] dark:bg-[#16181e] rounded-3xl border border-[#ecece0] dark:border-[#2d313b] space-y-2">
                <ShieldCheck className="w-10 h-10 mx-auto text-[#8b9d77] dark:text-emerald-400 opacity-40" />
                <p className="text-sm font-serif text-[#5a5a40] dark:text-slate-300">{isUrdu ? 'کوئی محفوظ شدہ ریکارڈ موجود نہیں' : 'No audit records saved yet'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {auditRecords.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-[#fdfbf7] dark:bg-[#16181e] border border-[#ecece0] dark:border-[#2d313b] hover:border-[#8b9d77] hover:bg-white dark:hover:bg-[#1e212a] transition-all space-y-3 shadow-2xs group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`p-2 rounded-xl text-xs font-bold ${
                            item.type === 'vehicle'
                              ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300'
                              : item.type === 'license'
                              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                          }`}>
                            {item.type === 'vehicle' ? <Car className="w-4 h-4" /> : item.type === 'license' ? <CreditCard className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                          </span>
                          <div>
                            <h4 className="font-serif font-bold text-sm text-[#4a4a35] dark:text-white leading-tight">
                              {item.title}
                            </h4>
                            <span className="text-[11px] font-mono text-[#8b9d77] dark:text-emerald-400 font-bold">
                              {item.identifier}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-100 dark:bg-emerald-950/70 text-green-800 dark:text-emerald-300 border border-green-200 dark:border-emerald-800/60">
                          {item.status.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-[#5a5a40] dark:text-slate-300 font-sans leading-relaxed bg-white/80 dark:bg-[#1a1c22] p-2.5 rounded-xl border border-[#ecece0] dark:border-[#2d313b]">
                        {item.notes}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#ecece0] dark:border-[#2d313b] flex items-center justify-between text-[11px] text-[#8e8e75] dark:text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-[#8b9d77] dark:text-emerald-400" />
                        {item.date}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteAuditRecord(item.id)}
                        className="min-w-[38px] min-h-[38px] p-2 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-all inline-flex items-center justify-center"
                        title={isUrdu ? 'حذف کریں' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: BILTY VERIFICATION & LOAD TRACKER */}
        {activeSubTab === 'bilty' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* If a Bilty is verified, display the official BiltyVerificationCard */}
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
                <div className="bg-[#fdfbf7] dark:bg-[#16181e] p-5 sm:p-6 rounded-3xl border border-[#ecece0] dark:border-[#2d313b] space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="font-serif font-bold text-base sm:text-lg text-[#4a4a35] dark:text-white flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-[#8b9d77] dark:text-emerald-400" />
                        <span>{isUrdu ? 'آفیشل آن لائن دستاویز تصدیق' : 'Official Online Document Verification'}</span>
                      </h2>
                      <p className="text-xs text-[#8e8e75] dark:text-slate-400 mt-1">
                        {isUrdu
                          ? 'دستاویز پر موجود کیو آر کوڈ اسکین کریں یا حوالہ نمبر درج کر کے سامان، تاریخ، گاڑی اور روٹ کی فوری تصدیق کریں۔'
                          : 'Verify authentic consignment documents, cargo description, weight/quantity, origin/destination, and vehicle details.'}
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 self-start sm:self-auto font-mono">
                      {isUrdu ? 'مستند تصدیق' : 'VERIFIED PORTAL'}
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
                      <label className="block text-xs font-bold text-[#4a4a35] dark:text-slate-200">
                        {isUrdu ? 'دستاویز نمبر درج کریں:' : 'Enter Document Number:'}
                      </label>
                      <span className="text-[11px] text-[#8e8e75] dark:text-slate-400">
                        {isUrdu ? 'مثال: WG-2026-0001 یا 0001' : 'e.g. WG-2026-0001'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={biltyQuery}
                          onChange={(e) => setBiltyQuery(e.target.value)}
                          placeholder={isUrdu ? 'مثال: WG-2026-0001' : 'e.g. WG-2026-0001'}
                          className="w-full ps-10 pe-4 py-3 rounded-2xl bg-white dark:bg-[#1a1c22] border border-[#ecece0] dark:border-[#333844] focus:border-[#8b9d77] focus:ring-1 focus:ring-[#8b9d77] outline-hidden text-sm font-mono font-bold text-[#4a4a35] dark:text-white transition-all"
                        />
                        <Search className="w-4 h-4 text-[#8e8e75] dark:text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-3 rounded-2xl bg-[#4a5e38] text-white hover:bg-[#3d4e2e] text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isUrdu ? 'فوری تصدیق کریں' : 'Verify Consignment'}</span>
                      </button>
                    </div>

                    {/* QR Code Scanner (Camera or Photo) Button */}
                    <div className="pt-2 border-t border-[#ecece0]/80 dark:border-[#2d313b] flex flex-col sm:flex-row items-center justify-between gap-2.5">
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
                        <span>{isUrdu ? '📷 کیمرے یا تصویر سے کیو آر اسکین کریں' : '📷 Scan QR Code (Camera/Photo)'}</span>
                      </button>

                      <p className="text-[11px] text-[#8e8e75] dark:text-slate-400 text-center sm:text-end">
                        {isUrdu 
                          ? 'دستاویز پر موجود کیو آر کوڈ کی تصویر کھینچیں، تصدیق خودکار ہو جائے گی' 
                          : 'Point camera at printed document QR code for instant zero-failure verification'}
                      </p>
                    </div>

                    {scanStatus && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 font-medium animate-in fade-in">
                        {scanStatus}
                      </div>
                    )}
                  </form>
                </div>

                {/* Cloud Search Loading indicator */}
                {isBiltyLoading && (
                  <div className="p-6 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100 flex items-center justify-center gap-3 animate-in fade-in">
                    <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
                      {isUrdu ? 'آفیشل ریکارڈز سے تصدیق جاری ہے...' : 'Checking verified document records...'}
                    </span>
                  </div>
                )}

                {/* Search not found message */}
                {!isBiltyLoading && biltySearchAttempted && !verifiedBilty && (
                  <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/80 dark:bg-[#231707] border border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-100 space-y-3 animate-in fade-in">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif font-bold text-sm text-amber-900 dark:text-amber-200">
                          {isUrdu ? 'دستاویز نمبر رجسٹرڈ نہیں ملا' : 'Document Record Not Found'}
                        </h4>
                        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                          {isUrdu
                            ? `نمبر "${biltyQuery}" کے تحت کوئی تصدیق شدہ ریکارڈ نہیں ملا۔ براہ کرم نمبر کی درستگی چیک کریں یا ہیلپ لائن سے رابطہ کریں۔`
                            : `No verified document record matched "${biltyQuery}". Please double-check the document number or contact our helpline.`}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-white/80 dark:bg-[#16181e] rounded-2xl border border-amber-200 dark:border-amber-900/50 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <span className="text-[#5a5a40] dark:text-slate-300">
                        {isUrdu ? 'وڑائچ گڈز 24/7 ہیلپ لائن رابطہ:' : 'Warraich Goods 24/7 Helpline:'}
                      </span>
                      <div className="font-mono font-bold text-[#4a5e38] dark:text-emerald-400 flex items-center gap-3 dir-ltr">
                        <a href="tel:03005370443" className="hover:underline">0300-5370443</a>
                        <span>•</span>
                        <a href="tel:03395370443" className="hover:underline">0339-5370443</a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Selection of Registered Documents */}
                {(() => {
                  const stored = getStoredBilties();
                  if (stored.length === 0) return null;
                  return (
                    <div className="bg-[#fdfbf7] dark:bg-[#16181e] p-5 sm:p-6 rounded-3xl border border-[#ecece0] dark:border-[#2d313b] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#4a4a35] dark:text-white flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-[#8b9d77] dark:text-emerald-400" />
                          {isUrdu ? 'حالیہ رجسٹرڈ دستاویزات (فوری تصدیق کیلئے کلک کریں):' : 'Recent Registered Documents (Click to verify):'}
                        </span>
                        <span className="text-[11px] font-mono text-[#8e8e75] dark:text-slate-400">
                          {stored.length} {isUrdu ? 'کل ریکارڈز' : 'total'}
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
                            className={`p-3 rounded-2xl bg-white dark:bg-[#1a1c22] border border-[#ecece0] dark:border-[#2d313b] hover:border-[#8b9d77] hover:shadow-2xs ${isUrdu ? 'text-right' : 'text-left'} cursor-pointer transition-all flex items-center justify-between gap-2 group`}
                          >
                            <div className="overflow-hidden">
                              <span className="font-mono font-bold text-xs text-[#4a5e38] dark:text-emerald-400 block group-hover:text-[#3d4e2e] dark:group-hover:text-emerald-300">
                                {b.biltyNo}
                              </span>
                              <span className="text-[11px] text-[#8e8e75] dark:text-slate-400 truncate block">
                                {b.sendingCity} → {b.receivingCity}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                              {b.vehicleNo || (isUrdu ? 'تصدیق شدہ' : 'Verified')}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Online QR Document Verification Banner */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#16181e] border border-[#ecece0] dark:border-[#2d313b] space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#8b9d77] dark:text-emerald-400" />
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[#4a4a35] dark:text-white">
                      {isUrdu ? 'آن لائن کیو آر دستاویز تصدیق سسٹم' : 'Online QR Document Verification System'}
                    </h4>
                  </div>
                  <p className="text-xs text-[#5a5a40] dark:text-slate-300 leading-relaxed">
                    {isUrdu
                      ? 'ہر جاری کردہ کنسائنمنٹ دستاویز پر ایک آفیشل کیو آر کوڈ پرنٹ ہوتا ہے جو وڑائچ گڈز کے آن لائن تصدیقی ریکارڈ سے منسلک ہے۔ کسی بھی اسمارٹ فون یا کیمرہ سے دستاویز کی اصلیت کی فوری تصدیق کی جا سکتی ہے۔'
                      : 'Every generated consignment document carries an official QR code linked to Warraich Goods online verification records so consignors and consignees can verify authenticity from any smartphone.'}
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
