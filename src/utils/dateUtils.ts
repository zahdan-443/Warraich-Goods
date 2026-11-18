/**
 * Driver Dost - Pakistan Standard Time (PKT / Asia/Karachi, UTC+05:00) Date Utilities
 *
 * Ensures daily backups, ledger entries, cashbook cutoffs, bills, daily expenses,
 * and CSV/JSON exports align strictly with Pakistan local calendar dates rather
 * than UTC day boundaries (which roll over at 05:00 AM PKT).
 */

export const PAKISTAN_TIME_ZONE = 'Asia/Karachi';

/**
 * Parses arbitrary date input safely, returning a valid Date or null.
 */
function toValidDate(input?: Date | number | string | null): Date | null {
  if (input === undefined || input === null) return new Date();
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Returns YYYY-MM-DD formatted in Asia/Karachi (PKT).
 */
export function getPakistanDateKey(input?: Date | number | string | null): string {
  const date = toValidDate(input);
  if (!date) return '';
  try {
    // en-CA produces YYYY-MM-DD consistently across Chromium / V8 / Android WebView / Node ICU
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: PAKISTAN_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch {
    // Deterministic UTC+5 manual offset fallback if ICU tzdata is unavailable
    const pktMs = date.getTime() + 5 * 60 * 60 * 1000;
    return new Date(pktMs).toISOString().slice(0, 10);
  }
}

/**
 * Returns YYYY-MM formatted in Asia/Karachi (PKT).
 */
export function getPakistanMonthKey(input?: Date | number | string | null): string {
  const key = getPakistanDateKey(input);
  return key ? key.slice(0, 7) : '';
}

/**
 * Returns an ISO-8601 timestamp anchored with the explicit +05:00 PKT offset.
 */
export function getPakistanTimestampIso(input?: Date): string {
  const d = input && !Number.isNaN(input.getTime()) ? input : new Date();
  const pktMs = d.getTime() + 5 * 60 * 60 * 1000;
  return `${new Date(pktMs).toISOString().slice(0, 23)}+05:00`;
}

/**
 * Shifts a YYYY-MM-DD date key by deltaDays without local-timezone DST drift.
 */
export function shiftDateKey(baseDateKey: string, deltaDays: number): string {
  const match = String(baseDateKey || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    const fallback = getPakistanDateKey();
    return shiftDateKey(fallback, deltaDays);
  }
  const utc = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + deltaDays);
  return new Date(utc).toISOString().slice(0, 10);
}

/**
 * Whole days elapsed since a stored YYYY-MM-DD (or ISO) timestamp using PKT calendar days.
 */
export function daysSinceDateKey(dateStr?: string | null, referenceDate?: Date): number {
  if (!dateStr || typeof dateStr !== 'string') return Number.POSITIVE_INFINITY;
  const trimmed = dateStr.trim();
  const keyOnly = trimmed.slice(0, 10);
  const match = keyOnly.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const todayKey = getPakistanDateKey(referenceDate);
  if (!match || !todayKey) {
    const parsed = new Date(trimmed).getTime();
    if (Number.isNaN(parsed)) return Number.POSITIVE_INFINITY;
    const now = referenceDate ? referenceDate.getTime() : Date.now();
    return Math.max(0, Math.floor((now - parsed) / (24 * 60 * 60 * 1000)));
  }
  const startUtc = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const [ty, tm, td] = todayKey.split('-').map(Number);
  const todayUtc = Date.UTC(ty, tm - 1, td);
  return Math.max(0, Math.floor((todayUtc - startUtc) / (24 * 60 * 60 * 1000)));
}
