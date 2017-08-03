## Examples

#### Loader plugin for processing node and ES6 dependencies

```
$ bitbundler --src src/main.js --dest dest/out.js --loader [ bit-loader-js ]
```

#### Also include eslint loader plugin

```
$ bitbundler --src src/main.js --dest dest/out.js --loader [ bit-loader-js bit-loader-eslint ]
```

#### Passing in options to a loader plugin.

```
$ bitbundler --src src/main.js --dest dest/out.js --loader [ [ --name bit-loader-js --options [ --umd ] ] bit-loader-eslint ]
```

#### Printing the generated CLI settings

> Handy for debugging

```
$ bitbundler --print --src src/main.js --dest dest/out.js --loader [ [ --name bit-loader-js --options [ --umd ] ] bit-loader-eslint ]
```

#### Loading the default config file

bit-bundler will automatically try to load `.bitbundler.js` or `.bitbundler.json`. If both are present then `.bitbundler.js` will be used. The configuration file is optional, so if a configuration file does not exist then only CLI arguments are used.

```
$ bitbundler
```

#### Specifying a config file

If you want to load a particular config file, you can provide a string to the `--config` option.

```
$ bitbundler --config my-bit-bundler-config.js
```

#### Overriding options in a config file

You can also specify CLI options which will override any corresponding options from the config file.

```
$ bitbundler --config --src some-other-index.js
```
