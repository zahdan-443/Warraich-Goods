import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { PAKISTAN_CITIES_MASTER, MasterCity } from './pakistanCitiesData';
import { Language } from '../types';

export type HazardCategory = 'checkpoint' | 'flooding' | 'accident' | 'closure' | 'traffic';

export interface HazardReport {
  id: string;
  category: HazardCategory;
  lat: number;
  lng: number;
  cityNear?: string;
  createdAt: any; // Firestore Timestamp, ISO string, or Date
  expiresAt: any; // Firestore Timestamp, ISO string, or Date
  reporterUid: string;
}

export interface HazardCategoryMeta {
  key: HazardCategory;
  labelEn: string;
  labelUr: string;
  icon: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  markerColor: string;
}

export const HAZARD_CATEGORIES: Record<HazardCategory, HazardCategoryMeta> = {
  checkpoint: {
    key: 'checkpoint',
    labelEn: 'Police Checkpoint',
    labelUr: 'پولیس ناکہ / چیک پوسٹ',
    icon: 'ShieldAlert',
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-200',
    badgeText: 'text-blue-700',
    markerColor: '#2563eb'
  },
  flooding: {
    key: 'flooding',
    labelEn: 'Flooding / Water',
    labelUr: 'پانی / سیلابی ریلہ',
    icon: 'Droplets',
    badgeBg: 'bg-cyan-50',
    badgeBorder: 'border-cyan-200',
    badgeText: 'text-cyan-700',
    markerColor: '#0891b2'
  },
  accident: {
    key: 'accident',
    labelEn: 'Accident',
    labelUr: 'سڑک حادثہ / ایکسیڈنٹ',
    icon: 'AlertTriangle',
    badgeBg: 'bg-red-50',
    badgeBorder: 'border-red-200',
    badgeText: 'text-red-700',
    markerColor: '#dc2626'
  },
  closure: {
    key: 'closure',
    labelEn: 'Road Closure',
    labelUr: 'روڈ بندش / رکاوٹ',
    icon: 'Ban',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-800',
    markerColor: '#d97706'
  },
  traffic: {
    key: 'traffic',
    labelEn: 'Heavy Traffic Jam',
    labelUr: 'شدید ٹریفک جام',
    icon: 'Gauge',
    badgeBg: 'bg-purple-50',
    badgeBorder: 'border-purple-200',
    badgeText: 'text-purple-700',
    markerColor: '#9333ea'
  }
};

// Calculate Haversine distance in kilometers between two GPS coordinates
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Find nearest Pakistan city or tehsil from GPS coordinates
export function findNearestCity(lat: number, lng: number): { nameEn: string; nameUr: string; distanceKm: number } | null {
  if (!lat || !lng || !PAKISTAN_CITIES_MASTER || PAKISTAN_CITIES_MASTER.length === 0) {
    return null;
  }

  let closest: MasterCity | null = null;
  let minDistance = Infinity;

  for (const city of PAKISTAN_CITIES_MASTER) {
    const d = calculateDistanceKm(lat, lng, city.lat, city.lng);
    if (d < minDistance) {
      minDistance = d;
      closest = city;
    }
  }

  if (closest) {
    return {
      nameEn: closest.nameEn,
      nameUr: closest.nameUr,
      distanceKm: minDistance
    };
  }

  return null;
}

// Helper to convert Firestore timestamp or ISO string to millisecond timestamp
export function getMillisFromTimestamp(ts: any): number {
  if (!ts) return Date.now();
  if (typeof ts === 'number') return ts;
  if (ts.toMillis && typeof ts.toMillis === 'function') return ts.toMillis();
  if (ts.seconds) return ts.seconds * 1000;
  if (ts instanceof Date) return ts.getTime();
  const parsed = new Date(ts).getTime();
  return isNaN(parsed) ? Date.now() : parsed;
}

// Format relative time (e.g. "2 hours ago", "15 minutes ago", "just now") in English and Urdu
export function formatTimeAgo(timestamp: any, lang: Language): string {
  const isUrdu = lang === 'ur';
  const timeMs = getMillisFromTimestamp(timestamp);
  const nowMs = Date.now();
  const diffSec = Math.max(0, Math.floor((nowMs - timeMs) / 1000));

  if (diffSec < 60) {
    return isUrdu ? 'ابھی ابھی' : 'just now';
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return isUrdu 
      ? `${diffMin} منٹ پہلے` 
      : `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return isUrdu 
      ? `${diffHours} گھنٹے پہلے` 
      : `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return isUrdu 
    ? `${diffDays} دن پہلے` 
    : `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

// Local storage key for rate limit fast check
const LOCAL_RATE_LIMIT_KEY = 'wg_last_hazard_report_ms';
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Check if the user has reported a hazard in the last 5 minutes (Requirement 3).
 * Checks both local storage and Firestore documents for this user.
 */
export async function checkRateLimit(reporterUid: string): Promise<{ allowed: boolean; remainingSeconds: number }> {
  const now = Date.now();

  // 1. Fast local check
  try {
    const localLastMsStr = localStorage.getItem(`${LOCAL_RATE_LIMIT_KEY}_${reporterUid}`);
    if (localLastMsStr) {
      const localLastMs = parseInt(localLastMsStr, 10);
      if (!isNaN(localLastMs) && now - localLastMs < RATE_LIMIT_WINDOW_MS) {
        const remaining = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - localLastMs)) / 1000);
        return { allowed: false, remainingSeconds: remaining };
      }
    }
  } catch {
    // ignore local storage errors
  }

  // 2. Query Firestore check
  try {
    const reportsRef = collection(db, 'hazardReports');
    const userQuery = query(reportsRef, where('reporterUid', '==', reporterUid));
    const querySnap = await getDocs(userQuery);

    let mostRecentMs = 0;
    querySnap.forEach((docSnap) => {
      const data = docSnap.data();
      const ms = getMillisFromTimestamp(data.createdAt);
      if (ms > mostRecentMs) {
        mostRecentMs = ms;
      }
    });

    if (mostRecentMs > 0 && now - mostRecentMs < RATE_LIMIT_WINDOW_MS) {
      const remaining = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - mostRecentMs)) / 1000);
      return { allowed: false, remainingSeconds: remaining };
    }
  } catch (err) {
    console.warn('[HazardReports] Firestore rate-limit query check failed, proceeding with local check:', err);
  }

  return { allowed: true, remainingSeconds: 0 };
}

/**
 * Submit a crowd-sourced hazard report.
 * KNOWN LIMITATION: Expired reports (past 24 hours) are filtered out of what's displayed, 
 * but the Firestore documents themselves aren't automatically deleted (this app has no 
 * scheduled backend job to clean them up) — old documents will accumulate in Firestore over time.
 */
export async function submitHazardReport(params: {
  category: HazardCategory;
  lat: number;
  lng: number;
  reporterUid: string;
}): Promise<{ success: boolean; reportId?: string; error?: string; remainingSeconds?: number }> {
  const { category, lat, lng, reporterUid } = params;

  if (!reporterUid) {
    return { success: false, error: 'Sign in is required to report road hazards.' };
  }

  // Rate limit verification
  const rateLimit = await checkRateLimit(reporterUid);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: 'Please wait a few minutes before reporting again',
      remainingSeconds: rateLimit.remainingSeconds
    };
  }

  // Resolve nearest city name (best effort)
  const nearest = findNearestCity(lat, lng);
  const cityNear = nearest ? nearest.nameEn : undefined;

  const nowMs = Date.now();
  const expiresAtMs = nowMs + 24 * 60 * 60 * 1000; // 24 hours expiry
  const reportId = `hz_${nowMs}_${Math.random().toString(36).substring(2, 8)}`;

  try {
    const docRef = doc(db, 'hazardReports', reportId);
    await setDoc(docRef, {
      category,
      lat,
      lng,
      ...(cityNear ? { cityNear } : {}),
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromMillis(expiresAtMs),
      reporterUid
    });

    // Record local rate limit timestamp
    try {
      localStorage.setItem(`${LOCAL_RATE_LIMIT_KEY}_${reporterUid}`, nowMs.toString());
    } catch {
      // ignore
    }

    return { success: true, reportId };
  } catch (err: any) {
    console.error('[HazardReports] Error submitting hazard report:', err);
    return { success: false, error: err?.message || 'Failed to submit report. Please try again.' };
  }
}

/**
 * Fetch active (non-expired) hazard reports from Firestore.
 * Filter out any report where expiresAt has passed.
 */
export async function fetchActiveHazardReports(): Promise<HazardReport[]> {
  const nowTimestamp = Timestamp.now();
  const reports: HazardReport[] = [];

  try {
    // Only signed-in users can read per firestore.rules
    if (!auth.currentUser) {
      // Return cached hazards if available in localStorage for guest reading
      try {
        const cached = localStorage.getItem('wg_cached_hazard_reports');
        if (cached) {
          const parsed: HazardReport[] = JSON.parse(cached);
          const nowMs = Date.now();
          return parsed.filter(p => getMillisFromTimestamp(p.expiresAt) > nowMs);
        }
      } catch {}
      return [];
    }

    const reportsRef = collection(db, 'hazardReports');
    const q = query(reportsRef, where('expiresAt', '>', nowTimestamp));
    const querySnap = await getDocs(q);

    querySnap.forEach((docSnap) => {
      const data = docSnap.data();
      reports.push({
        id: docSnap.id,
        category: data.category as HazardCategory,
        lat: Number(data.lat),
        lng: Number(data.lng),
        cityNear: data.cityNear || undefined,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        reporterUid: data.reporterUid
      });
    });

    // Update guest cache
    try {
      localStorage.setItem('wg_cached_hazard_reports', JSON.stringify(reports));
    } catch {}

    return reports;
  } catch (err) {
    console.warn('[HazardReports] Error fetching active hazard reports:', err);
    // Fallback to cache if available
    try {
      const cached = localStorage.getItem('wg_cached_hazard_reports');
      if (cached) {
        const parsed: HazardReport[] = JSON.parse(cached);
        const nowMs = Date.now();
        return parsed.filter(p => getMillisFromTimestamp(p.expiresAt) > nowMs);
      }
    } catch {}
    return [];
  }
}

/**
 * Delete a report (only allowed by the reporter who created it).
 */
export async function deleteHazardReport(reportId: string, reporterUid: string): Promise<boolean> {
  if (!reportId || !reporterUid) return false;
  try {
    const docRef = doc(db, 'hazardReports', reportId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('[HazardReports] Error deleting hazard report:', err);
    return false;
  }
}

export interface RouteHazardSummary {
  category: HazardCategory;
  cityNear: string;
  count: number;
  latestTimestamp: any;
  reports: HazardReport[];
}

/**
 * Check for active hazard reports within reasonable distance (default 35 km) of a route corridor.
 * Groups multiple reports of the same category and city to display a count instead of duplicates.
 */
export function getRouteHazardSummaries(
  hazardReports: HazardReport[],
  routePoints: { lat: number; lng: number }[],
  thresholdKm: number = 35
): RouteHazardSummary[] {
  if (!hazardReports || hazardReports.length === 0 || !routePoints || routePoints.length === 0) {
    return [];
  }

  const matchedHazards: HazardReport[] = [];

  for (const hazard of hazardReports) {
    // Check if hazard is within threshold distance of any route point
    const isNearRoute = routePoints.some(pt => {
      return calculateDistanceKm(hazard.lat, hazard.lng, pt.lat, pt.lng) <= thresholdKm;
    });

    if (isNearRoute) {
      matchedHazards.push(hazard);
    }
  }

  // Group by category and near city
  const groups: Record<string, { category: HazardCategory; cityNear: string; reports: HazardReport[] }> = {};

  for (const hazard of matchedHazards) {
    const cityKey = hazard.cityNear || 'Highway';
    const key = `${hazard.category}__${cityKey}`;
    if (!groups[key]) {
      groups[key] = {
        category: hazard.category,
        cityNear: cityKey,
        reports: []
      };
    }
    groups[key].reports.push(hazard);
  }

  const summaries: RouteHazardSummary[] = Object.values(groups).map(g => {
    // Find latest timestamp in group
    let latestTs = g.reports[0].createdAt;
    let latestMs = getMillisFromTimestamp(latestTs);

    for (const r of g.reports) {
      const ms = getMillisFromTimestamp(r.createdAt);
      if (ms > latestMs) {
        latestMs = ms;
        latestTs = r.createdAt;
      }
    }

    return {
      category: g.category,
      cityNear: g.cityNear,
      count: g.reports.length,
      latestTimestamp: latestTs,
      reports: g.reports
    };
  });

  // Sort most recent first
  return summaries.sort((a, b) => getMillisFromTimestamp(b.latestTimestamp) - getMillisFromTimestamp(a.latestTimestamp));
}
