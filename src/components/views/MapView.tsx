import React, { useEffect, useState, useRef, useMemo, useTransition } from 'react';
import { 
  Language, 
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
  Sparkles,
  Search,
  MapPin,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  ExternalLink,
  Milestone,
  Gauge
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
  { id: 'islamabad', nameEn: 'Islamabad', nameUr: 'اسلام آباد', provinceEn: 'Federal', provinceUr: 'وفاق', lat: 33.6844, lng: 73.0479, elevationMeters: 540, highways: ['M-1', 'M-2', 'M-15', 'N-5'] },
  { id: 'rawalpindi', nameEn: 'Rawalpindi', nameUr: 'راولپنڈی', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 33.5651, lng: 73.0169, elevationMeters: 508, highways: ['M-2', 'N-5'] },
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
  { id: 'khuzdar', nameEn: 'Khuzdar', nameUr: 'خضدار', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', lat: 27.8105, lng: 66.6053, elevationMeters: 1237, highways: ['N-25 RCD Hwy', 'M-8'] },
  { id: 'muzaffarabad', nameEn: 'Muzaffarabad', nameUr: 'مظفر آباد', provinceEn: 'AJK', provinceUr: 'آزاد کشمیر', lat: 34.3700, lng: 73.4711, elevationMeters: 737, highways: ['Kohala-Muzaffarabad Rd'] },
  { id: 'mirpur', nameEn: 'Mirpur', nameUr: 'میرپور', provinceEn: 'AJK', provinceUr: 'آزاد کشمیر', lat: 33.1484, lng: 73.7519, elevationMeters: 450, highways: ['Mangla Rd'] },
  { id: 'sheikhupura', nameEn: 'Sheikhupura', nameUr: 'شیخوپورہ', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 31.7131, lng: 73.9783, elevationMeters: 214, highways: ['M-2 Interchange', 'N-5'] },
  { id: 'gujrat', nameEn: 'Gujrat', nameUr: 'گجرات', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 32.5744, lng: 74.0754, elevationMeters: 233, highways: ['N-5 G.T Road'] },
  { id: 'jhang', nameEn: 'Jhang', nameUr: 'جھنگ', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 31.2681, lng: 72.3181, elevationMeters: 158, highways: ['M-4 Link', 'N-70'] },
  { id: 'okara', nameEn: 'Okara', nameUr: 'اوکاڑہ', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 30.8081, lng: 73.4458, elevationMeters: 180, highways: ['N-5 G.T Road'] },
  { id: 'kasur', nameEn: 'Kasur', nameUr: 'قصور', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 31.1179, lng: 74.4461, elevationMeters: 218, highways: ['Ferozepur Rd'] },
  { id: 'bahawalnagar', nameEn: 'Bahawalnagar', nameUr: 'بہاولنگر', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 29.9961, lng: 73.2536, elevationMeters: 163, highways: ['Minchinabad Rd'] },
  { id: 'larkana', nameEn: 'Larkana', nameUr: 'لاڑکانہ', provinceEn: 'Sindh', provinceUr: 'سندھ', lat: 27.5590, lng: 68.2120, elevationMeters: 49, highways: ['N-55 Indus Hwy'] },
  { id: 'nawabshah', nameEn: 'Nawabshah', nameUr: 'نوابشاہ', provinceEn: 'Sindh', provinceUr: 'سندھ', lat: 26.2483, lng: 68.4096, elevationMeters: 36, highways: ['N-5', 'M-6'] },
  { id: 'turbat', nameEn: 'Turbat', nameUr: 'تربت', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', lat: 26.0031, lng: 63.0544, elevationMeters: 129, highways: ['M-8 Motorway'] },
  { id: 'bannu', nameEn: 'Bannu', nameUr: 'بنوں', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', lat: 32.9861, lng: 70.6042, elevationMeters: 371, highways: ['N-55 Indus Hwy'] },
  { id: 'dikhan', nameEn: 'Dera Ismail Khan', nameUr: 'ڈیرہ اسماعیل خان', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', lat: 31.8314, lng: 70.9019, elevationMeters: 165, highways: ['M-14 Hakla', 'N-55'] },
  { id: 'chaman', nameEn: 'Chaman', nameUr: 'چمن', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', lat: 30.9210, lng: 66.4597, elevationMeters: 1324, highways: ['N-25 RCD Hwy'] },
  { id: 'hub', nameEn: 'Hub', nameUr: 'حب چوکی', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', lat: 25.0289, lng: 66.8833, elevationMeters: 25, highways: ['N-25', 'RCD Hwy'] },
  { id: 'skardu', nameEn: 'Skardu', nameUr: 'سکردو', provinceEn: 'GB', provinceUr: 'گلگت بلتستان', lat: 35.2971, lng: 75.6333, elevationMeters: 2228, highways: ['Jaglot-Skardu Rd'] },
  { id: 'jhelum', nameEn: 'Jhelum', nameUr: 'جہلم', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 32.9425, lng: 73.7257, elevationMeters: 233, highways: ['N-5 G.T Road'] },
  { id: 'chakwal', nameEn: 'Chakwal', nameUr: 'چکوال', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 32.9328, lng: 72.8631, elevationMeters: 498, highways: ['M-2 Interchange Balkassar'] },
  { id: 'attock', nameEn: 'Attock', nameUr: 'اٹک', provinceEn: 'Punjab', provinceUr: 'پنجاب', lat: 33.7667, lng: 72.3598, elevationMeters: 352, highways: ['M-1 Interchange', 'N-5'] },
  { id: 'mansehra', nameEn: 'Mansehra', nameUr: 'مانسہرہ', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', lat: 34.3333, lng: 73.2000, elevationMeters: 1088, highways: ['M-15 Hazara', 'N-35 KKH'] },
  { id: 'mardan', nameEn: 'Mardan', nameUr: 'مردان', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', lat: 34.1989, lng: 72.0403, elevationMeters: 285, highways: ['M-1 Link', 'N-45'] },
  { id: 'kohat', nameEn: 'Kohat', nameUr: 'کوہاٹ', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', lat: 33.5869, lng: 71.4414, elevationMeters: 489, highways: ['N-55 Indus Hwy', 'Kohat Tunnel'] }
];

export interface PopularRoutePreset {
  id: string;
  nameUr: string;
  nameEn: string;
  originId: string;
  destId: string;
  corridor: string;
  distanceKm: number;
}

export const POPULAR_ROUTES: PopularRoutePreset[] = [
  { id: 'lhr-khi', nameUr: 'لاہور ⇄ کراچی', nameEn: 'Lahore ⇄ Karachi', originId: 'lahore', destId: 'karachi', corridor: 'M-3/4/5/9', distanceKm: 1215 },
  { id: 'lhr-isb', nameUr: 'لاہور ⇄ اسلام آباد', nameEn: 'Lahore ⇄ Islamabad', originId: 'lahore', destId: 'islamabad', corridor: 'M-2', distanceKm: 375 },
  { id: 'isb-psh', nameUr: 'اسلام آباد ⇄ پشاور', nameEn: 'Islamabad ⇄ Peshawar', originId: 'islamabad', destId: 'peshawar', corridor: 'M-1', distanceKm: 155 },
  { id: 'fsd-mul', nameUr: 'فیصل آباد ⇄ ملتان', nameEn: 'Faisalabad ⇄ Multan', originId: 'faisalabad', destId: 'multan', corridor: 'M-4', distanceKm: 242 },
  { id: 'khi-gwd', nameUr: 'کراچی ⇄ گوادر', nameEn: 'Karachi ⇄ Gwadar', originId: 'karachi', destId: 'gwadar', corridor: 'N-10', distanceKm: 653 },
  { id: 'khi-qta', nameUr: 'کراچی ⇄ کوئٹہ', nameEn: 'Karachi ⇄ Quetta', originId: 'karachi', destId: 'quetta', corridor: 'N-25', distanceKm: 687 },
  { id: 'lhr-fsd', nameUr: 'لاہور ⇄ فیصل آباد', nameEn: 'Lahore ⇄ Faisalabad', originId: 'lahore', destId: 'faisalabad', corridor: 'M-3', distanceKm: 180 },
  { id: 'isb-glt', nameUr: 'اسلام آباد ⇄ گلگت', nameEn: 'Islamabad ⇄ Gilgit', originId: 'islamabad', destId: 'gilgit', corridor: 'M-15/N-35', distanceKm: 512 }
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
  const isUrdu = lang === 'ur';
  const [, startTransition] = useTransition();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const navIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchPositionIdRef = useRef<number | null>(null);

  // Search & City Select State
  const [originCityId, setOriginCityId] = useState<string>('lahore');
  const [destCityId, setDestCityId] = useState<string>('karachi');
  
  const [originSearch, setOriginSearch] = useState<string>('');
  const [destSearch, setDestSearch] = useState<string>('');
  const [isOriginOpen, setIsOriginOpen] = useState<boolean>(false);
  const [isDestOpen, setIsDestOpen] = useState<boolean>(false);

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
  const [autoRefreshInterval] = useState<boolean>(true);

  // --- LIVE NAVIGATION STATE ---
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [isNavPaused, setIsNavPaused] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [navProgressPct, setNavProgressPct] = useState<number>(0);
  const [navCurrentSpeed, setNavCurrentSpeed] = useState<number>(68); // km/h
  const [navRemainingDistKm, setNavRemainingDistKm] = useState<number>(0);
  const [navEtaText, setNavEtaText] = useState<string>('');
  const [navStepIndex, setNavStepIndex] = useState<number>(0);
  const [navCurrentPos, setNavCurrentPos] = useState<{ lat: number; lng: number } | null>(null);

  // Filtered Cities for Search Box
  const filteredOriginCities = useMemo(() => {
    if (!originSearch.trim()) return PAKISTAN_CITIES;
    const q = originSearch.toLowerCase().trim();
    return PAKISTAN_CITIES.filter(c => 
      c.nameUr.includes(q) || 
      c.nameEn.toLowerCase().includes(q) || 
      c.provinceUr.includes(q) || 
      c.provinceEn.toLowerCase().includes(q) ||
      c.highways.some(h => h.toLowerCase().includes(q))
    );
  }, [originSearch]);

  const filteredDestCities = useMemo(() => {
    if (!destSearch.trim()) return PAKISTAN_CITIES;
    const q = destSearch.toLowerCase().trim();
    return PAKISTAN_CITIES.filter(c => 
      c.nameUr.includes(q) || 
      c.nameEn.toLowerCase().includes(q) || 
      c.provinceUr.includes(q) || 
      c.provinceEn.toLowerCase().includes(q) ||
      c.highways.some(h => h.toLowerCase().includes(q))
    );
  }, [destSearch]);

  const originCity = useMemo(() => {
    return PAKISTAN_CITIES.find(c => c.id === originCityId) || PAKISTAN_CITIES[0];
  }, [originCityId]);

  const destCity = useMemo(() => {
    return PAKISTAN_CITIES.find(c => c.id === destCityId) || PAKISTAN_CITIES[1];
  }, [destCityId]);

  // Derive intermediate transit waypoints between Origin and Destination
  const routeCities = useMemo(() => {
    if (originCity.id === destCity.id) {
      return [originCity];
    }

    // Common Pakistan Trunk Corridors with detailed checkpoints
    const isLhrKhi = (originCity.id === 'lahore' && destCity.id === 'karachi') || (originCity.id === 'karachi' && destCity.id === 'lahore');
    if (isLhrKhi) {
      const stops = ['lahore', 'faisalabad', 'kamalia', 'multan', 'bahawalpur', 'rahimyarkhan', 'sukkur', 'hyderabad', 'karachi'];
      const resolved = stops.map(id => PAKISTAN_CITIES.find(c => c.id === id)).filter(Boolean) as TransitCity[];
      return originCity.id === 'karachi' ? [...resolved].reverse() : resolved;
    }

    const isLhrIsb = (originCity.id === 'lahore' && (destCity.id === 'islamabad' || destCity.id === 'rawalpindi')) || ((originCity.id === 'islamabad' || originCity.id === 'rawalpindi') && destCity.id === 'lahore');
    if (isLhrIsb) {
      const stops = ['lahore', 'sheikhupura', 'sargodha', 'chakwal', 'rawalpindi', 'islamabad'];
      const resolved = stops.map(id => PAKISTAN_CITIES.find(c => c.id === id)).filter(Boolean) as TransitCity[];
      return (originCity.id === 'islamabad' || originCity.id === 'rawalpindi') ? [...resolved].reverse() : resolved;
    }

    const isIsbPsh = ((originCity.id === 'islamabad' || originCity.id === 'rawalpindi') && destCity.id === 'peshawar') || (originCity.id === 'peshawar' && (destCity.id === 'islamabad' || destCity.id === 'rawalpindi'));
    if (isIsbPsh) {
      const stops = ['islamabad', 'attock', 'nowshera', 'peshawar'];
      const resolved = stops.map(id => PAKISTAN_CITIES.find(c => c.id === id)).filter(Boolean) as TransitCity[];
      return originCity.id === 'peshawar' ? [...resolved].reverse() : resolved;
    }

    const isFsdMul = (originCity.id === 'faisalabad' && destCity.id === 'multan') || (originCity.id === 'multan' && destCity.id === 'faisalabad');
    if (isFsdMul) {
      const stops = ['faisalabad', 'kamalia', 'multan'];
      const resolved = stops.map(id => PAKISTAN_CITIES.find(c => c.id === id)).filter(Boolean) as TransitCity[];
      return originCity.id === 'multan' ? [...resolved].reverse() : resolved;
    }

    const isKhiQta = (originCity.id === 'karachi' && destCity.id === 'quetta') || (originCity.id === 'quetta' && destCity.id === 'karachi');
    if (isKhiQta) {
      const stops = ['karachi', 'hub', 'khuzdar', 'quetta'];
      const resolved = stops.map(id => PAKISTAN_CITIES.find(c => c.id === id)).filter(Boolean) as TransitCity[];
      return originCity.id === 'quetta' ? [...resolved].reverse() : resolved;
    }

    // Default 2 points
    return [originCity, destCity];
  }, [originCity, destCity]);

  // Approximate distance and duration calculation
  const routeMetrics = useMemo(() => {
    if (routeCities.length < 2) {
      return { distanceKm: 0, truckTime: 0, carTime: 0, corridorCode: 'Single Station' };
    }

    let totalDist = 0;
    const R = 6371; // Earth radius km

    for (let i = 0; i < routeCities.length - 1; i++) {
      const o = routeCities[i];
      const d = routeCities[i + 1];
      const dLat = (d.lat - o.lat) * Math.PI / 180;
      const dLng = (d.lng - o.lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(o.lat * Math.PI / 180) * Math.cos(d.lat * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const legDist = R * c * 1.22; // Road winding factor
      totalDist += legDist;
    }

    const distKm = Math.round(totalDist);
    const truckHours = Math.round((distKm / 60) * 10) / 10;
    const carHours = Math.round((distKm / 85) * 10) / 10;

    return {
      distanceKm: distKm,
      truckTime: truckHours,
      carTime: carHours,
      corridorCode: `${originCity.nameUr} تا ${destCity.nameUr}`
    };
  }, [routeCities, originCity, destCity]);

  // Interpret Open-Meteo weather codes
  const parseWeatherCode = (code: number, visibilityMeters: number, windKmh: number, tempC: number) => {
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

  // Fetch live weather from Open-Meteo
  const fetchAllCitiesWeather = async () => {
    setLoadingWeather(true);
    try {
      const results: Record<string, LiveWeatherData> = {};
      const coords = PAKISTAN_CITIES.map(c => ({ id: c.id, lat: c.lat, lng: c.lng }));

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
        } catch {
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

  // Initial load
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
      const interval = setInterval(fetchAllCitiesWeather, 60000 * 10);
      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval]);

  // Leaflet Tile URLs
  const getTileUrl = (layer: 'streets' | 'satellite' | 'terrain' | 'dark') => {
    switch (layer) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USGS'
        };
      case 'terrain':
        return {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution: 'Map data: &copy; OpenStreetMap contributors'
        };
      case 'dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution: '&copy; CARTO'
        };
      case 'streets':
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; OpenStreetMap contributors'
        };
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

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

    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 400);

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

  // Update Tile Layer
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

  // Update Markers & Polyline
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

    // 1. Draw Polyline
    if (routeCities.length >= 2) {
      const polylineCoords = routeCities.map(c => [c.lat, c.lng] as [number, number]);
      
      const polyline = L.polyline(polylineCoords, {
        color: '#10B981',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      routePolylineRef.current = polyline;
      polylineCoords.forEach(pt => bounds.extend(pt));
    }

    // 2. Add City & Weather Markers
    PAKISTAN_CITIES.forEach(city => {
      const isRoutePoint = routeCityIds.has(city.id);
      const isOrigin = routeCities[0]?.id === city.id;
      const isDest = routeCities[routeCities.length - 1]?.id === city.id && routeCities.length > 1;
      const weather = weatherMap[city.id];

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
            <span style="color: ${bgBadgeColor};">${city.nameUr.split('/')[0]}</span>
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

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; text-align: right; direction: rtl; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 8px;">
            <div>
              <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #111827;">${city.nameUr} (${city.nameEn})</h3>
              <span style="font-size: 10px; color: #6b7280;">${city.provinceUr} · ${city.elevationMeters}m اونچائی</span>
            </div>
            <div style="font-size: 20px;">${weatherEmoji}</div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; margin-bottom: 8px;">
            <div style="background: #f3f4f6; padding: 4px 6px; border-radius: 6px;">
              <span style="color: #6b7280; display: block; font-size: 9px;">درجہ حرارت</span>
              <strong style="font-size: 13px; color: #1f2937;">${weather ? `${weather.temp}°C` : '--'}</strong>
            </div>
            <div style="background: #f3f4f6; padding: 4px 6px; border-radius: 6px;">
              <span style="color: #6b7280; display: block; font-size: 9px;">حدِ نگاہ (دید)</span>
              <strong style="font-size: 13px; color: ${weather && weather.visibilityKm < 1 ? '#dc2626' : '#1f2937'};">${weather ? `${weather.visibilityKm} km` : '--'}</strong>
            </div>
            <div style="background: #f3f4f6; padding: 4px 6px; border-radius: 6px;">
              <span style="color: #6b7280; display: block; font-size: 9px;">ہوا کی رفتار</span>
              <strong style="font-size: 12px; color: #1f2937;">${weather ? `${weather.windSpeed} km/h` : '--'}</strong>
            </div>
            <div style="background: #f3f4f6; padding: 4px 6px; border-radius: 6px;">
              <span style="color: #6b7280; display: block; font-size: 9px;">نمی کا تناسب</span>
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
            <strong>روڈ کنڈیشن:</strong> ${weather ? weather.roadStatusUr : '--'}
          </div>

          <div style="font-size: 10px; color: #4b5563; margin-bottom: 6px;">
            <strong>منسلک ہائی ویز:</strong> ${city.highways.join(', ')}
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

    // 3. Navigation Dynamic Vehicle / Live GPS Marker
    if (isNavigating && navCurrentPos) {
      const vehicleIcon = L.divIcon({
        className: 'custom-nav-vehicle-pin',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            background: #10B981;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 16px rgba(16,185,129,0.9);
            transform: translate(-50%, -50%);
            animation: pulse 2s infinite;
          ">
            <span style="font-size: 18px;">🚚</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      L.marker([navCurrentPos.lat, navCurrentPos.lng], { icon: vehicleIcon, zIndexOffset: 1000 })
        .addTo(markersGroup)
        .bindPopup('گاڑی کا لائیو مقام (نیویگیشن موڈ)');
      bounds.extend([navCurrentPos.lat, navCurrentPos.lng]);
    } else if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-loc-pin',
        html: `
          <div style="
            width: 20px;
            height: 20px;
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
        .bindPopup('آپ کی موجودہ لوکیشن');
      bounds.extend([userLocation.lat, userLocation.lng]);
    }

    // Auto-fit bounds
    if (bounds.isValid() && routeCities.length >= 2 && !isNavigating) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10, animate: true });
    }
  }, [routeCities, weatherMap, lang, userLocation, isNavigating, navCurrentPos]);

  // Swap Origin and Destination
  const handleSwapCities = () => {
    startTransition(() => {
      const temp = originCityId;
      setOriginCityId(destCityId);
      setDestCityId(temp);
    });
  };

  // Speak Urdu audio announcement
  const speakUrduAlert = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ur-PK';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  };

  // Start Real-Time Live Navigation
  const handleStartNavigation = () => {
    if (routeCities.length < 2) return;

    setIsNavigating(true);
    setIsNavPaused(false);
    setNavStepIndex(0);
    setNavProgressPct(0);
    setNavCurrentSpeed(65);

    const firstCity = routeCities[0];
    const initialPos = { lat: firstCity.lat, lng: firstCity.lng };
    setNavCurrentPos(initialPos);
    setNavRemainingDistKm(routeMetrics.distanceKm);

    // Calculate initial ETA
    const now = new Date();
    now.setMinutes(now.getMinutes() + Math.round(routeMetrics.truckTime * 60));
    const etaStr = now.toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' });
    setNavEtaText(etaStr);

    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([firstCity.lat, firstCity.lng], 12, { animate: true });
    }

    const startMsg = `ڈرائیور دوست لائیو نیویگیشن شروع ہو گئی ہے۔ ${originCity.nameUr} سے ${destCity.nameUr} تک کل فاصلہ ${routeMetrics.distanceKm} کلومیٹر ہے۔ محفوظ ڈرائیونگ کریں۔`;
    speakUrduAlert(startMsg);

    // Watch position if GPS is available
    if (navigator.geolocation) {
      try {
        const watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const gpsPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(gpsPos);
            setNavCurrentPos(gpsPos);
            if (pos.coords.speed && pos.coords.speed > 0) {
              setNavCurrentSpeed(Math.round(pos.coords.speed * 3.6));
            }
          },
          () => {
            // fallback to simulation
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
        );
        watchPositionIdRef.current = watchId;
      } catch {
        // ignore
      }
    }

    // Dynamic Simulation Step Progress along Route Waypoints
    if (navIntervalRef.current) clearInterval(navIntervalRef.current);
    let progress = 0;
    navIntervalRef.current = setInterval(() => {
      progress += 1;
      if (progress > 100) {
        progress = 100;
        if (navIntervalRef.current) clearInterval(navIntervalRef.current);
        speakUrduAlert(`مبارک ہو! آپ اپنی منزل ${destCity.nameUr} پہنچ چکے ہیں۔`);
      }
      setNavProgressPct(progress);

      const remain = Math.max(0, Math.round(routeMetrics.distanceKm * (1 - progress / 100)));
      setNavRemainingDistKm(remain);

      // Interpolate position along route waypoints
      if (routeCities.length >= 2) {
        const totalSegments = routeCities.length - 1;
        const currentSegmentIndex = Math.min(totalSegments - 1, Math.floor((progress / 100) * totalSegments));
        setNavStepIndex(currentSegmentIndex);

        const segmentProgress = ((progress / 100) * totalSegments) - currentSegmentIndex;
        const p1 = routeCities[currentSegmentIndex];
        const p2 = routeCities[currentSegmentIndex + 1];

        const currentLat = p1.lat + (p2.lat - p1.lat) * segmentProgress;
        const currentLng = p1.lng + (p2.lng - p1.lng) * segmentProgress;
        const newPos = { lat: currentLat, lng: currentLng };
        setNavCurrentPos(newPos);

        if (leafletMapRef.current) {
          leafletMapRef.current.panTo([currentLat, currentLng], { animate: true });
        }
      }
    }, 3000);
  };

  // Stop / Exit Navigation
  const handleStopNavigation = () => {
    setIsNavigating(false);
    setIsNavPaused(false);
    setNavCurrentPos(null);
    if (navIntervalRef.current) {
      clearInterval(navIntervalRef.current);
      navIntervalRef.current = null;
    }
    if (watchPositionIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchPositionIdRef.current);
      watchPositionIdRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Open Turn-by-Turn GPS directly in Google Maps
  const handleOpenGoogleMapsNav = () => {
    const origin = routeCities[0];
    const dest = routeCities[routeCities.length - 1];
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${dest.lat},${dest.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // Geolocation trigger
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('آپ کے موبائل براؤزر میں لوکیشن کی سہولت موجود نہیں۔');
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
      () => {
        setLocatingUser(false);
        alert('لوکیشن حاصل کرنے میں مسئلہ پیش آیا۔ موبائل جی پی ایس آن کریں۔');
      },
      { timeout: 8000 }
    );
  };

  // Share route weather on WhatsApp in Urdu
  const handleShareWeatherWhatsApp = () => {
    const origin = routeCities[0];
    const dest = routeCities[routeCities.length - 1];
    if (!origin || !dest) return;

    const originWeather = weatherMap[origin.id];
    const destWeather = weatherMap[dest.id];

    let message = `*🚚 ڈرائیور دوست - روٹ و لائیو موسم رپورٹ (Driver Dost)*\n`;
    message += `🛣️ *روٹ:* ${origin.nameUr} تا ${dest.nameUr}\n`;
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
    <div className={`flex-1 flex flex-col max-w-7xl mx-auto w-full p-3 sm:p-6 lg:p-8 gap-5 sm:gap-6 animate-in fade-in ${isUrdu ? 'text-right' : 'text-left'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
      
      {/* Top Header Banner */}
      <header className="bg-white p-5 sm:p-7 rounded-[32px] sm:rounded-[36px] shadow-sm border border-[#ecece0] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#8b9d77]/15 text-[#5a5a40]">
              <MapIcon className="w-3.5 h-3.5 text-[#8b9d77]" />
              <span>{isUrdu ? 'پاکستان روٹ میپ و لائیو نیویگیشن' : 'Pakistan Route Map & Live Navigation'}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700">
              <Sparkles className="w-3 h-3" />
              <span>{isUrdu ? 'لائیو سڑک و موسم الرٹ' : 'Live Highway Weather Alerts'}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#4a4a35]">
            {isUrdu ? 'ہائی وے میپ، موسم و لائیو نیویگیشن' : 'Highway Map, Weather & Navigation'}
          </h1>
          <p className="text-[#8e8e75] text-xs sm:text-sm mt-1 max-w-2xl">
            {isUrdu
              ? 'شہر تلاش کریں، مکمل روٹ کا لائیو موسم دیکھیں اور ڈرائیونگ کے لیے لائیو نیویگیشن شروع کریں۔'
              : 'Search cities, view real-time corridor weather updates, and launch turn-by-turn navigation.'}
          </p>
        </div>

        {/* Action Button Group */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchAllCitiesWeather}
            disabled={loadingWeather}
            aria-label={isUrdu ? 'موسم اپڈیٹ کریں' : 'Refresh Weather'}
            className="px-4 py-2.5 rounded-2xl bg-[#f0f0e4] hover:bg-[#8b9d77] hover:text-white text-[#4a4a35] text-xs font-bold font-serif transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingWeather ? 'animate-spin' : ''}`} />
            <span>{loadingWeather ? (isUrdu ? 'اپڈیٹ ہو رہا ہے...' : 'Updating...') : (isUrdu ? 'موسم ریفریش' : 'Refresh Weather')}</span>
          </button>

          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingUser}
            aria-label={isUrdu ? 'میری لوکیشن' : 'My Location'}
            className="px-4 py-2.5 rounded-2xl bg-[#f0f0e4] hover:bg-[#2563eb] hover:text-white text-[#4a4a35] text-xs font-bold font-serif transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
          >
            <Crosshair className={`w-3.5 h-3.5 ${locatingUser ? 'animate-spin text-blue-600' : ''}`} />
            <span>{locatingUser ? (isUrdu ? 'تلاش جاری...' : 'Locating...') : (isUrdu ? 'میری لوکیشن' : 'My Location')}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWeatherWhatsApp}
            aria-label={isUrdu ? 'واٹس ایپ پر شیئر کریں' : 'Share on WhatsApp'}
            className="px-4 py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold font-serif transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{shareSuccess ? (isUrdu ? 'شیئر ہو گیا!' : 'Shared!') : (isUrdu ? 'واٹس ایپ شیئر' : 'Share Route')}</span>
          </button>
        </div>
      </header>

      {/* SEARCHABLE CITY SELECTION BOX (From City & To City) */}
      <section className="bg-white p-5 sm:p-6 rounded-[32px] sm:rounded-[36px] shadow-sm border border-[#ecece0] space-y-4">
        
        <div className="flex items-center justify-between border-b border-[#ecece0] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#8b9d77]/15 text-[#8b9d77]">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm sm:text-base text-[#4a4a35]">
                {isUrdu ? 'روٹ کا انتخاب کریں (شہر تلاش کریں)' : 'Select Route (Search Cities)'}
              </h2>
              <p className="text-[11px] text-[#8e8e75]">
                {isUrdu ? 'پاکستان کا کوئی بھی شہر لکھ کر یا لسٹ سے منتخب کریں' : 'Search or pick any transit city across Pakistan'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSwapCities}
            title={isUrdu ? 'روانگی اور منزل تبدیل کریں' : 'Swap Origin and Destination'}
            className="px-3 py-1.5 rounded-xl bg-[#f0f0e4] hover:bg-[#8b9d77] hover:text-white text-[#4a4a35] transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isUrdu ? 'تبدیل کریں' : 'Swap'}</span>
          </button>
        </div>

        {/* Dual Searchable City Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          
          {/* FROM CITY (کہاں سے روانگی) */}
          <div className="relative">
            <label className="text-xs font-bold text-[#4a4a35] flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>{isUrdu ? 'کہاں سے روانگی (From City):' : 'From City (Origin):'}</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-normal bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {isUrdu ? originCity.provinceUr : originCity.provinceEn}
              </span>
            </label>

            {/* Input / Display */}
            <div 
              onClick={() => {
                setIsOriginOpen(!isOriginOpen);
                setIsDestOpen(false);
              }}
              className="w-full px-4 py-3 bg-[#fdfbf7] border-2 border-emerald-300 hover:border-emerald-500 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-sm text-[#1f2937]">
                  {isUrdu ? `${originCity.nameUr} (${originCity.nameEn})` : `${originCity.nameEn} (${originCity.provinceEn})`}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#8e8e75] transition-transform ${isOriginOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Search Dropdown Popup */}
            {isOriginOpen && (
              <div className="absolute top-full right-0 left-0 mt-2 z-[600] bg-white rounded-2xl shadow-xl border border-[#ecece0] p-3 space-y-2 max-h-72 flex flex-col animate-in fade-in">
                <div className="relative">
                  <input
                    type="text"
                    value={originSearch}
                    onChange={(e) => setOriginSearch(e.target.value)}
                    placeholder={isUrdu ? 'شہر کا نام اردو یا English میں لکھیں...' : 'Search city by name or highway...'}
                    autoFocus
                    className="w-full px-3 py-2 pr-9 bg-[#fdfbf7] border border-[#ecece0] rounded-xl text-xs font-bold text-[#1f2937] focus:outline-none focus:border-emerald-500"
                  />
                  <Search className="w-4 h-4 text-[#8e8e75] absolute right-3 top-2.5" />
                </div>

                <div className="overflow-y-auto no-scrollbar space-y-1 flex-1">
                  {filteredOriginCities.length === 0 ? (
                    <div className="text-center py-4 text-xs text-[#8e8e75]">
                      {isUrdu ? 'کوئی شہر نہیں ملا' : 'No city found'}
                    </div>
                  ) : (
                    filteredOriginCities.map(c => {
                      const isSel = c.id === originCityId;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setOriginCityId(c.id);
                            setIsOriginOpen(false);
                            setOriginSearch('');
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                            isUrdu ? 'text-right' : 'text-left'
                          } ${
                            isSel ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'hover:bg-[#fdfbf7] text-[#4a4a35]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>{isUrdu ? `${c.nameUr} (${c.nameEn})` : `${c.nameEn} (${c.provinceEn})`}</span>
                          </div>
                          <span className="text-[10px] text-[#8e8e75] bg-[#f0f0e4] px-2 py-0.5 rounded-md">
                            {isUrdu ? c.provinceUr : c.provinceEn}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* TO CITY (کہاں تک منزل) */}
          <div className="relative">
            <label className="text-xs font-bold text-[#4a4a35] flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                <span>{isUrdu ? 'کہاں تک منزل (To City):' : 'To City (Destination):'}</span>
              </span>
              <span className="text-[10px] text-rose-700 font-normal bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                {isUrdu ? destCity.provinceUr : destCity.provinceEn}
              </span>
            </label>

            {/* Input / Display */}
            <div 
              onClick={() => {
                setIsDestOpen(!isDestOpen);
                setIsOriginOpen(false);
              }}
              className="w-full px-4 py-3 bg-[#fdfbf7] border-2 border-rose-300 hover:border-rose-500 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-bold text-sm text-[#1f2937]">
                  {isUrdu ? `${destCity.nameUr} (${destCity.nameEn})` : `${destCity.nameEn} (${destCity.provinceEn})`}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#8e8e75] transition-transform ${isDestOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Search Dropdown Popup */}
            {isDestOpen && (
              <div className="absolute top-full right-0 left-0 mt-2 z-[600] bg-white rounded-2xl shadow-xl border border-[#ecece0] p-3 space-y-2 max-h-72 flex flex-col animate-in fade-in">
                <div className="relative">
                  <input
                    type="text"
                    value={destSearch}
                    onChange={(e) => setDestSearch(e.target.value)}
                    placeholder={isUrdu ? 'شہر کا نام اردو یا English میں لکھیں...' : 'Search destination city...'}
                    autoFocus
                    className="w-full px-3 py-2 pr-9 bg-[#fdfbf7] border border-[#ecece0] rounded-xl text-xs font-bold text-[#1f2937] focus:outline-none focus:border-rose-500"
                  />
                  <Search className="w-4 h-4 text-[#8e8e75] absolute right-3 top-2.5" />
                </div>

                <div className="overflow-y-auto no-scrollbar space-y-1 flex-1">
                  {filteredDestCities.length === 0 ? (
                    <div className="text-center py-4 text-xs text-[#8e8e75]">
                      {isUrdu ? 'کوئی شہر نہیں ملا' : 'No city found'}
                    </div>
                  ) : (
                    filteredDestCities.map(c => {
                      const isSel = c.id === destCityId;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setDestCityId(c.id);
                            setIsDestOpen(false);
                            setDestSearch('');
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                            isUrdu ? 'text-right' : 'text-left'
                          } ${
                            isSel ? 'bg-rose-50 text-rose-800 border border-rose-300' : 'hover:bg-[#fdfbf7] text-[#4a4a35]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>{isUrdu ? `${c.nameUr} (${c.nameEn})` : `${c.nameEn} (${c.provinceEn})`}</span>
                          </div>
                          <span className="text-[10px] text-[#8e8e75] bg-[#f0f0e4] px-2 py-0.5 rounded-md">
                            {isUrdu ? c.provinceUr : c.provinceEn}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Quick Popular Corridors Chips */}
        <div className="pt-2 border-t border-[#ecece0]/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-[#8e8e75] shrink-0">
            {isUrdu ? 'فوری راستے:' : 'Popular Routes:'}
          </span>
          {POPULAR_ROUTES.map(pr => {
            const isMatch = (originCityId === pr.originId && destCityId === pr.destId) || (originCityId === pr.destId && destCityId === pr.originId);
            return (
              <button
                key={pr.id}
                type="button"
                onClick={() => {
                  setOriginCityId(pr.originId);
                  setDestCityId(pr.destId);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                  isMatch
                    ? 'bg-[#8b9d77] text-white border-[#8b9d77] shadow-xs'
                    : 'bg-[#fdfbf7] text-[#4a4a35] border-[#ecece0] hover:border-[#8b9d77]'
                }`}
              >
                <span>{isUrdu ? pr.nameUr : pr.nameEn}</span>
                <span className="text-[10px] mx-1 opacity-75 font-mono">({pr.distanceKm}km)</span>
              </button>
            );
          })}
        </div>

      </section>

      {/* LIVE NAVIGATION HUD PANEL (When Navigation is Active) */}
      {isNavigating && (
        <section className="bg-gradient-to-r from-[#1e3a68] via-[#162a4d] to-[#1e3a68] text-white p-5 sm:p-7 rounded-[32px] sm:rounded-[36px] shadow-lg border-2 border-emerald-400 space-y-4 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500 text-white rounded-2xl animate-pulse shadow-md">
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-400/20 text-emerald-300 rounded-full text-[10px] font-bold border border-emerald-400/30">
                    {isUrdu ? 'لائیو GPS نیویگیشن فعال ہے' : 'Live GPS Navigation Active'}
                  </span>
                  <span className="text-xs text-white/70">
                    {isUrdu ? `${originCity.nameUr} تا ${destCity.nameUr}` : `${originCity.nameEn} to ${destCity.nameEn}`}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-white mt-0.5">
                  {isUrdu ? 'اگلا اسٹیشن: ' : 'Next Station: '}
                  {isUrdu
                    ? (routeCities[Math.min(routeCities.length - 1, navStepIndex + 1)]?.nameUr || destCity.nameUr)
                    : (routeCities[Math.min(routeCities.length - 1, navStepIndex + 1)]?.nameEn || destCity.nameEn)}
                </h2>
              </div>
            </div>

            {/* Navigation HUD Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                title={voiceEnabled ? (isUrdu ? 'آواز بند کریں' : 'Mute Voice') : (isUrdu ? 'آواز آن کریں' : 'Unmute Voice')}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  voiceEnabled ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-white/10 border-white/20 text-white/60'
                }`}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleOpenGoogleMapsNav}
                title={isUrdu ? 'گوگل میپس میں ٹرن بائی ٹرن GPS کھولیں' : 'Open in Google Maps App'}
                className="px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
                <span>{isUrdu ? 'گوگل میپس ایپ' : 'Google Maps'}</span>
              </button>

              <button
                type="button"
                onClick={handleStopNavigation}
                className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Square className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'نیویگیشن ختم' : 'Stop Navigation'}</span>
              </button>
            </div>
          </div>

          {/* Metric Dashboard HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <span className="text-[11px] text-white/70 block">
                {isUrdu ? 'باقی فاصلہ' : 'Remaining Distance'}
              </span>
              <strong className="text-xl sm:text-2xl font-mono font-bold text-emerald-300">
                {navRemainingDistKm.toLocaleString()} <span className="text-xs">km</span>
              </strong>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <span className="text-[11px] text-white/70 block">
                {isUrdu ? 'گاڑی کی رفتار' : 'Current Speed'}
              </span>
              <strong className="text-xl sm:text-2xl font-mono font-bold text-amber-300">
                {navCurrentSpeed} <span className="text-xs">km/h</span>
              </strong>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <span className="text-[11px] text-white/70 block">
                {isUrdu ? 'پہنچنے کا وقت (ETA)' : 'Estimated Arrival (ETA)'}
              </span>
              <strong className="text-lg sm:text-xl font-serif font-bold text-white">
                {navEtaText}
              </strong>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <span className="text-[11px] text-white/70 block">
                {isUrdu ? 'سفر کا مرحلہ' : 'Trip Progress'}
              </span>
              <strong className="text-lg sm:text-xl font-mono font-bold text-white">
                {navProgressPct}%
              </strong>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-400 h-full transition-all duration-500 rounded-full shadow-sm"
              style={{ width: `${navProgressPct}%` }}
            />
          </div>

        </section>
      )}

      {/* Main Grid: Interactive Map + Route & Weather Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left / Center: Interactive Leaflet Map */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          
          <div className="bg-white p-2 rounded-[32px] sm:rounded-[36px] shadow-sm border border-[#ecece0] overflow-hidden relative">
            
            {/* Map Layer Switcher Floating Pill */}
            <div className={`absolute top-5 ${isUrdu ? 'right-5' : 'left-5'} z-[500] bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-[#ecece0] flex items-center gap-1 text-[11px] font-bold`}>
              <button
                type="button"
                onClick={() => setActiveMapLayer('streets')}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${activeMapLayer === 'streets' ? 'bg-[#8b9d77] text-white' : 'text-[#4a4a35] hover:bg-[#f0f0e4]'}`}
              >
                {isUrdu ? 'سڑکیں' : 'Streets'}
              </button>
              <button
                type="button"
                onClick={() => setActiveMapLayer('satellite')}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${activeMapLayer === 'satellite' ? 'bg-[#8b9d77] text-white' : 'text-[#4a4a35] hover:bg-[#f0f0e4]'}`}
              >
                {isUrdu ? 'سیٹلائٹ' : 'Satellite'}
              </button>
              <button
                type="button"
                onClick={() => setActiveMapLayer('terrain')}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${activeMapLayer === 'terrain' ? 'bg-[#8b9d77] text-white' : 'text-[#4a4a35] hover:bg-[#f0f0e4]'}`}
              >
                {isUrdu ? 'پہاڑی رقبہ' : 'Terrain'}
              </button>
              <button
                type="button"
                onClick={() => setActiveMapLayer('dark')}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${activeMapLayer === 'dark' ? 'bg-[#222] text-white' : 'text-[#4a4a35] hover:bg-[#f0f0e4]'}`}
              >
                {isUrdu ? 'نائٹ موڈ' : 'Night'}
              </button>
            </div>

            {/* Weather Legend Float on Map */}
            <div className={`absolute bottom-5 ${isUrdu ? 'left-5 text-right' : 'right-5 text-left'} z-[500] bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-md border border-[#ecece0] text-[10px] text-[#4a4a35] space-y-1 hidden sm:block`}>
              <div className="font-bold font-serif text-[#8b9d77]">
                {isUrdu ? 'موسمی علامات:' : 'Weather Legend:'}
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">{isUrdu ? '🟢 محفوظ / صاف' : '🟢 Safe / Clear'}</span>
                <span className="flex items-center gap-1">{isUrdu ? '🟡 دھند / بارش' : '🟡 Fog / Rain'}</span>
                <span className="flex items-center gap-1">{isUrdu ? '🔴 وارننگ' : '🔴 Alert'}</span>
              </div>
            </div>

            {/* Map Canvas */}
            <div 
              ref={mapContainerRef} 
              id="pakistan-route-weather-map"
              className="w-full h-[460px] sm:h-[540px] md:h-[620px] rounded-[28px] z-0 overflow-hidden"
              style={{ background: '#e5e7eb' }}
            />
          </div>

          {/* Route Stations Weather Flow Horizontal Cards */}
          <div className="bg-white p-5 sm:p-6 rounded-[32px] sm:rounded-[36px] shadow-sm border border-[#ecece0] space-y-4">
            
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-sm sm:text-base text-[#4a4a35] flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#8b9d77]" />
                <span>{isUrdu ? 'روٹ کے تمام اہم اسٹیشنز اور موسمی صورتحال:' : 'Route Stations & Live Weather Status:'}</span>
              </h2>
              <span className="text-xs font-mono font-bold text-[#8b9d77]">
                {routeCities.length} {isUrdu ? 'اسٹاپ پوائنٹس' : 'Transit Stops'}
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
                      isUrdu ? 'text-right' : 'text-left'
                    } ${
                      isOrigin
                        ? 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-500'
                        : isDest
                          ? 'bg-rose-50/70 border-rose-300 hover:border-rose-500'
                          : 'bg-[#fdfbf7] border-[#ecece0] hover:border-[#8b9d77] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className={isUrdu ? 'text-left' : 'text-right'}>
                        <div className="text-lg font-serif font-bold text-[#4a4a35]">
                          {weather ? `${weather.temp}°C` : '--'}
                        </div>
                        <div className="text-[10px] text-[#8e8e75]">
                          {weather ? (isUrdu ? weather.conditionUr : weather.conditionEn) : '--'}
                        </div>
                      </div>

                      <div className={isUrdu ? 'text-right' : 'text-left'}>
                        <div className={`flex items-center ${isUrdu ? 'justify-end' : 'justify-start'} gap-1.5`}>
                          <h3 className="font-serif font-bold text-sm text-[#4a4a35]">
                            {isUrdu ? city.nameUr : city.nameEn}
                          </h3>
                          <span className={`w-2 h-2 rounded-full ${isOrigin ? 'bg-emerald-500' : isDest ? 'bg-rose-500' : 'bg-blue-500'}`}></span>
                        </div>
                        <span className="text-[10px] text-[#8e8e75] font-sans">
                          {isOrigin ? (isUrdu ? 'روانگی مقام' : 'Origin Station') : isDest ? (isUrdu ? 'منزل مقام' : 'Destination') : `${isUrdu ? 'چیک پوائنٹ' : 'Checkpoint'} #${idx}`}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] pt-2 border-t border-[#ecece0]/80">
                      <div className="bg-white/80 p-1.5 rounded-xl">
                        <span className="text-[#8e8e75] block text-[9px]">{isUrdu ? 'دید' : 'Vis'}</span>
                        <strong className={weather && weather.visibilityKm < 1 ? 'text-red-600' : 'text-[#4a4a35]'}>
                          {weather ? `${weather.visibilityKm}km` : '--'}
                        </strong>
                      </div>
                      <div className="bg-white/80 p-1.5 rounded-xl">
                        <span className="text-[#8e8e75] block text-[9px]">{isUrdu ? 'ہوا' : 'Wind'}</span>
                        <strong>{weather ? `${weather.windSpeed}k/h` : '--'}</strong>
                      </div>
                      <div className="bg-white/80 p-1.5 rounded-xl">
                        <span className="text-[#8e8e75] block text-[9px]">{isUrdu ? 'نمی' : 'Hum'}</span>
                        <strong>{weather ? `${weather.humidity}%` : '--'}</strong>
                      </div>
                    </div>

                    {weather && weather.fogWarning && (
                      <div className={`mt-2 text-[10px] font-bold text-amber-900 bg-amber-100/90 border border-amber-300 rounded-xl px-2 py-1 flex items-center gap-1 ${isUrdu ? 'justify-end' : 'justify-start'}`}>
                        <span>{isUrdu ? 'دھند / اسموگ وارننگ' : 'Fog / Smog Warning'}</span>
                        <CloudFog className="w-3 h-3 text-amber-700 shrink-0" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* DEDICATED NAVIGATION ACTION BAR UNDER WEATHER DISPLAY */}
            <div className="pt-4 border-t border-[#ecece0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-[#4a4a35]">
                  {isUrdu ? 'روٹ نیویگیشن اور ٹرن بائی ٹرن رہنمائی' : 'Route Navigation & Turn-by-Turn Guidance'}
                </h3>
                <p className="text-[11px] text-[#8e8e75]">
                  {isUrdu
                    ? `${originCity.nameUr} سے ${destCity.nameUr} کے سفر کے لیے لائیو نیویگیشن چلائیں`
                    : `Start live driving route and GPS navigation from ${originCity.nameEn} to ${destCity.nameEn}`}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleStartNavigation}
                  className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-serif font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white shrink-0" />
                  <span>{isUrdu ? 'نیویگیشن شروع کریں' : 'Start Navigation'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenGoogleMapsNav}
                  title={isUrdu ? 'گوگل میپس میں نیویگیشن کھولیں' : 'Open in Google Maps'}
                  className="px-4 py-3 rounded-2xl bg-[#1e3a68] hover:bg-[#162a4d] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'گوگل میپس' : 'Google Maps'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Sidebar: Route Summary, Calculations & Safety Guide */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Route Metrics Summary Card */}
          <div className="bg-white p-6 rounded-[32px] sm:rounded-[36px] shadow-sm border border-[#ecece0] space-y-5">
            
            <div className="flex items-center justify-between border-b border-[#ecece0] pb-3">
              <h2 className="font-serif font-bold text-base text-[#4a4a35] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#8b9d77]" />
                <span>{isUrdu ? 'سفری تفصیل و دورانیہ' : 'Trip Route & Duration'}</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                {isUrdu ? 'فعال روٹ' : 'Active Route'}
              </span>
            </div>

            {/* Route Stats */}
            <div className="bg-[#fdfbf7] p-4 rounded-2xl border border-[#ecece0] space-y-3">
              
              <div className="flex items-center justify-between text-xs">
                <span className="font-serif font-bold text-base text-emerald-700">
                  {routeMetrics.distanceKm.toLocaleString()} {isUrdu ? 'کلومیٹر' : 'km'}
                </span>
                <span className="text-[#8e8e75]">{isUrdu ? 'کل سفری فاصلہ:' : 'Total Distance:'}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-serif font-bold text-xs text-[#4a4a35]">
                  ~{routeMetrics.truckTime} {isUrdu ? 'گھنٹے (60 km/h)' : 'hours (60 km/h)'}
                </span>
                <span className="text-[#8e8e75]">{isUrdu ? 'کمرشل ٹرک کا وقت:' : 'Commercial Truck:'}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-serif font-bold text-xs text-[#4a4a35]">
                  ~{routeMetrics.carTime} {isUrdu ? 'گھنٹے (85 km/h)' : 'hours (85 km/h)'}
                </span>
                <span className="text-[#8e8e75]">{isUrdu ? 'چھوٹی گاڑی / وین کا وقت:' : 'Light Vehicle / Car:'}</span>
              </div>

            </div>

            {/* Primary Action: Big Start Navigation Button */}
            <button
              type="button"
              onClick={handleStartNavigation}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-serif font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Navigation className="w-4 h-4 animate-bounce" />
              <span>{isUrdu ? 'نیویگیشن شروع کریں (Start Navigation)' : 'Start Live Navigation'}</span>
            </button>

            {/* Direct Shortcuts to Toll Calculator & Trip Cost */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (onOpenTollCalc) {
                    onOpenTollCalc(originCity.nameEn, destCity.nameEn);
                  }
                }}
                className="px-3 py-2.5 rounded-2xl bg-[#8b9d77]/15 hover:bg-[#8b9d77] text-[#5a5a40] hover:text-white text-[11px] font-bold font-serif transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <Calculator className="w-3.5 h-3.5 shrink-0" />
                <span>{isUrdu ? 'ٹول ٹیکس حساب' : 'Toll Tax Calc'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem('ah-prefill-dist', String(routeMetrics.distanceKm));
                  } catch {}
                  onNavigate('calculator');
                }}
                className="px-3 py-2.5 rounded-2xl bg-[#4a4a35] hover:bg-[#383827] text-white text-[11px] font-bold font-serif transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <span>{isUrdu ? 'سفر خرچ حساب' : 'Trip Cost Calc'}</span>
              </button>
            </div>

          </div>

          {/* National Highway & Motorway Police (NHMP) Driver Safety Advisory Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-[32px] sm:rounded-[36px] border border-amber-300/70 space-y-4">
            <div className="flex items-center gap-2.5 text-amber-900 font-serif font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{isUrdu ? 'ڈرائیور رہنمائی و موٹروے پولیس ایڈوائزری' : 'NHMP Driver Safety Advisory'}</span>
            </div>

            <ul className="text-xs text-amber-950/85 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>
                  {isUrdu
                    ? 'دھند اور اسموگ کے دوران رفتار 40 کلومیٹر سے زیادہ نہ کریں اور صرف فوگ لائٹس کا استعمال کریں۔'
                    : 'Maintain speed below 40 km/h during heavy fog/smog and strictly use low beams and fog lamps.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>
                  {isUrdu
                    ? 'موٹروے ایمرجنسی، روڈ بندش یا حادثے کی صورت میں فوری ہیلپ لائن 130 پر رابطہ کریں۔'
                    : 'In case of breakdown or roadblock on motorways, contact NHMP Emergency Helpline 130.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>
                  {isUrdu
                    ? 'شدید گرمی میں طویل سفر پر ٹائر پھٹنے سے بچنے کے لیے ہر 200 کلومیٹر بعد 15 منٹ کا آرام دیں۔'
                    : 'To avoid tire blowouts during peak summer trips, take a 15-minute halt every 200 km.'}
                </span>
              </li>
            </ul>

            <div className="pt-2 border-t border-amber-300/50 flex items-center justify-between text-[11px] font-bold text-amber-900">
              <span>{isUrdu ? 'ہیلپ لائن: 130 NHMP' : 'NHMP Helpline: 130'}</span>
              <span>{isUrdu ? 'ایمرجنسی: 1122' : 'Rescue: 1122'}</span>
            </div>
          </div>

          {/* Selected Transit Hub Detail Card (when clicked on map) */}
          {selectedCityForDetail && (
            <div className="bg-white p-6 rounded-[32px] sm:rounded-[36px] shadow-sm border-2 border-[#8b9d77] space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[#ecece0] pb-3">
                <button
                  type="button"
                  onClick={() => setSelectedCityForDetail(null)}
                  className="text-[#8e8e75] hover:text-[#4a4a35] text-xs font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#4a4a35]">
                    {isUrdu ? selectedCityForDetail.nameUr : selectedCityForDetail.nameEn}
                  </h3>
                  <span className="text-[10px] text-[#8e8e75]">
                    {isUrdu ? selectedCityForDetail.provinceUr : selectedCityForDetail.provinceEn} · {selectedCityForDetail.elevationMeters}m {isUrdu ? 'اونچائی' : 'altitude'}
                  </span>
                </div>
              </div>

              {weatherMap[selectedCityForDetail.id] && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        weatherMap[selectedCityForDetail.id].safetyLevel === 'alert'
                          ? 'bg-red-100 text-red-700'
                          : weatherMap[selectedCityForDetail.id].safetyLevel === 'caution'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isUrdu ? weatherMap[selectedCityForDetail.id].conditionUr : weatherMap[selectedCityForDetail.id].conditionEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={isUrdu ? 'text-right' : 'text-left'}>
                        <div className="text-xl font-serif font-bold text-[#4a4a35]">
                          {weatherMap[selectedCityForDetail.id].temp}°C
                        </div>
                        <div className="text-xs text-[#8e8e75]">
                          {isUrdu ? 'محسوس:' : 'Feels:'} {weatherMap[selectedCityForDetail.id].apparentTemp}°C
                        </div>
                      </div>
                      <span className="text-2xl">
                        {weatherMap[selectedCityForDetail.id].iconType === 'sun' ? '☀️' : 
                         weatherMap[selectedCityForDetail.id].iconType === 'rain' ? '🌧️' : 
                         weatherMap[selectedCityForDetail.id].iconType === 'fog' ? '🌫️' : '⛅'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#fdfbf7] rounded-2xl border border-[#ecece0] text-xs space-y-1">
                    <strong className="text-[#4a4a35] block">{isUrdu ? 'سڑک کی صورتحال:' : 'Road Condition:'}</strong>
                    <p className="text-[#5a5a40]">
                      {isUrdu ? weatherMap[selectedCityForDetail.id].roadStatusUr : weatherMap[selectedCityForDetail.id].roadStatusEn}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOriginCityId(selectedCityForDetail.id)}
                      className="flex-1 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold transition-all hover:bg-emerald-100 cursor-pointer"
                    >
                      {isUrdu ? 'روانگی بنائیں' : 'Set as Origin'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDestCityId(selectedCityForDetail.id)}
                      className="flex-1 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-300 text-[11px] font-bold transition-all hover:bg-rose-100 cursor-pointer"
                    >
                      {isUrdu ? 'منزل بنائیں' : 'Set as Destination'}
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
