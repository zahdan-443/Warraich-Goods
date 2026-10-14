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
        .filter(f => !f.endsWith('.map'))
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
      const webOnlyOrRedundant = [
        'server.cjs',
        'server.cjs.map',
        'robots.txt',
        'sitemap.xml',
        '404.html',
        '_headers',
        'screenshot-desktop.png',
        'screenshot-mobile.png',
        'dashcam-icon.jpg'
      ];

      fs.cpSync(distDir, androidPublicDir, { 
        recursive: true,
        filter: (src) => {
          const baseName = path.basename(src);
          return !webOnlyOrRedundant.includes(baseName);
        }
      });

      console.log('✅ Synchronized client web assets to android/app/src/main/assets/public (excluding server files)');

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
            splashFullScreen: true,
            splashImmersive: true
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
