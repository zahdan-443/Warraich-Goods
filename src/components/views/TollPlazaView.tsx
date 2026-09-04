import React, { useState, useEffect } from 'react';
import { PublicImage, tollIconData } from '../../assets/dashboardIcons';
import { 
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
  RotateCcw,
  Sparkles
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
    loadRates();
  }, []);

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

  const handleReset = () => {
    setFromCity('Samundri');
    setToCity('Lahore');
    setVehicleClass('truck');
    setHasMtag(true);
    setResult(null);
    setViewState('input');
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

  const handleApplyToTripAndNavigate = (amount: number, from: string, to: string) => {
    if (onApplyToTrip) {
      onApplyToTrip(amount, from, to);
    }
    onNavigate('calculator');
  };

  return (
    <div 
      className="fixed inset-0 z-40 bg-[#fdfbf7] flex flex-col justify-between p-3 sm:p-4 max-w-xl mx-auto w-full font-sans select-none overflow-hidden"
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* Top Header - Matching TripCostView Style & Placement */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between pb-1 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white border border-[#ecece0] p-0.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
            <PublicImage
              fileName="toll-icon.png"
              alt="Motorway Toll Tax and Rates Calculator"
              width={40}
              height={40}
              className="w-full h-full object-cover rounded-xl"
              fallbackIcon={<Milestone className="w-5 h-5 text-[#8b9d77]" />}
            />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-[#4a4a35] leading-tight">
              {isUrdu ? 'موٹروے ٹول ٹیکس' : 'Motorway Toll Tax'}
            </h1>
            <p className="text-[10px] text-[#8e8e75]">
              {isUrdu ? 'تمام موٹرویز کے ایم ٹیگ و کیش ریٹس' : 'M-Tag & Cash Rates across Motorways'}
            </p>
          </div>
        </div>

        {onNavigate && (
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'route' && viewState === 'result') {
                setViewState('input');
              } else {
                onNavigate('home');
              }
            }}
            className="p-2 bg-white border border-[#ecece0] hover:bg-[#eaeae0] text-[#4a4a35] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            title={isUrdu ? 'ڈیش بورڈ پر واپس جائیں' : 'Back to Dashboard'}
          >
            <ArrowLeft className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
            <span>{isUrdu ? 'ڈیش بورڈ' : 'Dashboard'}</span>
          </button>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="pt-2 pb-1 shrink-0">
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#ebebe0] rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('route');
              setViewState('input');
            }}
            className={`py-1.5 px-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
            className={`py-1.5 px-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'motorways'
                ? 'bg-white text-[#4a4a35] shadow-xs'
                : 'text-[#6b6b55] hover:text-[#383827]'
            }`}
          >
            <Milestone className="w-3.5 h-3.5 text-[#8b9d77]" />
            <span>{isUrdu ? 'تمام موٹرویز (M-1 تا M-16)' : 'Motorways Directory'}</span>
          </button>
        </div>
      </div>

      {/* Scrollable Body Content - Fit-to-Screen */}
      <div className="flex-1 overflow-y-auto pr-0.5 space-y-2 py-1">
        
        {/* TAB 1: ROUTE CALCULATOR */}
        {activeTab === 'route' && (
          <>
            {/* VIEW 1: INPUT FORM */}
            {viewState === 'input' && (
              <div className="space-y-2">
                {/* Origin & Destination with Swap */}
                <div className="bg-white p-3 rounded-2xl border border-[#ecece0] shadow-2xs space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-11 gap-2 items-center">
                    
                    {/* From City */}
                    <div className="sm:col-span-5 space-y-1">
                      <label className="block text-[11px] font-bold font-serif text-[#4a4a35]">
                        {t.tollCalc.fromCity}
                      </label>
                      <select
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value as TollCity)}
                        className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-2.5 py-2 text-xs sm:text-sm font-medium text-[#4a4a35] focus:outline-none focus:border-[#8b9d77] shadow-2xs cursor-pointer"
                      >
                        {CITIES_LIST.map(c => (
                          <option key={`from-${c.id}`} value={c.id}>
                            {isUrdu ? `${c.nameUr} (${c.nameEn})` : `${c.nameEn} (${c.nameUr})`} - {c.province}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Swap Button */}
                    <div className="sm:col-span-1 flex justify-center py-0.5 sm:py-0">
                      <button
                        type="button"
                        onClick={handleSwapCities}
                        className="p-2 rounded-xl bg-[#fdfbf7] hover:bg-[#8b9d77] hover:text-white text-[#4a4a35] border border-[#ecece0] hover:border-[#8b9d77] shadow-2xs transition-all active:scale-90 cursor-pointer"
                        title={isUrdu ? 'روٹ تبدیل کریں' : 'Swap Origin & Destination'}
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* To City */}
                    <div className="sm:col-span-5 space-y-1">
                      <label className="block text-[11px] font-bold font-serif text-[#4a4a35]">
                        {t.tollCalc.toCity}
                      </label>
                      <select
                        value={toCity}
                        onChange={(e) => setToCity(e.target.value as TollCity)}
                        className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-2.5 py-2 text-xs sm:text-sm font-medium text-[#4a4a35] focus:outline-none focus:border-[#8b9d77] shadow-2xs cursor-pointer"
                      >
                        {CITIES_LIST.map(c => (
                          <option key={`to-${c.id}`} value={c.id}>
                            {isUrdu ? `${c.nameUr} (${c.nameEn})` : `${c.nameEn} (${c.nameUr})`} - {c.province}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>

                  {/* Quick Corridor Selection Pills */}
                  <div className="pt-1.5 border-t border-[#ecece0]">
                    <span className="text-[10px] font-bold text-[#8e8e75] block mb-1">
                      {isUrdu ? '⚡ اہم روٹ کوریڈورز (فوری انتخاب):' : '⚡ Popular Corridors:'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickSelectCorridor('Samundri', 'Lahore')}
                        className="px-2 py-1 rounded-lg bg-[#fdfbf7] border border-[#ecece0] hover:border-[#8b9d77] text-[10px] font-bold text-[#5a5a40] transition-all cursor-pointer shadow-2xs"
                      >
                        {isUrdu ? 'سمندری ➔ لاہور' : 'Samundri ➔ Lahore'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSelectCorridor('Samundri', 'Karachi')}
                        className="px-2 py-1 rounded-lg bg-[#fdfbf7] border border-[#ecece0] hover:border-[#8b9d77] text-[10px] font-bold text-[#5a5a40] transition-all cursor-pointer shadow-2xs"
                      >
                        {isUrdu ? 'سمندری ➔ کراچی' : 'Samundri ➔ Karachi'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSelectCorridor('Lahore', 'Rawalpindi')}
                        className="px-2 py-1 rounded-lg bg-[#fdfbf7] border border-[#ecece0] hover:border-[#8b9d77] text-[10px] font-bold text-[#5a5a40] transition-all cursor-pointer shadow-2xs"
                      >
                        {isUrdu ? 'لاہور ➔ اسلام آباد (M-2)' : 'Lahore ➔ Islamabad (M-2)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSelectCorridor('Lahore', 'Multan')}
                        className="px-2 py-1 rounded-lg bg-[#fdfbf7] border border-[#ecece0] hover:border-[#8b9d77] text-[10px] font-bold text-[#5a5a40] transition-all cursor-pointer shadow-2xs"
                      >
                        {isUrdu ? 'لاہور ➔ ملتان (M-3)' : 'Lahore ➔ Multan (M-3)'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Vehicle Class & M-Tag Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-2xl border border-[#ecece0] shadow-2xs">
                  
                  {/* Vehicle Class */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold font-serif text-[#4a4a35]">
                      {t.tollCalc.vehicleClass}
                    </label>
                    <select
                      value={vehicleClass}
                      onChange={(e) => setVehicleClass(e.target.value as TollVehicleClass)}
                      className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-medium text-[#4a4a35] focus:outline-none focus:border-[#8b9d77] shadow-2xs cursor-pointer"
                    >
                      {VEHICLE_CLASSES.map(v => (
                        <option key={v.id} value={v.id}>
                          {isUrdu ? `[${v.nhaCode}] ${v.nameUr} (${v.nameEn})` : `[${v.nhaCode}] ${v.nameEn} (${v.nameUr})`}
                        </option>
                      ))}
                    </select>
                    <p className="text-[9px] text-[#8e8e75] truncate">
                      {isUrdu 
                        ? VEHICLE_CLASSES.find(v => v.id === vehicleClass)?.descUr 
                        : VEHICLE_CLASSES.find(v => v.id === vehicleClass)?.descEn}
                    </p>
                  </div>

                  {/* M-Tag Active Checkbox */}
                  <div className="flex items-center">
                    <label className="flex items-start gap-2 p-2 bg-[#fdfbf7] rounded-xl border border-[#ecece0] hover:border-[#8b9d77] transition-all cursor-pointer w-full select-none shadow-2xs">
                      <input
                        type="checkbox"
                        checked={hasMtag}
                        onChange={(e) => setHasMtag(e.target.checked)}
                        disabled={vehicleClass === 'bike'}
                        className="w-4 h-4 mt-0.5 text-[#8b9d77] rounded border-gray-300 focus:ring-[#8b9d77]"
                      />
                      <div>
                        <span className="text-xs font-bold font-serif text-[#4a4a35] block">
                          {vehicleClass === 'bike' ? (isUrdu ? 'موٹر سائیکل (M-Tag استثنیٰ)' : 'Motorcycle (M-Tag Exempt)') : (isUrdu ? 'ایم ٹیگ فعال ہے (M-Tag Active)' : t.tollCalc.activeMtag)}
                        </span>
                        <span className="text-[9px] text-[#8e8e75] block leading-tight mt-0.5">
                          {vehicleClass === 'bike' ? (isUrdu ? 'صرف مخصوص پلوں پر لاگو' : 'Bridge tokens apply') : (isUrdu ? 'بغیر ایم ٹیگ کے 50% اضافی کیش لاگو ہوگا' : t.tollCalc.mtagSub)}
                        </span>
                      </div>
                    </label>
                  </div>

                </div>

                {/* Same-city Warning */}
                {fromCity === toCity && (
                  <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2 text-amber-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <div className="text-xs font-medium">
                      <strong>{isUrdu ? 'خرابی:' : 'Notice:'}</strong> {t.tollCalc.sameCityError}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: CALCULATION RESULTS */}
            {viewState === 'result' && result && (
              <div className="space-y-2 animate-in fade-in duration-150">
                
                {/* Top Header Bar with Edit Button */}
                <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-[#ecece0] shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setViewState('input')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#fdfbf7] border border-[#ecece0] hover:bg-[#8b9d77] hover:text-white text-[#4a4a35] text-xs font-bold font-serif transition-all cursor-pointer active:scale-95"
                  >
                    <ArrowLeft className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
                    <span>{isUrdu ? 'نیا روٹ منتخب کریں' : 'Change Route'}</span>
                  </button>

                  <div className="flex items-center gap-2 truncate">
                    <span className="font-serif font-bold text-xs sm:text-sm text-[#4a4a35] truncate">
                      {isUrdu ? result.routeNameUr : result.routeNameEn}
                    </span>
                    {result.totalKm > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-[#fdfbf7] border border-[#ecece0] text-[10px] font-mono font-bold text-[#5a5a40]">
                        {result.totalKm} km
                      </span>
                    )}
                  </div>
                </div>

                {/* Primary Total Banner */}
                <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#162a4d] to-[#1e3a68] text-white shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[10px] sm:text-xs text-amber-200 uppercase tracking-wider font-bold block">
                      {isUrdu ? 'کل قابلِ ادا ٹول رقم' : t.tollCalc.totalToll}
                    </span>
                    <div className="font-serif font-black text-xl sm:text-2xl text-white">
                      PKR {result.total.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                      hasMtag 
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' 
                        : 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                    }`}>
                      {vehicleClass === 'bike' ? (isUrdu ? 'استثنیٰ' : 'Exempt') : (hasMtag ? (isUrdu ? 'ایم ٹیگ لاگو' : 'M-Tag Active') : (isUrdu ? 'بغیر ایم ٹیگ (+50% کیش)' : 'Cash (+50%)'))}
                    </span>
                    <span className="text-[10px] text-white/70 block mt-0.5 font-mono">
                      {VEHICLE_CLASSES.find(v => v.id === vehicleClass)?.[isUrdu ? 'nameUr' : 'nameEn']}
                    </span>
                  </div>
                </div>

                {/* 3 Metric Cards */}
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="p-2 rounded-xl bg-white border border-[#ecece0] text-center shadow-2xs">
                    <span className="text-[9px] text-[#8e8e75] uppercase font-bold block">
                      {isUrdu ? 'بنیادی ٹول' : t.tollCalc.baseToll}
                    </span>
                    <div className="font-serif font-bold text-xs sm:text-sm text-[#4a4a35]">
                      Rs. {result.baseToll.toLocaleString()}
                    </div>
                  </div>

                  <div className={`p-2 rounded-xl border text-center shadow-2xs ${
                    !hasMtag && vehicleClass !== 'bike'
                      ? 'bg-amber-50 border-amber-200 text-amber-900' 
                      : 'bg-white border-[#ecece0] text-[#8e8e75]'
                  }`}>
                    <span className="text-[9px] uppercase font-bold block">
                      {isUrdu ? 'کیش سرچارج' : t.tollCalc.surcharge}
                    </span>
                    <div className="font-serif font-bold text-xs sm:text-sm">
                      {!hasMtag && vehicleClass !== 'bike' ? `+ Rs. ${result.surcharge.toLocaleString()}` : 'Rs. 0'}
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-[#8b9d77]/15 border border-[#8b9d77]/30 text-center shadow-2xs">
                    <span className="text-[9px] text-[#5a5a40] uppercase font-bold block">
                      {isUrdu ? 'روٹ کے حصے' : 'Segments'}
                    </span>
                    <div className="font-serif font-bold text-xs sm:text-sm text-[#5a5a40]">
                      {result.segments.length} {isUrdu ? 'موٹروے' : 'Sections'}
                    </div>
                  </div>
                </div>

                {/* Segments Breakdown (Compact List) */}
                {result.segments.length > 0 && (
                  <div className="bg-white rounded-2xl border border-[#ecece0] p-2.5 shadow-2xs space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#8e8e75] tracking-wider flex items-center gap-1">
                      <Layers className="w-3 h-3 text-[#8b9d77]" />
                      {isUrdu ? 'موٹروے و شاہراہ وائز بریک ڈاؤن:' : 'Motorway & Highway Breakdown:'}
                    </span>
                    
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
                      {result.segments.map((seg, idx) => (
                        <div 
                          key={idx} 
                          className="p-1.5 bg-[#fdfbf7] rounded-xl border border-[#ecece0] flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-6 h-6 rounded-md bg-[#162a4d] text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                              {seg.code}
                            </span>
                            <div className="truncate">
                              <div className="font-serif font-bold text-[#4a4a35] truncate text-[11px]">
                                {isUrdu ? seg.nameUr : seg.nameEn}
                              </div>
                              {seg.km && (
                                <span className="text-[9px] text-[#8e8e75] font-mono">{seg.km} km</span>
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
            )}
          </>
        )}

        {/* TAB 2: ALL MOTORWAYS DIRECTORY */}
        {activeTab === 'motorways' && (
          <div className="space-y-2 animate-in fade-in">
            {/* Motorway Selector Pills */}
            <div className="bg-white p-2.5 rounded-2xl border border-[#ecece0] shadow-2xs space-y-1.5">
              <label className="block text-[11px] font-bold text-[#4a4a35]">
                {isUrdu ? 'موٹروے منتخب کریں:' : 'Select Motorway:'}
              </label>
              <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1 bg-[#fdfbf7] rounded-xl border border-[#ecece0]">
                {MOTORWAYS_DIRECTORY.map((mw) => (
                  <button
                    key={mw.code}
                    type="button"
                    onClick={() => setSelectedMwCode(mw.code)}
                    className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-2.5 rounded-2xl border border-[#ecece0] shadow-2xs">
              <div>
                <label className="block text-[10px] font-bold text-[#4a4a35] mb-0.5">
                  {isUrdu ? 'گاڑی کی کیٹیگری:' : 'Vehicle Category:'}
                </label>
                <select
                  value={mwVehicleClass}
                  onChange={(e) => setMwVehicleClass(e.target.value as TollVehicleClass)}
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-lg px-2 py-1 text-xs font-bold text-[#4a4a35] focus:outline-none focus:border-[#8b9d77]"
                >
                  {VEHICLE_CLASSES.map(v => (
                    <option key={v.id} value={v.id}>
                      {isUrdu ? `[${v.nhaCode}] ${v.nameUr}` : `[${v.nhaCode}] ${v.nameEn}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 p-1.5 bg-[#fdfbf7] rounded-lg border border-[#ecece0] cursor-pointer w-full select-none">
                  <input
                    type="checkbox"
                    checked={mwHasMtag}
                    onChange={(e) => setMwHasMtag(e.target.checked)}
                    disabled={mwVehicleClass === 'bike'}
                    className="w-3.5 h-3.5 text-[#8b9d77] rounded"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#4a4a35] block text-[10px]">
                      {isUrdu ? 'ایم ٹیگ ریٹ' : 'M-Tag Rate'}
                    </span>
                    <span className="text-[8px] text-[#8e8e75]">
                      {isUrdu ? 'غیر فعال پر 50% کیش لاگو ہوگا' : '+50% cash penalty'}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Detailed Motorway Card */}
            <div className="bg-gradient-to-br from-[#162a4d] to-[#1e3a68] text-white p-3 rounded-2xl shadow-md space-y-2">
              <div className="flex items-center justify-between border-b border-white/15 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-400 text-[#162a4d] font-black rounded-md text-xs">
                    {currentMw.code}
                  </span>
                  <h3 className="font-bold text-xs sm:text-sm text-white">
                    {isUrdu ? currentMw.nameUr : currentMw.nameEn}
                  </h3>
                </div>

                <span className="px-2 py-0.5 bg-white/15 rounded-full text-[11px] font-mono font-bold">
                  {currentMw.totalKm} km
                </span>
              </div>

              {/* Rates Display */}
              <div className="grid grid-cols-3 gap-1.5 my-1">
                <div className="bg-white/10 p-1.5 rounded-xl text-center">
                  <span className="text-[9px] text-white/70 block">
                    {isUrdu ? 'ایم ٹیگ' : 'M-Tag'}
                  </span>
                  <div className="text-xs font-mono font-bold text-amber-300">
                    Rs. {mwBaseRate.toLocaleString()}
                  </div>
                </div>

                <div className="bg-white/10 p-1.5 rounded-xl text-center">
                  <span className="text-[9px] text-white/70 block">
                    {isUrdu ? 'بغیر ایم ٹیگ' : 'Cash'}
                  </span>
                  <div className="text-xs font-mono font-bold text-rose-300">
                    Rs. {mwTotal.toLocaleString()}
                  </div>
                </div>

                <div className="bg-white/20 p-1.5 rounded-xl text-center">
                  <span className="text-[9px] text-white/80 block font-bold">
                    {isUrdu ? 'کل ٹول' : 'Total'}
                  </span>
                  <div className="text-xs sm:text-sm font-mono font-black text-white">
                    PKR {mwTotal.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Interchanges List (Compact) */}
              <div className="bg-black/20 p-2 rounded-xl space-y-0.5 max-h-24 overflow-y-auto">
                <span className="text-[9px] font-bold text-amber-300 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {isUrdu ? 'اہم ٹول پلازے اور انٹرچینجز:' : 'Key Interchanges:'}
                </span>
                <p className="text-[10px] text-white/90 leading-relaxed font-sans">
                  {isUrdu ? currentMw.interchangesUr.join(' • ') : currentMw.interchanges.join(' • ')}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Sticky Bottom Actions - Exactly like TripCostView */}
      <div className="pt-2 shrink-0 border-t border-[#ecece0]">
        {activeTab === 'route' && viewState === 'input' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={computeAndShowResult}
              disabled={fromCity === toCity}
              className="flex-1 py-3 bg-[#4a4a35] hover:bg-[#383827] text-white rounded-2xl font-black text-sm sm:text-base shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calculator className="w-5 h-5 text-[#8b9d77]" />
              <span>{isUrdu ? 'ٹول ٹیکس کا حساب لگائیں' : 'Calculate Toll Tax'}</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              title={isUrdu ? 'ری سیٹ کریں' : 'Reset'}
              className="p-3 bg-white border-2 border-[#d5d5c5] hover:bg-[#f0f0e4] text-[#4a4a35] rounded-2xl font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        )}

        {activeTab === 'route' && viewState === 'result' && result && (
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleApplyToTripAndNavigate(result.total, fromCity, toCity)}
                className="px-3 py-2.5 rounded-2xl bg-[#8b9d77] hover:bg-[#798a67] text-white text-xs font-bold font-serif transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'حساب میں لگائیں' : t.tollCalc.applyToTrip}</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-2.5 rounded-2xl bg-white border border-[#ecece0] hover:bg-[#f0f0e4] text-[#4a4a35] text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95"
                title={isUrdu ? 'کاپی کریں' : 'Copy'}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#8b9d77]" />}
                <span>{copied ? (isUrdu ? 'کاپی' : 'Copied') : (isUrdu ? 'کاپی' : 'Copy')}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-2.5 py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                title={isUrdu ? 'واٹس ایپ' : 'WhatsApp'}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'واٹس ایپ' : 'WhatsApp'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewState('input')}
                className="px-3 py-2.5 rounded-2xl bg-[#f0f0e4] hover:bg-[#5a5a40] hover:text-white text-[#4a4a35] text-xs font-bold font-serif transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                <span>{isUrdu ? 'دوبارہ' : 'New'}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="px-3.5 py-2.5 rounded-2xl bg-[#4a4a35] hover:bg-[#383827] text-white text-xs font-bold font-serif transition-all cursor-pointer active:scale-95"
              >
                {isUrdu ? 'ہوم' : 'Home'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'motorways' && (
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyMw}
                className="px-2.5 py-2.5 rounded-2xl bg-white border border-[#ecece0] text-[#162a4d] text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95"
              >
                {mwCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#162a4d]" />}
                <span>{mwCopied ? (isUrdu ? 'کاپی' : 'Copied') : (isUrdu ? 'کاپی' : 'Copy')}</span>
              </button>

              <button
                type="button"
                onClick={handleShareMwWhatsApp}
                className="px-2.5 py-2.5 rounded-2xl bg-[#25D366] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'واٹس ایپ' : 'WhatsApp'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyToTripAndNavigate(mwTotal, currentMw.code, currentMw.nameEn)}
                className="px-3 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#162a4d] text-xs font-black transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'حساب میں لگائیں' : 'Apply'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-4 py-2.5 rounded-2xl bg-[#4a4a35] hover:bg-[#383827] text-white text-xs font-bold font-serif transition-all cursor-pointer active:scale-95"
            >
              {isUrdu ? 'ہوم' : 'Home'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
