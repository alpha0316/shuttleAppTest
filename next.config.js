/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['mapbox-gl', 'react-map-gl'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'mapbox-gl': 'mapbox-gl/dist/mapbox-gl.js',
    };
    return config;
  },
  // Increase chunk size limit
  chunkSizeWarningLimit: 1000, // Default is 500KB
  // Or disable the warning entirely
  // chunkSizeWarningLimit: false,
}

module.exports = nextConfig