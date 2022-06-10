module.exports = {
  env: {
    node: true,
  },
  extends: ['../.eslintrc.js'],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: 'backend',
  },
  ignorePatterns: ['cdk.out'],
  rules: {
    'no-new': 'off',
  },
};
