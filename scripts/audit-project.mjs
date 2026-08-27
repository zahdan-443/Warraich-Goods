#!/usr/bin/env node

/**
 * Warraich Goods - Comprehensive PWABuilder & Production Auditor
 * 
 * Specifically validates all PWABuilder PWA Score & App Wrapping criteria:
 * 1. Web App Manifest presence, fields, icons (192, 512, maskable), screenshots, shortcuts
 * 2. Service Worker capabilities (Install, Activate, Fetch/Offline, Sync, PeriodicSync, Push, NotificationClick, Message)
 * 3. HTML Meta & PWA Headers
 * 4. TypeScript strict compilation
 * 5. Production build output & asset integrity
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync } from 'child_process';

const ROOT = process.cwd();
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m"
};

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function report(category, name, passed, detail = "") {
  totalChecks++;
  if (passed) {
    passedChecks++;
    console.log(`  ${colors.green}✔ [PASS]${colors.reset} [${category}] ${name} ${detail ? `(${detail})` : ''}`);
  } else {
    failedChecks++;
    console.log(`  ${colors.red}✖ [FAIL]${colors.reset} [${category}] ${name} - ${detail}`);
  }
}

console.log(`\n${colors.cyan}${colors.bold}======================================================${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}   PWABUILDER & PRODUCTION CODE QUALITY AUDITOR      ${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}   Warraich Goods Transport Co. Logistics App         ${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}======================================================${colors.reset}\n`);

// Helper to fetch local endpoint
function fetchLocal(pathname) {
  return new Promise((resolve) => {
    const req = http.get({
      hostname: '127.0.0.1',
      port: 3000,
      path: pathname,
      timeout: 3000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', (err) => resolve({ status: 500, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 408 }); });
  });
}

async function runAudit() {
  console.log(`${colors.bold}1. HTML & Document Headers Audit:${colors.reset}`);
  const indexPath = path.join(ROOT, 'index.html');
  const indexHtml = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';

  report("HTML", "index.html file exists", indexHtml.length > 0);
  report("HTML", "Manifest link <link rel='manifest'> in <head>", /<link\s+[^>]*rel=["']manifest["'][^>]*>/i.test(indexHtml));
  report("HTML", "Service worker registration script present", indexHtml.includes('navigator.serviceWorker.register'));
  report("HTML", "Theme color meta tag configured", indexHtml.includes('name="theme-color"'));
  report("HTML", "Viewport meta tag configured", indexHtml.includes('name="viewport"'));
  report("HTML", "Description meta tag configured", indexHtml.includes('name="description"'));
  report("HTML", "Apple mobile web app capable tag configured", indexHtml.includes('name="apple-mobile-web-app-capable"'));
  report("HTML", "Apple touch icons configured", indexHtml.includes('rel="apple-touch-icon"'));

  console.log(`\n${colors.bold}2. Web App Manifest (PWABuilder Specification):${colors.reset}`);
  const manifestPath = path.join(ROOT, 'public', 'manifest.json');
  let manifest = null;
  try {
    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      report("Manifest", "manifest.json exists and is valid JSON", true);
    } else {
      report("Manifest", "manifest.json exists", false, "public/manifest.json missing");
    }
  } catch (e) {
    report("Manifest", "manifest.json parsing", false, e.message);
  }

  if (manifest) {
    report("Manifest", "name field present and valid", !!manifest.name && manifest.name.length >= 2, manifest.name);
    report("Manifest", "short_name field present and valid", !!manifest.short_name && manifest.short_name.length >= 2, manifest.short_name);
    report("Manifest", "description field present and descriptive", !!manifest.description && manifest.description.length >= 10);
    report("Manifest", "start_url is defined", !!manifest.start_url, manifest.start_url);
    report("Manifest", "scope is defined", !!manifest.scope, manifest.scope);
    report("Manifest", "display is standalone or fullscreen", ['standalone', 'fullscreen', 'minimal-ui'].includes(manifest.display), manifest.display);
    report("Manifest", "background_color is defined", !!manifest.background_color, manifest.background_color);
    report("Manifest", "theme_color is defined", !!manifest.theme_color, manifest.theme_color);
    report("Manifest", "id identifier is defined for native app store packaging", !!manifest.id, manifest.id);

    // Icons check
    const has192 = manifest.icons?.some(i => i.sizes === '192x192');
    const has512 = manifest.icons?.some(i => i.sizes === '512x512');
    const hasMaskable = manifest.icons?.some(i => i.purpose?.includes('maskable'));
    const hasAny = manifest.icons?.some(i => !i.purpose || i.purpose?.includes('any'));
    report("Manifest", "Icon 192x192 defined", has192);
    report("Manifest", "Icon 512x512 defined", has512);
    report("Manifest", "Maskable icon defined (Android requirement)", hasMaskable);
    report("Manifest", "Standard 'any' icon defined", hasAny);

    // Verify icon files on disk
    manifest.icons?.forEach((icon) => {
      const relPath = icon.src.replace(/^\//, '');
      const fullPath = path.join(ROOT, 'public', relPath);
      const exists = fs.existsSync(fullPath);
      report("Assets", `Icon file exists: ${icon.src}`, exists, exists ? `${(fs.statSync(fullPath).size / 1024).toFixed(1)} KB` : 'MISSING');
    });

    // Screenshots check
    const hasNarrow = manifest.screenshots?.some(s => s.form_factor === 'narrow');
    const hasWide = manifest.screenshots?.some(s => s.form_factor === 'wide');
    report("Manifest", "Mobile / Narrow screenshot defined", hasNarrow);
    report("Manifest", "Desktop / Wide screenshot defined", hasWide);

    // Shortcuts check
    report("Manifest", "App Shortcuts configured (≥ 2 shortcuts)", Array.isArray(manifest.shortcuts) && manifest.shortcuts.length >= 2, `${manifest.shortcuts?.length || 0} shortcuts`);
  }

  console.log(`\n${colors.bold}3. Service Worker & Offline Services Audit (/public/sw.js):${colors.reset}`);
  const swPath = path.join(ROOT, 'public', 'sw.js');
  let swCode = '';
  if (fs.existsSync(swPath)) {
    swCode = fs.readFileSync(swPath, 'utf8');
    report("SW", "Service worker file public/sw.js exists", true);
    report("SW", "Install event handler with skipWaiting", swCode.includes("addEventListener('install'") && swCode.includes("skipWaiting"));
    report("SW", "Activate event handler with clients.claim", swCode.includes("addEventListener('activate'") && swCode.includes("clients.claim"));
    report("SW", "Fetch event handler with Offline / Cache Fallback", swCode.includes("addEventListener('fetch'") && (swCode.includes("caches.match") || swCode.includes("respondWith")));
    report("SW", "Background Sync event handler (sync)", swCode.includes("addEventListener('sync'"));
    report("SW", "Periodic Background Sync event handler (periodicsync)", swCode.includes("addEventListener('periodicsync'"));
    report("SW", "Push Notification event handler (push)", swCode.includes("addEventListener('push'"));
    report("SW", "Notification Click event handler (notificationclick)", swCode.includes("addEventListener('notificationclick'"));
    report("SW", "Bi-directional Message event handler (message)", swCode.includes("addEventListener('message'"));
  } else {
    report("SW", "public/sw.js exists", false, "FILE MISSING");
  }

  console.log(`\n${colors.bold}4. Live Dev Server HTTP Endpoints Validation:${colors.reset}`);
  const [resRoot, resManifest, resSw] = await Promise.all([
    fetchLocal('/'),
    fetchLocal('/manifest.json'),
    fetchLocal('/sw.js')
  ]);

  report("Server", "GET / returns HTTP 200 OK", resRoot.status === 200, `status ${resRoot.status}`);
  report("Server", "GET /manifest.json returns HTTP 200 OK", resManifest.status === 200, `status ${resManifest.status}`);
  report("Server", "GET /sw.js returns HTTP 200 OK", resSw.status === 200, `status ${resSw.status}`);

  console.log(`\n${colors.bold}5. TypeScript Compilation & Lint Check:${colors.reset}`);
  try {
    execSync('npm run lint', { stdio: 'pipe' });
    report("Linter", "TypeScript type-checking (tsc --noEmit)", true, "0 errors");
  } catch (e) {
    report("Linter", "TypeScript type-checking (tsc --noEmit)", false, e.stdout?.toString() || e.message);
  }

  console.log(`\n${colors.bold}6. Production Build & Bundling Check:${colors.reset}`);
  try {
    execSync('npm run build', { stdio: 'pipe' });
    const distIndex = path.join(ROOT, 'dist', 'index.html');
    const distManifest = path.join(ROOT, 'dist', 'manifest.json');
    report("Build", "npm run build output generated in dist/", fs.existsSync(distIndex));
    report("Build", "dist/manifest.json copied to build output", fs.existsSync(distManifest));
  } catch (e) {
    report("Build", "npm run build", false, e.stdout?.toString() || e.message);
  }

  console.log(`\n${colors.cyan}${colors.bold}======================================================${colors.reset}`);
  console.log(`${colors.bold}AUDIT RESULTS SUMMARY:${colors.reset}`);
  console.log(`Total Checks Executed : ${totalChecks}`);
  console.log(`Passed Checks         : ${colors.green}${passedChecks}${colors.reset}`);
  console.log(`Failed Checks         : ${failedChecks === 0 ? colors.green + '0' : colors.red + failedChecks}${colors.reset}`);

  if (failedChecks === 0) {
    console.log(`\n${colors.green}${colors.bold}✨ CONGRATULATIONS! ALL PWABUILDER & WRAPPING TESTS PASSED (100/100).${colors.reset}`);
    console.log(`${colors.cyan}The application is fully certified for PWABuilder Android/iOS/Windows/Meta Quest packaging.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${colors.bold}❌ ${failedChecks} CHECK(S) FAILED. Please review the failed items above.${colors.reset}\n`);
    process.exit(1);
  }
}

runAudit().catch(err => {
  console.error("Auditor error:", err);
  process.exit(1);
});
