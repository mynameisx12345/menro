import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.menro.ecotrack',
  appName: 'MENRO EcoTrack',
  webDir: 'dist/ui/browser',
  plugins: {
    Geolocation: {
      // Request background location permission on Android
    }
  }
};

export default config;
