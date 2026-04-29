PageZipper.prototype.toggleCompatMode = function() {
	pgzp.is_loading_page = true;
	pgzp.win.scrollTo(0, 0);
	pgzp.menuIncrementPagesLoaded(1);
	while (pgzp.pages.length > 1) {
		var currPage = pgzp.pages.pop();
		pgzp.jq( currPage.elemContent ).remove();
		pgzp.url_list.pop();
	}
	pgzp.in_compat_mode = !pgzp.in_compat_mode;
	if (pgzp.jq(pgzp.doc).find("#pgzp_iframe_placeholder").length == 0) {
		pgzp.addIframePlaceholder();
	}
	pgzp.updateButtonState(pgzp.in_compat_mode, 'compat');
	pgzp.is_loading_page = false;
}
