import React, { useState } from 'react';
import { DICTIONARY, Language, Vehicle } from '../../types';
import { Truck, Plus, Trash2, Gauge, User, Weight, CheckCircle2 } from 'lucide-react';

interface VehiclesViewProps {
  lang: Language;
  vehicles: Vehicle[];
  onAddVehicle: (veh: Omit<Vehicle, 'id'>) => void;
  onDeleteVehicle: (id: number) => void;
  onSelectMileage: (mileage: number) => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  lang,
  vehicles,
  onAddVehicle,
  onDeleteVehicle,
  onSelectMileage
}) => {
  const t = DICTIONARY[lang].fleet;
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [reg, setReg] = useState('');
  const [model, setModel] = useState('');
  const [mileage, setMileage] = useState('');
  const [owner, setOwner] = useState('');
  const [capacity, setCapacity] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reg.trim()) return;
    onAddVehicle({
      reg: reg.trim().toUpperCase(),
      model: model.trim() || 'General Freight',
      mileage: parseFloat(mileage) || 7,
      owner: owner.trim() || 'Fleet Partner',
      capacity: parseFloat(capacity) || 12
    });
    setReg('');
    setModel('');
    setMileage('');
    setOwner('');
    setCapacity('');
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
              Registered trucks, trailers, and verified fuel efficiency profiles
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

        {vehicles.length === 0 ? (
          <div className="p-16 text-center bg-[#fdfbf7] rounded-3xl border border-[#ecece0]">
            <Truck className="w-12 h-12 mx-auto mb-4 opacity-30 text-[#8b9d77]" />
            <p className="font-serif italic text-lg text-[#5a5a40]">{t.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="p-7 rounded-3xl bg-[#fdfbf7] border border-[#ecece0] hover:border-[#8b9d77] hover:bg-white transition-all space-y-5 shadow-2xs group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-widest font-mono font-bold bg-[#8b9d77]/15 text-[#5a5a40] px-3 py-1 rounded-full border border-[#8b9d77]/30">
                        {v.reg}
                      </span>
                      <h3 className="text-xl font-serif font-bold text-[#4a4a35] mt-3 group-hover:text-[#8b9d77] transition-colors">
                        {v.model}
                      </h3>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-full border border-[#ecece0] flex items-center justify-center text-lg shadow-2xs">
                      🚛
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-white rounded-2xl border border-[#ecece0] text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-[#8e8e75] uppercase tracking-tighter flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-[#8b9d77]" /> Mileage
                      </span>
                      <span className="font-mono font-bold text-[#4a4a35]">{v.mileage} km/L</span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-[#8e8e75] uppercase tracking-tighter flex items-center gap-1">
                        <Weight className="w-3 h-3 text-[#8b9d77]" /> Payload
                      </span>
                      <span className="font-mono font-bold text-[#4a4a35]">{v.capacity} Tons</span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-[#8e8e75] uppercase tracking-tighter flex items-center gap-1">
                        <User className="w-3 h-3 text-[#8b9d77]" /> Owner
                      </span>
                      <span className="font-bold text-[#4a4a35] truncate">{v.owner}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center gap-3">
                  <button
                    onClick={() => onSelectMileage(v.mileage)}
                    className="flex-1 py-3 bg-[#f0f0e4] hover:bg-[#8b9d77] hover:text-white text-[#5a5a40] rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.useMileage}</span>
                  </button>

                  <button
                    onClick={() => onDeleteVehicle(v.id)}
                    className="p-3 bg-white hover:bg-red-500 hover:text-white text-red-500 border border-[#ecece0] rounded-full transition-all cursor-pointer"
                    title="Remove vehicle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Vehicle Dialog Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form onSubmit={handleSave} className="bg-white rounded-[32px] border border-[#ecece0] p-8 max-w-md w-full shadow-xl space-y-5 animate-scaleIn">
            <div className="flex items-center gap-3 border-b border-[#ecece0] pb-4">
              <div className="w-10 h-10 rounded-full bg-[#8b9d77] text-white flex items-center justify-center font-serif italic text-xl">
                YM
              </div>
              <h3 className="font-serif font-bold text-xl text-[#4a4a35]">{t.addBtn}</h3>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.regNo}</label>
              <input
                type="text"
                value={reg}
                onChange={(e) => setReg(e.target.value)}
                placeholder="LHR-7860"
                className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono uppercase"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.model}</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Hino 500"
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.mileage}</label>
                <input
                  type="number"
                  step="0.1"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="9.0"
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.owner}</label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Chaudhry Ali"
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.capacity}</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="15"
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
                Register
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
