import type { Metadata, Viewport } from 'next';
import './globals.css';
import { RestaurantSettingsProvider } from '@/components/RestaurantSettingsProvider';
import { createClient } from '@/lib/supabase/server';
import { RESTAURANT_NAME } from '@/lib/constants';

export async function generateMetadata(): Promise<Metadata> {
  let name = RESTAURANT_NAME;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('restaurant_settings')
      .select('restaurant_name')
      .eq('id', 'main')
      .maybeSingle();
    if (data?.restaurant_name) name = data.restaurant_name;
  } catch {
    // Usar el nombre por defecto si la DB no responde
  }

  return {
    title: `${name} | Restaurante de Menú Casero`,
    description:
      'Descubre los mejores menús del día, platos a la carta, combos ejecutivos y postres caseros. Haz tu pedido directo por WhatsApp con entrega rápida.',
    keywords: [name, 'menú del día', 'restaurante', 'almuerzos', 'comida criolla', 'pedidos whatsapp'],
    applicationName: name,
    appleWebApp: {
      capable: true,
      title: name,
      statusBarStyle: 'default',
    },
    openGraph: {
      title: `${name} | Restaurante de Menú`,
      description: 'El auténtico sabor casero de cada día. Pide tu menú por WhatsApp.',
      siteName: name,
      locale: 'es_PE',
      type: 'website',
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full" style={{ backgroundColor: '#f97316' }}>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 antialiased selection:bg-orange-500 selection:text-white">
        {/*
          Splash inicial a prueba de balas (inline, sin depender de Tailwind ni del service worker).
          Garantiza que el primer pintado siempre sea naranja con el logo visible, nunca una
          pantalla blanca con texto blanco ilegible. Se oculta solo con una animación CSS y
          queda fuera de la interacción (pointer-events: none).
        */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            background: '#f97316',
            color: '#ffffff',
            pointerEvents: 'none',
            animation: 'snSplashHide 0.45s ease 0.9s forwards',
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 26,
              background: '#ffffff',
              color: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 36,
              letterSpacing: '-1px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            }}
          >
            SN
          </div>
          <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: 0.3 }}>Sabor Norteño</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Cargando tu menú…</div>
        </div>
        <style
          dangerouslySetInnerHTML={{
            __html: '@keyframes snSplashHide{to{opacity:0;visibility:hidden}}',
          }}
        />
        <RestaurantSettingsProvider>{children}</RestaurantSettingsProvider>
      </body>
    </html>
  );
}
