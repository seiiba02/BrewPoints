import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.brewpoints.app',
  appName: 'BrewPoints',
  webDir: 'out',
  backgroundColor: '#F8F6F0',
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: serverUrl.startsWith('http://'),
        },
      }
    : {}),
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#111110',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
    },
  },
};

export default config;
