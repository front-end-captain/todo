module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverageFrom: ["**/src/**/*.ts", "!**/bin/**", "!src/cli.ts"],
  testMatch: ["**/?(*.)+(spec|test).ts"],
};
