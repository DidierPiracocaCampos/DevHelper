import prettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const recommended = tseslint.configs.recommended;
const prettierRules = eslintConfigPrettier.default?.rules || eslintConfigPrettier.rules || {};

export default [
  {
    ignores: [
      'node_modules',
      'dist',
      '.angular',
      'coverage',
      'out-tsc',
      'eslint.config.js',
      '**/*.html',
    ],
  },
  {
    plugins: { prettier },
    rules: {
      ...prettierRules,
      'prettier/prettier': 'error',
    },
  },
  ...recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
];
