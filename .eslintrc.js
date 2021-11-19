module.exports = {
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'warn',
    'prefer-const': 'warn',
    'comma-dangle': 'warn',
    'object-property-newline': 'off',
    'vue/no-unused-components': 'warn'
  }
}
