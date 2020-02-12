import webpack from 'webpack'
import path from 'path'
import CompressionPlugin from 'compression-webpack-plugin'
const HtmlWebpackPlugin = require('html-webpack-plugin')

const NODE_ENV: string = process.env.NODE_ENV

const getAbsolutePath = function(folderName: string): string {
  return path.join(__dirname, folderName)
}

const config: webpack.Configuration = {
  entry: {
    'reactive-cache': './examples/index.ts'
  },
  output: {
    filename: '[name].min.js',
    path: getAbsolutePath('dist')
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        isStaging: NODE_ENV === 'development',
        NODE_ENV: `"${NODE_ENV}"`
      }
    }),
    new CompressionPlugin({
      algorithm: 'gzip'
    }),
    new HtmlWebpackPlugin({
      title: 'Reactive Cache',
      filename: 'index.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        loaders: ['babel-loader', 'ts-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.worker\.ts$/,
        use: { loader: 'worker-loader' }
      }
    ]
  }
}

export default config
