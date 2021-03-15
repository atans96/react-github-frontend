/* eslint-disable */
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const { ESBuildMinifyPlugin } = require('esbuild-loader');

const config: webpack.Configuration = {
  mode: 'production',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].[contenthash].js',
    publicPath: '',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          safe: true,
          discardComments: {
            removeAll: true,
          },
        },
        cssProcessor: require('cssnano'),
      }),
      new CssMinimizerPlugin(),
      new ESBuildMinifyPlugin({ target: 'es2015', minify: true }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: 'esbuild-loader',
            options: {
              loader: 'jsx',
              target: 'es2015',
              tsconfigRaw: require('./tsconfig.json'),
            },
          },
          {
            loader: 'thread-loader',
            options: {
              // there should be 1 cpu for the fork-ts-checker-webpack-plugin
              workers: require('os').cpus().length - 1,
              poolTimeout: Infinity, // set this to Infinity in watch mode - see https://github.com/webpack-contrib/thread-loader
            },
          },
        ],
      },
      {
        test: /\.ts$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'ts',
          target: 'es2015',
          tsconfigRaw: require('./tsconfig.json'),
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1,
              url: false,
              modules: true, // Add this option
              localIdentName: '[name]__[local]__[hash:base64:5]', // Add this option
            },
          },
          // Compiles Sass to CSS
          {
            loader: require.resolve('sass-loader'),
            options: {
              includePaths: [path.styles],
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              // Necessary for external CSS imports to work
              // https://github.com/facebookincubator/create-react-app/issues/2677
              ident: 'postcss',
              plugins: () => [
                require('postcss-flexbugs-fixes'),
                cssnano(),
                autoprefixer({
                  browsers: [
                    '>1%',
                    'last 4 versions',
                    'Firefox ESR',
                    'not ie < 9', // React doesn't support IE8 anyway
                  ],
                  flexbox: 'no-2009',
                }),
              ],
            },
          }, // post process the compiled CSS
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.scss'],
    alias: {
      // Provides ability to include node_modules with ~
      '~': path.resolve(process.cwd(), 'src'),
    },
  },
  plugins: [
    new CompressionPlugin({
      test: /\.(js|css)/,
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css',
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new ForkTsCheckerWebpackPlugin({
      async: false,
    }),
    new CleanWebpackPlugin(),
  ],
};

export default config;
