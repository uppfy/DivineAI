/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/7.x/**',
      },
      {
        protocol: 'https',
        hostname: 'fcuiwgbwavqwunqerchc.supabase.co',
        pathname: '/storage/v1/object/public/**',
      }
    ],
    domains: [
      'divine-comfort.com',
      'lh3.googleusercontent.com', // For Google profile pictures
      'firebasestorage.googleapis.com', // For Firebase Storage
      'www.gstatic.com' // For Google sign-in button
    ],
  },
  async redirects() {
    return [
      {
        source: '/app/:path*',
        destination: 'https://divine-comfort.com/:path*',
        permanent: true,
      },
    ];
  },
  env: {
    NEXT_PUBLIC_APP_URL: 'https://divine-comfort.com'
  }
};

module.exports = nextConfig; 