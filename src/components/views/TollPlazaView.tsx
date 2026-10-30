import React, { useState, useEffect } from 'react';
import { PublicImage, tollIconData } from '../../assets/dashboardIcons';
import { 
  Milestone, 
  ArrowRightLeft, 
  AlertTriangle, 
  Copy, 
  Check, 
  Share2, 
  Layers,
  ArrowRight,
  RefreshCw,
  Route as RouteIcon,
  Calculator,
  Car,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin
} from 'lucide-react';
import { Language, TollCity, TollVehicleClass, TollRatesConfig, DICTIONARY, ActiveTab } from '../../types';
import { 
  CITIES_LIST, 
  VEHICLE_CLASSES, 
  calculateToll, 
  getStoredTollRates, 
  getCachedTollRates,
  syncTollRatesWithNHA,
  TollCalculationResult,
  MOTORWAYS_DIRECTORY
} from '../../utils/tollMatrix';

interface TollPlazaViewProps {
  lang: Language;
  onNavigate: (tab: ActiveTab) => void;
  onApplyToTrip?: (tollAmount: number, fromCity: string, toCity: string) => void;
}

export const TollPlazaView: React.FC<TollPlazaViewProps> = ({
  lang,
  onNavigate,
  onApplyToTrip
}) => {
  const t = DICTIONARY[lang];
  const isUrdu = lang === 'ur';

  // Single-page Route & Corridor Calculator
  const [fromCity, setFromCity] = useState<TollCity>('Samundri');
  const [toCity, setToCity] = useState<TollCity>('Lahore');
  const [vehicleClass, setVehicleClass] = useState<TollVehicleClass>('bus'); // Category 4 by default
  const [hasMtag, setHasMtag] = useState<boolean>(true);
  const [rates, setRates] = useState<TollRatesConfig>(getCachedTollRates());
  const [copied, setCopied] = useState<boolean>(false);
  const [result, setResult] = useState<TollCalculationResult | null>(null);

  // Merged Motorways Reference Directory (Collapsible)
  const [showMotorwaysGuide, setShowMotorwaysGuide] = useState<boolean>(false);
  const [selectedMwCode, setSelectedMwCode] = useState<string>('M2');

  useEffect(() => {
    loadRates();
    // Transparently auto-sync official 2026 NHA rates in background
    syncTollRatesWithNHA().then(res => {
      if (res?.rates) setRates(res.rates);
    }).catch(() => {});
  }, []);

  // Compute live result whenever cities, class or M-tag changes
  useEffect(() => {
    if (fromCity !== toCity) {
      const res = calculateToll({
        from: fromCity,
        to: toCity,
        vehicleClass,
        hasMtag,
        rates
      });
      setResult(res);
    } else {
      setResult(null);
    }
  }, [fromCity, toCity, vehicleClass, hasMtag, rates]);

  const loadRates = async () => {
    try {
      const fetchedRates = await getStoredTollRates();
      setRates(fetchedRates);
    } catch {
      // offline cache used
    }
  };

  const handleReset = () => {
    setFromCity('Samundri');
    setToCity('Lahore');
    setVehicleClass('bus');
    setHasMtag(true);
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
    text += `💰 ${isUrdu ? 'کل ٹول رقم' : 'Total Toll'}: PKR ${result.total.toLocaleString()}\n`;
    if (result.segments.length > 0) {
      text += `\n📌 ${isUrdu ? 'موٹروے بریک ڈاؤن' : 'Breakdown'}:\n`;
      result.segments.forEach(s => {
        text += `• ${s.code} (${isUrdu ? s.nameUr : s.nameEn}): Rs. ${s.toll.toLocaleString()}\n`;
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
    text += `💳 ${isUrdu ? 'ایم ٹیگ' : 'M-Tag'}: ${hasMtag ? (isUrdu ? 'فعال (M-Tag لاگو)' : 'Active') : (isUrdu ? 'غیر فعال (+50% کیش)' : 'Cash (+50%)')}\n`;
    text += `💰 *${isUrdu ? 'کل ٹول ٹیکس' : 'Total Toll'}*: *PKR ${result.total.toLocaleString()}*\n`;
    if (result.segments.length > 0) {
      text += `\n📌 ${isUrdu ? 'موٹرویز و شاہراہیں' : 'Motorways'}:\n`;
      result.segments.forEach(s => {
        text += `• ${s.code} (${isUrdu ? s.nameUr : s.nameEn}): Rs. ${s.toll.toLocaleString()}\n`;
      });
    }

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleApplyToTripAndNavigate = (amount: number, from: string, to: string) => {
    if (onApplyToTrip) {
      onApplyToTrip(amount, from, to);
    }
    onNavigate('calculator');
  };

  const currentMw = MOTORWAYS_DIRECTORY.find(m => m.code === selectedMwCode) || MOTORWAYS_DIRECTORY[0];

  return (
    <div 
      className="min-h-full max-w-4xl mx-auto w-full font-sans flex flex-col p-3 sm:p-5 md:p-6 space-y-4 animate-in fade-in"
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* Primary Calculator Form - Enlarged View */}
      <div className="bg-white dark:bg-[#1a1b15] p-4 sm:p-6 rounded-3xl border border-[#ecece0] dark:border-[#3d3e33] shadow-sm space-y-4">
        
        {/* Origin & Destination Selectors */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label className="text-sm font-serif font-bold text-[#4a4a35] dark:text-[#f8fafc] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isUrdu ? 'روٹ کا انتخاب (کہاں سے کہاں تک):' : 'Select Origin & Destination:'}</span>
            </label>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-lg font-bold border border-emerald-200 dark:border-emerald-800">
              {isUrdu ? '2026 این ایچ اے ریٹس فعال' : '2026 NHA Rates Active'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* From City */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#5a5a40] block">
                {isUrdu ? 'کہاں سے (روانگی کا شہر)' : 'From City (Origin)'}
              </span>
              <select
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value as TollCity)}
                className="w-full bg-[#fdfbf7] border-2 border-[#ecece0] focus:border-[#8b9d77] rounded-2xl px-3.5 py-3 text-sm sm:text-base font-bold text-[#4a4a35] focus:outline-none shadow-2xs cursor-pointer"
              >
                {CITIES_LIST.map(c => (
                  <option key={`from-${c.id}`} value={c.id}>
                    {isUrdu ? `${c.nameUr} (${c.nameEn})` : `${c.nameEn} (${c.nameUr})`} - {c.province}
                  </option>
                ))}
              </select>
            </div>

            {/* To City */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#5a5a40] block">
                {isUrdu ? 'کہاں تک (منزل کا شہر)' : 'To City (Destination)'}
              </span>
              <select
                value={toCity}
                onChange={(e) => setToCity(e.target.value as TollCity)}
                className="w-full bg-[#fdfbf7] border-2 border-[#ecece0] focus:border-[#8b9d77] rounded-2xl px-3.5 py-3 text-sm sm:text-base font-bold text-[#4a4a35] focus:outline-none shadow-2xs cursor-pointer"
              >
                {CITIES_LIST.map(c => (
                  <option key={`to-${c.id}`} value={c.id}>
                    {isUrdu ? `${c.nameUr} (${c.nameEn})` : `${c.nameEn} (${c.nameUr})`} - {c.province}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Vehicle Class & M-Tag Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 border-t border-[#ecece0]">
          {/* Vehicle Class */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5a5a40] flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#8b9d77]" />
              <span>{isUrdu ? 'گاڑی کی سرکاری کیٹیگری (NHA Category):' : 'Official Vehicle Class:'}</span>
            </label>
            <select
              value={vehicleClass}
              onChange={(e) => setVehicleClass(e.target.value as TollVehicleClass)}
              className="w-full bg-[#fdfbf7] border-2 border-[#ecece0] focus:border-[#8b9d77] rounded-2xl px-3.5 py-3 text-sm sm:text-base font-bold text-[#4a4a35] focus:outline-none shadow-2xs cursor-pointer"
            >
              {VEHICLE_CLASSES.map(v => (
                <option key={v.id} value={v.id}>
                  {isUrdu ? `[${v.nhaCode}] ${v.nameUr} (${v.nameEn})` : `[${v.nhaCode}] ${v.nameEn} (${v.nameUr})`}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#8e8e75]">
              {isUrdu 
                ? VEHICLE_CLASSES.find(v => v.id === vehicleClass)?.descUr 
                : VEHICLE_CLASSES.find(v => v.id === vehicleClass)?.descEn}
            </p>
          </div>

          {/* M-Tag Active Checkbox Card */}
          <div className="flex flex-col justify-center">
            <label className="flex items-start gap-3 p-3.5 bg-[#fdfbf7] rounded-2xl border-2 border-[#ecece0] hover:border-[#8b9d77] transition-all cursor-pointer w-full select-none shadow-2xs">
              <input
                type="checkbox"
                checked={hasMtag}
                onChange={(e) => setHasMtag(e.target.checked)}
                disabled={vehicleClass === 'bike'}
                className="w-5 h-5 mt-0.5 text-[#8b9d77] rounded border-gray-300 focus:ring-[#8b9d77]"
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold font-serif text-[#4a4a35] block">
                  {vehicleClass === 'bike' 
                    ? (isUrdu ? 'موٹر سائیکل (M-Tag استثنیٰ)' : 'Motorcycle (M-Tag Exempt)') 
                    : (isUrdu ? 'ایم ٹیگ فعال ہے (M-Tag Active)' : 'Active M-Tag Registered')}
                </span>
                <span className="text-xs text-[#8e8e75] block mt-0.5">
                  {vehicleClass === 'bike' 
                    ? (isUrdu ? 'پلوں کے ٹوکن ٹیکس کے علاوہ دیگر سے مستثنیٰ' : 'Exempt from motorway tolls') 
                    : (isUrdu ? 'بغیر ایم ٹیگ کے 50% اضافی کیش سرچارج لاگو ہوگا' : '+50% cash penalty without M-Tag')}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Same-city Warning */}
        {fromCity === toCity && (
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-2.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="text-xs sm:text-sm font-bold">
              {isUrdu ? 'روانگی اور منزل کا شہر ایک ہی منتخب ہے۔ برائے مہربانی مختلف شہر منتخب کریں۔' : 'Origin and destination cities are the same. Please select different cities.'}
            </div>
          </div>
        )}
      </div>

      {/* Calculation Results Card (Instant & Prominent) */}
      {result && (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#ecece0] shadow-sm space-y-4 animate-in fade-in">
          
          {/* Main Total Banner */}
          <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#162a4d] to-[#1e3a68] text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-amber-300 uppercase tracking-wider font-bold block">
                {isUrdu ? 'کل قابلِ ادا ٹول رقم (2026 این ایچ اے ریٹ)' : 'Total Payable Toll Amount'}
              </span>
              <div className="font-serif font-black text-2xl sm:text-3xl text-white mt-1">
                PKR {result.total.toLocaleString()}
              </div>
              <div className="text-xs text-white/80 font-mono mt-1">
                {isUrdu ? result.routeNameUr : result.routeNameEn} {result.totalKm > 0 && `• ${result.totalKm} km`}
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-white/20 pt-2 sm:pt-0">
              <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                hasMtag 
                  ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/40' 
                  : 'bg-amber-500/25 text-amber-200 border border-amber-400/40'
              }`}>
                {vehicleClass === 'bike' ? (isUrdu ? 'استثنیٰ' : 'Exempt') : (hasMtag ? (isUrdu ? 'ایم ٹیگ لاگو' : 'M-Tag Applied') : (isUrdu ? 'کیش (+50% سرچارج)' : 'Cash (+50%)'))}
              </span>
              <span className="text-xs text-white/80 font-bold font-serif">
                {VEHICLE_CLASSES.find(v => v.id === vehicleClass)?.[isUrdu ? 'nameUr' : 'nameEn']}
              </span>
            </div>
          </div>

          {/* 3 Metrics Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] text-center shadow-2xs">
              <span className="text-[10px] text-[#8e8e75] uppercase font-bold block">
                {isUrdu ? 'بنیادی ٹول' : 'Base Toll'}
              </span>
              <div className="font-serif font-bold text-sm sm:text-base text-[#4a4a35] mt-0.5">
                Rs. {result.baseToll.toLocaleString()}
              </div>
            </div>

            <div className={`p-3 rounded-2xl border text-center shadow-2xs ${
              !hasMtag && vehicleClass !== 'bike'
                ? 'bg-amber-50 border-amber-300 text-amber-900' 
                : 'bg-[#fdfbf7] border-[#ecece0] text-[#8e8e75]'
            }`}>
              <span className="text-[10px] uppercase font-bold block">
                {isUrdu ? 'کیش سرچارج' : 'Cash Surcharge'}
              </span>
              <div className="font-serif font-bold text-sm sm:text-base mt-0.5">
                {!hasMtag && vehicleClass !== 'bike' ? `+ Rs. ${result.surcharge.toLocaleString()}` : 'Rs. 0'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center shadow-2xs">
              <span className="text-[10px] text-emerald-800 uppercase font-bold block">
                {isUrdu ? 'موٹروے سیکشنز' : 'Motorway Sections'}
              </span>
              <div className="font-serif font-bold text-sm sm:text-base text-emerald-900 mt-0.5">
                {result.segments.length} {isUrdu ? 'شاہراہیں' : 'Sections'}
              </div>
            </div>
          </div>

          {/* Detailed Motorway Segments Breakdown */}
          {result.segments.length > 0 && (
            <div className="bg-[#fdfbf7] rounded-2xl border border-[#ecece0] p-3 sm:p-4 shadow-2xs space-y-2">
              <span className="text-xs uppercase font-bold text-[#8e8e75] tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#8b9d77]" />
                <span>{isUrdu ? 'موٹروے و شاہراہ وائز بریک ڈاؤن:' : 'Motorway & Highway Breakdown:'}</span>
              </span>
              
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {result.segments.map((seg, idx) => (
                  <div 
                    key={idx} 
                    className="p-2 sm:p-2.5 bg-white rounded-xl border border-[#ecece0] flex items-center justify-between gap-3 text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-[#162a4d] text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {seg.code}
                      </span>
                      <div className="truncate">
                        <div className="font-serif font-bold text-[#4a4a35] truncate">
                          {isUrdu ? seg.nameUr : seg.nameEn}
                        </div>
                        {seg.km && (
                          <span className="text-[10px] text-[#8e8e75] font-mono">{seg.km} km</span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#162a4d] shrink-0 text-sm">
                      Rs. {seg.toll.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons: Apply to Trip, Copy, WhatsApp */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#ecece0] flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleApplyToTripAndNavigate(result.total, fromCity, toCity)}
                className="px-4 py-2.5 rounded-2xl bg-[#4a5e38] hover:bg-[#394a2b] text-white text-xs sm:text-sm font-bold font-serif transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <ArrowRight className="w-4 h-4" />
                <span>{isUrdu ? 'سفر حساب میں لگائیں' : 'Apply to Trip Calculation'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2.5 rounded-2xl bg-white border border-[#ecece0] hover:bg-[#f0f0e4] text-[#4a4a35] text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                title={isUrdu ? 'کاپی کریں' : 'Copy'}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#8b9d77]" />}
                <span>{copied ? (isUrdu ? 'کاپی ہو گیا' : 'Copied') : (isUrdu ? 'کاپی' : 'Copy')}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-3.5 py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                title={isUrdu ? 'واٹس ایپ پر شیئر کریں' : 'Share on WhatsApp'}
              >
                <Share2 className="w-4 h-4" />
                <span>{isUrdu ? 'واٹس ایپ' : 'WhatsApp'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2.5 rounded-2xl bg-[#f0f0e4] hover:bg-[#e2e2d5] text-[#5a5a40] text-xs font-bold font-serif transition-all cursor-pointer active:scale-95 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'ری سیٹ' : 'Reset'}</span>
            </button>
          </div>

        </div>
      )}

      {/* MERGED ESSENTIAL MOTORWAYS REFERENCE ACCORDION (Collapsible) */}
      <div className="bg-white rounded-3xl border border-[#ecece0] shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowMotorwaysGuide(!showMotorwaysGuide)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-[#fdfbf7] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-[#1e3a68]">
              <Milestone className="w-5 h-5 text-[#1e3a68]" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm sm:text-base text-[#4a4a35]">
                {isUrdu ? 'تمام اہم موٹرویز ٹول ریٹس خلاصہ (M-1 تا M-16)' : 'Motorways Rate Directory (M-1 to M-16)'}
              </div>
              <div className="text-xs text-[#8e8e75]">
                {isUrdu ? 'انفرادی موٹروے کے مکمل ریٹس اور انٹرچینجز دیکھنے کے لیے کھولیں' : 'Click to inspect individual motorway rates and interchanges'}
              </div>
            </div>
          </div>
          {showMotorwaysGuide ? <ChevronUp className="w-5 h-5 text-[#8e8e75]" /> : <ChevronDown className="w-5 h-5 text-[#8e8e75]" />}
        </button>

        {showMotorwaysGuide && (
          <div className="p-4 sm:p-5 border-t border-[#ecece0] space-y-3 bg-[#fdfbf7] animate-in fade-in">
            {/* Quick Pills */}
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-white rounded-2xl border border-[#ecece0]">
              {MOTORWAYS_DIRECTORY.map((mw) => (
                <button
                  key={mw.code}
                  type="button"
                  onClick={() => setSelectedMwCode(mw.code)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    selectedMwCode === mw.code
                      ? 'bg-[#162a4d] text-white shadow-xs'
                      : 'bg-[#fdfbf7] text-[#5a5a40] border border-[#ecece0] hover:bg-[#f0f0e4]'
                  }`}
                >
                  {mw.code} - {isUrdu ? mw.nameUr : mw.nameEn}
                </button>
              ))}
            </div>

            {/* Selected Motorway Quick Summary Card */}
            <div className="bg-white p-4 rounded-2xl border border-[#ecece0] shadow-2xs space-y-2">
              <div className="flex items-center justify-between border-b border-[#ecece0] pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-[#162a4d] text-white font-mono font-bold rounded-lg text-xs">
                    {currentMw.code}
                  </span>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#4a4a35]">
                    {isUrdu ? currentMw.nameUr : currentMw.nameEn}
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold text-[#8e8e75]">
                  {currentMw.totalKm} km
                </span>
              </div>

              <div className="text-xs text-[#5a5a40]">
                <b>{isUrdu ? 'روٹ:' : 'Route:'}</b> {isUrdu ? currentMw.routeUr : currentMw.routeEn}
              </div>

              <div className="text-xs text-[#8e8e75]">
                <b>{isUrdu ? 'اہم انٹرچینجز:' : 'Key Interchanges:'}</b> {isUrdu ? currentMw.interchangesUr.join(' • ') : currentMw.interchanges.join(' • ')}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
