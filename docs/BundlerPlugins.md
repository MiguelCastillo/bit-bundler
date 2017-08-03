## Bundler Plugins

Ok, now that we have configured loader plugins to process our modules, we want to be able to customize how bundles are created, which is where bundle plugins come into play.

So what is a bundler plugin? In essence, bundler plugins are processors that hook into the bundling pipeline in order to customize how bundles are created.

In this example, we are going to use [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) to split the main bundle according to some pattern matching rules we define in the plugin itself.

#### install bit-bundler and plugins

```
$ npm install --save-dev bit-bundler bit-loader-eslint bit-loader-js bit-loader-babel bit-bundler-splitter
```

#### setup bitbundler-config.js

``` javascript
var Bitbundler = require("bit-bundler");

var bitbundler = new Bitbundler({
  loader: [
    "bit-loader-js",
    "bit-loader-eslint",
    "bit-loader-babel"
  ],
  bundler: [
    ["bit-bundler-splitter", { dest: "dest/vendor.js", match: { path: /\/node_modules\// } }],
    ["bit-bundler-splitter", { dest: "dest/renderer.js", match: { path: /src\/renderer/ } }]
  ]
});

bitbundler.bundle({
  src: "src/main.js",
  dest: "dest/app.js"
});
```

#### run bitbundler-config.js

```
$ node bitbundler-config.js
```

Let's break down the splitter plugin. The splitter plugin takes as its first argument the destination where the bundle is going to be written to. And the second argument defines which modules go in a particular bundle. The mental model of the flow is like a waterfall in which the main bundle has all the modules, and the splitters are taking the output of the previous splitter pulling out the modules that need to go in a separate bundle.

There are other options and rules you can specify available at [bit-bundler-splitter's](https://github.com/MiguelCastillo/bit-bundler-splitter) repo.

And that's it. We have configured our first bundler plugin to split up bundles!
