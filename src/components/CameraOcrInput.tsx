import React, { useState, useRef } from 'react';
import { Camera, Loader2, Sparkles } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { Language } from '../types';

interface CameraOcrInputProps {
  onScanResult: (text: string) => void;
  lang?: Language;
  mode?: 'vehicle' | 'fuel' | 'generic';
  className?: string;
  label?: string;
}

export const CameraOcrInput: React.FC<CameraOcrInputProps> = ({
  onScanResult,
  lang = 'ur',
  mode = 'generic',
  className = '',
  label
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(file);
      await worker.terminate();

      const rawText = ret.data.text || '';
      let processed = rawText.trim();

      if (mode === 'fuel') {
        // Extract numbers or price amounts
        const numbers = rawText.match(/\d+([.,]\d+)?/g);
        if (numbers && numbers.length > 0) {
          // Find largest number or standard price
          processed = numbers.sort((a, b) => parseFloat(b.replace(',', '.')) - parseFloat(a.replace(',', '.')))[0];
        }
      } else if (mode === 'vehicle') {
        // Clean vehicle plate format (e.g. LHR 7860, MN-4321)
        const clean = rawText.toUpperCase().replace(/[^A-Z0-9- ]/g, '');
        const plateMatch = clean.match(/[A-Z]{2,3}[-\s]?\d{3,4}/);
        if (plateMatch) {
          processed = plateMatch[0];
        } else {
          processed = clean.slice(0, 12);
        }
      }

      if (processed) {
        onScanResult(processed);
      } else {
        alert(lang === 'ur' ? 'تصویر سے تحریر نہیں پڑھی جا سکی۔ براہ کرم دوبارہ کوشش کریں یا خود درج کریں۔' : 'Could not auto-read text from photo. Please try again or type manually.');
      }
    } catch (err) {
      console.warn('OCR error:', err);
      alert(lang === 'ur' ? 'تصویر اسکین کرنے میں مسئلہ آیا۔' : 'Failed to scan image.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="inline-block">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        disabled={isProcessing}
        onClick={() => fileInputRef.current?.click()}
        title={lang === 'ur' ? 'تصویر یا کیمرے سے نمبر سکین کریں' : 'Scan image with camera'}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer font-bold text-xs active:scale-95 select-none ${
          isProcessing
            ? 'bg-amber-100 text-amber-800 border border-amber-300'
            : 'bg-[#8b9d77]/15 text-[#5a5a40] hover:bg-[#8b9d77] hover:text-white border border-[#8b9d77]/30'
        } ${className}`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
            <span>{lang === 'ur' ? 'پڑھا جا رہا ہے...' : 'Scanning...'}</span>
          </>
        ) : (
          <>
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{label || (lang === 'ur' ? 'کیمرہ اسکین' : 'Scan Photo')}</span>
          </>
        )}
      </button>
    </div>
  );
};
