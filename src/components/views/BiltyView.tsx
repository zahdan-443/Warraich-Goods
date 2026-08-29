import React, { useState, useEffect } from 'react';
import { BiltyRecord, ContactItem, DICTIONARY, Language } from '../../types';
import { Receipt, Search, Download, FileText, MapPin, Share2, Phone, FileSpreadsheet, Printer, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { VoiceInputButton } from '../VoiceInputButton';
import { CameraOcrInput } from '../CameraOcrInput';
import { PrintableBilty } from '../PrintableBilty';
import { exportContactsCSV, getContactList, allocateNextBiltyNumber } from '../../utils/storage';
import { validateBiltyFreight } from '../../utils/calculator';
import { generatePdfFromElement, shareBiltyPdfOrWhatsApp } from '../../utils/pdfHelper';

const getQrDataUrl = async (record: BiltyRecord): Promise<string> => {
  const currentOrigin = typeof window !== 'undefined' && window.location && window.location.origin
    ? window.location.origin
    : '';

  const qrText = [
    `WARRAICH GOODS TRANSPORT CO.`,
    `Bilty No: ${record.biltyNo}`,
    `Date: ${record.date || '-'}`,
    `Vehicle: ${record.vehicleNo}`,
    `Route: ${record.sendingCity || '-'} to ${record.receivingCity || '-'}`,
    `Sender: ${record.senderName || record.consignor || '-'} (${record.senderMobile || '-'})`,
    `Receiver: ${record.receiverName || record.consignee || '-'} (${record.receiverMobile || '-'})`,
    `Goods: ${record.itemDescription || '-'} (${record.qty || '-'} Pcs)`,
    `Weight: ${record.weight || '-'} KG`,
    `Freight: Rs ${record.total ? record.total.toLocaleString('en-US') : '0'}`,
    `Payable: Rs ${record.payable ? record.payable.toLocaleString('en-US') : '0'}`,
    `Helpline: 0300-5370443 | 0339-5370443`,
    currentOrigin ? `Verify: ${currentOrigin}` : ''
  ].filter(Boolean).join('\n');

  try {
    return await QRCode.toDataURL(qrText, {
      width: 350,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#000000', light: '#ffffff' }
    });
  } catch (e) {
    console.error('Failed to generate QR code:', e);
    return '';
  }
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
  }, [record.biltyNo, record.vehicleNo, record.sendingCity, record.receivingCity]);

  if (!qrUrl) return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
  return <img src={qrUrl} alt="QR Code" className={className} />;
};

interface BiltyViewProps {
  lang: Language;
  bilties: BiltyRecord[];
  onAddBilty: (record: Omit<BiltyRecord, 'id'>) => void;
}

export const BiltyView: React.FC<BiltyViewProps> = ({ lang, bilties, onAddBilty }) => {
  const t = DICTIONARY[lang].bilty;
  const bu = DICTIONARY.ur.bilty; // Urdu dictionary for Bilty document content

  const [subTab, setSubTab] = useState<'create' | 'search'>('create');

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

  const handlePrintBuilty = async (record: BiltyRecord) => {
    const qrUrl = await getQrDataUrl(record);
    setActivePrintQrUrl(qrUrl);
    setActivePrintRecord(record);
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
      alert(validation.error || 'درست کرایہ اور پیشگی رقم درج کریں۔');
      return;
    }

    // Allocate sequential unique Bilty Number via Transaction / Monotonic counter
    const allocatedBiltyNo = await allocateNextBiltyNumber();

    const record: Omit<BiltyRecord, 'id'> = {
      biltyNo: allocatedBiltyNo,
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
    setActivePrintRecord(record);
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

  const renderBiltyPreview = (record: BiltyRecord) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#ecece0]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider font-mono bg-slate-900 text-white px-3 py-1 rounded-xs">
            {record.biltyNo}
          </span>
          <span className="text-xs font-bold text-slate-700 hidden sm:inline">
            {lang === 'ur' ? 'مارکیٹ اسٹینڈرڈ پرنٹ کے لیے تیار بلٹی' : 'Market Standard Print-Ready Builty'}
          </span>
        </div>
        <BiltyQrCode record={record} className="w-12 h-12 rounded border border-slate-300 bg-white object-contain" />
      </div>

      <div className="bg-slate-100/70 p-2 sm:p-4 rounded-xl border border-slate-200 overflow-x-auto">
        <PrintableBilty record={record} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => handlePrintBuilty(record)}
          disabled={isGeneratingPdf}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-98"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>{lang === 'ur' ? 'پرنٹ بلٹی (A4/A5)' : 'Print Builty'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleDownloadPDF(record)}
          disabled={isGeneratingPdf}
          className="w-full py-3 bg-[#f0f0e4] hover:bg-[#8b9d77] hover:text-white disabled:opacity-50 text-[#5a5a40] rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
        >
          {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin text-[#5a5a40]" /> : <Download className="w-4 h-4" />}
          <span>{isGeneratingPdf ? (lang === 'ur' ? 'تیار ہو رہی ہے...' : 'Generating...') : t.downloadBtn}</span>
        </button>

        <button
          type="button"
          onClick={() => handleWhatsAppShare(record)}
          disabled={isGeneratingPdf}
          className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-98"
        >
          {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Share2 className="w-4 h-4" />}
          <span>{lang === 'ur' ? 'واٹس ایپ شیئر' : 'WhatsApp Share'}</span>
        </button>
      </div>
    </div>
  );


  return (
    <div className="flex-1 p-3 sm:p-6 md:p-10 max-w-5xl mx-auto w-full space-y-6 sm:space-y-8">
      <div className="bg-white p-4 sm:p-8 md:p-10 rounded-2xl sm:rounded-[40px] shadow-sm border border-[#ecece0] space-y-6 sm:space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-[#ecece0]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#4a4a35]">
                {t.title}
              </h1>
              <button
                type="button"
                onClick={exportContactsCSV}
                title="Download Customer & Driver Contacts CSV"
                className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'ur' ? 'کسٹمر لسٹ (CSV)' : 'Export CSV'}</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-[#8e8e75] font-sans mt-1">
              {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#fdfbf7] p-1.5 rounded-full border border-[#ecece0] self-start sm:self-auto">
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
        </header>

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
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75]">{t.vehicleNo}</label>
                  <CameraOcrInput
                    lang={lang}
                    mode="vehicle"
                    onScanResult={(plate) => setVehicleNo(plate)}
                    label={lang === 'ur' ? 'نمبر اسکین' : 'Scan Plate'}
                  />
                </div>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="e.g. LHR-7860"
                  className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.date}</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="26 Oct, 2024"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.mobileNo}</label>
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75]">{t.driverName}</label>
                  <VoiceInputButton lang={lang} onTranscript={(txt) => setDriverName(txt)} />
                </div>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  list="contacts-autocomplete"
                  placeholder="ڈرائیور کا نام"
                  className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all"
                />
              </div>

              {/* Cities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75]">{t.sendingCity}</label>
                    <VoiceInputButton lang={lang} onTranscript={(txt) => setSendingCity(txt)} />
                  </div>
                  <input
                    type="text"
                    value={sendingCity}
                    onChange={(e) => setSendingCity(e.target.value)}
                    placeholder="مثلاً کمالیہ"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75]">{t.receivingCity}</label>
                    <VoiceInputButton lang={lang} onTranscript={(txt) => setReceivingCity(txt)} />
                  </div>
                  <input
                    type="text"
                    value={receivingCity}
                    onChange={(e) => setReceivingCity(e.target.value)}
                    placeholder="مثلاً کراچی"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Sender Info Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75]">{t.senderName}</label>
                    <VoiceInputButton lang={lang} onTranscript={(txt) => setSenderName(txt)} />
                  </div>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    list="contacts-autocomplete"
                    placeholder="بھیجنے والے کا نام"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.senderMobile}</label>
                  <input
                    type="text"
                    value={senderMobile}
                    onChange={(e) => setSenderMobile(e.target.value)}
                    placeholder="موبائل نمبر"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono transition-all"
                  />
                </div>
              </div>

              {/* Receiver Info Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75]">{t.receiverName}</label>
                    <VoiceInputButton lang={lang} onTranscript={(txt) => setReceiverName(txt)} />
                  </div>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    list="contacts-autocomplete"
                    placeholder="وصول کنندہ کا نام"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.receiverMobile}</label>
                  <input
                    type="text"
                    value={receiverMobile}
                    onChange={(e) => setReceiverMobile(e.target.value)}
                    placeholder="موبائل نمبر"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono transition-all"
                  />
                </div>
              </div>

              {/* CNIC */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.senderCnic}</label>
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.qty}</label>
                  <input
                    type="text"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder="100 بوریاں"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.itemDescription}</label>
                  <input
                    type="text"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    placeholder="تفصیل مال (مثلاً چاول سوپر کرنل)"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Weight, Total, Advance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.weight}</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="5000 kg"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.total}</label>
                  <input
                    type="number"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    placeholder="0"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.advance}</label>
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
                <span>{t.generateBtn}</span>
              </button>
            </form>

            {/* PREVIEW */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#fdfbf7] border border-[#ecece0] space-y-4">
              {lastBilty ? (
                renderBiltyPreview(lastBilty)
              ) : (
                <div className="p-8 sm:p-10 text-center">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#8b9d77]" />
                  <p className="font-serif italic text-sm text-[#5a5a40]">{t.empty}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {subTab === 'search' && (
          <div className="max-w-md mx-auto space-y-5">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="flex-1 min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono transition-all"
              />
              <button
                type="submit"
                className="px-5 py-3 min-h-[44px] bg-[#5a5a40] text-white rounded-xl hover:bg-[#4a4a35] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span className="sm:hidden font-medium text-xs uppercase tracking-wider">Search</span>
              </button>
            </form>

            {searchResult === null && (
              <div className="p-8 text-center bg-[#fdfbf7] rounded-3xl border border-[#ecece0]">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#8b9d77]" />
                <p className="font-serif italic text-sm text-[#5a5a40]">{t.noResult}</p>
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

      {activePrintRecord && (
        <div
          id="printable-bilty-dom"
          className="printable-bilty-area fixed -top-[9999px] left-0 w-[794px] min-w-[794px] max-w-[794px] h-auto min-h-[1110px] bg-white text-slate-900 pointer-events-none opacity-100 z-[-100] print:static print:w-full print:h-auto print:opacity-100 print:pointer-events-auto print:z-auto"
        >
          <PrintableBilty record={activePrintRecord} qrDataUrl={activePrintQrUrl} />
        </div>
      )}
    </div>
  );
};
