module.exports = {
  style: {
    postcssOptions: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      // Disable source-map-loader for node_modules
      const sourceMapUseRule = webpackConfig.module.rules.find(
        rule => rule.use && rule.use.find(use => use.loader && use.loader.includes('source-map-loader'))
      );
      
      if (sourceMapUseRule) {
        sourceMapUseRule.exclude = /node_modules/;
      }
      
      return webpackConfig;
    },
  },
} 