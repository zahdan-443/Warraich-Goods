import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Video, 
  Square, 
  Play, 
  Trash2, 
  Clock, 
  HardDrive, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowLeft, 
  Download, 
  Share2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Radio, 
  Mic, 
  Info,
  Maximize2,
  X,
  RefreshCw,
  Film
} from 'lucide-react';
import { Language, ActiveTab } from '../../types';
import { 
  DashcamClip, 
  DashcamStatus, 
  startDashcamRecording, 
  stopDashcamRecording, 
  getDashcamStatus, 
  listDashcamClips, 
  deleteDashcamClip, 
  playDashcamClip, 
  checkDashcamPermissions, 
  requestDashcamPermissions,
  subscribeDashcamStatus,
  isNativeDashcamAvailable
} from '../../utils/dashcamService';

interface DashcamViewProps {
  lang: Language;
  onNavigate: (tab: ActiveTab) => void;
}

export const DashcamView: React.FC<DashcamViewProps> = ({ lang, onNavigate }) => {
  const isUrdu = lang === 'ur';

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clips State
  const [clips, setClips] = useState<DashcamClip[]>([]);
  const [loadingClips, setLoadingClips] = useState(true);
  const [selectedClipToPlay, setSelectedClipToPlay] = useState<DashcamClip | null>(null);
  const [clipToDelete, setClipToDelete] = useState<DashcamClip | null>(null);

  // Permissions & Explanation Modal
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [checkingPerms, setCheckingPerms] = useState(true);

  // Live Camera Preview
  const [showPreview, setShowPreview] = useState(true);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Load initial status & clips
  useEffect(() => {
    let isMounted = true;

    async function init() {
      const perms = await checkDashcamPermissions();
      if (isMounted) {
        setHasPermissions(perms.camera && perms.microphone);
        setCheckingPerms(false);
      }

      const status = await getDashcamStatus();
      if (isMounted) {
        setIsRecording(status.isRecording);
        setElapsedSeconds(status.elapsedSeconds);
      }

      await refreshClips();
    }

    init();

    const unsubscribe = subscribeDashcamStatus((status) => {
      setIsRecording(status.isRecording);
      setElapsedSeconds(status.elapsedSeconds);
      if (!status.isRecording) {
        refreshClips();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const refreshClips = async () => {
    setLoadingClips(true);
    try {
      const list = await listDashcamClips();
      setClips(list);
    } catch (e) {
      console.warn('Error loading clips', e);
    } finally {
      setLoadingClips(false);
    }
  };

  const handleToggleRecording = async () => {
    setErrorMessage(null);

    if (!isRecording) {
      // Starting: check permissions first
      if (!hasPermissions) {
        setShowPermissionModal(true);
        return;
      }

      setLoadingAction(true);
      const res = await startDashcamRecording({
        videoElement: showPreview ? videoPreviewRef.current : null,
      });
      setLoadingAction(false);

      if (res.success) {
        setIsRecording(true);
        setElapsedSeconds(0);
      } else {
        setErrorMessage(res.message || (isUrdu ? 'ریکارڈنگ شروع نہیں ہو سکی۔ کیمرہ رسائی چیک کریں۔' : 'Failed to start dashcam recording. Please verify camera permissions.'));
      }
    } else {
      // Stopping
      setLoadingAction(true);
      const res = await stopDashcamRecording();
      setLoadingAction(false);
      setIsRecording(false);
      setElapsedSeconds(0);
      await refreshClips();
    }
  };

  const handleGrantPermissions = async () => {
    setShowPermissionModal(false);
    setLoadingAction(true);
    const perms = await requestDashcamPermissions();
    setLoadingAction(false);

    if (perms.camera && perms.microphone) {
      setHasPermissions(true);
      // Immediately start after granting
      const res = await startDashcamRecording({
        videoElement: showPreview ? videoPreviewRef.current : null,
      });
      if (res.success) {
        setIsRecording(true);
      } else {
        setErrorMessage(res.message || (isUrdu ? 'ریکارڈنگ شروع کرنے میں مسئلہ آیا۔' : 'Failed to start recording.'));
      }
    } else {
      setErrorMessage(
        isUrdu
          ? 'کیمرہ اور مائیکروفون کی اجازت درکار ہے۔ براہ کرم براؤزر / فون سیٹنگز میں اجازت فعال کریں۔'
          : 'Camera and microphone access are required for the dashcam. Please grant access in device settings.'
      );
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!clipToDelete) return;
    const success = await deleteDashcamClip(clipToDelete);
    if (success) {
      setClips((prev) => prev.filter((c) => c.id !== clipToDelete.id));
      if (selectedClipToPlay?.id === clipToDelete.id) {
        setSelectedClipToPlay(null);
      }
    }
    setClipToDelete(null);
  };

  const formatTimer = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const totalClipsSize = clips.reduce((acc, c) => acc + (c.sizeBytes || 0), 0);

  return (
    <div 
      className={`flex-1 p-3 sm:p-6 md:p-8 max-w-5xl mx-auto w-full font-sans space-y-6 ${isUrdu ? 'text-right' : 'text-left'}`}
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-7 rounded-[32px] shadow-sm border border-[#ecece0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#8b9d77]/15 p-1 flex items-center justify-center shrink-0 border border-[#8b9d77]/30 shadow-2xs">
            <img 
              src="./dashcam-icon.png" 
              alt="Dashcam Road Recorder" 
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <Camera className="w-6 h-6 text-[#8b9d77] hidden" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#4a4a35]">
                {isUrdu ? 'ڈیش کیم ویڈیو ریکارڈر' : 'Dashcam Video Recorder'}
              </h1>
              {isNativeDashcamAvailable() && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {isUrdu ? 'نیٹو فورگراؤنڈ سروس' : 'Native CameraX'}
                </span>
              )}
            </div>
            <p className="text-xs text-[#8e8e75] mt-0.5">
              {isUrdu 
                ? 'محفوظ روڈ سفر کی ریکارڈنگ • اسکرین بند ہونے پر بھی پس منظر میں ویڈیو اور آڈیو محفوظ رہتی ہے'
                : 'Continuous road recording with screen off & lock screen background capability'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="p-2.5 bg-[#fdfbf7] hover:bg-[#eaeae0] border border-[#ecece0] text-[#4a4a35] rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title={isUrdu ? 'ڈیش بورڈ پر واپس جائیں' : 'Back to Dashboard'}
          >
            <ArrowLeft className={`w-4 h-4 ${isUrdu ? 'rotate-180' : ''}`} />
            <span>{isUrdu ? 'ڈیش بورڈ' : 'Dashboard'}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-red-100 rounded-lg">
            <X className="w-4 h-4 text-red-700" />
          </button>
        </div>
      )}

      {/* Main Recording Station Card */}
      <div className="bg-white p-6 sm:p-8 rounded-[36px] shadow-sm border border-[#ecece0] space-y-6">
        
        {/* Live Camera Viewfinder (if enabled) */}
        <div className="relative w-full bg-slate-950 rounded-3xl overflow-hidden aspect-video max-h-[360px] flex items-center justify-center border-2 border-[#1e3a68]/20 shadow-inner group">
          {showPreview ? (
            <video 
              ref={videoPreviewRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
          ) : null}

          {/* Overlay Status Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs font-mono font-bold border border-white/10">
              {isRecording ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  <span className="text-red-400 font-bold uppercase tracking-wider">REC</span>
                  <span>{formatTimer(elapsedSeconds)}</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span className="text-slate-300">{isUrdu ? 'اسٹینڈ بائی' : 'STANDBY'}</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="pointer-events-auto p-2 bg-black/70 hover:bg-black/90 backdrop-blur-md text-white rounded-full transition-all border border-white/15 cursor-pointer shadow-md"
              title={showPreview ? (isUrdu ? 'کیمرہ پیش نظارہ چھپائیں' : 'Hide Viewfinder') : (isUrdu ? 'کیمرہ دکھائیں' : 'Show Viewfinder')}
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Center message if not recording or preview disabled */}
          {!showPreview && (
            <div className="text-center p-6 space-y-2 select-none">
              <Camera className="w-12 h-12 text-slate-500 mx-auto opacity-40" />
              <p className="text-xs text-slate-400 font-mono">
                {isRecording 
                  ? (isUrdu ? 'پس منظر میں ریکارڈنگ جاری ہے (اسکرین پاور سیور موڈ)' : 'Recording actively running in background (Power Saver)')
                  : (isUrdu ? 'کیمرہ پیش نظارہ پوشیدہ ہے' : 'Camera viewfinder hidden')}
              </p>
            </div>
          )}

          {/* Bottom Banner inside Viewfinder */}
          <div className="absolute bottom-3 left-4 right-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 rounded-2xl flex items-center justify-between text-[11px] text-slate-200 pointer-events-none">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isUrdu ? 'پچھلا کیمرہ (روڈ منظر) + آڈیو' : 'Rear Road Camera + Audio Active'}</span>
            </span>
            <span className="font-mono text-[10px] text-slate-300">1080p HD • MP4</span>
          </div>
        </div>

        {/* Big Start / Stop Recording Control Bar */}
        <div className="p-6 bg-[#fdfbf7] rounded-[28px] border border-[#ecece0] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}></span>
              <span className="text-sm font-bold text-[#4a4a35] font-serif">
                {isRecording 
                  ? (isUrdu ? 'ڈیش کیم ریکارڈنگ فعال ہے' : 'Dashcam Recording Active') 
                  : (isUrdu ? 'ڈیش کیم تیار ہے' : 'Dashcam Ready to Record')}
              </span>
            </div>
            <p className="text-xs text-[#8e8e75] leading-relaxed max-w-md">
              {isUrdu
                ? 'ریکارڈ شدہ کلپس الگ الگ محفوظ ہوتے ہیں اور کبھی خودکار ڈیلیٹ نہیں ہوتے۔ آپ خود جب چاہیں ڈیلیٹ کر سکتے ہیں۔'
                : 'Clips are saved as permanent timestamped files and are never auto-deleted. You maintain total storage control.'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              disabled={loadingAction}
              onClick={handleToggleRecording}
              className={`px-8 py-4 rounded-2xl font-serif font-bold text-sm tracking-wide flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50 select-none ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-100 animate-pulse' 
                  : 'bg-[#1e3a68] hover:bg-[#162a4d] text-white ring-4 ring-blue-50'
              }`}
            >
              {loadingAction ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : isRecording ? (
                <>
                  <Square className="w-5 h-5 fill-current" />
                  <span>{isUrdu ? 'ریکارڈنگ بند کریں (Stop)' : 'Stop Recording'}</span>
                </>
              ) : (
                <>
                  <Radio className="w-5 h-5 text-red-400" />
                  <span>{isUrdu ? 'ریکارڈنگ شروع کریں (Start)' : 'Start Recording'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Policy & Lock Screen Guarantee Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">{isUrdu ? 'اسکرین بند پر بھی جاری' : 'Screen-Off Recording'}</span>
              <p className="text-[10px] text-emerald-800 leading-normal mt-0.5">
                {isUrdu ? 'فون لاک ہونے پر فورگراؤنڈ سروس ویڈیو ریکارڈنگ جاری رکھتی ہے۔' : 'Runs as a high-priority Foreground Service even when screen is locked.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-2.5 text-xs text-blue-950">
            <HardDrive className="w-4 h-4 text-[#1e3a68] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">{isUrdu ? 'کوئی آٹو ڈیلیٹ نہیں' : 'No Auto-Delete Loop'}</span>
              <p className="text-[10px] text-blue-800 leading-normal mt-0.5">
                {isUrdu ? 'پرانی ویڈیوز محفوظ رہتی ہیں، صرف ڈرائیور خود ڈیلیٹ کر سکتا ہے۔' : 'Every clip is preserved with date/time. Only you decide when to delete.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-950">
            <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">{isUrdu ? 'اسٹیٹس بار نوٹیفکیشن' : 'Status Bar Notification'}</span>
              <p className="text-[10px] text-amber-800 leading-normal mt-0.5">
                {isUrdu ? 'فون کے نوٹیفکیشن پینل پر مستقل الرٹ ظاہر رہتا ہے۔' : 'Clear persistent recording notification in the device shade.'}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* SAVED DASHCAM CLIPS SECTION */}
      <div className="bg-white p-6 sm:p-8 rounded-[36px] shadow-sm border border-[#ecece0] space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ecece0] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#f0f0e4] text-[#5a5a40]">
              <Film className="w-5 h-5 text-[#8b9d77]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#4a4a35]">
                {isUrdu ? 'محفوظ شدہ ڈیش کیم ویڈیوز' : 'Saved Dashcam Video Clips'}
              </h2>
              <p className="text-xs text-[#8e8e75]">
                {clips.length} {isUrdu ? 'کلپس محفوظ ہیں' : 'clips recorded'} • {formatFileSize(totalClipsSize)} {isUrdu ? 'کل سائز' : 'total'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshClips}
            disabled={loadingClips}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fdfbf7] hover:bg-[#f0f0e4] border border-[#ecece0] rounded-xl text-xs font-bold text-[#5a5a40] cursor-pointer transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingClips ? 'animate-spin' : ''}`} />
            <span>{isUrdu ? 'تازہ کریں' : 'Refresh Clips'}</span>
          </button>
        </header>

        {loadingClips ? (
          <div className="p-12 text-center text-xs text-[#8e8e75] space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#8b9d77]" />
            <p>{isUrdu ? 'ویڈیوز لوڈ ہو رہی ہیں...' : 'Loading video clips...'}</p>
          </div>
        ) : clips.length === 0 ? (
          <div className="p-12 text-center bg-[#fdfbf7] rounded-3xl border border-dashed border-[#ecece0] space-y-3">
            <Camera className="w-10 h-10 text-[#8e8e75]/40 mx-auto" />
            <h3 className="font-serif font-bold text-sm text-[#4a4a35]">
              {isUrdu ? 'ابھی کوئی ریکارڈ شدہ ویڈیو کلپ موجود نہیں' : 'No recorded dashcam clips yet'}
            </h3>
            <p className="text-xs text-[#8e8e75] max-w-sm mx-auto">
              {isUrdu
                ? 'اوپر دیئے گئے "ریکارڈنگ شروع کریں" کے بٹن پر کلک کر کے روڈ سفر کا پہلا ویڈیو لاگ بنائیں'
                : 'Tap "Start Recording" above to capture your first road freight trip footage.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {clips.map((clip) => (
              <div
                key={clip.id}
                className="p-4 rounded-2xl bg-[#fdfbf7] hover:bg-white border border-[#ecece0] hover:border-[#8b9d77] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden group-hover:ring-2 group-hover:ring-[#8b9d77]">
                    <Video className="w-6 h-6 text-slate-300" />
                    <span className="absolute bottom-1 right-1 text-[8px] font-mono bg-black/80 px-1 rounded text-emerald-400 font-bold">
                      {formatTimer(clip.durationSeconds)}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold font-mono text-[#4a4a35] truncate" title={clip.filename}>
                      {clip.filename}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-[#8e8e75] mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#8b9d77]" />
                        <span>{clip.dateFormatted}</span>
                      </span>
                      <span>•</span>
                      <span>{formatFileSize(clip.sizeBytes)}</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-700 font-semibold">{formatTimer(clip.durationSeconds)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setSelectedClipToPlay(clip)}
                    className="px-3.5 py-2 bg-[#8b9d77] hover:bg-[#798a67] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    title={isUrdu ? 'ویڈیو چلائیں' : 'Play Video'}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isUrdu ? 'دیکھیں' : 'Play'}</span>
                  </button>

                  {clip.blobUrl && (
                    <a
                      href={clip.blobUrl}
                      download={clip.filename}
                      className="p-2 bg-white hover:bg-slate-100 border border-[#ecece0] text-[#5a5a40] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      title={isUrdu ? 'ڈاؤن لوڈ کریں' : 'Download Video'}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setClipToDelete(clip)}
                    className="p-2 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl text-xs transition-all cursor-pointer"
                    title={isUrdu ? 'حذف کریں' : 'Delete Clip'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* VIDEO PLAYER MODAL */}
      {selectedClipToPlay && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-[32px] max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800 text-white">
              <div className="flex items-center gap-2 min-w-0">
                <Video className="w-5 h-5 text-[#8b9d77] shrink-0" />
                <span className="font-mono text-xs truncate max-w-md">{selectedClipToPlay.filename}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClipToPlay(null)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-black flex items-center justify-center p-2">
              <video
                src={selectedClipToPlay.blobUrl || selectedClipToPlay.path}
                controls
                autoPlay
                playsInline
                className="max-h-[60vh] w-full rounded-2xl object-contain"
              />
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-between border-t border-slate-800 text-xs text-slate-400">
              <span>{selectedClipToPlay.dateFormatted} • {formatFileSize(selectedClipToPlay.sizeBytes)}</span>
              <div className="flex items-center gap-2">
                {selectedClipToPlay.blobUrl && (
                  <a
                    href={selectedClipToPlay.blobUrl}
                    download={selectedClipToPlay.filename}
                    className="px-3 py-1.5 bg-[#8b9d77] hover:bg-[#798a67] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'ڈاؤن لوڈ' : 'Download'}</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedClipToPlay(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                >
                  {isUrdu ? 'بند کریں' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {clipToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#ecece0] space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#4a4a35]">
              {isUrdu ? 'کیا آپ یہ ویڈیو مستقل حذف کرنا چاہتے ہیں؟' : 'Permanently Delete Video Clip?'}
            </h3>
            <p className="text-xs text-[#8e8e75] font-mono break-all">
              {clipToDelete.filename}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClipToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#f0f0e4] hover:bg-[#e2e2d5] text-[#5a5a40] font-bold text-xs cursor-pointer"
              >
                {isUrdu ? 'منسوخ کریں' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                {isUrdu ? 'ہاں، حذف کریں' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMISSION EXPLANATION PRE-MODAL */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#ecece0] space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#8b9d77]/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#8b9d77]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#4a4a35]">
                  {isUrdu ? 'کیمرہ و آڈیو اجازت درکار ہے' : 'Camera & Microphone Access Needed'}
                </h3>
                <p className="text-[11px] text-[#8e8e75]">
                  {isUrdu ? 'ڈرائیور دوست ڈیش کیم سیکیورٹی سسٹم' : 'Driver Dost Dashcam Security System'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-[#5a5a40]">
              <div className="p-3 bg-[#fdfbf7] rounded-xl border border-[#ecece0] flex items-start gap-2.5">
                <Camera className="w-4 h-4 text-[#8b9d77] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>{isUrdu ? 'پچھلا کیمرہ (روڈ منظر):' : 'Rear Camera:'}</strong> {isUrdu ? 'سڑک، ٹریفک اور سفر کا مکمل منظر ریکارڈ کرنے کے لیے استعمال ہوتا ہے۔' : 'Used to capture continuous road traffic and driving condition footage.'}
                </p>
              </div>

              <div className="p-3 bg-[#fdfbf7] rounded-xl border border-[#ecece0] flex items-start gap-2.5">
                <Mic className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>{isUrdu ? 'مائیکروفون (آڈیو):' : 'Microphone:'}</strong> {isUrdu ? 'کسی بھی ناخوشگوار واقعے میں مستند آواز کا ثبوت ویڈیو کے ساتھ یکجا محفوظ ہوتا ہے۔' : 'Syncs authentic audio evidence with the driving video file.'}
                </p>
              </div>

              <div className="p-3 bg-[#fdfbf7] rounded-xl border border-[#ecece0] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#1e3a68] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>{isUrdu ? 'پس منظر میں ریکارڈنگ:' : 'Foreground Recording Service:'}</strong> {isUrdu ? 'اسکرین لاک یا فون بند ہونے کی صورت میں بھی ریکارڈنگ منقطع نہیں ہوتی۔' : 'Allows recording to survive screen lock and app switching uninterrupted.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPermissionModal(false)}
                className="flex-1 py-3 rounded-xl bg-[#f0f0e4] hover:bg-[#e2e2d5] text-[#5a5a40] font-bold text-xs cursor-pointer"
              >
                {isUrdu ? 'منسوخ کریں' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleGrantPermissions}
                className="flex-1 py-3 rounded-xl bg-[#1e3a68] hover:bg-[#162a4d] text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                {isUrdu ? 'اجازت دیں اور شروع کریں' : 'Allow & Start'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
