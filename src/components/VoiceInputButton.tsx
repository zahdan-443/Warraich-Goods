import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Language } from '../types';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  lang?: Language;
  className?: string;
  placeholderText?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  lang = 'ur',
  className = '',
  placeholderText
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang === 'ur' ? 'ur-PK' : 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setIsListening(false);
      };

      rec.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    } catch (e) {
      console.warn('Speech recognition setup failed:', e);
      setIsSupported(false);
    }
  }, [lang, onTranscript]);

  if (!isSupported) {
    return null;
  }

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Start listening failed:', err);
        setIsListening(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      title={lang === 'ur' ? 'آواز کے ذریعے بول کر لکھیں' : 'Speak to input text'}
      className={`relative inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer font-bold text-xs select-none active:scale-95 ${
        isListening
          ? 'bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-400'
          : 'bg-[#8b9d77]/15 text-[#5a5a40] hover:bg-[#8b9d77] hover:text-white border border-[#8b9d77]/30'
      } ${className}`}
    >
      {isListening ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{lang === 'ur' ? 'سُن رہا ہے...' : 'Listening...'}</span>
        </>
      ) : (
        <>
          <Mic className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">{placeholderText || (lang === 'ur' ? 'بول کر لکھیں' : 'Voice')}</span>
        </>
      )}
    </button>
  );
};
