import webpack from 'webpack'
import path from 'path'
import CompressionPlugin from 'compression-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const NODE_ENV = process.env.NODE_ENV

const config: webpack.Configuration = {
  entry: './src/index.ts',
  output: {
    filename: '[name].min.js',
    path: path.join(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        isStaging: NODE_ENV === 'development',
        NODE_ENV: `"${NODE_ENV}"`,
      },
    }),
    new CompressionPlugin({
      algorithm: 'gzip',
    }) as any,
    new HtmlWebpackPlugin({
      title: 'psyche',
      filename: 'index.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        use: ['babel-loader', 'ts-loader'],
        exclude: /node_modules/,
      },
    ],
  },
}

export default config
