import React, { useState, useEffect, useMemo } from 'react';
import { ActiveTab, BiltyRecord, BranchConfig, BranchPermissions, CompanyProfile, DICTIONARY, Driver, Language, Trip, UserBranchAccess, UserRole, Vehicle } from '../../types';
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
  Info,
  RefreshCw,
  Building2,
  Briefcase,
  Download
} from 'lucide-react';
import { HomeWeatherFuelCard } from '../HomeWeatherFuelCard';
import { TermsModal } from '../TermsModal';
import { PrivacyPolicyModal } from '../PrivacyPolicyModal';
import { TollCalculatorModal } from '../TollCalculatorModal';
import { checkExpiringDocuments, processExpiryNotifications, ExpiringDocumentItem } from '../../utils/documentExpiry';
import { resolveEffectiveCompanyDetails } from '../../utils/addaBillingStorage';
import { formatSalutationGreeting, isOwnerEmail } from '../../utils/authUtils';
import { PALM_STORE_URL } from '../../utils/externalLinks';

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
  ledgerIconData,
  tripEnIconData,
  ledgerEnIconData,
  vehicleAccountEnIconData,
  tollEnIconData,
  mapEnIconData,
  vehicleCheckEnIconData,
  licenseCheckEnIconData,
  echallanEnIconData
} from '../../assets/dashboardIcons';

interface HomeViewProps {
  lang: Language;
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  bilties?: BiltyRecord[];
  userRole?: UserRole;
  userEmail?: string | null;
  userDisplayName?: string | null;
  userBranchAccess?: UserBranchAccess | null;
  authInitialized?: boolean;
  companyProfile?: CompanyProfile | null;
  isBiltyAuthorized?: boolean;
  onNavigate: (tab: ActiveTab, subSection?: string) => void;
  onOpenMenu?: () => void;
  onOpenSignIn?: () => void;
  onOpenBiltyAccess?: () => void;
  onSaveTrip?: (tripObj: Omit<Trip, 'id' | 'name'>, tripName: string) => void;
  onLogFuelPrice?: (diesel?: number, petrol?: number, cng?: number) => void;
  activeBranch?: BranchConfig | null;
  branches?: BranchConfig[];
  branchPermissions?: BranchPermissions;
  canManageBranchStaff?: boolean;
  onSelectBranch?: (branchId: string) => void;
  onOpenBranchStaffModal?: () => void;
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
  const commonClasses = `w-full aspect-[1.08/1] sm:aspect-square bg-white border-2 ${
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

const EnglishCompactActionButton: React.FC<{
  onClick: () => void;
  imgSrc: string;
  fallbackIcon: React.ReactNode;
  fallbackBgClass: string;
  title: string;
  subtitle: string;
  href?: string;
  highlight?: boolean;
}> = ({
  onClick,
  imgSrc,
  fallbackIcon,
  fallbackBgClass,
  title,
  subtitle,
  href,
  highlight = false,
}) => {
  const cardClasses = `w-full min-h-[118px] sm:min-h-[134px] bg-white dark:bg-[#1a1c22] border ${
    highlight
      ? 'border-[#8b9d77]/55 dark:border-emerald-700/60 shadow-2xs'
      : 'border-[#e4e1cf] dark:border-[#2d313b] shadow-2xs'
  } hover:border-[#8b9d77] dark:hover:border-emerald-500 hover:shadow-sm active:scale-[0.96] transition-all duration-150 cursor-pointer rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-between gap-2 text-center group no-underline select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b9d77]`;

  const innerContent = (
    <>
      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[14px] overflow-hidden shrink-0 shadow-2xs ring-1 ring-[#e4e1cf]/80 dark:ring-[#2d313b] transition-transform duration-150 group-hover:scale-[1.04] ${fallbackBgClass}`}>
        <PublicImage
          fileName={imgSrc}
          alt={title}
          width={128}
          height={128}
          fitMode="cover"
          referrerPolicy="no-referrer"
          className="w-full h-full"
          imgClassName="w-full h-full object-cover rounded-[13px]"
          fallbackIcon={
            <div className={`w-full h-full flex items-center justify-center ${fallbackBgClass}`}>
              {fallbackIcon}
            </div>
          }
        />
      </div>
      <div className="w-full min-w-0">
        <div className="font-serif font-bold text-[12px] sm:text-sm text-[#2b2c20] dark:text-slate-100 leading-tight line-clamp-2 text-balance">
          {title}
        </div>
        <div className="text-[10px] sm:text-[11px] text-[#555644] dark:text-slate-400 leading-tight truncate mt-0.5 font-sans">
          {subtitle}
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        title={`${title} — ${subtitle}`}
        aria-label={`${title}: ${subtitle}`}
        className={cardClasses}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${title} — ${subtitle}`}
      aria-label={`${title}: ${subtitle}`}
      className={cardClasses}
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
  userDisplayName = null,
  userBranchAccess = null,
  authInitialized = true,
  companyProfile = null,
  isBiltyAuthorized = false,
  onNavigate, 
  onOpenMenu,
  onOpenSignIn,
  onOpenBiltyAccess,
  onSaveTrip,
  onLogFuelPrice,
  activeBranch = null,
  branches = [],
  branchPermissions,
  canManageBranchStaff = false,
  onSelectBranch,
  onOpenBranchStaffModal
}) => {
  const t = DICTIONARY[lang];
  const [showRecentLogs, setShowRecentLogs] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showHomePrivacyModal, setShowHomePrivacyModal] = useState(false);
  const [showSafarDiaryModal, setShowSafarDiaryModal] = useState(false);
  const [showTollCalculatorModal, setShowTollCalculatorModal] = useState(false);
  const [copiedSignedInEmail, setCopiedSignedInEmail] = useState(false);


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
        
        {/* Authenticated App Owner / Branch Panel: Simple Buttons Only (No Logo/Images) */}
        {(isBiltyAuthorized || canManageBranchStaff) && (() => {
          const isCreatorUser = isOwnerEmail(userEmail);
          const resolvedCompany = resolveEffectiveCompanyDetails(activeBranch, companyProfile);
          const companyTitle = lang === 'ur' ? resolvedCompany.nameUr : resolvedCompany.nameEn;

          const assignedPersonName = (() => {
            if (!isCreatorUser) {
              const staffAssigned = userBranchAccess?.displayName?.trim();
              if (staffAssigned) return staffAssigned;
              const branchOwnerAssigned = activeBranch?.ownerDisplayName?.trim();
              if (branchOwnerAssigned) return branchOwnerAssigned;
              const prop = userDisplayName?.trim();
              if (prop) return prop;
              return userEmail ? userEmail.split('@')[0] : (lang === 'ur' ? 'صارف' : 'Member');
            }
            if (lang === 'ur') {
              return resolvedCompany.proprietorUr || 'زاہدان نصر وڑائچ';
            }
            return resolvedCompany.proprietorEn || 'Zahdan Nasar Warraich';
          })();

          const canCreateBilty = branchPermissions ? branchPermissions.createBilty : true;

          return (
            <div
              data-testid="home-owner-adda-panel"
              className="rounded-3xl bg-[#0f2942] text-white p-4 sm:p-5 shadow-sm border border-[#1e4068] space-y-3.5 animate-in fade-in"
            >
              {/* Company Name Header + Branch Switcher */}
              <div className="flex flex-wrap items-start justify-between gap-2.5 border-b border-white/15 pb-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <h2 className="text-sm sm:text-base font-black text-amber-300 tracking-wide truncate">
                      {companyTitle}
                    </h2>
                  </div>
                  <p
                    data-testid="home-welcome-note"
                    className="text-xs sm:text-sm font-bold text-white/95"
                  >
                    {formatSalutationGreeting(
                      lang,
                      assignedPersonName,
                      isCreatorUser ? 'Mr' : userBranchAccess?.salutation
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onSelectBranch && branches && branches.length > 1 ? (
                    <select
                      aria-label={lang === 'ur' ? 'برانچ منتخب کریں' : 'Select Active Branch'}
                      value={activeBranch?.id || branches[0]?.id || 'head'}
                      onChange={(e) => onSelectBranch(e.target.value)}
                      className="bg-white/15 hover:bg-white/25 text-white border border-white/25 rounded-xl px-2.5 py-1.5 text-xs font-bold cursor-pointer focus:outline-none"
                    >
                      {branches.map((br) => (
                        <option key={br.id} value={br.id} className="text-slate-900 bg-white">
                          {lang === 'ur' ? br.nameUr : br.nameEn}
                        </option>
                      ))}
                    </select>
                  ) : activeBranch ? (
                    <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-[11px] font-bold text-amber-200">
                      {lang === 'ur' ? activeBranch.nameUr : activeBranch.nameEn}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Strictly 2 Primary Buttons */}
              <div className={`grid gap-2.5 sm:gap-3 ${isBiltyAuthorized && canCreateBilty ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                <button
                  type="button"
                  onClick={() => onNavigate('addaPanel')}
                  className="w-full min-h-[48px] px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <span>{lang === 'ur' ? 'اڈا / اونر پینل' : 'Adda / Owner Panel'}</span>
                </button>

                {isBiltyAuthorized && canCreateBilty && (
                  <button
                    type="button"
                    onClick={() => onNavigate('bilty', 'create')}
                    className="w-full min-h-[48px] px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-95 border border-emerald-400/30"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>{lang === 'ur' ? 'نئی بلٹی بنائیں' : 'Create New Bilty'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Signed-In Without Branch Access Diagnostic Card (Copy Exact Gmail for Owner Assignment) */}
        {authInitialized &&
          Boolean(userEmail) &&
          !isOwnerEmail(userEmail) &&
          !isBiltyAuthorized &&
          !canManageBranchStaff && (() => {
            const signedInEmailStr = String(userEmail || '').trim();
            const isRevoked = userBranchAccess?.status === 'revoked';
            const isBranchPaused = Boolean(userBranchAccess?.status === 'active' && activeBranch?.active === false);

            const handleCopySignedInEmail = async () => {
              if (!signedInEmailStr) return;
              let copied = false;
              try {
                if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                  await navigator.clipboard.writeText(signedInEmailStr);
                  copied = true;
                }
              } catch {}
              if (!copied && typeof document !== 'undefined') {
                try {
                  const ta = document.createElement('textarea');
                  ta.value = signedInEmailStr;
                  ta.setAttribute('readonly', '');
                  ta.style.position = 'fixed';
                  ta.style.opacity = '0';
                  document.body.appendChild(ta);
                  ta.select();
                  copied = document.execCommand('copy');
                  document.body.removeChild(ta);
                } catch {}
              }
              if (copied) {
                setCopiedSignedInEmail(true);
                setTimeout(() => setCopiedSignedInEmail(false), 2500);
              }
            };

            return (
              <div
                data-testid="home-no-access-card"
                className="rounded-3xl bg-white dark:bg-[#1a1c22] border-2 border-amber-300/80 dark:border-amber-700/60 p-4 sm:p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      <h2 className="text-xs sm:text-sm font-black text-[#2b2c20] dark:text-slate-100">
                        {isRevoked
                          ? (lang === 'ur' ? 'برانچ رسائی منسوخ ہے' : 'Branch Access Revoked')
                          : isBranchPaused
                          ? (lang === 'ur' ? 'برانچ عارضی طور پر غیر فعال ہے' : 'Branch Currently Paused')
                          : (lang === 'ur' ? 'گوگل سائن ان مکمل — برانچ رسائی درکار ہے' : 'Signed In — Waiting for Branch Access')}
                      </h2>
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#555644] dark:text-slate-300 leading-relaxed">
                      {lang === 'ur'
                        ? 'رسائی حاصل کرنے کے لیے یہ ای میل اپنے برانچ مالک کو بھیجیں (ڈاٹ اور اسپیلنگ بالکل یہی ہونی چاہیے):'
                        : 'Send this email to your branch owner to request access (dots and spelling must match exactly):'}
                    </p>
                  </div>

                  <button
                    type="button"
                    data-testid="copy-my-email-btn"
                    onClick={() => void handleCopySignedInEmail()}
                    className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 min-h-[40px] ${
                      copiedSignedInEmail
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-[#0f2942] hover:bg-[#1a3a5c] text-white shadow-2xs'
                    }`}
                  >
                    {copiedSignedInEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{lang === 'ur' ? 'ای میل کاپی ہو گیا!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-300" />
                        <span>{lang === 'ur' ? 'میرا ای میل کاپی کریں' : 'Copy my email'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div
                  dir="ltr"
                  data-testid="signed-in-exact-email"
                  className="px-3.5 py-2.5 rounded-2xl bg-[#fdfbf7] dark:bg-slate-900 border border-[#e4e1cf] dark:border-slate-700 font-mono text-xs sm:text-sm font-bold text-[#0f2942] dark:text-amber-300 break-all"
                >
                  {signedInEmailStr}
                </div>
              </div>
            );
          })()}

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
                          ? (lang === 'ur' ? '🚨 میعاد ختم' : '🚨 EXPIRED')
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
                          <span>
                            {lang === 'ur'
                              ? (item.portalType === 'mtmis' ? 'آفیشل MTMIS ↗' : 'آفیشل DLIMS ↗')
                              : (item.portalType === 'mtmis' ? 'Official MTMIS ↗' : 'Official DLIMS ↗')}
                          </span>
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

        {/* FULL DISPLAY APP LAUNCHER: Compact 3-Column Illustrated Badge Grid in English; Preserved 2-Column Image Grid in Urdu */}
        {lang === 'en' ? (
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 w-full">
            <EnglishCompactActionButton
              href="#calculator"
              onClick={() => onNavigate('calculator')}
              imgSrc={tripEnIconData}
              fallbackIcon={<Calculator className="w-6 h-6 text-emerald-700 dark:text-emerald-300" />}
              fallbackBgClass="bg-emerald-50 dark:bg-emerald-950/70"
              title="Trip Cost"
              subtitle="Fuel & expenses"
              highlight={true}
            />

            <EnglishCompactActionButton
              href="#ledger"
              onClick={() => onNavigate('ledger')}
              imgSrc={ledgerEnIconData}
              fallbackIcon={<BookOpen className="w-6 h-6 text-violet-700 dark:text-violet-300" />}
              fallbackBgClass="bg-violet-50 dark:bg-violet-950/70"
              title="Ledger"
              subtitle="Party & cashbook"
              highlight={true}
            />

            <EnglishCompactActionButton
              href="#vehicleAccount"
              onClick={() => onNavigate('vehicleAccount')}
              imgSrc={vehicleAccountEnIconData}
              fallbackIcon={<Receipt className="w-6 h-6 text-teal-700 dark:text-teal-300" />}
              fallbackBgClass="bg-teal-50 dark:bg-teal-950/70"
              title="Vehicle Account"
              subtitle="Income & profit"
              highlight={true}
            />

            <EnglishCompactActionButton
              href="#toll"
              onClick={() => onNavigate('toll')}
              imgSrc={tollEnIconData}
              fallbackIcon={<Milestone className="w-6 h-6 text-orange-700 dark:text-orange-300" />}
              fallbackBgClass="bg-orange-50 dark:bg-orange-950/70"
              title="Toll Tax"
              subtitle="Motorway & NHA"
              highlight={true}
            />

            <EnglishCompactActionButton
              href="#map"
              onClick={() => onNavigate('map')}
              imgSrc={mapEnIconData}
              fallbackIcon={<MapPin className="w-6 h-6 text-sky-700 dark:text-sky-300" />}
              fallbackBgClass="bg-sky-50 dark:bg-sky-950/70"
              title="Route Map"
              subtitle="Live weather"
              highlight={true}
            />

            <EnglishCompactActionButton
              href="#verify"
              onClick={() => onNavigate('verify', 'vehicle')}
              imgSrc={vehicleCheckEnIconData}
              fallbackIcon={<Truck className="w-6 h-6 text-indigo-700 dark:text-indigo-300" />}
              fallbackBgClass="bg-indigo-50 dark:bg-indigo-950/70"
              title="Vehicle Check"
              subtitle="MTMIS ownership"
            />

            <EnglishCompactActionButton
              href="#verify"
              onClick={() => onNavigate('verify', 'license')}
              imgSrc={licenseCheckEnIconData}
              fallbackIcon={<ShieldCheck className="w-6 h-6 text-cyan-700 dark:text-cyan-300" />}
              fallbackBgClass="bg-cyan-50 dark:bg-cyan-950/70"
              title="License Check"
              subtitle="DLIMS status"
            />

            <EnglishCompactActionButton
              href="#verify"
              onClick={() => onNavigate('verify', 'challan')}
              imgSrc={echallanEnIconData}
              fallbackIcon={<AlertTriangle className="w-6 h-6 text-rose-700 dark:text-rose-300" />}
              fallbackBgClass="bg-rose-50 dark:bg-rose-950/70"
              title="E-Challan"
              subtitle="Traffic fines"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:gap-5 w-full">
            {/* 1. Trip Expense Calculator */}
            <QuickActionButton
              href="#calculator"
              onClick={() => onNavigate('calculator')}
              imgSrc={tripIconData}
              fallbackIcon={<Calculator className="w-12 h-12 text-[#8b9d77]" />}
              fullName="سفر اخراجات کیلکولیٹر"
              highlight={true}
            />

            {/* 2. Financial Ledger (حساب کتاب) */}
            <QuickActionButton
              href="#ledger"
              onClick={() => onNavigate('ledger')}
              imgSrc={ledgerIconData}
              fallbackIcon={<BookOpen className="w-12 h-12 text-[#8b9d77]" />}
              fullName="حساب کتاب (لیجر)"
              highlight={true}
            />

            {/* 3. Vehicle Account / Khata */}
            <QuickActionButton
              href="#vehicleAccount"
              onClick={() => onNavigate('vehicleAccount')}
              imgSrc={gariHisaabIconData}
              fallbackIcon={<Calculator className="w-12 h-12 text-[#8b9d77]" />}
              fullName="گاڑی کا حساب"
              highlight={true}
            />

            {/* 4. Motorway Toll Tax Calculator */}
            <QuickActionButton
              href="#toll"
              onClick={() => onNavigate('toll')}
              imgSrc={tollIconData}
              fallbackIcon={<Milestone className="w-12 h-12 text-[#8b9d77]" />}
              fullName="موٹروے ٹول ٹیکس"
              highlight={true}
            />

            {/* 5. Map & Route Weather */}
            <QuickActionButton
              href="#map"
              onClick={() => onNavigate('map')}
              imgSrc={mapIconData}
              fallbackIcon={<MapPin className="w-12 h-12 text-[#8b9d77]" />}
              fullName="نقشہ و روٹ موسم"
              highlight={true}
            />

            {/* 8. Vehicles Verification */}
            <QuickActionButton
              href="#verify"
              onClick={() => onNavigate('verify', 'vehicle')}
              imgSrc={vehicleIconData}
              fallbackIcon={<Truck className="w-12 h-12 text-[#8b9d77]" />}
              fullName="گاڑیوں کی تصدیق"
            />

            {/* 9. License Verification */}
            <QuickActionButton
              href="#verify"
              onClick={() => onNavigate('verify', 'license')}
              imgSrc={licenseIconData}
              fallbackIcon={<ShieldCheck className="w-12 h-12 text-[#8b9d77]" />}
              fullName="لائسنس کی تصدیق"
            />

            {/* 10. E-Challan Check */}
            <QuickActionButton
              href="#verify"
              onClick={() => onNavigate('verify', 'challan')}
              imgSrc={echallanIconData}
              fallbackIcon={<AlertTriangle className="w-12 h-12 text-[#8b9d77]" />}
              fullName="ای چالان چیکنگ"
            />
          </div>
        )}

        {/* Official Government Disclaimer (Google Play & Palm Store Government Apps Policy Compliance) */}
        <div className="px-1 py-0.5 flex items-start gap-2 text-[10.5px] text-[#8e8e75] leading-relaxed">
          <Info className="w-3.5 h-3.5 text-[#8b9d77] shrink-0 mt-0.5" />
          <span>
            {lang === 'ur'
              ? 'قانونی آگاہی: ڈرائیور دوست نجی ٹرانسپورٹ فلیٹ سسٹم ہے اور حکومتِ پاکستان یا کسی صوبائی ادارے سے الحاق نہیں رکھتا۔ تمام بیرونی لنکس متعلقہ سرکاری اداروں (MTMIS, DLIMS, PSCA) کے آفیشل پورٹلز ہیں۔'
              : 'Notice: Driver Dost is an independent fleet management utility and does not represent any government entity. All external links point to public official government portals.'}
          </span>
        </div>



        {/* Merged Date, Live Weather & Pakistan POL Rates Monitor (Minimalist & Beautiful) */}
        <HomeWeatherFuelCard lang={lang} onApplyRates={onLogFuelPrice ? (diesel, petrol, cng) => { onLogFuelPrice(typeof diesel === 'number' ? diesel : (diesel ? Number(diesel) : undefined), typeof petrol === 'number' ? petrol : (petrol ? Number(petrol) : undefined), typeof cng === 'number' ? cng : (cng ? Number(cng) : undefined)); } : undefined} onOpenTerms={() => setShowTermsModal(true)} onOpenPrivacy={() => setShowHomePrivacyModal(true)} />

        {/* Official Palm Store App Download Footer (Visible on Web & Android App) */}
        <footer className="bg-white dark:bg-[#1a1c22] border border-[#ecece0] dark:border-[#2d313b] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
          <div className="space-y-0.5 min-w-0">
            <p className="font-serif font-bold text-sm text-[#4a4a35] dark:text-slate-100">
              {lang === 'ur' ? 'ڈرائیور دوست اینڈرائیڈ ایپ — پام اسٹور' : 'Driver Dost Android App on Palm Store'}
            </p>
            <p className="text-xs text-[#62774f] dark:text-slate-400">
              {lang === 'ur'
                ? 'پام اسٹور پر آفیشل اینڈرائیڈ ورژن حاصل کریں اور دوستوں سے شیئر کریں'
                : 'Get the official Android edition on Palm Store for Pakistan fleet and trip tools'}
            </p>
          </div>
          <a
            href={PALM_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] py-2.5 px-5 rounded-xl bg-[#1e3a68] hover:bg-[#162a4d] text-white font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 shadow-xs transition-all active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a68]"
          >
            <Download className="w-4 h-4 text-[#f3d478] shrink-0" />
            <span>
              {lang === 'ur'
                ? 'پام اسٹور سے ڈرائیور دوست ڈاؤن لوڈ کریں'
                : 'Download Driver Dost on Palm Store'}
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-white/85 shrink-0" />
          </a>
        </footer>

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
                  {lang === 'ur' ? 'سفر ڈائری لاگز' : 'Trip Diary Logs'}
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#4a4a35]">
                  {lang === 'ur' ? 'ڈرائیور دوست سفر ڈائری اور ریکارڈ' : 'Driver Dost Trip Diary'}
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
                {lang === 'ur' ? 'ڈائری بند کریں' : 'Close Trip Diary'}
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
