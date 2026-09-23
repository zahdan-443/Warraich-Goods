import React from 'react';
import { BiltyRecord, Language } from '../../types';
import {
  ShieldCheck,
  Building2,
  Calendar,
  Truck,
  User,
  Phone,
  CreditCard,
  MapPin,
  Package,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Receipt,
  Download,
  Share2
} from 'lucide-react';
import { sanitizeContactOrCnic } from '../../utils/biltyHelpers';

interface BiltyVerificationCardProps {
  bilty: BiltyRecord;
  lang: Language;
  onBack?: () => void;
}

export const BiltyVerificationCard: React.FC<BiltyVerificationCardProps> = ({
  bilty,
  lang,
  onBack
}) => {
  const isUrdu = lang === 'ur';

  const fmt = (n?: number) =>
    n !== undefined && n !== null ? n.toLocaleString('en-US') : '0';

  const senderMobile = sanitizeContactOrCnic(bilty.senderMobile);
  const receiverMobile = sanitizeContactOrCnic(bilty.receiverMobile);
  const senderCnic = sanitizeContactOrCnic(bilty.senderCnic);
  const driverMobile = sanitizeContactOrCnic(bilty.mobileNo);

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-top-3">
      {/* Official Status Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-500 shadow-sm text-[#2d3a24] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white font-mono">
                {isUrdu ? 'تصدیق شدہ آفیشل بلٹی' : 'VERIFIED OFFICIAL BILTY'}
              </span>
              <span className="text-xs text-emerald-800 font-mono font-bold">
                {bilty.biltyNo}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-900 font-medium mt-0.5">
              {isUrdu
                ? 'ورائچ گڈز ٹرانسپورٹ کمپنی کے لوڈ ٹریکر سسٹم سے تصدیق شدہ'
                : 'Verified via Warraich Goods Transport Co. Official Load Tracker'}
            </p>
          </div>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100 text-xs font-bold text-emerald-800 cursor-pointer transition-all shrink-0"
          >
            {isUrdu ? 'نئی تصدیق' : 'Back'}
          </button>
        )}
      </div>

      {/* Main Details Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#ecece0] shadow-xs space-y-5">
        {/* Header with Company branding */}
        <div className="flex items-start justify-between border-b border-[#ecece0] pb-4 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#8b9d77]" />
              <h3 className={`font-bold text-lg text-[#4a4a35] ${isUrdu ? 'font-nastaliq' : 'font-serif'}`}>
                {isUrdu ? 'ورائچ گڈز ٹرانسپورٹ کمپنی' : 'Warraich Goods Transport Co.'}
              </h3>
            </div>
            <p className="text-xs text-[#8e8e75]">
              {isUrdu ? 'رجسٹرڈ بلٹی تصدیق پورٹل' : 'Registered Consignment Verification Portal'}
              {bilty.branch && (
                <span className="inline-flex items-center gap-1 mx-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0f2942] text-white">
                  📍 {bilty.branch === 'kamalia' ? (isUrdu ? 'برانچ: کمالیہ' : 'Branch: Kamalia') : (isUrdu ? 'برانچ: سمندری' : 'Branch: Samundri')}
                </span>
              )}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#8e8e75] block">
              {isUrdu ? 'بلٹی نمبر' : 'Bilty No'}
            </span>
            <span className="text-base sm:text-lg font-mono font-bold text-[#4a5e38] bg-[#4a5e38]/10 px-2.5 py-1 rounded-xl inline-block">
              {bilty.biltyNo}
            </span>
          </div>
        </div>

        {/* Dispatch & Route Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ecece0]">
            <span className="text-[11px] font-bold text-[#8e8e75] flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#8b9d77]" />
              {isUrdu ? 'تاریخ بلٹی' : 'Bilty Date'}
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

        {/* Sender & Receiver Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Sender */}
          <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] space-y-2">
            <span className="text-[11px] font-bold text-[#8b9d77] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {isUrdu ? 'مال بھیجنے والا (Consignor)' : 'Consignor (Sender)'}
            </span>
            <h4 className="font-serif font-bold text-sm text-[#4a4a35]">
              {bilty.senderName || bilty.consignor || 'N/A'}
            </h4>
            <div className="space-y-1 text-xs text-[#5a5a40]">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#8e8e75]" />
                <span className="font-mono">{senderMobile}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#8e8e75]" />
                <span className="font-mono text-[11px]">شناختی کارڈ: {senderCnic}</span>
              </div>
            </div>
          </div>

          {/* Receiver */}
          <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] space-y-2">
            <span className="text-[11px] font-bold text-[#8b9d77] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {isUrdu ? 'مال وصول کرنے والا (Consignee)' : 'Consignee (Receiver)'}
            </span>
            <h4 className="font-serif font-bold text-sm text-[#4a4a35]">
              {bilty.receiverName || bilty.consignee || 'N/A'}
            </h4>
            <div className="space-y-1 text-xs text-[#5a5a40]">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#8e8e75]" />
                <span className="font-mono">{receiverMobile}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8e8e75]" />
                <span>شہر: {bilty.receivingCity || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cargo & Shipment Specifications */}
        <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] space-y-3">
          <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2">
            <Package className="w-4 h-4 text-[#8b9d77]" />
            <span className="text-xs font-bold text-[#4a4a35]">
              {isUrdu ? 'تفصیل سامان و کھیپ' : 'Cargo & Freight Details'}
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
                {isUrdu ? 'تعداد نگ / کارٹن' : 'Quantity / Packages'}
              </span>
              <span className="text-xs font-bold text-[#4a4a35] font-mono">
                {bilty.qty || '-'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#ecece0]">
              <span className="text-[10px] text-[#8e8e75] block mb-0.5">
                {isUrdu ? 'وزن (کلوگرام / من)' : 'Weight'}
              </span>
              <span className="text-xs font-bold text-[#4a4a35] font-mono">
                {bilty.weight || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="p-4 rounded-2xl bg-[#4a5e38]/5 border border-[#4a5e38]/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#5a5a40]">
            <span>{isUrdu ? 'کل کرایہ (Grand Total):' : 'Total Freight:'}</span>
            <span className="font-mono font-bold text-[#4a4a35]">Rs {fmt(bilty.total)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-emerald-700">
            <span>{isUrdu ? 'پیشگی ادا شدہ (Advance Paid):' : 'Advance Paid:'}</span>
            <span className="font-mono font-bold">Rs {fmt(bilty.advance)}</span>
          </div>

          <div className="pt-2 border-t border-[#4a5e38]/20 flex items-center justify-between text-sm font-bold text-[#4a5e38]">
            <span>{isUrdu ? 'بقایا واجب الادا (Payable on Delivery):' : 'Payable on Delivery:'}</span>
            <span className="font-mono text-base">Rs {fmt(bilty.payable)}</span>
          </div>
        </div>

        {/* Driver Details Footer */}
        {bilty.driverName && (
          <div className="text-[11px] text-[#8e8e75] flex items-center justify-between pt-1">
            <span>
              {isUrdu ? 'ڈرائیور نام:' : 'Driver:'} <b className="text-[#4a4a35]">{bilty.driverName}</b>
            </span>
            {driverMobile !== 'N/A' && (
              <span className="font-mono">
                {isUrdu ? 'فون:' : 'Phone:'} {driverMobile}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
