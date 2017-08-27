# Webapp example

The webapp example illustrates how we can put together a build system with a few key tools.

- dev server with [live-server](https://github.com/tapio/live-server)
- copy of static assets with [cpx](https://github.com/mysticatea/cpx)
- bundling with (of course) [bit-bundler](https://github.com/MiguelCastillo/bit-bundler)
- process management with [pm2](https://github.com/Unitech/pm2)

The configuration in the setup is designed to be resillient, modular, and scalable. Why this approach? Simple. After working with several build systems that couple all the pieces together under a single unified system, a few things happen:

1. One piece break, it all goes down.
2. Wrappers plugins around tools that are generally unrelated cause friction in your setup.
3. Wrappers plugins tend to have dependencies fall behind.
4. Levels of indirection add complexity.

With the approach of separate processes acting as their own service, you can restart individual pieces when needed without bringing down the entire build system. Also - process management with [pm2](https://github.com/Unitech/pm2) is pretty magical.


# Usage

### To start the build system

```
$ npm install
$ npm start
```

### To stop the build system

```
$ npm stop
```

### To restart the whole build system

```
$ npm restart
```

### To clean up all the pm2 processes

```
$ npm run cleanup
```

### To show the current build system proccesses

```
$ npm run monit
```

### To show the live logs

```
$ npm run logs
```

### You can run individual services

```
$ npm run build
$ npm run server
$ npm run assets
```
