import vuePlugin from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';
import typescriptConfig from './typescript.js';

/**
 * Vue/Nuxt ESLint configuration
 * Extends shared TypeScript config with Vue-specific rules
 */
export default tseslint.config(...typescriptConfig, ...vuePlugin.configs['flat/recommended'], {
  files: ['**/*.vue'],
  languageOptions: {
    parser: vueParser,
    parserOptions: {
      parser: tseslint.parser,
      extraFileExtensions: ['.vue'],
      ecmaVersion: 'latest',
      sourceType: 'module',
      projectService: true,
    },
  },
  rules: {
    // Vue-specific rules
    'vue/multi-word-component-names': 'off', // Allow single-word components
    'vue/require-default-prop': 'off',
    'vue/no-v-html': 'warn',
    'vue/no-multiple-template-root': 'off', // Vue 3 allows multiple root elements
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/custom-event-name-casing': ['error', 'camelCase'],
    'vue/define-macros-order': [
      'error',
      {
        order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots'],
      },
    ],
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    'vue/max-attributes-per-line': 'off', // Let Prettier handle this
    'vue/singleline-html-element-content-newline': 'off', // Let Prettier handle this
    'vue/html-indent': 'off', // Let Prettier handle this
  },
});
