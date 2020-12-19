const utils = require("belty");
const chokidar = require("chokidar");
const systemPath = require("path");
const File = require("src-dest");
const logger = require("./logging").create("bundler/watch");

function watch(bitbundler, options) {
  if (options === true || !options) {
    options = {};
  }

  const baseUrl = bitbundler.baseUrl();
  
  const settings = utils.merge({
    followSymlinks: false,
    cwd: baseUrl,
    // We ignore `include` because we process it separately below, and `cwd`
    // because we want to use whatever bit bundler is configured with to make
    // sure everything has the same `cwd`.
  }, utils.omit(options, ["include", "cwd"]));

  if (!settings.hasOwnProperty("ignored")) {
    settings.ignored = [/[\/\\]\./, /node_modules\//];
  }

  const include = new File(options.include);
  const filesToWatch = Object
    .keys(bitbundler.loader.getCache())
    .concat(include.src);

  const watcher = chokidar.watch(filesToWatch, settings);
  const watching = utils.arrayToObject(filesToWatch);
  let nextPaths = {}, inProgress = false;

  logger.log("started");

  watcher
    .on("add", onAdd)
    .on("change", onChange)
    .on("unlink", onDelete);

  function makeAbsolutePath(filepath) {
    return systemPath.resolve(baseUrl, filepath);
  }

  function onChange(filepath) {
    // NOTE: chokidar will only trigger change events for one file at a time.
    // However, when bundling is in progress we queue up all files that change
    // so that when bundling finishes, we can kick off another build with all
    // the files that have changed. To consolidate the behavior for those two
    // different use cases, we normalize all file changes to be an array.
    const filepaths = utils
      .toArray(filepath)
      .map(makeAbsolutePath)
      .filter(fp => bitbundler.loader.hasModule(fp));

    if (inProgress) {
      filepaths.forEach(fp => {
        nextPaths[fp] = fp;
      });
    }
    else if (filepaths.length) {
      inProgress = true;

      bitbundler.update(filepaths)
        .then(result => {
          filepaths.forEach(fp => {
            logger.log("updated", fp);
          });

          const newFiles = Object
            .keys(result.getCache())
            .filter(moduleId => !watching[moduleId]);

          if (newFiles.length) {
            watcher.add(newFiles);
          }
        })
        .finally(executePending);
    }
    else {
      logger.log("changed", filepath);
    }
  }

  function onAdd(filepath) {
    const absolutePath = makeAbsolutePath(filepath);
    if (isPathRelevant(absolutePath)) {
      logger.log("watching", filepath);
    }
  }

  function onDelete(filepath) {
    const absolutePath = makeAbsolutePath(filepath);
    if (isPathRelevant(absolutePath)) {
      logger.log("removed", filepath);
    }
  }

  // Checks if a filepath is used in a bundle and therefore is a valid
  // canditate for file watching.
  function isPathRelevant(filepath) {
    return bitbundler.loader.hasModule(filepath) || include.src.indexOf(filepath) !== -1;
  }

  function executePending() {
    inProgress = false;

    const pendingPaths = Object.keys(nextPaths);

    if (pendingPaths.length) {
      nextPaths = {};
      onChange(pendingPaths);
    }
  }
}

module.exports = watch;
