import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.status.community',
  appName: 'STATUS',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
