import { BiltyRecord, ContactItem, Driver, FuelLogItem, RoutePreset, Trip, UserProfile, UserRole, Vehicle, AppNotification, OfflineAction, CompanyProfile, ActivityLogItem } from '../types';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, addDoc } from 'firebase/firestore';

const INITIAL_TRIPS: Trip[] = [
  {
    id: 101,
    name: "Lahore to Karachi (Sugar Load)",
    fuelType: "Diesel 🛢️",
    fuelTypeRaw: "diesel",
    dist: 1250,
    consumed: "138.89",
    fuelCost: 40278,
    toll: 4500,
    loading: 3500,
    driver: 5000,
    other: 1200,
    total: 54478,
    isReturn: false,
    date: "26 Oct, 2024",
    time: "08:30 AM",
    month: "Oct 24"
  },
  {
    id: 102,
    name: "Multan to Faisalabad (Cotton)",
    fuelType: "Diesel 🛢️",
    fuelTypeRaw: "diesel",
    dist: 240,
    consumed: "26.67",
    fuelCost: 7734,
    toll: 800,
    loading: 2000,
    driver: 2500,
    other: 0,
    total: 13034,
    isReturn: false,
    date: "25 Oct, 2024",
    time: "02:15 PM",
    month: "Oct 24"
  },
  {
    id: 103,
    name: "Rawalpindi to Gujranwala (Cement)",
    fuelType: "Diesel 🛢️",
    fuelTypeRaw: "diesel",
    dist: 210,
    consumed: "23.33",
    fuelCost: 6766,
    toll: 650,
    loading: 1500,
    driver: 2000,
    other: 500,
    total: 11416,
    isReturn: false,
    date: "23 Oct, 2024",
    time: "11:00 AM",
    month: "Oct 24"
  }
];

const INITIAL_VEHICLES: Vehicle[] = [
  { id: 1, reg: "LHR-7860", model: "Hino 500 Master", mileage: 9, owner: "Chaudhry Asad", capacity: 15 },
  { id: 2, reg: "MN-4321", model: "Isuzu FVR 34", mileage: 8.5, owner: "Haji Liaquat", capacity: 20 },
  { id: 3, reg: "FD-9988", model: "Master Forland", mileage: 11, owner: "Malik Usman", capacity: 7 }
];

const INITIAL_DRIVERS: Driver[] = [
  { id: 1, name: "Ustad Mukhtar Ahmed", phone: "3001234567", license: "PB-99214", lictype: "HTV", cnic: "35201-1234567-1" },
  { id: 2, name: "Shakir Ali Jutt", phone: "3219876543", license: "MN-44102", lictype: "HTV", cnic: "36302-9876543-3" },
  { id: 3, name: "Bilal Hussain", phone: "3334567890", license: "LHR-11029", lictype: "LTV", cnic: "35202-4567890-5" }
];

const INITIAL_ROUTES: RoutePreset[] = [
  { id: 1, from: "Lahore", to: "Karachi Port", dist: 1250, toll: 4800 },
  { id: 2, from: "Faisalabad", to: "Rawalpindi", dist: 285, toll: 950 },
  { id: 3, from: "Multan", to: "Lahore", dist: 340, toll: 1100 },
  { id: 4, from: "Sialkot", to: "Islamabad Dryport", dist: 230, toll: 750 }
];

const INITIAL_FUEL: FuelLogItem[] = [
  { id: 1, date: "26 Oct, 2024", diesel: 289.5, petrol: 279.0, cng: 220.0 },
  { id: 2, date: "15 Oct, 2024", diesel: 294.0, petrol: 281.5, cng: 220.0 },
  { id: 3, date: "01 Oct, 2024", diesel: 298.0, petrol: 285.0, cng: 215.0 }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    title: "⛽ Fuel Alert: OGRA Revision",
    message: "Diesel price revised to PKR 290/L effective midnight.",
    time: "10 mins ago",
    unread: true,
    type: "fuel"
  },
  {
    id: 2,
    title: "🚛 Fleet Maintenance",
    message: "LHR-7860 oil change due in 450 km.",
    time: "2 hours ago",
    unread: true,
    type: "fleet"
  },
  {
    id: 3,
    title: "🏛️ Excise Challan Check",
    message: "No pending E-Challans found on registered fleet.",
    time: "Yesterday",
    unread: false,
    type: "tax"
  }
];

// Helper to wrap Firestore promises with a short timeout so offline/slow connections fail fast to localStorage
function withTimeout<T>(promise: Promise<T>, timeoutMs = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore operation timed out (offline)')), timeoutMs)
    )
  ]);
}

// Firestore sync helper
async function syncToFirestore<T>(key: string, data: T) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return; // Skip cloud sync when device is offline
  }
  try {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid, 'collections', key);
      await withTimeout(setDoc(userDocRef, { items: data, updatedAt: new Date().toISOString() }, { merge: true }), 3000);
    }
  } catch (err) {
    // Graceful offline degradation
  }
}

export async function loadFromFirestore(uid: string) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return; // Skip network call when offline
  }
  const keys = ['trips', 'vehicles', 'drivers', 'routes', 'fuel', 'bilties'];
  for (const key of keys) {
    try {
      const docRef = doc(db, 'users', uid, 'collections', key);
      const snap = await withTimeout(getDoc(docRef), 2500);
      if (snap.exists() && snap.data()?.items) {
        localStorage.setItem(`ah-${key}`, JSON.stringify(snap.data().items));
      }
    } catch {
      // Graceful offline fallback
    }
  }
}

export function getStoredTrips(): Trip[] {
  try {
    const data = localStorage.getItem('ah-trips');
    return data ? JSON.parse(data) : INITIAL_TRIPS;
  } catch {
    return INITIAL_TRIPS;
  }
}
export function saveStoredTrips(trips: Trip[]) {
  localStorage.setItem('ah-trips', JSON.stringify(trips));
  syncToFirestore('trips', trips);
}

export function getStoredVehicles(): Vehicle[] {
  try {
    const data = localStorage.getItem('ah-vehicles');
    return data ? JSON.parse(data) : INITIAL_VEHICLES;
  } catch {
    return INITIAL_VEHICLES;
  }
}
export function saveStoredVehicles(vehicles: Vehicle[]) {
  localStorage.setItem('ah-vehicles', JSON.stringify(vehicles));
  syncToFirestore('vehicles', vehicles);
}

export function getStoredDrivers(): Driver[] {
  try {
    const data = localStorage.getItem('ah-drivers');
    return data ? JSON.parse(data) : INITIAL_DRIVERS;
  } catch {
    return INITIAL_DRIVERS;
  }
}
export function saveStoredDrivers(drivers: Driver[]) {
  localStorage.setItem('ah-drivers', JSON.stringify(drivers));
  syncToFirestore('drivers', drivers);
}

export function getStoredRoutes(): RoutePreset[] {
  try {
    const data = localStorage.getItem('ah-routes');
    return data ? JSON.parse(data) : INITIAL_ROUTES;
  } catch {
    return INITIAL_ROUTES;
  }
}
export function saveStoredRoutes(routes: RoutePreset[]) {
  localStorage.setItem('ah-routes', JSON.stringify(routes));
  syncToFirestore('routes', routes);
}

export function getStoredFuelLog(): FuelLogItem[] {
  try {
    const data = localStorage.getItem('ah-fuel');
    return data ? JSON.parse(data) : INITIAL_FUEL;
  } catch {
    return INITIAL_FUEL;
  }
}
export function saveStoredFuelLog(items: FuelLogItem[]) {
  localStorage.setItem('ah-fuel', JSON.stringify(items));
  syncToFirestore('fuel', items);
}

export function getStoredBilties(): BiltyRecord[] {
  try {
    const data = localStorage.getItem('ah-bilties');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
export function saveStoredBilties(bilties: BiltyRecord[]) {
  localStorage.setItem('ah-bilties', JSON.stringify(bilties));
  syncToFirestore('bilties', bilties);
}

export function getNextBiltyNo(): string {
  let no = parseInt(localStorage.getItem('ah-bilty-counter') || '0', 10);
  no += 1;
  localStorage.setItem('ah-bilty-counter', String(no));
  return 'AH-' + String(no).padStart(4, '0');
}

export function getStoredRole(): UserRole {
  return (localStorage.getItem('ah-user-role') as UserRole) || 'driver';
}
export function saveStoredRole(role: UserRole) {
  localStorage.setItem('ah-user-role', role);
}

export function getStoredOfflineQueue(): OfflineAction[] {
  try {
    const data = localStorage.getItem('ah-offline-queue');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
export function saveStoredOfflineQueue(queue: OfflineAction[]) {
  localStorage.setItem('ah-offline-queue', JSON.stringify(queue));
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const data = localStorage.getItem('ah-notifs');
    return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}
export function saveStoredNotifications(notifs: AppNotification[]) {
  localStorage.setItem('ah-notifs', JSON.stringify(notifs));
}

// User Profile & Bilty Access Management
export async function saveUserProfileInFirestore(profile: UserProfile) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }
  try {
    if (profile.uid) {
      const userRef = doc(db, 'users', profile.uid);
      await withTimeout(setDoc(userRef, {
        ...profile,
        lastLogin: new Date().toISOString()
      }, { merge: true }), 2500);
    }
  } catch {
    // Graceful offline fallback
  }
}

export interface BiltyAccessConfigData {
  allowedUIDs: string[];
  allowedEmails: string[];
}

export async function getBiltyAccessConfig(): Promise<BiltyAccessConfigData> {
  if (typeof navigator === 'undefined' || navigator.onLine) {
    try {
      const accessRef = doc(db, 'access', 'biltyAccess');
      const snap = await withTimeout(getDoc(accessRef), 2000);
      if (snap.exists()) {
        const data = snap.data();
        const allowedUIDs = Array.isArray(data?.allowedUIDs) ? data.allowedUIDs : [];
        const allowedEmails = Array.isArray(data?.allowedEmails) ? data.allowedEmails : [];
        if (allowedUIDs.length > 0 || allowedEmails.length > 0) {
          localStorage.setItem('ah-bilty-allowed-uids', JSON.stringify(allowedUIDs));
          localStorage.setItem('ah-bilty-allowed-emails', JSON.stringify(allowedEmails));
          return { allowedUIDs, allowedEmails };
        }
      }
    } catch {
      // Fall through to localStorage
    }
  }
  try {
    const cachedUIDs = localStorage.getItem('ah-bilty-allowed-uids');
    const cachedEmails = localStorage.getItem('ah-bilty-allowed-emails');
    return {
      allowedUIDs: cachedUIDs ? JSON.parse(cachedUIDs) : [],
      allowedEmails: cachedEmails ? JSON.parse(cachedEmails) : []
    };
  } catch {
    return { allowedUIDs: [], allowedEmails: [] };
  }
}

export async function updateBiltyAccessInFirestore(allowedUIDs: string[], allowedEmails: string[] = []) {
  try {
    localStorage.setItem('ah-bilty-allowed-uids', JSON.stringify(allowedUIDs));
    localStorage.setItem('ah-bilty-allowed-emails', JSON.stringify(allowedEmails));
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      const accessRef = doc(db, 'access', 'biltyAccess');
      await withTimeout(setDoc(accessRef, { allowedUIDs, allowedEmails, updatedAt: new Date().toISOString() }, { merge: true }), 3000);
    }
  } catch {
    // LocalStorage already updated successfully
  }
}

// Customer & Driver Contacts + CSV Exporter
export function getContactList(): ContactItem[] {
  const bilties = getStoredBilties();
  const drivers = getStoredDrivers();
  const map = new Map<string, ContactItem>();

  drivers.forEach(d => {
    if (d.name) {
      const key = d.name.toLowerCase().trim();
      map.set(key, {
        name: d.name,
        phone: d.phone || '',
        type: 'Driver',
        lastUsed: 'Active'
      });
    }
  });

  bilties.forEach(b => {
    const items = [
      { name: b.senderName, phone: b.senderMobile, type: 'Customer' as const, date: b.date },
      { name: b.receiverName, phone: b.receiverMobile, type: 'Customer' as const, date: b.date },
      { name: b.consignor, phone: b.senderMobile, type: 'Customer' as const, date: b.date },
      { name: b.consignee, phone: b.receiverMobile, type: 'Customer' as const, date: b.date },
      { name: b.driverName, phone: b.mobileNo, type: 'Driver' as const, date: b.date }
    ];

    items.forEach(item => {
      if (item.name && item.name.trim().length > 1) {
        const key = item.name.toLowerCase().trim();
        const existing = map.get(key);
        if (!existing) {
          map.set(key, {
            name: item.name.trim(),
            phone: item.phone || '',
            type: item.type,
            lastUsed: item.date || 'Recent'
          });
        } else if (item.phone && !existing.phone) {
          existing.phone = item.phone;
        }
      }
    });
  });

  return Array.from(map.values());
}

export function exportContactsCSV() {
  const contacts = getContactList();
  if (contacts.length === 0) {
    alert("No contact records available to export.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
  csvContent += "Name,Phone Number,Type,Last Used Date\n";

  contacts.forEach(c => {
    const nameSanitized = `"${c.name.replace(/"/g, '""')}"`;
    const phoneSanitized = `"${c.phone.replace(/"/g, '""')}"`;
    const typeSanitized = `"${c.type}"`;
    const dateSanitized = `"${c.lastUsed}"`;
    csvContent += `${nameSanitized},${phoneSanitized},${typeSanitized},${dateSanitized}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Warraich_Goods_Contacts_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// -------------------------------------------------------------
// Company Profile & Settings Management
// -------------------------------------------------------------
export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  nameUr: "وڑائچ گڈز ٹرانسپورٹ کمپنی (رجسٹرڈ)",
  nameEn: "Warraich Goods Transport Co.",
  ownerName: "زاہدان نصر وڑائچ",
  phoneNumbers: "0300-5370443, 0339-5370443",
  headOfficeUr: "سمندری، فیصل آباد، پنجاب، پاکستان",
  headOfficeEn: "Samundri, Faisalabad, Punjab, Pakistan",
  ntn: "7779394-1",
  taglineUr: "ملک بھر میں ہر قسم کے سامان کی محفوظ اور قابل اعتماد ٹرانسپورٹ سروس"
};

export async function getStoredCompanyProfile(): Promise<CompanyProfile> {
  const cached = localStorage.getItem('ah-company-profile');
  let profile = cached ? JSON.parse(cached) : DEFAULT_COMPANY_PROFILE;

  if (typeof navigator === 'undefined' || navigator.onLine) {
    try {
      const docRef = doc(db, 'settings', 'companyProfile');
      const snap = await withTimeout(getDoc(docRef), 2000);
      if (snap.exists()) {
        profile = { ...DEFAULT_COMPANY_PROFILE, ...snap.data() };
        localStorage.setItem('ah-company-profile', JSON.stringify(profile));
      }
    } catch {
      // Return cached/default on network fail
    }
  }
  return profile;
}

export function getCachedCompanyProfile(): CompanyProfile {
  try {
    const cached = localStorage.getItem('ah-company-profile');
    return cached ? { ...DEFAULT_COMPANY_PROFILE, ...JSON.parse(cached) } : DEFAULT_COMPANY_PROFILE;
  } catch {
    return DEFAULT_COMPANY_PROFILE;
  }
}

export async function saveCompanyProfileInFirestore(profile: CompanyProfile) {
  const updatedProfile: CompanyProfile = {
    ...profile,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem('ah-company-profile', JSON.stringify(updatedProfile));
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const docRef = doc(db, 'settings', 'companyProfile');
      await withTimeout(setDoc(docRef, updatedProfile, { merge: true }), 3000);
    } catch (err) {
      console.warn("Failed saving company profile to Firestore:", err);
    }
  }
  await logActivity(
    'Company Profile Updated',
    `Profile details updated for ${profile.nameUr || profile.nameEn}`,
    'settings'
  );
}

// -------------------------------------------------------------
// System Activity Log
// -------------------------------------------------------------
export async function logActivity(
  action: string,
  details: string,
  category: 'auth' | 'bilty' | 'settings' | 'fleet' | 'export' = 'bilty'
) {
  const user = auth.currentUser;
  const newLog: ActivityLogItem = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    uid: user?.uid || 'anonymous',
    email: user?.email || localStorage.getItem('ah-gmail-user') || 'system',
    action,
    details,
    category
  };

  // Local storage recent buffer
  try {
    const localLogsStr = localStorage.getItem('ah-activity-logs');
    const localLogs: ActivityLogItem[] = localLogsStr ? JSON.parse(localLogsStr) : [];
    const updated = [newLog, ...localLogs].slice(0, 100);
    localStorage.setItem('ah-activity-logs', JSON.stringify(updated));
  } catch {
    // Ignore local buffer error
  }

  // Firestore sync
  if (typeof navigator !== 'undefined' && navigator.onLine && user) {
    try {
      const logCol = collection(db, 'activityLog');
      await withTimeout(addDoc(logCol, newLog), 2000);
    } catch {
      // Offline fallback
    }
  }
}

export async function getActivityLogs(): Promise<ActivityLogItem[]> {
  const localLogsStr = localStorage.getItem('ah-activity-logs');
  let logs: ActivityLogItem[] = localLogsStr ? JSON.parse(localLogsStr) : [];

  if (typeof navigator === 'undefined' || navigator.onLine) {
    try {
      const logCol = collection(db, 'activityLog');
      const snap = await withTimeout(getDocs(logCol), 2500);
      const remoteLogs: ActivityLogItem[] = [];
      snap.forEach(d => {
        const item = d.data() as ActivityLogItem;
        if (item && item.action) {
          remoteLogs.push({ ...item, id: item.id || d.id });
        }
      });
      if (remoteLogs.length > 0) {
        // Sort descending by timestamp
        remoteLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        logs = remoteLogs.slice(0, 100);
        localStorage.setItem('ah-activity-logs', JSON.stringify(logs));
      }
    } catch {
      // Fallback to local
    }
  }
  return logs;
}

// -------------------------------------------------------------
// Complete Business Data Exporters (JSON & CSV)
// -------------------------------------------------------------
export function exportAllBusinessDataJSON() {
  const data = {
    exportDate: new Date().toISOString(),
    company: getCachedCompanyProfile(),
    bilties: getStoredBilties(),
    trips: getStoredTrips(),
    vehicles: getStoredVehicles(),
    drivers: getStoredDrivers(),
    routes: getStoredRoutes(),
    fuelLogs: getStoredFuelLog(),
    contacts: getContactList()
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Warraich_Goods_FullBackup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  logActivity('Data Backup Exported', 'Full JSON backup downloaded', 'export');
}

export function exportAllBiltiesCSV() {
  const bilties = getStoredBilties();
  if (bilties.length === 0) {
    alert("No bilty records found to export.");
    return;
  }

  let csv = "data:text/csv;charset=utf-8,\uFEFF";
  csv += "Bilty No,Date,Vehicle No,Driver Name,Mobile,Sender (Consignor),Sender Mobile,Receiver (Consignee),Receiver Mobile,From City,To City,Item,Qty,Weight,Total Freight,Advance,Payable\n";

  bilties.forEach(b => {
    const row = [
      b.biltyNo,
      b.date || '',
      b.vehicleNo || '',
      b.driverName || '',
      b.mobileNo || '',
      b.senderName || b.consignor || '',
      b.senderMobile || '',
      b.receiverName || b.consignee || '',
      b.receiverMobile || '',
      b.sendingCity || '',
      b.receivingCity || '',
      b.itemDescription || '',
      b.qty || '',
      b.weight || '',
      b.total || 0,
      b.advance || 0,
      b.payable || 0
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
    csv += row + "\n";
  });

  const encodedUri = encodeURI(csv);
  const link = document.createElement("a");
  link.href = encodedUri;
  link.download = `Warraich_Goods_Bilties_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  logActivity('Bilties CSV Exported', `${bilties.length} bilty records exported as CSV`, 'export');
}

export function exportAllTripsCSV() {
  const trips = getStoredTrips();
  if (trips.length === 0) {
    alert("No trip records found to export.");
    return;
  }

  let csv = "data:text/csv;charset=utf-8,\uFEFF";
  csv += "Trip ID,Trip Name,Date,Month,Distance (km),Fuel Type,Fuel Cost,Tolls,Loading,Driver Kharcha,Other,Total Expense\n";

  trips.forEach(t => {
    const row = [
      t.id,
      t.name,
      t.date,
      t.month,
      t.dist,
      t.fuelType,
      t.fuelCost,
      t.toll,
      t.loading,
      t.driver,
      t.other,
      t.total
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
    csv += row + "\n";
  });

  const encodedUri = encodeURI(csv);
  const link = document.createElement("a");
  link.href = encodedUri;
  link.download = `Warraich_Goods_Trips_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  logActivity('Trips CSV Exported', `${trips.length} trip records exported as CSV`, 'export');
}


