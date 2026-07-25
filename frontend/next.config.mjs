/** @type {import('next').NextConfig} */
const useLiveApi = process.env.USE_LIVE_API === "1";
const proxyTarget = (
  process.env.BACKEND_PROXY_TARGET ||
  (useLiveApi
    ? "https://api.thuruvancommunications.com"
    : "http://127.0.0.1:8080")
).replace(/\/+$/, "");

const nextConfig = {
  output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: true,
  // Localhost only. Default → local Go API. Set USE_LIVE_API=1 to hit production (avoid unless needed).
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${proxyTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
