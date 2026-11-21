import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  FileArchive,
  Upload,
  Camera,
  Trash2,
  Mic,
  Square,
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
  Lock,
  Unlock,
  Clock
} from 'lucide-react';
import {
  BiltyAttachmentRecord,
  BiltyAttachmentSlot,
  BiltyLegalVault,
  BiltyRecord
} from '../types';
import { downloadBiltyLegalZip } from '../utils/zipHelper';
import {
  ATTACHMENT_HARD_CAP_BYTES,
  ATTACHMENT_RETENTION_DAYS,
  compressAttachmentImage,
  DEFAULT_MAX_ID_IMAGES_PER_DOC,
  deleteBiltyAttachment,
  getAttachmentsForBilty,
  isIdCardSlot,
  saveBiltyAttachment,
  setBiltyLegalHold,
  validateAudioAttachmentDataUrl
} from '../utils/biltyAttachments';

interface BiltyLegalVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  bilty: BiltyRecord;
  onSaveVault?: (biltyId: number, updatedVault: BiltyLegalVault) => void;
  onAttachmentsChanged?: (
    biltyId: number,
    info: { attachmentCount: number; legalHold: boolean }
  ) => void;
  onGeneratePdf?: (bilty: BiltyRecord) => Promise<{ pdf: any; pdfBlob: Blob } | null>;
  isOwner?: boolean;
}

export const BiltyLegalVaultModal: React.FC<BiltyLegalVaultModalProps> = ({
  isOpen,
  onClose,
  bilty,
  onAttachmentsChanged,
  onGeneratePdf
}) => {
  const [attachments, setAttachments] = useState<BiltyAttachmentRecord[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [processingSlot, setProcessingSlot] = useState<string | null>(null);
  const [legalHold, setLegalHold] = useState<boolean>(Boolean(bilty.legalHold));
  const [togglingHold, setTogglingHold] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ title: string; url: string } | null>(null);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadAttachments = useCallback(async () => {
    setLoadingAttachments(true);
    try {
      const list = await getAttachmentsForBilty(bilty);
      setAttachments(list);
      const effectiveHold = Boolean(bilty.legalHold || list.some((a) => a.legalHold));
      setLegalHold(effectiveHold);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load attachments');
    } finally {
      setLoadingAttachments(false);
    }
  }, [bilty]);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage(null);
    setStatusMessage(null);
    setLegalHold(Boolean(bilty.legalHold));
    void loadAttachments();
  }, [isOpen, bilty, loadAttachments]);

  useEffect(() => {
    if (!isOpen || !previewImage) return;
    const handleBack = (e: Event) => {
      e.preventDefault();
      setPreviewImage(null);
    };
    window.addEventListener('app-back-button', handleBack);
    return () => window.removeEventListener('app-back-button', handleBack);
  }, [isOpen, previewImage]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  if (!isOpen) return null;

  const docSlots: Array<{
    key: BiltyAttachmentSlot;
    titleUr: string;
    titleEn: string;
    isIdCard: boolean;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { key: 'driverPhoto', titleUr: 'ڈرائیور کی تصویر', titleEn: 'Driver Photo', isIdCard: false, icon: User },
    { key: 'driverLicense', titleUr: 'ڈرائیور لائسنس', titleEn: 'Driver License', isIdCard: true, icon: FileText },
    { key: 'driverCnic', titleUr: 'ڈرائیور شناختی کارڈ', titleEn: 'Driver CNIC', isIdCard: true, icon: ShieldCheck },
    { key: 'vehiclePhoto', titleUr: 'گاڑی کی تصویر', titleEn: 'Vehicle Photo', isIdCard: false, icon: Truck },
    { key: 'senderPhoto', titleUr: 'بھیجنے والے کی تصویر', titleEn: 'Sender Photo', isIdCard: false, icon: User },
    { key: 'senderCnic', titleUr: 'بھیجنے والے کا CNIC', titleEn: 'Sender CNIC', isIdCard: true, icon: ShieldCheck },
    { key: 'receiverPhoto', titleUr: 'وصول کنندہ کی تصویر', titleEn: 'Receiver Photo', isIdCard: false, icon: User },
    { key: 'receiverCnic', titleUr: 'وصول کنندہ کا CNIC', titleEn: 'Receiver CNIC', isIdCard: true, icon: ShieldCheck }
  ];

  const slotMap = new Map<BiltyAttachmentSlot, BiltyAttachmentRecord>();
  const audioList: BiltyAttachmentRecord[] = [];
  for (const att of attachments) {
    if (att.kind === 'audio' || att.slot === 'voiceNote') {
      audioList.push(att);
    } else if (!slotMap.has(att.slot)) {
      slotMap.set(att.slot, att);
    }
  }

  const currentIdImageCount = attachments.filter((a) => a.isIdCard).length;

  const notifyParent = (nextList: BiltyAttachmentRecord[], nextHold: boolean) => {
    onAttachmentsChanged?.(bilty.id, {
      attachmentCount: nextList.length,
      legalHold: nextHold
    });
  };

  const handleImageFile = async (slot: BiltyAttachmentSlot, file: File) => {
    if (!file) return;
    setErrorMessage(null);
    setStatusMessage(null);

    const existingForSlot = slotMap.get(slot);
    if (isIdCardSlot(slot) && !existingForSlot && currentIdImageCount >= DEFAULT_MAX_ID_IMAGES_PER_DOC) {
      setErrorMessage(
        `ہر بلٹی کے لیے زیادہ سے زیادہ ${DEFAULT_MAX_ID_IMAGES_PER_DOC} شناختی کارڈ / لائسنس تصاویر کی اجازت ہے۔ (Max ${DEFAULT_MAX_ID_IMAGES_PER_DOC} ID-card images per document)`
      );
      return;
    }

    setProcessingSlot(slot);
    try {
      const compressed = await compressAttachmentImage(file);
      await saveBiltyAttachment(
        { id: bilty.id, biltyNo: bilty.biltyNo, legalHold },
        {
          slot,
          kind: 'image',
          dataUrl: compressed.dataUrl,
          mimeType: compressed.mimeType,
          width: compressed.width,
          height: compressed.height,
          allowReplaceSlot: true
        }
      );
      const updatedList = await getAttachmentsForBilty({ ...bilty, legalHold });
      setAttachments(updatedList);
      notifyParent(updatedList, legalHold);
      setStatusMessage(
        `تصویر محفوظ ہو گئی (${Math.round(compressed.byteSize / 1024)} KB)`
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'تصویر محفوظ کرنے میں خرابی آئی۔');
    } finally {
      setProcessingSlot(null);
    }
  };

  const handleAudioDataUrl = async (dataUrl: string, name: string, duration?: number) => {
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const { byteSize, mimeType } = validateAudioAttachmentDataUrl(dataUrl);
      await saveBiltyAttachment(
        { id: bilty.id, biltyNo: bilty.biltyNo, legalHold },
        {
          slot: 'voiceNote',
          kind: 'audio',
          dataUrl,
          mimeType,
          name,
          duration
        }
      );
      const updatedList = await getAttachmentsForBilty({ ...bilty, legalHold });
      setAttachments(updatedList);
      notifyParent(updatedList, legalHold);
      setStatusMessage(`آڈیو نوٹ محفوظ ہو گیا (${Math.round(byteSize / 1024)} KB)`);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : `آڈیو فائل ${Math.round(ATTACHMENT_HARD_CAP_BYTES / 1024)} KB حد سے بڑی ہے۔`
      );
    }
  };

  const handleAudioUpload = (file: File) => {
    if (!file) return;
    if (file.size > ATTACHMENT_HARD_CAP_BYTES * 0.95) {
      setErrorMessage(
        `آڈیو فائل بہت بڑی ہے (${Math.round(file.size / 1024)} KB)۔ زیادہ سے زیادہ حد ${Math.round(
          ATTACHMENT_HARD_CAP_BYTES / 1024
        )} KB ہے۔`
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        void handleAudioDataUrl(dataUrl, file.name || `Voice_Note_${audioList.length + 1}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const isStoreBuild = import.meta.env.VITE_STORE_BUILD === 'true';

  const startRecording = async () => {
    setErrorMessage(null);
    if (isStoreBuild) {
      setErrorMessage('اس بلڈ میں براہ راست صوتی ریکارڈنگ دستیاب نہیں ہے۔ برائے مہربانی آڈیو فائل اپلوڈ کریں۔');
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
            void handleAudioDataUrl(
              dataUrl,
              `Voice_Call_Note_${audioList.length + 1}`,
              recordingSeconds
            );
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
      setErrorMessage('مائیکروفون تک رسائی حاصل نہیں ہو سکی۔ براہ کرم آڈیو فائل اپلوڈ کریں۔');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleRemoveAttachment = async (att: BiltyAttachmentRecord) => {
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await deleteBiltyAttachment(att.id, bilty);
      const updatedList = await getAttachmentsForBilty({ ...bilty, legalHold });
      setAttachments(updatedList);
      notifyParent(updatedList, legalHold);
      setStatusMessage('منسلکہ فائل حذف کر دی گئی ہے۔');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'فائل حذف کرنے میں خرابی آئی۔');
    }
  };

  const handleToggleLegalHold = async () => {
    if (togglingHold) return;
    setTogglingHold(true);
    setErrorMessage(null);
    try {
      const nextHold = !legalHold;
      await setBiltyLegalHold(bilty, nextHold);
      const updatedList = await getAttachmentsForBilty({ ...bilty, legalHold: nextHold });
      setLegalHold(nextHold);
      setAttachments(updatedList);
      notifyParent(updatedList, nextHold);
      setStatusMessage(
        nextHold
          ? 'قانونی تحفظ (Legal Hold) فعال کر دیا گیا — خودکار حذف معطل ہے۔'
          : `Legal Hold ہٹا دیا گیا — منسلکات ${ATTACHMENT_RETENTION_DAYS} دن بعد خودکار حذف ہوں گی۔`
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Legal Hold اپ ڈیٹ نہیں ہو سکا۔');
    } finally {
      setTogglingHold(false);
    }
  };

  const handleDownloadZip = async () => {
    if (isDownloadingZip) return;
    setIsDownloadingZip(true);
    setErrorMessage(null);
    try {
      let pdfBlob: Blob | undefined;
      if (onGeneratePdf) {
        const result = await onGeneratePdf(bilty);
        if (result?.pdfBlob) {
          pdfBlob = result.pdfBlob;
        }
      }
      await downloadBiltyLegalZip({ ...bilty, legalHold }, pdfBlob);
    } catch (err) {
      console.error('ZIP generation failed:', err);
      setErrorMessage('ZIP فائل بنانے میں خرابی پیش آئی۔');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const earliestExpireMs = attachments.reduce((min, item) => {
    if (item.legalHold || !item.expireAtMs) return min;
    return Math.min(min, item.expireAtMs);
  }, Number.POSITIVE_INFINITY);
  const daysUntilExpiry = Number.isFinite(earliestExpireMs)
    ? Math.max(0, Math.ceil((earliestExpireMs - Date.now()) / 86_400_000))
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-[#0f2942] overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#0f2942] text-white flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-base sm:text-lg">قانونی دستاویزات و صوتی والٹ</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                  {bilty.biltyNo}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                Isolated IndexedDB &amp; Private Cloud Attachments (Auto-deleted after {ATTACHMENT_RETENTION_DAYS} days unless Legal Hold is ON)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleLegalHold}
              disabled={togglingHold}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                legalHold
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-white/15 text-amber-200 hover:bg-white/25 border border-amber-400/40'
              }`}
              title="Toggle Legal Hold to exempt attachments from 6-month auto-deletion"
            >
              {legalHold ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{legalHold ? 'Legal Hold: ON' : 'Legal Hold: OFF'}</span>
            </button>

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

        {/* Notice & Retention Status Bar */}
        <div className="px-5 py-2.5 bg-blue-50/80 border-b border-blue-200 text-blue-950 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              تصاویر خودکار 1000px / 150KB تک کمپریس ہوتی ہیں اور صرف مالک کے نجی اکاؤنٹ میں الگ محفوظ رہتی ہیں (رسید یا پبلک لنک پر ظاہر نہیں ہوتیں)۔
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[11px] bg-white border border-blue-200 text-slate-800 px-2.5 py-0.5 rounded-full">
              شناختی کارڈ: {currentIdImageCount}/{DEFAULT_MAX_ID_IMAGES_PER_DOC}
            </span>
            {legalHold ? (
              <span className="font-bold text-[11px] bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Legal Hold فعال (محفوظ)
              </span>
            ) : (
              daysUntilExpiry !== null && (
                <span className="font-bold text-[11px] bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {daysUntilExpiry} دن باقی (180-day TTL)
                </span>
              )
            )}
            <span className="font-bold text-[11px] bg-blue-200/70 text-blue-900 px-2.5 py-0.5 rounded-full shrink-0">
              دستاویزات: {attachments.length}
            </span>
          </div>
        </div>

        {/* Inline Error or Status Banner (replaces window.alert) */}
        {(errorMessage || statusMessage) && (
          <div className="px-5 pt-3 shrink-0 space-y-2">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center justify-between gap-2">
                <span>{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-600 hover:text-rose-900 p-0.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {statusMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {statusMessage}
                </span>
                <button
                  type="button"
                  onClick={() => setStatusMessage(null)}
                  className="text-emerald-700 hover:text-emerald-900 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {loadingAttachments ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-[#0f2942]" />
              <span>دستاویزات لوڈ ہو رہی ہیں...</span>
            </div>
          ) : (
            <>
              {/* Section 1: Legal Photo Documents Grid */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between gap-1.5">
                  <span>تصاویر و شناختی کارڈز (Photos &amp; ID Cards)</span>
                  <span className="text-[10px] font-bold text-slate-500">
                    Max {DEFAULT_MAX_ID_IMAGES_PER_DOC} ID-card photos per document • ≤400 KB each
                  </span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {docSlots.map((slot) => {
                    const existingAtt = slotMap.get(slot.key);
                    const isBusy = processingSlot === slot.key;

                    return (
                      <div
                        key={slot.key}
                        className="border-2 border-slate-200 hover:border-[#0f2942]/60 rounded-2xl p-3 flex flex-col justify-between bg-slate-50/60 transition-all text-center relative group min-h-[155px]"
                      >
                        {slot.isIdCard && (
                          <span className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[8.5px] font-black border border-amber-300">
                            ID
                          </span>
                        )}

                        {isBusy ? (
                          <div className="w-full h-24 rounded-xl bg-slate-100 flex flex-col items-center justify-center gap-1 mb-2 text-[10px] font-bold text-slate-600">
                            <Loader2 className="w-5 h-5 animate-spin text-[#0f2942]" />
                            <span>کمپریس ہو رہی ہے...</span>
                          </div>
                        ) : existingAtt ? (
                          <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-900/10 mb-2">
                            <img
                              src={existingAtt.dataUrl}
                              alt={slot.titleUr}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => setPreviewImage({ title: slot.titleUr, url: existingAtt.dataUrl })}
                            />
                            <div className="absolute top-1 right-1 flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewImage({ title: slot.titleUr, url: existingAtt.dataUrl })
                                }
                                className="w-6 h-6 rounded-md bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
                                title="بڑا کر کے دیکھیں"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleRemoveAttachment(existingAtt)}
                                className="w-6 h-6 rounded-md bg-rose-600/90 text-white flex items-center justify-center hover:bg-rose-700 transition-colors cursor-pointer"
                                title="حذف کریں"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">
                              {Math.round(existingAtt.byteSize / 1024)}KB
                            </span>
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
                                e.target.value = '';
                                if (file) void handleImageFile(slot.key, file);
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
                    <span>صوتی نوٹس و ہدایات آڈیو (Voice Notes &amp; Audio Instructions)</span>
                  </h4>

                  <div className="flex items-center gap-2">
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
                          onClick={() => void startRecording()}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Mic className="w-3.5 h-3.5 text-amber-400" />
                          <span>آواز ریکارڈ کریں</span>
                        </button>
                      )
                    )}

                    <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300">
                      <Upload className="w-3.5 h-3.5" />
                      <span>آڈیو فائل اپلوڈ (≤400KB)</span>
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file) handleAudioUpload(file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {audioList.length > 0 ? (
                  <div className="space-y-2">
                    {audioList.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                            <PhoneCall className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900">
                              {rec.name || 'Voice_Note'}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {new Date(rec.createdAt).toLocaleString('en-PK')} • {Math.round(rec.byteSize / 1024)} KB
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <audio controls src={rec.dataUrl} className="h-8 max-w-[200px] sm:max-w-[260px]" />
                          <button
                            type="button"
                            onClick={() => void handleRemoveAttachment(rec)}
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
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] font-medium text-slate-600">
            تمام تبدیلیاں فوراً IndexedDB اور مالک کے نجی کلاؤڈ اکاؤنٹ میں الگ محفوظ ہو جاتی ہیں۔
          </span>

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
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#0f2942] hover:bg-slate-800 text-white font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>بند کریں (Done)</span>
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
          <div
            className="max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">{previewImage.title}</h4>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 max-h-[75vh] overflow-auto flex items-center justify-center">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
