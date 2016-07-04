var types = require("dis-isa");

function toArray(input) {
  if (!input) {
    return [];
  }

  return types.isArray(input) ? input : [input];
}

module.exports = toArray;