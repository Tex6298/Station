/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Workspace packages ship raw TypeScript — Next must transpile them
  transpilePackages: [
    "@station/ai",
    "@station/auth",
    "@station/config",
    "@station/db",
    "@station/types",
  ],
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
