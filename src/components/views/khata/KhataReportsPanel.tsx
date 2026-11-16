import React, { useMemo, useState } from 'react';
import { Language, Trip } from '../../../types';
import {
  ReportDatePreset,
  calculateReportsHubAnalytics,
  getDateRangeBounds,
  getTodayIsoDate
} from '../../../utils/khataModulesStorage';
import {
  downloadOrSharePdf,
  generateReportsSummaryPdf
} from '../../../utils/khataPdf';
import {
  BarChart3,
  Download,
  FileText,
  MapPin,
  MessageCircle,
  Truck,
  Users,
  Wallet
} from 'lucide-react';

interface KhataReportsPanelProps {
  lang: Language;
  businessName?: string;
  trips?: Trip[];
}

export const KhataReportsPanel: React.FC<KhataReportsPanelProps> = ({
  lang,
  businessName,
  trips = []
}) => {
  const isUrdu = lang === 'ur';
  const [preset, setPreset] = useState<ReportDatePreset>('month');
  const [customStart, setCustomStart] = useState(() => `${getTodayIsoDate().slice(0, 7)}-01`);
  const [customEnd, setCustomEnd] = useState(() => getTodayIsoDate());

  const { startDate, endDate } = useMemo(
    () => getDateRangeBounds(preset, customStart, customEnd, getTodayIsoDate()),
    [preset, customStart, customEnd]
  );

  const analytics = useMemo(
    () =>
      calculateReportsHubAnalytics({
        startDate,
        endDate,
        trips
      }),
    [startDate, endDate, trips]
  );

  const maxIncomeExpense = Math.max(
    1,
    analytics.incomeVsExpense.totalIncome,
    analytics.incomeVsExpense.totalExpenses
  );

  const handleShareWhatsAppSummary = () => {
    const biz = businessName?.trim() || 'Driver Dost';
    const text = isUrdu
      ? `📊 *کاروباری و کھاتہ رپورٹ (${startDate} تا ${endDate})*\n🏢 ${biz}\n--------------------------------\nکل آمدن: PKR ${analytics.incomeVsExpense.totalIncome.toLocaleString('en-US')}\nکل اخراجات: PKR ${analytics.incomeVsExpense.totalExpenses.toLocaleString('en-US')}\nخالص نفع: PKR ${analytics.incomeVsExpense.netProfit.toLocaleString('en-US')}\nپارٹی وصولی: PKR ${analytics.partyReceivablePayable.totalReceivable.toLocaleString('en-US')}\nپارٹی ادائیگی: PKR ${analytics.partyReceivablePayable.totalPayable.toLocaleString('en-US')}\nبروکر کمیشن بقایا: PKR ${analytics.brokerCommissionDue.totalCommissionDue.toLocaleString('en-US')}\nبل بقایا: PKR ${analytics.billsSummary.totalPendingBalance.toLocaleString('en-US')}\n— ${biz}`
      : `📊 *BUSINESS & LEDGER REPORT (${startDate} to ${endDate})*\n🏢 ${biz}\n--------------------------------\nTotal Income: PKR ${analytics.incomeVsExpense.totalIncome.toLocaleString('en-US')}\nTotal Expenses: PKR ${analytics.incomeVsExpense.totalExpenses.toLocaleString('en-US')}\nNet Profit: PKR ${analytics.incomeVsExpense.netProfit.toLocaleString('en-US')}\nParty Receivable: PKR ${analytics.partyReceivablePayable.totalReceivable.toLocaleString('en-US')}\nParty Payable: PKR ${analytics.partyReceivablePayable.totalPayable.toLocaleString('en-US')}\nBroker Commission Due: PKR ${analytics.brokerCommissionDue.totalCommissionDue.toLocaleString('en-US')}\nBills Pending: PKR ${analytics.billsSummary.totalPendingBalance.toLocaleString('en-US')}\n— ${biz}`;

    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="space-y-3.5 font-serif">
      {/* Range Selector + Export Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['today', 'week', 'month', 'custom'] as ReportDatePreset[]).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPreset(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  preset === p
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {p === 'today'
                  ? isUrdu
                    ? 'آج'
                    : 'Today'
                  : p === 'week'
                  ? isUrdu
                    ? 'ہفتہ'
                    : 'Week'
                  : p === 'month'
                  ? isUrdu
                    ? 'ماہ'
                    : 'Month'
                  : isUrdu
                  ? 'اپنی تاریخ'
                  : 'Custom'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={async () => {
                const { doc, filename } = generateReportsSummaryPdf({ analytics, businessName });
                await downloadOrSharePdf(doc, filename);
              }}
              className="min-h-[38px] px-3 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'رپورٹ PDF' : 'Export PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handleShareWhatsAppSummary}
              className="min-h-[38px] px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'شیئر' : 'Share'}</span>
            </button>
          </div>
        </div>

        {preset === 'custom' && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                {isUrdu ? 'شروع تاریخ' : 'From Date'}
              </label>
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="w-full min-h-[38px] px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                {isUrdu ? 'اختتام تاریخ' : 'To Date'}
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="w-full min-h-[38px] px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* CARD 1: Income vs Expenses vs Net (with inline SVG/bar comparison chart) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>{isUrdu ? '1. آمدن بمقابلہ اخراجات و خالص نفع' : '1. Income vs Expenses vs Net'}</span>
          </h3>
          <span
            className={`text-xs font-black px-2 py-0.5 rounded-full ${
              analytics.incomeVsExpense.netProfit >= 0
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
            }`}
          >
            {isUrdu ? 'خالص' : 'Net'}: PKR {analytics.incomeVsExpense.netProfit.toLocaleString('en-US')}
          </span>
        </div>

        {/* Comparison SVG/Bar */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[11px] font-bold mb-0.5">
              <span className="text-emerald-700 dark:text-emerald-400">
                {isUrdu ? 'کل آمدن' : 'Total Income'}
              </span>
              <span className="text-emerald-600">
                PKR {analytics.incomeVsExpense.totalIncome.toLocaleString('en-US')}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${Math.max(
                    analytics.incomeVsExpense.totalIncome > 0 ? 4 : 0,
                    Math.round((analytics.incomeVsExpense.totalIncome / maxIncomeExpense) * 100)
                  )}%`
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-bold mb-0.5">
              <span className="text-rose-700 dark:text-rose-400">
                {isUrdu ? 'کل اخراجات' : 'Total Expenses'}
              </span>
              <span className="text-rose-600">
                PKR {analytics.incomeVsExpense.totalExpenses.toLocaleString('en-US')}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-rose-500"
                style={{
                  width: `${Math.max(
                    analytics.incomeVsExpense.totalExpenses > 0 ? 4 : 0,
                    Math.round((analytics.incomeVsExpense.totalExpenses / maxIncomeExpense) * 100)
                  )}%`
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <div>
            <span className="text-slate-400 block">{isUrdu ? 'بل وصولی' : 'Bills Paid'}</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              PKR {analytics.incomeVsExpense.billsCollectedTotal.toLocaleString('en-US')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">{isUrdu ? 'ٹرپ کمائی' : 'Trip Income'}</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              PKR {analytics.incomeVsExpense.tripsIncomeTotal.toLocaleString('en-US')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">{isUrdu ? 'روزمرہ اخراجات' : 'Daily Exp.'}</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              PKR {analytics.incomeVsExpense.dailyExpensesTotal.toLocaleString('en-US')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">{isUrdu ? 'ملازم تنخواہیں' : 'Staff Paid'}</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              PKR {analytics.incomeVsExpense.employeeSalaryPaidTotal.toLocaleString('en-US')}
            </span>
          </div>
        </div>
      </div>

      {/* CARD 2 & CARD 3: Party Receivable/Payable + Broker Commission Due */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2">
          <h3 className="text-xs font-black text-slate-900 dark:text-white">
            {isUrdu ? '2. پارٹی وصولی / ادائیگی' : '2. Party Receivable / Payable'}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block">
                {isUrdu ? 'لینا ہے (Receivable)' : 'Receivable'}
              </span>
              <span className="font-black text-emerald-600">
                PKR {analytics.partyReceivablePayable.totalReceivable.toLocaleString('en-US')}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30">
              <span className="text-[10px] text-rose-700 dark:text-rose-300 block">
                {isUrdu ? 'دینا ہے (Payable)' : 'Payable'}
              </span>
              <span className="font-black text-rose-600">
                PKR {analytics.partyReceivablePayable.totalPayable.toLocaleString('en-US')}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            {isUrdu
              ? `کل پارٹیاں: ${analytics.partyReceivablePayable.partyCount}`
              : `Total Parties: ${analytics.partyReceivablePayable.partyCount}`}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2">
          <h3 className="text-xs font-black text-slate-900 dark:text-white">
            {isUrdu ? '3. بروکر کمیشن بقایا' : '3. Broker Commission Due'}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30">
              <span className="text-[10px] text-amber-700 dark:text-amber-300 block">
                {isUrdu ? 'واجب الادا کمیشن' : 'Commission Due'}
              </span>
              <span className="font-black text-amber-600">
                PKR {analytics.brokerCommissionDue.totalCommissionDue.toLocaleString('en-US')}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70">
              <span className="text-[10px] text-slate-500 block">
                {isUrdu ? 'کل ادا شدہ' : 'Paid to Brokers'}
              </span>
              <span className="font-black text-slate-800 dark:text-white">
                PKR {analytics.brokerCommissionDue.totalPaidToBrokers.toLocaleString('en-US')}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            {isUrdu
              ? `کل بروکرز: ${analytics.brokerCommissionDue.brokerCount}`
              : `Total Brokers: ${analytics.brokerCommissionDue.brokerCount}`}
          </p>
        </div>
      </div>

      {/* CARD 4: Vehicle-wise Profit / Loss */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2">
        <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-blue-600" />
          <span>{isUrdu ? '4. گاڑی وار نفع / نقصان' : '4. Vehicle-wise Profit / Loss'}</span>
        </h3>
        {analytics.vehicleProfitLoss.length === 0 ? (
          <p className="text-xs text-slate-400">
            {isUrdu
              ? 'اس مدت میں گاڑیوں سے منسلک ٹرپس، بل یا اخراجات موجود نہیں۔'
              : 'No vehicle-tagged trips, bills, or expenses in this date range.'}
          </p>
        ) : (
          <div className="space-y-1.5">
            {analytics.vehicleProfitLoss.map(v => (
              <div
                key={v.vehicleNo}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs"
              >
                <div>
                  <span className="font-black text-slate-900 dark:text-white">{v.vehicleNo}</span>
                  <span className="text-[10px] text-slate-400 block">
                    {isUrdu ? 'آمدن' : 'Inc'}: {v.income.toLocaleString('en-US')} •{' '}
                    {isUrdu ? 'اخراجات' : 'Exp'}: {v.expenses.toLocaleString('en-US')}
                  </span>
                </div>
                <span
                  className={`font-black ${
                    v.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {v.netProfit >= 0 ? '+' : ''}PKR {v.netProfit.toLocaleString('en-US')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CARD 5 & CARD 6: Employees Summary + Receiving Point Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2">
          <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-600" />
            <span>{isUrdu ? '5. ملازمین تنخواہ و ایڈوانس' : '5. Employee Salary & Advances'}</span>
          </h3>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block">{isUrdu ? 'تنخواہ واجب' : 'Salary Due'}</span>
              <span className="font-bold text-emerald-600">
                PKR {analytics.employeeSummary.totalSalaryDue.toLocaleString('en-US')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">{isUrdu ? 'ایڈوانس / پیشگی' : 'Advances'}</span>
              <span className="font-bold text-amber-600">
                PKR {analytics.employeeSummary.totalAdvance.toLocaleString('en-US')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">{isUrdu ? 'ادائیگی تنخواہ' : 'Salary Paid'}</span>
              <span className="font-bold text-rose-600">
                PKR {analytics.employeeSummary.totalSalaryPaid.toLocaleString('en-US')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">{isUrdu ? 'فعال عملہ' : 'Active Staff'}</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {analytics.employeeSummary.activeEmployeesCount}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2">
          <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>{isUrdu ? '6. ریسیونگ پوائنٹ بیلنس' : '6. Receiving Point Balances'}</span>
          </h3>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <div>
              <span className="text-slate-400 block">{isUrdu ? 'وصولی' : 'Received'}</span>
              <span className="font-bold text-emerald-600">
                {analytics.receivingPointsSummary.totalReceived.toLocaleString('en-US')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">{isUrdu ? 'ادائیگی' : 'Paid'}</span>
              <span className="font-bold text-rose-600">
                {analytics.receivingPointsSummary.totalPaid.toLocaleString('en-US')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">{isUrdu ? 'پینڈنگ' : 'Pending'}</span>
              <span className="font-bold text-blue-600">
                {analytics.receivingPointsSummary.totalPending.toLocaleString('en-US')}
              </span>
            </div>
          </div>
          {analytics.receivingPointsSummary.pointsBreakdown.slice(0, 3).map(pt => (
            <div key={pt.id} className="flex justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="truncate text-slate-600 dark:text-slate-300">
                {pt.name} ({pt.city})
              </span>
              <span className="font-bold">PKR {pt.pending.toLocaleString('en-US')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CARD 7 & CARD 8: Bills Summary + Expenses by Category Chart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2">
          <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>{isUrdu ? '7. بلز سمری' : '7. Bills Summary'}</span>
          </h3>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block">{isUrdu ? 'کل بل رقم' : 'Total Billed'}</span>
              <span className="font-black text-slate-900 dark:text-white">
                PKR {analytics.billsSummary.totalBilled.toLocaleString('en-US')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">{isUrdu ? 'بقایا رقم' : 'Pending Balance'}</span>
              <span className="font-black text-rose-600">
                PKR {analytics.billsSummary.totalPendingBalance.toLocaleString('en-US')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              {isUrdu ? 'ادا شدہ' : 'Paid'}: {analytics.billsSummary.paidCount}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              {isUrdu ? 'جزوی' : 'Partial'}: {analytics.billsSummary.partialCount}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
              {isUrdu ? 'باقی' : 'Unpaid'}: {analytics.billsSummary.unpaidCount}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2">
          <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-rose-600" />
            <span>{isUrdu ? '8. اخراجات بلحاظ کیٹیگری' : '8. Expenses by Category'}</span>
          </h3>
          {analytics.expensesByCategory.items.length === 0 ? (
            <p className="text-xs text-slate-400">
              {isUrdu ? 'اس مدت میں کوئی اخراجات نہیں۔' : 'No expenses recorded in this period.'}
            </p>
          ) : (
            <div className="space-y-1.5">
              {analytics.expensesByCategory.items.map(cat => (
                <div key={cat.category} className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold uppercase text-slate-600 dark:text-slate-300">
                      {cat.category}
                    </span>
                    <span className="font-mono font-bold">
                      PKR {cat.amount.toLocaleString('en-US')} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-rose-500"
                      style={{ width: `${Math.max(4, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
