## Installation

> Generally speaking, we would install bit-bundler via the npm cli, yarn, or whatever other tool of your choice.

There are a several ways in which you can use bit-bundler, and that determines how you install bit-bundler. But first, let's cover the requirements.


### Requirements

nodejs version 4.8.0 (or later) as well as npm, yarn, or equivalent to install packages. Throughout the docs, unless otherwise stated, the assumption is that your environment is node.


### global cli

The simplest approach for using bit-bundler is via its CLI. If you are looking to use bit-bundler's CLI, the quickest way is a global install. So, from the command line execute:

```
$ npm install @bit/bundler -g
```

And now you can run bit-bundler with a sample command like the one below.

```
$ bitbundler --src src/index.js --dest dist/out.js
```

While global installs are quick and convenient, it has limitations and drawbacks. A better approach is using bit-bundler's CLI through npm scripts.


### npm scripts

You can run bit-bundler's CLI through npm scripts. In order to do that, you need to install bit-bundler in your project as a dev dependency and define npm scripts in your package.json. This integration with npm scripts removes the need to install bit-bundler globally with the added benefit of allowing you to define a specific version of bit-bundler for each project.

> npm scripts integration is the preferred method for using bit-bundler's CLI in your project.

From the command line in your project's directory, execute:

```
$ npm install @bit/bundler --save-dev
```

Now in the package.json for your project you can define an npm script as shown below.

``` javascript
{
  "scripts": {
    "build": "bitbundler --src src/index.js --dest dist/out.js"
  }
}
```

And from your favorite shell:

```
$ npm run build
```

> You can read more about this approach [here](https://docs.npmjs.com/cli/run-script). Also, a very helpful tool called `npx` allows you to interact with bit-bundler's CLI directly if you needed to. More on npx [here](https://www.npmjs.com/package/npx).

Running bit-bundler via its CLI (global or npm scripts) will automatically load any configuration file (`.bitbundler.js` or `.bitbundler.json`) that is present in your project. You can alternatively specify the name of the configuration file you want to load by specifying a `--config` argument. CLI arguments are merged with options from your configuration files, with CLI arguments taking higher precedence.


The equivalent configuration for the above command looks like the following:

``` javascript
// file name is .bitbundler.js
module.exports = {
  "src": "src/index.js",
  "dest": "dist/out.js"
};
```

And your command will now look like:

```
$ bitbundler
```

And you npm scripts now becomes

``` javascript
{
  "scripts": {
    "build": "bitbundler"
  }
}
```


### api

The last approach is to use bit-bundler's API directly in your code. From the command line:

```
$ npm install @bit/bundler --save-dev
```

Now you are ready to import bit-bundler.

ES module

``` javascript
import Bitbundler from "@bit/bundler";

Bitbundler.bundle({
  src: "src/main.js",
  dest: "dist/out.js"
});
```

CJS module

``` javascript
const Bitbundler = require("@bit/bundler");

Bitbundler.bundle({
  src: "src/main.js",
  dest: "dist/out.js"
});
```
