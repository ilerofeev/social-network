/** @type {import("prettier").Config} */
const config = {
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: 'es5',
  printWidth: 100,
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
};

module.exports = config;
