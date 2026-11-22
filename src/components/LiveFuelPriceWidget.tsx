import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Fuel, CheckCircle2, AlertCircle, AlertTriangle, ArrowRight, ExternalLink, Calendar, Edit3, RotateCcw } from 'lucide-react';
import { Language } from '../types';
import {
  fetchLiveFuelPrices,
  getStoredFuelPrices,
  setManualFuelPrices,
  clearManualFuelPrices,
  FuelPricesData
} from '../utils/fuelPrice';

interface LiveFuelPriceWidgetProps {
  lang?: Language;
  onApplyRates?: (diesel: string, petrol: string, cng?: string) => void;
  compact?: boolean;
}

export const LiveFuelPriceWidget: React.FC<LiveFuelPriceWidgetProps> = ({
  lang = 'ur',
  onApplyRates,
  compact = false
}) => {
  const initial = getStoredFuelPrices();
  const [dieselPrice, setDieselPrice] = useState(initial.diesel);
  const [petrolPrice, setPetrolPrice] = useState(initial.petrol);
  const [hiOctanePrice, setHiOctanePrice] = useState(initial.hiOctane);
  const [ldoPrice, setLdoPrice] = useState(initial.ldo);
  const [skoPrice, setSkoPrice] = useState(initial.kerosene);
  const [effectiveDate, setEffectiveDate] = useState(initial.effectiveDate);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(Boolean(initial.isManualOverride));
  const [isStale, setIsStale] = useState<boolean>(Boolean(initial.isStale));
  const [stalenessDays, setStalenessDays] = useState<number>(initial.stalenessDays || 0);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [customApiUrl, setCustomApiUrl] = useState<string>('');
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualDieselInput, setManualDieselInput] = useState(initial.diesel);
  const [manualPetrolInput, setManualPetrolInput] = useState(initial.petrol);
  const [manualError, setManualError] = useState<string>('');

  const applyPriceState = useCallback((data: FuelPricesData) => {
    setDieselPrice(data.diesel);
    setPetrolPrice(data.petrol);
    setHiOctanePrice(data.hiOctane);
    setLdoPrice(data.ldo);
    setSkoPrice(data.kerosene);
    setEffectiveDate(data.effectiveDate);
    setIsManualOverride(Boolean(data.isManualOverride));
    setIsStale(Boolean(data.isStale));
    setStalenessDays(data.stalenessDays || 0);
    setManualDieselInput(data.diesel);
    setManualPetrolInput(data.petrol);
  }, []);

  const fetchLivePrices = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setStatusMsg(null);

    try {
      const customUrl = customApiUrl.trim() || undefined;
      const data: FuelPricesData = await fetchLiveFuelPrices(forceRefresh, customUrl);
      applyPriceState(data);

      setStatusMsg({
        type: data.isFallback || data.isStale ? 'error' : 'success',
        text: data.isManualOverride
          ? (lang === 'ur'
              ? `پمپ کا دستی ریٹ فعال ہے (${data.effectiveDate})`
              : `Manual pump override active (${data.effectiveDate})`)
          : data.isFallback
          ? (lang === 'ur'
              ? `لائیو فیڈ دستیاب نہیں — آخری محفوظ / سرکاری ریٹ فعال ہے (${data.effectiveDate})`
              : `Live feed offline — last-known-good / official rate active (${data.effectiveDate})`)
          : (lang === 'ur'
              ? `لائیو ریٹس ہم آہنگ ہو گئے (نوٹیفکیشن: ${data.effectiveDate})`
              : `Live fuel prices synced (Effective: ${data.effectiveDate})`)
      });

      if (onApplyRates) {
        onApplyRates(data.diesel, data.petrol);
      }
    } catch (error) {
      console.warn('Fuel price fetch fallback:', error);
      const fallback = getStoredFuelPrices();
      applyPriceState(fallback);
      setStatusMsg({
        type: 'error',
        text: lang === 'ur' ? 'آف لائن بیک اپ ریٹس فعال ہیں' : 'Offline backup benchmark active'
      });
    } finally {
      setLoading(false);
    }
  }, [lang, onApplyRates, customApiUrl, applyPriceState]);

  useEffect(() => {
    fetchLivePrices(false);

    const handleGlobalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<FuelPricesData>;
      if (customEvent.detail) {
        applyPriceState(customEvent.detail);
      }
    };

    window.addEventListener('fuelPricesUpdated', handleGlobalUpdate);
    return () => window.removeEventListener('fuelPricesUpdated', handleGlobalUpdate);
  }, [fetchLivePrices, applyPriceState]);

  const handleUpdatePrices = () => {
    fetchLivePrices(true);
  };

  const handleSaveManualOverride = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');
    try {
      const saved = setManualFuelPrices({
        diesel: manualDieselInput,
        petrol: manualPetrolInput
      });
      applyPriceState(saved);
      setShowManualForm(false);
      setStatusMsg({
        type: 'success',
        text: lang === 'ur'
          ? `دستی پمپ ریٹ محفوظ ہو گیا: ڈیزل ${saved.diesel} / پٹرول ${saved.petrol}`
          : `Manual pump rates saved: Diesel Rs.${saved.diesel} / Petrol Rs.${saved.petrol}`
      });
      if (onApplyRates) {
        onApplyRates(saved.diesel, saved.petrol);
      }
    } catch {
      setManualError(
        lang === 'ur'
          ? 'براہِ کرم 100 سے 1000 روپے فی لیٹر کے درمیان درست قیمت درج کریں۔'
          : 'Enter valid PKR fuel rates between 100 and 1000 per liter.'
      );
    }
  };

  const handleClearManualOverride = () => {
    const reverted = clearManualFuelPrices();
    applyPriceState(reverted);
    setShowManualForm(false);
    setManualError('');
    setStatusMsg({
      type: 'success',
      text: lang === 'ur' ? 'آٹو سرکاری ریٹس بحال کر دیے گئے۔' : 'Resumed automatic PSO / OGRA rates.'
    });
    if (onApplyRates) {
      onApplyRates(reverted.diesel, reverted.petrol);
    }
    fetchLivePrices(true);
  };

  const staleWarningBanner = isStale && !isManualOverride ? (
    <div
      data-testid="fuel-stale-warning"
      className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-wrap items-center justify-between gap-2"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          {lang === 'ur'
            ? `یہ فیول ریٹس ${stalenessDays} دن پرانے ہیں (${effectiveDate}) — براہِ کرم ریفریش کریں یا پمپ کا نیا ریٹ درج کریں۔`
            : `Cached rates are ${stalenessDays} days old (${effectiveDate}). Sync live rates or set manual pump rates.`}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setShowManualForm(true)}
        className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] cursor-pointer"
      >
        {lang === 'ur' ? 'پمپ ریٹ درج کریں' : 'Set Pump Rate'}
      </button>
    </div>
  ) : null;

  const manualOverrideForm = showManualForm ? (
    <form
      onSubmit={handleSaveManualOverride}
      className="p-3.5 bg-[#fdfbf7] rounded-2xl border border-[#8b9d77]/60 space-y-3 animate-fadeIn"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#4a4a35]">
          {lang === 'ur' ? 'مقامی پمپ فیول ریٹ خود درج کریں' : 'Manual Pump Fuel Rate Override (PKR / Ltr)'}
        </span>
        {isManualOverride && (
          <button
            type="button"
            onClick={handleClearManualOverride}
            className="text-[11px] font-bold text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{lang === 'ur' ? 'آٹو بحال کریں' : 'Resume Auto-Sync'}</span>
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <label className="text-[11px] font-bold text-[#5a5a40] block">
          <span>{lang === 'ur' ? 'ہائی اسپیڈ ڈیزل (HSD)' : 'High Speed Diesel (HSD)'}</span>
          <input
            type="number"
            step="0.01"
            min="100"
            max="1000"
            required
            value={manualDieselInput}
            onChange={(e) => setManualDieselInput(e.target.value)}
            className="mt-1 w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#ecece0] rounded-xl focus:outline-none focus:border-[#8b9d77]"
          />
        </label>
        <label className="text-[11px] font-bold text-[#5a5a40] block">
          <span>{lang === 'ur' ? 'سپر پٹرول (PMG)' : 'Super Petrol (PMG)'}</span>
          <input
            type="number"
            step="0.01"
            min="100"
            max="1000"
            required
            value={manualPetrolInput}
            onChange={(e) => setManualPetrolInput(e.target.value)}
            className="mt-1 w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#ecece0] rounded-xl focus:outline-none focus:border-[#8b9d77]"
          />
        </label>
      </div>
      {manualError && <p className="text-[11px] font-bold text-rose-700">{manualError}</p>}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setShowManualForm(false)}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
        >
          {lang === 'ur' ? 'منسوخ' : 'Cancel'}
        </button>
        <button
          type="submit"
          className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
        >
          {lang === 'ur' ? 'محفوظ کریں' : 'Save Pump Rates'}
        </button>
      </div>
    </form>
  ) : null;

  if (compact) {
    return (
      <div dir={lang === 'ur' ? 'rtl' : 'ltr'} className="bg-white rounded-3xl border border-[#ecece0] p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#ecece0]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-800 border border-emerald-200/60 shadow-2xs">
              <Fuel className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="font-serif font-bold text-base text-[#4a4a35] flex flex-wrap items-center gap-2">
                <span>{lang === 'ur' ? 'پاکستان سرکاری پول ریٹس' : 'Official Pakistan Fuel Rates (PSO / OGRA)'}</span>
                {isManualOverride ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                    {lang === 'ur' ? 'دستی پمپ ریٹ' : 'Manual Rate'}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    {lang === 'ur' ? 'سرکاری نوٹیفکیشن' : 'Official'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#8e8e75] mt-0.5">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-[#8b9d77]" />
                  <span>{lang === 'ur' ? 'مؤثر از:' : 'Effective:'} <b>{effectiveDate}</b></span>
                </span>
                <span>·</span>
                <a
                  href="https://psopk.com/fuel-prices/pol/archives"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:underline flex items-center gap-0.5 font-mono"
                >
                  <span>psopk.com</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowManualForm((prev) => !prev)}
              className="px-3 py-1.5 bg-[#fdfbf7] hover:bg-[#f0f0e4] text-[#5a5a40] border border-[#ecece0] rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{lang === 'ur' ? 'دستی ریٹ' : 'Manual'}</span>
            </button>
            <button
              type="button"
              onClick={handleUpdatePrices}
              disabled={loading}
              className="px-3.5 py-1.5 bg-[#4a5e38] hover:bg-[#394a2b] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? (lang === 'ur' ? 'اپڈیٹ ہو رہا ہے...' : 'Updating...') : (lang === 'ur' ? 'ریٹس تازہ کریں' : 'Sync Live Rates')}</span>
            </button>
          </div>
        </div>

        {staleWarningBanner}
        {manualOverrideForm}

        {/* Primary High-Impact Rates: High Speed Diesel & Super Petrol */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* High Speed Diesel Card (Primary Freight Driver) */}
          <div className="bg-gradient-to-br from-emerald-50/80 via-[#fdfbf7] to-emerald-50/40 dark:from-[#0d281a] dark:via-[#16181e] dark:to-[#0d281a] p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/80 dark:border-emerald-600/70 shadow-2xs space-y-1 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 font-serif">
                <span>🛢️</span>
                <span>{lang === 'ur' ? 'ہائی اسپیڈ ڈیزل (HSD)' : 'High Speed Diesel (HSD)'}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                {lang === 'ur' ? 'روڈ فریٹ پرائمری' : 'Freight Benchmark'}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">Rs.</span>
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-800 dark:text-emerald-200 tracking-tight">
                {dieselPrice}
              </span>
              <span className="text-xs font-medium text-emerald-700/80 dark:text-emerald-300">/ {lang === 'ur' ? 'لیٹر' : 'Ltr'}</span>
            </div>

            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/90 pt-1">
              {lang === 'ur'
                ? 'تمام ٹرپ کیلکولیشنز اور گاڑی حساب کے لیے نافذ العمل ریٹ'
                : 'Primary active benchmark for all trip calculations & vehicle ledger'}
            </p>
          </div>

          {/* Premier Petrol (PMG) */}
          <div className="bg-[#fdfbf7] dark:bg-[#1a1c22] p-4 sm:p-5 rounded-2xl border border-[#ecece0] dark:border-[#2d313b] hover:border-[#8b9d77] dark:hover:border-slate-500 transition-all shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5 font-serif">
                <span>⛽</span>
                <span>{lang === 'ur' ? 'پریمیئر موٹر پٹرول' : 'Premier Petrol (PMG)'}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {lang === 'ur' ? 'سپر پٹرول' : 'Super Petrol'}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                {lang === 'ur' ? 'روپے' : 'Rs.'}
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-800 dark:text-white tracking-tight">
                {petrolPrice}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">/ {lang === 'ur' ? 'لیٹر' : 'Ltr'}</span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              {lang === 'ur'
                ? 'اوگرا کی جانب سے مقرر کردہ اوپن مارکیٹ فیول ریٹ'
                : 'Official retail rate notified by OGRA / Government of Pakistan'}
            </p>
          </div>
        </div>

        {/* Secondary Row: Altron Hi-Octane, Light Diesel Oil, Kerosene Oil */}
        <div className="grid grid-cols-3 gap-2 bg-[#f9f9f2] p-3 rounded-2xl border border-[#ecece0] text-center">
          <div className="p-1">
            <span className="text-[10px] font-bold uppercase text-[#8e8e75] block">
              {lang === 'ur' ? 'الٹران 97' : 'Altron X 97'}
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-[#4a4a35] mt-0.5 block">
              {lang === 'ur' ? 'روپے' : 'Rs.'} {hiOctanePrice}
            </span>
          </div>
          <div className="border-x border-[#ecece0] p-1">
            <span className="text-[10px] font-bold uppercase text-[#8e8e75] block">
              {lang === 'ur' ? 'لائٹ ڈیزل' : 'Light Diesel (LDO)'}
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-[#4a4a35] mt-0.5 block">
              {lang === 'ur' ? 'روپے' : 'Rs.'} {ldoPrice}
            </span>
          </div>
          <div className="p-1">
            <span className="text-[10px] font-bold uppercase text-[#8e8e75] block">
              {lang === 'ur' ? 'مٹی کا تیل' : 'Kerosene (SKO)'}
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-[#4a4a35] mt-0.5 block">
              {lang === 'ur' ? 'روپے' : 'Rs.'} {skoPrice}
            </span>
          </div>
        </div>

        {/* Action button to apply rate to Trip Calculator if callback provided */}
        {onApplyRates && (
          <div className="pt-1 flex items-center justify-end">
            <button
              type="button"
              onClick={() => onApplyRates(dieselPrice, petrolPrice)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
            >
              <span>{lang === 'ur' ? 'یہ ریٹ ٹرپ کیلکولیٹر میں لگائیں' : 'Apply to Trip Calculator'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
    <div dir={lang === 'ur' ? 'rtl' : 'ltr'} className="bg-white rounded-[32px] border border-[#ecece0] p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ecece0] pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8b9d77]/20 text-[#5a5a40] uppercase tracking-wider">
              {isManualOverride
                ? (lang === 'ur' ? '● دستی پمپ ریٹ فعال ہے' : '● Manual Pump Override Active')
                : (lang === 'ur' ? '● سرکاری پی ایس او ریٹ مانیٹر' : '● Official PSO POL Archives Monitor')}
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
          <div className="text-2xl md:text-3xl font-serif font-bold text-[#4a4a35] mt-1">
            {lang === 'ur' ? 'پی ایس او پاکستان فیول نرخ' : 'Official PSO Retail POL Rates'}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowManualForm((prev) => !prev)}
            className="text-xs font-sans text-[#5a5a40] hover:text-[#363626] underline px-2 py-1 cursor-pointer"
          >
            {showManualForm ? (lang === 'ur' ? 'دستی فارم بند کریں' : 'Hide Manual') : (lang === 'ur' ? 'پمپ ریٹ خود درج کریں' : 'Manual Pump Rate')}
          </button>
          <button
            type="button"
            onClick={() => setShowApiConfig(!showApiConfig)}
            className="text-xs font-sans text-[#8e8e75] hover:text-[#4a4a35] underline px-2 py-1 cursor-pointer"
          >
            {showApiConfig
              ? (lang === 'ur' ? 'سیٹنگ چھپائیں' : 'Hide API Config')
              : (lang === 'ur' ? '⚙️ کسٹم لنک' : '⚙️ Custom API URL')}
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

      {staleWarningBanner}
      {manualOverrideForm}

      {showApiConfig && (
        <div className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#ecece0] space-y-2 animate-fadeIn">
          <label htmlFor="custom-fuel-api-url" className="block text-xs font-bold text-[#5a5a40]">
            {lang === 'ur' ? 'کسٹم ایندھن اے پی آئی لنک (اختیاری):' : 'Custom Backend API endpoint URL (Optional):'}
          </label>
          <div className="flex gap-2">
            <input
              id="custom-fuel-api-url"
              type="url"
              aria-label={lang === 'ur' ? 'کسٹم اے پی آئی لنک' : 'Custom Backend API endpoint URL'}
              placeholder="https://api.example.com/fuel"
              value={customApiUrl}
              onChange={(e) => setCustomApiUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-[#ecece0] rounded-xl focus:outline-none focus:border-[#8b9d77]"
            />
          </div>
          <p className="text-[11px] text-[#5a5a40]">
            {lang === 'ur'
              ? 'خالی چھوڑنے پر ریٹس خودکار طریقے سے پی ایس او آرکائیو سے حاصل کیے جائیں گے۔'
              : 'If left blank, clicks on "Sync PSO Rates" will fetch directly according to PSO POL Archives (psopk.com/fuel-prices/pol/archives).'}
          </p>
        </div>
      )}

      {/* Main Big Price Display - All 5 Official POL Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* High Speed Diesel Card */}
        <div className="p-6 bg-[#fdfbf7] rounded-3xl border-2 border-[#8b9d77] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5a5a40]">
                {lang === 'ur' ? '🛢️ ہائی اسپیڈ ڈیزل' : '🛢️ High Speed Diesel (HSD)'}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-green-100 text-green-800">
                {lang === 'ur' ? 'بنیادی فریٹ' : 'Primary Freight'}
              </span>
            </div>
            <p className="text-xs text-[#8e8e75]">
              {lang === 'ur' ? 'ٹرانسپورٹ معیاری ریٹ' : 'Ex-Depot Transport Standard'}
            </p>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-bold font-mono text-green-700 tracking-tight">
              {lang === 'ur' ? 'روپے' : 'Rs.'} {dieselPrice}{' '}
              <span className="text-sm font-normal text-[#8e8e75]">/ {lang === 'ur' ? 'لیٹر' : 'Ltr'}</span>
            </div>
          </div>
        </div>

        {/* Premier Motor Gasoline (Petrol) Card */}
        <div className="p-6 bg-white rounded-3xl border border-[#ecece0] flex flex-col justify-between hover:border-[#8b9d77] transition-all">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8e8e75] block mb-1">
              {lang === 'ur' ? '⛽ پریمیئر موٹر پٹرول' : '⛽ Premier Motor Gasoline (PMG)'}
            </span>
            <p className="text-xs text-[#8e8e75]">
              {lang === 'ur' ? 'یورو 5 سپر پٹرول' : 'Euro5 Super Petrol'}
            </p>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#4a4a35]">
              {lang === 'ur' ? 'روپے' : 'Rs.'} {petrolPrice}{' '}
              <span className="text-sm font-normal text-[#8e8e75]">/ {lang === 'ur' ? 'لیٹر' : 'Ltr'}</span>
            </div>
          </div>
        </div>

        {/* Altron X 97 Hi-Octane Card */}
        <div className="p-6 bg-white rounded-3xl border border-[#ecece0] flex flex-col justify-between hover:border-[#8b9d77] transition-all">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8e8e75] block mb-1">
              {lang === 'ur' ? '🏎️ الٹران 97 ہائی آکٹین' : '🏎️ Altron X 97 Hi-Octane'}
            </span>
            <p className="text-xs text-[#8e8e75]">
              {lang === 'ur' ? 'ہائی آکٹین گریڈ' : 'High Octane Blending Grade'}
            </p>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#4a4a35]">
              {lang === 'ur' ? 'روپے' : 'Rs.'} {hiOctanePrice}{' '}
              <span className="text-sm font-normal text-[#8e8e75]">/ {lang === 'ur' ? 'لیٹر' : 'Ltr'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Light Diesel Oil Card */}
        <div className="p-4 bg-[#f9f9f2] rounded-2xl border border-[#ecece0] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#4a4a35]">
              {lang === 'ur' ? '⚙️ لائٹ ڈیزل آئل' : '⚙️ Light Diesel Oil (LDO)'}
            </span>
            <p className="text-[11px] text-[#8e8e75]">
              {lang === 'ur' ? 'صنعتی اور زرعی انجن' : 'Industrial & Agricultural Engines'}
            </p>
          </div>
          <div className="text-xl font-bold font-mono text-[#5a5a40]">
            {lang === 'ur' ? 'روپے' : 'Rs.'} {ldoPrice}{' '}
            <span className="text-xs font-normal">/ {lang === 'ur' ? 'لیٹر' : 'Ltr'}</span>
          </div>
        </div>

        {/* Kerosene Oil Card */}
        <div className="p-4 bg-[#f9f9f2] rounded-2xl border border-[#ecece0] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#4a4a35]">
              {lang === 'ur' ? '🔥 مٹی کا تیل' : '🔥 Kerosene Oil (SKO)'}
            </span>
            <p className="text-[11px] text-[#8e8e75]">
              {lang === 'ur' ? 'معیاری کیروسین آئل' : 'Superior Kerosene Oil Standard'}
            </p>
          </div>
          <div className="text-xl font-bold font-mono text-[#5a5a40]">
            {lang === 'ur' ? 'روپے' : 'Rs.'} {skoPrice}{' '}
            <span className="text-xs font-normal">/ {lang === 'ur' ? 'لیٹر' : 'Ltr'}</span>
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
              <span>{lang === 'ur' ? 'یہ نرخ ٹرپ میں لگائیں' : 'Use These Prices in Diary'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
