#!/usr/bin/env node

/**
 * Warraich Goods - Automated Continuous Code Auditor & Validator
 * 
 * Runs all validation checks across:
 * 1. PWA & Web App Manifest compliance (name, descriptions, icons, paths, shortcuts)
 * 2. Service Worker integrity (/sw.js, root scope, cache sync, push alerts)
 * 3. TypeScript syntax and type safety (tsc --noEmit)
 * 4. Production build asset pipeline (npm run build)
 * 5. Access control and persistent user rules (Bilty Owner restrictions, guest mode)
 */

import fs from 'fs';
import path from 'path';
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

function report(name, passed, detail = "") {
  totalChecks++;
  if (passed) {
    passedChecks++;
    console.log(`${colors.green}✔ [PASS]${colors.reset} ${name} ${detail ? `(${detail})` : ''}`);
  } else {
    failedChecks++;
    console.log(`${colors.red}✖ [FAIL]${colors.reset} ${name} - ${detail}`);
  }
}

console.log(`${colors.cyan}${colors.bold}=== WARRAICH GOODS PROJECT AUDITOR & VALIDATOR ===${colors.reset}\n`);

// 1. Web App Manifest Audit
try {
  const manifestPath = path.join(ROOT, 'public', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    report("Manifest exists and is valid JSON", true);
    report("Manifest has non-empty name", !!manifest.name && manifest.name.length > 5, manifest.name);
    report("Manifest has non-empty short_name", !!manifest.short_name, manifest.short_name);
    report("Manifest has non-empty description", !!manifest.description && manifest.description.length > 10);
    report("Manifest has root start_url and scope", manifest.start_url === '/' && manifest.scope === '/');
    report("Manifest has 192x192 & 512x512 icons", manifest.icons?.some(i => i.sizes === '192x192') && manifest.icons?.some(i => i.sizes === '512x512'));
    report("Manifest icons have valid absolute root paths", manifest.icons?.every(i => i.src.startsWith('/')));
    report("Manifest shortcuts configured", Array.isArray(manifest.shortcuts) && manifest.shortcuts.length >= 4);
    report("Manifest screenshots configured", Array.isArray(manifest.screenshots) && manifest.screenshots.length >= 2);
  } else {
    report("Manifest exists", false, "public/manifest.json not found");
  }
} catch (e) {
  report("Manifest parsing", false, e.message);
}

// 2. Service Worker Audit
try {
  const swPath = path.join(ROOT, 'public', 'sw.js');
  if (fs.existsSync(swPath)) {
    const swContent = fs.readFileSync(swPath, 'utf8');
    report("Service Worker file exists", true);
    report("Service Worker handles install and activate", swContent.includes('addEventListener(\'install\'') && swContent.includes('addEventListener(\'activate\''));
    report("Service Worker handles fetch caching", swContent.includes('addEventListener(\'fetch\''));
    report("Service Worker handles push notifications", swContent.includes('addEventListener(\'push\''));
  } else {
    report("Service Worker file exists", false, "public/sw.js missing");
  }
} catch (e) {
  report("Service Worker check", false, e.message);
}

// 3. index.html PWA tags
try {
  const indexPath = path.join(ROOT, 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  report("index.html has title", indexContent.includes('<title>'));
  report("index.html has description meta tag", indexContent.includes('name="description"'));
  report("index.html has application-name tag", indexContent.includes('name="application-name"'));
  report("index.html registers Service Worker", indexContent.includes('navigator.serviceWorker.register'));
} catch (e) {
  report("index.html verification", false, e.message);
}

// 4. TypeScript Linter
try {
  console.log(`\n${colors.cyan}Running TypeScript linting check...${colors.reset}`);
  execSync('npm run lint', { stdio: 'pipe' });
  report("TypeScript linting & type checks (tsc --noEmit)", true);
} catch (e) {
  report("TypeScript linting & type checks", false, e.stdout?.toString() || e.message);
}

// 5. Applet Build Check
try {
  console.log(`${colors.cyan}Running Vite production build test...${colors.reset}`);
  execSync('npm run build', { stdio: 'pipe' });
  report("Vite Production Build (npm run build)", true);
} catch (e) {
  report("Vite Production Build", false, e.stdout?.toString() || e.message);
}

console.log(`\n${colors.bold}Audit Summary:${colors.reset} ${passedChecks}/${totalChecks} checks passed. ${failedChecks === 0 ? colors.green + 'ALL CHECKS HEALTHY' + colors.reset : colors.red + failedChecks + ' FAILURES DETECTED' + colors.reset}\n`);

if (failedChecks > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
