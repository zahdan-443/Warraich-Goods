import React, { useState } from 'react';
import { 
  Shield, 
  FileSpreadsheet, 
  Download, 
  X, 
  Check, 
  EyeOff, 
  Phone, 
  CreditCard, 
  UserCheck, 
  DollarSign,
  FileText,
  Users
} from 'lucide-react';
import { ExportPrivacyOptions, Language } from '../types';
import { 
  exportAllBusinessDataJSON, 
  exportAllBiltiesCSV, 
  exportAllTripsCSV, 
  exportContactsCSV 
} from '../utils/storage';

interface ExportPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ExportPrivacyModal: React.FC<ExportPrivacyModalProps> = ({ isOpen, onClose, lang }) => {
  const [privacyOptions, setPrivacyOptions] = useState<ExportPrivacyOptions>({
    maskCnic: true,
    maskPhone: false,
    anonymizeNames: false,
    includeFinancials: true
  });
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerExport = (type: 'json' | 'bilties' | 'trips' | 'contacts') => {
    setExportFeedback(null);
    try {
      if (type === 'json') {
        exportAllBusinessDataJSON(privacyOptions);
        setExportFeedback(lang === 'ur' ? 'مکمل ڈیٹا بیک اپ (JSON) ڈاؤن لوڈ ہو گیا!' : 'Full JSON backup downloaded!');
      } else if (type === 'bilties') {
        exportAllBiltiesCSV(privacyOptions);
        setExportFeedback(lang === 'ur' ? 'بلٹی ریکارڈز (CSV) فائل ڈاؤن لوڈ ہو گئی!' : 'Bilties CSV downloaded!');
      } else if (type === 'trips') {
        exportAllTripsCSV(privacyOptions);
        setExportFeedback(lang === 'ur' ? 'ٹرپ ہسٹری (CSV) فائل ڈاؤن لوڈ ہو گئی!' : 'Trip History CSV downloaded!');
      } else if (type === 'contacts') {
        exportContactsCSV(privacyOptions);
        setExportFeedback(lang === 'ur' ? 'کسٹمر و ڈرائیور کانٹیکٹس (CSV) ڈاؤن لوڈ ہو گئی!' : 'Contacts CSV downloaded!');
      }
    } catch {
      setExportFeedback(lang === 'ur' ? 'ایکسپورٹ میں خرابی پیش آئی۔' : 'Export failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl flex flex-col overflow-hidden border border-[#e5e5dc]">
        
        {/* Modal Header */}
        <div className="p-5 bg-[#fdfbf7] border-b border-[#ecece0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#1e3a68] text-white shadow-2xs">
              <Shield className="w-5 h-5 text-[#c59b27]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#4a4a35]">
                {lang === 'ur' ? 'ڈیٹا ایکسپورٹ اور پرائیویسی کنٹرولز' : 'Export & Privacy Controls'}
              </h3>
              <p className="text-xs text-[#8e8e75]">
                {lang === 'ur' ? 'شخصی معلومات اور شناختی کارڈ نمبر محفوظ بنائیں' : 'Sanitize sensitive details before export'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#f0f0e4] hover:bg-[#e2e2d5] text-[#5a5a40] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh] text-left">
          
          {/* Feedback banner */}
          {exportFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{exportFeedback}</span>
            </div>
          )}

          {/* Privacy Toggles Card */}
          <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#ecece0]">
              <EyeOff className="w-4 h-4 text-[#8b9d77]" />
              <span className="text-xs font-bold text-[#4a4a35] uppercase tracking-wider">
                {lang === 'ur' ? 'پرائیویسی اور ڈیٹا ماسکنگ سیٹنگز' : 'Privacy Masking Filters'}
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              
              {/* Mask CNIC */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#ecece0] cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-[#1e3a68]" />
                  <div>
                    <div className="text-xs font-bold text-[#4a4a35]">
                      {lang === 'ur' ? 'شناختی کارڈ (CNIC) ماسک کریں' : 'Mask CNIC Numbers'}
                    </div>
                    <div className="text-[10px] text-[#8e8e75]">
                      {lang === 'ur' ? 'مثال: 35201-******67-1' : 'e.g. 35201-******67-1'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={privacyOptions.maskCnic}
                  onChange={(e) => setPrivacyOptions(prev => ({ ...prev, maskCnic: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#1e3a68] focus:ring-[#1e3a68] cursor-pointer"
                />
              </label>

              {/* Mask Phone */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#ecece0] cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="text-xs font-bold text-[#4a4a35]">
                      {lang === 'ur' ? 'فون نمبرز ماسک کریں' : 'Mask Phone Numbers'}
                    </div>
                    <div className="text-[10px] text-[#8e8e75]">
                      {lang === 'ur' ? 'مثال: 0300-***0443' : 'e.g. 0300-***0443'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={privacyOptions.maskPhone}
                  onChange={(e) => setPrivacyOptions(prev => ({ ...prev, maskPhone: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#1e3a68] focus:ring-[#1e3a68] cursor-pointer"
                />
              </label>

              {/* Anonymize Names */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#ecece0] cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="text-xs font-bold text-[#4a4a35]">
                      {lang === 'ur' ? 'شخصی نام گمنام (Anonymize) کریں' : 'Anonymize Person Names'}
                    </div>
                    <div className="text-[10px] text-[#8e8e75]">
                      {lang === 'ur' ? 'مثال: M. A***' : 'e.g. M. A***'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={privacyOptions.anonymizeNames}
                  onChange={(e) => setPrivacyOptions(prev => ({ ...prev, anonymizeNames: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#1e3a68] focus:ring-[#1e3a68] cursor-pointer"
                />
              </label>

              {/* Include Financials */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#ecece0] cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-xs font-bold text-[#4a4a35]">
                      {lang === 'ur' ? 'کرایہ و مالی تفصیلات شامل رکھیں' : 'Include Financial Values'}
                    </div>
                    <div className="text-[10px] text-[#8e8e75]">
                      {lang === 'ur' ? 'کرایہ، ایڈوانس، کل خرچ وغیرہ' : 'Freight totals, advance, expenses'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={privacyOptions.includeFinancials}
                  onChange={(e) => setPrivacyOptions(prev => ({ ...prev, includeFinancials: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#1e3a68] focus:ring-[#1e3a68] cursor-pointer"
                />
              </label>

            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#4a4a35] uppercase tracking-wider block">
              {lang === 'ur' ? 'فائل فارمیٹ کا انتخاب کریں' : 'Download Export Files'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => triggerExport('json')}
                className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-bold text-xs flex items-center gap-2.5 cursor-pointer transition-all shadow-2xs active:scale-95 text-left"
              >
                <Download className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <div>{lang === 'ur' ? 'مکمل بیک اپ (JSON)' : 'Full System Backup'}</div>
                  <div className="text-[10px] font-normal text-indigo-700">JSON Archive</div>
                </div>
              </button>

              <button
                onClick={() => triggerExport('bilties')}
                className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-xs flex items-center gap-2.5 cursor-pointer transition-all shadow-2xs active:scale-95 text-left"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div>{lang === 'ur' ? 'بلٹی ریکارڈز (CSV)' : 'Bilties Spreadsheet'}</div>
                  <div className="text-[10px] font-normal text-emerald-700">CSV Sheet</div>
                </div>
              </button>

              <button
                onClick={() => triggerExport('trips')}
                className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs flex items-center gap-2.5 cursor-pointer transition-all shadow-2xs active:scale-95 text-left"
              >
                <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <div>{lang === 'ur' ? 'ٹرپ ہسٹری (CSV)' : 'Trip History Logs'}</div>
                  <div className="text-[10px] font-normal text-amber-700">CSV Sheet</div>
                </div>
              </button>

              <button
                onClick={() => triggerExport('contacts')}
                className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold text-xs flex items-center gap-2.5 cursor-pointer transition-all shadow-2xs active:scale-95 text-left"
              >
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div>{lang === 'ur' ? 'رابطہ لسٹ (CSV)' : 'Customer & Drivers'}</div>
                  <div className="text-[10px] font-normal text-blue-700">CSV Contacts</div>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#f0f0e4] border-t border-[#ecece0] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#8b9d77] hover:bg-[#798a67] text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            {lang === 'ur' ? 'مکمل (Done)' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
