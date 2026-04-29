PageZipper.prototype.startsWith = function (pattern, str) {
  return str.indexOf(pattern) === 0
}
PageZipper.prototype.endsWith = function (pattern, str) {
  var d = str.length - pattern.length
  return d >= 0 && str.lastIndexOf(pattern) === d
}
PageZipper.prototype.log = function (html, override) {
  if (pgzp.debug || override) {
    if (pgzp.win['console']) {
      pgzp.win.console.log(html)
      return
    }
    var div = pgzp.doc.createElement('textarea')
    pgzp.doc.body.appendChild(div)
    div.value = html
  }
}
PageZipper.prototype.logList = function (list, initialStr, listStr) {
  var interpolate = function (s, o) {
    return s.replace(/\#\{([^}]+)\}/g, function (match, exp) {
      return eval(exp)
    })
  }
  for (var i = 0; i < list.length; i++) {
    initialStr += '\n' + interpolate(listStr, list[i])
  }
  pgzp.log(initialStr)
}
PageZipper.prototype.noBubble = function (event) {
  if (event) {
    event.cancelBubble = true
    if (event.stopPropagation) event.stopPropagation()
    event.returnValue = false
  }
  return event
}
PageZipper.prototype.getRemaningBufferSize = function () {
  var left =
    pgzp.screen.getDocumentHeight() -
    pgzp.screen.getScrollTop() -
    pgzp.screen.getViewportHeight()
  if (left < 0) return 0
  return Math.floor(left)
}
PageZipper.prototype.findPos = function (obj) {
  var curleft = 0,
    curtop = 0,
    objOrig = obj
  if (obj.offsetParent) {
    do {
      curleft +=
        obj.offsetLeft || parseInt(obj.style.left.replace('px', ''), 10) || 0
      curtop +=
        obj.offsetTop || parseInt(obj.style.top.replace('px', ''), 10) || 0
    } while ((obj = obj.offsetParent))
  }
  if (objOrig.ownerDocument != pgzp.win.parent.document) {
    var ifr = pgzp.doc.getElementById(objOrig.ownerDocument.pgzp_iframe_id)
    if (ifr) {
      var ifrPos = pgzp.findPos(ifr)
      curleft += ifrPos.x
      curtop += ifrPos.y
    }
  }
  return { x: curleft, y: curtop }
}
PageZipper.prototype.getDocumentHeight = function (doc) {
  var body = doc.body,
    html = doc.documentElement
  return Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  )
}
PageZipper.prototype.isNumber = function (str) {
  return (
    str &&
    (typeof str == 'number' ||
      (typeof str == 'string' && str.search(/^\d+$/) >= 0))
  )
}
PageZipper.prototype.isPageBarNumber = function (str) {
  return !!(str && (pgzp.isNumber(str) || str.match(/\d+\s*-\s*\d+/g)))
}
PageZipper.prototype.getDomain = function (url) {
  if (url.match('https://localhost/')) return 'localhost'
  var hna = url.match(/^http[s]?\:\/\/([\S]+?\.\w+)(\/.*)?$/i)
  if (hna) {
    var parts = hna[1].split('.')
    if (parts.length > 2)
      return parts[parts.length - 2] + '.' + parts[parts.length - 1]
    return hna[1]
  }
  hna = url.match(/^javascript\:.*$/i)
  if (hna) {
    return null
  }
  return pgzp.currDomain
}
PageZipper.prototype.getUrlWOutAnchors = function (url) {
  if (url.indexOf('#') >= 0) {
    var results = url.match(/(.*?)#.*/)
    if (results.length > 0) return results[1]
  }
  return url
}
PageZipper.prototype.convertToArray = function (a) {
  var b = []
  for (var i = 0; i < a.length; i++) b.push(a[i])
  return b
}
PageZipper.prototype.filter = function (arr, filter) {
  for (var i = 0; i < arr.length; i++) {
    if (filter(arr[i])) {
      arr.splice(i, 1)
      i--
    }
  }
}
PageZipper.prototype.depthFirstRecursion = function (root, callback) {
  for (var i = 0; i < root.childNodes.length; i++) {
    if (
      root.childNodes[i].nodeType == 3 ||
      (root.childNodes[i].nodeType == 1 &&
        pgzp.css.getStyle(root.childNodes[i], 'display') != 'none')
    ) {
      pgzp.depthFirstRecursion(root.childNodes[i], callback)
    }
  }
  callback(root)
}
PageZipper.prototype.contains = function (ar, obj) {
  if (Array.indexOf) {
    return ar.indexOf(obj) != -1
  } else {
    for (var i = 0; i < ar.length; i++) {
      if (ar[i] == obj) {
        return true
      }
    }
    return false
  }
}
PageZipper.prototype.getContentType = function () {
  var metas = pgzp.doc
    .getElementsByTagName('head')[0]
    .getElementsByTagName('meta')
  for (var i = 0; i < metas.length; i++) {
    if (
      metas[i].getAttribute('http-equiv') &&
      metas[i].getAttribute('http-equiv').toLowerCase() == 'content-type' &&
      metas[i].getAttribute('content')
    )
      return metas[i].getAttribute('content')
  }
  return null
}
PageZipper.prototype.isStandaloneWord = function (word, text, humanReadable) {
  var delimiter = humanReadable ? '\\s' : '[^a-zA-Z]'
  return new RegExp(
    '^(.*' + delimiter + '+)?' + word + '(' + delimiter + '+.*)?$',
    'i'
  ).test(text)
}
PageZipper.prototype.getNumberAtPos = function (str, pos) {
  var currNum = '' + str.charAt(pos)
  var currPos = pos - 1
  while (currPos >= 0 && pgzp.isNumber(str.charAt(currPos))) {
    currNum = str.charAt(currPos) + currNum
    currPos--
  }
  currPos = pos + 1
  while (currPos < str.length && pgzp.isNumber(str.charAt(currPos))) {
    currNum += str.charAt(currPos)
    currPos++
  }
  return pgzp.isNumber(currNum) ? parseInt(currNum, 10) : -1
}