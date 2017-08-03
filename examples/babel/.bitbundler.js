module.exports = {
  multiprocess: 1,
  src: "src/main.js",
  dest: "dest/out.js",

  loader: [
    "bit-loader-js",
    "bit-loader-babel"
  ]
};
