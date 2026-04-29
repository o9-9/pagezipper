function saveChangeToList(siteUrl, callback, saveFlag) {
  var domain = getDomain(siteUrl)
  if (saveFlag === undefined) saveFlag = 'domain'
  if (['deleted', 'domain', 'nohome'].indexOf(saveFlag) < 0)
    throw 'Invalid save flag'
  var toGet = {}
  toGet['whitelist'] = {}
  chrome.storage.sync.get(toGet, function (items) {
    let currList = items['whitelist']
    currList[domain] = saveFlag
    var toSet = {}
    toSet['whitelist'] = currList
    chrome.storage.sync.set(toSet, function () {
      if (callback) callback()
    })
  })
}
function getFromList(url, callback) {
  var domain = getDomain(url),
    toGet = {}
  toGet['whitelist'] = {}
  chrome.storage.sync.get(toGet, function (items) {
    callback(items['whitelist'][domain])
  })
}
function getDomain(url) {
  if (url.indexOf('http') !== 0) {
    url = 'https://' + url
  }
  var a = document.createElement('a')
  a.href = url
  var domain = a.hostname
  if (domain.split('.').length > 2) {
    let splits = domain.split('.')
    domain = splits[splits.length - 2] + '.' + splits[splits.length - 1]
  }
  return domain
}
function isActiveDomain(domainValue) {
  return domainValue == 'domain' || domainValue == 'nohome'
}
function is_homepage(url) {
  var a = document.createElement('a')
  a.href = url
  return a.pathname == '/'
}
