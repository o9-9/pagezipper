PageZipper.prototype.getPosterImagesOnPage = function (page) {
  var posterImgs = [],
    filteredImages = []
  var okImgDomains = { 'https://github.com/o9-9/pagezipper': 1 }
  var isFillerImg = function (img) {
    if (img.offsetWidth * img.offsetHeight < 100 * 100) {
      filteredImages.push(img)
      return true
    }
    var p = img.parentNode
    if (p.nodeType == Node.ELEMENT_NODE && p.tagName.toLowerCase() == 'a') {
      if (
        pgzp.getDomain(p.href) != pgzp.currDomain &&
        okImgDomains[pgzp.getDomain(p.href)] != 1
      ) {
        return true
      }
    }
    return false
  }
  var getBiggestImg = function (imgs) {
    var biggestImg = null
    for (var i = 0; i < imgs.length; i++) {
      if (
        biggestImg == null ||
        imgs[i].offsetWidth * imgs[i].offsetHeight >
          biggestImg.offsetWidth * biggestImg.offsetHeight
      ) {
        biggestImg = imgs[i]
      }
    }
    return biggestImg
  }
  var imgs = pgzp.convertToArray(page.getElementsByTagName('img'))
  pgzp.filter(imgs, isFillerImg)
  if (imgs.length < 2) return imgs
  imgs.sort(function (a, b) {
    var sizeA = a.offsetWidth * a.offsetHeight
    var sizeB = b.offsetWidth * b.offsetHeight
    return sizeB - sizeA
  })
  if (pgzp.onePosterPerPageMode) return [imgs[0]]
  var biggestSmallImg = getBiggestImg(filteredImages)
  if (biggestSmallImg) imgs.push(biggestSmallImg)
  for (var i = 1; i < imgs.length; i++) {
    var bigger = imgs[i - 1],
      biggerSize = bigger.offsetHeight * bigger.offsetWidth
    var smaller = imgs[i],
      smallerSize = smaller.offsetHeight * smaller.offsetWidth
    var relGap =
        biggerSize == 0 || smallerSize == 0 ? 0 : biggerSize / smallerSize,
      absGap = biggerSize - smallerSize,
      totalGap = relGap * absGap
    if (totalGap >= biggestGap[0]) {
      biggestGap = [totalGap, i]
    }
  }
  imgs.splice(biggestGap[1], imgs.length - biggestGap[1])
  imgs.sort(function (a, b) {
    return pgzp.findPos(a).y - pgzp.findPos(b).y
  })
  return imgs
}
PageZipper.prototype.resizeImageToViewport = function (img) {
  var usableViewport =
    pgzp.screen.getViewportHeight() - pgzp.poster_image_min_vmargin * 2
  if (img.offsetHeight > usableViewport) {
    img.style.width =
      (usableViewport / img.offsetHeight) * img.offsetWidth + 'px'
    img.style.height = usableViewport + 'px'
  }
}
PageZipper.prototype.centerImage = function (img, pos) {
  pos = pos || pgzp.findPos(img)
  var usableMargin = (pgzp.screen.getViewportHeight() - img.offsetHeight) / 2
  var margin =
    usableMargin > pgzp.poster_image_min_vmargin
      ? usableMargin
      : pgzp.poster_image_min_vmargin
  margin = Math.ceil(margin)
  img['pgzpCenterOffset'] = margin
  var amountToScroll = pos.y - margin - pgzp.screen.getScrollTop()
  pgzp.win.scrollBy(0, amountToScroll)
}
PageZipper.prototype.goToNextPosterImage = function () {
  var browserBorderTop = pgzp.screen.getScrollTop()
  for (var i = 0; i < pgzp.pages.length; i++) {
    pgzp.ensurePageHasPosterImgsSet(pgzp.pages[i])
    for (var j = 0; j < pgzp.pages[i].posterImgs.length; j++) {
      var currPosterImg = pgzp.pages[i].posterImgs[j]
      var pos = pgzp.findPos(currPosterImg)
      if (pos.y > browserBorderTop) {
        if (currPosterImg['pgzpCenterOffset']) {
          var adjustedBrowserBorderTop =
            pgzp.screen.getScrollTop() +
            parseInt(currPosterImg['pgzpCenterOffset'], 10)
          if (pos.y > adjustedBrowserBorderTop) {
          } else {
            continue
          }
        }
        pgzp.resizeImageToViewport(currPosterImg)
        pgzp.centerImage(currPosterImg, pos)
        return
      }
    }
  }
}
PageZipper.prototype.goToPreviousPosterImage = function () {
  var browserBorderTop = pgzp.screen.getScrollTop()
  var prevImg = null
  for (var i = 0; i < pgzp.pages.length; i++) {
    pgzp.ensurePageHasPosterImgsSet(pgzp.pages[i])
    for (var j = 0; j < pgzp.pages[i].posterImgs.length; j++) {
      var currPosterImg = pgzp.pages[i].posterImgs[j]
      var pos = pgzp.findPos(currPosterImg)
      if (!prevImg) prevImg = currPosterImg
      if (pos.y > browserBorderTop) {
        pgzp.resizeImageToViewport(prevImg)
        pgzp.centerImage(prevImg)
        return
      } else {
        prevImg = currPosterImg
      }
    }
  }
}
PageZipper.prototype.ensurePageHasPosterImgsSet = function (page) {
  if (page.posterImgs == null) {
    page.posterImgs = pgzp.getPosterImagesOnPage(page.elemContent)
  }
}