PageZipper.prototype.addMenu = function () {
  var css = `
		#pgzp_menu a, #pgzp_menu a * {border: 0; text-decoration: none;}
		#pgzp_menu {position: fixed; top: 0px; right: 8px; padding: 0px 5px; background-color: #D3D3D3; color: black; z-index: 2147483647;}
		.pgzp_block {display: block; float: left; line-height: 32px;}
		.pgzp_button {display: block; width: 32px; height: 32px;}
		a.pgzp_button_prev_active {background: transparent url('${pgzp.media_path}prev.png') no-repeat scroll top left; }
		a:hover.pgzp_button_prev_active {background-image: url('${pgzp.media_path}prevr.png'); }
		a.pgzp_button_prev_inactive {background: transparent url('${pgzp.media_path}prevg.png') no-repeat scroll top left; }
		a.pgzp_button_next_active {background: transparent url('${pgzp.media_path}next.png') no-repeat scroll top left; }
		a:hover.pgzp_button_next_active {background-image: url('${pgzp.media_path}nextr.png'); }
		a.pgzp_button_next_inactive {background: transparent url('${pgzp.media_path}nextg.png') no-repeat scroll top left; }
		#pgzp_button_compat {padding-left: 6px;}
		.pgzp_button_compat_active {background: transparent url('${pgzp.media_path}compat.png') no-repeat scroll 4px 4px;}
		.pgzp_button_compat_inactive {background: transparent url('${pgzp.media_path}compatg.png') no-repeat scroll 4px 4px;}
		#pgzp_curr_page {font-size: 24px;}
		#pgzp_loaded_pages {font-size: 18px;}
	`
  var html = `
		<div id='pgzp_menu'>
			<a href='#' id='pgzp_button_prev' class='pgzp_block pgzp_button pgzp_button_prev_active' title='Previous - Cntrl Up or Cntrl <'></a>
			<a href='#' id='pgzp_button_next' class='pgzp_block pgzp_button pgzp_button_next_active' title='Next - Cntrl Down or Cntrl >'></a>
			<div class='pgzp_block' style='padding-left: 5px;'>
				<span id='pgzp_curr_page' title='Current Page'>1</span>
				--><span id='pgzp_loaded_pages' title='Pages Loaded'>/1</span>
			</div>
			<a href='#' id='pgzp_button_compat' class='pgzp_block pgzp_button pgzp_button_compat_inactive' title='Compatibility Mode - Slower, but less likely to encounter problems'></a>
			<a href='https://github.com/o9-9/pagezipper' target='_blank' title='PageZipper Home' class='pgzp_block pgzp_button' style='margin-left: -6px'>
				<img src='${pgzp.media_path}zipper.png' alt='PageZipper!' style='border-width: 0px' />
			</a>
		</div>
	`
  var cssElem = pgzp.doc.createElement('style')
  cssElem.setAttribute('type', 'text/css')
  if (cssElem.styleSheet) {
    cssElem.styleSheet.cssText = css
  } else {
    cssElem.appendChild(pgzp.doc.createTextNode(css))
  }
  pgzp.doc.getElementsByTagName('head')[0].appendChild(cssElem)
  var div = pgzp.doc.createElement('div')
  div.style['all'] = 'initial'
  div.innerHTML = pgzp.jq.trim(html)
  pgzp.doc.body.appendChild(div)
  pgzp.menuIncrementPagesLoaded()
  var assignLinkHandler = function (linkId, eventHandler) {
    var link = pgzp.doc.getElementById(linkId)
    pgzp.jq(link).bind('click', function (event) {
      eventHandler()
      event.preventDefault
        ? event.preventDefault()
        : (event.returnValue = false)
      return false
    })
  }
  assignLinkHandler('pgzp_button_prev', function () {
    pgzp.goToNext(-1)
  })
  assignLinkHandler('pgzp_button_next', function () {
    pgzp.goToNext(1)
  })
  assignLinkHandler('pgzp_button_compat', function () {
    pgzp.toggleCompatMode()
  })
}
PageZipper.prototype.removeMenu = function () {
  var menu = pgzp.doc.getElementById('pgzp_menu')
  if (menu) pgzp.doc.body.removeChild(menu)
}
PageZipper.prototype.menuIncrementPagesLoaded = function (numPages) {
  var loadedPages = pgzp.doc.getElementById('pgzp_loaded_pages')
  if (!loadedPages) return
  if (numPages) {
    loadedPages.textContent = '/' + numPages
    return
  }
  loadedPages.textContent = '/' + pgzp.pages.length
}
PageZipper.prototype.menuSetCurrPageNumber = function (currPage) {
  var currPageObj = pgzp.pages[currPage - 1]
  pgzp.doc.getElementById('pgzp_curr_page').textContent = currPage
  if (pgzp.displayMode == 'text') {
    pgzp.updateButtonState(currPage != 1, 'prev')
    pgzp.updateButtonState(currPage != pgzp.pages.length, 'next')
  } else {
    var top = pgzp.screen.getScrollTop()
    var displayPrev = pgzp.findPos(pgzp.pages[0].posterImgs[0]).y < top
    pgzp.updateButtonState(displayPrev, 'prev')
    var disableNext =
      currPage == pgzp.pages.length &&
      currPageObj.posterImgs &&
      pgzp.findPos(currPageObj.posterImgs[currPageObj.posterImgs.length - 1])
        .y <
        top + pgzp.poster_image_min_vmargin + 1
    pgzp.updateButtonState(!disableNext, 'next')
  }
}
PageZipper.prototype.updateButtonState = function (enable, buttonName) {
  var button = pgzp.doc.getElementById('pgzp_button_' + buttonName)
  var activeClass = 'pgzp_button_' + buttonName + '_active'
  var inactiveClass = 'pgzp_button_' + buttonName + '_inactive'
  if (enable) {
    pgzp.css.replaceClass(button, inactiveClass, activeClass)
  } else {
    pgzp.css.replaceClass(button, activeClass, inactiveClass)
  }
  if (buttonName == 'compat') {
    button.title = enable
      ? button.title.replace('disabled', 'enabled')
      : button.title.replace('enabled', 'disabled')
  }
}
PageZipper.prototype.keyDown = function (event) {
  switch (event.which) {
    case 40:
    case 190:
      if (pgzp.ctrl_key_pressed) {
        pgzp.goToNext(1)
        pgzp.noBubble(event)
      }
      break
    case 38:
    case 188:
      if (pgzp.ctrl_key_pressed) {
        pgzp.goToNext(-1)
        pgzp.noBubble(event)
      }
      break
    case 17:
    case 224:
      pgzp.ctrl_key_pressed = true
      break
  }
}
PageZipper.prototype.keyUp = function (event) {
  switch (event.which) {
    case 17:
    case 224:
      pgzp.ctrl_key_pressed = false
      break
  }
}
PageZipper.prototype.goToNext = function (inc) {
  var currPageIndex = pgzp.getViewableCurrentPage(pgzp.getCurrentPage())
  if (pgzp.displayMode == 'text') {
    pgzp.goToNextPage(inc, currPageIndex)
  } else {
    if (inc > 0) pgzp.goToNextPosterImage()
    else pgzp.goToPreviousPosterImage()
  }
}
PageZipper.prototype.goToNextPage = function (inc, currPageIndex) {
  var currPage, pos, amountToScroll, ps
  currPageIndex += inc
  if (currPageIndex in pgzp.pages) {
    currPage = pgzp.pages[currPageIndex].inPageElem
    amountToScroll = pgzp.findPos(currPage).y - pgzp.screen.getScrollTop()
    pgzp.win.scrollBy(0, amountToScroll)
  }
}
