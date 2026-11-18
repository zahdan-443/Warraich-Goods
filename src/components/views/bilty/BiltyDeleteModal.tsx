import React from 'react';
import { Trash2 } from 'lucide-react';
import { BiltyRecord } from '../../../types';

interface BiltyDeleteModalProps {
  bilty: BiltyRecord | null;
  isUrdu: boolean;
  onCancel: () => void;
  onConfirmDelete: (id: number) => void;
}

export const BiltyDeleteModal: React.FC<BiltyDeleteModalProps> = ({
  bilty,
  isUrdu,
  onCancel,
  onConfirmDelete
}) => {
  if (!bilty) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-500 space-y-4 text-right" dir="rtl">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-black text-slate-900">
            {isUrdu ? 'کیا آپ واقعی یہ بلٹی حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this bilty?'}
          </h3>
          <p className="text-xs text-slate-500 font-mono">
            {bilty.biltyNo} • {bilty.vehicleNo}
          </p>
        </div>
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 text-center">
          {isUrdu
            ? 'یہ کارروائی مستقل ہے اور یہ بلٹی لیجر سے حذف ہو جائے گی۔'
            : 'This action is irreversible and will remove this bilty from your ledger.'}
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
          >
            {isUrdu ? 'منسوخ کریں' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (bilty.id) {
                onConfirmDelete(bilty.id);
              }
              onCancel();
            }}
            className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {isUrdu ? 'ہاں، ڈیلیٹ کریں' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
