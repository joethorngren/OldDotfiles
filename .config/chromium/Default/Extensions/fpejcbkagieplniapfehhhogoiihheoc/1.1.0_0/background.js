var sites = {};
var serverHost = 'https://www.couponsumo.com/';
chrome.storage.local.get(['sites', 'expires'], function (data) {
  if (data.sites && data.expires > Date.now()) {
    sites = data.sites;
  } else {
    var r = new XMLHttpRequest();
    r.open("GET", serverHost + "extension/sites", true);
    r.onreadystatechange = function () {
      if (r.readyState != 4 || r.status != 200) return;
      var data = JSON.parse(r.responseText);
      var sitesArray = data.sites || [];
      for (var i=0; i < sitesArray.length; i++) {
        sites[sitesArray[i]] = 1;
      }
      chrome.storage.local.set({'sites': sites, 'expires': Date.now() + 60 * 60 * 24});
    };
    r.send();
  }
});

var activeIcons = {
  "19": "img/orange-19.png",
  "38": "img/orange-38.png"
};
var inactiveIcons = {
  "19": "img/grey-19.png",
  "38": "img/grey-38.png"
};
chrome.tabs.onActivated.addListener(function (tab) {
  tab && chrome.tabs.get(tab.tabId, function(tab) {
    updateInfo(tab);
  });
});
chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
  chrome.tabs.get(tabId, function(tab) {
    updateInfo(tab);
  });
});
chrome.tabs.onCreated.addListener(function (tab, info) {
  chrome.tabs.get(tab.id, function(tab) {
    updateInfo(tab);
  });
});
chrome.browserAction.onClicked.addListener(function(tab) {
  tab && chrome.tabs.sendMessage(tab.id, {
    click: true,
    host: host(tab.url),
    opts: getOpts(tab.url)
  });
});
chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.event == 'closePopup') {
    getOpts(sender.url).disabled = true;
  }
});
function updateInfo(tab) {
  if (tab.id && tab.url && tab.url.indexOf('http') === 0 && checkUrl(tab.url)) {
    activate(tab);
  } else {
    disable(tab);
  }
}
function activate(tab) {
  chrome.browserAction.setIcon({path:activeIcons, tabId:tab.id});
  chrome.tabs.sendMessage(tab.id, {
    init: true,
    host: host(tab.url),
    opts: getOpts(tab.url)
  });
}
function disable(tab) {
  chrome.browserAction.setIcon({path:inactiveIcons, tabId:tab.id});
}
function getOpts(url) {
  var key = checkUrl(url);
  if (!key) {
    return {};
  }
  if (sites[key] === 1) {
    sites[key] = {};
  }
  return sites[key];
}
function host(url) {
  return checkHost(getHost(url)) || getHost(url);
}
function checkUrl(url) {
  return checkHost(getHost(url));
}
function checkHost(url) {
  if (sites[url]) {
    return url;
  }
  var dot = url.indexOf('.');
  if (dot > -1) {
    return checkHost(url.substr(dot + 1));
  }
  return false;
}
function getHost(url) {
  var matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
  return matches && matches[1] || '';
}