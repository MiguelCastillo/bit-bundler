## Ecosystem

### Loader plugins

- [bit-loader-eslint](https://github.com/MiguelCastillo/bit-loader-eslint) for integrating with eslint
- [bit-loader-babel](https://github.com/MiguelCastillo/bit-loader-babel) for transpiling your code with babeljs
- [bit-loader-js](https://github.com/MiguelCastillo/bit-loader-js) for loading and processing JavaScript dependencies (nodejs and ES6)
- [bit-loader-json](https://github.com/MiguelCastillo/bit-loader-json) for loading and processing JSON assets
- [bit-loader-css](https://github.com/MiguelCastillo/bit-loader-css) for loading and processing CSS assets
- [bit-loader-text](https://github.com/MiguelCastillo/bit-loader-text) for loading and processing text assets such as HTML
- [bit-loader-builtins](https://github.com/MiguelCastillo/bit-loader-builtins) for handling built in node.js modules (process, path, crypto...)
- [bit-loader-shimmer](https://github.com/MiguelCastillo/bit-loader-shimmer) for handling module shimming; modules that are not built as modules
- [bit-loader-sourcemaps](https://github.com/MiguelCastillo/bit-loader-sourcemaps) for initializing source maps for loaded modules
- [bit-loader-cache](https://github.com/MiguelCastillo/bit-loader-cache) for caching module
- [bit-loader-extensions](https://github.com/MiguelCastillo/bit-loader-extensions) for supporting loading modules without file extensions
- [bit-loader-excludes](https://github.com/MiguelCastillo/bit-loader-excludes) for stubbing modules. Useful when we want to include empty modules to maintain a proper dependency tree
- [bit-loader-remove](https://github.com/MiguelCastillo/bit-loader-remove) for removing modules. Useful when we expect to import modules from another bundle that exports modules by name


This is the list of [bit-loader-plugins](https://www.npmjs.com/browse/keyword/bit-loader-plugin) available on npm. Be sure to add the `bit-loader-plugin` keyword to the package.json when authoring your plugins.


### Bundler plugins

- [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) for splitting bundles based on matching rules. This will handle splitting out your vendor modules.
- [bit-bundler-banner](https://github.com/MiguelCastillo/bit-bundler-banner) for adding a string header to the resulting bundles.
- [bit-bundler-minifyjs](https://github.com/MiguelCastillo/bit-bundler-minifyjs) for minifying your JavaScript assets.


## Integrations

- [grunt](https://github.com/MiguelCastillo/grunt-bit-bundler)
