import { describe, it, expect, vi, beforeEach } from 'vitest';

// Node environment localStorage mock
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = storageMock;
}

import { 
  HAZARD_CATEGORIES, 
  calculateDistanceKm, 
  findNearestCity, 
  formatTimeAgo, 
  getRouteHazardSummaries, 
  checkRateLimit,
  HazardReport
} from '../utils/hazardReports';

describe('Road Hazard Alert Feature Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // 1. Five Categories & Bilingual Metadata
  describe('Hazard Categories Metadata', () => {
    it('should define all 5 required hazard categories with English and Urdu labels', () => {
      const requiredCategories = ['checkpoint', 'flooding', 'accident', 'closure', 'traffic'];
      
      requiredCategories.forEach(cat => {
        expect(HAZARD_CATEGORIES).toHaveProperty(cat);
        const meta = HAZARD_CATEGORIES[cat as keyof typeof HAZARD_CATEGORIES];
        expect(meta.labelEn).toBeDefined();
        expect(meta.labelUr).toBeDefined();
        expect(meta.markerColor).toBeDefined();
      });
    });
  });

  // 2. Haversine Distance & City Resolution
  describe('Coordinates and Nearest City Resolution', () => {
    it('should accurately calculate distance between Lahore and Islamabad', () => {
      // Lahore ~ (31.5204, 74.3587), Islamabad ~ (33.6844, 73.0479)
      const dist = calculateDistanceKm(31.5204, 74.3587, 33.6844, 73.0479);
      expect(dist).toBeGreaterThan(250);
      expect(dist).toBeLessThan(300);
    });

    it('should resolve the nearest city for Samundri GPS coordinates', () => {
      const nearest = findNearestCity(31.0632, 72.9602);
      expect(nearest).not.toBeNull();
      expect(nearest?.nameEn.toLowerCase()).toContain('samundri');
    });
  });

  // 3. Relative Time Ago Formatting
  describe('Relative Time Ago Formatting', () => {
    it('should format timestamps less than 60 seconds as "just now" / "ابھی ابھی"', () => {
      const now = Date.now();
      expect(formatTimeAgo(now - 10000, 'en')).toBe('just now');
      expect(formatTimeAgo(now - 10000, 'ur')).toBe('ابھی ابھی');
    });

    it('should format minutes ago accurately', () => {
      const fifteenMinAgo = Date.now() - 15 * 60 * 1000;
      expect(formatTimeAgo(fifteenMinAgo, 'en')).toBe('15 minutes ago');
      expect(formatTimeAgo(fifteenMinAgo, 'ur')).toBe('15 منٹ پہلے');
    });

    it('should format hours ago accurately', () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      expect(formatTimeAgo(twoHoursAgo, 'en')).toBe('2 hours ago');
      expect(formatTimeAgo(twoHoursAgo, 'ur')).toBe('2 گھنٹے پہلے');
    });
  });

  // 4. Rate Limiting Check
  describe('Abuse Prevention Rate Limiting', () => {
    it('should allow report submission if no prior submission exists in the last 5 minutes', async () => {
      const result = await checkRateLimit('user_test_123');
      expect(result.allowed).toBe(true);
      expect(result.remainingSeconds).toBe(0);
    });

    it('should block submission if user reported within the last 5 minutes', async () => {
      const uid = 'user_rate_limit_test';
      const recentTime = Date.now() - 2 * 60 * 1000; // 2 minutes ago
      localStorage.setItem(`wg_last_hazard_report_ms_${uid}`, recentTime.toString());

      const result = await checkRateLimit(uid);
      expect(result.allowed).toBe(false);
      expect(result.remainingSeconds).toBeGreaterThan(0);
      expect(result.remainingSeconds).toBeLessThanOrEqual(180);
    });

    it('should allow submission after 5 minutes window expires', async () => {
      const uid = 'user_expired_rate_limit';
      const sixMinAgo = Date.now() - 6 * 60 * 1000; // 6 minutes ago
      localStorage.setItem(`wg_last_hazard_report_ms_${uid}`, sixMinAgo.toString());

      const result = await checkRateLimit(uid);
      expect(result.allowed).toBe(true);
    });
  });

  // 5. Corridor Proximity Filtering & Count Aggregation
  describe('Corridor Route Hazard Summaries', () => {
    const routePoints = [
      { lat: 31.5204, lng: 74.3587 }, // Lahore
      { lat: 31.0632, lng: 72.9602 }, // Samundri
      { lat: 30.1575, lng: 71.5249 }  // Multan
    ];

    it('should match hazards within 35 km of route corridor and exclude far hazards', () => {
      const hazards: HazardReport[] = [
        {
          id: 'hz_1',
          category: 'checkpoint',
          lat: 31.0700,
          lng: 72.9650, // very close to Samundri
          cityNear: 'Samundri',
          createdAt: Date.now() - 3600000,
          expiresAt: Date.now() + 80000000,
          reporterUid: 'uid1'
        },
        {
          id: 'hz_2',
          category: 'closure',
          lat: 25.3960,
          lng: 68.3578, // Hyderabad (far from Lahore-Multan corridor)
          cityNear: 'Hyderabad',
          createdAt: Date.now() - 1800000,
          expiresAt: Date.now() + 80000000,
          reporterUid: 'uid2'
        }
      ];

      const summaries = getRouteHazardSummaries(hazards, routePoints, 35);
      expect(summaries.length).toBe(1);
      expect(summaries[0].category).toBe('checkpoint');
      expect(summaries[0].cityNear).toBe('Samundri');
      expect(summaries[0].count).toBe(1);
    });

    it('should aggregate multiple reports of same category and area into a count', () => {
      const hazards: HazardReport[] = [
        {
          id: 'hz_flood_1',
          category: 'flooding',
          lat: 30.1600,
          lng: 71.5300,
          cityNear: 'Multan',
          createdAt: Date.now() - 3600000,
          expiresAt: Date.now() + 80000000,
          reporterUid: 'uid1'
        },
        {
          id: 'hz_flood_2',
          category: 'flooding',
          lat: 30.1550,
          lng: 71.5200,
          cityNear: 'Multan',
          createdAt: Date.now() - 1800000,
          expiresAt: Date.now() + 80000000,
          reporterUid: 'uid2'
        },
        {
          id: 'hz_flood_3',
          category: 'flooding',
          lat: 30.1590,
          lng: 71.5280,
          cityNear: 'Multan',
          createdAt: Date.now() - 900000,
          expiresAt: Date.now() + 80000000,
          reporterUid: 'uid3'
        }
      ];

      const summaries = getRouteHazardSummaries(hazards, routePoints, 35);
      expect(summaries.length).toBe(1);
      expect(summaries[0].category).toBe('flooding');
      expect(summaries[0].count).toBe(3);
    });
  });
});
