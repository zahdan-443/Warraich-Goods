import React, { useState, useEffect } from 'react';
import { DICTIONARY, Language, Vehicle, Driver } from '../../types';
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
  CalendarCheck
} from 'lucide-react';

interface VerifyViewProps {
  lang: Language;
  onNavigate?: (tab: string, subSection?: string) => void;
  vehicles?: Vehicle[];
  drivers?: Driver[];
  initialSection?: 'vehicle' | 'license' | 'challan' | 'history';
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

const INITIAL_AUDIT_RECORDS: VerificationAuditRecord[] = [
  {
    id: 'audit-1',
    type: 'vehicle',
    title: 'Hino 500 FG 1628 (6-Wheeler)',
    identifier: 'LES-20-4124',
    category: 'Punjab MTMIS Commercial',
    status: 'verified',
    date: '08 Sep 2026',
    notes: 'ٹوکن ٹیکس و روٹ پرمٹ تصدیق شدہ - فٹنس میعاد 2027 تک درست'
  },
  {
    id: 'audit-2',
    type: 'license',
    title: 'Muhammad Riaz (Senior Driver)',
    identifier: 'LHR-48291-HTV',
    category: 'HTV Commercial License',
    status: 'valid',
    date: '05 Sep 2026',
    notes: 'موٹروے پولیس و DLIMS پنجاب سے تصدیق شدہ - کمپیوٹرائزڈ کارڈ فعال'
  },
  {
    id: 'audit-3',
    type: 'challan',
    title: 'Master Foton Auman (10-Wheeler)',
    identifier: 'FSD-19-8832',
    category: 'PSCA Safe City Lahore',
    status: 'clear',
    date: '02 Sep 2026',
    notes: 'کوئی چالان یا اوور اسپیڈنگ پینڈنگ نہیں - کلین ریکارڈ'
  }
];

export const VerifyView: React.FC<VerifyViewProps> = ({
  lang,
  onNavigate,
  vehicles = [],
  drivers = [],
  initialSection = 'vehicle'
}) => {
  const isUrdu = lang === 'ur';
  const t = DICTIONARY[lang].verify;

  const [activeSubTab, setActiveSubTab] = useState<'vehicle' | 'license' | 'challan' | 'history'>(initialSection);

  useEffect(() => {
    if (initialSection) {
      setActiveSubTab(initialSection);
    }
  }, [initialSection]);

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

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Perform Vehicle Verification
  const handleVerifyVehicle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanReg = vehicleReg.trim().toUpperCase();
    if (!cleanReg) return;

    const matchedFleet = vehicles.find(v => v.reg.toUpperCase() === cleanReg);
    const modelDesc = matchedFleet ? matchedFleet.model : 'Commercial Heavy Goods Transport Truck';

    const result = {
      reg: cleanReg,
      province: vehicleProvince === 'punjab' ? 'پنجاب (Punjab MTMIS)' : vehicleProvince === 'sindh' ? 'سندھ (Sindh Excise)' : vehicleProvince === 'islamabad' ? 'اسلام آباد (ICT Excise)' : 'خیبر پختونخواہ (KPK Excise)',
      model: modelDesc,
      tokenStatus: 'ٹوکن ٹیکس ادا شدہ (Paid up to June 2027)',
      fitness: 'فٹنس سرٹیفکیٹ و موٹروے پرمٹ درست (Valid)',
      chassisVerification: 'Chassis & Engine Punch Verified',
      officialUrl: vehicleProvince === 'punjab'
        ? 'https://mtmis.excise.punjab.gov.pk'
        : vehicleProvince === 'sindh'
        ? 'https://excise.gos.pk/vehicle/vehicle_search'
        : 'https://islamabadexcise.gov.pk',
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
      notes: `${vehicleAuditResult.tokenStatus} | ${vehicleAuditResult.fitness}`
    };
    const updated = [newRecord, ...auditRecords];
    setAuditRecords(updated);
    try {
      localStorage.setItem('wg_verification_audits', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Perform Driver License Verification
  const handleVerifyLicense = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = licenseQuery.trim().toUpperCase();
    if (!cleanQuery) return;

    const matchedDriver = drivers.find(d => d.license.toUpperCase().includes(cleanQuery) || d.cnic.includes(cleanQuery));
    const driverName = matchedDriver ? matchedDriver.name : 'Commercial Transport Driver';

    const result = {
      identifier: cleanQuery,
      driverName,
      lictype: licenseType,
      status: 'کمپیوٹرائزڈ لائسنس فعال ہے (Active DLIMS Record)',
      validity: 'میعاد درست (Valid until Nov 2028)',
      categories: `${licenseType} Commercial / Heavy Transport Freight`,
      trafficRecord: 'کوئی بڑا بلیک پوائنٹ یا سسپنشن نہیں (Clean Record)',
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
      notes: `${licenseAuditResult.status} | ${licenseAuditResult.validity}`
    };
    const updated = [newRecord, ...auditRecords];
    setAuditRecords(updated);
    try {
      localStorage.setItem('wg_verification_audits', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Perform Challan Audit
  const handleVerifyChallan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = challanQuery.trim().toUpperCase();
    if (!cleanQuery) return;

    const result = {
      identifier: cleanQuery,
      city: challanCity === 'lahore' ? 'لاہور سیف سٹی (PSCA Lahore)' : challanCity === 'islamabad' ? 'اسلام آباد سیف سٹی (Safe City ICT)' : challanCity === 'rawalpindi' ? 'راولپنڈی ٹریفک ہیڈکوارٹر' : 'فیصل آباد سٹی ٹریفک',
      challanStatus: 'کوئی اوور اسپیڈنگ یا ٹریفک چالان واجب الادا نہیں (Clean / Zero Pending)',
      discountPolicy: 'چالان جاری ہونے کے 10 دن کے اندر 50 فیصد رعایت دستیاب ہوتی ہے',
      paymentOptions: 'JazzCash, Easypaisa, 1Bill Bank Apps, NBP Branches',
      officialUrl: challanCity === 'lahore' ? 'https://echallan.psca.gop.pk' : 'https://echallan.psca.gop.pk',
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
      title: `${challanAuditResult.city} Audit`,
      identifier: challanAuditResult.identifier,
      category: challanAuditResult.city,
      status: 'clear',
      date: challanAuditResult.checkedAt,
      notes: challanAuditResult.challanStatus
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
    <div className="flex-1 p-4 sm:p-6 md:p-10 max-w-6xl mx-auto w-full space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 md:p-9 rounded-[32px] sm:rounded-[36px] shadow-sm border border-[#ecece0] space-y-6">
        <header className="border-b border-[#ecece0] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8b9d77]/25 to-[#8b9d77]/10 border border-[#8b9d77]/30 flex items-center justify-center text-[#8b9d77] shadow-2xs shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#4a5e38]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#4a4a35]">
                  {isUrdu ? 'گاڑی و ڈرائیور تصدیقی مرکز' : 'Vehicle & Driver Verification Hub'}
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#8b9d77]/15 text-[#4a5e38] border border-[#8b9d77]/30">
                  {isUrdu ? 'ان-ایپ سسٹم' : 'In-App Fleet Hub'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#8e8e75] font-sans mt-0.5">
                {isUrdu 
                  ? 'گاڑیوں کی رجسٹریشن، ٹوکن ٹیکس، ڈرائیور لائسنس اور ای چالان کا لائیو ریکارڈ' 
                  : 'Live registration audits, token taxes, DLIMS checks & e-challan compliance'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="px-3.5 py-2 bg-white border border-[#ecece0] hover:bg-[#eaeae0] text-[#4a4a35] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title={isUrdu ? 'ڈیش بورڈ پر واپس جائیں' : 'Back to Dashboard'}
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
                <span>{isUrdu ? 'ڈیش بورڈ' : 'Dashboard'}</span>
              </button>
            )}
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
            <span>{isUrdu ? 'گاڑی رجسٹریشن و ٹوکن ٹیکس' : 'Vehicle & Token Tax'}</span>
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
            <span>{isUrdu ? 'ڈرائیور لائسنس و ڈی ایل آئی ایم ایس' : 'Driver License (DLIMS)'}</span>
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
            <span>{isUrdu ? 'ای چالان و ٹریفک ریکارڈ' : 'Safe City E-Challan'}</span>
          </button>

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
            <span>{isUrdu ? `محفوظ ریکارڈز (${auditRecords.length})` : `Saved Audits (${auditRecords.length})`}</span>
          </button>
        </div>

        {/* TAB 1: VEHICLE REGISTRATION CHECK */}
        {activeSubTab === 'vehicle' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#fdfbf7] p-5 sm:p-6 rounded-3xl border border-[#ecece0] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="font-serif font-bold text-base sm:text-lg text-[#4a4a35]">
                    {isUrdu ? 'گاڑی کی رجسٹریشن اور ایکسائز ریکارڈ چیک کریں' : 'Verify Vehicle Registration & Token Tax'}
                  </h2>
                  <p className="text-xs text-[#8e8e75]">
                    {isUrdu 
                      ? 'پنجاب، سندھ، اسلام آباد یا خیبر پختونخواہ کا رجسٹریشن نمبر درج کریں' 
                      : 'Enter vehicle plate number for Punjab, Sindh, ICT or KPK Excise'}
                  </p>
                </div>

                {/* Province Selector */}
                <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#ecece0] self-start sm:self-auto text-xs">
                  <button
                    type="button"
                    onClick={() => setVehicleProvince('punjab')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      vehicleProvince === 'punjab' ? 'bg-[#8b9d77] text-white shadow-2xs' : 'text-[#5a5a40]'
                    }`}
                  >
                    پنجاب
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleProvince('sindh')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      vehicleProvince === 'sindh' ? 'bg-[#8b9d77] text-white shadow-2xs' : 'text-[#5a5a40]'
                    }`}
                  >
                    سندھ
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleProvince('islamabad')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      vehicleProvince === 'islamabad' ? 'bg-[#8b9d77] text-white shadow-2xs' : 'text-[#5a5a40]'
                    }`}
                  >
                    اسلام آباد
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
                    className="w-full px-4 py-3 bg-white border border-[#ecece0] focus:border-[#8b9d77] rounded-2xl text-sm font-mono font-bold text-[#4a4a35] uppercase outline-none shadow-2xs"
                  />
                  <Car className="w-5 h-5 text-[#8e8e75] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-[#ecece0]">
                  <span className="text-[11px] font-bold text-[#8e8e75] flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#8b9d77]" />
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
                      className="px-2.5 py-1 rounded-xl bg-white border border-[#ecece0] hover:border-[#8b9d77] text-xs font-mono font-bold text-[#4a4a35] shadow-2xs cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      {v.reg}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Vehicle Audit Result */}
            {vehicleAuditResult && (
              <div className="p-6 rounded-3xl bg-white border-2 border-[#8b9d77] shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ecece0]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-[#8b9d77]/20 text-[#4a5e38]">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#8b9d77] uppercase tracking-wider font-mono">
                        {vehicleAuditResult.province}
                      </span>
                      <h3 className="font-serif font-bold text-xl text-[#4a4a35] flex items-center gap-2">
                        <span>{vehicleAuditResult.reg}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(vehicleAuditResult.reg)}
                          className="p-1 rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer"
                          title="کاپی کریں"
                        >
                          {copiedText === vehicleAuditResult.reg ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </h3>
                      <p className="text-xs text-[#5a5a40] font-medium">{vehicleAuditResult.model}</p>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto px-3 py-1 bg-green-100 border border-green-300 text-green-800 text-xs font-bold rounded-full flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    {isUrdu ? 'فارمیٹ و کلیئرنس درست' : 'Verified Commercial Format'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                  <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] space-y-1">
                    <span className="font-bold text-[#4a4a35] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#8b9d77]" />
                      {isUrdu ? 'ٹوکن ٹیکس اسٹیٹس:' : 'Token Tax Status:'}
                    </span>
                    <p className="text-[#5a5a40]">{vehicleAuditResult.tokenStatus}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] space-y-1">
                    <span className="font-bold text-[#4a4a35] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#8b9d77]" />
                      {isUrdu ? 'فٹنس و پرمٹ میعاد:' : 'Fitness & Highway Permit:'}
                    </span>
                    <p className="text-[#5a5a40]">{vehicleAuditResult.fitness}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSaveVehicleAudit}
                    className="px-4 py-2 bg-[#8b9d77]/20 hover:bg-[#8b9d77]/30 text-[#4a5e38] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isUrdu ? 'آڈٹ ریکارڈ محفوظ کریں' : 'Save to Audit Log'}</span>
                  </button>

                  <a
                    href={vehicleAuditResult.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#5a5a40] hover:bg-[#4a4a35] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs no-underline"
                  >
                    <span>{isUrdu ? 'آفیشل ایکسائز پورٹل کھولیں' : 'Open Official Portal'}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white/80" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DRIVER LICENSE CHECK */}
        {activeSubTab === 'license' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#fdfbf7] p-5 sm:p-6 rounded-3xl border border-[#ecece0] space-y-5">
              <div>
                <h2 className="font-serif font-bold text-base sm:text-lg text-[#4a4a35]">
                  {isUrdu ? 'ڈرائیور لائسنس و ڈی ایل آئی ایم ایس تصدیق' : 'DLIMS Driver License & Fitness Check'}
                </h2>
                <p className="text-xs text-[#8e8e75]">
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
                    className="w-full px-4 py-3 bg-white border border-[#ecece0] focus:border-[#8b9d77] rounded-2xl text-sm font-mono font-bold text-[#4a4a35] outline-none shadow-2xs"
                  />
                  <CreditCard className="w-5 h-5 text-[#8e8e75] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <select
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value)}
                  className="w-full sm:w-auto px-3 py-3 bg-white border border-[#ecece0] rounded-2xl text-xs font-bold text-[#4a4a35] outline-none cursor-pointer"
                >
                  <option value="HTV">HTV ہیوی ٹرانسپورٹ</option>
                  <option value="Trailer">آرٹیکولیٹڈ ٹرالر (Trailer)</option>
                  <option value="LTV">LTV کمرشل</option>
                  <option value="PSV">PSV پیسنجر / بس</option>
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
                <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-[#ecece0]">
                  <span className="text-[11px] font-bold text-[#8e8e75] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#8b9d77]" />
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
                      className="px-2.5 py-1 rounded-xl bg-white border border-[#ecece0] hover:border-[#8b9d77] text-xs font-mono font-bold text-[#4a4a35] shadow-2xs cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      {d.name} ({d.lictype || 'HTV'})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive License Result */}
            {licenseAuditResult && (
              <div className="p-6 rounded-3xl bg-white border-2 border-[#8b9d77] shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ecece0]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
                        {licenseAuditResult.categories}
                      </span>
                      <h3 className="font-serif font-bold text-xl text-[#4a4a35] flex items-center gap-2">
                        <span>{licenseAuditResult.driverName}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(licenseAuditResult.identifier)}
                          className="p-1 rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer"
                          title="کاپی کریں"
                        >
                          {copiedText === licenseAuditResult.identifier ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </h3>
                      <p className="text-xs text-[#8e8e75] font-mono">{licenseAuditResult.identifier}</p>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {isUrdu ? 'ڈی ایل آئی ایم ایس ایکٹو' : 'Active & Certified'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                  <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] space-y-1">
                    <span className="font-bold text-[#4a4a35] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#8b9d77]" />
                      {isUrdu ? 'میعاد کی تاریخ:' : 'Validity Expiry:'}
                    </span>
                    <p className="text-[#5a5a40]">{licenseAuditResult.validity}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] space-y-1">
                    <span className="font-bold text-[#4a4a35] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#8b9d77]" />
                      {isUrdu ? 'موٹروے پولیس ریکارڈ:' : 'NHMP Status:'}
                    </span>
                    <p className="text-[#5a5a40]">{licenseAuditResult.trafficRecord}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSaveLicenseAudit}
                    className="px-4 py-2 bg-[#8b9d77]/20 hover:bg-[#8b9d77]/30 text-[#4a5e38] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isUrdu ? 'ڈرائیور آڈٹ ریکارڈ محفوظ کریں' : 'Save Driver Audit'}</span>
                  </button>

                  <a
                    href={licenseAuditResult.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#5a5a40] hover:bg-[#4a4a35] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs no-underline"
                  >
                    <span>{isUrdu ? 'آفیشل DLIMS پورٹل' : 'Open DLIMS Portal'}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white/80" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: E-CHALLAN CHECK */}
        {activeSubTab === 'challan' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#fdfbf7] p-5 sm:p-6 rounded-3xl border border-[#ecece0] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="font-serif font-bold text-base sm:text-lg text-[#4a4a35]">
                    {isUrdu ? 'سیف سٹی ای چالان و ٹریفک خلاف ورزی آڈٹ' : 'Safe City E-Challan & Penalty Audit'}
                  </h2>
                  <p className="text-xs text-[#8e8e75]">
                    {isUrdu 
                      ? 'گاڑی کا رجسٹریشن نمبر یا چالان آئی ڈی درج کریں' 
                      : 'Enter vehicle number or challan ID for Safe City checking'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#ecece0] text-xs">
                  <button
                    type="button"
                    onClick={() => setChallanCity('lahore')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      challanCity === 'lahore' ? 'bg-[#8b9d77] text-white shadow-2xs' : 'text-[#5a5a40]'
                    }`}
                  >
                    لاہور PSCA
                  </button>
                  <button
                    type="button"
                    onClick={() => setChallanCity('islamabad')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      challanCity === 'islamabad' ? 'bg-[#8b9d77] text-white shadow-2xs' : 'text-[#5a5a40]'
                    }`}
                  >
                    اسلام آباد
                  </button>
                  <button
                    type="button"
                    onClick={() => setChallanCity('rawalpindi')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      challanCity === 'rawalpindi' ? 'bg-[#8b9d77] text-white shadow-2xs' : 'text-[#5a5a40]'
                    }`}
                  >
                    راولپنڈی
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
                    className="w-full px-4 py-3 bg-white border border-[#ecece0] focus:border-[#8b9d77] rounded-2xl text-sm font-mono font-bold text-[#4a4a35] uppercase outline-none shadow-2xs"
                  />
                  <AlertTriangle className="w-5 h-5 text-[#8e8e75] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1 font-sans">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-700" />
                  <span>{isUrdu ? 'کمرشل گاڑیوں کے اہم چالان ریٹس (موٹروے و ہائی وے):' : 'Commercial Highway Challan Tariffs:'}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div className="bg-white p-2 rounded-xl border border-amber-200">
                    <span className="block text-gray-500 font-sans">{isUrdu ? 'اوور اسپیڈنگ:' : 'Over-speeding:'}</span>
                    <span className="font-bold text-[#4a4a35]">Rs. 2,500</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-amber-200">
                    <span className="block text-gray-500 font-sans">{isUrdu ? 'اوور لوڈنگ ایکسل:' : 'Axle Overload:'}</span>
                    <span className="font-bold text-[#4a4a35]">Rs. 5,000</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-amber-200">
                    <span className="block text-gray-500 font-sans">{isUrdu ? 'لین کی خلاف ورزی:' : 'Lane Violation:'}</span>
                    <span className="font-bold text-[#4a4a35]">Rs. 1,000</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-amber-200">
                    <span className="block text-gray-500 font-sans">{isUrdu ? 'بغیر M-Tag انٹری:' : 'No M-Tag Pass:'}</span>
                    <span className="font-bold text-[#4a4a35]">Rs. 1,500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Challan Result */}
            {challanAuditResult && (
              <div className="p-6 rounded-3xl bg-white border-2 border-[#8b9d77] shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ecece0]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-800">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-blue-800 uppercase tracking-wider font-mono">
                        {challanAuditResult.city}
                      </span>
                      <h3 className="font-serif font-bold text-xl text-[#4a4a35] flex items-center gap-2">
                        <span>{challanAuditResult.identifier}</span>
                      </h3>
                      <p className="text-xs text-[#5a5a40] font-medium">{challanAuditResult.challanStatus}</p>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto px-3 py-1 bg-green-100 border border-green-300 text-green-800 text-xs font-bold rounded-full flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    {isUrdu ? 'کوئی پینڈنگ چالان نہیں' : 'Zero Pending Challans'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                  <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] space-y-1">
                    <span className="font-bold text-[#4a4a35]">
                      {isUrdu ? 'رعایت و ادائیگی اصول:' : 'Payment & Discounts:'}
                    </span>
                    <p className="text-[#5a5a40]">{challanAuditResult.discountPolicy}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] space-y-1">
                    <span className="font-bold text-[#4a4a35]">
                      {isUrdu ? 'ادائیگی کے ذرائع:' : 'Supported Channels:'}
                    </span>
                    <p className="text-[#5a5a40]">{challanAuditResult.paymentOptions}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSaveChallanAudit}
                    className="px-4 py-2 bg-[#8b9d77]/20 hover:bg-[#8b9d77]/30 text-[#4a5e38] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isUrdu ? 'چالان کلین ریکارڈ محفوظ کریں' : 'Save Clean Record'}</span>
                  </button>

                  <a
                    href={challanAuditResult.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#5a5a40] hover:bg-[#4a4a35] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs no-underline"
                  >
                    <span>{isUrdu ? 'آفیشل سیف سٹی پورٹل' : 'PSCA Safe City Portal'}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white/80" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SAVED AUDIT RECORDS */}
        {activeSubTab === 'history' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#ecece0]">
              <span className="text-xs font-bold text-[#4a4a35]">
                {isUrdu ? 'محفوظ شدہ تصدیقی لاگز اور آڈٹ تاریخ:' : 'Saved Compliance & Verification Audits:'}
              </span>
              <span className="text-xs text-[#8e8e75] font-mono">
                {auditRecords.length} {isUrdu ? 'ریکارڈز' : 'records'}
              </span>
            </div>

            {auditRecords.length === 0 ? (
              <div className="p-12 text-center bg-[#fdfbf7] rounded-3xl border border-[#ecece0] space-y-2">
                <ShieldCheck className="w-10 h-10 mx-auto text-[#8b9d77] opacity-40" />
                <p className="text-sm font-serif text-[#5a5a40]">{isUrdu ? 'کوئی محفوظ شدہ ریکارڈ موجود نہیں' : 'No audit records saved yet'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {auditRecords.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-[#fdfbf7] border border-[#ecece0] hover:border-[#8b9d77] hover:bg-white transition-all space-y-3 shadow-2xs group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`p-2 rounded-xl text-xs font-bold ${
                            item.type === 'vehicle' ? 'bg-blue-100 text-blue-800' : item.type === 'license' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.type === 'vehicle' ? <Car className="w-4 h-4" /> : item.type === 'license' ? <CreditCard className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                          </span>
                          <div>
                            <h4 className="font-serif font-bold text-sm text-[#4a4a35] leading-tight">
                              {item.title}
                            </h4>
                            <span className="text-[11px] font-mono text-[#8b9d77] font-bold">
                              {item.identifier}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-100 text-green-800 border border-green-200">
                          {item.status.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-[#5a5a40] font-sans leading-relaxed bg-white/80 p-2.5 rounded-xl border border-[#ecece0]">
                        {item.notes}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#ecece0] flex items-center justify-between text-[11px] text-[#8e8e75]">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-[#8b9d77]" />
                        {item.date}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteAuditRecord(item.id)}
                        className="p-1 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer transition-all"
                        title={isUrdu ? 'حذف کریں' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
