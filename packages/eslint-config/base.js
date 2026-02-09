import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import gitignore from 'eslint-config-flat-gitignore';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import-x';
import prettierPlugin from 'eslint-plugin-prettier';
import regexpPlugin from 'eslint-plugin-regexp';
import unicornPlugin from 'eslint-plugin-unicorn';

/**
 * Base ESLint configuration for all projects
 * This config provides sensible defaults that work for any JavaScript project
 */
export default [
  gitignore(),
  js.configs.recommended,
  regexpPlugin.configs['flat/recommended'],
  prettierConfig,
  {
    plugins: {
      '@stylistic': stylistic,
      'import-x': importPlugin,
      prettier: prettierPlugin,
      unicorn: unicornPlugin,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'error',

      // Stylistic rules (for things Prettier doesn't handle)
      '@stylistic/indent': 'off', // Let Prettier handle this
      '@stylistic/quotes': 'off', // Let Prettier handle this
      '@stylistic/semi': 'off', // Let Prettier handle this
      '@stylistic/comma-dangle': 'off', // Let Prettier handle this

      // Import rules (using import-x)
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
            },
            {
              pattern: '#**',
              group: 'internal',
            },
          ],
        },
      ],
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-unresolved': 'off', // Let TypeScript handle this

      // Unicorn rules (curated subset)
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-number-properties': 'error',
      'unicorn/prefer-string-starts-ends-with': 'error',
      'unicorn/prefer-string-trim-start-end': 'error',
      'unicorn/prefer-array-flat-map': 'error',
      'unicorn/prefer-array-find': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/no-array-for-each': 'warn',
      'unicorn/no-lonely-if': 'error',
      'unicorn/no-useless-spread': 'error',
      'unicorn/no-useless-undefined': 'error',
      'unicorn/prefer-optional-catch-binding': 'error',
      'unicorn/prefer-ternary': 'warn',
      'unicorn/prefer-top-level-await': 'warn',
      'unicorn/throw-new-error': 'error',
      'unicorn/better-regex': 'warn',
      'unicorn/no-instanceof-array': 'error',
      'unicorn/prefer-type-error': 'error',

      // General best practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'no-useless-concat': 'error',
      'prefer-destructuring': [
        'error',
        {
          array: false,
          object: true,
        },
        {
          enforceForRenamedProperties: false,
        },
      ],
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
];
