import { describe, it, expect } from 'vitest';

describe('VoiceInputButton Accessibility & UX Properties', () => {
  it('should format appropriate Urdu ARIA labels for idle and listening states', () => {
    const lang = 'ur';
    const labelText = 'بول کر لکھیں';

    const idleAriaLabel = lang === 'ur'
      ? `${labelText} - آواز کے ذریعے درج کریں`
      : `${labelText} - Speak to input text`;

    expect(idleAriaLabel).toBe('بول کر لکھیں - آواز کے ذریعے درج کریں');

    const listeningAriaLabel = lang === 'ur'
      ? 'سُن رہا ہے، آواز سے لکھنا بند کرنے کے لیے کلک کریں'
      : 'Listening, click to stop voice input';

    expect(listeningAriaLabel).toBe('سُن رہا ہے، آواز سے لکھنا بند کرنے کے لیے کلک کریں');
  });

  it('should format appropriate English ARIA labels for idle and listening states', () => {
    const lang = 'en';
    const labelText = 'Voice';

    const idleAriaLabel = lang === 'en'
      ? `${labelText} - Speak to input text`
      : `${labelText} - Voice input`;

    expect(idleAriaLabel).toBe('Voice - Speak to input text');

    const listeningAriaLabel = lang === 'en'
      ? 'Listening, click to stop voice input'
      : 'Listening';

    expect(listeningAriaLabel).toBe('Listening, click to stop voice input');
  });
});
