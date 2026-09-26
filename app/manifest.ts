import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MediQueue — Smart Patient Registration',
    short_name: 'MediQueue',
    description: 'Streamlined OPD patient registration and queue management',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#1D68F3',
    theme_color: '#1D68F3',
    prefer_related_applications: false,
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        // @ts-ignore
        purpose: 'maskable any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        // @ts-ignore
        purpose: 'maskable any',
      },
    ],
  }
}
