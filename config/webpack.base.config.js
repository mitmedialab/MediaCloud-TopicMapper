/* eslint import/no-extraneous-dependencies: 0 */
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const WebpackBar = require('webpackbar');

// many of the webpack directives need an absolute path
const basedir = path.resolve(__dirname, '../');

const baseConfig = {
  entry: {
    // the entrypoint for shared CSS used across all the apps
    common_css: [path.resolve(basedir, 'src', 'styles', 'app', 'app.scss')],
  },
  plugins: [
    // needed this to get eslint working for some reason
    new webpack.LoaderOptionsPlugin({ options: {} }),
    // this writes CSS files for our Flask server to read
    new MiniCssExtractPlugin({ filename: '[name].[hash].css' }),
    // strip out all the locales from moment.js except `en` (saves > 100kB)
    new MomentLocalesPlugin(),
    // provide much cleaner feedback while building on the command line
    new WebpackBar(),
    new webpack.DefinePlugin({ MC_VERSION: JSON.stringify(require('../package.json').version) }),
  ],
  stats: 'minimal',
  module: {
    rules: [
      { // run linting check on all the javascript code before trying to compile it
        enforce: 'pre',
        test: /\.(js|jsx)$/,
        exclude: /node_modules/, // we don't want to check the imported packages for formatting
        use: 'eslint-loader', // use eslint as the engine for checking linting
      },
      { // compile all our javascript code
        test: /\.(js|jsx)$/,
        include: path.resolve(basedir, 'src'), // don't compile imported packages
        use: [
          'cache-loader', // cache the transpiled files to make builds slightly faster
          { loader: 'babel-loader' }, // run all the code through bable to transpile it down to vanilla JS
          // don't put options here; otherwise they override what is in the .babelrc
        ],
      },
      { // compile the scss for react-flexbox-grid by itself because it doesn't work wth MiniCssExtractPlugin for some reason
        test: /\.css$/,
        include: /flexboxgrid/,
        loader: 'style-loader!css-loader',
      },
      { // turn all our SCSS into regular CSS
        test: /\.(scss|css)$/,
        loaders: [
          MiniCssExtractPlugin.loader, // focus on the CSS, and stick it in an external file
          'css-loader',
          'sass-loader',
        ],
        exclude: /flexboxgrid/, // and make sure it doesn't try to compile the already-compiled files
      },
    ],
  },
};

module.exports = baseConfig;
