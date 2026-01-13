import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  // Parse allowedDevOrigins from environment variable (comma-separated)
  // Default: localhost:3000 if not set
  allowedDevOrigins: ['http://localhost:3000','http://webdev.lan','https://webdev.lan','http://cms.webdev.lan','https://cms.webdev.lan','cms.webdev.lan'],
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
