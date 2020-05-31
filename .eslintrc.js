module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "no-console": "off",
    "no-param-reassign": "off",
    "global-require": "off",
    "no-underscore-dangle": "off",
  },
};
