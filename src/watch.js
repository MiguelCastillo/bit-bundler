var utils = require("belty");
var chokidar = require("chokidar");
var File = require("src-dest");
var logError = require("./logError");

function watch(context, options) {
  if (options === true || !options) {
    options = {};
  }

  var include = new File(options.include);
  var settings = utils.merge({ followSymlinks: false }, utils.omit(options, ["include"]));

  if (!settings.hasOwnProperty("ignored")) {
    settings.ignored = [/[\/\\]\./, /node_modules\//];
  }

  var nextPaths = {}, inProgress;
  var filesToWatch = Object.keys(context.cache).concat(include.src);
  var watcher = chokidar.watch(filesToWatch, settings);

  console.log("Watching...");

  watcher
    .on("add", onAdd)
    .on("change", onChange)
    .on("unlink", onDelete);

  function onChange(path) {
    var paths = utils.toArray(path).filter(function(path) {
      return context.cache.hasOwnProperty(path);
    });

    if (inProgress) {
      paths.forEach(function(path) {
        nextPaths[path] = path;
      });
    }
    else if (paths.length) {
      inProgress = true;

      paths.forEach(function(path) {
        context.loader.deleteModule(context.cache[path]);
      });

      context.execute(paths).then(function(ctx) {
        context = ctx;
        paths.forEach(function(path) {
          console.log("[updated]", path);
        });

        executePending();
      }, function(err) {
        logError(err);
        executePending();
      });
    }
    else {
      console.log("[changed]", path);
    }
  }

  function onAdd(path) {
    if (context.cache.hasOwnProperty(path) || include.src.indexOf(path) !== -1) {
      console.log("[watched]", path);
    }
  }

  function onDelete(path) {
    if (context.cache.hasOwnProperty(path) || include.src.indexOf(path) !== -1) {
      console.warn("[removed]", path);
    }
  }

  function executePending() {
    inProgress = false;

    var pendingPaths = Object.keys(nextPaths);

    if (pendingPaths.length) {
      nextPaths = {};
      onChange(pendingPaths);
    }
  }

  return context;
}

module.exports = watch;
