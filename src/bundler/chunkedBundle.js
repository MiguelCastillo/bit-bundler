"use strict";

const utils = require("belty");
const uniqueId = require("bit-bundler-utils/uniqueId");
const chunkedBundleBuilder = require("./chunkedBundleBuilder");
const configureExportName = require("./exportNames");

const defaults = {
  "umd": false
};

class ChunkedBundle {
  constructor(options) {
    this._options = Object.assign({}, defaults, options);
    this._uniqueIdGenerator = uniqueId.create();
  }

  bundle(context, options) {
    var deferred = [];

    context.visitBundles((bundle) => deferred.push(buildBundle(this, bundle, context, options)));

    return Promise
      .all(deferred)
      .then(bundles => bundles.reduce((context, bundle) => context.setBundle(bundle), context));
  }

  getId(moduleId) {
    return this._uniqueIdGenerator.getId(moduleId);
  }

  setId(moduleId, value) {
    this._uniqueIdGenerator.setId(moduleId, value);
  }
}


function buildBundle(bundler, bundle, context, options) {
  if (!bundle.modules || !bundle.modules.length) {
    return Promise.resolve(bundle);
  }

  options = bundle.isMain ?
    Object.assign({}, bundler._options, options) :
    Object.assign({}, utils.omit(bundler._options, ["umd"]), options);

  const exportName = configureExportName(bundler, bundle.isMain ? bundler._options.exportNames : options.exportNames);

  const getId = (mod) => {
    return bundler.getId(mod.id);
  };

  const configureDependency = (dependency) => {
    const id = getId(dependency);
    const name = dependency.name || id;

    return {
      id: id,
      name: name
    };
  };

  // Map entries first to give them lower IDs than the rest to make
  // bundle ID generation more predictable.
  var entries = context.getModules(bundle.entries);
  entries.forEach(exportName);
  entries = entries.reduce((accumulator, entry) => {
    accumulator[getId(entry)] = true;
    return accumulator;
  }, {});

  // Configured exported names for the rest of modules.
  var modules = context.getModules(bundle.modules);
  modules.forEach(exportName);

  const moduleMap = modules.reduce((acc, mod) => {
    const moduleId = getId(mod);

    acc[moduleId] = Object.assign({}, {
      entry: !!entries[moduleId],
      id: moduleId,
      deps: mod.deps.map(configureDependency),
      path: mod.path,
      source: mod.source
    });

    return acc;
  }, {});

  return bundle.setContent(chunkedBundleBuilder.buildBundle(moduleMap, options));
}

module.exports = ChunkedBundle;
