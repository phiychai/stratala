import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import nextConfig from '@stratala/eslint-config/next';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Filter out @typescript-eslint plugin from shared config to avoid conflict
// with next/typescript which registers its own instance
const filteredNextConfig = nextConfig.map((config) => {
  if (config.plugins?.['@typescript-eslint']) {
    const { '@typescript-eslint': _, ...restPlugins } = config.plugins;
    return { ...config, plugins: restPlugins };
  }
  return config;
});

const eslintConfig = [
  ...filteredNextConfig,
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    // CMS-specific overrides
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
    },
  },
  {
    ignores: ['.next/'],
  },
];

export default eslintConfig;
