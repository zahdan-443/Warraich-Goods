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
  Compass,
  MapPin,
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
  TollCalculationResult,
  MOTORWAYS_DIRECTORY,
  MotorwayDirectoryItem
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
  const isUrdu = lang === 'ur';

  // Mode: 'route' (Calculator) or 'motorways' (All Motorways Directory)
  const [activeTab, setActiveTab] = useState<'route' | 'motorways'>('route');
  
  // Route view states
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

  // Motorway Directory states
  const [selectedMwCode, setSelectedMwCode] = useState<string>('M2');
  const [mwVehicleClass, setMwVehicleClass] = useState<TollVehicleClass>('truck');
  const [mwHasMtag, setMwHasMtag] = useState<boolean>(true);
  const [mwCopied, setMwCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadRates();
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
      setSyncStatusMsg(isUrdu ? '2026 این ایچ اے ریٹ سنک ہو گئے' : '2026 NHA Rates Synced');
      setTimeout(() => setSyncStatusMsg(null), 3000);
    } catch {
      setSyncStatusMsg(isUrdu ? 'آف لائن کیش استعمال ہو رہا ہے' : 'Using offline cache');
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
    const fromName = CITIES_LIST.find(c => c.id === fromCity)?.[isUrdu ? 'nameUr' : 'nameEn'] || fromCity;
    const toName = CITIES_LIST.find(c => c.id === toCity)?.[isUrdu ? 'nameUr' : 'nameEn'] || toCity;
    const vName = VEHICLE_CLASSES.find(v => v.id === vehicleClass)?.[isUrdu ? 'nameUr' : 'nameEn'] || vehicleClass;
    
    let text = `🛣️ *Driver Dost - NHA Motorway & Highway Toll (2026)*\n`;
    text += `📍 روٹ: ${fromName} ➔ ${toName}\n`;
    text += `🚚 گاڑی کیٹیگری: ${vName}\n`;
    text += `💳 ایم ٹیگ: ${hasMtag ? 'فعال (M-Tag لاگو)' : 'غیر فعال (+50% کیش جرمانہ)'}\n`;
    text += `💰 بنیادی ٹول: Rs. ${result.baseToll.toLocaleString()}\n`;
    if (!hasMtag && result.surcharge > 0) {
      text += `⚠️ بغیر ایم ٹیگ کیش اضافی: Rs. ${result.surcharge.toLocaleString()}\n`;
    }
    text += `✅ *کل قابلِ ادا ٹول: Rs. ${result.total.toLocaleString()}*\n`;
    if (result.segments.length > 0) {
      text += `\n📌 موٹروے و شاہراہ وائز تفصیلات:\n`;
      result.segments.forEach(s => {
        text += ` • ${isUrdu ? s.nameUr : s.nameEn}: Rs. ${s.toll.toLocaleString()}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!result) return;
    const fromName = CITIES_LIST.find(c => c.id === fromCity)?.[isUrdu ? 'nameUr' : 'nameEn'] || fromCity;
    const toName = CITIES_LIST.find(c => c.id === toCity)?.[isUrdu ? 'nameUr' : 'nameEn'] || toCity;
    const vName = VEHICLE_CLASSES.find(v => v.id === vehicleClass)?.[isUrdu ? 'nameUr' : 'nameEn'] || vehicleClass;
    
    let text = `🛣️ *Driver Dost - NHA Motorway & Highway Toll (2026)*\n`;
    text += `📍 روٹ: ${fromName} ➔ ${toName}\n`;
    text += `🚚 گاڑی کیٹیگری: ${vName}\n`;
    text += `💳 ایم ٹیگ: ${hasMtag ? 'فعال (M-Tag لاگو)' : 'غیر فعال (+50% کیش جرمانہ)'}\n`;
    text += `💰 بنیادی ٹول: Rs. ${result.baseToll.toLocaleString()}\n`;
    if (!hasMtag && result.surcharge > 0) {
      text += `⚠️ بغیر ایم ٹیگ کیش اضافی: Rs. ${result.surcharge.toLocaleString()}\n`;
    }
    text += `✅ *کل قابلِ ادا ٹول: Rs. ${result.total.toLocaleString()}*\n`;
    if (result.segments.length > 0) {
      text += `\n📌 موٹروے تفصیلات:\n`;
      result.segments.forEach(s => {
        text += ` • ${isUrdu ? s.nameUr : s.nameEn}: Rs. ${s.toll.toLocaleString()}\n`;
      });
    }

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Motorways Directory calculation
  const currentMw = MOTORWAYS_DIRECTORY.find(m => m.code === selectedMwCode) || MOTORWAYS_DIRECTORY[0];
  const mwBaseRate = currentMw.rates[mwVehicleClass] || 0;
  const mwSurcharge = (mwHasMtag || mwVehicleClass === 'bike') ? 0 : Math.round(mwBaseRate * 0.5);
  const mwTotal = mwBaseRate + mwSurcharge;

  const handleCopyMw = () => {
    const vName = VEHICLE_CLASSES.find(v => v.id === mwVehicleClass)?.[isUrdu ? 'nameUr' : 'nameEn'] || mwVehicleClass;
    let text = `🛣️ *Driver Dost - ${isUrdu ? currentMw.nameUr : currentMw.nameEn} (2026 NHA Rates)*\n`;
    text += `📍 روٹ: ${isUrdu ? currentMw.routeUr : currentMw.routeEn} (${currentMw.totalKm} km)\n`;
    text += `🚚 گاڑی: ${vName}\n`;
    text += `💳 M-Tag ریٹ: Rs. ${mwBaseRate.toLocaleString()}\n`;
    if (!mwHasMtag && mwSurcharge > 0) {
      text += `⚠️ بغیر ایم ٹیگ کیش ریٹ (+50%): Rs. ${mwTotal.toLocaleString()}\n`;
    }
    text += `📌 اہم انٹرچینجز: ${isUrdu ? currentMw.interchangesUr.join(', ') : currentMw.interchanges.join(', ')}\n`;

    navigator.clipboard.writeText(text);
    setMwCopied(true);
    setTimeout(() => setMwCopied(false), 2000);
  };

  const handleShareMwWhatsApp = () => {
    const vName = VEHICLE_CLASSES.find(v => v.id === mwVehicleClass)?.[isUrdu ? 'nameUr' : 'nameEn'] || mwVehicleClass;
    let text = `🛣️ *Driver Dost - ${isUrdu ? currentMw.nameUr : currentMw.nameEn} (2026 NHA Rates)*\n`;
    text += `📍 روٹ: ${isUrdu ? currentMw.routeUr : currentMw.routeEn} (${currentMw.totalKm} km)\n`;
    text += `🚚 گاڑی: ${vName}\n`;
    text += `💳 M-Tag ریٹ: Rs. ${mwBaseRate.toLocaleString()}\n`;
    if (!mwHasMtag && mwSurcharge > 0) {
      text += `⚠️ بغیر ایم ٹیگ کیش ریٹ (+50%): Rs. ${mwTotal.toLocaleString()}\n`;
    }
    text += `📌 اہم انٹرچینجز: ${isUrdu ? currentMw.interchangesUr.join(', ') : currentMw.interchanges.join(', ')}\n`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200" dir={isUrdu ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-[32px] sm:rounded-[36px] max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-[#ecece0] max-h-[92vh] overflow-y-auto space-y-5 relative">
        
        {/* Main Header */}
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
                  {isUrdu ? 'این ایچ اے 2026 موٹروے و شاہراہ ٹول ریٹس' : 'NHA 2026 Motorway & Highway Tariffs'}
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
                  <span>{isSyncing ? (isUrdu ? 'سنک ہو رہا ہے...' : 'Syncing...') : (isUrdu ? 'ریٹس ریفریش' : 'Sync')}</span>
                </button>
              </div>

              {syncStatusMsg && (
                <p className="text-[11px] font-bold text-emerald-700 animate-in fade-in">
                  ✓ {syncStatusMsg}
                </p>
              )}
              
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#4a4a35]">
                {isUrdu ? 'پاکستان موٹروے و شاہراہ ٹول ٹیکس کیلکولیٹر' : t.tollCalc.title}
              </h2>
              <p className="text-[#8e8e75] text-xs">
                {isUrdu 
                  ? 'تمام موٹرویز (M-1 تا M-16) اور قومی شاہراہوں کا این ایچ اے مصدقہ ٹول ٹیکس' 
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

        {/* TAB SWITCHER: Route Calculator vs All Motorways Directory */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#f0f0e4] rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('route');
              setViewState('input');
            }}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'route'
                ? 'bg-white text-[#4a4a35] shadow-xs'
                : 'text-[#6b6b55] hover:text-[#383827]'
            }`}
          >
            <RouteIcon className="w-4 h-4 text-[#8b9d77]" />
            <span>{isUrdu ? '📍 روٹ و کوریڈور کیلکولیٹر' : 'Route Calculator'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('motorways')}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'motorways'
                ? 'bg-white text-[#4a4a35] shadow-xs'
                : 'text-[#6b6b55] hover:text-[#383827]'
            }`}
          >
            <Milestone className="w-4 h-4 text-[#8b9d77]" />
            <span>{isUrdu ? '🛣️ تمام موٹرویز کے ریٹس (M-1 تا M-16)' : 'Motorways Directory'}</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ROUTE CALCULATOR VIEW                             */}
        {/* ======================================================== */}
        {activeTab === 'route' && (
          <>
            {/* VIEW 1: INPUT PAGE */}
            {viewState === 'input' && (
              <div className="space-y-4 animate-in fade-in">
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
                            {isUrdu ? `${c.nameUr} (${c.nameEn}) - [${c.province}]` : `${c.nameEn} (${c.nameUr}) - [${c.province}]`}
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
                        title={isUrdu ? 'روٹ تبدیل کریں' : 'Swap Origin & Destination'}
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
                            {isUrdu ? `${c.nameUr} (${c.nameEn}) - [${c.province}]` : `${c.nameEn} (${c.nameUr}) - [${c.province}]`}
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
                            {isUrdu ? `[${v.nhaCode}] ${v.nameUr} - ${v.nameEn}` : `[${v.nhaCode}] ${v.nameEn} (${v.nameUr})`}
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
                            {vehicleClass === 'bike' ? (isUrdu ? 'موٹر سائیکل (ایم ٹیگ لازمی نہیں)' : 'Motorcycle (M-Tag Exempt)') : (isUrdu ? 'ایم ٹیگ فعال ہے (M-Tag Active)' : t.tollCalc.activeMtag)}
                          </span>
                          <span className="text-[10px] text-[#8e8e75] block leading-tight mt-0.5">
                            {vehicleClass === 'bike' ? (isUrdu ? 'قومی شاہراہوں کے مخصوص پلوں پر کیش ٹول' : 'Bridge tokens on designated national highways') : (isUrdu ? 'بغیر ایم ٹیگ کے موٹروے پر 50% اضافی کیش سرچارج لاگو ہوگا' : t.tollCalc.mtagSub)}
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
                        <strong>{isUrdu ? 'خرابی:' : 'Notice:'}</strong> {t.tollCalc.sameCityError}
                      </div>
                    </div>
                  )}

                  {/* Get Toll Estimate Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={computeAndShowResult}
                      disabled={fromCity === toCity}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#162a4d] to-[#1e3a68] hover:from-[#12223e] hover:to-[#162a4d] text-white font-serif font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Calculator className="w-4 h-4 text-amber-300" />
                      <span>{isUrdu ? 'موٹروے و شاہراہ ٹول ٹیکس کا تخمینہ لگائیں' : 'Get Toll Estimate & Route Breakdown'}</span>
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* VIEW 2: ESTIMATE RESULT PAGE */}
            {viewState === 'result' && result && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Top Bar with Back Button & Close */}
                <header className="flex justify-between items-center border-b border-[#ecece0] pb-3">
                  <button
                    type="button"
                    onClick={() => setViewState('input')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f0f0e4] hover:bg-[#8b9d77] hover:text-white text-[#4a4a35] text-xs font-bold font-serif transition-all cursor-pointer active:scale-95"
                  >
                    <ArrowLeft className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
                    <span>{isUrdu ? 'نیا روٹ یا گاڑی تبدیل کریں' : 'Edit Route & Vehicle'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-serif font-bold text-[#8b9d77]">
                      {isUrdu ? 'مصدقہ این ایچ اے تخمینہ' : 'Verified NHA Estimate'}
                    </span>
                  </div>
                </header>

                {/* Route Corridor Title Card */}
                <div className="bg-[#fdfbf7] p-3.5 rounded-2xl border border-[#ecece0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-[#8e8e75] tracking-wider block">
                      {isUrdu ? 'منتخب شدہ موٹروے و شاہراہ کوریڈور' : 'Selected Corridor'}
                    </span>
                    <h3 className="font-serif font-bold text-base text-[#4a4a35] truncate">
                      {isUrdu ? result.routeNameUr : result.routeNameEn}
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
                      {vehicleClass === 'bike' ? 'Exempt' : (hasMtag ? (isUrdu ? 'ایم ٹیگ لاگو' : 'M-Tag Active') : (isUrdu ? 'بغیر ایم ٹیگ (+50%)' : 'Non-M-Tag (+50%)'))}
                    </span>
                  </div>
                </div>

                {/* Price Calculations Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  
                  {/* Base Toll */}
                  <div className="p-3 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] text-center">
                    <span className="text-[10px] text-[#8e8e75] uppercase font-semibold block mb-0.5">
                      {isUrdu ? 'بنیادی ایم ٹیگ ٹول' : t.tollCalc.baseToll}
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
                      {isUrdu ? 'بغیر ایم ٹیگ کیش جرمانہ' : t.tollCalc.surcharge}
                    </span>
                    <div className="font-serif font-bold text-base sm:text-lg">
                      {!hasMtag && vehicleClass !== 'bike' ? `+ Rs. ${result.surcharge.toLocaleString()}` : 'Rs. 0'}
                    </div>
                  </div>

                  {/* Total Payable Amount */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-[#162a4d] to-[#1e3a68] text-white text-center shadow-md sm:col-span-1">
                    <span className="text-[10px] text-amber-200 uppercase tracking-wider font-bold block mb-0.5">
                      {isUrdu ? 'کل قابلِ ادا رقم' : t.tollCalc.totalToll}
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
                      {isUrdu ? 'موٹروے و شاہراہ وائز تفصیلی بریک ڈاؤن (Segments)' : 'Motorway & Highway Segments Breakdown'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {result.segments.map((seg, idx) => (
                        <div 
                          key={idx} 
                          className="p-2.5 bg-[#fdfbf7] rounded-2xl border border-[#ecece0] flex items-center justify-between gap-2 text-xs shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-8 h-8 rounded-xl bg-[#162a4d] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                              {seg.code}
                            </span>
                            <div className="truncate">
                              <div className="font-serif font-bold text-[#4a4a35] truncate text-[11px] sm:text-xs">
                                {isUrdu ? seg.nameUr : seg.nameEn}
                              </div>
                              {seg.km && (
                                <span className="text-[10px] text-[#8e8e75] font-mono">{seg.km} km</span>
                              )}
                            </div>
                          </div>
                          <span className="font-mono font-bold text-[#162a4d] shrink-0 text-xs">
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
                        <span>{isUrdu ? 'حساب میں ٹول شامل کریں' : t.tollCalc.applyToTrip}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-3 py-2 rounded-xl bg-white border border-[#ecece0] hover:bg-[#f9f9f2] text-[#4a4a35] text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#8b9d77]" />}
                      <span>{copied ? (isUrdu ? 'کاپی ہو گیا' : 'Copied') : (isUrdu ? 'کاپی کریں' : 'Copy')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="px-3 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'واٹس ایپ پر بھیجیں' : 'WhatsApp'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewState('input')}
                    className="px-3.5 py-2 rounded-xl bg-[#f0f0e4] hover:bg-[#5a5a40] hover:text-white text-[#4a4a35] text-xs font-bold font-serif transition-all cursor-pointer"
                  >
                    {isUrdu ? 'نئی کیلکولیشن' : 'New Estimate'}
                  </button>

                </div>

              </div>
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ALL MOTORWAYS DIRECTORY VIEW                      */}
        {/* ======================================================== */}
        {activeTab === 'motorways' && (
          <div className="space-y-4 animate-in fade-in">
            
            {/* Motorway Selector Pills */}
            <div>
              <label className="block text-xs font-bold text-[#4a4a35] mb-2">
                {isUrdu ? 'موٹروے یا قومی شاہراہ منتخب کریں:' : 'Select Motorway or Highway:'}
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-[#fdfbf7] rounded-2xl border border-[#ecece0]">
                {MOTORWAYS_DIRECTORY.map((mw) => (
                  <button
                    key={mw.code}
                    type="button"
                    onClick={() => setSelectedMwCode(mw.code)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      selectedMwCode === mw.code
                        ? 'bg-[#162a4d] text-white shadow-xs scale-102'
                        : 'bg-white text-[#5a5a40] border border-[#ecece0] hover:bg-[#f0f0e4]'
                    }`}
                  >
                    {mw.code} - {isUrdu ? mw.nameUr : mw.nameEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Class & M-Tag Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#fdfbf7] p-3.5 rounded-2xl border border-[#ecece0]">
              <div>
                <label className="block text-xs font-bold text-[#4a4a35] mb-1">
                  {isUrdu ? 'گاڑی کی کیٹیگری منتخب کریں:' : 'Vehicle Category:'}
                </label>
                <select
                  value={mwVehicleClass}
                  onChange={(e) => setMwVehicleClass(e.target.value as TollVehicleClass)}
                  className="w-full bg-white border border-[#ecece0] rounded-xl px-3 py-2 text-xs font-bold text-[#4a4a35] focus:outline-none focus:border-[#8b9d77]"
                >
                  {VEHICLE_CLASSES.map(v => (
                    <option key={v.id} value={v.id}>
                      {isUrdu ? `[${v.nhaCode}] ${v.nameUr}` : `[${v.nhaCode}] ${v.nameEn}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-[#ecece0] cursor-pointer w-full select-none">
                  <input
                    type="checkbox"
                    checked={mwHasMtag}
                    onChange={(e) => setMwHasMtag(e.target.checked)}
                    disabled={mwVehicleClass === 'bike'}
                    className="w-4 h-4 text-[#8b9d77] rounded"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#4a4a35] block">
                      {isUrdu ? 'ایم ٹیگ موجود ہے (M-Tag Rate)' : 'M-Tag Rate (No surcharge)'}
                    </span>
                    <span className="text-[10px] text-[#8e8e75]">
                      {isUrdu ? 'بغیر ایم ٹیگ 50% کیش لاگو ہوگا' : 'Unchecked adds +50% Cash penalty'}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Detailed Motorway Card */}
            <div className="bg-gradient-to-br from-[#162a4d] to-[#1e3a68] text-white p-4 sm:p-5 rounded-3xl shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/15 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-amber-400 text-[#162a4d] font-black rounded-lg text-xs">
                      {currentMw.code}
                    </span>
                    <h3 className="font-bold text-base sm:text-lg text-white">
                      {isUrdu ? currentMw.nameUr : currentMw.nameEn}
                    </h3>
                  </div>
                  <p className="text-xs text-white/80 mt-1">
                    📍 {isUrdu ? currentMw.routeUr : currentMw.routeEn}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-mono font-bold">
                    {currentMw.totalKm} km
                  </span>
                </div>
              </div>

              {/* Rates Display */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="bg-white/10 p-2.5 rounded-2xl text-center">
                  <span className="text-[10px] text-white/70 block mb-0.5">
                    {isUrdu ? 'مصدقہ ایم ٹیگ ریٹ' : 'M-Tag Approved Rate'}
                  </span>
                  <div className="text-base sm:text-lg font-mono font-bold text-amber-300">
                    Rs. {mwBaseRate.toLocaleString()}
                  </div>
                </div>

                <div className="bg-white/10 p-2.5 rounded-2xl text-center">
                  <span className="text-[10px] text-white/70 block mb-0.5">
                    {isUrdu ? 'بغیر ایم ٹیگ کیش ریٹ' : 'Cash (Non-M-Tag)'}
                  </span>
                  <div className="text-base sm:text-lg font-mono font-bold text-rose-300">
                    Rs. {mwTotal.toLocaleString()}
                  </div>
                </div>

                <div className="bg-white/20 p-2.5 rounded-2xl text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-white/80 block mb-0.5 font-bold">
                    {isUrdu ? 'کل لاگو ٹول' : 'Payable Toll'}
                  </span>
                  <div className="text-lg sm:text-xl font-mono font-black text-white">
                    PKR {mwTotal.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Interchanges List */}
              <div className="bg-black/20 p-3 rounded-2xl space-y-1.5">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {isUrdu ? 'اہم ٹول پلازے اور انٹرچینجز:' : 'Key Interchanges & Plazas:'}
                </span>
                <p className="text-xs text-white/90 leading-relaxed font-sans">
                  {isUrdu ? currentMw.interchangesUr.join(' • ') : currentMw.interchanges.join(' • ')}
                </p>
              </div>

              {/* Directory Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyMw}
                    className="px-3 py-1.5 rounded-xl bg-white text-[#162a4d] text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    {mwCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#162a4d]" />}
                    <span>{mwCopied ? (isUrdu ? 'کاپی ہو گیا' : 'Copied') : (isUrdu ? 'ریٹ کاپی کریں' : 'Copy Rate')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareMwWhatsApp}
                    className="px-3 py-1.5 rounded-xl bg-[#25D366] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'واٹس ایپ ریٹ' : 'WhatsApp'}</span>
                  </button>
                </div>

                {onApplyToTrip && (
                  <button
                    type="button"
                    onClick={() => {
                      onApplyToTrip(mwTotal, currentMw.code, currentMw.nameEn);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#162a4d] text-xs font-black transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'گاڑی کے حساب میں لگائیں' : 'Apply to Trip'}</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        )}

        {/* Modal Footer */}
        <div className="text-center pt-1 border-t border-[#ecece0]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#f0f0e4] hover:bg-[#5a5a40] hover:text-white text-[#4a4a35] font-serif font-bold text-xs transition-all cursor-pointer"
          >
            {isUrdu ? 'بند کریں' : 'Close Calculator'}
          </button>
        </div>

      </div>
    </div>
  );
};
