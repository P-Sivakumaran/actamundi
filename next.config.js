// This file sets up the Sentry SDK for monitoring both client and server errors.
const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        port: '',
        pathname: '/ipfs/**',
      },
    ],
  },
  // The `sentry` key was removed from here as it's not a standard Next.js config option.
  // Sentry-specific build options are configured in `sentryWebpackPluginOptions`.
}

// Ensure Sentry is only enabled in production
const sentryWebpackPluginOptions = {
  // For all options see: https://github.com/getsentry/sentry-webpack-plugin#options
  org: process.env.SENTRY_ORG || "acta-mundi",
  project: process.env.SENTRY_PROJECT || "acta-mundi-nextjs",
  silent: true, // Suppresses all logs
  // Only run Sentry in production builds
  dryRun: process.env.NODE_ENV !== 'production',
  hideSourceMaps: true, // Added to control source map visibility in Sentry
};

// Export config with Sentry integration
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions); 