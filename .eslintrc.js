module.exports = {
  env: {
    mocha: true
  }, // Keywords like "describe" and "it" won't throw errors.
  extends: ['airbnb-typescript-prettier'],
  plugins: ['simple-import-sort', 'sort-keys-fix'],
  overrides: [
    // For the GraphQL resolver files, we don't need to use this because
    // the type-graphql package doesn't encourage it.
    {
      files: ['*.resolver.ts', '*.repo.ts'],
      rules: { 'class-methods-use-this': 0 }
    },
    {
      files: ['index.ts'],
      rules: { 'import/prefer-default-export': 0 }
    },
    { files: ['*.router.ts'], rules: { 'class-methods-use-this': 0 } },
    {
      files: ['*.args.ts', '*.types.ts', '*.util.ts'],
      rules: { 'max-classes-per-file': 0, 'import/prefer-default-export': 0 }
    }
  ],
  rules: {
    '@typescript-eslint/ban-ts-ignore': 0, // Allow @ts-ignore to be used.
    '@typescript-eslint/no-empty-function': 0, // This will likely never happen.
    '@typescript-eslint/no-explicit-any': 0, // Allow type "any" to be used.
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
      typescript: { directory: './tsconfig.json' }
    },
    react: { version: '999.999.999' }
  }
};
