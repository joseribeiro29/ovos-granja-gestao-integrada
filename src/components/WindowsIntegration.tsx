
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Download, Settings, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface WindowsIntegrationProps {
  onNotificationPermission?: (granted: boolean) => void;
}

const WindowsIntegration = ({ onNotificationPermission }: WindowsIntegrationProps) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [badgeSupported, setBadgeSupported] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);

  useEffect(() => {
    checkInstallationStatus();
    checkNotificationPermission();
    checkFeatureSupport();
  }, []);

  const checkInstallationStatus = () => {
    // Check if app is installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebApp = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebApp);
  };

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      const enabled = permission === 'granted';
      setNotificationsEnabled(enabled);
      onNotificationPermission?.(enabled);
    }
  };

  const checkFeatureSupport = () => {
    setBadgeSupported('setAppBadge' in navigator);
    setShareSupported('share' in navigator);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast.success('Notificações ativadas com sucesso!');
        
        // Show test notification
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification('Sistema de Gestão Avícola', {
              body: 'Notificações ativadas! Você receberá alertas importantes.',
              icon: '/icons/icon-192.png',
              badge: '/icons/badge-72.png',
              tag: 'permission-granted'
            });
          });
        }
      } else {
        toast.error('Permissão para notificações negada');
      }
    }
  };

  const testNotification = () => {
    if (notificationsEnabled && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification('Teste de Notificação', {
          body: 'Esta é uma notificação de teste do sistema.',
          icon: '/icons/icon-192.png',
          badge: '/icons/badge-72.png',
          tag: 'test-notification',
          requireInteraction: true,
          actions: [
            { action: 'view', title: 'Ver Detalhes' },
            { action: 'dismiss', title: 'Dispensar' }
          ]
        });
      });
    }
  };

  const updateBadge = (count: number) => {
    if (badgeSupported) {
      if (count > 0) {
        (navigator as any).setAppBadge(count);
      } else {
        (navigator as any).clearAppBadge();
      }
    }
  };

  const testShare = async () => {
    if (shareSupported) {
      try {
        await navigator.share({
          title: 'Sistema de Gestão Avícola',
          text: 'Confira este sistema completo para gestão de granjas!',
          url: window.location.origin
        });
        toast.success('Compartilhamento realizado!');
      } catch (error) {
        toast.error('Erro ao compartilhar');
      }
    }
  };

  const installApp = () => {
    // This would be handled by the beforeinstallprompt event
    toast.info('Use o menu do navegador para instalar o aplicativo');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Integrações com Windows
        </CardTitle>
        <CardDescription>
          Configure as funcionalidades avançadas do aplicativo no Windows
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Installation Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Status da Instalação</h4>
            <p className="text-sm text-muted-foreground">
              {isInstalled ? 'Aplicativo instalado como PWA' : 'Não instalado'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isInstalled ? 'default' : 'secondary'}>
              {isInstalled ? 'Instalado' : 'Web'}
            </Badge>
            {!isInstalled && (
              <Button size="sm" onClick={installApp}>
                <Download className="h-4 w-4 mr-1" />
                Instalar
              </Button>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Notificações Push</h4>
            <p className="text-sm text-muted-foreground">
              Receba alertas importantes na Central de Ações do Windows
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={notificationsEnabled ? 'default' : 'secondary'}>
              {notificationsEnabled ? 'Ativado' : 'Desativado'}
            </Badge>
            <Button 
              size="sm" 
              onClick={notificationsEnabled ? testNotification : requestNotificationPermission}
            >
              <Bell className="h-4 w-4 mr-1" />
              {notificationsEnabled ? 'Testar' : 'Ativar'}
            </Button>
          </div>
        </div>

        {/* Badge API */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Badge da Barra de Tarefas</h4>
            <p className="text-sm text-muted-foreground">
              Exibe contadores no ícone do app
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={badgeSupported ? 'default' : 'secondary'}>
              {badgeSupported ? 'Suportado' : 'Não Suportado'}
            </Badge>
            {badgeSupported && (
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => updateBadge(5)}>
                  +5
                </Button>
                <Button size="sm" variant="outline" onClick={() => updateBadge(0)}>
                  Limpar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Share Target */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Compartilhamento</h4>
            <p className="text-sm text-muted-foreground">
              Aparece no menu de compartilhamento do Windows
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={shareSupported ? 'default' : 'secondary'}>
              {shareSupported ? 'Suportado' : 'Não Suportado'}
            </Badge>
            {shareSupported && (
              <Button size="sm" onClick={testShare}>
                <Share2 className="h-4 w-4 mr-1" />
                Testar
              </Button>
            )}
          </div>
        </div>

        {/* Window Controls Overlay Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Window Controls Overlay</h4>
            <p className="text-sm text-muted-foreground">
              Barra de título personalizada para aparência nativa
            </p>
          </div>
          <Badge variant="default">
            Configurado
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default WindowsIntegration;
