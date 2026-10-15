import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MenuLiz - Pedidos Online',
    short_name: 'MenuLiz',
    description: 'Pide tu menú del día y platos caseros en Perú directo por WhatsApp',
    start_url: '/',
    display: 'standalone',
    background_color: '#f97316',
    theme_color: '#f97316',
    icons: [
      {
        src: '/api/pwa-icon?size=192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/api/pwa-icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
