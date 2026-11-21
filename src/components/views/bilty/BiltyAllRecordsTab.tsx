import React from 'react';
import {
  Receipt,
  Search,
  Download,
  FileText,
  MapPin,
  Share2,
  FileSpreadsheet,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Trash2,
  Plus,
  ArrowUpDown,
  X,
  PackageCheck,
  Clock,
  ShieldCheck,
  FileArchive,
  RefreshCw,
  Pencil
} from 'lucide-react';
import { BiltyRecord } from '../../../types';
import { countBiltyAttachments } from './biltyVaultUtils';

interface BiltyAllRecordsTabProps {
  isUrdu: boolean;
  bilties: BiltyRecord[];
  filteredBilties: BiltyRecord[];
  dispatchStats: { count: number; deliveredCount: number };
  branchAddress: string;
  allFilterQuery: string;
  deliveryFilter: 'all' | 'delivered' | 'pending';
  sortBy: 'newest' | 'oldest';
  onChangeFilterQuery: (q: string) => void;
  onChangeDeliveryFilter: (f: 'all' | 'delivered' | 'pending') => void;
  onChangeSortBy: (s: 'newest' | 'oldest') => void;
  onExportCsv: () => void;
  onNavigateToCreate: () => void;
  onResetFilters: () => void;
  onInspectBilty: (b: BiltyRecord) => void;
  onPrintBilty: (b: BiltyRecord) => void;
  onDownloadPdf: (b: BiltyRecord) => void;
  onShareWhatsApp: (b: BiltyRecord) => void;
  onOpenVault: (b: BiltyRecord) => void;
  onEditBilty: (b: BiltyRecord) => void;
  onDownloadZip: (b: BiltyRecord) => void;
  onRequestDelete?: (b: BiltyRecord) => void;
}

export const BiltyAllRecordsTab: React.FC<BiltyAllRecordsTabProps> = ({
  isUrdu,
  bilties,
  filteredBilties,
  dispatchStats,
  branchAddress,
  allFilterQuery,
  deliveryFilter,
  sortBy,
  onChangeFilterQuery,
  onChangeDeliveryFilter,
  onChangeSortBy,
  onExportCsv,
  onNavigateToCreate,
  onResetFilters,
  onInspectBilty,
  onPrintBilty,
  onDownloadPdf,
  onShareWhatsApp,
  onOpenVault,
  onEditBilty,
  onDownloadZip,
  onRequestDelete
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Operational Dispatch Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0f2942] text-white border border-[#1a3a5c] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              {isUrdu ? 'کل بلٹیاں' : 'Total Bilties'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {dispatchStats.count}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {isUrdu ? 'تمام محفوظ شدہ بلٹی ریکارڈز' : 'All saved bilty records'}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {isUrdu ? 'سمندری آفس' : 'Samundri Office'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-800">
              {dispatchStats.count}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {branchAddress}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {isUrdu ? 'مکمل ڈلیوری (POD)' : 'Delivered'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-700">
              {dispatchStats.deliveredCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {isUrdu ? 'تصدیق شدہ ترسیل' : 'Confirmed deliveries'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls Toolbar */}
      <div className="bg-[#fdfbf7] p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#ecece0] space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={allFilterQuery}
              onChange={(e) => onChangeFilterQuery(e.target.value)}
              placeholder={isUrdu ? 'بلٹی نمبر، گاڑی نمبر، ڈرائیور، یا کسٹمر تلاش کریں...' : 'Search Bilty #, vehicle plate, driver, city...'}
              className="w-full bg-white border border-slate-300 rounded-xl pr-10 pl-9 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#0f2942] focus:outline-none transition-all"
            />
            {allFilterQuery && (
              <button
                type="button"
                onClick={() => onChangeFilterQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onExportCsv}
              className="px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title={isUrdu ? 'تمام بلٹیوں کی مکمل ایکسل شیٹ ڈاؤن لوڈ کریں' : 'Export all bilties to CSV'}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{isUrdu ? 'ایکسل شیٹ (CSV)' : 'Export CSV'}</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToCreate}
              className="px-3.5 py-2 bg-[#0f2942] hover:bg-[#1a3a5c] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>{isUrdu ? 'نئی بلٹی بنائیں' : 'New Bilty'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 ml-1">
              {isUrdu ? 'وصولی (POD):' : 'Delivery:'}
            </span>
            <button
              type="button"
              onClick={() => onChangeDeliveryFilter('all')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                deliveryFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isUrdu ? 'تمام' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => onChangeDeliveryFilter('delivered')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                deliveryFilter === 'delivered'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-white border border-blue-200 text-blue-800 hover:bg-blue-50'
              }`}
            >
              <PackageCheck className="w-3 h-3" />
              <span>{isUrdu ? 'پہنچ گیا (POD)' : 'Delivered'}</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeDeliveryFilter('pending')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                deliveryFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-50'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{isUrdu ? 'جاری شدہ' : 'Issued'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => onChangeSortBy(e.target.value as 'newest' | 'oldest')}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="newest">{isUrdu ? 'تازہ ترین پہلے' : 'Newest First'}</option>
              <option value="oldest">{isUrdu ? 'پرانی بلٹیاں پہلے' : 'Oldest First'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Bilty Records Content */}
      {filteredBilties.length === 0 ? (
        <div className="p-10 text-center bg-[#fdfbf7] rounded-3xl border-2 border-dashed border-[#ecece0] space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-slate-800">
            {bilties.length === 0
              ? (isUrdu ? 'ابھی تک کوئی بلٹی جنریٹ نہیں ہوئی' : 'No Bilties Generated Yet')
              : (isUrdu ? 'فلٹر کے مطابق کوئی بلٹی نہیں ملی' : 'No Bilties Match Your Filters')}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {bilties.length === 0
              ? (isUrdu ? 'نئی بلٹی بنائیں کے بٹن پر کلک کر کے اپنی پہلی آفیشل بلٹی رسید تیار کریں۔' : 'Click "New Bilty" to create your first official consignment bilty.')
              : (isUrdu ? 'براہ کرم سرچ کیورڈ یا فلٹرز تبدیل کر کے دوبارہ کوشش کریں۔' : 'Try clearing your search query or adjusting your filters.')}
          </p>
          {bilties.length === 0 ? (
            <button
              type="button"
              onClick={onNavigateToCreate}
              className="px-5 py-2.5 bg-[#0f2942] hover:bg-[#1a3a5c] text-white rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>{isUrdu ? 'پہلی بلٹی بنائیں' : 'Create First Bilty'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'فلٹرز ری سیٹ کریں' : 'Reset Filters'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Dispatch Table */}
          <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5 text-right">{isUrdu ? 'بلٹی نمبر و تاریخ' : 'Bilty # & Date'}</th>
                  <th className="py-3 px-3 text-right">{isUrdu ? 'آفس / زبان' : 'Office / Lang'}</th>
                  <th className="py-3 px-3 text-right">{isUrdu ? 'گاڑی و ڈرائیور' : 'Vehicle & Driver'}</th>
                  <th className="py-3 px-3 text-right">{isUrdu ? 'روٹ (از ➔ تا)' : 'Route'}</th>
                  <th className="py-3 px-3 text-right">{isUrdu ? 'پارٹیاں (بھیجنے/وصول کنندہ)' : 'Parties'}</th>
                  <th className="py-3 px-3 text-right">{isUrdu ? 'تفصیل مال' : 'Cargo'}</th>
                  <th className="py-3 px-3 text-center">{isUrdu ? 'سٹیٹس' : 'Status'}</th>
                  <th className="py-3 px-3.5 text-center">{isUrdu ? 'کارروائی' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBilties.map((b) => {
                  const vaultCount = countBiltyAttachments(b);
                  return (
                    <tr key={b.id || b.biltyNo} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 px-3.5 font-mono">
                        <div className="font-black text-slate-900 flex items-center gap-1.5">
                          <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[11px]">
                            {b.biltyNo}
                          </span>
                          {b.pendingOnlineNumber && (
                            <span title="آن لائن نمبر التواء">
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                          📅 {b.date || '—'}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0f2942] text-white">
                          📍 سمندری
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {b.language === 'en' ? 'English' : 'اردو'}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800 uppercase font-mono">
                          🚛 {b.vehicleNo}
                        </div>
                        {b.driverName && (
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            {b.driverName} {b.mobileNo ? `(${b.mobileNo})` : ''}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {b.sendingCity || 'سمندری'} <span className="text-slate-400">➔</span> {b.receivingCity || 'منزل'}
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-[180px]">
                        <div className="text-[11px] text-slate-800 truncate" title={`بھیجنے والا: ${b.senderName || b.consignor || '—'}`}>
                          <strong className="text-slate-500">از:</strong> {b.senderName || b.consignor || '—'}
                        </div>
                        <div className="text-[11px] text-slate-800 truncate" title={`وصول کنندہ: ${b.receiverName || b.consignee || '—'}`}>
                          <strong className="text-slate-500">تا:</strong> {b.receiverName || b.consignee || '—'}
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-[150px]">
                        <div className="font-semibold text-slate-800 truncate" title={b.itemDescription || '—'}>
                          {b.itemDescription || '—'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {b.qty ? `${b.qty} • ` : ''}{b.weight ? `${b.weight} kg` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          {b.isDelivered || b.podConfirmation ? (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300"
                              title={b.podConfirmation ? `وصول کنندہ: ${b.podConfirmation.receiverName}` : 'پہنچ گیا'}
                            >
                              <PackageCheck className="w-3 h-3 text-blue-600" />
                              <span>{isUrdu ? 'پہنچ گیا' : 'Delivered'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{isUrdu ? 'جاری شدہ' : 'Issued'}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onInspectBilty(b)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title={isUrdu ? 'بلٹی دیکھیں' : 'View Bilty'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onPrintBilty(b)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 transition-colors cursor-pointer"
                            title={isUrdu ? 'پرنٹ بلٹی' : 'Print Bilty'}
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDownloadPdf(b)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                            title={isUrdu ? 'PDF ڈاؤن لوڈ' : 'Download PDF'}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onShareWhatsApp(b)}
                            className="p-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white transition-colors cursor-pointer"
                            title={isUrdu ? 'واٹس ایپ PDF شیئر' : 'WhatsApp'}
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenVault(b)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer relative"
                            title={isUrdu ? 'قانونی والٹ (دستاویزات و کالز)' : 'Legal Vault'}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {vaultCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                                {vaultCount}
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditBilty(b)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer"
                            title={isUrdu ? 'بلٹی ترمیم کریں' : 'Edit Bilty'}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDownloadZip(b)}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
                            title={isUrdu ? 'ZIP والٹ ڈاؤن لوڈ کریں' : 'Download ZIP Vault'}
                          >
                            <FileArchive className="w-3.5 h-3.5" />
                          </button>
                          {onRequestDelete && (
                            <button
                              type="button"
                              onClick={() => onRequestDelete(b)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                              title={isUrdu ? 'حذف کریں' : 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards */}
          <div className="lg:hidden space-y-3">
            {filteredBilties.map((b) => {
              const vaultCount = countBiltyAttachments(b);
              return (
                <div
                  key={b.id || b.biltyNo}
                  className="bg-white dark:bg-[#1a1c22] rounded-2xl border border-slate-200 dark:border-[#2d313b] p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2d313b] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-900 dark:bg-slate-950 text-white font-mono text-xs font-black px-2.5 py-1 rounded border border-slate-700">
                        {b.biltyNo}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0f2942] text-white">
                        📍 سمندری
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {b.isDelivered || b.podConfirmation ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1">
                          <PackageCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span>{isUrdu ? 'پہنچ گیا' : 'Delivered'}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-[#22252c] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2d313b] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                          <span>{isUrdu ? 'جاری شدہ' : 'Issued'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{isUrdu ? 'گاڑی و ڈرائیور' : 'Vehicle & Driver'}</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-slate-100 uppercase">{b.vehicleNo}</div>
                      {b.driverName && <div className="text-slate-600 dark:text-slate-300 text-[11px] truncate">{b.driverName}</div>}
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{isUrdu ? 'روٹ' : 'Route'}</div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {b.sendingCity || 'سمندری'} ➔ {b.receivingCity || 'منزل'}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{b.date || '—'}</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#121316] rounded-xl p-2.5 text-[11px] space-y-1 border border-slate-200/50 dark:border-[#2d313b] text-slate-800 dark:text-slate-200">
                    <div className="truncate">
                      <strong className="text-slate-500 dark:text-slate-400">بھیجنے والا:</strong> {b.senderName || b.consignor || '—'}
                    </div>
                    <div className="truncate">
                      <strong className="text-slate-500 dark:text-slate-400">وصول کنندہ:</strong> {b.receiverName || b.consignee || '—'}
                    </div>
                    <div className="truncate text-slate-700 dark:text-slate-300">
                      <strong className="text-slate-500 dark:text-slate-400">مال:</strong> {b.itemDescription || '—'} {b.weight ? `(${b.weight} kg)` : ''}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => onInspectBilty(b)}
                        className="py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#22252c] dark:hover:bg-[#2c3038] text-slate-800 dark:text-slate-200 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors border border-slate-200/60 dark:border-[#2d313b]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>دیکھیں</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onPrintBilty(b)}
                        className="py-2 bg-slate-900 dark:bg-slate-950 text-amber-400 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors border border-amber-400/30"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>پرنٹ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownloadPdf(b)}
                        className="py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors border border-emerald-200 dark:border-emerald-800"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>پی ڈی ایف</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onShareWhatsApp(b)}
                        className="py-2 bg-[#25D366] text-white rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>واٹس ایپ PDF</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEditBilty(b)}
                        className="py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 rounded-xl text-[11px] font-bold flex flex-row items-center justify-center gap-1 cursor-pointer transition-colors border border-indigo-200 dark:border-indigo-800"
                      >
                        <Pencil className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>{isUrdu ? 'ترمیم' : 'Edit'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenVault(b)}
                        className="py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded-xl text-[11px] font-bold flex flex-row items-center justify-center gap-1 cursor-pointer transition-colors relative border border-blue-200 dark:border-blue-800"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>والٹ</span>
                        {vaultCount > 0 && (
                          <span className="bg-blue-600 text-white text-[9px] px-1 rounded-full font-bold">
                            {vaultCount}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownloadZip(b)}
                        className="py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 rounded-xl text-[11px] font-bold flex flex-row items-center justify-center gap-1 cursor-pointer transition-colors border border-amber-200 dark:border-amber-800"
                      >
                        <FileArchive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>ZIP</span>
                      </button>
                      {onRequestDelete ? (
                        <button
                          type="button"
                          onClick={() => onRequestDelete(b)}
                          className="py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl text-[11px] font-bold flex flex-row items-center justify-center gap-1 cursor-pointer transition-colors border border-rose-200 dark:border-rose-800"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          <span>حذف</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onInspectBilty(b)}
                          className="py-2 bg-slate-100 dark:bg-[#22252c] text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-bold flex flex-row items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تصدیق</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
