import React, { useState, useEffect } from 'react';
import { BiltyRecord, ContactItem, DICTIONARY, Language, BiltyBranch, BiltyLanguage } from '../../types';
import {
  Receipt,
  Search,
  Download,
  FileText,
  MapPin,
  Share2,
  Phone,
  FileSpreadsheet,
  Printer,
  Loader2,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Settings,
  Sparkles,
  Building2,
  Check
} from 'lucide-react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { VoiceInputButton } from '../VoiceInputButton';
import { CameraOcrInput } from '../CameraOcrInput';
import { PrintableBilty } from '../PrintableBilty';
import { exportContactsCSV, getContactList, allocateNextBiltyNumber } from '../../utils/storage';
import { validateBiltyFreight } from '../../utils/calculator';
import { generatePdfFromElement, shareBiltyPdfOrWhatsApp } from '../../utils/pdfHelper';
import { PublicImage } from '../PublicImage';
import {
  generateBiltyVerificationQrDataUrl,
  getBiltyVerificationUrl,
  BILTY_BRANCHES
} from '../../utils/biltyHelpers';

const getQrDataUrl = async (record: BiltyRecord): Promise<string> => {
  if (!record?.biltyNo) return '';
  return await generateBiltyVerificationQrDataUrl(record.biltyNo);
};

const BiltyQrCode: React.FC<{ record: BiltyRecord; className?: string }> = ({ record, className }) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    getQrDataUrl(record).then((url) => {
      if (active) setQrUrl(url);
    });
    return () => {
      active = false;
    };
  }, [record.biltyNo]);

  if (!qrUrl) return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
  return <img src={qrUrl} alt="Bilty Tracking and Verification QR Code" width={100} height={100} className={className} />;
};

interface BiltyViewProps {
  lang: Language;
  bilties: BiltyRecord[];
  onAddBilty: (record: Omit<BiltyRecord, 'id'>) => void;
  onNavigate?: (tab: string) => void;
}

export const BiltyView: React.FC<BiltyViewProps> = ({ lang, bilties, onAddBilty, onNavigate }) => {
  const isUrdu = lang === 'ur';
  const t = DICTIONARY[lang].bilty;

  const [subTab, setSubTab] = useState<'create' | 'search'>('create');

  // Branch and Language Selection State
  const [selectedBranch, setSelectedBranch] = useState<BiltyBranch>(() => {
    try {
      const stored = localStorage.getItem('ah-bilty-branch');
      if (stored === 'samundri' || stored === 'kamalia') return stored;
    } catch {}
    return 'samundri';
  });

  const [selectedLanguage, setSelectedLanguage] = useState<BiltyLanguage>(() => {
    try {
      const stored = localStorage.getItem('ah-bilty-lang');
      if (stored === 'ur' || stored === 'en') return stored;
    } catch {}
    return 'ur';
  });

  // Prompt user on open: Modal is initially open
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(true);

  const getTodayFormatted = () => {
    return new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Form state
  const [vehicleNo, setVehicleNo] = useState('');
  const [date, setDate] = useState(getTodayFormatted);
  const [driverName, setDriverName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [sendingCity, setSendingCity] = useState('');
  const [receivingCity, setReceivingCity] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderMobile, setSenderMobile] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverMobile, setReceiverMobile] = useState('');
  const [senderCnic, setSenderCnic] = useState('');
  const [qty, setQty] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [total, setTotal] = useState('');
  const [advance, setAdvance] = useState('');

  const [lastBilty, setLastBilty] = useState<BiltyRecord | null>(null);
  const [contactsList, setContactsList] = useState<ContactItem[]>([]);
  const [activePrintRecord, setActivePrintRecord] = useState<BiltyRecord | null>(null);
  const [activePrintQrUrl, setActivePrintQrUrl] = useState<string>('');

  useEffect(() => {
    setContactsList(getContactList());
  }, [bilties]);

  const handleBranchChange = (branch: BiltyBranch) => {
    setSelectedBranch(branch);
    try {
      localStorage.setItem('ah-bilty-branch', branch);
    } catch {}
    if (lastBilty) {
      setLastBilty({ ...lastBilty, branch });
    }
  };

  const handleLanguageChange = (language: BiltyLanguage) => {
    setSelectedLanguage(language);
    try {
      localStorage.setItem('ah-bilty-lang', language);
    } catch {}
    if (lastBilty) {
      setLastBilty({ ...lastBilty, language });
    }
  };

  const handlePrintBuilty = async (record: BiltyRecord) => {
    const qrUrl = await getQrDataUrl(record);
    setActivePrintQrUrl(qrUrl);
    setActivePrintRecord({
      ...record,
      branch: record.branch || selectedBranch,
      language: record.language || selectedLanguage
    });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<BiltyRecord | null | undefined>(undefined);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalNum = parseFloat(total) || 0;
    const advanceNum = parseFloat(advance) || 0;

    // Financial Validation
    const validation = validateBiltyFreight(totalNum, advanceNum);
    if (!validation.isValid) {
      alert(validation.error || (selectedLanguage === 'en' ? 'Please enter valid freight & advance amount.' : 'درست کرایہ اور پیشگی رقم درج کریں۔'));
      return;
    }

    // Allocate sequential unique Bilty Number via Transaction / Monotonic counter
    const allocatedBiltyNo = await allocateNextBiltyNumber();
    const isPendingOnline = allocatedBiltyNo.includes('-OFF-');

    const record: Omit<BiltyRecord, 'id'> = {
      biltyNo: allocatedBiltyNo,
      pendingOnlineNumber: isPendingOnline ? true : undefined,
      branch: selectedBranch,
      language: selectedLanguage,
      vehicleNo: vehicleNo.trim(),
      date: date.trim() || getTodayFormatted(),
      driverName: driverName.trim(),
      mobileNo: mobileNo.trim(),
      sendingCity: sendingCity.trim(),
      receivingCity: receivingCity.trim(),
      senderName: senderName.trim(),
      senderMobile: senderMobile.trim(),
      receiverName: receiverName.trim(),
      receiverMobile: receiverMobile.trim(),
      senderCnic: senderCnic.trim(),
      qty: qty.trim(),
      itemDescription: itemDescription.trim(),
      weight: weight.trim(),
      total: validation.total,
      advance: validation.advance,
      payable: validation.payable,
    };

    onAddBilty(record);
    setLastBilty({ ...record, id: Date.now() });

    // Reset fields
    setVehicleNo('');
    setDate(getTodayFormatted());
    setDriverName('');
    setMobileNo('');
    setSendingCity('');
    setReceivingCity('');
    setSenderName('');
    setSenderMobile('');
    setReceiverName('');
    setReceiverMobile('');
    setSenderCnic('');
    setQty('');
    setItemDescription('');
    setWeight('');
    setTotal('');
    setAdvance('');
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const generateBiltyPdf = async (record: BiltyRecord): Promise<{ pdf: jsPDF; pdfBlob: Blob } | null> => {
    const qrUrl = await getQrDataUrl(record);
    setActivePrintQrUrl(qrUrl);
    setActivePrintRecord({
      ...record,
      branch: record.branch || selectedBranch,
      language: record.language || selectedLanguage
    });
    // Allow React state to update DOM and QR code generation
    await new Promise((r) => setTimeout(r, 450));

    const target = document.getElementById('printable-bilty-dom');
    if (!target) {
      console.error('Printable DOM container not found');
      return null;
    }

    // Wait for any inner images to finish loading
    const imgs = Array.from(target.querySelectorAll('img'));
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete && img.naturalWidth !== 0) resolve(true);
            else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(true);
              setTimeout(() => resolve(true), 500);
            }
          })
      )
    );

    const innerEl = document.getElementById('printable-bilty-inner') || target;
    const { pdf, pdfBlob } = await generatePdfFromElement(innerEl as HTMLElement, {
      scale: 2,
      quality: 0.98,
    });

    return { pdf, pdfBlob };
  };

  const handleDownloadPDF = async (record: BiltyRecord) => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const result = await generateBiltyPdf(record);
      if (result) {
        result.pdf.save(`Bilty_${record.biltyNo}.pdf`);
      }
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('پی ڈی ایف بنانے میں مسئلہ آیا: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleWhatsAppShare = async (record: BiltyRecord) => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const result = await generateBiltyPdf(record);
      if (!result) return;

      await shareBiltyPdfOrWhatsApp({
        record,
        pdfBlob: result.pdfBlob,
        pdfDoc: result.pdf,
      });
    } catch (err) {
      console.error('WhatsApp share failed:', err);
      await shareBiltyPdfOrWhatsApp({
        record,
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toUpperCase();
    const found = bilties.find((b) => b.biltyNo.toUpperCase() === q);
    setSearchResult(found || null);
  };

  const renderBiltyPreview = (record: BiltyRecord) => {
    const previewBranch = record.branch || selectedBranch;
    const previewLang = record.language || selectedLanguage;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#ecece0]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider font-mono bg-slate-900 text-white px-3 py-1 rounded-xs">
              {record.biltyNo}
            </span>
            {record.pendingOnlineNumber && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                <span>{previewLang === 'ur' ? 'آن لائن نمبر الاٹمنٹ زیر التواء' : 'Pending Online Number Allocation'}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0f2942] text-white">
              📍 {previewBranch === 'kamalia' ? 'کمالیہ (Kamalia)' : 'سمندری (Samundri)'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-950 border border-amber-300">
              🌐 {previewLang === 'en' ? '100% English' : 'مکمل اردو'}
            </span>
          </div>
          <BiltyQrCode record={record} className="w-12 h-12 rounded border border-slate-300 bg-white object-contain" />
        </div>

        <div className="bg-slate-100/70 p-2 sm:p-4 rounded-xl border border-slate-200 overflow-x-auto">
          <PrintableBilty
            record={record}
            branch={previewBranch}
            language={previewLang}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => handlePrintBuilty(record)}
            disabled={isGeneratingPdf}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-98"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>{previewLang === 'en' ? 'Print Bilty (A4/A5)' : 'پرنٹ بلٹی (A4/A5)'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownloadPDF(record)}
            disabled={isGeneratingPdf}
            className="w-full py-3 bg-[#f0f0e4] hover:bg-[#8b9d77] hover:text-white disabled:opacity-50 text-[#5a5a40] rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
          >
            {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin text-[#5a5a40]" /> : <Download className="w-4 h-4" />}
            <span>{isGeneratingPdf ? (previewLang === 'en' ? 'Generating...' : 'تیار ہو رہی ہے...') : (previewLang === 'en' ? 'Download PDF' : t.downloadBtn)}</span>
          </button>

          <button
            type="button"
            onClick={() => handleWhatsAppShare(record)}
            disabled={isGeneratingPdf}
            className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-98"
          >
            {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Share2 className="w-4 h-4" />}
            <span>{previewLang === 'en' ? 'WhatsApp Share' : 'واٹس ایپ شیئر'}</span>
          </button>
        </div>
      </div>
    );
  };

  const branchObj = BILTY_BRANCHES[selectedBranch] || BILTY_BRANCHES.samundri;
  const isEnForm = selectedLanguage === 'en';

  return (
    <div className="flex-1 p-3 sm:p-6 md:p-10 max-w-5xl mx-auto w-full space-y-6 sm:space-y-8">
      {/* 1. Branch & Language Setup Modal Prompt */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border-2 border-[#0f2942] space-y-5 text-right"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0f2942] text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f2942]">
                    بلٹی جنریٹر سیٹ اپ
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    Select Branch & Language for Bilty
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              براہ کرم بلٹی بنانے سے قبل اپنی مطلوبہ برانچ اور زبان کا انتخاب کریں۔
            </p>

            {/* A. Branch Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>A. برانچ منتخب کریں (Select Branch)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Samundri Card */}
                <button
                  type="button"
                  onClick={() => handleBranchChange('samundri')}
                  className={`p-3.5 rounded-2xl border-2 text-right transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    selectedBranch === 'samundri'
                      ? 'border-[#0f2942] bg-emerald-50/70 shadow-sm ring-2 ring-[#0f2942]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[#0f2942] flex items-center gap-1.5">
                      📍 سمندری (Samundri)
                    </span>
                    {selectedBranch === 'samundri' && (
                      <span className="w-5 h-5 rounded-full bg-[#0f2942] text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 leading-tight">
                    <div className="font-semibold text-slate-800">466 چوک، سمندری بائی پاس، سمندری ۔</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">466 chok, Samundri Bypass, Samundri.</div>
                  </div>
                </button>

                {/* Kamalia Card */}
                <button
                  type="button"
                  onClick={() => handleBranchChange('kamalia')}
                  className={`p-3.5 rounded-2xl border-2 text-right transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    selectedBranch === 'kamalia'
                      ? 'border-[#0f2942] bg-emerald-50/70 shadow-sm ring-2 ring-[#0f2942]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[#0f2942] flex items-center gap-1.5">
                      📍 کمالیہ (Kamalia)
                    </span>
                    {selectedBranch === 'kamalia' && (
                      <span className="w-5 h-5 rounded-full bg-[#0f2942] text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 leading-tight">
                    <div className="font-semibold text-slate-800">رجانہ روڈ، بلمقابل رائل پیلس، کمالیہ ۔</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Rajana Road, Opposite Royal Palace, Kamalia.</div>
                  </div>
                </button>
              </div>
            </div>

            {/* B. Language Selection */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>B. زبان منتخب کریں (Select Language)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Urdu Option */}
                <button
                  type="button"
                  onClick={() => handleLanguageChange('ur')}
                  className={`p-3.5 rounded-2xl border-2 text-right transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    selectedLanguage === 'ur'
                      ? 'border-[#0f2942] bg-blue-50/70 shadow-sm ring-2 ring-[#0f2942]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-black text-sm text-[#0f2942]">
                      اردو (Urdu)
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      مکمل اردو بلٹی (100% Urdu Format)
                    </div>
                  </div>
                  {selectedLanguage === 'ur' && (
                    <span className="w-5 h-5 rounded-full bg-[#0f2942] text-white flex items-center justify-center text-[10px]">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </button>

                {/* English Option */}
                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`p-3.5 rounded-2xl border-2 text-right transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    selectedLanguage === 'en'
                      ? 'border-[#0f2942] bg-blue-50/70 shadow-sm ring-2 ring-[#0f2942]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-black text-sm text-[#0f2942]">
                      English (انگریزی)
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      100% English Official Bilty
                    </div>
                  </div>
                  {selectedLanguage === 'en' && (
                    <span className="w-5 h-5 rounded-full bg-[#0f2942] text-white flex items-center justify-center text-[10px]">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Note & Helpline Info */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-tight">
              <strong>نوٹ:</strong> ہمارے پاس دونوں برانچوں کے علیحدہ پتے ہیں، جبکہ موبائل نمبر ایک ہی ہیں (0300-5370443، 0339-5370443)۔ بلٹی کے بیک گراؤنڈ میں آفیشل کارڈ خودکار سنک رہے گا۔
            </div>

            {/* Submit & Continue Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem('ah-bilty-branch', selectedBranch);
                    localStorage.setItem('ah-bilty-lang', selectedLanguage);
                  } catch {}
                  setIsConfigModalOpen(false);
                }}
                className="w-full py-3.5 bg-[#0f2942] hover:bg-[#1a3a5c] text-white font-black text-sm rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <span>بلٹی شروع کریں (Continue to Bilty)</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <div className="bg-white p-4 sm:p-8 md:p-10 rounded-2xl sm:rounded-[40px] shadow-sm border border-[#ecece0] space-y-6 sm:space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-[#ecece0]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-2 border-[#0f2942]/20 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              <PublicImage
                fileName="bilty-official-icon.png"
                src="./bilty-official-icon.png"
                alt="Official Bilty Seal"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#4a4a35]">
                  {t.title}
                </h1>
                <button
                  type="button"
                  onClick={() => exportContactsCSV()}
                  title="Download Customer & Driver Contacts CSV"
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'ur' ? 'کسٹمر لسٹ (CSV)' : 'Export CSV'}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-[#8e8e75] font-sans mt-0.5">
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="p-2 bg-white border border-[#ecece0] hover:bg-[#eaeae0] text-[#4a4a35] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                title={isUrdu ? 'ڈیش بورڈ پر واپس جائیں' : 'Back to Dashboard'}
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
                <span>{isUrdu ? 'ڈیش بورڈ' : 'Dashboard'}</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#fdfbf7] p-1.5 rounded-full border border-[#ecece0]">
              <button
                type="button"
                onClick={() => setSubTab('create')}
                className={`px-4 sm:px-5 py-2.5 min-h-[44px] rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center ${
                  subTab === 'create' ? 'bg-[#5a5a40] text-white shadow-xs' : 'text-[#8e8e75] hover:text-[#4a4a35]'
                }`}
              >
                {t.createTab}
              </button>
              <button
                type="button"
                onClick={() => setSubTab('search')}
                className={`px-4 sm:px-5 py-2.5 min-h-[44px] rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center ${
                  subTab === 'search' ? 'bg-[#5a5a40] text-white shadow-xs' : 'text-[#8e8e75] hover:text-[#4a4a35]'
                }`}
              >
                {t.searchTab}
              </button>
            </div>
          </div>
        </header>

        {/* 2. Top Branch & Language Control Bar */}
        <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-linear-to-r from-amber-50/80 via-emerald-50/60 to-blue-50/80 border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0f2942] text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-black text-slate-800">
                <span className="flex items-center gap-1 text-[#0f2942]">
                  📍 برانچ: <strong className="underline underline-offset-2">{selectedBranch === 'kamalia' ? 'کمالیہ (Kamalia)' : 'سمندری (Samundri)'}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-[#0f2942]">
                  🌐 زبان: <strong className="underline underline-offset-2">{selectedLanguage === 'en' ? 'English (مکمل انگریزی)' : 'اردو (مکمل اردو)'}</strong>
                </span>
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                <strong>ایڈریس:</strong> {selectedLanguage === 'en' ? branchObj.addressEn : branchObj.addressUr}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Branch Toggle */}
            <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => handleBranchChange('samundri')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedBranch === 'samundri' ? 'bg-[#0f2942] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                سمندری
              </button>
              <button
                type="button"
                onClick={() => handleBranchChange('kamalia')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedBranch === 'kamalia' ? 'bg-[#0f2942] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                کمالیہ
              </button>
            </div>

            {/* Quick Language Toggle */}
            <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => handleLanguageChange('ur')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedLanguage === 'ur' ? 'bg-[#0f2942] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                اردو
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedLanguage === 'en' ? 'bg-[#0f2942] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
            </div>

            {/* Reopen Modal Button */}
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(true)}
              className="p-2 bg-white border border-slate-300 hover:bg-slate-100 text-[#0f2942] rounded-xl transition-all cursor-pointer shadow-2xs"
              title="برانچ اور زبان سیٹ اپ تبدیل کریں"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Datalist for Autocomplete */}
        <datalist id="contacts-autocomplete">
          {contactsList.map((c, idx) => (
            <option key={idx} value={c.name}>{c.phone ? `${c.name} (${c.phone})` : c.name}</option>
          ))}
        </datalist>

        {subTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* FORM */}
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75]">
                    {isEnForm ? 'Vehicle Number' : t.vehicleNo}
                  </label>
                  <CameraOcrInput
                    lang={lang}
                    mode="vehicle"
                    onScanResult={(plate) => setVehicleNo(plate)}
                    label={isEnForm ? 'Scan Plate' : 'نمبر اسکین'}
                  />
                </div>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="e.g. LHR-7860"
                  className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">
                    {isEnForm ? 'Date' : t.date}
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="26 Oct, 2024"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">
                    {isEnForm ? 'Driver Mobile No' : t.mobileNo}
                  </label>
                  <input
                    type="text"
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75]">
                    {isEnForm ? 'Driver Name' : t.driverName}
                  </label>
                  <VoiceInputButton lang={lang} onTranscript={(txt) => setDriverName(txt)} />
                </div>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  list="contacts-autocomplete"
                  placeholder={isEnForm ? 'Driver Name' : 'ڈرائیور کا نام'}
                  className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all"
                />
              </div>

              {/* Cities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75]">
                      {isEnForm ? 'Dispatch Station (From)' : t.sendingCity}
                    </label>
                    <VoiceInputButton lang={lang} onTranscript={(txt) => setSendingCity(txt)} />
                  </div>
                  <input
                    type="text"
                    value={sendingCity}
                    onChange={(e) => setSendingCity(e.target.value)}
                    placeholder={isEnForm ? (selectedBranch === 'kamalia' ? 'Kamalia' : 'Samundri') : (selectedBranch === 'kamalia' ? 'کمالیہ' : 'سمندری')}
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75]">
                      {isEnForm ? 'Destination Depot (To)' : t.receivingCity}
                    </label>
                    <VoiceInputButton lang={lang} onTranscript={(txt) => setReceivingCity(txt)} />
                  </div>
                  <input
                    type="text"
                    value={receivingCity}
                    onChange={(e) => setReceivingCity(e.target.value)}
                    placeholder={isEnForm ? 'e.g. Karachi' : 'مثلاً کراچی'}
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Sender Info Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75]">
                      {isEnForm ? 'Consignor / Sender Name' : t.senderName}
                    </label>
                    <VoiceInputButton lang={lang} onTranscript={(txt) => setSenderName(txt)} />
                  </div>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    list="contacts-autocomplete"
                    placeholder={isEnForm ? 'Consignor Name' : 'بھیجنے والے کا نام'}
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">
                    {isEnForm ? 'Sender Phone' : t.senderMobile}
                  </label>
                  <input
                    type="text"
                    value={senderMobile}
                    onChange={(e) => setSenderMobile(e.target.value)}
                    placeholder="0300-XXXXXXX"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono transition-all"
                  />
                </div>
              </div>

              {/* Receiver Info Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75]">
                      {isEnForm ? 'Consignee / Receiver Name' : t.receiverName}
                    </label>
                    <VoiceInputButton lang={lang} onTranscript={(txt) => setReceiverName(txt)} />
                  </div>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    list="contacts-autocomplete"
                    placeholder={isEnForm ? 'Consignee Name' : 'وصول کنندہ کا نام'}
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">
                    {isEnForm ? 'Receiver Phone' : t.receiverMobile}
                  </label>
                  <input
                    type="text"
                    value={receiverMobile}
                    onChange={(e) => setReceiverMobile(e.target.value)}
                    placeholder="0300-XXXXXXX"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono transition-all"
                  />
                </div>
              </div>

              {/* CNIC */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">
                  {isEnForm ? 'Sender CNIC' : t.senderCnic}
                </label>
                <input
                  type="text"
                  value={senderCnic}
                  onChange={(e) => setSenderCnic(e.target.value)}
                  placeholder="XXXXX-XXXXXXX-X"
                  className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono transition-all"
                />
              </div>

              {/* Qty & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">
                    {isEnForm ? 'Quantity (Pkgs)' : t.qty}
                  </label>
                  <input
                    type="text"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder={isEnForm ? '100 Bags' : '100 بوریاں'}
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">
                    {isEnForm ? 'Description of Goods' : t.itemDescription}
                  </label>
                  <input
                    type="text"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    placeholder={isEnForm ? 'Cargo description (e.g. Rice Bags)' : 'تفصیل مال (مثلاً چاول سوپر کرنل)'}
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Weight, Total, Advance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">
                    {isEnForm ? 'Weight (kg)' : t.weight}
                  </label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="5000 kg"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">
                    {isEnForm ? 'Total Freight (Rs)' : t.total}
                  </label>
                  <input
                    type="number"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    placeholder="0"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">
                    {isEnForm ? 'Advance Paid (Rs)' : t.advance}
                  </label>
                  <input
                    type="number"
                    value={advance}
                    onChange={(e) => setAdvance(e.target.value)}
                    placeholder="0"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 min-h-[48px] bg-[#5a5a40] text-white rounded-full font-medium text-xs sm:text-sm uppercase tracking-widest hover:bg-[#4a4a35] shadow-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Receipt className="w-4 h-4 text-[#8b9d77]" />
                <span>{isEnForm ? 'Generate Bilty' : t.generateBtn}</span>
              </button>
            </form>

            {/* PREVIEW */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8e8e75]">
                  {isEnForm ? 'Live Bilty Preview' : 'بلٹی پیش منظر (لائیو)'}
                </span>
                {lastBilty && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {isEnForm ? 'Ready for Print / PDF' : 'پرنٹ اور پی ڈی ایف تیار'}
                  </span>
                )}
              </div>

              {lastBilty ? (
                renderBiltyPreview(lastBilty)
              ) : (
                <div className="min-h-[480px] bg-[#fdfbf7] border-2 border-dashed border-[#ecece0] rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-6 sm:p-10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#f0f0e4] flex items-center justify-center text-[#8e8e75]">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#4a4a35]">
                      {isEnForm ? 'No Bilty Generated Yet' : 'ابھی تک کوئی بلٹی جنریٹ نہیں ہوئی'}
                    </h3>
                    <p className="text-xs text-[#8e8e75] mt-1 max-w-xs">
                      {isEnForm
                        ? 'Fill out vehicle and cargo details on the left, then click "Generate Bilty" to create the official document.'
                        : 'بائیں جانب گاڑی اور مال کی تفصیلات درج کر کے "بلٹی جنریٹ کریں" پر کلک کریں۔'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEARCH */}
        {subTab === 'search' && (
          <div className="space-y-6">
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isUrdu ? 'بلٹی نمبر لکھیں (مثلاً WG-2026-0001)' : 'Enter Bilty No (e.g. WG-2026-0001)'}
                className="flex-1 min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all uppercase font-mono"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#5a5a40] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#4a4a35] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>{t.searchBtn}</span>
              </button>
            </form>

            {searchResult === null && (
              <div className="p-8 text-center text-xs text-[#8e8e75] bg-[#fdfbf7] rounded-2xl border border-[#ecece0]">
                {t.notFound}
              </div>
            )}

            {searchResult && (
              <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#fdfbf7] border border-[#ecece0]">
                {renderBiltyPreview(searchResult)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden container for print and PDF generation */}
      {activePrintRecord && (
        <div
          id="printable-bilty-dom"
          className="printable-bilty-area fixed -top-[9999px] left-0 w-[794px] min-w-[794px] max-w-[794px] h-auto min-h-[1110px] bg-white text-slate-900 pointer-events-none opacity-100 z-[-100] print:static print:w-full print:h-auto print:opacity-100 print:pointer-events-auto print:z-auto"
        >
          <PrintableBilty
            record={activePrintRecord}
            qrDataUrl={activePrintQrUrl}
            branch={activePrintRecord.branch || selectedBranch}
            language={activePrintRecord.language || selectedLanguage}
          />
        </div>
      )}
    </div>
  );
};
