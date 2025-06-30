
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, Smartphone, Monitor, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const iOS = /ipad|iphone|ipod/.test(userAgent);
    const android = /android/.test(userAgent);
    const desktop = /win|mac|linux/.test(userAgent) && !iOS && !android;
    
    setIsIOS(iOS);
    
    if (iOS) setPlatform('ios');
    else if (android) setPlatform('android');
    else if (desktop) setPlatform('desktop');

    // Check if app is already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show immediately if not standalone
      if (!standalone) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show for all platforms if not installed
    if (!standalone) {
      // Show immediately for better visibility
      setTimeout(() => setIsVisible(true), 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA instalado com sucesso');
    }
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Hide for only 1 hour instead of 24
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Check if dismissed recently (reduced time)
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const hoursPassed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursPassed < 1) { // Changed from 24 to 1 hour
        return;
      } else {
        // Remove old dismissal
        localStorage.removeItem('pwa-install-dismissed');
      }
    }
  }, []);

  if (!isVisible || isStandalone) return null;

  const getInstallInstructions = () => {
    switch (platform) {
      case 'ios':
        return {
          title: "Instalar no iPhone/iPad",
          steps: [
            { icon: Share, text: "1. Toque no botão 'Compartilhar' (⬆️)" },
            { icon: Download, text: "2. Selecione 'Adicionar à Tela Inicial'" },
            { icon: Smartphone, text: "3. Confirme a instalação" }
          ]
        };
      case 'android':
        return {
          title: "Instalar no Android",
          steps: [
            { icon: Monitor, text: "1. Toque no menu do navegador (⋮)" },
            { icon: Download, text: "2. Selecione 'Instalar app' ou 'Adicionar à tela inicial'" },
            { icon: Smartphone, text: "3. Confirme a instalação" }
          ]
        };
      default:
        return {
          title: "Instalar no Computador",
          steps: [
            { icon: Monitor, text: "1. Clique no ícone de instalação na barra de endereços" },
            { icon: Download, text: "2. Ou use o menu do navegador" },
            { icon: Smartphone, text: "3. Confirme para instalar" }
          ]
        };
    }
  };

  const instructions = getInstallInstructions();

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="shadow-xl border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 animate-in slide-in-from-top duration-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                🐔
              </div>
              <div>
                <CardTitle className="text-lg text-blue-900">Gestão Avícola</CardTitle>
                <CardDescription className="text-blue-700">
                  {instructions.title}
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {platform === 'ios' || !deferredPrompt ? (
            <div className="space-y-3">
              {instructions.steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex items-center gap-3 text-sm text-blue-800">
                    <Icon className="h-4 w-4 text-blue-600" />
                    <span>{step.text}</span>
                  </div>
                );
              })}
              <div className="flex gap-2 mt-4">
                <Button onClick={handleDismiss} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Entendi
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleInstallClick} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!deferredPrompt}
              >
                <Download className="h-4 w-4 mr-2" />
                Instalar Agora
              </Button>
              <Button variant="outline" onClick={handleDismiss} className="border-blue-300 text-blue-700">
                Depois
              </Button>
            </div>
          )}
          
          <div className="mt-3 p-2 bg-blue-100 rounded-lg">
            <p className="text-xs text-blue-700 text-center">
              💡 Instale para usar offline e ter acesso mais rápido!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstaller;
