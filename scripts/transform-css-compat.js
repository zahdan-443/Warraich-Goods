import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const lightningcss = require('lightningcss');

const distAssets = path.resolve('dist/assets');

const TAILWIND_COLORS_RGB = {
  'amber-50': '255,251,235', 'amber-100': '254,243,199', 'amber-200': '253,230,138', 'amber-300': '252,211,77',
  'amber-400': '251,191,36', 'amber-500': '245,158,11', 'amber-600': '217,119,6', 'amber-700': '180,83,9',
  'amber-800': '146,64,14', 'amber-900': '120,53,15',
  'emerald-50': '236,253,245', 'emerald-100': '209,250,229', 'emerald-200': '167,243,208', 'emerald-300': '110,231,183',
  'emerald-400': '52,211,153', 'emerald-500': '16,185,129', 'emerald-600': '5,150,105', 'emerald-700': '4,120,87',
  'emerald-800': '6,95,70', 'emerald-900': '6,78,59',
  'blue-50': '239,246,255', 'blue-100': '219,234,254', 'blue-200': '191,219,254', 'blue-300': '147,197,253',
  'blue-400': '96,165,250', 'blue-500': '59,130,246', 'blue-600': '37,99,235', 'blue-700': '29,78,216',
  'blue-800': '30,64,175', 'blue-900': '30,58,138',
  'slate-50': '248,250,252', 'slate-100': '241,245,249', 'slate-200': '226,232,240', 'slate-300': '203,213,225',
  'slate-400': '148,163,184', 'slate-500': '100,116,139', 'slate-600': '71,85,105', 'slate-700': '51,65,85',
  'slate-800': '30,41,59', 'slate-900': '15,23,42', 'slate-950': '2,6,23',
  'rose-50': '255,241,242', 'rose-100': '255,228,230', 'rose-200': '254,205,211', 'rose-300': '253,164,175',
  'rose-400': '251,113,133', 'rose-500': '244,63,94', 'rose-600': '225,29,72', 'rose-700': '190,18,60',
  'rose-800': '159,18,57', 'rose-900': '136,19,55',
  'red-50': '254,242,242', 'red-100': '254,226,226', 'red-200': '254,202,202', 'red-300': '252,165,165',
  'red-400': '248,113,113', 'red-500': '239,68,68', 'red-600': '220,38,38', 'red-700': '185,28,28',
  'red-800': '153,27,27', 'red-900': '127,29,29',
  'black': '0,0,0', 'white': '255,255,255'
};

if (fs.existsSync(distAssets)) {
  const cssFiles = fs.readdirSync(distAssets).filter(f => f.endsWith('.css'));
  console.log(`[CSS Compat] Transforming ${cssFiles.length} CSS files for Chrome 80+ WebView compatibility...`);

  for (const file of cssFiles) {
    const filePath = path.join(distAssets, file);
    const sourceCode = fs.readFileSync(filePath);
    const originalOklch = (sourceCode.toString().match(/oklch\(/g) || []).length;
    const originalColorMix = (sourceCode.toString().match(/color-mix\(/g) || []).length;

    try {
      const transformed = lightningcss.transform({
        filename: file,
        code: sourceCode,
        targets: {
          chrome: (80 << 16) // Target Chrome 80+ WebView
        },
        minify: true
      });

      let outputCode = transformed.code.toString();

      // Provide solid rgba() fallbacks for translucent overlays and color-mix declarations (for Chrome 100-110 WebViews)
      let fallbacksAdded = 0;
      outputCode = outputCode.replace(/([a-z-]+):\s*color-mix\(in oklab,\s*var\(--color-([a-z0-9-]+)\)\s*(\d+)%,\s*transparent\)/g, (full, prop, colorName, pct) => {
        fallbacksAdded++;
        const rgb = TAILWIND_COLORS_RGB[colorName];
        const alpha = (parseInt(pct, 10) / 100).toFixed(2);
        const fallback = rgb ? `${prop}:rgba(${rgb},${alpha})` : `${prop}:var(--color-${colorName})`;
        return `${fallback};${full}`;
      });

      outputCode = outputCode.replace(/([a-z-]+):\s*color-mix\(in oklab,\s*currentcolor\s*(\d+)%,\s*transparent\)/g, (full, prop, pct) => {
        fallbacksAdded++;
        const alpha = (parseInt(pct, 10) / 100).toFixed(2);
        return `${prop}:rgba(100,116,139,${alpha});${full}`;
      });

      fs.writeFileSync(filePath, outputCode);

      const remainingOklch = (outputCode.match(/oklch\(/g) || []).length;
      const remainingColorMix = (outputCode.match(/color-mix\(/g) || []).length;

      console.log(`✅ [CSS Compat] ${file}: oklch ${originalOklch} -> ${remainingOklch}, color-mix ${originalColorMix} (added ${fallbacksAdded} rgba fallbacks for Chrome 100-110)`);
    } catch (err) {
      console.warn(`[CSS Compat] Failed to transform ${file}:`, err);
    }
  }
} else {
  console.warn('[CSS Compat] dist/assets not found, skipping transform.');
}
