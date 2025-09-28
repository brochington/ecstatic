import path from 'path';
import { rspack } from '@rspack/core';

const isProduction = process.env.NODE_ENV === 'production';

const baseConfig = {
  entry: {
    index: path.join(process.cwd(), 'src/index.ts'),
  },
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? false : 'eval-source-map',
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
                transform: {
                  react: {
                    runtime: 'automatic',
                  },
                },
              },
              env: {
                targets: isProduction ? 'defaults' : 'last 2 versions',
              },
            },
          },
        ],
      },
    ],
  },
  optimization: {
    usedExports: true, // Enable tree shaking
    minimize: isProduction,
  },
  externals: isProduction ? {
    // Don't bundle peer dependencies in production builds
    // Add any peer deps here if needed
  } : {},
};

// UMD build (for browser/CDN usage)
const umdConfig = {
  ...baseConfig,
  output: {
    filename: 'ecstatic.umd.js',
    path: path.resolve(process.cwd(), 'dist'),
    library: {
      name: 'ecstatic',
      type: 'umd',
      umdNamedDefine: true,
    },
    clean: true,
    publicPath: '/static/',
  },
  plugins: isProduction ? [] : [new rspack.HotModuleReplacementPlugin()],
};

// ESM build (for modern bundlers)
const esmConfig = {
  ...baseConfig,
  experiments: {
    outputModule: true,
  },
  output: {
    filename: 'ecstatic.esm.js',
    path: path.resolve(process.cwd(), 'dist'),
    library: {
      type: 'module',
    },
    clean: false,
  },
  externalsType: 'module',
};

// CommonJS build (for Node.js)
const cjsConfig = {
  ...baseConfig,
  output: {
    filename: 'ecstatic.cjs.js',
    path: path.resolve(process.cwd(), 'dist'),
    library: {
      type: 'commonjs2',
    },
    clean: false,
  },
};

export default [umdConfig, esmConfig, cjsConfig];
