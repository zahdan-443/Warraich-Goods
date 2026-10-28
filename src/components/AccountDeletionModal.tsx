import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle2, Clock, Trash2, ExternalLink } from 'lucide-react';
import { Language } from '../types';
import { requestAccountDeletion } from '../utils/storage';

interface AccountDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userId?: string;
  onDeleted: () => void;
  lang: Language;
}

export const AccountDeletionModal: React.FC<AccountDeletionModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  userId = '',
  onDeleted,
  lang
}) => {
  const isUrdu = lang === 'ur';
  const [confirmed, setConfirmed] = useState(false);
  const [reason, setReason] = useState('No longer using the app');
  const [submitting, setSubmitting] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestDeletion = async () => {
    if (!confirmed) return;
    setSubmitting(true);
    try {
      const res = await requestAccountDeletion(userId || userEmail, userEmail, reason);
      const formattedDate = new Date(res.scheduledFor).toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      setScheduledDate(formattedDate);
      setTimeout(() => {
        onDeleted();
        onClose();
      }, 3500);
    } catch (err) {
      console.error('Account deletion error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl border border-red-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        dir={isUrdu ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-800 to-red-900 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            disabled={submitting}
            className={`absolute top-4 ${isUrdu ? 'left-4' : 'right-4'} p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer`}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white">
                {isUrdu ? 'اکاؤنٹ ڈیلیٹ کرنے کی درخواست' : 'Request Account Deletion'}
              </h2>
              <p className="text-xs text-red-200 font-sans mt-0.5">
                {isUrdu ? '30 دن کی رعایتی مدت (Grace Period) پالیسی' : 'Google Play 30-Day Grace Period Policy'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 bg-[#fdfbf7] text-[#4a4a35]">
          {scheduledDate ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-center space-y-2.5 animate-in fade-in">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="font-serif font-bold text-base">
                {isUrdu ? 'ڈیلیشن کی درخواست موصول ہو گئی' : 'Deletion Request Scheduled'}
              </h3>
              <p className="text-xs leading-relaxed text-emerald-800">
                {isUrdu
                  ? `آپ کا اکاؤنٹ 30 دن کی مہلت کے تحت رکھا گیا ہے۔ ${scheduledDate} کو کلاؤڈ ریکارڈ مستقل صاف کر دیا جائے گا۔`
                  : `Your account is now scheduled for permanent purge on ${scheduledDate}. You can cancel this by signing in within 30 days.`}
              </p>
              <div className="text-[11px] text-emerald-700 font-mono">
                {userEmail}
              </div>
            </div>
          ) : (
            <>
              {/* Account Identifier Badge */}
              <div className="p-3 bg-red-50/70 border border-red-200 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-bold text-red-900">
                  {isUrdu ? 'زیر کارروائی اکاؤنٹ:' : 'Target Account:'}
                </span>
                <span className="font-mono font-bold text-red-950 truncate max-w-[200px]">
                  {userEmail}
                </span>
              </div>

              {/* 30-Day Notice Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{isUrdu ? '30 دن کی رعایتی مدت کیسے کام کرتی ہے؟' : 'How the 30-Day Grace Period Works'}</span>
                </div>
                <ul className={`space-y-1.5 text-[11px] text-amber-900 leading-relaxed ${isUrdu ? 'pr-4 list-disc' : 'pl-4 list-disc'}`}>
                  <li>
                    {isUrdu
                      ? 'درخواست جمع ہوتے ہی آپ فوری لاگ آؤٹ ہو جائیں گے اور کلاؤڈ سنک رک جائے گا۔'
                      : 'You will be signed out immediately and cloud synchronization will pause.'}
                  </li>
                  <li>
                    {isUrdu
                      ? 'اگر آپ 30 دن کے اندر اسی اکاؤنٹ سے دوبارہ سائن ان کریں تو آپ ڈیلیشن منسوخ کر سکتے ہیں۔'
                      : 'If you sign back in within 30 days, you can easily cancel the request.'}
                  </li>
                  <li>
                    {isUrdu
                      ? '30 دن مکمل ہونے پر آپ کا نجی ڈیٹا اور کلاؤڈ بیک اپس مستقل طور پر ڈیلیٹ کر دیے جائیں گے۔'
                      : 'After 30 days lapse, all private trips, vehicle logs and cloud records are permanently purged.'}
                  </li>
                </ul>
              </div>

              {/* Deletion Reason */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-800">
                  {isUrdu ? 'ڈیلیٹ کرنے کی بنیادی وجہ:' : 'Reason for Deletion:'}
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#ecece0] rounded-xl text-xs font-medium text-[#4a4a35] outline-none"
                >
                  <option value="No longer using the app">{isUrdu ? 'اب ایپ استعمال نہیں کر رہا' : 'No longer using the app'}</option>
                  <option value="Switched transport company">{isUrdu ? 'گاڑی یا ٹرانسپورٹ تبدیل ہو گئی' : 'Switched vehicle or transport business'}</option>
                  <option value="Privacy concerns">{isUrdu ? 'پرائیویسی تحفظات' : 'Privacy concerns'}</option>
                  <option value="Creating new account">{isUrdu ? 'نیا اکاؤنٹ بنانا چاہتا ہوں' : 'Creating a fresh new account'}</option>
                  <option value="Other">{isUrdu ? 'دیگر وجوہات' : 'Other reasons'}</option>
                </select>
              </div>

              {/* Confirmation Checkbox */}
              <label className="p-3 bg-white border border-red-200 rounded-2xl flex items-start gap-2.5 cursor-pointer text-xs text-red-950">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-red-600 rounded cursor-pointer"
                />
                <span className="leading-relaxed font-medium">
                  {isUrdu
                    ? 'میں تصدیق کرتا ہوں کہ میرا اکاؤنٹ 30 دن کی مہلت کے بعد مستقل صاف کر دیا جائے گا۔'
                    : 'I confirm that I want to schedule permanent deletion of my account and cloud data after 30 days.'}
                </span>
              </label>

              {/* External Link */}
              <div className="text-center pt-1">
                <a
                  href="./delete-account.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 no-underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{isUrdu ? 'عوامی ویب ڈیلیشن پیج پر جائیں' : 'Visit Public Account Deletion Webpage'}</span>
                </a>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#ecece0]">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-[#ecece0] bg-white hover:bg-gray-50 text-slate-700 text-xs font-bold cursor-pointer transition-all"
                >
                  {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleRequestDeletion}
                  disabled={!confirmed || submitting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    {submitting 
                      ? (isUrdu ? 'درخواست بھیجی جا رہی ہے...' : 'Scheduling...') 
                      : (isUrdu ? 'ڈیلیشن شیڈول کریں (30 دن)' : 'Schedule Deletion (30 Days)')}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
