import React, { useState, useEffect } from 'react';
import { Globe, LogIn, LogOut, Bell, Shield, CheckCheck, X, Crown, Truck, Briefcase, Menu, Palette, Sun, Moon, Monitor, Share2, Phone, MapPin, Mail, Info, Building2, ChevronLeft, ChevronRight, Sparkles, Send, Download } from 'lucide-react';
import { DICTIONARY, Language, AppNotification, UserRole } from '../types';
import { AlHadiLogo } from './AlHadiLogo';
import { logoIconData } from '../assets/dashboardIcons';
import { AboutUsModal } from './AboutUsModal';
import { SyncStatusBadge } from './SyncStatusBadge';
import { ExportPrivacyModal } from './ExportPrivacyModal';
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendSystemNotification, 
  isNotificationSupported 
} from '../utils/notifications';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  userEmail: string | null;
  onSignIn: () => void;
  onSignOut: () => void;
  role: UserRole;
  onSelectRole: (r: UserRole) => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  offlineCount: number;
  isOffline: boolean;
  onToggleOffline: () => void;
  onSyncOffline: () => void;
  isDashboard?: boolean;
  showTopMenuExternal?: boolean;
  onOpenTopMenu?: () => void;
  onCloseTopMenu?: () => void;
  onOpenBiltyAccess?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  userEmail,
  onSignIn,
  onSignOut,
  role,
  onSelectRole,
  notifications,
  onMarkAllRead,
  offlineCount,
  isOffline,
  onToggleOffline,
  onSyncOffline,
  isDashboard = false,
  showTopMenuExternal,
  onOpenTopMenu,
  onCloseTopMenu,
  onOpenBiltyAccess
}) => {
  const t = DICTIONARY[lang];
  const [logoErr, setLogoErr] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showExportPrivacyModal, setShowExportPrivacyModal] = useState(false);
  const [internalShowTopMenu, setInternalShowTopMenu] = useState(false);
  const [themePref, setThemePref] = useState<'light' | 'dark' | 'system' | 'emerald' | 'desert' | 'navy'>('light');
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (isNotificationSupported()) {
      setNotifPerm(getNotificationPermission());
    }
  }, [showNotifs]);

  const handleRequestPushPermission = async () => {
    const res = await requestNotificationPermission();
    setNotifPerm(res);
    if (res === 'granted') {
      sendSystemNotification(
        lang === 'ur' ? 'ڈرائیور دوست الرٹس فعال ہو گئے' : 'Driver Dost Alerts Enabled',
        lang === 'ur' ? 'تمام ٹرانسپورٹ الرٹس اب آپ کے فون کے اسٹیٹس بار پر آئیں گے۔' : 'Transport alerts will now appear in your device status bar.'
      );
    }
  };

  const handleSendTestNotification = async () => {
    setTestSent(true);
    await sendSystemNotification(
      lang === 'ur' ? 'ڈرائیور دوست ٹیسٹ نوٹیفکیشن 🚚' : 'Driver Dost Test Alert 🚚',
      lang === 'ur' ? 'یہ نوٹیفکیشن آپ کے فون کے اسٹیٹس بار اور نوٹیفکیشن پینل پر کامیابی سے موصول ہوا۔' : 'This test notification was delivered to your device status bar & notification shade.'
    );
    setTimeout(() => setTestSent(false), 3000);
  };

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-emerald', 'theme-desert', 'theme-navy');
    if (themePref === 'dark') {
      root.classList.add('dark');
    } else if (themePref === 'emerald') {
      root.classList.add('theme-emerald');
    } else if (themePref === 'desert') {
      root.classList.add('theme-desert');
    } else if (themePref === 'navy') {
      root.classList.add('theme-navy');
    } else if (themePref === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      }
    }
  }, [themePref]);

  const isMenuOpen = showTopMenuExternal !== undefined ? showTopMenuExternal : internalShowTopMenu;
  const handleOpenMenu = () => {
    if (onOpenTopMenu) onOpenTopMenu();
    else setInternalShowTopMenu(true);
  };
  const handleCloseMenu = () => {
    if (onCloseTopMenu) onCloseTopMenu();
    else setInternalShowTopMenu(false);
  };

  const handleShareApp = async () => {
    const shareData = {
      title: 'Driver Dost - Road Freight, Safar & Fleet Manager',
      text: lang === 'ur'
        ? 'ڈرائیور دوست - ٹرپ اخراجات کیلکولیٹر، ٹول ٹیکس، ڈیزل مانیٹر اور فلیٹ مینجمنٹ سسٹم۔'
        : 'Driver Dost - Road Freight, Safar Diary, Toll Calculator & Fleet Management System.',
      url: window.location.origin + window.location.pathname,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert(lang === 'ur' ? 'ایپ کا لنک کاپی ہو گیا ہے!' : 'App link copied to clipboard!');
      } catch {
        alert(shareData.url);
      }
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const isOwnerUser = userEmail?.toLowerCase() === 'warraichgoods43@gmail.com';

  return (
    <>
      {/* CLEAN SINGLE LINE TOP HEADER: Logo, Brand Name & Notification Bell Icon ONLY */}
      <header className="sticky top-0 z-50 bg-[#fdfbf7] border-b border-[#e2e2d5] shadow-2xs transition-all">
        <div className="py-2.5 px-3 sm:px-6 md:px-10 flex items-center justify-between">
          {/* Left: Side Menu Trigger & Brand Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              onClick={handleOpenMenu}
              className="p-2 bg-white border border-[#ecece0] hover:border-[#8b9d77] rounded-xl shadow-2xs text-[#5a5a40] shrink-0 cursor-pointer active:scale-95 transition-all"
              title={lang === 'ur' ? "سیٹنگز اور کنٹرول مینیو کھولیں" : "Click to open System Menu"}
              aria-label={lang === 'ur' ? "سیٹنگز اور کنٹرول مینیو کھولیں" : "Open System Controls Menu"}
            >
              <Menu className="w-5 h-5 text-[#8b9d77]" />
            </button>

            {/* Logo Image */}
            <AlHadiLogo className="w-9 h-9 sm:w-10 sm:h-10" />

            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 leading-tight">
                <span className="text-sm sm:text-base md:text-lg font-serif font-bold tracking-tight text-[#4a4a35] whitespace-nowrap">
                  Driver Dost
                </span>
                <span className="text-gray-300 font-light">|</span>
                <span className="text-xs sm:text-base font-serif font-bold text-[#8b9d77] whitespace-nowrap">
                  ڈرائیور دوست
                </span>
              </div>
            </div>
          </div>

          {/* Right: Notification Bell */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowNotifs(true)}
              className="p-2 rounded-xl bg-white border border-[#ecece0] hover:border-[#8b9d77] text-[#5a5a40] relative cursor-pointer active:scale-95 transition-all shadow-2xs shrink-0"
              title={lang === 'ur' ? 'نوٹیفیکیشنز' : 'Notifications'}
              aria-label={lang === 'ur' ? 'نوٹیفیکیشنز کھولیں' : 'Open Notifications'}
            >
              <Bell className="w-5 h-5 text-[#8b9d77]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Top Left Menu Side Drawer (Triggered by clicking top-left menu icon) */}
      {isMenuOpen && (
        <div onClick={handleCloseMenu} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-start animate-in fade-in duration-200">
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-sm h-full shadow-2xl border-r border-[#ecece0] flex flex-col justify-between animate-in slide-in-from-left duration-300">
            {/* Scrollable Container for Desktop & Mobile */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {/* Drawer Header */}
              <div className="p-5 bg-[#fdfbf7] border-b border-[#ecece0] flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <AlHadiLogo className="w-10 h-10" />
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#4a4a35]">{t.appTitle}</h3>
                    <p className="text-[10px] text-[#8b9d77] font-sans uppercase tracking-wider">{lang === 'ur' ? 'سسٹم کنٹرول مینیو' : 'System Controls Menu'}</p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseMenu} 
                  className="p-2 rounded-full bg-[#f0f0e4] hover:bg-[#e2e2d5] text-[#5a5a40] cursor-pointer"
                  aria-label={lang === 'ur' ? 'مینیو بند کریں' : 'Close System Menu'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Controls Stack */}
              <div className="p-5 space-y-4">

                {/* CLOUD SYNC STATUS SECTION */}
                <div className="p-3.5 rounded-3xl bg-[#fdfbf7] border border-[#ecece0] shadow-2xs flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#4a4a35] font-serif">
                      {lang === 'ur' ? 'کلاؤڈ سنک اسٹیٹس' : 'Cloud Sync Status'}
                    </div>
                    <div className="text-[10px] text-[#8e8e75]">
                      {lang === 'ur' ? 'آن لائن / آف لائن ڈیٹا ہم آہنگی' : 'Online / Offline sync'}
                    </div>
                  </div>
                  <SyncStatusBadge lang={lang} onSyncComplete={onSyncOffline} />
                </div>

                {/* SINGLE UNIFIED LOGIN / ACCOUNT CONTROL CARD */}
                <div className="p-4 rounded-3xl bg-[#fdfbf7] border border-[#ecece0] shadow-2xs">
                  {userEmail ? (
                    <div className="space-y-3 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#1e3a68] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {userEmail.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#4a4a35] max-w-[170px] truncate">{userEmail}</div>
                            {isOwnerUser ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300 mt-0.5">
                                <Crown className="w-3 h-3 text-amber-600" />
                                <span>Owner (Active)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 border border-blue-300 text-[10px] font-bold mt-0.5">
                                <Truck className="w-3 h-3 text-[#3B82F6]" />
                                <span>Authorized User</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {onOpenBiltyAccess && userEmail?.toLowerCase() === 'warraichgoods43@gmail.com' && (
                        <button
                          onClick={() => {
                            handleCloseMenu();
                            onOpenBiltyAccess();
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-[#b58b28] hover:from-amber-600 hover:to-[#96721f] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all border border-amber-300/40"
                        >
                          <Crown className="w-4 h-4 text-amber-100" />
                          <span>{lang === 'ur' ? 'آنر کنٹرول پینل (بلٹی رسائی)' : 'Owner Control Panel'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          handleCloseMenu();
                          onSignOut();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-red-200"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{lang === 'ur' ? 'لاگ آؤٹ کریں' : 'Sign Out Account'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-left">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#8b9d77]" />
                        <span className="text-xs font-bold text-[#4a4a35] font-serif">
                          {lang === 'ur' ? 'گوگل اکاؤنٹ لاگ ان' : 'Google Account Sign In'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8e8e75] leading-relaxed">
                        {lang === 'ur'
                          ? 'اپنے گوگل اکاؤنٹ سے سائن ان کریں اور فلیٹ یا بلٹی سسٹم تک رسائی حاصل کریں۔'
                          : 'Sign in with your Google account to access fleet and transport features.'}
                      </p>
                      <button
                        onClick={() => {
                          handleCloseMenu();
                          onSignIn();
                        }}
                        className="w-full py-2.5 px-3 bg-[#1e3a68] hover:bg-[#162a4d] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                      >
                        <LogIn className="w-3.5 h-3.5 text-[#c59b27]" />
                        <span>{lang === 'ur' ? 'گوگل اکاؤنٹ سے لاگ ان کریں' : 'Sign In with Google'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Language Control */}
                <div className="p-4 rounded-3xl bg-[#fdfbf7] border border-[#ecece0] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-white border border-[#ecece0] shadow-2xs">
                      <Globe className="w-5 h-5 text-[#8b9d77]" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-sm text-[#4a4a35]">{lang === 'ur' ? 'زبان تبدیل کریں' : 'App Language'}</div>
                      <div className="text-xs text-[#8e8e75]">{lang === 'ur' ? 'اردو / English' : 'English / Urdu'}</div>
                    </div>
                  </div>
                  <button
                    onClick={onToggleLang}
                    className="px-4 py-2 rounded-xl bg-[#8b9d77] hover:bg-[#798a67] text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95"
                  >
                    {lang === 'en' ? 'اردو (UR)' : 'ENG (EN)'}
                  </button>
                </div>

                {/* Themes & Appearance Control */}
                <div className="p-4 rounded-3xl bg-[#fdfbf7] border border-[#ecece0] space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-white border border-[#ecece0] shadow-2xs">
                      <Palette className="w-5 h-5 text-[#8b9d77]" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-sm text-[#4a4a35]">{lang === 'ur' ? 'ایپ تھیم اور رنگ' : 'Theme & Appearance'}</div>
                      <div className="text-xs text-[#8e8e75]">{lang === 'ur' ? 'روشنی / ڈارک موڈ' : 'Select UI display theme'}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      onClick={() => setThemePref('light')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${themePref === 'light' ? 'bg-[#8b9d77] text-white shadow-xs' : 'bg-white border border-[#ecece0] text-[#5a5a40] hover:bg-[#f0f0e4]'}`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>{lang === 'ur' ? 'روشن' : 'Light'}</span>
                    </button>
                    <button
                      onClick={() => setThemePref('dark')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${themePref === 'dark' ? 'bg-[#1e3a68] text-white shadow-xs' : 'bg-white border border-[#ecece0] text-[#5a5a40] hover:bg-[#f0f0e4]'}`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>{lang === 'ur' ? 'ڈارک' : 'Dark'}</span>
                    </button>
                    <button
                      onClick={() => setThemePref('system')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${themePref === 'system' ? 'bg-[#4a4a35] text-white shadow-xs' : 'bg-white border border-[#ecece0] text-[#5a5a40] hover:bg-[#f0f0e4]'}`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>{lang === 'ur' ? 'آٹو' : 'Auto'}</span>
                    </button>
                    <button
                      onClick={() => setThemePref('emerald')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${themePref === 'emerald' ? 'bg-[#10B981] text-white shadow-xs' : 'bg-white border border-[#ecece0] text-[#5a5a40] hover:bg-[#f0f0e4]'}`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                      <span>{lang === 'ur' ? 'سبز' : 'Emerald'}</span>
                    </button>
                    <button
                      onClick={() => setThemePref('desert')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${themePref === 'desert' ? 'bg-[#D97706] text-white shadow-xs' : 'bg-white border border-[#ecece0] text-[#5a5a40] hover:bg-[#f0f0e4]'}`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span>
                      <span>{lang === 'ur' ? 'صحرائی' : 'Desert'}</span>
                    </button>
                    <button
                      onClick={() => setThemePref('navy')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${themePref === 'navy' ? 'bg-[#3B82F6] text-white shadow-xs' : 'bg-white border border-[#ecece0] text-[#5a5a40] hover:bg-[#f0f0e4]'}`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
                      <span>{lang === 'ur' ? 'نیلا' : 'Navy'}</span>
                    </button>
                  </div>
                </div>

                {/* Notifications Control */}
                <div className="p-4 rounded-3xl bg-[#fdfbf7] border border-[#ecece0] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-white border border-[#ecece0] shadow-2xs relative">
                      <Bell className="w-5 h-5 text-[#8b9d77]" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-serif font-bold text-sm text-[#4a4a35]">{lang === 'ur' ? 'نوٹیفیکیشنز' : 'Notifications'}</div>
                      <div className="text-xs text-[#8e8e75]">{unreadCount} {lang === 'ur' ? 'نئے الرٹس' : 'unread alerts'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleCloseMenu();
                      setShowNotifs(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#f0f0e4] hover:bg-[#e2e2d5] text-[#5a5a40] font-bold text-xs cursor-pointer"
                  >
                    {lang === 'ur' ? 'دیکھیں' : 'View Alerts'}
                  </button>
                </div>

                {/* EXPORT DATA & PRIVACY CONTROLS CARD */}
                <div className="p-4 rounded-3xl bg-[#fdfbf7] border border-[#ecece0] space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-white border border-[#ecece0] shadow-2xs text-[#1e3a68] shrink-0">
                      <Shield className="w-5 h-5 text-[#c59b27]" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-sm text-[#4a4a35]">
                        {lang === 'ur' ? 'ڈیٹا بیک اپ و پرائیویسی' : 'Export & Privacy'}
                      </div>
                      <div className="text-[11px] text-[#8e8e75]">
                        {lang === 'ur' ? 'شناختی کارڈ ماسکنگ اور CSV / JSON ڈاؤن لوڈ' : 'CNIC masking, CSV and JSON backups'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleCloseMenu();
                      setShowExportPrivacyModal(true);
                    }}
                    className="w-full py-2.5 px-3 bg-[#1e3a68] hover:bg-[#162a4d] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <Shield className="w-4 h-4 text-[#c59b27]" />
                    <span>{lang === 'ur' ? 'ایکسپورٹ پرائیویسی مینیو کھولیں' : 'Open Export Privacy Controls'}</span>
                  </button>
                </div>

                {/* SECOND LAST ITEM: SHARE APP PROMINENT CARD */}
                <div className="p-4 rounded-3xl bg-emerald-50/90 border border-emerald-200 space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-white border border-emerald-200 shadow-2xs text-emerald-700 shrink-0">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-sm text-emerald-950">
                        {lang === 'ur' ? 'ایپ شیئر کریں' : 'Share Driver Dost App'}
                      </div>
                      <div className="text-[11px] text-emerald-700">
                        {lang === 'ur' ? 'اپنے دوستوں اور ڈرائیور بھائیوں کے ساتھ ایپ شیئر کریں' : 'Send app link to drivers & fellow transporters'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleCloseMenu();
                      handleShareApp();
                    }}
                    className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <Share2 className="w-4 h-4 text-emerald-200" />
                    <span>{lang === 'ur' ? 'ایپ کا لنک شیئر کریں' : 'Share App Link'}</span>
                  </button>
                </div>

                {/* INSTALL APP PROMINENT CARD */}
                <div className="p-4 rounded-3xl bg-blue-50/90 border border-blue-200 space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-white border border-blue-200 shadow-2xs text-[#1e3a68] shrink-0">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-sm text-[#1e3a68]">
                        {lang === 'ur' ? 'ایپ انسٹال کریں (PWA)' : 'Install Official App'}
                      </div>
                      <div className="text-[11px] text-blue-700">
                        {lang === 'ur' ? 'ہوم اسکرین پر آف لائن استعمال کے لیے انسٹال کریں' : 'Install on mobile home screen for quick offline access'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleCloseMenu();
                      window.dispatchEvent(new CustomEvent('wg_open_install_modal'));
                    }}
                    className="w-full py-2.5 px-3 bg-[#1e3a68] hover:bg-[#162a4d] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4 text-blue-200" />
                    <span>{lang === 'ur' ? 'ایپ انسٹالیشن ونڈو کھولیں' : 'Install Driver Dost App'}</span>
                  </button>
                </div>

                {/* LAST ITEM: ABOUT US & CONTACT INFORMATION BUTTON */}
                <button
                  onClick={() => {
                    handleCloseMenu();
                    setShowAboutModal(true);
                  }}
                  className="w-full p-4 rounded-3xl bg-gradient-to-r from-blue-50/80 via-[#fdfbf7] to-[#f7f5ed] border border-blue-200/80 hover:border-blue-300 shadow-2xs text-left cursor-pointer transition-all group active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-100 text-blue-800 border border-blue-200 shrink-0 group-hover:scale-105 transition-transform">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#1e3a68] group-hover:text-blue-700 transition-colors">
                          {lang === 'ur' ? 'ہمارے بارے میں اور رابطہ' : 'About Us & Contact Us'}
                        </h4>
                        <p className="text-[10px] text-[#8e8e75] font-sans">
                          {lang === 'ur' ? 'مکمل تفصیلات اور دفتر کی معلومات' : 'Company profile, services & office address'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  <div className="space-y-1.5 pt-2 text-xs text-[#5a5a40] font-sans">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#1e3a68]">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="dir-ltr font-bold">0300-5370443</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#6b6b55]">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">
                        {lang === 'ur' ? 'سمندری، فیصل آباد، پنجاب، پاکستان' : 'Samundri, Faisalabad, Punjab, Pakistan'}
                      </span>
                    </div>
                  </div>
                </button>

              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-[#f0f0e4] border-t border-[#ecece0] text-center text-xs text-[#8e8e75]">
              Driver Dost · Pakistan Logistics & Transport Manager v2.4 Pro
            </div>
          </div>
        </div>
      )}

      {/* About Us & Contact Details Modal */}
      <AboutUsModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        lang={lang}
      />

      {/* Data Export & Privacy Controls Modal */}
      <ExportPrivacyModal
        isOpen={showExportPrivacyModal}
        onClose={() => setShowExportPrivacyModal(false)}
        lang={lang}
      />

      {/* Firebase Notifications Drawer / Modal */}
      {showNotifs && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-end p-4 sm:p-6 pt-24">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl border border-[#ecece0] overflow-hidden animate-in fade-in slide-in-from-top-5">
            <div className="p-5 bg-[#363626] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#8b9d77] flex items-center justify-center text-xs">🔥</div>
                <div>
                  <h3 className="font-serif font-bold text-sm">
                    {lang === 'ur' ? 'نوٹیفیکیشن و الرٹس' : 'Push & System Feed'}
                  </h3>
                  <p className="text-[10px] text-[#c2c2a3] font-mono">
                    {lang === 'ur' ? 'کلاؤڈ و موبائل اسٹیٹس بار' : 'CLOUD & STATUS BAR ALERTS'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3 h-3 text-[#8b9d77]" />
                    <span>{lang === 'ur' ? 'صاف کریں' : 'Clear'}</span>
                  </button>
                )}
                <button onClick={() => setShowNotifs(false)} className="text-white/60 hover:text-white p-1 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Status Bar Permission Action Banner */}
            <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-[#fdfbf7] to-amber-500/10 border-b border-amber-200 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="font-bold text-amber-950 text-[11px]">
                    {lang === 'ur' ? 'فون اسٹیٹس بار الرٹس' : 'Phone Status Bar Alerts'}
                  </span>
                </div>
                {notifPerm === 'granted' ? (
                  <button
                    onClick={handleSendTestNotification}
                    disabled={testSent}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0"
                  >
                    <Send className="w-2.5 h-2.5" />
                    <span>{testSent ? (lang === 'ur' ? 'بھیج دیا!' : 'Sent!') : (lang === 'ur' ? 'ٹیسٹ الرٹ' : 'Test Alert')}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleRequestPushPermission}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold cursor-pointer transition-all shadow-2xs flex items-center gap-1 shrink-0"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>{lang === 'ur' ? 'منظور کریں' : 'Enable'}</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-amber-900/80 mt-1 leading-snug">
                {notifPerm === 'granted'
                  ? (lang === 'ur' ? '✅ موبائل نوٹیفکیشن کی منظوری فعال ہے۔ تمام نوٹسز فون پر موصول ہوں گے۔' : '✅ Status bar notifications are enabled on this device.')
                  : (lang === 'ur' ? 'تمام نوٹسز موبائل کے اسٹیٹس بار اور نوٹیفکیشن پینل پر پانے کے لیے منظوری دیں۔' : 'Allow notifications to receive transport updates in your device status bar.')}
              </p>
            </div>

            <div className="max-h-[380px] overflow-y-auto p-4 space-y-3 bg-[#fdfbf7]">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8e8e75]">No cloud alerts received.</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-2xl border transition-all text-left ${n.unread ? 'bg-white border-[#8b9d77]/40 shadow-xs ring-1 ring-[#8b9d77]/20' : 'bg-[#f0f0e4]/50 border-[#ecece0] opacity-75'}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-serif font-bold text-xs text-[#4a4a35]">{n.title}</span>
                      <span className="text-[9px] font-mono text-[#8e8e75] shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-[#6b6b55] font-sans leading-relaxed">{n.message}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-[#8b9d77]/15 text-[#5a5a40]">
                        {n.type} alert
                      </span>
                      {n.unread && <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-[#f0f0e4] border-t border-[#ecece0] text-center text-[10px] font-mono text-[#8e8e75]">
              Connected to FCM Asia-South Cluster
            </div>
          </div>
        </div>
      )}
    </>
  );
};


