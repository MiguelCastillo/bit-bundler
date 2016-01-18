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
    .map(function(option) {
      var camelOption = "set" + option[0].toUpperCase() + option.substr(1);
      var setter = types.isFunction(target[camelOption]) ? camelOption : option;
      return {
        setter: setter,
        name: option
      };
    })
    .filter(function(option) {
      return types.isFunction(target[option.setter]);
    })
    .forEach(function(option) {
      target[option.setter](options[option.name]);
    });
};


module.exports = Configurator;
