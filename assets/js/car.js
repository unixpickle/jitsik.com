(function() {

  var CAR_BODY_WIDTH = 580;
  var CAR_BODY_HEIGHT = 232;
  var TIRE_SIZE = 75;
  var IMG_URL = 'assets/images/car/';

  var FRONT_TIRE_LEFT = 87;
  var FRONT_TIRE_TOP = 118;
  var BACK_TIRE_LEFT = 415;
  var BACK_TIRE_TOP = 116;

  var CAR_VELOCITY = 2;

  var MIN_DELAY = 2000;
  var MAX_DELAY = 5000;

  var CAR_BODY_NAMES = ['black', 'blue', 'red', 'purple', 'silver', 'white'];
  var CAR_BODY_NAME_WEIGHTS = [1, 1, 1, 1, 1, 0.1];

  // Loaded asynchronously by loadCarImages().
  var CAR_BODY_DATA_URLS = [];
  var CAR_BODY_WEIGHTS = [];

  // Loaded asynchronously before showing any cars.
  var TIRE_DATA_URLS = {};

  function CarView(element) {
    this._element = element;
    element.style.backgroundImage = 'url('+IMG_URL+'road.png)';
    element.style.backgroundRepeat = 'repeat-x';
    element.style.backgroundSize = 'auto 100%';
    element.style.backgroundPosition = 'center';
    element.style.overflow = 'hidden';

    this._cars = [];
    loadTireImages(function() {
      loadCarImages(this._scheduleNextCar.bind(this));
    }.bind(this));
  }

  CarView.prototype.layout = function() {
    for (var i = 0; i < this._cars.length; ++i) {
      this._cars[i].layout();
    }
  };

  CarView.prototype._scheduleNextCar = function() {
    var delay = MIN_DELAY + (MAX_DELAY-MIN_DELAY)*Math.random();
    setTimeout(function() {
      var car = new ManagedCar(this._element, Math.random() < 0.5);
      this._cars.push(car);
      car.run(function() {
        this._cars.splice(this._cars.indexOf(car), 1);
      }.bind(this));
      this._scheduleNextCar();
    }.bind(this), delay);
  };

  function ManagedCar(container, facingLeft) {
    this._container = container;
    this._car = new Car(facingLeft);

    if (facingLeft) {
      this._topFrac = 0.20;
      this._bottomFrac = 0.64;
    } else {
      this._topFrac = 0.3;
      this._bottomFrac = 1;
    }

    if (facingLeft) {
      container.insertBefore(this._car.element(), container.firstChild);
    } else {
      container.appendChild(this._car.element());
    }

    // this._position is measured in "height units", i.e.
    // units relative to the height of the car/container.
    this._position = this._container.offsetWidth/(2*this._carHeight()) +
      CAR_BODY_WIDTH/CAR_BODY_HEIGHT;

    this.layout();
  }

  ManagedCar.prototype.run = function(cb) {
    var ival;
    var lastTime = new Date().getTime();
    ival = setInterval(function() {
      var now = new Date().getTime();
      this._move((now-lastTime)/1000);
      lastTime = now;
      if (this._offscreen()) {
        this._container.removeChild(this._car.element());
        clearInterval(ival);
        cb();
      }
    }.bind(this), 1000/24);
  };

  ManagedCar.prototype.layout = function() {
    var height = this._carHeight();
    var topY = this._container.offsetHeight * this._topFrac;
    this._car.layout(height, topY, this._position*height);
  };

  ManagedCar.prototype._move = function(seconds) {
    this._position -= CAR_VELOCITY * seconds;
    this.layout();
  };

  ManagedCar.prototype._offscreen = function() {
    var maxLeft = this._container.offsetWidth / (2 * this._carHeight());
    return this._position < -maxLeft;
  };

  ManagedCar.prototype._carHeight = function() {
    return this._container.offsetHeight * (this._bottomFrac - this._topFrac);
  };

  function Car(facingLeft) {
    this._element = document.createElement('div');
    this._frontTire = document.createElement('div');
    this._backTire = document.createElement('div');

    var images = [randomCarImageURL(), TIRE_DATA_URLS.front,
      TIRE_DATA_URLS.back];
    var elements = [this._element, this._frontTire, this._backTire];
    for (var i = 0; i < 3; ++i) {
      var e = elements[i];
      e.style.backgroundImage = 'url('+images[i]+')';
      e.style.backgroundSize = '100% 100%';
      e.style.position = 'absolute';
      if (i > 0) {
        this._element.appendChild(e);
      }
    }

    this._facingLeft = facingLeft;
    if (!facingLeft) {
      setTransform(this._element, 'scale(-1, 1)');
    }
  }

  Car.prototype.element = function() {
    return this._element;
  };

  Car.prototype.layout = function(height, topY, distFromCenter) {
    var coordScale = (height / CAR_BODY_HEIGHT);
    var width = CAR_BODY_WIDTH * coordScale;
    this._element.style.width = cssSize(width);
    this._element.style.height = cssSize(height);
    this._element.style.top = cssSize(topY);

    var tireSize = TIRE_SIZE * coordScale;
    this._frontTire.style.top = cssSize(FRONT_TIRE_TOP*coordScale);
    this._frontTire.style.left = cssSize(FRONT_TIRE_LEFT*coordScale);
    this._backTire.style.top = cssSize(BACK_TIRE_TOP*coordScale);
    this._backTire.style.left = cssSize(BACK_TIRE_LEFT*coordScale);

    var tireCircumference = Math.PI * tireSize;
    var revolutions = distFromCenter / tireCircumference;
    var angle = (360 * revolutions).toFixed(2);

    var tires = [this._frontTire, this._backTire];
    for (var i = 0; i < 2; ++i) {
      var tire = tires[i];
      tire.style.width = cssSize(tireSize);
      tire.style.height = cssSize(tireSize);
      setTransform(tire, 'rotate(' + angle + 'deg)');
    }

    var posAttr = (this._facingLeft ? 'right' : 'left');
    var centerX = this._element.parentNode.offsetWidth / 2;
    this._element.style[posAttr] = cssSize(centerX - distFromCenter);
  };

  function randomCarImageURL() {
    var totalWeight = 0;
    for (var i = 0; i < CAR_BODY_WEIGHTS.length; ++i) {
      totalWeight += CAR_BODY_WEIGHTS[i];
    }
    var num = Math.random() * totalWeight;
    for (var i = 0; i < CAR_BODY_WEIGHTS.length; ++i) {
      num -= CAR_BODY_WEIGHTS[i];
      if (num < 0) {
        return CAR_BODY_DATA_URLS[i];
      }
    }
    return CAR_BODY_DATA_URLS[0];
  }

  function cssSize(size) {
    return size.toFixed(2) + 'px';
  }

  function setTransform(el, text) {
    el.style.transform = text;
    el.style.webkitTransform = text;
  }

  function loadCarImages(firstCb) {
    for (var i = 0; i < CAR_BODY_NAMES.length; ++i) {
      (function(name, weight) {
        var img = document.createElement('img');
        img.onload = function() {
          CAR_BODY_DATA_URLS.push(imageDataURL(img));
          CAR_BODY_WEIGHTS.push(weight);
          if (firstCb) {
            firstCb();
            firstCb = null;
          }
        };
        img.src = IMG_URL + 'car_body_' + name + '.png';
      })(CAR_BODY_NAMES[i], CAR_BODY_NAME_WEIGHTS[i]);
    }
  }

  function loadTireImages(cb) {
    var numLoaded = 0;
    var names = ['tire_front.png', 'tire_back.png'];
    var keys = ['front', 'back'];
    for (var i = 0; i < names.length; ++i) {
      (function(name, key) {
        var img = document.createElement('img');
        img.onload = function() {
          ++numLoaded;
          TIRE_DATA_URLS[key] = imageDataURL(img);
          if (numLoaded === names.length) {
            cb();
          }
        }.bind(this);
        img.src = IMG_URL + name;
      }.bind(this))(names[i], keys[i]);
    }
  }

  function imageDataURL(img) {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/png');
  }

  window.CarView = CarView;

})();
