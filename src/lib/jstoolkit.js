PageZipper.prototype.zero = function (n) {
  return !pgzp.defined(n) || isNaN(n) ? 0 : n;
};
PageZipper.prototype.defined = function (o) {
  return typeof o != 'undefined';
};
PageZipper.prototype.css = (function () {
  var css = {};
  css.rgb2hex = function (rgbString) {
    if (typeof rgbString != 'string' || !pgzp.defined(rgbString.match)) {
      return null;
    }
    var result = rgbString.match(
      /^\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*/
    );
    if (result == null) {
      return rgbString;
    }
    var rgb = (+result[1] << 16) | (+result[2] << 8) | +result[3];
    var hex = '';
    var digits = '0123456789abcdef';
    while (rgb != 0) {
      hex = digits.charAt(rgb & 0xf) + hex;
      rgb >>>= 4;
    }
    while (hex.length < 6) {
      hex = '0' + hex;
    }
    return '#' + hex;
  };
  css.hyphen2camel = function (property) {
    if (!pgzp.defined(property) || property == null) {
      return null;
    }
    if (property.indexOf('-') < 0) {
      return property;
    }
    var str = '';
    var c = null;
    var l = property.length;
    for (var i = 0; i < l; i++) {
      c = property.charAt(i);
      str += c != '-' ? c : property.charAt(++i).toUpperCase();
    }
    return str;
  };
  css.getStyle = function (o, property) {
    if (o == null) {
      return null;
    }
    var val = null;
    var camelProperty = css.hyphen2camel(property);
    if (property == 'float') {
      val = css.getStyle(o, 'cssFloat');
      if (val == null) {
        val = css.getStyle(o, 'styleFloat');
      }
    } else if (o.currentStyle && pgzp.defined(o.currentStyle[camelProperty])) {
      val = o.currentStyle[camelProperty];
    } else if (pgzp.win.getComputedStyle) {
      val = pgzp.win.getComputedStyle(o, null).getPropertyValue(property);
    } else if (o.style && pgzp.defined(o.style[camelProperty])) {
      val = o.style[camelProperty];
    }
    if (/^\s*rgb\s*\(/.test(val)) {
      val = css.rgb2hex(val);
    }
    if (/^#/.test(val)) {
      val = val.toLowerCase();
    }
    return val;
  };
  css.setStyle = function (o, property, value) {
    if (
      o == null ||
      !pgzp.defined(o.style) ||
      !pgzp.defined(property) ||
      property == null ||
      !pgzp.defined(value)
    ) {
      return false;
    }
    if (property == 'float') {
      o.style['cssFloat'] = value;
      o.style['styleFloat'] = value;
    } else if (property == 'opacity') {
      o.style['-moz-opacity'] = value;
      o.style['-khtml-opacity'] = value;
      o.style.opacity = value;
      if (pgzp.defined(o.style.filter)) {
        o.style.filter = 'alpha(opacity=' + value * 100 + ')';
      }
    } else {
      o.style[css.hyphen2camel(property)] = value;
    }
    return true;
  };
  css.hasClass = function (obj, className) {
    if (!pgzp.defined(obj) || obj == null || !RegExp) {
      return false;
    }
    var re = new RegExp('(^|\\s)' + className + '(\\s|$)');
    if (typeof obj == 'string') {
      return re.test(obj);
    } else if (typeof obj == 'object' && obj.className) {
      return re.test(obj.className);
    }
    return false;
  };
  css.addClass = function (obj, className) {
    if (typeof obj != 'object' || obj == null || !pgzp.defined(obj.className)) {
      return false;
    }
    if (obj.className == null || obj.className == '') {
      obj.className = className;
      return true;
    }
    if (pgzp.css.hasClass(obj, className)) {
      return true;
    }
    obj.className = obj.className + ' ' + className;
    return true;
  };
  css.removeClass = function (obj, className) {
    if (
      typeof obj != 'object' ||
      obj == null ||
      !pgzp.defined(obj.className) ||
      obj.className == null
    ) {
      return false;
    }
    if (!pgzp.css.hasClass(obj, className)) {
      return false;
    }
    var re = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
    obj.className = obj.className.replace(re, ' ');
    return true;
  };
  css.replaceClass = function (obj, className, newClassName) {
    if (
      typeof obj != 'object' ||
      obj == null ||
      !pgzp.defined(obj.className) ||
      obj.className == null
    ) {
      return false;
    }
    pgzp.css.removeClass(obj, className);
    pgzp.css.addClass(obj, newClassName);
    return true;
  };
  return css;
})();
PageZipper.prototype.screen = (function () {
  var screen = {};
  screen.getBody = function () {
    if (pgzp.doc.body) {
      return pgzp.doc.body;
    }
    if (pgzp.doc.getElementsByTagName) {
      var bodies = pgzp.doc.getElementsByTagName('BODY');
      if (bodies != null && bodies.length > 0) {
        return bodies[0];
      }
    }
    return null;
  };
  screen.getScrollTop = function () {
    if (
      pgzp.doc.documentElement &&
      pgzp.defined(pgzp.doc.documentElement.scrollTop) &&
      pgzp.doc.documentElement.scrollTop > 0
    ) {
      return pgzp.doc.documentElement.scrollTop;
    }
    if (pgzp.doc.body && pgzp.defined(pgzp.doc.body.scrollTop)) {
      return pgzp.doc.body.scrollTop;
    }
    return null;
  };
  screen.getDocumentHeight = function () {
    var body = pgzp.screen.getBody();
    var innerHeight =
      pgzp.defined(self.innerHeight) && !isNaN(self.innerHeight)
        ? self.innerHeight
        : 0;
    if (
      pgzp.doc.documentElement &&
      (!pgzp.doc.compatMode || pgzp.doc.compatMode == 'CSS1Compat')
    ) {
      var topMargin = parseInt(pgzp.css.getStyle(body, 'margin-top'), 10) || 0;
      var bottomMargin =
        parseInt(pgzp.css.getStyle(body, 'margin-bottom'), 10) || 0;
      return Math.max(
        body.offsetHeight + topMargin + bottomMargin,
        pgzp.doc.documentElement.clientHeight,
        pgzp.doc.documentElement.scrollHeight,
        pgzp.zero(self.innerHeight)
      );
    }
    return Math.max(
      body.scrollHeight,
      body.clientHeight,
      pgzp.zero(self.innerHeight)
    );
  };
  screen.getViewportWidth = function () {
    if (
      pgzp.doc.documentElement &&
      (!pgzp.doc.compatMode || pgzp.doc.compatMode == 'CSS1Compat')
    ) {
      return pgzp.doc.documentElement.clientWidth;
    } else if (pgzp.doc.compatMode && pgzp.doc.body) {
      return pgzp.doc.body.clientWidth;
    }
    return screen.zero(self.innerWidth);
  };
  screen.getViewportHeight = function () {
    if (
      !pgzp.win.opera &&
      pgzp.doc.documentElement &&
      (!pgzp.doc.compatMode || pgzp.doc.compatMode == 'CSS1Compat')
    ) {
      return pgzp.doc.documentElement.clientHeight;
    } else if (pgzp.doc.compatMode && !pgzp.win.opera && pgzp.doc.body) {
      return pgzp.doc.body.clientHeight;
    }
    return pgzp.zero(self.innerHeight);
  };
  return screen;
})();
