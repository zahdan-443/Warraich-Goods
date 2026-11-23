/**
 * Driver Dost - Khata Due-Date Daily Reminder Service
 * 
 * Checks for overdue and due-today accounts every morning at 09:00.
 * For any account with dueDate <= today and balance > 0 (receivable):
 * Triggers native system notification and logs an in-app notification.
 * 
 * Strict policy: Zero occurrences of restricted terms.
 */

import { Language } from '../types';
import { getLedgerAccounts, getAllLedgerEntries, calculateAccountBalance } from './ledgerStorage';
import { sendSystemNotification, getNotificationPermission, syncNativeDailyReminder } from './notifications';
import { getStoredNotifications, saveStoredNotifications, safeStorage } from './storage';

const LAST_DUE_CHECK_KEY = 'dd_khata_last_due_check_date';
const KHATA_NATIVE_REMINDER_ID = 'dd_khata_daily_0900_reminder';

export async function checkAndDispatchDueReminders(lang: Language = 'ur', force = false): Promise<{
  dispatched: number;
  accountsNotified: string[];
}> {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastCheck = safeStorage.getItem(LAST_DUE_CHECK_KEY);

  if (!force && lastCheck === todayStr) {
    return { dispatched: 0, accountsNotified: [] };
  }

  const accounts = getLedgerAccounts();
  const allEntries = getAllLedgerEntries();
  const entriesByAccount = new Map<string, any[]>();
  for (const entry of allEntries) {
    const list = entriesByAccount.get(entry.accountId) || [];
    list.push(entry);
    entriesByAccount.set(entry.accountId, list);
  }

  const dueItems: Array<{ id: string; name: string; balance: number }> = [];
  const isUrdu = lang === 'ur';

  for (const account of accounts) {
    if (!account.dueDate) continue;
    if (account.dueDate <= todayStr) {
      const entries = entriesByAccount.get(account.id) || [];
      const { balance } = calculateAccountBalance(account, entries);
      if (balance > 0) {
        dueItems.push({ id: account.id, name: account.name, balance });
      }
    }
  }

  if (dueItems.length > 0) {
    const totalReceivable = dueItems.reduce((sum, item) => sum + item.balance, 0);
    const title = isUrdu
      ? 'کھاتہ ادائیگی کی یاد دہانی • ڈرائیور دوست'
      : 'Payment Due Reminder • Driver Dost';

    let summaryBody = '';
    if (dueItems.length === 1) {
      const item = dueItems[0];
      const formattedAmount = `PKR ${item.balance.toLocaleString('en-US')}`;
      summaryBody = isUrdu
        ? `آج ${item.name} سے ادائیگی واجب الادا ہے: ${formattedAmount}`
        : `Payment due today from ${item.name}: ${formattedAmount}`;
    } else {
      const previewNames = dueItems.slice(0, 2).map((i) => i.name).join('، ');
      const formattedTotal = `PKR ${totalReceivable.toLocaleString('en-US')}`;
      summaryBody = isUrdu
        ? `${dueItems.length} کھاتوں (${previewNames}${dueItems.length > 2 ? ' وغیرہ' : ''}) سے کل ${formattedTotal} ادائیگی واجب الادا ہے`
        : `${dueItems.length} accounts (${dueItems.slice(0, 2).map((i) => i.name).join(', ')}${dueItems.length > 2 ? '…' : ''}) due totaling ${formattedTotal}`;
    }

    const perm = await getNotificationPermission();
    if (perm === 'granted') {
      await sendSystemNotification(title, summaryBody, {
        icon: '/icon-192.png',
        tag: `khata_due_summary_${todayStr}`,
        data: '/#ledger'
      });
    }

    try {
      const inAppList = getStoredNotifications();
      const newEntries = dueItems.slice(0, 10).map((item, idx) => ({
        id: Date.now() + idx,
        title: isUrdu ? 'ادائیگی واجب الادا' : 'Payment Due Today',
        message: isUrdu
          ? `آج ${item.name} سے ادائیگی واجب الادا ہے: PKR ${item.balance.toLocaleString('en-US')}`
          : `Payment due today from ${item.name}: PKR ${item.balance.toLocaleString('en-US')}`,
        time: '09:00 AM',
        unread: true,
        type: 'system' as const
      }));
      saveStoredNotifications([...newEntries, ...inAppList].slice(0, 50));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('wg_notifications_updated'));
      }
    } catch {
      // ignore storage quota errors
    }
  }

  safeStorage.setItem(LAST_DUE_CHECK_KEY, todayStr);
  return {
    dispatched: dueItems.length,
    accountsNotified: dueItems.map((i) => i.name)
  };
}

/**
 * Initializes the daily 09:00 AM reminder schedule (Web timers + Native OS recurring LocalNotification)
 */
export function initKhataDueDateScheduler(lang: Language = 'ur'): () => void {
  const isUrdu = lang === 'ur';

  // Schedule native repeating 09:00 AM OS notification if any account currently tracks a dueDate
  const accounts = getLedgerAccounts();
  const hasDueTrackedAccounts = accounts.some((a) => Boolean(a.dueDate));
  syncNativeDailyReminder({
    idKey: KHATA_NATIVE_REMINDER_ID,
    enabled: hasDueTrackedAccounts,
    hour: 9,
    minute: 0,
    title: isUrdu ? 'کھاتہ ادائیگی کی یاد دہانی • ڈرائیور دوست' : 'Payment Due Reminder • Driver Dost',
    body: isUrdu
      ? 'آج کی واجب الادا کھاتہ ادائیگیوں اور وصولیوں کا جائزہ لیں۔'
      : 'Review today’s due Khata payments and receivables in Driver Dost.'
  }).catch(() => {});

  // 1. Run immediate check on app launch if 09:00 has passed today and check not done
  const now = new Date();
  if (now.getHours() >= 9) {
    checkAndDispatchDueReminders(lang).catch(() => {});
  }

  // 2. Compute milliseconds until next 09:00 AM
  const nextNineAm = new Date();
  if (now.getHours() >= 9) {
    nextNineAm.setDate(nextNineAm.getDate() + 1);
  }
  nextNineAm.setHours(9, 0, 0, 0);

  const delayMs = Math.max(1000, nextNineAm.getTime() - now.getTime());
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const timeoutId = setTimeout(() => {
    checkAndDispatchDueReminders(lang).catch(() => {});
    intervalId = setInterval(() => {
      checkAndDispatchDueReminders(lang).catch(() => {});
    }, 24 * 60 * 60 * 1000);
  }, delayMs);

  return () => {
    clearTimeout(timeoutId);
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}
