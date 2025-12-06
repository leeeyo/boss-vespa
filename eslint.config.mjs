import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const rnOnlyModules = [
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: rnOnlyModules.map((name) => ({
            name,
            message: "React Native modules must not be imported into the web application.",
          })),
        },
      ],
    },
  },
  // Disallow importing redis in client-side code; Redis must be used only in server modules
  {
    files: [
      "components/**/*.{ts,tsx}",
      "app/**/client/**/*.{ts,tsx}",
      "app/(**)/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "redis",
              message: "redis must only be imported from server code (app/api/** and lib/**). Use server-side utilities to access Redis.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
