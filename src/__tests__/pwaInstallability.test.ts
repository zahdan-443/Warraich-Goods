import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function readPngDimensions(filePath: string): { width: number; height: number } {
  const buf = fs.readFileSync(filePath);
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

describe('PWA Installability & APK Isolation', () => {
  it('validates public/manifest.json required fields and exact PNG dimensions', () => {
    const manifestPath = path.join(ROOT, 'public/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    expect(manifest.id).toBeTruthy();
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name.length).toBeLessThanOrEqual(12);
    expect(manifest.start_url).toBe('./');
    expect(manifest.scope).toBe('./');
    expect(manifest.display).toBe('standalone');
    expect(manifest.prefer_related_applications).toBe(false);

    const has192 = manifest.icons.some((i: any) => i.sizes === '192x192' && i.purpose === 'any');
    const has512 = manifest.icons.some((i: any) => i.sizes === '512x512' && i.purpose === 'any');
    expect(has192).toBe(true);
    expect(has512).toBe(true);

    for (const icon of manifest.icons) {
      const dims = readPngDimensions(path.join(ROOT, 'public', icon.src));
      expect(icon.sizes).toBe(`${dims.width}x${dims.height}`);
    }

    for (const shot of manifest.screenshots) {
      const dims = readPngDimensions(path.join(ROOT, 'public', shot.src));
      expect(shot.sizes).toBe(`${dims.width}x${dims.height}`);
    }
  });

  it('captures beforeinstallprompt in index.html strictly after native isCapacitor early return', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const capGuardIdx = html.indexOf('if (isCapacitor)');
    const bipIdx = html.indexOf("window.addEventListener('beforeinstallprompt'");
    const swRegIdx = html.indexOf('navigator.serviceWorker.register');

    expect(capGuardIdx).toBeGreaterThan(-1);
    expect(bipIdx).toBeGreaterThan(capGuardIdx);
    expect(swRegIdx).toBeGreaterThan(capGuardIdx);
  });

  it('keeps service worker and screenshots excluded from Android APK assets', () => {
    const syncScript = fs.readFileSync(path.join(ROOT, 'scripts/sync-android-assets.js'), 'utf8');
    expect(syncScript).toContain("'sw.js'");
    expect(syncScript).toContain("'screenshot-desktop.png'");
    expect(syncScript).toContain("'screenshot-mobile.png'");
  });

  it('ensures InstallPwaModal guards native APK and avoids restricted public words', () => {
    const modalSrc = fs.readFileSync(path.join(ROOT, 'src/components/InstallPwaModal.tsx'), 'utf8');
    expect(modalSrc).toContain('if (isNativeApp())');
    expect(modalSrc).toContain('wg_pwa_prompt_ready');
    expect(/\bbilty\b|\bbilties\b|بلٹی/i.test(modalSrc)).toBe(false);
  });
});
