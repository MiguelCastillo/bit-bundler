var types = require("dis-isa");


function Configurator(checker) {
  if (!(this instanceof Configurator)) {
    return new Configurator(checker);
  }

  // TODO: Add ability to specify signatures and transforms to handle data
  // conversion. E.g. Automatically convert singular options to array and
  // verify specific input data types.
}


Configurator.prototype.configure = function(target, options) {
  Object.keys(options)
    .filter(function(option) {
      return types.isFunction(target[option]);
    })
    .forEach(function(option) {
      target[option](options[option]);
    });
};


module.exports = Configurator;
