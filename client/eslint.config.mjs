import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintPluginPrettierRecommend from "eslint-plugin-prettier/recommended";

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  eslintPluginPrettierRecommend,
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    rules: {
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
          trailingComma: "es5",
          plugins: ["prettier-plugin-tailwindcss"],
        },
      ],
      "import/order": "off",
      "import/newline-after-import": "off",
    },
  },
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX syntax support
        },
      },
      globals: {
        ...globals.browser,
      },
    },
  },
];
