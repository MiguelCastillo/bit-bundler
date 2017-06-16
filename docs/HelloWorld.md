## Hello World!

The smallest setup would be bit-bundler with no options and bundle a file.

#### install bit-bundler

```
$ npm install --save-dev bit-bundler
```

#### setup bitbundler-config.js

``` javascript
var Bitbundler = require("bit-bundler");

Bitbundler.bundle({
  src: "src/main.js",
  dest: "dest/out.js"
});
```

#### run bitbundler-config.js

```
$ node bitbundler-config.js
```

That's it. That will bundle `src/main.js` and put the result in `dest/out.js`. But this is not really as interesting as it could be. In the next section we are going to setup a couple of loader plugins to enable features such as transpilation and linting.
