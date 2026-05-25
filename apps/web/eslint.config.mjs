import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import vueConfig from '@stratala/eslint-config/vue';
import withNuxt from './.nuxt/eslint.config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Filter out plugins from vueConfig that Nuxt provides its own instances of:
// - vue (Nuxt registers its own vue plugin)
// - @typescript-eslint (Nuxt registers via nuxt/typescript/setup)
// - import-x (conflicts with Nuxt's import handling)
const vueConfigFiltered = vueConfig
  .map((config) => {
    // Skip configs that set up Vue plugin or Vue parser (Nuxt handles this)
    if (config.plugins?.vue || config.languageOptions?.parser === 'vue-eslint-parser') {
      return null;
    }

    const pluginsToRemove = ['import-x', '@typescript-eslint'];
    const hasConflicting = pluginsToRemove.some((p) => config.plugins?.[p]);

    if (hasConflicting) {
      const plugins = Object.fromEntries(
        Object.entries(config.plugins || {}).filter(([plugin]) => !pluginsToRemove.includes(plugin))
      );
      return {
        ...config,
        plugins,
        rules: Object.fromEntries(
          Object.entries(config.rules || {}).filter(
            ([key]) => !key.startsWith('import-x/') && !key.startsWith('@typescript-eslint/')
          )
        ),
      };
    }
    return config;
  })
  .filter((config) => config !== null);

export default withNuxt(
  ...vueConfigFiltered,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    ignores: [
      'build/**',
      '.nuxt/**',
      '.output/**',
      'node_modules/**',
      '**/*.generated.*',
      '**/*.cjs',
      'content.config.ts',
      'vitest.config.ts',
      'tests/**',
      'types/**/*.d.ts',
    ],
  }
);
