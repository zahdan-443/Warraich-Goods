import React, { useEffect, useState, useRef } from 'react';
import { ActiveTab, BiltyRecord, Driver, FuelLogItem, Language, RoutePreset, Trip, Vehicle, AppNotification, OfflineAction, UserRole } from './types';
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
  loadFromFirestore,
  getBiltyAccessConfig,
  saveUserProfileInFirestore
} from './utils/storage';
import { auth, onAuthStateChanged, logoutUser } from './utils/firebase';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { HomeView } from './components/views/HomeView';
import { TripCostView } from './components/views/TripCostView';
import { VehiclesView } from './components/views/VehiclesView';
import { DriversView } from './components/views/DriversView';
import { RoutesView } from './components/views/RoutesView';
import { FuelLogView } from './components/views/FuelLogView';
import { VerifyView } from './components/views/VerifyView';
import { BiltyView } from './components/views/BiltyView';
import { VehicleAccountView } from './components/views/VehicleAccountView';
import { SplashScreen } from './components/SplashScreen';
import { AuthModal } from './components/AuthModal';
import { ManageBiltyAccessModal } from './components/ManageBiltyAccessModal';
import { InstallPwaModal } from './components/InstallPwaModal';
import { sendSystemNotification, isNotificationSupported, getNotificationPermission } from './utils/notifications';

export default function App() {
  const OWNER_EMAIL = 'warraichgoods43@gmail.com';

  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [showSplash, setShowSplash] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBiltyAccessModal, setShowBiltyAccessModal] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('ah-gmail-user') || null;
  });
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [biltyAllowedUIDs, setBiltyAllowedUIDs] = useState<string[]>([]);
  const [biltyAllowedEmails, setBiltyAllowedEmails] = useState<string[]>([]);
  const [role, setRole] = useState<UserRole>(() => {
    const storedUser = localStorage.getItem('ah-gmail-user');
    if (storedUser && storedUser.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
      return 'owner';
    }
    return 'driver';
  });
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [showTopMenu, setShowTopMenu] = useState(false);

  // Authorization check for Bilty Generator — strictly guarded ONLY for authenticated App Owner (warraichgoods43@gmail.com)
  const isOwner = Boolean(
    userEmail && userEmail.toLowerCase() === OWNER_EMAIL.toLowerCase()
  );

  const isBiltyAuthorized = Boolean(isOwner);

  // Stored state
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<RoutePreset[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLogItem[]>([]);
  const [bilties, setBilties] = useState<BiltyRecord[]>([]);

  // Selected mileage passed from Vehicles to Trip Cost
  const [selectedMileage, setSelectedMileage] = useState<number | undefined>(undefined);

  const lastBackPressTime = useRef(0);
  const [exitToast, setExitToast] = useState(false);

  useEffect(() => {
    window.history.replaceState({ tab: 'home' }, '');
    window.history.pushState({ tab: 'home' }, '');
  }, []);

  const handleNavigate = (newTab: ActiveTab | string) => {
    const target = (newTab === 'vehicles' ? 'vehicle' : newTab) as ActiveTab;
    if (target !== activeTab) {
      window.history.pushState({ tab: target }, '');
      setActiveTab(target);
    }
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (showTopMenu) {
        setShowTopMenu(false);
        window.history.pushState({ tab: activeTab }, '');
        return;
      }
      if (showAuthModal) {
        setShowAuthModal(false);
        window.history.pushState({ tab: activeTab }, '');
        return;
      }

      const customEvent = new CustomEvent('app-back-button', { cancelable: true });
      const canceled = !window.dispatchEvent(customEvent);
      if (canceled) {
        window.history.pushState({ tab: activeTab }, '');
        return;
      }

      if (activeTab !== 'home') {
        const targetTab = e.state?.tab || 'home';
        setActiveTab(targetTab);
        if (targetTab === 'home') {
          window.history.pushState({ tab: 'home' }, '');
        }
      } else {
        const now = Date.now();
        if (now - lastBackPressTime.current < 2000) {
          // Allow exit on 2nd back press within 2 seconds
        } else {
          lastBackPressTime.current = now;
          window.history.pushState({ tab: 'home' }, '');
          setExitToast(true);
          setTimeout(() => setExitToast(false), 2500);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab, showTopMenu, showAuthModal]);

  // Load from storage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('ah-lang') as Language;
    if (savedLang === 'en' || savedLang === 'ur') {
      setLang(savedLang);
    }
    const savedEmail = localStorage.getItem('ah-gmail-user');
    if (savedEmail) {
      setUserEmail(savedEmail);
    }
    setRole(getStoredRole());
    setOfflineQueue(getStoredOfflineQueue());
    setNotifications(getStoredNotifications());
    setTrips(getStoredTrips());
    setVehicles(getStoredVehicles());
    setDrivers(getStoredDrivers());
    setRoutes(getStoredRoutes());
    setFuelLogs(getStoredFuelLog());
    setBilties(getStoredBilties());
  }, []);

  // Update notification warning for Guest Mode (Local Storage only) vs Signed In (Cloud Sync)
  useEffect(() => {
    const baseNotifs = getStoredNotifications();
    if (!userEmail) {
      const guestNotif: AppNotification = {
        id: 9999,
        title: lang === 'ur' ? 'معلوماتی نوٹس: لوکل میموری فعال ہے' : 'Info Notice: Local Storage Mode Active',
        message: lang === 'ur'
          ? 'آپ کا تمام ریکارڈ (سفر اخراجات، گاڑیوں کے لاگز اور بلٹی) اس ڈیوائس پر محفوظ ہے۔ آن لائن کلاؤڈ بیک اپ کے لیے کسی بھی وقت سائن ان کر سکتے ہیں۔'
          : 'All trip calculations, vehicle logs and bilty records are safely stored on this device. Sign in anytime for cloud backup.',
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
    setIsOffline(!isOffline);
  };

  const handleSyncOffline = () => {
    if (offlineQueue.length === 0) return;
    window.alert(`Successfully synced ${offlineQueue.length} offline queued records to cloud server!`);
    setOfflineQueue([]);
    saveStoredOfflineQueue([]);
  };

  // Sign in handler
  const handleSignIn = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = async (email: string) => {
    const isOwnerEmail = email.toLowerCase() === OWNER_EMAIL.toLowerCase();
    const finalRole: UserRole = isOwnerEmail ? 'owner' : 'driver';
    setUserEmail(email);
    setRole(finalRole);
    saveStoredRole(finalRole);
    localStorage.setItem('ah-gmail-user', email);

    const uid = currentUid || `user_${Date.now()}`;
    setCurrentUid(uid);

    await saveUserProfileInFirestore({
      uid,
      email,
      role: finalRole,
      name: isOwnerEmail ? 'Warraich Goods Owner' : email.split('@')[0]
    });
  };

  const handleSignOut = () => {
    logoutUser();
    setUserEmail(null);
    setCurrentUid(null);
    localStorage.removeItem('ah-gmail-user');
    localStorage.removeItem('ah-user-role');
    setRole('driver');
    saveStoredRole('driver');
  };

  // Route protection: if active tab is bilty and user is not authorized, redirect to home
  useEffect(() => {
    if (activeTab === 'bilty' && !isBiltyAuthorized) {
      setActiveTab('home');
    }
  }, [activeTab, isBiltyAuthorized]);

  // Firebase auth & bilty access sync
  useEffect(() => {
    // Initial fetch of bilty access configuration
    getBiltyAccessConfig().then((config) => {
      setBiltyAllowedUIDs(config.allowedUIDs);
      setBiltyAllowedEmails(config.allowedEmails);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userMail = user.email || user.displayName || 'Authenticated User';
        setUserEmail(userMail);
        setCurrentUid(user.uid);
        localStorage.setItem('ah-gmail-user', userMail);

        const isOwnerEmail = userMail.toLowerCase() === OWNER_EMAIL.toLowerCase();
        const activeRole: UserRole = isOwnerEmail ? 'owner' : 'driver';
        setRole(activeRole);
        saveStoredRole(activeRole);

        // Sync user profile in Firestore
        saveUserProfileInFirestore({
          uid: user.uid,
          email: userMail,
          role: activeRole,
          name: user.displayName || userMail || 'User'
        });

        try {
          await loadFromFirestore(user.uid);
        } catch (err) {
          console.warn("Firestore load skipped:", err);
        }
        setTrips(getStoredTrips());
        setVehicles(getStoredVehicles());
        setDrivers(getStoredDrivers());
        setRoutes(getStoredRoutes());
        setFuelLogs(getStoredFuelLog());
        setBilties(getStoredBilties());
      } else {
        setUserEmail(null);
        setCurrentUid(null);
        localStorage.removeItem('ah-gmail-user');
        localStorage.removeItem('ah-user-role');
        setRole('driver');
        saveStoredRole('driver');
      }
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, []);

  // Route Protection for Bilty Generator
  useEffect(() => {
    if (activeTab === 'bilty' && !isBiltyAuthorized) {
      setActiveTab('home');
    }
  }, [activeTab, isBiltyAuthorized]);

  // Sync lang class to body
  useEffect(() => {
    localStorage.setItem('ah-lang', lang);
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
    const newTrip: Trip = {
      ...tripObj,
      id: Date.now(),
      name: tripName
    };
    if (isOffline) {
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
  const handleAddBilty = (recordObj: Omit<BiltyRecord, 'id'>) => {
    const newRecord: BiltyRecord = {
      ...recordObj,
      id: Date.now()
    };
    const updated = [newRecord, ...bilties];
    setBilties(updated);
    saveStoredBilties(updated);

    pushAppNotification(
      lang === 'ur' ? 'نئی بلٹی تیار ہے' : 'Bilty Created',
      lang === 'ur' ? `بلٹی نمبر ${newRecord.biltyNo} (${newRecord.senderName}) محفوظ ہو گئی۔` : `Bilty #${newRecord.biltyNo} saved.`,
      'system'
    );
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#4a4a35] flex flex-col font-sans relative">
      {showSplash && (
        <SplashScreen
          onDismiss={() => setShowSplash(false)}
          onSelectTab={(tab) => {
            handleNavigate(tab);
            setShowSplash(false);
          }}
          isBiltyAuthorized={isBiltyAuthorized}
        />
      )}

      {activeTab !== 'calculator' && (
        <Header
          lang={lang}
          onToggleLang={() => setLang(lang === 'en' ? 'ur' : 'en')}
          userEmail={userEmail}
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
          isDashboard={activeTab === 'home'}
          showTopMenuExternal={showTopMenu}
          onOpenTopMenu={() => {
            window.history.pushState({ modal: true }, '');
            setShowTopMenu(true);
          }}
          onCloseTopMenu={() => setShowTopMenu(false)}
          onOpenBiltyAccess={() => setShowBiltyAccessModal(true)}
        />
      )}

      {activeTab !== 'home' && activeTab !== 'calculator' && (
        <Navigation
          activeTab={activeTab}
          onSelectTab={handleNavigate}
          lang={lang}
          isBiltyAuthorized={isBiltyAuthorized}
        />
      )}

      <main className="flex-1 flex flex-col w-full">
        {activeTab === 'home' && (
          <HomeView
            lang={lang}
            trips={trips}
            vehicles={vehicles}
            drivers={drivers}
            bilties={bilties}
            userRole={role}
            userEmail={userEmail}
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
          />
        )}

        {activeTab === 'calculator' && (
          <TripCostView
            lang={lang}
            trips={trips}
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
            onDeleteVehicle={handleDeleteVehicle}
            onSelectMileage={handleSelectMileage}
          />
        )}

        {activeTab === 'drivers' && (
          <DriversView
            lang={lang}
            drivers={drivers}
            onAddDriver={handleAddDriver}
            onDeleteDriver={handleDeleteDriver}
          />
        )}

        {activeTab === 'routes' && (
          <RoutesView
            lang={lang}
            routes={routes}
            onAddRoute={handleAddRoute}
            onDeleteRoute={handleDeleteRoute}
            onApplyRoute={handleApplyRoute}
          />
        )}

        {activeTab === 'fuel' && (
          <FuelLogView
            lang={lang}
            fuelLogs={fuelLogs}
            onLogFuelPrice={handleLogFuelPrice}
          />
        )}

        {activeTab === 'verify' && (
          <VerifyView lang={lang} />
        )}

        {activeTab === 'bilty' && isBiltyAuthorized && (
          <BiltyView
            lang={lang}
            bilties={bilties}
            onAddBilty={handleAddBilty}
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
      </main>

      {activeTab !== 'calculator' && <Footer />}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        lang={lang}
      />

      <ManageBiltyAccessModal
        isOpen={showBiltyAccessModal}
        onClose={() => setShowBiltyAccessModal(false)}
        currentUserUid={currentUid}
        onUpdated={({ allowedUIDs, allowedEmails }) => {
          setBiltyAllowedUIDs(allowedUIDs);
          setBiltyAllowedEmails(allowedEmails);
        }}
        lang={lang}
      />

      <InstallPwaModal lang={lang} />

      {exitToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-[#4a4a35] text-white rounded-full text-xs font-bold shadow-xl border border-[#8b9d77] animate-bounce">
          {lang === 'ur' ? 'ایپ بند کرنے کے لئے دوبارہ بیک دبائیں' : 'Press back again within 2 seconds to exit app'}
        </div>
      )}
    </div>
  );
}
