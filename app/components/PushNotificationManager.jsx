import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import  Button  from '@/app/components/ui/button';
import { useToast } from '@/app/components/ui/use-toast';
import { Bell, X } from 'lucide-react';

const PushNotificationManager = ({ frequencyDays = 30 }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const { toast } = useToast();

  const handleRequestPermission = async () => {
    setShowPrompt(false);
    try {
      const permissionResult = await Notification.requestPermission();
      localStorage.setItem('push_notification_permission_status', permissionResult);

      if (permissionResult === 'granted') {
        toast({
          title: '¡Suscripción exitosa!',
          description: 'Recibirás notificaciones sobre nuevo contenido.',
        });
        // Aquí es donde guardarías la suscripción en tu backend
        // const subscription = await navigator.serviceWorker.ready.then(reg => reg.pushManager.getSubscription());
        // await saveSubscriptionToDb(subscription);
      } else if (permissionResult === 'denied') {
        toast({
          title: 'Suscripción bloqueada',
          description: 'Has bloqueado las notificaciones. Puedes cambiarlas en la configuración de tu navegador.',
          variant: 'destructive',
        });
      } else {
        // El usuario cerró el diálogo, lo tratamos como 'dismiss'
        localStorage.setItem('push_notification_prompt_last_dismissed', new Date().toISOString());
      }
    } catch (error) {
      console.error('Error al solicitar permiso de notificación:', error);
      toast({
        title: 'Error',
        description: 'No se pudo procesar la solicitud de notificaciones.',
        variant: 'destructive',
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('push_notification_prompt_last_dismissed', new Date().toISOString());
    localStorage.setItem('push_notification_permission_status', 'dismissed');
  };

  useEffect(() => {
    const checkNotificationStatus = () => {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
  
        return;
      }

      const permissionStatus = localStorage.getItem('push_notification_permission_status') || Notification.permission;

      if (permissionStatus === 'granted' || permissionStatus === 'denied') {
        return; // El usuario ya ha tomado una decisión permanente.
      }

      const lastDismissed = localStorage.getItem('push_notification_prompt_last_dismissed');
      if (lastDismissed) {
        const dismissedDate = new Date(lastDismissed);
        const currentDate = new Date();
        const daysSinceDismissed = (currentDate - dismissedDate) / (1000 * 60 * 60 * 24);
        
        if (daysSinceDismissed < parseInt(frequencyDays, 10)) {
          return; // No ha pasado suficiente tiempo.
        }
      }
      
      // Si llegamos aquí, es hora de mostrar el prompt.
      // Usamos un timeout para no ser demasiado intrusivos al cargar la página.
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Espera 5 segundos

      return () => clearTimeout(timer);
    };

    checkNotificationStatus();
  }, [frequencyDays]);

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50"
        >
          <div className="bg-card p-4 rounded-lg shadow-lg border border-border max-w-sm">
            <div className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full mr-4">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-grow">
                <h4 className="font-semibold text-card-foreground">¿Quieres ser el primero en saberlo?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Activa las notificaciones para recibir alertas sobre nuevos recursos y actualizaciones.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button onClick={handleRequestPermission} size="sm">Activar</Button>
                  <Button onClick={handleDismiss} variant="ghost" size="sm">Ahora no</Button>
                </div>
              </div>
              <button onClick={handleDismiss} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PushNotificationManager;