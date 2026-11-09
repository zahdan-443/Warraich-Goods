import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle2, Clock, Trash2, ExternalLink, Zap, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { requestAccountDeletion, executeImmediateAccountDeletion } from '../utils/storage';

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
  const [deletionType, setDeletionType] = useState<'grace_period' | 'immediate'>('grace_period');
  const [reason, setReason] = useState('No longer using the app');
  const [submitting, setSubmitting] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [immediateSuccess, setImmediateSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExecuteDeletion = async () => {
    if (!confirmed) return;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      if (deletionType === 'immediate') {
        // Immediate Permanent Deletion from Firebase Auth & Cloud Firestore
        const res = await executeImmediateAccountDeletion(userId || userEmail);
        if (res.success) {
          setImmediateSuccess(true);
          setTimeout(() => {
            onDeleted();
            onClose();
          }, 3000);
        } else if (res.message === 'AUTH_REQUIRES_RECENT_LOGIN') {
          setErrorMessage(
            isUrdu
              ? 'سیکیورٹی اصول: فائر بیس تصدیق کے لیے ضروری ہے کہ آپ لاگ آؤٹ کر کے دوبارہ سائن ان کریں اور پھر اکاؤنٹ ڈیلیٹ کریں۔'
              : 'Security requirement: Firebase requires a recent sign-in before permanently deleting an account. Please sign out and sign in again.'
          );
        } else {
          setErrorMessage(res.message);
        }
      } else {
        // 30-Day Grace Period Deletion Request
        const res = await requestAccountDeletion(userId || userEmail, userEmail, reason);
        const formattedDate = new Date(res.scheduledFor).toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
        setScheduledDate(formattedDate);
        setReferenceId(res.referenceId);
        setTimeout(() => {
          onDeleted();
          onClose();
        }, 4000);
      }
    } catch (err: any) {
      console.error('Account deletion error:', err);
      setErrorMessage(err?.message || (isUrdu ? 'کارروائی کے دوران نقص پیش آیا۔' : 'Error processing deletion request.'));
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
                {isUrdu ? 'اکاؤنٹ و ڈیٹا ڈیلیٹ کرنے کی کارروائی' : 'Account & Data Deletion'}
              </h2>
              <p className="text-xs text-red-200 font-sans mt-0.5">
                {isUrdu ? 'گوگل پلے اسٹور سیکیورٹی و پرائیویسی پالیسی' : 'Google Play Security & Data Privacy Policy'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 bg-[#fdfbf7] text-[#4a4a35]">
          {immediateSuccess ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-center space-y-3 animate-in fade-in">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-serif font-bold text-base text-emerald-900">
                {isUrdu ? 'اکاؤنٹ مستقل طور پر حذف ہو چکا ہے' : 'Account Permanently Deleted'}
              </h3>
              <p className="text-xs leading-relaxed text-emerald-800">
                {isUrdu
                  ? 'آپ کا فائر بیس تصدیقی اکاؤنٹ اور کلاؤڈ پر موجود تمام ذاتی ریکارڈز مستقل صاف کر دیے گئے ہیں۔'
                  : 'Your Firebase Authentication account and all personal cloud records have been permanently purged.'}
              </p>
              <div className="text-[11px] text-emerald-700 font-mono">
                {userEmail}
              </div>
            </div>
          ) : scheduledDate ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-center space-y-3 animate-in fade-in">
              <CheckCircle2 className="w-9 h-9 text-emerald-600 mx-auto" />
              <h3 className="font-serif font-bold text-base text-emerald-900">
                {isUrdu ? 'ڈیلیشن کی درخواست موصول ہو گئی' : 'Deletion Request Scheduled'}
              </h3>
              <p className="text-xs leading-relaxed text-emerald-800">
                {isUrdu
                  ? `آپ کا اکاؤنٹ 30 دن کی مہلت کے تحت رکھا گیا ہے۔ ${scheduledDate} کو کلاؤڈ ریکارڈ خودکار طور پر مستقل صاف کر دیا جائے گا۔`
                  : `Your account is now scheduled for permanent purge on ${scheduledDate}. You can cancel this request anytime by signing in within 30 days.`}
              </p>
              {referenceId && (
                <div className="p-2.5 bg-white border border-emerald-300 rounded-xl">
                  <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                    {isUrdu ? 'تصدیقی ریفرنس نمبر (Reference ID):' : 'Verifiable Reference ID:'}
                  </div>
                  <div className="font-mono font-black text-sm text-emerald-950 tracking-wider">
                    {referenceId}
                  </div>
                </div>
              )}
              <div className="text-[11px] text-emerald-700 font-mono">
                {userEmail}
              </div>
            </div>
          ) : (
            <>
              {/* Target Account Badge */}
              <div className="p-3 bg-red-50/70 border border-red-200 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-bold text-red-900">
                  {isUrdu ? 'مطلوبہ اکاؤنٹ:' : 'Target Account:'}
                </span>
                <span className="font-mono font-bold text-red-950 truncate max-w-[200px]">
                  {userEmail}
                </span>
              </div>

              {/* Deletion Type Selection */}
              <div className="space-y-2">
                <label className="font-bold text-xs text-slate-800 block">
                  {isUrdu ? 'ڈیلیشن کا طریقہ منتخب کریں:' : 'Select Deletion Mode:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeletionType('grace_period')}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      deletionType === 'grace_period'
                        ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-300/40 text-amber-950'
                        : 'bg-white border-[#ecece0] text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{isUrdu ? '30 دن کی مہلت (مجوزہ)' : '30-Day Grace Period'}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                      {isUrdu ? '30 دن میں دوبارہ سائن ان کر کے منسوخ کیا جا سکتا ہے' : 'Can be cancelled by signing in within 30 days'}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletionType('immediate')}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      deletionType === 'immediate'
                        ? 'bg-red-50/90 border-red-400 ring-2 ring-red-300/40 text-red-950'
                        : 'bg-white border-[#ecece0] text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-red-700">
                      <Zap className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>{isUrdu ? 'فوری مستقل خاتمہ' : 'Immediate Purge'}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                      {isUrdu ? 'فائر بیس اکاؤنٹ اور تمام ڈیٹا اسی وقت مستقل حذف' : 'Immediately purge Firebase Auth & all records'}
                    </p>
                  </button>
                </div>
              </div>

              {/* Explanatory Banner */}
              {deletionType === 'grace_period' ? (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{isUrdu ? '30 دن کی مہلت کے دوران کیا ہوگا؟' : 'Grace Period Policy'}</span>
                  </div>
                  <ul className={`space-y-1 text-[11px] text-amber-900 leading-relaxed ${isUrdu ? 'pr-4 list-disc' : 'pl-4 list-disc'}`}>
                    <li>{isUrdu ? 'درخواست پر فوری لاگ آؤٹ اور سنک معطل ہو جائے گا۔' : 'You will be signed out and cloud sync paused.'}</li>
                    <li>{isUrdu ? '30 دن کے اندر اسی اکاؤنٹ سے دوبارہ لاگ ان کر کے منسوخ کر سکتے ہیں۔' : 'Sign back in within 30 days to cancel.'}</li>
                    <li>{isUrdu ? '30 دن بعد تمام نجی ڈیٹا خودکار مستقل حذف کر دیا جائے گا۔' : 'After 30 days, all cloud data is permanently deleted.'}</li>
                  </ul>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-300 text-red-950 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-red-900">
                    <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                    <span>{isUrdu ? 'توجہ فرمائیں: فوری خاتمہ ناقابل واپسی ہے' : 'Warning: Immediate Deletion is Irreversible'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-red-900">
                    {isUrdu
                      ? 'اس بٹن پر کلک کرنے سے آپ کا فائر بیس لاگ ان اکاؤنٹ، گاڑیوں کے تمام ریکارڈز، ٹرپ لاگز اور کلاؤڈ بیک اپ اسی وقت مستقل ختم ہو جائیں گے اور ڈیٹا واپس نہیں آ سکے گا۔'
                      : 'This will instantly delete your Firebase Auth user profile, trips, vehicle logs, and all cloud backups. This operation cannot be undone.'}
                  </p>
                </div>
              )}

              {/* Deletion Reason */}
              <div className="space-y-1 text-xs">
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
                  {deletionType === 'immediate'
                    ? (isUrdu
                        ? 'میں تصدیق کرتا ہوں کہ میرا فائر بیس لاگ ان اکاؤنٹ اور تمام نجی ڈیٹا فوراً مستقل ڈیلیٹ کر دیا جائے۔'
                        : 'I confirm that I want to immediately and permanently delete my Firebase login account and all private records.')
                    : (isUrdu
                        ? 'میں تصدیق کرتا ہوں کہ میرا اکاؤنٹ 30 دن کی مہلت کے بعد مستقل صاف کر دیا جائے۔'
                        : 'I confirm that I want to schedule deletion of my account after the 30-day grace period.')}
                </span>
              </label>

              {/* Error Message if any */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

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
                  onClick={handleExecuteDeletion}
                  disabled={!confirmed || submitting}
                  className={`px-5 py-2.5 rounded-xl disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs ${
                    deletionType === 'immediate' ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    {submitting 
                      ? (isUrdu ? 'کارروائی جاری ہے...' : 'Processing...') 
                      : deletionType === 'immediate'
                        ? (isUrdu ? 'فوری مستقل ڈیلیٹ کریں' : 'Permanently Delete Now')
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
