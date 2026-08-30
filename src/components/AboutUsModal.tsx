import React from 'react';
import { X, Phone, Mail, MapPin, Building2, Truck, ShieldCheck, Clock, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';
import { Language } from '../types';
import { PublicImage } from '../assets/dashboardIcons';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  if (!isOpen) return null;

  const phoneNum = "0300-5370443";
  const whatsappUrl = `https://wa.me/923005370443?text=${encodeURIComponent('السلام علیکم! وڑائچ گڈز ٹرانسپورٹ انکوائری / بکنگ')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-[#fdfbf7] w-full max-w-xl max-h-[90vh] rounded-[32px] shadow-2xl border border-[#ecece0] flex flex-col overflow-hidden text-right relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#162a4d] via-[#1e3a68] to-[#162a4d] p-5 sm:p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="بند کریں"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md border-2 border-[#b58b28] flex items-center justify-center shrink-0 overflow-hidden">
              <PublicImage
                fileName="icon-512.png"
                alt="Warraich Goods Transport Company Logistics Symbol"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                fallbackIcon={
                  <PublicImage
                    fileName="logo.png"
                    alt="Warraich Goods Road Freight Logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                }
              />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold tracking-tight text-white">
                {lang === 'ur' ? 'وڑائچ گڈز ٹرانسپورٹ کمپنی' : 'Warraich Goods Transport Co.'}
              </h2>
              <p className="text-xs text-amber-200 font-sans mt-0.5">
                {lang === 'ur' ? 'پاکستان بھر میں بااعتماد اور تیز ترین لاجسٹکس سروسز' : 'Nationwide Trusted Logistics & Road Freight Network'}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-[#4a4a35] font-sans leading-relaxed text-sm">
          
          {/* Main About Intro */}
          <div className="bg-white p-5 rounded-2xl border border-[#ecece0] shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2">
              <Building2 className="w-5 h-5 text-[#8b9d77]" />
              <h3 className="font-serif font-bold text-base text-[#1e3a68]">
                {lang === 'ur' ? 'ہمارے بارے میں (About Us)' : 'About Warraich Goods'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#5a5a40] leading-relaxed">
              وڑائچ گڈز ٹرانسپورٹ کمپنی پاکستان بھر میں بااعتماد اور تیز ترین لاجسٹکس سروسز فراہم کرتی ہے۔ ہم فل ٹرک لوڈ (FTL) آپریشنز، ملک گیر مال برداری اور جدید فلیٹ شیڈولنگ کے ماہر ہیں۔
            </p>
            <p className="text-xs sm:text-sm text-[#5a5a40] leading-relaxed">
              ہمارا مقصد آپ کے سامان کو محفوظ طریقے سے، بروقت اور مناسب ترین اخراجات میں منزل مقصود تک پہنچانا ہے۔ بہتر نگاہ داشت، پیشہ ورانہ انتظامیہ اور بہترین کسٹمر سپورٹ کے ساتھ ہم آپ کے کاروبار کے لیے ایک بااعتماد ٹرانسپورٹ پارٹنر ہیں۔
            </p>
          </div>

          {/* Key Services Offered */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#8b9d77]" />
              <h3 className="font-serif font-bold text-base text-[#1e3a68]">
                {lang === 'ur' ? 'ہماری اہم سروسز (Our Key Services)' : 'Our Key Freight Services'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-white rounded-2xl border border-[#ecece0] shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <h4 className="font-serif font-bold text-xs text-[#1e3a68]">فل ٹرک لوڈ (FTL)</h4>
                <p className="text-[11px] text-[#7a7a60] leading-normal">
                  پورے پاکستان میں سامان کی محفوظ اور تیز رفتاری سے منتقلی۔
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#ecece0] shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="font-serif font-bold text-xs text-[#1e3a68]">اسمارٹ فلیٹ مینجمنٹ</h4>
                <p className="text-[11px] text-[#7a7a60] leading-normal">
                  بہترین روٹس اور شیڈولنگ تاکہ آپ کے وقت کی بچت ہو۔
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#ecece0] shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-serif font-bold text-xs text-[#1e3a68]">شفاف شرحیں</h4>
                <p className="text-[11px] text-[#7a7a60] leading-normal">
                  بغیر کسی مخفی اخراجات کے مناسب ریٹس اور واضح بلنگ۔
                </p>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-gradient-to-br from-white to-[#f7f5ed] p-5 rounded-2xl border border-[#ecece0] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#ecece0] pb-2">
              <Phone className="w-5 h-5 text-emerald-600" />
              <h3 className="font-serif font-bold text-base text-[#1e3a68]">
                {lang === 'ur' ? 'رابطہ کریں (Contact Us)' : 'Contact Information'}
              </h3>
            </div>

            <p className="text-xs text-[#7a7a60]">
              کسی بھی قسم کی بکنگ، معلومات یا رہنمائی کے لیے ہم سے رابطہ کریں:
            </p>

            <div className="space-y-3 text-xs sm:text-sm font-sans">
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#ecece0]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#8e8e75] block">فون / واٹس ایپ:</span>
                    <span className="font-bold text-[#1e3a68] dir-ltr text-sm">{phoneNum}</span>
                  </div>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>واٹس ایپ کریں</span>
                </a>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#ecece0]">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-lg shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[#8e8e75] block">ای میل ایڈریس:</span>
                  <span className="font-bold text-[#1e3a68] text-xs sm:text-sm">warraichgoods43@gmail.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[#ecece0]">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[#8e8e75] block">ہیڈ آفس پتہ:</span>
                  <span className="font-bold text-[#4a4a35] text-xs sm:text-sm leading-relaxed">
                    سمندری، فیصل آباد، پنجاب، پاکستان
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f0f0e4] border-t border-[#ecece0] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#7a7a60] font-sans font-medium">
            وڑائچ گڈز ٹرانسپورٹ کمپنی · فیصل آباد، پاکستان
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1e3a68] hover:bg-[#162a4d] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            {lang === 'ur' ? 'بند کریں' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
