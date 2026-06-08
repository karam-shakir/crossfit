/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint:     { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  experimental: {
    optimizePackageImports: ['@anthropic-ai/sdk'],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // منع تحميل الموقع داخل iframe (clickjacking)
          { key: 'X-Frame-Options', value: 'DENY' },
          // منع MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // إخفاء معلومات الخادم
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          // منع إرسال Referrer خارج الموقع
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // منع تشغيل features غير ضرورية
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // API routes: منع الـ cache لضمان freshness
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
