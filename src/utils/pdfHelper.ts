/**
 * Helper utility for PDF rendering and Asset Conversion
 * Ensures official Warraich Goods logo & assets are rendered in PDF without CORS or missing image issues.
 */

let cachedLogoBase64: string | null = null;

export async function getLogoBase64(): Promise<string> {
  if (cachedLogoBase64) {
    return cachedLogoBase64;
  }

  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
  const candidates = [
    '/logo.png',
    `${origin}/logo.png`,
    './logo.png',
    '/app-icon.png',
    `${origin}/app-icon.png`,
    './app-icon.png',
    '/icon-192.png',
    `${origin}/icon-192.png`,
    './icon-192.png'
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 0) {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(blob);
          });
          if (base64 && base64.startsWith('data:image/')) {
            cachedLogoBase64 = base64;
            return base64;
          }
        }
      }
    } catch {
      // Continue to next candidate
    }
  }

  return '';
}
