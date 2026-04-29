function PageZipper() {
	this.nextSynonyms = [
		{ syn: "next", weight: 100 },
		{ syn: "older", weight: 80 },
		{ syn: "previous", weight: 60 },
		{ syn: "forward", weight: 50 },
		{ syn: "continue", weight: 45 },
		{ syn: ">", weight: 40, humanReadableOnly: true },
		{ syn: ">>", weight: 30, humanReadableOnly: true },
		{ syn: "more", weight: 20 },
		{ syn: "page", weight: 10 },
		{ syn: "part", weight: 5 },
		{ syn: "-1", weight: 0, humanReadableOnly: true, pageBar: true }
	];
	this.minimumPageBuffer = 1;
	this.minimumPageBufferGallery = 4;
	this.poster_image_min_vmargin = 40;
	this.in_compat_mode = false;
	this.debug = false;
	this.is_running = false;
	this.is_loading_page = false;
	this.loader_type = "";
	this.ctrl_key_pressed = false;
	this.curr_next_synonym = null;
	this.onePosterPerPageMode = false;
	this.displayMode = "text";
	this.currDomain;
	this.url_list;
	this.media_path;
	this.jq = jQuery.noConflict(true);
}
PageZipper.prototype.loadPageZipper = function () {
	this.ajax = new PageZipperAjax();
	this.iframe = new PageZipperIframe();
	if (!pgzp.win['Node']) {
		pgzp.win.Node = {
			ELEMENT_NODE: 1,
			TEXT_NODE: 3
		};
	}
	pgzp.currDomain = pgzp.getDomain(pgzp.win.location.href);
	pgzp.url_list = [pgzp.win.location.href];
	pgzp.addExistingPage(pgzp.win.location.href, pgzp.doc.body);
	pgzp.displayMode = pgzp.calculateDisplayMode(pgzp.pages[0]);
	if (pgzp.displayMode == 'image' && pgzp.pages[0].posterImgs.length == 1) {
		pgzp.onePosterPerPageMode = true;
		pgzp.minimumPageBuffer = pgzp.minimumPageBufferGallery;
	}
	if (!pgzp.in_compat_mode) {
		var currDoc = pgzp.doc;
		currDoc.write = currDoc.writeln = currDoc.open = currDoc.close = function (str) { return; };
	}
};
PageZipper.prototype.runPageZipper = function () {
	pgzp.jq(pgzp.doc).bind("keydown", this.keyDown);
	pgzp.jq(pgzp.doc).bind("keyup", this.keyUp);
	pgzp.addMenu();
	pgzp.updateButtonState(pgzp.in_compat_mode, 'compat');
	this.is_running = pgzp.win.setInterval(pgzp.mainBlock, 250);
};
PageZipper.prototype.stopPageZipper = function () {
	if (this.is_running) {
		pgzp.win.clearInterval(this.is_running);
		this.is_running = null;
		pgzp.removeMenu();
		pgzp.jq(pgzp.doc).unbind("keydown", this.keyDown);
		pgzp.jq(pgzp.doc).unbind("keyup", this.keyUp);
		if (pgzp.in_compat_mode) {
			for (var i = 1; i < pgzp.pages.length; i++) {
				pgzp.jq(pgzp.pages[i].ifrDoc).unbind("keydown", this.keyDown);
				pgzp.jq(pgzp.pages[i].ifrDoc).unbind("keyup", this.keyUp);
			}
		}
	}
};
PageZipper.prototype.mainBlock = function () {
	if (!pgzp) return;
	var currPageIndex = pgzp.getCurrentPage();
	var currViewablePage = pgzp.getViewableCurrentPage(currPageIndex);
	pgzp.menuSetCurrPageNumber(currViewablePage + 1);
	pgzp.setPageVisibility(currViewablePage);
	if (!pgzp.is_loading_page &&
		pgzp.pages[pgzp.pages.length - 1]["nextLinkObj"] &&
		((pgzp.pages.length - currPageIndex - 1) < pgzp.minimumPageBuffer)
	) {
		pgzp.is_loading_page = true;
		pgzp.loadPage(pgzp.pages[pgzp.pages.length - 1].nextLinkObj.url);
	}
};
PageZipper.prototype.getCurrentPage = function () {
	var i, currPage, currPageTop, currPageBottom;
	var currViewBottom = pgzp.screen.getScrollTop() + pgzp.screen.getViewportHeight();
	for (i = 0; i < pgzp.pages.length; i++) {
		currPage = pgzp.pages[i].inPageElem;
		currPageTop = pgzp.findPos(currPage).y;
		if (i == (pgzp.pages.length - 1)) {
			currPageBottom = pgzp.screen.getDocumentHeight();
			if (currPageBottom < currViewBottom) currPageBottom = currViewBottom;
		} else {
			currPageBottom = pgzp.findPos(pgzp.pages[(i + 1)].inPageElem).y;
		}
		if (currPageTop <= currViewBottom && currViewBottom <= currPageBottom) {
			return i;
		}
	}
	return pgzp.pages.length;
};
PageZipper.prototype.getViewableCurrentPage = function (currPage) {
	var currPageObj = pgzp.pages[currPage];
	if ((pgzp.findPos(currPageObj.inPageElem).y - Math.abs(pgzp.screen.getScrollTop())) > (pgzp.screen.getViewportHeight() / 2)) {
		return currPage - 1;
	}
	return currPage;
};
PageZipper.prototype.calculateDisplayMode = function (currPage) {
	var textArea = 0, imgArea = 0;
	var i = 0, txtP, imgs = {};
	txtP = pgzp.doc.createElement("div");
	txtP.style.clear = "both";
	txtP.appendChild(pgzp.doc.createTextNode(pgzp.getAllTextOnPage(currPage.elemContent)));
	pgzp.doc.body.appendChild(txtP);
	textArea = txtP.offsetWidth * txtP.offsetHeight;
	pgzp.doc.body.removeChild(txtP);
	if (currPage.posterImgs == null) currPage.posterImgs = pgzp.getPosterImagesOnPage(currPage.elemContent);
	for (i = 0; i < currPage.posterImgs.length; i++) {
		imgs[currPage.posterImgs[i].src] = currPage.posterImgs[i];
	}
	for (var imgUrl in imgs) {
		var img = imgs[imgUrl];
		imgArea += img.offsetHeight * img.offsetWidth;
	}
	return (textArea >= imgArea) ? "text" : "image";
};
PageZipper.prototype.getAllTextOnPage = function (pageHtml) {
	var str = "";
	pgzp.depthFirstRecursion(pageHtml, function (curr) {
		if (curr.nodeType == Node.TEXT_NODE && curr.parentNode.nodeType == Node.ELEMENT_NODE && typeof (curr.parentNode.tagName) == "string") {
			try {
				var tagName = curr.parentNode.tagName.toLowerCase();
				if (tagName == "div" || tagName == "span" || tagName == "p" || tagName == "td")
					str += curr.nodeValue + "\n";
			} catch (ex) {
				console.dir(curr);
			}
		}
	});
	return str;
};
PageZipper.prototype.setPageVisibility = function (currPageIndex) {
	var currPage = pgzp.pages[currPageIndex];
	if (currPage.elemContent.style.visibility == "hidden") {
		currPage.elemContent.style.visibility = "visible";
	}
	if (currPageIndex > 5) {
		var oldPage = pgzp.pages[currPageIndex - 5];
		if (oldPage.elemContent.style.visibility != "hidden") oldPage.elemContent.style.visibility = "hidden";
	}
};
function _pgzpToggleBookmarklet() {
	if (pgzp.is_running) {
		pgzp.stopPageZipper();
	} else {
		pgzp.runPageZipper();
	}
}