import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sabor Norteño - Pedidos Online',
    short_name: 'Sabor Norteño',
    description:
      'Pide tu menú del día y platos caseros del norte en Perú, directo por WhatsApp',
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
      {
        src: '/api/pwa-icon?size=512&maskable=1',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
