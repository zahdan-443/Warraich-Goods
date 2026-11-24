import React, { useEffect, useState, useRef } from 'react';
import { ActiveTab, BiltyRecord, BranchConfig, BranchPermissions, CompanyProfile, Driver, FuelLogItem, Language, RoutePreset, Trip, Vehicle, AppNotification, OfflineAction, UserBranchAccess, UserRole } from './types';
import {
  getStoredDrivers,
  getStoredFuelLog,
  getStoredRoutes,
  getStoredTrips,
  getStoredVehicles,
  saveStoredDrivers,
  saveStoredFuelLog,
  saveStoredRoutes,
  saveStoredTrips,
  saveStoredVehicles,
  getStoredNotifications,
  getStoredOfflineQueue,
  getStoredRole,
  saveStoredNotifications,
  saveStoredOfflineQueue,
  saveStoredRole,
  getStoredBilties,
  saveStoredBilties,
  getCachedCompanyProfile,
  getStoredCompanyProfile,
  syncPublicBiltyVerification,
  deletePublicBiltyVerification,
  getNextBiltyNo,
  loadFromFirestore,
  loadBranchBiltiesFromFirestore,
  formatBiltySeqNumber,
  getBiltyAccessConfig,
  subscribeToBiltyAccess,
  updateBiltyAccessInFirestore,
  saveUserProfileInFirestore,
  processOfflineQueue,
  autoReconcileAllLocalToCloud,
  initAmbientSyncEngine,
  subscribeToSyncEvents,
  getAccountDeletionStatus,
  fetchAccountDeletionStatus,
  cancelAccountDeletion,
  purgeExpiredAccountData,
  findNextAvailableBiltySeq,
  inspectGuestScopeData,
  importGuestDataIntoScope,
  type GuestScopeSummary,
  type AccountDeletionRequest
} from './utils/storage';
import {
  OWNER_EMAIL,
  DEFAULT_AUTHORIZED_EMAILS,
  DEFAULT_HEAD_OFFICE_BRANCH_ID,
  FULL_OWNER_PERMISSIONS,
  hasAnyBiltyPermission,
  isOwnerEmail,
  resolveEffectivePermissions
} from './utils/authUtils';
import {
  DEFAULT_SAMUNDRI_BRANCH,
  getActiveBranchId,
  getCachedBranchById,
  getCachedBranches,
  setActiveBranchId
} from './utils/branchContext';
import {
  ensureSamundriBranchInFirestore,
  fetchBranchById,
  getCachedUserBranchAccess,
  recordSignedInDirectoryUser,
  subscribeToBranchesForOwner,
  subscribeToUserBranchAccess
} from './utils/branchService';
import { fetchKhataFromFirestore } from './utils/ledgerStorage';
import { fetchAddaFromFirestore } from './utils/addaBillingStorage';
import { fetchLiveFuelPrices } from './utils/fuelPrice';
import { runScheduledDailyCloudBackup } from './utils/backupService';
import { pruneExpiredPreRestoreSnapshotsIdbOnly } from './utils/persistentStorage';
import {
  deleteAllAttachmentsForBilty,
  migrateLegacyBiltyLegalVaults,
  pullRemoteBiltyAttachmentsForOwner,
  runDailyBiltyAttachmentCleanup
} from './utils/biltyAttachments';
import { auth, onAuthStateChanged, logoutUser, checkRedirectAuthResult, loginWithGoogle } from './utils/firebase';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Header } from './components/Header';
import { HomeView } from './components/views/HomeView';
import { SplashScreen } from './components/SplashScreen';
import { 
  sendSystemNotification, 
  isNotificationSupported, 
  getNotificationPermission,
  requestNotificationPermission,
  ensureNotificationChannel
} from './utils/notifications';

const TripCostView = React.lazy(() => import('./components/views/TripCostView').then(m => ({ default: m.TripCostView })));
const VehiclesView = React.lazy(() => import('./components/views/VehiclesView').then(m => ({ default: m.VehiclesView })));
const DriversView = React.lazy(() => import('./components/views/DriversView').then(m => ({ default: m.DriversView })));
const RoutesView = React.lazy(() => import('./components/views/RoutesView').then(m => ({ default: m.RoutesView })));
const FuelLogView = React.lazy(() => import('./components/views/FuelLogView').then(m => ({ default: m.FuelLogView })));
const VerifyView = React.lazy(() => import('./components/views/VerifyView').then(m => ({ default: m.VerifyView })));
const BiltyView = React.lazy(() => import('./components/views/BiltyView').then(m => ({ default: m.BiltyView })));
const VehicleAccountView = React.lazy(() => import('./components/views/VehicleAccountView').then(m => ({ default: m.VehicleAccountView })));
const MapView = React.lazy(() => import('./components/views/MapView').then(m => ({ default: m.MapView })));
const TollPlazaView = React.lazy(() => import('./components/views/TollPlazaView').then(m => ({ default: m.TollPlazaView })));
const NavigationView = React.lazy(() => import('./components/views/NavigationView').then(m => ({ default: m.NavigationView })));
const DashcamView = import.meta.env.VITE_STORE_BUILD === 'true'
  ? null
  : React.lazy(() => import('./components/views/DashcamView').then(m => ({ default: m.DashcamView })));
const LedgerView = React.lazy(() => import('./components/views/LedgerView').then(m => ({ default: m.LedgerView })));
const AddaPanelView = React.lazy(() => import('./components/views/AddaPanelView').then(m => ({ default: m.AddaPanelView })));
import { ViewHeader } from './components/ViewHeader';
import { ManageBiltyAccessModal } from './components/ManageBiltyAccessModal';
import { BranchStaffModal } from './components/BranchStaffModal';
import { InstallPwaModal } from './components/InstallPwaModal';
import { GuestSavePromptModal } from './components/GuestSavePromptModal';
import { GuestImportPromptModal } from './components/GuestImportPromptModal';
import { LanguageSelectionModal } from './components/LanguageSelectionModal';
import { Home, ArrowLeft } from 'lucide-react';
import { checkExpiringDocuments, processExpiryNotifications } from './utils/documentExpiry';
import {
  dispatchDailyDigestNotification,
  decodeWeatherAndMotorway,
  NOTIFICATIONS_UPDATED_EVENT
} from './utils/dailyDigestNotification';
import { initKhataDueDateScheduler } from './utils/khataNotifications';

export default function App() {
  const isStoreBuild = import.meta.env.VITE_STORE_BUILD === 'true';
  const MASTER_EMAILS = [...DEFAULT_AUTHORIZED_EMAILS];

  const [lang, setLang] = useState<Language>(() => {
    try {
      const explicitChoice = localStorage.getItem('ah-lang-user-explicit');
      if (explicitChoice === 'ur' || explicitChoice === 'en') {
        return explicitChoice;
      }
      // Strictly default to Urdu ('ur')
      localStorage.setItem('ah-lang', 'ur');
    } catch {}
    return 'ur';
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  // Show official Driver Dost splash screen on initial app launch (bypass on deep-links)
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('page') || urlParams.get('view') || urlParams.get('bilty') || urlParams.get('vdata')) {
        return false;
      }
    } catch {}
    return true;
  });

  const [showLangPicker, setShowLangPicker] = useState<boolean>(false);

  const shouldPromptLanguageOnOpen = React.useCallback(() => {
    try {
      const explicitChoice = localStorage.getItem('ah-lang-user-explicit');
      if (explicitChoice === 'ur' || explicitChoice === 'en') {
        return false;
      }
      const urlParams = new URLSearchParams(window.location.search);
      const paramPage = urlParams.get('page') || urlParams.get('view') || urlParams.get('tab');
      if (
        paramPage === 'verify' ||
        urlParams.get('bilty') ||
        urlParams.get('biltyNo') ||
        urlParams.get('vdata')
      ) {
        return false;
      }
    } catch {}
    return true;
  }, []);

  const handleDismissSplash = React.useCallback(() => {
    setShowSplash(false);
    if (shouldPromptLanguageOnOpen()) {
      setShowLangPicker(true);
    }
  }, [shouldPromptLanguageOnOpen]);

  const handleSelectInitialLanguage = React.useCallback((selected: Language) => {
    setLang(selected);
    try {
      localStorage.setItem('ah-lang', selected);
      localStorage.setItem('ah-lang-user-explicit', selected);
    } catch {}
    document.documentElement.lang = selected;
    document.documentElement.dir = selected === 'ur' ? 'rtl' : 'ltr';
    document.body.classList.toggle('urdu', selected === 'ur');
    setShowLangPicker(false);
  }, []);
  const [authLoading, setAuthLoading] = useState(false);
  const [showBiltyAccessModal, setShowBiltyAccessModal] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('ah-gmail-user') || null;
  });
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [biltyAllowedUIDs, setBiltyAllowedUIDs] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('wg_global_bilty_allowed_uids') || localStorage.getItem('ah-bilty-allowed-uids');
      const parsed = cached ? JSON.parse(cached) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [biltyAllowedEmails, setBiltyAllowedEmails] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('wg_global_bilty_allowed_emails') || localStorage.getItem('ah-bilty-allowed-emails');
      const parsed = cached ? JSON.parse(cached) : null;
      const emails = Array.isArray(parsed) ? parsed.map((e: string) => String(e).toLowerCase().trim()) : [];
      return Array.from(new Set([...MASTER_EMAILS, ...emails]));
    } catch {
      return [...MASTER_EMAILS];
    }
  });
  const [role, setRole] = useState<UserRole>(() => getStoredRole());
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>(() => getStoredOfflineQueue());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getStoredNotifications());
  const [isOffline, setIsOffline] = useState(false);
  const [showTopMenu, setShowTopMenu] = useState(false);
  const [branches, setBranches] = useState<BranchConfig[]>(() => getCachedBranches());
  const [selectedOwnerBranchId, setSelectedOwnerBranchId] = useState<string>(() => {
    return getActiveBranchId() || DEFAULT_HEAD_OFFICE_BRANCH_ID;
  });
  const [userBranchAccess, setUserBranchAccess] = useState<UserBranchAccess | null>(() => {
    const email = localStorage.getItem('ah-gmail-user');
    return email && !isOwnerEmail(email) ? getCachedUserBranchAccess(email) : null;
  });
  const [staffBranchConfig, setStaffBranchConfig] = useState<BranchConfig | null>(() => {
    const email = localStorage.getItem('ah-gmail-user');
    const cached = email && !isOwnerEmail(email) ? getCachedUserBranchAccess(email) : null;
    return cached?.status === 'active' ? getCachedBranchById(cached.branchId) : null;
  });
  const [showBranchStaffModal, setShowBranchStaffModal] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(() => auth.currentUser?.displayName || null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => getCachedCompanyProfile());

  // Authorization & active branch resolution
  const isOwner = isOwnerEmail(userEmail);
  const activeBranch: BranchConfig | null = React.useMemo(() => {
    if (isOwner) {
      return (
        branches.find(b => b.id === selectedOwnerBranchId) ||
        getCachedBranchById(selectedOwnerBranchId) ||
        DEFAULT_SAMUNDRI_BRANCH
      );
    }
    if (userBranchAccess && userBranchAccess.status === 'active') {
      return (
        staffBranchConfig ||
        getCachedBranchById(userBranchAccess.branchId) || {
          ...DEFAULT_SAMUNDRI_BRANCH,
          id: userBranchAccess.branchId,
          nameUr: userBranchAccess.branchNameUr || userBranchAccess.branchId,
          nameEn: userBranchAccess.branchNameEn || userBranchAccess.branchId,
          addressUr: DEFAULT_SAMUNDRI_BRANCH.addressUr,
          addressEn: DEFAULT_SAMUNDRI_BRANCH.addressEn,
          phoneNumbers: DEFAULT_SAMUNDRI_BRANCH.phoneNumbers,
          startingBiltySeq: 1001,
          active: true,
          createdAt: userBranchAccess.updatedAt,
          updatedAt: userBranchAccess.updatedAt
        }
      );
    }
    return null;
  }, [isOwner, branches, selectedOwnerBranchId, userBranchAccess, staffBranchConfig]);

  const effectiveBranchPermissions: BranchPermissions = React.useMemo(() => {
    if (isOwner) return { ...FULL_OWNER_PERMISSIONS };
    return resolveEffectivePermissions(userEmail, userBranchAccess, activeBranch);
  }, [isOwner, userEmail, userBranchAccess, activeBranch]);

  const isBiltyAuthorized = isOwner || hasAnyBiltyPermission(effectiveBranchPermissions);
  const canManageBranchStaff = !isOwner && Boolean(effectiveBranchPermissions.manageBranchStaff && activeBranch);
  const khataAllowed =
    !isOwner && userBranchAccess && userBranchAccess.status === 'active'
      ? effectiveBranchPermissions.khataAccess
      : true;

  const selectedOwnerBranchIdRef = useRef(selectedOwnerBranchId);
  selectedOwnerBranchIdRef.current = selectedOwnerBranchId;

  // Stored state
  const [trips, setTrips] = useState<Trip[]>(() => getStoredTrips());
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => getStoredVehicles());
  const [drivers, setDrivers] = useState<Driver[]>(() => getStoredDrivers());
  const [routes, setRoutes] = useState<RoutePreset[]>(() => getStoredRoutes());
  const [fuelLogs, setFuelLogs] = useState<FuelLogItem[]>(() => getStoredFuelLog());
  const [bilties, setBilties] = useState<BiltyRecord[]>(() => getStoredBilties());

  // Initial load from storage on mount
  useEffect(() => {
    setOfflineQueue(getStoredOfflineQueue());
    setNotifications(getStoredNotifications());
    setTrips(getStoredTrips());
    setVehicles(getStoredVehicles());
    setDrivers(getStoredDrivers());
    setRoutes(getStoredRoutes());
    setFuelLogs(getStoredFuelLog());
    setBilties(getStoredBilties());
  }, []);

  // Selected mileage passed from Vehicles to Trip Cost
  const [selectedMileage, setSelectedMileage] = useState<number | undefined>(undefined);

  const lastBackPressTime = useRef(0);
  const [exitToast, setExitToast] = useState(false);

  // Floating "Back to Dashboard" button: appears in upper-left corner when scrolled down on any inner screen
  const [showFloatingBack, setShowFloatingBack] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<AccountDeletionRequest | null>(null);

  // Check account deletion status on user or auth change (local + Firestore)
  useEffect(() => {
    const target = currentUid || userEmail;
    if (target) {
      // 1. Immediate local status display
      const localStatus = getAccountDeletionStatus(target);
      setPendingDeletion(localStatus);

      // 2. Asynchronous Firestore reconciliation & 30-day expiration check
      fetchAccountDeletionStatus(target).then((cloudStatus) => {
        if (cloudStatus) {
          const scheduled = new Date(cloudStatus.scheduledFor).getTime();
          if (Date.now() >= scheduled) {
            // 30 days have elapsed -> execute permanent purge and sign out
            purgeExpiredAccountData(target).then(() => {
              setPendingDeletion(null);
              handleSignOut();
            });
            return;
          }
        }
        setPendingDeletion(cloudStatus);
      }).catch(() => {});
    } else {
      setPendingDeletion(null);
    }
  }, [currentUid, userEmail]);

  const handleCancelDeletion = async () => {
    const target = currentUid || userEmail;
    if (!target) return;
    await cancelAccountDeletion(target);
    setPendingDeletion(null);
    pushAppNotification(
      lang === 'ur' ? 'اکاؤنٹ بحال ہو گیا' : 'Account Restored',
      lang === 'ur' ? 'اکاؤنٹ ڈیلیٹ کرنے کی درخواست منسوخ کر دی گئی ہے۔' : 'Account deletion request has been cancelled.',
      'system'
    );
  };

  useEffect(() => {
    if (activeTab === 'home') {
      setShowFloatingBack(false);
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      // Show floating back button as soon as user scrolls past in-page back button (scrollY > 70)
      setShowFloatingBack(scrollY > 70);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const [verifySubSection, setVerifySubSection] = useState<'vehicle' | 'license' | 'challan' | 'history' | 'bilty'>('vehicle');
  const [biltySubTab, setBiltySubTab] = useState<'all' | 'create' | 'search'>('all');
  const [initialBiltySearch, setInitialBiltySearch] = useState<string>('');
  const [initialBiltyToken, setInitialBiltyToken] = useState<string>('');

  // Guest Save Verification Modal State (Google Sign In prompt for Firebase Cloud backup)
  const [showGuestSaveModal, setShowGuestSaveModal] = useState<boolean>(false);
  const [pendingGuestSaveAction, setPendingGuestSaveAction] = useState<(() => void) | null>(null);
  const [guestSavePromptDesc, setGuestSavePromptDesc] = useState<string>('');
  const [pendingGuestImport, setPendingGuestImport] = useState<GuestScopeSummary | null>(null);

  const triggerGuestSaveCheck = (action: () => void, description?: string) => {
    if (!auth.currentUser && !userEmail) {
      setPendingGuestSaveAction(() => action);
      if (description) setGuestSavePromptDesc(description);
      setShowGuestSaveModal(true);
      return;
    }
    action();
  };

  useEffect(() => {
    // Check URL parameters first for direct Bilty verification links (from QR code scan or WhatsApp link)
    // E.g. ?page=verify&bilty=WG-2026-0001&vdata=... or ?view=verify&biltyNo=... or ?bilty=...
    const urlParams = new URLSearchParams(window.location.search);
    const paramPage = urlParams.get('page') || urlParams.get('view') || urlParams.get('tab');
    const paramBilty = urlParams.get('bilty') || urlParams.get('biltyNo') || urlParams.get('id');
    const paramToken = urlParams.get('vdata') || urlParams.get('data') || urlParams.get('d');

    if (paramPage === 'verify' || paramBilty || paramToken) {
      setActiveTab('verify');
      setVerifySubSection('bilty');
      if (paramBilty) {
        setInitialBiltySearch(paramBilty.trim());
      }
      if (paramToken) {
        setInitialBiltyToken(paramToken.trim());
      }
      return;
    }

    const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
    if (rawHash) {
      const map: Record<string, ActiveTab> = {
        calculator: 'calculator',
        trip: 'calculator',
        'trip-calculator': 'calculator',
        vehicleaccount: 'vehicleAccount',
        'vehicle-account': 'vehicleAccount',
        vehicle: 'vehicle',
        vehicles: 'vehicle',
        drivers: 'drivers',
        routes: 'routes',
        fuel: 'fuel',
        verify: 'verify',
        bilty: 'bilty',
        toll: 'toll',
        'toll-plaza': 'toll',
        tollplaza: 'toll',
        navigation: 'navigation',
        nav: 'navigation',
        ledger: 'ledger',
        khata: 'ledger',
        addapanel: 'addaPanel',
        'adda-panel': 'addaPanel',
        adda: 'addaPanel',
        ownerpanel: 'addaPanel',
        home: 'home',
      };
      const resolved = map[rawHash.toLowerCase()];
      if (resolved) {
        setActiveTab(resolved);
        window.history.replaceState({ tab: resolved }, '');
        return;
      }
    }
    window.history.replaceState({ tab: 'home' }, '');
    window.history.pushState({ tab: 'home' }, '');
  }, []);

  const handleNavigate = (newTab: ActiveTab | string, subSection?: string) => {
    const target = (newTab === 'vehicles' ? 'vehicle' : newTab) as ActiveTab;
    if (isStoreBuild && target === 'dashcam') {
      setActiveTab('home');
      window.history.pushState({ tab: 'home' }, '', '#home');
      return;
    }
    if (subSection && ['vehicle', 'license', 'challan', 'history', 'bilty'].includes(subSection)) {
      setVerifySubSection(subSection as any);
    }
    if (newTab === 'bilty' && subSection) {
      if (subSection === 'create') setBiltySubTab('create');
      else if (subSection === 'ledger' || subSection === 'all') setBiltySubTab('all');
      else if (subSection === 'search') setBiltySubTab('search');
    }
    if (target !== activeTab) {
      window.history.pushState({ tab: target }, '', `#${target}`);
      setActiveTab(target);
    }
  };

  // Ref synchronizers to prevent listener churn and lifecycle races on Android
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  const showTopMenuRef = useRef(showTopMenu);
  showTopMenuRef.current = showTopMenu;

  const showBiltyAccessModalRef = useRef(showBiltyAccessModal);
  showBiltyAccessModalRef.current = showBiltyAccessModal;

  const showBranchStaffModalRef = useRef(showBranchStaffModal);
  showBranchStaffModalRef.current = showBranchStaffModal;

  useEffect(() => {
    // 1. Android Notification Channel & Permission setup on app initialization
    if (Capacitor.isNativePlatform()) {
      ensureNotificationChannel().then(() => {
        requestNotificationPermission().catch(() => {});
      }).catch(() => {});
    }

    // 2. Android Hardware / Gesture Back Button handling (Single permanent listener)
    let removeCapListener: (() => void) | null = null;
    if (Capacitor.isNativePlatform()) {
      CapApp.addListener('backButton', () => {
        // Priority 1: Close active drawers or modals
        if (showTopMenuRef.current) {
          setShowTopMenu(false);
          return;
        }
        if (showBiltyAccessModalRef.current) {
          setShowBiltyAccessModal(false);
          return;
        }
        if (showBranchStaffModalRef.current) {
          setShowBranchStaffModal(false);
          return;
        }

        // Priority 1.5: Let active view / inner modal / sub-tab intercept Back step-by-step
        const backEvent = new CustomEvent('app-back-button', { cancelable: true });
        window.dispatchEvent(backEvent);
        if (backEvent.defaultPrevented) {
          return;
        }

        // Priority 2: If user is inside ANY inner tool / section, navigate back to Dashboard ('home')
        if (activeTabRef.current !== 'home') {
          if ('vibrate' in navigator) {
            try { navigator.vibrate(10); } catch {}
          }
          setActiveTab('home');
          window.history.replaceState({ tab: 'home' }, '', '#home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        // Priority 3: When already on Dashboard ('home'), double back within 2 seconds to exit app
        const now = Date.now();
        if (now - lastBackPressTime.current < 2000) {
          CapApp.exitApp();
        } else {
          lastBackPressTime.current = now;
          setExitToast(true);
          if ('vibrate' in navigator) {
            try { navigator.vibrate(25); } catch {}
          }
          setTimeout(() => setExitToast(false), 2000);
        }
      }).then((handle) => {
        removeCapListener = () => handle.remove();
      }).catch(() => {});
    }

    // 3. Web browser popstate handling
    const handlePopState = (e: PopStateEvent) => {
      if (showTopMenuRef.current) {
        setShowTopMenu(false);
        return;
      }
      if (showBiltyAccessModalRef.current) {
        setShowBiltyAccessModal(false);
        return;
      }
      if (showBranchStaffModalRef.current) {
        setShowBranchStaffModal(false);
        return;
      }

      const backEvent = new CustomEvent('app-back-button', { cancelable: true });
      window.dispatchEvent(backEvent);
      if (backEvent.defaultPrevented) {
        const currentTab = activeTabRef.current || 'home';
        window.history.pushState({ tab: currentTab }, '', `#${currentTab}`);
        return;
      }

      if (activeTabRef.current !== 'home') {
        const targetTab = e.state?.tab || 'home';
        setActiveTab(targetTab);
        window.history.replaceState({ tab: targetTab }, '', `#${targetTab}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const now = Date.now();
        if (now - lastBackPressTime.current < 2000) {
          if (Capacitor.isNativePlatform()) {
            CapApp.exitApp();
          }
        } else {
          lastBackPressTime.current = now;
          setExitToast(true);
          setTimeout(() => setExitToast(false), 2000);
          window.history.pushState({ tab: 'home' }, '', '#home');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (removeCapListener) removeCapListener();
    };
  }, []); // Mounted once: Zero listener churn, preventing Android abrupt exit

  const handleToggleLang = () => {
    const nextLang: Language = lang === 'en' ? 'ur' : 'en';
    setLang(nextLang);
    try {
      localStorage.setItem('ah-lang', nextLang);
      localStorage.setItem('ah-lang-user-explicit', nextLang);
    } catch {}
    document.documentElement.lang = nextLang;
    document.documentElement.dir = nextLang === 'ur' ? 'rtl' : 'ltr';
    document.body.classList.toggle('urdu', nextLang === 'ur');
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    document.body.classList.toggle('urdu', lang === 'ur');
    // Ensure document is always freely scrollable
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }, [lang]);

  // Update notification warning for Guest Mode (Local Storage only) vs Signed In (Cloud Sync)
  useEffect(() => {
    const baseNotifs = getStoredNotifications();
    if (!userEmail) {
      const guestNotif: AppNotification = {
        id: 9999,
        title: lang === 'ur' ? 'معلوماتی نوٹس: لوکل میموری فعال ہے' : 'Info Notice: Local Storage Mode Active',
        message: lang === 'ur'
          ? 'آپ کا تمام ریکارڈ (سفر اخراجات، گاڑیوں کے لاگز اور کاروباری دستاویزات) اس ڈیوائس پر محفوظ ہے۔ آن لائن کلاؤڈ بیک اپ کے لیے کسی بھی وقت سائن ان کر سکتے ہیں۔'
          : 'All trip calculations, vehicle logs and transport documents are safely stored on this device. Sign in anytime for cloud backup.',
        time: lang === 'ur' ? 'ابھی' : 'Just now',
        unread: true,
        type: 'system'
      };
      const filtered = baseNotifs.filter(n => n.id !== 9999);
      setNotifications([guestNotif, ...filtered]);
    } else {
      const filtered = baseNotifs.filter(n => n.id !== 9999);
      setNotifications(filtered);
    }
  }, [userEmail, lang]);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    saveStoredRole(newRole);
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const handleToggleOffline = () => {
    setIsOffline(prev => !prev);
  };

  const handleSyncOffline = async () => {
    if (isOffline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      pushAppNotification(
        lang === 'ur' ? 'انٹرنیٹ کنکشن درکار ہے' : 'Internet Required',
        lang === 'ur' ? 'کلاؤڈ پر ریکارڈز سنک کرنے کے لیے انٹرنیٹ بحال کریں۔' : 'Please connect to the internet to sync offline records.',
        'system'
      );
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      pushAppNotification(
        lang === 'ur' ? 'سائن ان درکار ہے' : 'Sign-in Required',
        lang === 'ur' ? 'کلاؤڈ سنک اور تمام ڈیوائسز پر بیک اپ کے لیے پہلے گوگل سے سائن ان کریں۔' : 'Please sign in with Google to sync and backup your data across devices.',
        'system'
      );
      return;
    }

    try {
      const queueRes = await processOfflineQueue();
      const reconRes = await autoReconcileAllLocalToCloud(user.uid);
      
      // Refresh local React state without wiping remaining/blocked queue items (#9, #10)
      setOfflineQueue(getStoredOfflineQueue());
      setTrips(getStoredTrips());
      setVehicles(getStoredVehicles());
      setDrivers(getStoredDrivers());
      setRoutes(getStoredRoutes());
      setFuelLogs(getStoredFuelLog());
      setBilties(getStoredBilties());

      const totalCount = (queueRes.processed || 0) + (reconRes.count || 0);
      if (queueRes.blocked > 0 || !reconRes.synced) {
        pushAppNotification(
          lang === 'ur' ? 'سنک نامکمل' : 'Sync Partially Completed',
          lang === 'ur'
            ? `کچھ ریکارڈز سنک نہیں ہو سکے (${queueRes.remaining} قطار میں باقی ہیں)۔`
            : `${queueRes.remaining} item(s) could not be synced yet.`,
          'system'
        );
      } else {
        pushAppNotification(
          lang === 'ur' ? 'کلاؤڈ سنک مکمل' : 'Cloud Sync Complete',
          lang === 'ur' 
            ? `ڈیٹا کلاؤڈ کے ساتھ کامیابی سے ہم آہنگ ہو گیا (${totalCount} ریکارڈز اپ ڈیٹ)۔` 
            : `Data successfully synchronized with cloud database (${totalCount} records updated).`,
          'system'
        );
      }
    } catch (err) {
      console.warn("Manual sync error:", err);
      pushAppNotification(
        lang === 'ur' ? 'سنک میں تاخیر' : 'Sync Paused',
        lang === 'ur' ? 'کلاؤڈ کنکشن میں عارضی تاخیر ہے۔ ڈیٹا فون پر محفوظ ہے اور خودکار سنک ہو جائے گا۔' : 'Temporary cloud latency. Data is safe locally and will retry automatically.',
        'system'
      );
    }
  };

  // Direct Google Sign-In without internal app popup
  const handleSignIn = async () => {
    if (authLoading) return;
    setAuthLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        const email = user.email || (user as any)?.providerData?.[0]?.email || '';
        if (email) {
          await handleAuthSuccess(email, user.uid);
          pushAppNotification(
            lang === 'ur' ? 'خوش آمدید' : 'Welcome',
            lang === 'ur' ? `گوگل اکاؤنٹ (${email}) کامیابی سے لاگ ان ہو گیا۔` : `Successfully signed in as ${email}.`,
            'system'
          );
        }
      }
    } catch (err: any) {
      console.warn("Direct Google sign-in notice:", err);
      const isUnauth = err?.code === 'auth/unauthorized-domain' || (err?.message && err.message.includes('auth/unauthorized-domain'));
      if (isUnauth) {
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        pushAppNotification(
          lang === 'ur' ? 'فائر بیس ڈومین تصدیق درکار ہے' : 'Domain Authorization Required',
          lang === 'ur' ? `ویب ڈومین (${hostname}) فائر بیس کے Authorized Domains میں شامل کریں۔` : `Please authorize (${hostname}) in Firebase Console.`,
          'system'
        );
      } else if (err?.code === 'auth/popup-blocked') {
        pushAppNotification(
          lang === 'ur' ? 'پوپ اپ بلاک ہے' : 'Popup Blocked',
          lang === 'ur' ? 'براؤزر نے لاگ ان ونڈو روک دی۔ براہ کرم ایڈریس بار میں پاپ اپ کی اجازت دیں اور دوبارہ کلک کریں۔' : 'Browser blocked sign-in popup. Please allow popups in your browser and click again.',
          'system'
        );
      } else {
        const errDetail = String(err?.message || err?.code || '');
        const isCancelled = err?.code === 'auth/popup-closed-by-user' ||
          err?.code === 'auth/cancelled-popup-request' ||
          errDetail.toLowerCase().includes('cancel') ||
          errDetail.includes('16') ||
          err?.code === '16';

        if (!isCancelled) {
          pushAppNotification(
            lang === 'ur' ? 'گوگل لاگ ان' : 'Google Sign-In',
            lang === 'ur' 
              ? `گوگل لاگ ان مکمل نہیں ہو سکا۔ ${errDetail ? `(${errDetail.slice(0, 70)})` : 'دوبارہ کوشش کریں۔'}` 
              : `Google Sign-In could not be completed. ${errDetail ? `(${errDetail.slice(0, 70)})` : 'Please try again.'}`,
            'system'
          );
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthSuccess = async (email: string, explicitUid?: string) => {
    try {
      const isOwnerEmail = email.toLowerCase() === OWNER_EMAIL.toLowerCase();
      const finalRole: UserRole = isOwnerEmail ? 'owner' : 'driver';
      setUserEmail(email);
      setRole(finalRole);
      saveStoredRole(finalRole);
      localStorage.setItem('ah-gmail-user', email);

      const uid = auth.currentUser?.uid || explicitUid || currentUid || null;
      if (uid) {
        setCurrentUid(uid);
      }

      // Refresh bilty access immediately (Confidential: Strictly App Owner)
      if (isOwnerEmail) {
        try {
          const config = await getBiltyAccessConfig();
          setBiltyAllowedUIDs(config.allowedUIDs);
          setBiltyAllowedEmails(config.allowedEmails);
        } catch {
          // Gracefully rely on local state
        }
      } else {
        setBiltyAllowedUIDs([]);
        setBiltyAllowedEmails([]);
      }

      if (!uid) {
        return;
      }

      try {
        await saveUserProfileInFirestore({
          uid,
          email,
          role: finalRole,
          name: isOwnerEmail ? 'Driver Dost Owner' : email.split('@')[0]
        });
      } catch (profileError: any) {
        console.warn("Firestore user profile save warning (fallback to local cache):", profileError);
      }

      // Check if this device has Guest-mode records and prompt user before merging
      try {
        localStorage.removeItem(`wg_v3_guest_import_deferred_${uid}`);
        const guestSummary = inspectGuestScopeData();
        if (guestSummary.hasGuestData) {
          setPendingGuestImport(guestSummary);
        }
      } catch {}

      // Auto-reconcile all local/offline data to this user's cloud Firestore
      autoReconcileAllLocalToCloud(uid).then(() => {
        setOfflineQueue(getStoredOfflineQueue());
        setBilties(getStoredBilties());
        setTrips(getStoredTrips());
        setVehicles(getStoredVehicles());
        setDrivers(getStoredDrivers());
        setFuelLogs(getStoredFuelLog());
        if (isOwnerEmail) {
          migrateLegacyBiltyLegalVaults(uid)
            .then(() => pullRemoteBiltyAttachmentsForOwner(uid))
            .then(() => runDailyBiltyAttachmentCleanup(uid))
            .then(() => setBilties(getStoredBilties()))
            .catch(() => {});
        }
      }).catch(err => console.warn('Auth auto-sync notice:', err));
    } catch (generalAuthError: any) {
      console.error("Auth success handler error:", generalAuthError);
    }
  };

  const handleSignOut = () => {
    if (currentUid) {
      try {
        localStorage.removeItem(`wg_v3_guest_import_deferred_${currentUid}`);
      } catch {}
    }
    logoutUser();
    setUserEmail(null);
    setCurrentUid(null);
    setUserBranchAccess(null);
    setStaffBranchConfig(null);
    setShowBranchStaffModal(false);
    setActiveBranchId(null);
    setPendingGuestImport(null);
    localStorage.removeItem('ah-gmail-user');
    localStorage.removeItem('ah-user-role');
    setRole('driver');
    saveStoredRole('driver');
    setBilties(getStoredBilties());
    window.dispatchEvent(new CustomEvent('driverdost:storage_hydrated'));
  };

  const handleSelectOwnerBranch = async (branchId: string) => {
    if (!isOwner) return;
    const targetId = branchId || DEFAULT_HEAD_OFFICE_BRANCH_ID;
    setSelectedOwnerBranchId(targetId);
    setActiveBranchId(targetId);
    try {
      await Promise.all([
        loadBranchBiltiesFromFirestore(targetId),
        fetchKhataFromFirestore(),
        fetchAddaFromFirestore(targetId)
      ]);
    } catch {}
    setBilties(getStoredBilties());
    window.dispatchEvent(new CustomEvent('driverdost:storage_hydrated'));
  };

  // Route protection: if active tab is bilty/addaPanel and user is not authorized, redirect to home
  useEffect(() => {
    if (activeTab === 'bilty' && !isBiltyAuthorized) {
      setActiveTab('home');
    }
    if (activeTab === 'addaPanel' && !isBiltyAuthorized && !canManageBranchStaff) {
      setActiveTab('home');
    }
  }, [activeTab, isBiltyAuthorized, canManageBranchStaff]);

  // Real Network Connectivity and Ambient Auto-Sync Engine
  useEffect(() => {
    // Initialize ambient background sync engine (network, visibilitychange, focus, and periodic heartbeat)
    const cleanupAmbient = initAmbientSyncEngine();

    const handleOnline = async () => {
      setIsOffline(false);
      await autoReconcileAllLocalToCloud(currentUid || undefined);
      setOfflineQueue(getStoredOfflineQueue());
      setBilties(getStoredBilties());
      setTrips(getStoredTrips());
      setVehicles(getStoredVehicles());
      setDrivers(getStoredDrivers());
      setFuelLogs(getStoredFuelLog());
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    const handleBiltiesUpdated = (e: any) => {
      if (Array.isArray(e?.detail)) {
        setBilties(e.detail);
      } else {
        setBilties(getStoredBilties());
      }
    };

    const handleNotificationsUpdated = () => {
      setNotifications(getStoredNotifications());
    };

    const handleStorageHydrated = () => {
      setBilties(getStoredBilties());
      setTrips(getStoredTrips());
      setVehicles(getStoredVehicles());
      setDrivers(getStoredDrivers());
      setRoutes(getStoredRoutes());
      setFuelLogs(getStoredFuelLog());
      setNotifications(getStoredNotifications());
    };

    // Keep UI synced on storage/sync events
    const unsubSyncStatus = subscribeToSyncEvents(() => {
      setOfflineQueue(getStoredOfflineQueue());
      setBilties(getStoredBilties());
    });

    const handleCompanyUpdated = () => {
      setCompanyProfile(getCachedCompanyProfile());
      const updatedBranches = getCachedBranches();
      setBranches(updatedBranches);
      const currentActiveId = getActiveBranchId();
      if (currentActiveId) {
        setStaffBranchConfig(getCachedBranchById(currentActiveId));
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('driverdost:bilties_updated', handleBiltiesUpdated);
    window.addEventListener('driverdost:storage_hydrated', handleStorageHydrated);
    window.addEventListener('driverdost:company_updated', handleCompanyUpdated);
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated);

    return () => {
      cleanupAmbient();
      unsubSyncStatus();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('driverdost:bilties_updated', handleBiltiesUpdated);
      window.removeEventListener('driverdost:storage_hydrated', handleStorageHydrated);
      window.removeEventListener('driverdost:company_updated', handleCompanyUpdated);
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated);
    };
  }, [currentUid]);

  // Check vehicle & driver document expiries on app load and dispatch 30/15/7 day reminders (Feature A)
  useEffect(() => {
    const expiring = checkExpiringDocuments(vehicles, drivers);
    if (expiring.length > 0) {
      processExpiryNotifications(expiring, lang);
    }
  }, [vehicles, drivers, lang]);

  // Daily Fuel Prices, Weather & Road Conditions Digest Notification (Play Store & PalmStore Compliant)
  useEffect(() => {
    dispatchDailyDigestNotification(lang, false).catch(() => {});
  }, [lang]);

  // ── APP-OPEN UNIFIED API PRE-FETCH (Live Fuel Rates, Weather & Cloud Offline Queue) ──
  useEffect(() => {
    // 0. Prune expired 7-day pre-restore IDB snapshots & migrate legacy legalVaults idempotently
    pruneExpiredPreRestoreSnapshotsIdbOnly().catch(() => {});
    migrateLegacyBiltyLegalVaults().then((res) => {
      if (res.migratedAttachments > 0) {
        setBilties(getStoredBilties());
      }
    }).catch(() => {});

    // 1. Live Fuel Prices API & Company Profile sync
    fetchLiveFuelPrices(true).catch(err => console.warn('App-open fuel prefetch notice:', err));
    getStoredCompanyProfile().then(setCompanyProfile).catch(() => {});

    // 2. Cloud Sync & Bidirectional Offline Reconciliation
    if (navigator.onLine) {
      autoReconcileAllLocalToCloud(currentUid || undefined).then(res => {
        if (res.synced && res.count > 0) {
          const remaining = getStoredOfflineQueue();
          setOfflineQueue(remaining);
          setBilties(getStoredBilties());
          setTrips(getStoredTrips());
          setVehicles(getStoredVehicles());
          setDrivers(getStoredDrivers());
          setFuelLogs(getStoredFuelLog());
        }
      }).catch(err => console.warn('App-open cloud auto-sync notice:', err));
    }

    // 3. Highway & Corridor Weather API pre-fetch (Samundri, Karachi, Lahore, Islamabad, Multan, Faisalabad)
    const prefetchWeather = async () => {
      try {
        const CACHE_KEY_WEATHER = 'wg_cached_highway_weather';
        const keyCities = [
          { id: 'samundri', lat: 31.0632, lng: 72.9602, nameUr: 'سمندری', nameEn: 'Samundri' },
          { id: 'lahore', lat: 31.5204, lng: 74.3587, nameUr: 'لاہور', nameEn: 'Lahore' },
          { id: 'karachi', lat: 24.8607, lng: 67.0011, nameUr: 'کراچی', nameEn: 'Karachi' },
          { id: 'islamabad', lat: 33.6844, lng: 73.0479, nameUr: 'اسلام آباد', nameEn: 'Islamabad' },
          { id: 'multan', lat: 30.1575, lng: 71.5249, nameUr: 'ملتان', nameEn: 'Multan' },
          { id: 'faisalabad', lat: 31.4504, lng: 73.1350, nameUr: 'فیصل آباد', nameEn: 'Faisalabad' }
        ];

        const lats = keyCities.map(c => c.lat).join(',');
        const lngs = keyCities.map(c => c.lng).join(',');
        
        let res: Response | null = null;
        if (!Capacitor.isNativePlatform()) {
          try {
            const proxyController = new AbortController();
            const proxyTid = setTimeout(() => proxyController.abort(), 5000);
            res = await fetch(`/api/weather?latitude=${lats}&longitude=${lngs}`, { signal: proxyController.signal });
            clearTimeout(proxyTid);
          } catch {
            // proxy fallback
          }
        }
        if (!res || !res.ok) {
          try {
            const directController = new AbortController();
            const directTid = setTimeout(() => directController.abort(), 8000);
            res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,visibility&timezone=Asia%2FKarachi`, { signal: directController.signal });
            clearTimeout(directTid);
          } catch {
            // direct fetch failed
          }
        }

        if (res && res.ok) {
          const json = await res.json();
          const items = Array.isArray(json) ? json : [json];
          const newMap: Record<string, any> = {};
          items.forEach((item: any, idx: number) => {
            const city = keyCities[idx];
            if (!city || !item.current) return;
            const c = item.current;
            const decoded = decodeWeatherAndMotorway(c);
            newMap[city.id] = {
              temp: decoded.temp,
              apparentTemp: decoded.apparentTemp,
              humidity: decoded.humidity,
              windSpeed: decoded.windSpeed,
              visibilityKm: decoded.visibilityKm,
              precipitationMm: decoded.precipitationMm,
              weatherCode: decoded.weatherCode,
              conditionUr: decoded.conditionUr,
              conditionEn: decoded.conditionEn,
              iconType: decoded.iconType,
              safetyLevel: decoded.safetyLevel,
              roadStatusUr: decoded.roadStatusUr,
              roadStatusEn: decoded.roadStatusEn,
              fogWarning: decoded.fogWarning,
              rainWarning: decoded.rainWarning,
              updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          });

          let existingData = {};
          try {
            const old = localStorage.getItem(CACHE_KEY_WEATHER);
            if (old) existingData = JSON.parse(old)?.data || {};
          } catch {}
          localStorage.setItem(CACHE_KEY_WEATHER, JSON.stringify({
            timestamp: Date.now(),
            data: { ...existingData, ...newMap }
          }));
        }
      } catch (weatherErr) {
        console.warn('App-open weather pre-fetch skipped:', weatherErr);
      }
    };
    prefetchWeather();
  }, []);

  // Daily Khata Due-Date Notification Scheduler (09:00 AM check)
  useEffect(() => {
    const cleanup = initKhataDueDateScheduler(lang);
    return () => cleanup();
  }, [lang]);

  // Firebase auth & bilty access real-time sync
  useEffect(() => {
    // Initial fetch of bilty access configuration
    // Check for Google Sign-In redirect completion on page load
    checkRedirectAuthResult().then((user) => {
      if (user && user.email) {
        handleAuthSuccess(user.email, user.uid);
      }
    }).catch((err) => {
      console.warn("Redirect auth check skipped:", err);
    });

    let unsubBilty: (() => void) | null = null;
    let unsubBranches: (() => void) | null = null;
    let unsubUserAccess: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userMail = user.email || user.displayName || 'Authenticated User';
        setUserEmail(userMail);
        setUserDisplayName(user.displayName || null);
        setCurrentUid(user.uid);
        localStorage.setItem('ah-gmail-user', userMail);

        const ownerAccount = isOwnerEmail(userMail);
        const activeRole: UserRole = ownerAccount ? 'owner' : 'driver';
        setRole(activeRole);
        saveStoredRole(activeRole);

        if (ownerAccount) {
          if (unsubUserAccess) {
            unsubUserAccess();
            unsubUserAccess = null;
          }
          setUserBranchAccess(null);
          setStaffBranchConfig(null);
          const ownerBranchId = selectedOwnerBranchIdRef.current || DEFAULT_HEAD_OFFICE_BRANCH_ID;
          setActiveBranchId(ownerBranchId);

          if (!unsubBilty) {
            unsubBilty = subscribeToBiltyAccess((config) => {
              setBiltyAllowedUIDs(config.allowedUIDs);
              setBiltyAllowedEmails(config.allowedEmails);
            });
          }
          ensureSamundriBranchInFirestore().catch(() => {});
          if (!unsubBranches) {
            unsubBranches = subscribeToBranchesForOwner((list) => {
              setBranches(list);
            });
          }
        } else {
          if (unsubBilty) {
            unsubBilty();
            unsubBilty = null;
            setBiltyAllowedUIDs([]);
            setBiltyAllowedEmails([]);
          }
          if (unsubBranches) {
            unsubBranches();
            unsubBranches = null;
          }
          if (unsubUserAccess) {
            unsubUserAccess();
            unsubUserAccess = null;
          }

          recordSignedInDirectoryUser({
            uid: user.uid,
            email: userMail,
            displayName: user.displayName || undefined
          }).catch(() => {});

          unsubUserAccess = subscribeToUserBranchAccess(userMail, async (access) => {
            setUserBranchAccess(access);
            if (access && access.status === 'active') {
              setActiveBranchId(access.branchId);
              const fetchedBranch = await fetchBranchById(access.branchId).catch(() => null);
              setStaffBranchConfig(fetchedBranch);
              await Promise.all([
                loadBranchBiltiesFromFirestore(access.branchId).catch(() => {}),
                fetchKhataFromFirestore().catch(() => {}),
                fetchAddaFromFirestore(access.branchId).catch(() => {})
              ]);
              setBilties(getStoredBilties());
              window.dispatchEvent(new CustomEvent('driverdost:storage_hydrated'));
            } else {
              setStaffBranchConfig(null);
              setActiveBranchId(null);
              setShowBranchStaffModal(false);
              setBilties(getStoredBilties());
              window.dispatchEvent(new CustomEvent('driverdost:storage_hydrated'));
            }
          });
        }

        // Sync user profile in Firestore
        saveUserProfileInFirestore({
          uid: user.uid,
          email: userMail,
          role: activeRole,
          name: user.displayName || userMail || 'User'
        });
        getStoredCompanyProfile().then(setCompanyProfile).catch(() => {});

        try {
          await loadFromFirestore(user.uid);
          if (ownerAccount) {
            const ownerBranchId = selectedOwnerBranchIdRef.current || DEFAULT_HEAD_OFFICE_BRANCH_ID;
            await fetchAddaFromFirestore(ownerBranchId).catch(() => {});
            if (ownerBranchId !== DEFAULT_HEAD_OFFICE_BRANCH_ID) {
              await Promise.all([
                loadBranchBiltiesFromFirestore(ownerBranchId).catch(() => {}),
                fetchKhataFromFirestore().catch(() => {})
              ]);
            }
          }
        } catch (err) {
          console.warn("Firestore load skipped:", err);
        }
        setTrips(getStoredTrips());
        setVehicles(getStoredVehicles());
        setDrivers(getStoredDrivers());
        setRoutes(getStoredRoutes());
        setFuelLogs(getStoredFuelLog());
        setBilties(getStoredBilties());
        if (ownerAccount) {
          migrateLegacyBiltyLegalVaults(user.uid)
            .then(() => pullRemoteBiltyAttachmentsForOwner(user.uid))
            .then(() => runDailyBiltyAttachmentCleanup(user.uid))
            .then(() => setBilties(getStoredBilties()))
            .catch(() => {});
        }
        runScheduledDailyCloudBackup().catch(() => {});
      } else {
        if (unsubBilty) {
          unsubBilty();
          unsubBilty = null;
        }
        if (unsubBranches) {
          unsubBranches();
          unsubBranches = null;
        }
        if (unsubUserAccess) {
          unsubUserAccess();
          unsubUserAccess = null;
        }
        setBiltyAllowedUIDs([]);
        setBiltyAllowedEmails([]);
        setUserBranchAccess(null);
        setStaffBranchConfig(null);
        setShowBranchStaffModal(false);
        setActiveBranchId(null);
        setUserEmail(null);
        setUserDisplayName(null);
        setCurrentUid(null);
        localStorage.removeItem('ah-gmail-user');
        localStorage.removeItem('ah-user-role');
        setRole('driver');
        saveStoredRole('driver');
        setTrips(getStoredTrips());
        setVehicles(getStoredVehicles());
        setDrivers(getStoredDrivers());
        setRoutes(getStoredRoutes());
        setFuelLogs(getStoredFuelLog());
        setBilties(getStoredBilties());
      }
      setAuthInitialized(true);
    });

    return () => {
      if (typeof unsubBilty === 'function') unsubBilty();
      if (typeof unsubBranches === 'function') unsubBranches();
      if (typeof unsubUserAccess === 'function') unsubUserAccess();
      unsubscribeAuth();
    };
  }, []);

  // Notification permission is strictly on-demand (e.g. from Notification modal / settings)

  // Route Protection for Bilty Generator & Adda Panel
  useEffect(() => {
    if (activeTab === 'bilty' && !isBiltyAuthorized) {
      setActiveTab('home');
    }
    if (activeTab === 'addaPanel' && !isBiltyAuthorized && !canManageBranchStaff) {
      setActiveTab('home');
    }
  }, [activeTab, isBiltyAuthorized, canManageBranchStaff]);

  // Sync lang class to body
  useEffect(() => {
    if (lang === 'ur') {
      document.body.classList.add('urdu');
    } else {
      document.body.classList.remove('urdu');
    }
  }, [lang]);

  // Helper to push in-app notification AND send system notification to device status bar
  const pushAppNotification = (title: string, message: string, type: 'fuel' | 'fleet' | 'tax' | 'system' = 'system') => {
    const newNotif: AppNotification = {
      id: Date.now(),
      title,
      message,
      time: lang === 'ur' ? 'ابھی' : 'Just now',
      unread: true,
      type
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev.filter(n => n.id !== newNotif.id)].slice(0, 30);
      saveStoredNotifications(updated);
      return updated;
    });

    // Native status bar & mobile notification panel dispatch
    sendSystemNotification(title, message, { tag: 'warraich-goods-update' });
  };

  // Handlers for Trips
  const handleSaveTrip = (tripObj: Omit<Trip, 'id' | 'name'>, tripName: string) => {
    const execute = () => {
      const newTrip: Trip = {
        ...tripObj,
        id: Date.now(),
        name: tripName
      };
      if (isOffline && currentUid) {
        const offlineItem: OfflineAction = {
          id: Date.now(),
          type: 'trip',
          data: newTrip,
          timestamp: new Date().toLocaleTimeString()
        };
        const newQ = [offlineItem, ...offlineQueue];
        setOfflineQueue(newQ);
        saveStoredOfflineQueue(newQ);
      }
      const updated = [newTrip, ...trips];
      setTrips(updated);
      saveStoredTrips(updated);

      pushAppNotification(
        lang === 'ur' ? 'سفر کا حساب محفوظ ہو گیا' : 'Trip Cost Saved',
        lang === 'ur' ? `روٹ: ${tripName} کے اخراجات محفوظ ہو گئے۔` : `Trip expenses for ${tripName} saved successfully.`,
        'system'
      );
    };

    triggerGuestSaveCheck(
      execute,
      lang === 'ur'
        ? 'سفر اور گاڑی کا مالی حساب محفوظ رکھنے کے لیے گوگل سائن ان کریں۔ فائر بیس کلاؤڈ آپ کے ڈیٹا کو محفوظ رکھتا ہے۔'
        : 'Sign in with Google to protect your trip expenses and accounts on secure Firebase Cloud.'
    );
  };

  const handleDeleteTrip = (id: number) => {
    const updated = trips.filter((t) => t.id !== id);
    setTrips(updated);
    saveStoredTrips(updated);
  };

  const handleClearAllTrips = () => {
    setTrips([]);
    saveStoredTrips([]);
  };

  // Handlers for Vehicles
  const handleAddVehicle = (vehObj: Omit<Vehicle, 'id'>) => {
    const execute = () => {
      const newVeh: Vehicle = {
        ...vehObj,
        id: Date.now()
      };
      const updated = [...vehicles, newVeh];
      setVehicles(updated);
      saveStoredVehicles(updated);

      pushAppNotification(
        lang === 'ur' ? 'گاڑی کا ریکارڈ شامل ہو گیا' : 'Vehicle Registered',
        lang === 'ur' ? `گاڑی نمبر ${newVeh.reg} کا اندراج مکمل ہو گیا۔` : `Vehicle ${newVeh.reg} added to fleet.`,
        'fleet'
      );
    };

    triggerGuestSaveCheck(
      execute,
      lang === 'ur'
        ? 'گاڑی کا ریکارڈ اور فلیٹ پروفائل فائر بیس پر محفوظ کرنے کے لیے گوگل سائن ان کریں۔'
        : 'Sign in with Google to save your vehicle profile securely on Firebase Cloud.'
    );
  };

  const handleUpdateVehicle = (updatedVeh: Vehicle) => {
    const updated = vehicles.map((v) => (v.id === updatedVeh.id ? updatedVeh : v));
    setVehicles(updated);
    saveStoredVehicles(updated);
  };

  const handleDeleteVehicle = (id: number) => {
    const updated = vehicles.filter((v) => v.id !== id);
    setVehicles(updated);
    saveStoredVehicles(updated);
  };

  const handleSelectMileage = (mileage: number) => {
    setSelectedMileage(mileage);
    setActiveTab('calculator');
  };

  // Handlers for Drivers
  const handleAddDriver = (drvObj: Omit<Driver, 'id'>) => {
    const execute = () => {
      const newDrv: Driver = {
        ...drvObj,
        id: Date.now()
      };
      const updated = [...drivers, newDrv];
      setDrivers(updated);
      saveStoredDrivers(updated);

      pushAppNotification(
        lang === 'ur' ? 'ڈرائیور کا اندراج مکمل' : 'Driver Added',
        lang === 'ur' ? `ڈرائیور: ${newDrv.name} (${newDrv.phone}) شامل ہو گئے۔` : `Driver ${newDrv.name} added.`,
        'fleet'
      );
    };

    triggerGuestSaveCheck(
      execute,
      lang === 'ur'
        ? 'ڈرائیور کا ریکارڈ اور دستاویزات فائر بیس کلاؤڈ پر محفوظ کرنے کے لیے گوگل سائن ان کریں۔'
        : 'Sign in with Google to save your driver records securely on Firebase Cloud.'
    );
  };

  const handleUpdateDriver = (updatedDrv: Driver) => {
    const updated = drivers.map((d) => (d.id === updatedDrv.id ? updatedDrv : d));
    setDrivers(updated);
    saveStoredDrivers(updated);
  };

  const handleDeleteDriver = (id: number) => {
    const updated = drivers.filter((d) => d.id !== id);
    setDrivers(updated);
    saveStoredDrivers(updated);
  };

  // Handlers for Routes
  const handleAddRoute = (rtObj: Omit<RoutePreset, 'id'>) => {
    const newRt: RoutePreset = {
      ...rtObj,
      id: Date.now()
    };
    const updated = [...routes, newRt];
    setRoutes(updated);
    saveStoredRoutes(updated);
  };

  const handleDeleteRoute = (id: number) => {
    const updated = routes.filter((r) => r.id !== id);
    setRoutes(updated);
    saveStoredRoutes(updated);
  };

  const handleApplyRoute = (route: RoutePreset) => {
    // Navigate to calculator
    handleNavigate('calculator');
  };

  // Handlers for Fuel Log
  const handleLogFuelPrice = (diesel?: number, petrol?: number, cng?: number) => {
    const newItem: FuelLogItem = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }),
      diesel,
      petrol,
      cng
    };
    const updated = [newItem, ...fuelLogs].slice(0, 30);
    setFuelLogs(updated);
    saveStoredFuelLog(updated);

    pushAppNotification(
      lang === 'ur' ? 'ڈیزل و فیول ریٹ اپڈیٹ' : 'Fuel Rate Logged',
      lang === 'ur' ? `ڈیزل: Rs ${diesel || '-'} | پیٹرول: Rs ${petrol || '-'} ریٹ لاگ میں درج۔` : `Fuel rates recorded in history.`,
      'fuel'
    );
  };

  // Handlers for Bilty
  const handleAddBilty = (recordObj: Omit<BiltyRecord, 'id'>): BiltyRecord => {
    const current = getStoredBilties();
    let finalBiltyNo = recordObj.biltyNo;

    // Check if an existing record already has this exact biltyNo (including wrap-around collisions)
    const existingSameNo = current.find(
      (b) => b.biltyNo?.trim().toUpperCase() === finalBiltyNo.trim().toUpperCase()
    );
    if (existingSameNo) {
      try {
        const allowOver9999 = Number(activeBranch?.startingBiltySeq || 1001) > 9999;
        const rawDigits = String(finalBiltyNo).replace(/\D/g, '');
        const seqNum = parseInt(!allowOver9999 && rawDigits.length > 4 ? rawDigits.slice(-4) : rawDigits, 10) || (activeBranch?.startingBiltySeq || 1001);
        const nextSeq = findNextAvailableBiltySeq(seqNum + 1, allowOver9999);
        finalBiltyNo = formatBiltySeqNumber(nextSeq);
      } catch {
        finalBiltyNo = `WG-${Date.now().toString().slice(-6)}`;
      }
    }

    const nowIso = new Date().toISOString();
    const newRecord: BiltyRecord = {
      ...recordObj,
      branchId: recordObj.branchId || activeBranch?.id || DEFAULT_HEAD_OFFICE_BRANCH_ID,
      branchNameUr: recordObj.branchNameUr || activeBranch?.nameUr,
      branchNameEn: recordObj.branchNameEn || activeBranch?.nameEn,
      branchAddressUr: recordObj.branchAddressUr || activeBranch?.addressUr,
      branchAddressEn: recordObj.branchAddressEn || activeBranch?.addressEn,
      branchPhone: recordObj.branchPhone || activeBranch?.phoneNumbers,
      createdByEmail: recordObj.createdByEmail || userEmail || undefined,
      createdByUid: recordObj.createdByUid || currentUid || undefined,
      biltyNo: finalBiltyNo,
      id: Date.now(),
      createdAt: recordObj.createdAt || nowIso,
      updatedAt: nowIso
    };

    // Filter only if same record ID or colliding biltyNo
    const filtered = current.filter((b) => b.id !== newRecord.id && b.biltyNo !== newRecord.biltyNo);
    const updated = [newRecord, ...filtered];
    setBilties(updated);
    saveStoredBilties(updated);
    syncPublicBiltyVerification(newRecord).catch(() => {});

    pushAppNotification(
      lang === 'ur' ? 'نئی بلٹی تیار ہے' : 'Bilty Created',
      lang === 'ur' ? `بلٹی نمبر ${newRecord.biltyNo} (${newRecord.senderName || ''}) محفوظ ہو گئی۔` : `Bilty #${newRecord.biltyNo} saved.`,
      'system'
    );
    return newRecord;
  };

  const handleUpdateBilty = (updatedRecord: BiltyRecord) => {
    if (!isOwner && !effectiveBranchPermissions.editDeleteBilty) return;
    const current = getStoredBilties();
    const existing = current.find((b) => b.id === updatedRecord.id);
    const stampedRecord: BiltyRecord = {
      ...updatedRecord,
      updatedAt: new Date().toISOString()
    };

    const updated = current.map((b) => (b.id === stampedRecord.id ? stampedRecord : b));
    setBilties(updated);
    saveStoredBilties(updated);

    if (
      existing?.biltyNo &&
      existing.biltyNo.trim().toUpperCase() !== stampedRecord.biltyNo.trim().toUpperCase()
    ) {
      deletePublicBiltyVerification(existing.biltyNo).catch(() => {});
    }
    syncPublicBiltyVerification(stampedRecord).catch(() => {});

    pushAppNotification(
      lang === 'ur' ? 'بلٹی اپڈیٹ ہو گئی' : 'Bilty Updated',
      lang === 'ur' ? `بلٹی نمبر ${stampedRecord.biltyNo} کی تفصیلات اپڈیٹ کر دی گئیں۔` : `Bilty #${stampedRecord.biltyNo} updated.`,
      'system'
    );
  };

  const handleDeleteBilty = (id: number) => {
    if (!isOwner && !effectiveBranchPermissions.editDeleteBilty) return;
    const current = getStoredBilties();
    const target = current.find((b) => b.id === id);
    const updated = current.filter((b) => b.id !== id);
    setBilties(updated);
    saveStoredBilties(updated);

    if (target) {
      void deleteAllAttachmentsForBilty(target);
    }
    if (target?.biltyNo) {
      deletePublicBiltyVerification(target.biltyNo).catch(() => {});
    }

    pushAppNotification(
      lang === 'ur' ? 'بلٹی حذف کر دی گئی' : 'Bilty Deleted',
      lang === 'ur' ? `بلٹی نمبر ${target?.biltyNo || ''} ریکارڈ سے ہٹا دی گئی۔` : `Bilty #${target?.biltyNo || ''} removed.`,
      'system'
    );
  };

  const TAB_HEADER_INFO: Record<string, { title: string; titleUr: string; subtitle?: string; subtitleUr?: string }> = {
    calculator: {
      title: 'Trip Cost Calculator',
      titleUr: 'ٹرپ خرچ کیلکولیٹر',
      subtitle: 'Fuel, Toll & Net Profit',
      subtitleUr: 'ڈیزل، ٹول ٹیکس اور خالص بچت'
    },
    vehicle: {
      title: 'Vehicle Fleet',
      titleUr: 'گاڑیوں کی تفصیل',
      subtitle: 'Manage Fleet & Mileage',
      subtitleUr: 'گاڑیاں اور مائلیج اندراج'
    },
    drivers: {
      title: 'Drivers Directory',
      titleUr: 'ڈرائیورز لسٹ',
      subtitle: 'Directory & License Status',
      subtitleUr: 'ڈرائیورز اور لائسنس ڈیٹا'
    },
    routes: {
      title: 'Saved Routes',
      titleUr: 'روٹس اور راستے',
      subtitle: 'Presets & Standard Distances',
      subtitleUr: 'محفوظ روٹس اور فاصلہ'
    },
    fuel: {
      title: 'Fuel Price Log',
      titleUr: 'ڈیزل و فیول لاگ',
      subtitle: 'Official Fuel History',
      subtitleUr: 'سرکاری فیول ریٹ ریکارڈ'
    },
    verify: {
      title: 'Verification Center',
      titleUr: 'گاڑی و لائسنس تصدیق',
      subtitle: 'Vehicles, Licenses, Challans & Document QR',
      subtitleUr: 'آن لائن تصدیقی پورٹل'
    },
    map: {
      title: 'Route Weather & Map',
      titleUr: 'لائیو موسم اور نقشہ',
      subtitle: 'Fog, Rain, Heat & Wind Alert',
      subtitleUr: 'دھند، بارش اور سڑک کی صورتحال'
    },
    bilty: {
      title: 'Bilty Generator',
      titleUr: 'بلٹی جنریٹر (وڑائچ گڈز)',
      subtitle: 'Authorized Consignment Note System',
      subtitleUr: 'مجاز کنسائنمنٹ نوٹ اور کیو آر'
    },
    toll: {
      title: 'Toll Plaza Rates',
      titleUr: 'ٹول پلازہ ریٹس و کیلکولیٹر',
      subtitle: 'Motorway & Highway Tolls',
      subtitleUr: 'موٹروے و ہائی وے آفیشل ٹول ٹیکس'
    },
    vehicleAccount: {
      title: 'Vehicle Account',
      titleUr: 'گاڑی کا حساب کتاب',
      subtitle: 'Income, Expenses & Net Profit',
      subtitleUr: 'خرچ، آمدنی اور بچت کا تفصیلی حساب'
    },
    dashcam: {
      title: 'Driver Dashcam',
      titleUr: 'ڈرائیور ڈیش کیم',
      subtitle: 'Road Recording & GPS HUD',
      subtitleUr: 'ویڈیو ریکارڈنگ اور اسپیڈومیٹر'
    },
    ledger: {
      title: 'Financial Ledger',
      titleUr: 'پارٹی اور ڈرائیور کھاتہ',
      subtitle: 'Credit, Debit & Outstanding Balance',
      subtitleUr: 'بنام، جمع کھاتہ اور بقایا رقم'
    },
    addaPanel: {
      title: 'Adda / Owner Panel',
      titleUr: 'اڈا / اونر کنٹرول پینل',
      subtitle: 'Branches, Pending Freight, Commissions, Bills & Staff',
      subtitleUr: 'برانچز، بقایا کرایہ، کمیشن، بل، اسٹاف اور بزنس رپورٹ'
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#fdfbf7] text-[#4a4a35] flex flex-col font-sans relative">
      {showSplash ? (
        <SplashScreen
          lang={lang}
          onDismiss={handleDismissSplash}
          onSelectTab={(tab) => {
            handleNavigate(tab);
            handleDismissSplash();
          }}
          isBiltyAuthorized={isBiltyAuthorized}
        />
      ) : (
        <>
          {(!activeTab || activeTab === 'home') && (
            <Header
              lang={lang}
              onToggleLang={handleToggleLang}
              userEmail={userEmail}
              userId={currentUid}
              onSignIn={handleSignIn}
              onSignOut={handleSignOut}
              role={role}
              onSelectRole={handleRoleChange}
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              offlineCount={offlineQueue.length}
              isOffline={isOffline}
              onToggleOffline={handleToggleOffline}
              onSyncOffline={handleSyncOffline}
              isDashboard={!activeTab || activeTab === 'home'}
              showTopMenuExternal={showTopMenu}
              onOpenTopMenu={() => {
                window.history.pushState({ modal: true }, '');
                setShowTopMenu(true);
              }}
              onCloseTopMenu={() => setShowTopMenu(false)}
              onOpenBiltyAccess={() => setShowBiltyAccessModal(true)}
              authLoading={authLoading}
              activeBranch={activeBranch}
              canManageBranchStaff={canManageBranchStaff}
              onOpenBranchStaffModal={() => setShowBranchStaffModal(true)}
            />
          )}

          {activeTab && activeTab !== 'home' && activeTab !== 'navigation' && (
            <ViewHeader
              title={TAB_HEADER_INFO[activeTab]?.title || 'Driver Dost'}
              titleUr={TAB_HEADER_INFO[activeTab]?.titleUr || 'ڈرائیور دوست'}
              subtitle={TAB_HEADER_INFO[activeTab]?.subtitle}
              subtitleUr={TAB_HEADER_INFO[activeTab]?.subtitleUr}
              lang={lang}
              onBackToDashboard={() => {
                if (activeTab === 'bilty') {
                  const backEvent = new CustomEvent('app-back-button', { cancelable: true });
                  window.dispatchEvent(backEvent);
                  if (backEvent.defaultPrevented) {
                    return;
                  }
                }
                handleNavigate('home');
              }}
              onToggleLang={handleToggleLang}
            />
          )}

          {pendingDeletion && (
            <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-amber-950 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm border-b border-amber-400">
              <div className="flex items-center gap-2 font-medium">
                <span className="text-base">⏳</span>
                <span>
                  {lang === 'ur'
                    ? `اکاؤنٹ ڈیلیٹ کی درخواست زیرِ کارروائی ہے (30 دن کی مہلت)۔ شیڈول: ${new Date(pendingDeletion.scheduledFor).toLocaleDateString('ur-PK', { day: 'numeric', month: 'short' })}`
                    : `Account deletion pending (30-day grace period). Scheduled: ${new Date(pendingDeletion.scheduledFor).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}`}
                </span>
              </div>
              <button
                onClick={handleCancelDeletion}
                className="px-3 py-1 bg-white hover:bg-amber-50 text-amber-950 font-bold rounded-lg border border-amber-300 cursor-pointer text-[11px] transition-all shadow-xs"
              >
                {lang === 'ur' ? 'درخواست منسوخ کریں اور اکاؤنٹ بحال رکھیں' : 'Cancel Deletion & Restore Account'}
              </button>
            </div>
          )}

          <main className="flex-1 flex flex-col w-full min-h-0 pb-16 sm:pb-20">
            <React.Suspense
              fallback={
                <div className="flex-1 flex items-center justify-center p-12 text-[#8e8e75] text-sm">
                  <div className="w-6 h-6 border-2 border-[#8b9d77] border-t-transparent rounded-full animate-spin inline-block mr-2" />
                  <span>{lang === 'ur' ? 'لوڈ ہو رہا ہے...' : 'Loading...'}</span>
                </div>
              }
            >
              {(!activeTab || activeTab === 'home') && (
                <HomeView
                  lang={lang}
                  trips={trips}
                  vehicles={vehicles}
                  drivers={drivers}
                  bilties={bilties}
                  userRole={role}
                  userEmail={userEmail}
                  userDisplayName={userDisplayName}
                  userBranchAccess={userBranchAccess}
                  companyProfile={companyProfile}
                  isBiltyAuthorized={isBiltyAuthorized}
                  onNavigate={handleNavigate}
                  onOpenMenu={() => {
                    window.history.pushState({ modal: true }, '');
                    setShowTopMenu(true);
                  }}
                  onOpenSignIn={handleSignIn}
                  onOpenBiltyAccess={() => setShowBiltyAccessModal(true)}
                  onSaveTrip={handleSaveTrip}
                  onLogFuelPrice={handleLogFuelPrice}
                  activeBranch={activeBranch}
                  branches={isOwner ? branches : (activeBranch ? [activeBranch] : [])}
                  branchPermissions={effectiveBranchPermissions}
                  canManageBranchStaff={canManageBranchStaff}
                  onSelectBranch={isOwner ? handleSelectOwnerBranch : undefined}
                  onOpenBranchStaffModal={canManageBranchStaff ? () => setShowBranchStaffModal(true) : undefined}
                />
              )}

          {activeTab === 'calculator' && (
            <TripCostView
              lang={lang}
              trips={trips}
              routes={routes}
              onSaveTrip={handleSaveTrip}
              onDeleteTrip={handleDeleteTrip}
              onClearAllTrips={handleClearAllTrips}
              initialMileage={selectedMileage}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'vehicle' && (
            <VehiclesView
              lang={lang}
              vehicles={vehicles}
              onAddVehicle={handleAddVehicle}
              onUpdateVehicle={handleUpdateVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onSelectMileage={handleSelectMileage}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'drivers' && (
            <DriversView
              lang={lang}
              drivers={drivers}
              onAddDriver={handleAddDriver}
              onUpdateDriver={handleUpdateDriver}
              onDeleteDriver={handleDeleteDriver}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'routes' && (
            <RoutesView
              lang={lang}
              routes={routes}
              onAddRoute={handleAddRoute}
              onDeleteRoute={handleDeleteRoute}
              onApplyRoute={handleApplyRoute}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'fuel' && (
            <FuelLogView
              lang={lang}
              fuelLogs={fuelLogs}
              onLogFuelPrice={handleLogFuelPrice}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'verify' && (
            <VerifyView
              lang={lang}
              onNavigate={handleNavigate}
              vehicles={vehicles}
              drivers={drivers}
              initialSection={verifySubSection}
              initialBiltyNo={initialBiltySearch}
              initialBiltyToken={initialBiltyToken}
            />
          )}

          {activeTab === 'map' && (
            <MapView
              lang={lang}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'bilty' && isBiltyAuthorized && (
            <BiltyView
              lang={lang}
              bilties={bilties}
              initialSubTab={biltySubTab}
              onAddBilty={handleAddBilty}
              onUpdateBilty={handleUpdateBilty}
              onDeleteBilty={handleDeleteBilty}
              onNavigate={handleNavigate}
              activeBranch={activeBranch}
              branchPermissions={effectiveBranchPermissions}
              currentUserEmail={userEmail}
              currentUserUid={currentUid}
            />
          )}

          {activeTab === 'toll' && (
            <TollPlazaView
              lang={lang}
              onNavigate={handleNavigate}
              onApplyToTrip={(amount, from, to) => {
                // Pre-fill or notify when applied
              }}
            />
          )}

          {activeTab === 'vehicleAccount' && (
            <VehicleAccountView
              lang={lang}
              vehicles={vehicles}
              onNavigate={handleNavigate}
              onSaveTrip={handleSaveTrip}
            />
          )}

          {activeTab === 'navigation' && (
            <NavigationView
              lang={lang}
              originCityId={localStorage.getItem('wg_nav_origin') || 'samundri'}
              destCityId={localStorage.getItem('wg_nav_dest') || 'karachi'}
              onNavigate={handleNavigate}
              onOpenTollCalc={(from, to) => {
                handleNavigate('toll');
              }}
            />
          )}

          {!isStoreBuild && activeTab === 'dashcam' && DashcamView && (
            <DashcamView
              lang={lang}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'ledger' && (
            <LedgerView
              lang={lang}
              vehicles={vehicles}
              trips={trips}
              drivers={drivers}
              bilties={isBiltyAuthorized ? bilties : []}
              isBiltyAuthorized={isBiltyAuthorized}
              onNavigate={handleNavigate}
              userEmail={userEmail}
              currentUserUid={currentUid}
              activeBranch={activeBranch}
              khataAllowed={khataAllowed}
            />
          )}

          {activeTab === 'addaPanel' && (isBiltyAuthorized || canManageBranchStaff) && (
            <AddaPanelView
              lang={lang}
              bilties={bilties}
              activeBranch={activeBranch}
              branches={isOwner ? branches : (activeBranch ? [activeBranch] : [])}
              branchPermissions={effectiveBranchPermissions}
              userEmail={userEmail}
              userBranchAccess={userBranchAccess}
              companyProfile={companyProfile}
              onNavigate={handleNavigate}
              onSelectBranch={isOwner ? handleSelectOwnerBranch : undefined}
              onBranchesUpdated={(updatedBranches) => setBranches(updatedBranches)}
              onOpenBiltyAccess={isOwner ? () => setShowBiltyAccessModal(true) : undefined}
            />
          )}
        </React.Suspense>
      </main>

      <React.Suspense fallback={null}>

        <ManageBiltyAccessModal
          isOpen={showBiltyAccessModal && isOwnerEmail(userEmail)}
          onClose={() => setShowBiltyAccessModal(false)}
          currentUserUid={currentUid}
          currentUserEmail={userEmail}
          onUpdated={({ allowedUIDs, allowedEmails }) => {
            setBiltyAllowedUIDs(allowedUIDs);
            setBiltyAllowedEmails(allowedEmails);
          }}
          lang={lang}
          activeBranchId={activeBranch?.id || selectedOwnerBranchId}
          onSelectActiveBranch={(branchId) => {
            void handleSelectOwnerBranch(branchId);
          }}
          onBranchesUpdated={(updatedBranches) => {
            setBranches(updatedBranches);
          }}
        />

        <BranchStaffModal
          isOpen={showBranchStaffModal && canManageBranchStaff}
          onClose={() => setShowBranchStaffModal(false)}
          lang={lang}
          branch={activeBranch}
          currentUserEmail={userEmail}
          canManageStaff={canManageBranchStaff}
        />

        <InstallPwaModal lang={lang} />

        <GuestSavePromptModal
          isOpen={showGuestSaveModal}
          onClose={() => {
            setShowGuestSaveModal(false);
            setPendingGuestSaveAction(null);
          }}
          onProceedWithoutAuth={() => {
            if (pendingGuestSaveAction) {
              pendingGuestSaveAction();
              setPendingGuestSaveAction(null);
            }
          }}
          onAuthSuccess={async (email, uid) => {
            await handleAuthSuccess(email, uid);
            if (pendingGuestSaveAction) {
              pendingGuestSaveAction();
              setPendingGuestSaveAction(null);
            }
          }}
          lang={lang}
          saveDescription={guestSavePromptDesc}
        />

        <GuestImportPromptModal
          isOpen={Boolean(pendingGuestImport && currentUid)}
          lang={lang}
          userEmail={userEmail}
          summary={pendingGuestImport}
          onMerge={async () => {
            if (!currentUid) return;
            const res = importGuestDataIntoScope(currentUid, 'merge');
            setTrips(getStoredTrips());
            setVehicles(getStoredVehicles());
            setDrivers(getStoredDrivers());
            setRoutes(getStoredRoutes());
            setFuelLogs(getStoredFuelLog());
            setBilties(getStoredBilties());
            setPendingGuestImport(null);
            window.dispatchEvent(new CustomEvent('driverdost:storage_hydrated'));
            if (navigator.onLine) {
              await autoReconcileAllLocalToCloud(currentUid).catch(() => {});
              setOfflineQueue(getStoredOfflineQueue());
            }
            pushAppNotification(
              lang === 'ur' ? 'گیسٹ ریکارڈز شامل ہو گئے' : 'Guest Records Merged',
              lang === 'ur'
                ? `${res.mergedCount} ریکارڈز کامیابی سے آپ کے اکاؤنٹ میں منتقل ہو گئے۔`
                : `${res.mergedCount} guest record(s) imported into your signed-in account.`,
              'system'
            );
          }}
          onKeepSeparate={() => {
            if (currentUid) {
              try {
                localStorage.setItem(`wg_v3_guest_import_deferred_${currentUid}`, '1');
              } catch {}
            }
            setPendingGuestImport(null);
          }}
          onDiscard={() => {
            if (currentUid) {
              importGuestDataIntoScope(currentUid, 'discard');
            }
            setPendingGuestImport(null);
          }}
        />
      </React.Suspense>

      {/* FLOATING UPPER-LEFT "BACK TO DASHBOARD" BUTTON (Appears at top-left matching header position when scrolled) */}
      {activeTab !== 'home' && (
        <button
          type="button"
          onClick={() => {
            if ('vibrate' in navigator) {
              try { navigator.vibrate(10); } catch {}
            }
            handleNavigate('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`fixed top-[58px] left-3 sm:left-5 z-40 flex items-center gap-1.5 py-1.5 px-3 bg-white/95 hover:bg-[#eaeae0] text-[#4a4a35] rounded-xl shadow-md border border-[#ecece0] active:scale-95 cursor-pointer font-bold text-xs select-none backdrop-blur-md transition-all duration-200 ease-out ${
            showFloatingBack
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
              : 'opacity-0 -translate-y-2 scale-90 pointer-events-none'
          }`}
          title={lang === 'ur' ? 'ڈیش بورڈ پر واپس جائیں' : 'Back to Dashboard'}
          aria-label={lang === 'ur' ? 'ڈیش بورڈ پر واپس جائیں' : 'Back to Dashboard'}
        >
          <Home className="w-3.5 h-3.5 text-[#8b9d77] shrink-0" />
          <span>{lang === 'ur' ? 'ڈیش بورڈ' : 'Dashboard'}</span>
          <ArrowLeft className={`w-3.5 h-3.5 text-[#8b9d77] shrink-0 ${lang === 'ur' ? 'rotate-180' : ''}`} />
        </button>
      )}

      {exitToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-[#4a4a35] text-white rounded-full text-xs font-bold shadow-xl border border-[#8b9d77] animate-bounce">
          {lang === 'ur' ? 'ایپ بند کرنے کے لئے دوبارہ بیک دبائیں' : 'Press back again within 2 seconds to exit app'}
        </div>
      )}
        </>
      )}

      <LanguageSelectionModal
        isOpen={showLangPicker}
        onSelectLanguage={handleSelectInitialLanguage}
      />
    </div>
  );
}
