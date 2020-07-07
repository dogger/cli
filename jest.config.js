module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  "collectCoverageFrom": [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/api/**/*.{js,ts}"
  ]
};