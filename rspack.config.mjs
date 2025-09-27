import path from 'path';
import { rspack } from '@rspack/core';

export default {
  entry: [path.join(process.cwd(), 'src/index.ts')],
  output: {
    filename: 'bundle.js',
    path: path.resolve(process.cwd(), 'dist'),
    library: 'ecstatic',
    libraryTarget: 'umd',
    publicPath: '/static/',
    umdNamedDefine: true,
    hotUpdateChunkFilename: 'hot/hot-update.js',
    hotUpdateMainFilename: 'hot/hot-update.json',
  },
  mode: 'production',
  devtool: 'eval-source-map',
  resolve: {
    extensions: ['.js', '.mjs', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        include: path.join(process.cwd(), 'src'),
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                },
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [new rspack.HotModuleReplacementPlugin()],
};
