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
    var sent = false;
    submit.addEventListener('click', function() {
      if (sent) {
        return;
      }
      var fields = [
        document.getElementById('contact-name'),
        document.getElementById('contact-email'),
        document.getElementById('contact-subject'),
        document.getElementById('contact-message'),
      ];
      var fieldIds = ['name', 'email', 'subject', 'message'];
      var payload = '';
      for (var i = 0, len = fields.length; i < len; ++i) {
        var f = fields[i];
        if (!f.value) {
          shake(f);
          return;
        }
        if (payload) {
          payload += '&';
        }
        payload += fieldIds[i] + '=' + encodeURIComponent(f.value);
      }

      var req = new XMLHttpRequest();
      req.open('POST', '/contact', true)
      req.setRequestHeader('Content-Type',
        'application/x-www-form-urlencoded');
      req.send(payload);

      document.getElementById('contact').className = 'sent';
      sent = true;
    });
  });

})();
