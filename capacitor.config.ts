import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.driverdost.app',
  appName: 'Driver Dost',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
