PageZipper.prototype.getNextLink = function(body) {
	var allNextLinks = pgzp.getAllScoredLinks(body);
	if (allNextLinks.length <= 0) return null;
	var highestLink = pgzp.getHighestTotalScore(allNextLinks);
	if (pgzp.pages.length > 1 &&
		!pgzp.pages[0].nextLinkObj.isSynNumber() && !highestLink.isSynNumber() &&
		pgzp.pages[0].nextLinkObj.syn != highestLink.syn)
		return null;
	return highestLink;
};
PageZipper.prototype.getAllScoredLinks = function(body) {
	var allNextLinks = pgzp.getAllNextLinks(body);
	var pageBarInfo = pgzp.getCurrentPageNumberFromPageBar(allNextLinks);
	if (pageBarInfo[1]) {
		pgzp.log("looking for page #: " + pageBarInfo[1].text + " w/confidence: " + pageBarInfo[2]);
		pgzp.nextSynonyms[pgzp.nextSynonyms.length-1].syn = pageBarInfo[1].text;
		pgzp.nextSynonyms[pgzp.nextSynonyms.length-1].weight = pageBarInfo[2];
	}
	pgzp.linkTextIndex = pgzp.indexDuplicateLinks(allNextLinks);
	pgzp.filter(allNextLinks, function(link) {return link.alreadyLoaded;});
	pgzp.scoreLinks(allNextLinks);
	pgzp.normalizeLinks(allNextLinks);
	return allNextLinks;
};
PageZipper.prototype.scoreLinks = function(allNextLinks) {
	for (var trial in pgzp.trials) {
		if (pgzp.trials.hasOwnProperty(trial)) {
			for (var i=0; i<allNextLinks.length; i++) {
				allNextLinks[i].addScore(trial, pgzp.trials[trial].doScore(allNextLinks[i]));
				if (trial == 'contains_next_syn' && allNextLinks[i].getScore('contains_next_syn') <= 0) {
					allNextLinks.splice(i, 1);
					i--;
				}
			}
		}
	}
};
PageZipper.prototype.normalizeLinks = function(allLinks) {
	for (var trial in pgzp.trials) {
		if (pgzp.trials.hasOwnProperty(trial) && !pgzp.trials[trial].noNormailization) {
			pgzp.normalizeTrialSet(trial, allLinks);
		}
	}
};
PageZipper.prototype.normalizeTrialSet = function(trialName, allLinks) {
	var highest, lowest = 0;
	var i, score, nScore;
	for (i=0; i<allLinks.length; i++) {
		score = allLinks[i].getScore(trialName);
		if (!highest || score > highest) highest = score;
		if (!lowest || score < lowest) lowest = score;
	}
	var curve = (highest == lowest) ? 0 : (100 / (highest - lowest));
	for (i=0; i<allLinks.length; i++) {
		score = allLinks[i].getScore(trialName);
		nScore = Math.floor((score - lowest) * curve);
		allLinks[i].addScore(trialName, nScore, true);
	}
};
PageZipper.prototype.getHighestTotalScore = function(allNextLinks) {
	var highestScoringLink = null;
	for (var i=0; i<allNextLinks.length; i++) {
		var score = allNextLinks[i].calculateTotalScore();
		if (!highestScoringLink || score >= highestScoringLink.finalScore) {
			highestScoringLink = allNextLinks[i];
		}
	}
	if (pgzp.debug) {
		var debugMsg = 'Final Score ' + allNextLinks.length;
		allNextLinks.sort(function (a, b) {
							return b.finalScore - a.finalScore;
						});
		for (i=0; i<allNextLinks.length; i++) {
			debugMsg += "\n" + allNextLinks[i].finalScore + ": " + allNextLinks[i].text + ": " + allNextLinks[i].url;
		}
		pgzp.log(debugMsg);
	}
	return highestScoringLink;
};
PageZipper.prototype.getAllNextLinks = function(body) {
	var allNextLinks = [];
	var links = body.getElementsByTagName("a");
	var pageUrl = pgzp.getUrlWOutAnchors( pgzp.pages[ pgzp.pages.length-1 ].url );
	for (var i=0; i<links.length; i++) {
		if (
			links[i].href &&
			pgzp.getDomain(links[i].href) == pgzp.currDomain &&
			(links[i].href.indexOf("#") < 0 || pageUrl != pgzp.getUrlWOutAnchors(links[i].href))
			) {
			pgzp.addLinkComponents(links[i], allNextLinks, pgzp.contains(pgzp.url_list, links[i].href));
		}
	}
	return allNextLinks;
};
PageZipper.prototype.addLinkComponents = function(link, allNextLinks, alreadyLoaded) {
	var NextLink = pgzp.NextLink;
	var search = function(rootNode) {
		for (var i=0; i<rootNode.childNodes.length; i++) {
			var curr = rootNode.childNodes[i];
			if (curr.nodeType == Node.TEXT_NODE && curr.nodeValue && curr.nodeValue.trim().length) {
				var nl = new NextLink(curr.nodeValue, link, alreadyLoaded);
				nl.isVisibleText = true;
				allNextLinks.push(nl);
			} else if (curr.nodeType == Node.ELEMENT_NODE && curr.tagName.toLowerCase() == "img") {
				if (curr.title) allNextLinks.push(new NextLink(curr.title, link, alreadyLoaded));
				if (curr.alt) allNextLinks.push(new NextLink(curr.alt, link, alreadyLoaded));
				if (curr.src) allNextLinks.push(new NextLink(curr.src, link, alreadyLoaded, false));
			} else {
				search(curr);
			}
		}
		if (rootNode.title) allNextLinks.push(new NextLink(rootNode.title, link));
		if (rootNode.alt) allNextLinks.push(new NextLink(rootNode.alt, link));
	};
	search(link);
};
PageZipper.prototype.getCurrentPageNumberFromPageBar = function(allNextLinks) {
	var allSequences = [], i = 0, currSeq = [], currNextLink, pageBar, pageBarScore = 0, pageNum, tmpPageBarScore;
	var currPageUrl = pgzp.pages[ pgzp.pages.length-1 ].url;
	var nextLinkInPagebar = function(index, pageBar) {
			return (index < pageBar.length - 1) ? pageBar[index + 1] : null;
	};
	var pushCurrSeq = function() {
		if (currSeq.length > 0) {
			allSequences.push(currSeq);
			currSeq = [];
		}
	};
	for (i=0; i<allNextLinks.length; i++) {
		currNextLink = allNextLinks[i];
		if (!currNextLink.isVisibleText) continue;
		if (!pgzp.isPageBarNumber(currNextLink.text)) {
			pushCurrSeq();
			continue;
		}
		pageNum = parseInt(currNextLink.text, 10);
		if (pageNum < 0 || pageNum > 1000) {
			pushCurrSeq();
			continue;
		}
		if (currSeq.length > 0 && pageNum <= currSeq[ currSeq.length -1 ].pageNum) {
			pushCurrSeq();
			continue;
		}
		currNextLink.pageNum = pageNum;
		currSeq.push(currNextLink);
	}
	if (currSeq.length > 0) allSequences.push(currSeq);
	for (i=0; i<allSequences.length; i++) {
		tmpPageBarScore = pgzp.__scorePageBar(allSequences[i]);
		if (tmpPageBarScore >= pageBarScore) {
			pageBarScore = tmpPageBarScore;
			pageBar = allSequences[i];
		}
	}
	if (!pageBar) return [null, null, 0];
	pageBar.sort(	function(a,b){
						return a.pageNum - b.pageNum;
					});
	for (i=0; i<pageBar.length; i++) pageBar[i].isPageBar = true;
	for (i=0; i<pageBar.length; i++) {
		if (pageBar[i].url == currPageUrl) {
			return [pageBar[i], nextLinkInPagebar(i, pageBar), 120];
		}
	}
	if (pageBar[0].pageNum == 2) {
		return [null, pageBar[0], pgzp.pages.length == 1 ? 80 : 30];
	}
	if (pageBar.length >= 2) {
		var currPageNum, prevPageNum = pageBar[0].pageNum;
		for (i=1; i<pageBar.length; i++) {
			currPageNum = pageBar[i].pageNum;
			if (Math.abs(currPageNum - prevPageNum) == 2) {
				if (!pgzp.contains(pgzp.url_list, pageBar[i].url)) {
					return [pageBar[i - 1], nextLinkInPagebar(i - 1, pageBar), 120];
				}
			}
			prevPageNum = currPageNum;
		}
	}
	return [pageBar[pageBar.length-1], null, 30];
};
PageZipper.prototype.__scorePageBar = function(pageBar) {
	var similarityScore = pgzp.trials['url_similarity'].doScore(pageBar[0]);
	var totalScore = pageBar.length + (similarityScore / 20);
	return totalScore;
};
PageZipper.prototype.indexDuplicateLinks = function(allNextLinks) {
	var textIndex = {};
	var currLink;
	for (var i=0; i<allNextLinks.length; i++) {
		currLink = allNextLinks[i];
		if (textIndex[currLink.text]) {
			if (!pgzp.contains(textIndex[currLink.text], currLink.url)) {
				textIndex[currLink.text].push(currLink.url);
			}
		} else {
			textIndex[currLink.text] = [currLink.url];
		}
	}
	return textIndex;
};