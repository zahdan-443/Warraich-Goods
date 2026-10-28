import React from 'react';
import { BiltyRecord, Language } from '../../types';
import {
  ShieldCheck,
  Building2,
  Calendar,
  Truck,
  MapPin,
  Package,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface BiltyVerificationCardProps {
  bilty: Partial<BiltyRecord>;
  lang: Language;
  onBack?: () => void;
}

export const BiltyVerificationCard: React.FC<BiltyVerificationCardProps> = ({
  bilty,
  lang,
  onBack
}) => {
  const isUrdu = lang === 'ur';

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-top-3">
      {/* Official Verification Status Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-500 shadow-xs text-[#2d3a24] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-700 text-white font-mono">
                {isUrdu ? 'تصدیق شدہ پبلک ریکارڈ' : 'PUBLICLY VERIFIED RECORD'}
              </span>
              <span className="text-xs text-emerald-900 font-mono font-bold">
                {bilty.biltyNo}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-900 font-medium mt-0.5">
              {isUrdu
                ? 'ورائچ گڈز ٹرانسپورٹ کمپنی کا تصدیق شدہ آرڈر کیریئر لاگ'
                : 'Verified via Warraich Goods Transport Co. Official Public System'}
            </p>
          </div>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100 text-xs font-bold text-emerald-800 cursor-pointer transition-all shrink-0"
          >
            {isUrdu ? 'واپس' : 'Back'}
          </button>
        )}
      </div>

      {/* Main Public Verification Card - Strictly Non-PII & Non-Financial */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#ecece0] shadow-xs space-y-5">
        {/* Header with Branding */}
        <div className="flex items-start justify-between border-b border-[#ecece0] pb-4 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#8b9d77]" />
              <h3 className={`font-bold text-base sm:text-lg text-[#4a4a35] ${isUrdu ? 'font-nastaliq' : 'font-serif'}`}>
                {isUrdu ? 'ورائچ گڈز ٹرانسپورٹ کمپنی' : 'Warraich Goods Transport Co.'}
              </h3>
            </div>
            <p className="text-xs text-[#8e8e75]">
              {isUrdu ? 'پبلک کیریئر و باربرداری ریکارڈ' : 'Public Transport Verification Registry'}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#8e8e75] block">
              {isUrdu ? 'نمبر' : 'Bilty No'}
            </span>
            <span className="text-sm sm:text-base font-mono font-bold text-[#4a5e38] bg-[#4a5e38]/10 px-2.5 py-1 rounded-xl inline-block">
              {bilty.biltyNo || 'N/A'}
            </span>
          </div>
        </div>

        {/* Dispatch & Route Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ecece0]">
            <span className="text-[11px] font-bold text-[#8e8e75] flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#8b9d77]" />
              {isUrdu ? 'تاریخ' : 'Date'}
            </span>
            <p className="font-mono text-xs sm:text-sm font-bold text-[#4a4a35]">
              {bilty.date || '-'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ecece0]">
            <span className="text-[11px] font-bold text-[#8e8e75] flex items-center gap-1 mb-1">
              <Truck className="w-3.5 h-3.5 text-[#8b9d77]" />
              {isUrdu ? 'گاڑی نمبر' : 'Vehicle No'}
            </span>
            <p className="font-mono text-xs sm:text-sm font-bold text-[#4a4a35]">
              {bilty.vehicleNo || '-'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ecece0]">
            <span className="text-[11px] font-bold text-[#8e8e75] flex items-center gap-1 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#8b9d77]" />
              {isUrdu ? 'روٹ (شہر)' : 'Route'}
            </span>
            <p className="text-xs sm:text-sm font-bold text-[#4a4a35]">
              {bilty.sendingCity || '-'} {isUrdu ? 'تا' : 'to'} {bilty.receivingCity || '-'}
            </p>
          </div>
        </div>

        {/* Cargo & Shipment Specifications */}
        <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] space-y-3">
          <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2">
            <Package className="w-4 h-4 text-[#8b9d77]" />
            <span className="text-xs font-bold text-[#4a4a35]">
              {isUrdu ? 'تفصیل سامان و کھیپ' : 'Cargo Specifications'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-white border border-[#ecece0]">
              <span className="text-[10px] text-[#8e8e75] block mb-0.5">
                {isUrdu ? 'تفصیل مال' : 'Description'}
              </span>
              <span className="text-xs font-bold text-[#4a4a35]">
                {bilty.itemDescription || 'جنرل کارگو'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#ecece0]">
              <span className="text-[10px] text-[#8e8e75] block mb-0.5">
                {isUrdu ? 'تعداد نگ / کارٹن' : 'Quantity'}
              </span>
              <span className="text-xs font-bold text-[#4a4a35] font-mono">
                {bilty.qty || '-'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#ecece0]">
              <span className="text-[10px] text-[#8e8e75] block mb-0.5">
                {isUrdu ? 'وزن' : 'Weight'}
              </span>
              <span className="text-xs font-bold text-[#4a4a35] font-mono">
                {bilty.weight || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Privacy Assurance Notice */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2 text-slate-600 text-[11px]">
          <Lock className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            {isUrdu
              ? 'سیکیورٹی و تحفظ پرائیویسی: عوامی تصدیق میں نام، فون نمبر، شناختی کارڈ اور مالیاتی رقوم ظاہر نہیں کی جاتیں۔'
              : 'Privacy Protection: Public verifications strictly sanitize personal identity details and financial amounts.'}
          </span>
        </div>
      </div>
    </div>
  );
};
