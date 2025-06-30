/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Disable static optimization for pages with searchParams
    forceSwcTransforms: true,
  },
  // Ensure proper handling of dynamic imports and client components
  swcMinify: true,
}

export default nextConfig