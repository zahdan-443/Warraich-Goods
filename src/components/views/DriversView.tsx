import React, { useState } from 'react';
import { DICTIONARY, Driver, Language } from '../../types';
import { Users, Plus, Trash2, Phone, Shield, CreditCard } from 'lucide-react';

interface DriversViewProps {
  lang: Language;
  drivers: Driver[];
  onAddDriver: (drv: Omit<Driver, 'id'>) => void;
  onDeleteDriver: (id: number) => void;
}

export const DriversView: React.FC<DriversViewProps> = ({
  lang,
  drivers,
  onAddDriver,
  onDeleteDriver
}) => {
  const t = DICTIONARY[lang].drivers;
  const [showModal, setShowModal] = useState(false);

  // form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');
  const [lictype, setLictype] = useState('HTV');
  const [cnic, setCnic] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddDriver({
      name: name.trim(),
      phone: phone.trim() || '3000000000',
      license: license.trim() || 'PB-00000',
      lictype,
      cnic: cnic.trim() || '35201-0000000-0'
    });
    setName('');
    setPhone('');
    setLicense('');
    setCnic('');
    setShowModal(false);
  };

  const openWhatsApp = (phoneNum: string) => {
    const cleaned = phoneNum.replace(/\D/g, '');
    const prefix = cleaned.startsWith('92') ? cleaned : '92' + cleaned.replace(/^0/, '');
    window.open(`https://api.whatsapp.com/send?phone=${prefix}`, '_blank');
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
              WhatsApp directory, driving license classifications, and CNIC records
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

        {drivers.length === 0 ? (
          <div className="p-16 text-center bg-[#fdfbf7] rounded-3xl border border-[#ecece0]">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-30 text-[#8b9d77]" />
            <p className="font-serif italic text-lg text-[#5a5a40]">{t.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {drivers.map((d) => (
              <div
                key={d.id}
                className="p-7 rounded-3xl bg-[#fdfbf7] border border-[#ecece0] hover:border-[#8b9d77] hover:bg-white transition-all space-y-5 shadow-2xs group flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#f0f0e4] border-2 border-white flex items-center justify-center text-2xl shadow-sm shrink-0">
                    👳🏽‍♂️
                  </div>
                  <div className="space-y-1 overflow-hidden flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#8b9d77]/20 text-[#5a5a40] font-mono">
                        {d.lictype} Class
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-xl text-[#4a4a35] group-hover:text-[#8b9d77] transition-colors truncate">
                      {d.name}
                    </h3>
                    
                    <div className="space-y-1 pt-2 text-xs text-[#8e8e75] font-sans">
                      <div className="flex items-center gap-2 font-mono">
                        <Phone className="w-3.5 h-3.5 text-[#8b9d77]" />
                        <span>0{d.phone.replace(/^0/, '')}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <Shield className="w-3.5 h-3.5 text-[#8b9d77]" />
                        <span>DL: {d.license}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <CreditCard className="w-3.5 h-3.5 text-[#8b9d77]" />
                        <span>CNIC: {d.cnic}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#ecece0] flex items-center gap-3">
                  <button
                    onClick={() => openWhatsApp(d.phone)}
                    className="flex-1 py-3 bg-[#25D366]/15 hover:bg-[#25D366] text-[#128C7E] hover:text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t.callBtn}</span>
                  </button>

                  <button
                    onClick={() => onDeleteDriver(d.id)}
                    className="p-3 bg-white hover:bg-red-500 hover:text-white text-red-500 border border-[#ecece0] rounded-full transition-all cursor-pointer shadow-2xs"
                    title="Remove profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Driver Dialog */}
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
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.fullName}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mukhtar Ali"
                className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.phone}</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03001234567"
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.licenseType}</label>
                <select
                  value={lictype}
                  onChange={(e) => setLictype(e.target.value)}
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none"
                >
                  <option value="HTV">HTV Heavy</option>
                  <option value="LTV">LTV Light</option>
                  <option value="PSV">PSV Public</option>
                  <option value="HMV">HMV Military</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.licenseNo}</label>
                <input
                  type="text"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  placeholder="PB-99214"
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-3 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.cnic}</label>
                <input
                  type="text"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  placeholder="35201-1234567-1"
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
