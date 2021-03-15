module.exports = {
  hooks: {
    'pre-commit': 'npm run format:check && lint-staged && npm run build:dev'
  }
};
