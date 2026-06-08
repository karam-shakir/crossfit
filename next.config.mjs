/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint:     { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // تحسين الأداء
  experimental: {
    optimizePackageImports: ['@anthropic-ai/sdk'],
  },

  // تقليل حجم الـ bundle
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
