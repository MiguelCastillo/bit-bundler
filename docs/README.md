<img src="https://raw.githubusercontent.com/MiguelCastillo/bit-bundler/master/img/bit-bundler_white.png" width="100%"></img>


[bit-bundler](https://github.com/MiguelCastillo/bit-bundler) is a JavaScript bundler designed to simplify the bundling experience with a focused, fluid, and intuitive API.

The primary use cases I considered when creating bit-bundler were for bundling small helper utilities as well as large web application with intricate bundle splitting requirements. Both of those while providing syntax that would scale linearly with the use of Plugins. This is why bit-bundler has relatively few built in features and relies on plugins that are easy to create and integrate into the bundling pipeline.

With that in mind, bit-bundler key features are around:

- Reducing setup complexity
- Providing a friendly and flexible plugin API for creating and using plugins
- Bundling different file types via plugins; JavaScript, CSS, JSON, Text, etc...
- Pattern matching for fine grained control of the bundling pipelines
- Parallel processing of module dependencies for improved performance in larger projects


## Links

- [View on GitHub](https://github.com/MiguelCastillo/bit-bundler)
- [Log issues](https://github.com/MiguelCastillo/bit-bundler/issues)
- [View examples](https://github.com/MiguelCastillo/bit-bundler/tree/master/examples)

## License
MIT
