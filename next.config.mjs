import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['localhost', '127.0.0.1'],
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? packageJson.version,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      resourceQuery: /react/,
      use: ['@svgr/webpack'],
    });
    config.module.rules.push({
      test: /\.svg$/i,
      resourceQuery: { not: [/react/] },
      type: 'asset/resource',
    });
    config.module.rules.push({
      test: /\.mp3$/i,
      type: 'asset/resource',
    });
    return config;
  },
};

export default nextConfig;
