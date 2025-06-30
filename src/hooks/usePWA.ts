
import { useState, useEffect } from 'react';

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  canInstall: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  isInstallPromptAvailable: boolean;
}

export const usePWA = (): PWAStatus & { 
  showInstallPrompt: () => void;
  dismissInstallPrompt: () => void;
} => {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: navigator.onLine,
    isUpdateAvailable: false,
    canInstall: false,
    platform: 'unknown',
    isInstallPromptAvailable: false
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Detect platform with better accuracy
    const userAgent = navigator.userAgent.toLowerCase();
    let platform: PWAStatus['platform'] = 'unknown';
    
    if (/ipad|iphone|ipod/.test(userAgent)) {
      platform = 'ios';
    } else if (/android/.test(userAgent)) {
      platform = 'android';
    } else if (/win|mac|linux/.test(userAgent)) {
      platform = 'desktop';
    }

    // Check if installed with multiple methods
    const isInstalled = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    // Handle online/offline status
    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Handle install prompt with better detection
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: Install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      setStatus(prev => ({ 
        ...prev, 
        canInstall: true,
        isInstallPromptAvailable: true
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle app installed
    const handleAppInstalled = () => {
      console.log('PWA: App installed successfully');
      setStatus(prev => ({ ...prev, isInstalled: true }));
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setStatus(prev => ({ ...prev, isUpdateAvailable: true }));
      });

      // Force service worker registration
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('PWA: Service Worker registered successfully');
          
          // Check for updates every 10 seconds
          setInterval(() => {
            registration.update();
          }, 10000);
        })
        .catch((error) => {
          console.error('PWA: Service Worker registration failed:', error);
        });
    }

    setStatus(prev => ({
      ...prev,
      isInstalled,
      platform,
      isOnline: navigator.onLine,
      canInstall: platform === 'ios' || !!deferredPrompt
    }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  const showInstallPrompt = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA: Install prompt ${outcome}`);
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const dismissInstallPrompt = () => {
    setDeferredPrompt(null);
    setStatus(prev => ({ ...prev, isInstallPromptAvailable: false }));
  };

  return {
    ...status,
    showInstallPrompt,
    dismissInstallPrompt
  };
};
