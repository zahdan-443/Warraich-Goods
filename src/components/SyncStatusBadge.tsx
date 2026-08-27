import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Trash2, 
  Database, 
  Activity, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { SyncStatusState, Language } from '../types';
import { getSyncStatus, triggerManualSync, getErrorLogs, clearErrorLogs } from '../utils/storage';

interface SyncStatusBadgeProps {
  lang: Language;
  onSyncComplete?: () => void;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ lang, onSyncComplete }) => {
  const [syncState, setSyncState] = useState<SyncStatusState>(getSyncStatus());
  const [isSyncing, setIsSyncing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorLogs, setErrorLogs] = useState(getErrorLogs());
  const [feedback, setFeedback] = useState<string | null>(null);

  // Poll sync status and network changes
  useEffect(() => {
    const update = () => {
      setSyncState(getSyncStatus());
      setErrorLogs(getErrorLogs());
    };

    update();
    const interval = setInterval(update, 3500);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setFeedback(null);
    try {
      const res = await triggerManualSync();
      setSyncState(getSyncStatus());
      setErrorLogs(getErrorLogs());
      if (res.success) {
        setFeedback(lang === 'ur' ? `کامیابی سے ${res.processed} تبدیلیاں ہم آہنگ ہو گئیں۔` : `Successfully synced ${res.processed} items.`);
      } else {
        setFeedback(res.errors[0] || (lang === 'ur' ? 'ہم آہنگی میں مسئلہ پیش آیا۔' : 'Sync encountered an issue.'));
      }
      if (onSyncComplete) onSyncComplete();
    } finally {
      setIsSyncing(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleClearLogs = () => {
    clearErrorLogs();
    setErrorLogs([]);
  };

  // Badge config based on state
  const isOffline = syncState.status === 'offline';
  const hasError = syncState.status === 'error' || syncState.lastError !== null;
  const isPending = syncState.pendingCount > 0;

  return (
    <>
      {/* Clickable Header Badge */}
      <button
        onClick={() => setShowModal(true)}
        id="btn-sync-status-badge"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-2xs active:scale-95 ${
          isOffline
            ? 'bg-amber-500/10 text-amber-800 border-amber-300 hover:bg-amber-500/20'
            : hasError
            ? 'bg-red-500/10 text-red-700 border-red-300 hover:bg-red-500/20'
            : isPending
            ? 'bg-blue-500/10 text-blue-800 border-blue-300 hover:bg-blue-500/20'
            : 'bg-emerald-500/10 text-emerald-800 border-emerald-300 hover:bg-emerald-500/20'
        }`}
        title={lang === 'ur' ? 'کلاؤڈ ہم آہنگی اور ایرر لاگز' : 'Cloud Sync & Telemetry Status'}
      >
        {isOffline ? (
          <>
            <CloudOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>{lang === 'ur' ? 'آف لائن موڈ' : 'Offline'}</span>
            {isPending && <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[9px]">{syncState.pendingCount}</span>}
          </>
        ) : hasError ? (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span>{lang === 'ur' ? 'سنک ایرر' : 'Sync Error'}</span>
          </>
        ) : isPending ? (
          <>
            <RefreshCw className={`w-3.5 h-3.5 text-[#3B82F6] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{lang === 'ur' ? 'تبدیلیاں قطار میں' : 'Pending'}</span>
            <span className="px-1.5 py-0.2 bg-[#1e3a68] text-white rounded-full text-[9px]">{syncState.pendingCount}</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'ur' ? 'کلاؤڈ سنکڈ' : 'Synced'}</span>
          </>
        )}
      </button>

      {/* Sync Status & Error Telemetry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-[#e5e5dc]">
            
            {/* Header */}
            <div className="p-5 bg-[#fdfbf7] border-b border-[#ecece0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${isOffline ? 'bg-amber-100 text-amber-800' : hasError ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {isOffline ? <CloudOff className="w-5 h-5" /> : hasError ? <AlertTriangle className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#4a4a35]">
                    {lang === 'ur' ? 'کلاؤڈ ہم آہنگی اور سسٹم لاگز' : 'Cloud Sync & Telemetry'}
                  </h3>
                  <p className="text-xs text-[#8e8e75]">
                    {lang === 'ur' ? 'ڈیٹا کی محفوظ ٹرانسفر اور فالٹ ٹریکنگ' : 'Reliable data transmission & error telemetry'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full bg-[#f0f0e4] hover:bg-[#e2e2d5] text-[#5a5a40] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-left">
              
              {/* Feedback Alert */}
              {feedback && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{feedback}</span>
                </div>
              )}

              {/* Real-time Status Card */}
              <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#4a4a35] uppercase tracking-wider">
                    {lang === 'ur' ? 'موجودہ کنکشن کیفیت' : 'Connection Status'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isOffline ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {isOffline ? (lang === 'ur' ? 'آف لائن (لوکل اسٹوریج فعال)' : 'Offline (Local Safe)') : (lang === 'ur' ? 'آن لائن (کلاؤڈ فعال)' : 'Online (Cloud Connected)')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-[#ecece0]">
                    <div className="text-[10px] text-[#8e8e75] font-semibold">{lang === 'ur' ? 'زیر التواء ایکشنز' : 'Pending Offline Queue'}</div>
                    <div className="text-sm font-bold text-[#1e3a68] mt-0.5">{syncState.pendingCount} {lang === 'ur' ? 'آئٹمز' : 'items'}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#ecece0]">
                    <div className="text-[10px] text-[#8e8e75] font-semibold">{lang === 'ur' ? 'آخری سنک کا وقت' : 'Last Cloud Sync'}</div>
                    <div className="text-xs font-bold text-[#4a4a35] mt-0.5 truncate">
                      {syncState.lastSyncTime ? new Date(syncState.lastSyncTime).toLocaleTimeString() : (lang === 'ur' ? 'ابھی نہیں' : 'Not yet')}
                    </div>
                  </div>
                </div>

                {syncState.lastError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{lang === 'ur' ? 'آخری ایرر' : 'Last Error'}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed break-words">{syncState.lastError}</p>
                  </div>
                )}

                <button
                  onClick={handleManualSync}
                  disabled={isSyncing || isOffline}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs ${
                    isOffline
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#1e3a68] hover:bg-[#162a4d] text-white active:scale-95'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? (lang === 'ur' ? 'ہم آہنگی ہو رہی ہے...' : 'Syncing...') : (lang === 'ur' ? 'ابھی ہم آہنگ کریں (Sync Now)' : 'Sync Now with Cloud')}</span>
                </button>
              </div>

              {/* Error & Telemetry Logs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#4a4a35]">
                    <Activity className="w-3.5 h-3.5 text-[#8b9d77]" />
                    <span>{lang === 'ur' ? 'ایرر و فالٹ لاگز' : 'Error & Exception Logs'}</span>
                    <span className="text-[10px] text-[#8e8e75]">({errorLogs.length})</span>
                  </div>
                  {errorLogs.length > 0 && (
                    <button
                      onClick={handleClearLogs}
                      className="text-[10px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{lang === 'ur' ? 'صاف کریں' : 'Clear Logs'}</span>
                    </button>
                  )}
                </div>

                {errorLogs.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] text-center text-xs text-[#8e8e75] flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'ur' ? 'کوئی ایرر ریکارڈ نہیں ہوا۔ سسٹم بالکل ٹھیک چل رہا ہے۔' : 'Zero errors recorded. System operates smoothly.'}</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {errorLogs.map(log => (
                      <div key={log.id} className="p-2.5 rounded-xl bg-red-50/70 border border-red-200/80 text-xs text-red-900 space-y-1">
                        <div className="flex items-center justify-between font-bold text-[11px]">
                          <span className="truncate max-w-[200px] text-red-800">{log.action}</span>
                          <span className="text-[9px] text-[#8e8e75] font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[11px] text-red-700 leading-tight font-mono">{log.error}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#f0f0e4] border-t border-[#ecece0] flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-[#8b9d77] hover:bg-[#798a67] text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                {lang === 'ur' ? 'بند کریں' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
