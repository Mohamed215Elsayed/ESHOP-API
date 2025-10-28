export default {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'airbnb-base', // Airbnb's base JS rules (no React)
    'plugin:node/recommended', // Node.js linting rules
    'prettier', // Disable rules conflicting with Prettier
  ],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module', // Use ES Modules (import/export)
  },
  rules: {
    'prettier/prettier': 'warn', // Warn about Prettier style issues
    'spaced-comment': 'off',
    'no-console': 'off',
    'consistent-return': 'off',
    'func-names': 'off',
    'object-shorthand': 'off',
    'no-process-exit': 'off',
    'no-param-reassign': 'off',
    'no-return-await': 'off',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'no-undef': 'warn',
    'prefer-destructuring': ['error', { object: true, array: false }],
    'no-unused-vars': ['warn', { argsIgnorePattern: 'req|res|next|val' }],
  },
};
