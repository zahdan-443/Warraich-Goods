import React, { useState, useEffect } from 'react';
import { X, FileText, ShieldAlert, ExternalLink, Languages, Building2, Mail, Phone } from 'lucide-react';
import { Language } from '../types';
import { APP_VERSION } from '../constants/version';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

interface TermSection {
  id: number;
  titleEn: string;
  titleUr: string;
  contentEn: string;
  contentUr: string;
}

const SECTIONS: TermSection[] = [
  {
    id: 1,
    titleEn: '1. Acceptance of Terms',
    titleUr: '1. شرائط کی منظوری',
    contentEn: 'By installing or using Driver Dost (the "App") you agree to these Terms & Conditions and to our Privacy Policy. If you do not agree, please do not use the App. You must be 18 years or older to use it.',
    contentUr: 'ڈرائیور دوست ("ایپ") انسٹال یا استعمال کرنے کا مطلب ہے کہ آپ ان شرائط و ضوابط اور پرائیویسی پالیسی سے متفق ہیں۔ اگر آپ متفق نہیں تو ایپ استعمال نہ کریں۔ ایپ استعمال کرنے کے لیے آپ کی عمر کم از کم 18 سال ہونی چاہیے۔'
  },
  {
    id: 2,
    titleEn: '2. About the App',
    titleUr: '2. ایپ کے بارے میں',
    contentEn: 'Driver Dost is an independent, privately owned road-freight and fleet utility app, owned and operated by Warraich Goods Transport Company, Samundri, Punjab, Pakistan. It is not a government app and does not represent any government body.',
    contentUr: 'ڈرائیور دوست ایک آزاد، نجی روڈ فریٹ اور فلیٹ یوٹیلیٹی ایپ ہے جس کی ملکیت اور انتظام وڑائچ گڈز ٹرانسپورٹ کمپنی، سمندری، پنجاب، پاکستان کے پاس ہے۔ یہ سرکاری ایپ نہیں اور کسی سرکاری ادارے کی نمائندگی نہیں کرتی۔'
  },
  {
    id: 3,
    titleEn: '3. What the App Offers',
    titleUr: '3. ایپ کی سہولیات',
    contentEn: 'Trip fuel and cost calculation, motorway and highway toll estimates, route comparison, weather and fuel-rate information, navigation help using your location, road hazard alerts shared by drivers, fleet, vehicle, driver and expense records, document-expiry reminders, an optional dashcam, PDF export and WhatsApp sharing, and quick links to third-party government portals. Features may be added, changed or removed over time.',
    contentUr: 'ٹرپ کے ایندھن اور اخراجات کا حساب، موٹروے اور ہائی وے ٹول کا تخمینہ، روٹ کا موازنہ، موسم اور ایندھن کے نرخوں کی معلومات، آپ کی لوکیشن کے ذریعے نیویگیشن میں مدد، ڈرائیورز کی طرف سے روڈ ہیزرڈ الرٹس، فلیٹ، گاڑی، ڈرائیور اور اخراجات کا ریکارڈ، دستاویزات کی میعاد کی یاد دہانی، اختیاری ڈیش کیم، پی ڈی ایف ایکسپورٹ اور واٹس ایپ شیئرنگ، اور تھرڈ پارٹی سرکاری پورٹلز کے فوری لنکس۔ فیچرز وقتاً فوقتاً شامل، تبدیل یا ختم کیے جا سکتے ہیں۔'
  },
  {
    id: 4,
    titleEn: '4. Estimates and Information Only',
    titleUr: '4. تخمینے اور معلومات',
    contentEn: 'Calculations, toll amounts, distances, travel times, fuel prices, weather and route suggestions are estimates for planning only and may differ from actual figures. Fuel prices are reference values based on OGRA/PSO notifications and may lag behind the latest official notification. Always confirm with the official source or the fuel pump. You are responsible for decisions you make using the App.',
    contentUr: 'حسابات، ٹول کی رقوم، فاصلے، سفری وقت، ایندھن کے نرخ، موسم اور روٹ کی تجاویز صرف منصوبہ بندی کے لیے تخمینے ہیں اور اصل اعداد سے مختلف ہو سکتے ہیں۔ ایندھن کے نرخ اوگرا/پی ایس او کے نوٹیفکیشنز پر مبنی حوالہ جاتی قدریں ہیں اور تازہ ترین سرکاری نوٹیفکیشن سے پیچھے ہو سکتی ہیں۔ ہمیشہ سرکاری ذریعے یا پمپ سے تصدیق کریں۔ ایپ کی بنیاد پر کیے گئے فیصلوں کی ذمہ داری آپ کی ہے۔'
  },
  {
    id: 5,
    titleEn: '5. Third-Party Services and Links',
    titleUr: '5. تھرڈ پارٹی سروسز اور لنکس',
    contentEn: 'The App links to external government websites (for example vehicle, driving-licence and e-challan portals) and uses third-party services such as Google Firebase (sign-in and cloud sync), Open-Meteo (weather) and OSRM (routing). We are not affiliated with them, do not control their content or availability, and are not responsible for them. Their own terms and privacy policies apply.',
    contentUr: 'ایپ بیرونی سرکاری ویب سائٹس (مثلاً گاڑی، ڈرائیونگ لائسنس اور ای چالان پورٹلز) کے لنکس دیتی ہے اور تھرڈ پارٹی سروسز جیسے گوگل فائر بیس (سائن اِن اور کلاؤڈ سنک)، اوپن میٹیو (موسم) اور او ایس آر ایم (روٹنگ) استعمال کرتی ہے۔ ہمارا ان سے کوئی تعلق نہیں، ہم ان کے مواد یا دستیابی پر کنٹرول نہیں رکھتے اور ان کے ذمہ دار نہیں۔ ان کی اپنی شرائط اور پرائیویسی پالیسیاں لاگو ہوتی ہیں۔'
  },
  {
    id: 6,
    titleEn: '6. Accounts, Guest Mode and Cloud Sync',
    titleUr: '6. اکاؤنٹ، گیسٹ موڈ اور کلاؤڈ سنک',
    contentEn: 'You can use the core tools in guest mode without signing in; records are then kept on your device. If you sign in with Google, your records are synchronised to your private account on Google Firebase so you can restore them on another device. You are responsible for keeping your Google account secure. Cloud data is private to your account, except hazard reports you choose to submit (section 8) and anything described in section 12.',
    contentUr: 'آپ بنیادی ٹولز گیسٹ موڈ میں بغیر سائن اِن کے استعمال کر سکتے ہیں؛ اس صورت میں ریکارڈ آپ کی ڈیوائس پر رہتا ہے۔ اگر آپ گوگل سے سائن اِن کریں تو آپ کا ریکارڈ گوگل فائر بیس پر آپ کے نجی اکاؤنٹ میں سنک ہوتا ہے تاکہ دوسری ڈیوائس پر بحال کیا جا سکے۔ اپنے گوگل اکاؤنٹ کی حفاظت آپ کی ذمہ داری ہے۔ کلاؤڈ ڈیٹا آپ کے اکاؤنٹ تک نجی ہے، سوائے ان ہیزرڈ رپورٹس کے جو آپ خود جمع کرائیں (شق 8) اور شق 12 میں بیان کردہ چیزوں کے۔'
  },
  {
    id: 7,
    titleEn: '7. Permissions: Location, Camera, Microphone, Notifications',
    titleUr: '7. اجازتیں: لوکیشن، کیمرہ، مائیکروفون، نوٹیفکیشنز',
    contentEn: 'Location is used only while the App is open and only after you allow it, for navigation, nearby weather and toll information and hazard reports. It is never tracked in the background, and you can use the App without location by choosing cities manually. The camera is used for document scanning (OCR) and the optional dashcam; the microphone is used only for dashcam audio. You can withdraw any permission at any time in your device settings.',
    contentUr: 'لوکیشن صرف اس وقت استعمال ہوتی ہے جب ایپ کھلی ہو اور آپ نے اجازت دی ہو، نیویگیشن، قریبی موسم و ٹول کی معلومات اور ہیزرڈ رپورٹس کے لیے۔ پس منظر (بیک گراؤنڈ) میں لوکیشن کبھی ٹریک نہیں ہوتی، اور آپ شہر خود چن کر لوکیشن کے بغیر بھی ایپ استعمال کر سکتے ہیں۔ کیمرہ دستاویزات کی اسکیننگ (OCR) اور اختیاری ڈیش کیم کے لیے ہے؛ مائیکروفون صرف ڈیش کیم کی آواز کے لیے ہے۔ آپ کسی بھی وقت ڈیوائس سیٹنگز میں اجازت واپس لے سکتے ہیں۔'
  },
  {
    id: 8,
    titleEn: '8. Road Hazard Reports (User-Generated)',
    titleUr: '8. روڈ ہیزرڈ رپورٹس (صارفین کی جانب سے)',
    contentEn: 'Signed-in users can submit road hazard reports (category, location and time). By submitting, you confirm the report is genuine and made in good faith. Do not submit false, misleading or abusive reports or spam; submission frequency is limited. Reports are visible to other signed-in users, stop being shown after 24 hours, and you may delete your own reports. To flag an inaccurate or abusive report, email us; we may remove content and restrict users who misuse this feature. Reports are community information, not official advisories; always follow NHMP (helpline 130) and official instructions.',
    contentUr: 'سائن اِن صارفین روڈ ہیزرڈ رپورٹس (قسم، مقام اور وقت) جمع کرا سکتے ہیں۔ رپورٹ جمع کرانے کا مطلب ہے کہ آپ تصدیق کرتے ہیں کہ یہ درست اور نیک نیتی سے ہے۔ جھوٹی، گمراہ کن یا توہین آمیز رپورٹس یا اسپیم جمع نہ کریں؛ رپورٹس بھیجنے کی تعداد محدود ہے۔ رپورٹس دیگر سائن اِن صارفین کو نظر آتی ہیں، 24 گھنٹے بعد دکھانا بند ہو جاتی ہیں، اور آپ اپنی رپورٹس حذف کر سکتے ہیں۔ غلط یا توہین آمیز رپورٹ کی نشاندہی کے لیے ہمیں ای میل کریں؛ ہم مواد ہٹا سکتے ہیں اور اس فیچر کا غلط استعمال کرنے والوں پر پابندی لگا سکتے ہیں۔ رپورٹس کمیونٹی کی معلومات ہیں، سرکاری ایڈوائزری نہیں؛ ہمیشہ این ایچ ایم پی (ہیلپ لائن 130) اور سرکاری ہدایات پر عمل کریں۔'
  },
  {
    id: 9,
    titleEn: '9. Dashcam and Recording',
    titleUr: '9. ڈیش کیم اور ریکارڈنگ',
    contentEn: 'The dashcam is optional and starts only when you tap Start. A persistent notification is shown while recording. Recordings are saved only on your device; the App does not upload them and we cannot access them. You control sharing and deletion. If audio is recorded, other people in the vehicle may be recorded; you alone are responsible for informing them and following applicable laws. We do not guarantee that recordings will be accepted as evidence. Never handle the phone while driving.',
    contentUr: 'ڈیش کیم اختیاری ہے اور صرف اس وقت شروع ہوتا ہے جب آپ Start دبائیں۔ ریکارڈنگ کے دوران ایک مستقل نوٹیفکیشن دکھائی دیتا ہے۔ ریکارڈنگز صرف آپ کی ڈیوائس پر محفوظ ہوتی ہیں؛ ایپ انہیں اپلوڈ نہیں کرتی اور ہم ان تک رسائی نہیں رکھتے۔ شیئرنگ اور حذف کرنے کا اختیار آپ کے پاس ہے۔ اگر آڈیو ریکارڈ ہو تو گاڑی میں موجود دیگر افراد بھی ریکارڈ ہو سکتے ہیں؛ انہیں آگاہ کرنے اور متعلقہ قوانین پر عمل کرنے کی ذمہ داری صرف آپ کی ہے۔ ہم اس بات کی ضمانت نہیں دیتے کہ ریکارڈنگ بطور ثبوت قبول ہوگی۔ ڈرائیونگ کے دوران فون ہاتھ میں نہ لیں۔'
  },
  {
    id: 10,
    titleEn: '10. Safe Driving',
    titleUr: '10. محفوظ ڈرائیونگ',
    contentEn: 'Do not use the App by hand while driving a moving vehicle. Complete trip planning, toll calculation and route setup before you start the journey.',
    contentUr: 'چلتی گاڑی چلاتے وقت ایپ کو ہاتھ سے استعمال نہ کریں۔ ٹرپ کی منصوبہ بندی، ٹول کا حساب اور روٹ سفر شروع کرنے سے پہلے مکمل کریں۔'
  },
  {
    id: 11,
    titleEn: '11. Notifications',
    titleUr: '11. نوٹیفکیشنز',
    contentEn: 'With your permission the App may send a daily information digest (fuel rates, weather, road conditions) and reminders for document expiry dates you have entered. We do not send advertising or promotional notifications. You can turn notifications off at any time.',
    contentUr: 'آپ کی اجازت سے ایپ روزانہ معلوماتی ڈائجسٹ (ایندھن کے نرخ، موسم، سڑکوں کی صورتحال) اور آپ کی درج کردہ دستاویزات کی میعاد کی یاد دہانیاں بھیج سکتی ہے۔ ہم اشتہاری یا پروموشنل نوٹیفکیشنز نہیں بھیجتے۔ آپ کسی بھی وقت نوٹیفکیشنز بند کر سکتے ہیں۔'
  },
  {
    id: 12,
    titleEn: '12. Restricted and Premium Features',
    titleUr: '12. محدود اور پریمیم فیچرز',
    contentEn: 'Some business modules are available only to accounts specifically authorised by the owner and are not part of the general public feature set. We may in future offer such modules, or other optional features, as paid or subscription services. Any paid feature will be clearly marked and will need your explicit consent before any charge. We intend to keep core everyday tools free; any change will be announced in the App before it takes effect. Access to restricted modules may be granted, limited or withdrawn at our discretion.',
    contentUr: 'کچھ کاروباری ماڈیولز صرف ان اکاؤنٹس کے لیے ہیں جنہیں مالک نے خاص طور پر اجازت دی ہو، اور یہ عام عوامی فیچرز کا حصہ نہیں۔ مستقبل میں ہم ایسے ماڈیولز یا دیگر اختیاری فیچرز کو ادائیگی یا سبسکرپشن سروس کے طور پر پیش کر سکتے ہیں۔ ہر ادائیگی والا فیچر واضح طور پر نشان زد ہوگا اور کوئی رقم لینے سے پہلے آپ کی واضح رضامندی درکار ہوگی۔ ہمارا ارادہ ہے کہ روزمرہ کے بنیادی ٹولز مفت رہیں؛ کوئی بھی تبدیلی نافذ ہونے سے پہلے ایپ میں اعلان کی جائے گی۔ محدود ماڈیولز تک رسائی ہمارے صوابدید پر دی، محدود یا واپس لی جا سکتی ہے۔'
  },
  {
    id: 13,
    titleEn: '13. Acceptable Use',
    titleUr: '13. قابلِ قبول استعمال',
    contentEn: 'Do not misuse the App: no unlawful use, reverse engineering, scraping, interfering with servers or other users, impersonation, or attempts to access data or features you are not authorised to use.',
    contentUr: 'ایپ کا غلط استعمال نہ کریں: غیر قانونی استعمال، ریورس انجینئرنگ، ڈیٹا اسکریپنگ، سرورز یا دیگر صارفین میں مداخلت، کسی کی نقالی، یا ایسے ڈیٹا/فیچرز تک رسائی کی کوشش جن کی آپ کو اجازت نہیں، ممنوع ہیں۔'
  },
  {
    id: 14,
    titleEn: '14. Intellectual Property',
    titleUr: '14. املاکِ دانش',
    contentEn: 'The App, its design, name, logo and content belong to Warraich Goods Transport Company. You receive a limited, personal, non-transferable licence to use the App. Your own data remains yours.',
    contentUr: 'ایپ، اس کا ڈیزائن، نام، لوگو اور مواد وڑائچ گڈز ٹرانسپورٹ کمپنی کی ملکیت ہیں۔ آپ کو ایپ استعمال کرنے کا محدود، ذاتی، ناقابلِ منتقلی لائسنس ملتا ہے۔ آپ کا اپنا ڈیٹا آپ ہی کا رہتا ہے۔'
  },
  {
    id: 15,
    titleEn: '15. Disclaimer and Limitation of Liability',
    titleUr: '15. دستبرداری اور ذمہ داری کی حد',
    contentEn: 'The App is provided "as is" and "as available", without warranties of accuracy, availability or fitness for a particular purpose. To the fullest extent permitted by law, Warraich Goods Transport Company is not liable for indirect or consequential loss, loss of profit, delays, road incidents, data loss, or decisions made using the App. Nothing in these Terms limits liability that cannot be limited by law.',
    contentUr: 'ایپ "جیسی ہے" اور "جیسی دستیاب ہے" کی بنیاد پر فراہم کی جاتی ہے، درستگی، دستیابی یا کسی خاص مقصد کے لیے موزونیت کی ضمانت کے بغیر۔ قانون کی اجازت کی حد تک، وڑائچ گڈز ٹرانسپورٹ کمپنی بالواسطہ یا نتیجے میں ہونے والے نقصان، منافع کے نقصان، تاخیر، سڑک کے حادثات، ڈیٹا کے ضیاع یا ایپ کی بنیاد پر کیے گئے فیصلوں کی ذمہ دار نہیں۔ ان شرائط میں کوئی بات اس ذمہ داری کو محدود نہیں کرتی جو قانوناً محدود نہیں کی جا سکتی۔'
  },
  {
    id: 16,
    titleEn: '16. Suspension and Termination',
    titleUr: '16. معطلی اور خاتمہ',
    contentEn: 'We may suspend or end access for anyone who breaks these Terms or misuses the App. You may stop using the App at any time and delete your data as described in the Privacy Policy.',
    contentUr: 'جو شخص ان شرائط کی خلاف ورزی کرے یا ایپ کا غلط استعمال کرے، اس کی رسائی ہم معطل یا ختم کر سکتے ہیں۔ آپ کسی بھی وقت ایپ کا استعمال بند کر سکتے ہیں اور پرائیویسی پالیسی کے مطابق اپنا ڈیٹا حذف کر سکتے ہیں۔'
  },
  {
    id: 17,
    titleEn: '17. Changes to These Terms',
    titleUr: '17. شرائط میں تبدیلی',
    contentEn: 'We may update these Terms. The latest update date is shown at the top of this page; continuing to use the App after an update means you accept it. Material changes will be announced in the App.',
    contentUr: 'ہم ان شرائط کو اپ ڈیٹ کر سکتے ہیں۔ تازہ ترین تاریخ اس صفحے کے اوپر درج ہوتی ہے؛ اپ ڈیٹ کے بعد ایپ کا استعمال جاری رکھنے کا مطلب ہے کہ آپ اسے قبول کرتے ہیں۔ اہم تبدیلیوں کا اعلان ایپ میں کیا جائے گا۔'
  },
  {
    id: 18,
    titleEn: '18. Governing Law',
    titleUr: '18. قابلِ اطلاق قانون',
    contentEn: 'These Terms are governed by the laws of Pakistan. Disputes are subject to the competent courts at Faisalabad, Punjab.',
    contentUr: 'یہ شرائط پاکستان کے قوانین کے تحت ہیں۔ تنازعات کا فیصلہ فیصل آباد، پنجاب کی مجاز عدالتوں میں ہوگا۔'
  },
  {
    id: 19,
    titleEn: '19. Contact',
    titleUr: '19. رابطہ',
    contentEn: 'Publisher: Warraich Goods Transport Company\nEmail: warraichgoods43@gmail.com\nPhone: +92 300 5370443\nAddress: Near General Bus Stand, Samundri / Faisalabad, Punjab, Pakistan\nFor data-deletion requests or to report content, email us with the subject "Driver Dost - Request".',
    contentUr: 'پبلشر: وڑائچ گڈز ٹرانسپورٹ کمپنی\nای میل: warraichgoods43@gmail.com\nفون: +92 300 5370443\nپتہ: جنرل بس اسٹینڈ کے قریب، سمندری / فیصل آباد، پنجاب، پاکستان\nڈیٹا حذف کرنے کی درخواست یا مواد کی شکایت کے لیے سبجیکٹ "Driver Dost - Request" کے ساتھ ہمیں ای میل کریں۔'
  }
];

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  const [selectedLang, setSelectedLang] = useState<Language>(lang);

  useEffect(() => {
    setSelectedLang(lang);
  }, [lang]);

  if (!isOpen) return null;
  const isUrdu = selectedLang === 'ur';

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
              <FileText className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight">
                {isUrdu ? 'شرائط و ضوابط (Terms & Conditions)' : 'Terms & Conditions'}
              </h2>
              <p className="text-xs text-blue-200 font-sans mt-0.5">
                Driver Dost · Warraich Goods Transport Company · v{APP_VERSION} · 24 October 2026
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
                {isUrdu ? 'اہم قانونی اعلان (Official Notice)' : 'Important Notice'}
              </span>
              {isUrdu
                ? 'ڈرائیور دوست ایک آزاد، نجی ایپ ہے۔ یہ سرکاری ایپ نہیں اور کسی سرکاری ادارے سے وابستہ نہیں۔'
                : 'Driver Dost is an independent, privately owned app. It is not a government app and is not affiliated with any government body.'}
            </div>
          </div>

          {/* All 19 Sections */}
          {SECTIONS.map((section) => (
            <div key={section.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ecece0] space-y-2 shadow-2xs">
              <h3 className="font-serif font-bold text-sm text-[#1e3a68] border-b border-[#ecece0] pb-2">
                {isUrdu ? section.titleUr : section.titleEn}
              </h3>
              <p className="text-xs text-[#5a5a40] leading-relaxed whitespace-pre-line">
                {isUrdu ? section.contentUr : section.contentEn}
              </p>
            </div>
          ))}

          {/* External Links & Publisher Info */}
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
                <span>{isUrdu ? 'ویب پیج شرائط (Web Terms)' : 'Open terms.html'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="text-[11px] text-[#7a7a60] pt-1 flex flex-wrap gap-3">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-blue-600" />
                <span>warraichgoods43@gmail.com</span>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>+92 300 5370443</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f0f0e4] border-t border-[#ecece0] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#7a7a60] font-medium">
            {isUrdu ? `ڈرائیور دوست • شرائط و ضوابط (ورژن ${APP_VERSION})` : `Driver Dost • Terms & Conditions (v${APP_VERSION})`}
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
