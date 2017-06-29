## Loader Plugins

Let's continue on and enhance our Hello World example by introducing a couple of loader plugins. But first, what exactly are loader plugins?

Loader plugins are processors that hook into the module loading pipeline. This allows us to customize how modules are loaded and processed. For example, with loader plugins you can enable transpilation with babel and linting with eslint. Let's see how we can set that up.

> By default `bit-bundler` can *resolve* and *load* [node modules](https://nodejs.org/api/modules.html#modules_all_together). But it does not know how to *load* module dependencies. In order to load module dependencies and build a dependency graph, we will need to rely on the loader plugin [bit-loader-js](https://github.com/MiguelCastillo/bit-loader-js).


#### install bit-bundler and plugins

```
$ npm install --save-dev bit-bundler bit-loader-eslint bit-loader-js bit-loader-babel
```

#### setup bitbundler-config.js

``` javascript
var Bitbundler = require("bit-bundler");

var bitbundler = new Bitbundler({
  loader: [
    "bit-loader-js",
    "bit-loader-eslint",
    "bit-loader-babel"
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

With this setup we are recursively loading modules and their dependencies, transpiling with babel, and efficiently linting only the files that are depended upon and used by your code.

So now that we know about loader plugins, next let's talk about bundler plugins.
