module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'react-app',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [ 'react', '@typescript-eslint', 'prettier', 'react-hooks' ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'react/jsx-filename-extension': 'off',
    'no-console': [
      'warn',
      {
        allow: [ 'info', 'error' ],
      },
    ],
    quotes: [ 'warn', 'single' ],
    semi: [ 'warn', 'never' ],
    'no-debugger': [ 'warn' ],
    eqeqeq: [ 'warn' ],
    'no-else-return': [ 'warn' ],
    'no-extra-bind': [ 'warn' ],
    'prefer-destructuring': [
      'warn',
      {
        array: true,
        object: true,
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
    'object-curly-spacing': [ 'warn', 'always' ],
    indent: [ 'warn', 2 ],
    'react-hooks/rules-of-hooks': 'warn',
    'prefer-const': [
      'warn',
      {
        destructuring: 'any',
        ignoreReadBeforeAssign: false,
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
