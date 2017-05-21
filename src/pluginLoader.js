var resolve = require("resolve");

function pluginLoader(plugins) {
  if (!plugins) {
    return;
  }

  return [].concat(plugins)
    .filter(Boolean)
    .map(function(plugin) {
      return (
        typeof plugin === "function" ? plugin :
        typeof plugin === "string" ? requireModule(plugin)() :
        plugin.constructor === Object ? requireModule(plugin.name)(plugin) :
        Array.isArray(plugin) ? requireModule(plugin[0])(plugin[1]) : null
      );
    });
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
