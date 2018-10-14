function configureNamedExports(exportNames) {
  if (!exportNames) {
    return () => {};
  }

  var exportedNames = (
    exportNames === true ? true :
      Array.isArray(exportNames) ?
        exportNames.reduce((acc, item) => (acc[item] = item, acc), {}) :
        exportNames
  );

  return function(mod) {
    var name = exportedNames === true && /^\w/.test(mod.name) ? mod.name : exportedNames[mod.name];

    if (name !== undefined) {
      return JSON.stringify(name);
    }
  };
}

module.exports = configureNamedExports;
