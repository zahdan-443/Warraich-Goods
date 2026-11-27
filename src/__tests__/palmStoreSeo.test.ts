import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PALM_STORE_URL, PUBLIC_APP_SHARE_URL } from '../utils/externalLinks';

const ROOT = process.cwd();
const EXPECTED_PALM_URL = 'https://palmplaystore.com/detail/com.warraichgoods.driverdost?country=PK';

describe('Palm Store SEO, Sitemap & Share URL Integration', () => {
  it('publishes identical updated sitemaps at repository root and public/ with all 5 public pages', () => {
    const rootSitemapPath = path.join(ROOT, 'sitemap.xml');
    const publicSitemapPath = path.join(ROOT, 'public/sitemap.xml');

    expect(fs.existsSync(rootSitemapPath)).toBe(true);
    expect(fs.existsSync(publicSitemapPath)).toBe(true);

    const rootXml = fs.readFileSync(rootSitemapPath, 'utf8');
    const publicXml = fs.readFileSync(publicSitemapPath, 'utf8');
    expect(rootXml).toBe(publicXml);

    const expectedLocs = [
      'https://zahdan-443.github.io/Warraich-Goods/',
      'https://zahdan-443.github.io/Warraich-Goods/index.html',
      'https://zahdan-443.github.io/Warraich-Goods/privacy.html',
      'https://zahdan-443.github.io/Warraich-Goods/terms.html',
      'https://zahdan-443.github.io/Warraich-Goods/delete-account.html',
    ];
    for (const loc of expectedLocs) {
      expect(publicXml).toContain(`<loc>${loc}</loc>`);
    }
    expect(publicXml).toContain('<lastmod>2026-11-26</lastmod>');
  });

  it('includes descriptive Palm Store anchor and MobileApplication JSON-LD in index.html without Click here copy', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

    expect(html).toContain(EXPECTED_PALM_URL);
    expect(html).toContain('"@type": "MobileApplication"');
    expect(html).toContain(`"installUrl": "${EXPECTED_PALM_URL}"`);
    expect(html).toContain('Download Driver Dost on Palm Store');
    expect(html.toLowerCase()).not.toContain('click here');
  });

  it('uses the official Palm Store URL for public share links and side menu sharing instead of localhost', () => {
    expect(PALM_STORE_URL).toBe(EXPECTED_PALM_URL);
    expect(PUBLIC_APP_SHARE_URL).toBe(EXPECTED_PALM_URL);

    const headerSrc = fs.readFileSync(path.join(ROOT, 'src/components/Header.tsx'), 'utf8');
    expect(headerSrc).toContain('PALM_STORE_URL');
    expect(headerSrc).toContain('const shareUrl = PALM_STORE_URL;');
    expect(headerSrc).toContain('Download Driver Dost on Palm Store');

    const homeSrc = fs.readFileSync(path.join(ROOT, 'src/components/views/HomeView.tsx'), 'utf8');
    expect(homeSrc).toContain('PALM_STORE_URL');
    expect(homeSrc).toContain('Download Driver Dost on Palm Store');
    expect(homeSrc).toContain('پام اسٹور سے ڈرائیور دوست ڈاؤن لوڈ کریں');
    expect(homeSrc).not.toContain('!isNativeApp()');
  });
});
