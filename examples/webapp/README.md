# Webapp example

In this example, I have setup a full environment for developing your webapp. This includes

- dev server with [live-server](https://github.com/tapio/live-server)
- copy of static assets with [cpx](https://github.com/mysticatea/cpx)
- bundling with (of course) (bit-bundler)[https://github.com/MiguelCastillo/bit-bundler]
- process management with (pm2)(https://github.com/Unitech/pm2)


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
