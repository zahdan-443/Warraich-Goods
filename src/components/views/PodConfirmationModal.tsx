import React, { useState, useRef } from 'react';
import { 
  CheckCircle2, 
  Camera, 
  Upload, 
  X, 
  User, 
  PackageCheck, 
  Loader2, 
  Image as ImageIcon,
  AlertCircle,
  WifiOff
} from 'lucide-react';
import { Language, BiltyRecord } from '../../types';
import { confirmBiltyDelivery } from '../../utils/storage';

interface PodConfirmationModalProps {
  lang: Language;
  bilty: BiltyRecord;
  isOpen: boolean;
  onClose: () => void;
  onConfirmed: (updated: BiltyRecord, offlineQueued: boolean) => void;
}

export const PodConfirmationModal: React.FC<PodConfirmationModalProps> = ({
  lang,
  bilty,
  isOpen,
  onClose,
  onConfirmed
}) => {
  const isUrdu = lang === 'ur';

  const [receiverName, setReceiverName] = useState(
    bilty.receiverName || bilty.consignee || ''
  );
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Compress photo on device before saving (fits in Firestore document & loads fast offline)
  const handlePhotoSelect = (file?: File) => {
    if (!file) return;
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          setPhotoDataUrl(compressed);
          setPhotoName(file.name || 'received_goods.jpg');
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = receiverName.trim();
    if (!finalName) {
      setErrorMsg(isUrdu ? 'براہ کرم وصول کنندہ کا نام درج کریں۔' : 'Please enter the receiver name.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await confirmBiltyDelivery(
        bilty,
        finalName,
        photoDataUrl || undefined
      );

      const updatedRecord: BiltyRecord = {
        ...bilty,
        podConfirmation: res.podConfirmation,
        isDelivered: true,
        receivedBy: finalName
      };

      onConfirmed(updatedRecord, res.offlineQueued);
      onClose();
    } catch (err) {
      console.error('POD confirm caught:', err);
      setErrorMsg(isUrdu ? 'تصدیق درج کرنے میں مسئلہ آیا۔' : 'Failed to confirm delivery.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        dir={isUrdu ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-[#0f2942] to-[#1a3a5c] text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg">
                {isUrdu ? 'مال مل گیا / ڈیجیٹل وصولی تصدیق' : 'Confirm Delivery (Proof of Delivery)'}
              </h3>
              <p className="text-xs text-amber-200/90 font-mono mt-0.5">
                {isUrdu ? 'بلٹی نمبر:' : 'Bilty #'} {bilty.biltyNo}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleConfirm} className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Bilty Summary Info */}
          <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] text-xs text-[#5a5a40] space-y-1">
            <div className="flex items-center justify-between">
              <span>{isUrdu ? 'روٹ:' : 'Route:'}</span>
              <strong className="text-[#4a4a35]">{bilty.sendingCity} ➔ {bilty.receivingCity}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>{isUrdu ? 'تفصیل سامان:' : 'Cargo Description:'}</span>
              <span className="font-semibold text-[#4a4a35]">{bilty.itemDescription || 'جنرل کارگو'} ({bilty.qty || '1 نگ'})</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{isUrdu ? 'گاڑی نمبر:' : 'Vehicle Plate:'}</span>
              <span className="font-mono font-bold text-[#4a4a35]">{bilty.vehicleNo || 'N/A'}</span>
            </div>
          </div>

          {/* Field 1: Receiver Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#0f2942]" />
              <span>{isUrdu ? 'وصول کنندہ کا نام (Receiver Name)' : "Receiver's Name"} *</span>
            </label>
            <input
              type="text"
              required
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              placeholder={isUrdu ? 'اپنا یا مال وصول کرنے والے کا نام لکھیں...' : 'Enter name of person receiving goods...'}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0f2942] focus:ring-2 focus:ring-[#0f2942]/10 transition-all"
            />
            <p className="text-[11px] text-slate-500">
              {isUrdu
                ? 'مال وصول کرنے والے شخص یا مینیجر کا نام درج کریں۔'
                : 'Prefilled from bilty consignee. Edit if another representative is receiving.'}
            </p>
          </div>

          {/* Field 2: Optional Photo of Received Goods */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#0f2942]" />
                <span>{isUrdu ? 'وصول شدہ مال کی تصویر (اختیاری)' : 'Photo of Received Goods (Optional)'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {isUrdu ? 'ثبوت کیلئے' : 'Optional POD photo'}
              </span>
            </label>

            {/* Hidden file & camera inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handlePhotoSelect(e.target.files?.[0])}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoSelect(e.target.files?.[0])}
              className="hidden"
            />

            {!photoDataUrl ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <Camera className="w-4 h-4 text-[#0f2942]" />
                  <span>{isUrdu ? 'کیمرہ سے فوٹو لیں' : 'Take Camera Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>{isUrdu ? 'گیلری سے اپلوڈ' : 'Upload from File'}</span>
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <img
                    src={photoDataUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-blue-300 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-blue-900 block truncate">
                      {photoName || 'goods-received.jpg'}
                    </span>
                    <span className="text-[10px] text-blue-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {isUrdu ? 'تصویر منسلک ہو گئی' : 'Photo attached'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPhotoDataUrl(null);
                    setPhotoName('');
                  }}
                  className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 transition-colors cursor-pointer text-xs font-bold shrink-0"
                  title={isUrdu ? 'تصویر ہٹائیں' : 'Remove photo'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Privacy & No-PII Notice */}
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
            ℹ️ {isUrdu
              ? 'صرف وصول کنندہ کا نام اور وقت ریکارڈ کیا جائے گا۔ شناختی کارڈ یا فون نمبر کی ضرورت نہیں ہے۔'
              : 'Strict privacy: only receiver name and timestamp are collected. No CNIC or phone numbers required.'}
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {isUrdu ? 'منسوخ' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{isUrdu ? 'محفوظ کیا جا رہا ہے...' : 'Confirming...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>{isUrdu ? 'مال مل گیا - تصدیق کریں' : 'Confirm Received (POD)'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
