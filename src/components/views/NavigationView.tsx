import React, { useState, useEffect, useRef } from 'react';
import { Language, ActiveTab } from '../../types';
import { 
  ArrowLeft, 
  Navigation, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Square, 
  Play, 
  Pause, 
  PhoneCall, 
  ShieldAlert, 
  Fuel, 
  Coffee, 
  Milestone, 
  MapPin, 
  Share2, 
  Sparkles, 
  Compass, 
  RotateCcw,
  Clock,
  Layers,
  ChevronRight,
  AlertTriangle,
  Sun,
  CloudFog,
  CloudRain,
  CheckCircle2,
  Gauge
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PAKISTAN_CITIES, TransitCity, POPULAR_ROUTES } from './MapView';

interface NavigationViewProps {
  lang: Language;
  originCityId?: string;
  destCityId?: string;
  onNavigate: (tab: ActiveTab) => void;
  onOpenTollCalc?: (fromCity?: string, toCity?: string) => void;
}

export interface NavigationStep {
  id: number;
  instructionUr: string;
  instructionEn: string;
  roadName: string;
  distanceKm: number;
  iconType: 'straight' | 'right' | 'left' | 'merge' | 'toll' | 'rest' | 'dest';
  tollAmount?: number;
  facility?: string;
}

export const NavigationView: React.FC<NavigationViewProps> = ({
  lang,
  originCityId = 'samundri',
  destCityId = 'karachi',
  onNavigate,
  onOpenTollCalc
}) => {
  const isUrdu = lang === 'ur';
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [originId, setOriginId] = useState<string>(originCityId);
  const [destId, setDestId] = useState<string>(destCityId);

  const originCity = PAKISTAN_CITIES.find(c => c.id === originId) || PAKISTAN_CITIES[0];
  const destCity = PAKISTAN_CITIES.find(c => c.id === destId) || PAKISTAN_CITIES[53]; // Karachi default

  // Navigation Simulation & Status
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [currentSpeed, setCurrentSpeed] = useState<number>(72); // km/h
  const [progressPct, setProgressPct] = useState<number>(14);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [activeTabMode, setActiveTabMode] = useState<'map' | 'turnByTurn' | 'restStops'>('map');
  const [selectedMapStyle, setSelectedMapStyle] = useState<'navDark' | 'streets' | 'satellite'>('navDark');
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [speechActive, setSpeechActive] = useState<boolean>(false);

  // Generate intermediate waypoint cities along corridor
  const corridorRoute = [originCity, destCity];

  // Calculate approximate total distance
  const latDiff = destCity.lat - originCity.lat;
  const lngDiff = destCity.lng - originCity.lng;
  const directDistanceKm = Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111 * 1.25);
  const remainingDistKm = Math.max(0, Math.round(directDistanceKm * (1 - progressPct / 100)));

  // ETA Calculation
  const remainingHours = remainingDistKm / (currentSpeed || 65);
  const totalMinutes = Math.round(remainingHours * 60);
  const etaHours = Math.floor(totalMinutes / 60);
  const etaMins = totalMinutes % 60;
  const etaString = isUrdu 
    ? `${etaHours > 0 ? `${etaHours} گھنٹے ` : ''}${etaMins} منٹ`
    : `${etaHours > 0 ? `${etaHours}h ` : ''}${etaMins}m`;

  // Dynamic Turn-by-Turn Steps for Route
  const navigationSteps: NavigationStep[] = [
    {
      id: 1,
      instructionUr: `${originCity.nameUr} سے روانہ ہوں اور قریبی موٹروے انٹرچینج پر چڑھیں`,
      instructionEn: `Depart ${originCity.nameEn} and enter Motorway Interchange`,
      roadName: `${originCity.highways[0] || 'Motorway Link'}`,
      distanceKm: 8,
      iconType: 'merge',
      facility: 'پیٹرول پمپ و ٹائر شاپ'
    },
    {
      id: 2,
      instructionUr: `موٹروے مین کیریج وے پر سیدھے چلیں (حد رفتار 100 تا 120 کلومیٹر)`,
      instructionEn: `Proceed straight on Motorway main carriageway (Speed 100-120 km/h)`,
      roadName: 'M-4 / M-3 Motorway Corridor',
      distanceKm: Math.round(directDistanceKm * 0.25),
      iconType: 'straight'
    },
    {
      id: 3,
      instructionUr: `ٹول پلازہ: ایم ٹیگ لین (M-Tag Lane) استعمال کریں`,
      instructionEn: `Toll Plaza: Use dedicated M-Tag Fast Lane`,
      roadName: 'Main Toll Plaza',
      distanceKm: Math.round(directDistanceKm * 0.35),
      iconType: 'toll',
      tollAmount: 650
    },
    {
      id: 4,
      instructionUr: `موٹروے سروس ایریا: مسجد، ریسٹورنٹ اور واش روم سہولیات دستیاب ہیں`,
      instructionEn: `Service Area Rest Stop: Mosque, Food & Fuel available`,
      roadName: 'NHA Service Area',
      distanceKm: Math.round(directDistanceKm * 0.55),
      iconType: 'rest',
      facility: 'مسجد، ہوٹل، پیٹرول، واش روم'
    },
    {
      id: 5,
      instructionUr: `موٹروے جنکشن پر دائیں طرف ایگزٹ لیں`,
      instructionEn: `Take right exit at major Motorway junction`,
      roadName: 'Corridor Interchange',
      distanceKm: Math.round(directDistanceKm * 0.75),
      iconType: 'right'
    },
    {
      id: 6,
      instructionUr: `${destCity.nameUr} انٹرچینج پر ایگزٹ لیں اور شہر کی طرف داخل ہوں`,
      instructionEn: `Exit at ${destCity.nameEn} Interchange and enter city limits`,
      roadName: `${destCity.highways[0] || 'City Express Bypass'}`,
      distanceKm: Math.round(directDistanceKm * 0.95),
      iconType: 'dest'
    },
    {
      id: 7,
      instructionUr: `مبارک ہو! آپ اپنی منزل (${destCity.nameUr}) بخیریت پہنچ گئے ہیں۔`,
      instructionEn: `Arrived safely at destination: ${destCity.nameEn}!`,
      roadName: `${destCity.nameEn} City Center`,
      distanceKm: directDistanceKm,
      iconType: 'dest'
    }
  ];

  const currentStep = navigationSteps[stepIndex] || navigationSteps[0];

  // Text-to-Speech announcement helper
  const speakInstruction = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isUrdu ? 'ur-PK' : 'en-US';
      utterance.rate = 0.95;
      utterance.onstart = () => setSpeechActive(true);
      utterance.onend = () => setSpeechActive(false);
      utterance.onerror = () => setSpeechActive(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech failed silently
    }
  };

  // Trigger speech when step changes
  useEffect(() => {
    if (voiceEnabled) {
      speakInstruction(isUrdu ? currentStep.instructionUr : currentStep.instructionEn);
    }
  }, [stepIndex, voiceEnabled, isUrdu]);

  // Leaflet Map Initialization
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
      center: [originCity.lat, originCity.lng],
      zoom: 10,
      minZoom: 5,
      maxZoom: 18,
      zoomControl: false
    });

    // Dark Navigation Tile layer for high-contrast driver view
    let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; CARTO &copy; OpenStreetMap';
    if (selectedMapStyle === 'streets') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    } else if (selectedMapStyle === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri';
    }

    L.tileLayer(tileUrl, { attribution, maxZoom: 18 }).addTo(map);

    // Route Polyline
    const latlngs: [number, number][] = [
      [originCity.lat, originCity.lng],
      [(originCity.lat * 2 + destCity.lat) / 3, (originCity.lng * 2 + destCity.lng) / 3],
      [(originCity.lat + destCity.lat * 2) / 3, (originCity.lng + destCity.lng * 2) / 3],
      [destCity.lat, destCity.lng]
    ];

    const polyline = L.polyline(latlngs, {
      color: '#34d399',
      weight: 6,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: '1, 10',
      dashSpeed: 20
    } as any).addTo(map);
    routePolylineRef.current = polyline;

    // Origin Marker (Green Pulse)
    const originIcon = L.divIcon({
      className: 'origin-marker',
      html: `
        <div style="background-color: #10b981; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
          🟢
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    L.marker([originCity.lat, originCity.lng], { icon: originIcon }).addTo(map);

    // Destination Marker (Red Checkered)
    const destIcon = L.divIcon({
      className: 'dest-marker',
      html: `
        <div style="background-color: #ef4444; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">
          🏁
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    L.marker([destCity.lat, destCity.lng], { icon: destIcon }).addTo(map);

    // Moving Vehicle Marker (Truck GPS Icon)
    const vehicleIcon = L.divIcon({
      className: 'vehicle-marker',
      html: `
        <div style="background: linear-gradient(135deg, #1e3a68, #10b981); width: 44px; height: 44px; border-radius: 50%; border: 3px solid #facc15; box-shadow: 0 0 20px rgba(250, 204, 21, 0.8); display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; animation: pulse 2s infinite;">
          🚚
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const initialPos: [number, number] = [
      originCity.lat + (destCity.lat - originCity.lat) * (progressPct / 100),
      originCity.lng + (destCity.lng - originCity.lng) * (progressPct / 100)
    ];

    const vMarker = L.marker(initialPos, { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(map);
    vehicleMarkerRef.current = vMarker;

    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    leafletMapRef.current = map;

    return () => {
      try {
        map.remove();
      } catch {
        // ignore
      }
      leafletMapRef.current = null;
    };
  }, [originId, destId, selectedMapStyle]);

  // Live GPS / Navigation Simulation Loop
  useEffect(() => {
    if (!isPlaying) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      return;
    }

    simIntervalRef.current = setInterval(() => {
      setProgressPct((prev) => {
        const next = prev >= 99 ? 0 : prev + 1;
        
        // Update Step Index based on progress
        const targetStep = Math.min(
          navigationSteps.length - 1,
          Math.floor((next / 100) * navigationSteps.length)
        );
        if (targetStep !== stepIndex) {
          setStepIndex(targetStep);
        }

        // Slight speed oscillation for realistic truck feel
        setCurrentSpeed(68 + Math.floor(Math.sin(next * 0.2) * 8));

        // Update Vehicle Marker on Map
        if (vehicleMarkerRef.current && leafletMapRef.current) {
          const newLat = originCity.lat + (destCity.lat - originCity.lat) * (next / 100);
          const newLng = originCity.lng + (destCity.lng - originCity.lng) * (next / 100);
          vehicleMarkerRef.current.setLatLng([newLat, newLng]);
        }

        return next;
      });
    }, 2500);

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [isPlaying, originCity, destCity, stepIndex, navigationSteps.length]);

  // External Google Maps GPS Launch
  const handleOpenGoogleMapsNav = () => {
    const originStr = `${originCity.lat},${originCity.lng}`;
    const destStr = `${destCity.lat},${destCity.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // WhatsApp Share Live Tracking
  const handleShareWhatsApp = () => {
    const shareText = `🚚 *Driver Dost - لائیو ٹرک روٹ نیویگیشن*\n📍 *روٹ*: ${originCity.nameUr} (${originCity.nameEn}) ➔ ${destCity.nameUr} (${destCity.nameEn})\n⚡ *رفتار*: ${currentSpeed} km/h\n⏱️ *باقی وقت (ETA)*: ${etaString}\n📏 *باقی فاصلہ*: ${remainingDistKm} km\n🛣️ *اگلا موڑ*: ${isUrdu ? currentStep.instructionUr : currentStep.instructionEn}\n🔗 *گوگل میپس پر دیکھیں*: https://www.google.com/maps/dir/?api=1&origin=${originCity.lat},${originCity.lng}&destination=${destCity.lat},${destCity.lng}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#0f172a] text-white flex flex-col justify-between select-none overflow-hidden font-sans"
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* 1. TOP NATIVE HUD HEADER - HIGH VISIBILITY FOR DRIVERS */}
      <div className="shrink-0 bg-[#1e293b]/95 backdrop-blur-md px-3 sm:px-5 py-2.5 border-b border-slate-700/80 shadow-md flex items-center justify-between gap-2 z-20">
        
        {/* Back / Exit Button */}
        <button
          type="button"
          onClick={() => onNavigate('map')}
          className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          title={isUrdu ? 'میپ پر واپس جائیں' : 'Back to Map'}
        >
          <ArrowLeft className={`w-5 h-5 ${isUrdu ? 'rotate-180' : ''}`} />
          <span className="hidden sm:inline text-xs font-bold font-serif">
            {isUrdu ? 'میپ' : 'Map'}
          </span>
        </button>

        {/* Corridor Badge & Live Indicator */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 animate-pulse">
            <Navigation className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                {isUrdu ? 'لائیو GPS رہنمائی' : 'Live GPS Guidance'}
              </span>
            </div>
            <h1 className="font-serif font-black text-sm sm:text-base text-white truncate">
              {isUrdu ? `${originCity.nameUr} ➔ ${destCity.nameUr}` : `${originCity.nameEn} to ${destCity.nameEn}`}
            </h1>
          </div>
        </div>

        {/* Quick Voice & Google Maps Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer active:scale-95 ${
              voiceEnabled 
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={voiceEnabled ? (isUrdu ? 'آواز بند کریں' : 'Mute Voice') : (isUrdu ? 'آواز آن کریں' : 'Enable Voice')}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleOpenGoogleMapsNav}
            className="px-3 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            title={isUrdu ? 'گوگل میپس ایپ میں کھولیں' : 'Open in Google Maps'}
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">{isUrdu ? 'گوگل میپس' : 'Google Maps'}</span>
          </button>
        </div>
      </div>

      {/* 2. PROMINENT DRIVER TURN-BY-TURN HUD BANNER (Large & High-Contrast for illiterate/tired drivers) */}
      <div className="shrink-0 bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#0f766e] px-3 sm:px-6 py-3 border-b-2 border-amber-400/80 shadow-lg z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0">
            {/* Big Direction Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white text-[#0369a1] flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0 shadow-md">
              {currentStep.iconType === 'toll' ? '💳' :
               currentStep.iconType === 'rest' ? '☕' :
               currentStep.iconType === 'right' ? '↱' :
               currentStep.iconType === 'left' ? '↰' :
               currentStep.iconType === 'dest' ? '🏁' : '⬆️'}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-900 font-mono font-black text-xs">
                  {isUrdu ? 'اگلا موڑ' : 'Next Move'}
                </span>
                <span className="text-xs text-amber-200 font-mono font-bold">
                  {currentStep.roadName}
                </span>
              </div>
              <h2 className="font-serif font-black text-sm sm:text-lg text-white leading-tight mt-0.5 line-clamp-2">
                {isUrdu ? currentStep.instructionUr : currentStep.instructionEn}
              </h2>
            </div>
          </div>

          {/* Voice Prompt Play Button */}
          <button
            type="button"
            onClick={() => speakInstruction(isUrdu ? currentStep.instructionUr : currentStep.instructionEn)}
            className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-amber-300 border border-white/30 cursor-pointer active:scale-95 transition-all shrink-0 flex items-center justify-center"
            title={isUrdu ? 'دوبارہ بولیں' : 'Repeat voice'}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. MAIN INTERACTIVE CONTENT AREA (MAP / TURN LIST / REST STOPS) */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        
        {/* Floating Mode Selector Pill (Map / Turn List / Rest Stops) */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTabMode('map')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTabMode === 'map' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            🗺️ {isUrdu ? 'لائیو میپ' : 'Live Map'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTabMode('turnByTurn')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTabMode === 'turnByTurn' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            🛣️ {isUrdu ? 'موڑ تفصیل' : 'Turn List'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTabMode('restStops')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTabMode === 'restStops' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            ⛽ {isUrdu ? 'سروس ایریاز' : 'Rest Stops'}
          </button>
        </div>

        {/* View 1: Live Interactive Map */}
        <div className={`w-full h-full relative ${activeTabMode === 'map' ? 'block' : 'hidden'}`}>
          
          {/* Map Layer Switcher (Top Right) */}
          <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedMapStyle(selectedMapStyle === 'navDark' ? 'satellite' : selectedMapStyle === 'satellite' ? 'streets' : 'navDark')}
              className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs font-bold shadow-md cursor-pointer hover:bg-slate-800"
              title={isUrdu ? 'میپ اسٹائل بدلیں' : 'Switch Map Style'}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

          {/* Floating Speedometer & ETA Overlay on Map */}
          <div className="absolute bottom-4 left-3 right-3 z-[400] max-w-lg mx-auto">
            <div className="bg-slate-900/95 backdrop-blur-md p-3.5 rounded-3xl border border-slate-700 shadow-2xl space-y-2">
              
              <div className="grid grid-cols-3 gap-2 text-center">
                {/* Speed */}
                <div className="bg-slate-800/80 p-2 rounded-2xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    {isUrdu ? 'گاڑی کی رفتار' : 'Speed'}
                  </span>
                  <div className="font-mono font-black text-xl sm:text-2xl text-amber-300">
                    {currentSpeed} <span className="text-xs font-normal text-slate-300">km/h</span>
                  </div>
                </div>

                {/* Remaining Distance */}
                <div className="bg-slate-800/80 p-2 rounded-2xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    {isUrdu ? 'باقی فاصلہ' : 'Remaining'}
                  </span>
                  <div className="font-mono font-black text-xl sm:text-2xl text-emerald-400">
                    {remainingDistKm} <span className="text-xs font-normal text-slate-300">km</span>
                  </div>
                </div>

                {/* ETA */}
                <div className="bg-slate-800/80 p-2 rounded-2xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    {isUrdu ? 'پہنچنے کا وقت' : 'ETA'}
                  </span>
                  <div className="font-serif font-black text-base sm:text-lg text-white truncate mt-0.5">
                    {etaString}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Leaflet Canvas */}
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* View 2: Turn-by-Turn Step List */}
        {activeTabMode === 'turnByTurn' && (
          <div className="flex-1 overflow-y-auto p-4 max-w-xl mx-auto w-full space-y-2 pt-14 pb-20">
            <h3 className="font-serif font-bold text-sm text-slate-300 flex items-center gap-1.5 mb-2">
              <Milestone className="w-4 h-4 text-emerald-400" />
              <span>{isUrdu ? 'روٹ کے تمام موڑ و انٹرچینجز:' : 'Corridor Turns & Interchanges:'}</span>
            </h3>

            {navigationSteps.map((step, idx) => {
              const isCurrent = idx === stepIndex;
              const isPassed = idx < stepIndex;
              return (
                <div 
                  key={step.id}
                  onClick={() => setStepIndex(idx)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isCurrent 
                      ? 'bg-emerald-950/80 border-emerald-400 shadow-md scale-[1.02]' 
                      : isPassed 
                        ? 'bg-slate-800/40 border-slate-700/50 opacity-60' 
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isCurrent ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {isUrdu ? step.instructionUr : step.instructionEn}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {step.roadName} {step.facility && `• ℹ️ ${step.facility}`}
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-amber-300 shrink-0">
                    {step.distanceKm} km
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* View 3: Highway Rest Stops & Emergency Facilities */}
        {activeTabMode === 'restStops' && (
          <div className="flex-1 overflow-y-auto p-4 max-w-xl mx-auto w-full space-y-3 pt-14 pb-20">
            {/* Helpline Emergency Box */}
            <div className="bg-rose-950/80 border-2 border-rose-500 p-3.5 rounded-2xl shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span className="font-serif font-black text-sm text-white">
                    {isUrdu ? 'ایمرجنسی و موٹروے پولیس ہیلپ لائن' : 'Emergency & Highway Police'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href="tel:130"
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isUrdu ? 'موٹروے پولیس: 130' : 'Police: 130'}</span>
                </a>
                <a
                  href="tel:1122"
                  className="py-2.5 px-3 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isUrdu ? 'ریسکیو: 1122' : 'Rescue: 1122'}</span>
                </a>
              </div>
            </div>

            {/* Rest Stops List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                {isUrdu ? 'موٹروے سروس ایریاز و پٹرول پمپس:' : 'Service Areas & Fuel Stops:'}
              </span>

              <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Fuel className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-white block">
                      {isUrdu ? 'پیٹرول پمپ و ڈیزل اسٹیشن' : 'PSO & Shell Fuel Stations'}
                    </strong>
                    <span className="text-[10px] text-slate-400">
                      {isUrdu ? 'ہر 50 کلومیٹر بعد سروس ایریا میں دستیاب' : 'Available every 50km'}
                    </span>
                  </div>
                </div>
                <span className="text-emerald-400 text-xs font-bold">24/7 کھلی ہے</span>
              </div>

              <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-white block">
                      {isUrdu ? 'ریسٹورنٹ، مسجد و واش روم' : 'Mosque, Food & Washrooms'}
                    </strong>
                    <span className="text-[10px] text-slate-400">
                      {isUrdu ? 'فیملی و ڈرائیور ریسٹ ایریا' : 'Family & Driver Rest Area'}
                    </span>
                  </div>
                </div>
                <span className="text-emerald-400 text-xs font-bold">صاف ستھرا</span>
              </div>

              <div 
                onClick={() => {
                  if (onOpenTollCalc) onOpenTollCalc(originCity.nameEn, destCity.nameEn);
                  onNavigate('toll');
                }}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Milestone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-white block">
                      {isUrdu ? 'موٹروے ٹول پلازہ ریٹس چیک کریں' : 'Check Motorway Toll Rates'}
                    </strong>
                    <span className="text-[10px] text-slate-400">
                      {isUrdu ? '2026 این ایچ اے ریٹس دیکھیں' : 'View 2026 NHA Toll'}
                    </span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-400 ${isUrdu ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4. BOTTOM NATIVE ACTION DOCK */}
      <div className="shrink-0 bg-[#1e293b]/95 backdrop-blur-md px-3 sm:px-5 py-3 border-t border-slate-700 shadow-2xl z-20">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          
          {/* Pause / Play Simulation */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white transition-all cursor-pointer active:scale-95 shadow-xs"
            title={isPlaying ? (isUrdu ? 'پاز کریں' : 'Pause') : (isUrdu ? 'جاری رکھیں' : 'Resume')}
          >
            {isPlaying ? <Pause className="w-5 h-5 text-amber-300" /> : <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" />}
          </button>

          {/* WhatsApp Share Live Location */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 py-3 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedShare ? (isUrdu ? 'شیئر ہو گیا!' : 'Shared!') : (isUrdu ? 'واٹس ایپ لوکیشن' : 'Share Location')}</span>
          </button>

          {/* Emergency 130 Police Call */}
          <a
            href="tel:130"
            className="py-3 px-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-1"
            title={isUrdu ? 'موٹروے پولیس ہیلپ لائن' : 'Call Police 130'}
          >
            <PhoneCall className="w-4 h-4" />
            <span>{isUrdu ? '130 پولیس' : '130 Help'}</span>
          </a>

          {/* Stop / Exit Navigation */}
          <button
            type="button"
            onClick={() => onNavigate('map')}
            className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-rose-800 border border-slate-600 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            <Square className="w-4 h-4 inline mr-1 text-rose-400" />
            <span>{isUrdu ? 'ختم' : 'Exit'}</span>
          </button>

        </div>
      </div>

    </div>
  );
};
