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
    fs.cpSync(distDir, androidPublicDir, { 
      recursive: true,
      filter: (src) => !src.endsWith('server.cjs') && !src.endsWith('server.cjs.map')
    });

    // Ensure no node backend binaries linger in android assets
    const serverCjs = path.join(androidPublicDir, 'server.cjs');
    const serverMap = path.join(androidPublicDir, 'server.cjs.map');
    if (fs.existsSync(serverCjs)) fs.unlinkSync(serverCjs);
    if (fs.existsSync(serverMap)) fs.unlinkSync(serverMap);

    console.log('✅ Synchronized client web assets to android/app/src/main/assets/public (excluding server files)');

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
