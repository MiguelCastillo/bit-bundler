"use strict";

/*eslint no-console: ["off"]*/

const browserPack = require("browser-pack");
const uniqueId = require("@bit/bundler-utils/uniqueId");
const pstream = require("p-stream");
const utils = require("belty");
const path = require("path");

const defaults = {
  "printInfo": false,
  "filePathAsId": false,
  "sourceMap": true,
  "exportNames": false,
  "browserPack": {
    "raw": true,
    "hasExports": true,
    "standalone": false,
    "standaloneModule": null
  }
};

class Builder {
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

  printInfo(bpBundle) {
    var bpOptions = buildBrowserPackOptions(bpBundle, buildOptions(this));
    console.log(formatBundleInfo(bpBundle, bpOptions));
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

  const bpOptions = buildOptions(bundler, options);
  const bpExports = getBrowserPackExports(bundler, bundle, context, bpOptions);
  var bpModules = createBrowserPackModules(bundler, bundle, context);

  bpModules = configureIds(bundler, bpModules, bpOptions);
  bpModules = configureEntries(bundler, bpModules, bpExports);
  bpModules = configureSourceMap(bundler, bpModules, bpOptions);

  const bpBundle = {
    exports: bpExports,
    modules: bpModules
  };

  if (bpOptions.printInfo) {
    bundler.printInfo(bpBundle);
  }

  const bp = browserPack(buildBrowserPackOptions(bpBundle, bpOptions));
  const deferred = pstream(bp);
  bpBundle.modules.forEach((mod) => bp.write(mod));
  bp.end();

  return deferred.then((content) => bundle.setContent(content));
}


function buildOptions(bundler, options) {
  var bpOptions = utils.merge({}, bundler._options, options);
  return utils.merge(bpOptions, bpOptions.browserPack);
}


function buildBrowserPackOptions(bpBundle, options) {
  var bpOptions = Object.assign({}, options);
  bpOptions.hasExports = bpBundle.exports.length !== 0;
  bpOptions.standaloneModule = bpBundle.exports;

  if (options.umd) {
    bpOptions.standalone = options.umd;
  }

  return bpOptions;
}


function createBrowserPackModules(bundler, bundle, context) {
  const moduleCache = context.getCache();
  return bundle.modules.map((id) => createBrowserPackModule(moduleCache[id]));
}


function configureIds(bundler, bpModules, bpOptions) {
  if (!bpOptions.filePathAsId) {
    bpModules.forEach(function(bpModule) {
      bpModule.id = bundler.getId(bpModule.id);

      Object.keys(bpModule.deps).forEach(function(depName) {
        bpModule.deps[depName] = bundler.getId(bpModule.deps[depName]);
      });
    });
  }

  return bpModules;
}


function configureEntries(bundler, bpModules, bpExports) {
  var exports = utils.arrayToObject(bpExports);

  bpModules.forEach(function(mod) {
    mod.entry = exports.hasOwnProperty(mod.id);
  });

  return bpModules;
}


function configureSourceMap(bundler, bpModules, bpOptions) {
  if (bpOptions.sourceMap === false) {
    bpModules.forEach(function(mod) {
      mod.nomap = true;
    });
  }

  return bpModules;
}


function getBrowserPackExports(bundler, bundle, context, bpOptions) {
  const moduleCache = context.getCache();

  return bundle.entries.map(function(id) {
    const mod = moduleCache[id];

    if (/^\w/.test(mod.name) && bpOptions.exportNames) {
      bundler.setId(mod.id, mod.name);
    }

    return bundler.getId(mod.id);
  });
}


function createBrowserPackModule(mod) {
  return Object.assign({
    sourceFile: path.relative(".", mod.path || ""),
    deps: mod.deps.reduce((result, dep) => (result[dep.name] = dep.id, result), {})
  }, utils.pick(mod, ["id", "name", "path", "source"]));
}


function formatBundleInfo(bpBundle, options) {
  var output = {};
  var bpModules = bpBundle.modules;

  if (options.standalone) {
    output.standalone = options.standalone;
  }

  output.modules = bpModules.map(function(bpModule) {
    return {
      id: bpModule.id,
      entry: bpModule.entry,
      name: bpModule.name,
      path: bpModule.path,
      deps: JSON.stringify(bpModule.deps)
    };
  });

  return output;
}


module.exports = Builder;
