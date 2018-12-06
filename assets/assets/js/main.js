(function() {

  var carView = null;
  var header = null;

  window.addEventListener('load', function() {
    carView = new window.CarView(document.getElementById('cars'));
    header = new window.Header(document.getElementById('header'));
  });

  window.addEventListener('resize', function() {
    carView.layout();
    header.layout();
  });

  window.addEventListener('scroll', function() {
    header.layout();
  });

})();
