import nextConfig from '@stratala/eslint-config/next'

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
    },
  },
  {
    ignores: [
      '.next/',
      'src/app/(payload)/admin/importMap.js',
      'src/scripts/**',
      'src/payload-types.d.ts',
      'vitest.config.mts',
      '**/*.generated.*',
    ],
  },
]

export default eslintConfig
