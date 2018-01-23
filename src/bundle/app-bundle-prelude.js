module.exports = function (moduleMap, entries) {
  const results = {};
  const bbiter = {
    getModule: getModule,
    hasModule: hasModule,
    next: typeof _bb$iter === "undefined" ? null : _bb$iter
  };

  function getModule(id, iter) {
    if (!results.hasOwnProperty(id)) {
      const meta = { exports: {} };
      const load = moduleMap[id][0];
      const deps = moduleMap[id][1];
      results[id] = meta.exports;
      load(dependencyGetter(deps, iter), meta, meta.exports);
      results[id] = meta.exports;
    }

    return results[id];
  }

  function hasModule(id) {
    return moduleMap.hasOwnProperty(id);
  }

  function dependencyGetter(depsByName, iter) {
    return function getDependency(name) {
      const id = depsByName[name];

      var _next = iter;
      while(_next) {
        if (_next.hasModule(id)) {
          return _next.getModule(id, _next);
        }
        _next = _next.next;
      }

      throw new Error("Module '" + name + "' with id " + id + " was not found");
    };
  }

  if (entries.length) {
    var _prev = bbiter;
    var _next = bbiter.next;
    while(_next) {
      _next.prev = _prev;
      _prev = _next;
      _next = _next.next;
    }
  }

  entries.forEach(function(id) {
    getModule(id, bbiter);
  });

  return bbiter;
};
