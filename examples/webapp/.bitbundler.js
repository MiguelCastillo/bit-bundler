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
      { name: "vendor", dest: "dist/vendor.js", match: { path: /\/node_modules\// } }
    ]],
    "bit-bundler-minifyjs",
    "bit-bundler-extractsm"
  ]
};
