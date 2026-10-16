'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Download, X, Smartphone, Share } from 'lucide-react';
import { useRestaurantSettings } from '@/components/RestaurantSettingsProvider';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface AppleNavigator extends Navigator {
  standalone?: boolean;
  maxTouchPoints: number;
}

export default function PWAInstallPrompt() {
  const { restaurantName } = useRestaurantSettings();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const nav = window.navigator as AppleNavigator;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      nav.standalone === true;
    if (isStandalone) return;

    const ua = window.navigator.userAgent || '';
    const isIOSDevice = /iphone|ipad|ipod/i.test(ua) || (window.navigator.platform === 'MacIntel' && nav.maxTouchPoints > 1);

    const handler = (e: Event) => {
      e.preventDefault();
      const ev = e as BeforeInstallPromptEvent;
      deferredRef.current = ev;
      setDeferred(ev);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => {
      deferredRef.current = null;
      setDeferred(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    // Instrucciones automáticas por plataforma
    const t = setTimeout(() => {
      if (deferredRef.current) return;
      setShowInstructions(true);
    }, isIOSDevice ? 3000 : 6000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
      clearTimeout(t);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    deferredRef.current = null;
  };

  if (dismissed) return null;

  // Banner nativo cuando el navegador permite instalación
  if (deferred) {
    return (
      <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
        <div className="bg-stone-900 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 border border-stone-700">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black">Instala {restaurantName} en tu dispositivo</p>
            <p className="text-xs text-stone-300 mt-0.5">
              Accede más rápido desde tu pantalla de inicio y usa la app sin navegador.
            </p>
            <button
              onClick={handleInstall}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Instalar ahora
            </button>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Instrucciones manuales (tablet / navegadores sin prompt nativo)
  if (showInstructions) {
    return (
      <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-4 border border-stone-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-stone-900">Instala {restaurantName} en tu tablet</p>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Abre el menú del navegador (Chrome/Edge/Safari), selecciona
                <strong className="text-stone-800"> “Agregar a pantalla de inicio”</strong> o
                <strong className="text-stone-800"> “Instalar app”</strong>.
                {typeof navigator !== 'undefined' && /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent) && (
                  <> En Safari toca <Share className="inline w-3.5 h-3.5 text-blue-600" /> y luego “Añadir a pantalla de inicio”.</>
                )}
              </p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}