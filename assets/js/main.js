(function() {

  var carView = null;

  window.addEventListener('load', function() {
    carView = new window.CarView(document.body);
  });

  window.addEventListener('resize', function() {
    carView.resize();
  });

})();
