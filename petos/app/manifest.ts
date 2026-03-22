import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Petos',
    short_name: 'Petos',
    description: 'Complete care for your beloved companion',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#EC4899',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
