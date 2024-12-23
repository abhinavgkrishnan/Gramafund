/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async headers() {
    return [
      {
        source: '/.well-known/farcaster.json',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: '/api/farcaster',
      },
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  images: {
    domains: ['gramafund.vercel.app'],
  },
};

export default nextConfig;