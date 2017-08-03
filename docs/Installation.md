## Installation

> Generally speaking, we would install bit-bundler via the npm cli, yarn, or whatever other tool of your choice.

There are a several ways in which you can use bit-bundler, and that determines how you install bit-bundler.

### cli

The first method is bit-bundler's CLI. If you are looking to use bit-bundler's CLI from a shell, you could install bit-bundler globally. So, from the command line execute:

```
$ npm install bit-bundler -g
```

This is the quickest setup, and at this point you can start using bit-bundler's CLI.

Alternatively, bit-bundler can be installed in your project as a dev dependency. When you do that, you will have access to bit-bundler's CLI from npm scripts defined in your package.json. This integration with the npm scripts in your package.json removes the need to install bit-bundler globally, and also allows you specify a particular version of bit-bundler for your project.

> npm scripts integration is the preferred method when using bit-bundler's CLI in your project.

From the command line in the your project's directory, execute:

```
$ npm install bit-bundler --save-dev
```

Now in the package.json you can define a sample command as such:

``` javascript
{
  "scripts": {
    "bb-print": "bitbundler --print --src src/index.js --out dest/out.js"
  }
}
```

And in your favorite shell:

```
$ npm run bb-print
```

> You can read more about this approach [here](https://docs.npmjs.com/cli/run-script).

The CLI also loads any `.bitbundler.js` or `.bitbundler.json` configuration files automatically that are present in your project. You can alternatively specify the name of the configuration file you want to load by specifying a `--config` argument. Options from configuration files are merged with all CLI arguments with CLI arguments taking precedence over options in configuration files.


The equivalent configuration for the above command line looks like the following:

``` javascript
// file name is .bitbundler.js
module.exports = {
  "src": "src/index.js",
  "dest": "dest/out.js"
};
```

And your command will now look like:

```
$ bitbundler
```

> Configuration files can be JavaScript, which allows you to scale to more complicated setups. The configuration file can also be JSON, which currently has limitation when defining regular expressions.

### api

The second method is to use bit-bundler's API. This option is similar in nature to specifying a configuration file for the CLI. From the command line, execute in the directory you intend to use bit-bundler from:

```
$ npm install bit-bundler --save-dev
```

Now you are ready to import bit-bundler.

ES module

``` javascript
import Bitbundler from 'bit-bundler';

Bitbundler.bundle({
  src: "src/main.js",
  dest: "dest/out.js"
});
```

CJS module

``` javascript
const Bitbundler = require('bit-bundler');

Bitbundler.bundle({
  src: "src/main.js",
  dest: "dest/out.js"
});
```