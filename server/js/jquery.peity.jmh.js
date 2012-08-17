// Derived from:
// http://benpickles.github.com/peity/

(function($, document) {
  var peity = $.fn.peity = function(type, options) {
    if (document.createElement("canvas").getContext) {
      this.each(function() {
        $(this).change(function() {
          var opts = $.extend({}, options)
          var self = this

          $.each(opts, function(name, value) {
            if ($.isFunction(value)) opts[name] = value.call(self)
          })

          var value = $(this).html();
          peity.graphers[type].call(this, $.extend({}, peity.defaults[type], opts));
          $(this).trigger("chart:changed", value);
        }).trigger("change");
      });
    }

    return this;
  };

  peity.graphers = {};
  peity.defaults = {};

  peity.add = function(type, defaults, grapher){
    peity.graphers[type] = grapher;
    peity.defaults[type] = defaults;
  };

  var devicePixelRatio = window.devicePixelRatio || 1

  function createCanvas(width, height) {
    var canvas = document.createElement("canvas")
    canvas.setAttribute("width", width * devicePixelRatio)
    canvas.setAttribute("height", height * devicePixelRatio)

    if (devicePixelRatio != 1) {
      var style = "width:" + width + "px;height:" + height + "px"
      canvas.setAttribute("style", style)
    }

    return canvas
  }

  peity.add(
    'pie',
    {
      colour: '#1BAFE0',
      delimeter: '/',
      diameter: 220,
      stroke: 22
    },
    function(opts) {
      var $this = $(this)
      var values = $this.text().split(opts.delimeter)
      var v1 = parseFloat(values[0]);
      var v2 = parseFloat(values[1]);
      var adjust = -Math.PI / 2;
      var slice = (v1 / v2) * Math.PI * 2;

      var canvas = createCanvas(opts.diameter, opts.diameter)
      var context = canvas.getContext("2d");
      var centre = canvas.width / 2;

      // Ring around pie.
      context.moveTo(centre, centre);
      context.beginPath();
      context.lineWidth = opts.stroke;
      context.strokeStyle = "rgb(" + opts.colour + ")";
      context.arc(centre, centre, centre - (opts.stroke / 2), 0, Math.PI * 2, false);
      context.stroke();

      // Slice of pie.
      context.beginPath();
      context.moveTo(centre, centre);
      context.arc(centre, centre, centre - opts.stroke + 1, adjust, slice + adjust, false);
      context.fillStyle = "rgba(" + opts.colour + ",0.80)";
      context.fill();

      $this.wrapInner($("<span>").hide()).append(canvas)
  });

})(jQuery, document);
