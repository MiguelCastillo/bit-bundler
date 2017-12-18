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
      { name: "vendor", dest: "dist/vendor.js", match: { path: /\/node_modules\// } },
      { name: "hello", dest: "dist/hello.js", match: { fileName: "hello.jsx"} },
      { name: "world", dest: "dist/world.js", match: { fileName: "world.jsx"} },
    ]],
    "bit-bundler-minifyjs",
    "bit-bundler-extractsm"
  ]
};
