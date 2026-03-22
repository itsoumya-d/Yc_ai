import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BoardBrief',
    short_name: 'BoardBrief',
    description: 'Board reports your investors actually read',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6366F1',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
