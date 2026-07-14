import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
        { key: 'Pragma', value: 'no-cache' },
        { key: 'Expires', value: '0' },
      ],
    },
    {
      source: '/api/media/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=3600' },
      ],
    },
  ],
};

export default nextConfig;
