import React from 'react';
import { X, FileText, ShieldAlert, CheckCircle2, MapPin, Building2, ExternalLink, Bell, AlertTriangle, Fuel, ShieldCheck } from 'lucide-react';
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
                {isUrdu ? 'ڈرائیور دوست • گوگل پلے و پام اسٹور پالیسی تعمیل (2026 ایڈیشن)' : 'Driver Dost • Google Play & Palm Store Policy Compliant'}
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
                {isUrdu ? '1. لوکیشن پرمشن اور لائیو موسم (Location & Weather)' : '1. Location Permission & Live Weather'}
              </h3>
            </div>
            <p className="text-xs text-[#5a5a40] leading-relaxed">
              {isUrdu
                ? 'ایپ میں موجودہ لوکیشن کا استعمال 100% اختیاری ہے۔ موسم اور قریبی روٹ جانچنے کے لیے جی پی ایس صرف اس وقت فعال ہوتا ہے جب آپ خود بٹن دبائیں۔ اگر آپ لوکیشن کی اجازت نہ دینا چاہیں تب بھی آپ پاکستان کے تمام شہروں کی مکمل فہرست سے کسی بھی شہر کا انتخاب کر کے بغیر کسی رکاوٹ کے ایپ استعمال کر سکتے ہیں۔ لوکیشن پس منظر (Background) میں بغیر ضرورت ہرگز ٹریک نہیں کی جاتی۔'
                : 'Foreground location access is strictly optional and on-demand. GPS is only triggered when you click the location button. If permission is denied, you can freely select any city from the master dropdown list. Background location is never silently tracked.'}
            </p>
          </div>

          {/* Section 2: Daily Notifications & System Alerts (NEW STORE AUDIT CLAUSE) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <Bell className="w-4 h-4 text-amber-600" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '2. روزانہ نوٹیفکیشنز و الرٹس پالیسی (Daily Alerts & Anti-Spam)' : '2. Daily Push Notifications & Anti-Spam Policy'}
              </h3>
            </div>
            <p className="text-xs text-[#5a5a40] leading-relaxed">
              {isUrdu
                ? 'ایپ کے روزانہ نوٹیفکیشنز (پیٹرول و ڈیزل کے سرکاری نرخ، موسمی حدِ نگاہ، اور روڈ صورتحال) خالصتاً معلوماتی (Utility Digest) ہیں۔ اینڈرائیڈ 13+ پالیسی کے تحت یہ نوٹیفکیشنز صارف کی پیشگی اجازت کے بغیر جاری نہیں ہوتے۔ ایپ دن میں زیادہ سے زیادہ ایک مرتبہ یا سرکاری نرخوں میں تبدیلی پر الرٹ جاری کرتی ہے، جس میں کوئی کمرشل یا تشہیری سپیم شامل نہیں ہوتا۔ صارف کسی بھی وقت ہوم اسکرین، نوٹیفکیشن مینو یا ڈیوائس سیٹنگز سے ان الرٹس کو آن یا آف کر سکتا ہے۔'
                : 'Daily push notifications (official OGRA/PSO fuel rates, weather visibility, road advisories) are strictly informational utility digests. Under Android 13+ guidelines, notifications require user consent. The app enforces an anti-spam rate limit (max 1 daily update), contains zero commercial advertising, and can be toggled on/off anytime in-app or via device settings.'}
            </p>
          </div>

          {/* Section 3: Road Hazard Advisories & User Reports (NEW STORE AUDIT CLAUSE) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '3. روڈ ہیزرڈ الرٹس اور صارفین کی رپورٹس (Crowdsourced Road Advisories)' : '3. Road Advisories & User Hazard Reports'}
              </h3>
            </div>
            <p className="text-xs text-[#5a5a40] leading-relaxed">
              {isUrdu
                ? 'ایپ میں موٹروے و جی ٹی روڈ پر دھند، راستے کی بندش، یا حادثات کی رپورٹس کمیونٹی ڈرائیورز کی طرف سے عمومی آگاہی کے لیے شیئر کی جاتی ہیں۔ ڈرائیور دوست یا کمپنی کسی غیر متوقع روڈ بلاک، موسمی تبدیلی، یا ٹریفک تاخیر کے نقصانات کی قانونی ذمہ دار نہیں ہوگی۔ ڈرائیور حضرات نیشنل ہائی ویز اینڈ موٹروے پولیس (NHMP) کے آفیشل ہیلپ لائن 130 کے اعلانات کی پابندی کریں۔'
                : 'Highway road hazard advisories (fog, accidents, road blockages) are contributed by transport peers for situational awareness. Driver Dost and the publisher do not accept liability for unexpected route delays or road closures. Drivers must always obey official NHMP directives (Helpline 130).'}
            </p>
          </div>

          {/* Section 4: Fuel Pricing & Benchmarks */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <Fuel className="w-4 h-4 text-emerald-600" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '4. سرکاری پیٹرولیم نرخ (OGRA / PSO Benchmark Rates)' : '4. Official Petroleum Benchmarks'}
              </h3>
            </div>
            <p className="text-xs text-[#5a5a40] leading-relaxed">
              {isUrdu
                ? 'ایپ میں دکھائے جانے والے ڈیزل، سپر پیٹرول، اور لائٹ ڈیزل کے ریٹس اوگرا اور پی ایس او کے سرکاری نوٹیفکیشنز کے مطابق مرکزی فریٹ حسابات کے لیے پیش کیے جاتے ہیں۔ مختلف علاقوں کے نجی پمپوں پر معمولی مقامی فرق ممکن ہو سکتا ہے۔'
                : 'Fuel prices displayed (High Speed Diesel, Petrol, etc.) represent official OGRA and PSO notifications for freight standard calculations. Marginal regional variances at retail pumps may exist.'}
            </p>
          </div>

          {/* Section 5: Road Safety & Distraction Prevention */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '5. دورانِ ڈرائیونگ موبائل فون کے استعمال پر پابندی' : '5. Hands-Free & Driver Safety Compliance'}
              </h3>
            </div>
            <p className="text-xs text-[#5a5a40] leading-relaxed">
              {isUrdu
                ? 'ڈرائیور حضرات کے لیے دورانِ ڈرائیونگ موبائل کے کسی بھی قسم کے دستی استعمال کی سختی سے ممانعت ہے۔ تمام ٹرپ کیلکولیشنز، ٹول تخمینہ اور وائس نوٹس گاڑی روانہ کرنے سے قبل یا گاڑی روک کر محفوظ جگہ پر استعمال کریں۔'
                : 'Drivers are strictly prohibited from manually interacting with the device while operating a moving vehicle. Complete all trip planning, toll calculations, and log reviews before departure.'}
            </p>
          </div>

          {/* Section 6: Data Ownership & Offline Sandbox */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <ShieldCheck className="w-4 h-4 text-[#8b9d77]" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '6. ڈیٹا کی ملکیت اور آف لائن سیکیورٹی' : '6. Data Ownership & Offline Sandbox'}
              </h3>
            </div>
            <p className="text-xs text-[#5a5a40] leading-relaxed">
              {isUrdu
                ? 'آپ کی گاڑیوں، کھاتہ، اور بلٹی کا تمام ڈیٹا آپ کی ذاتی ڈیوائس کے اندر لوکل میموری میں محفوظ رہتا ہے اور آپ جب چاہیں ڈیٹا کو ڈیوائس سے مکمل صاف (Purge) کر سکتے ہیں۔'
                : 'All trip logs, driver accounts, and vehicle calculations remain strictly within your device local sandbox storage. You retain total ownership to export or purge your data anytime.'}
            </p>
          </div>

          {/* Section 7: External Links & Publisher */}
          <div className="bg-[#fdfbf7] p-4 rounded-2xl border border-[#ecece0] space-y-2 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-[#4a4a35] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#8b9d77]" />
                <span>{isUrdu ? 'وڑائچ گڈز ٹرانسپورٹ کمپنی · سمندری، فیصل آباد، پاکستان' : 'Warraich Goods Transport Co. · Faisalabad, Pakistan'}</span>
              </span>
              <a
                href="./terms.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1e3a68] font-bold hover:underline flex items-center gap-1"
              >
                <span>{isUrdu ? 'مکمل ویب شرائط (Web Terms)' : 'Full Web Terms'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f0f0e4] border-t border-[#ecece0] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#7a7a60] font-medium">
            {isUrdu ? 'ڈرائیور دوست • بااعتماد شرائط (ورژن 1.2.0)' : 'Driver Dost • Standard Terms (v1.2.0)'}
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
