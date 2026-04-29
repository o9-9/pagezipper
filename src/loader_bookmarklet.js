function _pgzpInitBookmarklet() {
  window.pgzp = new PageZipper();
  pgzp.win = window;
  pgzp.doc = window.document;
  pgzp.loader_type = "bookmarklet";
  pgzp.media_path = "https://o9ll.com/static/pagezipper/ui/";
  pgzp.loadPageZipper();
}
_pgzpInitBookmarklet();
_pgzpToggleBookmarklet();
