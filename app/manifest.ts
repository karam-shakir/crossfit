import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'المطانيخ',
    short_name:       'المطانيخ',
    description:      'منصة تدريب CrossFit لمجموعة المطانيخ',
    start_url:        '/dashboard',
    display:          'standalone',
    background_color: '#0f172a',
    theme_color:      '#f97316',
    orientation:      'portrait',
    lang:             'ar',
    dir:              'rtl',
    icons: [
      {
        src:   '/icon',
        sizes: '512x512',
        type:  'image/png',
        purpose: 'any',
      },
      {
        src:   '/icon',
        sizes: '512x512',
        type:  'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
