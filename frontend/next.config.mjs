/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://3.111.41.182:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;
