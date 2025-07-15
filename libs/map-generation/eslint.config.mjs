import tsParser from '@typescript-eslint/parser';
import baseConfig from "@libs/eslint-config/base";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ['src/**/*.ts'],
    languageOptions: { parser: tsParser },
    extends: [baseConfig],
  }
]);