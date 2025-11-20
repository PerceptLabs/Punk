/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@punk/core',
    '@punk/components',
    '@punk/tokens',
    '@punk/synthpunk',
    '@punk/glyphcase'
  ],
  experimental: {
    optimizePackageImports: ['@punk/core', '@punk/components']
  }
}

module.exports = nextConfig
