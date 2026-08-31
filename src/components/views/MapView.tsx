import React, { useEffect, useState, useRef, useMemo, useTransition } from 'react';
import { 
  Language, 
  DICTIONARY, 
  ActiveTab 
} from '../../types';
import { 
  Map as MapIcon, 
  CloudRain, 
  Sun, 
  Cloud, 
  Wind, 
  Eye, 
  Compass, 
  Navigation, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRightLeft, 
  Layers, 
  RefreshCw, 
  Share2, 
  Calculator, 
  Clock, 
  ShieldAlert, 
  Maximize2, 
  Crosshair,
  ChevronDown,
  Info,
  Droplets,
  Thermometer,
  CloudFog,
  Sparkles
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  lang: Language;
  onNavigate: (tab: ActiveTab) => void;
  onOpenTollCalc?: (fromCity?: string, toCity?: string) => void;
}

// Major Transport Hubs and Waypoints across Pakistan
export interface TransitCity {
  id: string;
  nameEn: string;
  nameUr: string;
  provinceEn: string;
  provinceUr: string;
  lat: number;
  lng: number;
  elevationMeters: number;
  highways: string[];
}

export const PAKISTAN_CITIES: TransitCity[] = [
  { id: 'lahore', nameEn: 'Lahore', nameUr: 'لاہور', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 31.5204, lng: 74.3587, elevationMeters: 217, highways: ['M-2', 'M-3', 'M-11', 'N-5'] },
  { id: 'karachi', nameEn: 'Karachi', nameUr: 'کراچی', provinceEn: 'Sindh', provinceUr: 'سندھ', lat: 24.8607, lng: 67.0011, elevationMeters: 8, highways: ['M-9', 'N-5', 'N-10', 'N-25'] },
  { id: 'islamabad', nameEn: 'Islamabad / Rawalpindi', nameUr: 'اسلام آباد / راولپنڈی', provinceEn: 'Federal/Punjab', provinceUr: 'وفاق / پنجاب', lat: 33.6844, lng: 73.0479, elevationMeters: 540, highways: ['M-1', 'M-2', 'M-15', 'N-5'] },
  { id: 'peshawar', nameEn: 'Peshawar', nameUr: 'پشاور', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', lat: 34.0151, lng: 71.5249, elevationMeters: 359, highways: ['M-1', 'N-5', 'N-55'] },
  { id: 'faisalabad', nameEn: 'Faisalabad', nameUr: 'فیصل آباد', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 31.4504, lng: 73.1350, elevationMeters: 184, highways: ['M-3', 'M-4'] },
  { id: 'multan', nameEn: 'Multan', nameUr: 'ملتان', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 30.1575, lng: 71.5249, elevationMeters: 122, highways: ['M-4', 'M-5', 'N-5'] },
  { id: 'sukkur', nameEn: 'Sukkur', nameUr: 'سکھر', provinceEn: 'Sindh', provinceUr: 'سندھ', lat: 27.7052, lng: 68.8574, elevationMeters: 67, highways: ['M-5', 'M-6', 'N-5', 'N-55'] },
  { id: 'hyderabad', nameEn: 'Hyderabad', nameUr: 'حیدرآباد', provinceEn: 'Sindh', provinceUr: 'سندھ', lat: 25.3960, lng: 68.3578, elevationMeters: 28, highways: ['M-9', 'N-5', 'N-55'] },
  { id: 'quetta', nameEn: 'Quetta', nameUr: 'کوئٹہ', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', lat: 30.1798, lng: 66.9750, elevationMeters: 1680, highways: ['N-25', 'N-50', 'N-65', 'N-70'] },
  { id: 'gujranwala', nameEn: 'Gujranwala', nameUr: 'گوجرانوالہ', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 32.1877, lng: 74.1945, elevationMeters: 226, highways: ['N-5', 'M-11'] },
  { id: 'sialkot', nameEn: 'Sialkot', nameUr: 'سیالکوٹ', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 32.4945, lng: 74.5229, elevationMeters: 256, highways: ['M-11'] },
  { id: 'kamalia', nameEn: 'Kamalia', nameUr: 'کمالیہ', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 30.7258, lng: 72.6447, elevationMeters: 160, highways: ['M-4 Interchange', 'Rajana Road'] },
  { id: 'sargodha', nameEn: 'Sargodha', nameUr: 'سرگودھا', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 32.0836, lng: 72.6711, elevationMeters: 193, highways: ['M-2 Link'] },
  { id: 'sahiwal', nameEn: 'Sahiwal', nameUr: 'ساہیوال', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 30.6682, lng: 73.1114, elevationMeters: 171, highways: ['N-5'] },
  { id: 'bahawalpur', nameEn: 'Bahawalpur', nameUr: 'بہاولپور', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 29.3956, lng: 71.6836, elevationMeters: 117, highways: ['N-5', 'M-5 Link'] },
  { id: 'rahimyarkhan', nameEn: 'Rahim Yar Khan', nameUr: 'رحیم یار خان', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 28.4212, lng: 70.2989, elevationMeters: 88, highways: ['M-5', 'N-5'] },
  { id: 'gwadar', nameEn: 'Gwadar', nameUr: 'گوادر', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', lat: 25.1216, lng: 62.3254, elevationMeters: 12, highways: ['N-10 Coastal Hwy', 'M-8'] },
  { id: 'abbottabad', nameEn: 'Abbottabad', nameUr: 'ایبٹ آباد', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', lat: 34.1688, lng: 73.2215, elevationMeters: 1256, highways: ['M-15 Hazara', 'N-35 KKH'] },
  { id: 'gilgit', nameEn: 'Gilgit', nameUr: 'گلگت', provinceEn: 'GB', provinceUr: 'گلگت بلتستان', lat: 35.9221, lng: 74.3087, elevationMeters: 1500, highways: ['N-35 KKH'] },
  { id: 'swat', nameEn: 'Swat / Mingora', nameUr: 'سوات / مینگورہ', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', lat: 34.7717, lng: 72.3602, elevationMeters: 984, highways: ['M-16 Swat Expy'] },
  { id: 'dgkhan', nameEn: 'Dera Ghazi Khan', nameUr: 'ڈیرہ غازی خان', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 30.0489, lng: 70.6455, elevationMeters: 125, highways: ['N-55 Indus Hwy', 'N-70'] },
  { id: 'mianwali', nameEn: 'Mianwali', nameUr: 'میانوالی', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 32.5839, lng: 71.5370, elevationMeters: 210, highways: ['M-14 Hakla-DI Khan'] },
  { id: 'khuzdar', nameEn: 'Khuzdar', nameUr: 'خضدار', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', lat: 27.8105, lng: 66.6053, elevationMeters: 1237, highways: ['N-25 RCD Hwy', 'M-8'] }
];

export interface HighwayCorridor {
  id: string;
  nameEn: string;
  nameUr: string;
  code: string;
  originId: string;
  destId: string;
  waypoints: string[]; // City IDs along route
  distanceKm: number;
  heavyVehicleDurationHours: number;
  lightVehicleDurationHours: number;
  routeColor: string;
}

export const PRESET_CORRIDORS: HighwayCorridor[] = [
  {
    id: 'lhr-isb-m2',
    nameEn: 'Lahore ⇄ Islamabad (M-2 Motorway)',
    nameUr: 'لاہور ⇄ اسلام آباد (M-2 موٹروے)',
    code: 'M-2',
    originId: 'lahore',
    destId: 'islamabad',
    waypoints: ['lahore', 'sargodha', 'islamabad'],
    distanceKm: 375,
    heavyVehicleDurationHours: 5.5,
    lightVehicleDurationHours: 3.8,
    routeColor: '#2563EB'
  },
  {
    id: 'lhr-khi-corridor',
    nameEn: 'Lahore ⇄ Karachi (M-3/M-4/M-5/M-9 Logistics Corridor)',
    nameUr: 'لاہور ⇄ کراچی (M-3 / M-4 / M-5 / M-9 نیشنل کوریڈور)',
    code: 'M-3/4/5/9',
    originId: 'lahore',
    destId: 'karachi',
    waypoints: ['lahore', 'faisalabad', 'kamalia', 'multan', 'bahawalpur', 'rahimyarkhan', 'sukkur', 'hyderabad', 'karachi'],
    distanceKm: 1215,
    heavyVehicleDurationHours: 19.5,
    lightVehicleDurationHours: 14.2,
    routeColor: '#059669'
  },
  {
    id: 'isb-psh-m1',
    nameEn: 'Islamabad ⇄ Peshawar (M-1 Motorway)',
    nameUr: 'اسلام آباد ⇄ پشاور (M-1 موٹروے)',
    code: 'M-1',
    originId: 'islamabad',
    destId: 'peshawar',
    waypoints: ['islamabad', 'peshawar'],
    distanceKm: 155,
    heavyVehicleDurationHours: 2.5,
    lightVehicleDurationHours: 1.6,
    routeColor: '#8B5CF6'
  },
  {
    id: 'fsd-mul-m4',
    nameEn: 'Faisalabad ⇄ Multan (M-4 Motorway)',
    nameUr: 'فیصل آباد ⇄ ملتان (M-4 موٹروے)',
    code: 'M-4',
    originId: 'faisalabad',
    destId: 'multan',
    waypoints: ['faisalabad', 'kamalia', 'multan'],
    distanceKm: 242,
    heavyVehicleDurationHours: 3.8,
    lightVehicleDurationHours: 2.5,
    routeColor: '#D97706'
  },
  {
    id: 'khi-gwd-n10',
    nameEn: 'Karachi ⇄ Gwadar (N-10 Coastal Highway)',
    nameUr: 'کراچی ⇄ گوادر (N-10 مکران کوسٹل ہائی وے)',
    code: 'N-10',
    originId: 'karachi',
    destId: 'gwadar',
    waypoints: ['karachi', 'gwadar'],
    distanceKm: 653,
    heavyVehicleDurationHours: 11.0,
    lightVehicleDurationHours: 7.8,
    routeColor: '#0284C7'
  },
  {
    id: 'isb-glt-kkh',
    nameEn: 'Islamabad ⇄ Gilgit (M-15 & N-35 Karakoram Highway)',
    nameUr: 'اسلام آباد ⇄ گلگت (M-15 ہزارہ و شاہراہ ریشم)',
    code: 'N-35 / M-15',
    originId: 'islamabad',
    destId: 'gilgit',
    waypoints: ['islamabad', 'abbottabad', 'gilgit'],
    distanceKm: 512,
    heavyVehicleDurationHours: 14.0,
    lightVehicleDurationHours: 10.5,
    routeColor: '#DC2626'
  },
  {
    id: 'khi-qta-n25',
    nameEn: 'Karachi ⇄ Quetta (N-25 RCD Highway)',
    nameUr: 'کراچی ⇄ کوئٹہ (N-25 آر سی ڈی ہائی وے)',
    code: 'N-25',
    originId: 'karachi',
    destId: 'quetta',
    waypoints: ['karachi', 'khuzdar', 'quetta'],
    distanceKm: 687,
    heavyVehicleDurationHours: 13.5,
    lightVehicleDurationHours: 9.5,
    routeColor: '#7C3AED'
  }
];

export interface LiveWeatherData {
  temp: number;
  apparentTemp: number;
  humidity: number;
  windSpeed: number;
  visibilityKm: number;
  precipitationMm: number;
  weatherCode: number;
  conditionEn: string;
  conditionUr: string;
  iconType: 'sun' | 'cloud' | 'rain' | 'fog' | 'wind' | 'snow';
  safetyLevel: 'safe' | 'caution' | 'alert';
  roadStatusEn: string;
  roadStatusUr: string;
  fogWarning: boolean;
  rainWarning: boolean;
  updatedAt: string;
}

export const MapView: React.FC<MapViewProps> = ({ lang, onNavigate, onOpenTollCalc }) => {
  const [, startTransition] = useTransition();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('lhr-khi-corridor');
  const [originCityId, setOriginCityId] = useState<string>('lahore');
  const [destCityId, setDestCityId] = useState<string>('karachi');
  const [activeMapLayer, setActiveMapLayer] = useState<'streets' | 'satellite' | 'terrain' | 'dark'>('streets');
  
  const CACHE_KEY_WEATHER = 'wg_cached_highway_weather';
  const CACHE_TTL_MS = 20 * 60 * 1000; // 20 mins

  const [weatherMap, setWeatherMap] = useState<Record<string, LiveWeatherData>>(() => {
    try {
      const cachedStr = localStorage.getItem(CACHE_KEY_WEATHER);
      if (cachedStr) {
        const parsed = JSON.parse(cachedStr);
        if (parsed && parsed.data) {
          return parsed.data;
        }
      }
    } catch {
      // ignore
    }
    return {};
  });
  const [loadingWeather, setLoadingWeather] = useState<boolean>(() => {
    try {
      const cachedStr = localStorage.getItem(CACHE_KEY_WEATHER);
      return !cachedStr;
    } catch {
      return true;
    }
  });
  const [selectedCityForDetail, setSelectedCityForDetail] = useState<TransitCity | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingUser, setLocatingUser] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<boolean>(true);

  // Derive active corridor or dynamic custom route
  const activeCorridor = useMemo(() => {
    return PRESET_CORRIDORS.find(c => c.id === selectedCorridorId) || null;
  }, [selectedCorridorId]);

  // Derive route waypoints
  const routeCities = useMemo(() => {
    if (activeCorridor) {
      return activeCorridor.waypoints
        .map(wId => PAKISTAN_CITIES.find(c => c.id === wId))
        .filter(Boolean) as TransitCity[];
    }
    const origin = PAKISTAN_CITIES.find(c => c.id === originCityId);
    const dest = PAKISTAN_CITIES.find(c => c.id === destCityId);
    if (origin && dest && origin.id !== dest.id) {
      return [origin, dest];
    }
    return origin ? [origin] : [];
  }, [activeCorridor, originCityId, destCityId]);

  // Compute total route estimated distance
  const routeMetrics = useMemo(() => {
    if (activeCorridor) {
      return {
        distanceKm: activeCorridor.distanceKm,
        truckTime: activeCorridor.heavyVehicleDurationHours,
        carTime: activeCorridor.lightVehicleDurationHours,
        corridorCode: activeCorridor.code
      };
    }
    if (routeCities.length >= 2) {
      // Calculate straight approximate distance with road winding factor
      const o = routeCities[0];
      const d = routeCities[routeCities.length - 1];
      const R = 6371; // Earth radius in km
      const dLat = (d.lat - o.lat) * Math.PI / 180;
      const dLng = (d.lng - o.lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(o.lat * Math.PI / 180) * Math.cos(d.lat * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const approxDist = Math.round(R * c * 1.25); // Road winding coefficient
      return {
        distanceKm: approxDist,
        truckTime: Math.round((approxDist / 60) * 10) / 10,
        carTime: Math.round((approxDist / 90) * 10) / 10,
        corridorCode: 'Custom Route'
      };
    }
    return { distanceKm: 0, truckTime: 0, carTime: 0, corridorCode: 'Single Point' };
  }, [activeCorridor, routeCities]);

  // Function to interpret Open-Meteo weather codes
  const parseWeatherCode = (code: number, visibilityMeters: number, windKmh: number, tempC: number): {
    conditionEn: string;
    conditionUr: string;
    iconType: 'sun' | 'cloud' | 'rain' | 'fog' | 'wind' | 'snow';
    safetyLevel: 'safe' | 'caution' | 'alert';
    roadStatusEn: string;
    roadStatusUr: string;
    fogWarning: boolean;
    rainWarning: boolean;
  } => {
    let conditionEn = 'Clear & Fair';
    let conditionUr = 'صاف موسم';
    let iconType: 'sun' | 'cloud' | 'rain' | 'fog' | 'wind' | 'snow' = 'sun';
    let safetyLevel: 'safe' | 'caution' | 'alert' = 'safe';
    let roadStatusEn = 'Dry & Clear Road - Normal Speed';
    let roadStatusUr = 'خشک و محفوظ سڑک - معمول کی رفتار';
    let fogWarning = false;
    let rainWarning = false;

    const visKm = visibilityMeters / 1000;

    if (code === 0 || code === 1) {
      conditionEn = 'Clear & Sunny';
      conditionUr = 'صاف و خوشگوار';
      iconType = 'sun';
    } else if (code === 2 || code === 3) {
      conditionEn = 'Partly Cloudy';
      conditionUr = 'جزوی ابر آلود';
      iconType = 'cloud';
    } else if (code === 45 || code === 48 || visKm < 1.0) {
      conditionEn = visKm < 0.3 ? 'Dense Fog (Zero Visibility)' : 'Smog / Fog Layer';
      conditionUr = visKm < 0.3 ? 'شدید دھند (زیرو حدِ نگاہ)' : 'دھند و اسموگ کی چادر';
      iconType = 'fog';
      fogWarning = true;
      safetyLevel = visKm < 0.5 ? 'alert' : 'caution';
      roadStatusEn = visKm < 0.5 ? 'HAZARD: Speed < 30km/h. Use Fog Lights' : 'CAUTION: Reduced Visibility. Maintain Distance';
      roadStatusUr = visKm < 0.5 ? 'وارننگ: رفتار 30 کلومیٹر سے کم رکھیں۔ فوگ لائٹس آن کریں' : 'احتیاط: کم حدِ نگاہ۔ اگلی گاڑی سے فاصلہ رکھیں';
    } else if (code >= 51 && code <= 67) {
      conditionEn = 'Light to Moderate Rain';
      conditionUr = 'ہلکی تا درمیانی بارش';
      iconType = 'rain';
      rainWarning = true;
      safetyLevel = 'caution';
      roadStatusEn = 'Wet Road Surface - Risk of Skidding';
      roadStatusUr = 'گیلی سڑک - پھسلن کا خطرہ، اچانک بریک سے بچیں';
    } else if (code >= 71 && code <= 77) {
      conditionEn = 'Snow / Ice Flurries';
      conditionUr = 'برف باری / یخ بستہ ہوائیں';
      iconType = 'snow';
      safetyLevel = 'alert';
      roadStatusEn = 'Icy Road Surface - Use Snow Chains in Passes';
      roadStatusUr = 'برف باری - پہاڑی راستوں پر اسنو چین کا استعمال کریں';
    } else if (code >= 80 && code <= 99) {
      conditionEn = 'Heavy Rain / Thunderstorm';
      conditionUr = 'تیز بارش و گرج چمک کا طوفان';
      iconType = 'rain';
      rainWarning = true;
      safetyLevel = 'alert';
      roadStatusEn = 'DANGER: Waterlogging & Hydroplaning Risk';
      roadStatusUr = 'خطرہ: سڑک پر پانی کھڑا، رفتار آہستہ رکھیں';
    }

    if (windKmh > 45) {
      iconType = 'wind';
      safetyLevel = 'caution';
      roadStatusEn += ' · High Crosswinds on Open Highway';
      roadStatusUr += ' · کھلی موٹروے پر تیز کراس ونڈز';
    }

    if (tempC > 44) {
      safetyLevel = 'caution';
      roadStatusEn += ' · Extreme Heat: Monitor Tyre Pressure';
      roadStatusUr += ' · شدید گرمی: ٹائر پریشر پر کڑی نظر رکھیں';
    }

    return {
      conditionEn,
      conditionUr,
      iconType,
      safetyLevel,
      roadStatusEn,
      roadStatusUr,
      fogWarning,
      rainWarning
    };
  };

  // Fetch live weather from Open-Meteo for all major Pakistani transit stations
  const fetchAllCitiesWeather = async () => {
    setLoadingWeather(true);
    try {
      const results: Record<string, LiveWeatherData> = {};

      // Batch query coordinates
      const coords = PAKISTAN_CITIES.map(c => ({ id: c.id, lat: c.lat, lng: c.lng }));

      // To keep it performant and respect limits, fetch simultaneously with Promise.all
      const requests = coords.map(async (city) => {
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,visibility&timezone=Asia%2FKarachi`;
          const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (!resp.ok) throw new Error('API failed');
          const data = await resp.json();
          const current = data.current;
          
          const temp = Math.round(current.temperature_2m);
          const apparentTemp = Math.round(current.apparent_temperature);
          const humidity = Math.round(current.relative_humidity_2m);
          const windSpeed = Math.round(current.wind_speed_10m);
          const visibilityKm = Math.round((current.visibility || 10000) / 100) / 10;
          const precipitationMm = current.precipitation || 0;
          const weatherCode = current.weather_code || 0;

          const parsed = parseWeatherCode(weatherCode, current.visibility || 10000, windSpeed, temp);

          results[city.id] = {
            temp,
            apparentTemp,
            humidity,
            windSpeed,
            visibilityKm,
            precipitationMm,
            weatherCode,
            ...parsed,
            updatedAt: new Date().toLocaleTimeString(lang === 'ur' ? 'ur-PK' : 'en-US', { hour: '2-digit', minute: '2-digit' })
          };
        } catch (err) {
          // Fallback realistic baseline data for Pakistan highway weather
          const baseTemp = city.id === 'karachi' || city.id === 'gwadar' ? 29 : city.id === 'gilgit' || city.id === 'abbottabad' ? 16 : 24;
          const parsed = parseWeatherCode(0, 8000, 14, baseTemp);
          results[city.id] = {
            temp: baseTemp,
            apparentTemp: baseTemp + 1,
            humidity: 45,
            windSpeed: 12,
            visibilityKm: 8.5,
            precipitationMm: 0,
            weatherCode: 0,
            ...parsed,
            updatedAt: new Date().toLocaleTimeString(lang === 'ur' ? 'ur-PK' : 'en-US', { hour: '2-digit', minute: '2-digit' })
          };
        }
      });

      await Promise.all(requests);
      setWeatherMap(results);
      try {
        localStorage.setItem(CACHE_KEY_WEATHER, JSON.stringify({
          data: results,
          timestamp: Date.now()
        }));
      } catch {
        // ignore
      }
    } catch (e) {
      console.error('Weather fetch error:', e);
    } finally {
      setLoadingWeather(false);
    }
  };

  // Initial load: Check if cache is fresh before fetching
  useEffect(() => {
    let shouldFetch = true;
    try {
      const cachedStr = localStorage.getItem(CACHE_KEY_WEATHER);
      if (cachedStr) {
        const parsed = JSON.parse(cachedStr);
        if (parsed && parsed.timestamp && (Date.now() - parsed.timestamp < CACHE_TTL_MS)) {
          shouldFetch = false;
        }
      }
    } catch {
      // ignore
    }

    if (shouldFetch) {
      fetchAllCitiesWeather();
    }

    if (autoRefreshInterval) {
      const interval = setInterval(fetchAllCitiesWeather, 60000 * 10); // 10 min auto refresh
      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval]);

  // Leaflet Tile URLs
  const getTileUrl = (layer: 'streets' | 'satellite' | 'terrain' | 'dark') => {
    switch (layer) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        };
      case 'terrain':
        return {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
        };
      case 'dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        };
      case 'streets':
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        };
    }
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up any stale map instance
    if (leafletMapRef.current) {
      try {
        leafletMapRef.current.remove();
      } catch {
        // ignore
      }
      leafletMapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [30.3753, 69.3451], // Center of Pakistan
      zoom: 6,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileConfig = getTileUrl(activeMapLayer);
    const tiles = L.tileLayer(tileConfig.url, {
      maxZoom: 19,
      attribution: tileConfig.attribution
    }).addTo(map);

    tileLayerRef.current = tiles;
    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    leafletMapRef.current = map;

    // Trigger invalidateSize after slight delay for proper container rendering
    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 400);

    const resizeObserver = new ResizeObserver(() => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      resizeObserver.disconnect();
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch {
          // ignore
        }
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when layer changes
  useEffect(() => {
    if (!leafletMapRef.current) return;
    if (tileLayerRef.current) {
      leafletMapRef.current.removeLayer(tileLayerRef.current);
    }
    const tileConfig = getTileUrl(activeMapLayer);
    const newTiles = L.tileLayer(tileConfig.url, {
      maxZoom: 19,
      attribution: tileConfig.attribution
    }).addTo(leafletMapRef.current);
    tileLayerRef.current = newTiles;
  }, [activeMapLayer]);

  // Update Markers and Polyline on Map
  useEffect(() => {
    const map = leafletMapRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    const routeCityIds = new Set(routeCities.map(c => c.id));
    const bounds = L.latLngBounds([]);

    // 1. Draw Polyline if route has 2+ waypoints
    if (routeCities.length >= 2) {
      const polylineCoords = routeCities.map(c => [c.lat, c.lng] as [number, number]);
      
      const polyline = L.polyline(polylineCoords, {
        color: activeCorridor ? activeCorridor.routeColor : '#8b9d77',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: undefined
      }).addTo(map);

      routePolylineRef.current = polyline;

      // Outer glow for dark or satellite mode
      polylineCoords.forEach(pt => bounds.extend(pt));
    }

    // 2. Add City & Weather Markers
    PAKISTAN_CITIES.forEach(city => {
      const isRoutePoint = routeCityIds.has(city.id);
      const isOrigin = routeCities[0]?.id === city.id;
      const isDest = routeCities[routeCities.length - 1]?.id === city.id && routeCities.length > 1;
      const weather = weatherMap[city.id];

      // Custom HTML Marker Element
      const tempBadge = weather ? `${weather.temp}°C` : '--';
      const weatherEmoji = weather?.iconType === 'sun' ? '☀️' : 
                           weather?.iconType === 'rain' ? '🌧️' : 
                           weather?.iconType === 'fog' ? '🌫️' : 
                           weather?.iconType === 'wind' ? '💨' : 
                           weather?.iconType === 'snow' ? '❄️' : '⛅';
      
      const bgBadgeColor = isOrigin 
        ? '#10B981' 
        : isDest 
          ? '#EF4444' 
          : isRoutePoint 
            ? '#2563EB' 
            : '#4A4A35';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-weather-pin',
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 4px;
            background: ${isRoutePoint ? 'white' : 'rgba(255,255,255,0.92)'};
            border: 2px solid ${bgBadgeColor};
            border-radius: 999px;
            padding: 3px 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            cursor: pointer;
            transform: translate(-50%, -50%);
            white-space: nowrap;
            font-family: inherit;
            font-size: 11px;
            font-weight: 700;
            color: #1f2937;
            transition: all 0.2s ease;
          ">
            <span style="font-size: 13px;">${weatherEmoji}</span>
            <span style="color: ${bgBadgeColor};">${lang === 'ur' ? city.nameUr.split('/')[0] : city.nameEn.split('/')[0]}</span>
            <span style="
              background: ${bgBadgeColor};
              color: white;
              padding: 1px 5px;
              border-radius: 6px;
              font-size: 10px;
              font-weight: 800;
            ">${tempBadge}</span>
          </div>
        `,
        iconSize: [110, 30],
        iconAnchor: [55, 15]
      });

      const marker = L.marker([city.lat, city.lng], { icon: customIcon }).addTo(markersGroup);

      // Popup Content
      const popupContent = `
        <div style="font-family: system-ui, sans-serif; text-align: ${lang === 'ur' ? 'right' : 'left'}; direction: ${lang === 'ur' ? 'rtl' : 'ltr'}; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 8px;">
            <div>
              <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #111827;">${lang === 'ur' ? city.nameUr : city.nameEn}</h3>
              <span style="font-size: 10px; color: #6b7280;">${lang === 'ur' ? city.provinceUr : city.provinceEn} · ${city.elevationMeters}m Elev.</span>
            </div>
            <div style="font-size: 20px;">${weatherEmoji}</div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; margin-bottom: 8px;">
            <div style="background: #f3f4f6; padding: 4px 6px; border-radius: 6px;">
              <span style="color: #6b7280; display: block; font-size: 9px;">${lang === 'ur' ? 'درجہ حرارت' : 'Temperature'}</span>
              <strong style="font-size: 13px; color: #1f2937;">${weather ? `${weather.temp}°C` : '--'}</strong>
            </div>
            <div style="background: #f3f4f6; padding: 4px 6px; border-radius: 6px;">
              <span style="color: #6b7280; display: block; font-size: 9px;">${lang === 'ur' ? 'حدِ نگاہ (دید)' : 'Visibility'}</span>
              <strong style="font-size: 13px; color: ${weather && weather.visibilityKm < 1 ? '#dc2626' : '#1f2937'};">${weather ? `${weather.visibilityKm} km` : '--'}</strong>
            </div>
            <div style="background: #f3f4f6; padding: 4px 6px; border-radius: 6px;">
              <span style="color: #6b7280; display: block; font-size: 9px;">${lang === 'ur' ? 'ہوا کی رفتار' : 'Wind Speed'}</span>
              <strong style="font-size: 12px; color: #1f2937;">${weather ? `${weather.windSpeed} km/h` : '--'}</strong>
            </div>
            <div style="background: #f3f4f6; padding: 4px 6px; border-radius: 6px;">
              <span style="color: #6b7280; display: block; font-size: 9px;">${lang === 'ur' ? 'نمی کا تناسب' : 'Humidity'}</span>
              <strong style="font-size: 12px; color: #1f2937;">${weather ? `${weather.humidity}%` : '--'}</strong>
            </div>
          </div>

          <div style="
            background: ${weather?.safetyLevel === 'alert' ? '#fee2e2' : weather?.safetyLevel === 'caution' ? '#fef3c7' : '#ecfdf5'};
            border: 1px solid ${weather?.safetyLevel === 'alert' ? '#f87171' : weather?.safetyLevel === 'caution' ? '#fcd34d' : '#6ee7b7'};
            border-radius: 8px;
            padding: 6px 8px;
            font-size: 10px;
            margin-bottom: 8px;
            color: #1f2937;
          ">
            <strong>${lang === 'ur' ? 'روڈ کنڈیشن:' : 'Road Condition:'}</strong> ${weather ? (lang === 'ur' ? weather.roadStatusUr : weather.roadStatusEn) : '--'}
          </div>

          <div style="font-size: 10px; color: #4b5563; margin-bottom: 6px;">
            <strong>${lang === 'ur' ? 'منسلک شاہراہیں:' : 'Highways:'}</strong> ${city.highways.join(', ')}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280 });
      marker.on('click', () => {
        setSelectedCityForDetail(city);
      });

      if (isRoutePoint) {
        bounds.extend([city.lat, city.lng]);
      }
    });

    // 3. User Location Marker if available
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-loc-pin',
        html: `
          <div style="
            width: 18px;
            height: 18px;
            background: #3B82F6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(59,130,246,0.8);
            transform: translate(-50%, -50%);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(markersGroup)
        .bindPopup(lang === 'ur' ? 'آپ کی موجودہ لوکیشن' : 'Your Current Location');
      bounds.extend([userLocation.lat, userLocation.lng]);
    }

    // Auto-fit map to route bounds
    if (bounds.isValid() && routeCities.length >= 2) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10, animate: true });
    }
  }, [routeCities, weatherMap, activeCorridor, lang, userLocation]);

  // Handle Corridor Preset Selection
  const handleSelectCorridor = (cId: string) => {
    setSelectedCorridorId(cId);
    const corridor = PRESET_CORRIDORS.find(c => c.id === cId);
    if (corridor) {
      setOriginCityId(corridor.originId);
      setDestCityId(corridor.destId);
    }
  };

  // Swap Origin and Destination
  const handleSwapCities = () => {
    startTransition(() => {
      setSelectedCorridorId('custom');
      const temp = originCityId;
      setOriginCityId(destCityId);
      setDestCityId(temp);
    });
  };

  // Geolocation trigger
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert(lang === 'ur' ? 'آپ کے براؤزر میں لوکیشن کی سہولت موجود نہیں۔' : 'Geolocation is not supported by your browser.');
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setLocatingUser(false);
        if (leafletMapRef.current) {
          leafletMapRef.current.flyTo([coords.lat, coords.lng], 11, { animate: true });
        }
      },
      (err) => {
        setLocatingUser(false);
        alert(lang === 'ur' ? 'لوکیشن حاصل کرنے میں مسئلہ پیش آیا۔' : 'Unable to retrieve your location.');
      },
      { timeout: 8000 }
    );
  };

  // Share route weather on WhatsApp
  const handleShareWeatherWhatsApp = () => {
    const origin = PAKISTAN_CITIES.find(c => c.id === originCityId);
    const dest = PAKISTAN_CITIES.find(c => c.id === destCityId);
    if (!origin || !dest) return;

    const originWeather = weatherMap[origin.id];
    const destWeather = weatherMap[dest.id];

    let message = `*🚚 ڈرائیور دوست - روٹ و موسم رپورٹ (Driver Dost)*\n`;
    message += `🛣️ *روٹ کوریڈور:* ${origin.nameUr} تا ${dest.nameUr} (${routeMetrics.corridorCode})\n`;
    message += `📏 *کل فاصلہ:* ${routeMetrics.distanceKm} کلومیٹر | ⏱️ *ٹرک وقت:* ~${routeMetrics.truckTime} گھنٹے\n\n`;
    
    message += `📍 *روانگی (${origin.nameUr}):*\n`;
    message += `• درجہ حرارت: ${originWeather ? `${originWeather.temp}°C (${originWeather.conditionUr})` : '--'}\n`;
    message += `• حدِ نگاہ: ${originWeather ? `${originWeather.visibilityKm} km` : '--'} | ہوا: ${originWeather ? `${originWeather.windSpeed} km/h` : '--'}\n`;
    message += `• سڑک کا حال: ${originWeather?.roadStatusUr || '--'}\n\n`;

    message += `📍 *منزل (${dest.nameUr}):*\n`;
    message += `• درجہ حرارت: ${destWeather ? `${destWeather.temp}°C (${destWeather.conditionUr})` : '--'}\n`;
    message += `• حدِ نگاہ: ${destWeather ? `${destWeather.visibilityKm} km` : '--'} | ہوا: ${destWeather ? `${destWeather.windSpeed} km/h` : '--'}\n`;
    message += `• سڑک کا حال: ${destWeather?.roadStatusUr || '--'}\n\n`;

    message += `⚠️ *موٹروے پولیس ہیلپ لائن:* 130\n`;
    message += `📱 *ڈرائیور دوست لائیو ایپ:* https://zahdan-443.github.io/Warraich-Goods/`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 gap-6 animate-in fade-in">
      
      {/* Top Header Banner */}
      <header className="bg-white p-6 md:p-8 rounded-[36px] shadow-sm border border-[#ecece0] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#8b9d77]/15 text-[#5a5a40] uppercase tracking-wider">
              <MapIcon className="w-3 h-3 text-[#8b9d77]" />
              {lang === 'ur' ? 'پاکستان روٹ میپ و لائیو موسم' : 'Pakistan Highway & Live Weather Map'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700">
              <Sparkles className="w-2.5 h-2.5" />
              {lang === 'ur' ? 'لائیو سیٹلائٹ و موسم' : 'Live Road Weather'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#4a4a35]">
            {lang === 'ur' ? 'ہائی وے میپ اور روٹ موسم مانیٹر' : 'Highway Route & Weather Map'}
          </h1>
          <p className="text-[#8e8e75] text-xs sm:text-sm mt-1 max-w-2xl">
            {lang === 'ur' 
              ? 'موٹروے و جی ٹی روڈ کے تمام اہم ٹرانزٹ مقامات کی لائیو حدِ نگاہ، دھند/اسموگ الرٹ، درجہ حرارت اور محفوظ سفر کی تفصیلی رہنمائی۔'
              : 'Real-time visibility, fog/smog hazard advisories, live temperatures and corridor metrics across Pakistan motorway network.'}
          </p>
        </div>

        {/* Action Button Group */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchAllCitiesWeather}
            disabled={loadingWeather}
            aria-label={lang === 'ur' ? 'موسم اپڈیٹ کریں' : 'Refresh Weather'}
            className="px-4 py-2.5 rounded-2xl bg-[#f0f0e4] hover:bg-[#8b9d77] hover:text-white text-[#4a4a35] text-xs font-bold font-serif transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingWeather ? 'animate-spin' : ''}`} />
            <span>{loadingWeather ? (lang === 'ur' ? 'اپڈیٹ ہو رہا ہے...' : 'Refreshing...') : (lang === 'ur' ? 'موسم ریفریش' : 'Refresh Weather')}</span>
          </button>

          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingUser}
            aria-label={lang === 'ur' ? 'میری لوکیشن' : 'Locate Me'}
            className="px-4 py-2.5 rounded-2xl bg-[#f0f0e4] hover:bg-[#2563eb] hover:text-white text-[#4a4a35] text-xs font-bold font-serif transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
          >
            <Crosshair className={`w-3.5 h-3.5 ${locatingUser ? 'animate-spin text-blue-600' : ''}`} />
            <span>{locatingUser ? (lang === 'ur' ? 'تلاش جاری...' : 'Locating...') : (lang === 'ur' ? 'میری لوکیشن' : 'GPS Location')}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWeatherWhatsApp}
            aria-label={lang === 'ur' ? 'واٹس ایپ پر شیئر کریں' : 'Share on WhatsApp'}
            className="px-4 py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold font-serif transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{shareSuccess ? (lang === 'ur' ? 'شیئر ہو گیا!' : 'Shared!') : (lang === 'ur' ? 'واٹس ایپ شیئر' : 'WhatsApp Share')}</span>
          </button>
        </div>
      </header>

      {/* Corridor Quick Presets Bar */}
      <section className="bg-[#fdfbf7] p-4 rounded-3xl border border-[#ecece0] shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-3 px-1">
          <span className="text-xs font-serif font-bold text-[#4a4a35] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#8b9d77]" />
            <span>{lang === 'ur' ? 'اہم لاجسٹکس و موٹروے کوریڈورز (فوری انتخاب):' : 'Popular Motorway Corridors:'}</span>
          </span>
          <span className="text-[10px] text-[#8e8e75] font-sans font-medium">
            {PRESET_CORRIDORS.length} {lang === 'ur' ? 'کوریڈورز' : 'Corridors'}
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {PRESET_CORRIDORS.map(corridor => {
            const isSelected = selectedCorridorId === corridor.id;
            return (
              <button
                key={corridor.id}
                type="button"
                onClick={() => handleSelectCorridor(corridor.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold font-serif whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ? 'bg-[#8b9d77] text-white border-[#8b9d77] shadow-xs scale-[1.02]'
                    : 'bg-white text-[#4a4a35] border-[#ecece0] hover:border-[#8b9d77] hover:bg-[#f9f9f2]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-[#8b9d77]'}`}></span>
                <span>{lang === 'ur' ? corridor.nameUr : corridor.nameEn}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-[#f0f0e4] text-[#5a5a40]'}`}>
                  {corridor.distanceKm} km
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Grid: Map (8 cols) + Route Weather Controls & Intel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left / Center: Interactive Leaflet Map Container */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          <div className="bg-white p-2 rounded-[36px] shadow-sm border border-[#ecece0] overflow-hidden relative">
            
            {/* Map Layer Switcher Floating Pill */}
            <div className="absolute top-5 right-5 z-[500] bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-[#ecece0] flex items-center gap-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveMapLayer('streets')}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${activeMapLayer === 'streets' ? 'bg-[#8b9d77] text-white' : 'text-[#4a4a35] hover:bg-[#f0f0e4]'}`}
              >
                {lang === 'ur' ? 'سڑکیں' : 'Streets'}
              </button>
              <button
                type="button"
                onClick={() => setActiveMapLayer('satellite')}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${activeMapLayer === 'satellite' ? 'bg-[#8b9d77] text-white' : 'text-[#4a4a35] hover:bg-[#f0f0e4]'}`}
              >
                {lang === 'ur' ? 'سیٹلائٹ' : 'Satellite'}
              </button>
              <button
                type="button"
                onClick={() => setActiveMapLayer('terrain')}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${activeMapLayer === 'terrain' ? 'bg-[#8b9d77] text-white' : 'text-[#4a4a35] hover:bg-[#f0f0e4]'}`}
              >
                {lang === 'ur' ? 'پہاڑی رقبہ' : 'Terrain'}
              </button>
              <button
                type="button"
                onClick={() => setActiveMapLayer('dark')}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${activeMapLayer === 'dark' ? 'bg-[#222] text-white' : 'text-[#4a4a35] hover:bg-[#f0f0e4]'}`}
              >
                {lang === 'ur' ? 'نائٹ موڈ' : 'Night'}
              </button>
            </div>

            {/* Weather Legend Float on Map */}
            <div className="absolute bottom-5 left-5 z-[500] bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-md border border-[#ecece0] text-[10px] text-[#4a4a35] space-y-1 hidden sm:block">
              <div className="font-bold font-serif text-[#8b9d77]">{lang === 'ur' ? 'موسمی علامات:' : 'Legend:'}</div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">🟢 {lang === 'ur' ? 'محفوظ / صاف' : 'Safe'}</span>
                <span className="flex items-center gap-1">🟡 {lang === 'ur' ? 'دھند / احتیاط' : 'Fog/Rain'}</span>
                <span className="flex items-center gap-1">🔴 {lang === 'ur' ? 'وارننگ' : 'Hazard'}</span>
              </div>
            </div>

            {/* Map Canvas */}
            <div 
              ref={mapContainerRef} 
              id="pakistan-route-weather-map"
              className="w-full h-[460px] sm:h-[540px] md:h-[620px] rounded-[30px] z-0 overflow-hidden"
              style={{ background: '#e5e7eb' }}
            />
          </div>

          {/* Route Stations Weather Flow Horizontal Cards */}
          <div className="bg-white p-6 rounded-[36px] shadow-sm border border-[#ecece0] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-base text-[#4a4a35] flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#8b9d77]" />
                <span>{lang === 'ur' ? 'روٹ کے تمام اہم سٹیشنز اور موسمی صورتحال:' : 'Weather Along Corridor Checkpoints:'}</span>
              </h2>
              <span className="text-xs font-mono font-bold text-[#8b9d77]">
                {routeCities.length} {lang === 'ur' ? 'سٹاپ پوائنٹس' : 'Stations'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {routeCities.map((city, idx) => {
                const weather = weatherMap[city.id];
                const isOrigin = idx === 0;
                const isDest = idx === routeCities.length - 1;
                return (
                  <div
                    key={city.id}
                    onClick={() => {
                      setSelectedCityForDetail(city);
                      if (leafletMapRef.current) {
                        leafletMapRef.current.flyTo([city.lat, city.lng], 9, { animate: true });
                      }
                    }}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isOrigin
                        ? 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-500'
                        : isDest
                          ? 'bg-rose-50/70 border-rose-300 hover:border-rose-500'
                          : 'bg-[#fdfbf7] border-[#ecece0] hover:border-[#8b9d77] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isOrigin ? 'bg-emerald-500' : isDest ? 'bg-rose-500' : 'bg-blue-500'}`}></span>
                          <h3 className="font-serif font-bold text-sm text-[#4a4a35]">
                            {lang === 'ur' ? city.nameUr : city.nameEn}
                          </h3>
                        </div>
                        <span className="text-[10px] text-[#8e8e75] font-sans">
                          {isOrigin ? (lang === 'ur' ? 'روانگی مقام' : 'Origin') : isDest ? (lang === 'ur' ? 'منزل مقام' : 'Destination') : (lang === 'ur' ? `چیک پوائنٹ #${idx}` : `Waypoint #${idx}`)}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-serif font-bold text-[#4a4a35]">
                          {weather ? `${weather.temp}°C` : '--'}
                        </div>
                        <div className="text-[10px] text-[#8e8e75]">
                          {weather ? (lang === 'ur' ? weather.conditionUr : weather.conditionEn) : '--'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] pt-2 border-t border-[#ecece0]/80">
                      <div className="bg-white/80 p-1.5 rounded-xl">
                        <span className="text-[#8e8e75] block text-[9px]">{lang === 'ur' ? 'دید' : 'Vis'}</span>
                        <strong className={weather && weather.visibilityKm < 1 ? 'text-red-600' : 'text-[#4a4a35]'}>
                          {weather ? `${weather.visibilityKm}km` : '--'}
                        </strong>
                      </div>
                      <div className="bg-white/80 p-1.5 rounded-xl">
                        <span className="text-[#8e8e75] block text-[9px]">{lang === 'ur' ? 'ہوا' : 'Wind'}</span>
                        <strong>{weather ? `${weather.windSpeed}k/h` : '--'}</strong>
                      </div>
                      <div className="bg-white/80 p-1.5 rounded-xl">
                        <span className="text-[#8e8e75] block text-[9px]">{lang === 'ur' ? 'نمی' : 'Hum'}</span>
                        <strong>{weather ? `${weather.humidity}%` : '--'}</strong>
                      </div>
                    </div>

                    {weather && weather.fogWarning && (
                      <div className="mt-2 text-[10px] font-bold text-amber-900 bg-amber-100/90 border border-amber-300 rounded-xl px-2 py-1 flex items-center gap-1">
                        <CloudFog className="w-3 h-3 text-amber-700 shrink-0" />
                        <span>{lang === 'ur' ? 'دھند / اسموگ وارننگ' : 'Fog Hazard Warning'}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Sidebar: Route Planner, Metrics, Safety Board & Station Popover */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Custom Route Selector Box */}
          <div className="bg-white p-6 rounded-[36px] shadow-sm border border-[#ecece0] space-y-5">
            <div className="flex items-center justify-between border-b border-[#ecece0] pb-4">
              <h2 className="font-serif font-bold text-base text-[#4a4a35] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#8b9d77]" />
                <span>{lang === 'ur' ? 'روٹ اور کوریڈور منتخب کریں' : 'Select Origin & Destination'}</span>
              </h2>
              <button
                type="button"
                onClick={handleSwapCities}
                title={lang === 'ur' ? 'روانگی اور منزل تبدیل کریں' : 'Swap Cities'}
                className="p-2 rounded-full bg-[#f0f0e4] hover:bg-[#8b9d77] hover:text-white text-[#4a4a35] transition-all cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Origin City Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4a4a35] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{lang === 'ur' ? 'روانگی کا شہر (از):' : 'Origin Station (From):'}</span>
              </label>
              <select
                value={originCityId}
                onChange={(e) => {
                  setSelectedCorridorId('custom');
                  setOriginCityId(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ecece0] rounded-2xl text-xs font-bold text-[#4a4a35] focus:outline-none focus:border-[#8b9d77]"
              >
                {PAKISTAN_CITIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {lang === 'ur' ? `${c.nameUr} (${c.provinceUr})` : `${c.nameEn} (${c.provinceEn})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination City Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4a4a35] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>{lang === 'ur' ? 'منزل کا شہر (تا):' : 'Destination Station (To):'}</span>
              </label>
              <select
                value={destCityId}
                onChange={(e) => {
                  setSelectedCorridorId('custom');
                  setDestCityId(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ecece0] rounded-2xl text-xs font-bold text-[#4a4a35] focus:outline-none focus:border-[#8b9d77]"
              >
                {PAKISTAN_CITIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {lang === 'ur' ? `${c.nameUr} (${c.provinceUr})` : `${c.nameEn} (${c.provinceEn})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Route Stats Summary Box */}
            <div className="bg-[#f9f9f2] p-4 rounded-3xl border border-[#ecece0] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8e8e75]">{lang === 'ur' ? 'کل سفری فاصلہ:' : 'Total Distance:'}</span>
                <span className="font-serif font-bold text-sm text-[#4a4a35]">
                  {routeMetrics.distanceKm.toLocaleString()} km
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8e8e75]">{lang === 'ur' ? 'کمرشل ٹرک کا متوقع وقت:' : 'Heavy Truck Time:'}</span>
                <span className="font-serif font-bold text-xs text-[#5a5a40]">
                  ~{routeMetrics.truckTime} {lang === 'ur' ? 'گھنٹے (65 km/h)' : 'hours'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8e8e75]">{lang === 'ur' ? 'چھوٹی گاڑی / بس کا وقت:' : 'Light Vehicle Time:'}</span>
                <span className="font-serif font-bold text-xs text-[#5a5a40]">
                  ~{routeMetrics.carTime} {lang === 'ur' ? 'گھنٹے (95 km/h)' : 'hours'}
                </span>
              </div>
            </div>

            {/* Direct Shortcuts to Toll Calculator & Trip Cost */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const origin = PAKISTAN_CITIES.find(c => c.id === originCityId);
                  const dest = PAKISTAN_CITIES.find(c => c.id === destCityId);
                  if (onOpenTollCalc) {
                    onOpenTollCalc(origin?.nameEn || 'Lahore', dest?.nameEn || 'Karachi');
                  }
                }}
                className="px-3 py-2.5 rounded-2xl bg-[#8b9d77]/15 hover:bg-[#8b9d77] text-[#5a5a40] hover:text-white text-[11px] font-bold font-serif transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <Calculator className="w-3.5 h-3.5 shrink-0" />
                <span>{lang === 'ur' ? 'ٹول ٹیکس چیک کریں' : 'Check Tolls'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem('ah-prefill-dist', String(routeMetrics.distanceKm));
                  } catch (e) {}
                  onNavigate('calculator');
                }}
                className="px-3 py-2.5 rounded-2xl bg-[#4a4a35] hover:bg-[#383827] text-white text-[11px] font-bold font-serif transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <span>{lang === 'ur' ? 'سفر خرچ حساب' : 'Trip Calculator'}</span>
              </button>
            </div>

          </div>

          {/* National Highway & Motorway Police (NHMP) Driver Safety Advisory Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-[36px] border border-amber-300/70 space-y-4">
            <div className="flex items-center gap-2.5 text-amber-900 font-serif font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{lang === 'ur' ? 'ڈرائیور رہنمائی و موٹروے پولیس ایڈوائزری' : 'NHMP Road Safety Advisory'}</span>
            </div>

            <ul className="text-xs text-amber-950/85 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>
                  {lang === 'ur' 
                    ? 'دھند اور اسموگ کے دوران رفتار 40 کلومیٹر سے زیادہ نہ کریں اور صرف فوگ لائٹس کا استعمال کریں۔ ہائی بیم لائٹ سے دھند میں سفید دیوار بن جاتی ہے۔'
                    : 'During dense fog/smog, restrict speed under 40 km/h and use low beam fog lights only.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>
                  {lang === 'ur'
                    ? 'موٹروے ایمرجنسی، روڈ بندش یا حادثے کی صورت میں فوری ہیلپ لائن 130 پر رابطہ کریں۔'
                    : 'For motorway emergency assistance, dial 130 National Highway & Motorway Police helpline.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>
                  {lang === 'ur'
                    ? 'شدید گرمی میں طویل سفر پر ٹائر پھٹنے سے بچنے کے لیے ہر 200 کلومیٹر بعد 15 منٹ کا آرام دیں۔'
                    : 'In summer heat, take a 15-minute break every 200 km to prevent commercial tyre blowout.'}
                </span>
              </li>
            </ul>

            <div className="pt-2 border-t border-amber-300/50 flex items-center justify-between text-[11px] font-bold text-amber-900">
              <span>{lang === 'ur' ? 'ہیلپ لائن:' : 'Helpline:'} 130 NHMP</span>
              <span>{lang === 'ur' ? 'ایمرجنسی:' : 'Emergency:'} 1122</span>
            </div>
          </div>

          {/* Selected Transit Hub Detail Card (when clicked on map or station) */}
          {selectedCityForDetail && (
            <div className="bg-white p-6 rounded-[36px] shadow-sm border-2 border-[#8b9d77] space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[#ecece0] pb-3">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#4a4a35]">
                    {lang === 'ur' ? selectedCityForDetail.nameUr : selectedCityForDetail.nameEn}
                  </h3>
                  <span className="text-[10px] text-[#8e8e75]">
                    {lang === 'ur' ? selectedCityForDetail.provinceUr : selectedCityForDetail.provinceEn} · {selectedCityForDetail.elevationMeters}m Elevation
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCityForDetail(null)}
                  className="text-[#8e8e75] hover:text-[#4a4a35] text-xs font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {weatherMap[selectedCityForDetail.id] && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {weatherMap[selectedCityForDetail.id].iconType === 'sun' ? '☀️' : 
                         weatherMap[selectedCityForDetail.id].iconType === 'rain' ? '🌧️' : 
                         weatherMap[selectedCityForDetail.id].iconType === 'fog' ? '🌫️' : '⛅'}
                      </span>
                      <div>
                        <div className="text-xl font-serif font-bold text-[#4a4a35]">
                          {weatherMap[selectedCityForDetail.id].temp}°C
                        </div>
                        <div className="text-xs text-[#8e8e75]">
                          {lang === 'ur' ? `محسوس: ${weatherMap[selectedCityForDetail.id].apparentTemp}°C` : `Feels like ${weatherMap[selectedCityForDetail.id].apparentTemp}°C`}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        weatherMap[selectedCityForDetail.id].safetyLevel === 'alert'
                          ? 'bg-red-100 text-red-700'
                          : weatherMap[selectedCityForDetail.id].safetyLevel === 'caution'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {lang === 'ur' ? weatherMap[selectedCityForDetail.id].conditionUr : weatherMap[selectedCityForDetail.id].conditionEn}
                      </span>
                      <div className="text-[9px] text-[#8e8e75] mt-1">
                        {lang === 'ur' ? 'اپڈیٹ:' : 'Updated:'} {weatherMap[selectedCityForDetail.id].updatedAt}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#fdfbf7] rounded-2xl border border-[#ecece0] text-xs space-y-1">
                    <strong className="text-[#4a4a35] block">{lang === 'ur' ? 'سڑک کی صورتحال:' : 'Road Condition Status:'}</strong>
                    <p className="text-[#5a5a40]">
                      {lang === 'ur' ? weatherMap[selectedCityForDetail.id].roadStatusUr : weatherMap[selectedCityForDetail.id].roadStatusEn}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCorridorId('custom');
                        setOriginCityId(selectedCityForDetail.id);
                      }}
                      className="flex-1 py-2 rounded-xl bg-[#8b9d77]/15 hover:bg-[#8b9d77] hover:text-white text-[#5a5a40] text-[11px] font-bold transition-all"
                    >
                      {lang === 'ur' ? 'یہاں سے روانگی منتخب کریں' : 'Set as Origin'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCorridorId('custom');
                        setDestCityId(selectedCityForDetail.id);
                      }}
                      className="flex-1 py-2 rounded-xl bg-[#4a4a35] hover:bg-[#383827] text-white text-[11px] font-bold transition-all"
                    >
                      {lang === 'ur' ? 'منزل مقرر کریں' : 'Set as Destination'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
