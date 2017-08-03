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

Use this when you are looking to setup all your configuration in a config file. Either `.bitbundlerrc.js` or `bitbundlerrc.json`, whichever is found first.

```
$ bitbundler --config
```

#### Specifying a config file

If you want to load a particular config file, you can provide a string

```
$ bitbundler --config my-bit-bundler-config.js
```

#### Overriding options in a config file

You can also specify CLI options which will override any corresponding options from the config file.

```
$ bitbundler --config --src some-other-index.js
```
