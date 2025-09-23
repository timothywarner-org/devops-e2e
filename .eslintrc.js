module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  globals: {
    testUtils: 'readonly'
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'commonjs'
  },
  rules: {
    // Code Quality
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'off', // Allow console in Node.js
    'no-debugger': 'error',
    
    // Best Practices
    'curly': ['error', 'multi-line'],
    'eqeqeq': ['error', 'always'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'prefer-const': 'error',
    
    // Style
    'indent': ['error', 2, { SwitchCase: 1 }],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'comma-spacing': ['error', { before: false, after: true }],
    'key-spacing': ['error', { beforeColon: false, afterColon: true }],
    'object-curly-spacing': ['error', 'always'],
    'space-before-function-paren': ['error', 'never'],
    'space-before-blocks': 'error',
    'keyword-spacing': 'error',
    
    // Length and Complexity
    'max-len': ['warn', { code: 100, ignoreUrls: true, ignoreStrings: true }],
    'complexity': ['warn', 10]
  },
  overrides: [
    {
      files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
      rules: {
        'max-len': 'off', // Allow longer lines in tests
        'complexity': 'off' // Allow more complex test functions
      }
    }
  ]
};