module.exports = {
  multiprocess: true,
  src: "src/main.js",
  dest: "dist/bundle.js",

  loader: [
    "bit-loader-babel",
    "bit-loader-eslint",
    "bit-loader-builtins"
  ],
  bundler: [
    "bit-bundler-minifyjs",
    "bit-bundler-extractsm"
  ]
};
