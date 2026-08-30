import React, { useState, useEffect } from 'react';
import { PublicImage, tollIconData } from '../assets/dashboardIcons';
import { 
  X, 
  Milestone, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Copy, 
  Check, 
  Share2, 
  Wifi, 
  WifiOff, 
  Navigation, 
  Truck, 
  Info,
  Layers,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Route as RouteIcon,
  Calculator,
  ExternalLink
} from 'lucide-react';
import { Language, TollCity, TollVehicleClass, TollRatesConfig, DICTIONARY } from '../types';
import { 
  CITIES_LIST, 
  VEHICLE_CLASSES, 
  calculateToll, 
  getStoredTollRates, 
  getCachedTollRates,
  syncTollRatesWithNHA,
  TollCalculationResult 
} from '../utils/tollMatrix';

interface TollCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onApplyToTrip?: (tollAmount: number, fromCity: string, toCity: string) => void;
}

export const TollCalculatorModal: React.FC<TollCalculatorModalProps> = ({
  isOpen,
  onClose,
  lang,
  onApplyToTrip
}) => {
  const t = DICTIONARY[lang];
  const [viewState, setViewState] = useState<'input' | 'result'>('input');
  const [fromCity, setFromCity] = useState<TollCity>('Lahore');
  const [toCity, setToCity] = useState<TollCity>('Rawalpindi');
  const [vehicleClass, setVehicleClass] = useState<TollVehicleClass>('truck');
  const [hasMtag, setHasMtag] = useState<boolean>(true);
  const [rates, setRates] = useState<TollRatesConfig>(getCachedTollRates());
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [result, setResult] = useState<TollCalculationResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRates();
      // Keep input screen ready on fresh open
      setViewState('input');
    }
  }, [isOpen]);

  const loadRates = async () => {
    try {
      const fetchedRates = await getStoredTollRates();
      setRates(fetchedRates);
      setIsOnline(navigator.onLine);
    } catch {
      setIsOnline(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const res = await syncTollRatesWithNHA();
      setRates(res.rates);
      setSyncStatusMsg(lang === 'ur' ? '2026 این ایچ اے ریٹ سنک ہو گئے' : '2026 NHA Rates Synced');
      setTimeout(() => setSyncStatusMsg(null), 3000);
    } catch {
      setSyncStatusMsg(lang === 'ur' ? 'آف لائن کیش استعمال ہو رہا ہے' : 'Using offline cache');
      setTimeout(() => setSyncStatusMsg(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const computeAndShowResult = () => {
    if (fromCity === toCity) return;
    const res = calculateToll({
      from: fromCity,
      to: toCity,
      vehicleClass,
      hasMtag,
      rates
    });
    setResult(res);
    setViewState('result');
  };

  const handleSwapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleCopy = () => {
    if (!result) return;
    const fromName = CITIES_LIST.find(c => c.id === fromCity)?.[lang === 'ur' ? 'nameUr' : 'nameEn'] || fromCity;
    const toName = CITIES_LIST.find(c => c.id === toCity)?.[lang === 'ur' ? 'nameUr' : 'nameEn'] || toCity;
    const vName = VEHICLE_CLASSES.find(v => v.id === vehicleClass)?.[lang === 'ur' ? 'nameUr' : 'nameEn'] || vehicleClass;
    
    let text = `🛣️ *Driver Dost - NHA Motorway Toll Estimate (2026)*\n`;
    text += `📍 Route: ${fromName} ➔ ${toName}\n`;
    text += `🚚 Vehicle: ${vName}\n`;
    text += `💳 M-Tag: ${hasMtag ? 'Active (Exempt)' : 'Inactive (+50% Cash Surcharge)'}\n`;
    text += `💰 Base Toll: Rs. ${result.baseToll.toLocaleString()}\n`;
    if (!hasMtag && result.surcharge > 0) {
      text += `⚠️ Non-M-Tag Surcharge: Rs. ${result.surcharge.toLocaleString()}\n`;
    }
    text += `✅ *Total Toll Payable: Rs. ${result.total.toLocaleString()}*\n`;
    if (result.segments.length > 0) {
      text += `\n📌 Segments Breakdown:\n`;
      result.segments.forEach(s => {
        text += ` • ${lang === 'ur' ? s.nameUr : s.nameEn}: Rs. ${s.toll.toLocaleString()}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!result) return;
    const fromName = CITIES_LIST.find(c => c.id === fromCity)?.[lang === 'ur' ? 'nameUr' : 'nameEn'] || fromCity;
    const toName = CITIES_LIST.find(c => c.id === toCity)?.[lang === 'ur' ? 'nameUr' : 'nameEn'] || toCity;
    const vName = VEHICLE_CLASSES.find(v => v.id === vehicleClass)?.[lang === 'ur' ? 'nameUr' : 'nameEn'] || vehicleClass;
    
    let text = `🛣️ *Driver Dost - NHA Motorway Toll Estimate (2026)*\n`;
    text += `📍 Route: ${fromName} ➔ ${toName}\n`;
    text += `🚚 Vehicle: ${vName}\n`;
    text += `💳 M-Tag: ${hasMtag ? 'Active (Exempt)' : 'Inactive (+50% Cash Penalty)'}\n`;
    text += `💰 Base Toll: Rs. ${result.baseToll.toLocaleString()}\n`;
    if (!hasMtag && result.surcharge > 0) {
      text += `⚠️ Non-M-Tag Surcharge: Rs. ${result.surcharge.toLocaleString()}\n`;
    }
    text += `✅ *Total Amount: Rs. ${result.total.toLocaleString()}*\n`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] sm:rounded-[36px] max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-[#ecece0] max-h-[92vh] overflow-y-auto space-y-5 text-left relative">
        
        {/* VIEW 1: INPUT PAGE (Fit-to-one-screen) */}
        {viewState === 'input' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Header */}
            <header className="flex justify-between items-start border-b border-[#ecece0] pb-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-[#ecece0] p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                  <PublicImage
                    fileName={tollIconData}
                    alt="Pakistan Motorway and Highway Toll Tax Rates 2026"
                    width={44}
                    height={44}
                    className="w-full h-full object-cover rounded-xl"
                    fallbackIcon={<Milestone className="w-6 h-6 text-[#8b9d77]" />}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8b9d77]/15 text-[#5a5a40] uppercase tracking-wider">
                      <Milestone className="w-3 h-3 text-[#8b9d77]" />
                      {lang === 'ur' ? 'این ایچ اے 2026 موٹروے ٹول ریٹس' : 'NHA 2026 Motorway Tariffs'}
                    </span>
                    
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      isOnline 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {isOnline ? <Wifi className="w-2.5 h-2.5 text-emerald-600" /> : <WifiOff className="w-2.5 h-2.5 text-amber-600" />}
                      <span>{isOnline ? t.tollCalc.onlineLive : t.tollCalc.offlineCached}</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fdfbf7] hover:bg-[#8b9d77] hover:text-white text-[#5a5a40] border border-[#ecece0] transition-all cursor-pointer active:scale-95 shadow-2xs"
                      title="Sync 2026 NHA Rates"
                    >
                      <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? (lang === 'ur' ? 'سنک ہو رہا ہے...' : 'Syncing...') : (lang === 'ur' ? 'ریٹس ریفریش' : 'Sync')}</span>
                    </button>
                  </div>

                  {syncStatusMsg && (
                    <p className="text-[11px] font-bold text-emerald-700 animate-in fade-in">
                      ✓ {syncStatusMsg}
                    </p>
                  )}
                  
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-[#4a4a35]">
                    {t.tollCalc.title}
                  </h2>
                  <p className="text-[#8e8e75] text-xs">
                    {lang === 'ur' 
                      ? 'تمام موٹرویز (M-1 تا M-16) اور قومی شاہراہوں کا مصدقہ ٹول ٹیکس' 
                      : 'NHA verified toll for all motorways (M-1 to M-16) & national highways'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 bg-[#f0f0e4] hover:bg-[#5a5a40] hover:text-white rounded-full text-[#5a5a40] transition-all cursor-pointer shrink-0"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            {/* Input Controls */}
            <div className="bg-[#fdfbf7] p-4 sm:p-5 rounded-3xl border border-[#ecece0] space-y-4">
              
              {/* Origin & Destination with Swap button */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                
                {/* From City */}
                <div className="sm:col-span-5 space-y-1">
                  <label className="block text-xs font-bold font-serif text-[#4a4a35]">
                    {t.tollCalc.fromCity}
                  </label>
                  <select
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value as TollCity)}
                    className="w-full bg-white border border-[#ecece0] rounded-2xl px-3 py-2 text-xs sm:text-sm font-sans font-medium text-[#4a4a35] focus:outline-none focus:border-[#8b9d77] shadow-2xs"
                  >
                    {CITIES_LIST.map(c => (
                      <option key={`from-${c.id}`} value={c.id}>
                        {lang === 'ur' ? `${c.nameUr} (${c.nameEn}) - [${c.province}]` : `${c.nameEn} (${c.nameUr}) - [${c.province}]`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap Button */}
                <div className="sm:col-span-2 flex justify-center pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={handleSwapCities}
                    className="p-2.5 rounded-full bg-white hover:bg-[#8b9d77] hover:text-white text-[#4a4a35] border border-[#ecece0] hover:border-[#8b9d77] shadow-2xs transition-all active:scale-90"
                    title={lang === 'ur' ? 'روٹ تبدیل کریں' : 'Swap Origin & Destination'}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* To City */}
                <div className="sm:col-span-5 space-y-1">
                  <label className="block text-xs font-bold font-serif text-[#4a4a35]">
                    {t.tollCalc.toCity}
                  </label>
                  <select
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value as TollCity)}
                    className="w-full bg-white border border-[#ecece0] rounded-2xl px-3 py-2 text-xs sm:text-sm font-sans font-medium text-[#4a4a35] focus:outline-none focus:border-[#8b9d77] shadow-2xs"
                  >
                    {CITIES_LIST.map(c => (
                      <option key={`to-${c.id}`} value={c.id}>
                        {lang === 'ur' ? `${c.nameUr} (${c.nameEn}) - [${c.province}]` : `${c.nameEn} (${c.nameUr}) - [${c.province}]`}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Vehicle Class & M-Tag Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                
                {/* Vehicle Class */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold font-serif text-[#4a4a35]">
                    {t.tollCalc.vehicleClass}
                  </label>
                  <select
                    value={vehicleClass}
                    onChange={(e) => setVehicleClass(e.target.value as TollVehicleClass)}
                    className="w-full bg-white border border-[#ecece0] rounded-2xl px-3 py-2 text-xs sm:text-sm font-sans font-medium text-[#4a4a35] focus:outline-none focus:border-[#8b9d77] shadow-2xs"
                  >
                    {VEHICLE_CLASSES.map(v => (
                      <option key={v.id} value={v.id}>
                        {lang === 'ur' ? `[${v.nhaCode}] ${v.nameUr} - ${v.nameEn}` : `[${v.nhaCode}] ${v.nameEn} (${v.nameUr})`}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[#8e8e75] px-1">
                    {VEHICLE_CLASSES.find(v => v.id === vehicleClass)?.descEn}
                  </p>
                </div>

                {/* Active M-Tag Checkbox */}
                <div className="flex items-start">
                  <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-2xl border border-[#ecece0] hover:border-[#8b9d77] transition-all cursor-pointer w-full select-none shadow-2xs">
                    <input
                      type="checkbox"
                      checked={hasMtag}
                      onChange={(e) => setHasMtag(e.target.checked)}
                      disabled={vehicleClass === 'bike'}
                      className="w-4 h-4 mt-0.5 text-[#8b9d77] rounded border-gray-300 focus:ring-[#8b9d77]"
                    />
                    <div>
                      <span className="text-xs font-bold font-serif text-[#4a4a35] block">
                        {vehicleClass === 'bike' ? (lang === 'ur' ? 'موٹر سائیکل (ایم ٹیگ لازمی نہیں)' : 'Motorcycle (M-Tag Exempt)') : t.tollCalc.activeMtag}
                      </span>
                      <span className="text-[10px] text-[#8e8e75] block leading-tight mt-0.5">
                        {vehicleClass === 'bike' ? (lang === 'ur' ? 'قومی شاہراہوں کے مخصوص پلوں پر کیش ٹول' : 'Bridge tokens on designated national highways') : t.tollCalc.mtagSub}
                      </span>
                    </div>
                  </label>
                </div>

              </div>

              {/* Same-city Error Notice */}
              {fromCity === toCity && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-2.5 text-amber-900 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="text-xs font-medium">
                    <strong>{lang === 'ur' ? 'خرابی:' : 'Notice:'}</strong> {t.tollCalc.sameCityError}
                  </div>
                </div>
              )}

              {/* Get Toll Estimate Button (transitions to Result Page) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={computeAndShowResult}
                  disabled={fromCity === toCity}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#162a4d] to-[#1e3a68] hover:from-[#12223e] hover:to-[#162a4d] text-white font-serif font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calculator className="w-4 h-4 text-amber-300" />
                  <span>{lang === 'ur' ? 'ٹول ٹیکس کا تخمینہ لگائیں (Get Toll Estimate)' : 'Get Toll Estimate & Route Breakdown'}</span>
                </button>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-full bg-[#f0f0e4] hover:bg-[#5a5a40] hover:text-white text-[#4a4a35] font-serif font-bold text-xs transition-all cursor-pointer"
              >
                {lang === 'ur' ? 'بند کریں' : 'Close Calculator'}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: ESTIMATE RESULT PAGE (Fit-to-one-screen) */}
        {viewState === 'result' && result && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Top Bar with Back Button & Close */}
            <header className="flex justify-between items-center border-b border-[#ecece0] pb-3">
              <button
                type="button"
                onClick={() => setViewState('input')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f0f0e4] hover:bg-[#8b9d77] hover:text-white text-[#4a4a35] text-xs font-bold font-serif transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'ur' ? 'نیا روٹ تبدیل کریں' : 'Edit Route & Vehicle'}</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-serif font-bold text-[#8b9d77]">
                  {lang === 'ur' ? 'مصدقہ این ایچ اے تخمینہ' : 'Verified NHA Estimate'}
                </span>
                <button
                  onClick={onClose}
                  className="p-1.5 bg-[#f0f0e4] hover:bg-[#5a5a40] hover:text-white rounded-full text-[#5a5a40] transition-all cursor-pointer shrink-0"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Route Corridor Title Card */}
            <div className="bg-[#fdfbf7] p-3.5 rounded-2xl border border-[#ecece0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-[#8e8e75] tracking-wider block">
                  {lang === 'ur' ? 'منتخب شدہ روٹ و کوریڈور' : 'Selected Corridor'}
                </span>
                <h3 className="font-serif font-bold text-base text-[#4a4a35] truncate">
                  {lang === 'ur' ? result.routeNameUr : result.routeNameEn}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {result.totalKm > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-white border border-[#ecece0] text-[11px] font-mono font-bold text-[#5a5a40]">
                    {result.totalKm} km
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  hasMtag 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {vehicleClass === 'bike' ? 'Exempt' : (hasMtag ? 'M-Tag Active' : 'Non-M-Tag (+50%)')}
                </span>
              </div>
            </div>

            {/* Price Calculations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Base Toll */}
              <div className="p-3 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] text-center">
                <span className="text-[10px] text-[#8e8e75] uppercase font-semibold block mb-0.5">
                  {t.tollCalc.baseToll}
                </span>
                <div className="font-serif font-bold text-base sm:text-lg text-[#4a4a35]">
                  Rs. {result.baseToll.toLocaleString()}
                </div>
              </div>

              {/* Surcharge */}
              <div className={`p-3 rounded-2xl border text-center ${
                !hasMtag && vehicleClass !== 'bike'
                  ? 'bg-amber-50 border-amber-200 text-amber-900' 
                  : 'bg-[#fdfbf7] border-[#ecece0] text-[#8e8e75]'
              }`}>
                <span className="text-[10px] uppercase font-semibold block mb-0.5">
                  {t.tollCalc.surcharge}
                </span>
                <div className="font-serif font-bold text-base sm:text-lg">
                  {!hasMtag && vehicleClass !== 'bike' ? `+ Rs. ${result.surcharge.toLocaleString()}` : 'Rs. 0'}
                </div>
              </div>

              {/* Total Payable Amount */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-[#162a4d] to-[#1e3a68] text-white text-center shadow-md sm:col-span-1">
                <span className="text-[10px] text-amber-200 uppercase tracking-wider font-bold block mb-0.5">
                  {t.tollCalc.totalToll}
                </span>
                <div className="font-serif font-bold text-xl sm:text-2xl text-white">
                  PKR {result.total.toLocaleString()}
                </div>
              </div>

            </div>

            {/* Segments & Corridors Breakdown (Motorway-by-Motorway) */}
            {result.segments.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#8e8e75] tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#8b9d77]" />
                  {lang === 'ur' ? 'موٹروے و شاہراہ وائز تفصیلات (Segments)' : 'Motorway & Highway Segments Breakdown'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {result.segments.map((seg, idx) => (
                    <div 
                      key={idx} 
                      className="p-2.5 bg-[#fdfbf7] rounded-2xl border border-[#ecece0] flex items-center justify-between gap-2 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-[#8b9d77]/20 text-[#4a4a35] font-bold text-[10px] flex items-center justify-center shrink-0">
                          {seg.code}
                        </span>
                        <div className="truncate">
                          <div className="font-serif font-bold text-[#4a4a35] truncate text-[11px] sm:text-xs">
                            {lang === 'ur' ? seg.nameUr : seg.nameEn}
                          </div>
                          {seg.km && (
                            <span className="text-[10px] text-[#8e8e75] font-mono">{seg.km} km</span>
                          )}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[#5a5a40] shrink-0 text-xs">
                        Rs. {seg.toll.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons: Apply, Copy, WhatsApp */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#ecece0]">
              
              <div className="flex items-center gap-2 flex-wrap">
                {onApplyToTrip && (
                  <button
                    type="button"
                    onClick={() => {
                      onApplyToTrip(result.total, fromCity, toCity);
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#8b9d77] hover:bg-[#798a67] text-white text-xs font-bold font-serif transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>{t.tollCalc.applyToTrip}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-2 rounded-xl bg-white border border-[#ecece0] hover:bg-[#f9f9f2] text-[#4a4a35] text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#8b9d77]" />}
                  <span>{copied ? (lang === 'ur' ? 'کاپی ہو گیا' : 'Copied') : (lang === 'ur' ? 'کاپی کریں' : 'Copy')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewState('input')}
                className="px-3.5 py-2 rounded-xl bg-[#f0f0e4] hover:bg-[#5a5a40] hover:text-white text-[#4a4a35] text-xs font-bold font-serif transition-all cursor-pointer"
              >
                {lang === 'ur' ? 'نئی کیلکولیشن' : 'New Estimate'}
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

