var resolve = require("resolve");

function pluginLoader(plugins) {
  if (!plugins) {
    return;
  }

  return []
    .concat(plugins)
    .map(createPluginLoader());
}

function createPluginLoader() {
  var alreadyLoaded = {};

  return function loadPlugin(options) {
    const plugin = optionsToPlugin(options);
    if (plugin.name) {
      if (!alreadyLoaded[plugin.name]) {
        alreadyLoaded[plugin.name] = plugin.load();
      }
      return alreadyLoaded[plugin.name];
    }
    else {
      return plugin;
    }
  };
}

function optionsToPlugin(options) {
  var settings, name;

  if (typeof options === "string") {
    name = options;
  }
  else if (options.constructor === Object) {
    if (options.name) {
      name = options.name;
      settings = options;
    }
    else {
      return options;
    }
  }
  else if (Array.isArray(options)) {
    name = options[0];
    settings = options[1];
  }
  else if (typeof options === "function") {
    return options;
  }

  return {
    name: name,
    load: () => pluginModule(name, settings)
  };
}

function pluginModule(pluginName, options) {
  var result = requireModule(pluginName);
  return typeof result === "function" ? result(options) : result;
}

function requireModule(name) {
  var modulePath;

  try {
    modulePath = resolve.sync(name, { basedir: process.cwd() });
  }
  catch (ex) {
    modulePath = resolve.sync(name, { basedir: __dirname });
  }

  return require(modulePath);
}

module.exports = pluginLoader;
