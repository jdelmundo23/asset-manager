import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["dist/"],
  },
  {
    files: ["src/**/*.{js,mjs,cjs,ts,d.ts}"],
    rules: {
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
          trailingComma: "es5",
        },
      ],
      "import/order": "off",
      "import/newline-after-import": "off",
    },
  },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
];
