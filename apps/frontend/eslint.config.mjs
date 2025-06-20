import tsParser from '@typescript-eslint/parser';
import feBaseConfig from "@libs/eslint-config/fe";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ['src/**/*.ts'],
    languageOptions: { parser: tsParser },
    extends: [feBaseConfig],
  },
  {
    files: ['src/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { jsx: true },
    },
    extends: [feBaseConfig],
  },
]);