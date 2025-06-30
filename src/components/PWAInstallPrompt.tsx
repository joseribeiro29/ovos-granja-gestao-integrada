
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detect if already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone;
    setIsStandalone(isInStandaloneMode);

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event triggered');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after 2 seconds if not dismissed before
      setTimeout(() => {
        const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed');
        if (!hasBeenDismissed && !isInStandaloneMode) {
          setShowInstallPrompt(true);
        }
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show prompt after some time if not in standalone mode
    if (iOS && !isInStandaloneMode) {
      setTimeout(() => {
        const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed');
        if (!hasBeenDismissed) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('Install button clicked');
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log('User choice:', outcome);
        if (outcome === 'accepted') {
          console.log('PWA instalado com sucesso');
        } else {
          console.log('Usuário recusou a instalação');
        }
        
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      } catch (error) {
        console.error('Erro ao instalar PWA:', error);
      }
    }
  };

  const handleDismiss = () => {
    console.log('Install prompt dismissed');
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isStandalone || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <Card className="bg-black text-white shadow-2xl border-0 rounded-xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-sm font-medium">
                📱 Instale o App para uma experiência melhor
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {!isIOS && deferredPrompt && (
                <Button 
                  onClick={handleInstallClick}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-bold text-sm h-auto min-w-[80px]"
                >
                  <Download className="mr-1 h-3 w-3" />
                  Instalar
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-gray-300 hover:text-white hover:bg-gray-700 text-xs h-auto px-2 py-1"
              >
                Agora não
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {isIOS && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-300 space-y-1">
                <p className="font-medium">Para instalar no iOS:</p>
                <p>1. Toque no botão compartilhar (□↗)</p>
                <p>2. Selecione "Adicionar à Tela de Início"</p>
                <p>3. Toque em "Adicionar"</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
