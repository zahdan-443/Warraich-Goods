import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  FileArchive,
  Upload,
  Camera,
  Trash2,
  Mic,
  Square,
  Play,
  Pause,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  User,
  Truck,
  FileText,
  PhoneCall,
  Eye,
  RefreshCw
} from 'lucide-react';
import { BiltyRecord, BiltyLegalVault, LegalRecordingItem } from '../types';
import { downloadBiltyLegalZip } from '../utils/zipHelper';

interface BiltyLegalVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  bilty: BiltyRecord;
  onSaveVault: (biltyId: number, updatedVault: BiltyLegalVault) => void;
  onGeneratePdf?: (bilty: BiltyRecord) => Promise<{ pdf: any; pdfBlob: Blob } | null>;
  isOwner?: boolean;
}

export const BiltyLegalVaultModal: React.FC<BiltyLegalVaultModalProps> = ({
  isOpen,
  onClose,
  bilty,
  onSaveVault,
  onGeneratePdf,
  isOwner = true,
}) => {
  const [vault, setVault] = useState<BiltyLegalVault>(() => bilty.legalVault || {});
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ title: string; url: string } | null>(null);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Audio playback state
  const [activeAudioPlaying, setActiveAudioPlaying] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setVault(bilty.legalVault || {});
    setSaveSuccess(false);
  }, [bilty]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  if (!isOpen) return null;

  // Compress & convert uploaded image to data URL
  const handleImageFile = (key: keyof BiltyLegalVault, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1200;
        let w = img.width;
        let h = img.height;
        if (w > MAX_DIM || h > MAX_DIM) {
          if (w > h) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          } else {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setVault((prev) => ({
            ...prev,
            [key]: compressed,
            updatedAt: new Date().toISOString(),
          }));
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const newRec: LegalRecordingItem = {
        id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: file.name || `Voice_Note_${(vault.recordings?.length || 0) + 1}`,
        dataUrl,
        createdAt: new Date().toISOString(),
      };

      setVault((prev) => ({
        ...prev,
        recordings: [...(prev.recordings || []), newRec],
        updatedAt: new Date().toISOString(),
      }));
    };
    reader.readAsDataURL(file);
  };

  // Start in-browser voice note recording (guarded for non-store environments)
  const isStoreBuild = import.meta.env.VITE_STORE_BUILD === 'true';

  const startRecording = async () => {
    if (isStoreBuild) {
      alert('اس بلڈ میں براہ راست صوتی ریکارڈنگ دستیاب نہیں ہے۔ برائے مہربانی آڈیو فائل اپلوڈ کریں۔');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          if (dataUrl) {
            const newRec: LegalRecordingItem = {
              id: `voice_${Date.now()}`,
              name: `Voice_Call_Note_${(vault.recordings?.length || 0) + 1}`,
              dataUrl,
              duration: recordingSeconds,
              createdAt: new Date().toISOString(),
            };
            setVault((prev) => ({
              ...prev,
              recordings: [...(prev.recordings || []), newRec],
              updatedAt: new Date().toISOString(),
            }));
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission or recording error:', err);
      alert('مائیکروفون تک رسائی حاصل نہیں ہو سکی۔ براہ کرم آڈیو فائل اپلوڈ کریں۔');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const removeDoc = (key: keyof BiltyLegalVault) => {
    setVault((prev) => {
      const next = { ...prev };
      delete next[key];
      next.updatedAt = new Date().toISOString();
      return next;
    });
  };

  const removeRecording = (id: string) => {
    setVault((prev) => ({
      ...prev,
      recordings: (prev.recordings || []).filter((r) => r.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveVault(bilty.id, vault);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadZip = async () => {
    if (isDownloadingZip) return;
    setIsDownloadingZip(true);
    try {
      let pdfBlob: Blob | undefined;
      if (onGeneratePdf) {
        const result = await onGeneratePdf(bilty);
        if (result?.pdfBlob) {
          pdfBlob = result.pdfBlob;
        }
      }
      const recordWithLatestVault = { ...bilty, legalVault: vault };
      await downloadBiltyLegalZip(recordWithLatestVault, pdfBlob);
    } catch (err) {
      console.error('ZIP generation failed:', err);
      alert('ZIP فائل بنانے میں خرابی پیش آئی۔');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const docSlots: Array<{
    key: keyof BiltyLegalVault;
    titleUr: string;
    titleEn: string;
    icon: any;
  }> = [
    { key: 'driverPhoto', titleUr: 'ڈرائیور کی تصویر', titleEn: 'Driver Photo', icon: User },
    { key: 'driverLicense', titleUr: 'ڈرائیور لائسنس', titleEn: 'Driver License', icon: FileText },
    { key: 'driverCnic', titleUr: 'ڈرائیور شناختی کارڈ', titleEn: 'Driver CNIC', icon: ShieldCheck },
    { key: 'vehiclePhoto', titleUr: 'گاڑی کی تصویر', titleEn: 'Vehicle Photo', icon: Truck },
    { key: 'senderPhoto', titleUr: 'بھیجنے والے کی تصویر', titleEn: 'Sender Photo', icon: User },
    { key: 'senderCnic', titleUr: 'بھیجنے والے کا CNIC', titleEn: 'Sender CNIC', icon: ShieldCheck },
    { key: 'receiverPhoto', titleUr: 'وصول کنندہ کی تصویر', titleEn: 'Receiver Photo', icon: User },
    { key: 'receiverCnic', titleUr: 'وصول کنندہ کا CNIC', titleEn: 'Receiver CNIC', icon: ShieldCheck },
  ];

  const totalDocsCount =
    docSlots.filter((s) => Boolean(vault[s.key])).length + (vault.recordings?.length || 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-[#0f2942] overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#0f2942] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">قانونی دستاویزات و صوتی والٹ</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                  {bilty.biltyNo}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                Legal Evidence Vault & Voice Notes (Secure Legal Storage)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isDownloadingZip}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
              title="تمام دستاویزات اور بلٹی پی ڈی ایف کی ZIP فائل ڈاؤن لوڈ کریں"
            >
              {isDownloadingZip ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileArchive className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">ڈاؤن لوڈ ZIP والٹ</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Bar */}
        <div className="px-5 py-2.5 bg-blue-50/80 border-b border-blue-200 text-blue-950 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              یہ تمام دستاویزات قانونی تحفظ و ریکارڈ کے لیے محفوظ کی جاتی ہیں اور بلٹی رسید پر ظاہر نہیں ہوتیں۔
            </span>
          </div>
          <span className="font-bold text-[11px] bg-blue-200/70 text-blue-900 px-2.5 py-0.5 rounded-full shrink-0">
            دستاویزات: {totalDocsCount}
          </span>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Legal Photo Documents Grid */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <span>تصاویر و شناختی کارڈز (Photos & ID Cards)</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {docSlots.map((slot) => {
                const IconComponent = slot.icon;
                const existingVal = vault[slot.key] as string | undefined;

                return (
                  <div
                    key={slot.key}
                    className="border-2 border-slate-200 hover:border-[#0f2942]/60 rounded-2xl p-3 flex flex-col justify-between bg-slate-50/60 transition-all text-center relative group min-h-[150px]"
                  >
                    {existingVal ? (
                      <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-900/10 mb-2">
                        <img
                          src={existingVal}
                          alt={slot.titleUr}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setPreviewImage({ title: slot.titleUr, url: existingVal })}
                        />
                        <div className="absolute top-1 right-1 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImage({ title: slot.titleUr, url: existingVal })
                            }
                            className="w-6 h-6 rounded-md bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
                            title="بڑا کر کے دیکھیں"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeDoc(slot.key)}
                            className="w-6 h-6 rounded-md bg-rose-600/90 text-white flex items-center justify-center hover:bg-rose-700 transition-colors"
                            title="حذف کریں"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-white flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors mb-2">
                        <Camera className="w-6 h-6 text-slate-400 group-hover:text-[#0f2942] transition-colors" />
                        <span className="text-[10px] font-bold text-slate-500">اپلوڈ کریں</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageFile(slot.key, file);
                          }}
                        />
                      </label>
                    )}

                    <div>
                      <div className="text-[11px] font-black text-slate-900 leading-tight">
                        {slot.titleUr}
                      </div>
                      <div className="text-[9.5px] text-slate-500 font-medium">
                        {slot.titleEn}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Audio & Voice Notes */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>صوتی نوٹس و ہدایات آڈیو (Voice Notes & Audio Instructions)</span>
              </h4>

              <div className="flex items-center gap-2">
                {/* Voice Note Record Button - Only in non-store builds */}
                {!isStoreBuild && (
                  isRecording ? (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer animate-pulse"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>ریکارڈنگ روکیں ({recordingSeconds}s)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Mic className="w-3.5 h-3.5 text-amber-400" />
                      <span>آواز ریکارڈ کریں</span>
                    </button>
                  )
                )}

                {/* Upload Audio File */}
                <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300">
                  <Upload className="w-3.5 h-3.5" />
                  <span>آڈیو فائل اپلوڈ</span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAudioUpload(file);
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Recordings List */}
            {vault.recordings && vault.recordings.length > 0 ? (
              <div className="space-y-2">
                {vault.recordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{rec.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {new Date(rec.createdAt).toLocaleString('en-PK')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <audio controls src={rec.dataUrl} className="h-8 max-w-[200px] sm:max-w-[260px]" />
                      <button
                        type="button"
                        onClick={() => removeRecording(rec.id)}
                        className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                        title="حذف کریں"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-slate-500 text-xs">
                ابھی تک کوئی آڈیو یا صوتی نوٹ شامل نہیں کیا گیا۔ آپ اوپر دیے گئے بٹن سے آڈیو فائل اپلوڈ کر سکتے ہیں۔
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-4 h-4" />
                <span>محفوظ ہو گیا اور کلاؤڈ پر سنک ہو گیا!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isDownloadingZip}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            >
              {isDownloadingZip ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>ڈاؤن لوڈ ZIP والٹ (PDF + تمام میڈیا)</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#0f2942] hover:bg-slate-800 text-white font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <ShieldCheck className="w-4 h-4 text-amber-400" />}
              <span>محفوظ کریں (Save Legal Vault)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2 relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">{previewImage.title}</h4>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 max-h-[75vh] overflow-auto flex items-center justify-center">
              <img src={previewImage.url} alt={previewImage.title} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
