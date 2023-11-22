/* eslint-disable no-param-reassign */
const path = require('path');
const nextComposePlugins = require('next-compose-plugins');

const { withPlugins } = nextComposePlugins.extend(() => ({}));

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  outDir: '../../asset-canister/public/static/',
  staticPageGenerationTimeout: 30,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  distDir: '.next',
  reactStrictMode: false,
  swcMinify: true,
  transpilePackages: ['antd-mobile'],
  compiler: {
    styledComponents: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['api.trax.so', 'stagingapi.trax.so', 'localhost'],
    // Disable Image Optimization during export
    loader: 'imgix',
    path: ''
  },
  webpack: (
    config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    return config;
  }
};

const plugins = [
];
module.exports = withPlugins(plugins, nextConfig);
