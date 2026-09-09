import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const androidPublicDir = path.resolve('android/app/src/main/assets/public');
const androidAssetsDir = path.resolve('android/app/src/main/assets');

if (fs.existsSync(distDir) && fs.existsSync(androidAssetsDir)) {
  try {
    if (!fs.existsSync(androidPublicDir)) {
      fs.mkdirSync(androidPublicDir, { recursive: true });
    }
    fs.cpSync(distDir, androidPublicDir, { recursive: true });
    console.log('✅ Synchronized dist web assets to android/app/src/main/assets/public');

    // Update capacitor.config.json
    const config = {
      appId: "com.punjabfreighthub.app",
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
      }
    };
    fs.writeFileSync(
      path.join(androidAssetsDir, 'capacitor.config.json'),
      JSON.stringify(config, null, '\t') + '\n'
    );
    console.log('✅ Synchronized capacitor.config.json to android/app/src/main/assets');
  } catch (err) {
    console.error('Warning during Android asset sync:', err);
  }
}
