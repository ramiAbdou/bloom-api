module.exports = {
  '*.+(js|ts)': ['eslint'],
  '**/*.(js|ts|json|md)': [
    'prettier --write',
    'npm run test:related',
    'git add'
  ]
};
