import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MyWine.info — Your digital wine cellar',
    short_name: 'MyWine',
    description:
      'Track, rate and explore your wine collection. Notes, photos and AI tasting summaries in one place.',
    start_url: '/wine-cellar',
    display: 'standalone',
    background_color: '#faf8f5',
    theme_color: '#7b1e2b',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
