var loaded_tabs = {}
var browserStorage = chrome.storage.sync

function getFromList(url, callback) {
  var domain = getDomain(url)
  var toGet = { whitelist: {} }
  browserStorage.get(toGet, function (items) {
    callback(items.whitelist[domain])
  })
}

function getDomain(url) {
  if (url.indexOf('http') !== 0) url = 'https://' + url
  var a = document.createElement('a')
  a.href = url
  var domain = a.hostname
  if (domain.split('.').length > 2) {
    var splits = domain.split('.')
    domain = splits[splits.length - 2] + '.' + splits[splits.length - 1]
  }
  return domain
}

function is_homepage(url) {
  var a = document.createElement('a')
  a.href = url
  return a.pathname === '/' || a.pathname === ''
}

function _isActiveAutorun(
  url,
  currTabId,
  callbackIsAutorun,
  callbackIsNotAutorun
) {
  getFromList(url, function (domainValue) {
    if (
      domainValue === 'domain' ||
      (domainValue === 'nohome' && !is_homepage(url))
    ) {
      if (callbackIsAutorun) callbackIsAutorun(currTabId)
    } else {
      if (callbackIsNotAutorun) callbackIsNotAutorun(currTabId)
    }
  })
}

function loadAndStartPgzp(tabId) {
  chrome.scripting.executeScript(
    { target: { tabId: tabId }, files: ['pagezipper.js'] },
    function () {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: function () {
          _pgzpInitExtension()
          _pgzpToggleBookmarklet()
        }
      })
    }
  )
  loaded_tabs[tabId] = 'on'
  chrome.action.setIcon({ tabId: tabId, path: 'icons/on.png' })
}

function runPgzp(tab) {
  var icon_src = ''
  if (!loaded_tabs[tab.id]) {
    loadAndStartPgzp(tab.id)
    icon_src = 'icons/on.png'
  } else if (loaded_tabs[tab.id] === 'on') {
    loaded_tabs[tab.id] = 'off'
    icon_src = 'icons/19.png'
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: function () {
        _pgzpToggleBookmarklet()
      }
    })
  } else if (loaded_tabs[tab.id] === 'off') {
    loaded_tabs[tab.id] = 'on'
    icon_src = 'icons/on.png'
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: function () {
        _pgzpToggleBookmarklet()
      }
    })
  }
  chrome.action.setIcon({ tabId: tab.id, path: icon_src })
}

function updateActiveTab(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && loaded_tabs[tabId]) {
    _isActiveAutorun(tab.url, tabId, null, function () {
      delete loaded_tabs[tabId]
      chrome.action.setIcon({ tabId: tabId, path: 'icons/19.png' })
    })
  }
}

function autoRun(details) {
  if (details.frameId !== 0) return
  _isActiveAutorun(details.url, details.tabId, loadAndStartPgzp)
}

chrome.webNavigation.onDOMContentLoaded.addListener(autoRun)
chrome.action.onClicked.addListener(runPgzp)
chrome.tabs.onUpdated.addListener(updateActiveTab)
