import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 👇 Official new location for output tracing root (Next.js 15+)
  outputFileTracingRoot: process.cwd(),

  // (optional) add any other settings here
  reactStrictMode: true,
};

export default nextConfig;
