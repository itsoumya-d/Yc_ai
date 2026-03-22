import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ClaimForge',
    short_name: 'ClaimForge',
    description: 'Build winning False Claims Act cases with AI',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#EF4444',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
