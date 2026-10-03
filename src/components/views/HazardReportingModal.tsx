import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Droplets, 
  AlertTriangle, 
  Ban, 
  Gauge, 
  X, 
  MapPin, 
  Loader2, 
  CheckCircle2, 
  LogIn
} from 'lucide-react';
import { Language } from '../../types';
import { 
  HazardCategory, 
  HAZARD_CATEGORIES, 
  submitHazardReport, 
  findNearestCity 
} from '../../utils/hazardReports';
import { auth, loginWithGoogle } from '../../utils/firebase';

interface HazardReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentGpsLocation?: { lat: number; lng: number } | null;
  onReportSubmitted?: () => void;
}

export const HazardReportingModal: React.FC<HazardReportingModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentGpsLocation,
  onReportSubmitted
}) => {
  const isUrdu = lang === 'ur';
  const [submittingCategory, setSubmittingCategory] = useState<HazardCategory | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentUser = auth.currentUser;

  // Resolve nearest city if GPS coordinates are currently known
  const nearestCity = currentGpsLocation 
    ? findNearestCity(currentGpsLocation.lat, currentGpsLocation.lng)
    : null;

  const handleSelectCategory = async (category: HazardCategory) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Auth check
    if (!currentUser) {
      setErrorMessage(
        isUrdu 
          ? 'خطرہ رپورٹ کرنے کے لیے براہ کرم گوگل سے سائن ان کریں۔' 
          : 'Please sign in with Google to report a road hazard.'
      );
      return;
    }

    setSubmittingCategory(category);

    // 2. Resolve GPS Location
    let targetLat = currentGpsLocation?.lat;
    let targetLng = currentGpsLocation?.lng;

    if (!targetLat || !targetLng) {
      if (!('geolocation' in navigator)) {
        setErrorMessage(
          isUrdu 
            ? 'آپ کے براؤزر میں جی پی ایس لوکیشن دستیاب نہیں ہے۔' 
            : 'GPS location is not supported by your browser.'
        );
        setSubmittingCategory(null);
        return;
      }

      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 10000
          });
        });
        targetLat = pos.coords.latitude;
        targetLng = pos.coords.longitude;
      } catch (geoErr: any) {
        console.warn('Geolocation error:', geoErr);
        setErrorMessage(
          isUrdu 
            ? 'جی پی ایس لوکیشن حاصل نہ ہو سکی۔ براہ کرم لوکیشن کی اجازت آن کریں۔' 
            : 'Could not obtain GPS location. Please allow location permissions.'
        );
        setSubmittingCategory(null);
        return;
      }
    }

    // 3. Submit report to Firestore
    try {
      const res = await submitHazardReport({
        category,
        lat: targetLat,
        lng: targetLng,
        reporterUid: currentUser.uid
      });

      if (res.success) {
        const catMeta = HAZARD_CATEGORIES[category];
        const catName = isUrdu ? catMeta.labelUr : catMeta.labelEn;
        setSuccessMessage(
          isUrdu 
            ? `شکریہ! "${catName}" رپورٹ کر دیا گیا ہے۔` 
            : `Thank you! "${catName}" has been reported successfully.`
        );
        onReportSubmitted?.();

        // Auto-close after brief acknowledgment
        setTimeout(() => {
          onClose();
          setSubmittingCategory(null);
          setSuccessMessage(null);
        }, 1500);
      } else {
        setErrorMessage(
          res.error === 'Please wait a few minutes before reporting again'
            ? (isUrdu 
                ? 'براہ کرم دوبارہ رپورٹ کرنے سے پہلے چند منٹ انتظار کریں۔' 
                : 'Please wait a few minutes before reporting again.')
            : (res.error || 'Failed to submit report')
        );
        setSubmittingCategory(null);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error submitting report.');
      setSubmittingCategory(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
      setIsSigningIn(false);
    } catch {
      setIsSigningIn(false);
      setErrorMessage(
        isUrdu ? 'لاگ ان مکمل نہ ہو سکا۔ دوبارہ کوشش کریں۔' : 'Sign-in failed. Please try again.'
      );
    }
  };

  const renderIcon = (cat: HazardCategory) => {
    switch (cat) {
      case 'checkpoint':
        return <ShieldAlert className="w-6 h-6 text-blue-600" />;
      case 'flooding':
        return <Droplets className="w-6 h-6 text-cyan-600" />;
      case 'accident':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'closure':
        return <Ban className="w-6 h-6 text-amber-600" />;
      case 'traffic':
        return <Gauge className="w-6 h-6 text-purple-600" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#ecece0] overflow-hidden flex flex-col max-h-[90vh]"
        dir={isUrdu ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1c1c16] to-[#2c2c22] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {isUrdu ? 'سڑک پر خطرہ رپورٹ کریں' : 'Report Road Hazard'}
              </h3>
              <p className="text-xs text-white/70">
                {isUrdu 
                  ? 'ایک ٹیپ پر ساتھی ڈرائیوروں کو الرٹ کریں' 
                  : 'Alert fellow drivers with a single tap'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title={isUrdu ? 'بند کریں' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS location preview banner */}
        <div className="px-4 py-2.5 bg-[#fbfbf9] border-b border-[#ecece0] flex items-center justify-between text-xs text-[#5a5a40]">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              {currentGpsLocation ? (
                nearestCity ? (
                  <span>
                    {isUrdu ? 'مقام:' : 'Near:'}{' '}
                    <strong>{isUrdu ? nearestCity.nameUr : nearestCity.nameEn}</strong>
                    {' '}({currentGpsLocation.lat.toFixed(3)}, {currentGpsLocation.lng.toFixed(3)})
                  </span>
                ) : (
                  <span>GPS: {currentGpsLocation.lat.toFixed(3)}, {currentGpsLocation.lng.toFixed(3)}</span>
                )
              ) : (
                <span>{isUrdu ? 'جی پی ایس لوکیشن حاصل کی جائے گی' : 'Current GPS location will be used'}</span>
              )}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full shrink-0">
            {isUrdu ? 'لائیو GPS' : 'Live GPS'}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
          {/* Success Notification */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Notification */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-1">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <div className="flex-1">
                <p>{errorMessage}</p>
                {!currentUser && (
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isSigningIn}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    {isSigningIn ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LogIn className="w-3.5 h-3.5" />
                    )}
                    <span>{isUrdu ? 'گوگل سے لاگ ان کریں' : 'Sign in with Google'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-[#5a5a40] leading-relaxed">
            {isUrdu 
              ? 'نیچے دیے گئے خطرے کی کیٹیگری پر ٹیپ کریں۔ رپورٹ فوری طور پر قریبی ڈرائیوروں اور روٹ کے نقشے پر نظر آئے گی:' 
              : 'Tap a category below to submit instantly. Your alert will appear on the corridor map for other drivers:'}
          </p>

          {/* 5 Fast One-Tap Category Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(Object.keys(HAZARD_CATEGORIES) as HazardCategory[]).map((catKey) => {
              const meta = HAZARD_CATEGORIES[catKey];
              const isSubmitting = submittingCategory === catKey;

              return (
                <button
                  key={catKey}
                  type="button"
                  disabled={submittingCategory !== null}
                  onClick={() => handleSelectCategory(catKey)}
                  className={`flex items-center gap-3 p-3.5 min-h-[58px] rounded-2xl border transition-all text-start relative overflow-hidden group
                    ${meta.badgeBg} ${meta.badgeBorder} hover:scale-[1.02] active:scale-[0.98]
                    disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs hover:shadow-md`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-black/5 flex items-center justify-center shrink-0">
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#1c1c16]" />
                    ) : (
                      renderIcon(catKey)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-xs sm:text-sm ${meta.badgeText} truncate`}>
                      {isUrdu ? meta.labelUr : meta.labelEn}
                    </p>
                    <p className="text-[11px] text-[#5a5a40] truncate">
                      {isUrdu ? meta.labelEn : meta.labelUr}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#ecece0] text-[11px] text-[#7a7a60] flex items-center justify-between">
            <span>
              {isUrdu ? '• رپورٹ 24 گھنٹے بعد خودکار غیر فعال ہو جاتی ہے' : '• Reports automatically expire after 24 hours'}
            </span>
            <span className="font-mono text-[10px]">v1.1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
