import React from 'react';
import { Language } from '../types';

export interface CameraOcrInputProps {
  onScanResult: (text: string) => void;
  lang?: Language;
  mode?: 'vehicle' | 'fuel' | 'generic' | 'receipt' | 'expense';
  className?: string;
  label?: string;
}

export const CameraOcrInput: React.FC<CameraOcrInputProps> = () => {
  return null;
};
