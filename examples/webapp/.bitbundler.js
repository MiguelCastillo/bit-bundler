module.exports = {
  src: "src/main.js",
  dest: "dest/bundle.js",

  loader: [
    "bit-loader-js",
    "bit-loader-babel",
    "bit-loader-eslint",
    "bit-loader-builtins"
  ]
};
