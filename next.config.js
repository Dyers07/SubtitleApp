/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // Augmenter la limite à 100 MB
    },
  },
  webpack: (config, { isServer, dev }) => {
    // Alias '@' vers 'src' pour typescript et le bundler
    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');

    if (isServer) {
      // Exclure les modules Remotion du bundle côté serveur
      config.externals.push('@remotion/bundler', '@remotion/renderer');
    }

    // ✅ CORRECTION: Éviter les conflits de chunks
    if (!isServer && !dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            // Éviter les conflits en forçant des noms uniques
                        default: {
                          ...config.optimization.splitChunks.cacheGroups.default,
                          name: false, // Désactive la réutilisation des noms
                        },
                      },
                    },
                  };
                }
                return config;
              },
            };
            
            module.exports = nextConfig;