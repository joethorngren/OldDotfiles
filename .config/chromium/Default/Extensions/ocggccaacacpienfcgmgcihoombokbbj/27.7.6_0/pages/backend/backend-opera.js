localStorage.setItem("browser-mode", "opera");

var newtabUrls = ['opera://startpage/', 'browser://startpage/', 'chrome://startpage/'];
var addonUrl = chrome.runtime.getURL("pages/newtab/newtab.html");

chrome.tabs.onCreated.addListener(function (tab) {
    replaceOperaStartTab(tab);
    
    /*
    chrome.tabs.getAllInWindow(function(tabsArr){
        if(tabsArr && tabsArr.length > 1){//off because url bar
            //console.log("Method", 1);
            chrome.tabs.remove(tab.id);
            chrome.tabs.create({url:addonUrl});   
        }else{
            //console.log("Method", 2);
            
            chrome.tabs.update(tab.id, {
                url: addonUrl
            });
        }//else
    });
    */
});

chrome.tabs.getAllInWindow(function(tabsArr){
    for(var k in tabsArr){
        replaceOperaStartTab(tabsArr[k]);
    }
    
});

function replaceOperaStartTab(tab){
    if (newtabUrls.indexOf(tab.url) === -1) return;

    var replace_premission = parseInt(localStorage.getItem("start-page-premisson")) || 0;
    if(replace_premission != 1) return;

    chrome.tabs.update(tab.id, {
        url: addonUrl
    });
}