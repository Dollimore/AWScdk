import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    // add "extends" to merge two configs together
    // extends: './vite.config.js',
    test: {
      include: ["src/**/*.test.{ts,tsx}", "lib/**/*.test.{ts,tsx}"],
      name: "node",
      environment: "node",
      setupFiles: "./setup.ts",
      globals: true,
      css: false,
    },
  },
]);
