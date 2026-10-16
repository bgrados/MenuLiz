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
              width: 96,
              height: 96,
              borderRadius: 28,
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            }}
          >
            {/* Logo: cubiertos cruzados (negro) + iniciales SN */}
            <svg width="66" height="66" viewBox="0 0 64 64" aria-hidden="true">
              <g
                transform="translate(18.2 7.5) scale(1.15)"
                fill="none"
                stroke="#1c1917"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" />
                <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7" />
                <path d="m2.1 21.8 6.4-6.3" />
                <path d="m19 5-7 7" />
              </g>
              <text
                x="32"
                y="49"
                textAnchor="middle"
                fontFamily="'Segoe UI', system-ui, -apple-system, Arial, sans-serif"
                fontSize="15"
                fontWeight="900"
                letterSpacing="0.5"
                fill="#f97316"
              >
                SN
              </text>
            </svg>
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
