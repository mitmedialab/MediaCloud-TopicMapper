/* eslint import/no-extraneous-dependencies: 0 */
const path = require('path');
const merge = require('webpack-merge');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ManifestRevisionPlugin = require('manifest-revision-webpack-plugin');
const baseConfig = require('./webpack.base.config');

// helpful for generating path-specific prod configs for tools
function prodConfigGenerator(basedir, toolName) {
  return {
    // configure the build output files to a custom place so we can check them in
    output: {
      path: path.join(basedir, 'server', 'static', 'gen', toolName),
      publicPath: `/static/gen/${toolName}/`,
      filename: '[name].[chunkhash:8].js',
      chunkFilename: '[id].[chunkhash:8].chunk.js',
    },
    // build a manifest.json for our Flask server to read, pointing at all the files
    plugins: [
      // Create the manifest file that Flask and other frameworks use.
      new ManifestRevisionPlugin(
        path.resolve(basedir, 'server', 'static', 'gen', toolName, 'manifest.json'),
        { rootAssetPath: './src', // important that this be relative, not absolute
          ignorePaths: [/.*\.DS_Store/], // need to manually ignore the .DS_Store files generated on OSX
        },
      ),
    ],
  };
}

const prodConfig = {
  // tells Webpack to do some stuff, including setting NODE_ENV
  mode: 'production',
  // do some code optimization for production builds
  optimization: {
    minimizer: [
      // do some standard obfuscatino
      /*
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
      }),
      */
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: { discardComments: { removeAll: true } },
      }),
    ],
  },
};

module.exports = {
  prodConfigGenerator,
  prodConfig: merge.smart(baseConfig, prodConfig),
};
