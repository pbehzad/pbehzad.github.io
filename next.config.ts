import path from "node:path";
import type { NextConfig } from "next";

// Pin the workspace root to this app. Lockfiles in parent directories
// otherwise make Next.js infer the wrong root for Turbopack and tracing.
const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  images: {
    // Serve AVIF where supported, WebP otherwise (the default is WebP only).
    formats: ['image/avif', 'image/webp'],
    // The defaults plus 1440, so a 3x phone gets the home portrait near its
    // rendered size (about 1400 px) instead of jumping to 1920.
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048, 3840],
    // 75 is the default; 65 is the home portrait's (see HomePortrait).
    qualities: [65, 75],
  },
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
        { key: 'Cache-Control', value: 'private, no-store' },
      ],
    },
  ],
};

export default nextConfig;
