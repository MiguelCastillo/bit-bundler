function configureExportName(bundler, exportNames) {
  if (!exportNames) {
    return () => {};
  }

  var exportedNames = (
    exportNames === true ? true :
    Array.isArray(exportNames) ? exportNames.reduce((acc, item) => (acc[item] = item, acc), {}) :
    exportNames
  );

  var processed = {};

  return function(mod) {
    var name = exportedNames === true && /^\w/.test(mod.name) ? mod.name : exportedNames[mod.name];

    if (name && !processed[mod.id]) {
      processed[mod.id] = true;
      bundler.setId(mod.id, JSON.stringify(name));
    }
  };
}

module.exports = configureExportName;
