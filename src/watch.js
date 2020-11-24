var utils = require("belty");
var chokidar = require("chokidar");
var File = require("src-dest");
var logger = require("./logging").create("bundler/watch");

function watch(bitbundler, options) {
  if (options === true || !options) {
    options = {};
  }

  var include = new File(options.include);
  var settings = utils.merge({ followSymlinks: false }, utils.omit(options, ["include"]));

  if (!settings.hasOwnProperty("ignored")) {
    settings.ignored = [/[\/\\]\./, /node_modules\//];
  }

  var nextPaths = {}, inProgress;
  var filesToWatch = Object.keys(bitbundler.loader.getCache()).concat(include.src);
  var watcher = chokidar.watch(filesToWatch, settings);
  var watching = utils.arrayToObject(filesToWatch);

  logger.log("started");

  watcher
    .on("add", onAdd)
    .on("change", onChange)
    .on("unlink", onDelete);

  function onChange(path) {
    var paths = utils
      .toArray(path)
      .filter(function(path) {
        return bitbundler.loader.hasModule(path);
      });

    if (inProgress) {
      paths.forEach(function(path) {
        nextPaths[path] = path;
      });
    }
    else if (paths.length) {
      inProgress = true;

      bitbundler.update(paths).then(function(result) {
        paths.forEach(function(path) {
          logger.log("updated", path);
        });

        var newFiles = Object
          .keys(result.getCache())
          .filter(function(moduleId) {
            return !watching[moduleId];
          });

        if (newFiles.length) {
          watcher.add(newFiles);
        }

        executePending();
      }, function() {
        executePending();
      });
    }
    else {
      logger.log("changed", path);
    }
  }

  function onAdd(path) {
    if (bitbundler.loader.hasModule(path) || include.src.indexOf(path) !== -1) {
      logger.log("watching", path);
    }
  }

  function onDelete(path) {
    if (bitbundler.loader.hasModule(path) || include.src.indexOf(path) !== -1) {
      logger.log("removed", path);
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
}

module.exports = watch;
