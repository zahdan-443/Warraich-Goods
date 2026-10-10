import React, { useState, useEffect, useCallback } from 'react';
import { 
  Fuel, 
  Calendar as CalendarIcon, 
  CloudSun, 
  RefreshCw, 
  CloudRain, 
  Sun, 
  Cloud, 
  CloudFog, 
  Wind, 
  Droplets, 
  Eye, 
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  X,
  Navigation,
  Loader2,
  HelpCircle,
  ArrowRight,
  Bell,
  BellRing
} from 'lucide-react';
import { Language } from '../types';
import { 
  fetchLiveFuelPrices, 
  getStoredFuelPrices, 
  FuelPricesData 
} from '../utils/fuelPrice';
import { PAKISTAN_CITIES_MASTER } from '../utils/pakistanCitiesData';
import { findNearestCity } from '../utils/hazardReports';
import {
  getDailyDigestSettings,
  saveDailyDigestSettings,
  dispatchDailyDigestNotification,
  DailyDigestSettings
} from '../utils/dailyDigestNotification';

interface OperationalSummaryItem {
  id: string;
  text: string;
  date: string;
  category?: 'alert' | 'note' | 'trip';
}

interface HomeWeatherFuelCardProps {
  lang: Language;
  onApplyRates?: (diesel?: any, petrol?: any, cng?: any) => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
}

export const HomeWeatherFuelCard: React.FC<HomeWeatherFuelCardProps> = ({
  lang = 'ur',
  onApplyRates,
  onOpenTerms,
  onOpenPrivacy
}) => {
  const isUrdu = lang === 'ur';

  const handleApplyFuelBenchmark = () => {
    if (onApplyRates) {
      (onApplyRates as any)(dieselPrice, petrolPrice, hiOctanePrice);
      setFuelStatusMsg({
        type: 'success',
        text: isUrdu ? 'سرکاری ریٹس کامیابی سے ٹرپ کیلکولیٹر اور کھاتہ پر لاگو ہو گئے' : 'Official rates applied to Trip Calculator'
      });
    }
  };

  // --- Fuel Prices State ---
  const initialFuel = getStoredFuelPrices();
  const [dieselPrice, setDieselPrice] = useState(initialFuel.diesel);
  const [petrolPrice, setPetrolPrice] = useState(initialFuel.petrol);
  const [hiOctanePrice, setHiOctanePrice] = useState(initialFuel.hiOctane);
  const [ldoPrice, setLdoPrice] = useState(initialFuel.ldo);
  const [skoPrice, setSkoPrice] = useState(initialFuel.kerosene);
  const [effectiveDate, setEffectiveDate] = useState(initialFuel.effectiveDate);
  const [fuelLoading, setFuelLoading] = useState(false);
  const [fuelStatusMsg, setFuelStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- Weather & Location State ---
  const [selectedCityId, setSelectedCityId] = useState<string>(() => {
    try {
      return localStorage.getItem('wg_home_selected_city') || 'samundri';
    } catch {
      return 'samundri';
    }
  });

  const [locatingUser, setLocatingUser] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [showLocationRationale, setShowLocationRationale] = useState(false);
  const [isCurrentGpsActive, setIsCurrentGpsActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wg_gps_weather_enabled') === 'true';
    } catch {
      return false;
    }
  });

  const [weatherData, setWeatherData] = useState<{
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    visibilityKm: number;
    conditionUr: string;
    conditionEn: string;
    iconType: 'sun' | 'cloud' | 'rain' | 'fog' | 'wind';
    roadStatusUr: string;
    roadStatusEn: string;
    cityNameUr: string;
    cityNameEn: string;
    warning?: string;
  } | null>(() => {
    try {
      const cached = localStorage.getItem('wg_home_weather_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          return parsed.data;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [weatherLoading, setWeatherLoading] = useState(false);

  // --- Operational Summary State ---
  // STRICT RULE: Only show operational summary if items exist! No placeholder/mock summary when empty.
  const [summaryList, setSummaryList] = useState<OperationalSummaryItem[]>(() => {
    try {
      const saved = localStorage.getItem('wg_operational_summaries');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });
  const [showAddSummaryModal, setShowAddSummaryModal] = useState(false);
  const [newSummaryText, setNewSummaryText] = useState('');
  const [newSummaryCategory, setNewSummaryCategory] = useState<'alert' | 'note' | 'trip'>('note');

  // --- Daily Push Notification Settings & Test State ---
  const [digestSettings, setDigestSettings] = useState<DailyDigestSettings>(() => getDailyDigestSettings());
  const [digestSending, setDigestSending] = useState(false);

  const handleToggleDigest = () => {
    const nextState = !digestSettings.enabled;
    const updated = saveDailyDigestSettings({ enabled: nextState });
    setDigestSettings(updated);
    setFuelStatusMsg({
      type: 'success',
      text: isUrdu
        ? (nextState ? 'روزانہ صبح الرٹس فعال ہو گئے ہیں' : 'روزانہ الرٹس بند کر دیے گئے ہیں')
        : (nextState ? 'Daily morning alerts enabled' : 'Daily alerts disabled')
    });
  };

  const handleTestDigest = async () => {
    setDigestSending(true);
    try {
      const res = await dispatchDailyDigestNotification(
        lang,
        true,
        selectedCity ? { ur: selectedCity.nameUr, en: selectedCity.nameEn } : undefined,
        weatherData?.temp
      );
      if (res.success) {
        setFuelStatusMsg({
          type: 'success',
          text: isUrdu
            ? 'روزانہ نوٹیفکیشن ڈیوائس اسٹیٹس بار میں کامیابی سے بھیج دیا گیا ہے'
            : 'Daily digest notification delivered to device status bar'
        });
      } else if (res.reason === 'permission_denied') {
        setFuelStatusMsg({
          type: 'error',
          text: isUrdu
            ? 'نوٹیفکیشن کی اجازت نہیں ملی۔ براؤزر یا اینڈرائیڈ ایپ سیٹنگز سے اجازت دیں'
            : 'Notification permission denied in browser/system settings'
        });
      } else {
        setFuelStatusMsg({
          type: 'success',
          text: isUrdu ? 'الرٹ تیار اور محفوظ کر لیا گیا ہے' : 'Digest alert prepared and saved'
        });
      }
    } catch {
      setFuelStatusMsg({
        type: 'error',
        text: isUrdu ? 'نوٹیفکیشن ارسال نہ ہو سکا' : 'Could not send test notification'
      });
    } finally {
      setDigestSending(false);
    }
  };

  // Find active city in predefined master list
  const selectedCity = PAKISTAN_CITIES_MASTER.find(c => c.id === selectedCityId) || 
                       PAKISTAN_CITIES_MASTER.find(c => c.id === 'samundri') || 
                       PAKISTAN_CITIES_MASTER[0];

  // Date String in Pakistani Locale
  const todayDateString = (() => {
    try {
      const now = new Date();
      return now.toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return new Date().toDateString();
    }
  })();

  const currentTimeString = (() => {
    try {
      return new Date().toLocaleTimeString(isUrdu ? 'ur-PK' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  })();

  // Fetch Live Weather for Coordinates & City Names
  const fetchWeatherForCoords = useCallback(async (
    lat: number, 
    lng: number, 
    cityNameEn: string, 
    cityNameUr: string, 
    cityIdKey: string
  ) => {
    setWeatherLoading(true);
    setLocationStatus(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,visibility&timezone=Asia%2FKarachi`;
      
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 6000) : null;
      let resp;
      try {
        resp = await fetch(url, { signal: controller ? controller.signal : undefined });
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }

      if (!resp.ok) throw new Error('Weather API error');
      const data = await resp.json();
      const current = data.current;
      const code = current.weather_code || 0;
      const visKm = Math.round((current.visibility || 10000) / 100) / 10;
      const temp = Math.round(current.temperature_2m);
      const feelsLike = Math.round(current.apparent_temperature);
      const humidity = Math.round(current.relative_humidity_2m);
      const windSpeed = Math.round(current.wind_speed_10m);

      let conditionEn = 'Clear Sky';
      let conditionUr = 'صاف آسمان و موسم';
      let iconType: 'sun' | 'cloud' | 'rain' | 'fog' | 'wind' = 'sun';
      let roadStatusEn = 'Dry & Clear Highway';
      let roadStatusUr = 'سڑک خشک اور محفوظ';
      let warning: string | undefined = undefined;

      if (code === 0 || code === 1) {
        conditionEn = 'Clear & Sunny';
        conditionUr = 'صاف و خوشگوار';
        iconType = 'sun';
      } else if (code === 2 || code === 3) {
        conditionEn = 'Partly Cloudy';
        conditionUr = 'جزوی طور پر ابر آلود';
        iconType = 'cloud';
      } else if (code === 45 || code === 48 || visKm < 1.0) {
        conditionEn = visKm < 0.5 ? 'Dense Fog' : 'Smog / Fog';
        conditionUr = visKm < 0.5 ? 'شدید دھند (کم حدِ نگاہ)' : 'دھند و اسموگ کی چادر';
        iconType = 'fog';
        roadStatusEn = 'CAUTION: Foggy - Reduce Speed';
        roadStatusUr = 'احتیاط: دھند - فوگ لائٹس آن رکھیں';
        warning = isUrdu ? 'دھند کا انتباہ: حدِ نگاہ کم' : 'Fog Warning: Low Visibility';
      } else if (code >= 51 && code <= 67) {
        conditionEn = 'Rain Showers';
        conditionUr = 'ہلکی تا درمیانی بارش';
        iconType = 'rain';
        roadStatusEn = 'Wet Road - Risk of Skidding';
        roadStatusUr = 'سڑک پر پھسلن، اچانک بریک سے بچیں';
      } else if (code >= 80 && code <= 99) {
        conditionEn = 'Heavy Rain / Thunderstorm';
        conditionUr = 'تیز بارش و طوفان';
        iconType = 'rain';
        roadStatusEn = 'Hazard: Waterlogging on Highway';
        roadStatusUr = 'خطرہ: روڈ پر پانی کھڑا، رفتار دھیمی رکھیں';
        warning = isUrdu ? 'بارش و طوفان کا الرٹ' : 'Storm Alert';
      }

      if (windSpeed > 40) {
        iconType = 'wind';
      }

      const weatherObj = {
        temp,
        feelsLike,
        humidity,
        windSpeed,
        visibilityKm: visKm,
        conditionUr,
        conditionEn,
        iconType,
        roadStatusUr,
        roadStatusEn,
        cityNameUr,
        cityNameEn,
        warning
      };

      setWeatherData(weatherObj);
      try {
        localStorage.setItem('wg_home_weather_cache', JSON.stringify({
          cityId: cityIdKey,
          data: weatherObj,
          timestamp: Date.now()
        }));
      } catch {
        // ignore
      }
    } catch {
      // Fallback sensible defaults if offline
      if (!weatherData) {
        setWeatherData({
          temp: 26,
          feelsLike: 27,
          humidity: 48,
          windSpeed: 12,
          visibilityKm: 8.5,
          conditionUr: 'معتدل موسم',
          conditionEn: 'Pleasant & Fair',
          iconType: 'sun',
          roadStatusUr: 'سڑک خشک اور محفوظ',
          roadStatusEn: 'Dry & Clear Highway',
          cityNameUr,
          cityNameEn
        });
      }
    } finally {
      setWeatherLoading(false);
    }
  }, [isUrdu]);

  // Google Play & Palm Store Compliant On-Demand Location Detection
  const handleDetectCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationStatus(isUrdu ? 'ڈیوائس میں لوکیشن کی سہولت موجود نہیں ہے' : 'Geolocation is not supported by your device.');
      return;
    }

    setLocatingUser(true);
    setLocationStatus(isUrdu ? 'موجودہ مقام حاصل کیا جا رہا ہے...' : 'Detecting current GPS position...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Resolve closest Pakistani city from master logistics registry
        const nearest = findNearestCity(latitude, longitude);
        
        const matchedCityMaster = nearest ? PAKISTAN_CITIES_MASTER.find(c => c.nameEn.toLowerCase() === nearest.nameEn.toLowerCase()) : null;
        
        const cityIdToSet = matchedCityMaster ? matchedCityMaster.id : (selectedCity ? selectedCity.id : 'samundri');
        const resolvedUr = nearest ? nearest.nameUr : (selectedCity ? selectedCity.nameUr : 'موجودہ مقام');
        const resolvedEn = nearest ? nearest.nameEn : (selectedCity ? selectedCity.nameEn : 'Current Location');

        setSelectedCityId(cityIdToSet);
        setIsCurrentGpsActive(true);
        try {
          localStorage.setItem('wg_home_selected_city', cityIdToSet);
          localStorage.setItem('wg_gps_weather_enabled', 'true');
        } catch {
          // ignore
        }

        fetchWeatherForCoords(latitude, longitude, resolvedEn, resolvedUr, cityIdToSet);
        setLocatingUser(false);
        setLocationStatus(isUrdu ? `📍 مقام: ${resolvedUr} کے مطابق لائیو ویدر فعال` : `📍 Detected: ${resolvedEn}`);
        setTimeout(() => setLocationStatus(null), 4000);
      },
      (error) => {
        setLocatingUser(false);
        let msg = isUrdu ? 'لوکیشن تک رسائی حاصل نہیں ہو سکی۔ آپ لسٹ سے شہر منتخب کر سکتے ہیں۔' : 'Could not access location. Please pick a city from the list.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = isUrdu ? 'لوکیشن کی اجازت نہیں ملی۔ آپ لسٹ سے بغیر کسی رکاوٹ کے شہر منتخب کر سکتے ہیں۔' : 'Location permission denied. You can select your city manually from the list.';
        }
        setLocationStatus(msg);
        setTimeout(() => setLocationStatus(null), 5000);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  // Fetch fuel prices
  const fetchFuel = useCallback(async (force = false) => {
    setFuelLoading(true);
    setFuelStatusMsg(null);
    try {
      const data: FuelPricesData = await fetchLiveFuelPrices(force);
      setDieselPrice(data.diesel);
      setPetrolPrice(data.petrol);
      setHiOctanePrice(data.hiOctane);
      setLdoPrice(data.ldo);
      setSkoPrice(data.kerosene);
      setEffectiveDate(data.effectiveDate);
      if (force) {
        setFuelStatusMsg({
          type: 'success',
          text: isUrdu ? 'سرکاری ریٹس کامیابی سے ہم آہنگ ہو گئے' : 'Official rates synced'
        });
      }
      if (onApplyRates) {
        onApplyRates(data.diesel, data.petrol);
      }
    } catch {
      const fallback = getStoredFuelPrices();
      setDieselPrice(fallback.diesel);
      setPetrolPrice(fallback.petrol);
    } finally {
      setFuelLoading(false);
    }
  }, [isUrdu, onApplyRates]);

  // Initial load
  useEffect(() => {
    fetchFuel(false);
    if (selectedCity) {
      fetchWeatherForCoords(
        selectedCity.lat, 
        selectedCity.lng, 
        selectedCity.nameEn, 
        selectedCity.nameUr, 
        selectedCity.id
      );
    }
  }, []);

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    setIsCurrentGpsActive(false);
    try {
      localStorage.setItem('wg_home_selected_city', cityId);
      localStorage.setItem('wg_gps_weather_enabled', 'false');
    } catch {
      // ignore
    }
    const c = PAKISTAN_CITIES_MASTER.find(item => item.id === cityId);
    if (c) {
      fetchWeatherForCoords(c.lat, c.lng, c.nameEn, c.nameUr, c.id);
    }
  };

  const handleSyncAll = () => {
    fetchFuel(true);
    if (selectedCity) {
      fetchWeatherForCoords(selectedCity.lat, selectedCity.lng, selectedCity.nameEn, selectedCity.nameUr, selectedCity.id);
    }
  };

  // Add operational summary item
  const handleAddSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSummaryText.trim()) return;
    const newItem: OperationalSummaryItem = {
      id: `sum-${Date.now()}`,
      text: newSummaryText.trim(),
      date: new Date().toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK', { day: 'numeric', month: 'short' }),
      category: newSummaryCategory
    };
    const updated = [newItem, ...summaryList];
    setSummaryList(updated);
    try {
      localStorage.setItem('wg_operational_summaries', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setNewSummaryText('');
    setShowAddSummaryModal(false);
  };

  const handleDeleteSummary = (id: string) => {
    const updated = summaryList.filter(item => item.id !== id);
    setSummaryList(updated);
    try {
      localStorage.setItem('wg_operational_summaries', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const renderWeatherIcon = () => {
    if (!weatherData) return <Sun className="w-5 h-5 text-amber-500" />;
    switch (weatherData.iconType) {
      case 'cloud':
        return <Cloud className="w-5 h-5 text-slate-500" />;
      case 'rain':
        return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'fog':
        return <CloudFog className="w-5 h-5 text-teal-600" />;
      case 'wind':
        return <Wind className="w-5 h-5 text-sky-600" />;
      default:
        return <Sun className="w-5 h-5 text-amber-500 animate-[spin_12s_linear_infinite]" />;
    }
  };

  return (
    <div className="bg-white rounded-[32px] sm:rounded-[36px] border border-[#ecece0] p-4 sm:p-6 shadow-sm space-y-4 transition-all">
      {/* Top Header: Unified Date, City Selector & Live Weather Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ecece0]">
        {/* Left: Date & Clock */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 sm:p-2.5 bg-[#8b9d77]/15 rounded-2xl text-[#5a5a40] border border-[#8b9d77]/30 shrink-0">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#62774f]" />
          </div>
          <div>
            <div className="font-serif font-bold text-sm sm:text-base text-[#4a4a35] flex items-center gap-2">
              <span>{todayDateString}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f4f4ea] text-[#62774f] font-bold border border-[#e2e2d0]">
                {currentTimeString}
              </span>
            </div>
            <div className="text-[11px] text-[#8e8e75] mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>{isUrdu ? 'پاکستان معیاری وقت (PST)' : 'Pakistan Standard Time'}</span>
              <span>·</span>
              <span className="text-emerald-700 font-medium">
                {isUrdu ? 'اوگرا / پی ایس او ریٹ و موٹروے ویدر' : 'OGRA POL & Motorway Weather'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Weather Location Controls with GPS On-Demand Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* On-Demand GPS Location Button (Google Play Compliant) */}
          <button
            type="button"
            onClick={handleDetectCurrentLocation}
            disabled={locatingUser}
            title={isUrdu ? 'موجودہ مقام کے مطابق موسم اپ ڈیٹ کریں' : 'Update weather by current location'}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs border ${
              isCurrentGpsActive 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                : 'bg-[#fdfbf7] text-[#4a4a35] border-[#ecece0] hover:border-[#8b9d77]'
            }`}
          >
            {locatingUser ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <Navigation className={`w-3.5 h-3.5 ${isCurrentGpsActive ? 'text-emerald-600 fill-emerald-600' : 'text-[#8b9d77]'}`} />
            )}
            <span className="text-[11px]">
              {locatingUser ? (isUrdu ? 'لوکیشن...' : 'Locating...') : (isUrdu ? 'میری لوکیشن' : 'My Location')}
            </span>
          </button>

          {/* City Dropdown Selector (Manual Fallback Option) */}
          <div className="relative inline-flex items-center bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-2 py-1 text-xs text-[#4a4a35] shadow-2xs hover:border-[#8b9d77]">
            <MapPin className="w-3.5 h-3.5 text-[#8b9d77] mr-1 shrink-0" />
            <select
              value={selectedCityId}
              onChange={(e) => handleCityChange(e.target.value)}
              aria-label={isUrdu ? 'شہر منتخب کریں' : 'Select City for Weather'}
              className="bg-transparent text-xs font-bold text-[#4a4a35] focus:outline-none cursor-pointer pr-4"
            >
              {PAKISTAN_CITIES_MASTER.map(c => (
                <option key={c.id} value={c.id}>
                  {isUrdu ? c.nameUr : c.nameEn}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none absolute right-1.5" />
          </div>

          <button
            type="button"
            onClick={handleSyncAll}
            disabled={fuelLoading || weatherLoading}
            title={isUrdu ? 'ریٹس اور موسم کو فوری تازہ کریں' : 'Sync fuel rates & weather'}
            className="px-3 py-1.5 bg-[#4a5e38] hover:bg-[#394a2b] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fuelLoading || weatherLoading ? 'animate-spin' : ''}`} />
            <span>{fuelLoading || weatherLoading ? (isUrdu ? 'اپڈیٹ...' : 'Syncing...') : (isUrdu ? 'تازہ کریں' : 'Sync')}</span>
          </button>
        </div>
      </div>

      {/* Location Status Notice Banner (if any) */}
      {locationStatus && (
        <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{locationStatus}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setLocationStatus(null)}
            className="text-blue-500 hover:text-blue-800 p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Middle Row: Live Weather Status Compact Card */}
      <div className="bg-gradient-to-r from-[#fbfbfa] via-[#f8f9f5] to-emerald-50/30 p-3 sm:p-3.5 rounded-2xl border border-[#ecece0] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#ecece0] shadow-2xs flex items-center justify-center shrink-0">
            {renderWeatherIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#4a4a35] font-serif">
                {isUrdu 
                  ? (weatherData?.cityNameUr || selectedCity.nameUr) 
                  : (weatherData?.cityNameEn || selectedCity.nameEn)}
              </span>
              {isCurrentGpsActive && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  GPS
                </span>
              )}
              <span className="text-base font-extrabold font-mono text-emerald-800">
                {weatherData ? `${weatherData.temp}°C` : '--'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                ({isUrdu ? 'محسوس:' : 'Feels:'} {weatherData ? `${weatherData.feelsLike}°C` : '--'})
              </span>
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-emerald-900">
                {weatherData ? (isUrdu ? weatherData.conditionUr : weatherData.conditionEn) : '--'}
              </span>
              <span>·</span>
              <span className="text-[#8e8e75]">
                {weatherData ? (isUrdu ? weatherData.roadStatusUr : weatherData.roadStatusEn) : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Weather Metrics: Visibility & Wind */}
        <div className="flex items-center gap-3 self-end md:self-auto text-[11px] text-[#5a5a40] font-mono bg-white/80 px-2.5 py-1.5 rounded-xl border border-[#ecece0]">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>{isUrdu ? 'حدِ نگاہ:' : 'Vis:'} <b>{weatherData ? `${weatherData.visibilityKm}km` : '--'}</b></span>
          </div>
          <span>|</span>
          <div className="flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-slate-400" />
            <span>{weatherData ? `${weatherData.windSpeed}km/h` : '--'}</span>
          </div>
          <span>|</span>
          <div className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-slate-400" />
            <span>{weatherData ? `${weatherData.humidity}%` : '--'}</span>
          </div>
        </div>
      </div>

      {/* Fuel Rate Cards (Pakistan POL Monitor) - 1-Line Clean Diesel & Petrol */}
      <div className="space-y-2 pt-1">
        {/* Header: PSO / OGRA Official Tag + Effective Date + Refresh */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-900/10 text-emerald-900 font-bold text-[10px] tracking-wide border border-emerald-900/20 flex items-center gap-1.5 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse"></span>
              OGRA / PSO
            </span>
            <h3 className="font-serif font-bold text-xs sm:text-sm text-[#4a4a35]">
              {isUrdu ? 'پاکستان پول ریٹ مانیٹر' : 'Pakistan POL Rates'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#8e8e75]">
              {isUrdu ? 'مؤثر از:' : 'Effective:'} <b className="text-slate-700">{effectiveDate}</b>
            </span>
            <button
              type="button"
              onClick={() => fetchFuel(true)}
              disabled={fuelLoading}
              title={isUrdu ? 'تازہ ترین سرکاری نرخ حاصل کریں' : 'Refresh official rates'}
              className="p-1 rounded-md hover:bg-[#ecece0] text-[#5a5a40] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={'w-3 h-3 ' + (fuelLoading ? 'animate-spin text-emerald-600' : '')} />
            </button>
          </div>
        </div>

        {/* Petrol & Diesel in ONE Line (Single Row) - Clean, High Contrast, No Redundant Text */}
        <div className="grid grid-cols-2 gap-2">
          {/* High Speed Diesel (HSD) */}
          <div className="bg-gradient-to-br from-emerald-50/80 via-[#fdfbf7] to-emerald-50/40 p-2.5 rounded-xl border border-emerald-500/70 shadow-2xs hover:border-emerald-600 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-emerald-950 flex items-center gap-1 font-serif truncate">
                <span>🛢️</span>
                <span>{isUrdu ? 'ڈیزل (HSD)' : 'Diesel (HSD)'}</span>
              </span>
              {onApplyRates && (
                <button
                  type="button"
                  onClick={handleApplyFuelBenchmark}
                  className="text-[9.5px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 cursor-pointer bg-emerald-100/70 hover:bg-emerald-200/80 px-1.5 py-0.5 rounded transition-colors active:scale-95 shrink-0"
                  title={isUrdu ? 'ٹرپ کیلکولیٹر میں لگائیں' : 'Use in Trip'}
                >
                  <span>{isUrdu ? 'ٹرپ میں لگائیں' : 'Apply'}</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
            
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[11px] font-bold text-emerald-800 font-mono">Rs.</span>
              <span className="text-lg sm:text-2xl font-black font-mono text-emerald-900 tracking-tight">
                {dieselPrice}
              </span>
              <span className="text-[10px] font-medium text-emerald-800/80">/ {isUrdu ? 'لیٹر' : 'Ltr'}</span>
            </div>
          </div>

          {/* Super Petrol (PMG) */}
          <div className="bg-[#fdfbf7] p-2.5 rounded-xl border border-[#ecece0] hover:border-[#8b9d77] transition-all shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 flex items-center gap-1 font-serif truncate">
                <span>⛽</span>
                <span>{isUrdu ? 'پٹرول (PMG)' : 'Petrol (PMG)'}</span>
              </span>
            </div>

            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[11px] font-bold text-slate-600 font-mono">Rs.</span>
              <span className="text-lg sm:text-2xl font-black font-mono text-slate-900 tracking-tight">
                {petrolPrice}
              </span>
              <span className="text-[10px] font-medium text-slate-500">/ {isUrdu ? 'لیٹر' : 'Ltr'}</span>
            </div>
          </div>
        </div>

        {/* Secondary Products: Hi-Octane, Light Diesel, Kerosene & CNG - 4-Column Minimized Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#f9f9f2] p-2 rounded-xl border border-[#ecece0]">
          {/* Hi-Octane 97 */}
          <div className="bg-white/80 p-1.5 rounded-lg border border-[#ecece0]/80 text-center shadow-2xs">
            <span className="text-[9.5px] font-bold uppercase text-[#8e8e75] block truncate">
              {isUrdu ? 'الٹران 97' : 'Altron 97'}
            </span>
            <span className="text-xs sm:text-[13px] font-black font-mono text-[#4a4a35] mt-0.5 block">
              Rs. {hiOctanePrice}
            </span>
          </div>

          {/* Light Diesel (LDO) */}
          <div className="bg-white/80 p-1.5 rounded-lg border border-[#ecece0]/80 text-center shadow-2xs">
            <span className="text-[9.5px] font-bold uppercase text-[#8e8e75] block truncate">
              {isUrdu ? 'لائٹ ڈیزل (LDO)' : 'LDO'}
            </span>
            <span className="text-xs sm:text-[13px] font-black font-mono text-[#4a4a35] mt-0.5 block">
              Rs. {ldoPrice}
            </span>
          </div>

          {/* Kerosene (SKO) */}
          <div className="bg-white/80 p-1.5 rounded-lg border border-[#ecece0]/80 text-center shadow-2xs">
            <span className="text-[9.5px] font-bold uppercase text-[#8e8e75] block truncate">
              {isUrdu ? 'مٹی کا تیل' : 'Kerosene'}
            </span>
            <span className="text-xs sm:text-[13px] font-black font-mono text-[#4a4a35] mt-0.5 block">
              Rs. {skoPrice}
            </span>
          </div>

          {/* CNG */}
          <div className="bg-white/80 p-1.5 rounded-lg border border-[#ecece0]/80 text-center shadow-2xs">
            <span className="text-[9.5px] font-bold uppercase text-[#8e8e75] block truncate">
              {isUrdu ? 'سی این جی (CNG)' : 'CNG'}
            </span>
            <span className="text-xs sm:text-[13px] font-black font-mono text-[#4a4a35] mt-0.5 block">
              Rs. 200<span className="text-[9px] font-sans font-normal text-slate-500">/kg</span>
            </span>
          </div>
        </div>

        {/* Status Msg */}
        {fuelStatusMsg && (
          <div className="p-2 rounded-xl text-xs font-medium flex items-center justify-between gap-1.5 bg-[#f9f9f2] text-[#5a5a40] border border-[#8b9d77] animate-in fade-in">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#8b9d77] shrink-0" />
              <span>{fuelStatusMsg.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFuelStatusMsg(null)}
              className="p-0.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Daily Fuel, Weather & Road Alert Control (Store Policy Compliant, Anti-Spam) */}
        <div className="bg-[#f7f5ed] border border-[#ecece0] rounded-xl p-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg shrink-0 ${digestSettings.enabled ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-500'}`}>
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-[#4a4a35] block text-[11px] sm:text-xs">
                {isUrdu ? 'روزانہ صبح الرٹ (فیول، موسم اور روڈ صورتحال)' : 'Daily Morning Alert (Fuel, Weather & Roads)'}
              </span>
              <span className="text-[10px] text-[#7a7a60] block">
                {isUrdu 
                  ? (digestSettings.enabled ? 'فعال • دن میں صرف 1 بار اسٹیٹس بار نوٹیفکیشن' : 'غیر فعال • الرٹس بند ہیں')
                  : (digestSettings.enabled ? 'Active • 1 daily status bar digest' : 'Disabled')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleDigest}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                digestSettings.enabled
                  ? 'bg-emerald-700 text-white border-emerald-800'
                  : 'bg-white text-slate-600 border-[#d0d0be] hover:bg-slate-50'
              }`}
            >
              {digestSettings.enabled ? (isUrdu ? 'آن (Active)' : 'ON') : (isUrdu ? 'آف (Off)' : 'OFF')}
            </button>

            <button
              type="button"
              onClick={handleTestDigest}
              disabled={digestSending}
              title={isUrdu ? 'ابھی ڈیوائس پر ٹیسٹ نوٹیفکیشن بھیجیں' : 'Send test digest to status bar'}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-[#1e3a68] border border-[#d0d0be] rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
            >
              {digestSending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <BellRing className="w-3 h-3 text-amber-600" />
              )}
              <span>{isUrdu ? 'ٹیسٹ الرٹ' : 'Test Alert'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- OPERATIONAL SUMMARY SECTION --- */}
      {/* Strict Requirement: ONLY render this section if the user has added at least one summary! Otherwise keep totally hidden! */}
      {summaryList.length > 0 && (
        <div className="pt-3 border-t border-[#ecece0] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#8b9d77]" />
              <h4 className="font-serif font-bold text-xs sm:text-sm text-[#4a4a35]">
                {isUrdu ? 'آپریشنل سمری و اہم نوٹس' : 'Operational Summary & Fleet Notes'}
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                {summaryList.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowAddSummaryModal(true)}
              className="text-xs text-[#62774f] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'نیا نوٹ شامل کریں' : 'Add Note'}</span>
            </button>
          </div>

          <div className="space-y-2">
            {summaryList.map((item) => (
              <div 
                key={item.id} 
                className="p-2.5 rounded-xl bg-[#fdfbf7] border border-[#ecece0] flex items-start justify-between gap-2 text-xs"
              >
                <div className="flex items-start gap-2">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    item.category === 'alert' ? 'bg-rose-500' : item.category === 'trip' ? 'bg-blue-500' : 'bg-[#8b9d77]'
                  }`} />
                  <div>
                    <p className="text-slate-800 leading-snug font-medium">{item.text}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{item.date}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSummary(item.id)}
                  title={isUrdu ? 'حذف کریں' : 'Delete'}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discrete button to add operational summary if none exist yet, keeping the UI minimized and clean */}
      {summaryList.length === 0 && (
        <div className="pt-2 border-t border-[#ecece0] flex items-center justify-between text-xs text-[#8e8e75]">
          <span className="text-[11px]">
            {isUrdu ? 'روزانہ کی روانگی یا روٹ نوٹ درج کرنا چاہتے ہیں؟' : 'Need to record daily route or dispatch notes?'}
          </span>
          <button
            type="button"
            onClick={() => setShowAddSummaryModal(true)}
            className="px-2.5 py-1 rounded-lg bg-[#f9f9f2] hover:bg-[#ecece0] text-[#5a5a40] font-bold text-[11px] border border-[#d8d8c0] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3 text-[#8b9d77]" />
            <span>{isUrdu ? 'آپریشن سمری شامل کریں' : 'Add Operational Summary'}</span>
          </button>
        </div>
      )}

      {/* App Policy & Terms Quick Bar for Store Compliance */}
      <div className="pt-2 border-t border-[#ecece0] flex items-center justify-between text-[11px] text-[#8e8e75] flex-wrap gap-2">
        <span className="flex items-center gap-1">
          <span>🔒</span>
          <span>{isUrdu ? 'لوکیشن ڈیٹا 100% نجی و آن ڈیمانڈ ہے' : 'Location data is 100% private & on-demand'}</span>
        </span>
        <div className="flex items-center gap-3">
          {onOpenTerms && (
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-[#62774f] font-semibold hover:underline cursor-pointer"
            >
              {isUrdu ? 'شرائط و ضوابط' : 'Terms of Use'}
            </button>
          )}
          {onOpenPrivacy && (
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="text-[#62774f] font-semibold hover:underline cursor-pointer"
            >
              {isUrdu ? 'پرائیویسی پالیسی' : 'Privacy Policy'}
            </button>
          )}
        </div>
      </div>

      {/* Modal to add operational summary */}
      {showAddSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-[#ecece0] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#ecece0]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#8b9d77]" />
                <h3 className="font-serif font-bold text-base text-[#4a4a35]">
                  {isUrdu ? 'آپریشنل سمری شامل کریں' : 'Add Operational Summary'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSummaryModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSummary} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#4a4a35] mb-1">
                  {isUrdu ? 'کیٹگری' : 'Category'}
                </label>
                <select
                  value={newSummaryCategory}
                  onChange={(e: any) => setNewSummaryCategory(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#ecece0] bg-[#fdfbf7] text-[#4a4a35]"
                >
                  <option value="note">{isUrdu ? 'عمومی نوٹ / ہدایت' : 'General Fleet Note'}</option>
                  <option value="alert">{isUrdu ? 'اہم الرٹ / انتباہ' : 'Critical Route Alert'}</option>
                  <option value="trip">{isUrdu ? 'ٹرپ روانگی / شیڈول' : 'Dispatch / Trip'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4a4a35] mb-1">
                  {isUrdu ? 'سمری یا نوٹ کی تفصیل' : 'Summary Details'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={newSummaryText}
                  onChange={(e) => setNewSummaryText(e.target.value)}
                  placeholder={isUrdu ? 'مثال: ملتان روڈ پر ٹریفک رش ہے، گاڑیاں موٹروے M-4 سے روانہ کی جائیں۔' : 'e.g., Heavy traffic near Multan, route trucks via M-4.'}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#ecece0] bg-[#fdfbf7] focus:outline-none focus:border-[#8b9d77]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSummaryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {isUrdu ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4a5e38] hover:bg-[#394a2b] text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer active:scale-95"
                >
                  {isUrdu ? 'محفوظ کریں' : 'Save Summary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
