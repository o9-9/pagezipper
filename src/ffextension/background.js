var browserStorage = chrome.storage.local;
function loadAndStartPgzp(tabId) {
	chrome.tabs.executeScript(tabId, {'file': 'jquery.js'}, function () {
		chrome.tabs.executeScript(tabId, {'file': 'pagezipper.js'}, function () {
				chrome.tabs.executeScript(tabId, {'code': '_pgzpInitExtension();_pgzpToggleBookmarklet();'});
		});
	});
	loaded_tabs[tabId] = "on";
	var icon_src = "extension/icons/19.png";
	chrome.browserAction.setIcon({tabId: tabId, path: chrome.extension.getURL(icon_src)});
}