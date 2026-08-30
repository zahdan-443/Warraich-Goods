import React from 'react';
import { ActiveTab, Language } from '../types';
import { Truck, Calculator, Fuel, MapPin, Users, ShieldCheck, Receipt, ExternalLink, Heart } from 'lucide-react';
import { AlHadiLogo } from './AlHadiLogo';

interface FooterProps {
  lang?: Language;
  onNavigate?: (tab: ActiveTab) => void;
  isBiltyAuthorized?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  lang = 'ur',
  onNavigate,
  isBiltyAuthorized = false,
}) => {
  const isUrdu = lang === 'ur';

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, tab: ActiveTab) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(tab);
    }
  };

  return (
    <footer 
      aria-label={isUrdu ? 'فوٹر اور اندرونی لنکس' : 'Footer & Internal Links'}
      className="bg-[#f0f0e4] border-t border-[#e2e2d5] text-[#4a4a35] font-sans pt-8 pb-6 px-4 md:px-12 mt-auto"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* Col 1: Brand & Logistics Mission */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-3">
            <AlHadiLogo className="w-10 h-10" />
            <div>
              <span className="font-serif font-bold text-base text-[#4a4a35] block leading-tight">
                {isUrdu ? 'ڈرائیور دوست' : 'Driver Dost'}
              </span>
              <span className="text-[10px] text-[#8b9d77] font-semibold tracking-wider uppercase block">
                {isUrdu ? 'وڑائچ گڈز ٹرانسپورٹ کمپنی' : 'Warraich Goods Transport Co.'}
              </span>
            </div>
          </div>
          <p className="text-xs text-[#5a5a40] leading-relaxed">
            {isUrdu
              ? 'پاکستان کے ڈرائیورز، ٹرک مالکان اور لاجسٹکس آپریٹرز کے لیے مکمل ڈیجیٹل حل۔ بااعتماد سفر، شفاف حساب کتاب اور بروقت ڈیلیوری۔'
              : 'Pakistan’s premier transport management platform empowering freight drivers, fleet owners, and dispatchers with instant trip calculations and fleet accounts.'}
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-[#5a5a40]">
            <span>🚚</span>
            <span className="font-medium">
              {isUrdu ? 'ملک گیر مال برداری نیٹ ورک 2026' : 'Nationwide Freight Network 2026'}
            </span>
          </div>
        </div>

        {/* Col 2: Core Calculation & Finance Tools */}
        <div className="space-y-3">
          <h2 className="font-serif font-bold text-xs uppercase tracking-widest text-[#5a5a40] border-b border-[#e2e2d5] pb-1.5">
            {isUrdu ? 'حساب کتاب اور اخراجات' : 'Trip Calculations'}
          </h2>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href="#calculator"
                onClick={(e) => handleLinkClick(e, 'calculator')}
                title={isUrdu ? 'سفر اخراجات کیلکولیٹر کھولیں' : 'Open Trip Expense Calculator'}
                className="hover:text-[#8b9d77] flex items-center gap-2 transition-colors py-0.5"
              >
                <Calculator className="w-3.5 h-3.5 text-[#8b9d77]" />
                <span>{isUrdu ? 'سفر اخراجات کیلکولیٹر' : 'Trip Expense & Profit Calculator'}</span>
              </a>
            </li>
            <li>
              <a
                href="#vehicleAccount"
                onClick={(e) => handleLinkClick(e, 'vehicleAccount')}
                title={isUrdu ? 'گاڑی کا حساب اور کھاتہ کھولیں' : 'Open Vehicle Expense Account'}
                className="hover:text-[#8b9d77] flex items-center gap-2 transition-colors py-0.5"
              >
                <Truck className="w-3.5 h-3.5 text-[#8b9d77]" />
                <span>{isUrdu ? 'گاڑی کا حساب اور سفر لیجر' : 'Vehicle Account & Trip Ledger'}</span>
              </a>
            </li>
            <li>
              <a
                href="#fuel"
                onClick={(e) => handleLinkClick(e, 'fuel')}
                title={isUrdu ? 'لائیو فیول اور ڈیزل ریٹس دیکھیں' : 'View Live PSO Diesel & Fuel Rates'}
                className="hover:text-[#8b9d77] flex items-center gap-2 transition-colors py-0.5"
              >
                <Fuel className="w-3.5 h-3.5 text-[#8b9d77]" />
                <span>{isUrdu ? 'لائیو ڈیزل ریٹس اور فیول لاگ' : 'Live Diesel Rates & Fuel Consumption'}</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Fleet Management & Routes */}
        <div className="space-y-3">
          <h2 className="font-serif font-bold text-xs uppercase tracking-widest text-[#5a5a40] border-b border-[#e2e2d5] pb-1.5">
            {isUrdu ? 'فلیٹ اور روٹ مینیجر' : 'Fleet & Corridors'}
          </h2>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href="#vehicle"
                onClick={(e) => handleLinkClick(e, 'vehicle')}
                title={isUrdu ? 'کمرشل گاڑیوں کی تفصیل دیکھیں' : 'Commercial Fleet Vehicles Directory'}
                className="hover:text-[#8b9d77] flex items-center gap-2 transition-colors py-0.5"
              >
                <Truck className="w-3.5 h-3.5 text-[#8b9d77]" />
                <span>{isUrdu ? 'کمرشل ٹرانسپورٹ گاڑیاں' : 'Commercial Fleet Vehicles'}</span>
              </a>
            </li>
            <li>
              <a
                href="#drivers"
                onClick={(e) => handleLinkClick(e, 'drivers')}
                title={isUrdu ? 'ڈرائیورز اور عملہ کی ڈائریکٹری' : 'Transport Drivers & Crew Directory'}
                className="hover:text-[#8b9d77] flex items-center gap-2 transition-colors py-0.5"
              >
                <Users className="w-3.5 h-3.5 text-[#8b9d77]" />
                <span>{isUrdu ? 'ٹرانسپورٹ ڈرائیورز ڈائریکٹری' : 'Fleet Drivers & Staff Directory'}</span>
              </a>
            </li>
            <li>
              <a
                href="#routes"
                onClick={(e) => handleLinkClick(e, 'routes')}
                title={isUrdu ? 'موٹرویز اور فریٹ کوریڈورز کے فاصلے اور ٹول' : 'Motorways & Highway Freight Corridors'}
                className="hover:text-[#8b9d77] flex items-center gap-2 transition-colors py-0.5"
              >
                <MapPin className="w-3.5 h-3.5 text-[#8b9d77]" />
                <span>{isUrdu ? 'موٹروے روٹس اور این ایچ اے ٹول' : 'Highway Routes & Toll Corridors'}</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Col 4: Verification & Official Portals */}
        <div className="space-y-3">
          <h2 className="font-serif font-bold text-xs uppercase tracking-widest text-[#5a5a40] border-b border-[#e2e2d5] pb-1.5">
            {isUrdu ? 'سرکاری تصدیق اور پورٹلز' : 'Official Verification'}
          </h2>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href="#verify"
                onClick={(e) => handleLinkClick(e, 'verify')}
                title={isUrdu ? 'ای چالان اور ڈرائیونگ لائسنس کی تصدیق' : 'Verify e-Challan and Driving License'}
                className="hover:text-[#8b9d77] flex items-center gap-2 transition-colors py-0.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#8b9d77]" />
                <span>{isUrdu ? 'آن لائن چالان و لائسنس ویریفکیشن' : 'e-Challan & License Verification'}</span>
              </a>
            </li>
            {isBiltyAuthorized && (
              <li>
                <a
                  href="#bilty"
                  onClick={(e) => handleLinkClick(e, 'bilty')}
                  title={isUrdu ? 'وڑائچ گڈز ڈیجیٹل بلٹی جنریٹر' : 'Warraich Goods Digital Bilty Generator'}
                  className="hover:text-[#8b9d77] flex items-center gap-2 transition-colors py-0.5"
                >
                  <Receipt className="w-3.5 h-3.5 text-[#8b9d77]" />
                  <span>{isUrdu ? 'وڑائچ گڈز آفیشل بلٹی جنریٹر' : 'Official Bilty Receipt Generator'}</span>
                </a>
              </li>
            )}
            <li>
              <a
                href="https://mtmis.excise.punjab.gov.pk/"
                target="_blank"
                rel="noopener noreferrer"
                title={isUrdu ? 'پنجاب ایکسائز گاڑی ویریفکیشن پورٹل' : 'MTMIS Punjab Vehicle Verification Portal'}
                className="hover:text-[#8b9d77] flex items-center gap-2 transition-colors py-0.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#5a5a40]" />
                <span>{isUrdu ? 'MTMIS ایکسائز وہیکل ویریفکیشن' : 'MTMIS Punjab Vehicle Verification'}</span>
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar with Credits and Quick Anchors */}
      <div className="max-w-7xl mx-auto pt-4 border-t border-[#e2e2d5] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#5a5a40] gap-3">
        <div className="flex items-center gap-2 flex-wrap text-center sm:text-left">
          <span className="font-semibold text-[#4a4a35]">Driver Dost · Pakistan Road Freight Manager v2.4 Pro</span>
          <span>·</span>
          <span>© 2026 Warraich Goods Transport Company. All Rights Reserved.</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-medium">
          <span>{isUrdu ? 'ڈرائیورز کے لیے خلوص کے ساتھ' : 'Dedicated to Pakistan Logistics'}</span>
          <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
        </div>
      </div>
    </footer>
  );
};

