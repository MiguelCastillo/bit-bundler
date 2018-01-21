"use strict";

const utils = require("belty");
const uniqueId = require("bit-bundler-utils/uniqueId");
const appBundleBuilder = require("./app-bundle-builder");

const defaults = {
  "umd": false
};

class AppBundle {
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
}


function buildBundle(bundler, bundle, context, options) {
  if (!bundle.modules || !bundle.modules.length) {
    return Promise.resolve(bundle);
  }

  // Map entries first to give them lower IDs than the rest to make
  // bundle ID generation more predictable.
  const entries = bundle.entries.map(id => bundler.getId(id));

  const moduleMap = context.getModules(bundle.modules).reduce((acc, mod) => {
    var modId = bundler.getId(mod.id || mod.path);
    var deps = mod.deps.map(dep => Object.assign({}, dep, { id: bundler.getId(dep.id || dep.path) }));
    acc[modId] = Object.assign({}, mod, { id: modId, deps: deps });
    return acc;
  }, {});

  const settings = bundle.isMain ?
    Object.assign({ entries: entries }, bundler._options, options) :
    Object.assign({ entries: entries }, utils.omit(bundler._options, ["umd"]), options);

  return bundle.setContent(appBundleBuilder.buildBundle(moduleMap, settings));
}

module.exports = AppBundle;
