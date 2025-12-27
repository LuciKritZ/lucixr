import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import sortKeysFix from 'eslint-plugin-sort-keys-fix';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
      'sort-keys-fix': sortKeysFix,
    },
    rules: {
      // Prettier Integration (turns off conflicting ESLint rules)
      ...prettierConfig.rules,

      // Import Ordering
      'import/order': [
        'error',
        {
          alphabetize: {
            caseInsensitive: true,
            order: 'asc',
          },
          groups: ['builtin', 'external', 'internal'],
          'newlines-between': 'always',
          pathGroups: [
            {
              group: 'external',
              pattern: 'react',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['react', 'next'],
        },
      ],

      // General Rules
      'no-console': 'error',

      'prettier/prettier': 'error',

      'react/jsx-sort-props': 'error',

      'react/sort-prop-types': [
        'error',
        {
          callbacksLast: false,
          ignoreCase: true,
          requiredFirst: false,
          sortShapeProp: true,
        },
      ],

      // Sort Keys
      'sort-keys-fix/sort-keys-fix': [
        'error',
        'asc',
        {
          caseSensitive: true,
          natural: false,
        },
      ],
    },
    settings: {
      'import/resolver': {
        node: true,
        typescript: true,
      },
    },
  },

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node_modules/**',
  ]),
]);

export default eslintConfig;
