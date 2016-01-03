function isVendor(mod) {
  return /^\w+/.test(mod.name);
}

function hasVendor(context) {
  return Object.keys(context.cache)
    .map(function(key) { return context.cache[key]; })
    .some(isVendor);
}

function getVendorModules(context) {
  var stack = context.modules.slice(0);
  var vendor = [], processed = {}, i = 0, mod;

  while (stack.length !== i) {
    mod = stack[i++];
    if (processed.hasOwnProperty(mod.id)) {
      continue;
    }

    mod = context.cache[mod.id];
    processed[mod.id] = mod;

    if (isVendor(mod)) {
      vendor.push(mod);
    }
    else {
      stack.push.apply(stack, mod.deps);
    }
  }

  return vendor;
}

function vendorBundler(fileName) {
  return function vendorBundlerDelegate(bundler, context) {
    if (!hasVendor(context)) {
      return;
    }

    var vendorModules = getVendorModules(context);
    var vendorExclude = vendorModules.map(function(mod) { return mod.id; });
    var vendorContext = context.configure({ modules: vendorModules });

    return Promise
      .resolve(bundler.bundle(vendorContext, { browserPack: { standalone: false } }))
      .then(function(bundle) {
        return context.addExclude(vendorExclude).addPart(fileName, bundle);
      });
  }
}

module.exports = vendorBundler;
