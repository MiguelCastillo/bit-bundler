function attachToDOM(source) {
  var head = document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.setAttribute('type', 'text/css');
  style.innerHTML = source;
  head.appendChild(style);
}

module.exports = attachToDOM;