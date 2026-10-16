import type { Metadata, Viewport } from 'next';
import './globals.css';
import { RestaurantSettingsProvider } from '@/components/RestaurantSettingsProvider';

export const metadata: Metadata = {
  title: 'MenuLiz | Restaurante de Menú Casero',
  description: 'Descubre los mejores menús del día, platos a la carta, combos ejecutivos y postres caseros. Haz tu pedido directo por WhatsApp con entrega rápida.',
  keywords: ['MenuLiz', 'menú del día', 'restaurante', 'almuerzos', 'comida criolla', 'pedidos whatsapp'],
  applicationName: 'MenuLiz',
  appleWebApp: {
    capable: true,
    title: 'MenuLiz',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/icon',
    apple: '/api/pwa-icon?size=192',
  },
  openGraph: {
    title: 'MenuLiz | Restaurante de Menú',
    description: 'El auténtico sabor casero de cada día. Pide tu menú por WhatsApp.',
    siteName: 'MenuLiz',
    locale: 'es_PE',
    type: 'website',
  },
};

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
            animation: 'menulizSplashHide 0.45s ease 0.9s forwards',
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
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            }}
          >
            ML
          </div>
          <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: 0.5 }}>MenuLiz</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Cargando tu menú…</div>
        </div>
        <style
          dangerouslySetInnerHTML={{
            __html: '@keyframes menulizSplashHide{to{opacity:0;visibility:hidden}}',
          }}
        />
        <RestaurantSettingsProvider>{children}</RestaurantSettingsProvider>
      </body>
    </html>
  );
}
