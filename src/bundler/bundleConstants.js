/**
 * This exports the string that is used for managing module loading in a bundle.
 * It also handles loading bundles that need to be loaded dynamically
 */

module.exports.BUNDLE_MODULE_LOADER = function (moduleMap, entries) {
  var results = {};

  function get(id) {
    if (!results.hasOwnProperty(id)) {
      var meta = { exports: {} };
      var load = moduleMap[id][0];
      var deps = moduleMap[id][1];
      results[id] = meta.exports;
      load(dependencyGetter(deps), meta, meta.exports);
      results[id] = meta.exports;
    }

    return results[id];
  }

  function has(id) {
    return moduleMap[id];
  }

  function dependencyGetter(depsByName) {
    return function getDependency(name) {
      var id = depsByName[name];

      if (has(id)) {
        return get(id);
      }

      for (var _next = get.next; _next; _next = _next.next) {
        if (_next.has(id)) {
          return _next.get(id);
        }
      }

      for (var _prev = get.prev; _prev; _prev = _prev.prev) {
        if (_prev.has(id)) {
          return _prev.get(id);
        }
      }

      throw new Error("Module '" + name + "' with id " + id + " was not found");
    };
  }

  get.get = get;
  get.has = has;
  get.next = typeof _bb$iter === "undefined" ? null : _bb$iter;

  if (entries.length) {
    for (var _prev = get, _next = get.next; _next;) {
      _next.prev = _prev;
      _prev = _next;
      _next = _next.next;
    }
  }

  entries.forEach(get);
  return get;
}.toString();


module.exports.REQUIRE_NAME = "_bb$req";
module.exports.BUNDLE_ITERATOR_NAME = "_bb$iter";
