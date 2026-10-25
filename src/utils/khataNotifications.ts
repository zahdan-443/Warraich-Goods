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
import { sendSystemNotification, getNotificationPermission } from './notifications';
import { getStoredNotifications, saveStoredNotifications, safeStorage } from './storage';

const LAST_DUE_CHECK_KEY = 'dd_khata_last_due_check_date';

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

  const accountsNotified: string[] = [];
  const isUrdu = lang === 'ur';

  for (const account of accounts) {
    if (!account.dueDate) continue;
    // Check if due date is today or past
    if (account.dueDate <= todayStr) {
      const entries = entriesByAccount.get(account.id) || [];
      const { balance } = calculateAccountBalance(account, entries);

      if (balance > 0) {
        const formattedAmount = `PKR ${balance.toLocaleString('en-US')}`;
        const title = isUrdu ? 'کھاتہ ادائیگی کی یاد دہانی • Driver Dost' : 'Payment Due Reminder • Driver Dost';
        const body = isUrdu
          ? `آج ${account.name} سے ادائیگی واجب الادا ہے: ${formattedAmount}`
          : `Payment due today from ${account.name}: ${formattedAmount}`;

        // System push/local notification
        const perm = await getNotificationPermission();
        if (perm === 'granted') {
          await sendSystemNotification(title, body, {
            icon: '/icon-192.png',
            tag: `khata_due_${account.id}_${todayStr}`,
            data: '/#ledger'
          });
        }

        // In-app notification log
        try {
          const inAppList = getStoredNotifications();
          const newNotif = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            title: isUrdu ? 'ادائیگی واجب الادا' : 'Payment Due Today',
            message: body,
            time: '09:00 AM',
            unread: true,
            type: 'system' as const
          };
          saveStoredNotifications([newNotif, ...inAppList.slice(0, 49)]);
        } catch {
          // ignore
        }

        accountsNotified.push(account.name);
      }
    }
  }

  safeStorage.setItem(LAST_DUE_CHECK_KEY, todayStr);
  return { dispatched: accountsNotified.length, accountsNotified };
}

/**
 * Initializes the daily 09:00 AM reminder schedule
 */
export function initKhataDueDateScheduler(lang: Language = 'ur'): () => void {
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

  const timeoutId = setTimeout(() => {
    checkAndDispatchDueReminders(lang).catch(() => {});
    // Repeat every 24 hours
    const intervalId = setInterval(() => {
      checkAndDispatchDueReminders(lang).catch(() => {});
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, delayMs);

  return () => clearTimeout(timeoutId);
}
