module.exports = function(moduleMap, entries) {
  const results = {};
  const externalRequire = typeof require !== "undefined" && require;

  function getModule(id) {
    if (!results[id]) {
      if (moduleMap[id]) {
        const meta = {}; meta.exports = {};
        const load = moduleMap[id][0];
        const deps = moduleMap[id][1];
        const getDependency = function(moduleName) { return getModule(deps[moduleName]); };

        // This is to handle circular references gracefully.
        results[id] = meta.exports;

        // get me the module
        load(getDependency, meta, meta.exports);

        // Reassign to make sure we handle the case where module.exports
        // was replaced with something else.
        results[id] = meta.exports;
      }
      else {
        results[id] = externalRequire && externalRequire(id);

        if (!externalRequire && !results[id]) {
          throw new Error("Module " + id + " not found");
        }
      }
    }

    return results[id];
  }

  entries.forEach(getModule);
  return getModule;
};
