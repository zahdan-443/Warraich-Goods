import React from 'react';
import { X, ShieldCheck, Lock, Eye, Database, MapPin, Mail, Phone, Building2, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { Language } from '../types';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  if (!isOpen) return null;

  const isUrdu = lang === 'ur';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className="bg-[#fdfbf7] w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl border border-[#ecece0] flex flex-col overflow-hidden text-right relative animate-in zoom-in-95 duration-200"
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
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight">
                {isUrdu ? 'پرائیویسی پالیسی و ڈیٹا سیکیورٹی' : 'Privacy Policy & Data Security'}
              </h2>
              <p className="text-xs text-blue-200 font-sans mt-0.5">
                {isUrdu ? 'ڈرائیور دوست • وڑائچ گڈز ٹرانسپورٹ کمپنی' : 'Driver Dost • Warraich Goods Transport Co.'}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-[#4a4a35] font-sans text-sm leading-relaxed">
          
          {/* Summary Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <span className="font-bold block mb-1">
                {isUrdu ? '100% شفاف اور محفوظ پرائیویسی کا وعدہ' : '100% Private, Secure & Offline-First'}
              </span>
              {isUrdu 
                ? 'ڈرائیور دوست ایپ آپ کے ذاتی یا کاروباری ڈیٹا کو نہ تو کسی تیسرے فریق کو فروخت کرتی ہے اور نہ ہی بغیر اجازت مانیٹر کرتی ہے۔ آپ کا تمام ڈیٹا آپ کے ڈیوائس پر محفوظ رہتا ہے۔'
                : 'Driver Dost does not sell, rent, or trade your personal or logistics data. All trip calculations and fleet logs remain under your device control with TLS-encrypted communications.'}
            </div>
          </div>

          {/* Section 1: Data Collection & Usage */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <Database className="w-4 h-4 text-[#8b9d77]" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '1. کون سا ڈیٹا اکٹھا کیا جاتا ہے؟' : '1. What Information is Collected?'}
              </h3>
            </div>
            <ul className="text-xs text-[#5a5a40] space-y-1.5 list-disc list-inside leading-relaxed">
              <li>
                <strong>{isUrdu ? 'ٹرپ و گاڑی کا ریکارڈ:' : 'Trip & Vehicle Logs:'}</strong> {isUrdu ? 'گاڑی نمبر، ڈیزل خرچ، کرایہ اور روٹ کی تفصیلات جو صارف خود درج کرتا ہے۔' : 'Vehicle number, fuel expenses, and freight calculations voluntarily entered by the user.'}
              </li>
              <li>
                <strong>{isUrdu ? 'لوکل اسٹوریج:' : 'Local Device Storage:'}</strong> {isUrdu ? 'تمام ڈیٹا صارف کی ڈیوائس کے اندر لوکل میموری (IndexedDB / localStorage) میں محفوظ ہوتا ہے۔' : 'All user data is stored locally in device private sandbox storage.'}
              </li>
              <li>
                <strong>{isUrdu ? 'کوئی غیر متعلقہ رسائی نہیں:' : 'No Irrelevant Access:'}</strong> {isUrdu ? 'ایپ ایس ایم ایس، کال لاگز، کنٹیکٹس یا فون گیلری تک کوئی غیر متعلقہ رسائی حاصل نہیں کرتی۔' : 'The app never requests access to SMS, call records, system contacts, or gallery media.'}
              </li>
            </ul>
          </div>

          {/* Section 2: Location & GPS Usage */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <MapPin className="w-4 h-4 text-[#8b9d77]" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '2. لوکیشن اور جی پی ایس کا استعمال' : '2. Location & GPS Data Usage'}
              </h3>
            </div>
            <p className="text-xs text-[#5a5a40] leading-relaxed">
              {isUrdu
                ? 'جی پی ایس (GPS) صرف اس وقت استعمال ہوتا ہے جب آپ خود روٹ کیلکولیٹر یا میپ پر "موجودہ لوکیشن حاصل کریں" پر کلک کرتے ہیں۔ یہ صرف قریب ترین ٹول پلازہ اور لائیو فاصلہ جانچنے کے لیے آن ڈیمانڈ استعمال ہوتا ہے اور پس منظر (Background) میں بغیر اجازت کبھی ٹریک نہیں کیا جاتا۔'
                : 'GPS location is accessed strictly on-demand when you explicitly request current location for routing, live distance calculation, or nearest toll plaza estimation. It is never tracked silently in the background.'}
            </p>
          </div>

          {/* Section 3: Data Security & Encryption */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <Lock className="w-4 h-4 text-[#8b9d77]" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '3. ڈیٹا سیکیورٹی اور انکرپشن' : '3. Security & Data Protection'}
              </h3>
            </div>
            <p className="text-xs text-[#5a5a40] leading-relaxed">
              {isUrdu
                ? 'تمام نیٹ ورک ٹرانزیکشنز اور کلاؤڈ سنک انڈسٹری معیار کے TLS 1.3 / HTTPS کے ذریعے مکمل طور پر انکرپٹڈ ہیں۔ صارفین کے مالیاتی حسابات اور شناختی معلومات کو کسی بھی پبلک پلیٹ فارم پر ظاہر نہیں کیا جاتا۔'
                : 'All network transmissions utilize standard TLS 1.3 / HTTPS encryption. Financial calculations and identifiers are kept confidential and protected from unauthorized external access.'}
            </p>
          </div>

          {/* Section 4: User Rights & Data Deletion */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <FileText className="w-4 h-4 text-[#8b9d77]" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '4. ڈیٹا کنٹرول، ایکسپورٹ اور ڈیلیشن' : '4. User Data Ownership & Deletion'}
              </h3>
            </div>
            <p className="text-xs text-[#5a5a40] leading-relaxed">
              {isUrdu
                ? 'آپ کو اپنے ڈیٹا پر مکمل اختیار حاصل ہے۔ آپ جب چاہیں ایپ کے سائیڈ مینیو سے "ڈیٹا بیک اپ و پرائیویسی" کے ذریعے اپنا ڈیٹا ماسک کر کے ڈاؤن لوڈ کر سکتے ہیں یا تمام ریکارڈز کو ڈیوائس سے فوری حذف (Delete) کر سکتے ہیں۔'
                : 'You retain full ownership of your records. You can export your data with custom privacy filters (CNIC/Phone masking) or purge/delete all local records anytime via the settings menu.'}
            </p>
          </div>

          {/* Section 5: Developer Contact & Legal Compliance */}
          <div className="bg-gradient-to-br from-[#f7f5ed] to-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '5. رابطہ برائے پرائیویسی سوالات' : '5. Contact & Administrator Details'}
              </h3>
            </div>
            <div className="text-xs text-[#5a5a40] space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#8b9d77] shrink-0" />
                <span><strong>{isUrdu ? 'کمپنی:' : 'Entity:'}</strong> {isUrdu ? 'وڑائچ گڈز ٹرانسپورٹ کمپنی' : 'Warraich Goods Transport Company'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>{isUrdu ? 'آفیشل ای میل:' : 'Official Email:'}</strong> <span className="dir-ltr font-mono font-bold text-[#1e3a68]">warraichgoods43@gmail.com</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>{isUrdu ? 'ہیلپ لائن / فون:' : 'Phone / Contact:'}</strong> <span className="dir-ltr font-bold text-[#1e3a68]">0300-5370443</span></span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f0f0e4] border-t border-[#ecece0] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#7a7a60] font-medium">
            {isUrdu ? 'ڈرائیور دوست • ورژن 1.0.2 • مستند و محفوظ' : 'Driver Dost • Version 1.0.2 • Verified & Compliant'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1e3a68] hover:bg-[#162a4d] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            {isUrdu ? 'سمجھ آ گئی / بند کریں' : 'Understood / Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
