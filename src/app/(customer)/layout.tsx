import React from 'react';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { CustomerBottomNav } from '@/components/customer/CustomerBottomNav';
import PendingPaymentBanner from '@/components/customer/PendingPaymentBanner';
import { Heart, Clock, MapPin, Phone } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { RESTAURANT_NAME } from '@/lib/constants';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cargar configuración del restaurante (horario, dirección) para el footer
  let restaurantName = RESTAURANT_NAME;
  let address = 'Atención en local y delivery en zona';
  let openingHours = 'Lunes a Domingo: 11:30 AM - 4:30 PM';
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('restaurant_settings')
      .select('restaurant_name, address, opening_hours')
      .eq('id', 'main')
      .maybeSingle();
    if (data) {
      restaurantName = data.restaurant_name || restaurantName;
      address = data.address || address;
      openingHours = data.opening_hours || openingHours;
    }
  } catch {
    // keep defaults
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 pb-20 sm:pb-0">
      <CustomerHeader />

      <PendingPaymentBanner />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      <footer className="bg-stone-900 text-stone-300 mt-16 border-t border-stone-800 hidden sm:block">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
            
            <div className="space-y-2">
              <span className="text-xl font-black text-white">
                {restaurantName}
              </span>
              <p className="text-stone-400 leading-relaxed">
                El auténtico sabor casero de cada día en Perú. Menús ejecutivos, platos a la carta y pedidos rápidos directo por WhatsApp.
              </p>
            </div>

            <div className="space-y-2 text-stone-400">
              <h4 className="font-bold text-white uppercase tracking-wider">Horario de Almuerzos</h4>
              <p className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>{openingHours}</span>
              </p>
            </div>

            <div className="space-y-2 text-stone-400">
              <h4 className="font-bold text-white uppercase tracking-wider">Contacto & Pedidos</h4>
              <p className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>{address}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-orange-500" />
                <span>WhatsApp: Directo al confirmar pedido</span>
              </p>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-stone-800 flex items-center justify-between text-xs text-stone-500">
            <p>© 2026 {restaurantName}. Todos los derechos reservados.</p>
            <p className="flex items-center gap-1">
              Hecho con <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> para ti
            </p>
          </div>
        </div>
      </footer>

      <CustomerBottomNav />
      <PWAInstallPrompt />
    </div>
  );
}
