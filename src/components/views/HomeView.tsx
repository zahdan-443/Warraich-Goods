import React, { useState, useEffect, useMemo } from 'react';
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
  Wrench,
  Menu,
  Receipt,
  Copy,
  Check,
  Milestone,
  Crown,
  Compass,
  Eye,
  EyeOff,
  ExternalLink,
  Clock,
  AlertCircle,
  ShieldAlert,
  Camera,
  Info
} from 'lucide-react';
import { HomeWeatherFuelCard } from '../HomeWeatherFuelCard';
import { TermsModal } from '../TermsModal';
import { PrivacyPolicyModal } from '../PrivacyPolicyModal';
import { TollCalculatorModal } from '../TollCalculatorModal';
import { checkExpiringDocuments, processExpiryNotifications, ExpiringDocumentItem } from '../../utils/documentExpiry';

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
  biltyIconData,
  dashcamIconData,
  ledgerIconData
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
  onNavigate: (tab: ActiveTab, subSection?: string) => void;
  onOpenMenu?: () => void;
  onOpenSignIn?: () => void;
  onOpenBiltyAccess?: () => void;
  onSaveTrip?: (tripObj: Omit<Trip, 'id' | 'name'>, tripName: string) => void;
  onLogFuelPrice?: (diesel?: number, petrol?: number, cng?: number) => void;
}

const QuickActionButton: React.FC<{
  onClick: () => void;
  imgSrc: string;
  fallbackIcon?: React.ReactNode;
  fullName: string;
  highlight?: boolean;
  href?: string;
  external?: boolean;
}> = ({ 
  onClick, 
  imgSrc, 
  fullName, 
  highlight, 
  href, 
  external, 
  fallbackIcon 
}) => {
  const commonClasses = `w-full aspect-square bg-white border-2 ${
    highlight ? 'border-[#8b9d77]/70 shadow-sm' : 'border-[#e4e1cf] shadow-2xs'
  } hover:border-[#8b9d77] hover:shadow-md hover:scale-[1.015] active:scale-[0.96] transition-all duration-200 cursor-pointer rounded-2xl sm:rounded-3xl p-1 sm:p-1.5 overflow-hidden flex items-center justify-center group no-underline select-none relative`;

  const innerContent = (
    <div className="w-full h-full bg-[#fdfbf7] flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl">
      <PublicImage
        fileName={imgSrc}
        fallbackIcon={fallbackIcon}
        alt={fullName}
        width={400}
        height={400}
        fitMode="contain"
        className="w-full h-full"
        imgClassName="w-full h-full object-contain rounded-xl sm:rounded-2xl transition-transform duration-200 group-hover:scale-[1.02]"
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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showHomePrivacyModal, setShowHomePrivacyModal] = useState(false);
  const [showSafarDiaryModal, setShowSafarDiaryModal] = useState(false);
  const [showTollCalculatorModal, setShowTollCalculatorModal] = useState(false);

  // Owner Panel Dismissed State
  const [isOwnerPanelDismissed, setIsOwnerPanelDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hide_owner_panel_banner') === 'true';
    } catch {
      return false;
    }
  });

  const toggleOwnerBanner = (dismiss: boolean) => {
    setIsOwnerPanelDismissed(dismiss);
    try {
      localStorage.setItem('hide_owner_panel_banner', dismiss ? 'true' : 'false');
    } catch {
      // ignore
    }
  };

  const totalBiltyCount = bilties.length;
  const totalBiltyFreight = bilties.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
  const totalBiltyPayable = bilties.reduce((sum, b) => sum + (Number(b.payable) || 0), 0);

  // Document Expiry Tracking (Feature A)
  const expiringDocs = useMemo(() => {
    return checkExpiringDocuments(vehicles, drivers);
  }, [vehicles, drivers]);

  const [isExpiryBannerDismissed, setIsExpiryBannerDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('dismiss_expiry_banner') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (expiringDocs.length > 0) {
      processExpiryNotifications(expiringDocs, lang);
    }
  }, [expiringDocs, lang]);

  const currentDate = (() => {
    try {
      return new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'ur-PK', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      });
    } catch {
      try {
        return new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
        });
      } catch {
        return new Date().toDateString();
      }
    }
  })();

  useEffect(() => {
    const handleBack = (e: Event) => {
      if (showTollCalculatorModal) {
        setShowTollCalculatorModal(false);
        e.preventDefault();
      } else if (showSafarDiaryModal) {
        setShowSafarDiaryModal(false);
        e.preventDefault();
      } else if (showRecentLogs) {
        setShowRecentLogs(false);
        e.preventDefault();
      }
    };
    window.addEventListener('app-back-button', handleBack);
    return () => window.removeEventListener('app-back-button', handleBack);
  }, [showTollCalculatorModal, showSafarDiaryModal, showRecentLogs]);

  const openModalWithHistory = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    window.history.pushState({ modal: true }, '');
    setter(true);
  };



  return (
    <div className="flex-1 flex flex-col gap-3.5 sm:gap-5 px-3 sm:px-6 py-2.5 sm:py-4 max-w-4xl mx-auto w-full">
      {/* Primary Semantic H1 Heading for SEO & Screen Readers */}
      <h1 className="sr-only">
        {lang === 'ur' 
          ? 'ڈرائیور دوست - روڈ فریٹ، سفر اخراجات کیلکولیٹر اور گاڑی حساب' 
          : 'Driver Dost - Road Freight, Trip Cost Calculator & Fleet Management'}
      </h1>
      
      {/* Main Single Stream Content (Ergonomic Mobile App Layout) */}
      <div className="flex flex-col gap-5 sm:gap-6 w-full">
        
        {/* Authenticated App Owner Control Panel Quick Link */}
        {(userEmail?.toLowerCase() === 'warraichgoods43@gmail.com') && onOpenBiltyAccess && (
          isOwnerPanelDismissed ? (
            /* Minimalist Hidden State - Keeps Home View Clean and Uncluttered */
            <div className="px-4 py-2.5 rounded-2xl bg-amber-50/70 border border-amber-300/80 shadow-2xs flex items-center justify-between text-xs text-amber-950 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-600" />
                <span className="font-bold font-serif">{lang === 'ur' ? 'آنر کنٹرول پینل (مخفی)' : 'Fleet Owner Panel (Minimized)'}</span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold border border-amber-300">
                  {totalBiltyCount} {lang === 'ur' ? 'بلٹیاں' : 'Bilties'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleOwnerBanner(false)}
                  className="px-2.5 py-1 bg-amber-200/80 hover:bg-amber-300 rounded-lg font-bold text-xs text-amber-900 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>{lang === 'ur' ? 'پینل دکھائیں' : 'Show Panel'}</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenBiltyAccess}
                  className="px-3 py-1 bg-[#b58b28] hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition-all cursor-pointer"
                >
                  {lang === 'ur' ? 'کھولیں' : 'Open'}
                </button>
              </div>
            </div>
          ) : (
            /* High-Utility Executive Command Center */
            <div className="p-4 sm:p-5 rounded-[28px] bg-gradient-to-br from-amber-500/15 via-[#fdfbf7] to-amber-500/10 dark:from-[#2a220d] dark:via-[#1c190f] dark:to-[#12130e] border-2 border-amber-400/80 dark:border-amber-600/50 shadow-xs space-y-3.5 text-xs animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-amber-500 to-[#b58b28] rounded-2xl text-white shrink-0 shadow-xs">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-amber-950 dark:text-amber-100 font-serif text-sm flex items-center gap-2">
                      <span>{lang === 'ur' ? 'وارائچ گڈز آنر کمانڈ سینٹر' : 'Warraich Goods Master Center'}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 font-bold border border-amber-300 dark:border-amber-600">
                        Master Admin
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-sans mt-0.5">
                      {lang === 'ur' 
                        ? 'بلٹی انتظام، ایکسل ایکسپورٹ، مکمل کلاؤڈ بیک اپ و مالیاتی کنٹرول' 
                        : 'Bilty management, Excel export, cloud backup & financial control'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => toggleOwnerBanner(true)}
                    title={lang === 'ur' ? 'ہوم اسکرین سے پینل چھپائیں' : 'Hide panel from home'}
                    className="p-1.5 text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 hover:bg-amber-200/60 dark:hover:bg-amber-900/40 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>{lang === 'ur' ? 'چھپائیں' : 'Hide'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenBiltyAccess}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-[#b58b28] hover:from-amber-600 hover:to-[#96721f] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-200" />
                    <span>{lang === 'ur' ? 'آنر سیٹنگز پینل' : 'Owner Settings'}</span>
                  </button>
                </div>
              </div>

              {/* Real-time Bilty & Business KPI Summary */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-amber-300/60 dark:border-amber-700/60">
                <div className="p-2.5 bg-white/95 dark:bg-[#1a1c22] rounded-2xl border border-amber-200 dark:border-amber-600/60 text-center shadow-2xs">
                  <div className="text-xs text-amber-900 dark:text-amber-300 font-bold">
                    {lang === 'ur' ? 'کل بلٹیاں' : 'Total Bilties'}
                  </div>
                  <div className="text-base font-bold font-mono text-amber-950 dark:text-[#f8fafc] mt-0.5">
                    {totalBiltyCount}
                  </div>
                </div>

                <div className="p-2.5 bg-white/95 dark:bg-[#1a1c22] rounded-2xl border border-emerald-200 dark:border-emerald-600/60 text-center shadow-2xs">
                  <div className="text-xs text-emerald-900 dark:text-emerald-300 font-bold">
                    {lang === 'ur' ? 'کل فریٹ حجم' : 'Total Freight'}
                  </div>
                  <div className="text-xs sm:text-sm font-bold font-mono text-emerald-950 dark:text-[#f8fafc] mt-0.5 truncate">
                    Rs. {totalBiltyFreight.toLocaleString()}
                  </div>
                </div>

                <div className="p-2.5 bg-white/95 dark:bg-[#1a1c22] rounded-2xl border border-rose-200 dark:border-rose-600/60 text-center shadow-2xs">
                  <div className="text-xs text-rose-900 dark:text-rose-300 font-bold">
                    {lang === 'ur' ? 'بقایا وصولی' : 'Pending'}
                  </div>
                  <div className="text-xs sm:text-sm font-bold font-mono text-rose-950 dark:text-[#f8fafc] mt-0.5 truncate">
                    Rs. {totalBiltyPayable.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Quick Navigation Shortcuts */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('bilty', 'create')}
                  className="flex-1 py-2 px-3 bg-white dark:bg-[#252216] hover:bg-amber-50/80 dark:hover:bg-[#332e1d] border border-amber-300 dark:border-amber-700/70 rounded-xl font-bold text-xs text-amber-950 dark:text-amber-100 text-center transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span>{lang === 'ur' ? 'نئی بلٹی بنائیں' : 'Create Bilty'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('bilty', 'ledger')}
                  className="flex-1 py-2 px-3 bg-white dark:bg-[#252216] hover:bg-amber-50/80 dark:hover:bg-[#332e1d] border border-amber-300 dark:border-amber-700/70 rounded-xl font-bold text-xs text-amber-950 dark:text-amber-100 text-center transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>{lang === 'ur' ? 'تمام بلٹیاں دیکھیں' : 'View All Bilties'}</span>
                </button>
              </div>
            </div>
          )
        )}

        {/* Documents Expiring Soon Reminder Section (Feature A) */}
        {expiringDocs.length > 0 && !isExpiryBannerDismissed && (
          <div className="bg-white p-5 sm:p-6 rounded-[32px] sm:rounded-[36px] shadow-sm border border-[#ecece0] space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ecece0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif font-bold text-base sm:text-lg text-[#4a4a35]">
                      {lang === 'ur' ? 'دستاویزات کی میعاد جلد ختم ہو رہی ہے' : 'Documents Expiring Soon'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-rose-600 text-white shadow-2xs">
                      {expiringDocs.length} {lang === 'ur' ? 'نوٹس' : 'alerts'}
                    </span>
                  </div>
                  <p className="text-xs text-[#8e8e75] mt-0.5">
                    {lang === 'ur'
                      ? 'اگلے 30 دنوں میں قابلِ تجدید رجسٹریشن (RC)، روٹ پرمٹ، فٹنس اور ڈرائیور لائسنس'
                      : 'Vehicle RC, Route Permit, Fitness & Driving Licenses due for renewal within 30 days'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsExpiryBannerDismissed(true);
                    try {
                      sessionStorage.setItem('dismiss_expiry_banner', 'true');
                    } catch {}
                  }}
                  className="px-2.5 py-1 text-xs text-[#8e8e75] hover:text-[#4a4a35] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  title={lang === 'ur' ? 'چھپائیں' : 'Dismiss'}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{lang === 'ur' ? 'چھپائیں' : 'Dismiss'}</span>
                </button>
              </div>
            </div>

            {/* List of Expiring Document Cards (Sorted Most-Urgent-First) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {expiringDocs.map((item) => {
                const isCritical = item.urgency === 'critical'; // under 7 days or already expired
                const isWarningUrgent = item.urgency === 'warning-urgent'; // 8-14 days
                
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-2xs ${
                      isCritical
                        ? 'bg-rose-50/90 border-2 border-rose-500 ring-1 ring-rose-300'
                        : isWarningUrgent
                        ? 'bg-orange-50/80 border-2 border-orange-400'
                        : 'bg-amber-50/70 border border-amber-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                          isCritical ? 'bg-rose-600 text-white animate-pulse' : isWarningUrgent ? 'bg-orange-600 text-white' : 'bg-amber-600 text-white'
                        }`}>
                          {item.type === 'driver_license' ? (
                            <Users className="w-4 h-4" />
                          ) : (
                            <Truck className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-xs uppercase px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-900 shadow-2xs">
                              {item.identifier}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {lang === 'ur' ? item.docNameUr : item.docNameEn}
                            </span>
                          </div>
                          {item.subIdentifier && (
                            <p className="text-xs text-slate-600 mt-0.5 font-medium">
                              {item.subIdentifier}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Expiry Emergency Badge */}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 font-sans shadow-2xs ${
                        isCritical
                          ? 'bg-rose-600 text-white ring-2 ring-rose-200'
                          : isWarningUrgent
                          ? 'bg-orange-600 text-white'
                          : 'bg-amber-700 text-white'
                      }`}>
                        {item.isExpired
                          ? (lang === 'ur' ? '🚨 میعاد ختم (EXPIRED)' : '🚨 EXPIRED')
                          : (lang === 'ur' ? `⚠️ ${item.daysLeft} دن باقی` : `⚠️ ${item.daysLeft} days left`)}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700 pt-2.5 border-t border-slate-200">
                      <div className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{lang === 'ur' ? 'آخری تاریخ:' : 'Due Date:'} <b>{item.expiryDateStr}</b></span>
                      </div>

                      {/* Direct Links to Government Portals & In-App Audit */}
                      <div className="flex items-center gap-2">
                        <a
                          href={item.portalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs no-underline active:scale-95 ${
                            isCritical
                              ? 'bg-rose-700 hover:bg-rose-800 text-white'
                              : isWarningUrgent
                              ? 'bg-orange-700 hover:bg-orange-800 text-white'
                              : 'bg-amber-800 hover:bg-amber-900 text-white'
                          }`}
                          title={lang === 'ur' ? 'آفیشل سرکاری پورٹل پر جائیں' : 'Open Official Govt Portal'}
                        >
                          <span>{item.portalType === 'mtmis' ? 'آفیشل MTMIS ↗' : 'آفیشل DLIMS ↗'}</span>
                          <ExternalLink className="w-3 h-3 text-white/90" />
                        </a>

                        <button
                          type="button"
                          onClick={() => onNavigate('verify', item.inAppSubSection)}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer shadow-2xs active:scale-95"
                        >
                          {lang === 'ur' ? 'ان-ایپ آڈٹ' : 'Audit'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FULL DISPLAY APP LAUNCHER: 10 Core Transport Icon Image Buttons (2 Columns x 5 Rows, Single-Tap, Full Screen Grid) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 w-full">
          {/* 1. Trip Expense Calculator */}
          <QuickActionButton
            href="#calculator"
            onClick={() => onNavigate('calculator')}
            imgSrc={tripIconData}
            fallbackIcon={<Calculator className="w-12 h-12 text-[#8b9d77]" />}
            fullName={lang === 'ur' ? 'سفر اخراجات کیلکولیٹر' : 'Trip Expense Calculator'}
            highlight={true}
          />

          {/* 2. Financial Ledger (حساب کتاب) */}
          <QuickActionButton
            href="#ledger"
            onClick={() => onNavigate('ledger')}
            imgSrc={ledgerIconData}
            fallbackIcon={<BookOpen className="w-12 h-12 text-[#8b9d77]" />}
            fullName={lang === 'ur' ? 'حساب کتاب (لیجر)' : 'Financial Ledger (Khata)'}
            highlight={true}
          />

          {/* 3. Vehicle Account / Khata */}
          <QuickActionButton
            href="#vehicleAccount"
            onClick={() => onNavigate('vehicleAccount')}
            imgSrc={gariHisaabIconData}
            fallbackIcon={<Calculator className="w-12 h-12 text-[#8b9d77]" />}
            fullName={lang === 'ur' ? 'گاڑی کا حساب' : 'Vehicle Account'}
            highlight={true}
          />

          {/* 4. Motorway Toll Tax Calculator */}
          <QuickActionButton
            href="#toll"
            onClick={() => onNavigate('toll')}
            imgSrc={tollIconData}
            fallbackIcon={<Milestone className="w-12 h-12 text-[#8b9d77]" />}
            fullName={lang === 'ur' ? 'موٹروے ٹول ٹیکس' : 'Motorway Toll Tax'}
            highlight={true}
          />

          {/* 5. Map & Route Weather */}
          <QuickActionButton
            href="#map"
            onClick={() => onNavigate('map')}
            imgSrc={mapIconData}
            fallbackIcon={<MapPin className="w-12 h-12 text-[#8b9d77]" />}
            fullName={lang === 'ur' ? 'نقشہ و روٹ موسم' : 'Map & Route Weather'}
            highlight={true}
          />

          {/* 6. Dashcam Video Recorder */}
          <QuickActionButton
            href="#dashcam"
            onClick={() => onNavigate('dashcam')}
            imgSrc={dashcamIconData}
            fallbackIcon={<Camera className="w-12 h-12 text-[#8b9d77]" />}
            fullName={lang === 'ur' ? 'ڈیش کیم ریکارڈر' : 'Dashcam Recorder'}
            highlight={true}
          />


          {/* 8. Vehicles Verification */}
          <QuickActionButton
            href="#verify"
            onClick={() => onNavigate('verify', 'vehicle')}
            imgSrc={vehicleIconData}
            fallbackIcon={<Truck className="w-12 h-12 text-[#8b9d77]" />}
            fullName={lang === 'ur' ? 'گاڑیوں کی تصدیق' : 'Vehicles Verification'}
          />

          {/* 9. License Verification */}
          <QuickActionButton
            href="#verify"
            onClick={() => onNavigate('verify', 'license')}
            imgSrc={licenseIconData}
            fallbackIcon={<ShieldCheck className="w-12 h-12 text-[#8b9d77]" />}
            fullName={lang === 'ur' ? 'لائسنس کی تصدیق' : 'License Verification'}
          />

          {/* 10. E-Challan Check */}
          <QuickActionButton
            href="#verify"
            onClick={() => onNavigate('verify', 'challan')}
            imgSrc={echallanIconData}
            fallbackIcon={<AlertTriangle className="w-12 h-12 text-[#8b9d77]" />}
            fullName={lang === 'ur' ? 'ای چالان چیکنگ' : 'E-Challan Checking'}
          />
        </div>

        {/* Official Government Disclaimer (Google Play & Palm Store Government Apps Policy Compliance) */}
        <div className="px-1 py-0.5 flex items-start gap-2 text-[10.5px] text-[#8e8e75] leading-relaxed">
          <Info className="w-3.5 h-3.5 text-[#8b9d77] shrink-0 mt-0.5" />
          <span>
            {lang === 'ur'
              ? 'قانونی آگاہی: ڈرائیور دوست نجی ٹرانسپورٹ فلیٹ سسٹم ہے اور حکومتِ پاکستان یا کسی صوبائی ادارے سے الحاق نہیں رکھتا۔ تمام بیرونی لنکس متعلقہ سرکاری اداروں (MTMIS, DLIMS, PSCA) کے آفیشل پورٹلز ہیں۔'
              : 'Notice: Driver Dost is an independent fleet management utility and does not represent any government entity. All external links point to public official government portals.'}
          </span>
        </div>

          {/* Bilty Form & Ledger (ONLY visible when authenticated owner) */}
          {isBiltyAuthorized && (
            <div className="pt-2 border-t border-[#ecece0] flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <img
                  src="./bilty-official-icon.png"
                  alt="Official Bilty Seal"
                  className="w-7 h-7 rounded-lg object-contain border border-amber-400/40 p-0.5 bg-white shadow-2xs"
                />
                <div>
                  <span className="text-xs font-bold text-[#4a4a35] block">
                    {lang === 'ur' ? 'آفیشل بلٹی لیجر (آنر پینل):' : 'Official Bilty & Ledger (Owner):'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {lang === 'ur'
                      ? `${bilties.length} بلٹیاں محفوظ ہیں`
                      : `${bilties.length} Bilties in Ledger`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('bilty')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#b58b28] hover:from-amber-600 hover:to-[#96721f] text-white font-serif font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>{lang === 'ur' ? 'تمام بلٹیاں کھولیں' : 'View All Bilties'}</span>
              </button>
            </div>
          )}

        {/* Merged Date, Live Weather & Pakistan POL Rates Monitor (Minimalist & Beautiful) */}
        <HomeWeatherFuelCard lang={lang} onApplyRates={onLogFuelPrice ? (diesel, petrol, cng) => { onLogFuelPrice(typeof diesel === 'number' ? diesel : (diesel ? Number(diesel) : undefined), typeof petrol === 'number' ? petrol : (petrol ? Number(petrol) : undefined), typeof cng === 'number' ? cng : (cng ? Number(cng) : undefined)); } : undefined} onOpenTerms={() => setShowTermsModal(true)} onOpenPrivacy={() => setShowHomePrivacyModal(true)} />

      </div>

      {/* Safar Diary Modal */}
      {showSafarDiaryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div 
            dir={lang === 'ur' ? 'rtl' : 'ltr'}
            className={`bg-white rounded-[40px] max-w-4xl w-full p-6 md:p-10 shadow-2xl border border-[#ecece0] max-h-[90vh] overflow-y-auto space-y-8 ${lang === 'ur' ? 'text-right' : 'text-left'}`}
          >
            
            {/* Modal Header */}
            <header className="flex justify-between items-start border-b border-[#ecece0] pb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#8b9d77]/15 text-[#5a5a40] uppercase tracking-wider mb-2">
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
                <div className="text-xs uppercase tracking-tighter text-[#8e8e75] mb-1 font-sans font-semibold">
                  {t.stats.trips}
                </div>
                <div className="text-2xl font-serif font-bold text-[#5a5a40]">{trips.length}</div>
              </div>
              
              <div className="p-4 bg-[#f9f9f2] rounded-2xl border border-[#ecece0]/50 text-center transition-all hover:border-[#8b9d77]">
                <div className="text-xs uppercase tracking-tighter text-[#8e8e75] mb-1 font-sans font-semibold">
                  {t.stats.vehicles}
                </div>
                <div className="text-2xl font-serif font-bold text-[#5a5a40]">{vehicles.length}</div>
              </div>

              <div className="p-4 bg-[#f9f9f2] rounded-2xl border border-[#ecece0]/50 text-center transition-all hover:border-[#8b9d77]">
                <div className="text-xs uppercase tracking-tighter text-[#8e8e75] mb-1 font-sans font-semibold">
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
                          <p className="text-xs text-[#8e8e75] mt-0.5 font-sans">
                            {trip.fuelType} · {trip.dist} km · {trip.consumed} L
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-serif font-bold text-base text-[#5a5a40]">
                            PKR {(trip.total || 0).toLocaleString()}
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


      {/* Terms and Privacy Modals for Store Policy Compliance */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        lang={lang}
      />
      <PrivacyPolicyModal
        isOpen={showHomePrivacyModal}
        onClose={() => setShowHomePrivacyModal(false)}
        lang={lang}
      />
    </div>
  );
};
