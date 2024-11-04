/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ik.imagekit.io'],
    unoptimized: true, // This will disable Next.js's built-in optimization
  },
}

module.exports = nextConfig 