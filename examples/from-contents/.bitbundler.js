const path = require("path");

module.exports = {
  dest: "dist/out.js",
  contents: `
    const hello = require("./src/hello");
    const world = require("./src/world");
    console.log(hello() + " + " + world());
  `
};
