import React, { useState } from 'react';
import { DICTIONARY, Driver, Language } from '../../types';
import { 
  Users, 
  Plus, 
  Trash2, 
  Phone, 
  Shield, 
  CreditCard, 
  ArrowLeft, 
  Calendar, 
  Edit2, 
  ExternalLink,
  Clock,
  AlertTriangle 
} from 'lucide-react';

interface DriversViewProps {
  lang: Language;
  drivers: Driver[];
  onAddDriver: (drv: Omit<Driver, 'id'>) => void;
  onUpdateDriver?: (drv: Driver) => void;
  onDeleteDriver: (id: number) => void;
  onNavigate?: (tab: string, subSection?: string) => void;
}

export const DriversView: React.FC<DriversViewProps> = ({
  lang,
  drivers,
  onAddDriver,
  onUpdateDriver,
  onDeleteDriver,
  onNavigate
}) => {
  const isUrdu = lang === 'ur';
  const t = DICTIONARY[lang].drivers;
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');
  const [lictype, setLictype] = useState('HTV');
  const [cnic, setCnic] = useState('');
  
  // Optional Driver License Expiry Date (Feature A)
  const [licenseExpiry, setLicenseExpiry] = useState('');

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setLicense('');
    setLictype('HTV');
    setCnic('');
    setLicenseExpiry('');
    setShowModal(true);
  };

  const openEditModal = (d: Driver) => {
    setEditingId(d.id);
    setName(d.name);
    setPhone(d.phone);
    setLicense(d.license);
    setLictype(d.lictype || 'HTV');
    setCnic(d.cnic);
    setLicenseExpiry(d.licenseExpiry || '');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      license: license.trim(),
      lictype,
      cnic: cnic.trim(),
      licenseExpiry: licenseExpiry.trim() || undefined
    };

    if (editingId && onUpdateDriver) {
      onUpdateDriver({
        ...payload,
        id: editingId
      });
    } else {
      onAddDriver(payload);
    }

    setEditingId(null);
    setShowModal(false);
  };

  const openWhatsApp = (phoneNum: string) => {
    const cleaned = phoneNum.replace(/\D/g, '');
    const prefix = cleaned.startsWith('92') ? cleaned : '92' + cleaned.replace(/^0/, '');
    window.open(`https://api.whatsapp.com/send?phone=${prefix}`, '_blank');
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
                ? 'ڈرائیورز، واٹس ایپ ڈائریکٹری، لائسنس اقسام اور میعاد کا ریکارڈ' 
                : 'WhatsApp directory, driving license classifications, and license expiry records'}
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

        {drivers.length === 0 ? (
          <div className="p-10 md:p-14 text-center bg-[#fdfbf7] rounded-3xl border border-[#ecece0] space-y-4">
            <Users className="w-12 h-12 mx-auto opacity-40 text-[#8b9d77]" />
            <div>
              <p className="font-serif italic text-lg text-[#5a5a40]">{t.empty}</p>
              <p className="text-xs text-[#8e8e75] mt-1">
                {isUrdu ? 'ٹرانسپورٹ ڈرائیورز، فون نمبرز اور HTV لائسنس کا ریکارڈ محفوظ رکھیں' : 'Keep full records of commercial transport drivers, phone numbers, and HTV licenses'}
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
                onClick={() => onAddDriver({
                  name: 'Muhammad Riaz',
                  phone: '0300-4829102',
                  license: 'LHR-48291-HTV',
                  lictype: 'HTV Commercial',
                  cnic: '35201-1849201-3',
                  licenseExpiry: '2026-10-22'
                })}
                className="px-4 py-2.5 bg-white border border-[#ecece0] hover:border-[#8b9d77] text-[#4a4a35] rounded-2xl text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
              >
                {isUrdu ? '+ نمونہ HTV ڈرائیور سیٹ کریں' : '+ Quick Add HTV Driver'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {drivers.map((d) => {
              const licStatus = getDaysLeft(d.licenseExpiry);

              return (
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
                        <button
                          type="button"
                          onClick={() => openEditModal(d)}
                          className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-full border border-[#ecece0] transition-colors cursor-pointer"
                          title={isUrdu ? 'ڈرائیور کی معلومات تبدیل کریں' : 'Edit Driver / Expiry Date'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h2 className="font-serif font-bold text-xl text-[#4a4a35] group-hover:text-[#8b9d77] transition-colors truncate">
                        {d.name}
                      </h2>
                      
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

                      {/* License Expiry Tracking Badge (Feature A) */}
                      <div className="pt-2 border-t border-[#ecece0]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-[#8e8e75] font-bold flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#8b9d77]" />
                            <span>{isUrdu ? 'لائسنس میعاد:' : 'License Expiry:'}</span>
                          </span>
                          {onNavigate && (
                            <button
                              type="button"
                              onClick={() => onNavigate('verify', 'license')}
                              className="text-[10px] text-[#8b9d77] hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>DLIMS</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        {d.licenseExpiry ? (
                          <div className={`p-2 rounded-xl border flex items-center justify-between text-xs ${licStatus ? licStatus.colorClass : 'bg-slate-50 border-slate-200'}`}>
                            <span className="font-mono font-bold">{d.licenseExpiry}</span>
                            {licStatus && licStatus.days <= 30 && (
                              <span className="text-[10px] font-bold">
                                {licStatus.isExpired ? (isUrdu ? 'میعاد ختم' : 'Expired') : (isUrdu ? `${licStatus.days} دن باقی` : `${licStatus.days} days left`)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openEditModal(d)}
                            className="w-full py-1 px-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg text-[10px] border border-dashed border-slate-300 text-center transition-colors cursor-pointer"
                          >
                            + {isUrdu ? 'لائسنس میعاد تاریخ شامل کریں' : 'Add license expiry date'}
                          </button>
                        )}
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
                      title={isUrdu ? 'ڈرائیور حذف کریں' : 'Remove profile'}
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

      {/* Add / Edit Driver Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-[32px] border border-[#ecece0] p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ecece0] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8b9d77] text-white flex items-center justify-center font-serif italic text-xl">
                  👳🏽‍♂️
                </div>
                <h2 className="font-serif font-bold text-xl text-[#4a4a35]">
                  {editingId ? (isUrdu ? 'ڈرائیور پروفائل تبدیل کریں' : 'Edit Driver Profile') : t.addBtn}
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
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.fullName} *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isUrdu ? 'ڈرائیور کا نام' : 'Driver Full Name'}
                className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.phone}</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03XX-XXXXXXX"
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.licenseType}</label>
                <select
                  value={lictype}
                  onChange={(e) => setLictype(e.target.value)}
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none"
                >
                  <option value="HTV">HTV Heavy</option>
                  <option value="LTV">LTV Light</option>
                  <option value="PSV">PSV Public</option>
                  <option value="HMV">HMV Military</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.licenseNo}</label>
                <input
                  type="text"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  placeholder="LIC-XXXXX"
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8e8e75] mb-1.5">{t.cnic}</label>
                <input
                  type="text"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  placeholder="XXXXX-XXXXXXX-X"
                  className="w-full bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* License Expiry Date (Feature A: Optional) */}
            <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8b9d77]" />
                  <span>{isUrdu ? 'ڈرائیونگ لائسنس کی میعاد (اختیاری):' : 'Driver License Expiry (Optional):'}</span>
                </span>
                <span className="text-[10px] text-[#8e8e75]">DLIMS Alert</span>
              </label>
              <input
                type="date"
                value={licenseExpiry}
                onChange={(e) => setLicenseExpiry(e.target.value)}
                className="w-full bg-white border border-[#ecece0] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none"
              />
              <p className="text-[10px] text-[#8e8e75]">
                {isUrdu ? 'میعاد ختم ہونے سے 30، 15 اور 7 دن پہلے نوٹیفکیشن الرٹ ملے گا۔' : 'You will receive status bar alerts 30, 15, and 7 days before expiry.'}
              </p>
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
