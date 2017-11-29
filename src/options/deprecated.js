const chalk = require("chalk");

module.exports = function(name) {
  if (!name) {
    throw new Error("namespace is required when creating a depreciation function");
  }

  return function(deprecatedOptions) {
    return function deprecatedOptionsHandler(options) {
      var result = Object.assign({}, options);
      var changed = false;

      Object.keys(deprecatedOptions).forEach(function deprecatedOption(key) {
        if (options.hasOwnProperty(key)) {
          var messageHeader = `${chalk.cyan.bold(name)} ${chalk.yellow.bold("deprecated")} ${key}`;
          var deprecated = deprecatedOptions[key];
    
          if (deprecated.message) {
            process.stderr.write(`${messageHeader}. ${deprecated.message}\n`);
          }

          if (deprecated.replacement) {
            process.stderr.write(`${messageHeader}. Please use ${deprecated.replacement} instead. `);

            if (deprecated.autocorrect) {
              result[deprecated.replacement] = result[key];
              delete result[key];
              changed = true;
              process.stderr.write(`${chalk.yellow.bold("Autocorrected.")} `);
            }

            process.stderr.write("\n");
          }

          if (deprecated.transform) {
            deprecated.transform(key, deprecated);
          }
        }
      });

      return changed ? result : options;
    };
  };
};
