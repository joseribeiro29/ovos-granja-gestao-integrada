
import { useEffect, useState } from 'react';

interface WindowsIntegrationState {
  isInstalled: boolean;
  notificationsEnabled: boolean;
  badgeSupported: boolean;
  shareSupported: boolean;
  protocolHandlerSupported: boolean;
}

export const useWindowsIntegration = () => {
  const [state, setState] = useState<WindowsIntegrationState>({
    isInstalled: false,
    notificationsEnabled: false,
    badgeSupported: false,
    shareSupported: false,
    protocolHandlerSupported: false
  });

  useEffect(() => {
    checkFeatures();
    setupEventListeners();
  }, []);

  const checkFeatures = async () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebApp = (window.navigator as any).standalone === true;
    
    const notificationPermission = 'Notification' in window ? 
      Notification.permission === 'granted' : false;

    setState({
      isInstalled: isStandalone || isInWebApp,
      notificationsEnabled: notificationPermission,
      badgeSupported: 'setAppBadge' in navigator,
      shareSupported: 'share' in navigator,
      protocolHandlerSupported: 'registerProtocolHandler' in navigator
    });
  };

  const setupEventListeners = () => {
    // Listen for app install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      (window as any).installPrompt = e;
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setState(prev => ({ ...prev, isInstalled: true }));
    });

    // Listen for visibility changes to update badge
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && state.badgeSupported) {
        clearBadge();
      }
    });
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setState(prev => ({ ...prev, notificationsEnabled: granted }));
      return granted;
    }
    return false;
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (state.notificationsEnabled && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: '/icons/icon-192.png',
          badge: '/icons/badge-72.png',
          ...options
        });
      });
    }
  };

  const setBadge = (count: number) => {
    if (state.badgeSupported) {
      (navigator as any).setAppBadge(count);
    }
  };

  const clearBadge = () => {
    if (state.badgeSupported) {
      (navigator as any).clearAppBadge();
    }
  };

  const shareContent = async (data: ShareData) => {
    if (state.shareSupported) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Error sharing:', error);
        return false;
      }
    }
    return false;
  };

  const installApp = async () => {
    const prompt = (window as any).installPrompt;
    if (prompt) {
      prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === 'accepted') {
        setState(prev => ({ ...prev, isInstalled: true }));
      }
      (window as any).installPrompt = null;
    }
  };

  const registerProtocolHandler = (protocol: string, url: string) => {
    if (state.protocolHandlerSupported) {
      navigator.registerProtocolHandler(protocol, url);
    }
  };

  return {
    ...state,
    requestNotificationPermission,
    showNotification,
    setBadge,
    clearBadge,
    shareContent,
    installApp,
    registerProtocolHandler
  };
};
