/**
 - author James D'Greeze
 - copyright 2013
 - http://dgreeze.pw
 **/

const current = null;


chrome.runtime.onInstalled.addListener(function () {
    var TABID = new Array();

    chrome.windows.getAll({populate: true}, function (window_list) {
        var tab_list = [];
        for (var i = 0; i < window_list.length; i++) {
            tab_list = tab_list.concat(window_list[i].tabs);
        }

        for (var key in tab_list) {
            var tab = tab_list[key];
            if (/youtube/gi.test(tab.url)) {
                TABID[key] = tab.id;
                chrome.tabs.reload(tab.id);
            }
//            if (!/chrome:/gi.test(tab.url)) {
//                chrome.tabs.reload(tab.id);
//            }

        }

//        setTimeout(function () {
//            for (var i in TABID) {
//                chrome.tabs.sendMessage(TABID[i], {msg: "stop"});
//            }
//        }, 1000);
    });
});

var rightTab = '';
var CONST = 0;

// ------------------------------------------------------------------
function setRight(tabs) {

    var cookies = _b(YouTubeSmartPause.Prefs.get("yt.enable_smart_pause"));

//    console.log(cookies);
    if (CONST == 0) {
        CONST = 1;
        if (cookies) {
            rightTab = chrome.contextMenus.create({"title": "SmartPause YouTube Disabled", "onclick": OnClick});
        }
        else {
            rightTab = chrome.contextMenus.create({"title": "SmartPause YouTube Enabled", "onclick": OnClick});
        }
    }
//    else {
//        if (/youtube/gi.test(tabs.url)) {
//            setTimeout(function () {
//                chrome.tabs.sendMessage(tabs.id, {msg: "stop"});
//            }, 1000);
//        }
//    }

}

// ------------------------------------------------------------------
chrome.tabs.onCreated.addListener(function (tabs) {
//	console.log("chrome.tabs.onCreated");
    setRight(tabs);

});

// ------------------------------------------------------------------
chrome.tabs.onUpdated.addListener(function (tabs, changedInfo, tab) {

//    console.log(arguments);

    var cookies = _b(YouTubeSmartPause.Prefs.get("yt.enable_smart_pause"));
//console.log("chrome.tabs.onUpdated", cookies, changedInfo, tab);	
    if (!cookies) {
        chrome.tabs.sendMessage(tabs, {msg: "Disabled"});
        if (CONST == 0) {
            CONST = 1;
            rightTab = chrome.contextMenus.create({"title": "SmartPause YouTube Enabled", "onclick": OnClick});
        }
    }
    else {
        chrome.tabs.sendMessage(tabs, {msg: "Enabled"});
        if (CONST == 0) {
            CONST = 1;
            rightTab = chrome.contextMenus.create({"title": "SmartPause YouTube Disabled", "onclick": OnClick});
        }
    }


    var enable_tab_pause = _b(YouTubeSmartPause.Prefs.get("yt.enable_tab_pause"));
    if (enable_tab_pause) {
        console.log('tab', tab);
        chrome.tabs.query({active: true}, function (active_tabs) {
            console.log('active_tabs', active_tabs);
            var active_tab = active_tabs[0];
            if (active_tab.id != tab.id && /youtube/gi.test(tab.url)) {
                chrome.tabs.sendMessage(tab.id, {msg: "stop"});
            }
        });
    }

});
// ------------------------------------------------------------------

var date = new Date();
date = date.getTime() + (365 * 24 * 60 * 60 * 1000);

// ------------------------------------------------------------------
function OnClick() {

    chrome.windows.getAll({populate: true}, function (window_list) {
        var tab_list = [];
        for (var i = 0; i < window_list.length; i++) {
            tab_list = tab_list.concat(window_list[i].tabs);
        }

        for (var key in tab_list) {
            var tab = tab_list[key];
            if (/youtube/gi.test(tab.url)) {
                TABID[key] = tab.id;
            }
        }
    });

    var cookies = _b(YouTubeSmartPause.Prefs.get("yt.enable_smart_pause"));

    if (!cookies) {
        YouTubeSmartPause.Prefs.set("yt.enable_smart_pause", true)

        chrome.contextMenus.update(rightTab, {"title": "SmartPause YouTube Disabled"});

        for (var i in TABID) {
            chrome.tabs.sendMessage(TABID[i], {msg: "Enabled"});
        }
    }
    else {
        YouTubeSmartPause.Prefs.set("yt.enable_smart_pause", false)

        chrome.contextMenus.update(rightTab, {"title": "SmartPause YouTube Enabled"});

        for (var i in TABID) {
            chrome.tabs.sendMessage(TABID[i], {msg: "Disabled"});
        }
    }
}

const INTERVAL_TO_DISPLAY_WRITE_REVIEW = 2 * 24 * 3600 * 1000; // 2 days
//const INTERVAL_TO_DISPLAY_WRITE_REVIEW = 6 * 1000; // 2 days

// ------------------------------------------------------------------
chrome.extension.onMessage.addListener(function (request, sender, f_callback) {

    if (request == 'kuki') {
        var cookies = _b(YouTubeSmartPause.Prefs.get("yt.enable_smart_pause"));

        OnClick();

        f_callback(!cookies); //обратное сообщение
    }
    else if (request && request.action == "isSurfCanyonEnabled") {
        f_callback(_b(YouTubeSmartPause.Prefs.get("yt.enable_surfcanyon")));
        return true;
    }
    else if (request == "status_rate") {
        var flag = _b(YouTubeSmartPause.Prefs.get("yt.enable_rate"));
        if (flag) {
            var tt = YouTubeSmartPause.Prefs.get("install_time");
            if (tt == 0) {
                YouTubeSmartPause.Prefs.set("install_time", new Date().getTime())
            }

            var now = new Date().getTime();
            if (now - tt > INTERVAL_TO_DISPLAY_WRITE_REVIEW) {
                f_callback(true);
            }

        }
        return true;
    }
    else if (request == "dontshow_rate") {
        YouTubeSmartPause.Prefs.set("yt.enable_rate", false);
        return true;
    }
});


// ------------------------------------------------------------------
var TABID = new Array();
chrome.tabs.onActivated.addListener(function (tab) {

    var cookies = _b(YouTubeSmartPause.Prefs.get("yt.enable_smart_pause"));

//    var enable_tab_pause = _b(YouTubeSmartPause.Prefs.get("yt.enable_tab_pause"));
//console.log("chrome.tabs.onActivated", cookies);

    chrome.windows.getAll({populate: true}, function (window_list) {
        var tab_list = [];
        for (var i = 0; i < window_list.length; i++) {
            tab_list = tab_list.concat(window_list[i].tabs);
        }

        for (var key in tab_list) {
            var tab = tab_list[key];
            if (/youtube/gi.test(tab.url)) {
                TABID[key] = tab.id;
            }
        }
    });
    if (cookies) {
        for (var i in TABID) {
            if (tab.tabId == TABID[i]) {
                chrome.tabs.sendMessage(TABID[i], {msg: "start"});
            }
            else {
                chrome.tabs.sendMessage(TABID[i], {msg: "stop"});
            }
        }
    }
    else {
        for (var i in TABID) {
            if (tab.tabId == TABID[i]) {
                chrome.tabs.sendMessage(TABID[i], {msg: "Disabled"});
            }
        }
    }

});

// ------------------------------------------------------------------
//chrome.windows.onFocusChanged.addListener(function (windowId) {
//
//    var cookies = _b(YouTubeSmartPause.Prefs.get("yt.enable_smart_pause"));
////console.log("chrome.tabs.onFocusChanged", cookies, windowId);
//
//    if (cookies) {
//        chrome.windows.getAll({populate: true}, function (window_list) {
//            var tab_list = [];
//            for (var i = 0; i < window_list.length; i++) {
//                tab_list = tab_list.concat(window_list[i].tabs);
//            }
//
//            for (var key in tab_list) {
//                var tab = tab_list[key];
//                if (/youtube/gi.test(tab.url)) {
//                    TABID[key] = tab.id;
//                }
//            }
//        });
//
//        if (windowId == -1) {
//            for (var i in TABID) {
//                chrome.tabs.sendMessage(TABID[i], {msg: "stop"});
//            }
//        }
//        else {
//            chrome.tabs.getSelected(null, function (tab) {
//                for (var i in TABID) {
//                    if (tab.id == TABID[i]) {
//                        chrome.tabs.sendMessage(TABID[i], {msg: "start"});
//                    }
//                }
//            });
//        }
//
//    }
//});

// -------------------------------------------------------
function init() {

	welkom_page();

}

// --------------------------------------------------------
function welkom_page() {
	
	if( YouTubeSmartPause.Utils.isVersionChanged() )	{
		var url = null;
		
		if (YouTubeSmartPause.Prefs.get("install_time") == 0) 	{

			YouTubeSmartPause.Prefs.set( "install_time", new Date().getTime() );
		
			var ID = 'smartPause';
			var title = 'Welcome to app Smart Pause for YouTube';
			var ptitle = 'Smart Pause for YouTube';
			var descr = 'Smart Pause automatically pauses currently playing videos on YouTube once you leave the page and resumes playback when you return';
			
			url = 'http://livestartpage.com/welcome-chrome/?title='+encodeURIComponent(title)+'&desc='+encodeURIComponent(descr)+'&id='+encodeURIComponent(ID)+'&ptitle='+encodeURIComponent(ptitle); 			
			
			//url = "http://nimbus.everhelper.me/welcome-misc-products.php";
			
		}
		else	{
			//url = "http://flashvideodownloader.org/fvd-suite/to/s/update_chrome/";
			
		}			
		
		if( url )	{
			chrome.tabs.create({
						url: url,
						active: true
					});			
		}
	}
	
}
YouTubeSmartPause.Utils.ytLogo();
window.addEventListener("load", function () {

    init();

}, false);
