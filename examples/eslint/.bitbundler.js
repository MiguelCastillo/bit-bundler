module.exports = {
  multiprocess: 2,
  src: "src/main.js",
  dest: "dist/out.js",

  loader: [
    "bit-loader-eslint"
  ]
};
