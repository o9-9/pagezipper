PageZipper.prototype.buildPage = function (url, elemContent) {
	var page = {
		'url': url,
		'elemContent': elemContent,
		'nextLinkObj': null,
		'posterImgs': null,
		'inPageElem': elemContent
	};
	if (elemContent.tagName.toLowerCase() == "iframe") {
		page.ifrWin = elemContent.contentWindow;
		page.ifrDoc = elemContent.contentWindow.document;
		page.elemContent = page.ifrDoc.body;
		page.ifrDoc.pgzp_iframe_id = elemContent.id;
		page.ifrId = elemContent.id;
	}
	return page;
};
PageZipper.prototype.loadPage = function (url) {
	pgzp.in_compat_mode ? pgzp.iframe.loadPage(url) : pgzp.ajax.loadPage(url);
};
PageZipper.prototype.addExistingPage = function (url, body) {
	var nextPage = pgzp.buildPage(url, body);
	if (pgzp.in_compat_mode) {
		pgzp.addIframePlaceholder();
	} else {
		pgzp.ajax.removeAbsolutePositioning(nextPage.elemContent);
	}
	pgzp.pages.push(nextPage);
	nextPage.posterImgs = pgzp.getPosterImagesOnPage(nextPage.elemContent);
	nextPage.nextLinkObj = pgzp.getNextLink(nextPage.elemContent);
	return nextPage;
};
PageZipper.prototype.addIframePlaceholder = function () {
	var placeholder = pgzp.jq("<div/>")
		.attr('id', 'pgzp_iframe_placeholder')
		.css({
			position: 'absolute',
			top: pgzp.jq(pgzp.doc).height() + 'px',
			left: '0px'
		});
	pgzp.jq(pgzp.doc.body).append(placeholder);
};