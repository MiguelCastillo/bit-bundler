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

  options = options || {};
  const getId = (mod) => bundler.getId(mod.id);
  const exportName = configureExportName(bundler, bundle.isMain ? bundler._options.exportNames : options.exportNames);

  // Map entries first to give them lower IDs than the rest to make
  // bundle ID generation more predictable.
  const entries = context.getModules(bundle.entries).map(mod => (exportName(mod), getId(mod)));

  const moduleMap = context.getModules(bundle.modules).reduce((acc, mod) => {
    exportName(mod);
    var modId = getId(mod);
    var deps = mod.deps.map(dep => Object.assign({}, dep, { id: (exportName(dep), getId(dep)) }));
    acc[modId] = Object.assign({}, mod, { id: modId, deps: deps });
    return acc;
  }, {});

  const settings = bundle.isMain ?
    Object.assign({ entries: entries }, bundler._options, options) :
    Object.assign({ entries: entries }, utils.omit(bundler._options, ["umd"]), options);

  return bundle.setContent(chunkedBundleBuilder.buildBundle(moduleMap, settings));
}


module.exports = ChunkedBundle;
