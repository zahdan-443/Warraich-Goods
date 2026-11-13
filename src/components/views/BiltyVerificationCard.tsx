import React, { useState } from 'react';
import { BiltyRecord, Language } from '../../types';
import { PublicBiltyVerification } from '../../utils/storage';
import {
  Building2,
  Calendar,
  Truck,
  MapPin,
  Package,
  CheckCircle2,
  Phone,
  Copy,
  Check,
  Share2
} from 'lucide-react';
import { getBiltyVerificationUrl } from '../../utils/biltyHelpers';

interface BiltyVerificationCardProps {
  bilty: Partial<PublicBiltyVerification> & Partial<BiltyRecord>;
  lang: Language;
  onBack?: () => void;
}

export const BiltyVerificationCard: React.FC<BiltyVerificationCardProps> = ({
  bilty,
  lang,
  onBack
}) => {
  const isUrdu = lang === 'ur';
  const [copiedLink, setCopiedLink] = useState(false);

  const biltyNo = String(bilty.biltyNo || '').trim().toUpperCase();
  const biltyDate = String(bilty.biltyDate || bilty.date || '').trim() || '-';
  const origin = String(bilty.origin || bilty.sendingCity || '').trim() || '-';
  const destination = String(bilty.destination || bilty.receivingCity || '').trim() || '-';
  const goodsDescription =
    String(bilty.goodsDescription || bilty.itemDescription || '').trim() ||
    (isUrdu ? 'جنرل کارگو' : 'General Cargo');
  const combinedWeightOrQty = [bilty.qty, bilty.weight]
    .map((v) => (v !== undefined && v !== null ? String(v).trim() : ''))
    .filter(Boolean)
    .join(' / ');
  const weightOrQty = String(bilty.weightOrQty || combinedWeightOrQty || '').trim() || '-';
  const vehicleNo = String(bilty.vehicleNo || '').trim() || '-';

  const verificationUrl = getBiltyVerificationUrl(biltyNo);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = isUrdu
      ? `ورائچ گڈز ٹرانسپورٹ کمپنی - تصدیق شدہ بلٹی نمبر ${biltyNo}\nتاریخ: ${biltyDate}\nگاڑی نمبر: ${vehicleNo}\nروٹ: ${origin} تا ${destination}\nمال: ${goodsDescription} (${weightOrQty})\nتصدیقی لنک:\n${verificationUrl}`
      : `Warraich Goods Transport Co. - Verified Bilty #${biltyNo}\nDate: ${biltyDate}\nVehicle: ${vehicleNo}\nRoute: ${origin} to ${destination}\nGoods: ${goodsDescription} (${weightOrQty})\nVerification Link:\n${verificationUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-top-3">
      {/* Official Status Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-500 shadow-sm text-[#2d3a24] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-700 text-white font-mono">
                {isUrdu ? 'تصدیق شدہ آفیشل بلٹی' : 'VERIFIED OFFICIAL BILTY'}
              </span>
              <span className="text-xs text-emerald-900 font-mono font-bold">
                {biltyNo}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-950 font-medium mt-0.5">
              {isUrdu
                ? 'ورائچ گڈز ٹرانسپورٹ کمپنی کے آفیشل ریکارڈ سے تصدیق شدہ'
                : 'Verified via Warraich Goods Transport Co. Official System'}
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
              {isUrdu ? 'رجسٹرڈ بلٹی تصدیق پورٹل' : 'Registered Bilty Verification Portal'}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-[#8e8e75] block">
              {isUrdu ? 'بلٹی نمبر' : 'Bilty No'}
            </span>
            <span className="text-base sm:text-lg font-mono font-bold text-[#4a5e38] bg-[#4a5e38]/10 px-2.5 py-1 rounded-xl inline-block">
              {biltyNo}
            </span>
          </div>
        </div>

        {/* Route & Vehicle Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ecece0]">
            <span className="text-[11px] font-bold text-[#8e8e75] flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#8b9d77]" />
              {isUrdu ? 'تاریخ بلٹی' : 'Bilty Date'}
            </span>
            <p className="font-mono text-xs sm:text-sm font-bold text-[#4a4a35]">
              {biltyDate}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ecece0]">
            <span className="text-[11px] font-bold text-[#8e8e75] flex items-center gap-1 mb-1">
              <Truck className="w-3.5 h-3.5 text-[#8b9d77]" />
              {isUrdu ? 'گاڑی نمبر' : 'Vehicle No'}
            </span>
            <p className="font-mono text-xs sm:text-sm font-bold text-[#4a4a35]">
              {vehicleNo}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ecece0]">
            <span className="text-[11px] font-bold text-[#8e8e75] flex items-center gap-1 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#8b9d77]" />
              {isUrdu ? 'مقام روانگی (Origin)' : 'Origin'}
            </span>
            <p className="text-xs sm:text-sm font-bold text-[#4a4a35]">
              {origin}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ecece0]">
            <span className="text-[11px] font-bold text-[#8e8e75] flex items-center gap-1 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#8b9d77]" />
              {isUrdu ? 'منزل مقصود (Destination)' : 'Destination'}
            </span>
            <p className="text-xs sm:text-sm font-bold text-[#4a4a35]">
              {destination}
            </p>
          </div>
        </div>

        {/* Cargo Specifications */}
        <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] space-y-3">
          <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2">
            <Package className="w-4 h-4 text-[#8b9d77]" />
            <span className="text-xs font-bold text-[#4a4a35]">
              {isUrdu ? 'تفصیل سامان' : 'Cargo & Goods Details'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-center">
            <div className="p-3 rounded-xl bg-white border border-[#ecece0]">
              <span className="text-[10px] text-[#8e8e75] block mb-0.5">
                {isUrdu ? 'تفصیل مال' : 'Goods Description'}
              </span>
              <span className="text-xs font-bold text-[#4a4a35]">
                {goodsDescription}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#ecece0]">
              <span className="text-[10px] text-[#8e8e75] block mb-0.5">
                {isUrdu ? 'وزن / تعداد' : 'Weight / Qty'}
              </span>
              <span className="text-xs font-bold text-[#4a4a35] font-mono">
                {weightOrQty}
              </span>
            </div>
          </div>
        </div>

        {/* Official 24/7 Helpline and Call Buttons */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <span className="font-bold text-slate-800">
                {isUrdu ? 'ورائچ گڈز 24/7 آفیشل ہیلپ لائن:' : 'Warraich Goods 24/7 Helpline:'}
              </span>
              <p className="text-[11px] text-slate-500">
                {isUrdu ? 'کسی بھی معلومات یا تصدیق کے لیے رابطہ کریں' : 'Contact for consignment verification and support'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="tel:03005370443"
              className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-mono font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <Phone className="w-3 h-3 text-emerald-600" />
              <span>0300-5370443</span>
            </a>
            <a
              href="tel:03395370443"
              className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-mono font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <Phone className="w-3 h-3 text-emerald-600" />
              <span>0339-5370443</span>
            </a>
          </div>
        </div>

        {/* Action Buttons: WhatsApp Share & Copy Link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-3 bg-white hover:bg-slate-50 border border-[#ecece0] text-[#4a4a35] rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs active:scale-98"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#8e8e75]" />}
            <span>{copiedLink ? (isUrdu ? 'لنک کاپی ہو گیا' : 'Link Copied!') : (isUrdu ? 'تصدیقی لنک کاپی کریں' : 'Copy Verification Link')}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-98"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span>{isUrdu ? 'واٹس ایپ پر شیئر کریں' : 'Share on WhatsApp'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
