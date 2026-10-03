import { Vehicle, Driver, Language } from '../types';
import { sendSystemNotification } from './notifications';

export type ExpiryDocType = 
  | 'vehicle_reg' 
  | 'vehicle_permit' 
  | 'vehicle_fitness' 
  | 'driver_license';

export interface ExpiringDocumentItem {
  id: string; // unique key, e.g. `veh-${vehicle.id}-reg`
  targetId: number;
  type: ExpiryDocType;
  titleEn: string;
  titleUr: string;
  docNameEn: string;
  docNameUr: string;
  identifier: string; // Vehicle plate (e.g. LHR-7860) or Driver name
  subIdentifier?: string; // Driver phone or vehicle model
  expiryDateStr: string; // YYYY-MM-DD
  daysLeft: number;
  isExpired: boolean;
  urgency: 'critical' | 'warning' | 'warning-urgent'; // Red for <=7 days or expired, amber for 15-30 days
  portalType: 'mtmis' | 'dlims';
  portalNameEn: string;
  portalNameUr: string;
  portalUrl: string;
  inAppSubSection: 'vehicle' | 'license';
}

/**
 * Checks all vehicles and drivers for any document expiry dates within the next 30 days
 * (as well as already expired documents).
 * Returns items sorted most-urgent-first (expired and smallest days left first).
 */
export function checkExpiringDocuments(
  vehicles: Vehicle[],
  drivers: Driver[]
): ExpiringDocumentItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiringItems: ExpiringDocumentItem[] = [];

  const parseDaysLeft = (dateStr: string): number => {
    try {
      const exp = new Date(dateStr);
      if (isNaN(exp.getTime())) return 999;
      exp.setHours(0, 0, 0, 0);
      const diffMs = exp.getTime() - today.getTime();
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    } catch {
      return 999;
    }
  };

  // 1. Vehicle Documents
  for (const veh of vehicles) {
    // (a) Registration (RC) Expiry
    if (veh.regExpiry) {
      const days = parseDaysLeft(veh.regExpiry);
      if (days <= 30) {
        expiringItems.push({
          id: `veh-${veh.id}-reg`,
          targetId: veh.id,
          type: 'vehicle_reg',
          titleEn: `Vehicle RC Expiry: ${veh.reg}`,
          titleUr: `گاڑی رجسٹریشن (RC) کی میعاد: ${veh.reg}`,
          docNameEn: 'Registration (RC)',
          docNameUr: 'رجسٹریشن سرٹیفکیٹ (RC)',
          identifier: veh.reg,
          subIdentifier: veh.model,
          expiryDateStr: veh.regExpiry,
          daysLeft: days,
          isExpired: days <= 0,
          urgency: days <= 7 ? 'critical' : days <= 14 ? 'warning-urgent' : 'warning',
          portalType: 'mtmis',
          portalNameEn: 'MTMIS Punjab (Excise & Taxation)',
          portalNameUr: 'ایم ٹی ایم آئی ایس پنجاب ایکسائز',
          portalUrl: 'https://mtmis.excise.punjab.gov.pk/',
          inAppSubSection: 'vehicle'
        });
      }
    }

    // (b) Route Permit Expiry
    if (veh.routePermitExpiry) {
      const days = parseDaysLeft(veh.routePermitExpiry);
      if (days <= 30) {
        expiringItems.push({
          id: `veh-${veh.id}-permit`,
          targetId: veh.id,
          type: 'vehicle_permit',
          titleEn: `Route Permit Expiry: ${veh.reg}`,
          titleUr: `روٹ پرمٹ کی میعاد: ${veh.reg}`,
          docNameEn: 'Route Permit',
          docNameUr: 'کمرشل روٹ پرمٹ',
          identifier: veh.reg,
          subIdentifier: veh.model,
          expiryDateStr: veh.routePermitExpiry,
          daysLeft: days,
          isExpired: days <= 0,
          urgency: days <= 7 ? 'critical' : days <= 14 ? 'warning-urgent' : 'warning',
          portalType: 'mtmis',
          portalNameEn: 'MTMIS / Regional Transport Authority',
          portalNameUr: 'ریجنل ٹرانسپورٹ اتھارٹی و ایکسائز',
          portalUrl: 'https://mtmis.excise.punjab.gov.pk/',
          inAppSubSection: 'vehicle'
        });
      }
    }

    // (c) Fitness Certificate Expiry
    if (veh.fitnessExpiry) {
      const days = parseDaysLeft(veh.fitnessExpiry);
      if (days <= 30) {
        expiringItems.push({
          id: `veh-${veh.id}-fitness`,
          targetId: veh.id,
          type: 'vehicle_fitness',
          titleEn: `Fitness Certificate Expiry: ${veh.reg}`,
          titleUr: `گاڑی فٹنس سرٹیفکیٹ کی میعاد: ${veh.reg}`,
          docNameEn: 'Fitness Certificate',
          docNameUr: 'وہیکل فٹنس سرٹیفکیٹ',
          identifier: veh.reg,
          subIdentifier: veh.model,
          expiryDateStr: veh.fitnessExpiry,
          daysLeft: days,
          isExpired: days <= 0,
          urgency: days <= 7 ? 'critical' : days <= 14 ? 'warning-urgent' : 'warning',
          portalType: 'mtmis',
          portalNameEn: 'VICS / Punjab Transport Department',
          portalNameUr: 'پنجاب وہیکل فٹنس اتھارٹی (VICS)',
          portalUrl: 'https://mtmis.excise.punjab.gov.pk/',
          inAppSubSection: 'vehicle'
        });
      }
    }
  }

  // 2. Driver Documents
  for (const drv of drivers) {
    // (a) Driving License Expiry
    if (drv.licenseExpiry) {
      const days = parseDaysLeft(drv.licenseExpiry);
      if (days <= 30) {
        expiringItems.push({
          id: `drv-${drv.id}-license`,
          targetId: drv.id,
          type: 'driver_license',
          titleEn: `License Expiry: ${drv.name}`,
          titleUr: `ڈرائیور لائسنس کی میعاد: ${drv.name}`,
          docNameEn: `${drv.lictype || 'HTV'} Driving License`,
          docNameUr: `${drv.lictype || 'HTV'} ڈرائیونگ لائسنس`,
          identifier: drv.name,
          subIdentifier: drv.license || drv.phone,
          expiryDateStr: drv.licenseExpiry,
          daysLeft: days,
          isExpired: days <= 0,
          urgency: days <= 7 ? 'critical' : days <= 14 ? 'warning-urgent' : 'warning',
          portalType: 'dlims',
          portalNameEn: 'DLIMS Punjab Police',
          portalNameUr: 'ڈی ایل آئی ایم ایس پنجاب پولیس',
          portalUrl: 'https://dlims.punjab.gov.pk/',
          inAppSubSection: 'license'
        });
      }
    }
  }

  // Sort most-urgent-first (expired and smallest days left first)
  expiringItems.sort((a, b) => a.daysLeft - b.daysLeft);

  return expiringItems;
}

/**
 * Reuses existing sendSystemNotification (src/utils/notifications.ts)
 * to send local system status bar / panel notifications at 30, 15, and 7 days
 * before each expiry (and when expired).
 * Employs a local daily milestone cache to prevent duplicate toasts during the same calendar day.
 */
export async function processExpiryNotifications(
  items: ExpiringDocumentItem[],
  lang: Language
): Promise<void> {
  if (!items || items.length === 0) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const isUrdu = lang === 'ur';

  for (const item of items) {
    let milestone: '30' | '15' | '7' | 'expired' | null = null;

    if (item.daysLeft <= 0) {
      milestone = 'expired';
    } else if (item.daysLeft <= 7) {
      milestone = '7';
    } else if (item.daysLeft <= 15) {
      milestone = '15';
    } else if (item.daysLeft <= 30) {
      milestone = '30';
    }

    if (!milestone) continue;

    const cacheKey = `ah-notified-${item.id}-${milestone}-${todayStr}`;
    try {
      if (localStorage.getItem(cacheKey)) {
        continue; // Already notified for this milestone today
      }
    } catch {
      // ignore
    }

    let title = '';
    let body = '';

    if (milestone === 'expired') {
      title = isUrdu ? `⚠️ الرٹ: ${item.docNameUr} کی میعاد ختم!` : `⚠️ Alert: ${item.docNameEn} Expired!`;
      body = isUrdu
        ? `${item.identifier} کی میعاد ختم ہو چکی ہے۔ چالان سے بچنے کے لیے ${item.portalNameUr} پر فوری تجدید کریں۔`
        : `${item.identifier} has expired. Please renew on ${item.portalNameEn} immediately to prevent challans.`;
    } else if (milestone === '7') {
      title = isUrdu
        ? `🚨 صرف ${item.daysLeft} دن باقی: ${item.docNameUr}`
        : `🚨 Only ${item.daysLeft} Days Left: ${item.docNameEn}`;
      body = isUrdu
        ? `${item.identifier} کی میعاد ${item.daysLeft} دنوں میں ختم ہو جائے گی۔ سرکاری پورٹل پر تجدید کرائیں۔`
        : `${item.identifier} expires in ${item.daysLeft} days. Renew via government portal.`;
    } else if (milestone === '15') {
      title = isUrdu
        ? `🔔 15 روزہ یاددہانی: ${item.docNameUr}`
        : `🔔 15-Day Reminder: ${item.docNameEn}`;
      body = isUrdu
        ? `${item.identifier} کی میعاد ${item.expiryDateStr} کو ختم ہو رہی ہے (${item.daysLeft} دن باقی)۔`
        : `${item.identifier} is expiring on ${item.expiryDateStr} (${item.daysLeft} days left).`;
    } else if (milestone === '30') {
      title = isUrdu
        ? `📋 30 روزہ پیشگی الرٹ: ${item.docNameUr}`
        : `📋 30-Day Reminder: ${item.docNameEn}`;
      body = isUrdu
        ? `${item.identifier} کی میعاد اگلے ماہ ختم ہو رہی ہے۔ برائے مہربانی تیاری مکمل رکھیں۔`
        : `${item.identifier} is due for renewal next month (${item.daysLeft} days remaining).`;
    }

    try {
      const sent = await sendSystemNotification(title, body, {
        tag: `doc-exp-${item.id}-${milestone}`,
        data: { url: './#verify', subSection: item.inAppSubSection }
      });
      if (sent) {
        localStorage.setItem(cacheKey, 'true');
      }
    } catch (err) {
      console.warn('Document expiry notification error:', err);
    }
  }
}
