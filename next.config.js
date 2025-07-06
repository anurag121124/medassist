/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // Fix for WebSocket issues with Supabase
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Ignore WebSocket warnings for client-side builds
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/@supabase\/realtime-js/,
      use: {
        loader: 'string-replace-loader',
        options: {
          search: 'require\\(moduleName\\)',
          replace: 'undefined',
          flags: 'g',
        },
      },
    });

    return config;
  },
};

module.exports = nextConfig;
