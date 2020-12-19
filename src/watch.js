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
    .on("add", throttleFileEvents(onAdd))
    .on("change", throttleFileEvents(onChange))
    .on("unlink", throttleFileEvents(onDelete));

  // Helper function to throttle chokidar events.
  // We have the ability to queue up file changes that occur while bundling
  // is already in progress. This throttling is for ensureing we don't kick
  // off builds when we are still getting file events.
  function throttleFileEvents(fn, timeoutMs = 500) {
    let timeoutID = null;
    let filenameQueue = {};

    return (filepath) => {
      filenameQueue[filepath] = true;

      if (timeoutID) {
        clearTimeout(timeoutID);
      }

      timeoutID = setTimeout(() => {
        fn(Object.keys(filenameQueue));
        timeoutID = null;
        filenameQueue = {};
      }, timeoutMs);
    };
  }

  function getFilepaths(filepaths) {
    return utils
      .toArray(filepaths)
      .map(filepath => systemPath.resolve(baseUrl, filepath))
      .filter(filepath => {
        return (
          bitbundler.loader.hasModule(filepath) ||
          include.src.indexOf(filepath) !== -1
        );
      });
  }

  function onChange(filepath) {
    // NOTE: chokidar will only trigger change events for one file at a time.
    // However, when bundling is in progress we queue up all files that change
    // so that when bundling finishes, we can kick off another build with all
    // the files that have changed. To consolidate the behavior for those two
    // different use cases, we normalize all file changes to be an array.
    const filepaths = getFilepaths(filepath);

    // If there are no file changes that we care about, we just exist early.
    if (!filepaths.length) {
      return;
    }

    if (inProgress) {
      filepaths.forEach(fp => {
        nextPaths[fp] = fp;
      });
    }
    else {
      inProgress = true;

      bitbundler.update(filepaths)
        .then(result => {
          logFileEvents(filepaths, "updated");

          const newFiles = Object
            .keys(result.getCache())
            .filter(moduleId => !watching[moduleId]);

          if (newFiles.length) {
            watcher.add(newFiles);
          }
        })
        .finally(executePending);
    }
  }

  function onAdd(filepath) {
    logFileEvents(getFilepaths(filepath), "watching");
  }

  function onDelete(filepath) {
    logFileEvents(getFilepaths(filepath), "removed");
  }

  function logFileEvents(filepaths, eventName) {
    filepaths
      .map(fp => fp.replace(baseUrl + "/", ""))
      .forEach(fp => {
        logger.log(eventName, fp);
      });
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
