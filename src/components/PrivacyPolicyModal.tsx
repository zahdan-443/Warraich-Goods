import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Lock, Database, MapPin, Mail, Phone, Building2, CheckCircle2, FileText, Bell, Video, AlertTriangle, Globe, Trash2, UserCheck, Languages, ExternalLink } from 'lucide-react';
import { Language } from '../types';
import { APP_VERSION } from '../constants/version';
import { auth } from '../utils/firebase';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  userEmail?: string;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  lang,
  userEmail
}) => {
  const [selectedLang, setSelectedLang] = useState<Language>(lang);

  useEffect(() => {
    setSelectedLang(lang);
  }, [lang]);

  if (!isOpen) return null;

  const isUrdu = selectedLang === 'ur';
  const currentUserEmail = userEmail || auth.currentUser?.email || '';
  const deletionEmailBody = `Please delete all cloud data associated with my account: ${currentUserEmail || '[USER_EMAIL_IF_SIGNED_IN_OR_BLANK]'}`;
  const deletionMailtoUrl = `mailto:warraichgoods43@gmail.com?subject=${encodeURIComponent('Driver Dost - Request')}&body=${encodeURIComponent(deletionEmailBody)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className={`bg-[#fdfbf7] w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl border border-[#ecece0] flex flex-col overflow-hidden ${isUrdu ? 'text-right' : 'text-left'} relative animate-in zoom-in-95 duration-200`}
        dir={isUrdu ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#162a4d] via-[#1e3a68] to-[#162a4d] p-5 sm:p-6 text-white relative shrink-0">
          <div className={`absolute top-4 ${isUrdu ? 'left-4' : 'right-4'} flex items-center gap-2`}>
            <button
              onClick={() => setSelectedLang(isUrdu ? 'en' : 'ur')}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
              title={isUrdu ? 'Switch to English' : 'اردو میں دیکھیں'}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'English' : 'اردو'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title={isUrdu ? 'بند کریں' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 pr-24">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight">
                {isUrdu ? 'پرائیویسی پالیسی و ڈیٹا تحفظ' : 'Privacy Policy & Data Protection'}
              </h2>
              <p className="text-xs text-blue-200 font-sans mt-0.5">
                Driver Dost · Warraich Goods Transport Co. · v{APP_VERSION} · 24 October 2026
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-[#4a4a35] font-sans text-sm leading-relaxed">
          
          {/* Badge & Summary Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <span className="font-bold block mb-1">
                {isUrdu ? 'آف لائن فرسٹ (Offline-First) • پرائیویسی کا وعدہ' : 'Offline-First • Privacy Commitment'}
              </span>
              {isUrdu 
                ? 'ڈرائیور دوست ایپ میں بنیادی ریکارڈ آپ کی ڈیوائس پر محفوظ رہتا ہے۔ ہم آپ کا ڈیٹا فروخت نہیں کرتے اور کوئی اشتہار نہیں دکھاتے۔'
                : 'Driver Dost keeps core records on your device in guest mode. We do not sell your personal or logistics data and display zero commercial advertisements.'}
            </div>
          </div>

          {/* Section 1: Core Privacy Policy */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <Database className="w-4 h-4 text-[#8b9d77]" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '1. ہمارا بنیادی اصول (Core Privacy Policy)' : '1. Core Privacy Policy'}
              </h3>
            </div>
            <p className="text-xs text-[#5a5a40] leading-relaxed">
              {isUrdu
                ? 'ڈرائیور دوست میں گیسٹ موڈ کے دوران تمام ریکارڈز آپ کی ڈیوائس پر محفوظ رہتے ہیں۔ اگر آپ گوگل کے ساتھ سائن اِن کریں تو وہ گوگل فائر بیس پر آپ کے نجی اکاؤنٹ میں سنک ہو جاتے ہیں۔ آپ کے سفری حسابات، گاڑیوں کے لاگز، فیول رسیدیں اور کاروباری دستاویزات محفوظ رہتے ہیں۔'
                : 'Records stay on your device in guest mode; if you sign in with Google they sync to your private account on Google Firebase. All your trip calculations, vehicle expense records, fuel logs, and business documents are kept safe.'}
            </p>
          </div>

          {/* Section 2: Permissions Transparency */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <MapPin className="w-4 h-4 text-[#8b9d77]" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '2. مطلوبہ پرمشنز کی وضاحت (Permissions Transparency)' : '2. Permissions Transparency'}
              </h3>
            </div>
            <ul className="text-xs text-[#5a5a40] space-y-2 list-disc list-inside leading-relaxed">
              <li>
                <strong>{isUrdu ? 'انٹرنیٹ اور نیٹ ورک:' : 'Internet & Network:'}</strong>{' '}
                {isUrdu ? 'موٹروے کے لائیو ٹول ٹیکس، ڈیزل ریٹ اور اختیاری کلاؤڈ بیک اپ کے لیے۔' : 'For motorway tolls, diesel rates, and optional cloud backup synchronization.'}
              </li>
              <li>
                <strong>{isUrdu ? 'لوکیشن (GPS):' : 'Location (GPS):'}</strong>{' '}
                {isUrdu ? 'صرف آن ڈیمانڈ اور آپ کی واضح اجازت پر، نیویگیشن، قریبی موسم اور روڈ ہیزرڈ کے لیے۔ پس منظر میں کبھی ٹریک نہیں ہوتی۔' : 'Strictly on-demand with your explicit consent for navigation, nearby weather, and hazard reporting. Never tracked in background.'}
              </li>
              <li>
                <strong>{isUrdu ? 'پش نوٹیفکیشنز:' : 'Push Notifications:'}</strong>{' '}
                {isUrdu ? 'آپ کی اجازت سے روزانہ ڈائجسٹ (ایندھن کے نرخ، موسم، سڑکوں کی صورتحال) اور آپ کی درج کردہ دستاویزات کی میعاد سے 30، 15 اور 7 دن پہلے یاد دہانی۔ کوئی اشتہاری نوٹیفکیشن نہیں۔' : 'With your permission, a daily digest (fuel rates, weather, road conditions) plus reminders for document expiry dates you entered (30, 15 and 7 days before). No marketing.'}
              </li>
              <li>
                <strong>{isUrdu ? 'کیمرہ اور مائیکروفون:' : 'Camera & Microphone:'}</strong>{' '}
                {isUrdu ? 'دستاویزات کی تصویر OCR (Document scanning) اور اختیاری ڈیش کیم ویڈیو و آڈیو ریکارڈنگ کے لیے۔' : 'For document scanning (OCR) and optional dashcam video/audio recording.'}
              </li>
            </ul>
          </div>

          {/* Section 3: Dashcam Disclosure */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <Video className="w-4 h-4 text-emerald-600" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '3. ڈیش کیم اور ریکارڈنگ (Dashcam & Media Recording)' : '3. Dashcam & Media Recording'}
              </h3>
            </div>
            <p className="text-xs text-[#5a5a40] leading-relaxed">
              {isUrdu
                ? 'ڈیش کیم اختیاری ہے اور صرف اس وقت شروع ہوتا ہے جب آپ Start دبائیں۔ ریکارڈنگ کے دوران ایک مستقل نوٹیفکیشن دکھائی دیتا ہے۔ ریکارڈنگز صرف آپ کی ڈیوائس پر محفوظ ہوتی ہیں؛ ایپ انہیں اپلوڈ نہیں کرتی اور ہم ان تک رسائی نہیں رکھتے۔ شیئرنگ اور حذف کرنے کا اختیار آپ کے پاس ہے۔ اگر آڈیو ریکارڈ ہو تو گاڑی میں موجود دیگر افراد کی رضامندی کی ذمہ داری ڈرائیور پر عائد ہوتی ہے۔'
                : 'The dashcam is optional and starts only when you tap Start. A persistent notification is shown while recording. Recordings are saved only on your device; the App does not upload them and we cannot access them. You control sharing and deletion. If audio is recorded, you alone are responsible for informing occupants and following applicable consent laws.'}
            </p>
          </div>

          {/* Section 4: Firebase & Cloud Security */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <Lock className="w-4 h-4 text-[#8b9d77]" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '4. گوگل فائر بیس اور کلاؤڈ سیکیورٹی (Cloud Backup & Firebase)' : '4. Cloud Backup & Firebase'}
              </h3>
            </div>
            <p className="text-xs text-[#5a5a40] leading-relaxed">
              {isUrdu
                ? 'جب آپ گوگل اکاؤنٹ سے سائن ان کرتے ہیں تو آپ کا ریکارڈ گوگل فائر بیس فائر اسٹور پر انکرپٹڈ شکل میں محفوظ ہوتا ہے۔ تمام صارفین کا ذاتی و مالی ڈیٹا سختی سے الگ اور محفوظ (strictly isolated) رکھا جاتا ہے اور کوئی صارف کسی دوسرے کا ریکارڈ نہیں دیکھ سکتا۔ اختیاری تصدیقی لنک کے ذریعے صرف غیر مالی اور غیر حساس معلومات (دستاویز نمبر، تاریخ، شہر، گاڑی نمبر، ڈرائیور کا نام، سامان، وزن، تعداد اور ادا شدہ/ٹو پے اسٹیٹس) ظاہر کی جاتی ہیں۔ کرایہ، کل رقم، ایڈوانس، بقایا، یا شناختی کارڈ اور فون نمبر کبھی بھی ظاہر نہیں کیے جاتے۔'
                : 'Optional cloud synchronization uses encrypted Google Firebase Firestore rules ensuring strict per-user data isolation. Users cannot access or see any other user’s private data. For optional document verification links, only non-financial, non-sensitive details (document number, date, cities, vehicle number, driver name, goods, weight, quantity, and payment status) are publicly viewable. Freight price, total amount, advance, payable, sender/receiver CNICs, and phone numbers are strictly forbidden and never exposed.'}
            </p>
          </div>

          {/* Section 5: Road Hazard Reports */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '5. روڈ ہیزرڈ رپورٹس (Road Hazard Reports)' : '5. Road Hazard Reports'}
              </h3>
            </div>
            <p className="text-xs text-[#5a5a40] leading-relaxed">
              {isUrdu
                ? 'اگر آپ سائن اِن ہو کر روڈ ہیزرڈ رپورٹ جمع کرائیں تو اس کی قسم، مقام، وقت اور آپ کی اکاؤنٹ آئی ڈی گوگل فائر بیس میں محفوظ ہوتی ہے۔ دیگر سائن اِن صارفین رپورٹ (قسم، مقام، وقت) دیکھ سکتے ہیں۔ ایپ آپ کا نام یا ای میل نہیں دکھاتی، البتہ رپورٹ آپ کی اکاؤنٹ آئی ڈی سے منسلک ہوتی ہے۔ رپورٹس 24 گھنٹے بعد دکھانا بند ہو جاتی ہیں؛ آپ اپنی رپورٹس حذف کر سکتے ہیں۔'
                : 'If signed in and you submit a hazard report, we store its category, location, time and your account ID in Google Firebase. Other signed-in users can view the report (category, location, time). The app does not show your name or email, but the report is linked to your account ID. Reports stop being shown after 24 hours; you can delete your own reports.'}
            </p>
          </div>

          {/* Section 6: Third-Party Services */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <Globe className="w-4 h-4 text-blue-600" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '6. تھرڈ پارٹی سروسز (Third-Party Services)' : '6. Third-Party Services'}
              </h3>
            </div>
            <p className="text-xs text-[#5a5a40] leading-relaxed">
              {isUrdu
                ? 'ایپ درج ذیل کو درخواستیں بھیجتی ہے: گوگل فائر بیس (سائن اِن اور کلاؤڈ سنک)، اوپن میٹیو (موسم؛ آپ کے منتخب مقام کے کوآرڈینیٹس وصول کرتا ہے)، پبلک او ایس آر ایم روٹنگ سرور (روٹ کے آغاز اور اختتام کے کوآرڈینیٹس وصول کرتا ہے) اور ایندھن کے نرخوں کی معلوماتی سروس (عام درخواست)۔ یہ سروسز آپ کا آئی پی ایڈریس دیکھ سکتی ہیں اور اپنی پرائیویسی پالیسیوں کے تحت کام کرتی ہیں۔ ہم آپ کا ڈیٹا فروخت نہیں کرتے اور کوئی اشتہار نہیں دکھاتے۔'
                : 'The app sends requests to Google Firebase (sign-in and cloud sync), Open-Meteo (weather; receives coordinates of the place you check), the public OSRM routing server (receives route start and end coordinates) and a fuel-rate information service (a standard request). These services may see your IP address and work under their own privacy policies. We do not sell your data and show no ads.'}
            </p>
          </div>

          {/* Section 7: Deleting Your Data & Cloud Deletion Button */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-red-200/80 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <Trash2 className="w-4 h-4 text-red-600" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '7. ڈیٹا حذف کرنا اور 30 دن کی رعایتی مدت (30-Day Grace Period)' : '7. Deleting Your Data (30-Day Grace Period)'}
              </h3>
            </div>
            <p className="text-xs text-[#5a5a40] leading-relaxed">
              {isUrdu
                ? 'مقامی ڈیٹا ایپ سیٹنگز یا کیشے صاف کر کے فوراً صاف کیا جا سکتا ہے۔ کلاؤڈ ڈیٹا ڈیلیٹ کرنے کی درخواست پر 30 دن کی مہلت دی جاتی ہے، جس کے دوران سائن ان کر کے آپ درخواست منسوخ کر سکتے ہیں۔ 30 دن گزرنے پر تمام نجی ریکارڈز مستقل صاف کر دیے جاتے ہیں۔ آپ ایپ میں سیٹنگز سے ڈیلیشن کی درخواست دے سکتے ہیں یا عوامی ڈیلیشن ویب پیج پر فارم جمع کرا سکتے ہیں۔'
                : 'Local device records can be cleared via app settings or by clearing storage. Cloud deletion requests are scheduled with a 30-day grace period, during which signing in allows cancellation. After 30 days, all private records are permanently wiped from Google Firebase. You can initiate deletion in-app or use our public deletion request webpage.'}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href={deletionMailtoUrl}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-xl text-xs font-bold transition-all shadow-2xs"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>{isUrdu ? 'ای میل کے ذریعے ڈیلیشن درخواست' : 'Request via Email'}</span>
              </a>
              <a
                href="./delete-account.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-2xs no-underline"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                <span>{isUrdu ? 'عوامی ڈیلیشن ویب پیج کھولیں' : 'Open Public Deletion Page'}</span>
              </a>
              {currentUserEmail && (
                <p className="text-[11px] text-gray-500 w-full mt-1">
                  {isUrdu ? `آپ کا موجودہ اکاؤنٹ: ${currentUserEmail}` : `Active account: ${currentUserEmail}`}
                </p>
              )}
            </div>
          </div>

          {/* Section 8: Age Requirement */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <UserCheck className="w-4 h-4 text-amber-600" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '8. عمر کی حد (Age Requirement)' : '8. Age Requirement'}
              </h3>
            </div>
            <p className="text-xs text-[#5a5a40] leading-relaxed">
              {isUrdu
                ? 'یہ ایپ 18 سال سے کم عمر افراد کے لیے نہیں ہے۔'
                : 'The app is not intended for anyone under 18.'}
            </p>
          </div>

          {/* Section 9: Developer Contact & Links */}
          <div className="bg-gradient-to-br from-[#f7f5ed] to-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2 text-[#1e3a68]">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-serif font-bold text-sm">
                {isUrdu ? '9. رابطہ برائے کمپنی و ڈویلپر (Contact & Support)' : '9. Contact & Support Details'}
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
                <span><strong>{isUrdu ? 'ہیلپ لائن / فون:' : 'Phone / Contact:'}</strong> <span className="dir-ltr font-bold text-[#1e3a68]">+92 300 5370443</span></span>
              </div>
              <div className="pt-2 border-t border-[#ecece0] flex items-center justify-between flex-wrap gap-2">
                <a 
                  href="./privacy.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-[#1e3a68] hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'مکمل ویب پرائیویسی پیج (privacy.html)' : 'Open privacy.html'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a 
                  href="./terms.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-[#1e3a68] hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'شرائط و ضوابط (terms.html)' : 'Terms & Conditions (terms.html)'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f0f0e4] border-t border-[#ecece0] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#7a7a60] font-medium">
            {isUrdu ? `ڈرائیور دوست • ورژن ${APP_VERSION}` : `Driver Dost • Version ${APP_VERSION}`}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1e3a68] hover:bg-[#162a4d] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            {isUrdu ? 'سمجھ آ گئی / بند کریں' : 'Understood / Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
