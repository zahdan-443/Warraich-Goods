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
  Film,
  Layers,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  Moon
} from 'lucide-react';
import { Language, ActiveTab } from '../../types';
import { 
  DashcamClip, 
  DashcamStatus, 
  DualCameraCapability,
  startDashcamRecording, 
  stopDashcamRecording, 
  getDashcamStatus, 
  listDashcamClips, 
  deleteDashcamClip, 
  playDashcamClip, 
  shareDashcamClip, 
  checkDashcamPermissions, 
  requestDashcamPermissions,
  checkDualCameraCapability,
  subscribeDashcamStatus,
  isNativeDashcamAvailable,
  getDashcamPlatform
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

  // Platform & Power Save State
  const platform = getDashcamPlatform();
  const [oledBlackoutMode, setOledBlackoutMode] = useState(false);
  const [showBrowserBackgroundWarning, setShowBrowserBackgroundWarning] = useState(false);

  // Dual-Camera State
  const [dualCapability, setDualCapability] = useState<DualCameraCapability>({ supported: false });
  const [selectedMode, setSelectedMode] = useState<'auto' | 'dual' | 'rear'>('auto');
  const [isDualActive, setIsDualActive] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [showDualNoticeDismissed, setShowDualNoticeDismissed] = useState(false);
  const [showHardwareDetails, setShowHardwareDetails] = useState(false);

  // Clips State
  const [clips, setClips] = useState<DashcamClip[]>([]);
  const [loadingClips, setLoadingClips] = useState(true);
  const [selectedClipToPlay, setSelectedClipToPlay] = useState<DashcamClip | null>(null);
  const [clipToDelete, setClipToDelete] = useState<DashcamClip | null>(null);
  const [sharingClipId, setSharingClipId] = useState<string | null>(null);
  const [clipFilter, setClipFilter] = useState<'all' | 'rear' | 'front'>('all');

  // Permissions & Explanation Modal
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [checkingPerms, setCheckingPerms] = useState(true);

  // Live Camera Preview
  const [showPreview, setShowPreview] = useState(true);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Load initial status, dual camera capability & clips
  useEffect(() => {
    let isMounted = true;

    async function init() {
      // 1. Check permissions
      const perms = await checkDashcamPermissions();
      if (isMounted) {
        setHasPermissions(perms.camera && perms.microphone);
        setCheckingPerms(false);
      }

      // 2. Check dual-camera capability via CameraManager.getConcurrentCameraIds()
      const capability = await checkDualCameraCapability();
      if (isMounted) {
        setDualCapability(capability);
        if (!capability.supported && capability.reason) {
          setFallbackReason(capability.reason);
        }
      }

      // 3. Check current recording status
      const status = await getDashcamStatus();
      if (isMounted) {
        setIsRecording(status.isRecording);
        setElapsedSeconds(status.elapsedSeconds);
        setIsDualActive(!!status.isDualMode);
        if (status.fallbackReason) {
          setFallbackReason(status.fallbackReason);
        }
      }

      // 4. List saved clips
      await refreshClips();
    }

    init();

    // Listen to foreground service status broadcasts
    const unsubscribe = subscribeDashcamStatus((status) => {
      setIsRecording(status.isRecording);
      setElapsedSeconds(status.elapsedSeconds);
      setIsDualActive(!!status.isDualMode);
      if (status.fallbackReason) {
        setFallbackReason(status.fallbackReason);
      }
      if (!status.isRecording) {
        refreshClips();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Monitor visibility state: if in browser and phone screen is turned off by power button, warn user to use OLED Saver
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && isRecording && platform === 'web') {
        setShowBrowserBackgroundWarning(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRecording, platform]);

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

    // If starting and permissions not granted, show permission rationale modal
    if (!isRecording && !hasPermissions) {
      setShowPermissionModal(true);
      return;
    }

    setLoadingAction(true);

    if (isRecording) {
      // Stop recording
      const res = await stopDashcamRecording();
      setLoadingAction(false);
      if (res.success) {
        setIsRecording(false);
        setIsDualActive(false);
        setElapsedSeconds(0);
        await refreshClips();
      } else {
        setErrorMessage(isUrdu ? 'ریکارڈنگ روکنے میں مسئلہ پیش آیا۔' : 'Failed to stop recording cleanly.');
      }
    } else {
      // Start recording
      const res = await startDashcamRecording({
        mode: selectedMode,
        videoElement: showPreview ? videoPreviewRef.current : null,
      });
      setLoadingAction(false);

      if (res.success) {
        setIsRecording(true);
        setIsDualActive(!!res.isDualMode);
        if (res.fallbackReason) {
          setFallbackReason(res.fallbackReason);
        }
      } else {
        setErrorMessage(
          res.message || (isUrdu ? 'ریکارڈنگ شروع نہیں ہو سکی۔ براہ کرم کیمرہ کی اجازت چیک کریں۔' : 'Failed to start recording. Please check camera permissions.')
        );
      }
    }
  };

  const handleConfirmPermissions = async () => {
    setCheckingPerms(true);
    const granted = await requestDashcamPermissions();
    setCheckingPerms(false);
    setShowPermissionModal(false);

    if (granted.camera && granted.microphone) {
      setHasPermissions(true);
      // Automatically trigger recording once permissions are granted
      setLoadingAction(true);
      const res = await startDashcamRecording({
        mode: selectedMode,
        videoElement: showPreview ? videoPreviewRef.current : null,
      });
      setLoadingAction(false);
      if (res.success) {
        setIsRecording(true);
        setIsDualActive(!!res.isDualMode);
      }
    } else {
      setErrorMessage(
        isUrdu
          ? 'کیمرہ یا مائیکروفون کی اجازت نہیں ملی۔ براہ کرم ایپ سیٹنگز سے اجازت دیں۔'
          : 'Camera or microphone permission was denied. Please grant permissions in App Settings to use Dashcam.'
      );
    }
  };

  const handleDeleteClip = async () => {
    if (!clipToDelete) return;
    const ok = await deleteDashcamClip(clipToDelete);
    if (ok) {
      setClips((prev) => prev.filter((c) => c.id !== clipToDelete.id));
      setClipToDelete(null);
    } else {
      setErrorMessage(isUrdu ? 'فائل ڈیلیٹ نہیں ہو سکی۔' : 'Could not delete clip file.');
    }
  };

  const handlePlayClip = async (clip: DashcamClip) => {
    if (isNativeDashcamAvailable()) {
      await playDashcamClip(clip);
    } else {
      // In web, open playback modal
      setSelectedClipToPlay(clip);
    }
  };

  const handleShareClip = async (clip: DashcamClip) => {
    setSharingClipId(clip.id);
    try {
      await shareDashcamClip(clip);
    } catch (err) {
      console.warn('Share error', err);
      setErrorMessage(isUrdu ? 'ویڈیو شیئر کرنے میں مسئلہ پیش آیا۔' : 'Failed to share video clip.');
    } finally {
      setSharingClipId(null);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      const remMins = mins % 60;
      return `${String(hrs).padStart(2, '0')}:${String(remMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  // Filter clips based on selected filter
  const filteredClips = clips.filter((c) => {
    if (clipFilter === 'all') return true;
    if (clipFilter === 'rear') return c.cameraType === 'rear' || c.cameraType === 'single';
    if (clipFilter === 'front') return c.cameraType === 'front';
    return true;
  });

  return (
    <div className={`min-h-screen bg-[#F4F6F0] pb-24 ${isUrdu ? 'rtl font-urdu' : 'ltr font-sans'}`}>
      {/* Top Header Bar */}
      <div className="bg-[#1b4332] text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white/90"
              aria-label={isUrdu ? 'واپس ہوم' : 'Back to Home'}
            >
              <ArrowLeft className={`w-5 h-5 ${isUrdu ? 'rotate-180' : ''}`} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#40916c] rounded-lg shadow-sm">
                  <Video className="w-5 h-5 text-white" />
                </span>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {isUrdu ? 'ڈیش کیم ویڈیو ریکارڈر' : 'Transport Dashcam'}
                </h1>
              </div>
              <p className="text-xs text-[#d8f3dc]/80 font-medium">
                {isUrdu
                  ? 'بیک گراؤنڈ روڈ اور کیبن ریکارڈنگ • اسکرین آف پر بھی جاری'
                  : 'Background road & cabin recording • Continues with screen locked'}
              </p>
            </div>
          </div>

          {/* Quick Dual Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/20 border border-white/10 text-[#d8f3dc]">
            <Radio className={`w-3.5 h-3.5 ${isRecording ? 'text-red-400 animate-pulse' : 'text-emerald-300'}`} />
            <span>
              {isRecording 
                ? (isDualActive ? (isUrdu ? 'ڈوئل ریکارڈنگ جاری ہے' : 'Dual Recording Active') : (isUrdu ? 'روڈ ریکارڈنگ جاری ہے' : 'Road Recording Active'))
                : (isUrdu ? 'تیار (اسٹینڈ بائی)' : 'Standby')}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start justify-between gap-3 text-red-800 text-sm animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{isUrdu ? 'خرابی' : 'Error'}</p>
                <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Mobile Browser Power Button Lock Warning */}
        {showBrowserBackgroundWarning && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start justify-between gap-3 text-amber-900 text-xs animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{isUrdu ? 'موبائل براؤزر نوٹس (Mobile Browser Notice)' : 'Mobile Web Browser Screen Lock Notice'}</p>
                <p className="mt-0.5 leading-relaxed">
                  {isUrdu
                    ? 'جب آپ موبائل براؤزر میں پاور بٹن دباتے ہیں، تو براؤزر سیکیورٹی کے تحت کیمرہ ویڈیو وقتی طور پر فریز کر دیتا ہے۔ ڈرائیونگ کے دوران اسکرین خودکار طور پر بند نہیں ہوگی (ویک لاک فعال ہے)۔ اگر آپ اسکرین کو ڈارک کر کے بیٹری بچانا چاہتے ہیں تو نیچے "سکرین ڈارک کریں" کا بٹن دبائیں۔'
                    : 'Mobile web browsers pause camera video when the physical power button is pressed. Screen WakeLock keeps the screen awake while driving. To dim the display and save battery without freezing the camera, tap "Black Screen Mode" below!'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBrowserBackgroundWarning(false)}
              className="p-1 text-amber-600 hover:text-amber-800 rounded-lg hover:bg-amber-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Phase 2: Dual Camera Hardware Support Banner (Explaining why dual is or isn't supported) */}
        {!dualCapability.supported && !showDualNoticeDismissed && (
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 shadow-sm text-amber-900 animate-in fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
                  <Info className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-amber-900">
                      {isUrdu ? 'ڈوئل کیمرہ سپورٹ کی تفصیل (Dual-Camera Capability)' : 'Dual-Camera Hardware Capability Notice'}
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-800">
                      {isUrdu ? 'سنگل کیمرہ فال بیک' : 'Single Road Fallback'}
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    {isUrdu
                      ? 'اس ڈیوائس کا ہارڈویئر بیک وقت ڈوئل کیمرہ (سامنے اور اندرون کیبن) سپورٹ نہیں کرتا۔ ایپ خودکار طور پر بغیر کسی رکاوٹ کے مرکزی روڈ کیمرہ استعمال کرے گی۔'
                      : 'Dual-camera simultaneous capture (front cabin + rear road) is not supported on this device hardware. Recording will reliably proceed using the primary Road camera.'}
                  </p>

                  {/* Toggle Hardware Details */}
                  <button
                    onClick={() => setShowHardwareDetails(!showHardwareDetails)}
                    className="mt-2 text-xs font-semibold text-amber-900 flex items-center gap-1 hover:underline"
                  >
                    <span>{isUrdu ? 'ہارڈویئر کی تفصیلات دیکھیں' : 'View Hardware Diagnostic Details'}</span>
                    {showHardwareDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showHardwareDetails && (
                    <div className="mt-2 p-2.5 bg-white/70 rounded-xl border border-amber-200 text-xs font-mono text-amber-950 space-y-1">
                      <p>• API Check: {dualCapability.apiLevel ? `Android API ${dualCapability.apiLevel}` : 'CameraManager concurrent check'}</p>
                      <p>• Reason: {fallbackReason || dualCapability.reason || 'CameraManager.getConcurrentCameraIds() returned empty or single stream supported.'}</p>
                      <p className="text-[11px] text-amber-800 font-sans">
                        {isUrdu
                          ? 'نوٹ: اینڈرائیڈ 11+ پر صرف مخصوص فلیگ شپ چپ سیٹس بیک وقت دو کیمرہ سینسرز پر انکوڈنگ کی اجازت دیتے ہیں۔'
                          : 'Note: On Android, concurrent camera streaming requires hardware ISP support reported by CameraManager.getConcurrentCameraIds().'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowDualNoticeDismissed(true)}
                className="text-amber-500 hover:text-amber-700 p-1 rounded-lg hover:bg-amber-100/50"
                title={isUrdu ? 'بند کریں' : 'Dismiss'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* When Dual IS supported */}
        {dualCapability.supported && (
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 shadow-sm text-emerald-900 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-emerald-950">
                  {isUrdu ? 'ڈوئل کیمرہ سینسرز فعال ہیں (Concurrent Dual Ready)' : 'Dual-Camera Hardware Supported'}
                </p>
                <p className="text-[11px] text-emerald-700">
                  {isUrdu ? 'روڈ اور کیبن دونوں کیمرے بیک وقت دو علیحدہ سنکڈ کلپس میں ریکارڈ ہو سکتے ہیں۔' : 'Simultaneous road and cabin recording is fully available.'}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 bg-emerald-200/70 text-emerald-800 rounded-full">
              {isUrdu ? 'سپورٹ موجود ہے' : 'Dual Ready'}
            </span>
          </div>
        )}

        {/* Main Recorder Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e2e8d8] space-y-5">
          {/* Active Recording Engine Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${platform === 'native' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
              <span className="font-semibold text-gray-800">
                {platform === 'native'
                  ? (isUrdu ? 'پلیٹ فارم: اینڈرائیڈ فار گراؤنڈ سروس (Native CameraX Background Service)' : 'Platform: Native Android Foreground Service (Screen Lock Continuous)')
                  : (isUrdu ? 'پلیٹ فارم: ویب موڈ (اسکرین ویک لاک فعال ہے تاکہ ڈرائیونگ کے دوران ڈسپلے سلیپ نہ ہو)' : 'Platform: Web Mode (Screen WakeLock Active • Display Keeps Awake)')}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
              {platform === 'native' ? 'Capacitor Native' : 'Web / Browser'}
            </span>
          </div>

          {/* Mode Selector (When Dual is available or when selecting) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#1b4332]" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                {isUrdu ? 'ریکارڈنگ موڈ کا انتخاب' : 'Recording Mode'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-2xl">
              <button
                type="button"
                disabled={isRecording}
                onClick={() => setSelectedMode('auto')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedMode === 'auto'
                    ? 'bg-white text-[#1b4332] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isUrdu ? 'خودکار (Auto Dual/Road)' : 'Auto (Dual/Road)'}
              </button>

              <button
                type="button"
                disabled={isRecording || !dualCapability.supported}
                onClick={() => setSelectedMode('dual')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedMode === 'dual'
                    ? 'bg-[#1b4332] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                } ${isRecording || !dualCapability.supported ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!dualCapability.supported ? (isUrdu ? 'ڈوئل کیمرہ ہارڈویئر موجود نہیں' : 'Dual hardware unavailable') : ''}
              >
                {isUrdu ? 'ڈوئل کیبن + روڈ' : 'Dual (Road + Cabin)'}
              </button>

              <button
                type="button"
                disabled={isRecording}
                onClick={() => setSelectedMode('rear')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedMode === 'rear'
                    ? 'bg-white text-[#1b4332] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isUrdu ? 'صرف روڈ کیمرہ' : 'Road Only'}
              </button>
            </div>
          </div>

          {/* Live Viewfinder / Status Display */}
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video sm:aspect-[21/9] max-h-[300px] flex items-center justify-center shadow-inner border border-gray-900">
            {/* Native or Web Viewfinder Video */}
            <video
              ref={videoPreviewRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover ${showPreview && isRecording ? 'block' : 'hidden'}`}
            />

            {/* Standby / Non-preview UI */}
            {(!showPreview || !isRecording) && (
              <div className="text-center p-6 space-y-3 z-10">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto text-white/70 backdrop-blur-sm">
                  {isRecording ? (
                    <Radio className="w-8 h-8 text-red-500 animate-pulse" />
                  ) : (
                    <Camera className="w-8 h-8 text-white/80" />
                  )}
                </div>
                <p className="text-white font-semibold text-sm sm:text-base">
                  {isRecording
                    ? (isDualActive 
                        ? (isUrdu ? 'بیک گراؤنڈ ڈوئل ریکارڈنگ فعال ہے (روڈ + کیبن)' : 'Dual Foreground Recording Active (Road + Cabin)')
                        : (isUrdu ? 'بیک گراؤنڈ روڈ ریکارڈنگ فعال ہے' : 'Road Foreground Recording Active'))
                    : (isUrdu ? 'ڈیش کیم تیار ہے • شروع کرنے کے لیے بٹن دبائیں' : 'Dashcam Standby • Press Record to Begin')}
                </p>
                <p className="text-xs text-white/60 max-w-sm mx-auto">
                  {isUrdu
                    ? 'فار گراؤنڈ سروس کیمرہ اور مائیکروفون کے ساتھ اسکرین لاک ہونے پر بھی بلا تعطل ریکارڈنگ جاری رکھتی ہے۔'
                    : 'Foreground Service ensures uninterrupted video + audio recording even when screen is locked.'}
                </p>
              </div>
            )}

            {/* Overlay Badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              {/* Active Recording Pill */}
              <div className="flex items-center gap-2">
                {isRecording ? (
                  <div className="flex items-center gap-2 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide backdrop-blur-md shadow-md animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    <span>REC</span>
                    <span className="font-mono text-xs">{formatTime(elapsedSeconds)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-black/60 text-white/80 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>STANDBY</span>
                  </div>
                )}

                {/* Dual Mode Indicator */}
                {isRecording && isDualActive && (
                  <div className="bg-emerald-600/90 text-white px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md shadow-md flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>{isUrdu ? 'ڈوئل سنکڈ' : 'DUAL SYNC'}</span>
                  </div>
                )}
              </div>

              {/* Preview Toggle Button */}
              {isRecording && (
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="pointer-events-auto p-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white/90 backdrop-blur-sm border border-white/10 transition-colors"
                  title={showPreview ? (isUrdu ? 'پریویو چھپائیں' : 'Hide Preview') : (isUrdu ? 'پریویو دکھائیں' : 'Show Preview')}
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* Bottom Stream Labels if Dual Recording */}
            {isRecording && isDualActive && (
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-semibold text-white/90 pointer-events-none">
                <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                  🟢 {isUrdu ? 'روڈ کیمرہ: ایکٹو' : 'Road Cam: Active'}
                </span>
                <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                  🟢 {isUrdu ? 'کیبن کیمرہ: ایکٹو' : 'Cabin Cam: Active'}
                </span>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col items-center justify-center pt-2 pb-1">
            <button
              onClick={handleToggleRecording}
              disabled={loadingAction}
              className={`w-full max-w-sm py-4 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                  : 'bg-[#1b4332] hover:bg-[#2d6a4f] text-white shadow-[#1b4332]/30'
              } ${loadingAction ? 'opacity-80 cursor-wait' : ''}`}
            >
              {loadingAction ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : isRecording ? (
                <>
                  <Square className="w-6 h-6 fill-current" />
                  <span>{isUrdu ? 'ریکارڈنگ بند کریں (Stop Recording)' : 'Stop Recording'}</span>
                </>
              ) : (
                <>
                  <Video className="w-6 h-6" />
                  <span>
                    {isUrdu
                      ? (dualCapability.supported && selectedMode !== 'rear' ? 'ڈوئل ریکارڈنگ شروع کریں' : 'روڈ ریکارڈنگ شروع کریں')
                      : (dualCapability.supported && selectedMode !== 'rear' ? 'Start Dual Recording' : 'Start Road Recording')}
                  </span>
                </>
              )}
            </button>

            {/* OLED Black Screen Saver Button */}
            {isRecording && (
              <button
                type="button"
                onClick={() => setOledBlackoutMode(true)}
                className="mt-3 px-4 py-2.5 rounded-2xl bg-gray-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 active:scale-95 transition-all shadow-md"
              >
                <Moon className="w-4 h-4 text-amber-300" />
                <span>{isUrdu ? 'سکرین ڈارک کریں (OLED بیٹری سیور)' : 'Black Screen Mode (OLED Battery Saver)'}</span>
              </button>
            )}

            {/* Operational notice */}
            <p className="text-center text-xs text-gray-500 mt-2.5">
              {isRecording
                ? (isUrdu
                    ? 'ریکارڈنگ فائل الگ اور محفوظ طور پر محفوظ کی جائے گی۔ کوئی خودکار ڈیلیٹ یا لوپ اوور رائٹ نہیں ہے۔'
                    : 'Recording is saved as a permanent timestamped clip. No loop auto-deletion.')
                : (isUrdu
                    ? 'ریکارڈنگ صرف آپ کے بٹن دبانے سے شروع ہوگی تاکہ اسٹوریج کنٹرول میں رہے۔'
                    : 'Manual start/stop ensures you retain full control over device storage.')}
            </p>
          </div>
        </div>

        {/* Saved Clips Section */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e2e8d8] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-[#1b4332]" />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  {isUrdu ? 'محفوظ شدہ کلپس (Saved Clips)' : 'Saved Dashcam Clips'}
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {clips.length}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {isUrdu
                  ? 'تمام ویڈیوز مستقل محفوظ ہیں۔ آپ کسی بھی وقت دیکھ یا ڈیلیٹ کر سکتے ہیں۔'
                  : 'All clips are permanently retained until you manually delete them.'}
              </p>
            </div>

            {/* Clip Filter Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setClipFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  clipFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isUrdu ? 'تمام' : 'All'}
              </button>
              <button
                type="button"
                onClick={() => setClipFilter('rear')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  clipFilter === 'rear' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isUrdu ? 'روڈ (Road)' : 'Road'}
              </button>
              <button
                type="button"
                onClick={() => setClipFilter('front')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  clipFilter === 'front' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isUrdu ? 'کیبن (Cabin)' : 'Cabin'}
              </button>
            </div>
          </div>

          {/* Clips List */}
          {loadingClips ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#1b4332]" />
              <p className="text-xs">{isUrdu ? 'کلپس لوڈ ہو رہے ہیں...' : 'Loading clips...'}</p>
            </div>
          ) : filteredClips.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto text-gray-300">
                <Video className="w-7 h-7" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                {isUrdu ? 'ابھی کوئی کلپ محفوظ نہیں ہے۔' : 'No recorded clips found.'}
              </p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                {isUrdu
                  ? 'ریکارڈنگ بٹن دبائیں اور سفر کے دوران ویڈیو محفوظ کریں۔'
                  : 'Start recording during trips to capture tamper-evident video footage.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredClips.map((clip) => {
                const isCabin = clip.cameraType === 'front';
                const isRoad = clip.cameraType === 'rear';

                return (
                  <div
                    key={clip.id}
                    className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 bg-gray-50/70 hover:bg-white transition-all space-y-3 shadow-sm hover:shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        {/* Camera Tag Badge */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isCabin ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <span>📷</span>
                              <span>{isUrdu ? 'کیبن کیمرہ (Cabin)' : 'Cabin Camera'}</span>
                            </span>
                          ) : isRoad ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                              <span>🛣️</span>
                              <span>{isUrdu ? 'روڈ کیمرہ (Road)' : 'Road Camera'}</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-800">
                              {isUrdu ? 'ڈیش کیم' : 'Dashcam'}
                            </span>
                          )}

                          {clip.pairId && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              {isUrdu ? 'ہم وقت جوڑا' : 'Synced Pair'}
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-bold text-gray-800 font-mono truncate max-w-[240px]" title={clip.filename}>
                          {clip.filename}
                        </p>
                      </div>

                      {/* File Size */}
                      <span className="text-[11px] font-mono text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-150 shrink-0">
                        {formatFileSize(clip.sizeBytes)}
                      </span>
                    </div>

                    {/* Metadata: Date & Duration */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{clip.durationSeconds > 0 ? formatTime(clip.durationSeconds) : '< 1s'}</span>
                      </div>
                      <span className="text-[11px] text-gray-400">{clip.dateFormatted}</span>
                    </div>

                    {/* Actions: Play, Share & Delete */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => handlePlayClip(clip)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isUrdu ? 'چلائیں (Play)' : 'Play Video'}</span>
                      </button>

                      {/* Share Video Button */}
                      <button
                        type="button"
                        onClick={() => handleShareClip(clip)}
                        disabled={sharingClipId === clip.id}
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors flex items-center justify-center active:scale-95"
                        title={isUrdu ? 'ویڈیو شیئر کریں (WhatsApp/Email)' : 'Share Video'}
                      >
                        {sharingClipId === clip.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>

                      {clip.blobUrl && (
                        <a
                          href={clip.blobUrl}
                          download={clip.filename}
                          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                          title={isUrdu ? 'ڈاؤن لوڈ' : 'Download'}
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        onClick={() => setClipToDelete(clip)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        title={isUrdu ? 'ڈیلیٹ کریں' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Permissions Explanation Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#1b4332]/10 rounded-2xl text-[#1b4332] shrink-0">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {isUrdu ? 'کیمرہ اور مائیکروفون کی اجازت' : 'Camera & Microphone Access'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isUrdu ? 'ڈیش کیم ریکارڈنگ کے لیے ضروری منظوری' : 'Required for background vehicle recording'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-gray-600 bg-[#F4F6F0] p-4 rounded-2xl">
              <div className="flex items-start gap-2.5">
                <span className="p-1 bg-[#1b4332] text-white rounded-md text-[10px]">1</span>
                <div>
                  <span className="font-bold text-gray-800">{isUrdu ? 'روڈ اور کیبن کیمرہ:' : 'Road & Cabin Cameras:'}</span>
                  <p className="text-gray-500 mt-0.5">
                    {isUrdu
                      ? 'سفر اور ڈرائیونگ کے دوران ثبوت کے لیے ایچ ڈی ویڈیو محفوظ کی جاتی ہے۔'
                      : 'Records video evidence during journeys.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="p-1 bg-[#1b4332] text-white rounded-md text-[10px]">2</span>
                <div>
                  <span className="font-bold text-gray-800">{isUrdu ? 'مائیکروفون (آڈیو):' : 'Microphone (Audio):'}</span>
                  <p className="text-gray-500 mt-0.5">
                    {isUrdu
                      ? 'ہارن اور گفتگو کا آڈیو ثبوت ویڈیو کے ساتھ ملایا جاتا ہے۔'
                      : 'Records audio synchronized with dashcam video.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="p-1 bg-[#1b4332] text-white rounded-md text-[10px]">3</span>
                <div>
                  <span className="font-bold text-gray-800">{isUrdu ? 'فار گراؤنڈ سروس:' : 'Foreground Service:'}</span>
                  <p className="text-gray-500 mt-0.5">
                    {isUrdu
                      ? 'اسکرین بند ہونے یا دوسری ایپ کھولنے پر بھی نوٹیفکیشن بار میں ریکارڈنگ برقرار رہتی ہے۔'
                      : 'Allows recording to persist safely while the device screen is off.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPermissionModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 active:scale-95 transition-all"
              >
                {isUrdu ? 'منسوخ کریں' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmPermissions}
                disabled={checkingPerms}
                className="flex-1 py-3 px-4 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
              >
                {checkingPerms ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isUrdu ? 'اجازت منظور کریں' : 'Grant & Record'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {clipToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900">
                {isUrdu ? 'کیا آپ یہ کلپ ڈیلیٹ کرنا چاہتے ہیں؟' : 'Delete Dashcam Clip?'}
              </h3>
              <p className="text-xs text-gray-500 font-mono truncate px-4">{clipToDelete.filename}</p>
              <p className="text-xs text-gray-400">
                {isUrdu ? 'یہ ویڈیو ڈیوائس اسٹوریج سے مستقل طور پر خارج ہو جائے گی۔' : 'This video will be permanently removed from device storage.'}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setClipToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50"
              >
                {isUrdu ? 'منسوخ' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteClip}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
              >
                {isUrdu ? 'ڈیلیٹ کریں' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Web In-App Video Player Modal */}
      {selectedClipToPlay && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-white/10 space-y-3 p-4">
            <div className="flex items-center justify-between text-white pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold truncate max-w-[280px]">
                  {selectedClipToPlay.filename}
                </span>
              </div>
              <button
                onClick={() => setSelectedClipToPlay(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
              <video
                src={selectedClipToPlay.path || selectedClipToPlay.blobUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-white/60 pt-1">
              <span>{selectedClipToPlay.dateFormatted}</span>
              <span>{formatFileSize(selectedClipToPlay.sizeBytes)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Pure Black OLED Saver */}
      {oledBlackoutMode && isRecording && (
        <div 
          onClick={() => setOledBlackoutMode(false)}
          className="fixed inset-0 z-[100] bg-black text-white flex flex-col justify-between items-center p-8 select-none cursor-pointer animate-in fade-in"
        >
          <div className="flex items-center gap-2 text-xs text-red-500 animate-pulse pt-4">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span className="font-mono font-bold tracking-wider">REC {formatTime(elapsedSeconds)}</span>
          </div>

          <div className="text-center space-y-2 max-w-xs">
            <Moon className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
            <p className="text-xs text-gray-400 font-medium">
              {isUrdu ? 'OLED اسکرین سیور فعال ہے • کیمرہ مسلسل ویڈیو ریکارڈ کر رہا ہے' : 'OLED Saver Active • Continuous Video Recording'}
            </p>
            <p className="text-[11px] text-gray-600">
              {isUrdu ? 'کنٹرولز واپس دیکھنے کے لیے اسکرین پر کہیں بھی ٹیپ کریں' : 'Tap anywhere on screen to restore controls'}
            </p>
          </div>

          <div className="text-[10px] text-gray-700 pb-4 font-mono">
            Driver Dost Dashcam
          </div>
        </div>
      )}
    </div>
  );
};
