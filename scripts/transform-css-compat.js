import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const lightningcss = require('lightningcss');

const distAssets = path.resolve('dist/assets');

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

      const outputCode = transformed.code.toString();
      fs.writeFileSync(filePath, outputCode);

      const remainingOklch = (outputCode.match(/oklch\(/g) || []).length;
      const remainingColorMix = (outputCode.match(/color-mix\(/g) || []).length;

      console.log(`✅ [CSS Compat] ${file}: oklch ${originalOklch} -> ${remainingOklch}, color-mix ${originalColorMix} -> ${remainingColorMix}`);
    } catch (err) {
      console.warn(`[CSS Compat] Failed to transform ${file}:`, err);
    }
  }
} else {
  console.warn('[CSS Compat] dist/assets not found, skipping transform.');
}
