(function() {

  function shake(box) {
    if (box.className) {
      return;
    }
    box.className = 'shaking';
    setTimeout(function() {
      box.className = '';
    }, 1000);
  }

  window.addEventListener('load', function() {
    var submit = document.getElementById('contact-submit');
    submit.addEventListener('click', function() {
      var fields = [
        document.getElementById('contact-name'),
        document.getElementById('contact-email'),
        document.getElementById('contact-subject'),
        document.getElementById('contact-message'),
      ];
      for (var i = 0, len = fields.length; i < len; ++i) {
        var f = fields[i];
        if (!f.value) {
          shake(f);
          return;
        }
      }
      // TODO: send email here.
    });
  });

})();
