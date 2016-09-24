/*eslint no-console: ["off"]*/
var z = require("./z");
var X = require("./X");

function Y() {
  console.log(X, typeof X);
  console.log("Say Y");
  z.potatoes();
}

module.exports = Y;
