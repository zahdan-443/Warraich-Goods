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
  const base = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL ? import.meta.env.BASE_URL : './';
  const cleanBase = base.endsWith('/') ? base : base + '/';

  const candidates = [
    `${cleanBase}logo.png`,
    './logo.png',
    '/logo.png',
    `${origin}/logo.png`,
    `${cleanBase}app-icon.png`,
    './app-icon.png',
    '/app-icon.png',
    `${origin}/app-icon.png`,
    `${cleanBase}icon-192.png`,
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

/**
 * Universal PDF File Sharing & WhatsApp dispatch
 * On mobile/tablets with Web Share API: shares the ACTUAL PDF file directly into WhatsApp / native share sheet.
 * On desktop/fallbacks: downloads the PDF file and opens WhatsApp with formatted summary.
 */
export async function sharePdfFileOrWhatsApp(options: {
  pdfBlob: Blob;
  fileName: string;
  title: string;
  textSummary: string;
  onDownloadedFallback?: () => void;
}): Promise<void> {
  const { pdfBlob, fileName, title, textSummary, onDownloadedFallback } = options;

  try {
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      await navigator.share({
        title,
        text: textSummary,
        files: [pdfFile]
      });
      return;
    }
  } catch (err: any) {
    // User cancelled share dialog
    if (err?.name === 'AbortError') {
      return;
    }
    console.warn('Web Share with file failed, falling back to download + WhatsApp link:', err);
  }

  // Desktop or unsupported fallback: download the PDF file and open WhatsApp
  try {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.warn('Download link failed:', e);
  }

  if (onDownloadedFallback) {
    onDownloadedFallback();
  }

  const encodedMsg = encodeURIComponent(
    `${textSummary}\n\n📄 *(نوٹ: مکمل پی ڈی ایف رسید ڈاؤن لوڈ ہو گئی ہے، برائے مہربانی چیٹ میں فائل اٹیچ کر کے بھیج دیں۔)*`
  );
  window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
}

