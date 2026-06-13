const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
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
