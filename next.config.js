/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  images: {
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig