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
  // Important: Don't set output: 'export' as we have dynamic features
  // Netlify will handle the deployment with the Next.js plugin
}

export default nextConfig
