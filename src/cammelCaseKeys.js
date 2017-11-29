module.exports = function camelcaseKeys(input) {
  if (!input) {
    return input;
  }

  var result;

  if (input.constructor === Object) {
    result = {};
    Object.keys(input).forEach(key => result[toCamelcaseKeys(key)] = camelcaseKeys(input[key]));
  }
  else if (Array.isArray(input)) {
    result = input.map(item => camelcaseKeys(item));
  }
  else {
    result = input;
  }

  return result;
};

function toCamelcaseKeys(input) {
  return input.replace(/\-\w/g, (match) => match.charAt(1).toUpperCase());
}
