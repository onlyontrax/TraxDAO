/* eslint-disable no-param-reassign */
const path = require('path');
const nextComposePlugins = require('next-compose-plugins');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
  optimizeFonts: true,
  webpack: (
    config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    if (process.env.NEXT_PUBLIC_BUILD_ENV === 'staging') {
      // Copy staging files to the output directory
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.resolve(__dirname, 'builds/staging'),
              to: path.resolve(__dirname, 'public')
            }
          ]
        })
      );
    } else if (process.env.NEXT_PUBLIC_BUILD_ENV === 'production') {
      // Copy production files to the output directory
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.resolve(__dirname, 'builds/production'),
              to: path.resolve(__dirname, 'public')
            }
          ]
        })
      );
    }

    return config;
  },
};

const plugins = [
];
module.exports = withPlugins(plugins, nextConfig);
