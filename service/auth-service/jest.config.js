module.export = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/", "<rootDir>/tests/"],
  testMatch: ["**/__test__/**/*.ts", "**/?(*.)+(spec|test).[tj]s?(x)"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/index.ts", "!src/**/types.ts"],
  coverageDoirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleFileMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@shared/(.*)$": "<rootDir>/../../shared/$1",
  },
  testTimeout: 10000,
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
};
