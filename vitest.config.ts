import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src", "lib"],
      exclude: ["**/index.ts"],
      thresholds: {
        statements: 52.8, // TUNE THESE
        branches: 51.31,
        functions: 14.91,
        lines: 52.8,
        // perFile: true
      },
      skipFull: true,
    },
  },
});
