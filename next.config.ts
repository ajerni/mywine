/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    // Server-side configurations
    // Add any server-side configurations here if needed
  },
  publicRuntimeConfig: {
    // Client-side configurations
    // Add any client-side configurations here if needed
  },
  webpack: (config: import('next').NextConfig['webpack'], { isServer }: { isServer: boolean }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer && config) {
      (config as any).resolve = {
        ...(config as any).resolve,
        fallback: {
          ...(config as any).resolve?.fallback,
          fs: false,
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;
