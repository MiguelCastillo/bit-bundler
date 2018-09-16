## Bundler Plugins

Ok, now that we have configured loader plugins to process our modules, we want to be able to customize how bundles are created, which is where bundle plugins come into play.

So what is a bundler plugin? In essence, bundler plugins are processors that hook into the bundling pipeline in order to customize how bundles are created.

In this example, we are going to use [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) to split the main bundle according to some pattern matching rules we define in the plugin itself.

#### install bit-bundler and plugins

```
$ npm install --save-dev @bit/bundler @bit/loader-eslint @bit/loader-babel @bit/bundler-splitter
```

#### setup bitbundler-config.js

``` javascript
var Bitbundler = require("@bit/bundler");

var bitbundler = new Bitbundler({
  loader: [
    "@bit/loader-eslint",
    "@bit/loader-babel"
  ],
  bundler: [
    ["@bit/bundler-splitter", [
      { dest: "dist/vendor.js", match: "/node_modules/" },
      { dest: "dist/renderer.js", match: "/src/renderer/" }]
    ]
  ]
});

bitbundler.bundle({
  src: "src/main.js",
  dest: "dist/app.js"
});
```

#### run bitbundler-config.js

```
$ node bitbundler-config.js
```

There are other options and rules you can specify available at [bit-bundler-splitter's](https://github.com/MiguelCastillo/bit-bundler-splitter) repo.

And that's it. We have configured our first bundler plugin to split up bundles!
