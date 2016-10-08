module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:ember-suave/recommended'
  ],
  env: {
    'browser': true
  },
  rules: {
    'quotes': ['error', 'single', {  "allowTemplateLiterals": true, "avoidEscape": true }],
    'ember-suave/no-const-outside-module-scope': 0,
    'ember-suave/no-direct-property-access': 1
  }
};
