(function() {

  var PARALLAX_HEADROOM = 100;
  var PARALLAX_AMOUNT = 0.2;
  var IMG_URL = 'assets/images/header/';

  var BG_WIDTH = 1600;
  var BG_HEIGHT = 1066;

  function Header(element) {
    this._element = element;
    this._box = element.getElementsByClassName('box')[0];
    this._mainBg = document.createElement('div');
    this._blurredBg = document.createElement('div');
    this._blurredBg.className = 'blurred-bg';

    var images = ['normal.jpg', 'blurred.jpg'];
    var elems = [this._mainBg, this._blurredBg];
    for (var i = 0; i < 2; ++i) {
      var e = elems[i];
      e.style.backgroundImage = 'url(' + IMG_URL + images[i] + ')';
      e.style.backgroundSize = '100% auto';
      e.style.backgroundPosition = 'center bottom';
      e.style.position = 'absolute';
    }
    this._element.insertBefore(this._mainBg, this._element.firstChild);

    this._box.insertBefore(this._blurredBg, this._box.firstChild);
    this._box.style.overflow = 'hidden';

    this.layout();
  }

  Header.prototype.layout = function() {
    var w = this._element.offsetWidth;
    var h = this._element.offsetHeight + PARALLAX_HEADROOM;
    var scroll = Math.max(0, document.body.scrollTop);

    var imageWidth = w;
    var imageHeight = imageWidth*BG_HEIGHT/BG_WIDTH;

    if (imageWidth*BG_HEIGHT/BG_WIDTH < h) {
      imageWidth = h * BG_WIDTH/BG_HEIGHT;
      imageHeight = h;
    }

    imageHeight = Math.min(imageHeight, h);

    var paraOffset = Math.min(PARALLAX_HEADROOM, scroll * PARALLAX_AMOUNT);

    var elems = [this._mainBg, this._blurredBg];
    for (var i = 0; i < 2; ++i) {
      var e = elems[i];
      e.style.width = cssSize(imageWidth);
      e.style.height = cssSize(imageHeight);
    }
    var imgLeft = (w - imageWidth) / 2;
    this._mainBg.style.left = cssSize(imgLeft);
    this._mainBg.style.top = cssSize(paraOffset);

    this._blurredBg.style.left = cssSize(imgLeft - this._box.offsetLeft);
    this._blurredBg.style.top = cssSize(-this._box.offsetTop + paraOffset);
  };

  function cssSize(size) {
    return size.toFixed(2) + 'px';
  }

  window.Header = Header;

})();
