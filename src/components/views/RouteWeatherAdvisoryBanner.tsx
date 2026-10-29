import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Wind, 
  CloudRain, 
  CloudLightning, 
  RefreshCw, 
  X, 
  WifiOff, 
  Clock, 
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Language } from '../../types';
import { TransitCity, LiveWeatherData } from './MapView';

interface RouteWeatherAdvisoryBannerProps {
  lang: Language;
  routeCities: TransitCity[];
  weatherMap: Record<string, LiveWeatherData>;
  loadingWeather: boolean;
  weatherFetchError: boolean;
  weatherCachedTimestamp: number | null;
  originCity: TransitCity;
  destCity: TransitCity;
  onRefreshWeather: () => void;
}

interface AtRiskCity {
  city: TransitCity;
  weather: LiveWeatherData;
  isThunderstorm: boolean;
  isRain: boolean;
  isHighWind: boolean;
  windSpeed: number;
  precipitationProbability: number;
  precipitationMm: number;
}

export const RouteWeatherAdvisoryBanner: React.FC<RouteWeatherAdvisoryBannerProps> = ({
  lang,
  routeCities,
  weatherMap,
  loadingWeather,
  weatherFetchError,
  weatherCachedTimestamp,
  originCity,
  destCity,
  onRefreshWeather
}) => {
  const isUrdu = lang === 'ur';
  const routeKey = `${originCity.id}_${destCity.id}`;

  // Session-based dismissal tracking (persists during the session so re-visiting the same route doesn't annoy the driver)
  const [dismissedRoutes, setDismissedRoutes] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem('wg_dismissed_weather_advisories');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const isDismissed = dismissedRoutes.includes(routeKey);

  const handleDismiss = () => {
    if (!dismissedRoutes.includes(routeKey)) {
      const updated = [...dismissedRoutes, routeKey];
      setDismissedRoutes(updated);
      try {
        sessionStorage.setItem('wg_dismissed_weather_advisories', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  const handleRestore = () => {
    const updated = dismissedRoutes.filter(k => k !== routeKey);
    setDismissedRoutes(updated);
    try {
      sessionStorage.setItem('wg_dismissed_weather_advisories', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Human-readable stale time formatting
  const getStaleTimeText = (timestamp: number | null) => {
    if (!timestamp) return null;
    const diffMs = Math.max(0, Date.now() - timestamp);
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return isUrdu ? 'ابھی ابھی' : 'Just now';
    if (mins === 1) return isUrdu ? '1 منٹ پہلے' : '1 minute ago';
    if (mins < 60) return isUrdu ? `${mins} منٹ پہلے` : `${mins} minutes ago`;
    const hours = Math.floor(mins / 60);
    return isUrdu ? `${hours} گھنٹے پہلے` : `${hours} hours ago`;
  };

  const staleTimeLabel = getStaleTimeText(weatherCachedTimestamp);
  const totalCachedCities = Object.keys(weatherMap).length;
  const isCompletelyUnavailable = totalCachedCities === 0 && !loadingWeather;

  // 1. Analyze for cargo-relevant risk along route sequence
  // Risks: Precipitation probability >= 40% OR precipitation > 0 mm / rain codes, Wind speed >= 30 km/h, Thunderstorm/heavy rain codes
  const atRiskCities: AtRiskCity[] = [];

  routeCities.forEach(city => {
    const w = weatherMap[city.id];
    if (!w) return;

    const precipProb = w.precipitationProbability ?? (w.precipitationMm > 0 ? 80 : 0);
    const isThunderstorm = (w.weatherCode >= 95 && w.weatherCode <= 99) || w.weatherCode === 65 || w.weatherCode === 82;
    const isRain = precipProb >= 40 || 
                   w.precipitationMm > 0 || 
                   w.rainWarning || 
                   (w.weatherCode >= 51 && w.weatherCode <= 67) || 
                   (w.weatherCode >= 80 && w.weatherCode <= 82) || 
                   (w.weatherCode >= 71 && w.weatherCode <= 77);
    const isHighWind = w.windSpeed >= 30;

    if (isThunderstorm || isRain || isHighWind) {
      atRiskCities.push({
        city,
        weather: w,
        isThunderstorm,
        isRain,
        isHighWind,
        windSpeed: w.windSpeed,
        precipitationProbability: precipProb,
        precipitationMm: w.precipitationMm
      });
    }
  });

  const hasRisk = atRiskCities.length > 0;

  // 2. Build concise advisory summary text in English & Urdu listing only at-risk cities in route sequence
  const buildAdvisorySummary = () => {
    if (!hasRisk) {
      return {
        titleEn: 'All Clear Along Route',
        titleUr: 'روٹ پر تمام اسٹیشنز محفوظ و صاف',
        descEn: 'All clear along the route — dry road conditions & normal winds for cargo transit across all checkpoints.',
        descUr: 'روٹ پر تمام مقامات پر موسم بالکل صاف ہے — کارگو ترسیل کے لیے سڑک خشک اور ہوائیں معمول کے مطابق ہیں۔',
        actionEn: 'Normal driving conditions. Cargo loads require standard securing.',
        actionUr: 'معمول کے مطابق سفر۔ سامان کو روٹین کے مطابق محفوظ رکھیں۔'
      };
    }

    // Build specific at-risk listings
    if (atRiskCities.length === 1) {
      const item = atRiskCities[0];
      const nameEn = item.city.nameEn;
      const nameUr = item.city.nameUr;

      if (item.isThunderstorm) {
        return {
          titleEn: `Thunderstorm Alert Near ${nameEn}`,
          titleUr: `${nameUr} کے قریب طوفانی بارش و گرج چمک`,
          descEn: `Severe thunderstorm and heavy rain near ${nameEn} — ensure watertight tarpaulin (tirpal) & drive with caution.`,
          descUr: `${nameUr} کے قریب طوفانی بارش اور گرج چمک — ترپال کو واٹر پروف انداز میں کس کر باندھیں اور رفتار دھیمی رکھیں۔`,
          actionEn: 'Watertight tarpaulin coverage required. Watch for waterlogged road surfaces.',
          actionUr: 'ترپال واٹر پروف ہونا ضروری ہے۔ سڑک پر پانی کھڑا ہونے سے محتاط رہیں۔'
        };
      }

      if (item.isRain && item.isHighWind) {
        return {
          titleEn: `Rain & High Winds Near ${nameEn}`,
          titleUr: `${nameUr} کے قریب بارش اور تیز ہوائیں`,
          descEn: `Possible rain & high winds near ${nameEn} (${item.windSpeed} km/h) — secure load tie-downs and cover with tarpaulin.`,
          descUr: `${nameUr} کے قریب بارش اور تیز ہوا (${item.windSpeed} کلومیٹر/گھنٹہ) — کارگو رسیاں کس لیں اور سامان پر ترپال ڈھانپیں۔`,
          actionEn: 'Double-check rope tension & cover the load against water ingress.',
          actionUr: 'رسیاں ڈبل چیک کریں اور ترپال کے کونوں کو مضبوطی سے باندھیں۔'
        };
      }

      if (item.isRain) {
        return {
          titleEn: `Rain Risk Near ${nameEn}`,
          titleUr: `${nameUr} کے قریب بارش کا امکان`,
          descEn: `Possible rain near ${nameEn} (${item.precipitationProbability}% chance) — consider covering the load (tarpaulin).`,
          descUr: `${nameUr} کے قریب بارش کا امکان (${item.precipitationProbability}%) — کارگو پر ترپال (tirpal) اچھی طرح کس کر باندھیں۔`,
          actionEn: 'Cover freight load with tarpaulin to prevent water damage.',
          actionUr: 'سامان کو بھیگنے سے بچانے کے لیے ترپال اچھی طرح کس کر باندھیں۔'
        };
      }

      // High Wind only
      return {
        titleEn: `High Winds Near ${nameEn}`,
        titleUr: `${nameUr} کے قریب تیز ہوائیں`,
        descEn: `High winds near ${nameEn} (${item.windSpeed} km/h) — check load stability & strap tension on open highway.`,
        descUr: `${nameUr} کے قریب تیز ہوائیں (${item.windSpeed} کلومیٹر/گھنٹہ) — اوپن ہائی وے پر لوڈ کا توازن اور رسیاں چیک کریں۔`,
        actionEn: 'Inspect cargo straps and drive with steady two-handed steering.',
        actionUr: 'تیز ہواؤں میں گاڑی کی رفتار کنٹرول میں رکھیں اور رسیوں کا کھنچاؤ چیک کریں۔'
      };
    }

    // Multiple at-risk cities along the route (ordered by sequence)
    const cityPartsEn = atRiskCities.map(item => {
      const riskTypes = [];
      if (item.isThunderstorm) riskTypes.push('Thunderstorm');
      else if (item.isRain) riskTypes.push(`Rain ${item.precipitationProbability}%`);
      if (item.isHighWind) riskTypes.push(`Wind ${item.windSpeed} km/h`);
      return `${item.city.nameEn} (${riskTypes.join(', ')})`;
    });

    const cityPartsUr = atRiskCities.map(item => {
      const riskTypes = [];
      if (item.isThunderstorm) riskTypes.push('طوفانی بارش');
      else if (item.isRain) riskTypes.push(`بارش ${item.precipitationProbability}%`);
      if (item.isHighWind) riskTypes.push(`تیز ہوا ${item.windSpeed}km/h`);
      return `${item.city.nameUr} [${riskTypes.join('، ')}]`;
    });

    const hasAnyRain = atRiskCities.some(c => c.isRain || c.isThunderstorm);
    const hasAnyWind = atRiskCities.some(c => c.isHighWind);

    let adviceEn = 'Secure load tie-downs carefully.';
    let adviceUr = 'کارگو کو احتیاط سے محفوظ کریں۔';

    if (hasAnyRain && hasAnyWind) {
      adviceEn = 'Cover load with tarpaulin (tirpal) and secure all cargo straps firmly.';
      adviceUr = 'سامان پر ترپال اچھی طرح کس لیں اور تمام رسیاں مضبوطی سے باندھیں۔';
    } else if (hasAnyRain) {
      adviceEn = 'Cover the load with tarpaulin to prevent cargo water damage.';
      adviceUr = 'سامان کو بھیگنے سے بچانے کے لیے ترپال اچھی طرح ڈھانپیں۔';
    } else if (hasAnyWind) {
      adviceEn = 'Inspect cargo tie-downs and exercise caution against highway crosswinds.';
      adviceUr = 'رسیاں چیک کریں اور ہائی وے پر تیز کراس ونڈز سے باخبر رہیں۔';
    }

    return {
      titleEn: `Weather Advisory: ${atRiskCities.length} Route Checkpoints at Risk`,
      titleUr: `موسمی ایڈوائزری: روٹ کے ${atRiskCities.length} اسٹیشنز پر احتیاط درکار`,
      descEn: `${cityPartsEn.join(' ➔ ')} — ${adviceEn}`,
      descUr: `${cityPartsUr.join(' ⟵ ')} — ${adviceUr}`,
      actionEn: adviceEn,
      actionUr: adviceUr
    };
  };

  const advisory = buildAdvisorySummary();

  // If dismissed by user in this session, show a clean, unobtrusive chip that allows restoring if desired
  if (isDismissed) {
    return (
      <div className={`flex items-center justify-between px-3 py-1.5 rounded-xl border text-xs transition-all ${
        hasRisk
          ? 'bg-amber-50/70 border-amber-200 text-amber-900'
          : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-center gap-2">
          {hasRisk ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          )}
          <span className="font-bold text-[11px]">
            {isUrdu ? advisory.titleUr : advisory.titleEn}
          </span>
          {weatherFetchError && staleTimeLabel && (
            <span className="text-[9px] text-amber-800 bg-amber-100/80 px-1 py-0.5 rounded">
              {staleTimeLabel}
            </span>
          )}
        </div>
        <button
          onClick={handleRestore}
          className="text-[10px] font-bold underline hover:opacity-80 flex items-center gap-0.5 cursor-pointer"
        >
          <span>{isUrdu ? 'دوبارہ دیکھیں' : 'Show'}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // 5. STALE DATA & COMPLETELY UNAVAILABLE STATE HANDLING
  if (isCompletelyUnavailable) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-2.5 sm:p-3 text-rose-950 shadow-2xs relative overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-700">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xs text-rose-900">
                {isUrdu ? 'موسمی ڈیٹا دستیاب نہیں' : 'Weather unavailable'}
              </h3>
              <p className="text-[10px] text-rose-800">
                {isUrdu
                  ? 'ہائی وے روٹ پر کنکشن کمزور ہونے کی وجہ سے ڈیٹا لوڈ نہیں ہوا۔'
                  : 'Weak connection along highway route.'}
              </p>
            </div>
          </div>
          <button
            onClick={onRefreshWeather}
            disabled={loadingWeather}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold transition-colors cursor-pointer shadow-2xs disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3 h-3 ${loadingWeather ? 'animate-spin' : ''}`} />
            <span>{isUrdu ? 'دوبارہ کوشش' : 'Retry'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`rounded-xl border px-3 py-2 shadow-2xs transition-all relative ${
        hasRisk
          ? 'bg-amber-50/95 dark:bg-[#2a1d08] border-amber-300 dark:border-amber-600/60 text-amber-950 dark:text-amber-100'
          : 'bg-emerald-50/95 dark:bg-[#0d281a] border-emerald-300 dark:border-emerald-700/70 text-emerald-950 dark:text-emerald-100'
      }`}
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* Top Banner Row: Badge, Title, Refresh, Dismiss */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border ${
              hasRisk 
                ? 'bg-amber-200/90 dark:bg-amber-900/80 border-amber-400 dark:border-amber-600 text-amber-950 dark:text-amber-200' 
                : 'bg-emerald-200/90 dark:bg-emerald-900/80 border-emerald-400 dark:border-emerald-600 text-emerald-950 dark:text-emerald-200'
            }`}>
              {isUrdu ? (hasRisk ? '⚠️ کارگو رسک ایڈوائزری' : '✅ کلیئر روٹ') : (hasRisk ? '⚠️ Cargo Weather Advisory' : '✅ Clear Route')}
            </span>

            <span className="font-serif font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              {isUrdu ? advisory.titleUr : advisory.titleEn}
            </span>

            {weatherFetchError && staleTimeLabel && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-600">
                <Clock className="w-2.5 h-2.5 text-amber-700 dark:text-amber-300" />
                <span>{staleTimeLabel}</span>
              </span>
            )}
          </div>

          <p className="text-[11px] sm:text-xs leading-snug text-slate-800 dark:text-emerald-100 font-medium pt-0.5">
            {isUrdu ? advisory.descUr : advisory.descEn}
          </p>
        </div>

        {/* Small Action Icons */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={onRefreshWeather}
            disabled={loadingWeather}
            title={isUrdu ? 'موسمی ڈیٹا ریفریش کریں' : 'Refresh live weather'}
            className="p-1 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${loadingWeather ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleDismiss}
            title={isUrdu ? 'عارضی بند کریں' : 'Dismiss'}
            className="p-1 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss advisory banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* At-risk city chips (Only shown if hasRisk) */}
      {hasRisk && (
        <div className="mt-1.5 pt-1.5 border-t border-amber-200/80 dark:border-amber-700/60 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-amber-900 dark:text-amber-200">
            {isUrdu ? 'متاثرہ اسٹیشنز:' : 'At-Risk Stops:'}
          </span>

          {atRiskCities.map((item, idx) => (
            <div 
              key={item.city.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/90 dark:bg-[#1f1606] border border-amber-300 dark:border-amber-600 text-[10px] font-medium text-amber-950 dark:text-amber-100 shadow-2xs"
            >
              <span className="font-bold">
                {idx + 1}. {isUrdu ? item.city.nameUr : item.city.nameEn}
              </span>
              
              {item.isThunderstorm && (
                <span className="text-rose-700 dark:text-rose-300 font-bold text-[9px] bg-rose-50 dark:bg-rose-950/80 px-1 rounded">
                  {isUrdu ? 'طوفان' : 'Storm'}
                </span>
              )}

              {item.isRain && !item.isThunderstorm && (
                <span className="text-blue-700 dark:text-blue-300 font-bold text-[9px] bg-blue-50 dark:bg-blue-950/80 px-1 rounded">
                  {item.precipitationProbability}% {isUrdu ? 'بارش' : 'Rain'}
                </span>
              )}

              {item.isHighWind && (
                <span className="text-amber-800 dark:text-amber-300 font-bold text-[9px] bg-amber-50 dark:bg-amber-950/80 px-1 rounded">
                  {item.windSpeed}k/h
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Driver Disclaimer Note */}
      <div className={`mt-1.5 pt-1 border-t border-dashed ${hasRisk ? 'border-amber-200 dark:border-amber-700/50 text-amber-800/90 dark:text-amber-200' : 'border-emerald-200 dark:border-emerald-700/50 text-emerald-800/90 dark:text-emerald-200'} flex items-center justify-between text-[10px]`}>
        <span className="leading-tight">
          {isUrdu
            ? 'ℹ️ یہ مشورہ صرف سامان و کارگو کی حفاظت کے لیے ہے۔ روٹ کا حتمی فیصلہ مکمل طور پر ڈرائیور کا ہے۔'
            : 'ℹ️ Advisory is for cargo safety only. Final route decision rests with the driver.'}
        </span>
        <span className="hidden sm:inline-block font-mono text-[9px] opacity-75 shrink-0">
          {routeCities.length} {isUrdu ? 'اسٹیشنز چیک شدہ' : 'checked'}
        </span>
      </div>
    </div>
  );
};
