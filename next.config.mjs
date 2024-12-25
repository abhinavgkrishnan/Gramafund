/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@farcaster/auth-client", "@farcaster/auth-kit", "siwe"],
  async rewrites() {
    return [
      {
        source: "/.well-known/farcaster.json",
        destination: "/api/farcaster-manifest",
      },
    ];
  },
};

export default nextConfig;
