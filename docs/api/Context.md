## Context(options) : Context

When calling [bundle](Bitbundler.md#bundlefiles--promise) or [update](Bitbundler.md#updatefiles--promise) to generate bundles, a promise is returned that gives back a context when the promise is resolved. This context has the resulting bundles and the information used for generating the bundles. The context is generated with the following information:


### Options

- **`cache`** { object } - Map of modules by module `id`.
- **`exclude`** { string[] } - Array of module `ids` to exclude from `context.bundle`. This is used by bundler plugins such as [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) in order to specify which modules to exclude from `context.bundle`.
- **`shards`** { Bundle } - Map of shards (Bundle instances) pulled out of the main `context.bundle`. This map contains items created by bundler plugins such as [bundle splitter](https://github.com/MiguelCastillo/bit-bundler-splitter).
- **`getLogger`** { function } - Method to create loggers. The method takes an optional string name which is used when logging messages.
- **`setShard`** { function } - Method to set a bundle shard.
- **`getShard`** { function } - Method to get a bundle shard.
- **`updateBundles`** { function } - visitor method that gets called with each bundle merging in the results of each call to update the context.
- **`visitBundles`** { function } - visitor method that get called with each bundle; main and shards.

> The context is used internally by bit-bunder. And it is also used by plugins and post processors such as [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter), [Bitbundler.dest](#bitbundlerdestdestination--function), and [Bitbundler.watch](#bitbundlerwatchcontext-options--context).
