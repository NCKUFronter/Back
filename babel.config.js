module.exports = {
  ignore: ["dist", "node_modules", "test", "index.js", "babel.config.js", "test.js"],
  presets: ["@babel/preset-env"],
  plugins: [
    "@babel/plugin-transform-runtime",
    "@babel/plugin-proposal-class-properties",
  ],
};
