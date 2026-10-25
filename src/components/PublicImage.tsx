import React, { useState } from 'react';
import {
  Calculator,
  Truck,
  Milestone,
  ShieldCheck,
  AlertTriangle,
  Receipt,
  BookOpen,
  Wrench,
  Fuel,
  Sparkles,
  MapPin,
  Compass
} from 'lucide-react';

/**
 * Determine dynamic base URL for static assets (supporting GitHub Pages subpath, Capacitor, and root)
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const loc = window.location;
    if (loc.hostname.includes('github.io')) {
      const match = loc.pathname.match(/^\/([^/#?]+)/);
      if (match && match[1]) {
        return `/${match[1]}/`;
      }
      return '/Warraich-Goods/';
    }
  }
  const base = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL ? import.meta.env.BASE_URL : './';
  return base.endsWith('/') ? base : base + '/';
}

/**
 * List of fallback URLs for a given public asset filename
 */
export function getAssetCandidates(fileName: string): string[] {
  const clean = (fileName || '').replace(/^\.?\//, '');
  const baseUrl = getBaseUrl();

  const list: string[] = [
    `${baseUrl}${clean}`,
    `./${clean}`,
    `/Warraich-Goods/${clean}`,
    `https://zahdan-443.github.io/Warraich-Goods/${clean}`,
    `/${clean}`,
    `./public/${clean}`
  ];

  // Specific filename aliases in /public:
  if (clean === 'toll-icon.png') {
    list.push(`${baseUrl}toll_icon.png`, './toll_icon.png', '/Warraich-Goods/toll_icon.png');
  } else if (clean === 'toll_icon.png') {
    list.push(`${baseUrl}toll-icon.png`, './toll-icon.png', '/Warraich-Goods/toll-icon.png');
  }

  if (clean === 'splash.png') {
    list.push(`${baseUrl}splash-screen.png`, './splash-screen.png');
  } else if (clean === 'splash-screen.png') {
    list.push(`${baseUrl}splash.png`, './splash.png');
  }

  if (['logo.png', 'icon-192.png', 'icon-512.png'].includes(clean)) {
    list.push(`${baseUrl}app-icon.png`, './app-icon.png');
  }

  return Array.from(new Set(list));
}

/**
 * High-definition vector graphics fallback for any transport service icon
 */
export const DefaultServiceVector: React.FC<{ name: string; className?: string }> = ({ name, className = "w-full h-full" }) => {
  const clean = (name || '').toLowerCase();

  if (clean.includes('gari') || clean.includes('hisaab') || clean.includes('vehicle-account')) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-white flex flex-col items-center justify-between shadow-inner ${className}`}>
        <div className="w-full flex items-center justify-between opacity-85">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">کھاتہ</span>
          <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200" />
        </div>
        <div className="my-auto flex flex-col items-center justify-center text-center">
          <Truck className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md mb-0.5" />
          <span className="text-xs sm:text-sm font-bold font-serif leading-tight">گاڑی کا حساب</span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-amber-100 text-center font-mono">ڈیزل و اخراجات</span>
      </div>
    );
  }

  if (clean.includes('toll')) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-sky-500 via-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-white flex flex-col items-center justify-between shadow-inner ${className}`}>
        <div className="w-full flex items-center justify-between opacity-85">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">NHA</span>
          <span className="text-[9px] sm:text-[10px] font-bold text-sky-200">M-Tag</span>
        </div>
        <div className="my-auto flex flex-col items-center justify-center text-center">
          <Milestone className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md mb-0.5" />
          <span className="text-xs sm:text-sm font-bold font-serif leading-tight">موٹروے ٹول ٹیکس</span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-sky-100 text-center font-mono">M-1 تا M-16 ریٹس</span>
      </div>
    );
  }

  if (clean.includes('map')) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-blue-600 via-indigo-700 to-[#1e293b] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-white flex flex-col items-center justify-between shadow-inner ${className}`}>
        <div className="w-full flex items-center justify-between opacity-85">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">روٹ</span>
          <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-200" />
        </div>
        <div className="my-auto flex flex-col items-center justify-center text-center">
          <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md mb-0.5" />
          <span className="text-xs sm:text-sm font-bold font-serif leading-tight">نقشہ و موسم</span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-blue-200 text-center font-mono">لائیو ہائی ویز</span>
      </div>
    );
  }

  if (clean.includes('bilty')) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-white flex flex-col items-center justify-between shadow-inner ${className}`}>
        <div className="w-full flex items-center justify-between opacity-85">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">آفیشل</span>
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
        </div>
        <div className="my-auto flex flex-col items-center justify-center text-center">
          <Receipt className="w-8 h-8 sm:w-10 sm:h-10 text-amber-200 drop-shadow-md mb-0.5" />
          <span className="text-xs sm:text-sm font-bold font-serif leading-tight">بلٹی جنریٹر</span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-amber-200 text-center font-mono">وڑائچ گڈز رسید</span>
      </div>
    );
  }

  if (clean.includes('trip') || clean.includes('calculator')) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-emerald-600 via-emerald-700 to-[#4a5e3d] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-white flex flex-col items-center justify-between shadow-inner ${className}`}>
        <div className="w-full flex items-center justify-between opacity-85">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">کیلکولیٹر</span>
          <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-200" />
        </div>
        <div className="my-auto flex flex-col items-center justify-center text-center">
          <Calculator className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md mb-0.5" />
          <span className="text-xs sm:text-sm font-bold font-serif leading-tight">سفر اخراجات</span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-emerald-100 text-center font-mono">کرایہ و فیول منافع</span>
      </div>
    );
  }

  if (clean.includes('vehicle')) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-white flex flex-col items-center justify-between shadow-inner ${className}`}>
        <div className="w-full flex items-center justify-between opacity-85">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">ایکسائز</span>
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-200" />
        </div>
        <div className="my-auto flex flex-col items-center justify-center text-center">
          <Truck className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md mb-0.5" />
          <span className="text-xs sm:text-sm font-bold font-serif leading-tight">گاڑیوں کی تصدیق</span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-purple-200 text-center font-mono">MTMIS پنجاب</span>
      </div>
    );
  }

  if (clean.includes('license')) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-white flex flex-col items-center justify-between shadow-inner ${className}`}>
        <div className="w-full flex items-center justify-between opacity-85">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">DLIMS</span>
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-200" />
        </div>
        <div className="my-auto flex flex-col items-center justify-center text-center">
          <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md mb-0.5" />
          <span className="text-xs sm:text-sm font-bold font-serif leading-tight">لائسنس تصدیق</span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-teal-200 text-center font-mono">ٹریفک پولیس</span>
      </div>
    );
  }

  if (clean.includes('challan')) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-rose-600 via-red-600 to-rose-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-white flex flex-col items-center justify-between shadow-inner ${className}`}>
        <div className="w-full flex items-center justify-between opacity-85">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">PSCA</span>
          <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-200" />
        </div>
        <div className="my-auto flex flex-col items-center justify-center text-center">
          <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md mb-0.5" />
          <span className="text-xs sm:text-sm font-bold font-serif leading-tight">ای چالان چیکنگ</span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-rose-200 text-center font-mono">سیف سٹی پنجاب</span>
      </div>
    );
  }

  if (clean.includes('safar') || clean.includes('diary')) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-slate-700 via-slate-800 to-[#3c4a35] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-white flex flex-col items-center justify-between shadow-inner ${className}`}>
        <div className="w-full flex items-center justify-between opacity-85">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">لاگز</span>
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-200" />
        </div>
        <div className="my-auto flex flex-col items-center justify-center text-center">
          <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 drop-shadow-md mb-0.5" />
          <span className="text-xs sm:text-sm font-bold font-serif leading-tight">سفر ڈائری</span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-slate-300 text-center font-mono">ٹرپ ریکارڈ لاگز</span>
      </div>
    );
  }

  if (clean.includes('quick') || clean.includes('ops')) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-orange-600 via-amber-700 to-orange-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-white flex flex-col items-center justify-between shadow-inner ${className}`}>
        <div className="w-full flex items-center justify-between opacity-85">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">آپریشنز</span>
          <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-200" />
        </div>
        <div className="my-auto flex flex-col items-center justify-center text-center">
          <Wrench className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md mb-0.5" />
          <span className="text-xs sm:text-sm font-bold font-serif leading-tight">مزید سہولتیں</span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-orange-100 text-center font-mono">گاڑیاں، روٹس و ٹولز</span>
      </div>
    );
  }

  // Generic transport fallback
  return (
    <div className={`w-full h-full bg-gradient-to-br from-[#162a4d] to-[#0b162a] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-white flex flex-col items-center justify-center shadow-inner ${className}`}>
      <Truck className="w-8 h-8 sm:w-10 sm:h-10 text-[#c59b27] drop-shadow-md mb-1" />
      <span className="text-xs font-bold font-serif text-[#c59b27]">Driver Dost</span>
    </div>
  );
};

/**
 * Resilient Image component with instant vector placeholder and multi-path recovery
 */
export interface PublicImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fileName: string;
  fallbackIcon?: React.ReactNode;
  fitMode?: 'contain' | 'cover' | 'fill';
  imgClassName?: string;
}

export const PublicImage: React.FC<PublicImageProps> = ({
  fileName,
  fallbackIcon,
  className,
  fitMode = 'contain',
  imgClassName = '',
  alt = '',
  width = 400,
  height = 400,
  ...rest
}) => {
  const clean = (fileName || '').replace(/^\.?\//, '');
  const candidates = getAssetCandidates(clean);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // If already loaded in browser memory/cache, mark loaded immediately
  React.useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [candidateIndex]);

  const handleError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex(prev => prev + 1);
    } else {
      setHasFailedAll(true);
    }
  };

  const handleLoad = () => {
    setLoaded(true);
  };

  const computedAlt = alt && alt.trim().length > 0 
    ? alt 
    : `Driver Dost Transport Logistics - ${clean.replace(/[-_.]/g, ' ')}`;

  if (hasFailedAll) {
    if (fallbackIcon) {
      return (
        <div className={`flex items-center justify-center w-full h-full ${className || ''}`}>
          {fallbackIcon}
        </div>
      );
    }
    return <DefaultServiceVector name={clean} className={className} />;
  }

  const fitClass = fitMode === 'cover' ? 'object-cover' : fitMode === 'fill' ? 'object-fill' : 'object-contain';

  return (
    <div className={`relative flex items-center justify-center overflow-hidden w-full h-full ${className || ''}`}>
      {/* Instant fallback graphic / icon shown until image finishes rendering */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
          {fallbackIcon ? (
            <div className="flex items-center justify-center w-full h-full">{fallbackIcon}</div>
          ) : (
            <DefaultServiceVector name={clean} className="w-full h-full" />
          )}
        </div>
      )}

      {/* Primary User Image */}
      <img
        ref={imgRef}
        key={candidates[candidateIndex]}
        src={candidates[candidateIndex]}
        alt={computedAlt}
        loading={rest.loading || "eager"}
        decoding="async"
        width={width}
        height={height}
        className={`w-full h-full ${fitClass} transition-opacity duration-150 ${
          loaded ? 'opacity-100 relative z-10' : 'opacity-90 relative z-10'
        } ${imgClassName || ''}`}
        onError={handleError}
        onLoad={handleLoad}
        {...rest}
      />
    </div>
  );
};
