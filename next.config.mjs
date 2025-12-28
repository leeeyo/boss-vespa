/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
    unoptimized: false,
  },
  compress: true,
  poweredByHeader: false,
  // Exclude MongoDB/Mongoose from client bundles
  serverExternalPackages: [
    'mongoose',
    'mongodb',
  ],
  // Experimental: Ensure server components external packages work with Turbopack
  experimental: {
  },
  // Turbopack configuration
  turbopack: {},
}

export default nextConfig
