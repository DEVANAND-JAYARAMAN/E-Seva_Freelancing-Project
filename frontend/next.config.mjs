/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: true,
  // Localhost → production API (avoids CORS on DELETE/PUT/POST from next dev)
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        destination: 'https://api.thuruvancommunications.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
