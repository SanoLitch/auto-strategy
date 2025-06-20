import { defineConfig } from "eslint/config";
import baseConfig from "./base.js";

export default defineConfig([
  {
    extends: [baseConfig],
    rules: {
      '@stylistic/jsx-curly-spacing': ['error', 'always'],
      '@stylistic/jsx-max-props-per-line': [1, { maximum: 3 }],
      '@stylistic/jsx-self-closing-comp': [
        'error',
        {
          component: true,
          html: true,
        },
      ],
      '@stylistic/jsx-sort-props': [
        1,
        {
          callbacksLast: true,
          shorthandFirst: true,
          multiline: 'last',
          ignoreCase: false,
          noSortAlphabetically: true,
          reservedFirst: true,
        },
      ],
    }
  },
]);