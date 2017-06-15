## Bundler Plugins

Ok, now that we have configured Loader Plugins to process our modules, what is the purpose of bundler plugins?

In essence, bundler plugins are processors that hook into the bundling pipeline. It is in the bundling pipeline that we take the output from the loader pipeline to create bundles. And it is via bundler plugins that we can customize how bundles are created.

In this example, we are going to use bit-bundler-splitter to split the main bundle according to some pattern matching rules we define in the plugin itself.

#### install bit-bundler and plugins

```
$ npm install --save-dev bit-bundler bit-loader-eslint bit-loader-js bit-loader-babel bit-bundler-splitter
```

#### setup bitbundler-config.js

``` javascript
var Bitbundler = require("bit-bundler");
var splitBundle = require("bit-bundler-splitter");

var bitbundler = new Bitbundler({
  loader: [
    "bit-loader-js",
    "bit-loader-eslint",
    "bit-loader-babel"
  ],
  bundler: [
    splitBundle("dest/vendor.js", { match: { path: /\/node_modules\// } }),
    splitBundle("dest/renderer.js", { match: { path: /src\/renderer/ } })
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

Let's break down the splitter plugin. The splitter plugin takes as its first argument the destination where the bundle is going to be written to. And the second argument defines which modules are going into the particular bundle. In the example above all modules that match the specified file paths go into the particular bundle. There are other options and rules you can specify and for that you can take a closer look at [bit-bundler-splitter's](https://github.com/MiguelCastillo/bit-bundler-splitter) repo.

And that's it. We have configured our first bundler plugin to split up bundles!
