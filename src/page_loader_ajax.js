function PageZipperAjax() {
	this.loadPage = function (url) {
		pgzp.jq.ajax({
			url: url,
			dataType: 'html',
			success: function (data) {
				var results = data.match(/<body.*?>([\w\W]*?)<\/body>/i);
				data = (results && results.length >= 2) ? results[1] : data;
				data = data.replace(/<script[\w\W]*?>[\w\W]*?<\/script>/ig, '')
					.replace(/<script[\w\W]*?\/>/ig, '')
					.replace(/<noscript>([\w\W]*?)<\/noscript>/ig, "$1")
					.replace(/<meta HTTP-EQUIV=["']?refresh["']?[\w\W]*?>/ig, '');
				pgzp.ajax.processPageAdd(url, data);
			}
		});
	};
	this.processPageAdd = function (url, nextPageData) {
		var docHeight = pgzp.jq(pgzp.doc).height();
		var nextPage = pgzp.ajax.buildPageFromData(url, nextPageData);
		pgzp.pages.push(nextPage);
		pgzp.url_list.push(nextPage.url);
		pgzp.ajax.copyPage(nextPage.elemContent);
		pgzp.ajax.removeAbsolutePositioning(nextPage.elemContent);
		pgzp.menuIncrementPagesLoaded();
		nextPage.nextLinkObj = pgzp.getNextLink(nextPage.elemContent);
		pgzp.is_loading_page = false;
		if (!pgzp.in_compat_mode) {
			var updatedDocHeight = pgzp.jq(pgzp.doc).height();
			if ((updatedDocHeight - 100) <= docHeight) {
				pgzp.toggleCompatMode();
			}
		}
		pgzp.mainBlock();
	};
	this.buildPageFromData = function (url, data) {
		var page = pgzp.doc.createElement("div");
		page.id = "pgzp_page" + pgzp.pages.length;
		page.style.clear = 'both';
		page.innerHTML = data;
		return pgzp.buildPage(url, page);
	};
	this.copyPage = function (body) {
		pgzp.doc.body.appendChild(body);
	};
	this.removeAbsolutePositioning = function (body) {
		pgzp.jq(pgzp.doc.body).children().each(function () {
			if (pgzp.jq(this).css("position") == "absolute") pgzp.jq(this).css("position", "static");
		});
	};
}