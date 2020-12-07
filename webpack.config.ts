import { TsConfigPathsPlugin } from 'awesome-typescript-loader';
import Dotenv from 'dotenv-webpack';
import path from 'path';
import nodeExternals from 'webpack-node-externals';

export default {
  entry: path.join(__dirname, '/src/index.ts'),
  externals: [nodeExternals()], // Removes large node packages from build.
  mode: 'production',
  module: {
    rules: [{ loader: 'awesome-typescript-loader', test: /\.ts$/ }]
  },

  // MikroORM entities throw errors when minimization is true.
  optimization: { minimize: false },
  output: { filename: 'index.js', path: path.join(__dirname, '/dist') },
  plugins: [new Dotenv()],

  // Gets path aliases from tsconfig.js.
  resolve: { extensions: ['.ts', '.js'], plugins: [new TsConfigPathsPlugin()] }
};
