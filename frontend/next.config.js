/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable x-powered-by header for security
  poweredByHeader: false,
  
  // Enable compression for production
  compress: true,
}

module.exports = nextConfig

