import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle2,
  ShieldCheck,
  Check
} from 'lucide-react';
import { SyncStatusState, Language } from '../types';
import { getSyncStatus, subscribeToSyncEvents } from '../utils/storage';

interface SyncStatusBadgeProps {
  lang: Language;
  onSyncComplete?: () => void;
}

/**
 * Ambient Zero-Button Cloud Synchronization Status Indicator
 * Replaces the obsolete manual "Sync Now" modal with a silent, continuous ambient indicator.
 * Displays clean states: Synced (emerald), Ambient Sync in progress (blue spinner), or Offline (amber).
 */
export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ lang }) => {
  const [syncState, setSyncState] = useState<SyncStatusState>(getSyncStatus());
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const update = () => {
      setSyncState(getSyncStatus());
    };

    update();
    // Subscribe to storage & ambient sync lifecycle events
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

  const isOffline = syncState.status === 'offline';
  const isSyncing = syncState.status === 'syncing' || syncState.pendingCount > 0;

  // Format human-friendly time
  const formatTime = (iso?: string | null) => {
    if (!iso) return lang === 'ur' ? 'ابھی نہیں' : 'Just now';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return lang === 'ur' ? 'کامیاب' : 'Ready';
    }
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Ambient Status Pill */}
      <button
        onClick={() => setShowTooltip(prev => !prev)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        type="button"
        id="btn-ambient-sync-status"
        aria-label={lang === 'ur' ? 'ڈیٹا ہم آہنگی کیفیت' : 'Data Sync Status'}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-2xs select-none active:scale-95 ${
          isOffline
            ? 'bg-amber-500/10 text-amber-800 border-amber-300 hover:bg-amber-500/15'
            : isSyncing
            ? 'bg-blue-500/10 text-blue-800 border-blue-300 hover:bg-blue-500/15'
            : 'bg-emerald-500/10 text-emerald-800 border-emerald-300 hover:bg-emerald-500/15'
        }`}
      >
        {isOffline ? (
          <>
            <CloudOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{lang === 'ur' ? 'آف لائن (محفوظ)' : 'Offline (Saved)'}</span>
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
            <span>{lang === 'ur' ? 'ہم آہنگ ہو رہا ہے...' : 'Syncing...'}</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{lang === 'ur' ? 'محفوظ اور ہم آہنگ' : 'Synced'}</span>
          </>
        )}
      </button>

      {/* Gentle Floating Tooltip / Status Card (No blocking popups or buttons) */}
      {showTooltip && (
        <div 
          className="absolute top-full mt-1.5 end-0 z-50 w-56 p-2.5 bg-white border border-[#ecece0] rounded-2xl shadow-xl text-left animate-in fade-in zoom-in-95 duration-150"
          role="tooltip"
        >
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-[#4a4a35]">
              {isOffline
                ? (lang === 'ur' ? 'آف لائن موڈ فعال ہے' : 'Offline Mode Active')
                : (lang === 'ur' ? 'خودکار کلاؤڈ پروٹیکشن' : 'Continuous Cloud Sync')}
            </span>
          </div>
          <p className="text-[10px] text-[#7a7a60] leading-relaxed">
            {isOffline
              ? (lang === 'ur' ? 'آپ کا تمام ڈیٹا فون میں 100% محفوظ ہے۔ نیٹ ورک آتے ہی خود سنک ہو جائے گا۔' : 'All records are 100% safe on device. Will auto-sync when online.')
              : (lang === 'ur' ? 'تمام تبدیلیاں بغیر کسی دستی بٹن کے خودکار طور پر کلاؤڈ میں بیک اپ ہو رہی ہیں۔' : 'Changes continuously back up to cloud in the background automatically.')}
          </p>
          <div className="mt-2 pt-1.5 border-t border-[#f0f0e4] flex items-center justify-between text-[9px] text-[#8e8e75]">
            <span>{lang === 'ur' ? 'آخری تصدیق:' : 'Last verified:'}</span>
            <span className="font-semibold text-[#4a4a35]">{formatTime(syncState.lastSyncTime)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
