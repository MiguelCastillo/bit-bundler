# Webapp example

The webapp example illustrates how we can put together a build system with a few key tools.

- dev server with [3dub](https://github.com/MiguelCastillo/3dub)
- copy of static assets with [cpx](https://github.com/mysticatea/cpx)
- bundling with (of course) [bit-bundler](https://github.com/MiguelCastillo/bit-bundler)
- process management with [pm2](https://github.com/Unitech/pm2)

The configuration in the setup is designed to be resillient, modular, and scalable. Why this approach? Simple. After working with several build systems that couple all the pieces together under a single unified system, a few things happen:

1. One piece breaks, everything goes down.
2. Plugins that wrap tools that are unrelated cause friction in your setup.
3. Plugins tend to have dependency versions fall behind, which makes coordinating with the ecosystem more difficult.
4. More levels of indirection add complexity.

With the approach of separate processes acting as their own service, you can start/restart/update/stop individual pieces without bringing down the entire build system. Also - process management with [pm2](https://github.com/Unitech/pm2) is pretty magical.

![start build](https://raw.githubusercontent.com/MiguelCastillo/bit-bundler/master/img/webapp-build-start.png "Starting up the build")

![monitor build](https://raw.githubusercontent.com/MiguelCastillo/bit-bundler/master/img/webapp-build-monitor.png "Monitoring the build processes")


# Usage

### To start the build system

```
$ npm install
$ npm start
$ open http://localhost:3000
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

### To show the current build system processes

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
