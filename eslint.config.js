import js from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import { configs as importConfigs } from 'eslint-plugin-import-x';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['build/**', '.next/**', 'next-env.d.ts', 'switcher.js', 'theme.js'],
  },
  js.configs.recommended,
  eslintReact.configs.recommended,
  importConfigs['flat/recommended'],
  {
    files: ['server.mjs', 'next.config.mjs', 'postcss.config.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-unused-vars': 'off',
      '@eslint-react/no-children-map': 'off',
      '@eslint-react/no-children-to-array': 'off',
      '@eslint-react/no-clone-element': 'off',
      '@eslint-react/no-context-provider': 'off',
      '@eslint-react/no-forward-ref': 'off',
      '@eslint-react/no-use-context': 'off',
    },
  },
  {
    files: ['src/lib/router.tsx'],
    rules: {
      '@eslint-react/no-forward-ref': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    settings: {
      'import-x/resolver': {
        node: {
          extensions: ['.ts', '.tsx', '.json'],
        },
      },
    },
    rules: {
      'no-prototype-builtins': 'off',
      'import-x/no-unresolved': [
        'warn',
        {
          ignore: ['\\.svg', '^@/', '^next/', '^dayjs/'],
        },
      ],
      'import-x/no-duplicates': 'off',
      'import-x/namespace': 'off',
      '@eslint-react/set-state-in-effect': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',
      '@eslint-react/no-array-index-key': 'off',
      '@eslint-react/exhaustive-deps': [
        'warn',
        { additionalHooks: '(useCatchCallback|useAsyncTask)$' },
      ],
    },
  },
  prettierRecommended,
];
