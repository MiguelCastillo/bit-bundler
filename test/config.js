var System = (function() { // eslint-disable-line
  var importer = bitimports.config({
    baseUrl: '../',
    paths: {
      chai: 'node_modules/chai/chai',
      babel: 'node_modules/babel-bits/dist/index'
    }
  });

  importer.ignore(['chai', 'dist/index']);

  importer.plugin('js', {
    transform: {
      handler: 'babel',
      options: {
        sourceMaps: 'inline'
      }
    }
  });

  return importer;
})();
