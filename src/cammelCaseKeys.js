module.exports = function camelcaseKeys(input, options) {
  options = options || {};
  const ignore = options.ignore ? [].concat(options.ignore) : null;

  function visit(input) {
    if (!input) {
      return input;
    }

    var result;

    if (input.constructor === Object) {
      result = {};
      Object.keys(input).forEach(key => {
        if (ignore && ignore.indexOf(key) !== -1) {
          result[key] = input[key];
        }
        else {
          result[toCamelcaseKeys(key)] = visit(input[key]);          
        }
      });
    }
    else if (Array.isArray(input)) {
      result = input.map(item => visit(item));
    }
    else {
      result = input;
    }

    return result;
  }

  return visit(input);
};

function toCamelcaseKeys(input) {
  return input.replace(/\-\w/g, (match) => match.charAt(1).toUpperCase());
}
