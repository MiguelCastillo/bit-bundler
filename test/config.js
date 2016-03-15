var System = (function() { // eslint-disable-line
  var importer = bitimports.config({
    baseUrl: '../',
    paths: {
      chai: 'node_modules/chai/chai',
      babel: 'node_modules/babel-bits/dist/index'
    },
    ignore: ['chai', 'dist/index']
  })
  .plugin('js', {
    transform: {
      handler: 'babel',
      options: {
        sourceMaps: 'inline',
        presets: ['es2015']
      }
    }
  });

  return importer;
})();
