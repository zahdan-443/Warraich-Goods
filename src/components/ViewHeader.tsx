import React from 'react';
import { Home, ArrowLeft, ArrowRight, Globe } from 'lucide-react';
import { Language } from '../types';

interface ViewHeaderProps {
  title: string;
  titleUr?: string;
  lang: Language;
  onBackToDashboard: () => void;
  onToggleLang?: () => void;
  subtitle?: string;
  subtitleUr?: string;
  actionNode?: React.ReactNode;
}

export const ViewHeader: React.FC<ViewHeaderProps> = ({
  title,
  titleUr,
  lang,
  onBackToDashboard,
  onToggleLang,
  subtitle,
  subtitleUr,
  actionNode
}) => {
  const isUrdu = lang === 'ur';
  const displayTitle = isUrdu ? (titleUr || title) : title;
  const displaySubtitle = isUrdu ? (subtitleUr || subtitle) : subtitle;

  const handleBack = () => {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(10); } catch {}
    }
    onBackToDashboard();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      role="banner"
      aria-label={isUrdu ? 'صفحہ کا ہیڈر' : 'Page Navigation Bar'}
      className="sticky top-0 z-40 w-full bg-[#fdfbf7]/98 dark:bg-[#11120e]/98 backdrop-blur-md border-b border-[#e2e2d5] dark:border-[#2f3026] shadow-2xs select-none"
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Zone 1: Standardized "Back to Dashboard" Anchor (Identical pixel coordinates & styling across all tabs) */}
        <button
          type="button"
          onClick={handleBack}
          aria-label={isUrdu ? 'ڈیش بورڈ پر واپس جائیں' : 'Back to Home Dashboard'}
          title={isUrdu ? 'ڈیش بورڈ پر واپس جائیں' : 'Back to Home Dashboard'}
          className="min-h-[44px] min-w-[44px] px-3 sm:px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1a1b15] hover:bg-[#f2f2e6] dark:hover:bg-[#25261f] active:bg-[#e4e4d6] dark:active:bg-[#2d2e24] border-2 border-[#d5d5c5] dark:border-[#424336] hover:border-[#8b9d77] text-[#383827] dark:text-[#f5f5ee] shadow-xs active:scale-95 transition-all duration-150 cursor-pointer flex items-center gap-1.5 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b9d77]"
        >
          {isUrdu ? (
            <ArrowRight className="w-4 h-4 text-[#8b9d77] dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          ) : (
            <ArrowLeft className="w-4 h-4 text-[#8b9d77] dark:text-emerald-400 group-hover:-translate-x-0.5 transition-transform shrink-0" />
          )}
          <Home className="w-4 h-4 text-[#8b9d77] dark:text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-black font-serif tracking-tight whitespace-nowrap text-[#2b2b1f] dark:text-[#f5f5ee]">
            {isUrdu ? 'ڈیش بورڈ' : 'Dashboard'}
          </span>
        </button>

        {/* Zone 2: Page Title & Contextual Breadcrumb */}
        <div className="flex-1 min-w-0 text-center px-1 sm:px-2">
          <h1 className="text-sm sm:text-base md:text-lg font-bold font-serif text-[#2e3e26] dark:text-[#f5f5ee] truncate tracking-tight leading-tight">
            {displayTitle}
          </h1>
          {displaySubtitle && (
            <p className="text-[10px] sm:text-xs text-[#7a8a66] dark:text-[#a3b68f] truncate hidden xs:block mt-0.5 font-medium">
              {displaySubtitle}
            </p>
          )}
        </div>

        {/* Zone 3: Language Toggle & Quick Action Node */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {actionNode}
          {onToggleLang && (
            <button
              type="button"
              onClick={onToggleLang}
              title={isUrdu ? 'Switch to English' : 'اردو میں تبدیل کریں'}
              aria-label={isUrdu ? 'Switch to English' : 'اردو میں تبدیل کریں'}
              className="min-h-[44px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a1b15] hover:bg-[#f2f2e6] dark:hover:bg-[#25261f] active:bg-[#e4e4d6] dark:active:bg-[#2d2e24] border border-[#d5d5c5] dark:border-[#424336] text-xs font-bold text-[#4a4a35] dark:text-[#f5f5ee] shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#8b9d77] dark:text-emerald-400" />
              <span className="font-sans text-[11px] font-extrabold uppercase">
                {isUrdu ? 'EN' : 'اردو'}
              </span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
