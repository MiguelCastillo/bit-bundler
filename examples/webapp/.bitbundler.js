module.exports = {
  multiprocess: true,
  src: "src/main.jsx",
  dest: "dist/index.js",

  loader: [
    "bit-loader-babel",
    "bit-loader-eslint",
    "bit-loader-builtins"
  ],
  bundler: [
    ["bit-bundler-splitter", [
      { name: "vendor", dest: "dist/vendor.js", match: "/node_modules/" },
      { name: "hello", dest: "dist/hello.js", match: "/hello.jsx$" },
      { name: "world", dest: "dist/world.js", match: "/world.jsx$" },
    ]],
    "bit-bundler-minifyjs",
    "bit-bundler-extractsm"
  ]
};
