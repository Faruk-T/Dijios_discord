import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

const lineDisciplineRules = {
  "max-lines": ["error", { max: 300, skipBlankLines: false, skipComments: false }],
  "max-lines-per-function": ["warn", { max: 90, skipBlankLines: true, skipComments: true }],
  "@typescript-eslint/no-explicit-any": "error",
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
    },
  ],
};

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/.astro/**",
      "**/target/**",
      "**/generated/**",
      "pnpm-lock.yaml",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [tseslint.configs.recommended],
    rules: lineDisciplineRules,
  },
  {
    files: ["**/*.{ts,tsx,mts}"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: repoRoot,
      },
    },
    rules: lineDisciplineRules,
  },
);
