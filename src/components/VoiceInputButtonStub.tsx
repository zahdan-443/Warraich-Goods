import React from 'react';
import { Language } from '../types';

export interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  lang?: Language;
  className?: string;
  placeholderText?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = () => {
  return null;
};
