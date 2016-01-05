module.exports = {
  build: {
    options: {
      preserveComments: "some",
      sourceMap: true
    },
    files: {
      "dist/index.min.js": ["dist/index.js"]
    }
  }
};
