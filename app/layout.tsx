import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title:       'المطانيخ',
  description: 'منصة تدريب CrossFit لمجموعة المطانيخ',
  manifest:    '/manifest.webmanifest',
  appleWebApp: {
    capable:          true,
    statusBarStyle:   'black-translucent',
    title:            'المطانيخ',
  },
};

export const viewport: Viewport = {
  themeColor:           '#030712',
  width:                'device-width',
  initialScale:         1,
  maximumScale:         1,
  minimumScale:         1,
  userScalable:         false,
  viewportFit:          'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-950 text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
