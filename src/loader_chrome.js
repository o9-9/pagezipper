function _pgzpInitExtension() {
  window.pgzp = new PageZipper()
  pgzp.win = window
  pgzp.doc = window.document
  pgzp.loader_type = 'chromeext'
  pgzp.media_path = chrome.runtime.getURL('icons/')
  pgzp.loadPageZipper()
}
