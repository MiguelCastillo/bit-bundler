## bit-bundler Examples
These are some examples/recipes to get you started with. These examples cover concepts that range from the most basic setup to a more advanced setup where bundles are split.

You can certainly run these examples too.

```
$ npm install
$ node basic
$ node jsplugin
```

#### Most basic example

that loads `src/main.js` and bundles it.

Setup:
``` javascript
var Bitbundler = require('bit-bundler');
var bitbundler = new Bitbundler();

bitbundler
  .bundle('./src/main.js')
  .then(function(context) {
    console.log(context.bundle);
  });
```

Run:
```
$ node basic
```

#### Bundle JavaScript with node.js dependencies

By default, `bit-bundler` does not understand how to process module dependencies.  So we will rely on [bit-loader-js](https://github.com/MiguelCastillo/bit-loader-js) to help us out here.

> Note: Running this example will fail because the example is written with ES2015 features, so it requires transpiling. We illustrate how to configure [babel](http://babeljs.io/) a little later to tie this whole thing together.

Setup:
``` javascript
var jsPlugin = require('bit-loader-js');
var Bitbundler = require('bit-bundler');

var bitbundler = new Bitbundler({
  loader: {
    plugins: jsPlugin()
  }
});

bitbundler
  .bundle('./src/main.js')
  .then(function(context) {
    console.log(context.bundle);
  });
```

Run:
```
$ node jsplugin
```

#### Bundle JavaScript and transform it with Babel??

Yes please! This setup relies on a transform called [babel-bits](https://github.com/MiguelCastillo/babel-bits).

Setup:
``` javascript
var jsPlugin = require('bit-loader-js');
var babel = require('babel-bits');
var Bitbundler = require('bit-bundler');

var bitbundler = new Bitbundler({
  loader: {
    plugins: jsPlugin({
      transform: babel.config({
        options: {
          presets: ['es2015']
        }
      })
    })
  }
});

bitbundler
  .bundle('./src/main.js')
  .then(function(context) {
    console.log(context.bundle);
  });
```

Run:
```
$ node babel
```


#### How about splitting bundles??

Yup, use the bundler plugin [bit-bundler-splitter](https://github.com/MiguelCastillo/bit-bundler-splitter) to help us here.

> You can configure multiple bundle splitters with matching rules to generate multiple bundles.

Setup:
``` javascript
var jsPlugin = require('bit-loader-js');
var babel = require('babel-bits');
var splitBundle = require('bit-bundler-splitter');
var Bitbundler = require('bit-bundler');

var bitbundler = new Bitbundler({
  loader: {
    plugins: jsPlugin({
      transform: babel
    })
  },
  bundler: {
    plugins: [
      splitBundle('out/vendor.js'),
      splitBundle('out/renderer', { match: { path: /src\/renderer/ } })
    ]
  }
});

bitbundler
  .bundle('./src/main.js')
  .then(function(context) {
    console.log(context.bundle);
  });
```

Run:
```
$ node splitter
```
