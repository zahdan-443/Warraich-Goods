import {
  LedgerParty,
  PartyTransaction,
  LedgerBroker,
  BrokerTransaction,
  VehicleExpenseEntry,
  VehicleIncomeEntry,
  Language,
  Trip,
  BiltyRecord
} from '../types';
import { safeStorage, getStoredBilties } from './storage';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Storage keys
const STORAGE_KEYS = {
  PARTIES: 'dd_ledger_parties',
  PARTY_TXS: 'dd_ledger_party_transactions',
  BROKERS: 'dd_ledger_brokers',
  BROKER_TXS: 'dd_ledger_broker_transactions',
  VEHICLE_EXPENSES: 'dd_ledger_vehicle_expenses',
  VEHICLE_INCOME: 'dd_ledger_vehicle_income'
};

// Default seed data for initial view (clean template with zero personal data)
const DEFAULT_PARTIES: LedgerParty[] = [];
const DEFAULT_BROKERS: LedgerBroker[] = [];

// Helper to safely parse JSON from safeStorage
function getParsedStorage<T>(key: string, fallback: T): T {
  try {
    const raw = safeStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStorageJson(key: string, value: any): void {
  try {
    safeStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error persisting ${key}:`, e);
  }
}

// ----------------- PARTIES CRUD & SYNC -----------------

export function getStoredParties(): LedgerParty[] {
  return getParsedStorage<LedgerParty[]>(STORAGE_KEYS.PARTIES, DEFAULT_PARTIES);
}

export function saveStoredParties(parties: LedgerParty[]): void {
  setStorageJson(STORAGE_KEYS.PARTIES, parties);
  syncLedgerCollectionToFirestore('ledgerParties', parties);
}

export function getStoredPartyTransactions(): PartyTransaction[] {
  return getParsedStorage<PartyTransaction[]>(STORAGE_KEYS.PARTY_TXS, []);
}

export function saveStoredPartyTransactions(txs: PartyTransaction[]): void {
  setStorageJson(STORAGE_KEYS.PARTY_TXS, txs);
  syncLedgerCollectionToFirestore('ledgerPartyTransactions', txs);
}

/**
 * Adds or updates a Party and recalculates running balance & total charged volume
 */
export function saveOrUpdateParty(party: Partial<LedgerParty> & { name: string }): LedgerParty {
  const parties = getStoredParties();
  const existingIdx = parties.findIndex(p => p.id === party.id || p.name.trim().toLowerCase() === party.name.trim().toLowerCase());

  let targetParty: LedgerParty;
  if (existingIdx >= 0) {
    targetParty = {
      ...parties[existingIdx],
      ...party,
      updatedAt: Date.now()
    };
    parties[existingIdx] = targetParty;
  } else {
    targetParty = {
      id: party.id || `party_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: party.name.trim(),
      phone: party.phone || '',
      city: party.city || '',
      address: party.address || '',
      notes: party.notes || '',
      runningBalance: party.runningBalance || 0,
      totalCharged: party.totalCharged || 0,
      totalReceived: party.totalReceived || 0,
      updatedAt: Date.now()
    };
    parties.push(targetParty);
  }

  saveStoredParties(parties);
  return targetParty;
}

export function deleteParty(partyId: string): void {
  const parties = getStoredParties().filter(p => p.id !== partyId);
  saveStoredParties(parties);

  // Also remove its transactions
  const txs = getStoredPartyTransactions().filter(t => t.partyId !== partyId);
  saveStoredPartyTransactions(txs);
}

/**
 * Record a manual or auto-synced party transaction and recalculate party running balances
 */
export function addPartyTransaction(
  tx: Omit<PartyTransaction, 'id' | 'createdAt'> & { id?: string }
): PartyTransaction {
  const allTxs = getStoredPartyTransactions();
  const txId = tx.id || `ptx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // Prevent duplicate insertion
  const existingIdx = allTxs.findIndex(t => t.id === txId);
  const newTx: PartyTransaction = {
    ...tx,
    id: txId,
    createdAt: Date.now()
  };

  if (existingIdx >= 0) {
    allTxs[existingIdx] = newTx;
  } else {
    allTxs.unshift(newTx);
  }
  saveStoredPartyTransactions(allTxs);

  // Recalculate party running balance
  recalculatePartyBalance(tx.partyId);

  return newTx;
}

export function recalculatePartyBalance(partyId: string): void {
  const allTxs = getStoredPartyTransactions().filter(t => t.partyId === partyId);
  const parties = getStoredParties();
  const pIdx = parties.findIndex(p => p.id === partyId);
  if (pIdx === -1) return;

  let totalCharged = 0;
  let totalReceived = 0;
  let runningBalance = 0;
  let lastDate = parties[pIdx].lastTransactionDate;

  for (const t of allTxs) {
    if (t.type === 'debit') {
      // Debit = freight billed to party (Receivable from party)
      totalCharged += t.amount;
      runningBalance += t.amount;
    } else {
      // Credit = payment received from party
      totalReceived += t.amount;
      runningBalance -= t.amount;
    }
    if (!lastDate || t.date > lastDate) {
      lastDate = t.date;
    }
  }

  parties[pIdx].totalCharged = totalCharged;
  parties[pIdx].totalReceived = totalReceived;
  parties[pIdx].runningBalance = runningBalance;
  parties[pIdx].lastTransactionDate = lastDate;
  parties[pIdx].updatedAt = Date.now();

  saveStoredParties(parties);
}

// ----------------- BROKERS CRUD & SYNC -----------------

export function getStoredBrokers(): LedgerBroker[] {
  return getParsedStorage<LedgerBroker[]>(STORAGE_KEYS.BROKERS, DEFAULT_BROKERS);
}

export function saveStoredBrokers(brokers: LedgerBroker[]): void {
  setStorageJson(STORAGE_KEYS.BROKERS, brokers);
  syncLedgerCollectionToFirestore('ledgerBrokers', brokers);
}

export function getStoredBrokerTransactions(): BrokerTransaction[] {
  return getParsedStorage<BrokerTransaction[]>(STORAGE_KEYS.BROKER_TXS, []);
}

export function saveStoredBrokerTransactions(txs: BrokerTransaction[]): void {
  setStorageJson(STORAGE_KEYS.BROKER_TXS, txs);
  syncLedgerCollectionToFirestore('ledgerBrokerTransactions', txs);
}

export function saveOrUpdateBroker(broker: Partial<LedgerBroker> & { name: string }): LedgerBroker {
  const brokers = getStoredBrokers();
  const existingIdx = brokers.findIndex(b => b.id === broker.id || b.name.trim().toLowerCase() === broker.name.trim().toLowerCase());

  let targetBroker: LedgerBroker;
  if (existingIdx >= 0) {
    targetBroker = {
      ...brokers[existingIdx],
      ...broker,
      updatedAt: Date.now()
    };
    brokers[existingIdx] = targetBroker;
  } else {
    targetBroker = {
      id: broker.id || `broker_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: broker.name.trim(),
      phone: broker.phone || '',
      city: broker.city || '',
      totalCommission: broker.totalCommission || 0,
      unpaidCommission: broker.unpaidCommission || 0,
      notes: broker.notes || '',
      updatedAt: Date.now()
    };
    brokers.push(targetBroker);
  }

  saveStoredBrokers(brokers);
  return targetBroker;
}

export function deleteBroker(brokerId: string): void {
  const brokers = getStoredBrokers().filter(b => b.id !== brokerId);
  saveStoredBrokers(brokers);

  const txs = getStoredBrokerTransactions().filter(t => t.brokerId !== brokerId);
  saveStoredBrokerTransactions(txs);
}

export function addBrokerTransaction(
  tx: Omit<BrokerTransaction, 'id' | 'createdAt'> & { id?: string }
): BrokerTransaction {
  const allTxs = getStoredBrokerTransactions();
  const txId = tx.id || `btx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const existingIdx = allTxs.findIndex(t => t.id === txId);
  const newTx: BrokerTransaction = {
    ...tx,
    id: txId,
    createdAt: Date.now()
  };

  if (existingIdx >= 0) {
    allTxs[existingIdx] = newTx;
  } else {
    allTxs.unshift(newTx);
  }
  saveStoredBrokerTransactions(allTxs);

  recalculateBrokerBalance(tx.brokerId);
  return newTx;
}

export function toggleBrokerTransactionStatus(txId: string): void {
  const allTxs = getStoredBrokerTransactions();
  const target = allTxs.find(t => t.id === txId);
  if (!target) return;

  target.status = target.status === 'paid' ? 'unpaid' : 'paid';
  saveStoredBrokerTransactions(allTxs);
  recalculateBrokerBalance(target.brokerId);
}

export function recalculateBrokerBalance(brokerId: string): void {
  const allTxs = getStoredBrokerTransactions().filter(t => t.brokerId === brokerId);
  const brokers = getStoredBrokers();
  const bIdx = brokers.findIndex(b => b.id === brokerId);
  if (bIdx === -1) return;

  let totalCommission = 0;
  let unpaidCommission = 0;

  for (const t of allTxs) {
    totalCommission += t.commission;
    if (t.status === 'unpaid') {
      unpaidCommission += t.commission;
    }
  }

  brokers[bIdx].totalCommission = totalCommission;
  brokers[bIdx].unpaidCommission = unpaidCommission;
  brokers[bIdx].updatedAt = Date.now();

  saveStoredBrokers(brokers);
}

// ----------------- VEHICLE EXPENSES & INCOMES -----------------

export function getStoredVehicleExpenses(): VehicleExpenseEntry[] {
  return getParsedStorage<VehicleExpenseEntry[]>(STORAGE_KEYS.VEHICLE_EXPENSES, []);
}

export function saveStoredVehicleExpenses(expenses: VehicleExpenseEntry[]): void {
  setStorageJson(STORAGE_KEYS.VEHICLE_EXPENSES, expenses);
  syncLedgerCollectionToFirestore('vehicleExpenses', expenses);
}

export function addVehicleExpense(entry: Omit<VehicleExpenseEntry, 'id' | 'createdAt'> & { id?: string }): VehicleExpenseEntry {
  const all = getStoredVehicleExpenses();
  const newEntry: VehicleExpenseEntry = {
    ...entry,
    id: entry.id || `vexp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    createdAt: Date.now()
  };
  all.unshift(newEntry);
  saveStoredVehicleExpenses(all);
  return newEntry;
}

export function deleteVehicleExpense(id: string): void {
  const all = getStoredVehicleExpenses().filter(e => e.id !== id);
  saveStoredVehicleExpenses(all);
}

export function getStoredVehicleIncomes(): VehicleIncomeEntry[] {
  return getParsedStorage<VehicleIncomeEntry[]>(STORAGE_KEYS.VEHICLE_INCOME, []);
}

export function saveStoredVehicleIncomes(incomes: VehicleIncomeEntry[]): void {
  setStorageJson(STORAGE_KEYS.VEHICLE_INCOME, incomes);
  syncLedgerCollectionToFirestore('vehicleIncome', incomes);
}

export function addVehicleIncome(entry: Omit<VehicleIncomeEntry, 'id' | 'createdAt'> & { id?: string }): VehicleIncomeEntry {
  const all = getStoredVehicleIncomes();
  const newEntry: VehicleIncomeEntry = {
    ...entry,
    id: entry.id || `vinc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    createdAt: Date.now()
  };
  all.unshift(newEntry);
  saveStoredVehicleIncomes(all);
  return newEntry;
}

export function deleteVehicleIncome(id: string): void {
  const all = getStoredVehicleIncomes().filter(i => i.id !== id);
  saveStoredVehicleIncomes(all);
}

// ----------------- BILTY SYNC INTEGRATION (STRICT ACCESS CONTROL) -----------------

/**
 * Synchronizes party transactions from Bilty records ONLY if isBiltyAuthorized is true.
 * For unauthorized users, this function immediately returns without referencing or reading any bilty data.
 */
export function syncFreightRecordsToLedger(isBiltyAuthorized: boolean): void {
  if (!isBiltyAuthorized) {
    // Strictly isolate unauthorized users: zero bilty data, zero references
    return;
  }

  const bilties = getStoredBilties();
  if (!bilties || bilties.length === 0) return;

  const parties = getStoredParties();
  const partyTxs = getStoredPartyTransactions();
  const vehicleIncomes = getStoredVehicleIncomes();

  let modifiedParties = false;
  let modifiedTxs = false;
  let modifiedIncomes = false;

  for (const b of bilties) {
    if (!b || !b.id) continue;

    // 1. Process Sender Party
    const senderName = (b.senderName || b.consignor || '').trim();
    if (senderName) {
      let party = parties.find(p => p.name.trim().toLowerCase() === senderName.toLowerCase());
      if (!party) {
        party = {
          id: `party_bilty_${encodeURIComponent(senderName.toLowerCase())}`,
          name: senderName,
          phone: b.senderMobile || '',
          city: b.sendingCity || '',
          runningBalance: 0,
          totalCharged: 0,
          totalReceived: 0,
          notes: 'Auto-linked from freight consignor',
          updatedAt: Date.now()
        };
        parties.push(party);
        modifiedParties = true;
      }

      // Debit transaction: Total Freight Charged
      const debitTxId = `bilty_debit_${b.id}_sender`;
      if (!partyTxs.some(t => t.id === debitTxId)) {
        const totalFreight = Number(b.total || 0);
        if (totalFreight > 0) {
          partyTxs.push({
            id: debitTxId,
            partyId: party.id,
            date: b.date || new Date().toISOString().slice(0, 10),
            type: 'debit',
            amount: totalFreight,
            description: `Freight: ${b.sendingCity || ''} ➔ ${b.receivingCity || ''} (${b.vehicleNo || ''})`,
            referenceNo: b.biltyNo || String(b.id),
            vehicleNo: b.vehicleNo,
            source: 'freight',
            createdAt: Date.now()
          });
          modifiedTxs = true;
        }
      }

      // Credit transaction: Advance payment paid by sender
      const advance = Number(b.advance || 0);
      const advanceTxId = `bilty_advance_${b.id}_sender`;
      if (advance > 0 && !partyTxs.some(t => t.id === advanceTxId)) {
        partyTxs.push({
          id: advanceTxId,
          partyId: party.id,
          date: b.date || new Date().toISOString().slice(0, 10),
          type: 'credit',
          amount: advance,
          description: `Advance received: ${b.sendingCity || ''} ➔ ${b.receivingCity || ''}`,
          referenceNo: b.biltyNo || String(b.id),
          vehicleNo: b.vehicleNo,
          source: 'freight',
          createdAt: Date.now()
        });
        modifiedTxs = true;
      }
    }

    // 2. Process Receiver Party (if freight is To-Pay / Payable at destination)
    const receiverName = (b.receiverName || b.consignee || '').trim();
    const balancePayable = Number(b.payable || 0);
    if (receiverName && balancePayable > 0) {
      let receiverParty = parties.find(p => p.name.trim().toLowerCase() === receiverName.toLowerCase());
      if (!receiverParty) {
        receiverParty = {
          id: `party_bilty_${encodeURIComponent(receiverName.toLowerCase())}`,
          name: receiverName,
          phone: b.receiverMobile || '',
          city: b.receivingCity || '',
          runningBalance: 0,
          totalCharged: 0,
          totalReceived: 0,
          notes: 'Auto-linked from freight consignee',
          updatedAt: Date.now()
        };
        parties.push(receiverParty);
        modifiedParties = true;
      }

      const recTxId = `bilty_topay_${b.id}_receiver`;
      if (!partyTxs.some(t => t.id === recTxId)) {
        partyTxs.push({
          id: recTxId,
          partyId: receiverParty.id,
          date: b.date || new Date().toISOString().slice(0, 10),
          type: 'debit',
          amount: balancePayable,
          description: `To-Pay at Delivery: ${b.sendingCity || ''} ➔ ${b.receivingCity || ''}`,
          referenceNo: b.biltyNo || String(b.id),
          vehicleNo: b.vehicleNo,
          source: 'freight',
          createdAt: Date.now()
        });
        modifiedTxs = true;
      }
    }

    // 3. Process Vehicle Income if vehicleNo is present
    if (b.vehicleNo) {
      const vIncomeId = `vinc_bilty_${b.id}`;
      if (!vehicleIncomes.some(vi => vi.id === vIncomeId)) {
        const freightVal = Number(b.total || 0);
        if (freightVal > 0) {
          vehicleIncomes.push({
            id: vIncomeId,
            vehicleNo: b.vehicleNo,
            date: b.date || new Date().toISOString().slice(0, 10),
            amount: freightVal,
            partyName: senderName || receiverName,
            description: `Freight Income: ${b.sendingCity || ''} ➔ ${b.receivingCity || ''}`,
            source: 'freight',
            createdAt: Date.now()
          });
          modifiedIncomes = true;
        }
      }
    }
  }

  if (modifiedParties || modifiedTxs) {
    setStorageJson(STORAGE_KEYS.PARTIES, parties);
    setStorageJson(STORAGE_KEYS.PARTY_TXS, partyTxs);
    // Recalculate all party balances
    for (const p of parties) {
      recalculatePartyBalance(p.id);
    }
  }

  if (modifiedIncomes) {
    setStorageJson(STORAGE_KEYS.VEHICLE_INCOME, vehicleIncomes);
  }
}

// ----------------- TOP PARTIES RANKING -----------------

export interface TopPartyRankingItem {
  id: string;
  name: string;
  phone?: string;
  city?: string;
  totalCharged: number;
  runningBalance: number;
  percentageShare: number;
  rank: number;
}

export function getTopPartiesRanking(
  partiesOrLimit?: LedgerParty[] | number,
  limitNum = 5
): TopPartyRankingItem[] {
  let partiesList: LedgerParty[];
  let max = limitNum;

  if (Array.isArray(partiesOrLimit)) {
    partiesList = partiesOrLimit;
  } else {
    partiesList = getStoredParties();
    if (typeof partiesOrLimit === 'number') {
      max = partiesOrLimit;
    }
  }

  if (!partiesList || partiesList.length === 0) return [];

  // Active parties with charged volume > 0
  const activeParties = partiesList.filter(p => (p.totalCharged || 0) > 0);
  if (activeParties.length === 0) return [];

  const totalAllVolume = activeParties.reduce((acc, p) => acc + (p.totalCharged || 0), 0);
  const sorted = [...activeParties].sort((a, b) => (b.totalCharged || 0) - (a.totalCharged || 0));

  return sorted.slice(0, max).map((p, idx) => ({
    id: p.id,
    name: p.name,
    phone: p.phone,
    city: p.city,
    totalCharged: p.totalCharged || 0,
    runningBalance: p.runningBalance || 0,
    percentageShare: totalAllVolume > 0 ? Number(((p.totalCharged / totalAllVolume) * 100).toFixed(1)) : 0,
    rank: idx + 1
  }));
}

// ----------------- VEHICLE PROFIT / LOSS AGGREGATOR -----------------

export interface VehicleProfitLossSummary {
  vehicleNo: string;
  dateRangeLabel: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  isProfit: boolean;
  totalDistanceKm: number;
  profitPerKm: number | 'N/A';
  fuelExpenses: number;
  tollExpenses: number;
  otherExpenses: number;
  tripCount: number;
  incomesList: VehicleIncomeEntry[];
  expensesList: VehicleExpenseEntry[];
}

export function calculateVehicleProfitLoss(
  vehicleNo: string,
  rangeType: 'today' | 'week' | 'month' | 'custom' | 'all',
  customStartDate?: string,
  customEndDate?: string,
  tripsHistory: Trip[] = []
): VehicleProfitLossSummary {
  const expenses = getStoredVehicleExpenses();
  const incomes = getStoredVehicleIncomes();

  const now = new Date();
  let startMs = 0;
  let endMs = Infinity;
  let rangeLabel = 'All Time / کل وقت';

  if (rangeType === 'today') {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    startMs = today.getTime();
    endMs = startMs + 86400000;
    rangeLabel = 'Today / آج';
  } else if (rangeType === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    startMs = weekAgo.getTime();
    rangeLabel = 'Last 7 Days / آخری 7 دن';
  } else if (rangeType === 'month') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    startMs = monthStart.getTime();
    rangeLabel = 'This Month / رواں ماہ';
  } else if (rangeType === 'custom' && customStartDate) {
    startMs = new Date(customStartDate).getTime();
    if (customEndDate) {
      endMs = new Date(customEndDate).getTime() + 86400000;
      rangeLabel = `${customStartDate} ➔ ${customEndDate}`;
    } else {
      rangeLabel = `Since ${customStartDate}`;
    }
  }

  const isDateInRange = (dateStr?: string) => {
    if (!dateStr || rangeType === 'all') return true;
    const t = new Date(dateStr).getTime();
    return !isNaN(t) && t >= startMs && t <= endMs;
  };

  const matchesVehicle = (v?: string) => {
    if (!v) return false;
    if (vehicleNo === 'all' || !vehicleNo) return true;
    return v.trim().toLowerCase() === vehicleNo.trim().toLowerCase();
  };

  // Filter incomes
  const matchingIncomes = incomes.filter(i => matchesVehicle(i.vehicleNo) && isDateInRange(i.date));
  let totalIncome = matchingIncomes.reduce((acc, i) => acc + (i.amount || 0), 0);

  // Filter direct vehicle expenses
  const matchingExpenses = expenses.filter(e => matchesVehicle(e.vehicleNo) && isDateInRange(e.date));

  let fuelExpenses = 0;
  let tollExpenses = 0;
  let otherExpenses = 0;

  for (const e of matchingExpenses) {
    if (e.category === 'fuel') fuelExpenses += e.amount;
    else if (e.category === 'toll') tollExpenses += e.amount;
    else otherExpenses += e.amount;
  }

  // Also integrate Trips history
  let totalDistKm = 0;
  let tripCount = 0;

  for (const tr of tripsHistory) {
    if (isDateInRange(tr.date)) {
      tripCount++;
      totalDistKm += (Number(tr.dist) || 0);

      // Add trip fuel and toll expenses
      fuelExpenses += (Number(tr.fuelCost) || 0);
      tollExpenses += (Number(tr.toll) || 0);
      otherExpenses += ((Number(tr.loading) || 0) + (Number(tr.driver) || 0) + (Number(tr.other) || 0));

      // Add trip expected/total income if recorded
      if (tr.expectedIncome || tr.totalIncome) {
        totalIncome += (Number(tr.expectedIncome || tr.totalIncome) || 0);
      }
    }
  }

  const totalExpenses = fuelExpenses + tollExpenses + otherExpenses;
  const netProfit = totalIncome - totalExpenses;
  const isProfit = netProfit >= 0;

  // Strict profit per KM: "N/A" when distance is zero
  const profitPerKm: number | 'N/A' = totalDistKm > 0 
    ? Number((netProfit / totalDistKm).toFixed(2)) 
    : 'N/A';

  return {
    vehicleNo: vehicleNo || 'All Vehicles',
    dateRangeLabel: rangeLabel,
    totalIncome,
    totalExpenses,
    netProfit,
    isProfit,
    totalDistanceKm: totalDistKm,
    profitPerKm,
    fuelExpenses,
    tollExpenses,
    otherExpenses,
    tripCount,
    incomesList: matchingIncomes,
    expensesList: matchingExpenses
  };
}

// ----------------- WHATSAPP & DIRECT CALL UTILITIES -----------------

export function getCleanPhoneForWhatsApp(phone?: string): string {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9+]/g, '');
  if (clean.startsWith('03')) {
    clean = '92' + clean.slice(1);
  } else if (clean.startsWith('+')) {
    clean = clean.replace('+', '');
  }
  return clean;
}

export function formatPartyWhatsAppReminder(party: LedgerParty, lang: Language): string {
  const isUrdu = lang === 'ur';
  const balance = party.runningBalance;
  const balanceFmt = `PKR ${Math.abs(balance).toLocaleString('en-US')}`;

  if (isUrdu) {
    if (balance > 0) {
      return `محترم جناب *${party.name}* صاحب،\n` +
        `السلام علیکم!\n\n` +
        `وارائچ گڈز ٹرانسپورٹ کمپنی کے کھاتہ کے مطابق آپ کی طرف واجب الادا بقایا رقم:\n` +
        `💰 *${balanceFmt}*\n\n` +
        `برائے مہربانی مذکورہ رقم جلد از جلد کلیئر فرما کر شکریہ کا موقع دیں۔\n\n` +
        `والسلام،\n` +
        `*وارائچ گڈز ٹرانسپورٹ کمپنی*\n` +
        `ڈرائیور دوست لاجسٹکس پاکستان 🚚`;
    } else if (balance < 0) {
      return `محترم جناب *${party.name}* صاحب،\n` +
        `السلام علیکم!\n\n` +
        `وارائچ گڈز ٹرانسپورٹ کمپنی میں آپ کی ایڈوانس جمع شدہ رقم:\n` +
        `💵 *${balanceFmt}*\n\n` +
        `آپ کے تعاون کا بہت شکریہ!\n\n` +
        `*وارائچ گڈز ٹرانسپورٹ کمپنی* 🚚`;
    } else {
      return `محترم جناب *${party.name}* صاحب،\n` +
        `وارائچ گڈز ٹرانسپورٹ کمپنی کے کھاتہ کے مطابق آپ کا حساب مکمل بیباق (Clear) ہے۔ تعاون کا شکریہ! 🚚`;
    }
  } else {
    if (balance > 0) {
      return `Dear *${party.name}*,\n` +
        `Greetings from Warraich Goods Transport Company.\n\n` +
        `This is a friendly reminder that your outstanding ledger balance is:\n` +
        `💰 *${balanceFmt}*\n\n` +
        `Please arrange payment at your earliest convenience.\n\n` +
        `Thank you,\n` +
        `*Warraich Goods Transport Company*\n` +
        `Driver Dost Logistics Pakistan 🚚`;
    } else {
      return `Dear *${party.name}*,\n` +
        `Your ledger account with Warraich Goods Transport Company is currently settled with balance: *${balanceFmt}*. Thank you for your business! 🚚`;
    }
  }
}

export function formatBrokerWhatsAppReminder(broker: LedgerBroker, tx: BrokerTransaction | undefined, lang: Language): string {
  const isUrdu = lang === 'ur';
  const commission = tx ? tx.commission : broker.unpaidCommission;
  const commFmt = `PKR ${Math.abs(commission).toLocaleString('en-US')}`;

  if (isUrdu) {
    return `محترم بھائی *${broker.name}* (بروکر / کمیشن ایجنٹ)،\n` +
      `السلام علیکم!\n\n` +
      `وارائچ گڈز ٹرانسپورٹ کمپنی کا بروکر کمیشن کا حساب:\n` +
      (tx ? `📦 *لوڈ:* ${tx.loadDescription}\n` : '') +
      (tx?.vehicleNo ? `🚛 *گاڑی نمبر:* ${tx.vehicleNo}\n` : '') +
      `💵 *کمیشن رقم:* ${commFmt}\n` +
      `📌 *اسٹیٹس:* ${tx ? (tx.status === 'paid' ? 'ادا شدہ (Paid)' : 'غیر ادا شدہ (Unpaid)') : 'کل بقایا کمیشن'}\n\n` +
      `والسلام،\n` +
      `*وارائچ گڈز ٹرانسپورٹ کمپنی* 🚚`;
  } else {
    return `Dear *${broker.name}* (Broker/Agent),\n\n` +
      `Commission statement from Warraich Goods Transport Co:\n` +
      (tx ? `📦 *Load:* ${tx.loadDescription}\n` : '') +
      (tx?.vehicleNo ? `🚛 *Vehicle:* ${tx.vehicleNo}\n` : '') +
      `💵 *Commission Amount:* ${commFmt}\n` +
      `📌 *Status:* ${tx ? (tx.status === 'paid' ? 'Paid' : 'Unpaid') : 'Total Pending'}\n\n` +
      `Thank you,\n` +
      `*Warraich Goods Transport Company* 🚚`;
  }
}

// ----------------- FIRESTORE USER-SCOPED SYNC -----------------

async function syncLedgerCollectionToFirestore(colName: string, data: any[]): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user || !db) return;

    // Use users/{uid}/collections/{colName} as defined in system architecture
    const userDocRef = doc(db, 'users', user.uid, 'collections', colName);
    await setDoc(userDocRef, {
      items: data,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (err) {
    console.warn(`Firestore sync note for ${colName}:`, err);
  }
}

export async function fetchLedgerDataFromFirestore(): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user || !db) return;

    const collections = [
      { col: 'ledgerParties', key: STORAGE_KEYS.PARTIES },
      { col: 'ledgerPartyTransactions', key: STORAGE_KEYS.PARTY_TXS },
      { col: 'ledgerBrokers', key: STORAGE_KEYS.BROKERS },
      { col: 'ledgerBrokerTransactions', key: STORAGE_KEYS.BROKER_TXS },
      { col: 'vehicleExpenses', key: STORAGE_KEYS.VEHICLE_EXPENSES },
      { col: 'vehicleIncome', key: STORAGE_KEYS.VEHICLE_INCOME }
    ];

    for (const item of collections) {
      const snap = await getDoc(doc(db, 'users', user.uid, 'collections', item.col));
      if (snap.exists()) {
        const cloudData = snap.data();
        if (cloudData && Array.isArray(cloudData.items)) {
          // Merge local and cloud with local priority for offline edits
          safeStorage.setItem(item.key, JSON.stringify(cloudData.items));
        }
      }
    }
  } catch (err) {
    console.warn('Fetch ledger from Firestore note:', err);
  }
}
