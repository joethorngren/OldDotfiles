// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Modifications (c) 2013,2014 -- SingleClickApps.com

// Icons Copyright (c) 2014 Derek Nelson (twitter.com/drknlsn)

var targetWindow = null;
var tabCount = 0;

function start(tab) {
  chrome.windows.getCurrent(getWindows);
}

function getWindows(win) {
  targetWindow = win;
  chrome.tabs.getAllInWindow(targetWindow.id, getTabs);
}

function getTabs(tabs) {
  tabCount = tabs.length;
  // We require all the tab information to be populated.
  chrome.windows.getAll({"populate" : true}, moveTabs);
}

function moveTabs(windows) {
  var numWindows = windows.length;
  var tabPosition = tabCount;

  for (var i = 0; i < numWindows; i++) {
    var win = windows[i];

    if (targetWindow.id != win.id) {
      var numTabs = win.tabs.length;

      for (var j = 0; j < numTabs; j++) {
        var tab = win.tabs[j];
        // Move the tab into the window that triggered the browser action.
        chrome.tabs.move(tab.id,
            {"windowId": targetWindow.id, "index": tabPosition});
        tabPosition++;
		// fix pinned tabs
		if(tab.pinned==true){chrome.tabs.update(tab.id, {"pinned":true});}
      }
    }
  }
}

// Set up a click handler so that we can merge all the windows.
chrome.browserAction.onClicked.addListener(start);
loadSavedSettings();

function loadSavedSettings() {
	
	// app version
	var currVersion = getVersion();
	var prevVersion = window.localStorage.MergeWindows_Version;
	if (currVersion != prevVersion) {
		if (typeof prevVersion == 'undefined') {
			onInstall();
		} else {
			onUpdate();
		}
		window.localStorage.MergeWindows_Version = currVersion;
	}

}

// Check if this is new version
function onInstall() {
	
	if (navigator.onLine) {
		chrome.tabs.create({url: 'https://singleclickapps.com/merge-windows/postinstall-chrome.html'});
	}
}
function onUpdate() {
	
	if (navigator.onLine) {
		//chrome.tabs.create({url: 'https://singleclickapps.com/stumble-button/postupdate-chrome.html'});
	}
}
function getVersion() {
	var details = chrome.app.getDetails();
	return details.version;
}
