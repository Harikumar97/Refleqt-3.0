import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@refleqt/ui', '@refleqt/core', '@refleqt/utils', '@refleqt/types'],
};

export default nextConfig;
