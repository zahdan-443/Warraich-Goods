import React, { useState, useEffect, useRef } from 'react';
import { Language, ActiveTab } from '../../types';
import { 
  ArrowLeft, 
  Navigation, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  PhoneCall, 
  ShieldAlert, 
  Fuel, 
  Coffee, 
  Milestone, 
  MapPin, 
  Share2, 
  Compass, 
  RotateCcw,
  Clock,
  Layers,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Crosshair,
  Radio,
  Navigation2
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PAKISTAN_CITIES } from './MapView';

interface NavigationViewProps {
  lang: Language;
  originCityId?: string;
  destCityId?: string;
  onNavigate: (tab: ActiveTab) => void;
  onOpenTollCalc?: (fromCity?: string, toCity?: string) => void;
}

// Calculate Haversine distance between two coordinates in kilometers
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
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
  const userGpsMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const gpsWatchIdRef = useRef<number | null>(null);

  const [originId, setOriginId] = useState<string>(originCityId);
  const [destId, setDestId] = useState<string>(destCityId);

  const originCity = PAKISTAN_CITIES.find(c => c.id === originId) || PAKISTAN_CITIES[0];
  const destCity = PAKISTAN_CITIES.find(c => c.id === destId) || PAKISTAN_CITIES[53]; // Karachi default

  // Real GPS States (No Fake Simulation)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [realGpsSpeed, setRealGpsSpeed] = useState<number>(0); // Real speed in km/h
  const [gpsHeading, setGpsHeading] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'seeking' | 'active' | 'denied' | 'unsupported'>('seeking');
  const [selectedMapStyle, setSelectedMapStyle] = useState<'streets' | 'satellite' | 'dark'>('streets');
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [activeTabMode, setActiveTabMode] = useState<'realGps' | 'roadSteps' | 'services'>('realGps');
  const [realRouteDistanceKm, setRealRouteDistanceKm] = useState<number>(() => {
    return Math.round(calculateHaversineDistance(originCity.lat, originCity.lng, destCity.lat, destCity.lng) * 1.25);
  });
  const [loadingRealRoute, setLoadingRealRoute] = useState<boolean>(false);

  // Calculate real remaining distance from actual user location to destination
  const remainingRealKm = userLocation 
    ? calculateHaversineDistance(userLocation.lat, userLocation.lng, destCity.lat, destCity.lng)
    : realRouteDistanceKm;

  // Real ETA based on current speed or average highway truck speed (65 km/h)
  const effectiveSpeed = realGpsSpeed > 10 ? realGpsSpeed : 65;
  const etaTotalMinutes = Math.round((remainingRealKm / effectiveSpeed) * 60);
  const etaHours = Math.floor(etaTotalMinutes / 60);
  const etaMins = etaTotalMinutes % 60;
  const etaDisplay = isUrdu 
    ? `${etaHours > 0 ? `${etaHours} گھنٹے ` : ''}${etaMins} منٹ`
    : `${etaHours > 0 ? `${etaHours}h ` : ''}${etaMins}m`;

  // Start Real Device GPS Tracking via navigator.geolocation
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('unsupported');
      return;
    }

    setGpsStatus('seeking');

    const onSuccess = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;
      const speedKmH = pos.coords.speed && pos.coords.speed > 0 ? Math.round(pos.coords.speed * 3.6) : 0;
      const heading = pos.coords.heading || null;

      setUserLocation({ lat, lng });
      setGpsAccuracy(accuracy);
      setRealGpsSpeed(speedKmH);
      setGpsHeading(heading);
      setGpsStatus('active');

      // Update Map Marker with Real User Location
      if (leafletMapRef.current) {
        if (!userGpsMarkerRef.current) {
          const liveIcon = L.divIcon({
            className: 'real-gps-marker',
            html: `
              <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
                <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(37, 99, 235, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="width: 22px; height: 22px; border-radius: 50%; background: #2563eb; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">
                  📍
                </div>
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          });
          userGpsMarkerRef.current = L.marker([lat, lng], { icon: liveIcon, zIndexOffset: 2000 }).addTo(leafletMapRef.current);
        } else {
          userGpsMarkerRef.current.setLatLng([lat, lng]);
        }
      }
    };

    const onError = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setGpsStatus('denied');
      } else {
        setGpsStatus('seeking');
      }
    };

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 3000
    });
    gpsWatchIdRef.current = watchId;

    return () => {
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      }
    };
  }, []);

  // Fetch REAL road routing geometry from Open Source Routing Machine (OSRM)
  useEffect(() => {
    let isCancelled = false;

    const fetchRealRoute = async () => {
      setLoadingRealRoute(true);
      const startCoord = userLocation 
        ? `${userLocation.lng},${userLocation.lat}` 
        : `${originCity.lng},${originCity.lat}`;
      const destCoord = `${destCity.lng},${destCity.lat}`;

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoord};${destCoord}?overview=full&geometries=geojson`;

      try {
        const res = await fetch(osrmUrl);
        if (!res.ok) throw new Error('OSRM network response error');
        const data = await res.json();

        if (!isCancelled && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distKm = Math.round(route.distance / 1000);
          setRealRouteDistanceKm(distKm);

          // Render Real GeoJSON Polyline
          if (route.geometry && route.geometry.coordinates && leafletMapRef.current) {
            const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);

            if (routePolylineRef.current) {
              leafletMapRef.current.removeLayer(routePolylineRef.current);
            }

            const polyline = L.polyline(coords, {
              color: '#2563eb',
              weight: 6,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(leafletMapRef.current);
            routePolylineRef.current = polyline;

            leafletMapRef.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });
          }
        }
      } catch {
        // Fallback: Straight direct polyline if offline
        if (!isCancelled && leafletMapRef.current) {
          const fallbackLatlngs: [number, number][] = [
            [originCity.lat, originCity.lng],
            [destCity.lat, destCity.lng]
          ];
          if (routePolylineRef.current) {
            leafletMapRef.current.removeLayer(routePolylineRef.current);
          }
          const polyline = L.polyline(fallbackLatlngs, {
            color: '#2563eb',
            weight: 5,
            dashArray: '5, 10'
          }).addTo(leafletMapRef.current);
          routePolylineRef.current = polyline;
        }
      } finally {
        if (!isCancelled) setLoadingRealRoute(false);
      }
    };

    fetchRealRoute();

    return () => {
      isCancelled = true;
    };
  }, [originId, destId, userLocation]);

  // Leaflet Map Container Setup
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
      zoom: 7,
      minZoom: 5,
      maxZoom: 18,
      zoomControl: false
    });

    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; OpenStreetMap contributors';

    if (selectedMapStyle === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri';
    } else if (selectedMapStyle === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; CARTO &copy; OpenStreetMap';
    }

    L.tileLayer(tileUrl, { attribution, maxZoom: 18 }).addTo(map);

    // Origin Marker (Green)
    const originIcon = L.divIcon({
      className: 'origin-marker',
      html: `
        <div style="background-color: #10b981; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
          🟢
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    L.marker([originCity.lat, originCity.lng], { icon: originIcon })
      .bindPopup(`<b>${originCity.nameUr} (${originCity.nameEn})</b><br>${isUrdu ? 'روانگی پوائنٹ' : 'Origin'}`)
      .addTo(map);

    // Destination Marker (Red Flag)
    const destIcon = L.divIcon({
      className: 'dest-marker',
      html: `
        <div style="background-color: #ef4444; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
          🏁
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    L.marker([destCity.lat, destCity.lng], { icon: destIcon })
      .bindPopup(`<b>${destCity.nameUr} (${destCity.nameEn})</b><br>${isUrdu ? 'منزل پوائنٹ' : 'Destination'}`)
      .addTo(map);

    leafletMapRef.current = map;

    return () => {
      try {
        map.remove();
      } catch {
        // ignore
      }
      leafletMapRef.current = null;
    };
  }, [selectedMapStyle]);

  // Center map on user's real GPS position
  const handleRecenterGps = () => {
    if (!leafletMapRef.current) return;
    if (userLocation) {
      leafletMapRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { animate: true });
    } else {
      leafletMapRef.current.flyTo([originCity.lat, originCity.lng], 9, { animate: true });
    }
  };

  // 1-Click Launch into Real Google Maps Live Driving Turn-by-Turn GPS
  const handleLaunchGoogleMapsLive = () => {
    const originParam = userLocation ? `${userLocation.lat},${userLocation.lng}` : `${originCity.lat},${originCity.lng}`;
    const destParam = `${destCity.lat},${destCity.lng}`;
    // Official Google Maps Directions & Live Navigation Intent URL
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}&travelmode=driving&dir_action=navigate`;
    window.open(url, '_blank');
  };

  // Launch Waze Navigation
  const handleLaunchWazeLive = () => {
    const url = `https://waze.com/ul?ll=${destCity.lat},${destCity.lng}&navigate=yes`;
    window.open(url, '_blank');
  };

  // WhatsApp Share Real GPS Location & Corridor Info
  const handleShareWhatsApp = () => {
    const locUrl = userLocation 
      ? `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`
      : `https://maps.google.com/?q=${originCity.lat},${originCity.lng}`;
    
    const text = `🚚 *Driver Dost - حقیقی GPS لوکیشن و روٹ رپورٹ*\n📍 *روٹ*: ${originCity.nameUr} ➔ ${destCity.nameUr}\n📏 *کل فاصلہ*: ${realRouteDistanceKm} کلومیٹر\n⚡ *موجودہ رفتار*: ${realGpsSpeed} km/h\n⏱️ *تخمینی وقت (ETA)*: ${etaDisplay}\n🛰️ *لائیو لوکیشن لنک*: ${locUrl}\n🔗 *گوگل میپس نیویگیشن*: https://www.google.com/maps/dir/?api=1&destination=${destCity.lat},${destCity.lng}&travelmode=driving`;
    
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#0f172a] text-white flex flex-col justify-between select-none overflow-hidden font-sans"
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* 1. TOP NATIVE HEADER */}
      <div className="shrink-0 bg-[#1e293b]/95 backdrop-blur-md px-3 sm:px-5 py-2.5 border-b border-slate-700/80 shadow-md flex items-center justify-between gap-2 z-20">
        
        {/* Back to Map Button */}
        <button
          type="button"
          onClick={() => onNavigate('map')}
          className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          title={isUrdu ? 'میپ پر واپس جائیں' : 'Back to Map'}
        >
          <ArrowLeft className={`w-5 h-5 ${isUrdu ? 'rotate-180' : ''}`} />
          <span className="hidden sm:inline text-xs font-bold font-serif">
            {isUrdu ? 'واپس میپ' : 'Back to Map'}
          </span>
        </button>

        {/* Route Title & GPS Live Status */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
            <Radio className={`w-5 h-5 ${gpsStatus === 'active' ? 'animate-pulse text-emerald-400' : ''}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`inline-block w-2 h-2 rounded-full ${gpsStatus === 'active' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                {gpsStatus === 'active' 
                  ? (isUrdu ? `حقیقی GPS آن ہے (درستگی ±${gpsAccuracy || 10}m)` : `Real GPS Active (±${gpsAccuracy || 10}m)`)
                  : (isUrdu ? 'GPS سگنل تلاش جاری ہے...' : 'Seeking Device GPS...')}
              </span>
            </div>
            <h1 className="font-serif font-black text-sm sm:text-base text-white truncate">
              {isUrdu ? `${originCity.nameUr} ➔ ${destCity.nameUr}` : `${originCity.nameEn} to ${destCity.nameEn}`}
            </h1>
          </div>
        </div>

        {/* Primary Action: Direct Google Maps Live GPS Turn-by-Turn */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleLaunchGoogleMapsLive}
            className="px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
            title={isUrdu ? 'اصلی گوگل میپس میں وائس نیویگیشن کھولیں' : 'Launch Google Maps Live Driving'}
          >
            <Navigation2 className="w-4 h-4 fill-white" />
            <span className="font-serif font-bold">{isUrdu ? 'گوگل میپس وائس' : 'Google Maps GPS'}</span>
          </button>
        </div>
      </div>

      {/* 2. REAL GPS HUD DASHBOARD (High Visibility for Drivers) */}
      <div className="shrink-0 bg-gradient-to-r from-[#1e3a68] via-[#162a4d] to-[#0f172a] px-3 sm:px-6 py-3 border-b-2 border-amber-400/70 shadow-lg z-20">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Real Speed & Distance Stats */}
          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto text-center flex-1">
            
            {/* Real Speed from GPS Hardware */}
            <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">
                {isUrdu ? 'حقیقی رفتار (GPS)' : 'Real Speed'}
              </span>
              <div className="font-mono font-black text-xl sm:text-2xl text-amber-300">
                {realGpsSpeed} <span className="text-xs font-normal text-slate-300">km/h</span>
              </div>
            </div>

            {/* Real Distance to Destination */}
            <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">
                {isUrdu ? 'باقی فاصلہ' : 'Remaining Distance'}
              </span>
              <div className="font-mono font-black text-xl sm:text-2xl text-emerald-400">
                {remainingRealKm} <span className="text-xs font-normal text-slate-300">km</span>
              </div>
            </div>

            {/* Estimated Arrival Time */}
            <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">
                {isUrdu ? 'پہنچنے کا وقت (ETA)' : 'Estimated Time'}
              </span>
              <div className="font-serif font-black text-base sm:text-lg text-white truncate mt-0.5">
                {etaDisplay}
              </div>
            </div>

          </div>

          {/* Quick Real Navigation Trigger */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={handleLaunchGoogleMapsLive}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-serif font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{isUrdu ? 'اصلی وائس نیویگیشن شروع کریں' : 'Start Real Voice GPS'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. MAIN CONTENT: REAL MAP & ROAD DIRECTORY */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        
        {/* Floating Pill: View Modes */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTabMode('realGps')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTabMode === 'realGps' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            🗺️ {isUrdu ? 'حقیقی میپ و GPS' : 'Real GPS Map'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTabMode('roadSteps')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTabMode === 'roadSteps' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            🛣️ {isUrdu ? 'موٹروے انٹرچینجز' : 'Interchanges'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTabMode('services')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTabMode === 'services' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            ⛽ {isUrdu ? 'سروس ایریاز و ہیلپ' : 'Services & Help'}
          </button>
        </div>

        {/* View 1: Real Map Canvas */}
        <div className={`w-full h-full relative ${activeTabMode === 'realGps' ? 'block' : 'hidden'}`}>
          
          {/* Map Controls (Recenter & Style) */}
          <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
            <button
              type="button"
              onClick={handleRecenterGps}
              className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-blue-400 shadow-lg cursor-pointer hover:bg-slate-800 active:scale-95"
              title={isUrdu ? 'میری لوکیشن پر فوکس کریں' : 'Center on My GPS'}
            >
              <Crosshair className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setSelectedMapStyle(selectedMapStyle === 'streets' ? 'satellite' : selectedMapStyle === 'satellite' ? 'dark' : 'streets')}
              className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-emerald-400 shadow-lg cursor-pointer hover:bg-slate-800 active:scale-95"
              title={isUrdu ? 'میپ اسٹائل بدلیں' : 'Switch Map Layer'}
            >
              <Layers className="w-5 h-5" />
            </button>
          </div>

          {/* Real GPS Info Overlay at Bottom */}
          <div className="absolute bottom-4 left-3 right-3 z-[400] max-w-lg mx-auto">
            <div className="bg-slate-900/95 backdrop-blur-md p-3.5 rounded-3xl border border-slate-700 shadow-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-serif font-bold">
                  {isUrdu ? 'روٹ راستہ: سڑکوں کے حقیقی نیٹ ورک پر مبنی' : 'Routing: Real Highway Network'}
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {loadingRealRoute ? (isUrdu ? 'روٹ لوڈ ہو رہا ہے...' : 'Loading Route...') : `${realRouteDistanceKm} KM`}
                </span>
              </div>
              
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleLaunchGoogleMapsLive}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Navigation2 className="w-4 h-4 fill-white" />
                  <span>{isUrdu ? 'گوگل میپس لائیو نیویگیشن' : 'Google Maps GPS'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchWazeLive}
                  className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <span>Waze</span>
                </button>
              </div>
            </div>
          </div>

          {/* Leaflet Map DOM Element */}
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* View 2: Real Interchanges & Toll Information */}
        {activeTabMode === 'roadSteps' && (
          <div className="flex-1 overflow-y-auto p-4 max-w-xl mx-auto w-full space-y-3 pt-14 pb-20">
            <div className="bg-slate-800/90 p-4 rounded-3xl border border-slate-700 space-y-3">
              <h3 className="font-serif font-bold text-sm text-amber-300 flex items-center gap-2">
                <Milestone className="w-4 h-4" />
                <span>{isUrdu ? 'روٹ پر اہم موٹروے انٹرچینجز و ہائی ویز:' : 'Highway Corridors & Interchanges:'}</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold font-mono">01</span>
                    <div>
                      <strong className="text-white block">{originCity.nameUr} ({originCity.nameEn})</strong>
                      <span className="text-slate-400 text-[11px]">{originCity.highways.join(' • ')}</span>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold">0 KM</span>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 font-bold font-mono">02</span>
                    <div>
                      <strong className="text-white block">{isUrdu ? 'موٹروے مین ٹول پلازہ (M-Tag)' : 'Main Motorway Toll Plaza'}</strong>
                      <span className="text-slate-400 text-[11px]">{isUrdu ? 'ایم ٹیگ لین استعمال کریں' : 'Use Dedicated M-Tag Fast Lane'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenTollCalc) onOpenTollCalc(originCity.nameEn, destCity.nameEn);
                      onNavigate('toll');
                    }}
                    className="text-xs text-amber-400 underline font-serif cursor-pointer hover:text-amber-300"
                  >
                    {isUrdu ? 'ٹول ریٹ دیکھیں' : 'View Toll'}
                  </button>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 font-bold font-mono">03</span>
                    <div>
                      <strong className="text-white block">{destCity.nameUr} ({destCity.nameEn})</strong>
                      <span className="text-slate-400 text-[11px]">{destCity.highways.join(' • ')}</span>
                    </div>
                  </div>
                  <span className="text-amber-400 font-mono font-bold">{realRouteDistanceKm} KM</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 3: Emergency & Rest Services */}
        {activeTabMode === 'services' && (
          <div className="flex-1 overflow-y-auto p-4 max-w-xl mx-auto w-full space-y-3 pt-14 pb-20">
            {/* Helpline Emergency Box */}
            <div className="bg-rose-950/80 border-2 border-rose-500 p-4 rounded-3xl shadow-md space-y-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span className="font-serif font-black text-sm text-white">
                  {isUrdu ? 'موٹروے پولیس و ایمرجنسی ہیلپ لائن' : 'Highway Police & Emergency Helpline'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href="tel:130"
                  className="py-3 px-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isUrdu ? 'موٹروے پولیس: 130' : 'NHMP: 130'}</span>
                </a>
                <a
                  href="tel:1122"
                  className="py-3 px-3 rounded-2xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isUrdu ? 'ریسکیو: 1122' : 'Rescue: 1122'}</span>
                </a>
              </div>
            </div>

            {/* Fuel & Rest Stops */}
            <div className="bg-slate-800/90 p-4 rounded-3xl border border-slate-700 space-y-2.5">
              <span className="text-xs font-bold text-slate-300 block">
                {isUrdu ? 'سہولیات و سروس ایریاز:' : 'Service Areas & Facilities:'}
              </span>

              <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Fuel className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-white block">
                      {isUrdu ? 'پیٹرول پمپس و ڈیزل اسٹیشنز' : 'PSO & Shell Fuel Stations'}
                    </strong>
                    <span className="text-[10px] text-slate-400">
                      {isUrdu ? 'موٹروے پر ہر 50 کلومیٹر بعد 24 گھنٹے دستیاب' : 'Available every 50km on Motorways'}
                    </span>
                  </div>
                </div>
                <span className="text-emerald-400 text-xs font-bold">24/7</span>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-white block">
                      {isUrdu ? 'مسجد، ہوٹل و ریسٹورنٹ' : 'Mosque, Food & Rest Area'}
                    </strong>
                    <span className="text-[10px] text-slate-400">
                      {isUrdu ? 'صاف ستھری فیملی و ڈرائیور سہولیات' : 'Clean driver and family facilities'}
                    </span>
                  </div>
                </div>
                <span className="text-emerald-400 text-xs font-bold">صاف</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4. BOTTOM ACTION DOCK */}
      <div className="shrink-0 bg-[#1e293b]/95 backdrop-blur-md px-3 sm:px-5 py-3 border-t border-slate-700 shadow-2xl z-20">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          
          {/* Center GPS */}
          <button
            type="button"
            onClick={handleRecenterGps}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-blue-400 transition-all cursor-pointer active:scale-95 shadow-xs"
            title={isUrdu ? 'میری لوکیشن' : 'My Location'}
          >
            <Crosshair className="w-5 h-5" />
          </button>

          {/* WhatsApp Share Live Location */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 py-3 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedShare ? (isUrdu ? 'شیئر ہو گیا!' : 'Shared!') : (isUrdu ? 'واٹس ایپ رپورٹ' : 'Share WhatsApp')}</span>
          </button>

          {/* Real Google Maps Turn-by-Turn */}
          <button
            type="button"
            onClick={handleLaunchGoogleMapsLive}
            className="flex-1 py-3 px-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-1.5"
          >
            <Navigation2 className="w-4 h-4 fill-white" />
            <span>{isUrdu ? 'گوگل میپس وائس' : 'Google Voice GPS'}</span>
          </button>

          {/* Exit Button */}
          <button
            type="button"
            onClick={() => onNavigate('map')}
            className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-rose-800 border border-slate-600 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            <span>{isUrdu ? 'بند کریں' : 'Exit'}</span>
          </button>

        </div>
      </div>

    </div>
  );
};
