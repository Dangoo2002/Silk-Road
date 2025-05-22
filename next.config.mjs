/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'silkroadbackend-production.up.railway.app',
        pathname: '/api/images/**',
      },
    ],
  },
};

export default nextConfig;
