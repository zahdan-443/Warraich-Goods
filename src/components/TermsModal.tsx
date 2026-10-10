import React from 'react';
import { X, FileText, ShieldAlert, CheckCircle2, MapPin, Building2, ExternalLink } from 'lucide-react';
import { Language } from '../types';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  if (!isOpen) return null;
  const isUrdu = lang === 'ur';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className={`bg-[#fdfbf7] w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl border border-[#ecece0] flex flex-col overflow-hidden ${isUrdu ? 'text-right' : 'text-left'} relative animate-in zoom-in-95 duration-200`}
        dir={isUrdu ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#162a4d] via-[#1e3a68] to-[#162a4d] p-5 sm:p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className={`absolute top-4 ${isUrdu ? 'left-4' : 'right-4'} p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer`}
            title={isUrdu ? 'بند کریں' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight">
                {isUrdu ? 'شرائط و ضوابط (Terms & Conditions)' : 'Terms & Conditions'}
              </h2>
              <p className="text-xs text-blue-200 font-sans mt-0.5">
                {isUrdu ? 'ڈرائیور دوست • گوگل پلے و پام اسٹور پالیسی تعمیل' : 'Driver Dost • Google Play & Palm Store Policy Compliant'}
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-[#4a4a35] font-sans text-sm leading-relaxed">
          {/* Official Disclaimer */}
          <div className="bg-amber-50/90 border border-amber-300/80 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <span className="font-bold block mb-1">
                {isUrdu ? 'سرکاری عدم وابستگی کا قانونی اعلان (Government App Policy Disclaimer)' : 'Official Government Affiliation Disclaimer'}
              </span>
              {isUrdu
                ? 'ڈرائیور دوست ایک خود مختار، نجی روڈ فریٹ اور فلیٹ مینجمنٹ سسٹم ہے جس کی ملکیت اور انتظام وڑائچ گڈز ٹرانسپورٹ کمپنی کے پاس ہے۔ یہ ایپ کسی سرکاری ادارے یا حکومتِ پاکستان سے الحاق نہیں رکھتی۔'
                : 'Driver Dost is an independent private road freight utility developed and managed by Warraich Goods Transport Company. It does not represent or affiliate with any government entity.'}
            </div>
          </div>

          {/* Section 1: Location & Permissions */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <MapPin className="w-4 h-4 text-[#8b9d77]" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '1. لوکیشن پرمشن اور لائیو موسم (Location & Live Weather)' : '1. Location Permission & Live Weather'}
              </h3>
            </div>
            <p className="text-xs text-[#5a5a40] leading-relaxed">
              {isUrdu
                ? 'ایپ میں موجودہ لوکیشن کا استعمال 100% اختیاری ہے۔ موسم اور قریبی روٹ جانچنے کے لیے جی پی ایس صرف اس وقت فعال ہوتا ہے جب آپ خود بٹن دبائیں۔ اگر آپ لوکیشن کی اجازت نہ دینا چاہیں تب بھی آپ پاکستان کے تمام شہروں کی مکمل فہرست سے کسی بھی شہر کا انتخاب کر کے بغیر کسی رکاوٹ کے ایپ استعمال کر سکتے ہیں۔'
                : 'Foreground location access is strictly optional and on-demand. GPS is only triggered when you click the location button. If permission is denied, you can freely select any city from the master dropdown list.'}
            </p>
          </div>

          {/* Section 2: Fair Use & Safety */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '2. روڈ سیفٹی اور ٹریفک قوانین کی پاسداری' : '2. Road Safety & Compliance'}
              </h3>
            </div>
            <p className="text-xs text-[#5a5a40] leading-relaxed">
              {isUrdu
                ? 'ڈرائیور حضرات دورانِ ڈرائیونگ موبائل کے غیر ضروری استعمال سے گریز کریں۔ ٹرپ اور ڈیزل کیلکولیٹر کا تخمینہ عام روڈ صورتحال کے مطابق ہوتا ہے، حتمی سفری فیصلے موٹروے پولیس (NHMP) کے احکامات اور ٹریفک قوانین کے تحت کریں۔'
                : 'Drivers are advised to observe all highway safety guidelines and avoid using mobile devices while driving. Toll and fuel calculations are estimates; always adhere to official NHMP rules.'}
            </p>
          </div>

          {/* Section 3: External Links & Publisher */}
          <div className="bg-[#fdfbf7] p-4 rounded-2xl border border-[#ecece0] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#4a4a35] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#8b9d77]" />
                <span>{isUrdu ? 'وڑائچ گڈز ٹرانسپورٹ کمپنی · سمندری، فیصل آباد' : 'Warraich Goods Transport Co. · Faisalabad'}</span>
              </span>
              <a
                href="./terms.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1e3a68] font-bold hover:underline flex items-center gap-1"
              >
                <span>{isUrdu ? 'مکمل ویب شرائط' : 'Full Web Terms'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f0f0e4] border-t border-[#ecece0] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#7a7a60] font-medium">
            {isUrdu ? 'ڈرائیور دوست • بااعتماد شرائط' : 'Driver Dost • Standard Terms'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#1e3a68] hover:bg-[#162a4d] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            {isUrdu ? 'قبول ہے / بند کریں' : 'Accept / Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
