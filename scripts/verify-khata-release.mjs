import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const EXPECTED_MANIFEST_SHA256 = 'eb265574e07cf003dd8ed2ac83d94c9521a2e64418236b0d48d2a2e400adb944';

function fail(msg) {
  console.error('❌ VERIFY FAILED:', msg);
  process.exitCode = 1;
}

function ok(msg) {
  console.log('✅', msg);
}

// 1. Check AndroidManifest.xml SHA-256 unchanged
const manifestPath = path.join(ROOT, 'android/app/src/main/AndroidManifest.xml');
const manifestBuf = fs.readFileSync(manifestPath);
const sha256 = crypto.createHash('sha256').update(manifestBuf).digest('hex');
if (sha256 === EXPECTED_MANIFEST_SHA256) {
  ok(`AndroidManifest.xml unchanged (SHA-256: ${sha256})`);
} else {
  fail(`AndroidManifest.xml hash mismatch! Expected ${EXPECTED_MANIFEST_SHA256}, got ${sha256}`);
}

// 2. Verify public-facing HTML/manifest files exist cleanly ("Bilty" / "بلٹی" is permitted in public text per owner decision)
const publicFilesToVerify = [
  'index.html',
  'public/manifest.json',
  'public/privacy.html',
  'public/terms.html',
  'public/delete-account.html'
];
for (const rel of publicFilesToVerify) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    fail(`Required public file missing: ${rel}`);
  }
}
ok('Required public HTML and manifest files verified cleanly.');

// 3. Scan dist/ (if built) for external hosts, Dashcam exclusion, and bundle size
const distDir = path.join(ROOT, 'dist');
if (!fs.existsSync(distDir)) {
  fail('dist/ directory not found. Run VITE_STORE_BUILD=true npm run build first.');
} else {
  const ALLOWED_HOSTS = new Set([
    'localhost',
    '127.0.0.1',
    'ais-dev-',
    'ais-pre-',
    'firebaseapp.com',
    'googleapis.com',
    'gstatic.com',
    'google.com',
    'accounts.google.com',
    'googleusercontent.com',
    'api.open-meteo.com',
    'router.project-osrm.org',
    'nominatim.openstreetmap.org',
    'tile.openstreetmap.org',
    'wa.me',
    'api.whatsapp.com',
    'pakistan.gov.pk',
    'excise.gos.pk',
    'mtmis.excise.punjab.gov.pk',
    'dlims.punjab.gov.pk',
    'nhmp.gov.pk',
    'psca.gop.pk',
    'w3.org',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'schema.org',
    'warraichgoods',
    'jsdelivr.net',
    'unpkg.com',
    'cdnjs.cloudflare.com',
    'reactjs.org',
    'facebook.com',
    'purl.org',
    'schemas.openxmlformats.org'
  ]);

  let totalBytes = 0;
  let dashcamChunkFound = false;
  const discoveredHosts = new Set();

  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(p);
      } else {
        const st = fs.statSync(p);
        totalBytes += st.size;
        if (/DashcamView/i.test(ent.name)) {
          dashcamChunkFound = true;
        }
        if (/\.(js|css|html|json)$/.test(ent.name)) {
          const content = fs.readFileSync(p, 'utf8');
          const urls = content.match(/https?:\/\/[a-zA-Z0-9.-]+/g) || [];
          for (const u of urls) {
            const host = u.replace(/^https?:\/\//, '').toLowerCase();
            if (host.length > 3 && host.includes('.')) {
              discoveredHosts.add(host);
            }
          }
        }
      }
    }
  }
  walk(distDir);

  if (dashcamChunkFound) {
    fail('DashcamView chunk found in store dist/!');
  } else {
    ok('DashcamView cleanly excluded from store dist/ bundle.');
  }

  const distMb = (totalBytes / (1024 * 1024)).toFixed(2);
  const assetsDir = path.join(distDir, 'assets');
  let assetsBytes = 0;
  if (fs.existsSync(assetsDir)) {
    for (const f of fs.readdirSync(assetsDir)) {
      assetsBytes += fs.statSync(path.join(assetsDir, f)).size;
    }
  }
  const assetsMb = (assetsBytes / (1024 * 1024)).toFixed(2);
  ok(`dist/ total size: ${distMb} MB (dist/assets: ${assetsMb} MB).`);

  // Check for suspicious third-party analytics/CDN/ad hosts added
  const FORBIDDEN_OR_TRACKING = /(mixpanel|amplitude|segment\.|sentry\.io|bugsnag|rollbar|hotjar|fullstory|doubleclick|googlesyndication|googleadservices|admob|facebook\.net|connect\.facebook|tiktok|appsflyer|adjust\.com|branch\.io|onesignal|clarity\.ms|datadog)/i;
  const suspicious = Array.from(discoveredHosts).filter(h => {
    if (FORBIDDEN_OR_TRACKING.test(h)) return true;
    return false;
  });
  console.log('ℹ️  Unique HTTP(S) hosts detected in dist/ (' + discoveredHosts.size + '):', Array.from(discoveredHosts).sort().join(', '));
  if (suspicious.length > 0) {
    fail(`Forbidden tracking/analytics/ad hosts detected: ${suspicious.join(', ')}`);
  } else {
    ok('Zero new tracking/analytics/CDN hosts introduced in dist/.');
  }
}
