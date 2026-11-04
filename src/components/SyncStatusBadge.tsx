import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle2,
  ShieldCheck,
  LogIn,
  AlertCircle,
  Database
} from 'lucide-react';
import { SyncStatusState, Language } from '../types';
import { getSyncStatus, subscribeToSyncEvents } from '../utils/storage';

interface SyncStatusBadgeProps {
  lang: Language;
  userEmail?: string | null;
  onSyncTrigger?: () => Promise<void> | void;
  onSignIn?: () => void;
  className?: string;
}

/**
 * Interactive Cloud Synchronization Status Indicator & Manual Sync Controller
 * Displays clean states: Synced (emerald), Syncing (blue spinner), Guest Mode (slate), or Offline (amber).
 * Allows one-tap manual sync with live feedback and instant sign-in prompt for guest users.
 */
export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ 
  lang,
  userEmail,
  onSyncTrigger,
  onSignIn,
  className = ''
}) => {
  const [syncState, setSyncState] = useState<SyncStatusState>(getSyncStatus());
  const [showTooltip, setShowTooltip] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [syncFeedbackMsg, setSyncFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setSyncState(getSyncStatus());
    };

    update();
    const unsubscribe = subscribeToSyncEvents(update);
    const interval = setInterval(update, 3000);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);

    return () => {
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const isOffline = syncState.status === 'offline' || !isOnline;
  const isSyncing = isManualSyncing || syncState.status === 'syncing' || syncState.pendingCount > 0;
  const isGuest = !userEmail;

  // Format human-friendly time
  const formatTime = (iso?: string | null) => {
    if (!iso) return lang === 'ur' ? 'ابھی نہیں' : 'Not yet';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return lang === 'ur' ? 'کامیاب' : 'Ready';
    }
  };

  const handleManualSyncClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isManualSyncing) return;

    if (isGuest) {
      if (onSignIn) {
        setShowTooltip(false);
        onSignIn();
      }
      return;
    }

    setIsManualSyncing(true);
    setSyncFeedbackMsg(null);
    try {
      if (onSyncTrigger) {
        await onSyncTrigger();
      }
      setSyncFeedbackMsg(lang === 'ur' ? 'ڈیٹا کامیابی سے ہم آہنگ ہو گیا!' : 'Data synced successfully!');
      setTimeout(() => setSyncFeedbackMsg(null), 3000);
    } catch (err) {
      console.warn('Manual sync failed:', err);
      setSyncFeedbackMsg(lang === 'ur' ? 'سنک میں مسئلہ، دوبارہ کوشش کریں۔' : 'Sync error, please retry.');
    } finally {
      setIsManualSyncing(false);
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Ambient Status Pill */}
      <button
        onClick={() => setShowTooltip(prev => !prev)}
        type="button"
        id="btn-ambient-sync-status"
        aria-label={lang === 'ur' ? 'ڈیٹا ہم آہنگی کیفیت' : 'Data Sync Status'}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-2xs select-none active:scale-95 ${
          isOffline
            ? 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-500/15'
            : isSyncing
            ? 'bg-blue-500/10 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800 hover:bg-blue-500/15'
            : isGuest
            ? 'bg-slate-100 dark:bg-[#1a1c22] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#2d313b] hover:bg-slate-200 dark:hover:bg-[#22252c]'
            : 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-500/15'
        }`}
      >
        {isOffline ? (
          <>
            <CloudOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{lang === 'ur' ? 'آف لائن (محفوظ)' : 'Offline (Saved)'}</span>
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin shrink-0" />
            <span>{lang === 'ur' ? 'ہم آہنگ ہو رہا ہے...' : 'Syncing...'}</span>
          </>
        ) : isGuest ? (
          <>
            <Database className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <span>{lang === 'ur' ? 'مہمان موڈ (لوکل)' : 'Guest Mode (Local)'}</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{lang === 'ur' ? 'محفوظ اور ہم آہنگ' : 'Synced'}</span>
          </>
        )}
      </button>

      {/* Interactive Floating Popover / Status Card */}
      {showTooltip && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-[1px]"
            onClick={() => setShowTooltip(false)}
          />

          <div 
            className="absolute top-full mt-2 end-0 z-50 w-72 p-3.5 bg-white dark:bg-[#16181e] border border-[#ecece0] dark:border-[#2d313b] rounded-2xl shadow-2xl text-left animate-in fade-in zoom-in-95 duration-150 space-y-3"
            role="dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2d313b] pb-2.5">
              <div className="flex items-center gap-2">
                {isGuest ? (
                  <Database className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                <div>
                  <span className="text-xs font-bold text-gray-800 dark:text-slate-100 block">
                    {isGuest 
                      ? (lang === 'ur' ? 'مہمان موڈ (فون اسٹوریج)' : 'Guest Mode (Local Only)')
                      : (lang === 'ur' ? 'کلاؤڈ سنک فعال ہے' : 'Cloud Sync Active')}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-slate-400 block truncate max-w-[180px]">
                    {userEmail || (lang === 'ur' ? 'سائن ان نہیں ہوا' : 'Not signed in')}
                  </span>
                </div>
              </div>

              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isOffline 
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' 
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
              }`}>
                {isOffline ? (lang === 'ur' ? 'آف لائن' : 'Offline') : (lang === 'ur' ? 'آن لائن' : 'Online')}
              </span>
            </div>

            {/* Explanation Body */}
            <p className="text-[11px] text-gray-600 dark:text-slate-300 leading-relaxed">
              {isGuest
                ? (lang === 'ur' 
                    ? 'آپ کا ڈیٹا اس فون کی میموری میں 100% محفوظ ہے۔ اگر آپ اپنا ڈیٹا تمام ڈیوائسز پر سنک اور محفوظ بیک اپ رکھنا چاہتے ہیں تو گوگل سے سائن ان کریں۔' 
                    : 'Your records are 100% safe in device storage. To automatically sync and backup across all your devices, sign in with Google.')
                : isOffline
                ? (lang === 'ur'
                    ? 'انٹرنیٹ بند ہے۔ تمام تبدیلیاں محفوظ ہیں اور انٹرنیٹ آتے ہی خودکار کلاؤڈ سے ہم آہنگ ہو جائیں گی۔'
                    : 'Device is offline. All changes are saved locally and will auto-sync once connected.')
                : (lang === 'ur'
                    ? 'آپ کا کھاتہ، گاڑیاں، ڈرائیورز اور بلٹیاں کلاؤڈ ڈیٹابیس کے ساتھ منسلک ہیں۔'
                    : 'Your trips, vehicles, fuel logs, and ledger are backed up to cloud database.')}
            </p>

            {/* Sync Meta Stats */}
            {!isGuest && (
              <div className="bg-gray-50 dark:bg-[#121316] p-2 rounded-xl border border-gray-150 dark:border-[#2d313b] space-y-1 text-[10px] text-gray-500 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span>{lang === 'ur' ? 'آخری سنک کا وقت:' : 'Last Synced:'}</span>
                  <span className="font-mono font-semibold text-gray-700 dark:text-slate-200">
                    {formatTime(syncState.lastSyncTime)}
                  </span>
                </div>
                {syncState.pendingCount > 0 && (
                  <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
                    <span>{lang === 'ur' ? 'قطار میں موجود ریکارڈز:' : 'Pending in queue:'}</span>
                    <span className="font-mono font-bold">{syncState.pendingCount}</span>
                  </div>
                )}
              </div>
            )}

            {/* Feedback message */}
            {syncFeedbackMsg && (
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 text-center animate-in fade-in">
                {syncFeedbackMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div>
              {isGuest ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowTooltip(false);
                    if (onSignIn) onSignIn();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <LogIn className="w-4 h-4 text-emerald-200" />
                  <span>{lang === 'ur' ? 'گوگل سے سائن ان کریں' : 'Sign In with Google'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleManualSyncClick}
                  disabled={isManualSyncing || isOffline}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 ${
                    isManualSyncing || isOffline
                      ? 'bg-gray-200 dark:bg-[#22252c] text-gray-500 dark:text-slate-500 cursor-not-allowed'
                      : 'bg-[#1b4332] hover:bg-[#2d6a4f] text-white cursor-pointer'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isManualSyncing ? 'animate-spin' : ''}`} />
                  <span>
                    {isManualSyncing
                      ? (lang === 'ur' ? 'ہم آہنگ ہو رہا ہے...' : 'Syncing Data...')
                      : (lang === 'ur' ? 'ابھی کلاؤڈ سنک کریں' : 'Sync Now')}
                  </span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
