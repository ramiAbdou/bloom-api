import { TsConfigPathsPlugin } from 'awesome-typescript-loader';
import Dotenv from 'dotenv-webpack';
import knexPackage from 'knex/package.json';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { EnvironmentPlugin, IgnorePlugin } from 'webpack';
import mikroOrmPackage from '@mikro-orm/core/package.json';

let dotEnvName: string;

if (process.env.APP_ENV === 'dev') dotEnvName = '.env.dev';
else if (process.env.APP_ENV === 'stage') dotEnvName = '.env.stage';
else if (process.env.APP_ENV === 'prod') dotEnvName = '.env.prod';

// And anything MikroORM's packaging can be ignored if it's not on disk.
// Later we check these dynamically and tell webpack to ignore the ones we
// don't have.
const optionalModules = new Set([
  ...Object.keys(knexPackage.browser),
  ...Object.keys(mikroOrmPackage.peerDependencies)
]);

const webpackConfig = {
  entry: path.join(__dirname, '/src/index.ts'),

  // Automatically sets the NODE_ENV to production as well.
  mode: 'production',

  module: {
    rules: [{ loader: 'awesome-typescript-loader', test: /\.ts$/ }]
  },

  // MikroORM entities throw errors when minimization is true.
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          // Similarly, Terser's compression may at its own discretion change
          // function and class names. While it only rarely does so, it's
          // safest to also disable changing their names here. This can be
          // controlled in a more granular way if needed (see
          // https://terser.org/docs/api-reference.html#compress-options).
          compress: { keep_classnames: true, keep_fnames: true },

          // We want to minify the bundle, but don't want Terser to change the
          // names of our entity classes. This can be controlled in a more
          // granular way if needed, but the safest default config is that we
          // simply disable mangling altogether but allow minification to
          // proceed.
          mangle: false
        }
      })
    ]
  },

  // Outputs the file to dist/index.js.
  output: { filename: 'index.js', path: path.join(__dirname, '/dist') },

  plugins: [
    // Loads the appropriate .env file based on the APP_ENV.
    new Dotenv({ path: path.resolve(__dirname, dotEnvName) }),

    new EnvironmentPlugin({ WEBPACK: true }),

    // Ignore any of our optional modules if they aren't installed. This
    // ignores database drivers that we aren't using for example.
    new IgnorePlugin({
      checkResource: (resource) => {
        const baseResource = resource
          .split('/', resource[0] === '@' ? 2 : 1)
          .join('/');

        if (!optionalModules.has(baseResource)) return false;

        try {
          require.resolve(resource);
          return false;
        } catch {
          return true;
        }
      }
    }),

    new IgnorePlugin({ resourceRegExp: /^pg-native$/ })
  ],

  // Gets path aliases from tsconfig.js.
  resolve: {
    alias: {
      // Resolves a conflict of multiple graphql versions.
      graphql$: path.resolve('./node_modules/graphql/index.js')
    },
    extensions: ['.ts', '.js', '.json'],
    plugins: [
      // Reads the tsconfig.json file and automatically imports all of the
      // aliases that we've defined there.
      new TsConfigPathsPlugin()
    ]
  },

  target: 'node'
};

export default webpackConfig;
