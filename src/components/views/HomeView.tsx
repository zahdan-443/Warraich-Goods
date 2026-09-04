import React, { useState, useEffect } from 'react';
import { ActiveTab, BiltyRecord, DICTIONARY, Driver, Language, Trip, UserRole, Vehicle } from '../../types';
import { 
  Calculator, 
  Truck, 
  Users, 
  MapPin, 
  Fuel, 
  ShieldCheck, 
  ArrowRight, 
  Quote, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Calendar,
  CreditCard,
  AlertTriangle,
  FileText,
  History,
  BookOpen,
  X,
  Activity,
  CheckCircle2,
  Wrench,
  Menu,
  Receipt,
  Copy,
  Check,
  Milestone,
  Crown,
  Compass
} from 'lucide-react';
import { AlHadiLogo } from '../AlHadiLogo';
import { LiveFuelPriceWidget } from '../LiveFuelPriceWidget';
import { TollCalculatorModal } from '../TollCalculatorModal';

// Embedded high-resolution base64 images - 100% offline proof, zero 404s, works across all Android PWA & APK wrappers
import {
  PublicImage,
  tripIconData,
  gariHisaabIconData,
  vehicleIconData,
  licenseIconData,
  echallanIconData,
  safarDiaryIconData,
  tollIconData,
  quickOpsIconData,
  mapIconData,
  biltyIconData
} from '../../assets/dashboardIcons';

interface HomeViewProps {
  lang: Language;
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  bilties?: BiltyRecord[];
  userRole?: UserRole;
  userEmail?: string | null;
  isBiltyAuthorized?: boolean;
  onNavigate: (tab: ActiveTab) => void;
  onOpenMenu?: () => void;
  onOpenSignIn?: () => void;
  onOpenBiltyAccess?: () => void;
  onSaveTrip?: (tripObj: Omit<Trip, 'id' | 'name'>, tripName: string) => void;
  onLogFuelPrice?: (diesel?: number, petrol?: number, cng?: number) => void;
}

interface CalendarEvent {
  id: string;
  dateStr: string; // YYYY-MM-DD
  title: string;
  type: 'load' | 'maintenance' | 'dispatch' | 'other';
  status: 'pending' | 'active' | 'completed';
}

const QuickActionButton: React.FC<{
  onClick: () => void;
  imgSrc: string;
  fallbackIcon?: React.ReactNode;
  fullName: string;
  subtitle?: string;
  highlight?: boolean;
  href?: string;
  external?: boolean;
}> = ({ onClick, imgSrc, fullName, highlight, href, external }) => {
  const commonClasses = `p-1.5 sm:p-2 bg-white border ${
    highlight ? 'border-2 border-[#8b9d77] shadow-sm' : 'border-[#ecece0]'
  } hover:border-[#8b9d77] hover:shadow-md rounded-2xl sm:rounded-3xl transition-all active:scale-95 cursor-pointer flex items-center justify-center text-center group w-full aspect-square min-h-[110px] sm:min-h-[135px] no-underline`;

  const innerContent = (
    <div className="w-full h-full bg-[#fdfbf7] rounded-xl sm:rounded-2xl border border-[#ecece0] group-hover:border-[#8b9d77] shadow-2xs flex items-center justify-center transition-transform group-hover:scale-105 overflow-hidden">
      <PublicImage
        fileName={imgSrc}
        alt={`Driver Dost Transport Tool: ${fullName}`}
        width={140}
        height={140}
        className="w-full h-full object-cover rounded-xl"
      />
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        onClick={(e) => {
          if (!external) {
            e.preventDefault();
          }
          onClick();
        }}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        title={fullName}
        aria-label={fullName}
        className={commonClasses}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={fullName}
      aria-label={fullName}
      className={commonClasses}
    >
      {innerContent}
    </button>
  );
};

export const HomeView: React.FC<HomeViewProps> = ({ 
  lang, 
  trips, 
  vehicles, 
  drivers, 
  bilties = [],
  userRole = 'owner',
  userEmail = null,
  isBiltyAuthorized = false,
  onNavigate, 
  onOpenMenu,
  onOpenSignIn,
  onOpenBiltyAccess,
  onSaveTrip,
  onLogFuelPrice
}) => {
  const t = DICTIONARY[lang];
  const [showRecentLogs, setShowRecentLogs] = useState(false);
  const [showSafarDiaryModal, setShowSafarDiaryModal] = useState(false);
  const [showQuickOpsModal, setShowQuickOpsModal] = useState(false);
  const [showTollCalculatorModal, setShowTollCalculatorModal] = useState(false);

  const currentDate = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'ur-PK', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  // Calendar navigation states
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Custom interactive calendar events state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<'load' | 'maintenance' | 'dispatch' | 'other'>('load');

  useEffect(() => {
    const handleBack = (e: Event) => {
      if (showTollCalculatorModal) {
        setShowTollCalculatorModal(false);
        e.preventDefault();
      } else if (showSafarDiaryModal) {
        setShowSafarDiaryModal(false);
        e.preventDefault();
      } else if (showQuickOpsModal) {
        setShowQuickOpsModal(false);
        e.preventDefault();
      } else if (showRecentLogs) {
        setShowRecentLogs(false);
        e.preventDefault();
      } else if (showAddEvent) {
        setShowAddEvent(false);
        e.preventDefault();
      }
    };
    window.addEventListener('app-back-button', handleBack);
    return () => window.removeEventListener('app-back-button', handleBack);
  }, [showTollCalculatorModal, showSafarDiaryModal, showQuickOpsModal, showRecentLogs, showAddEvent]);

  const openModalWithHistory = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    window.history.pushState({ modal: true }, '');
    setter(true);
  };

  useEffect(() => {
    const stored = localStorage.getItem('ah-calendar-events');
    if (stored) {
      setEvents(JSON.parse(stored));
    } else {
      const y = new Date().getFullYear();
      const m = new Date().getMonth();
      const seed: CalendarEvent[] = [
        {
          id: 'seed-1',
          dateStr: `${y}-${String(m + 1).padStart(2, '0')}-08`,
          title: lang === 'ur' ? 'لاہور سے راولپنڈی گندم کی ڈیلیوری' : 'Lahore to Rawalpindi Wheat Delivery',
          type: 'load',
          status: 'active'
        },
        {
          id: 'seed-2',
          dateStr: `${y}-${String(m + 1).padStart(2, '0')}-15`,
          title: lang === 'ur' ? 'گاڑی نمبر LHR-7860 ٹیوننگ اور آئل تبدیلی' : 'Vehicle LHR-7860 Tuning & Oil Change',
          type: 'maintenance',
          status: 'pending'
        },
        {
          id: 'seed-3',
          dateStr: `${y}-${String(m + 1).padStart(2, '0')}-22`,
          title: lang === 'ur' ? 'ملتان سے کراچی چاول لوڈ روانگی' : 'Multan to Karachi Rice Load Dispatch',
          type: 'dispatch',
          status: 'pending'
        }
      ];
      setEvents(seed);
      localStorage.setItem('ah-calendar-events', JSON.stringify(seed));
    }
  }, [lang]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    
    const yearStr = selectedDate.getFullYear();
    const monthStr = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
    
    const newEvent: CalendarEvent = {
      id: 'evt-' + Date.now(),
      dateStr,
      title: newEventTitle.trim(),
      type: newEventType,
      status: 'pending'
    };
    
    const updated = [...events, newEvent];
    setEvents(updated);
    localStorage.setItem('ah-calendar-events', JSON.stringify(updated));
    setNewEventTitle('');
    setShowAddEvent(false);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter(evt => evt.id !== id);
    setEvents(updated);
    localStorage.setItem('ah-calendar-events', JSON.stringify(updated));
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayClick = (day: any) => {
    setSelectedDate(new Date(day.year, day.month, day.dayNum));
    if (day.month !== currentMonth) {
      setCurrentMonth(day.month);
      setCurrentYear(day.year);
    }
  };

  // Helper to generate days of the 6-week grid
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    
    const firstDayIndex = date.getDay();
    
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        dayNum: daysInPrevMonth - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
      });
    }
    
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days.push({
        dayNum: i,
        month,
        year,
        isCurrentMonth: true,
      });
    }
    
    const totalSlots = 42;
    const remainingSlots = totalSlots - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        dayNum: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
      });
    }
    
    return days;
  };

  const matchTripWithDate = (trip: Trip, d: Date) => {
    try {
      const targetStr = d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
      const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const fallbackStr = `${String(d.getDate()).padStart(2, '0')} ${monthsShort[d.getMonth()]}, ${d.getFullYear()}`;
      
      const tripDateLower = trip.date.toLowerCase();
      return tripDateLower.includes(targetStr.toLowerCase()) || tripDateLower.includes(fallbackStr.toLowerCase());
    } catch(e) {
      return false;
    }
  };

  const daysInGrid = getDaysInMonth(currentYear, currentMonth);

  const getDayEventsAndTrips = (dayNum: number, monthNum: number, yearNum: number) => {
    const mStr = String(monthNum + 1).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    const targetDateStr = `${yearNum}-${mStr}-${dStr}`;
    const dObj = new Date(yearNum, monthNum, dayNum);
    
    const dayCustomEvents = events.filter(evt => evt.dateStr === targetDateStr);
    const dayTrips = trips.filter(trip => matchTripWithDate(trip, dObj));
    
    return { dayCustomEvents, dayTrips, totalCount: dayCustomEvents.length + dayTrips.length };
  };

  const selectedDateEvents = events.filter(evt => {
    const yearStr = selectedDate.getFullYear();
    const monthStr = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
    return evt.dateStr === dateStr;
  });

  const selectedDateTrips = trips.filter(trip => matchTripWithDate(trip, selectedDate));

  const monthNamesEN = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const monthNamesUR = [
    "جنوری", "فروری", "مارچ", "اپریل", "مئی", "جون", 
    "جولائی", "اگست", "ستمبر", "اکتوبر", "نومبر", "دسمبر"
  ];
  
  const currentMonthName = lang === 'ur' ? monthNamesUR[currentMonth] : monthNamesEN[currentMonth];
  const urduDayLetters = ['ا', 'پ', 'م', 'ب', 'ج', 'ج', 'ہ'];
  const englishDayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const quickItems: { id: string; title: string; desc: string; icon: React.ReactNode }[] = [
    { 
      id: 'map', 
      title: lang === 'ur' ? 'نقشہ و روٹ موسم' : 'Map & Route Weather', 
      desc: lang === 'ur' ? 'موٹروے روٹ نقشہ، حدِ نگاہ اور لائیو موسم' : 'Highway corridors, visibility & live weather', 
      icon: <MapPin className="w-5 h-5 text-[#8b9d77]" /> 
    },
    { 
      id: 'safarDiary', 
      title: lang === 'ur' ? 'سفر ڈائری لاگز' : 'Safar Diary Logs', 
      desc: lang === 'ur' ? 'روزانہ ٹرپ اور اخراجات کا ریکارڈ' : 'Daily trip & expense records', 
      icon: <BookOpen className="w-5 h-5 text-[#8b9d77]" /> 
    },
    { 
      id: 'vehicle', 
      title: t.nav.vehicle, 
      desc: lang === 'ur' ? "اپنے ٹرکوں، ٹریلرز اور مائلیج کا ریکارڈ رکھیں" : "Manage fleet trucks, trailers & mileage", 
      icon: <Truck className="w-5 h-5 text-[#8b9d77]" /> 
    },
    { 
      id: 'drivers', 
      title: t.nav.drivers, 
      desc: lang === 'ur' ? "ڈرائیوروں کے واٹس ایپ نمبر اور لائسنس کی معلومات" : "Access WhatsApp contacts & license status", 
      icon: <Users className="w-5 h-5 text-[#8b9d77]" /> 
    },
    { 
      id: 'routes', 
      title: t.nav.routes, 
      desc: lang === 'ur' ? "محفوظ موٹروے راستے اور ٹول ٹیکس ریٹ" : "Saved motorway corridors & toll tariffs", 
      icon: <MapPin className="w-5 h-5 text-[#8b9d77]" /> 
    },
    { 
      id: 'fuel', 
      title: t.nav.fuel, 
      desc: lang === 'ur' ? "ڈیلی ڈیزل اور پیٹرول کی مارکیٹ قیمتیں" : "Log daily diesel & petrol market prices", 
      icon: <Fuel className="w-5 h-5 text-[#8b9d77]" /> 
    },
    { 
      id: 'recentLogs', 
      title: lang === 'ur' ? 'حالیہ لاگز کھولیں' : 'Open Recent Logs', 
      desc: lang === 'ur' ? 'حالیہ سفری لاگز اور تفصیل دیکھیں' : 'View recent trip history logs', 
      icon: <History className="w-5 h-5 text-[#8b9d77]" /> 
    },
  ];

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-10 max-w-7xl mx-auto w-full">
      {/* Primary Semantic H1 Heading for SEO & Screen Readers */}
      <h1 className="sr-only">
        {lang === 'ur' 
          ? 'ڈرائیور دوست - روڈ فریٹ، سفر اخراجات کیلکولیٹر اور گاڑی حساب' 
          : 'Driver Dost - Road Freight, Trip Cost Calculator & Fleet Management'}
      </h1>
      
      {/* Left Column (7 cols): Warraich Goods Section & Live Fuel Prices */}
      <div className="lg:col-span-7 flex flex-col gap-6 sm:gap-8">
        
        {/* Authenticated App Owner Control Panel Quick Link */}
        {(userEmail?.toLowerCase() === 'warraichgoods43@gmail.com' || userEmail?.toLowerCase() === 'alhadigoods786@gmail.com') && onOpenBiltyAccess && (
          <div className="p-4 rounded-[28px] bg-gradient-to-r from-amber-500/15 via-[#fdfbf7] to-amber-500/15 border-2 border-amber-400/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-500 to-[#b58b28] rounded-2xl text-white shrink-0 shadow-xs">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-amber-950 font-serif text-sm flex items-center gap-2">
                  <span>{lang === 'ur' ? 'ایپ آنر کنٹرول پینل فعال ہے' : 'App Owner Control Panel'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold border border-amber-300">
                    Master Admin
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 font-sans mt-0.5">
                  {lang === 'ur' 
                    ? 'بلٹی رسائی، کمپنی پروفائل و مالیاتی رپورٹس' 
                    : 'Bilty authorization, company settings & reports'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenBiltyAccess}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-[#b58b28] hover:from-amber-600 hover:to-[#96721f] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Crown className="w-3.5 h-3.5 text-amber-200" />
              <span>{lang === 'ur' ? 'آنر پینل کھولیں' : 'Open Control Panel'}</span>
            </button>
          </div>
        )}

        {/* SECTION 1: Primary Transport, Route & Trip Calculation Tools (4 Core Buttons) */}
        <div className="bg-white p-4 sm:p-6 md:p-7 rounded-[32px] sm:rounded-[36px] shadow-sm border border-[#ecece0] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#ecece0]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8b9d77] animate-pulse"></span>
              <h2 className="font-serif font-bold text-sm sm:text-base text-[#4a4a35]">
                {lang === 'ur' ? '🚛 ٹرانسپورٹ روٹ و حساب ٹولز' : '🚛 Transport, Route & Trip Tools'}
              </h2>
            </div>
            <span className="text-[10px] font-bold text-[#8b9d77] bg-[#8b9d77]/10 px-2 py-0.5 rounded-full border border-[#8b9d77]/20">
              {lang === 'ur' ? '4 اہم ٹولز' : '4 Core Tools'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-3.5">
            {/* 1. Trip Expense Calculator */}
            <QuickActionButton
              href="#calculator"
              onClick={() => onNavigate('calculator')}
              imgSrc={tripIconData}
              fallbackIcon={<Calculator className="w-7 h-7 text-[#8b9d77]" />}
              fullName={lang === 'ur' ? 'سفر اخراجات کیلکولیٹر' : 'Trip Expense Calculator'}
              subtitle={lang === 'ur' ? 'کرایہ اور فیول منافع کا تخمینہ' : 'Freight cost & profit estimate'}
              highlight={true}
            />

            {/* 2. Vehicle Account / Ledger */}
            <QuickActionButton
              href="#vehicleAccount"
              onClick={() => onNavigate('vehicleAccount')}
              imgSrc={gariHisaabIconData}
              fallbackIcon={<Calculator className="w-7 h-7 text-[#8b9d77]" />}
              fullName={lang === 'ur' ? 'گاڑی کا حساب' : 'Vehicle Account'}
              subtitle={lang === 'ur' ? 'ڈیزل، ٹول، چالان و دیگر اخراجات' : 'Post-trip vehicle expense account'}
              highlight={true}
            />

            {/* 3. Motorway Toll Tax Calculator */}
            <QuickActionButton
              href="#toll"
              onClick={() => onNavigate('toll')}
              imgSrc={tollIconData}
              fallbackIcon={<Milestone className="w-7 h-7 text-[#8b9d77]" />}
              fullName={lang === 'ur' ? 'موٹروے ٹول ٹیکس' : 'Motorway Toll Tax'}
              subtitle={lang === 'ur' ? 'این ایچ اے ٹول و ایم ٹیگ تخمینہ' : 'NHA toll & M-Tag calculator'}
              highlight={true}
            />

            {/* 4. Map & Route Weather */}
            <QuickActionButton
              href="#map"
              onClick={() => onNavigate('map')}
              imgSrc={mapIconData}
              fallbackIcon={<MapPin className="w-7 h-7 text-[#8b9d77]" />}
              fullName={lang === 'ur' ? 'نقشہ و روٹ موسم' : 'Map & Route Weather'}
              subtitle={lang === 'ur' ? 'لائیو موٹروے میپ، دھند و موسم' : 'Highway map & live weather'}
              highlight={true}
            />
          </div>
        </div>

        {/* SECTION 2: Official Portals, Verifications & Quick Ops (4 Buttons) */}
        <div className="bg-white p-4 sm:p-6 md:p-7 rounded-[32px] sm:rounded-[36px] shadow-sm border border-[#ecece0] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#ecece0]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5a5a40]"></span>
              <h2 className="font-serif font-bold text-sm sm:text-base text-[#4a4a35]">
                {lang === 'ur' ? '🏛️ سرکاری ریکارڈ، تصدیقات و مزید سروسز' : '🏛️ Govt Portals, Checks & Quick Ops'}
              </h2>
            </div>
            <span className="text-[10px] font-bold text-[#5a5a40] bg-[#ecece0] px-2 py-0.5 rounded-full border border-[#d8d8c0]">
              {lang === 'ur' ? 'آن لائن ریکارڈ' : 'Online Portals'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-3.5">
            {/* 5. Vehicles Verification */}
            <QuickActionButton
              href="https://mtmis.excise.punjab.gov.pk/"
              external={true}
              onClick={() => window.open('https://mtmis.excise.punjab.gov.pk/', '_blank', 'noopener,noreferrer')}
              imgSrc={vehicleIconData}
              fallbackIcon={<Truck className="w-7 h-7 text-[#8b9d77]" />}
              fullName={lang === 'ur' ? 'گاڑیوں کی تصدیق' : 'Vehicles Verification'}
              subtitle={lang === 'ur' ? 'MTMIS پنجاب و ایکسائز ریکارڈ' : 'MTMIS Punjab & Excise portal'}
            />

            {/* 6. License Verification */}
            <QuickActionButton
              href="https://dlims.punjab.gov.pk/verify"
              external={true}
              onClick={() => window.open('https://dlims.punjab.gov.pk/verify', '_blank', 'noopener,noreferrer')}
              imgSrc={licenseIconData}
              fallbackIcon={<ShieldCheck className="w-7 h-7 text-[#8b9d77]" />}
              fullName={lang === 'ur' ? 'لائسنس کی تصدیق' : 'License Verification'}
              subtitle={lang === 'ur' ? 'DLIMS پنجاب و موٹروے پولیس' : 'DLIMS Punjab Highway checks'}
            />

            {/* 7. E-Challan Check */}
            <QuickActionButton
              href="https://echallan.psca.gop.pk/"
              external={true}
              onClick={() => window.open('https://echallan.psca.gop.pk/', '_blank', 'noopener,noreferrer')}
              imgSrc={echallanIconData}
              fallbackIcon={<AlertTriangle className="w-7 h-7 text-[#8b9d77]" />}
              fullName={lang === 'ur' ? 'ای چالان چیکنگ' : 'E-Challan Checking'}
              subtitle={lang === 'ur' ? 'PSCA سیف سٹی چالان ریکارڈ' : 'PSCA Safe City traffic records'}
            />

            {/* 8. End Button: Mazeed Sahulatain / Quick Operations */}
            <QuickActionButton
              href="#quickops"
              onClick={() => openModalWithHistory(setShowQuickOpsModal)}
              imgSrc={quickOpsIconData}
              fallbackIcon={<Wrench className="w-7 h-7 text-[#8b9d77]" />}
              fullName={lang === 'ur' ? 'مزید سہولتیں و آپریشنز' : 'More Services & Quick Ops'}
              subtitle={lang === 'ur' ? 'گاڑیاں، ڈرائیورز، پورٹلز و ٹولز' : 'Fleet tools & shortcut portals'}
              highlight={true}
            />
          </div>

          {/* Bilty Form (ONLY visible when authenticated owner) */}
          {isBiltyAuthorized && (
            <div className="pt-2.5 border-t border-[#ecece0] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="./bilty-official-icon.png"
                  alt="Official Bilty Seal"
                  className="w-6 h-6 rounded-lg object-contain border border-amber-400/40 p-0.5 bg-white shadow-2xs"
                />
                <span className="text-xs font-bold text-[#4a4a35]">
                  {lang === 'ur' ? 'آفیشل بلٹی جنریٹر (آنر پینل):' : 'Official Bilty Generator (Owner):'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('bilty')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#b58b28] hover:from-amber-600 hover:to-[#96721f] text-white font-serif font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>{lang === 'ur' ? 'بلٹی فارم کھولیں' : 'Open Bilty Form'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Fuel Prices Monitor Card */}
        <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-[#ecece0]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif font-bold text-lg text-[#4a4a35] flex items-center gap-2">
              <Fuel className="w-5 h-5 text-[#8b9d77]" />
              <span>{lang === 'ur' ? 'پاکستان پول ریٹ مانیٹر' : 'Live POL Rates Monitor'}</span>
            </h2>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] uppercase tracking-wider">
              {lang === 'ur' ? 'لائیو اپڈیٹ' : 'Live Updated'}
            </span>
          </div>
          <LiveFuelPriceWidget lang={lang} compact />
        </div>

      </div>

      {/* Right Column (5 cols): Motivation Wisdom & Calendar */}
      <div className="lg:col-span-5 flex flex-col gap-8">
        
        {/* Wisdom Sage Green Accent Card */}
        <div className="bg-[#8b9d77] text-white p-8 rounded-[40px] shadow-sm relative overflow-hidden group">
          <Quote className="w-10 h-10 mb-4 opacity-40 text-white" />
          <p className="text-lg font-serif italic mb-4 font-light leading-relaxed">
            "{lang === 'ur' 
              ? 'آگے بڑھنے کا راز بس پہلا قدم اٹھانا ہے۔ محنت میں عظمت ہے۔'
              : 'Agay barhnay ka raaz bas pehla qadam uthana hai. Punjab ki sarak aur mehnat ki barkat.'}"
          </p>
          <p className="text-xs uppercase tracking-widest opacity-80 font-sans font-semibold">
            {lang === 'ur' ? '- ڈرائیور دوست رہنمائی' : '- Driver Dost Wisdom'}
          </p>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full pointer-events-none group-hover:scale-110 transition-transform"></div>
        </div>

        {/* Dynamic, Workable, Fully Interactive Freight Schedule Calendar */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#ecece0] flex-1 flex flex-col">
          <header className="flex items-center justify-between mb-6">
            <button 
              onClick={handlePrevMonth}
              aria-label={lang === 'ur' ? 'پچھلا مہینہ' : 'Previous Month'}
              className="p-1.5 rounded-full border border-[#ecece0] hover:border-[#8b9d77] text-[#5a5a40] hover:text-[#2d2d20] transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="font-serif font-bold text-sm text-[#4a4a35] uppercase tracking-wider text-center">
              {currentMonthName} {currentYear}
            </h2>
            <button 
              onClick={handleNextMonth}
              aria-label={lang === 'ur' ? 'اگلا مہینہ' : 'Next Month'}
              className="p-1.5 rounded-full border border-[#ecece0] hover:border-[#8b9d77] text-[#5a5a40] hover:text-[#2d2d20] transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </header>
          
          <div className="grid grid-cols-7 gap-1.5 text-[10px] font-bold text-center mb-4 text-[#8b9d77]">
            {(lang === 'ur' ? urduDayLetters : englishDayLetters).map((day, idx) => (
              <div key={idx} className="w-full">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-[#4a4a35] items-center mb-6">
            {daysInGrid.map((day, idx) => {
              const dateObj = new Date(day.year, day.month, day.dayNum);
              const isSelected = selectedDate.getDate() === day.dayNum && 
                                 selectedDate.getMonth() === day.month && 
                                 selectedDate.getFullYear() === day.year;
                                 
              const { totalCount } = getDayEventsAndTrips(day.dayNum, day.month, day.year);
              
              const isToday = new Date().getDate() === day.dayNum && 
                              new Date().getMonth() === day.month && 
                              new Date().getFullYear() === day.year;

              return (
                <button
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  aria-label={`${day.dayNum} ${monthNamesEN[day.month]} ${day.year}`}
                  className={`relative p-1.5 w-7 h-7 mx-auto rounded-full flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-[#8b9d77] text-white font-bold shadow-2xs' 
                      : isToday
                        ? 'border border-[#8b9d77] text-[#4a4a35] font-bold'
                        : day.isCurrentMonth 
                          ? 'text-[#4a4a35] hover:bg-[#f9f9f2]' 
                          : 'text-[#8e8e75]/60 hover:bg-[#f9f9f2]/50'
                  }`}
                >
                  <span>{day.dayNum}</span>
                  {totalCount > 0 && !isSelected && (
                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#C59B27]"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Schedule Events List for Selected Day */}
          <div className="mt-4 pt-4 border-t border-[#ecece0] flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-wider font-bold text-[#5a5a40] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#8b9d77]" />
                <span>
                  {lang === 'ur' 
                    ? `${selectedDate.getDate()} ${monthNamesUR[selectedDate.getMonth()]} کے شیڈول`
                    : `Schedule for ${selectedDate.getDate()} ${monthNamesEN[selectedDate.getMonth()]}`}
                </span>
              </h3>
              <button 
                onClick={() => setShowAddEvent(!showAddEvent)}
                className="p-1 rounded-full bg-[#f0f0e4] text-[#8b9d77] hover:bg-[#8b9d77] hover:text-white transition-all cursor-pointer"
                title={lang === 'ur' ? "شیڈول شامل کریں" : "Add Event"}
                aria-label={lang === 'ur' ? "شیڈول شامل کریں" : "Add Event"}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inline Event Creation Form */}
            {showAddEvent && (
              <form onSubmit={handleAddEvent} className="bg-[#f9f9f2] p-3 rounded-2xl border border-[#ecece0] mb-4 space-y-2.5">
                <div>
                  <input 
                    type="text"
                    required
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    aria-label={lang === 'ur' ? 'شیڈول عنوان' : 'Event Title'}
                    placeholder={lang === 'ur' ? 'مثال: لاہور گندم لوڈ روانگی' : 'e.g., Lahore Wheat Cargo'}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#ecece0] rounded-lg focus:outline-none focus:border-[#8b9d77]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={newEventType}
                    onChange={(e: any) => setNewEventType(e.target.value)}
                    aria-label={lang === 'ur' ? 'ایونٹ کی قسم' : 'Event Type'}
                    className="flex-1 text-[11px] px-2 py-1.5 bg-white border border-[#ecece0] rounded-lg text-[#4a4a35] focus:outline-none focus:border-[#8b9d77]"
                  >
                    <option value="load">{lang === 'ur' ? 'مال برداری (Load)' : 'Cargo Load'}</option>
                    <option value="maintenance">{lang === 'ur' ? 'مرمت (Repair)' : 'Maintenance'}</option>
                    <option value="dispatch">{lang === 'ur' ? 'روانگی (Dispatch)' : 'Dispatch'}</option>
                    <option value="other">{lang === 'ur' ? 'دیگر (Other)' : 'Other'}</option>
                  </select>
                  <button 
                    type="submit"
                    aria-label={lang === 'ur' ? 'محفوظ کریں' : 'Save Event'}
                    className="px-3 py-1.5 bg-[#8b9d77] text-white text-[11px] font-bold rounded-lg hover:bg-[#7a8c66] transition-all cursor-pointer"
                  >
                    {lang === 'ur' ? 'شامل کریں' : 'Save'}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
              {/* Display custom schedule events */}
              {selectedDateEvents.map(evt => (
                <div key={evt.id} className="flex items-start justify-between p-2.5 rounded-xl bg-[#fdfbf7] border border-[#ecece0] text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-sm mt-0.5">
                      {evt.type === 'load' ? '📦' : evt.type === 'maintenance' ? '🔧' : evt.type === 'dispatch' ? '🚚' : '📝'}
                    </span>
                    <div>
                      <p className="font-semibold text-[#4a4a35] leading-snug">{evt.title}</p>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-[#8b9d77]">
                        {lang === 'ur' 
                          ? evt.type === 'load' ? 'کارگو لوڈ' : evt.type === 'maintenance' ? 'دیکھ بھال' : evt.type === 'dispatch' ? 'روانگی' : 'دیگر'
                          : evt.type}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteEvent(evt.id)}
                    className="text-[#8e8e75]/60 hover:text-red-600 transition-colors p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Display actual recorded Trips matching this day */}
              {selectedDateTrips.map(trip => (
                <div key={trip.id} className="flex items-start justify-between p-2.5 rounded-xl bg-white border-l-4 border-[#8b9d77] border-y border-r border-[#ecece0] text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-sm mt-0.5">🚛</span>
                    <div>
                      <p className="font-semibold text-[#4a4a35] leading-snug">{trip.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-[#8e8e75]">
                        <span className="font-bold text-[#5a5a40]">PKR {trip.total.toLocaleString()}</span>
                        <span>·</span>
                        <span>{trip.dist} km</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[8px] bg-[#8b9d77]/10 text-[#5a5a40] px-1.5 py-0.5 rounded-full uppercase tracking-tighter font-bold">
                    {lang === 'ur' ? 'سفر لاگ' : 'Trip Log'}
                  </span>
                </div>
              ))}

              {/* Empty state for the selected day */}
              {selectedDateEvents.length === 0 && selectedDateTrips.length === 0 && (
                <div className="py-8 text-center text-xs italic text-[#8e8e75] bg-[#fdfbf7]/50 rounded-2xl border border-dashed border-[#ecece0]">
                  {lang === 'ur' ? 'اس دن کوئی لوڈ یا شیڈول نہیں ہے۔' : 'No schedules saved for this day.'}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#ecece0] flex items-center justify-between text-[10px] text-[#8e8e75]">
              <span className="flex items-center gap-1.5 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C59B27]"></span> 
                {lang === 'ur' ? 'فعال شیڈول' : 'Active Schedule'}
              </span>
              <span className="font-serif italic font-semibold">
                {selectedDateEvents.length + selectedDateTrips.length} {lang === 'ur' ? 'ٹوٹل' : 'Total'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Safar Diary Modal */}
      {showSafarDiaryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] max-w-4xl w-full p-6 md:p-10 shadow-2xl border border-[#ecece0] max-h-[90vh] overflow-y-auto space-y-8 text-left">
            
            {/* Modal Header */}
            <header className="flex justify-between items-start border-b border-[#ecece0] pb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#8b9d77]/15 text-[#5a5a40] uppercase tracking-wider mb-2">
                  <BookOpen className="w-3 h-3 text-[#8b9d77]" />
                  {lang === 'ur' ? 'سفر ڈائری لاگز' : 'Safar Diary Logs'}
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#4a4a35]">
                  {lang === 'ur' ? 'ڈرائیور دوست سفر ڈائری اور ریکارڈ' : 'Driver Dost Safar Diary'}
                </h2>
                <p className="text-[#8b9d77] italic text-xs mt-1">{currentDate}</p>
              </div>
              <button
                onClick={() => setShowSafarDiaryModal(false)}
                className="p-3 bg-[#f0f0e4] hover:bg-[#5a5a40] hover:text-white rounded-full text-[#5a5a40] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Stats Bars Section */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-[#f9f9f2] rounded-2xl border border-[#ecece0]/50 text-center transition-all hover:border-[#8b9d77]">
                <div className="text-[10px] uppercase tracking-tighter text-[#8e8e75] mb-1 font-sans font-semibold">
                  {t.stats.trips}
                </div>
                <div className="text-2xl font-serif font-bold text-[#5a5a40]">{trips.length}</div>
              </div>
              
              <div className="p-4 bg-[#f9f9f2] rounded-2xl border border-[#ecece0]/50 text-center transition-all hover:border-[#8b9d77]">
                <div className="text-[10px] uppercase tracking-tighter text-[#8e8e75] mb-1 font-sans font-semibold">
                  {t.stats.vehicles}
                </div>
                <div className="text-2xl font-serif font-bold text-[#5a5a40]">{vehicles.length}</div>
              </div>

              <div className="p-4 bg-[#f9f9f2] rounded-2xl border border-[#ecece0]/50 text-center transition-all hover:border-[#8b9d77]">
                <div className="text-[10px] uppercase tracking-tighter text-[#8e8e75] mb-1 font-sans font-semibold">
                  {t.stats.drivers}
                </div>
                <div className="text-2xl font-serif font-bold text-[#5a5a40]">{drivers.length}</div>
              </div>
            </div>

            {/* Add Trip Action Banner */}
            <div className="p-5 bg-[#fdfbf7] rounded-3xl border border-[#8b9d77]/40 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#4a4a35]">
                  {lang === 'ur' ? 'نیا سفری اخراجات لاگ شامل کریں' : 'Log New Trip & Calculate Expenses'}
                </h3>
                <p className="text-xs text-[#8e8e75]">
                  {lang === 'ur' ? 'ڈیزل، ٹول ٹیکس اور روٹ خرچ کا حساب لگائیں' : 'Calculate fuel, toll tax, and route consumption'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSafarDiaryModal(false);
                  onNavigate('calculator');
                }}
                className="px-5 py-2.5 rounded-2xl bg-[#8b9d77] hover:bg-[#798a67] text-white text-xs font-bold font-serif shrink-0 transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'ur' ? 'نیا ٹرپ درج کریں' : 'New Trip Log'}</span>
              </button>
            </div>

            {/* Recent Trips List Inside Modal */}
            <div id="modal-recent-logs" className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#8e8e75]">
                  {t.recentTrips} ({trips.length})
                </h3>
              </div>

              <div className="space-y-3">
                {trips.length === 0 ? (
                  <div className="p-8 text-center bg-[#fdfbf7] rounded-3xl border border-[#ecece0]">
                    <p className="text-sm italic text-[#8e8e75]">{t.noTrips}</p>
                  </div>
                ) : (
                  trips.slice(0, 8).map((trip, idx) => (
                    <div
                      key={trip.id}
                      onClick={() => {
                        setShowSafarDiaryModal(false);
                        onNavigate('calculator');
                      }}
                      className={`flex items-start justify-between gap-4 p-4 rounded-3xl transition-all cursor-pointer ${
                        idx === 0
                          ? 'bg-[#fdfbf7] border-l-4 border-[#8b9d77] border-y border-r border-[#ecece0] shadow-2xs'
                          : 'bg-white border border-[#ecece0] hover:border-[#8b9d77]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 ${
                          idx === 0 ? 'border-2 border-[#8b9d77] bg-[#8b9d77]/10' : 'border-2 border-[#d8d8c0]'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-[#8b9d77]' : 'bg-[#d8d8c0]'}`}></div>
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-sm text-[#4a4a35]">{trip.name}</h4>
                          <p className="text-[11px] text-[#8e8e75] mt-0.5 font-sans">
                            {trip.fuelType} · {trip.dist} km · {trip.consumed} L
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-serif font-bold text-base text-[#5a5a40]">
                          PKR {trip.total.toLocaleString()}
                        </span>
                        <div className="text-[9px] text-[#8e8e75]">{trip.date}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer Close Button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowSafarDiaryModal(false)}
                className="px-6 py-2.5 rounded-full bg-[#4a4a35] text-white font-serif font-bold text-xs hover:bg-[#383827] transition-all cursor-pointer shadow-sm"
              >
                {lang === 'ur' ? 'ڈائری بند کریں' : 'Close Safar Diary'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Quick Operations Modal */}
      {showQuickOpsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] max-w-4xl w-full p-6 md:p-10 shadow-2xl border border-[#ecece0] max-h-[90vh] overflow-y-auto space-y-8 text-left">
            
            {/* Modal Header */}
            <header className="flex justify-between items-start border-b border-[#ecece0] pb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#8b9d77]/15 text-[#5a5a40] uppercase tracking-wider mb-2">
                  <Wrench className="w-3 h-3 text-[#8b9d77]" />
                  {lang === 'ur' ? 'کوئیک پورٹل' : 'Quick Portal'}
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#4a4a35]">
                  {lang === 'ur' ? 'کوئیک آپریشنز اور مانیٹرنگ' : 'Quick Operations'}
                </h2>
                <p className="text-[#8e8e75] text-xs mt-1">
                  {lang === 'ur' ? 'تمام فلیٹ ٹولز، پورٹل اور سرکاری تصدیقی خدمات تک فوری رسائی' : 'Direct access to fleet management tools and official Punjab verification portals.'}
                </p>
              </div>
              <button
                onClick={() => setShowQuickOpsModal(false)}
                className="p-3 bg-[#f0f0e4] hover:bg-[#5a5a40] hover:text-white rounded-full text-[#5a5a40] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Quick Operations Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              {/* Safar Diary (Shifted to Quick Operations as requested) */}
              <button
                type="button"
                onClick={() => {
                  setShowQuickOpsModal(false);
                  openModalWithHistory(setShowSafarDiaryModal);
                }}
                className="p-5 rounded-3xl bg-amber-500/10 border border-amber-300/80 hover:border-amber-500 hover:bg-amber-500/20 transition-all cursor-pointer group flex flex-col items-center justify-center text-center gap-2.5 shadow-2xs active:scale-95"
              >
                <div className="p-3 bg-white rounded-2xl border border-amber-300 group-hover:border-amber-500 shadow-2xs shrink-0 text-amber-800">
                  <BookOpen className="w-6 h-6 text-amber-700" />
                </div>
                <span className="font-serif font-bold text-xs text-amber-950 group-hover:text-amber-800 transition-colors">
                  {lang === 'ur' ? 'سفر ڈائری لاگز' : 'Safar Diary'}
                </span>
              </button>

              {/* Map & Live Route Weather */}
              <button
                type="button"
                onClick={() => {
                  setShowQuickOpsModal(false);
                  onNavigate('map');
                }}
                className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-300/80 hover:border-emerald-500 hover:bg-emerald-500/20 transition-all cursor-pointer group flex flex-col items-center justify-center text-center gap-2.5 shadow-2xs active:scale-95"
              >
                <div className="p-3 bg-white rounded-2xl border border-emerald-300 group-hover:border-emerald-500 shadow-2xs shrink-0 text-emerald-800">
                  <MapPin className="w-6 h-6 text-emerald-700" />
                </div>
                <span className="font-serif font-bold text-xs text-emerald-950 group-hover:text-emerald-800 transition-colors">
                  {lang === 'ur' ? 'نقشہ و روٹ موسم' : 'Route & Weather Map'}
                </span>
              </button>

              {/* Vehicles */}
              <button
                type="button"
                onClick={() => {
                  setShowQuickOpsModal(false);
                  onNavigate('vehicle');
                }}
                className="p-5 rounded-3xl bg-[#fdfbf7] border border-[#ecece0] hover:border-[#8b9d77] hover:bg-[#8b9d77]/10 transition-all cursor-pointer group flex flex-col items-center justify-center text-center gap-2.5 shadow-2xs active:scale-95"
              >
                <div className="p-3 bg-white rounded-2xl border border-[#ecece0] group-hover:border-[#8b9d77] shadow-2xs shrink-0">
                  <Truck className="w-6 h-6 text-[#8b9d77]" />
                </div>
                <span className="font-serif font-bold text-xs text-[#4a4a35] group-hover:text-[#8b9d77] transition-colors">
                  {lang === 'ur' ? 'گاڑیاں اور فلیٹ' : 'Vehicles Fleet'}
                </span>
              </button>

              {/* Drivers */}
              <a
                href="#drivers"
                onClick={(e) => {
                  e.preventDefault();
                  setShowQuickOpsModal(false);
                  onNavigate('drivers');
                }}
                title={lang === 'ur' ? 'ڈرائیورز ڈائریکٹری' : 'Drivers List'}
                className="p-5 rounded-3xl bg-[#fdfbf7] border border-[#ecece0] hover:border-[#8b9d77] hover:bg-[#8b9d77]/10 transition-all cursor-pointer group flex flex-col items-center justify-center text-center gap-2.5 shadow-2xs active:scale-95 no-underline"
              >
                <div className="p-3 bg-white rounded-2xl border border-[#ecece0] group-hover:border-[#8b9d77] shadow-2xs shrink-0">
                  <Users className="w-6 h-6 text-[#8b9d77]" />
                </div>
                <span className="font-serif font-bold text-xs text-[#4a4a35] group-hover:text-[#8b9d77] transition-colors">
                  {lang === 'ur' ? 'ڈرائیورز ڈائریکٹری' : 'Drivers List'}
                </span>
              </a>

              {/* Routes & Tolls */}
              <a
                href="#routes"
                onClick={(e) => {
                  e.preventDefault();
                  setShowQuickOpsModal(false);
                  onNavigate('routes');
                }}
                title={lang === 'ur' ? 'روٹس اور ٹول ٹیکس' : 'Routes & Tolls'}
                className="p-5 rounded-3xl bg-[#fdfbf7] border border-[#ecece0] hover:border-[#8b9d77] hover:bg-[#8b9d77]/10 transition-all cursor-pointer group flex flex-col items-center justify-center text-center gap-2.5 shadow-2xs active:scale-95 no-underline"
              >
                <div className="p-3 bg-white rounded-2xl border border-[#ecece0] group-hover:border-[#8b9d77] shadow-2xs shrink-0">
                  <Compass className="w-6 h-6 text-[#8b9d77]" />
                </div>
                <span className="font-serif font-bold text-xs text-[#4a4a35] group-hover:text-[#8b9d77] transition-colors">
                  {lang === 'ur' ? 'روٹس اور ٹول ٹیکس' : 'Routes & Tolls'}
                </span>
              </a>

              {/* Fuel Log */}
              <a
                href="#fuel"
                onClick={(e) => {
                  e.preventDefault();
                  setShowQuickOpsModal(false);
                  onNavigate('fuel');
                }}
                title={lang === 'ur' ? 'فیول لاگ ریکارڈ' : 'Fuel Consumption'}
                className="p-5 rounded-3xl bg-[#fdfbf7] border border-[#ecece0] hover:border-[#8b9d77] hover:bg-[#8b9d77]/10 transition-all cursor-pointer group flex flex-col items-center justify-center text-center gap-2.5 shadow-2xs active:scale-95 no-underline"
              >
                <div className="p-3 bg-white rounded-2xl border border-[#ecece0] group-hover:border-[#8b9d77] shadow-2xs shrink-0">
                  <Fuel className="w-6 h-6 text-[#8b9d77]" />
                </div>
                <span className="font-serif font-bold text-xs text-[#4a4a35] group-hover:text-[#8b9d77] transition-colors">
                  {lang === 'ur' ? 'فیول لاگ ریکارڈ' : 'Fuel Consumption'}
                </span>
              </a>

              {/* Verification Portals */}
              <a
                href="#verify"
                onClick={(e) => {
                  e.preventDefault();
                  setShowQuickOpsModal(false);
                  onNavigate('verify');
                }}
                title={lang === 'ur' ? 'سرکاری تصدیق' : 'Gov Verification'}
                className="p-5 rounded-3xl bg-[#fdfbf7] border border-[#ecece0] hover:border-[#8b9d77] hover:bg-[#8b9d77]/10 transition-all cursor-pointer group flex flex-col items-center justify-center text-center gap-2.5 shadow-2xs active:scale-95 no-underline"
              >
                <div className="p-3 bg-white rounded-2xl border border-[#ecece0] group-hover:border-[#8b9d77] shadow-2xs shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#8b9d77]" />
                </div>
                <span className="font-serif font-bold text-xs text-[#4a4a35] group-hover:text-[#8b9d77] transition-colors">
                  {lang === 'ur' ? 'سرکاری تصدیق' : 'Gov Verification'}
                </span>
              </a>

              {/* Bilty Generator (ONLY visible IF authorized) */}
              {isBiltyAuthorized && (
                <a
                  href="#bilty"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowQuickOpsModal(false);
                    onNavigate('bilty');
                  }}
                  title={lang === 'ur' ? 'بلٹی جنریٹر' : 'Bilty Generator'}
                  className="p-5 rounded-3xl bg-amber-500/10 border border-amber-300 hover:border-amber-500 hover:bg-amber-500/20 transition-all cursor-pointer group flex flex-col items-center justify-center text-center gap-2.5 shadow-2xs active:scale-95 no-underline"
                >
                  <div className="p-3 bg-white rounded-2xl border border-amber-300 group-hover:border-amber-500 shadow-2xs shrink-0 text-amber-700">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <span className="font-serif font-bold text-xs text-amber-950 group-hover:text-amber-800 transition-colors">
                    {lang === 'ur' ? 'بلٹی جنریٹر' : 'Bilty Generator'}
                  </span>
                </a>
              )}

            </div>

            {/* Modal Footer Close Button */}
            <div className="text-center pt-2 border-t border-[#ecece0]">
              <button
                type="button"
                onClick={() => setShowQuickOpsModal(false)}
                className="px-6 py-2.5 rounded-full bg-[#4a4a35] text-white font-serif font-bold text-xs hover:bg-[#383827] transition-all cursor-pointer shadow-sm"
              >
                {lang === 'ur' ? 'پورٹل بند کریں' : 'Close Quick Operations'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Motorway & Highway Toll Calculator Modal */}
      <TollCalculatorModal
        isOpen={showTollCalculatorModal}
        onClose={() => setShowTollCalculatorModal(false)}
        lang={lang}
        onApplyToTrip={(tollAmount, fromCity, toCity) => {
          try {
            localStorage.setItem('ah-prefill-toll-calc', JSON.stringify({ tollAmount, fromCity, toCity }));
          } catch (e) {}
          onNavigate('calculator');
        }}
      />

    </div>
  );
};
