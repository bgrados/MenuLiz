'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RestaurantSettings } from '@/types';
import { MENU_PRICE, DEFAULT_WHATSAPP_NUMBER, RESTAURANT_NAME, DELIVERY_FEE } from '@/lib/constants';

interface RestaurantSettingsContextValue {
  settings: RestaurantSettings | null;
  loading: boolean;
  /** Precio del menú completo (combo). Fuente: restaurant_settings.menu_price. */
  menuPrice: number;
  deliveryFee: number;
  whatsappNumber: string;
  restaurantName: string;
  refresh: () => Promise<void>;
}

const RestaurantSettingsContext = createContext<RestaurantSettingsContextValue>({
  settings: null,
  loading: true,
  menuPrice: MENU_PRICE,
  deliveryFee: DELIVERY_FEE,
  whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
  restaurantName: RESTAURANT_NAME,
  refresh: async () => {},
});

/**
 * Centraliza la configuración del restaurante (precio del menú, delivery, WhatsApp…)
 * para que un solo valor mande en toda la app. Se actualiza en vivo (Realtime) y al
 * volver a la pestaña, así cambiar el precio en el admin se refleja sin recargar.
 */
export function RestaurantSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('restaurant_settings')
        .select('*')
        .eq('id', 'main')
        .maybeSingle();
      if (data) setSettings(data as RestaurantSettings);
    } catch {
      // Mantener los valores por defecto si la DB no responde
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Carga inicial en async para no llamar setState de forma síncrona dentro del efecto
    const load = async () => {
      await refresh();
    };
    void load();

    const supabase = createClient();
    const channel = supabase
      .channel('realtime:restaurant_settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'restaurant_settings' },
        (payload) => {
          const next = payload.new as RestaurantSettings | undefined;
          if (next && next.id === 'main') setSettings(next);
        }
      )
      .subscribe();

    // Respaldo por si Realtime no está habilitado para esta tabla
    const handleFocus = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refresh]);

  const menuPrice = Number(settings?.menu_price ?? MENU_PRICE) || MENU_PRICE;
  const deliveryFee =
    settings?.delivery_fee !== null && settings?.delivery_fee !== undefined
      ? Number(settings.delivery_fee)
      : DELIVERY_FEE;
  const whatsappNumber = settings?.whatsapp_number || DEFAULT_WHATSAPP_NUMBER;
  const restaurantName = settings?.restaurant_name || RESTAURANT_NAME;

  return (
    <RestaurantSettingsContext.Provider
      value={{ settings, loading, menuPrice, deliveryFee, whatsappNumber, restaurantName, refresh }}
    >
      {children}
    </RestaurantSettingsContext.Provider>
  );
}

export function useRestaurantSettings() {
  return useContext(RestaurantSettingsContext);
}
