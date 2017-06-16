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
