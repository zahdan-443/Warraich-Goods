import React, { useState } from 'react';
import { DICTIONARY, Language, RoutePreset } from '../../types';
import { MapPin, Plus, Trash2, ArrowRight, Navigation } from 'lucide-react';

interface RoutesViewProps {
  lang: Language;
  routes: RoutePreset[];
  onAddRoute: (route: Omit<RoutePreset, 'id'>) => void;
  onDeleteRoute: (id: number) => void;
  onApplyRoute: (route: RoutePreset) => void;
}

export const RoutesView: React.FC<RoutesViewProps> = ({
  lang,
  routes,
  onAddRoute,
  onDeleteRoute,
  onApplyRoute
}) => {
  const t = DICTIONARY[lang].routes;
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [dist, setDist] = useState('');
  const [toll, setToll] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromCity.trim() || !toCity.trim()) return;
    onAddRoute({
      from: fromCity.trim(),
      to: toCity.trim(),
      dist: parseFloat(dist) || 300,
      toll: parseFloat(toll) || 1000
    });
    setFromCity('');
    setToCity('');
    setDist('');
    setToll('');
    setShowModal(false);
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8">
      <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-[#ecece0] space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ecece0]">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#4a4a35]">
              {t.title}
            </h1>
            <p className="text-sm text-[#8e8e75] font-sans mt-1">
              {t.subtitle}
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3.5 bg-[#5a5a40] text-white rounded-full font-medium text-xs uppercase tracking-widest hover:bg-[#4a4a35] shadow-xs transition-all active:scale-98 cursor-pointer flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#8b9d77]" />
            <span>{t.addBtn}</span>
          </button>
        </header>

        {routes.length === 0 ? (
          <div className="p-16 text-center bg-[#fdfbf7] rounded-3xl border border-[#ecece0]">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30 text-[#8b9d77]" />
            <p className="font-serif italic text-lg text-[#5a5a40]">{t.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {routes.map((r) => (
              <div
                key={r.id}
                onClick={() => onApplyRoute(r)}
                className="p-7 rounded-3xl bg-[#fdfbf7] border border-[#ecece0] hover:border-[#8b9d77] hover:bg-white transition-all space-y-5 shadow-2xs group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-[#8b9d77]/15 text-[#5a5a40] font-mono flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-[#8b9d77]" /> Corridor
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRoute(r.id);
                      }}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove corridor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <h3 className="font-serif font-bold text-xl text-[#4a4a35] group-hover:text-[#8b9d77] transition-colors">
                      {r.from}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-[#8b9d77] shrink-0" />
                    <h3 className="font-serif font-bold text-xl text-[#4a4a35] group-hover:text-[#8b9d77] transition-colors">
                      {r.to}
                    </h3>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#ecece0] flex items-center justify-between text-xs font-sans">
                  <div className="space-y-0.5 font-mono text-[#8e8e75]">
                    <div>📏 Length: <span className="font-bold text-[#4a4a35]">{r.dist} km</span></div>
                    <div>🛣️ Est. Toll: <span className="font-bold text-[#4a4a35]">PKR {r.toll}</span></div>
                  </div>

                  <div className="px-4 py-2 bg-[#5a5a40] group-hover:bg-[#8b9d77] text-white rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors shadow-2xs flex items-center gap-1.5">
                    <span>{t.applyBtn}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form onSubmit={handleSave} className="bg-white rounded-[32px] border border-[#ecece0] p-8 max-w-md w-full shadow-xl space-y-5 animate-scaleIn">
            <div className="flex items-center gap-3 border-b border-[#ecece0] pb-4">
              <div className="w-10 h-10 rounded-full bg-[#8b9d77] text-white flex items-center justify-center font-serif italic text-xl">
                YM
              </div>
              <h3 className="font-serif font-bold text-xl text-[#4a4a35]">{t.addBtn}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.from}</label>
                <input
                  type="text"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  placeholder="Lahore"
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.to}</label>
                <input
                  type="text"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  placeholder="Multan"
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.distance}</label>
                <input
                  type="number"
                  value={dist}
                  onChange={(e) => setDist(e.target.value)}
                  placeholder="340"
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.toll}</label>
                <input
                  type="number"
                  value={toll}
                  onChange={(e) => setToll(e.target.value)}
                  placeholder="1100"
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3.5 rounded-full border border-[#ecece0] bg-white text-[#8e8e75] hover:text-[#4a4a35] text-xs uppercase tracking-widest font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 rounded-full bg-[#5a5a40] hover:bg-[#4a4a35] text-white text-xs uppercase tracking-widest font-bold transition-all cursor-pointer shadow-xs"
              >
                Save Corridor
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
