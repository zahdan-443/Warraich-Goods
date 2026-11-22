import React, { useMemo, useState } from 'react';
import {
  Driver,
  KhataEmployee,
  KhataEmployeeEntry,
  KhataEmployeeEntryType,
  KhataEmployeePayBasis,
  KhataEmployeeRole,
  Language
} from '../../../types';
import {
  calculateEmployeeLedgerSummary,
  deleteEmployee,
  deleteEmployeeEntry,
  formatEmployeeStatementWhatsApp,
  getAllEmployeeEntries,
  getAllEmployees,
  getEmployeeEntries,
  getTodayIsoDate,
  isEmployeeCreditType,
  saveOrUpdateEmployee,
  saveOrUpdateEmployeeEntry
} from '../../../utils/khataModulesStorage';
import {
  formatPhoneForDisplay,
  getLedgerAccounts,
  normalizePakistaniPhone
} from '../../../utils/ledgerStorage';
import { validateFinancialNumber } from '../../../utils/calculator';
import { downloadOrSharePdf, generateEmployeeStatementPdf } from '../../../utils/khataPdf';
import {
  ChevronLeft,
  Download,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  Smartphone,
  Trash2,
  UserCheck,
  Users,
  X
} from 'lucide-react';
import { ConfirmDialog } from '../../ConfirmDialog';
import { openWhatsAppMessage } from '../../../utils/externalLinks';

interface KhataEmployeesPanelProps {
  lang: Language;
  businessName?: string;
  drivers?: Driver[];
  onDataChanged?: () => void;
}

export const KhataEmployeesPanel: React.FC<KhataEmployeesPanelProps> = ({
  lang,
  businessName,
  drivers = [],
  onDataChanged
}) => {
  const isUrdu = lang === 'ur';
  const [employees, setEmployees] = useState<KhataEmployee[]>(() => getAllEmployees());
  const [allEntries, setAllEntries] = useState<KhataEmployeeEntry[]>(() => getAllEmployeeEntries());

  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const [showEmpModal, setShowEmpModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<KhataEmployee | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [defaultEntryType, setDefaultEntryType] = useState<KhataEmployeeEntryType>('salary_due');
  const [pendingDeleteEmp, setPendingDeleteEmp] = useState<KhataEmployee | null>(null);

  const reload = () => {
    setEmployees(getAllEmployees());
    setAllEntries(getAllEmployeeEntries());
    onDataChanged?.();
  };

  const roleLabels: Record<KhataEmployeeRole, { ur: string; en: string }> = {
    driver: { ur: 'ڈرائیور', en: 'Driver' },
    munshi: { ur: 'منشی / کلرک', en: 'Munshi' },
    helper: { ur: 'ہیلپر / کلینر', en: 'Helper' },
    other: { ur: 'دیگر عملہ', en: 'Other' }
  };

  const entryTypeMeta: Record<KhataEmployeeEntryType, { ur: string; en: string; isCredit: boolean }> = {
    salary_due: { ur: 'ماہانہ / ٹرپ تنخواہ واجب', en: 'Salary Due', isCredit: true },
    bonus: { ur: 'بونس / انعام', en: 'Bonus', isCredit: true },
    trip_allowance: { ur: 'سفری الاؤنس / روٹی', en: 'Trip Allowance', isCredit: true },
    salary_paid: { ur: 'تنخواہ ادائیگی', en: 'Salary Paid', isCredit: false },
    advance: { ur: 'پیشگی / ایڈوانس', en: 'Advance', isCredit: false },
    deduction: { ur: 'کٹوتی / جرمانہ', en: 'Deduction', isCredit: false }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      if (!showInactive && !e.active) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!e.name.toLowerCase().includes(q) && !(e.phone || '').includes(q)) return false;
      }
      return true;
    });
  }, [employees, showInactive, searchQuery]);

  const selectedEmployee = useMemo(
    () => employees.find(e => e.id === selectedEmpId) || null,
    [employees, selectedEmpId]
  );

  const selectedEntries = useMemo(
    () => (selectedEmployee ? getEmployeeEntries(selectedEmployee.id) : []),
    [selectedEmployee, allEntries]
  );

  // ---------------- RENDER EMPLOYEE LEDGER DETAIL ----------------
  if (selectedEmployee) {
    const summary = calculateEmployeeLedgerSummary(selectedEntries);
    const chronological = [...selectedEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    let running = 0;
    const rowsWithBalance = chronological.map(entry => {
      const credit = isEmployeeCreditType(entry.type);
      running += credit ? entry.amount : -entry.amount;
      return { entry, credit, running };
    }).reverse();

    const handleShareWa = () => {
      const text = formatEmployeeStatementWhatsApp(selectedEmployee, selectedEntries, businessName, lang);
      const cleanPhone = normalizePakistaniPhone(selectedEmployee.phone);
      openWhatsAppMessage(text, cleanPhone || undefined);
    };

    return (
      <div dir={isUrdu ? 'rtl' : 'ltr'} className="space-y-3.5 font-serif">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setSelectedEmpId(null)}
            className="min-h-[42px] px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className={`w-4 h-4 ${isUrdu ? 'rotate-180' : ''}`} />
            <span>{isUrdu ? 'ملازمین فہرست' : 'All Staff'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={async () => {
                const { doc, filename } = generateEmployeeStatementPdf({
                  employee: selectedEmployee,
                  entries: selectedEntries,
                  businessName
                });
                await downloadOrSharePdf(doc, filename);
              }}
              className="min-h-[42px] px-3 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isUrdu ? 'پی ڈی ایف' : 'PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handleShareWa}
              className="min-h-[42px] px-3 rounded-2xl bg-[#25D366] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isUrdu ? 'واٹس ایپ' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Employee Header Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {isUrdu ? roleLabels[selectedEmployee.role].ur : roleLabels[selectedEmployee.role].en}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${selectedEmployee.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {selectedEmployee.active ? (isUrdu ? 'فعال' : 'Active') : (isUrdu ? 'غیر فعال' : 'Inactive')}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                {selectedEmployee.name}
              </h2>
              <p className="text-xs text-slate-500">
                {selectedEmployee.payBasis === 'monthly'
                  ? (isUrdu ? `ماہانہ تنخواہ: PKR ${selectedEmployee.rateAmount.toLocaleString()}` : `Monthly: PKR ${selectedEmployee.rateAmount.toLocaleString()}`)
                  : (isUrdu ? `فی ٹرپ ریٹ: PKR ${selectedEmployee.rateAmount.toLocaleString()}` : `Per Trip: PKR ${selectedEmployee.rateAmount.toLocaleString()}`)}
                {selectedEmployee.phone ? ` • 📞 ${formatPhoneForDisplay(selectedEmployee.phone)}` : ''}
              </p>
            </div>

            <div className="text-end bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 block">
                {summary.netBalance > 0
                  ? (isUrdu ? 'واجب الادا تنخواہ' : 'Salary Payable')
                  : summary.netBalance < 0
                  ? (isUrdu ? 'ایڈوانس بقایا' : 'Advance Due')
                  : (isUrdu ? 'حساب برابر' : 'Settled')}
              </span>
              <span
                className={`text-base font-black font-mono ${
                  summary.netBalance > 0
                    ? 'text-emerald-600'
                    : summary.netBalance < 0
                    ? 'text-rose-600'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
                dir="ltr"
              >
                PKR {Math.abs(summary.netBalance).toLocaleString('en-US')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block">{isUrdu ? 'کل تنخواہ و الاؤنس' : 'Total Earned'}</span>
              <strong className="font-mono text-emerald-700 dark:text-emerald-400">PKR {summary.totalEarned.toLocaleString()}</strong>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30">
              <span className="text-[11px] text-rose-700 dark:text-rose-300 block">{isUrdu ? 'ادائیگی و ایڈوانس' : 'Paid & Adv'}</span>
              <strong className="font-mono text-rose-700 dark:text-rose-400">PKR {(summary.totalSalaryPaid + summary.totalAdvance).toLocaleString()}</strong>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30">
              <span className="text-[11px] text-amber-800 dark:text-amber-300 block">{isUrdu ? 'بونس و الاؤنس' : 'Bonus / Allow'}</span>
              <strong className="font-mono text-amber-700 dark:text-amber-400">PKR {(summary.totalBonus + summary.totalTripAllowance).toLocaleString()}</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
              <span className="text-[11px] text-slate-600 dark:text-slate-300 block">{isUrdu ? 'کٹوتی' : 'Deductions'}</span>
              <strong className="font-mono text-slate-800 dark:text-slate-200">PKR {summary.totalDeduction.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {(['salary_due', 'salary_paid', 'advance', 'trip_allowance', 'bonus', 'deduction'] as KhataEmployeeEntryType[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setDefaultEntryType(t);
                setShowEntryModal(true);
              }}
              className={`min-h-[42px] px-2 py-2 rounded-xl text-[11px] font-bold text-white active:scale-95 transition-all cursor-pointer ${
                entryTypeMeta[t].isCredit ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              + {isUrdu ? entryTypeMeta[t].ur : entryTypeMeta[t].en}
            </button>
          ))}
        </div>

        {/* Entries List */}
        <div className="space-y-2">
          {rowsWithBalance.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500">
              {isUrdu ? 'ابھی کوئی تنخواہ یا ایڈوانس اندراج نہیں ہے' : 'No salary or advance entries recorded yet'}
            </div>
          ) : (
            rowsWithBalance.map(({ entry, credit, running: runBal }) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${credit ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'}`}>
                      {isUrdu ? entryTypeMeta[entry.type].ur : entryTypeMeta[entry.type].en}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{entry.date}</span>
                  </div>
                  {entry.notes && <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 truncate">{entry.notes}</p>}
                </div>

                <div className="text-end shrink-0 flex items-center gap-2">
                  <div>
                    <div className={`text-sm font-black font-mono ${credit ? 'text-emerald-600' : 'text-rose-600'}`} dir="ltr">
                      {credit ? '+' : '-'} PKR {entry.amount.toLocaleString('en-US')}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono" dir="ltr">
                      {isUrdu ? 'بیلنس:' : 'Bal:'} PKR {runBal.toLocaleString('en-US')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      deleteEmployeeEntry(entry.id);
                      reload();
                    }}
                    className="p-2 text-rose-500 hover:text-rose-700 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {showEntryModal && (
          <EmployeeEntryModal
            lang={lang}
            employee={selectedEmployee}
            defaultType={defaultEntryType}
            entryTypeMeta={entryTypeMeta}
            onClose={() => setShowEntryModal(false)}
            onSave={payload => {
              saveOrUpdateEmployeeEntry(payload);
              setShowEntryModal(false);
              reload();
            }}
          />
        )}
      </div>
    );
  }

  // ---------------- RENDER EMPLOYEES LIST ----------------
  return (
    <div dir={isUrdu ? 'rtl' : 'ltr'} className="space-y-3.5 font-serif">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'ملازم کا نام یا فون تلاش کریں...' : 'Search employee name or phone...'}
            className="w-full min-h-[44px] ps-9 pe-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowInactive(v => !v)}
          className={`min-h-[44px] px-3 rounded-2xl text-xs font-bold border cursor-pointer ${
            showInactive
              ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}
        >
          {isUrdu ? (showInactive ? 'سب شامل' : 'صرف فعال') : (showInactive ? 'Showing All' : 'Active Only')}
        </button>

        <button
          type="button"
          onClick={() => {
            setEditingEmp(null);
            setShowEmpModal(true);
          }}
          className="min-h-[44px] px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>{isUrdu ? 'نیا ملازم' : 'Add Employee'}</span>
        </button>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {isUrdu ? 'کوئی ملازم درج نہیں ہے' : 'No Employees Registered'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {isUrdu ? 'ڈرائیور، منشی یا ہیلپر کا ریکارڈ اور تنخواہ کا حساب رکھیں' : 'Manage drivers, munshis, helpers, salaries, advances & allowances'}
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingEmp(null);
              setShowEmpModal(true);
            }}
            className="min-h-[44px] px-5 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
          >
            {isUrdu ? 'پہلا ملازم شامل کریں' : 'Add Employee'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEmployees.map(emp => {
            const empEntries = allEntries.filter(e => e.employeeId === emp.id);
            const sum = calculateEmployeeLedgerSummary(empEntries);
            return (
              <div
                key={emp.id}
                onClick={() => setSelectedEmpId(emp.id)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-500/50 transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{emp.name}</h4>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {isUrdu ? roleLabels[emp.role].ur : roleLabels[emp.role].en}
                    </span>
                    {!emp.active && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-200 text-slate-600">
                        {isUrdu ? 'غیر فعال' : 'Inactive'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {emp.payBasis === 'monthly' ? (isUrdu ? 'ماہانہ' : 'Monthly') : (isUrdu ? 'فی ٹرپ' : 'Per Trip')} • PKR {emp.rateAmount.toLocaleString()}
                    {emp.phone ? ` • 📞 ${formatPhoneForDisplay(emp.phone)}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-end">
                    <div
                      className={`text-sm font-black font-mono ${
                        sum.netBalance > 0
                          ? 'text-emerald-600'
                          : sum.netBalance < 0
                          ? 'text-rose-600'
                          : 'text-slate-500'
                      }`}
                      dir="ltr"
                    >
                      PKR {Math.abs(sum.netBalance).toLocaleString('en-US')}
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      {sum.netBalance > 0
                        ? (isUrdu ? 'تنخواہ واجب' : 'Payable')
                        : sum.netBalance < 0
                        ? (isUrdu ? 'ایڈوانس' : 'Advance')
                        : (isUrdu ? 'بیباق' : 'Settled')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setEditingEmp(emp);
                      setShowEmpModal(true);
                    }}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setPendingDeleteEmp(emp);
                    }}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showEmpModal && (
        <EmployeeFormModal
          lang={lang}
          drivers={drivers}
          initialEmployee={editingEmp}
          onClose={() => {
            setShowEmpModal(false);
            setEditingEmp(null);
          }}
          onSave={data => {
            saveOrUpdateEmployee(data);
            setShowEmpModal(false);
            setEditingEmp(null);
            reload();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteEmp)}
        lang={lang}
        variant="danger"
        title={isUrdu ? 'ملازم حذف کریں؟' : 'Delete Employee?'}
        message={
          pendingDeleteEmp
            ? isUrdu
              ? `کیا آپ "${pendingDeleteEmp.name}" کو حذف کرنا چاہتے ہیں؟`
              : `Delete employee "${pendingDeleteEmp.name}"?`
            : ''
        }
        confirmLabel={isUrdu ? 'حذف کریں' : 'Delete'}
        onCancel={() => setPendingDeleteEmp(null)}
        onConfirm={() => {
          if (pendingDeleteEmp) {
            deleteEmployee(pendingDeleteEmp.id);
            reload();
          }
          setPendingDeleteEmp(null);
        }}
      />
    </div>
  );
};

// ---------------- EMPLOYEE FORM MODAL (ZERO CNIC) ----------------
const EmployeeFormModal: React.FC<{
  lang: Language;
  drivers: Driver[];
  initialEmployee: KhataEmployee | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ lang, drivers, initialEmployee, onClose, onSave }) => {
  const isUrdu = lang === 'ur';
  const [name, setName] = useState(initialEmployee?.name || '');
  const [role, setRole] = useState<KhataEmployeeRole>(initialEmployee?.role || 'driver');
  const [phone, setPhone] = useState(
    initialEmployee?.phone ? formatPhoneForDisplay(initialEmployee.phone) : ''
  );
  const [payBasis, setPayBasis] = useState<KhataEmployeePayBasis>(initialEmployee?.payBasis || 'monthly');
  const [rateAmount, setRateAmount] = useState(String(initialEmployee?.rateAmount ?? ''));
  const [joiningDate, setJoiningDate] = useState(initialEmployee?.joiningDate || getTodayIsoDate());
  const [active, setActive] = useState(initialEmployee ? initialEmployee.active : true);
  const [linkedDriverId, setLinkedDriverId] = useState<string>(
    initialEmployee?.linkedDriverId ? String(initialEmployee.linkedDriverId) : ''
  );
  const [showQuickContacts, setShowQuickContacts] = useState(false);

  const savedContacts = useMemo(() => {
    return getLedgerAccounts()
      .filter(a => a.phone && a.phone.trim())
      .slice(0, 6);
  }, []);

  const handlePhoneBook = async () => {
    if (typeof navigator !== 'undefined' && 'contacts' in navigator && (navigator as any).contacts?.select) {
      try {
        const picked = await (navigator as any).contacts.select(['name', 'tel'], { multiple: false });
        if (picked && picked[0]) {
          if (picked[0].name?.[0] && !name.trim()) setName(picked[0].name[0]);
          if (picked[0].tel?.[0]) {
            const norm = normalizePakistaniPhone(picked[0].tel[0]);
            setPhone(norm ? formatPhoneForDisplay(norm) : picked[0].tel[0]);
          }
          setShowQuickContacts(false);
          return;
        }
      } catch {}
    }
    setShowQuickContacts(true);
  };

  const handleLinkDriver = (driverIdStr: string) => {
    setLinkedDriverId(driverIdStr);
    const d = drivers.find(dr => String(dr.id) === driverIdStr);
    if (d) {
      if (!name.trim()) setName(d.name);
      if (!phone.trim() && d.phone) setPhone(formatPhoneForDisplay(normalizePakistaniPhone(d.phone) || d.phone));
      setRole('driver');
    }
  };

  return (
    <div dir={isUrdu ? 'rtl' : 'ltr'} className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span>{initialEmployee ? (isUrdu ? 'ملازم تبدیل کریں' : 'Edit Employee') : (isUrdu ? 'نیا ملازم شامل کریں' : 'Add Employee')}</span>
          </h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            if (!name.trim()) return;
            const rateCheck = validateFinancialNumber(rateAmount, isUrdu ? 'تنخواہ / ریٹ' : 'Rate', { allowZero: true });
            if (!rateCheck.isValid) return;
            onSave({
              id: initialEmployee?.id,
              name: name.trim(),
              role,
              phone: phone.trim(),
              payBasis,
              rateAmount: rateCheck.value,
              joiningDate,
              active,
              linkedDriverId: linkedDriverId ? Number(linkedDriverId) : undefined
            });
          }}
          className="space-y-3"
        >
          {drivers.length > 0 && (
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {isUrdu ? 'موجودہ ڈرائیور سے منسلک کریں (اختیاری)' : 'Link Existing Driver (Optional)'}
              </label>
              <select
                value={linkedDriverId}
                onChange={e => handleLinkDriver(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <option value="">{isUrdu ? '-- کوئی منسلک نہیں --' : '-- None --'}</option>
                {drivers.map(d => (
                  <option key={d.id} value={String(d.id)}>{d.name} ({d.phone})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
              {isUrdu ? 'ملازم کا نام *' : 'Employee Name *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={isUrdu ? 'پورا نام' : 'Full name'}
              className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isUrdu ? 'فون نمبر' : 'Phone Number'}</span>
              </label>
              <button
                type="button"
                onClick={handlePhoneBook}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Smartphone className="w-3 h-3" />
                <span>{isUrdu ? 'فون بک' : 'Phone Book'}</span>
              </button>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="03001234567"
              className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
            />
            {showQuickContacts && savedContacts.length > 0 && (
              <div className="mt-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 grid grid-cols-2 gap-1.5">
                {savedContacts.map(sc => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      if (!name.trim()) setName(sc.name);
                      setPhone(formatPhoneForDisplay(sc.phone));
                      setShowQuickContacts(false);
                    }}
                    className="text-start p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 text-[11px] cursor-pointer"
                  >
                    <div className="font-bold truncate">{sc.name}</div>
                    <div className="font-mono text-emerald-600">{formatPhoneForDisplay(sc.phone)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {isUrdu ? 'عہدہ / کردار' : 'Role'}
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as KhataEmployeeRole)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <option value="driver">{isUrdu ? 'ڈرائیور' : 'Driver'}</option>
                <option value="munshi">{isUrdu ? 'منشی' : 'Munshi'}</option>
                <option value="helper">{isUrdu ? 'ہیلپر' : 'Helper'}</option>
                <option value="other">{isUrdu ? 'دیگر' : 'Other'}</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {isUrdu ? 'شمولیت کی تاریخ' : 'Joining Date'}
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={e => setJoiningDate(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {isUrdu ? 'تنخواہ کا طریقہ' : 'Pay Basis'}
              </label>
              <select
                value={payBasis}
                onChange={e => setPayBasis(e.target.value as KhataEmployeePayBasis)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <option value="monthly">{isUrdu ? 'ماہانہ تنخواہ' : 'Monthly Salary'}</option>
                <option value="per_trip">{isUrdu ? 'فی ٹرپ ریٹ' : 'Per-Trip Rate'}</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {isUrdu ? 'ریٹ رقم (PKR)' : 'Rate (PKR)'}
              </label>
              <input
                type="number"
                min="0"
                value={rateAmount}
                onChange={e => setRateAmount(e.target.value)}
                placeholder="45000"
                className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
              />
            </div>
          </div>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {isUrdu ? 'ملازم فعال ہے' : 'Active Employee'}
            </span>
            <input
              type="checkbox"
              checked={active}
              onChange={e => setActive(e.target.checked)}
              className="w-4 h-4 accent-emerald-600"
            />
          </label>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 min-h-[46px] rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold cursor-pointer">
              {isUrdu ? 'منسوخ' : 'Cancel'}
            </button>
            <button type="submit" className="flex-1 min-h-[46px] rounded-2xl bg-emerald-600 text-white text-xs font-bold cursor-pointer">
              {isUrdu ? 'محفوظ کریں' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------- EMPLOYEE ENTRY MODAL ----------------
const EmployeeEntryModal: React.FC<{
  lang: Language;
  employee: KhataEmployee;
  defaultType: KhataEmployeeEntryType;
  entryTypeMeta: Record<KhataEmployeeEntryType, { ur: string; en: string; isCredit: boolean }>;
  onClose: () => void;
  onSave: (payload: any) => void;
}> = ({ lang, employee, defaultType, entryTypeMeta, onClose, onSave }) => {
  const isUrdu = lang === 'ur';
  const [type, setType] = useState<KhataEmployeeEntryType>(defaultType);
  const [amount, setAmount] = useState(
    defaultType === 'salary_due' && employee.rateAmount > 0 ? String(employee.rateAmount) : ''
  );
  const [date, setDate] = useState(getTodayIsoDate());
  const [notes, setNotes] = useState('');
  const [entryError, setEntryError] = useState<string | null>(null);

  return (
    <div dir={isUrdu ? 'rtl' : 'ltr'} className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            {isUrdu ? `اندراج: ${employee.name}` : `New Entry: ${employee.name}`}
          </h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            const valCheck = validateFinancialNumber(amount, isUrdu ? 'رقم' : 'Amount', { allowZero: false });
            if (!valCheck.isValid) {
              setEntryError(valCheck.error || (isUrdu ? 'درست مثبت رقم درج کریں۔' : 'Enter a valid positive amount.'));
              return;
            }
            setEntryError(null);
            onSave({ employeeId: employee.id, type, amount: valCheck.value, date, notes: notes.trim() });
          }}
          className="space-y-3"
        >
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isUrdu ? 'اندراج کی قسم' : 'Entry Type'}
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as KhataEmployeeEntryType)}
              className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
            >
              {(Object.keys(entryTypeMeta) as KhataEmployeeEntryType[]).map(k => (
                <option key={k} value={k}>
                  {isUrdu ? entryTypeMeta[k].ur : entryTypeMeta[k].en}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isUrdu ? 'رقم (PKR)' : 'Amount (PKR)'}
            </label>
            <input
              type="number"
              required
              min="1"
              step="any"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-mono font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isUrdu ? 'تاریخ' : 'Date'}
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isUrdu ? 'تفصیل / نوٹ' : 'Notes'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={isUrdu ? 'مثلاً اکتوبر کی تنخواہ / ٹرپ الاؤنس' : 'e.g. Oct salary or route allowance'}
              className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>

          {entryError && (
            <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              {entryError}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 min-h-[46px] rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold cursor-pointer">
              {isUrdu ? 'منسوخ' : 'Cancel'}
            </button>
            <button type="submit" className="flex-1 min-h-[46px] rounded-2xl bg-emerald-600 text-white text-xs font-bold cursor-pointer">
              {isUrdu ? 'محفوظ کریں' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
