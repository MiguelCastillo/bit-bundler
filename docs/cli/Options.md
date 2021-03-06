## Options

Bitbundler affords you with a CLI that uses [subarg](https://github.com/substack/subarg) syntax, and below are the available options.

- **`--config`** { string } - option if you want to specify a custom configuration file name. This is optional and by default `.bitbundler.js` or `.bitbundler.json` are loaded if one exists. If both exist then `.bitbundler.js` is loaded.

- **`--src`** { string | string[] } - source file names to bundle.

- **`--dest`** { string } - file name to write the bundle to.

- **`--content`** { string | Buffer } - content to bundle.

- **`--multiprocess`** { boolean | number } - option to enable parallel file processing via worker processes. By default, multiprocess is disabled. But you can enable multiprocess by setting this option to true, which will start two child processes. You can alternatively specify the number of processes to use with the max capped to the number of cpus available.

- **`--umd`** { string } - `UMD` name to be exported. `UMD` is a module format that allows bundles to run in nodejs and in the browser via requirejs and traditional script tags. Consider using this setting when writing libraries and utilities that are intended to run in the browser and nodejs. [This is some literature on it](https://github.com/umdjs/umd).

- **`--base-url`** { string } - base url used for computing the file path for modules that dont have an absolute path. Defaults to `process.cwd()`.

- **`--watch`** { boolean | object } (false) - Flag to enable file watching. You can optionally pass in an object to specify settings for [chokidar](https://github.com/paulmillr/chokidar).

- **`--stub-not-found`** { boolean } (false) - Enable to replace modules that are not found in storage with a stub module.

- **`--source-map`** { boolean } (true) - Disable source map generation.

- **`--export-names`** { boolean } (false) - Export node modules by name when bundling node modules. Useful when bundling modules such as jquery, reactjs, immutablejs, and you want to be able to import them by name from your application.

- **`--log`** { string } - Log level. Options are `info`, `warn`, `error`, and defaults to `warn`.

- **`--loader`** [ plugin | plugin[] ] - Plugins to be registerer with the module loader. These plugins are for loading and procesing modules before they are bundled.

- **`--bundler`** [ plugin | plugin[] ] - Plugins to be registered with the bundler to manipulate bundles. Plugins can be used for processing the module graph generated by the module loader.
