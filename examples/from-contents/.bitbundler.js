module.exports = {
  dest: "dist/out.js",
  content: `
    const hello = require("./src/hello");
    const world = require("./src/world");
    console.log(hello() + " + " + world());
  `
};
