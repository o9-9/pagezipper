function PageZipperIframe() {
	this.loadPage = function (url) {
		var ifrspan = pgzp.doc.createElement('span');
		var onloadstr = pgzp.loader_type == "ffextension" ? "" : "onload=\"pgzp.iframe.processPageAddComplete('pgzp_page" + pgzp.pages.length + "')\"";
		ifrspan.innerHTML = "<iframe id='pgzp_page" + pgzp.pages.length + "' class='pgzp_page_added' " + onloadstr + " style='clear: both; display: block; border-width: 0; overflow: hidden;' scroll='no' frameBorder='0'></iframe>";
		var ifr = ifrspan.childNodes[0];
		pgzp.jq(pgzp.doc).find("#pgzp_iframe_placeholder").append(ifr);
		ifr.src = url;
		pgzp.runOnIframeLoad(ifr, pgzp.iframe.processPageAdd);
		ifr.style.width = (pgzp.doc.body.offsetWidth - 5) + 'px';
	};
	this.processPageAdd = function () {
		var iframe = pgzp.jq(pgzp.doc).find(".pgzp_page_added").last()[0];
		var nextPage = pgzp.buildPage(iframe.src, iframe);
		pgzp.pages.push(nextPage);
		pgzp.url_list.push(nextPage.url);
		pgzp.iframe.setIFrameHeight(nextPage);
		pgzp.menuIncrementPagesLoaded();
		pgzp.jq(nextPage.ifrDoc).bind("keydown", this.keyDown);
		pgzp.jq(nextPage.ifrDoc).bind("keyup", this.keyUp);
		nextPage.nextLinkObj = pgzp.getNextLink(nextPage.elemContent);
		pgzp.is_loading_page = false;
	};
	this.processPageAddComplete = function (ifrId) {
		var page = pgzp.iframe.getPageById(ifrId);
		if (page) pgzp.iframe.setIFrameHeight(page);
	};
	this.setIFrameHeight = function (page) {
		page.inPageElem.style.height = pgzp.getDocumentHeight(page.ifrDoc) + 'px';
	};
	this.setAbsolutePositioning = function (page) {
		var origDocH, ifr = page.inPageElem;
		var iframes = pgzp.jq(pgzp.doc).find(".pgzp_page_added");
		if (iframes.length >= 2) {
			origDocH = iframes[iframes.length - 2].pgzpDocHeightAfterAdd;
		} else {
			origDocH = pgzp.doc.body.pgzpDocHeightAfterAdd;
		}
		var pos = pgzp.findPos(ifr);
		if (pos.y < Math.max(origDocH - 50, 10)) {
			ifr.style.position = "absolute";
			ifr.style.top = origDocH + "px";
			ifr.style.left = "0px";
		}
	};
	this.getPageById = function (id) {
		for (var i = 0; i < pgzp.pages.length; i++) {
			if (pgzp.pages[i].ifrId && pgzp.pages[i].ifrId == id) {
				return pgzp.pages[i];
			}
		}
		return null;
	};
}
PageZipper.prototype.runOnIframeLoad = function (iframeElem, callback) {
	pgzp._ril_ifr = iframeElem;
	pgzp._ril_callback = callback;
	pgzp._ril_int = pgzp.win.setInterval(pgzp._runOnIframeLoad2, 50);
};
PageZipper.prototype._runOnIframeLoad2 = function () {
	var ifrDoc = pgzp._ril_ifr.contentWindow.document, validReadyStates = /loaded|interactive|complete/;
	if (pgzp.jq.browser.msie) {
		validReadyStates = /loaded|complete/;
	}
	if (
		ifrDoc.body &&
		ifrDoc.body.childNodes.length > 0 &&
		validReadyStates.test(ifrDoc.readyState)
	) {
		pgzp.win.clearInterval(pgzp._ril_int);
		pgzp._ril_callback();
	}
};