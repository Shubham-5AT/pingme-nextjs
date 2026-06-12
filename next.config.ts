import type { NextConfig } from 'next';
import os from 'os';
import path from 'path';

const getLocalIPs = (): string[] => {
  const ips: string[] = [];
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }

  return ips;
};

const nextConfig: NextConfig = {
  // 'standalone' bundles everything needed to run on a Node.js server.
  // Apache will reverse-proxy to this Node.js process.
  output: 'standalone',

  allowedDevOrigins: [...getLocalIPs(), 'localhost', '127.0.0.1'],

  compress: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/prebook', destination: '/booking', permanent: true },
      { source: '/report', destination: '/contact', permanent: true },
    ];
  },

  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;