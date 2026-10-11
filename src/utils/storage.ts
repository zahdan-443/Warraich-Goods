const MAX_OFFLINE_RETRIES = 10;
const MAX_OFFLINE_QUEUE_ITEMS = 200;

function describeSyncFailure(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Unknown sync error';
  }
}

function sanitizeQueuedAction(action: OfflineAction): OfflineAction {
  const retryCount = Number.isFinite(action.retryCount) ? Math.max(0, Number(action.retryCount)) : 0;
  return {
    ...action,
    id: action.id ?? `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: action.timestamp || new Date().toISOString(),
    retryCount
  };
}

export function enqueueOfflineAction(type: OfflineAction['type'], data: any) {
  try {
    const queue = getStoredOfflineQueue();
    const newAction: OfflineAction = sanitizeQueuedAction({
      id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    });
    const filtered = queue.filter(item => !(item.type === type && JSON.stringify(item.data) === JSON.stringify(data)));
    const updated = [newAction, ...filtered].slice(0, MAX_OFFLINE_QUEUE_ITEMS);
    saveStoredOfflineQueue(updated);
  } catch (e) {
    console.warn('Error enqueuing offline action:', e);
  }
}

// Helper to wrap Firestore promises with a short timeout so offline/slow connections fail fast to localStorage
export function withTimeout<T>(promise: Promise<T>, timeoutMs = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore operation timed out (offline)')), timeoutMs)
    )
  ]);
}

// Real Firestore sync helper with automatic offline fallback
export async function syncToFirestore<T>(key: string, data: T): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    enqueueOfflineAction(key as any, data);
    return false;
  }
  try {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid, 'collections', key);
      await withTimeout(setDoc(userDocRef, { items: data, updatedAt: new Date().toISOString() }, { merge: true }), 3000);
      return true;
    }
    return false;
  } catch {
    enqueueOfflineAction(key as any, data);
    return false;
  }
}

/**
 * Genuine Offline Queue Processor & Retry Mechanism
 * Processes all pending local actions and pushes them to Firestore when network is available.
 */
export async function processOfflineQueue(): Promise<{ processed: number; remaining: number; errors: string[] }> {
  const queue = getStoredOfflineQueue();
  if (queue.length === 0) {
    return { processed: 0, remaining: 0, errors: [] };
  }

  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline) {
    return { processed: 0, remaining: queue.length, errors: ['Device is offline'] };
  }

  const user = auth.currentUser;
  const remainingQueue: OfflineAction[] = [];
  let processedCount = 0;
  const errorLogs: string[] = [];

  for (const action of queue) {
    const normalizedAction = sanitizeQueuedAction(action);
    try {
      if (user && normalizedAction.type) {
        if (normalizedAction.type === 'bilty' && Array.isArray(normalizedAction.data)) {
          const userDocRef = doc(db, 'users', user.uid, 'collections', 'bilties');
          await withTimeout(setDoc(userDocRef, { items: normalizedAction.data, updatedAt: new Date().toISOString() }, { merge: true }), 3000);
          for (const b of normalizedAction.data) {
            if (b?.biltyNo) {
              const safeData = extractPublicBiltyVerification(b);
              const normalizedNo = String(b.biltyNo).trim().toUpperCase();
              const pubRef = doc(db, 'bilties', normalizedNo);
              await withTimeout(setDoc(pubRef, safeData, { merge: true }), 3000).catch(() => {});
            }
          }
          processedCount++;
        } else if (normalizedAction.type === 'public_bilty' && normalizedAction.data?.biltyNo) {
          const normalizedNo = String(normalizedAction.data.biltyNo).trim().toUpperCase();
          const pubRef = doc(db, 'bilties', normalizedNo);
          await withTimeout(setDoc(pubRef, normalizedAction.data, { merge: true }), 3000);
          processedCount++;
        } else if (['trip', 'trips', 'vehicle', 'vehicles', 'driver', 'drivers', 'fuel', 'routes'].includes(normalizedAction.type)) {
          const collectionName = normalizedAction.type.endsWith('s') ? normalizedAction.type : `${normalizedAction.type}s`;
          const actualKey = collectionName === 'fuels' ? 'fuel' : collectionName;
          const userDocRef = doc(db, 'users', user.uid, 'collections', actualKey);
          await withTimeout(setDoc(userDocRef, { items: normalizedAction.data, updatedAt: new Date().toISOString() }, { merge: true }), 3000);
          processedCount++;
        } else if (normalizedAction.type === 'settings') {
          const docRef = doc(db, 'settings', 'companyProfile');
          await withTimeout(setDoc(docRef, normalizedAction.data, { merge: true }), 3000);
          processedCount++;
        } else if (normalizedAction.type === 'pod_confirmation' && normalizedAction.data?.biltyNo) {
          const normalizedNo = String(normalizedAction.data.biltyNo).trim().toUpperCase();
          const pubRef = doc(db, 'bilties', normalizedNo);
          await withTimeout(setDoc(pubRef, normalizedAction.data, { merge: true }), 3000);
          processedCount++;
        } else {
          processedCount++;
        }
      } else if (normalizedAction.type === 'public_bilty' && normalizedAction.data?.biltyNo) {
        const normalizedNo = String(normalizedAction.data.biltyNo).trim().toUpperCase();
        const pubRef = doc(db, 'bilties', normalizedNo);
        await withTimeout(setDoc(pubRef, normalizedAction.data, { merge: true }), 3000);
        processedCount++;
      } else if (normalizedAction.type === 'pod_confirmation' && normalizedAction.data?.biltyNo) {
        const normalizedNo = String(normalizedAction.data.biltyNo).trim().toUpperCase();
        const pubRef = doc(db, 'bilties', normalizedNo);
        await withTimeout(setDoc(pubRef, normalizedAction.data, { merge: true }), 3000);
        processedCount++;
      } else {
        remainingQueue.push(normalizedAction);
      }
    } catch (err) {
      const retry = (normalizedAction.retryCount || 0) + 1;
      const errorMessage = `Action ${normalizedAction.id} failed (attempt ${retry}): ${describeSyncFailure(err)}`;
      errorLogs.push(errorMessage);
      logError('Offline Queue Sync', errorMessage, { actionId: normalizedAction.id, type: normalizedAction.type });
      if (retry <= MAX_OFFLINE_RETRIES) {
        remainingQueue.push({ ...normalizedAction, retryCount: retry });
      }
    }
  }

  const finalQueue = remainingQueue.slice(0, MAX_OFFLINE_QUEUE_ITEMS);
  saveStoredOfflineQueue(finalQueue);

  if (errorLogs.length > 0) {
    safeStorage.setItem('ah-last-sync-error', errorLogs[0]);
  } else {
    safeStorage.removeItem('ah-last-sync-error');
  }

  return { processed: processedCount, remaining: finalQueue.length, errors: errorLogs };
}

export function restoreFullBackupFromJson(jsonString: string): { success: boolean; message: string; count: number } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid backup file format', count: 0 };
    }

    let restoredCount = 0;

    if (Array.isArray(data.bilties) && data.bilties.length > 0) {
      const existing = getStoredBilties();
      const map = new Map<string, BiltyRecord>();
      existing.forEach((b) => { if (b.biltyNo) map.set(b.biltyNo, b); });
      data.bilties.forEach((b: BiltyRecord) => {
        if (b?.biltyNo) {
          map.set(b.biltyNo, b);
          restoredCount++;
        }
      });
      const merged = Array.from(map.values());
      setScopedItem('bilties', JSON.stringify(merged));
      saveStoredBilties(merged);
    }

    if (Array.isArray(data.trips) && data.trips.length > 0) {
      const trips = data.trips as Trip[];
      setScopedItem('trips', JSON.stringify(trips));
      saveStoredTrips(trips);
    }

    if (Array.isArray(data.vehicles) && data.vehicles.length > 0) {
      const vehicles = data.vehicles as Vehicle[];
      setScopedItem('vehicles', JSON.stringify(vehicles));
      saveStoredVehicles(vehicles);
    }

    if (Array.isArray(data.drivers) && data.drivers.length > 0) {
      const drivers = data.drivers as Driver[];
      setScopedItem('drivers', JSON.stringify(drivers));
      saveStoredDrivers(drivers);
    }

    if (Array.isArray(data.routes) && data.routes.length > 0) {
      const routes = data.routes as RoutePreset[];
      setScopedItem('routes', JSON.stringify(routes));
      saveStoredRoutes(routes);
    }

    if (Array.isArray(data.fuelLogs) && data.fuelLogs.length > 0) {
      const fuelLogs = data.fuelLogs as FuelLogItem[];
      setScopedItem('fuel', JSON.stringify(fuelLogs));
      saveStoredFuelLog(fuelLogs);
    }

    if (data.company) {
      safeStorage.setItem('ah-company-profile', JSON.stringify(data.company));
    }

    logActivity('Backup Restored', `Restored ${restoredCount} bilty records from backup`, 'settings');
    return { success: true, message: 'Backup successfully restored!', count: restoredCount };
  } catch (err: any) {
    const message = err instanceof Error ? err.message : 'Failed to restore backup';
    logError('Backup Restore Failure', message, { source: 'restoreFullBackupFromJson' });
    return { success: false, message, count: 0 };
  }
}

export function getStoredRole(): UserRole {
  return (getScopedItem('user-role') as UserRole) || 'driver';
}
export function saveStoredRole(role: UserRole) {
  setScopedItem('user-role', role);
}

export function getStoredOfflineQueue(): OfflineAction[] {
  try {
    const data = getScopedItem('offline-queue');
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.map((item: OfflineAction) => sanitizeQueuedAction(item)) : [];
  } catch {
    return [];
  }
}
export function saveStoredOfflineQueue(queue: OfflineAction[]) {
  const sanitized = (Array.isArray(queue) ? queue : []).map((item) => sanitizeQueuedAction(item)).slice(0, MAX_OFFLINE_QUEUE_ITEMS);
  setScopedItem('offline-queue', JSON.stringify(sanitized));
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const data = getScopedItem('notifs');
    return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}
export function saveStoredNotifications(notifs: AppNotification[]) {
  setScopedItem('notifs', JSON.stringify(notifs));
}

export async function triggerManualSync(): Promise<{ success: boolean; processed: number; remaining: number; errors: string[] }> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline) {
    return { success: false, processed: 0, remaining: getStoredOfflineQueue().length, errors: ['Device is currently offline'] };
  }

  try {
    const result = await processOfflineQueue();
    safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
    if (result.errors.length > 0) {
      safeStorage.setItem('ah-last-sync-error', result.errors[0]);
    } else {
      safeStorage.removeItem('ah-last-sync-error');
    }
    await logActivity('Manual Sync Triggered', `Processed ${result.processed} actions, ${result.remaining} remaining`, 'sync');
    return {
      success: result.errors.length === 0,
      processed: result.processed,
      remaining: result.remaining,
      errors: result.errors
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logError('Manual Sync Failure', errorMsg);
    safeStorage.setItem('ah-last-sync-error', errorMsg);
    return {
      success: false,
      processed: 0,
      remaining: getStoredOfflineQueue().length,
      errors: [errorMsg]
    };
  }
}

export function getSyncStatus(): SyncStatusState {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const queue = getStoredOfflineQueue();
  const lastSyncTime = safeStorage.getItem('ah-last-sync-time');
  const lastError = safeStorage.getItem('ah-last-sync-error');
  const errorLogs = getErrorLogs();

  let status: SyncStatusState['status'] = 'synced';
  if (!isOnline) {
    status = 'offline';
  } else if (queue.length > 0) {
    status = 'syncing';
  } else if (lastError) {
    status = 'error';
  }

  return {
    status,
    pendingCount: queue.length,
    lastSyncTime,
    lastError,
    errorsList: errorLogs.map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      message: `${e.action}: ${e.error}`
    }))
  };
}

export function allocateNextBiltyNumber(userUid?: string): Promise<string> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;

  if (isOnline && db) {
    try {
      const counterDocRef = doc(db, 'counters', 'biltyCounter');
      const nextSeq = await withTimeout(
        runTransaction(db, async (transaction) => {
          const snap = await transaction.get(counterDocRef);
          let current = 0;
          if (snap.exists()) {
            const d = snap.data();
            current = typeof d?.currentValue === 'number' ? d.currentValue : 0;
          }
          const next = current + 1;
          transaction.set(counterDocRef, {
            currentValue: next,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          return next;
        }),
        3000
      );

      setScopedItem('bilty-counter', String(nextSeq));
      return 'AH-' + String(nextSeq).padStart(4, '0');
    } catch {
      // Fall through to atomic local increment on transaction timeout or offline
    }
  }

  const bilties = getStoredBilties();
  let maxExisting = 0;
  bilties.forEach(b => {
    const numPart = parseInt((b.biltyNo || '').replace(/\D/g, ''), 10);
    if (!isNaN(numPart) && numPart > maxExisting) {
      maxExisting = numPart;
    }
  });

  const storedCounterStr = getScopedItem('bilty-counter');
  let currentCounter = storedCounterStr ? parseInt(storedCounterStr, 10) : 0;
  if (isNaN(currentCounter)) currentCounter = 0;

  const nextLocalSeq = Math.max(maxExisting, currentCounter) + 1;
  setScopedItem('bilty-counter', String(nextLocalSeq));

  enqueueOfflineAction('bilty' as any, { localCounter: nextLocalSeq, generatedAt: new Date().toISOString() });

  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randSuffix = '';
  for (let i = 0; i < 4; i++) {
    randSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `AH-${String(nextLocalSeq).padStart(4, '0')}-OFF-${randSuffix}`;
}

export function getNextBiltyNo(): string {
  const bilties = getStoredBilties();
  let maxExisting = 0;
  bilties.forEach(b => {
    const numPart = parseInt((b.biltyNo || '').replace(/\D/g, ''), 10);
    if (!isNaN(numPart) && numPart > maxExisting) {
      maxExisting = numPart;
    }
  });

  let no = parseInt(getScopedItem('bilty-counter') || '0', 10);
  no = Math.max(maxExisting, isNaN(no) ? 0 : no) + 1;
  setScopedItem('bilty-counter', String(no));
  return 'AH-' + String(no).padStart(4, '0');
}

export function getStoredRole(): UserRole {
  return (getScopedItem('user-role') as UserRole) || 'driver';
}
export function saveStoredRole(role: UserRole) {
  setScopedItem('user-role', role);
}

export function getStoredOfflineQueue(): OfflineAction[] {
  try {
    const data = getScopedItem('offline-queue');
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.map((item: OfflineAction) => sanitizeQueuedAction(item)) : [];
  } catch {
    return [];
  }
}
export function saveStoredOfflineQueue(queue: OfflineAction[]) {
  const sanitized = (Array.isArray(queue) ? queue : []).map((item) => sanitizeQueuedAction(item)).slice(0, MAX_OFFLINE_QUEUE_ITEMS);
  setScopedItem('offline-queue', JSON.stringify(sanitized));
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const data = getScopedItem('notifs');
    return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}
export function saveStoredNotifications(notifs: AppNotification[]) {
  setScopedItem('notifs', JSON.stringify(notifs));
}

export async function triggerManualSync(): Promise<{ success: boolean; processed: number; remaining: number; errors: string[] }> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline) {
    return { success: false, processed: 0, remaining: getStoredOfflineQueue().length, errors: ['Device is currently offline'] };
  }

  try {
    const result = await processOfflineQueue();
    safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
    if (result.errors.length > 0) {
      safeStorage.setItem('ah-last-sync-error', result.errors[0]);
    } else {
      safeStorage.removeItem('ah-last-sync-error');
    }
    await logActivity('Manual Sync Triggered', `Processed ${result.processed} actions, ${result.remaining} remaining`, 'sync');
    return {
      success: result.errors.length === 0,
      processed: result.processed,
      remaining: result.remaining,
      errors: result.errors
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logError('Manual Sync Failure', errorMsg);
    safeStorage.setItem('ah-last-sync-error', errorMsg);
    return {
      success: false,
      processed: 0,
      remaining: getStoredOfflineQueue().length,
      errors: [errorMsg]
    };
  }
}

export function getSyncStatus(): SyncStatusState {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const queue = getStoredOfflineQueue();
  const lastSyncTime = safeStorage.getItem('ah-last-sync-time');
  const lastError = safeStorage.getItem('ah-last-sync-error');
  const errorLogs = getErrorLogs();

  let status: SyncStatusState['status'] = 'synced';
  if (!isOnline) {
    status = 'offline';
  } else if (queue.length > 0) {
    status = 'syncing';
  } else if (lastError) {
    status = 'error';
  }

  return {
    status,
    pendingCount: queue.length,
    lastSyncTime,
    lastError,
    errorsList: errorLogs.map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      message: `${e.action}: ${e.error}`
    }))
  };
}

export function restoreFullBackupFromJson(jsonString: string): { success: boolean; message: string; count: number } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid backup file format', count: 0 };
    }

    let restoredCount = 0;

    if (Array.isArray(data.bilties) && data.bilties.length > 0) {
      const existing = getStoredBilties();
      const map = new Map<string, BiltyRecord>();
      existing.forEach((b) => { if (b.biltyNo) map.set(b.biltyNo, b); });
      data.bilties.forEach((b: BiltyRecord) => {
        if (b?.biltyNo) {
          map.set(b.biltyNo, b);
          restoredCount++;
        }
      });
      const merged = Array.from(map.values());
      setScopedItem('bilties', JSON.stringify(merged));
      saveStoredBilties(merged);
    }

    if (Array.isArray(data.trips) && data.trips.length > 0) {
      const trips = data.trips as Trip[];
      setScopedItem('trips', JSON.stringify(trips));
      saveStoredTrips(trips);
    }

    if (Array.isArray(data.vehicles) && data.vehicles.length > 0) {
      const vehicles = data.vehicles as Vehicle[];
      setScopedItem('vehicles', JSON.stringify(vehicles));
      saveStoredVehicles(vehicles);
    }

    if (Array.isArray(data.drivers) && data.drivers.length > 0) {
      const drivers = data.drivers as Driver[];
      setScopedItem('drivers', JSON.stringify(drivers));
      saveStoredDrivers(drivers);
    }

    if (Array.isArray(data.routes) && data.routes.length > 0) {
      const routes = data.routes as RoutePreset[];
      setScopedItem('routes', JSON.stringify(routes));
      saveStoredRoutes(routes);
    }

    if (Array.isArray(data.fuelLogs) && data.fuelLogs.length > 0) {
      const fuelLogs = data.fuelLogs as FuelLogItem[];
      setScopedItem('fuel', JSON.stringify(fuelLogs));
      saveStoredFuelLog(fuelLogs);
    }

    if (data.company) {
      safeStorage.setItem('ah-company-profile', JSON.stringify(data.company));
    }

    logActivity('Backup Restored', `Restored ${restoredCount} bilty records from backup`, 'settings');
    return { success: true, message: 'Backup successfully restored!', count: restoredCount };
  } catch (err: any) {
    const message = err instanceof Error ? err.message : 'Failed to restore backup';
    logError('Backup Restore Failure', message, { source: 'restoreFullBackupFromJson' });
    return { success: false, message, count: 0 };
  }
}

export function getLocalRegisteredUsers(): UserProfile[] {
  try {
    const raw = safeStorage.getItem('ah-registered-users-list');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalRegisteredUsers(users: UserProfile[]) {
  try {
    safeStorage.setItem('ah-registered-users-list', JSON.stringify(users));
  } catch {
    // ignore
  }
}

export async function saveUserProfileInFirestore(profile: UserProfile) {
  try {
    const existing = getLocalRegisteredUsers();
    const cleanEmail = (profile.email || '').toLowerCase().trim();
    const filtered = existing.filter(u =>
      (u.email && cleanEmail && u.email.toLowerCase().trim() !== cleanEmail) &&
      (u.uid !== profile.uid)
    );
    const updated: UserProfile = {
      ...profile,
      email: cleanEmail || profile.email,
      lastLogin: profile.lastLogin || new Date().toISOString()
    };
    filtered.unshift(updated);
    saveLocalRegisteredUsers(filtered);
  } catch (err) {
    console.warn('Error caching user locally:', err);
  }

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const userKey = profile.uid || (profile.email ? profile.email.replace(/[.@]/g, '_') : `user_${Date.now()}`);
      const userRef = doc(db, 'users', userKey);
      await withTimeout(setDoc(userRef, {
        ...profile,
        lastLogin: new Date().toISOString()
      }, { merge: true }), 2500);
    } catch {
      // Graceful offline fallback
    }
  }
}

export async function getAllRegisteredUsers(): Promise<UserProfile[]> {
  const localUsers = getLocalRegisteredUsers();
  const userMap = new Map<string, UserProfile>();

  userMap.set('warraichgoods43@gmail.com', {
    uid: 'owner_uid_warraich',
    name: 'زاہدان نصر وڑائچ (آنر)',
    email: 'warraichgoods43@gmail.com',
    role: 'owner',
    lastLogin: new Date().toISOString()
  });

  localUsers.forEach(u => {
    const key = (u.email || u.uid || '').toLowerCase().trim();
    if (key) {
      userMap.set(key, u);
    }
  });

  if (typeof navigator === 'undefined' || navigator.onLine) {
    try {
      const usersRef = collection(db, 'users');
      const snap = await Promise.race([
        getDocs(usersRef),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500))
      ]);
      snap.forEach(docSnap => {
        const data = docSnap.data();
        if (data && (data.uid || data.email)) {
          const email = (data.email || '').toLowerCase().trim();
          const key = email || data.uid;
          if (key) {
            userMap.set(key, {
              uid: data.uid || key,
              name: data.name || email || 'User',
              email: email,
              role: data.role || 'driver',
              lastLogin: data.lastLogin
            });
          }
        }
      });
    } catch {
      // Offline fallback
    }
  }

  const cachedEmailsStr = getScopedItem('bilty-allowed-emails');
  if (cachedEmailsStr) {
    try {
      const emails: string[] = JSON.parse(cachedEmailsStr);
      emails.forEach(e => {
        const clean = e.toLowerCase().trim();
        if (clean && !userMap.has(clean)) {
          userMap.set(clean, {
            uid: `email_${clean.replace(/[^a-zA-Z0-9]/g, '_')}`,
            name: clean.split('@')[0],
            email: clean,
            role: 'driver'
          });
        }
      });
    } catch {
      // ignore
    }
  }

  const list = Array.from(userMap.values());
  saveLocalRegisteredUsers(list);
  return list;
}

export async function updateBiltyAccessInFirestore(allowedUIDs: string[], allowedEmails: string[] = []) {
  const cleanUIDs = Array.from(new Set(allowedUIDs.filter(Boolean)));
  const cleanEmails = Array.from(new Set(allowedEmails.filter(Boolean).map(e => e.toLowerCase().trim())));

  try {
    setScopedItem('bilty-allowed-uids', JSON.stringify(cleanUIDs));
    setScopedItem('bilty-allowed-emails', JSON.stringify(cleanEmails));
    safeStorage.setItem('wg_global_bilty_allowed_uids', JSON.stringify(cleanUIDs));
    safeStorage.setItem('wg_global_bilty_allowed_emails', JSON.stringify(cleanEmails));
    safeStorage.setItem('ah-bilty-allowed-emails', JSON.stringify(cleanEmails));
    safeStorage.setItem('ah-bilty-allowed-uids', JSON.stringify(cleanUIDs));
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      const accessRef = doc(db, 'access', 'biltyAccess');
      await withTimeout(setDoc(accessRef, { 
        allowedUIDs: cleanUIDs, 
        allowedEmails: cleanEmails, 
        updatedAt: new Date().toISOString() 
      }, { merge: true }), 3000);
    }
  } catch (err) {
    console.warn('Failed saving bilty access to firestore:', err);
  }
}

export function getStoredRole(): UserRole {
  return (getScopedItem('user-role') as UserRole) || 'driver';
}
export function saveStoredRole(role: UserRole) {
  setScopedItem('user-role', role);
}

export function getStoredOfflineQueue(): OfflineAction[] {
  try {
    const data = getScopedItem('offline-queue');
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.map((item: OfflineAction) => sanitizeQueuedAction(item)) : [];
  } catch {
    return [];
  }
}
export function saveStoredOfflineQueue(queue: OfflineAction[]) {
  const sanitized = (Array.isArray(queue) ? queue : []).map((item) => sanitizeQueuedAction(item)).slice(0, MAX_OFFLINE_QUEUE_ITEMS);
  setScopedItem('offline-queue', JSON.stringify(sanitized));
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const data = getScopedItem('notifs');
    return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}
export function saveStoredNotifications(notifs: AppNotification[]) {
  setScopedItem('notifs', JSON.stringify(notifs));
}

export async function triggerManualSync(): Promise<{ success: boolean; processed: number; remaining: number; errors: string[] }> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline) {
    return { success: false, processed: 0, remaining: getStoredOfflineQueue().length, errors: ['Device is currently offline'] };
  }

  try {
    const result = await processOfflineQueue();
    safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
    if (result.errors.length > 0) {
      safeStorage.setItem('ah-last-sync-error', result.errors[0]);
    } else {
      safeStorage.removeItem('ah-last-sync-error');
    }
    await logActivity('Manual Sync Triggered', `Processed ${result.processed} actions, ${result.remaining} remaining`, 'sync');
    return {
      success: result.errors.length === 0,
      processed: result.processed,
      remaining: result.remaining,
      errors: result.errors
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logError('Manual Sync Failure', errorMsg);
    safeStorage.setItem('ah-last-sync-error', errorMsg);
    return {
      success: false,
      processed: 0,
      remaining: getStoredOfflineQueue().length,
      errors: [errorMsg]
    };
  }
}

export function getSyncStatus(): SyncStatusState {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const queue = getStoredOfflineQueue();
  const lastSyncTime = safeStorage.getItem('ah-last-sync-time');
  const lastError = safeStorage.getItem('ah-last-sync-error');
  const errorLogs = getErrorLogs();

  let status: SyncStatusState['status'] = 'synced';
  if (!isOnline) {
    status = 'offline';
  } else if (queue.length > 0) {
    status = 'syncing';
  } else if (lastError) {
    status = 'error';
  }

  return {
    status,
    pendingCount: queue.length,
    lastSyncTime,
    lastError,
    errorsList: errorLogs.map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      message: `${e.action}: ${e.error}`
    }))
  };
}

export function getStoredRole(): UserRole {
  return (getScopedItem('user-role') as UserRole) || 'driver';
}
export function saveStoredRole(role: UserRole) {
  setScopedItem('user-role', role);
}

export function getStoredOfflineQueue(): OfflineAction[] {
  try {
    const data = getScopedItem('offline-queue');
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.map((item: OfflineAction) => sanitizeQueuedAction(item)) : [];
  } catch {
    return [];
  }
}
export function saveStoredOfflineQueue(queue: OfflineAction[]) {
  const sanitized = (Array.isArray(queue) ? queue : []).map((item) => sanitizeQueuedAction(item)).slice(0, MAX_OFFLINE_QUEUE_ITEMS);
  setScopedItem('offline-queue', JSON.stringify(sanitized));
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const data = getScopedItem('notifs');
    return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}
export function saveStoredNotifications(notifs: AppNotification[]) {
  setScopedItem('notifs', JSON.stringify(notifs));
}

export async function triggerManualSync(): Promise<{ success: boolean; processed: number; remaining: number; errors: string[] }> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline) {
    return { success: false, processed: 0, remaining: getStoredOfflineQueue().length, errors: ['Device is currently offline'] };
  }

  try {
    const result = await processOfflineQueue();
    safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
    if (result.errors.length > 0) {
      safeStorage.setItem('ah-last-sync-error', result.errors[0]);
    } else {
      safeStorage.removeItem('ah-last-sync-error');
    }
    await logActivity('Manual Sync Triggered', `Processed ${result.processed} actions, ${result.remaining} remaining`, 'sync');
    return {
      success: result.errors.length === 0,
      processed: result.processed,
      remaining: result.remaining,
      errors: result.errors
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logError('Manual Sync Failure', errorMsg);
    safeStorage.setItem('ah-last-sync-error', errorMsg);
    return {
      success: false,
      processed: 0,
      remaining: getStoredOfflineQueue().length,
      errors: [errorMsg]
    };
  }
}

export function getSyncStatus(): SyncStatusState {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const queue = getStoredOfflineQueue();
  const lastSyncTime = safeStorage.getItem('ah-last-sync-time');
  const lastError = safeStorage.getItem('ah-last-sync-error');
  const errorLogs = getErrorLogs();

  let status: SyncStatusState['status'] = 'synced';
  if (!isOnline) {
    status = 'offline';
  } else if (queue.length > 0) {
    status = 'syncing';
  } else if (lastError) {
    status = 'error';
  }

  return {
    status,
    pendingCount: queue.length,
    lastSyncTime,
    lastError,
    errorsList: errorLogs.map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      message: `${e.action}: ${e.error}`
    }))
  };
}

export function getStoredRole(): UserRole {
  return (getScopedItem('user-role') as UserRole) || 'driver';
}
export function saveStoredRole(role: UserRole) {
  setScopedItem('user-role', role);
}

export function getStoredOfflineQueue(): OfflineAction[] {
  try {
    const data = getScopedItem('offline-queue');
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.map((item: OfflineAction) => sanitizeQueuedAction(item)) : [];
  } catch {
    return [];
  }
}
export function saveStoredOfflineQueue(queue: OfflineAction[]) {
  const sanitized = (Array.isArray(queue) ? queue : []).map((item) => sanitizeQueuedAction(item)).slice(0, MAX_OFFLINE_QUEUE_ITEMS);
  setScopedItem('offline-queue', JSON.stringify(sanitized));
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const data = getScopedItem('notifs');
    return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}
export function saveStoredNotifications(notifs: AppNotification[]) {
  setScopedItem('notifs', JSON.stringify(notifs));
}

export async function triggerManualSync(): Promise<{ success: boolean; processed: number; remaining: number; errors: string[] }> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline) {
    return { success: false, processed: 0, remaining: getStoredOfflineQueue().length, errors: ['Device is currently offline'] };
  }

  try {
    const result = await processOfflineQueue();
    safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
    if (result.errors.length > 0) {
      safeStorage.setItem('ah-last-sync-error', result.errors[0]);
    } else {
      safeStorage.removeItem('ah-last-sync-error');
    }
    await logActivity('Manual Sync Triggered', `Processed ${result.processed} actions, ${result.remaining} remaining`, 'sync');
    return {
      success: result.errors.length === 0,
      processed: result.processed,
      remaining: result.remaining,
      errors: result.errors
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logError('Manual Sync Failure', errorMsg);
    safeStorage.setItem('ah-last-sync-error', errorMsg);
    return {
      success: false,
      processed: 0,
      remaining: getStoredOfflineQueue().length,
      errors: [errorMsg]
    };
  }
}

export function getSyncStatus(): SyncStatusState {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const queue = getStoredOfflineQueue();
  const lastSyncTime = safeStorage.getItem('ah-last-sync-time');
  const lastError = safeStorage.getItem('ah-last-sync-error');
  const errorLogs = getErrorLogs();

  let status: SyncStatusState['status'] = 'synced';
  if (!isOnline) {
    status = 'offline';
  } else if (queue.length > 0) {
    status = 'syncing';
  } else if (lastError) {
    status = 'error';
  }

  return {
    status,
    pendingCount: queue.length,
    lastSyncTime,
    lastError,
    errorsList: errorLogs.map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      message: `${e.action}: ${e.error}`
    }))
  };
}

export function getStoredRole(): UserRole {
  return (getScopedItem('user-role') as UserRole) || 'driver';
}
export function saveStoredRole(role: UserRole) {
  setScopedItem('user-role', role);
}

export function getStoredOfflineQueue(): OfflineAction[] {
  try {
    const data = getScopedItem('offline-queue');
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.map((item: OfflineAction) => sanitizeQueuedAction(item)) : [];
  } catch {
    return [];
  }
}
export function saveStoredOfflineQueue(queue: OfflineAction[]) {
  const sanitized = (Array.isArray(queue) ? queue : []).map((item) => sanitizeQueuedAction(item)).slice(0, MAX_OFFLINE_QUEUE_ITEMS);
  setScopedItem('offline-queue', JSON.stringify(sanitized));
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const data = getScopedItem('notifs');
    return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}
export function saveStoredNotifications(notifs: AppNotification[]) {
  setScopedItem('notifs', JSON.stringify(notifs));
}

export async function triggerManualSync(): Promise<{ success: boolean; processed: number; remaining: number; errors: string[] }> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline) {
    return { success: false, processed: 0, remaining: getStoredOfflineQueue().length, errors: ['Device is currently offline'] };
  }

  try {
    const result = await processOfflineQueue();
    safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
    if (result.errors.length > 0) {
      safeStorage.setItem('ah-last-sync-error', result.errors[0]);
    } else {
      safeStorage.removeItem('ah-last-sync-error');
    }
    await logActivity('Manual Sync Triggered', `Processed ${result.processed} actions, ${result.remaining} remaining`, 'sync');
    return {
      success: result.errors.length === 0,
      processed: result.processed,
      remaining: result.remaining,
      errors: result.errors
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logError('Manual Sync Failure', errorMsg);
    safeStorage.setItem('ah-last-sync-error', errorMsg);
    return {
      success: false,
      processed: 0,
      remaining: getStoredOfflineQueue().length,
      errors: [errorMsg]
    };
  }
}

export function getSyncStatus(): SyncStatusState {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const queue = getStoredOfflineQueue();
  const lastSyncTime = safeStorage.getItem('ah-last-sync-time');
  const lastError = safeStorage.getItem('ah-last-sync-error');
  const errorLogs = getErrorLogs();

  let status: SyncStatusState['status'] = 'synced';
  if (!isOnline) {
    status = 'offline';
  } else if (queue.length > 0) {
    status = 'syncing';
  } else if (lastError) {
    status = 'error';
  }

  return {
    status,
    pendingCount: queue.length,
    lastSyncTime,
    lastError,
    errorsList: errorLogs.map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      message: `${e.action}: ${e.error}`
    }))
  };
}

export function getStoredRole(): UserRole {
  return (getScopedItem('user-role') as UserRole) || 'driver';
}
export function saveStoredRole(role: UserRole) {
  setScopedItem('user-role', role);
}

export function getStoredOfflineQueue(): OfflineAction[] {
  try {
    const data = getScopedItem('offline-queue');
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.map((item: OfflineAction) => sanitizeQueuedAction(item)) : [];
  } catch {
    return [];
  }
}
export function saveStoredOfflineQueue(queue: OfflineAction[]) {
  const sanitized = (Array.isArray(queue) ? queue : []).map((item) => sanitizeQueuedAction(item)).slice(0, MAX_OFFLINE_QUEUE_ITEMS);
  setScopedItem('offline-queue', JSON.stringify(sanitized));
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const data = getScopedItem('notifs');
    return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}
export function saveStoredNotifications(notifs: AppNotification[]) {
  setScopedItem('notifs', JSON.stringify(notifs));
}

export async function triggerManualSync(): Promise<{ success: boolean; processed: number; remaining: number; errors: string[] }> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline) {
    return { success: false, processed: 0, remaining: getStoredOfflineQueue().length, errors: ['Device is currently offline'] };
  }

  try {
    const result = await processOfflineQueue();
    safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
    if (result.errors.length > 0) {
      safeStorage.setItem('ah-last-sync-error', result.errors[0]);
    } else {
      safeStorage.removeItem('ah-last-sync-error');
    }
    await logActivity('Manual Sync Triggered', `Processed ${result.processed} actions, ${result.remaining} remaining`, 'sync');
    return {
      success: result.errors.length === 0,
      processed: result.processed,
      remaining: result.remaining,
      errors: result.errors
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logError('Manual Sync Failure', errorMsg);
    safeStorage.setItem('ah-last-sync-error', errorMsg);
    return {
      success: false,
      processed: 0,
      remaining: getStoredOfflineQueue().length,
      errors: [errorMsg]
    };
  }
}

export function getSyncStatus(): SyncStatusState {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const queue = getStoredOfflineQueue();
  const lastSyncTime = safeStorage.getItem('ah-last-sync-time');
  const lastError = safeStorage.getItem('ah-last-sync-error');
  const errorLogs = getErrorLogs();

  let status: SyncStatusState['status'] = 'synced';
  if (!isOnline) {
    status = 'offline';
  } else if (queue.length > 0) {
    status = 'syncing';
  } else if (lastError) {
    status = 'error';
  }

  return {
    status,
    pendingCount: queue.length,
    lastSyncTime,
    lastError,
    errorsList: errorLogs.map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      message: `${e.action}: ${e.error}`
    }))
  };
}

export function getStoredRole(): UserRole {
  return (getScopedItem('user-role') as UserRole) || 'driver';
}
export function saveStoredRole(role: UserRole) {
  setScopedItem('user-role', role);
}

export function getStoredOfflineQueue(): OfflineAction[] {
  try {
    const data = getScopedItem('offline-queue');
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.map((item: OfflineAction) => sanitizeQueuedAction(item)) : [];
  } catch {
    return [];
  }
}
export function saveStoredOfflineQueue(queue: OfflineAction[]) {
  const sanitized = (Array.isArray(queue) ? queue : []).map((item) => sanitizeQueuedAction(item)).slice(0, MAX_OFFLINE_QUEUE_ITEMS);
  setScopedItem('offline-queue', JSON.stringify(sanitized));
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const data = getScopedItem('notifs');
    return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}
export function saveStoredNotifications(notifs: AppNotification[]) {
  setScopedItem('notifs', JSON.stringify(notifs));
}

export async function triggerManualSync(): Promise<{ success: boolean; processed: number; remaining: number; errors: string[] }> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline) {
    return { success: false, processed: 0, remaining: getStoredOfflineQueue().length, errors: ['Device is currently offline'] };
  }

  try {
    const result = await processOfflineQueue();
    safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
    if (result.errors.length > 0) {
      safeStorage.setItem('ah-last-sync-error', result.errors[0]);
    } else {
      safeStorage.removeItem('ah-last-sync-error');
    }
    await logActivity('Manual Sync Triggered', `Processed ${result.processed} actions, ${result.remaining} remaining`, 'sync');
    return {
      success: result.errors.length === 0,
      processed: result.processed,
      remaining: result.remaining,
      errors: result.errors
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logError('Manual Sync Failure', errorMsg);
    safeStorage.setItem('ah-last-sync-error', errorMsg);
    return {
      success: false,
      processed: 0,
      remaining: getStoredOfflineQueue().length,
      errors: [errorMsg]
    };
  }
}

export function getSyncStatus(): SyncStatusState {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const queue = getStoredOfflineQueue();
  const lastSyncTime = safeStorage.getItem('ah-last-sync-time');
  const lastError = safeStorage.getItem('ah-last-sync-error');
  const errorLogs = getErrorLogs();

  let status: SyncStatusState['status'] = 'synced';
  if (!isOnline) {
    status = 'offline';
  } else if (queue.length > 0) {
    status = 'syncing';
  } else if (lastError) {
    status = 'error';
  }

  return {
    status,
    pendingCount: queue.length,
    lastSyncTime,
    lastError,
    errorsList: errorLogs.map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      message: `${e.action}: ${e.error}`
    }))
  };
}

export function getStoredRole(): UserRole {
  return (getScopedItem('user-role') as UserRole) || 'driver';
}
export function saveStoredRole(role: UserRole) {
  setScopedItem('user-role', role);
}

export function getStoredOfflineQueue(): OfflineAction[] {
  try {
    const data = getScopedItem('offline-queue');
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.map((item: OfflineAction) => sanitizeQueuedAction(item)) : [];
  } catch {
    return [];
  }
}
export function saveStoredOfflineQueue(queue: OfflineAction[]) {
  const sanitized = (Array.isArray(queue) ? queue : []).map((item) => sanitizeQueuedAction(item)).slice(0, MAX_OFFLINE_QUEUE_ITEMS);
  setScopedItem('offline-queue', JSON.stringify(sanitized));
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const data = getScopedItem('notifs');
    return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}
export function saveStoredNotifications(notifs: AppNotification[]) {
  setScopedItem('notifs', JSON.stringify(notifs));
}

export async function triggerManualSync(): Promise<{ success: boolean; processed: number; remaining: number; errors: string[] }> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline) {
    return { success: false, processed: 0, remaining: getStoredOfflineQueue().length, errors: ['Device is currently offline'] };
  }

  try {
    const result = await processOfflineQueue();
    safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
    if (result.errors.length > 0) {
      safeStorage.setItem('ah-last-sync-error', result.errors[0]);
    } else {
      safeStorage.removeItem('ah-last-sync-error');
    }
    await logActivity('Manual Sync Triggered', `Processed ${result.processed} actions, ${result.remaining} remaining`, 'sync');
    return {
      success: result.errors.length === 0,
      processed: result.processed,
      remaining: result.remaining,
      errors: result.errors
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logError('Manual Sync Failure', errorMsg);
    safeStorage.setItem('ah-last-sync-error', errorMsg);
    return {
      success: false,
      processed: 0,
      remaining: getStoredOfflineQueue().length,
      errors: [errorMsg]
    };
  }
}

export function getSyncStatus(): SyncStatusState {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const queue = getStoredOfflineQueue();
  const lastSyncTime = safeStorage.getItem('ah-last-sync-time');
  const lastError = safeStorage.getItem('ah-last-sync-error');
  const errorLogs = getErrorLogs();

  let status: SyncStatusState['status'] = 'synced';
  if (!isOnline) {
    status = 'offline';
  } else if (queue.length > 0) {
    status = 'syncing';
  } else if (lastError) {
    status = 'error';
  }

  return {
    status,
    pendingCount: queue.length,
    lastSyncTime,
    lastError,
    errorsList: errorLogs.map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      message: `${e.action}: ${e.error}`
    }))
  };
}

export function getStoredRole(): UserRole {
  return (getScopedItem('user-role') as UserRole) || 'driver';
}
export function saveStoredRole(role: UserRole) {
  setScopedItem('user-role', role);
}

export function getStoredOfflineQueue(): OfflineAction[] {
  try {
    const data = getScopedItem('offline-queue');
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.map((item: OfflineAction) => sanitizeQueuedAction(item)) : [];
  } catch {
    return [];
  }
}
export function saveStoredOfflineQueue(queue: OfflineAction[]) {
  const sanitized = (Array.isArray(queue) ? queue : []).map((item) => sanitizeQueuedAction(item)).slice(0, MAX_OFFLINE_QUEUE_ITEMS);
  setScopedItem('offline-queue', JSON.stringify(sanitized));
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const data = getScopedItem('notifs');
    return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}
export function saveStoredNotifications(notifs: AppNotification[]) {
  setScopedItem('notifs', JSON.stringify(notifs));
}

export async function triggerManualSync(): Promise<{ success: boolean; processed: number; remaining: number; errors: string[] }> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline) {
    return { success: false, processed: 0, remaining: getStoredOfflineQueue().length, errors: ['Device is currently offline'] };
  }

  try {
    const result = await processOfflineQueue();
    safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
    if (result.errors.length > 0) {
      safeStorage.setItem('ah-last-sync-error', result.errors[0]);
    } else {
      safeStorage.removeItem('ah-last-sync-error');
    }
    await logActivity('Manual Sync Triggered', `Processed ${result.processed} actions, ${result.remaining} remaining`, 'sync');
    return {
      success: result.errors.length === 0,
      processed: result.processed,
      remaining: result.remaining,
      errors: result.errors
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logError('Manual Sync Failure', errorMsg);
    safeStorage.setItem('ah-last-sync-error', errorMsg);
    return {
      success: false,
      processed: 0,
      remaining: getStoredOfflineQueue().length,
      errors: [errorMsg]
    };
  }
}

export function getSyncStatus(): SyncStatusState {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const queue = getStoredOfflineQueue();
  const lastSyncTime = safeStorage.getItem('ah-last-sync-time');
  const lastError = safeStorage.getItem('ah-last-sync-error');
  const errorLogs = getErrorLogs();

  let status: SyncStatusState['status'] = 'synced';
  if (!isOnline) {
    status = 'offline';
  } else if (queue.length > 0) {
    status = 'syncing';
  } else if (lastError) {
    status = 'error';
  }

  return {
    status,
    pendingCount: queue.length,
    lastSyncTime,
    lastError,
    errorsList: errorLogs.map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      message: `${e.action}: ${e.error}`
    }))
  };
}
