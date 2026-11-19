import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

async function blobToBase64(blob: Blob): Promise<string> {
  if (typeof FileReader !== 'undefined') {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = typeof reader.result === 'string' ? reader.result : '';
        resolve(res.includes(',') ? res.split(',')[1] : res);
      };
      reader.onerror = () => reject(reader.error || new Error('Failed to read blob'));
      reader.readAsDataURL(blob);
    });
  }
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function triggerBrowserBlobDownload(blob: Blob, fileName: string): void {
  if (typeof document === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  if (link.style) {
    link.style.display = 'none';
  }
  document.body?.appendChild?.(link);
  link.click();
  document.body?.removeChild?.(link);
  setTimeout(() => {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }, 2000);
}

/**
 * Exports or shares a binary/document Blob cleanly across Capacitor Android APK, Mobile Web, and Desktop Web.
 * On Android Capacitor APK, writes to app Cache directory via Filesystem and opens the native Android Share sheet
 * (zero extra AndroidManifest permissions required), avoiding silent WebView `<a download>` failures.
 */
export async function shareOrDownloadBlob(
  blob: Blob,
  fileName: string,
  options?: {
    title?: string;
    text?: string;
    dialogTitle?: string;
    preferDownloadOnDesktop?: boolean;
  }
): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

  // 1. Native Android / iOS Capacitor platform
  if (Capacitor.isNativePlatform()) {
    try {
      // Opportunistically clean up temporary exported files older than 1 hour
      try {
        const listed = await Filesystem.readdir({ path: 'exports', directory: Directory.Cache });
        const cutoff = Date.now() - 60 * 60 * 1000;
        for (const entry of listed.files || []) {
          const mtime = typeof entry.mtime === 'number' ? entry.mtime : 0;
          if (mtime > 0 && mtime < cutoff) {
            await Filesystem.deleteFile({ path: `exports/${entry.name}`, directory: Directory.Cache }).catch(() => {});
          }
        }
      } catch {
        // exports directory may not exist yet on first run
      }

      const base64Data = await blobToBase64(blob);
      const exportPath = `exports/${safeName}`;
      const writeResult = await Filesystem.writeFile({
        path: exportPath,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true
      });

      await Share.share({
        title: options?.title || fileName,
        text: options?.text,
        url: writeResult.uri,
        dialogTitle: options?.dialogTitle || options?.title || fileName
      });
      return 'shared';
    } catch (capErr: any) {
      const msg = String(capErr?.message || '').toLowerCase();
      if (capErr?.name === 'AbortError' || msg.includes('cancel')) {
        return 'cancelled';
      }
      console.warn('[NativeExport] Capacitor Share/Filesystem failed, falling back:', capErr);
    }
  }

  // 2. Web Share API with file attachment (mobile browsers)
  if (!options?.preferDownloadOnDesktop && typeof navigator !== 'undefined' && typeof File !== 'undefined') {
    try {
      const file = new File([blob], fileName, { type: blob.type || 'application/octet-stream' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: options?.title || fileName,
          text: options?.text
        });
        return 'shared';
      }
    } catch (shareErr: any) {
      if (shareErr?.name === 'AbortError') {
        return 'cancelled';
      }
      // Fallback to browser download below
    }
  }

  // 3. Standard browser download fallback
  triggerBrowserBlobDownload(blob, fileName);
  return 'downloaded';
}

/**
 * Convenience wrapper for exporting UTF-8 text payloads (JSON, CSV) across APK and Web.
 */
export async function shareOrDownloadText(
  content: string,
  fileName: string,
  mimeType: string,
  options?: {
    title?: string;
    text?: string;
    dialogTitle?: string;
  }
): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const blob = new Blob([content], { type: mimeType });
  return await shareOrDownloadBlob(blob, fileName, options);
}
