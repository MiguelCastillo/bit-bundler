## Examples

#### hello world bundling.

```
$ bitbundler --src src/main.js --dest dist/out.js
```

#### Include eslint loader plugin to lint only the modules used by your code.

```
$ bitbundler --src src/main.js --dest dist/out.js --loader @bit/loader-eslint
```

#### Passing in options to a loader plugin.

```
$ bitbundler --src src/main.js --dest dist/out.js --loader [ --name @bit/loader-js --options [ --umd ] ] --loader @bit/loader-eslint
```

#### Printing the generated CLI settings

> Handy for debugging

```
$ bitbundler --print --src src/main.js --dest dist/out.js --loader [ --name @bit/loader-js --options [ --umd ] ] --loader @bit/loader-eslint
```

#### Loading the default config file

bit-bundler will automatically try to load `.bitbundler.js` or `.bitbundler.json`. If both are present then `.bitbundler.js` will be used. The configuration file is optional, so if a configuration file does not exist then only CLI arguments are used.

So just run bit-bundler in the CLI to load the default configuration file.

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
