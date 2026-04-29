javascript: (function () {
  if (window['pgzp']) {
    _pgzpToggleBookmarklet()
  } else {
    window._page_zipper_is_bookmarklet = true
    window._page_zipper = document.createElement('script')
    window._page_zipper.type = 'bookmarklet'
    window._page_zipper.src = 'https://raw.githubusercontent.com/o9-9/pagezipper/refs/heads/main/img/'
    document.getElementsByTagName('head')[0].appendChild(window._page_zipper)
  }
})()
