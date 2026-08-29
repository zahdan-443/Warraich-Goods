import React from 'react';
import { ActiveTab, DICTIONARY, Language } from '../types';
import { LayoutDashboard, Calculator, Truck, Users, MapPin, Fuel, ShieldCheck, Receipt } from 'lucide-react';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  lang: Language;
  isBiltyAuthorized?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab, lang, isBiltyAuthorized = false }) => {
  const t = DICTIONARY[lang].nav;

  const rawNavItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'calculator', label: t.calculator, icon: <Calculator className="w-4 h-4" /> },
    { id: 'bilty', label: t.bilty, icon: <Receipt className="w-4 h-4" /> },
    { id: 'verify', label: t.verify, icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'home', label: t.home, icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'vehicle', label: t.vehicle, icon: <Truck className="w-4 h-4" /> },
    { id: 'drivers', label: t.drivers, icon: <Users className="w-4 h-4" /> },
    { id: 'routes', label: t.routes, icon: <MapPin className="w-4 h-4" /> },
    { id: 'fuel', label: t.fuel, icon: <Fuel className="w-4 h-4" /> },
  ];

  const navItems = rawNavItems.filter((item) => item.id !== 'bilty' || isBiltyAuthorized);

  return (
    <nav 
      aria-label={lang === 'ur' ? 'مرکزی نیویگیشن' : 'Main Navigation'}
      className="flex items-center justify-start md:justify-center overflow-x-auto no-scrollbar gap-6 md:gap-8 px-4 md:px-12 py-3 md:py-4 bg-[#fdfbf7] border-b border-[#ecece0] sticky top-20 z-40"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
            className={`flex items-center gap-2 text-xs uppercase tracking-widest font-medium whitespace-nowrap py-1.5 md:py-2 transition-all cursor-pointer shrink-0 ${
              isActive
                ? 'text-[#8b9d77] border-b-2 border-[#8b9d77] font-bold'
                : 'text-[#5a5a40] hover:text-[#2d2d20]'
            }`}
          >
            <span className={isActive ? 'text-[#8b9d77]' : 'text-[#5a5a40]'}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
