import globals from 'globals';
import tseslint from 'typescript-eslint';
import typescriptConfig from './typescript.js';

/**
 * Next.js ESLint configuration
 * Extends shared TypeScript config with browser globals
 * Designed to be used alongside next/core-web-vitals and next/typescript
 */
export default tseslint.config(...typescriptConfig, {
  files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
  rules: {
    // Next.js apps may use console during development
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // Relax top-level-await for Next.js (not always applicable in components)
    'unicorn/prefer-top-level-await': 'off',
  },
});
