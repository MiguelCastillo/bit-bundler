## Hello World!

The smallest setup would be bit-bundler with no options and bundle a file.

#### install bit-bundler

```
$ npm install @bit/bundler -g
```

#### run bitbundler

```
$ bitbundler --src src/main.js --dest dist/out.js
```

That's it. That will bundle `src/main.js` and put the result in `dist/out.js`. But this is not really as interesting as it could be. In the next section we are going to setup a couple of loader plugins to enable features such as transpilation and linting.
