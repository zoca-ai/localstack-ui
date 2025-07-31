import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow unused variables with underscore prefix or common patterns
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_|^error$|^e$",
          caughtErrorsIgnorePattern: "^_|^error$|^e$",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      // Allow 'any' type but warn about it
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow 'let' for variables that might be reassigned conditionally
      "prefer-const": "warn",
      // Allow unescaped entities in JSX
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
