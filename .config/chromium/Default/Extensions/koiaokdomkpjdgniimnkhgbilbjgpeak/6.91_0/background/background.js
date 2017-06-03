var version = chrome.runtime.getManifest().version;
GoogleAnalytics.tid = "UA-7929453-158";
GoogleAnalytics.trackEvent("General","Started",version);

chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
	if(tab.url.indexOf("youtube.com/watch") > 0 && changeInfo.status == "complete"){
		chrome.pageAction.show(tabId);
		GoogleAnalytics.trackEvent("General","VideoPlay",version);
	}
});

if(localStorage.ytSize){
	var settings = {};
	settings.size = localStorage.ytSize || "1";
	settings.quality = localStorage.ytQuality || "hd1080";
	chrome.storage.sync.set(settings);
	localStorage.removeItem("ytSize");
	localStorage.removeItem("ytQuality");
}

if(localStorage.base_st) {
    localStorage.removeItem("base_st");
}