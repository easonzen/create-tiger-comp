module.exports = {
  printWidth: 120,
  tabWidth: 4,
  trailingComma: "none",
  jsxBracketSameLine: true,
  semi: true,
  singleQuote: true,
  overrides: [
    {
      files: "*.json",
      options: {
        tabWidth: 2,
      },
    },
  ],
  arrowParens: "avoid",
};
