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
    startupImage:     [],
  },
};

export const viewport: Viewport = {
  themeColor:           '#05070d',
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
      <body className="bg-gray-950 text-gray-50 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
