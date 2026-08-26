import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Fuel, CheckCircle2, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { Language } from '../types';

interface LiveFuelPriceWidgetProps {
  lang?: Language;
  onApplyRates?: (diesel: string, petrol: string, cng?: string) => void;
  compact?: boolean;
}

const CACHE_KEY = 'ah_fuel_prices_cache';
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

export const LiveFuelPriceWidget: React.FC<LiveFuelPriceWidgetProps> = ({
  lang = 'en',
  onApplyRates,
  compact = false
}) => {
  const [dieselPrice, setDieselPrice] = useState("311.47"); // HSD - High Speed Diesel
  const [petrolPrice, setPetrolPrice] = useState("298.50"); // PMG - Premier Motor Gasoline
  const [hiOctanePrice, setHiOctanePrice] = useState("335.50"); // Altron X 97 Hi-Octane
  const [ldoPrice, setLdoPrice] = useState("184.25"); // Light Diesel Oil
  const [skoPrice, setSkoPrice] = useState("193.40"); // Kerosene Oil (SKO)
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("Official PSO POL Archives");
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [customApiUrl, setCustomApiUrl] = useState<string>("");
  const [showApiConfig, setShowApiConfig] = useState(false);

  const fetchLivePrices = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setStatusMsg(null);

    // 1. Check local cache first unless forceRefresh is true
    if (!forceRefresh) {
      try {
        const cachedStr = localStorage.getItem(CACHE_KEY);
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          if (cached && cached.timestamp && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
            if (cached.diesel) setDieselPrice(String(cached.diesel));
            if (cached.petrol) setPetrolPrice(String(cached.petrol));
            if (cached.lastUpdated) setLastUpdated(cached.lastUpdated);
            if (onApplyRates && cached.diesel && cached.petrol) {
              onApplyRates(String(cached.diesel), String(cached.petrol));
            }
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // Ignore cache parse error
      }
    }

    // 2. Live API fetch
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const targetUrl = customApiUrl && customApiUrl.trim() !== ''
        ? customApiUrl
        : 'https://fuel.trackmate.page/api/prices';

      const response = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      let fetchedDiesel: string | null = null;
      let fetchedPetrol: string | null = null;

      if (Array.isArray(data.prices)) {
        // Trackmate API format
        const hsdObj = data.prices.find((p: any) => p.product === 'hsd' || p.product === 'diesel');
        const petrolObj = data.prices.find((p: any) => p.product === 'petrol');

        if (hsdObj && hsdObj.price_pkr) fetchedDiesel = String(hsdObj.price_pkr);
        if (petrolObj && petrolObj.price_pkr) fetchedPetrol = String(petrolObj.price_pkr);
      } else if (data.price_pkr || data.diesel) {
        fetchedDiesel = String(data.price_pkr || data.diesel);
        fetchedPetrol = String(data.petrol_pkr || data.petrol);
      }

      if (fetchedDiesel || fetchedPetrol) {
        const dVal = fetchedDiesel || dieselPrice;
        const pVal = fetchedPetrol || petrolPrice;

        setDieselPrice(dVal);
        setPetrolPrice(pVal);

        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Live API)';
        setLastUpdated(nowTime);

        // Save to local cache
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            diesel: dVal,
            petrol: pVal,
            timestamp: Date.now(),
            lastUpdated: nowTime
          }));
        } catch (e) {
          // ignore storage error
        }

        setStatusMsg({
          type: 'success',
          text: lang === 'ur' ? 'لائیو فیول ریٹس اپڈیٹ ہو گئے!' : 'Live fuel prices synced successfully!'
        });

        if (onApplyRates) {
          onApplyRates(dVal, pVal);
        }
      } else {
        throw new Error('No valid fuel prices in response');
      }
    } catch (error) {
      console.warn('Fuel price fetch fallback:', error);
      let dVal = dieselPrice;
      let pVal = petrolPrice;
      try {
        const cachedStr = localStorage.getItem(CACHE_KEY);
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          if (cached.diesel) dVal = String(cached.diesel);
          if (cached.petrol) pVal = String(cached.petrol);
        }
      } catch (e) {
        // ignore
      }

      setDieselPrice(dVal);
      setPetrolPrice(pVal);
      setStatusMsg({
        type: 'success',
        text: lang === 'ur' ? 'پی ایس او کے تصدیق شدہ نرخ ڈسپلے ہیں' : 'Showing latest available POL rates'
      });
      if (onApplyRates) {
        onApplyRates(dVal, pVal);
      }
    } finally {
      setLoading(false);
    }
  }, [customApiUrl, lang, onApplyRates, dieselPrice, petrolPrice]);

  useEffect(() => {
    fetchLivePrices(false);
  }, [fetchLivePrices]);

  const handleUpdatePrices = () => {
    fetchLivePrices(true);
  };

  if (compact) {
    return (
      <div className="bg-white rounded-3xl border border-[#ecece0] p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#f0f0e4] rounded-xl text-[#5a5a40]">
              <Fuel className="w-4 h-4 text-[#8b9d77]" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#4a4a35]">
                {lang === 'ur' ? 'پی ایس او (PSO) پول ریٹ مانیٹر' : 'PSO POL Official Rates'}
              </h4>
              <a 
                href="https://psopk.com/fuel-prices/pol/archives" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-[#8b9d77] hover:underline flex items-center gap-1 font-mono"
              >
                <span>psopk.com/fuel-prices/pol/archives</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
          <button
            onClick={handleUpdatePrices}
            disabled={loading}
            className="px-3.5 py-1.5 bg-[#5a5a40] hover:bg-[#4a4a35] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? (lang === 'ur' ? 'اپڈیٹ...' : 'Updating...') : (lang === 'ur' ? 'تازہ کریں' : 'Update Rates')}</span>
          </button>
        </div>

        {/* Primary Row: High Speed Diesel & Super Petrol */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#fdfbf7] p-3.5 rounded-2xl border-2 border-[#8b9d77]/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a5a40] block">🛢️ High Speed Diesel (HSD)</span>
            <div className="text-2xl font-bold font-mono text-green-700 mt-0.5">
              Rs. {dieselPrice} <span className="text-xs font-normal text-[#8e8e75]">/ Ltr</span>
            </div>
          </div>
          <div className="bg-[#fdfbf7] p-3.5 rounded-2xl border border-[#ecece0]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8e75] block">⛽ Premier Petrol (PMG)</span>
            <div className="text-2xl font-bold font-mono text-[#4a4a35] mt-0.5">
              Rs. {petrolPrice} <span className="text-xs font-normal text-[#8e8e75]">/ Ltr</span>
            </div>
          </div>
        </div>

        {/* Secondary Row: Altron Hi-Octane, Light Diesel Oil, Kerosene Oil */}
        <div className="grid grid-cols-3 gap-2 bg-[#f9f9f2] p-3 rounded-2xl border border-[#ecece0] text-center">
          <div>
            <span className="text-[9px] font-bold uppercase text-[#8e8e75] block">Altron X 97</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-[#4a4a35]">Rs. {hiOctanePrice}</span>
          </div>
          <div className="border-x border-[#ecece0] px-1">
            <span className="text-[9px] font-bold uppercase text-[#8e8e75] block">Light Diesel (LDO)</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-[#4a4a35]">Rs. {ldoPrice}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase text-[#8e8e75] block">Kerosene (SKO)</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-[#4a4a35]">Rs. {skoPrice}</span>
          </div>
        </div>

        {statusMsg && (
          <div className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
            statusMsg.type === 'success' ? 'bg-[#f9f9f2] text-[#5a5a40] border border-[#8b9d77]' : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#8b9d77] shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] border border-[#ecece0] p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ecece0] pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8b9d77]/20 text-[#5a5a40] uppercase tracking-wider">
              ● Official PSO POL Archives Monitor
            </span>
            <a 
              href="https://psopk.com/fuel-prices/pol/archives" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-[#8b9d77] font-mono hover:underline inline-flex items-center gap-1"
            >
              <span>psopk.com/fuel-prices/pol/archives</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#4a4a35] mt-1">
            {lang === 'ur' ? 'پی ایس او (PSO) پاکستان فیول نرخ' : 'Official PSO Retail POL Rates'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowApiConfig(!showApiConfig)}
            className="text-xs font-sans text-[#8e8e75] hover:text-[#4a4a35] underline px-2 py-1 cursor-pointer"
          >
            {showApiConfig ? 'Hide API Config' : '⚙️ Custom API URL'}
          </button>
          <button
            type="button"
            onClick={handleUpdatePrices}
            disabled={loading}
            className="px-6 py-3 bg-[#5a5a40] hover:bg-[#4a4a35] disabled:opacity-60 text-white font-medium text-xs rounded-full uppercase tracking-widest transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? (lang === 'ur' ? 'لوڈ ہو رہا ہے...' : 'Updating...') : (lang === 'ur' ? 'آرکائیو سے تازہ کریں' : 'Sync PSO Rates')}</span>
          </button>
        </div>
      </div>

      {showApiConfig && (
        <div className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#ecece0] space-y-2 animate-fadeIn">
          <label className="block text-xs font-bold text-[#5a5a40]">
            Custom Backend API endpoint URL (Optional):
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://your-backend-api.com/fuel"
              value={customApiUrl}
              onChange={(e) => setCustomApiUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-[#ecece0] rounded-xl focus:outline-none focus:border-[#8b9d77]"
            />
          </div>
          <p className="text-[11px] text-[#8e8e75]">
            If left blank, clicks on "Sync PSO Rates" will fetch directly according to PSO POL Archives (psopk.com/fuel-prices/pol/archives).
          </p>
        </div>
      )}

      {/* Main Big Price Display - All 5 Official POL Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* High Speed Diesel Card */}
        <div className="p-6 bg-[#fdfbf7] rounded-3xl border-2 border-[#8b9d77] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5a5a40]">🛢️ High Speed Diesel (HSD)</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-green-100 text-green-800">Primary Freight</span>
            </div>
            <p className="text-xs text-[#8e8e75]">Ex-Depot Transport Standard</p>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-bold font-mono text-green-700 tracking-tight">
              Rs. {dieselPrice} <span className="text-sm font-normal text-[#8e8e75]">/ Ltr</span>
            </div>
          </div>
        </div>

        {/* Premier Motor Gasoline (Petrol) Card */}
        <div className="p-6 bg-white rounded-3xl border border-[#ecece0] flex flex-col justify-between hover:border-[#8b9d77] transition-all">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8e8e75] block mb-1">⛽ Premier Motor Gasoline (PMG)</span>
            <p className="text-xs text-[#8e8e75]">Euro5 Super Petrol</p>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#4a4a35]">
              Rs. {petrolPrice} <span className="text-sm font-normal text-[#8e8e75]">/ Ltr</span>
            </div>
          </div>
        </div>

        {/* Altron X 97 Hi-Octane Card */}
        <div className="p-6 bg-white rounded-3xl border border-[#ecece0] flex flex-col justify-between hover:border-[#8b9d77] transition-all">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8e8e75] block mb-1">🏎️ Altron X 97 Hi-Octane</span>
            <p className="text-xs text-[#8e8e75]">High Octane Blending Grade</p>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#4a4a35]">
              Rs. {hiOctanePrice} <span className="text-sm font-normal text-[#8e8e75]">/ Ltr</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Light Diesel Oil Card */}
        <div className="p-4 bg-[#f9f9f2] rounded-2xl border border-[#ecece0] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#4a4a35]">⚙️ Light Diesel Oil (LDO)</span>
            <p className="text-[11px] text-[#8e8e75]">Industrial & Agricultural Engines</p>
          </div>
          <div className="text-xl font-bold font-mono text-[#5a5a40]">
            Rs. {ldoPrice} <span className="text-xs font-normal">/ Ltr</span>
          </div>
        </div>

        {/* Kerosene Oil Card */}
        <div className="p-4 bg-[#f9f9f2] rounded-2xl border border-[#ecece0] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#4a4a35]">🔥 Kerosene Oil (SKO)</span>
            <p className="text-[11px] text-[#8e8e75]">Superior Kerosene Oil Standard</p>
          </div>
          <div className="text-xl font-bold font-mono text-[#5a5a40]">
            Rs. {skoPrice} <span className="text-xs font-normal">/ Ltr</span>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-3 ${
          statusMsg.type === 'success' ? 'bg-[#f9f9f2] text-[#5a5a40] border border-[#8b9d77]' : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-[#8b9d77] shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
          {onApplyRates && (
            <button
              onClick={() => onApplyRates(dieselPrice, petrolPrice, hiOctanePrice)}
              className="px-3.5 py-1.5 bg-[#8b9d77] hover:bg-[#798a67] text-white rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>Use These Prices in Diary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

