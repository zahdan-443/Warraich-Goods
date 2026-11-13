import React, { useState, useEffect, useMemo } from 'react';
import { BiltyRecord, ContactItem, DICTIONARY, Language, BiltyBranch, BiltyLanguage, LegalRecordingItem } from '../../types';
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
  Check,
  Eye,
  Trash2,
  Plus,
  Filter,
  ArrowUpDown,
  X,
  Layers,
  Truck,
  User,
  Wallet,
  Calendar,
  RefreshCw,
  PackageCheck,
  Clock,
  ShieldCheck,
  FileArchive,
  ChevronDown,
  ChevronUp,
  Camera,
  Upload,
  PhoneCall,
  Pencil
} from 'lucide-react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { VoiceInputButton } from '../VoiceInputButton';
import { CameraOcrInput } from '../CameraOcrInput';
import { PrintableBilty } from '../PrintableBilty';
import { BiltyLegalVaultModal } from '../BiltyLegalVaultModal';
import {
  exportContactsCSV,
  getContactList,
  allocateNextBiltyNumber,
  exportAllBiltiesCSV,
  setScopedItem,
  syncToFirestore,
  getStoredBilties,
  saveStoredBilties
} from '../../utils/storage';
import { validateBiltyFreight } from '../../utils/calculator';
import { generatePdfFromElement, shareBiltyPdfOrWhatsApp } from '../../utils/pdfHelper';
import { downloadBiltyLegalZip } from '../../utils/zipHelper';
import { PublicImage } from '../PublicImage';
import {
  generateBiltyVerificationQrDataUrl,
  getBiltyVerificationUrl,
  BILTY_BRANCHES,
  formatBiltyMobile
} from '../../utils/biltyHelpers';
import { BiltyLegalVault } from '../../types';

const getQrDataUrl = async (record: BiltyRecord): Promise<string> => {
  if (!record?.biltyNo) return '';
  return await generateBiltyVerificationQrDataUrl(record);
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
  initialSubTab?: 'all' | 'create' | 'search';
  onAddBilty: (record: Omit<BiltyRecord, 'id'>) => void;
  onUpdateBilty?: (record: BiltyRecord) => void;
  onDeleteBilty?: (id: number) => void;
  onNavigate?: (tab: string, subSection?: string) => void;
}

export const BiltyView: React.FC<BiltyViewProps> = ({
  lang,
  bilties,
  initialSubTab,
  onAddBilty,
  onUpdateBilty,
  onDeleteBilty,
  onNavigate
}) => {
  const isUrdu = lang === 'ur';
  const t = DICTIONARY[lang].bilty;

  // SubTab: 'all' (Sari Bilties) | 'create' (Nai Bilty) | 'search' (Talaash)
  const [subTab, setSubTab] = useState<'all' | 'create' | 'search'>(() => {
    return initialSubTab || (bilties && bilties.length > 0 ? 'all' : 'create');
  });

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Filters for "All Bilties" view
  const [allFilterQuery, setAllFilterQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState<'all' | 'samundri' | 'kamalia'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'partial' | 'topay'>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'delivered' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'total_desc' | 'payable_desc'>('newest');

  // Modal & Edit states
  const [selectedModalBilty, setSelectedModalBilty] = useState<BiltyRecord | null>(null);
  const [biltyToDelete, setBiltyToDelete] = useState<BiltyRecord | null>(null);
  const [editingBilty, setEditingBilty] = useState<BiltyRecord | null>(null);
  const [editIsDelivered, setEditIsDelivered] = useState<boolean>(false);

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
  const [formError, setFormError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [lastBilty, setLastBilty] = useState<BiltyRecord | null>(null);
  const [activePrintRecord, setActivePrintRecord] = useState<BiltyRecord | null>(null);
  const [activePrintQrUrl, setActivePrintQrUrl] = useState<string>('');

  // Legal Vault state for newly created bilty
  const [creationLegalVault, setCreationLegalVault] = useState<BiltyLegalVault>({});
  const [isLegalVaultExpanded, setIsLegalVaultExpanded] = useState(false);

  // Legal Vault modal for existing bilties
  const [vaultModalBilty, setVaultModalBilty] = useState<BiltyRecord | null>(null);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [contactsList, setContactsList] = useState<ContactItem[]>(() => getContactList());

  const resetFormFields = () => {
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
    setCreationLegalVault({});
    setIsLegalVaultExpanded(false);
    setEditingBilty(null);
    setEditIsDelivered(false);
    setFormError(null);
  };

  const handleStartEditBilty = (record: BiltyRecord) => {
    setEditingBilty(record);
    setEditIsDelivered(Boolean(record.isDelivered || record.podConfirmation?.status === 'delivered'));
    setVehicleNo(record.vehicleNo || '');
    setDate(record.date || getTodayFormatted());
    setDriverName(record.driverName || '');
    setMobileNo(record.mobileNo || '');
    setSendingCity(record.sendingCity || '');
    setReceivingCity(record.receivingCity || '');
    setSenderName(record.senderName || record.consignor || '');
    setSenderMobile(record.senderMobile || '');
    setReceiverName(record.receiverName || record.consignee || '');
    setReceiverMobile(record.receiverMobile || '');
    setSenderCnic(record.senderCnic || '');
    setQty(record.qty || '');
    setItemDescription(record.itemDescription || '');
    setWeight(record.weight || '');
    setTotal(record.total !== undefined ? String(record.total) : '');
    setAdvance(record.advance !== undefined ? String(record.advance) : '');
    setCreationLegalVault(record.legalVault || {});
    if (record.branch) setSelectedBranch(record.branch);
    if (record.language) setSelectedLanguage(record.language);
    setIsConfigModalOpen(false);
    setSelectedModalBilty(null);
    setLastBilty(record);
    setFormError(null);
    setSubTab('create');
  };

  const handleSaveVault = (biltyId: number, updatedVault: BiltyLegalVault) => {
    const updated = bilties.map((b) => {
      if (b.id === biltyId) {
        return { ...b, legalVault: updatedVault };
      }
      return b;
    });
    saveStoredBilties(updated);
    if (selectedModalBilty && selectedModalBilty.id === biltyId) {
      setSelectedModalBilty({ ...selectedModalBilty, legalVault: updatedVault });
    }
    if (lastBilty && lastBilty.id === biltyId) {
      setLastBilty({ ...lastBilty, legalVault: updatedVault });
    }
    if (vaultModalBilty && vaultModalBilty.id === biltyId) {
      setVaultModalBilty({ ...vaultModalBilty, legalVault: updatedVault });
    }
  };

  useEffect(() => {
    setContactsList(getContactList());
  }, [bilties]);

  // Aggregates for All Bilties
  const totalStats = useMemo(() => {
    let totalFreight = 0;
    let totalAdvance = 0;
    let totalPayable = 0;
    bilties.forEach((b) => {
      totalFreight += Number(b.total) || 0;
      totalAdvance += Number(b.advance) || 0;
      totalPayable += Number(b.payable) || 0;
    });
    return {
      count: bilties.length,
      totalFreight,
      totalAdvance,
      totalPayable
    };
  }, [bilties]);

  const filteredBilties = useMemo(() => {
    let list = [...bilties];

    // Branch filter
    if (branchFilter !== 'all') {
      list = list.filter((b) => (b.branch || 'samundri') === branchFilter);
    }

    // Payment status filter
    if (paymentFilter === 'paid') {
      list = list.filter((b) => Number(b.payable) <= 0);
    } else if (paymentFilter === 'partial') {
      list = list.filter((b) => Number(b.advance) > 0 && Number(b.payable) > 0);
    } else if (paymentFilter === 'topay') {
      list = list.filter((b) => Number(b.advance) <= 0 && Number(b.payable) > 0);
    }

    // Delivery status (POD) filter
    if (deliveryFilter === 'delivered') {
      list = list.filter((b) => b.isDelivered || !!b.podConfirmation);
    } else if (deliveryFilter === 'pending') {
      list = list.filter((b) => !b.isDelivered && !b.podConfirmation);
    }

    // Text search query
    if (allFilterQuery.trim()) {
      const q = allFilterQuery.trim().toLowerCase();
      list = list.filter((b) => {
        return (
          (b.biltyNo && b.biltyNo.toLowerCase().includes(q)) ||
          (b.vehicleNo && b.vehicleNo.toLowerCase().includes(q)) ||
          (b.driverName && b.driverName.toLowerCase().includes(q)) ||
          (b.mobileNo && b.mobileNo.toLowerCase().includes(q)) ||
          (b.senderName && b.senderName.toLowerCase().includes(q)) ||
          (b.senderMobile && b.senderMobile.toLowerCase().includes(q)) ||
          (b.receiverName && b.receiverName.toLowerCase().includes(q)) ||
          (b.receiverMobile && b.receiverMobile.toLowerCase().includes(q)) ||
          (b.sendingCity && b.sendingCity.toLowerCase().includes(q)) ||
          (b.receivingCity && b.receivingCity.toLowerCase().includes(q)) ||
          (b.itemDescription && b.itemDescription.toLowerCase().includes(q)) ||
          (b.senderCnic && b.senderCnic.toLowerCase().includes(q))
        );
      });
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
      if (sortBy === 'oldest') return (a.id || 0) - (b.id || 0);
      if (sortBy === 'total_desc') return (Number(b.total) || 0) - (Number(a.total) || 0);
      if (sortBy === 'payable_desc') return (Number(b.payable) || 0) - (Number(a.payable) || 0);
      return 0;
    });

    return list;
  }, [bilties, branchFilter, paymentFilter, deliveryFilter, allFilterQuery, sortBy]);

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
      if (typeof (window as any).AndroidPrinter?.print === 'function') {
        (window as any).AndroidPrinter.print();
      } else {
        window.print();
      }
    }, 250);
  };

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<BiltyRecord | null | undefined>(undefined);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalNum = parseFloat(total) || 0;
    const advanceNum = parseFloat(advance) || 0;

    // Financial Validation
    setFormError(null);
    const validation = validateBiltyFreight(totalNum, advanceNum);
    if (!validation.isValid) {
      setFormError(validation.error || (selectedLanguage === 'en' ? 'Please enter valid freight & advance amount.' : 'درست کرایہ اور پیشگی رقم درج کریں۔'));
      return;
    }

    if (editingBilty) {
      const updatedRecord: BiltyRecord = {
        ...editingBilty,
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
        isDelivered: editIsDelivered,
        podConfirmation: editIsDelivered
          ? (editingBilty.podConfirmation || {
              receiverName: receiverName.trim() || editingBilty.receiverName || 'Consignee',
              confirmedAt: new Date().toISOString(),
              status: 'delivered'
            })
          : undefined,
        legalVault: Object.keys(creationLegalVault).length > 0 ? creationLegalVault : undefined,
        updatedAt: new Date().toISOString()
      };

      if (onUpdateBilty) {
        onUpdateBilty(updatedRecord);
      } else {
        const nextList = bilties.map(b => (b.id === updatedRecord.id ? updatedRecord : b));
        saveStoredBilties(nextList);
      }
      setLastBilty(updatedRecord);
      resetFormFields();
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
      legalVault: Object.keys(creationLegalVault).length > 0 ? creationLegalVault : undefined,
    };

    onAddBilty(record);
    setLastBilty({ ...record, id: Date.now() });

    // Reset fields
    resetFormFields();
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
    setPdfError(null);
    try {
      const result = await generateBiltyPdf(record);
      if (result) {
        result.pdf.save(`Bilty_${record.biltyNo}.pdf`);
      }
    } catch (err) {
      console.error('PDF export failed:', err);
      setPdfError('پی ڈی ایف بنانے میں مسئلہ آیا: ' + (err instanceof Error ? err.message : String(err)));
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

  const handleDownloadZip = async (record: BiltyRecord) => {
    if (isDownloadingZip) return;
    setIsDownloadingZip(true);
    try {
      let pdfBlob: Blob | undefined;
      try {
        const result = await generateBiltyPdf(record);
        if (result?.pdfBlob) {
          pdfBlob = result.pdfBlob;
        }
      } catch (e) {
        console.warn('PDF generation for ZIP notice:', e);
      }
      await downloadBiltyLegalZip(record, pdfBlob);
    } catch (err) {
      console.error('ZIP generation failed:', err);
    } finally {
      setIsDownloadingZip(false);
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
        {/* Proof of Delivery (POD) Status Banner */}
        {(record.isDelivered || record.podConfirmation) && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 text-blue-950 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-700 text-white uppercase tracking-wider font-mono">
                    {previewLang === 'ur' ? 'مال وصول ہو گیا (Delivered)' : 'Delivered (POD)'}
                  </span>
                  <span className="text-xs font-bold text-blue-900">
                    {record.podConfirmation?.receiverName || record.receivedBy || record.receiverName}
                  </span>
                </div>
                {record.podConfirmation?.confirmedAt && (
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    {new Date(record.podConfirmation.confirmedAt).toLocaleString(previewLang === 'ur' ? 'ur-PK' : 'en-US')}
                  </p>
                )}
              </div>
            </div>
            {record.podConfirmation?.photoUrl && (
              <a
                href={record.podConfirmation.photoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white border border-blue-300 hover:bg-blue-100 text-xs font-bold text-blue-800 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <img
                  src={record.podConfirmation.photoUrl}
                  alt="POD"
                  className="w-4 h-4 rounded object-cover"
                />
                <span>{previewLang === 'ur' ? 'رسید تصویر' : 'POD Photo'}</span>
              </a>
            )}
          </div>
        )}

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
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
            title="براہ راست بلٹی پی ڈی ایف فائل واٹس ایپ میں شیئر کریں"
          >
            {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Share2 className="w-4 h-4" />}
            <span>{previewLang === 'en' ? 'WhatsApp PDF Share' : 'واٹس ایپ PDF شیئر'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownloadZip(record)}
            disabled={isDownloadingZip || isGeneratingPdf}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-98"
            title="بلٹی پی ڈی ایف، تصاویر اور صوتی فائلوں کی مکمل ZIP فائل ڈاؤن لوڈ کریں"
          >
            {isDownloadingZip ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <FileArchive className="w-4 h-4" />}
            <span>{isDownloadingZip ? (previewLang === 'en' ? 'Packaging ZIP...' : 'ZIP پیک ہو رہی ہے...') : (previewLang === 'en' ? 'Download ZIP Vault' : 'ڈاؤن لوڈ ZIP والٹ')}</span>
          </button>
        </div>

        {/* Legal Vault Button Banner */}
        <div className="pt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {previewLang === 'en'
                ? 'Legal Evidence Vault (Driver/Vehicle/Party IDs & Voice Notes)'
                : 'قانونی دستاویزات و صوتی والٹ (محفوظ کلاؤڈ اسٹوریج)'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setVaultModalBilty(record);
              setIsVaultModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-300 shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{previewLang === 'en' ? 'Manage Legal Vault' : 'دستاویزات والٹ کھولیں'}</span>
            {record.legalVault && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                {Object.keys(record.legalVault).filter((k) => k !== 'updatedAt' && k !== 'recordings' && Boolean((record.legalVault as any)[k])).length + (record.legalVault.recordings?.length || 0)}
              </span>
            )}
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportAllBiltiesCSV()}
                    title={isUrdu ? 'تمام بلٹیوں کی مکمل ایکسل شیٹ ڈاؤن لوڈ کریں' : 'Download All Bilties CSV'}
                    className="px-3 py-1.5 bg-[#0f2942] text-amber-300 border border-[#1a3a5c] rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#1a3a5c] transition-all cursor-pointer shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'ur' ? 'بلٹی لیجر (CSV)' : 'Bilties CSV'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => exportContactsCSV()}
                    title="Download Customer & Driver Contacts CSV"
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === 'ur' ? 'کسٹمر لسٹ' : 'Contacts'}</span>
                  </button>
                </div>
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

            <div className="flex items-center gap-1 sm:gap-1.5 bg-[#fdfbf7] p-1.5 rounded-full border border-[#ecece0] flex-wrap">
              <button
                type="button"
                onClick={() => setSubTab('all')}
                className={`px-3 sm:px-4 py-2 min-h-[40px] rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  subTab === 'all' ? 'bg-[#5a5a40] text-white shadow-xs' : 'text-[#8e8e75] hover:text-[#4a4a35]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'تمام بلٹیاں' : 'All Bilties'}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  subTab === 'all' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                }`}>
                  {bilties.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSubTab('create')}
                className={`px-3 sm:px-4 py-2 min-h-[40px] rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  subTab === 'create' ? 'bg-[#5a5a40] text-white shadow-xs' : 'text-[#8e8e75] hover:text-[#4a4a35]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.createTab}</span>
              </button>
              <button
                type="button"
                onClick={() => setSubTab('search')}
                className={`px-3 sm:px-4 py-2 min-h-[40px] rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  subTab === 'search' ? 'bg-[#5a5a40] text-white shadow-xs' : 'text-[#8e8e75] hover:text-[#4a4a35]'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t.searchTab}</span>
              </button>
            </div>
          </div>
        </header>

        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-2xl text-center shadow-2xs">
            {formError}
          </div>
        )}

        {pdfError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold p-3 rounded-2xl text-center shadow-2xs">
            {pdfError}
          </div>
        )}

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

        {/* ALL BILTIES ARCHIVE / LEDGER */}
        {subTab === 'all' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. Summary KPI Financial & Volume Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Bilties */}
              <div className="p-4 rounded-2xl bg-[#0f2942] text-white border border-[#1a3a5c] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    {isUrdu ? 'کل بلٹیاں' : 'Total Bilties'}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
                    <Receipt className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                    {totalStats.count}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {isUrdu ? 'تمام محفوظ شدہ بلٹی ریکارڈز' : 'All saved bilty records'}
                  </div>
                </div>
              </div>

              {/* Total Freight */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {isUrdu ? 'کل فریٹ رقم' : 'Total Freight'}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-black font-mono text-slate-800">
                    Rs {totalStats.totalFreight.toLocaleString('en-PK')}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {isUrdu ? 'تمام بلٹیوں کی کل مالیت' : 'Gross booking volume'}
                  </div>
                </div>
              </div>

              {/* Advance Collected */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {isUrdu ? 'پیشگی وصولی' : 'Advance Paid'}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-black font-mono text-blue-600">
                    Rs {totalStats.totalAdvance.toLocaleString('en-PK')}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {isUrdu ? 'روانگی پر موصول ایڈوانس' : 'Advance freight collected'}
                  </div>
                </div>
              </div>

              {/* Balance Due */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {isUrdu ? 'بقایا واجب الادا' : 'Balance Due'}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-black font-mono text-rose-600">
                    Rs {totalStats.totalPayable.toLocaleString('en-PK')}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {isUrdu ? 'ان لوڈنگ پر قابل وصولی' : 'Pending to collect at depot'}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Controls Toolbar */}
            <div className="bg-[#fdfbf7] p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#ecece0] space-y-3.5">
              {/* Row 1: Search & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={allFilterQuery}
                    onChange={(e) => setAllFilterQuery(e.target.value)}
                    placeholder={isUrdu ? 'بلٹی نمبر، گاڑی نمبر، ڈرائیور، یا کسٹمر تلاش کریں...' : 'Search Bilty #, vehicle plate, driver, city...'}
                    className="w-full bg-white border border-slate-300 rounded-xl pr-10 pl-9 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#0f2942] focus:outline-none transition-all"
                  />
                  {allFilterQuery && (
                    <button
                      type="button"
                      onClick={() => setAllFilterQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Fast Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => exportAllBiltiesCSV()}
                    className="px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    title={isUrdu ? 'تمام بلٹیوں کی مکمل ایکسل شیٹ ڈاؤن لوڈ کریں' : 'Export all bilties to CSV'}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>{isUrdu ? 'ایکسل شیٹ (CSV)' : 'Export CSV'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubTab('create')}
                    className="px-3.5 py-2 bg-[#0f2942] hover:bg-[#1a3a5c] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>{isUrdu ? 'نئی بلٹی بنائیں' : 'New Bilty'}</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Branch Filters, Payment Filters & Sorting */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
                {/* Branch Filters */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 ml-1">
                    {isUrdu ? 'برانچ:' : 'Branch:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBranchFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      branchFilter === 'all'
                        ? 'bg-[#0f2942] text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isUrdu ? 'تمام' : 'All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBranchFilter('samundri')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      branchFilter === 'samundri'
                        ? 'bg-[#0f2942] text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    📍 {isUrdu ? 'سمندری' : 'Samundri'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBranchFilter('kamalia')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      branchFilter === 'kamalia'
                        ? 'bg-[#0f2942] text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    📍 {isUrdu ? 'کمالیہ' : 'Kamalia'}
                  </button>
                </div>

                {/* Payment Filters */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 ml-1">
                    {isUrdu ? 'ادائیگی:' : 'Payment:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPaymentFilter('all')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentFilter === 'all'
                        ? 'bg-slate-800 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isUrdu ? 'تمام' : 'All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentFilter('paid')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentFilter === 'paid'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50'
                    }`}
                  >
                    {isUrdu ? 'مکمل ادا' : 'Paid'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentFilter('partial')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentFilter === 'partial'
                        ? 'bg-amber-700 text-white'
                        : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-50'
                    }`}
                  >
                    {isUrdu ? 'جزوی پیشگی' : 'Advance'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentFilter('topay')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentFilter === 'topay'
                        ? 'bg-rose-700 text-white'
                        : 'bg-white border border-rose-200 text-rose-800 hover:bg-rose-50'
                    }`}
                  >
                    {isUrdu ? 'ٹو پے (بقایا)' : 'To-Pay'}
                  </button>
                </div>

                {/* Delivery / POD Status Filters */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 ml-1">
                    {isUrdu ? 'وصولی (POD):' : 'Delivery:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeliveryFilter('all')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      deliveryFilter === 'all'
                        ? 'bg-slate-800 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isUrdu ? 'تمام' : 'All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryFilter('delivered')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      deliveryFilter === 'delivered'
                        ? 'bg-blue-700 text-white shadow-2xs'
                        : 'bg-white border border-blue-200 text-blue-800 hover:bg-blue-50'
                    }`}
                  >
                    <PackageCheck className="w-3 h-3" />
                    <span>{isUrdu ? 'پہنچ گیا (POD)' : 'Delivered'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryFilter('pending')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      deliveryFilter === 'pending'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-50'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{isUrdu ? 'وصولی باقی' : 'Pending POD'}</span>
                  </button>
                </div>

                {/* Sort Selector */}
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="newest">{isUrdu ? 'تازہ ترین پہلے' : 'Newest First'}</option>
                    <option value="oldest">{isUrdu ? 'پرانی بلٹیاں پہلے' : 'Oldest First'}</option>
                    <option value="total_desc">{isUrdu ? 'زیادہ کرایہ پہلے' : 'Highest Freight'}</option>
                    <option value="payable_desc">{isUrdu ? 'زیادہ بقایا پہلے' : 'Highest Balance Due'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Ledger Content: Empty State OR Records */}
            {filteredBilties.length === 0 ? (
              <div className="p-10 text-center bg-[#fdfbf7] rounded-3xl border-2 border-dashed border-[#ecece0] space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-base text-slate-800">
                  {bilties.length === 0
                    ? (isUrdu ? 'ابھی تک کوئی بلٹی جنریٹ نہیں ہوئی' : 'No Bilties Generated Yet')
                    : (isUrdu ? 'فلٹر کے مطابق کوئی بلٹی نہیں ملی' : 'No Bilties Match Your Filters')}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {bilties.length === 0
                    ? (isUrdu ? 'نئی بلٹی بنائیں کے بٹن پر کلک کر کے اپنی پہلی آفیشل بلٹی رسید تیار کریں۔' : 'Click "New Bilty" to create your first official freight consignment note.')
                    : (isUrdu ? 'براہ کرم سرچ کیورڈ یا فلٹرز تبدیل کر کے دوبارہ کوشش کریں۔' : 'Try clearing your search query or adjusting your branch/payment filters.')}
                </p>
                {bilties.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setSubTab('create')}
                    className="px-5 py-2.5 bg-[#0f2942] hover:bg-[#1a3a5c] text-white rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>{isUrdu ? 'پہلی بلٹی بنائیں' : 'Create First Bilty'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAllFilterQuery('');
                      setBranchFilter('all');
                      setPaymentFilter('all');
                    }}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'فلٹرز ری سیٹ کریں' : 'Reset Filters'}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop & Tablet Full Ledger Table */}
                <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <table className="w-full text-right text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3.5 text-right">{isUrdu ? 'بلٹی نمبر و تاریخ' : 'Bilty # & Date'}</th>
                        <th className="py-3 px-3 text-right">{isUrdu ? 'برانچ' : 'Branch'}</th>
                        <th className="py-3 px-3 text-right">{isUrdu ? 'گاڑی و ڈرائیور' : 'Vehicle & Driver'}</th>
                        <th className="py-3 px-3 text-right">{isUrdu ? 'روٹ (از ➔ تا)' : 'Route'}</th>
                        <th className="py-3 px-3 text-right">{isUrdu ? 'پارٹیاں (بھیجنے/وصول کنندہ)' : 'Parties'}</th>
                        <th className="py-3 px-3 text-right">{isUrdu ? 'تفصیل مال' : 'Cargo'}</th>
                        <th className="py-3 px-3 text-right">{isUrdu ? 'کرایہ تفصیل' : 'Freight'}</th>
                        <th className="py-3 px-3 text-center">{isUrdu ? 'سٹیٹس' : 'Status'}</th>
                        <th className="py-3 px-3.5 text-center">{isUrdu ? 'کارروائی' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBilties.map((b) => {
                        const isPaid = Number(b.payable) <= 0;
                        const isPartial = Number(b.advance) > 0 && Number(b.payable) > 0;
                        const bBranch = b.branch || 'samundri';
                        return (
                          <tr key={b.id || b.biltyNo} className="hover:bg-amber-50/40 transition-colors">
                            {/* Bilty No & Date */}
                            <td className="py-3 px-3.5 font-mono">
                              <div className="font-black text-slate-900 flex items-center gap-1.5">
                                <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[11px]">
                                  {b.biltyNo}
                                </span>
                                {b.pendingOnlineNumber && (
                                  <span title="آن لائن نمبر التواء">
                                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                                📅 {b.date || '—'}
                              </div>
                            </td>

                            {/* Branch */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0f2942] text-white">
                                📍 {bBranch === 'kamalia' ? 'کمالیہ' : 'سمندری'}
                              </span>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {b.language === 'en' ? 'English' : 'اردو'}
                              </div>
                            </td>

                            {/* Vehicle & Driver */}
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800 uppercase font-mono">
                                🚛 {b.vehicleNo}
                              </div>
                              {b.driverName && (
                                <div className="text-[11px] text-slate-600 mt-0.5">
                                  {b.driverName} {b.mobileNo ? `(${b.mobileNo})` : ''}
                                </div>
                              )}
                            </td>

                            {/* Route */}
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-800">
                                {b.sendingCity || 'سمندری'} <span className="text-slate-400">➔</span> {b.receivingCity || 'منزل'}
                              </div>
                            </td>

                            {/* Parties */}
                            <td className="py-3 px-3 max-w-[180px]">
                              <div className="text-[11px] text-slate-800 truncate" title={`بھیجنے والا: ${b.senderName || b.consignor || '—'}`}>
                                <strong className="text-slate-500">از:</strong> {b.senderName || b.consignor || '—'}
                              </div>
                              <div className="text-[11px] text-slate-800 truncate" title={`وصول کنندہ: ${b.receiverName || b.consignee || '—'}`}>
                                <strong className="text-slate-500">تا:</strong> {b.receiverName || b.consignee || '—'}
                              </div>
                            </td>

                            {/* Cargo */}
                            <td className="py-3 px-3 max-w-[150px]">
                              <div className="font-semibold text-slate-800 truncate" title={b.itemDescription || '—'}>
                                {b.itemDescription || '—'}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {b.qty ? `${b.qty} • ` : ''}{b.weight ? `${b.weight} kg` : ''}
                              </div>
                            </td>

                            {/* Freight Breakdown */}
                            <td className="py-3 px-3 font-mono whitespace-nowrap">
                              <div className="font-bold text-slate-900">
                                کل: Rs {Number(b.total || 0).toLocaleString('en-PK')}
                              </div>
                              <div className="text-[10px] text-blue-600">
                                پیشگی: Rs {Number(b.advance || 0).toLocaleString('en-PK')}
                              </div>
                              <div className="text-[10px] font-bold text-rose-600">
                                بقایا: Rs {Number(b.payable || 0).toLocaleString('en-PK')}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3 px-3 text-center whitespace-nowrap">
                              <div className="flex flex-col items-center gap-1">
                                {isPaid ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    ✓ مکمل ادا
                                  </span>
                                ) : isPartial ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    جزوی پیشگی
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                    ٹو پے (بقایا)
                                  </span>
                                )}

                                {/* Delivery / POD Badge */}
                                {b.isDelivered || b.podConfirmation ? (
                                  <span 
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300"
                                    title={b.podConfirmation ? `وصول کنندہ: ${b.podConfirmation.receiverName}` : 'پہنچ گیا'}
                                  >
                                    <PackageCheck className="w-3 h-3 text-blue-600" />
                                    <span>{isUrdu ? 'پہنچ گیا' : 'Delivered'}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                    <Clock className="w-3 h-3 text-slate-500" />
                                    <span>{isUrdu ? 'جاری شدہ' : 'Issued'}</span>
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-3.5 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedModalBilty(b)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                  title={isUrdu ? 'بلٹی دیکھیں' : 'View Bilty'}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePrintBuilty(b)}
                                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 transition-colors cursor-pointer"
                                  title={isUrdu ? 'پرنٹ بلٹی' : 'Print Bilty'}
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadPDF(b)}
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                                  title={isUrdu ? 'PDF ڈاؤن لوڈ' : 'Download PDF'}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleWhatsAppShare(b)}
                                  className="p-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white transition-colors cursor-pointer"
                                  title={isUrdu ? 'واٹس ایپ PDF شیئر' : 'WhatsApp'}
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVaultModalBilty(b);
                                    setIsVaultModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer relative"
                                  title={isUrdu ? 'قانونی والٹ (دستاویزات و کالز)' : 'Legal Vault'}
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  {b.legalVault && (
                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                                      {Object.keys(b.legalVault).filter((k) => k !== 'updatedAt' && k !== 'recordings' && Boolean((b.legalVault as any)[k])).length + (b.legalVault.recordings?.length || 0)}
                                    </span>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditBilty(b)}
                                  className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer"
                                  title={isUrdu ? 'بلٹی ترمیم کریں' : 'Edit Bilty'}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadZip(b)}
                                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
                                  title={isUrdu ? 'ZIP والٹ ڈاؤن لوڈ کریں' : 'Download ZIP Vault'}
                                >
                                  <FileArchive className="w-3.5 h-3.5" />
                                </button>
                                {onDeleteBilty && (
                                  <button
                                    type="button"
                                    onClick={() => setBiltyToDelete(b)}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                    title={isUrdu ? 'حذف کریں' : 'Delete'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Cards */}
                <div className="lg:hidden space-y-3">
                  {filteredBilties.map((b) => {
                    const isPaid = Number(b.payable) <= 0;
                    const isPartial = Number(b.advance) > 0 && Number(b.payable) > 0;
                    const bBranch = b.branch || 'samundri';
                    return (
                      <div
                        key={b.id || b.biltyNo}
                        className="bg-white dark:bg-[#1a1c22] rounded-2xl border border-slate-200 dark:border-[#2d313b] p-4 space-y-3 shadow-xs"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2d313b] pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-900 dark:bg-slate-950 text-white font-mono text-xs font-black px-2.5 py-1 rounded border border-slate-700">
                              {b.biltyNo}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0f2942] text-white">
                              📍 {bBranch === 'kamalia' ? 'کمالیہ' : 'سمندری'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            {isPaid ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                ✓ مکمل ادا
                              </span>
                            ) : isPartial ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                جزوی پیشگی
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                ٹو پے (بقایا)
                              </span>
                            )}

                            {b.isDelivered || b.podConfirmation ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1">
                                <PackageCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                <span>{isUrdu ? 'پہنچ گیا' : 'Delivered'}</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-[#22252c] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2d313b] flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                <span>{isUrdu ? 'جاری شدہ' : 'Issued'}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Vehicle, Driver & Route */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{isUrdu ? 'گاڑی و ڈرائیور' : 'Vehicle & Driver'}</div>
                            <div className="font-mono font-bold text-slate-900 dark:text-slate-100 uppercase">{b.vehicleNo}</div>
                            {b.driverName && <div className="text-slate-600 dark:text-slate-300 text-[11px] truncate">{b.driverName}</div>}
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{isUrdu ? 'روٹ' : 'Route'}</div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {b.sendingCity || 'سمندری'} ➔ {b.receivingCity || 'منزل'}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{b.date || '—'}</div>
                          </div>
                        </div>

                        {/* Parties & Cargo */}
                        <div className="bg-slate-50 dark:bg-[#121316] rounded-xl p-2.5 text-[11px] space-y-1 border border-slate-200/50 dark:border-[#2d313b] text-slate-800 dark:text-slate-200">
                          <div className="truncate">
                            <strong className="text-slate-500 dark:text-slate-400">بھیجنے والا:</strong> {b.senderName || b.consignor || '—'}
                          </div>
                          <div className="truncate">
                            <strong className="text-slate-500 dark:text-slate-400">وصول کنندہ:</strong> {b.receiverName || b.consignee || '—'}
                          </div>
                          <div className="truncate text-slate-700 dark:text-slate-300">
                            <strong className="text-slate-500 dark:text-slate-400">مال:</strong> {b.itemDescription || '—'} {b.weight ? `(${b.weight} kg)` : ''}
                          </div>
                        </div>

                        {/* Financial Pills */}
                        <div className="grid grid-cols-3 gap-1.5 font-mono text-center text-[11px]">
                          <div className="bg-slate-100 dark:bg-[#22252c] p-1.5 rounded-lg border border-slate-200 dark:border-[#2d313b]">
                            <div className="text-[9px] text-slate-500 dark:text-slate-400">{isUrdu ? 'کل' : 'Total'}</div>
                            <div className="font-bold text-slate-900 dark:text-[#f8fafc]">Rs {Number(b.total || 0).toLocaleString('en-PK')}</div>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-950/60 p-1.5 rounded-lg text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                            <div className="text-[9px] text-blue-600 dark:text-blue-400">{isUrdu ? 'پیشگی' : 'Advance'}</div>
                            <div className="font-bold">Rs {Number(b.advance || 0).toLocaleString('en-PK')}</div>
                          </div>
                          <div className="bg-rose-50 dark:bg-rose-950/60 p-1.5 rounded-lg text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                            <div className="text-[9px] text-rose-600 dark:text-rose-400">{isUrdu ? 'بقایا' : 'Due'}</div>
                            <div className="font-bold">Rs {Number(b.payable || 0).toLocaleString('en-PK')}</div>
                          </div>
                        </div>

                        {/* Mobile Action Buttons */}
                        <div className="space-y-1.5 pt-1">
                          <div className="grid grid-cols-4 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedModalBilty(b)}
                              className="py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#22252c] dark:hover:bg-[#2c3038] text-slate-800 dark:text-slate-200 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors border border-slate-200/60 dark:border-[#2d313b]"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>دیکھیں</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePrintBuilty(b)}
                              className="py-2 bg-slate-900 dark:bg-slate-950 text-amber-400 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors border border-amber-400/30"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>پرنٹ</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadPDF(b)}
                              className="py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors border border-emerald-200 dark:border-emerald-800"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>پی ڈی ایف</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleWhatsAppShare(b)}
                              className="py-2 bg-[#25D366] text-white rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>واٹس ایپ PDF</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-4 gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEditBilty(b)}
                              className="py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 rounded-xl text-[11px] font-bold flex flex-row items-center justify-center gap-1 cursor-pointer transition-colors border border-indigo-200 dark:border-indigo-800"
                            >
                              <Pencil className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span>{isUrdu ? 'ترمیم' : 'Edit'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setVaultModalBilty(b);
                                setIsVaultModalOpen(true);
                              }}
                              className="py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded-xl text-[11px] font-bold flex flex-row items-center justify-center gap-1 cursor-pointer transition-colors relative border border-blue-200 dark:border-blue-800"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              <span>والٹ</span>
                              {b.legalVault && (
                                <span className="bg-blue-600 text-white text-[9px] px-1 rounded-full font-bold">
                                  {Object.keys(b.legalVault).filter((k) => k !== 'updatedAt' && k !== 'recordings' && Boolean((b.legalVault as any)[k])).length + (b.legalVault.recordings?.length || 0)}
                                </span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadZip(b)}
                              className="py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 rounded-xl text-[11px] font-bold flex flex-row items-center justify-center gap-1 cursor-pointer transition-colors border border-amber-200 dark:border-amber-800"
                            >
                              <FileArchive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>ZIP</span>
                            </button>
                            {onDeleteBilty ? (
                              <button
                                type="button"
                                onClick={() => setBiltyToDelete(b)}
                                className="py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl text-[11px] font-bold flex flex-row items-center justify-center gap-1 cursor-pointer transition-colors border border-rose-200 dark:border-rose-800"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                <span>حذف</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedModalBilty(b)}
                                className="py-2 bg-slate-100 dark:bg-[#22252c] text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-bold flex flex-row items-center justify-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>تصدیق</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {subTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* FORM */}
            <form onSubmit={handleGenerate} className="space-y-4">
              {editingBilty && (
                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-700 text-white font-mono text-xs font-bold">
                      {editingBilty.biltyNo}
                    </span>
                    <span className="text-xs font-bold text-indigo-950">
                      {isEnForm ? 'Editing Bilty' : 'بلٹی میں ترمیم جاری ہے'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resetFormFields}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      {isEnForm ? 'Cancel' : 'منسوخ'}
                    </button>
                  </div>
                </div>
              )}
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
                    onChange={(e) => setMobileNo(formatBiltyMobile(e.target.value))}
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
                    onChange={(e) => setSenderMobile(formatBiltyMobile(e.target.value))}
                    placeholder="0300-1234567"
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
                    onChange={(e) => setReceiverMobile(formatBiltyMobile(e.target.value))}
                    placeholder="0300-1234567"
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

              {/* Optional Legal Vault Attachments (Driver, Vehicle, Sender, Receiver Photos/CNIC & Audio) */}
              <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsLegalVaultExpanded(!isLegalVaultExpanded)}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition-colors text-right cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        {isEnForm ? 'Legal Documents & Voice Notes (Optional)' : 'قانونی دستاویزات و صوتی نوٹس والٹ (اختیاری)'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {isEnForm
                          ? 'Driver, vehicle, party photos, CNIC & audio records for legal archive'
                          : 'ڈرائیور، گاڑی، کسٹمر تصاویر، شناختی کارڈ اور صوتی ریکارڈز'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {Object.keys(creationLegalVault).filter(k => k !== 'recordings' && Boolean((creationLegalVault as any)[k])).length + (creationLegalVault.recordings?.length || 0) > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {Object.keys(creationLegalVault).filter(k => k !== 'recordings' && Boolean((creationLegalVault as any)[k])).length + (creationLegalVault.recordings?.length || 0)} فائلز
                      </span>
                    )}
                    {isLegalVaultExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </button>

                {isLegalVaultExpanded && (
                  <div className="p-4 bg-slate-50/50 space-y-4 border-t border-slate-200 text-right animate-in fade-in duration-150">
                    <p className="text-[11px] text-slate-600">
                      {isEnForm
                        ? 'Files uploaded here are stored securely in cloud for legal reasons and will not appear on the printed bilty receipt.'
                        : 'یہ دستاویزات قانونی حفاظت کے لیے کلاؤڈ میں محفوظ ہوں گی لیکن بلٹی رسید پر ظاہر نہیں ہوں گی۔ آپ بعد میں بھی والٹ میں جا کر ترمیم کر سکتے ہیں۔'}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { key: 'driverPhoto', label: isEnForm ? 'Driver Photo' : 'ڈرائیور تصویر' },
                        { key: 'driverLicense', label: isEnForm ? 'Driver License' : 'ڈرائیور لائسنس' },
                        { key: 'driverCnic', label: isEnForm ? 'Driver CNIC' : 'ڈرائیور CNIC' },
                        { key: 'vehiclePhoto', label: isEnForm ? 'Vehicle Photo' : 'گاڑی تصویر' },
                        { key: 'senderPhoto', label: isEnForm ? 'Sender Photo' : 'بھیجنے والا تصویر' },
                        { key: 'senderCnic', label: isEnForm ? 'Sender CNIC' : 'بھیجنے والا CNIC' },
                        { key: 'receiverPhoto', label: isEnForm ? 'Receiver Photo' : 'وصول کنندہ تصویر' },
                        { key: 'receiverCnic', label: isEnForm ? 'Receiver CNIC' : 'وصول کنندہ CNIC' },
                      ].map((item) => {
                        const val = (creationLegalVault as any)[item.key];
                        return (
                          <div key={item.key} className="border border-slate-200 rounded-xl p-2 bg-white text-center flex flex-col justify-between">
                            <span className="text-[10px] font-bold text-slate-700 block mb-1 truncate">{item.label}</span>
                            {val ? (
                              <div className="relative w-full h-16 rounded-lg overflow-hidden bg-slate-100 mb-1">
                                <img src={val} alt={item.label} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setCreationLegalVault(prev => {
                                    const next = { ...prev };
                                    delete (next as any)[item.key];
                                    return next;
                                  })}
                                  className="absolute top-1 right-1 w-5 h-5 rounded bg-rose-600 text-white flex items-center justify-center text-[10px]"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <label className="w-full h-16 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors mb-1">
                                <Camera className="w-4 h-4 mb-0.5" />
                                <span className="text-[9px] font-semibold">اپلوڈ</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) {
                                      const r = new FileReader();
                                      r.onload = (ev) => {
                                        const res = ev.target?.result as string;
                                        if (res) {
                                          setCreationLegalVault(prev => ({ ...prev, [item.key]: res }));
                                        }
                                      };
                                      r.readAsDataURL(f);
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Audio note input */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                        <span>{isEnForm ? 'Voice Note File (Audio)' : 'صوتی ہدایات فائل (Audio Note)'}</span>
                      </span>
                      <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isEnForm ? 'Select Audio' : 'آڈیو منتخب کریں'}</span>
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              const r = new FileReader();
                              r.onload = (ev) => {
                                const res = ev.target?.result as string;
                                if (res) {
                                  const newRec: LegalRecordingItem = {
                                    id: `rec_${Date.now()}`,
                                    name: f.name || 'Voice_Note',
                                    dataUrl: res,
                                    createdAt: new Date().toISOString()
                                  };
                                  setCreationLegalVault(prev => ({
                                    ...prev,
                                    recordings: [...(prev.recordings || []), newRec]
                                  }));
                                }
                              };
                              r.readAsDataURL(f);
                            }
                          }}
                        />
                      </label>
                    </div>
                    {creationLegalVault.recordings && creationLegalVault.recordings.length > 0 && (
                      <div className="text-[11px] text-emerald-700 font-bold">
                        ✓ {creationLegalVault.recordings.length} ریکارڈنگ منسلک ہے
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 min-h-[48px] bg-[#5a5a40] text-white rounded-full font-medium text-xs sm:text-sm uppercase tracking-widest hover:bg-[#4a4a35] shadow-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Receipt className="w-4 h-4 text-[#8b9d77]" />
                <span>
                  {editingBilty
                    ? (isEnForm ? 'Save Changes' : 'تبدیلیاں محفوظ کریں')
                    : (isEnForm ? 'Generate Bilty' : t.generateBtn)}
                </span>
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
                {t.noResult}
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

      {/* 4. Full Bilty Modal Inspection */}
      {selectedModalBilty && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border-2 border-[#0f2942] my-auto space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black bg-slate-900 text-white px-3 py-1 rounded">
                  {selectedModalBilty.biltyNo}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {isUrdu ? 'بلٹی رسید معائنہ' : 'Bilty Inspection'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedModalBilty(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {renderBiltyPreview(selectedModalBilty)}
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      {biltyToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-500 space-y-4 text-right" dir="rtl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                {isUrdu ? 'کیا آپ واقعی یہ بلٹی حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this bilty?'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {biltyToDelete.biltyNo} • {biltyToDelete.vehicleNo}
              </p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 text-center">
              {isUrdu
                ? 'یہ کارروائی مستقل ہے اور یہ بلٹی لیجر سے حذف ہو جائے گی۔'
                : 'This action is irreversible and will remove this bilty from your ledger.'}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBiltyToDelete(null)}
                className="py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
              >
                {isUrdu ? 'منسوخ کریں' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteBilty && biltyToDelete.id) {
                    onDeleteBilty(biltyToDelete.id);
                  }
                  setBiltyToDelete(null);
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {isUrdu ? 'ہاں، ڈیلیٹ کریں' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal Vault Modal for viewing, editing, and uploading attachments */}
      {vaultModalBilty && (
        <BiltyLegalVaultModal
          isOpen={isVaultModalOpen}
          onClose={() => {
            setIsVaultModalOpen(false);
            setVaultModalBilty(null);
          }}
          bilty={vaultModalBilty}
          onSaveVault={handleSaveVault}
          onGeneratePdf={generateBiltyPdf}
        />
      )}

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
