import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  // No ser agresivo con el HTML cacheado: así los usuarios no quedan atrapados
  // en una versión vieja de la app (causa típica de "sigue saliendo lo mismo").
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  workboxOptions: {
    // El service worker nuevo toma el control de inmediato y borra cachés antiguas.
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
  },
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default withPWA(nextConfig);
