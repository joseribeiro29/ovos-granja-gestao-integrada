
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.00f0eb6443a94abea7da3c7a46022919',
  appName: 'ovos-granja-gestao-integrada',
  webDir: 'dist',
  server: {
    url: 'https://00f0eb64-43a9-4abe-a7da-3c7a46022919.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3b82f6',
      showSpinner: false
    }
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#3b82f6'
  },
  android: {
    backgroundColor: '#3b82f6',
    allowMixedContent: true,
    captureInput: true
  }
};

export default config;
