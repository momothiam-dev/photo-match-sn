/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',  // Images Cloudinary
      },
    ],
    formats: ['image/webp'],
  },
  webpack: (config, { isServer }) => {
    // Gérer face-api.js qui essaie d'importer 'fs'
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    }
    
    // Ignorer les erreurs non-critiques
    config.ignoreWarnings = [
      ...config.ignoreWarnings || [],
      (warning) => {
        if (warning.module?.resource?.includes('face-api.js')) {
          return true
        }
        return false
      },
    ]
    
    return config
  },
}

module.exports = nextConfig
