import React, { useState, useEffect } from 'react';
import { PublicImage, tollIconData } from '../assets/dashboardIcons';
import { 
  X, 
  Milestone, 
  ArrowRightLeft, 
  AlertTriangle, 
  Copy, 
  Check, 
  Share2, 
  Wifi, 
  WifiOff, 
  Layers,
  ArrowRight,
  RefreshCw,
  ArrowLeft,
  Route as RouteIcon,
  Calculator,
  Compass,
  MapPin,
  Car,
  Truck,
  RotateCcw
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
  MOTORWAYS_DIRECTORY
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
  const [fromCity, setFromCity] = useState<TollCity>('Samundri');
  const [toCity, setToCity] = useState<TollCity>('Lahore');
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
      setSyncStatusMsg(isUrdu ? '2026 این ایچ اے ریٹس اپڈیٹ ہو گئے' : '2026 NHA Rates Synced');
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

  const handleQuickSelectCorridor = (from: TollCity, to: TollCity) => {
    setFromCity(from);
    setToCity(to);
  };

  const handleCopy = () => {
    if (!result) return;
    const fromName = CITIES_LIST.find(c => c.id === fromCity)?.[isUrdu ? 'nameUr' : 'nameEn'] || fromCity;
    const toName = CITIES_LIST.find(c => c.id === toCity)?.[isUrdu ? 'nameUr' : 'nameEn'] || toCity;
    const vName = VEHICLE_CLASSES.find(v => v.id === vehicleClass)?.[isUrdu ? 'nameUr' : 'nameEn'] || vehicleClass;
    
    let text = `🛣️ *Driver Dost - NHA Motorway & Highway Toll (2026)*\n`;
    text += `📍 ${isUrdu ? 'روٹ' : 'Route'}: ${fromName} ➔ ${toName}\n`;
    text += `🚚 ${isUrdu ? 'گاڑی کیٹیگری' : 'Vehicle Class'}: ${vName}\n`;
    text += `💳 ${isUrdu ? 'ایم ٹیگ' : 'M-Tag'}: ${hasMtag ? (isUrdu ? 'فعال (M-Tag لاگو)' : 'Active') : (isUrdu ? 'غیر فعال (+50% کیش جرمانہ)' : 'Non-M-Tag (+50% Surcharge)')}\n`;
    text += `💰 ${isUrdu ? 'بنیادی ٹول' : 'Base Toll'}: Rs. ${result.baseToll.toLocaleString()}\n`;
    if (!hasMtag && result.surcharge > 0) {
      text += `⚠️ ${isUrdu ? 'بغیر ایم ٹیگ کیش اضافی' : 'Non-M-Tag Cash Surcharge'}: Rs. ${result.surcharge.toLocaleString()}\n`;
    }
    text += `✅ *${isUrdu ? 'کل قابلِ ادا ٹول' : 'Total Payable Toll'}: Rs. ${result.total.toLocaleString()}*\n`;
    if (result.segments.length > 0) {
      text += `\n📌 ${isUrdu ? 'موٹروے تفصیلات' : 'Segments Breakdown'}:\n`;
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
    text += `📍 ${isUrdu ? 'روٹ' : 'Route'}: ${fromName} ➔ ${toName}\n`;
    text += `🚚 ${isUrdu ? 'گاڑی کیٹیگری' : 'Vehicle Class'}: ${vName}\n`;
    text += `💳 ${isUrdu ? 'ایم ٹیگ' : 'M-Tag'}: ${hasMtag ? (isUrdu ? 'فعال' : 'Active') : (isUrdu ? 'غیر فعال (+50% کیش جرمانہ)' : 'Non-M-Tag (+50%)')}\n`;
    text += `💰 ${isUrdu ? 'بنیادی ٹول' : 'Base Toll'}: Rs. ${result.baseToll.toLocaleString()}\n`;
    if (!hasMtag && result.surcharge > 0) {
      text += `⚠️ ${isUrdu ? 'بغیر ایم ٹیگ کیش اضافی' : 'Non-M-Tag Cash Surcharge'}: Rs. ${result.surcharge.toLocaleString()}\n`;
    }
    text += `✅ *${isUrdu ? 'کل قابلِ ادا ٹول' : 'Total Payable Toll'}: Rs. ${result.total.toLocaleString()}*\n`;
    if (result.segments.length > 0) {
      text += `\n📌 ${isUrdu ? 'موٹروے تفصیلات' : 'Segments'}:\n`;
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
    text += `📍 ${isUrdu ? 'روٹ' : 'Route'}: ${isUrdu ? currentMw.routeUr : currentMw.routeEn} (${currentMw.totalKm} km)\n`;
    text += `🚚 ${isUrdu ? 'گاڑی' : 'Vehicle'}: ${vName}\n`;
    text += `💳 ${isUrdu ? 'M-Tag ریٹ' : 'M-Tag Rate'}: Rs. ${mwBaseRate.toLocaleString()}\n`;
    if (!mwHasMtag && mwSurcharge > 0) {
      text += `⚠️ ${isUrdu ? 'بغیر ایم ٹیگ کیش ریٹ (+50%)' : 'Cash Rate (+50%)'}: Rs. ${mwTotal.toLocaleString()}\n`;
    }
    text += `📌 ${isUrdu ? 'اہم انٹرچینجز' : 'Key Interchanges'}: ${isUrdu ? currentMw.interchangesUr.join(', ') : currentMw.interchanges.join(', ')}\n`;

    navigator.clipboard.writeText(text);
    setMwCopied(true);
    setTimeout(() => setMwCopied(false), 2000);
  };

  const handleShareMwWhatsApp = () => {
    const vName = VEHICLE_CLASSES.find(v => v.id === mwVehicleClass)?.[isUrdu ? 'nameUr' : 'nameEn'] || mwVehicleClass;
    let text = `🛣️ *Driver Dost - ${isUrdu ? currentMw.nameUr : currentMw.nameEn} (2026 NHA Rates)*\n`;
    text += `📍 ${isUrdu ? 'روٹ' : 'Route'}: ${isUrdu ? currentMw.routeUr : currentMw.routeEn} (${currentMw.totalKm} km)\n`;
    text += `🚚 ${isUrdu ? 'گاڑی' : 'Vehicle'}: ${vName}\n`;
    text += `💳 ${isUrdu ? 'M-Tag ریٹ' : 'M-Tag Rate'}: Rs. ${mwBaseRate.toLocaleString()}\n`;
    if (!mwHasMtag && mwSurcharge > 0) {
      text += `⚠️ ${isUrdu ? 'بغیر ایم ٹیگ کیش ریٹ (+50%)' : 'Cash Rate (+50%)'}: Rs. ${mwTotal.toLocaleString()}\n`;
    }
    text += `📌 ${isUrdu ? 'اہم انٹرچینجز' : 'Key Interchanges'}: ${isUrdu ? currentMw.interchangesUr.join(', ') : currentMw.interchanges.join(', ')}\n`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#f6f5ee] text-[#4a4a35] flex flex-col justify-between p-3 sm:p-5 overflow-hidden font-sans select-none"
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* Top Fixed Header */}
      <header className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-[#ecece0] shadow-xs shrink-0 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#ecece0] p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
            <PublicImage
              fileName={tollIconData}
              alt="Pakistan Motorway Toll Tax 2026"
              width={40}
              height={40}
              className="w-full h-full object-cover rounded-lg"
              fallbackIcon={<Milestone className="w-5 h-5 text-[#8b9d77]" />}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8b9d77]/15 text-[#5a5a40]">
                <Milestone className="w-3 h-3 text-[#8b9d77]" />
                {isUrdu ? 'این ایچ اے 2026 ٹول ریٹس' : 'NHA 2026 Toll Tariffs'}
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
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fdfbf7] hover:bg-[#8b9d77] hover:text-white text-[#5a5a40] border border-[#ecece0] transition-all cursor-pointer shadow-2xs"
                title={isUrdu ? 'ریٹس ریفریش کریں' : 'Sync 2026 NHA Rates'}
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? (isUrdu ? 'سنک...' : 'Syncing...') : (isUrdu ? 'ریفریش' : 'Sync')}</span>
              </button>
            </div>

            <h1 className="text-sm sm:text-base font-serif font-bold text-[#4a4a35] mt-0.5">
              {isUrdu ? 'پاکستان موٹروے و شاہراہ ٹول ٹیکس کیلکولیٹر' : t.tollCalc.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {syncStatusMsg && (
            <span className="hidden sm:inline-block text-[11px] font-bold text-emerald-700">
              ✓ {syncStatusMsg}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-[#f0f0e4] hover:bg-[#5a5a40] hover:text-white rounded-xl text-[#5a5a40] transition-all cursor-pointer"
            title={isUrdu ? 'بند کریں' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Single-Screen Content (Unscrollable viewport container) */}
      <main className="flex-1 flex flex-col justify-between overflow-hidden bg-white rounded-2xl sm:rounded-3xl border border-[#ecece0] p-3 sm:p-4 shadow-sm">
        
        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#f0f0e4] rounded-xl shrink-0 mb-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab('route');
              setViewState('input');
            }}
            className={`py-1.5 px-3 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'route'
                ? 'bg-white text-[#4a4a35] shadow-xs'
                : 'text-[#6b6b55] hover:text-[#383827]'
            }`}
          >
            <RouteIcon className="w-3.5 h-3.5 text-[#8b9d77]" />
            <span>{isUrdu ? 'روٹ و کوریڈور کیلکولیٹر' : 'Route Calculator'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('motorways')}
            className={`py-1.5 px-3 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'motorways'
                ? 'bg-white text-[#4a4a35] shadow-xs'
                : 'text-[#6b6b55] hover:text-[#383827]'
            }`}
          >
            <Milestone className="w-3.5 h-3.5 text-[#8b9d77]" />
            <span>{isUrdu ? 'تمام موٹرویز (M-1 تا M-16)' : 'Motorways Directory'}</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ROUTE CALCULATOR (Input Page & Result Page)       */}
        {/* ======================================================== */}
        {activeTab === 'route' && (
          <>
            {/* VIEW 1: INPUT PAGE (100% Fixed & Unscrollable) */}
            {viewState === 'input' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                
                <div className="space-y-3">
                  {/* Origin & Destination with Swap */}
                  <div className="bg-[#fdfbf7] p-3 sm:p-3.5 rounded-2xl border border-[#ecece0] space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-11 gap-2 items-center">
                      
                      {/* From City */}
                      <div className="sm:col-span-5 space-y-1">
                        <label className="block text-xs font-bold font-serif text-[#4a4a35]">
                          {t.tollCalc.fromCity}
                        </label>
                        <select
                          value={fromCity}
                          onChange={(e) => setFromCity(e.target.value as TollCity)}
                          className="w-full bg-white border border-[#ecece0] rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-[#4a4a35] focus:outline-none focus:border-[#8b9d77] shadow-2xs cursor-pointer"
                        >
                          {CITIES_LIST.map(c => (
                            <option key={`from-${c.id}`} value={c.id}>
                              {isUrdu ? `${c.nameUr} (${c.nameEn}) - [${c.province}]` : `${c.nameEn} (${c.nameUr}) - [${c.province}]`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Swap Button */}
                      <div className="sm:col-span-1 flex justify-center py-1 sm:py-0">
                        <button
                          type="button"
                          onClick={handleSwapCities}
                          className="p-2 rounded-xl bg-white hover:bg-[#8b9d77] hover:text-white text-[#4a4a35] border border-[#ecece0] hover:border-[#8b9d77] shadow-2xs transition-all active:scale-90 cursor-pointer"
                          title={isUrdu ? 'روٹ تبدیل کریں' : 'Swap Origin & Destination'}
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
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
                          className="w-full bg-white border border-[#ecece0] rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-[#4a4a35] focus:outline-none focus:border-[#8b9d77] shadow-2xs cursor-pointer"
                        >
                          {CITIES_LIST.map(c => (
                            <option key={`to-${c.id}`} value={c.id}>
                              {isUrdu ? `${c.nameUr} (${c.nameEn}) - [${c.province}]` : `${c.nameEn} (${c.nameUr}) - [${c.province}]`}
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>

                    {/* Quick Corridor Selection Pills */}
                    <div className="pt-1 border-t border-[#ecece0]/80">
                      <span className="text-[10px] font-bold text-[#8e8e75] block mb-1">
                        {isUrdu ? '⚡ اہم روٹ کوریڈورز (فوری انتخاب):' : '⚡ Popular Corridors (Quick Select):'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickSelectCorridor('Lahore', 'Rawalpindi')}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#ecece0] hover:border-[#8b9d77] text-[11px] font-bold text-[#5a5a40] transition-all cursor-pointer shadow-2xs"
                        >
                          {isUrdu ? 'لاہور ➔ راولپنڈی (M-2)' : 'Lahore ➔ Rawalpindi (M-2)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickSelectCorridor('Karachi', 'Sukkur')}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#ecece0] hover:border-[#8b9d77] text-[11px] font-bold text-[#5a5a40] transition-all cursor-pointer shadow-2xs"
                        >
                          {isUrdu ? 'کراچی ➔ سکھر (M-9 + N-5)' : 'Karachi ➔ Sukkur (M-9)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickSelectCorridor('Lahore', 'Multan')}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#ecece0] hover:border-[#8b9d77] text-[11px] font-bold text-[#5a5a40] transition-all cursor-pointer shadow-2xs"
                        >
                          {isUrdu ? 'لاہور ➔ ملتان (M-3)' : 'Lahore ➔ Multan (M-3)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickSelectCorridor('Rawalpindi', 'Peshawar')}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#ecece0] hover:border-[#8b9d77] text-[11px] font-bold text-[#5a5a40] transition-all cursor-pointer shadow-2xs"
                        >
                          {isUrdu ? 'اسلام آباد ➔ پشاور (M-1)' : 'Islamabad ➔ Peshawar (M-1)'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Class & M-Tag Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#fdfbf7] p-3 sm:p-3.5 rounded-2xl border border-[#ecece0]">
                    
                    {/* Vehicle Class */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold font-serif text-[#4a4a35]">
                        {t.tollCalc.vehicleClass}
                      </label>
                      <select
                        value={vehicleClass}
                        onChange={(e) => setVehicleClass(e.target.value as TollVehicleClass)}
                        className="w-full bg-white border border-[#ecece0] rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-[#4a4a35] focus:outline-none focus:border-[#8b9d77] shadow-2xs cursor-pointer"
                      >
                        {VEHICLE_CLASSES.map(v => (
                          <option key={v.id} value={v.id}>
                            {isUrdu ? `[${v.nhaCode}] ${v.nameUr} (${v.nameEn})` : `[${v.nhaCode}] ${v.nameEn} (${v.nameUr})`}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-[#8e8e75] px-1 truncate">
                        {isUrdu 
                          ? VEHICLE_CLASSES.find(v => v.id === vehicleClass)?.descUr 
                          : VEHICLE_CLASSES.find(v => v.id === vehicleClass)?.descEn}
                      </p>
                    </div>

                    {/* M-Tag Active Checkbox */}
                    <div className="flex items-center">
                      <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-[#ecece0] hover:border-[#8b9d77] transition-all cursor-pointer w-full select-none shadow-2xs">
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
                            {vehicleClass === 'bike' ? (isUrdu ? 'صرف مخصوص پلوں پر کیش ٹول لاگو' : 'Designated bridge tokens') : (isUrdu ? 'بغیر ایم ٹیگ کے موٹروے پر 50% اضافی کیش لاگو ہوگا' : t.tollCalc.mtagSub)}
                          </span>
                        </div>
                      </label>
                    </div>

                  </div>

                  {/* Same-city Warning */}
                  {fromCity === toCity && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2 text-amber-900 animate-in fade-in">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="text-xs font-medium">
                        <strong>{isUrdu ? 'خرابی:' : 'Notice:'}</strong> {t.tollCalc.sameCityError}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Bottom Action Panel */}
                <div className="pt-3 border-t border-[#ecece0] flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={computeAndShowResult}
                    disabled={fromCity === toCity}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#162a4d] to-[#1e3a68] hover:from-[#12223e] hover:to-[#162a4d] text-white font-serif font-bold text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Calculator className="w-4 h-4 text-amber-300" />
                    <span>{isUrdu ? 'موٹروے و شاہراہ ٹول ٹیکس کا تخمینہ لگائیں' : 'Get Toll Estimate & Route Breakdown'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-3.5 rounded-xl bg-[#f0f0e4] hover:bg-[#5a5a40] hover:text-white text-[#4a4a35] font-serif font-bold text-xs transition-all cursor-pointer shrink-0"
                  >
                    {isUrdu ? 'بند کریں' : 'Close'}
                  </button>
                </div>

              </div>
            )}

            {/* VIEW 2: ESTIMATE RESULT PAGE (100% Fixed & Unscrollable) */}
            {viewState === 'result' && result && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden animate-in fade-in duration-150">
                
                {/* Result Details Area */}
                <div className="space-y-2.5 overflow-hidden flex-1 flex flex-col">
                  
                  {/* Top Bar with Route & Edit Button */}
                  <div className="flex items-center justify-between bg-[#fdfbf7] p-2.5 rounded-xl border border-[#ecece0] shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewState('input')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#ecece0] hover:bg-[#8b9d77] hover:text-white text-[#4a4a35] text-xs font-bold font-serif transition-all cursor-pointer active:scale-95"
                    >
                      <ArrowLeft className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
                      <span>{isUrdu ? 'نیا روٹ / گاڑی تبدیل کریں' : 'Edit Route'}</span>
                    </button>

                    <div className="flex items-center gap-2 truncate">
                      <span className="font-serif font-bold text-xs sm:text-sm text-[#4a4a35] truncate">
                        {isUrdu ? result.routeNameUr : result.routeNameEn}
                      </span>
                      {result.totalKm > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-white border border-[#ecece0] text-[10px] font-mono font-bold text-[#5a5a40]">
                          {result.totalKm} km
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Primary Total Banner */}
                  <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#162a4d] to-[#1e3a68] text-white shadow-md flex items-center justify-between shrink-0">
                    <div>
                      <span className="text-[10px] sm:text-xs text-amber-200 uppercase tracking-wider font-bold block">
                        {isUrdu ? 'کل قابلِ ادا ٹول رقم' : t.tollCalc.totalToll}
                      </span>
                      <div className="font-serif font-black text-2xl sm:text-3xl text-white">
                        PKR {result.total.toLocaleString()}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                        hasMtag 
                          ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' 
                          : 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                      }`}>
                        {vehicleClass === 'bike' ? (isUrdu ? 'استثنیٰ' : 'Exempt') : (hasMtag ? (isUrdu ? 'ایم ٹیگ لاگو' : 'M-Tag Active') : (isUrdu ? 'بغیر ایم ٹیگ (+50% کیش)' : 'Cash (+50%)'))}
                      </span>
                      <span className="text-[10px] text-white/70 block mt-1 font-mono">
                        {VEHICLE_CLASSES.find(v => v.id === vehicleClass)?.[isUrdu ? 'nameUr' : 'nameEn']}
                      </span>
                    </div>
                  </div>

                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-3 gap-2 shrink-0">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-[#fdfbf7] border border-[#ecece0] text-center">
                      <span className="text-[10px] text-[#8e8e75] uppercase font-bold block">
                        {isUrdu ? 'بنیادی ٹول' : t.tollCalc.baseToll}
                      </span>
                      <div className="font-serif font-bold text-xs sm:text-sm text-[#4a4a35]">
                        Rs. {result.baseToll.toLocaleString()}
                      </div>
                    </div>

                    <div className={`p-2 sm:p-2.5 rounded-xl border text-center ${
                      !hasMtag && vehicleClass !== 'bike'
                        ? 'bg-amber-50 border-amber-200 text-amber-900' 
                        : 'bg-[#fdfbf7] border-[#ecece0] text-[#8e8e75]'
                    }`}>
                      <span className="text-[10px] uppercase font-bold block">
                        {isUrdu ? 'کیش سرچارج' : t.tollCalc.surcharge}
                      </span>
                      <div className="font-serif font-bold text-xs sm:text-sm">
                        {!hasMtag && vehicleClass !== 'bike' ? `+ Rs. ${result.surcharge.toLocaleString()}` : 'Rs. 0'}
                      </div>
                    </div>

                    <div className="p-2 sm:p-2.5 rounded-xl bg-[#8b9d77]/15 border border-[#8b9d77]/30 text-center">
                      <span className="text-[10px] text-[#5a5a40] uppercase font-bold block">
                        {isUrdu ? 'روٹ کے حصے' : 'Segments'}
                      </span>
                      <div className="font-serif font-bold text-xs sm:text-sm text-[#5a5a40]">
                        {result.segments.length} {isUrdu ? 'موٹروے' : 'Sections'}
                      </div>
                    </div>
                  </div>

                  {/* Segments Breakdown (Compact List) */}
                  {result.segments.length > 0 && (
                    <div className="flex-1 flex flex-col overflow-hidden bg-[#fdfbf7] rounded-xl border border-[#ecece0] p-2.5">
                      <span className="text-[10px] uppercase font-bold text-[#8e8e75] tracking-wider flex items-center gap-1 mb-1.5 shrink-0">
                        <Layers className="w-3 h-3 text-[#8b9d77]" />
                        {isUrdu ? 'موٹروے و شاہراہ وائز بریک ڈاؤن:' : 'Motorway & Highway Breakdown:'}
                      </span>
                      
                      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                        {result.segments.map((seg, idx) => (
                          <div 
                            key={idx} 
                            className="p-2 bg-white rounded-lg border border-[#ecece0] flex items-center justify-between gap-2 text-xs shadow-2xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-7 h-7 rounded-lg bg-[#162a4d] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                {seg.code}
                              </span>
                              <div className="truncate">
                                <div className="font-serif font-bold text-[#4a4a35] truncate text-[11px]">
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

                </div>

                {/* Fixed Bottom Action Panel */}
                <div className="pt-2.5 border-t border-[#ecece0] flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {onApplyToTrip && (
                      <button
                        type="button"
                        onClick={() => {
                          onApplyToTrip(result.total, fromCity, toCity);
                          onClose();
                        }}
                        className="px-3 py-2.5 rounded-xl bg-[#8b9d77] hover:bg-[#798a67] text-white text-xs font-bold font-serif transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'حساب میں ٹول شامل کریں' : t.tollCalc.applyToTrip}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-2.5 py-2.5 rounded-xl bg-white border border-[#ecece0] hover:bg-[#f9f9f2] text-[#4a4a35] text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95"
                      title={isUrdu ? 'کاپی کریں' : 'Copy'}
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#8b9d77]" />}
                      <span>{copied ? (isUrdu ? 'کاپی ہو گیا' : 'Copied') : (isUrdu ? 'کاپی' : 'Copy')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="px-2.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                      title={isUrdu ? 'واٹس ایپ پر بھیجیں' : 'Share WhatsApp'}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'واٹس ایپ' : 'WhatsApp'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewState('input')}
                      className="px-3 py-2.5 rounded-xl bg-[#f0f0e4] hover:bg-[#5a5a40] hover:text-white text-[#4a4a35] text-xs font-bold font-serif transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                      <span>{isUrdu ? 'نئی کیلکولیشن' : 'New'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-2.5 rounded-xl bg-[#4a4a35] hover:bg-[#383827] text-white text-xs font-bold font-serif transition-all cursor-pointer"
                    >
                      {isUrdu ? 'بند کریں' : 'Close'}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ALL MOTORWAYS DIRECTORY (Fixed 1-Screen)          */}
        {/* ======================================================== */}
        {activeTab === 'motorways' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden animate-in fade-in">
            
            <div className="space-y-2.5 overflow-hidden flex-1 flex flex-col">
              
              {/* Motorway Selector Pills */}
              <div className="shrink-0">
                <label className="block text-xs font-bold text-[#4a4a35] mb-1">
                  {isUrdu ? 'موٹروے یا قومی شاہراہ منتخب کریں:' : 'Select Motorway or Highway:'}
                </label>
                <div className="flex flex-wrap gap-1 p-1 bg-[#fdfbf7] rounded-xl border border-[#ecece0]">
                  {MOTORWAYS_DIRECTORY.map((mw) => (
                    <button
                      key={mw.code}
                      type="button"
                      onClick={() => setSelectedMwCode(mw.code)}
                      className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                        selectedMwCode === mw.code
                          ? 'bg-[#162a4d] text-white shadow-xs'
                          : 'bg-white text-[#5a5a40] border border-[#ecece0] hover:bg-[#f0f0e4]'
                      }`}
                    >
                      {mw.code} - {isUrdu ? mw.nameUr : mw.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Class & M-Tag Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#fdfbf7] p-2.5 rounded-xl border border-[#ecece0] shrink-0">
                <div>
                  <label className="block text-[11px] font-bold text-[#4a4a35] mb-1">
                    {isUrdu ? 'گاڑی کی کیٹیگری:' : 'Vehicle Category:'}
                  </label>
                  <select
                    value={mwVehicleClass}
                    onChange={(e) => setMwVehicleClass(e.target.value as TollVehicleClass)}
                    className="w-full bg-white border border-[#ecece0] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#4a4a35] focus:outline-none focus:border-[#8b9d77]"
                  >
                    {VEHICLE_CLASSES.map(v => (
                      <option key={v.id} value={v.id}>
                        {isUrdu ? `[${v.nhaCode}] ${v.nameUr}` : `[${v.nhaCode}] ${v.nameEn}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 p-1.5 bg-white rounded-lg border border-[#ecece0] cursor-pointer w-full select-none">
                    <input
                      type="checkbox"
                      checked={mwHasMtag}
                      onChange={(e) => setMwHasMtag(e.target.checked)}
                      disabled={mwVehicleClass === 'bike'}
                      className="w-3.5 h-3.5 text-[#8b9d77] rounded"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-[#4a4a35] block text-[11px]">
                        {isUrdu ? 'ایم ٹیگ ریٹ' : 'M-Tag Rate'}
                      </span>
                      <span className="text-[9px] text-[#8e8e75]">
                        {isUrdu ? 'غیر فعال پر 50% کیش لاگو ہوگا' : '+50% cash penalty if unchecked'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Detailed Motorway Card */}
              <div className="flex-1 flex flex-col justify-between bg-gradient-to-br from-[#162a4d] to-[#1e3a68] text-white p-3 sm:p-4 rounded-2xl shadow-md overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/15 pb-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-400 text-[#162a4d] font-black rounded-md text-xs">
                      {currentMw.code}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      {isUrdu ? currentMw.nameUr : currentMw.nameEn}
                    </h3>
                  </div>

                  <span className="px-2.5 py-0.5 bg-white/15 rounded-full text-xs font-mono font-bold">
                    {currentMw.totalKm} km
                  </span>
                </div>

                {/* Rates Display */}
                <div className="grid grid-cols-3 gap-2 my-2 shrink-0">
                  <div className="bg-white/10 p-2 rounded-xl text-center">
                    <span className="text-[10px] text-white/70 block">
                      {isUrdu ? 'ایم ٹیگ ریٹ' : 'M-Tag Rate'}
                    </span>
                    <div className="text-xs sm:text-sm font-mono font-bold text-amber-300">
                      Rs. {mwBaseRate.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-white/10 p-2 rounded-xl text-center">
                    <span className="text-[10px] text-white/70 block">
                      {isUrdu ? 'بغیر ایم ٹیگ ریٹ' : 'Cash Rate'}
                    </span>
                    <div className="text-xs sm:text-sm font-mono font-bold text-rose-300">
                      Rs. {mwTotal.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-white/20 p-2 rounded-xl text-center">
                    <span className="text-[10px] text-white/80 block font-bold">
                      {isUrdu ? 'کل لاگو ٹول' : 'Payable'}
                    </span>
                    <div className="text-sm sm:text-base font-mono font-black text-white">
                      PKR {mwTotal.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Interchanges List (Compact) */}
                <div className="bg-black/20 p-2.5 rounded-xl space-y-1 overflow-y-auto max-h-24">
                  <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {isUrdu ? 'اہم ٹول پلازے اور انٹرچینجز:' : 'Key Interchanges & Plazas:'}
                  </span>
                  <p className="text-[11px] text-white/90 leading-relaxed font-sans">
                    {isUrdu ? currentMw.interchangesUr.join(' • ') : currentMw.interchanges.join(' • ')}
                  </p>
                </div>

                {/* Directory Bottom Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/15 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopyMw}
                      className="px-2.5 py-1.5 rounded-lg bg-white text-[#162a4d] text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      {mwCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#162a4d]" />}
                      <span>{mwCopied ? (isUrdu ? 'کاپی' : 'Copied') : (isUrdu ? 'کاپی' : 'Copy')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareMwWhatsApp}
                      className="px-2.5 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>{isUrdu ? 'واٹس ایپ' : 'WhatsApp'}</span>
                    </button>
                  </div>

                  {onApplyToTrip && (
                    <button
                      type="button"
                      onClick={() => {
                        onApplyToTrip(mwTotal, currentMw.code, currentMw.nameEn);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#162a4d] text-xs font-black transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <ArrowRight className="w-3 h-3" />
                      <span>{isUrdu ? 'حساب میں لگائیں' : 'Apply to Trip'}</span>
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Modal Bottom Close */}
            <div className="pt-2 border-t border-[#ecece0] text-center shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-[#f0f0e4] hover:bg-[#5a5a40] hover:text-white text-[#4a4a35] font-serif font-bold text-xs transition-all cursor-pointer"
              >
                {isUrdu ? 'بند کریں' : 'Close'}
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};
