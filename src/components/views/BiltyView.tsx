import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  BiltyRecord,
  ContactItem,
  DICTIONARY,
  Language,
  BiltyBranch,
  BiltyLanguage,
  KhataReceivingPoint,
  BranchConfig,
  BranchPermissions
} from '../../types';
import { getAllReceivingPoints } from '../../utils/khataModulesStorage';
import { DEFAULT_SAMUNDRI_BRANCH, getActiveBranchId, getCachedBranchById } from '../../utils/branchContext';
import { DEFAULT_HEAD_OFFICE_BRANCH_ID, isOwnerEmail } from '../../utils/authUtils';
import {
  AddaLifecycleError,
  assertBiltyEditAllowedForAdda,
  getAddaParties,
  getAddaPendingCommissions,
  getAddaPendingFreight,
  syncBiltyAddaLinks,
  syncBiltyDeleteAddaCleanup
} from '../../utils/addaBillingStorage';
import {
  Receipt,
  Search,
  Download,
  FileText,
  Share2,
  Printer,
  Loader2,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Check,
  X,
  PackageCheck,
  ShieldCheck,
  FileArchive,
  ChevronDown,
  ChevronUp,
  Camera,
  Upload,
  PhoneCall,
  Lock
} from 'lucide-react';
import jsPDF from 'jspdf';
import { VoiceInputButton } from '../VoiceInputButton';
import { CameraOcrInput } from '../CameraOcrInput';
import { PrintableBilty } from '../PrintableBilty';
import { BiltyLegalVaultModal } from '../BiltyLegalVaultModal';
import { ConfirmDialog } from '../ConfirmDialog';
import {
  OfflineBlockExhaustedError,
  getContactList,
  allocateNextBiltyNumber,
  checkBiltyNoConflict,
  resolveBiltyNumberConflict,
  exportAllBiltiesCSV,
  saveStoredBilties
} from '../../utils/storage';
import { validateBiltyFreight, validateFinancialNumber } from '../../utils/calculator';
import { generatePdfFromElement, preloadBiltyPdfAssets, shareBiltyPdfOrWhatsApp } from '../../utils/pdfHelper';
import { shareOrDownloadBlob } from '../../utils/nativeExport';
import { downloadBiltyLegalZip } from '../../utils/zipHelper';
import {
  generateBiltyVerificationQrDataUrl,
  formatBiltyMobile
} from '../../utils/biltyHelpers';
import { BiltyDeleteModal } from './bilty/BiltyDeleteModal';
import { BiltyAllRecordsTab } from './bilty/BiltyAllRecordsTab';
import { countBiltyAttachments, LegalVaultImageKey } from './bilty/biltyVaultUtils';
import {
  ATTACHMENT_AUDIO_HARD_CAP_BYTES,
  ATTACHMENT_RETENTION_DAYS,
  AttachmentStorageStats,
  compressAttachmentImage,
  DEFAULT_MAX_ID_IMAGES_PER_DOC,
  exportAttachmentsZipBundle,
  getAttachmentsForBilty,
  getBiltyAttachmentStorageStats,
  getExpiringBiltyAttachmentsSummary,
  isIdCardSlot,
  PendingDraftAttachment,
  saveBiltyAttachment,
  setBiltyLegalHold,
  validateAudioAttachmentDataUrl
} from '../../utils/biltyAttachments';
import type { BiltyAttachmentRecord } from '../../types';

interface AndroidPrinterWindow extends Window {
  AndroidPrinter?: {
    print?: () => void;
  };
}

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
  onAddBilty: (record: Omit<BiltyRecord, 'id'>) => BiltyRecord | Promise<BiltyRecord> | void;
  onUpdateBilty?: (record: BiltyRecord) => void;
  onDeleteBilty?: (id: number) => void;
  onResolveConflict?: (biltyId: number) => void | Promise<void>;
  onNavigate?: (tab: string, subSection?: string) => void;
  activeBranch?: BranchConfig | null;
  branchPermissions?: BranchPermissions;
  currentUserEmail?: string | null;
  currentUserUid?: string | null;
}

export const BiltyView: React.FC<BiltyViewProps> = ({
  lang,
  bilties,
  initialSubTab,
  onAddBilty,
  onUpdateBilty,
  onDeleteBilty,
  onResolveConflict,
  onNavigate,
  activeBranch,
  branchPermissions,
  currentUserEmail,
  currentUserUid
}) => {
  const isUrdu = lang === 'ur';
  const t = DICTIONARY[lang].bilty;

  const effectiveBranch = useMemo<BranchConfig>(() => {
    if (activeBranch) return activeBranch;
    const cached = getCachedBranchById(getActiveBranchId() || DEFAULT_HEAD_OFFICE_BRANCH_ID);
    return cached || DEFAULT_SAMUNDRI_BRANCH;
  }, [activeBranch]);

  const isCreatorUser = isOwnerEmail(currentUserEmail);
  const canCreateBilty = branchPermissions ? branchPermissions.createBilty : true;
  const canEditDeleteBilty = branchPermissions ? branchPermissions.editDeleteBilty : true;
  const canViewAllBilties = branchPermissions ? branchPermissions.viewAllBilties : true;
  const conflictBilties = useMemo(() => bilties.filter((b) => Boolean(b.numberConflict)), [bilties]);
  const [resolvingConflictId, setResolvingConflictId] = useState<number | null>(null);

  const resolvedInitialSubTab = useMemo<'all' | 'create' | 'search'>(() => {
    if (initialSubTab === 'create' && !canCreateBilty) {
      return canViewAllBilties ? 'all' : 'search';
    }
    if (initialSubTab === 'all' && !canViewAllBilties) {
      return canCreateBilty ? 'create' : 'search';
    }
    if (initialSubTab) return initialSubTab;
    if (bilties && bilties.length > 0 && canViewAllBilties) return 'all';
    if (canCreateBilty) return 'create';
    return canViewAllBilties ? 'all' : 'search';
  }, [initialSubTab, canCreateBilty, canViewAllBilties, bilties]);

  // SubTab: 'all' (Sari Bilties) | 'create' (Nai Bilty) | 'search' (Talaash)
  const [subTab, setSubTab] = useState<'all' | 'create' | 'search'>(() => resolvedInitialSubTab);
  const subTabHistoryRef = useRef<Array<'all' | 'create' | 'search'>>([]);
  const [showExitCreateConfirm, setShowExitCreateConfirm] = useState(false);

  const navigateSubTab = useCallback((nextTab: 'all' | 'create' | 'search') => {
    setSubTab((prev) => {
      if (prev !== nextTab) {
        subTabHistoryRef.current.push(prev);
        if (typeof window !== 'undefined' && window.history?.pushState) {
          try {
            window.history.pushState({ tab: 'bilty', subTab: nextTab }, '', '#bilty');
          } catch {}
        }
      }
      return nextTab;
    });
    if (nextTab === 'create' && canCreateBilty) {
      setIsConfigModalOpen(true);
    } else {
      setIsConfigModalOpen(false);
    }
  }, [canCreateBilty]);

  useEffect(() => {
    if (initialSubTab) {
      subTabHistoryRef.current = [];
      if (initialSubTab === 'create' && !canCreateBilty) {
        setSubTab(canViewAllBilties ? 'all' : 'search');
        setIsConfigModalOpen(false);
      } else if (initialSubTab === 'all' && !canViewAllBilties) {
        setSubTab(canCreateBilty ? 'create' : 'search');
        setIsConfigModalOpen(Boolean(canCreateBilty));
      } else {
        setSubTab(initialSubTab);
        setIsConfigModalOpen(initialSubTab === 'create' && canCreateBilty);
      }
    }
  }, [initialSubTab, canCreateBilty, canViewAllBilties]);

  // Filters for "All Bilties" view (focused strictly on dispatch records, not payment ledger)
  const [allFilterQuery, setAllFilterQuery] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'delivered' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Modal & Edit states
  const [selectedModalBilty, setSelectedModalBilty] = useState<BiltyRecord | null>(null);
  const [biltyToDelete, setBiltyToDelete] = useState<BiltyRecord | null>(null);
  const [editingBilty, setEditingBilty] = useState<BiltyRecord | null>(null);
  const [editIsDelivered, setEditIsDelivered] = useState<boolean>(false);

  useEffect(() => {
    if (subTab === 'create' && !canCreateBilty && !editingBilty) {
      setSubTab(canViewAllBilties ? 'all' : 'search');
    } else if (subTab === 'all' && !canViewAllBilties) {
      setSubTab(canCreateBilty ? 'create' : 'search');
    }
  }, [subTab, canCreateBilty, canViewAllBilties, editingBilty]);

  // Active Branch & Language Selection State
  const selectedBranch: BiltyBranch = effectiveBranch.id || DEFAULT_HEAD_OFFICE_BRANCH_ID;

  const [selectedLanguage, setSelectedLanguage] = useState<BiltyLanguage>(() => {
    try {
      const stored = localStorage.getItem('ah-bilty-lang');
      if (stored === 'ur' || stored === 'en') return stored;
    } catch {}
    return 'ur';
  });

  // Only open Language Selection modal when opening Create Bilty flow (never on View Bilty / All Bilties)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(
    () => resolvedInitialSubTab === 'create' && canCreateBilty
  );

  const getTodayFormatted = () => {
    return new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Form state
  const [vehicleNo, setVehicleNo] = useState('');
  const [date, setDate] = useState(getTodayFormatted);
  const [driverName, setDriverName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [driverCnic, setDriverCnic] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [sendingCity, setSendingCity] = useState('');
  const [receivingCity, setReceivingCity] = useState('');
  const [receivingPointId, setReceivingPointId] = useState('');
  const [receivingPointName, setReceivingPointName] = useState('');
  const [receivingPoints] = useState<KhataReceivingPoint[]>(() => getAllReceivingPoints());
  const [senderName, setSenderName] = useState('');
  const [senderMobile, setSenderMobile] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverMobile, setReceiverMobile] = useState('');
  const [senderCnic, setSenderCnic] = useState('');
  const [receiverCnic, setReceiverCnic] = useState('');
  const [qty, setQty] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [total, setTotal] = useState('');
  const [advance, setAdvance] = useState('');
  const [remarks, setRemarks] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [lastBilty, setLastBilty] = useState<BiltyRecord | null>(null);
  const [activePrintRecord, setActivePrintRecord] = useState<BiltyRecord | null>(null);
  const [activePrintQrUrl, setActivePrintQrUrl] = useState<string>('');
  const [preloadedAssets, setPreloadedAssets] = useState<{ logo: string; card: string }>({
    logo: '',
    card: ''
  });

  useEffect(() => {
    let active = true;
    preloadBiltyPdfAssets()
      .then((assets) => {
        if (active) setPreloadedAssets(assets);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Optional Isolated Adda Freight Pending & Commission Pending prompts
  const [freightPendingEnabled, setFreightPendingEnabled] = useState(false);
  const [freightPendingPartyName, setFreightPendingPartyName] = useState('');
  const [freightPendingPartyMobile, setFreightPendingPartyMobile] = useState('');
  const [freightPendingAmount, setFreightPendingAmount] = useState('');

  const [commissionPendingEnabled, setCommissionPendingEnabled] = useState(false);
  const [commissionPendingFromName, setCommissionPendingFromName] = useState('');
  const [commissionPendingFromMobile, setCommissionPendingFromMobile] = useState('');
  const [commissionPendingAmount, setCommissionPendingAmount] = useState('');

  // Isolated Legal Vault draft attachments for newly created/edited bilty (Creator-only)
  const [pendingAttachments, setPendingAttachments] = useState<PendingDraftAttachment[]>([]);
  const [draftLegalHold, setDraftLegalHold] = useState(false);
  const [draftAttachmentError, setDraftAttachmentError] = useState<string | null>(null);
  const [processingDraftSlot, setProcessingDraftSlot] = useState<string | null>(null);
  const [isLegalVaultExpanded, setIsLegalVaultExpanded] = useState(false);

  // Legal Vault modal for existing bilties (Creator-only)
  const [vaultModalBilty, setVaultModalBilty] = useState<BiltyRecord | null>(null);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [contactsList, setContactsList] = useState<ContactItem[]>(() => getContactList());
  const [expiringAttachments, setExpiringAttachments] = useState<BiltyAttachmentRecord[]>([]);
  const [exportingExpiringZip, setExportingExpiringZip] = useState(false);
  const [attachmentQuotaStats, setAttachmentQuotaStats] = useState<AttachmentStorageStats | null>(null);
  const [dismissedExpiringBanner, setDismissedExpiringBanner] = useState(false);

  const refreshCreatorVaultSummary = useCallback(async () => {
    if (!isCreatorUser) return;
    const [expRes, statsRes] = await Promise.all([
      getExpiringBiltyAttachmentsSummary().catch(() => ({ count: 0, attachments: [] as BiltyAttachmentRecord[] })),
      getBiltyAttachmentStorageStats().catch(() => null)
    ]);
    setExpiringAttachments(expRes.attachments || []);
    if (statsRes) setAttachmentQuotaStats(statsRes);
  }, [isCreatorUser]);

  useEffect(() => {
    void refreshCreatorVaultSummary();
  }, [refreshCreatorVaultSummary, bilties.length]);

  const resetFormFields = useCallback(() => {
    setVehicleNo('');
    setDate(getTodayFormatted());
    setDriverName('');
    setMobileNo('');
    setDriverCnic('');
    setDriverLicense('');
    setSendingCity('');
    setReceivingCity('');
    setReceivingPointId('');
    setReceivingPointName('');
    setSenderName('');
    setSenderMobile('');
    setReceiverName('');
    setReceiverMobile('');
    setSenderCnic('');
    setReceiverCnic('');
    setQty('');
    setItemDescription('');
    setWeight('');
    setTotal('');
    setAdvance('');
    setRemarks('');
    setPendingAttachments([]);
    setDraftLegalHold(false);
    setDraftAttachmentError(null);
    setProcessingDraftSlot(null);
    setIsLegalVaultExpanded(false);
    setFreightPendingEnabled(false);
    setFreightPendingPartyName('');
    setFreightPendingPartyMobile('');
    setFreightPendingAmount('');
    setCommissionPendingEnabled(false);
    setCommissionPendingFromName('');
    setCommissionPendingFromMobile('');
    setCommissionPendingAmount('');
    setEditingBilty(null);
    setEditIsDelivered(false);
    setFormError(null);
  }, []);

  const hasUnsavedCreateDraft = Boolean(
    subTab === 'create' &&
      !editingBilty &&
      (vehicleNo.trim() ||
        driverName.trim() ||
        mobileNo.trim() ||
        sendingCity.trim() ||
        receivingCity.trim() ||
        senderName.trim() ||
        receiverName.trim() ||
        itemDescription.trim() ||
        qty.trim() ||
        total.trim())
  );

  useEffect(() => {
    const handleBack = (e: Event) => {
      if (e.defaultPrevented) return;

      if (showExitCreateConfirm) {
        setShowExitCreateConfirm(false);
        e.preventDefault();
        return;
      }
      if (isVaultModalOpen) {
        setIsVaultModalOpen(false);
        setVaultModalBilty(null);
        e.preventDefault();
        return;
      }
      if (biltyToDelete) {
        setBiltyToDelete(null);
        e.preventDefault();
        return;
      }
      if (selectedModalBilty) {
        setSelectedModalBilty(null);
        e.preventDefault();
        return;
      }
      if (isConfigModalOpen) {
        setIsConfigModalOpen(false);
        e.preventDefault();
        return;
      }
      if (editingBilty) {
        resetFormFields();
        const prevSub = subTabHistoryRef.current.pop();
        setSubTab(prevSub || (bilties.length > 0 ? 'all' : 'create'));
        e.preventDefault();
        return;
      }
      if (subTab === 'create' && isLegalVaultExpanded) {
        setIsLegalVaultExpanded(false);
        e.preventDefault();
        return;
      }
      if (subTab === 'create' && hasUnsavedCreateDraft) {
        setShowExitCreateConfirm(true);
        e.preventDefault();
        return;
      }
      if (subTabHistoryRef.current.length > 0) {
        const prevSub = subTabHistoryRef.current.pop();
        if (prevSub) {
          setSubTab(prevSub);
          e.preventDefault();
          return;
        }
      }
      if (subTab !== 'all' && bilties.length > 0 && initialSubTab !== 'create') {
        setSubTab('all');
        e.preventDefault();
        return;
      }
    };

    window.addEventListener('app-back-button', handleBack);
    return () => window.removeEventListener('app-back-button', handleBack);
  }, [
    showExitCreateConfirm,
    isVaultModalOpen,
    biltyToDelete,
    selectedModalBilty,
    isConfigModalOpen,
    editingBilty,
    subTab,
    isLegalVaultExpanded,
    hasUnsavedCreateDraft,
    bilties.length,
    initialSubTab,
    resetFormFields
  ]);

  const handleStartEditBilty = (record: BiltyRecord) => {
    setEditingBilty(record);
    setEditIsDelivered(Boolean(record.isDelivered || record.podConfirmation?.status === 'delivered'));
    setVehicleNo(record.vehicleNo || '');
    setDate(record.date || getTodayFormatted());
    setDriverName(record.driverName || '');
    setMobileNo(record.mobileNo || '');
    setDriverCnic(record.driverCnic || '');
    setDriverLicense(record.driverLicense || '');
    setSendingCity(record.sendingCity || '');
    setReceivingCity(record.receivingCity || '');
    setReceivingPointId(record.receivingPointId || '');
    setReceivingPointName(record.receivingPointName || '');
    setSenderName(record.senderName || record.consignor || '');
    setSenderMobile(record.senderMobile || '');
    setReceiverName(record.receiverName || record.consignee || '');
    setReceiverMobile(record.receiverMobile || '');
    setSenderCnic(record.senderCnic || '');
    setReceiverCnic(record.receiverCnic || '');
    setQty(record.qty || '');
    setItemDescription(record.itemDescription || '');
    setWeight(record.weight || '');
    setTotal(record.total !== undefined ? String(record.total) : '');
    setAdvance(record.advance !== undefined ? String(record.advance) : '');
    setRemarks(record.remarks || '');
    setPendingAttachments([]);
    setDraftLegalHold(Boolean(record.legalHold));
    setDraftAttachmentError(null);
    const branchIdForEdit = record.branchId || effectiveBranch.id;
    const existingFreight = getAddaPendingFreight(branchIdForEdit).find(
      (f) => f.biltyId === record.id || f.biltyNo === record.biltyNo
    );
    if (existingFreight) {
      setFreightPendingEnabled(true);
      setFreightPendingPartyName(existingFreight.partyName || '');
      setFreightPendingPartyMobile(existingFreight.partyMobile || '');
      setFreightPendingAmount(String(existingFreight.amount || ''));
    } else {
      setFreightPendingEnabled(false);
      setFreightPendingPartyName('');
      setFreightPendingPartyMobile('');
      setFreightPendingAmount('');
    }
    const existingComm = getAddaPendingCommissions(branchIdForEdit).find(
      (c) => c.biltyId === record.id || c.biltyNo === record.biltyNo
    );
    if (existingComm) {
      setCommissionPendingEnabled(true);
      setCommissionPendingFromName(existingComm.fromWhomName || '');
      setCommissionPendingFromMobile(existingComm.fromWhomMobile || '');
      setCommissionPendingAmount(String(existingComm.amount || ''));
    } else {
      setCommissionPendingEnabled(false);
      setCommissionPendingFromName('');
      setCommissionPendingFromMobile('');
      setCommissionPendingAmount('');
    }
    if (record.language) setSelectedLanguage(record.language);
    setIsConfigModalOpen(false);
    setSelectedModalBilty(null);
    setLastBilty(record);
    setFormError(null);
    navigateSubTab('create');
  };

  const handleAttachmentsChanged = (
    biltyId: number,
    info: { attachmentCount: number; legalHold: boolean }
  ) => {
    const stripAndPatch = (rec: BiltyRecord): BiltyRecord => {
      const next: BiltyRecord = {
        ...rec,
        attachmentCount: info.attachmentCount,
        legalHold: info.legalHold || undefined
      };
      delete next.legalVault;
      return next;
    };

    const updated = bilties.map((b) => (b.id === biltyId ? stripAndPatch(b) : b));
    saveStoredBilties(updated);
    if (selectedModalBilty && selectedModalBilty.id === biltyId) {
      setSelectedModalBilty(stripAndPatch(selectedModalBilty));
    }
    if (lastBilty && lastBilty.id === biltyId) {
      setLastBilty(stripAndPatch(lastBilty));
    }
    if (vaultModalBilty && vaultModalBilty.id === biltyId) {
      setVaultModalBilty(stripAndPatch(vaultModalBilty));
    }
  };

  useEffect(() => {
    setContactsList(getContactList());
  }, [bilties]);

  const addaPartiesList = useMemo(() => {
    void bilties;
    return getAddaParties(effectiveBranch.id);
  }, [bilties, effectiveBranch.id]);

  // Dispatch volume aggregates for All Bilties (no payment totals)
  const dispatchStats = useMemo(() => {
    let deliveredCount = 0;
    bilties.forEach((b) => {
      if (b.isDelivered || b.podConfirmation?.status === 'delivered') deliveredCount += 1;
    });
    return {
      count: bilties.length,
      deliveredCount
    };
  }, [bilties]);

  const filteredBilties = useMemo(() => {
    let list = [...bilties];

    // Delivery status (POD) filter
    if (deliveryFilter === 'delivered') {
      list = list.filter((b) => b.isDelivered || !!b.podConfirmation);
    } else if (deliveryFilter === 'pending') {
      list = list.filter((b) => !b.isDelivered && !b.podConfirmation);
    }

    // Text search query (searches across all languages)
    if (allFilterQuery.trim()) {
      const q = allFilterQuery.trim().toLowerCase();
      list = list.filter((b) => {
        const langText = b.language === 'en' ? 'english' : 'urdu اردو';
        return (
          langText.includes(q) ||
          (b.biltyNo && b.biltyNo.toLowerCase().includes(q)) ||
          (b.vehicleNo && b.vehicleNo.toLowerCase().includes(q)) ||
          (b.driverName && b.driverName.toLowerCase().includes(q)) ||
          (b.mobileNo && b.mobileNo.toLowerCase().includes(q)) ||
          (b.driverCnic && b.driverCnic.toLowerCase().includes(q)) ||
          (b.driverLicense && b.driverLicense.toLowerCase().includes(q)) ||
          (b.senderName && b.senderName.toLowerCase().includes(q)) ||
          (b.senderMobile && b.senderMobile.toLowerCase().includes(q)) ||
          (b.receiverName && b.receiverName.toLowerCase().includes(q)) ||
          (b.receiverMobile && b.receiverMobile.toLowerCase().includes(q)) ||
          (b.sendingCity && b.sendingCity.toLowerCase().includes(q)) ||
          (b.receivingCity && b.receivingCity.toLowerCase().includes(q)) ||
          (b.itemDescription && b.itemDescription.toLowerCase().includes(q)) ||
          (b.senderCnic && b.senderCnic.toLowerCase().includes(q)) ||
          (b.receiverCnic && b.receiverCnic.toLowerCase().includes(q))
        );
      });
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
      if (sortBy === 'oldest') return (a.id || 0) - (b.id || 0);
      return 0;
    });

    return list;
  }, [bilties, deliveryFilter, allFilterQuery, sortBy]);

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
    const [qrUrl, assets] = await Promise.all([
      getQrDataUrl(record),
      preloadBiltyPdfAssets().catch(() => preloadedAssets)
    ]);
    if (assets?.card || assets?.logo) {
      setPreloadedAssets(assets);
    }
    setActivePrintQrUrl(qrUrl);
    setActivePrintRecord({
      ...record,
      branch: record.branch || record.branchId || selectedBranch,
      branchId: record.branchId || effectiveBranch.id,
      language: record.language || selectedLanguage
    });
    setTimeout(async () => {
      const target = document.getElementById('printable-bilty-dom');
      if (target) {
        const imgs = Array.from(target.querySelectorAll('img'));
        await Promise.all(
          imgs.map(async (img) => {
            if (!img.complete || img.naturalWidth === 0) {
              await new Promise<void>((resolve) => {
                const timer = setTimeout(resolve, 1500);
                img.addEventListener('load', () => { clearTimeout(timer); resolve(); }, { once: true });
                img.addEventListener('error', () => { clearTimeout(timer); resolve(); }, { once: true });
              });
            }
            if (typeof img.decode === 'function') {
              await img.decode().catch(() => {});
            }
          })
        );
      }
      const androidWin = window as AndroidPrinterWindow;
      if (typeof androidWin.AndroidPrinter?.print === 'function') {
        androidWin.AndroidPrinter.print();
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
    setFormError(null);

    const totalValidation = validateFinancialNumber(
      total,
      selectedLanguage === 'en' ? 'Total Freight' : 'کل کرایہ',
      { allowZero: true }
    );
    if (!totalValidation.isValid) {
      setFormError(totalValidation.error || (selectedLanguage === 'en' ? 'Please enter a valid total freight amount.' : 'براہ کرم درست کل کرایہ درج کریں۔'));
      return;
    }

    const advanceValidation = validateFinancialNumber(
      advance,
      selectedLanguage === 'en' ? 'Advance Paid' : 'پیشگی رقم',
      { allowZero: true }
    );
    if (!advanceValidation.isValid) {
      setFormError(advanceValidation.error || (selectedLanguage === 'en' ? 'Please enter a valid advance amount.' : 'براہ کرم درست پیشگی رقم درج کریں۔'));
      return;
    }

    const totalNum = totalValidation.value;
    const advanceNum = advanceValidation.value;

    const validation = validateBiltyFreight(totalNum, advanceNum);
    if (!validation.isValid) {
      setFormError(validation.error || (selectedLanguage === 'en' ? 'Please enter valid freight & advance amount.' : 'درست کرایہ اور پیشگی رقم درج کریں۔'));
      return;
    }

    if (freightPendingEnabled && (!freightPendingPartyName.trim() || !(Number(freightPendingAmount) > 0))) {
      setFormError(
        selectedLanguage === 'en'
          ? 'Please enter Payee Name and a positive Pending Freight amount (> 0).'
          : 'براہ کرم ادائیگی کنندہ کا نام اور صفر سے زیادہ بقایا کرایہ رقم درج کریں۔'
      );
      return;
    }
    if (commissionPendingEnabled && (!commissionPendingFromName.trim() || !(Number(commissionPendingAmount) > 0))) {
      setFormError(
        selectedLanguage === 'en'
          ? 'Please enter Payee Name and a positive Pending Commission amount (> 0).'
          : 'براہ کرم وصولی والے کا نام اور صفر سے زیادہ کمیشن رقم درج کریں۔'
      );
      return;
    }

    if (editingBilty) {
      if (!canEditDeleteBilty) {
        setFormError(selectedLanguage === 'en' ? 'You do not have permission to edit bilties.' : 'آپ کو بلٹی میں ترمیم کی اجازت نہیں ہے۔');
        return;
      }
      const updatedRecord: BiltyRecord = {
        ...editingBilty,
        branch: (editingBilty.branchId || editingBilty.branch || selectedBranch) as BiltyBranch,
        branchId: editingBilty.branchId || effectiveBranch.id,
        branchNameUr: editingBilty.branchNameUr || effectiveBranch.nameUr,
        branchNameEn: editingBilty.branchNameEn || effectiveBranch.nameEn,
        branchAddressUr: editingBilty.branchAddressUr || effectiveBranch.addressUr,
        branchAddressEn: editingBilty.branchAddressEn || effectiveBranch.addressEn,
        branchPhone: editingBilty.branchPhone || effectiveBranch.phoneNumbers,
        language: selectedLanguage,
        vehicleNo: vehicleNo.trim(),
        date: date.trim() || getTodayFormatted(),
        driverName: driverName.trim(),
        mobileNo: mobileNo.trim(),
        driverCnic: driverCnic.trim() || undefined,
        driverLicense: driverLicense.trim() || undefined,
        sendingCity: sendingCity.trim(),
        receivingCity: receivingCity.trim(),
        receivingPointId: receivingPointId || undefined,
        receivingPointName: receivingPointName || undefined,
        senderName: senderName.trim(),
        senderMobile: senderMobile.trim(),
        receiverName: receiverName.trim(),
        receiverMobile: receiverMobile.trim(),
        senderCnic: senderCnic.trim(),
        receiverCnic: receiverCnic.trim() || undefined,
        qty: qty.trim(),
        itemDescription: itemDescription.trim(),
        weight: weight.trim(),
        total: validation.total,
        advance: validation.advance,
        payable: validation.payable,
        remarks: remarks.trim() || undefined,
        isDelivered: editIsDelivered,
        podConfirmation: editIsDelivered
          ? (editingBilty.podConfirmation || {
              receiverName: receiverName.trim() || editingBilty.receiverName || 'Consignee',
              confirmedAt: new Date().toISOString(),
              status: 'delivered'
            })
          : undefined,
        legalHold: draftLegalHold || undefined,
        updatedAt: new Date().toISOString()
      };
      delete updatedRecord.legalVault;

      try {
        assertBiltyEditAllowedForAdda(editingBilty, updatedRecord);
        const linked = syncBiltyAddaLinks({
          bilty: updatedRecord,
          freightInput: {
            enabled: freightPendingEnabled,
            partyName: freightPendingPartyName.trim(),
            partyMobile: freightPendingPartyMobile.trim(),
            amount: Number(freightPendingAmount) || 0
          },
          commissionInput: {
            enabled: commissionPendingEnabled,
            fromWhomName: commissionPendingFromName.trim(),
            fromWhomMobile: commissionPendingFromMobile.trim(),
            amount: Number(commissionPendingAmount) || 0
          }
        });
        updatedRecord.pendingFreightId = linked.pendingFreightId;
        updatedRecord.pendingCommissionId = linked.pendingCommissionId;
      } catch (err) {
        if (err instanceof AddaLifecycleError) {
          setFormError(selectedLanguage === 'en' ? err.messageEn : err.messageUr);
          return;
        }
        throw err;
      }

      if (onUpdateBilty) {
        try {
          onUpdateBilty(updatedRecord);
        } catch (err) {
          if (err instanceof AddaLifecycleError) {
            setFormError(selectedLanguage === 'en' ? err.messageEn : err.messageUr);
            return;
          }
          throw err;
        }
      } else {
        const nextList = bilties.map(b => (b.id === updatedRecord.id ? updatedRecord : b));
        saveStoredBilties(nextList);
      }

      if (isCreatorUser) {
        if (draftLegalHold !== Boolean(editingBilty.legalHold)) {
          await setBiltyLegalHold(updatedRecord, draftLegalHold).catch(() => {});
        }
        if (pendingAttachments.length > 0) {
          for (const att of pendingAttachments) {
            await saveBiltyAttachment(updatedRecord, {
              slot: att.slot,
              kind: att.kind,
              dataUrl: att.dataUrl,
              mimeType: att.mimeType,
              name: att.name,
              width: att.width,
              height: att.height,
              allowReplaceSlot: true,
              createdAtMs: att.createdAtMs
            }).catch(() => {});
          }
          const savedAtts = await getAttachmentsForBilty(updatedRecord).catch(() => []);
          updatedRecord.attachmentCount = savedAtts.length;
        }
      }

      setLastBilty(updatedRecord);
      resetFormFields();
      return;
    }

    if (!canCreateBilty) {
      setFormError(selectedLanguage === 'en' ? 'You do not have permission to create new bilties.' : 'آپ کو نئی بلٹی بنانے کی اجازت نہیں ہے۔');
      return;
    }

    // Allocate sequential unique Bilty Number per active branch block reservation (strictly no wrap/truncation)
    let allocatedBiltyNo = '';
    try {
      allocatedBiltyNo = await allocateNextBiltyNumber(undefined, effectiveBranch);
      const conflictRes = await checkBiltyNoConflict(allocatedBiltyNo).catch(() => ({ conflict: false }));
      if (conflictRes.conflict) {
        allocatedBiltyNo = await allocateNextBiltyNumber(undefined, effectiveBranch);
      }
    } catch (err) {
      if (err instanceof OfflineBlockExhaustedError) {
        setFormError(
          selectedLanguage === 'en'
            ? err.messageEn
            : err.messageUr
        );
        return;
      }
      setFormError(
        selectedLanguage === 'en'
          ? 'Unable to reserve a sequential Bilty number. Please check your connection and retry.'
          : 'بلٹی نمبر حاصل کرنے میں مسئلہ آیا ہے۔ براہ کرم انٹرنیٹ چیک کر کے دوبارہ کوشش کریں۔'
      );
      return;
    }
    const isPendingOnline = allocatedBiltyNo.includes('-OFF-');

    const record: Omit<BiltyRecord, 'id'> = {
      biltyNo: allocatedBiltyNo,
      pendingOnlineNumber: isPendingOnline ? true : undefined,
      branch: selectedBranch,
      branchId: effectiveBranch.id,
      branchNameUr: effectiveBranch.nameUr,
      branchNameEn: effectiveBranch.nameEn,
      branchAddressUr: effectiveBranch.addressUr,
      branchAddressEn: effectiveBranch.addressEn,
      branchPhone: effectiveBranch.phoneNumbers,
      createdByEmail: currentUserEmail || undefined,
      createdByUid: currentUserUid || undefined,
      language: selectedLanguage,
      vehicleNo: vehicleNo.trim(),
      date: date.trim() || getTodayFormatted(),
      driverName: driverName.trim(),
      mobileNo: mobileNo.trim(),
      driverCnic: driverCnic.trim() || undefined,
      driverLicense: driverLicense.trim() || undefined,
      sendingCity: sendingCity.trim(),
      receivingCity: receivingCity.trim(),
      receivingPointId: receivingPointId || undefined,
      receivingPointName: receivingPointName || undefined,
      senderName: senderName.trim(),
      senderMobile: senderMobile.trim(),
      receiverName: receiverName.trim(),
      receiverMobile: receiverMobile.trim(),
      senderCnic: senderCnic.trim(),
      receiverCnic: receiverCnic.trim() || undefined,
      qty: qty.trim(),
      itemDescription: itemDescription.trim(),
      weight: weight.trim(),
      total: validation.total,
      advance: validation.advance,
      payable: validation.payable,
      remarks: remarks.trim() || undefined,
      ...(isCreatorUser ? { legalHold: draftLegalHold || undefined } : {}),
      ...(isCreatorUser && pendingAttachments.length > 0 ? { attachmentCount: pendingAttachments.length } : {})
    };

    const saved = await Promise.resolve(onAddBilty(record));
    const finalSavedRecord: BiltyRecord = (saved as BiltyRecord) || { ...record, id: Date.now() };
    if (isCreatorUser && pendingAttachments.length > 0) {
      for (const att of pendingAttachments) {
        await saveBiltyAttachment(finalSavedRecord, {
          slot: att.slot,
          kind: att.kind,
          dataUrl: att.dataUrl,
          mimeType: att.mimeType,
          name: att.name,
          width: att.width,
          height: att.height,
          allowReplaceSlot: true,
          createdAtMs: att.createdAtMs
        }).catch(() => {});
      }
      const savedAtts = await getAttachmentsForBilty(finalSavedRecord).catch(() => []);
      finalSavedRecord.attachmentCount = savedAtts.length;
    }

    // Save optional Pending Freight & Pending Commission strictly to isolated Adda billing storage
    if (freightPendingEnabled || commissionPendingEnabled) {
      try {
        const linked = syncBiltyAddaLinks({
          bilty: finalSavedRecord,
          freightInput: freightPendingEnabled
            ? {
                enabled: true,
                partyName: freightPendingPartyName.trim(),
                partyMobile: freightPendingPartyMobile.trim(),
                amount: Number(freightPendingAmount) || 0
              }
            : undefined,
          commissionInput: commissionPendingEnabled
            ? {
                enabled: true,
                fromWhomName: commissionPendingFromName.trim(),
                fromWhomMobile: commissionPendingFromMobile.trim(),
                amount: Number(commissionPendingAmount) || 0
              }
            : undefined
        });
        if (linked.pendingFreightId || linked.pendingCommissionId) {
          finalSavedRecord.pendingFreightId = linked.pendingFreightId;
          finalSavedRecord.pendingCommissionId = linked.pendingCommissionId;
          if (onUpdateBilty) {
            onUpdateBilty(finalSavedRecord);
          }
        }
      } catch (err) {
        if (err instanceof AddaLifecycleError) {
          setFormError(selectedLanguage === 'en' ? err.messageEn : err.messageUr);
        }
      }
    }

    setLastBilty(finalSavedRecord);

    // Reset fields
    resetFormFields();
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const generateBiltyPdf = async (record: BiltyRecord): Promise<{ pdf: jsPDF; pdfBlob: Blob } | null> => {
    const [qrUrl, assets] = await Promise.all([
      getQrDataUrl(record),
      preloadBiltyPdfAssets().catch(() => preloadedAssets)
    ]);
    if (assets?.card || assets?.logo) {
      setPreloadedAssets(assets);
    }
    setActivePrintQrUrl(qrUrl);
    setActivePrintRecord({
      ...record,
      branch: record.branch || record.branchId || selectedBranch,
      branchId: record.branchId || effectiveBranch.id,
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

    const innerEl = target.querySelector('.printable-bilty-container') || target;
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
        await shareOrDownloadBlob(result.pdfBlob, `Bilty_${record.biltyNo}.pdf`, {
          title: `Bilty_${record.biltyNo}.pdf`,
          preferDownloadOnDesktop: true
        });
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
    if (!isCreatorUser) return;
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

        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#ecece0]">
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
              📍 {previewLang === 'en' ? (record.branchNameEn || effectiveBranch.nameEn) : (record.branchNameUr || effectiveBranch.nameUr)}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-950 border border-amber-300">
              🌐 {previewLang === 'en' ? '100% English' : 'مکمل اردو'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <BiltyQrCode record={record} className="w-12 h-12 rounded border border-slate-300 bg-white object-contain" />
          </div>
        </div>

        <div className="bg-slate-100/70 p-2 sm:p-4 rounded-xl border border-slate-200 overflow-x-auto">
          <PrintableBilty
            record={record}
            cardDataUrl={preloadedAssets.card}
            logoDataUrl={preloadedAssets.logo}
            branch={(record.branchId || record.branch || effectiveBranch.id) as BiltyBranch}
            branchConfig={effectiveBranch}
            language={previewLang}
          />
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isCreatorUser ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-2.5 pt-1`}>
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

          {isCreatorUser && (
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
          )}
        </div>

        {/* Legal Vault Button Banner (App Creator Only) */}
        {isCreatorUser && (
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
                if (typeof window !== 'undefined' && window.history?.pushState) {
                  try { window.history.pushState({ tab: 'bilty', modal: 'vault' }, ''); } catch {}
                }
                setVaultModalBilty(record);
                setIsVaultModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-300 shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{previewLang === 'en' ? 'Manage Legal Vault' : 'دستاویزات والٹ کھولیں'}</span>
              {countBiltyAttachments(record) > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {countBiltyAttachments(record)}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  const branchObj = effectiveBranch;
  const isEnForm = selectedLanguage === 'en';

  return (
    <div className="flex-1 p-3 sm:p-6 md:p-10 max-w-5xl mx-auto w-full space-y-6 sm:space-y-8">
      {/* 1. Language Selection Setup Modal Prompt (Single-step language selection only) */}
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
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f2942]">
                    بلٹی کی زبان منتخب کریں
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    Select Language for Bilty
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                aria-label={isUrdu ? 'بند کریں' : 'Close'}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              براہ کرم بلٹی بنانے سے قبل اپنی مطلوبہ زبان (اردو یا انگریزی) کا انتخاب کریں۔
            </p>

            {/* Language Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>زبان منتخب کریں (Select Language)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Urdu Option */}
                <button
                  type="button"
                  onClick={() => handleLanguageChange('ur')}
                  className={`p-4 rounded-2xl border-2 text-right transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    selectedLanguage === 'ur'
                      ? 'border-[#0f2942] bg-blue-50/70 shadow-sm ring-2 ring-[#0f2942]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-black text-base text-[#0f2942]">
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
                  className={`p-4 rounded-2xl border-2 text-right transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    selectedLanguage === 'en'
                      ? 'border-[#0f2942] bg-blue-50/70 shadow-sm ring-2 ring-[#0f2942]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-black text-base text-[#0f2942]">
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

            {/* Office Address & Watermark Note */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <strong>{branchObj.nameUr}:</strong> {branchObj.addressUr} ({branchObj.addressEn}) • <strong>ہیلپ لائن:</strong> <span dir="ltr">{branchObj.phoneNumbers}</span>
            </div>

            {/* Submit & Continue Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem('ah-bilty-branch', effectiveBranch.id || DEFAULT_HEAD_OFFICE_BRANCH_ID);
                    localStorage.setItem('ah-bilty-lang', selectedLanguage);
                  } catch {}
                  if (canCreateBilty) {
                    setSubTab('create');
                  }
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
      <div className="bg-white p-3.5 sm:p-6 md:p-8 rounded-2xl sm:rounded-[32px] shadow-sm border border-[#ecece0] space-y-4 sm:space-y-5">
        {/* Minimal Slim Back Row (No redundant title, subtitle, or office/address banner) */}
        <div className="flex items-center justify-between gap-3">
          {onNavigate ? (
            <button
              type="button"
              onClick={() => {
                const backEv = new CustomEvent('app-back-button', { cancelable: true });
                window.dispatchEvent(backEv);
                if (!backEv.defaultPrevented) {
                  onNavigate('home');
                }
              }}
              className="px-3 py-2 min-h-[40px] bg-[#fdfbf7] border border-[#ecece0] hover:bg-[#eaeae0] text-[#4a4a35] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title={
                editingBilty || subTabHistoryRef.current.length > 0 || (subTab !== 'all' && bilties.length > 0)
                  ? (isUrdu ? 'واپس جائیں' : 'Go Back')
                  : (isUrdu ? 'ڈیش بورڈ پر واپس جائیں' : 'Back to Dashboard')
              }
            >
              <ArrowLeft className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
              <span>
                {editingBilty || subTabHistoryRef.current.length > 0 || (subTab !== 'all' && bilties.length > 0)
                  ? (isUrdu ? 'واپس' : 'Back')
                  : (isUrdu ? 'ڈیش بورڈ' : 'Dashboard')}
              </span>
            </button>
          ) : (
            <div />
          )}

          {subTab === 'create' && (
            <div className="flex items-center bg-[#fdfbf7] border border-[#ecece0] rounded-xl p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => handleLanguageChange('ur')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedLanguage === 'ur' ? 'bg-[#0f2942] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                اردو
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedLanguage === 'en' ? 'bg-[#0f2942] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
            </div>
          )}
        </div>

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

        {/* Creator-only 7-Day Expiring Attachments Banner & 1 GiB Quota Meter */}
        {isCreatorUser &&
          ((expiringAttachments.length > 0 && !dismissedExpiringBanner) ||
            (attachmentQuotaStats && attachmentQuotaStats.warningLevel !== 'none')) && (
            <div
              data-testid="bilty-expiring-attachments-banner"
              className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex flex-wrap items-center justify-between gap-2.5"
            >
              <div className="flex items-start gap-2 min-w-0 flex-1">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  {expiringAttachments.length > 0 && !dismissedExpiringBanner && (
                    <div className="font-bold">
                      {isUrdu
                        ? `${expiringAttachments.length} دستاویزات آئندہ 7 دن میں 6 ماہ کی مدت پوری ہونے پر خودکار حذف ہو جائیں گی — محفوظ رکھنے کے لیے Export ZIP یا Legal Hold استعمال کریں۔`
                        : `${expiringAttachments.length} attachment(s) will expire within 7 days — Export ZIP or enable Legal Hold to preserve them.`}
                    </div>
                  )}
                  {attachmentQuotaStats && attachmentQuotaStats.warningLevel !== 'none' && (
                    <div className="text-[11px] font-bold text-rose-800">
                      {attachmentQuotaStats.warningLevel === 'exceeded'
                        ? `Cloud storage quota exceeded (${attachmentQuotaStats.usedMb} / ${attachmentQuotaStats.quotaMb} MB). New files saved local-only.`
                        : `Attachment quota ${Math.round(attachmentQuotaStats.usageRatio * 100)}% used (${attachmentQuotaStats.usedMb} / ${attachmentQuotaStats.quotaMb} MB).`}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {expiringAttachments.length > 0 && !dismissedExpiringBanner && (
                  <>
                    <button
                      type="button"
                      disabled={exportingExpiringZip}
                      onClick={async () => {
                        setExportingExpiringZip(true);
                        try {
                          await exportAttachmentsZipBundle(expiringAttachments);
                        } finally {
                          setExportingExpiringZip(false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {exportingExpiringZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileArchive className="w-3.5 h-3.5" />}
                      <span>Export ZIP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDismissedExpiringBanner(true)}
                      aria-label={isUrdu ? 'چھپائیں' : 'Dismiss'}
                      className="p-1.5 rounded-lg hover:bg-amber-200/60 text-amber-900 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

        {/* Global Datalist for Autocomplete */}
        <datalist id="contacts-autocomplete">
          {contactsList.map((c, idx) => (
            <option key={idx} value={c.name}>{c.phone ? `${c.name} (${c.phone})` : c.name}</option>
          ))}
        </datalist>
        <datalist id="adda-parties-autocomplete">
          {addaPartiesList.map((p) => (
            <option key={p.id} value={p.name}>
              {p.mobile ? `${p.name} (${p.mobile})` : p.name}
            </option>
          ))}
          {contactsList.map((c, idx) => (
            <option key={`c_${idx}`} value={c.name}>{c.phone ? `${c.name} (${c.phone})` : c.name}</option>
          ))}
        </datalist>

        {conflictBilties.length > 0 && (
          <div
            data-testid="bilty-number-conflict-banner"
            className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 text-xs flex flex-wrap items-center justify-between gap-2.5 shadow-2xs"
          >
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-black">
                  {isUrdu
                    ? `${conflictBilties.length} بلٹی نمبروں میں تصادم (Duplicate Bilty #) پایا گیا ہے۔`
                    : `${conflictBilties.length} duplicate Bilty number conflict(s) detected across synced devices.`}
                </div>
                <div className="text-[11px] text-rose-800">
                  {isUrdu
                    ? 'دونوں ریکارڈ محفوظ ہیں — "تمام بلٹیاں" میں جا کر متصادم بلٹی کو نیا نمبر تفویض کریں۔'
                    : 'Both records are preserved — open All Bilties and tap "Resolve #" to assign a fresh sequential number.'}
                </div>
              </div>
            </div>
            {subTab !== 'all' && canViewAllBilties && (
              <button
                type="button"
                onClick={() => navigateSubTab('all')}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shrink-0"
              >
                {isUrdu ? 'متصادم بلٹیاں دیکھیں' : 'Review Conflicts'}
              </button>
            )}
          </div>
        )}

        {/* ALL BILTIES ARCHIVE / LEDGER */}
        {subTab === 'all' && canViewAllBilties && (
          <BiltyAllRecordsTab
            isUrdu={isUrdu}
            bilties={bilties}
            filteredBilties={filteredBilties}
            dispatchStats={dispatchStats}
            branchAddress={isUrdu ? branchObj.addressUr : branchObj.addressEn}
            officeTitle={isUrdu ? branchObj.nameUr : branchObj.nameEn}
            canCreate={canCreateBilty}
            canEditDelete={canEditDeleteBilty}
            canManageAttachments={isCreatorUser}
            allFilterQuery={allFilterQuery}
            deliveryFilter={deliveryFilter}
            sortBy={sortBy}
            onChangeFilterQuery={setAllFilterQuery}
            onChangeDeliveryFilter={setDeliveryFilter}
            onChangeSortBy={setSortBy}
            onExportCsv={() => exportAllBiltiesCSV()}
            onNavigateToCreate={() => navigateSubTab('create')}
            onResetFilters={() => {
              setAllFilterQuery('');
              setDeliveryFilter('all');
            }}
            onInspectBilty={(b) => {
              if (typeof window !== 'undefined' && window.history?.pushState) {
                try { window.history.pushState({ tab: 'bilty', modal: 'inspect' }, ''); } catch {}
              }
              setSelectedModalBilty(b);
            }}
            onPrintBilty={handlePrintBuilty}
            onDownloadPdf={handleDownloadPDF}
            onShareWhatsApp={handleWhatsAppShare}
            onOpenVault={(b) => {
              if (typeof window !== 'undefined' && window.history?.pushState) {
                try { window.history.pushState({ tab: 'bilty', modal: 'vault' }, ''); } catch {}
              }
              setVaultModalBilty(b);
              setIsVaultModalOpen(true);
            }}
            onEditBilty={handleStartEditBilty}
            onDownloadZip={handleDownloadZip}
            onResolveConflict={canEditDeleteBilty ? async (b) => {
              if (resolvingConflictId === b.id) return;
              setResolvingConflictId(b.id);
              try {
                if (onResolveConflict) {
                  await onResolveConflict(b.id);
                } else {
                  await resolveBiltyNumberConflict(b.id, effectiveBranch);
                }
              } catch (err) {
                setFormError(
                  err instanceof OfflineBlockExhaustedError
                    ? (isUrdu ? err.messageUr : err.messageEn)
                    : (isUrdu ? 'نیا بلٹی نمبر تفویض کرنے میں مسئلہ آیا۔' : 'Could not resolve Bilty number conflict.')
                );
              } finally {
                setResolvingConflictId(null);
              }
            } : undefined}
            onRequestDelete={canEditDeleteBilty && onDeleteBilty ? (b) => {
              if (typeof window !== 'undefined' && window.history?.pushState) {
                try { window.history.pushState({ tab: 'bilty', modal: 'delete' }, ''); } catch {}
              }
              setBiltyToDelete(b);
            } : undefined}
          />
        )}

        {subTab === 'create' && (canCreateBilty || Boolean(editingBilty && canEditDeleteBilty)) && (
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

              {/* Driver CNIC & License No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">
                    {isEnForm ? 'Driver CNIC' : 'ڈرائیور شناختی کارڈ نمبر'}
                  </label>
                  <input
                    type="text"
                    value={driverCnic}
                    onChange={(e) => setDriverCnic(e.target.value)}
                    placeholder="XXXXX-XXXXXXX-X"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">
                    {isEnForm ? 'Driver License No' : 'ڈرائیونگ لائسنس نمبر'}
                  </label>
                  <input
                    type="text"
                    value={driverLicense}
                    onChange={(e) => setDriverLicense(e.target.value)}
                    placeholder={isEnForm ? 'e.g. FSD-12345' : 'لائسنس نمبر'}
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono transition-all"
                  />
                </div>
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
                    placeholder={isEnForm ? branchObj.nameEn : branchObj.nameUr}
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
                  {receivingPoints.length > 0 && (
                    <select
                      value={receivingPointId}
                      onChange={(e) => {
                        const ptId = e.target.value;
                        const pt = receivingPoints.find(p => p.id === ptId);
                        setReceivingPointId(ptId);
                        setReceivingPointName(pt?.name || '');
                        if (pt && !receivingCity.trim()) {
                          setReceivingCity(pt.city);
                        }
                      }}
                      className="mt-2 w-full min-h-[40px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none"
                    >
                      <option value="">
                        {isEnForm ? 'Receiving Point (Optional)' : 'ریسیونگ پوائنٹ منتخب کریں (اختیاری)'}
                      </option>
                      {receivingPoints.map(pt => (
                        <option key={pt.id} value={pt.id}>
                          {pt.name} ({pt.city})
                        </option>
                      ))}
                    </select>
                  )}
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

              {/* Sender & Receiver CNIC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
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
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">
                    {isEnForm ? 'Receiver CNIC' : 'وصول کنندہ شناختی کارڈ'}
                  </label>
                  <input
                    type="text"
                    value={receiverCnic}
                    onChange={(e) => setReceiverCnic(e.target.value)}
                    placeholder="XXXXX-XXXXXXX-X"
                    className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono transition-all"
                  />
                </div>
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

              {/* Weight, Receipt Total Freight & Optional Receipt Advance */}
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
                    {isEnForm ? 'Total Freight on Receipt (Rs)' : 'کل کرایہ برائے رسید (اختیاری Rs)'}
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
                    {isEnForm ? 'Advance on Receipt (Optional)' : 'پیشگی رقم برائے رسید (اختیاری)'}
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

              {/* Full-Width Remarks */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">
                  {isEnForm ? 'Remarks (Optional)' : 'ریمارکس / خصوصی ہدایت (اختیاری)'}
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={isEnForm ? 'Special instructions or notes' : 'خصوصی ہدایت یا نوٹ'}
                  className="w-full min-h-[44px] bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none transition-all"
                />
              </div>

              {/* Optional 1: Is Freight Pending on this Bilty? (Isolated to Adda Panel) */}
              <div className="border border-blue-200 rounded-2xl bg-blue-50/50 p-3.5 space-y-3">
                <label className="flex items-center justify-between gap-2 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={freightPendingEnabled}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFreightPendingEnabled(checked);
                        if (checked) {
                          if (!freightPendingPartyName.trim()) {
                            setFreightPendingPartyName(senderName.trim() || receiverName.trim());
                            setFreightPendingPartyMobile(
                              senderName.trim() ? senderMobile.trim() : receiverMobile.trim()
                            );
                          }
                          if (!freightPendingAmount) {
                            const net = Math.max(0, (Number(total) || 0) - (Number(advance) || 0));
                            if (net > 0) setFreightPendingAmount(String(net));
                          }
                        }
                      }}
                      className="w-4 h-4 rounded accent-[#0f2942]"
                    />
                    <div>
                      <div className="text-xs font-black text-[#0f2942]">
                        {isEnForm
                          ? '1. Is Freight Pending on this Bilty? (Optional)'
                          : '1. کیا اس بلٹی کا کرایہ باقی (Pending) ہے؟ (اختیاری)'}
                      </div>
                      <div className="text-[10px] text-slate-600">
                        {isEnForm
                          ? 'Recorded only inside Adda Freight Pending & Bills (not main ledger)'
                          : 'صرف اڈا پینل کے کرایہ باقی و بل سیکشن میں محفوظ ہوگا (مرکزی کھاتہ سے الگ)'}
                      </div>
                    </div>
                  </div>
                </label>

                {freightPendingEnabled && (
                  <div className="space-y-2.5 pt-2 border-t border-blue-200/70 animate-in fade-in duration-150">
                    {(senderName.trim() || receiverName.trim()) && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {senderName.trim() && (
                          <button
                            type="button"
                            onClick={() => {
                              setFreightPendingPartyName(senderName.trim());
                              if (senderMobile.trim()) setFreightPendingPartyMobile(senderMobile.trim());
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-[10px] font-bold text-[#0f2942] hover:bg-blue-100 cursor-pointer"
                          >
                            {isEnForm ? `Use Sender: ${senderName}` : `بھیجنے والا: ${senderName}`}
                          </button>
                        )}
                        {receiverName.trim() && (
                          <button
                            type="button"
                            onClick={() => {
                              setFreightPendingPartyName(receiverName.trim());
                              if (receiverMobile.trim()) setFreightPendingPartyMobile(receiverMobile.trim());
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-[10px] font-bold text-[#0f2942] hover:bg-blue-100 cursor-pointer"
                          >
                            {isEnForm ? `Use Receiver: ${receiverName}` : `وصول کنندہ: ${receiverName}`}
                          </button>
                        )}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          {isEnForm ? 'Company / Sending / Payee Name' : 'کمپنی / پارٹی / ادائیگی کنندہ کا نام'}
                        </label>
                        <input
                          type="text"
                          list="adda-parties-autocomplete"
                          value={freightPendingPartyName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFreightPendingPartyName(val);
                            const matched = addaPartiesList.find(
                              p => p.name.trim().toLowerCase() === val.trim().toLowerCase() && p.mobile
                            );
                            if (matched && !freightPendingPartyMobile.trim()) {
                              setFreightPendingPartyMobile(formatBiltyMobile(matched.mobile));
                            }
                          }}
                          placeholder={isEnForm ? 'Payee name' : 'پارٹی کا نام'}
                          className="w-full min-h-[40px] bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:border-[#0f2942] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          {isEnForm ? 'Mobile Number' : 'موبائل نمبر'}
                        </label>
                        <input
                          type="text"
                          value={freightPendingPartyMobile}
                          onChange={(e) => setFreightPendingPartyMobile(formatBiltyMobile(e.target.value))}
                          placeholder="03XX-XXXXXXX"
                          className="w-full min-h-[40px] bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:border-[#0f2942] focus:outline-none dir-ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          {isEnForm ? 'Pending Freight (Rs)' : 'باقی کرایہ رقم (روپے)'}
                        </label>
                        <input
                          type="number"
                          value={freightPendingAmount}
                          onChange={(e) => setFreightPendingAmount(e.target.value)}
                          placeholder="0"
                          className="w-full min-h-[40px] bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-[#0f2942] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional 2: Is Commission Pending on this Bilty? (Isolated to Adda Panel) */}
              <div className="border border-amber-200 rounded-2xl bg-amber-50/60 p-3.5 space-y-3">
                <label className="flex items-center justify-between gap-2 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={commissionPendingEnabled}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setCommissionPendingEnabled(checked);
                        if (checked && !commissionPendingFromName.trim()) {
                          setCommissionPendingFromName(senderName.trim() || driverName.trim());
                          setCommissionPendingFromMobile(
                            senderName.trim() ? senderMobile.trim() : mobileNo.trim()
                          );
                        }
                      }}
                      className="w-4 h-4 rounded accent-amber-600"
                    />
                    <div>
                      <div className="text-xs font-black text-amber-950">
                        {isEnForm
                          ? '2. Is Commission Pending on this Bilty? (Optional)'
                          : '2. کیا اس بلٹی کا کمیشن باقی (Pending) ہے؟ (اختیاری)'}
                      </div>
                      <div className="text-[10px] text-amber-800">
                        {isEnForm
                          ? 'Recorded only inside Adda Commission Pending & Bills (not main ledger)'
                          : 'صرف اڈا پینل کے کمیشن باقی و بل سیکشن میں محفوظ ہوگا'}
                      </div>
                    </div>
                  </div>
                </label>

                {commissionPendingEnabled && (
                  <div className="space-y-2.5 pt-2 border-t border-amber-200/80 animate-in fade-in duration-150">
                    {(senderName.trim() || receiverName.trim() || driverName.trim()) && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {senderName.trim() && (
                          <button
                            type="button"
                            onClick={() => {
                              setCommissionPendingFromName(senderName.trim());
                              if (senderMobile.trim()) setCommissionPendingFromMobile(senderMobile.trim());
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-[10px] font-bold text-amber-950 hover:bg-amber-100 cursor-pointer"
                          >
                            {isEnForm ? `From Sender: ${senderName}` : `بھیجنے والا: ${senderName}`}
                          </button>
                        )}
                        {receiverName.trim() && (
                          <button
                            type="button"
                            onClick={() => {
                              setCommissionPendingFromName(receiverName.trim());
                              if (receiverMobile.trim()) setCommissionPendingFromMobile(receiverMobile.trim());
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-[10px] font-bold text-amber-950 hover:bg-amber-100 cursor-pointer"
                          >
                            {isEnForm ? `From Receiver: ${receiverName}` : `وصول کنندہ: ${receiverName}`}
                          </button>
                        )}
                        {driverName.trim() && (
                          <button
                            type="button"
                            onClick={() => {
                              setCommissionPendingFromName(driverName.trim());
                              if (mobileNo.trim()) setCommissionPendingFromMobile(mobileNo.trim());
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-[10px] font-bold text-amber-950 hover:bg-amber-100 cursor-pointer"
                          >
                            {isEnForm ? `From Driver: ${driverName}` : `ڈرائیور: ${driverName}`}
                          </button>
                        )}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          {isEnForm ? 'From Whom to Receive (Name)' : 'کس سے وصول کرنا ہے (نام)'}
                        </label>
                        <input
                          type="text"
                          list="adda-parties-autocomplete"
                          value={commissionPendingFromName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCommissionPendingFromName(val);
                            const matched = addaPartiesList.find(
                              p => p.name.trim().toLowerCase() === val.trim().toLowerCase() && p.mobile
                            );
                            if (matched && !commissionPendingFromMobile.trim()) {
                              setCommissionPendingFromMobile(formatBiltyMobile(matched.mobile));
                            }
                          }}
                          placeholder={isEnForm ? 'Person / party name' : 'شخص یا پارٹی کا نام'}
                          className="w-full min-h-[40px] bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:border-amber-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          {isEnForm ? 'Mobile Number' : 'موبائل نمبر'}
                        </label>
                        <input
                          type="text"
                          value={commissionPendingFromMobile}
                          onChange={(e) => setCommissionPendingFromMobile(formatBiltyMobile(e.target.value))}
                          placeholder="03XX-XXXXXXX"
                          className="w-full min-h-[40px] bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:border-amber-600 focus:outline-none dir-ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          {isEnForm ? 'Commission Amount (Rs)' : 'کمیشن رقم (روپے)'}
                        </label>
                        <input
                          type="number"
                          value={commissionPendingAmount}
                          onChange={(e) => setCommissionPendingAmount(e.target.value)}
                          placeholder="0"
                          className="w-full min-h-[40px] bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-amber-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Legal Vault Attachments (App Creator ONLY) */}
              {isCreatorUser && (
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
                    {pendingAttachments.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {pendingAttachments.length} نئی فائلز
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
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] text-slate-600 flex-1">
                        {isEnForm
                          ? `Attachments are compressed (≤150KB target), stored privately in IndexedDB & owner cloud only, and auto-deleted after ${ATTACHMENT_RETENTION_DAYS} days unless Legal Hold is ON.`
                          : `یہ دستاویزات خودکار کمپریس ہو کر صرف آپ کے نجی اکاؤنٹ میں الگ محفوظ ہوتی ہیں اور ${ATTACHMENT_RETENTION_DAYS} دن بعد خودکار حذف ہو جاتی ہیں (جب تک Legal Hold فعال نہ ہو)۔`}
                      </p>
                      <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-[11px] font-bold text-slate-800 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={draftLegalHold}
                          onChange={(e) => setDraftLegalHold(e.target.checked)}
                          className="rounded accent-emerald-600"
                        />
                        <Lock className="w-3 h-3 text-emerald-700" />
                        <span>{isEnForm ? 'Legal Hold' : 'قانونی تحفظ (Legal Hold)'}</span>
                      </label>
                    </div>

                    {draftAttachmentError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-[11px] font-bold flex items-center justify-between gap-2">
                        <span>{draftAttachmentError}</span>
                        <button
                          type="button"
                          onClick={() => setDraftAttachmentError(null)}
                          className="text-rose-600 hover:text-rose-900 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {([
                        { key: 'driverPhoto', label: isEnForm ? 'Driver Photo' : 'ڈرائیور تصویر' },
                        { key: 'driverLicense', label: isEnForm ? 'Driver License (ID)' : 'ڈرائیور لائسنس (ID)' },
                        { key: 'driverCnic', label: isEnForm ? 'Driver CNIC (ID)' : 'ڈرائیور CNIC (ID)' },
                        { key: 'vehiclePhoto', label: isEnForm ? 'Vehicle Photo' : 'گاڑی تصویر' },
                        { key: 'senderPhoto', label: isEnForm ? 'Sender Photo' : 'بھیجنے والا تصویر' },
                        { key: 'senderCnic', label: isEnForm ? 'Sender CNIC (ID)' : 'بھیجنے والا CNIC (ID)' },
                        { key: 'receiverPhoto', label: isEnForm ? 'Receiver Photo' : 'وصول کنندہ تصویر' },
                        { key: 'receiverCnic', label: isEnForm ? 'Receiver CNIC (ID)' : 'وصول کنندہ CNIC (ID)' },
                      ] as Array<{ key: LegalVaultImageKey; label: string }>).map((item) => {
                        const pendingAtt = pendingAttachments.find((a) => a.slot === item.key);
                        const isBusy = processingDraftSlot === item.key;
                        return (
                          <div key={item.key} className="border border-slate-200 rounded-xl p-2 bg-white text-center flex flex-col justify-between">
                            <span className="text-[10px] font-bold text-slate-700 block mb-1 truncate">{item.label}</span>
                            {isBusy ? (
                              <div className="w-full h-16 rounded-lg bg-slate-100 flex items-center justify-center mb-1">
                                <Loader2 className="w-4 h-4 animate-spin text-[#0f2942]" />
                              </div>
                            ) : pendingAtt ? (
                              <div className="relative w-full h-16 rounded-lg overflow-hidden bg-slate-100 mb-1">
                                <img src={pendingAtt.dataUrl} alt={item.label} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPendingAttachments((prev) => prev.filter((a) => a.slot !== item.key))
                                  }
                                  className="absolute top-1 right-1 w-5 h-5 rounded bg-rose-600 text-white flex items-center justify-center text-[10px] cursor-pointer"
                                >
                                  ✕
                                </button>
                                <span className="absolute bottom-0.5 left-0.5 px-1 rounded bg-black/65 text-white text-[8px] font-mono">
                                  {Math.round(pendingAtt.byteSize / 1024)}KB
                                </span>
                              </div>
                            ) : (
                              <label className="w-full h-16 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors mb-1">
                                <Camera className="w-4 h-4 mb-0.5" />
                                <span className="text-[9px] font-semibold">اپلوڈ</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const f = e.target.files?.[0];
                                    e.target.value = '';
                                    if (!f) return;
                                    setDraftAttachmentError(null);
                                    const isId = isIdCardSlot(item.key);
                                    const alreadyOnSlot = pendingAttachments.some((a) => a.slot === item.key);
                                    const pendingIdCount = pendingAttachments.filter((a) => a.isIdCard).length;
                                    if (isId && !alreadyOnSlot && pendingIdCount >= DEFAULT_MAX_ID_IMAGES_PER_DOC) {
                                      setDraftAttachmentError(
                                        isEnForm
                                          ? `Maximum ${DEFAULT_MAX_ID_IMAGES_PER_DOC} ID-card photos per document.`
                                          : `ہر بلٹی کے لیے زیادہ سے زیادہ ${DEFAULT_MAX_ID_IMAGES_PER_DOC} شناختی کارڈ تصاویر کی اجازت ہے۔`
                                      );
                                      return;
                                    }
                                    setProcessingDraftSlot(item.key);
                                    try {
                                      const compressed = await compressAttachmentImage(f);
                                      const nextDraft: PendingDraftAttachment = {
                                        tempId: `${item.key}_${Date.now()}`,
                                        slot: item.key,
                                        kind: 'image',
                                        isIdCard: isId,
                                        mimeType: compressed.mimeType,
                                        dataUrl: compressed.dataUrl,
                                        byteSize: compressed.byteSize,
                                        width: compressed.width,
                                        height: compressed.height,
                                        createdAtMs: Date.now()
                                      };
                                      setPendingAttachments((prev) => [
                                        ...prev.filter((a) => a.slot !== item.key),
                                        nextDraft
                                      ]);
                                    } catch (err) {
                                      setDraftAttachmentError(
                                        err instanceof Error ? err.message : 'Image compression failed'
                                      );
                                    } finally {
                                      setProcessingDraftSlot(null);
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Audio note input (Local-only <=600KB) */}
                    <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                        <span>{isEnForm ? 'Voice Note File (≤600KB • Not backed up)' : 'صوتی ہدایات فائل (≤600KB • صرف فون پر)'}</span>
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
                            e.target.value = '';
                            if (!f) return;
                            setDraftAttachmentError(null);
                            if (f.size > ATTACHMENT_AUDIO_HARD_CAP_BYTES) {
                              setDraftAttachmentError(
                                isEnForm
                                  ? `Audio exceeds ${Math.round(ATTACHMENT_AUDIO_HARD_CAP_BYTES / 1024)} KB limit.`
                                  : `آڈیو فائل ${Math.round(ATTACHMENT_AUDIO_HARD_CAP_BYTES / 1024)} KB حد سے بڑی ہے۔`
                              );
                              return;
                            }
                            const r = new FileReader();
                            r.onload = (ev) => {
                              const res = ev.target?.result as string;
                              if (!res) return;
                              try {
                                const { byteSize, mimeType } = validateAudioAttachmentDataUrl(res, ATTACHMENT_AUDIO_HARD_CAP_BYTES);
                                const nextRec: PendingDraftAttachment = {
                                  tempId: `rec_${Date.now()}`,
                                  slot: 'voiceNote',
                                  kind: 'audio',
                                  isIdCard: false,
                                  name: f.name || 'Voice_Note',
                                  mimeType,
                                  dataUrl: res,
                                  byteSize,
                                  createdAtMs: Date.now()
                                };
                                setPendingAttachments((prev) => [...prev, nextRec]);
                              } catch (err) {
                                setDraftAttachmentError(
                                  err instanceof Error ? err.message : 'Audio validation failed'
                                );
                              }
                            };
                            r.readAsDataURL(f);
                          }}
                        />
                      </label>
                    </div>
                    {pendingAttachments.filter((a) => a.kind === 'audio').length > 0 && (
                      <div className="text-[11px] text-amber-800 font-bold flex items-center gap-2">
                        <span>✓ {pendingAttachments.filter((a) => a.kind === 'audio').length} ریکارڈنگ منسلک ہے</span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-[9px]">
                          Not backed up
                        </span>
                      </div>
                    )}
                  </div>
                )}
                </div>
              )}

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
      <BiltyDeleteModal
        bilty={biltyToDelete}
        isUrdu={isUrdu}
        onCancel={() => setBiltyToDelete(null)}
        onConfirmDelete={(id) => {
          const targetRec = bilties.find((b) => b.id === id);
          try {
            if (onDeleteBilty) {
              onDeleteBilty(id);
            } else if (targetRec) {
              syncBiltyDeleteAddaCleanup(targetRec);
              const updated = bilties.filter((b) => b.id !== id);
              saveStoredBilties(updated);
            }
          } catch (err) {
            setBiltyToDelete(null);
            if (err instanceof AddaLifecycleError) {
              setFormError(isUrdu ? err.messageUr : err.messageEn);
            }
          }
        }}
      />

      {/* Legal Vault Modal for viewing, editing, and uploading attachments (Creator Only) */}
      {isCreatorUser && vaultModalBilty && (
        <BiltyLegalVaultModal
          isOpen={isVaultModalOpen}
          onClose={() => {
            setIsVaultModalOpen(false);
            setVaultModalBilty(null);
          }}
          bilty={vaultModalBilty}
          onAttachmentsChanged={handleAttachmentsChanged}
          onGeneratePdf={generateBiltyPdf}
        />
      )}

      {/* Unsaved Draft Confirmation when pressing Back mid-form */}
      <ConfirmDialog
        isOpen={showExitCreateConfirm}
        lang={lang}
        variant="warning"
        title={isUrdu ? 'بلٹی فارم سے باہر نکلیں؟' : 'Leave Bilty Form?'}
        message={
          isUrdu
            ? 'آپ کا غیر محفوظ شدہ بلٹی ڈیٹا فارم میں موجود ہے۔ کیا آپ واقعی واپس جانا چاہتے ہیں؟'
            : 'You have unsaved fields in the bilty form. Are you sure you want to leave?'
        }
        confirmLabel={isUrdu ? 'جی ہاں، واپس جائیں' : 'Yes, Go Back'}
        cancelLabel={isUrdu ? 'فارم پر رہیں' : 'Stay on Form'}
        onCancel={() => setShowExitCreateConfirm(false)}
        onConfirm={() => {
          setShowExitCreateConfirm(false);
          resetFormFields();
          const prevSub = subTabHistoryRef.current.pop();
          if (prevSub) {
            setSubTab(prevSub);
          } else if (bilties.length > 0 && initialSubTab !== 'create') {
            setSubTab('all');
          } else if (onNavigate) {
            onNavigate('home');
          }
        }}
      />

      {/* Hidden container for print and PDF generation */}
      {activePrintRecord && (
        <div
          id="printable-bilty-dom"
          className="printable-bilty-area fixed -top-[9999px] left-0 w-[794px] min-w-[794px] max-w-[794px] h-auto min-h-[1110px] bg-white text-slate-900 pointer-events-none opacity-100 z-[-100] print:static print:w-full print:h-auto print:opacity-100 print:pointer-events-auto print:z-auto"
        >
          <PrintableBilty
            record={activePrintRecord}
            qrDataUrl={activePrintQrUrl}
            cardDataUrl={preloadedAssets.card}
            logoDataUrl={preloadedAssets.logo}
            branch={(activePrintRecord.branchId || activePrintRecord.branch || effectiveBranch.id) as BiltyBranch}
            branchConfig={effectiveBranch}
            language={activePrintRecord.language || selectedLanguage}
          />
        </div>
      )}
    </div>
  );
};
