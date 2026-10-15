import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MenuLiz | Restaurante de Menú Casero',
  description: 'Descubre los mejores menús del día, platos a la carta, combos ejecutivos y postres caseros. Haz tu pedido directo por WhatsApp con entrega rápida.',
  keywords: ['MenuLiz', 'menú del día', 'restaurante', 'almuerzos', 'comida criolla', 'pedidos whatsapp'],
  openGraph: {
    title: 'MenuLiz | Restaurante de Menú',
    description: 'El auténtico sabor casero de cada día. Pide tu menú por WhatsApp.',
    siteName: 'MenuLiz',
    locale: 'es_PE',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 antialiased selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
