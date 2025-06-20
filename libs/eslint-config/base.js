import stylistic from '@stylistic/eslint-plugin';
import importPlugin from 'eslint-plugin-import';

export default [
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    quoteProps: 'as-needed',
    commaDangle: 'always-multiline',
    braceStyle: '1tbs',
    semi: true,
  }),
  {
    plugins: {
      '@stylistic': stylistic,
      import: importPlugin,
    },
    rules: {

      // Arrays
      'array-bracket-newline': [
        'error',
        {
          multiline: true,
          minItems: 3,
        },
      ],
      'array-element-newline': [
        'error',
        {
          multiline: true,
          minItems: 3,
        },
      ],

      // Objects
      'brace-style': [
        'error',
        '1tbs',
        {
          allowSingleLine: true,
        },
      ],
      'function-call-argument-newline': ['error', 'consistent'],
      '@stylistic/function-call-spacing': ['error', 'never'],
      '@stylistic/function-paren-newline': ['error', 'multiline-arguments'],
      '@stylistic/max-len': [
        'error',
        {
          code: 120,
          comments: 120,
        },
      ],
      '@stylistic/indent': [
        'error',
        2,
        {
          VariableDeclarator: 2,
        },
      ],

      // Stylistic Specific
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/block-spacing': 'error',
      // '@stylistic/lines-between-class-members': ['error', 'always', { exceptAfterOverload: false }],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          singleline: {
            requireLast: false,
          },
        },
      ],
      '@stylistic/multiline-comment-style': ['error', 'starred-block'],
      '@stylistic/newline-per-chained-call': ['error'],
      'no-confusing-arrow': [
        'error',
        {
          allowParens: true,
          onlyOneSimpleParam: true,
        },
      ],
      'no-floating-decimal': 'error',
      'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
      'object-curly-newline': [
        'error',
        {
          consistent: true,
          minProperties: 2,
        },
      ],
      'object-property-newline': 'error',
      'one-var-declaration-per-line': ['error', 'always'],
      'operator-linebreak': ['error', 'before'],
      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: [
            'const',
            'let',
            'var',
          ],
          next: '*',
        },
        {
          blankLine: 'any',
          prev: [
            'const',
            'let',
            'var',
          ],
          next: [
            'const',
            'let',
            'var',
          ],
        },
      ],
      '@stylistic/template-curly-spacing': ['error', 'always'],
      '@stylistic/template-tag-spacing': ['error', 'never'],
      'import/order': [
        1,
        {
          groups: [
            'external',
            'builtin',
            'internal',
            'sibling',
            'parent',
            'index',
          ],
        },
      ],
    },
  },
];
