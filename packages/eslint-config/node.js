import nodePlugin from 'eslint-plugin-n';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import typescriptConfig from './typescript.js';

/**
 * Node.js/Backend ESLint configuration
 * Extends shared TypeScript config with Node.js-specific settings
 */
export default tseslint.config(...typescriptConfig, {
  files: ['**/*.ts', '**/*.js', '**/*.mts', '**/*.cts'],
  plugins: {
    n: nodePlugin,
  },
  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
  rules: {
    // Node.js-specific rules (via eslint-plugin-n)
    'no-console': 'off', // Console is fine in Node.js
    'n/no-process-exit': 'error',
    'n/no-path-concat': 'error',
    'n/no-deprecated-api': 'error',
    'n/prefer-global/buffer': ['error', 'always'],
    'n/prefer-global/process': ['error', 'always'],
    'n/prefer-promises/fs': 'error',
    'n/prefer-promises/dns': 'error',
  },
});
