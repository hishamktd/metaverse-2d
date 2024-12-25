import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node", // Change to 'jsdom' if testing browser-based code
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testMatch: [
    "**/__tests__/**/*.(ts|tsx|js)",
    "**/?(*.)+(spec|test).(ts|tsx|js)",
  ],
  transform: {
    "^.+\\.tsx?$": "ts-jest", // Transpile TypeScript files
  },
};

export default config;
