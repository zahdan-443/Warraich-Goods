import React from 'react';
import { ActiveTab, Language } from '../types';
import { LayoutDashboard, Calculator, Truck, Receipt, Fuel, LucideIcon } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  lang: Language;
  isBiltyAuthorized?: boolean;
}

const NAV_ITEMS: { tab: ActiveTab; labelUrdu: string; labelEn: string; Icon: LucideIcon }[] = [
  {
    tab: 'home',
    labelUrdu: 'ڈیش بورڈ',
    labelEn: 'Dashboard',
    Icon: LayoutDashboard,
  },
  {
    tab: 'calculator',
    labelUrdu: 'سفر خرچہ',
    labelEn: 'Trip Cost',
    Icon: Calculator,
  },
  {
    tab: 'vehicle',
    labelUrdu: 'گاڑیاں',
    labelEn: 'Fleet',
    Icon: Truck,
  },
  {
    tab: 'toll',
    labelUrdu: 'ٹول پلازہ',
    labelEn: 'Toll',
    Icon: Receipt,
  },
  {
    tab: 'fuel',
    labelUrdu: 'ڈیزل لاگ',
    labelEn: 'Fuel Log',
    Icon: Fuel,
  },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onNavigate,
  lang,
}) => {
  const isUrdu = lang === 'ur';

  const handleTabClick = (tab: ActiveTab) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore if not supported
      }
    }
    onNavigate(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      id="native-bottom-nav-bar"
      role="navigation"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#deded0] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:hidden select-none pb-[max(env(safe-area-inset-bottom,0px),6px)] pt-1.5"
    >
      <div className="flex items-center justify-around px-1 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.tab;
          const IconComponent = item.Icon;
          return (
            <button
              key={item.tab}
              id={`bottom-nav-btn-${item.tab}`}
              type="button"
              onClick={() => handleTabClick(item.tab)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-[#2d4b22] font-black scale-105'
                  : 'text-[#70705a] hover:text-[#2d4b22] active:scale-95'
              }`}
            >
              <div
                className={`p-1 rounded-full transition-colors ${
                  isActive ? 'bg-[#8b9d77]/25 text-[#275e23]' : 'bg-transparent'
                }`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] tracking-tight leading-tight mt-0.5 whitespace-nowrap ${
                  isActive ? 'font-black text-[#275e23]' : 'font-medium'
                }`}
              >
                {isUrdu ? item.labelUrdu : item.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
