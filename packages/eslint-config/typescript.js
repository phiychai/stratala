import tseslint from 'typescript-eslint';
import baseConfig from './base.js';

/**
 * TypeScript ESLint configuration
 * Extends base config with TypeScript-specific rules
 * This is the single source of truth for all TS rules — node.js and vue.js extend this
 */
export default tseslint.config(...baseConfig, ...tseslint.configs.strict, {
  files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,
    },
  },
  rules: {
    // TypeScript-specific rules
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      },
    ],
    '@typescript-eslint/consistent-type-exports': [
      'error',
      {
        fixMixedExportsWithInlineTypeSpecifier: true,
      },
    ],
    '@typescript-eslint/no-import-type-side-effects': 'error',

    // Relax some strict rules that are too aggressive
    '@typescript-eslint/no-dynamic-delete': 'warn',
    '@typescript-eslint/no-invalid-void-type': 'warn',

    // Disable base rules that are covered by TypeScript equivalents
    'no-unused-vars': 'off',
  },
});
