import React, { useState } from 'react';
import { DICTIONARY, Language, Vehicle } from '../../types';
import { 
  Truck, 
  Plus, 
  Trash2, 
  Gauge, 
  User, 
  Weight, 
  CheckCircle2, 
  ArrowLeft, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  ExternalLink,
  Edit2,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface VehiclesViewProps {
  lang: Language;
  vehicles: Vehicle[];
  onAddVehicle: (veh: Omit<Vehicle, 'id'>) => void;
  onUpdateVehicle?: (veh: Vehicle) => void;
  onDeleteVehicle: (id: number) => void;
  onSelectMileage: (mileage: number) => void;
  onNavigate?: (tab: string, subSection?: string) => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  lang,
  vehicles,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onSelectMileage,
  onNavigate
}) => {
  const isUrdu = lang === 'ur';
  const t = DICTIONARY[lang].fleet;
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [reg, setReg] = useState('');
  const [model, setModel] = useState('');
  const [mileage, setMileage] = useState('');
  const [owner, setOwner] = useState('');
  const [capacity, setCapacity] = useState('');
  
  // Optional Document Expiry Dates (Feature A)
  const [regExpiry, setRegExpiry] = useState('');
  const [routePermitExpiry, setRoutePermitExpiry] = useState('');
  const [fitnessExpiry, setFitnessExpiry] = useState('');

  const openAddModal = () => {
    setEditingId(null);
    setReg('');
    setModel('');
    setMileage('');
    setOwner('');
    setCapacity('');
    setRegExpiry('');
    setRoutePermitExpiry('');
    setFitnessExpiry('');
    setShowModal(true);
  };

  const openEditModal = (v: Vehicle) => {
    setEditingId(v.id);
    setReg(v.reg);
    setModel(v.model);
    setMileage(v.mileage ? v.mileage.toString() : '');
    setOwner(v.owner);
    setCapacity(v.capacity ? v.capacity.toString() : '');
    setRegExpiry(v.regExpiry || '');
    setRoutePermitExpiry(v.routePermitExpiry || '');
    setFitnessExpiry(v.fitnessExpiry || '');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reg.trim()) return;

    const payload = {
      reg: reg.trim().toUpperCase(),
      model: model.trim() || 'General Freight',
      mileage: parseFloat(mileage) || 7,
      owner: owner.trim() || 'Fleet Partner',
      capacity: parseFloat(capacity) || 12,
      regExpiry: regExpiry.trim() || undefined,
      routePermitExpiry: routePermitExpiry.trim() || undefined,
      fitnessExpiry: fitnessExpiry.trim() || undefined
    };

    if (editingId && onUpdateVehicle) {
      onUpdateVehicle({
        ...payload,
        id: editingId
      });
    } else {
      onAddVehicle(payload);
    }

    setEditingId(null);
    setShowModal(false);
  };

  // Helper to calculate days remaining
  const getDaysLeft = (dateStr?: string): { days: number; isExpired: boolean; colorClass: string } | null => {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return null;
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
    if (diff <= 7) {
      colorClass = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
    } else if (diff <= 14) {
      colorClass = 'bg-orange-100 text-orange-800 border-orange-300 font-bold';
    } else if (diff <= 30) {
      colorClass = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
    }

    return {
      days: diff,
      isExpired: diff <= 0,
      colorClass
    };
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
              {isUrdu 
                ? 'رجسٹرڈ ٹرک، ٹریلرز، مائلیج پروفائلز اور دستاویزات کی میعاد کا ریکارڈ' 
                : 'Registered trucks, trailers, fuel efficiency profiles & document expiry tracking'}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="p-2 bg-white border border-[#ecece0] hover:bg-[#eaeae0] text-[#4a4a35] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                title={isUrdu ? 'ڈیش بورڈ پر واپس جائیں' : 'Back to Dashboard'}
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
                <span>{isUrdu ? 'ڈیش بورڈ' : 'Dashboard'}</span>
              </button>
            )}

            <button
              onClick={openAddModal}
              className="px-6 py-3.5 bg-[#5a5a40] text-white rounded-full font-medium text-xs uppercase tracking-widest hover:bg-[#4a4a35] shadow-xs transition-all active:scale-98 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#8b9d77]" />
              <span>{t.addBtn}</span>
            </button>
          </div>
        </header>

        {vehicles.length === 0 ? (
          <div className="p-10 md:p-14 text-center bg-[#fdfbf7] rounded-3xl border border-[#ecece0] space-y-4">
            <Truck className="w-12 h-12 mx-auto opacity-40 text-[#8b9d77]" />
            <div>
              <p className="font-serif italic text-lg text-[#5a5a40]">{t.empty}</p>
              <p className="text-xs text-[#8e8e75] mt-1">
                {isUrdu ? 'اپنے ٹرک یا ٹریلر کا اندراج کریں تاکہ مائلیج اور اخراجات کا حساب خودکار ہو سکے' : 'Register your freight truck or trailer to automate fuel and trip calculations'}
              </p>
            </div>
            <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
              <button
                type="button"
                onClick={openAddModal}
                className="px-5 py-2.5 bg-[#4a5e38] hover:bg-[#394a2b] text-white rounded-2xl text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => onAddVehicle({
                  reg: 'LES-20-4124',
                  model: 'Hino 500 FG 1628 (6-Wheeler)',
                  mileage: 4.2,
                  owner: 'My Fleet',
                  capacity: 16,
                  regExpiry: '2026-10-25',
                  routePermitExpiry: '2026-11-10',
                  fitnessExpiry: '2026-10-15'
                })}
                className="px-4 py-2.5 bg-white border border-[#ecece0] hover:border-[#8b9d77] text-[#4a4a35] rounded-2xl text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
              >
                {isUrdu ? '+ نمونہ کمرشل ٹرک سیٹ کریں' : '+ Quick Add Sample Truck'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((v) => {
              const regStatus = getDaysLeft(v.regExpiry);
              const permitStatus = getDaysLeft(v.routePermitExpiry);
              const fitnessStatus = getDaysLeft(v.fitnessExpiry);
              const hasAnyExpiry = !!(v.regExpiry || v.routePermitExpiry || v.fitnessExpiry);

              return (
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
                        <h2 className="text-xl font-serif font-bold text-[#4a4a35] mt-3 group-hover:text-[#8b9d77] transition-colors">
                          {v.model}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(v)}
                          className="p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-full border border-[#ecece0] transition-colors cursor-pointer"
                          title={isUrdu ? 'تبدیل کریں / میعاد تاریخیں' : 'Edit / Expiry Dates'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-10 h-10 bg-white rounded-full border border-[#ecece0] flex items-center justify-center text-lg shadow-2xs">
                          🚛
                        </div>
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

                    {/* Document Expiry Status Badges (Feature A) */}
                    <div className="space-y-1.5 pt-1 border-t border-[#ecece0]">
                      <div className="flex items-center justify-between text-[11px] text-[#8e8e75] font-bold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#8b9d77]" />
                          <span>{isUrdu ? 'دستاویزات کی میعاد (Expiry Dates):' : 'Document Expiry Tracking:'}</span>
                        </span>
                        {onNavigate && (
                          <button
                            type="button"
                            onClick={() => onNavigate('verify', 'vehicle')}
                            className="text-[10px] text-[#8b9d77] hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>MTMIS</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>

                      {hasAnyExpiry ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10px]">
                          {/* RC Expiry */}
                          <div className={`p-1.5 rounded-xl border flex flex-col justify-between ${regStatus ? regStatus.colorClass : 'bg-slate-50 border-slate-200'}`}>
                            <span className="text-[#8e8e75]">{isUrdu ? 'رجسٹریشن (RC)' : 'RC Expiry'}</span>
                            <span className="font-mono font-bold">{v.regExpiry || '-'}</span>
                            {regStatus && regStatus.days <= 30 && (
                              <span className="text-[9px] mt-0.5 font-bold">
                                {regStatus.isExpired ? (isUrdu ? 'میعاد ختم' : 'Expired') : `${regStatus.days}d left`}
                              </span>
                            )}
                          </div>

                          {/* Route Permit */}
                          <div className={`p-1.5 rounded-xl border flex flex-col justify-between ${permitStatus ? permitStatus.colorClass : 'bg-slate-50 border-slate-200'}`}>
                            <span className="text-[#8e8e75]">{isUrdu ? 'روٹ پرمٹ' : 'Permit Expiry'}</span>
                            <span className="font-mono font-bold">{v.routePermitExpiry || '-'}</span>
                            {permitStatus && permitStatus.days <= 30 && (
                              <span className="text-[9px] mt-0.5 font-bold">
                                {permitStatus.isExpired ? (isUrdu ? 'میعاد ختم' : 'Expired') : `${permitStatus.days}d left`}
                              </span>
                            )}
                          </div>

                          {/* Fitness Certificate */}
                          <div className={`p-1.5 rounded-xl border flex flex-col justify-between ${fitnessStatus ? fitnessStatus.colorClass : 'bg-slate-50 border-slate-200'}`}>
                            <span className="text-[#8e8e75]">{isUrdu ? 'فٹنس سرٹیفکیٹ' : 'Fitness Expiry'}</span>
                            <span className="font-mono font-bold">{v.fitnessExpiry || '-'}</span>
                            {fitnessStatus && fitnessStatus.days <= 30 && (
                              <span className="text-[9px] mt-0.5 font-bold">
                                {fitnessStatus.isExpired ? (isUrdu ? 'میعاد ختم' : 'Expired') : `${fitnessStatus.days}d left`}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openEditModal(v)}
                          className="w-full py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[11px] border border-dashed border-slate-300 text-center transition-colors cursor-pointer"
                        >
                          + {isUrdu ? 'میعاد تاریخیں شامل کریں (RC، پرمٹ، فٹنس)' : 'Add expiry dates (RC, Permit, Fitness)'}
                        </button>
                      )}
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
                      className="p-3 bg-white hover:bg-red-500 hover:text-white text-red-500 border border-[#ecece0] rounded-full transition-all cursor-pointer shadow-2xs"
                      title="Remove vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Vehicle Dialog Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-[32px] border border-[#ecece0] p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ecece0] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8b9d77] text-white flex items-center justify-center font-serif italic text-xl">
                  🚚
                </div>
                <h2 className="font-serif font-bold text-xl text-[#4a4a35]">
                  {editingId ? (isUrdu ? 'گاڑی کی تفصیلات تبدیل کریں' : 'Edit Vehicle Details') : t.addBtn}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.regNo} *</label>
              <input
                type="text"
                value={reg}
                onChange={(e) => setReg(e.target.value)}
                placeholder="LHR-7860"
                className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono uppercase"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.model}</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Hino 500"
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.mileage}</label>
                <input
                  type="number"
                  step="0.1"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="7.0"
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.owner}</label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Fleet Partner"
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.capacity}</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="15"
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Document Expiry Date Fields (Feature A: Optional Dates Only) */}
            <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] space-y-3 pt-3">
              <div className="flex items-center justify-between border-b border-[#ecece0] pb-2">
                <span className="text-xs font-bold text-[#4a4a35] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8b9d77]" />
                  <span>{isUrdu ? 'دستاویزات کی میعاد تاریخیں (اختیاری)' : 'Document Expiry Dates (Optional)'}</span>
                </span>
                <span className="text-[10px] text-[#8e8e75]">
                  {isUrdu ? 'پیشگی یاددہانی الرٹ کیلئے' : 'For 30-day alerts'}
                </span>
              </div>

              {/* 1. Registration Expiry */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isUrdu ? '1. رجسٹریشن (RC) کی آخری تاریخ:' : '1. Registration (RC) Expiry:'}
                </label>
                <input
                  type="date"
                  value={regExpiry}
                  onChange={(e) => setRegExpiry(e.target.value)}
                  className="w-full bg-white border border-[#ecece0] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none"
                />
              </div>

              {/* 2. Route Permit Expiry */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isUrdu ? '2. روٹ پرمٹ کی آخری تاریخ:' : '2. Route Permit Expiry:'}
                </label>
                <input
                  type="date"
                  value={routePermitExpiry}
                  onChange={(e) => setRoutePermitExpiry(e.target.value)}
                  className="w-full bg-white border border-[#ecece0] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none"
                />
              </div>

              {/* 3. Fitness Certificate Expiry */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isUrdu ? '3. فٹنس سرٹیفکیٹ کی آخری تاریخ:' : '3. Fitness Certificate Expiry:'}
                </label>
                <input
                  type="date"
                  value={fitnessExpiry}
                  onChange={(e) => setFitnessExpiry(e.target.value)}
                  className="w-full bg-white border border-[#ecece0] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-full border border-[#ecece0] bg-white text-[#8e8e75] hover:text-[#4a4a35] text-xs uppercase tracking-widest font-bold transition-all cursor-pointer"
              >
                {isUrdu ? 'منسوخ' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-full bg-[#5a5a40] hover:bg-[#4a4a35] text-white text-xs uppercase tracking-widest font-bold transition-all cursor-pointer shadow-xs"
              >
                {editingId ? (isUrdu ? 'محفوظ کریں' : 'Save Changes') : (isUrdu ? 'اندراج کریں' : 'Register')}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
