module.exports = {
  testEnvironment: "jsdom",
  // Add this line:
  setupFiles: ["<rootDir>/src/jest-polyfills.js"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.(js|jsx)", "<rootDir>/src/**/?(*.)+(test).(js|jsx)"],
};