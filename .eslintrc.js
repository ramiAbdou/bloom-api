/**
 * @see https://github.com/toshi-toma/eslint-config-airbnb-typescript-prettier/blob/master/index.js
 * for the default options of airbnb-typescript-prettier.
 */

module.exports = {
  env: { jest: true },
  extends: ['airbnb-typescript-prettier'],
  plugins: ['jest', 'simple-import-sort', 'sort-keys-fix'],
  overrides: [
    {
      // Type GraphQL resolvers and MikroORM subscribers don't ever need to use
      // "this" in the classes for anything.
      files: ['*.resolver.ts', '*.subscriber.ts'],
      rules: { 'class-methods-use-this': 0 }
    },
    {
      files: ['index.ts', 'Migration*.ts'],
      rules: { 'import/prefer-default-export': 0 }
    },
    { files: ['*.router.ts'], rules: { 'class-methods-use-this': 0 } },
    {
      files: ['*.args.ts', '*.types.ts', '*.util.ts'],
      rules: { 'import/prefer-default-export': 0 }
    },
    { files: ['src/**/*.ts'] }
  ],
  rules: {
    '@typescript-eslint/ban-ts-ignore': 0, // Allow @ts-ignore to be used.
    '@typescript-eslint/no-empty-function': 0, // This will likely never happen.
    '@typescript-eslint/no-explicit-any': 0, // Allow type "any" to be used.
    '@typescript-eslint/no-inferrable-types': 0,
    '@typescript-eslint/no-unused-vars': [
      2,
      {
        argsIgnorePattern: '_', // Allow underscores not to be treated as vars.
        varsIgnorePattern: '_' // Allow underscores not to be treated as vars.
      }
    ],
    curly: ['error', 'multi-line'],
    'import/newline-after-import': 2, // Requires a newline after imports.
    'import/no-cycle': 0, // Don't allow cycles in the code.
    'import/no-extraneous-dependencies': 0,
    'max-classes-per-file': 0,
    'newline-per-chained-call': 2,
    'no-param-reassign': 0, // Allow parameter reassigning in a function.
    'no-plusplus': 0, // Allow the i++ syntax, helpful for manual for-loops.
    'object-curly-newline': 0,
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'multiline-const', next: '*' },
      {
        blankLine: 'always',
        prev: ['block-like', 'multiline-expression'],
        next: '*'
      },
      {
        blankLine: 'always',
        prev: '*',
        next: ['function', 'multiline-const', 'multiline-expression']
      },
      {
        blankLine: 'always',
        prev: ['multiline-const', 'multiline-expression'],
        next: 'return'
      }
    ],
    'prefer-destructuring': ['error', { object: true, array: false }],
    semi: 2, // Must have semicolon wherever possible.
    'simple-import-sort/sort': [
      2,
      // This groups 3rd-party packages together, then groups internal @
      // alias modules with "../" type files.
      { groups: [['^\\u0000'], ['^\\w', '^@mikro-orm'], ['^@?\\w', '^\\.']] }
    ],
    'sort-keys-fix/sort-keys-fix': 2 // Sorts objects keys automatically.
  },
  settings: {
    'import/resolver': {
      typescript: { project: './tsconfig.json' }
    },
    react: { version: '999.999.999' }
  }
};
