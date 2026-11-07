import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const androidPublicDir = path.resolve('android/app/src/main/assets/public');
const androidAssetsDir = path.resolve('android/app/src/main/assets');

if (fs.existsSync(distDir)) {
  try {
    // 1. Inject compiled Vite build chunks into dist/sw.js for complete offline PWA precaching
    const distSw = path.join(distDir, 'sw.js');
    const distAssetsDir = path.join(distDir, 'assets');
    if (fs.existsSync(distSw) && fs.existsSync(distAssetsDir)) {
      const chunkFiles = fs.readdirSync(distAssetsDir)
        .filter(f => !f.endsWith('.map') && fs.statSync(path.join(distAssetsDir, f)).isFile())
        .map(f => `./assets/${f}`);

      let swContent = fs.readFileSync(distSw, 'utf8');
      const injectionString = chunkFiles.map(f => `  '${f}'`).join(',\n');
      swContent = swContent.replace(
        '/* __BUILD_ASSETS_INJECTION__ */',
        injectionString
      );
      fs.writeFileSync(distSw, swContent, 'utf8');
      console.log(`✅ Injected ${chunkFiles.length} production build chunks into Service Worker precache`);
    }

    // 2. Synchronize to Android assets if android directory exists
    if (fs.existsSync(androidAssetsDir)) {
      if (fs.existsSync(androidPublicDir)) {
        // Remove stale assets to prevent accumulation of outdated build chunks
        fs.rmSync(androidPublicDir, { recursive: true, force: true });
      }
      fs.mkdirSync(androidPublicDir, { recursive: true });
      const webOnlyOrRedundant = new Set([
        'server.cjs',
        'server.cjs.map',
        'sw.js',
        'sw.js.map',
        'registerSW.js',
        'robots.txt',
        'sitemap.xml',
        '404.html',
        '_headers',
        '.nojekyll',
        'screenshot-desktop.png',
        'screenshot-mobile.png',
        'dashcam-icon.png',
        'dashcam-icon.jpg'
      ]);

      fs.cpSync(distDir, androidPublicDir, { 
        recursive: true,
        filter: (src) => {
          const rel = path.relative(distDir, src);
          const baseName = path.basename(src);
          
          // Exclude exact matches from web-only set
          if (webOnlyOrRedundant.has(baseName)) return false;
          // Exclude hidden web domain folders like .well-known
          if (rel.startsWith('.well-known') || baseName === '.well-known') return false;
          // Exclude internal AI Studio chat screenshots and attachments
          if (rel.includes('aistudio') || baseName.startsWith('Screenshot_')) return false;
          // Exclude sourcemaps from production APK package
          if (baseName.endsWith('.map')) return false;
          // Exclude service worker files from mobile APK assets
          if (baseName.startsWith('sw.') || baseName.startsWith('workbox-')) return false;
          
          return true;
        }
      });

      // Strict post-copy scrub of any web, server, or diagnostic files from Android assets
      for (const redundantFile of webOnlyOrRedundant) {
        const target = path.join(androidPublicDir, redundantFile);
        if (fs.existsSync(target)) {
          fs.rmSync(target, { recursive: true, force: true });
        }
      }
      const aistudioAssets = path.join(androidPublicDir, 'assets/aistudio');
      if (fs.existsSync(aistudioAssets)) {
        fs.rmSync(aistudioAssets, { recursive: true, force: true });
      }

      console.log('✅ Synchronized client web assets to android/app/src/main/assets/public (scrubbed server, sw, screenshots, and web-only clutter)');

      // Update capacitor.config.json
      const config = {
        appId: "com.warraichgoods.driverdost",
        appName: "Driver Dost",
        webDir: "dist",
        server: {
          androidScheme: "https",
          cleartext: false
        },
        android: {
          allowMixedContent: false,
          captureInput: true,
          webContentsDebuggingEnabled: false
        },
        plugins: {
          SplashScreen: {
            launchShowDuration: 0,
            launchAutoHide: true,
            backgroundColor: "#FFFFFF",
            androidSplashResourceName: "splash",
            androidScaleType: "CENTER_CROP",
            showSpinner: false,
            splashFullScreen: false,
            splashImmersive: false
          },
          LocalNotifications: {
            sound: "default"
          },
          FirebaseAuthentication: {
            skipNativeAuth: false,
            providers: ["google.com"]
          }
        }
      };
      fs.writeFileSync(
        path.join(androidAssetsDir, 'capacitor.config.json'),
        JSON.stringify(config, null, '\t') + '\n'
      );
      console.log('✅ Synchronized capacitor.config.json to android/app/src/main/assets');
    }
  } catch (err) {
    console.error('Warning during asset sync:', err);
  }
}
