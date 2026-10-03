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
      <div className={`flex items-center justify-between px-3.5 py-2 rounded-2xl border text-xs transition-all ${
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
          <span className="font-bold">
            {isUrdu ? advisory.titleUr : advisory.titleEn}
          </span>
          {weatherFetchError && staleTimeLabel && (
            <span className="text-[10px] text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded-md">
              {isUrdu ? `(سابقہ ڈیٹا: ${staleTimeLabel})` : `(Cached: ${staleTimeLabel})`}
            </span>
          )}
        </div>
        <button
          onClick={handleRestore}
          className="text-[11px] font-bold underline hover:opacity-80 flex items-center gap-1 cursor-pointer"
        >
          <span>{isUrdu ? 'دوبارہ دیکھیں' : 'Show Banner'}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // 5. STALE DATA & COMPLETELY UNAVAILABLE STATE HANDLING
  if (isCompletelyUnavailable) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-4 sm:p-5 text-rose-950 shadow-sm relative overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-700">
            <WifiOff className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-bold text-sm sm:text-base text-rose-900">
              {isUrdu ? 'موسمی ڈیٹا دستیاب نہیں — انٹرنیٹ کنکشن چیک کریں' : 'Weather unavailable — check your connection'}
            </h3>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
              {isUrdu
                ? 'ہائی وے روٹ پر کمزور سگنلز یا نیٹ ورک تعطل کی وجہ سے تازہ موسمی ڈیٹا حاصل نہیں ہو سکا۔'
                : 'Unable to fetch weather along the highway corridor due to weak connection or network timeout.'}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={onRefreshWeather}
                disabled={loadingWeather}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingWeather ? 'animate-spin' : ''}`} />
                <span>{isUrdu ? 'دوبارہ کوشش کریں' : 'Retry Weather'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`rounded-3xl border p-4 sm:p-5 shadow-xs transition-all relative overflow-hidden ${
        hasRisk
          ? 'bg-gradient-to-r from-amber-50/95 via-amber-50 to-orange-50/90 border-amber-300 text-amber-950'
          : 'bg-gradient-to-r from-emerald-50/95 via-emerald-50 to-teal-50/90 border-emerald-300 text-emerald-950'
      }`}
    >
      {/* Top Banner Row: Icon, Title, Stale Warning, Dismiss '✕' Button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div 
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              hasRisk 
                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            {hasRisk ? (
              <AlertTriangle className="w-5 h-5 text-amber-700 animate-pulse" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                hasRisk 
                  ? 'bg-amber-200/80 border-amber-400/60 text-amber-900' 
                  : 'bg-emerald-200/80 border-emerald-400/60 text-emerald-900'
              }`}>
                {isUrdu ? (hasRisk ? '⚠️ کارگو رسک ایڈوائزری' : '✅ کلیئر روٹ') : (hasRisk ? '⚠️ Cargo Weather Advisory' : '✅ Clear Route')}
              </span>

              {/* 5. Stale Data Warning Tag */}
              {weatherFetchError && staleTimeLabel && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  <Clock className="w-3 h-3 text-amber-700" />
                  <span>
                    {isUrdu 
                      ? `تازہ ڈیٹا نہ مل سکا — سابقہ محفوظ موسم (${staleTimeLabel})` 
                      : `Could not refresh — showing last known weather (${staleTimeLabel})`}
                  </span>
                </span>
              )}

              {!weatherFetchError && staleTimeLabel && (
                <span className="text-[10px] text-slate-500 font-sans">
                  {isUrdu ? `اپڈیٹ: ${staleTimeLabel}` : `Updated: ${staleTimeLabel}`}
                </span>
              )}
            </div>

            <h3 className="font-serif font-bold text-sm sm:text-base mt-1 text-slate-900">
              {isUrdu ? advisory.titleUr : advisory.titleEn}
            </h3>

            {/* 2. Short Advisory Summary in English & Urdu listing only at-risk cities */}
            <p className="text-xs sm:text-sm mt-1 leading-relaxed text-slate-800 font-medium">
              {isUrdu ? advisory.descUr : advisory.descEn}
            </p>
          </div>
        </div>

        {/* 4. DISMISSIBLE: Small '✕' button */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onRefreshWeather}
            disabled={loadingWeather}
            title={isUrdu ? 'موسمی ڈیٹا ریفریش کریں' : 'Refresh live weather'}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-black/5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingWeather ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleDismiss}
            title={isUrdu ? 'اس روٹ کے لیے عارضی بند کریں' : 'Dismiss for this route search'}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Dismiss advisory banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* At-risk city chips (Ordered strictly by route sequence) */}
      {hasRisk && (
        <div className="mt-3 pt-3 border-t border-amber-200/70 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
            <span>{isUrdu ? 'متاثرہ اسٹاپ پوائنٹس (ترتیب روٹ):' : 'At-Risk Stops (Route Order):'}</span>
          </span>

          {atRiskCities.map((item, idx) => (
            <div 
              key={item.city.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/90 border border-amber-300 text-xs font-medium text-amber-950 shadow-2xs"
            >
              <span className="font-bold text-[#4a4a35]">
                {idx + 1}. {isUrdu ? item.city.nameUr : item.city.nameEn}
              </span>
              
              {item.isThunderstorm && (
                <span className="inline-flex items-center gap-0.5 text-rose-700 font-bold text-[10px] bg-rose-50 px-1.5 py-0.5 rounded-md">
                  <CloudLightning className="w-3 h-3 text-rose-600" />
                  <span>{isUrdu ? 'طوفان' : 'Storm'}</span>
                </span>
              )}

              {item.isRain && !item.isThunderstorm && (
                <span className="inline-flex items-center gap-0.5 text-blue-700 font-bold text-[10px] bg-blue-50 px-1.5 py-0.5 rounded-md">
                  <CloudRain className="w-3 h-3 text-blue-600" />
                  <span>{item.precipitationProbability}% {isUrdu ? 'بارش' : 'Rain'}</span>
                </span>
              )}

              {item.isHighWind && (
                <span className="inline-flex items-center gap-0.5 text-amber-800 font-bold text-[10px] bg-amber-50 px-1.5 py-0.5 rounded-md">
                  <Wind className="w-3 h-3 text-amber-700" />
                  <span>{item.windSpeed} km/h</span>
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 6. Non-rerouting disclaimer: Informational only, driver decides */}
      <div className={`mt-2.5 flex items-center justify-between text-[10px] ${hasRisk ? 'text-amber-800/90' : 'text-emerald-800/90'}`}>
        <span>
          {isUrdu
            ? 'ℹ️ یہ مشورہ صرف سامان و کارگو کی حفاظت کے لیے ہے۔ روٹ کا حتمی فیصلہ مکمل طور پر ڈرائیور کا ہے۔'
            : 'ℹ️ Advisory is for cargo safety only. The driver maintains complete discretion over routing.'}
        </span>
        <span className="hidden sm:inline-block font-mono text-[9px] opacity-75">
          {isUrdu ? `${routeCities.length} اسٹیشنز چیک شدہ` : `${routeCities.length} waypoints checked`}
        </span>
      </div>
    </div>
  );
};
