function _pgzpInitBookmarklet() {
  window.pgzp = new PageZipper();
  pgzp.win = window;
  pgzp.doc = window.document;
  pgzp.loader_type = "bookmarklet";
  pgzp.media_path = "https://raw.githubusercontent.com/o9-9/pagezipper/refs/heads/main/img/";
  pgzp.loadPageZipper();
}
_pgzpInitBookmarklet();
_pgzpToggleBookmarklet();
