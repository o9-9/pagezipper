PageZipper.prototype.Trial = class {
	constructor(doScore, weight, noNormailization=false) {
		this.doScore = doScore;
		this.weight = weight;
		this.noNormailization = noNormailization;
	}
}
PageZipper.prototype.trials = {
	'contains_next_syn': new PageZipper.prototype.Trial(
		function(nextLink) {
			var i, currWord, score = 0;
			for (i=0; i<pgzp.nextSynonyms.length; i++) {
				currWord = pgzp.nextSynonyms[i];
				if (nextLink.text.toLowerCase().indexOf(currWord.syn) >= 0) {
					if (currWord['humanReadableOnly']) {
						if (
							!nextLink.isHumanReadableText ||
							nextLink.text.toLowerCase().indexOf("comment") >= 0
						) continue;
					}
					if (currWord.syn != "next" && !pgzp.isStandaloneWord(currWord.syn, nextLink.text, nextLink.isHumanReadableText)) continue;
					if (currWord['pageBar'] && !nextLink.isPageBar) continue;
					pgzp.log("adding syn: " + currWord.syn + " to " + nextLink.url);
					if (currWord.weight >= score) {
						score = currWord.weight;
						nextLink.syn = currWord.syn;
					}
				} else if (!currWord['humanReadableOnly'] && nextLink.url.toLowerCase().indexOf(currWord.syn) >= 0) {
					if (!pgzp.isStandaloneWord(currWord.syn, nextLink.url, false)) continue;
					if (currWord.weight >= score) {
						score = currWord.weight;
						nextLink.syn = currWord.syn;
					}
				}
			}
			return score;
		}, 100, true),
	'url_similarity': new PageZipper.prototype.Trial(
		function(nextLink) {
			var lastUrl = pgzp.pages[ pgzp.pages.length-1 ].url;
			var currUrl = nextLink.url;
			var l = new Levenshtein(lastUrl, currUrl);
			var lDistance = l.distance;
			return lastUrl.length - lDistance;
		}, 70, true),
	'duplicate_text': new PageZipper.prototype.Trial(
		function(nextLink) {
			var score = 100;
			if (pgzp.linkTextIndex[nextLink.text] && pgzp.linkTextIndex[nextLink.text].length > 0) {
				score = score - (pgzp.linkTextIndex[nextLink.text].length - 1) * 20;
			}
			return score;
		}, 60),
	'url_ends_in_number': new PageZipper.prototype.Trial(
		function(nextLink) {
			var results = nextLink.url.match(/^.*?(\d+)(\/+|\.\w+)?$/);
			if (results && (parseInt(results[1], 10) < 99))
				return 100;
			else
				return 0;
		}, 20),
	'begins_or_ends_with_next_syn': new PageZipper.prototype.Trial(
		function(nextLink) {
			if (nextLink.syn && (pgzp.startsWith(nextLink.syn, nextLink.text.toLowerCase()) || pgzp.endsWith(nextLink.syn, nextLink.text.toLowerCase())))
				return 100;
			else
				return 0;
		}, 20),
	'text_size': new PageZipper.prototype.Trial(
		function(nextLink) {
			return Math.floor( (nextLink.link.offsetWidth * nextLink.link.offsetHeight) / nextLink.text.length );
		}, 10),
	'chars_in_text': new PageZipper.prototype.Trial(
		function(nextLink) {
			return nextLink.text.length * -1;
		}, 10)
};