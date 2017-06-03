/*
Copyright (c) 2009 - 2017, Evan Jehu
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the author nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL EVAN JEHU BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * Utility Objects
 */
function DelayedFunction(f, timeout) {

  var complete = false;

  var timeoutRef = setTimeout(function() {
    _invoke();
  }.bind(this), timeout);

  // private, see http://javascript.crockford.com/private.html
  function _invoke() {
    complete = true;
    f();
  }

  this.call = function() {
    if (!complete) {
      _invoke();
    }
  };

  this.cancel = function() {
    complete = true;
    clearTimeout(timeoutRef);
  };
}

function ShortcutKey(properties) {
  this.ctrl = properties.ctrl || false;
  this.shift = properties.shift || false;
  this.alt = properties.alt || false;
  this.meta = properties.meta || false;
  this.key = properties.key || '';
}
ShortcutKey.prototype.pattern = function() {
  return (this.alt ? "alt_" : "")
      + (this.meta ? "command_" : "")
      + (this.ctrl ? "ctrl_" : "")
      + (this.shift ? "shift_" : "")
      + (this.key);
};

/**
 * arrays to hold the current order of the tabs, closed tabs and bookmarks
 */
var tabs = [];
var closedTabs = [];
var bookmarks = [];

/**
 * use a DelayedFunction so that it can be canceled if another tab is selected before the timer
 * has triggered or called if the user loads the popup before the timer fires
 */
var tabOrderUpdateFunction = null;

/**
 * allow the popup window to trigger a tab order update that skips the timer delay,
 * see switchTabsWithoutDelay(...)
 */
var skipTabOrderUpdateTimer = null;

/**
 * message port opened by the popup window to allow shortcut key messages, will be null
 * if the popup is not currently displayed
 */
var popupMessagePort = null;

/**
 * base color for the badge text
 */
var badgeColor = {color:[32, 7, 114, 255]};

/**
 * badge text color while the tab order update timer is active
 */
var tabTimerBadgeColor = {color:[255, 106, 0, 255]};

var debug = loadDebug();

var re = /^https?:\/\/.*/;
function isWebUrl(url) {
  return re.exec(url);
}

/**
 * Simple log wrapper to centralise logging for all of the code, called from popup.js as bg.log(....)
 */
function log() {
  if(debug) console.log.apply(console, Array.prototype.slice.call(arguments))
}

function loadDebug() {
  var s = localStorage["debug_?"];
  return s ? s === 'true' : false;
}

/**
 * set the debug switch, this can be called from the background page JavaScript console
 * to enable/disable logging, this setting is saved to local storage.  To
 * enable logging temporarily type debug=true in the background page JS console.
 */
function setDebug(val) {
  debug = val;
  localStorage["debug_?"] = val;
}

function getClosedTabsSize() {
  var s = localStorage["closed_tabs_size"];
  return s ? parseInt(s, 10) || 0 : 10;
}

function setClosedTabsSize(val) {
  localStorage["closed_tabs_size"] = val;
  resizeClosedTabs();
}

function pageupPagedownSkipSize() {
  return localStorage["pageup_pagedown_skip_size"] || 5;
}

function setPageupPagedownSkipSize(val) {
  localStorage["pageup_pagedown_skip_size"] = val;
}

function showDevTools() {
  var s = localStorage["include_dev_tools"];
  return s ? s === 'true' : false;
}

function setShowDevTools(val) {
  localStorage["include_dev_tools"] = val;
}

function autoSearchBookmarks() {
  var s = localStorage["auto_search_bookmarks"];
  return s ? s === 'true' : true;
}

function setAutoSearchBookmarks(val) {
  localStorage["auto_search_bookmarks"] = val;
}

function showUrls() {
  var s = localStorage["show_urls"];
  return s ? s === 'true' : true;
}

function setShowUrls(val) {
  localStorage["show_urls"] = val;
}

function searchType() {
  var searchType = localStorage["search_type"];
  var oldFuzzySetting = "fuzzy";
  switch (localStorage["search_fuzzy"]) {
    case "true":
      oldFuzzySetting = "fuse";
      break;
    case "false":
      oldFuzzySetting = "regex";
      break;
  }
  return searchType ? searchType : oldFuzzySetting;
}

function setSearchType(val) {
  localStorage["search_type"] = val;
}

function searchUrls() {
  var s = localStorage["search_urls"];
  return s ? s === 'true' : false;
}

function setSearchUrls(val) {
  localStorage["search_urls"] = val;
}

function showTabCount() {
  var s = localStorage["show_tab_count"];
  return s ? s === 'true' : true;
}

function setShowTabCount(val) {
  localStorage["show_tab_count"] = val;
  updateBadgeText(tabs.length);
}

function showTooltips() {
  var s = localStorage["show_tooltips"];
  return s ? s === 'true' : true;
}

function setShowTooltips(val) {
  localStorage["show_tooltips"] = val;
}

function showFavicons() {
  var s = localStorage["show_favicons"];
  return s ? s === 'true' : true;
}

function moveOnSwitch() {
  var s = localStorage["move_on_switch"];
  return s ? s === 'true' : false;
}

function setMoveOnSwitch(val) {
  localStorage["move_on_switch"] = val;
}

function setShowFavicons(val) {
  localStorage["show_favicons"] = val;
}

function getSearchString() {
  return localStorage["search_string"] || 'http://www.google.com/search?q=%s';
}

function setSearchString(val) {
  localStorage["search_string"] = val;
}

function getCustomCss() {
  return localStorage["custom_css"] || '';
}

function setCustomCss(val) {
  localStorage["custom_css"] = val;
}

function getHistoryFilter() {
  return localStorage["history_filter"] || '';
}

function setHistoryFilter(val) {
  localStorage["history_filter"] = val;
}

function getShortcutKey() {
  return getKeyCombo("key_popup", "");
}
function clearOldShortcutKey() {
  localStorage["key_popup"] = null
}

function includeTab(tab) {
  return !(!showDevTools() && /chrome-devtools:\/\//.exec(tab.url));
}

function getKeyCombo(savedAs, def) {
  var key = null;
  if(localStorage[savedAs]) {
    key = new ShortcutKey(JSON.parse(localStorage[savedAs]));
  } else {
    key = new ShortcutKey(def);
  }
  return key;
}

function setKeyCombo(saveAs, key) {
  localStorage[saveAs] = JSON.stringify(key);
}

function getCloseTabKey() {
  return getKeyCombo("close_tab_popup", {ctrl:true, key:"d"});
}

function setCloseTabKey(key) {
  return setKeyCombo("close_tab_popup", key);
}

function getCloseAllTabsKey() {
  return getKeyCombo("close_all_tabs_popup", {ctrl:true, shift:true, key:"d"});
}

function setCloseAllTabsKey(key) {
  return setKeyCombo("close_all_tabs_popup", key);
}


function getNewTabKey() {
  return getKeyCombo("new_tab_popup", {ctrl:true, key:"return"});
}

function setNewTabKey(key) {
  key.key = 'return'; // always use return to trigger this =)
  return setKeyCombo("new_tab_popup", key);
}

function resizeClosedTabs() {
  closedTabs.splice(getClosedTabsSize());
}

function addClosedTab(tab) {
  if(isWebUrl(tab.url)) {
//    log("adding tab " + tab.id + " to closedTabs array " + tab.url);
    closedTabs.unshift({url:tab.url, title:tab.title, favIconUrl:tab.favIconUrl});
  }
  resizeClosedTabs();
}

/**
 * search the global tabs array for a tab with the given tabId and return its index, -1 if not found
 *
 * @param tabId
 */
function indexOfTab(tabId) {
  for(var i = 0; i < tabs.length; i++) {
    if(tabId === tabs[i].id) {
      return i;
    }
  }
  return -1;
}

function indexOfTabByUrl(tabArray, url) {
  for(var i = 0; i < tabArray.length; i++) {
    if(url === tabArray[i].url) {
      return i;
    }
  }
  return -1;
}

function initBadgeIcon() {
  // set the badge colour
  chrome.browserAction.setBadgeBackgroundColor(badgeColor);
  updateBadgeText(0);
}

/**
 * change the number of open tabs displayed on the extensions badge/icon
 *
 * @param val - the new value for the badge
 */
function updateBadgeText(val) {
  if(showTabCount()) {
    chrome.browserAction.setBadgeText({text:val + ""});
  } else {
    chrome.browserAction.setBadgeText({text:""});
  }
}

/**
 * move the tab with tabId to the top of the global tabs array
 *
 * @param tabId
 */
function updateTabOrder(tabId) {

  // change the badge color while the tab change timer is active
  chrome.browserAction.setBadgeBackgroundColor(tabTimerBadgeColor);

  if (tabOrderUpdateFunction) {
    // clear current timer
    tabOrderUpdateFunction.cancel();
  }

  var idx = indexOfTab(tabId);

  // setup a new timer
  tabOrderUpdateFunction = new DelayedFunction(function() {
    if (idx >= 0) {
      //log('updating tab order for', tabId, 'index', idx);
      var tab = tabs[idx];
      tabs.splice(idx, 1);
      tabs.unshift(tab);
    }
    // reset the badge color
    chrome.browserAction.setBadgeBackgroundColor(badgeColor);
  }, tabId === skipTabOrderUpdateTimer ? 0 : 1500);

  // clear the skip var
  skipTabOrderUpdateTimer = null;
}

function updateTabsOrder(tabArray) {
  for(var j = tabArray.length - 1; j >= 0; j--) {
    updateTabOrder(tabArray[j].id)
  }
}

function recordTab(tab) {
  if(includeTab(tab)) {
    log('recording tab', tab.id);
    tabs.push(tab);
  }
}

function recordTabsRemoved(tabIds, callback) {
  for(var j = 0; j < tabIds.length; j++) {
    var tabId = tabIds[j];
    var idx = indexOfTab(tabId);
    if(idx >= 0) {
      var tab = tabs[idx];
      addClosedTab(tab);
      tabs.splice(idx, 1);
      updateBadgeText(tabs.length);
    } else {
      log("recordTabsRemoved, failed to remove tab", tabId ,", tab not found in open tab list ", tabs);
    }
  }
  if(callback) {
    callback();
  }
}

/**
 * switch tabs but before doing so set the global variable 'skipTabOrderUpdateTimer' to the tab id being selected, this
 * will then be tested in the updateTabOrder() function
 */
function switchTabsWithoutDelay(tabid, callback) {
  skipTabOrderUpdateTimer = tabid;
  switchTabs(tabid, callback)
}

function switchTabs(tabid, callback) {
  chrome.tabs.get(tabid, function(tab) {
    // Once we have a tab then we know that we should be able to switch to it.
    // We need to call the callback before switching focus, otherwise keyboard shortcuts don't work, see #145.
    if(callback) {
      callback();
    }
    chrome.windows.update(tab.windowId, {focused:true}, function () {
      chrome.tabs.update(tab.id, {selected:true});
      if (moveOnSwitch()) {
        chrome.tabs.move(tab.id, { index: -1 });
      }
    });
  });
}

/**
 * collect all of the bookmarks as a simple flat array.
 */
function traverseTree(treeNode) {
  function loop(node, result) {
    if (node.url) {
      result.push(node);
    } else if (node.children) {
      for (var i = 0; i < node.children.length; i++) {
        var item = node.children[i];
        loop(item, result);
      }
    }
    return result;
  }

  return loop(treeNode, []);
}

function allBookmarks(callback) {
  chrome.bookmarks.getTree(function(tree) {
    bookmarks = traverseTree(tree[0]);
    callback(bookmarks);
  })
}

function setupBookmarks() {
  allBookmarks(function(result) {
    bookmarks = result;
  });
}

function init() {

  // reset the extension state
  tabs = [];
  closedTabs = [];
  bookmarks = [];

  // init the badge text
  initBadgeIcon();

  // count and record all the open tabs for all the windows
  chrome.windows.getAll({populate:true}, function (windows) {

    for(var i = 0; i < windows.length; i++) {
      var t = windows[i].tabs;

      for(var j = 0; j < t.length; j++) {
        recordTab(t[j]);
      }

      updateBadgeText(tabs.length);
    }

    // set the current tab as the first item in the tab list
    chrome.tabs.query({currentWindow:true, active:true}, function(tabArray) {
      log('initial selected tab', tabArray);
      updateTabsOrder(tabArray);
    });
  });

  // attach an event handler to capture tabs as they are closed
  chrome.tabs.onRemoved.addListener(function(tabId) {
    recordTabsRemoved([tabId], null);
  });

  // attach an event handler to capture tabs as they are opened
  chrome.tabs.onCreated.addListener(function (tab) {
    if (!includeTab(tab)) {
      return;
    }
    //      log('created tab', tab, 'selected tab is ', t2);

    // remove the tab from the closed tab list if present
    var idx = indexOfTabByUrl(closedTabs, tab.url);
    if (idx >= 0) {
      closedTabs.splice(idx, 1);
    }

    var newLen = tabs.unshift(tab);
    updateBadgeText(newLen);
    updateTabOrder(tab.id);
  });

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//    log('onUpdated tab', tab.id, tabId);
    tabs[indexOfTab(tabId)] = tab;
  });

  chrome.tabs.onActivated.addListener(function (info) {
//    log('onActivated tab', info.tabId);
    updateTabOrder(info.tabId);
  });

  chrome.windows.onFocusChanged.addListener(function(windowId) {
    if (windowId !== chrome.windows.WINDOW_ID_NONE) {
      chrome.tabs.query({windowId:windowId, active:true}, function (tabArray) {
//        log('onFocusChanged tab', tabArray);
        updateTabsOrder(tabArray);
      });
    }
  });

  chrome.commands.onCommand.addListener(function(command) {
    //log('Command:', command);

    if (popupMessagePort) {
      if (command === "quick-prev-tab") {
        popupMessagePort.postMessage({move: "prev"});
      } else if (command === "quick-next-tab") {
        popupMessagePort.postMessage({move: "next"});
      }
    } else {
      chrome.tabs.query({currentWindow: true, active: true}, function(tabArray) {
        if (tabArray.length > 0) {
          // find the index of the current focused tab
          var ctIdx = indexOfTab(tabArray[0].id);

          if (command === "quick-prev-tab" && tabs.length > 1 && ctIdx > 0) {
            //log('select previous tab', tabArray, ctIdx - 1, tabs);
            switchTabs(tabs[ctIdx - 1].id)
          } else if (command === "quick-next-tab" && tabs.length > 1 && ctIdx < tabs.length - 1) {
            //log('select next tab', tabArray, ctIdx + 1, tabs);
            switchTabs(tabs[ctIdx + 1].id)
          }

        }
      });
    }
  });

  chrome.runtime.onConnect.addListener(function(port) {
    if (port.name === "qtPopup") {
      //log("popup opened!");
      popupMessagePort = port;
      if(tabOrderUpdateFunction) {
        tabOrderUpdateFunction.call();
      }
      popupMessagePort.onDisconnect.addListener(function(msg) {
        //log("popup closed!", msg);
        popupMessagePort = null;
      });
    }
  });

  chrome.bookmarks.onCreated.addListener(function() {setupBookmarks()});
  chrome.bookmarks.onRemoved.addListener(function() {setupBookmarks()});
  chrome.bookmarks.onChanged.addListener(function() {setupBookmarks()});
  chrome.bookmarks.onMoved.addListener(function() {setupBookmarks()});

  setupBookmarks();
}

init();
