import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.easmile.app',
  appName: 'EAsmile',
  webDir: 'dist/frontend/browser',
  android: {
    allowMixedContent: false,
    backgroundColor: '#0A1E29'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#D2EEFC',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    }
  }
};

export default config;