/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'remark', 'remark-html'],
  },
  
  // Optimisations pour Vercel
  output: 'standalone',
  compress: true,
  generateEtags: false,
  
  // Images externes - CDN uniquement
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com', 
      'cdn.prod.website-files.com',
      'assets.vercel.com',
      'picsum.photos'
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24h cache
  },
  
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
    ]
  },
  
  // Redirections automatiques
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ]
  },
  
  // Compression et optimisations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Environment variables
  env: {
    SITE_NAME: 'BujaDevil',
    ADMIN_USERNAME: 'root',
    ADMIN_EMAIL: 'raoultjosue2@gmail.com',
    ADMIN_WHATSAPP: '+25761183143'
  }
}

module.exports = nextConfig
