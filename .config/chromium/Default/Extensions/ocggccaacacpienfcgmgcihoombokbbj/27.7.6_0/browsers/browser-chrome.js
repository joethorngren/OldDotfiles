const BROWSER = 'chrome';
if(localStorage.getItem("html5-video-h264") == null) localStorage.setItem("html5-video-h264", html5VideoDetectH264());

if(!localStorage.getItem("definedLocation")){
    localStorage.setItem("definedLocation", chrome.i18n.getUILanguage());
}//if

function BRW_options_page_prepare(){
    return true;//Do nothing
}

/*Chrome API functions*/
function extensionGetUrl(src){
    return chrome.extension.getURL(src);
}//extensionGetUrl

function BRW_favicon(url){
    var url = String(url);
    
    if(url.indexOf("file://") > -1) return "/pages/newtab/img/dials/file.png";
    else
    if(url.indexOf(extensionGetUrl("/")) > -1 || url == "chrome://newtab/") return "/img/icon/icon16.png";
    else
    if(url.indexOf("chrome://") > -1) return "/pages/newtab/img/dials/puzzle.png";
    else 
        return "http://www.google.com/s2/favicons?domain=" + getUrlHost(url);
    
    //else return "chrome://favicon/" + addLinkProtocol(getUrlHost(url));
}//BRW_favicon

/*Chrome API functions*/

/*From pages/backend/backend.js*/
function BRW_browserbrowserActionOnClicked(){
    chrome.browserAction.onClicked.addListener(function(){
        var foundTabId = null;
        var foundTabIndex;
        var newTabUrl = "chrome://newtab/";
        var newTabUrlFull = "pages/newtab/newtab.html";
        chrome.tabs.query({url: newTabUrl}, function (tabs) {
            if (tabs.length > 0) {
                foundTabId = tabs[0].id;
                foundTabIndex = tabs[0].index;
            }

            chrome.tabs.query({url: chrome.extension.getURL(newTabUrlFull)}, function (tabs) {
                if (tabs.length > 0)
                    foundTabId = tabs[0].id;

                chrome.tabs.query({active: true}, function (tabs) {
                    var tab = tabs[0];
                    if(tab.url != newTabUrlFull && tab.url != newTabUrl) {
                        if (foundTabId) {
                            chrome.tabs.update(foundTabId, {active: true});
                        } else {
                            chrome.tabs.update(tab.id, {url: newTabUrlFull});
                        }
                    }
                });
            });
        });
    });
}//BRW_browserbrowserActionOnClicked

function BRW_sendMessage(message, callBack){
    chrome.runtime.sendMessage(message, callBack);    
}//function 

/*From pages/backend/backend.js*/
function BRW_onMessageAddListener(){
    chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
        if(typeof(message.command) != "undefined") {
            //console.info("Listener", message.command, message);
            
            if(message.command == "getBackgroundParams") { // get application install status
                getBackgroundNewPageParams(sendResponse);
                return true;
            } else if(message.command == "thumbLoad") { // load site thumb image
                if(message.tiles)
                    updateDialThumbByType(message.tiles, message.image || false, message.scheme || false, message.mode || false, message.passive || false);
            } else if(message.command == "textThumbLoad") { // load site text thumb for old dials version support
                getSitesTextThumbs(message.tiles);
            } else if(message.command == "showDialTextThumb") { // load site text thumb
                loadSitesTextThumb(message.tile);
            } else if(message.command == "showDialGalleryThumb" || message.command == "showDialScreenThumb") { // load site gallery or live thumb
                loadSitesEverhelperServiceThumb(message.tile);
            } else if(message.command == "addHostToBlackList") { // add thumb host to black list
                addHostToBlackList(message.val, sendResponse);
                return true;
            } else if(message.command == "restoreRemovedDialByUrl") { // remove thumb host from black list by url
                removeHostFromBlackList(message.val, sendResponse);
                return true;
            } else if(message.command == "getBackgroundImage") { // get current theme background image
                if(getRandomThemesDisplay()) {
                    getFileSystem(loadRandomBackgroundFile, sendResponse);
                } else {
                    if(getBackgroundVideoFile() && getDisplayVideoTheme())
                        getFileSystem(loadBackgroundVideoFile, sendResponse);
                    else
                        getFileSystem(loadBackgroundImageFile, sendResponse);
                }
                return true;
            } else if(message.command == "checkDisplayVideoThemeOffer") {
                currentThemeId(checkDisplayVideoThemeOffer, {sendResponse : sendResponse});
                return true;
            } else if(message.command == "applyVideoThemeOffer") {
                sendResponse({"startDownloadVideoTheme" : true, theme: message.theme});
                // try find bg video in file system else download
                loadThemeConfig(message.theme, startDownloadVideoTheme);
            } else if(message.command == "cancelVideoThemeOffer") {
                setHideVideoThemeOfferThemeId(message.theme);
            } else if(message.command == "getCurrentThemeSettings") {
                if(getLastInstalledThemeId()) {
                    currentThemeId(getCurrentThemeInfo, {sendResponse : sendResponse});
                    return true;
                }
            } else if(message.command == "getInstalledThemesSettings") {
                currentThemeId(getInstalledThemesData, {sendResponse : sendResponse});
                return true;
            } else if(message.command == "applyResolutionVideoTheme") {
                sendResponse({"startDownloadResolutionVideoTheme" : true, theme: message.theme, resolution : message.resolution});
                loadThemeConfig(message.theme, startDownloadResolutionVideoTheme, {"resolution" : message.resolution});
            } else if(message.command == "setDisplayTilesCount") {
                setDisplayTilesCount(message.val);
                setVisibleSpeedDialPanel(1);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setDisplayVideoTheme") {
                setDisplayVideoTheme(message.val);
                getNetTabPages(reloadTabPages);
            } else if(message.command == "setDisplayParallaxVideoTheme") {
                setDisplayParallaxVideoTheme(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setBackgroundParallaxValue") {
                setBackgroundParallaxValue(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setDisplayRelax") {
                setDisplayRelax(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setVisibleSpeedDialPanel") {
                setVisibleSpeedDialPanel(message.val);
            } else if(message.command == "getVisibleSpeedDialPanel") {
                sendResponse({visible : getVisibleSpeedDialPanel(message.val)});
            } else if(message.command == "setDisplaySpeedDialPanel") {
                setDisplaySpeedDialPanel(message.val);
                setVisibleSpeedDialPanel(1);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setDisplayPopularGroup") {
                setDisplayPopularGroup(message.val);
                if(message.val) {
                    getNetTabPages(reloadTabPages);
                    getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
                } else {
                    getActiveGroup(function(val) {
                        switchActiveGroupToDefault(val, message.tab);
                    });
                }
            } else if(message.command == "getDisplayPopularGroup") {
                sendResponse({"display" : getDisplayPopularGroup()});
            } else if(message.command == "setDialsFormOpacity") {
                setDialsFormOpacity(message.val);
                setVisibleSpeedDialPanel(1);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setDialsSizeValue") {
                setDialsSizeValue(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setOpenDialType") {
                setOpenDialType(message.val);
                setVisibleSpeedDialPanel(1);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setNewSpeedDialThumbType") {
                setNewSpeedDialThumbType(message.val);
                setVisibleSpeedDialPanel(1);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setDialsColumnsCount") {
                setDialsColumnsCount(message.val);
                setVisibleSpeedDialPanel(1);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "getDialsColumnsCount") {
                getDialsColumnsCount(function(val) {
                    sendResponse({"maxColumns" : val});
                });
                return true;
            } else if(message.command == "setWelcomeSettingsPageAlwaysHideStatus") {
                setSettingsWelcomePageAlwaysHideState(message.val);
            } else if(message.command == "openSelectedDialUrl") {
                var openDialType = message.newtab ? message.newtab : getOpenDialType();
                openSelectedUrl(openDialType, message.url);
            } else if(message.command == "openContextSelectedDialUrl") {
                openSelectedUrl(message.openType, message.url);
            } else if(message.command == "openSearchFormUrl") {
                openSelectedUrl(getOpenSearchType(), message.url);
            } else if(message.command == "setDisplaySearchForm") {
                setDisplaySearchForm(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setSearchFormProviderType") {
                setSearchFormProviderType(message.val);
                getNetTabPages(reloadTabPages, {skipTab: message.tab});
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setOpenSearchType") {
                setOpenSearchType(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setSearchFormOpacity") {
                setSearchFormOpacity(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "disableCurrentVideo") {
                sendResponse({result: disableCurrentVideo()});
            } else if(message.command == "disableCurrentImage") {
                sendResponse({result: disableCurrentImage()});
            } else if(message.command == "changeTodoContainerVisible") {
                setVisibleTodoPanel(message.val);
            } else if(message.command == "updateAvailableThemesList") {
                getAvailableThemesList(sendUpdatedAvailableThemes, {sendResponse : sendResponse, search: message.search || false, loadStaticContent: message.loadStaticContent || false});
                return true;
            } else if(message.command == "updateFlixelThemesList") {
                getFlixelThemesList(sendUpdatedFlixelThemes, {sendResponse : sendResponse});
                return true;
            } else if(message.command == "changeImageBackground") {
                getFileSystem(changeBackgroundImageFile, {sendResponse: sendResponse, themeId: message.theme});
                return true;
            } else if(message.command == "changeVideoBackground") {
                getFileSystem(changeBackgroundVideoFile, {sendResponse: sendResponse, themeId: message.theme});
                return true;
            } else if(message.command == "changeFlixerVideoBackground") {
                getFileSystem(changeBackgroundFlixerVideoFile, {sendResponse: sendResponse, themeId: message.theme, resolution: message.resolution});
                return true;
            } else if(message.command == "openInstallThemeTab") {
                //openUrlInNewTab(message.url);
                checkChromeTheme(message.url, sendResponse);
            } else if(message.command == "changeSettingsBackgroundCurrentTab") {
                setSettingsBackgroundTabId(message.tabid, message.noupd || false);
            } else if(message.command == "loadMoreFlixelContentBackend") {
                loadMoreFlixelContentBackend({});
            } else if(message.command == "saveTodoItemDb") {
                saveTodoItemDb(message.id, message.title, message.order);
            } else if(message.command == "deleteTodoItemDb") {
                deleteTodoItemDb(message.id);
            } else if(message.command == "changeTodoItemTitleDb") {
                changeTodoItemTitleDb(message.id, message.title);
            } else if(message.command == "changeTodoItemDoneDb") {
                changeTodoItemDoneDb(message.id, message.done);
            } else if(message.command == "changeTodoItemSort") {
                changeTodoItemSortDb(message.items);
            } else if(message.command == "setDisplayTodoPanel") {
                setDisplayTodoPanel(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setDisplayClockPanel") {
                setDisplayClockPanel(message.val);
                setVisibleSpeedDialPanel(0);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setClockFormat") {
                setClockFormat(message.val);
                setVisibleSpeedDialPanel(0);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setClockColorSchemeType") {
                setClockColorSchemeType(message.val);
                setVisibleSpeedDialPanel(0);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setClockSecondsVisible") {
                setVisibleClockSeconds(message.val);
                setVisibleSpeedDialPanel(0);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setClockFormatLabel") {
                setClockFormatLabel(message.val);
                setVisibleSpeedDialPanel(0);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setClockDate") {
                setClockDate(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setDateFormat") {
                setDateFormat(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setDateSeparator") {
                setDateSeparator(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setClockVisibleLabel") {
                setClockVisibleLabel(message.val);
                setVisibleSpeedDialPanel(0);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setShareAppStatus") {
                setShareAppStatus(true);
            } else if(message.command == "setClockFontBold") {
                setClockFontBold(message.val);
                setVisibleSpeedDialPanel(0);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setClockType") {
                setClockType(message.val);
                setVisibleSpeedDialPanel(0);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setClockBackgroundType") {
                setClockBackgroundType(message.val);
                setVisibleSpeedDialPanel(0);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setClockOpacity") {
                setClockOpacity(message.val);
                setVisibleSpeedDialPanel(0);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setClockBackgroundOpacity") {
                setClockBackgroundOpacity(message.val);
                setVisibleSpeedDialPanel(0);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "changeTodoItemCoordinates") {
                setDisplayTodoCoordinates(message.top, message.left);
            } else if(message.command == "changeTodoItemSize") {
                setDisplayTodoSize(message.width, message.height);
            } else if(message.command == "clearDoneTodoElementsDb") {
                clearTodoDoneElementsDb();
            } else if(message.command == "setApplicationRating") {
                setApplicationRating(message.val);
            } else if(message.command == "setApplicationNewtabRatingModal") {
                setApplicationNewtabRatingModal();
            } else if(message.command == "setDisplayWeatherPanel") {
                setDisplayWeatherPanel(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setWeatherUnit") {
                setWeatherUnit(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setDisplayWeatherUnit") {
                setDisplayWeatherUnit(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setDisplayWeatherBackground") {
                setDisplayWeatherBackground(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "changeWeatherItemCoordinates") {
                setDisplayWeatherCoordinates(message.top, message.left);
            } else if(message.command == "resetWeatherPosition") {
                resetWeatherPosition();
            } else if(message.command == "setWeatherOpacity") {
                setWeatherOpacity(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setWeatherBackgroundOpacity") {
                setWeatherBackgroundOpacity(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "resetTodoPositionSize") {
                resetTodoPositionSize();
            } else if(message.command == "setBookmarksDisable") {
                setBookmarksDisable();
            } else if(message.command == "setRelaxModalDisable") {
                setRelaxModalDisable();
            } else if(message.command == "setDisplayAppsLink") {
                setDisplayAppsLink(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setQuickWidget") {
                setQuickWidget(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setBottomPanelOpacity") {
                setBottomPanelOpacity(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setTodoPanelOpacity") {
                setTodoPanelOpacity(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "removeContentFavoriteMark") {
                sendRemoveFavoriteMarkMessage(message.data);
            } else if(message.command == "setRandomThemesDisplay") {
                setRandomThemesDisplay(message.val);
                getNetTabPages(reloadTabPages);
                getOptionsTabPages(reloadTabPages, {skipTab: message.tab});
                getFavoriteTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setRandomThemesDisplaySettings") {
                setRandomThemesDisplay(message.val);
                getNetTabPages(reloadTabPages);
                getFavoriteTabPages(reloadTabPages, {skipTab: message.tab});
                getOptionsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setThemesSortType") {
                setThemesSortType(message.val);
                //getOptionsTabPages(reloadTabPages); // Old Settings
            } else if(message.command == "setLiveThemesSortType") {
                setLiveThemesSortType(message.val);
                //getOptionsTabPages(reloadTabPages); // Old Settings
            } else if(message.command == "setImagesSortType") {
                setImagesSortType(message.val);
                //getOptionsTabPages(reloadTabPages); // Old Settings
            } else if(message.command == "setFooterLinksBlockDisplay") {
                setFooterLinksBlockDisplay(message.val);
                if(message.tab)
                    getNetTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setSidebarStatus") {
                setSidebarStatus(message.val);
            } else if(message.command == "getSidebarStatus") {
                getSidebarStatus(function(status) {
                    try{
                        sendResponse({"status" : status});
                    }catch(ex){
                        if(typeof DEVMSG != "undefined" && DEVMSG) console.warn(ex);
                    }
                });
                return true;
            } else if(message.command == "getActiveGroup") { // get active group
                var withDials = message.withDials;
                getActiveGroup(function(val) {
                    bgGetActiveGroup(val, withDials, sendResponse);
                });
                return true;
            } else if(message.command == "getAvailableGroups") { // get available groups
                getActiveGroup(function(val) {
                    bgGetAvailableGroups(val, sendResponse, GROUP_SORT_BY_ORDER);
                });
                return true;
            } else if(message.command == "getAddNewDialGroups") {
                getActiveGroup(function(val) {
                    bgGetAvailableGroups(val, sendResponse, GROUP_SORT_ADD_NEW_DIAL);
                });
                return true;
            } else if(message.command == "bgAddNewDial") { // add new dial
                bgAddNewDial(message.dial, message.collectDials, sendResponse);
                return true;
            } else if(message.command == "deleteDialById") {
                bgDeleteDial(message.dialId, message.collectDials, sendResponse);
                return true;
            } else if(message.command == "moveDialsOrder") {
                bgMoveDialsOrder(message.collectDials);
            } else if(message.command == "bgEditNewDial") {
                bgEditNewDial(message.dial, message.collectDials, message.groupChanged, sendResponse);
                return true;
            } else if(message.command == "bgAddNewGroup") {
                bgAddNewGroup(message.group, message.collectGroups, sendResponse);
                getNetTabPages(reloadTabPages, {skipTab: message.tab});
                return true;
            } else if(message.command == "deleteGroupById") {
                bgDeleteGroup(message.groupId, message.collectGroups);
                getNetTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "moveGroupsOrder") {
                bgMoveGroupsOrder(message.collectGroups);
            } else if(message.command == "bgEditNewGroup") {
                bgEditNewGroup(message.group, message.collectGroups, sendResponse);
                getNetTabPages(reloadTabPages, {skipTab: message.tab});
                return true;
            } else if(message.command == "changeActiveGroup") {
                bgChangeActiveGroup(message.groupId, sendResponse);
                return true;
            } else if(message.command == "getGroupDialsCount") {
                bgGetGroupDialsCount(message.groupId, sendResponse);
                return true;
            } else if(message.command == "restoreRemovedDialById") {
                bgRestoreRemovedDialById(message.val, sendResponse);
                return true;
            } else if(message.command == "getThumbForUserImage") {
                getThumbForUserImage(message.theme);
                return true;
            } else if(message.command == "saveInputFileImage") {
                saveInputFileImage(message.blob, message.theme);
                return true;
            } else if(message.command == "loadBackgroundImageFromUser") {
                loadBackgroundImageFromUser(message.url, message.theme);
                return true;
            } else if(message.command == "changeBackgroundImageFileLoadComplete") {
                changeBackgroundImageFileLoadComplete(message.url, message.data);
                return true;
            }else if(message.command == "everhelperCookiesRead"){
                BRW_everhelperCookiesRead();
            }else if(message.command == "setFullScreen"){
                BRW_setFullScreen(message.data);
            }else if(message.command == "getPreviousSession") {
                CHgetPreviousSession(message.restore, message.sessionId);
                return true;
            }else if(message.command == "getBbaPremission") {
                getBbaPremission(sendResponse);
                return true;
            } else if(message.command == "getThemeConfigById") {
                loadThemeConfig(message.theme, sendThemeConfigById, sendResponse);
            } else if(message.command == "openAllGroupDials") {
                openAllGroupDials(message.groupId, message.mode);
            } else if(message.command == "getBackup") {
                getBackup(sendResponse);
            } else if(message.command == "setBackup") {
                addBackup(message.data, sendResponse);
            } else if(message.command == "addCurrentTabToDefault") {
                addCurrentTabToDefaultBg();
            } else if(message.command == "saveTabsToNewGroupBg") {
                saveTabsToNewGroupBg(message);
            } else if(message.command == "getTabsList") {
                getTabsList(sendResponse);
            } else if(message.command == "setDialsBackground") {
                setDialsBackground(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "setDialsBorders") {
                setDialsBorders(message.val);
                getNetTabPages(reloadTabPages);
                getSettingsTabPages(reloadTabPages, {skipTab: message.tab});
            } else if(message.command == "reloadOptionsTabPages") {
                getOptionsTabPages(reloadTabPages, {skipTab: message.tab || 0});
            } else if(message.command == "reloadFavoritesTabPages") {
                getFavoriteTabPages(reloadTabPages, {skipTab: message.tab || 0});
            } else if(message.command == "reloadNewTabPages") {
                getNetTabPages(refreshNewTabPages, {skipTab: message.tab || 0});
            } else if(message.command == "getAutoTitle") {
                getAutoTitle(message.dial, sendResponse);
            } else if(message.command == "setUninstallURL") {
                BRW_setAppUninstallHandler();
            }
        }
    });
}//BRW_onMessageAddListener

function checkChromeTheme(url, sendResponse){
    BRW_currentThemeId(function(themeId){
        if(!themeId || String(themeId).length < 16 || String(url).indexOf(String(themeId)) == -1){
            openUrlInNewTab(url);
        }else{
            BRW_sendMessage({"command": "installWaitingContent"}); 
            
            //if(sendResponse) sendResponse(themeId);
            //openUrlInNewTab(extensionGetUrl( "pages/newtab/newtab.html" ));
            //startDownloadChromeThemeVideo(url);
        }//else
    });
}//function

/*
function startDownloadChromeThemeVideo(url){
    console.log('startDownloadChromeThemeVideo', url);    
}//function
*/

function BRW_currentThemeId(callback, data){
    //inf Returns a list of information about installed extensions and apps.
    
    chrome.management.getAll(function(exts) {
        var themeId = null;
        for(var i = 0; i < exts.length; i++)
            if(exts[i].type == "theme") {
                themeId = exts[i].id;
                break;
            }
        
        callback(themeId, data);
    });
}

function BRW_themeHandlerInstallAndEnable(){
    /**
     * Theme install event handler
     */    
    chrome.management.onInstalled.addListener(function(ext) {
        
    });

    /**
     * Theme enable handler
     */
    chrome.management.onEnabled.addListener(function(ext) {
        //console.info(getAutoDownloadVideos(), ext);
        
        if(ext.type == "theme") {
            checkChromeThemeForVideo(ext.homepageUrl, function(){
                increaseChromeThemeRating(ext.homepageUrl);
                openUrlInNewTab(extensionGetUrl( "pages/newtab/newtab.html" ));
            });
        }
    });

    /**
     * Theme enable handler
     */
    chrome.management.onDisabled.addListener(function(ext) {
        
        if(ext.type == "theme") {
            var type  = localStorage.getItem("background-video-content-type");
            var dwnld = localStorage.getItem("downloading-video-data") || "{}";
            var setType = 3;
            
            try{
                dwnld = JSON.parse(dwnld);
                type = dwnld.contentType || 3;
            }catch(ex){};
            
            
            localStorage.setItem("background-video-content-type", type);
            
            getOptionsTabPages(reloadTabPages);
        }
    });
}//BRW_hemeHandlerInstallAndEnable

function getTabsList(sendResponse){
    chrome.tabs.getAllInWindow(function (Tabs) {
        if (Tabs.length && Tabs[0].id != -1) {
            var Data = [];
            
            for (let Tab of Tabs){
                Data.push({
                    "id"      : Tab.id, 
                    "title"   : Tab.title, 
                    "url"     : Tab.url,
                    "favicon" : BRW_favicon(Tab.url),//Tab.favIconUrl
                });
            }//for
            
        } //if
        
        if(sendResponse) sendResponse(Data);
    });
}

function addCurrentTabToDefaultBg(){
    chrome.tabs.getSelected(function(Tab) {
        addDialsToDefaultGroup([{title:Tab.title, url:Tab.url}], false, true);
    });
}

function saveTabsToNewGroupBg(options){
    var filter = options && options.filter ? options.filter : false;
    var title  = options && options.title  ? options.title  : false;
    
    if(options && options.tabs){
        addDialsToNewGroup({title:title}, options.tabs, false, true);
    }else{
        chrome.tabs.getAllInWindow(function (Tabs) {
            if (Tabs.length && Tabs[0].id != -1) {
                var dials = [];

                for (let Tab of Tabs){
                    if(filter && filter.indexOf(Tab.id) == -1 && filter.indexOf(String(Tab.id)) == -1) continue;

                    if (
                        true || (String(Tab.url).indexOf("chrome") !== 0)
                    ) {
                        dials.push({
                            "title" : Tab.title, 
                            "url" : Tab.url
                        });
                    }//if
                }//for

                addDialsToNewGroup({title:title}, dials, false, true);
            } //if
        });
    }//else
    
}

function getBackup(sendResponse, callback){
    Data = {};
    try{
        chrome.storage.local.get("backup", function (result) {
            Data = result.backup || {};
            
            if(!callback) BRW_sendMessage({"command": "readBackup", data:JSON.stringify(Data)});
            else callback(Data);
        });
    }
    catch(e){
        console.log(e);
    }
    finally {
        if(sendResponse) sendResponse();
    }
}

function addBackup(data, sendResponse){
    if(!data) return false;
    
    try{
        var Data = JSON.parse(data);
        
        chrome.storage.local.get("backup", function (result) {
            var list = {};
            list[Data.date] = Data;
            
            var n = 0;
            if(result && typeof result == "object" && typeof result.backup == "object"){
                var keys = Object.keys(result.backup).sort(function(a,b){return (a < b)});
                //console.log(keys);
                for(var key in keys) if(++n < 5){
                    list[keys[key]] = result.backup[keys[key]];
                }
            }//if for if
            
            chrome.storage.local.set({backup:list});
            
            //console.log(list);
            
            BRW_sendMessage({"command": "readBackup", data:JSON.stringify(list)});           
        });    
    }
    catch(e){
         //if(callBack) callBack();
    }
    finally {
        if(sendResponse) sendResponse();
    }
}

function openAllGroupDials(groupId, mode){
    getGroupDials({id:groupId, dials:[]}, function(group){
        if (mode == "current") {
            chrome.windows.getCurrent(function (window) {
                openAllGroupDialsInWindow(group.group.dials, window.id, false);
            });
        } else {
            chrome.windows.create(function (window) {
                openAllGroupDialsInWindow(group.group.dials, window.id, true);
            });
        } //else
    });
}

function openAllGroupDialsInWindow(dials, windowId, removeDefault){
    chrome.tabs.getAllInWindow(windowId, function(tabsForRemove){
        var active = true;
        for (let Tab of dials) {
            chrome.tabs.create({
                windowId: windowId,
                url: Tab.url,
                active: active,
                pinned: false,
            });
            
            active = false;
        } //for
        
        //Remove default tabs
        if(removeDefault){
            var rmTabArr = [];
            for(let rmTab of tabsForRemove) rmTabArr.push(rmTab.id);
            chrome.tabs.remove(rmTabArr);
        }
    });    
}

function sendThemeConfigById(themeData, sendResponse){
    localStorage.setItem("install-interesting-theme", JSON.stringify(themeData));
    
    setTimeout(function(){
        /*if(sendResponse)
            sendResponse();*/
    }, 10000);
}

function getBbaPremission(sendResponse){
    chrome.tabs.getAllInWindow(function(tabs){
        var notPinnedTabsAmmount = 0;
        
        //test for opened tabs
        for(var k in tabs){
            if(!tabs[k].pinned) notPinnedTabsAmmount++;
        }//for
        
        if(notPinnedTabsAmmount > 1) localStorage.setItem("just-opened", 0);
            
        //send response
        if(sendResponse) sendResponse(
            localStorage.getItem("just-opened")
        );
    });
}

function CHgetPreviousSession(restore, sessionId){
    if(!restore){
        chrome.storage.local.get("last", function(result){
            if(result && result.last && result.last.length){
                BRW_sendMessage({
                    "command"  : "previousSessionButton",
                    "nTabs"    : result.last.length,
                    "sessionId": 999,
                });
            }
        });
    }else{
        chrome.storage.local.get("target", function(result){
            if(result && result.target == "window"){
                chrome.tabs.getAllInWindow(function(tabsCheck){
                    var inNewWindow = false;
                    
                    for(var k in tabsCheck){
                        var url = String(tabsCheck[k].url);
                        
                        if(
                            (url.indexOf("about:") == -1) &&
                            (url.indexOf("chrome://") == -1) &&
                            (url.indexOf("chrome-extension://") == -1)
                        ){
                            inNewWindow = true;
                            break;
                        }
                    }
                    
                    if(inNewWindow){
                        chrome.windows.create(function(window){
                            restoreSessionInWindow(window.id);
                        });
                    }else{
                        chrome.windows.getCurrent(function(window){
                           restoreSessionInWindow(window.id);
                       });         
                    }//else
                });
            }else{
               chrome.windows.getCurrent(function(window){
                   restoreSessionInWindow(window.id);
               });
            }//else
        });
    }//else if
}//FFgetPreviousSession

function restoreSessionInWindow(windowId){
    chrome.tabs.getAllInWindow(windowId, function(tabsForRemove){
        chrome.storage.local.get("last", function(result){
            if(result && result.last && result.last.length){
                for(let Tab of result.last){
                    chrome.tabs.create({
                        windowId:windowId,
                        url     : Tab.url,
                        active  : Tab.selected,
                        pinned  : Tab.pinned,
                    });
                }//for

                //Remove old tabs
                var rmTabArr = [];
                for(let rmTab of tabsForRemove) rmTabArr.push(rmTab.id);
                chrome.tabs.remove(rmTabArr);
            }//if
        });  
    }); 
}//function

/* BRW_everhelperCookies */
function BRW_everhelperCookiesRead() {
    chrome.cookies.getAll(
        {
           url: "http://everhelper.me"
        },
        function(response){
            //console.log('EV: ', response);
            BRW_sendMessage(
                {
                    command: "everhelperCookiesAnswer",
                    cookies: response
                }
            );
        }
    );
    
    
}


/*From pages/backend/install.js*/
function BRW_setAppUninstallHandler() {
    var hasRuLanguage = chrome.i18n.getUILanguage().indexOf("ru") != -1;
    var cid = localStorage.getItem("ga:clientId") || localStorage.getItem("ga-unique-cid");
    
    chrome.runtime.setUninstallURL(
        shareBasicUrl + (hasRuLanguage ? "ru/" : "") + "uninstall"
        + "?id=" + String(cid)
    );
    
    /*
    chrome.i18n.getAcceptLanguages(function(languages) {
        var hasRuLanguage = languages.indexOf("ru") != -1;
        chrome.runtime.setUninstallURL(shareBasicUrl + (hasRuLanguage ? "ru/" : "") + "uninstall");
    });
    */
}//BRW_setAppUninstallHandler

/*From pages/common.js*/
function BRW_analyzeHistory(callback, analyzeLastItemsCount, data) {
    analyzeLastItemsCount = analyzeLastItemsCount ? analyzeLastItemsCount : getAnalyzeHistoryLength();
    if(getDisplaySpeedDialPanel()) {
        chrome.history.search({"text" : "", "maxResults" : analyzeLastItemsCount, startTime: 0, endTime: (new Date()).getTime()}, function(visitedURLs) {
            callback(visitedURLs, data);
        });
    } else {
        callback([], data);
    }
}//BRW_analyzeHistory


function BRW_mostVisitedURLs(callback) {
    var analyzeLastItemsCount = 500;
    var resultByHost = {};
    var resultByUrl = [];
    
    chrome.history.search({"text" : "", "maxResults" : analyzeLastItemsCount, startTime: 0, endTime: (new Date()).getTime()}, function(items) {
        var items = orderHistoryResults( items );
        
        for (var i = 0; i != items.length; i++) {
            var item = items[i];
            if (item.url.toLowerCase().indexOf("http") !== 0) {
                item.invalid = true;
                continue;
            }
            
            try {
                item.host = getUrlHost(item.url).toLowerCase().replace("www.", "");
            } catch (ex) {
                continue;
            }
            
            if (typeof resultByHost[item.host] == "undefined") {
                // add to hosts results
                resultByHost[item.host] = {
                    url : item.host,
                    visits : item.visitCount,
                    advanced : item
                };
            } else {
                resultByHost[item.host].visits += item.visitCount;
            }
            
            resultByUrl.push(item);
        }
        
        //console.debug(resultByHost);
        //console.debug(resultByUrl);
        
        //if(callback) callback(resultByUrl);
        if(callback) callback(resultByHost);
    });
}

function BRW_historyItems(callback) {
    analyzeLastItemsCount = 500; //1000; //getAnalyzeHistoryLength();
    
    chrome.history.search({"text" : "livestartpage", "maxResults" : analyzeLastItemsCount, startTime: 0, endTime: (new Date()).getTime()}, function(visitedURLs) {
        callback(visitedURLs);
    });
}

/*From /pages/common.js*/              
function BRW_getNetTabPages(callback, data) {
    chrome.tabs.query({ url: "chrome://newtab/" }, function(tabs) {
        //console.log("found", tabs);
        if (typeof(tabs) != "undefined") {
            if(tabs.length){
                if(callback) {
                    data = data || {};
                    data.tabs = tabs;
                    callback(data);
                }
            }else{//Opera
                var tabs = [];
                chrome.tabs.query({ url: extensionGetUrl( "pages/newtab/newtab.html" ) }, function(tabs) {
                    if (typeof(tabs) != "undefined") {
                        if(callback) {
                            data = data || {};
                            data.tabs = tabs;
                            callback(data);
                        }//if
                    }//if
                });
            }//else
        }//if
    });
}//BRW_getNetTabPages  

/*From /pages/common.js*/    
function BRW_refreshNewTabPages(data){
    if(data && data.tabs){
        var tabs = data.tabs;
        var newTabPageUrl = extensionGetUrl( "pages/newtab/newtab.html" );
        var tabsCount = tabs.length, i;
        var skipTab = data.skipTab || 0;
            
        for(i = 0; i < tabsCount; i++){
            if(skipTab != tabs[i].id){
                chrome.tabs.update(tabs[i].id, { url: newTabPageUrl });
            }
        }
    }
}

/*From /pages/backend/backend.js*/ 
function BRW_getFileSystem(callBack, data) {
    //console.info("BRW_getFileSystem", 0, data);
    
    navigator.webkitPersistentStorage.requestQuota(1024*1024, function(grantedBytes) {
        //console.info("BRW_getFileSystem", 1, grantedBytes);
        window.requestFileSystem(PERSISTENT, grantedBytes, function(fs) {
            //console.info("BRW_getFileSystem", 2, fs);
            callBack(fs, data);
        });
    });
}

/*From /pages/backend/common.js*/ 
function BRW_reloadTabPages(data) {
    var tabs = data.tabs;
    var tabsCount = tabs.length, i;
    var skipTab = data.skipTab;
    var N = 0;
    
    for(i = 0; i < tabsCount; i++) {
        if(skipTab != tabs[i].id){
            reloadTabWithTimeout(tabs[i].id, ++N);
        }
    }
}

var tabsTimeout = {},  tabReloadShift = 550,  tabReloadGap = 450;
function reloadTabWithTimeout(tabId, N) {
    clearTimeout(tabsTimeout[tabId]);
    
    tabsTimeout[tabId] = setTimeout(()=>{
            try{
                chrome.tabs.reload(tabId);
            }catch(ex){
                console.warn(ex);
            }
        },
        (N * tabReloadGap + tabReloadShift)
    );
}

/*From /pages/backend/install.js*/ 
function BRW_setDefaultDownloadedLiveBackground(currentTheme, defaultContent) {
    //console.log("LOG - install.js - setDefaultDownloadedLiveBackground");
    var fileName = defaultContent.lastInstallBgVideo.fileName;
    /*
    if(!html5VideoDetectH264() && fileName == "juh8o6z8icha8uodbqcm.hd.mp4"){
        console.log('change to webm');
        fileName == "juh8o6z8icha8uodbqcm.webm";
    }else console.log('MP4444', html5VideoDetectH264(), fileName);
    */
    var themePath = defaultContent.path;
    var fullPath  = themePath + "/" + fileName;
    
    getFileSystem(function(fs, data) {
        chrome.runtime.getPackageDirectoryEntry(function(root) {
            root.getFile(fullPath, {}, function(fileEntry) {
                if(fileEntry.name.indexOf(".mp4") > 0 || fileEntry.name.indexOf(".webm") > 0) {
                    fs.root.getDirectory(getThemesFileSystemDir(), {create: true}, function (themesDirEntry) {
                        themesDirEntry.getDirectory(defaultContent.id, {create: true}, function (dirEntry) {
                            fileEntry.copyTo(dirEntry);
                            addThemeInstalledElement(defaultContent, fileName, defaultContent.resolution, "bgVideoPath", flixelBackgroundType);
                            localStorage.setItem("background-video-file", defaultContent.id + "/" + fileName);
                            localStorage.setItem("background-video-resolution", defaultContent.resolution);
                            localStorage.setItem("background-video-content-type", flixelBackgroundType);
                            localStorage.setItem("background-video-content-author", defaultContent.author);
                            localStorage.setItem("background-video-content-handmade", (defaultContent.handmade ? 1 : 0));
                            localStorage.setItem("background-video-content-author-url", (defaultContent.author_url ? defaultContent.author_url : ""));
                            localStorage.setItem("last_installed_theme", currentTheme);
                            localStorage.setItem("hide-video-theme-offer", currentTheme);
                            localStorage.setItem("default-content-installed", Date.now());
                            localStorage.removeItem("background-disabled");
                            setTimeout(function() {
                                getNetTabPages(reloadTabPages);
                                
                                BRW_routeAfterAppInstall();
                            }, 200);
                        });
                    });
                }
            });
        });
    }, {});
}//BRW_setDefaultDownloadedLiveBackground


/*From /pages/backend/theme.js*/ 
function BRW_changeBackgroundFlixelVideoFileLoad(fs, data) {
        data = data || {};

        if(typeof (data.pageCallback) == "undefined")
            data.pageCallback = getNetTabPages;

        if(xhrBgVideo) {
            xhrBgVideo.onload = null;
            xhrBgVideo.onprogress = null;
            xhrBgVideo.onerror = null;
            xhrBgVideo.abort();
            xhrBgVideo = null;
            clearDownloadingVideoData();
        }

        fs.root.getFile(data.filePath, {}, function(fileEntry) { // try load hd video
            data.url = fileEntry.toURL();
            changeBackgroundFlixerVideoFileLoadSuccess(data);
        }, function() { // background flixer video not found on local fs and try download
            var installedThemes = getInstalledThemes();
            if(!installedThemes || typeof (installedThemes[data.theme.id]) == "undefined") {
                changeBackgroundFlixerVideoFileDownload(data.bg, data.theme, data.pageCallback);
            } else {
                if(typeof (installedThemes[data.theme.id]["bgVideoPath"][data.resolution]) == "undefined") {
                    changeBackgroundFlixerVideoFileDownload(data.bg, data.theme, data.pageCallback);
                } else {
                    var tryLoadHdFileUrl;
                    if(data.theme && data.theme.handmade)
                        tryLoadHdFileUrl = data.filePath.replace("v1920bg", "v1024bg");
                    else
                        tryLoadHdFileUrl = data.filePath.replace(".hd.", ".tablet.");

                    fs.root.getFile(tryLoadHdFileUrl, {}, function(fileEntry) { // try load low quality video
                        if(data.theme && data.theme.handmade)
                            data.bg.fileName = data.bg.fileName.replace("v1920bg", "v1024bg");
                        else
                            data.bg.fileName = data.bg.fileName.replace(".hd.", ".tablet.");
                        data.url = fileEntry.toURL();
                        changeBackgroundFlixerVideoFileLoadSuccess(data);
                    }, function() {
                        changeBackgroundFlixerVideoFileDownload(data.bg, data.theme, data.pageCallback);
                    });
                }
            }
        });
}//BRW_changeBackgroundFlixelVideoFileLoad

/*From /pages/backend/common.js*/ 
function BRW_createDirectoryStructure(rootDirEntry, folders, fs, data, callback) {
    if (folders[0] == '.' || folders[0] == '') folders = folders.slice(1);

    rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
        if (folders.length)
            createDirectoryStructure(dirEntry, folders.slice(1), fs, data, callback);
        else
            callback(fs, data);
    }, function() {
        console.log("error create directories structure");
    });
}

/*From /pages/backend/common.js*/ 
function BRW_saveFileComplete(fs, data) {
    var fullPath = data.path + "/" + data.name;
    fs.root.getFile(fullPath, {create: true}, function (fileEntry) {
        fileEntry.createWriter(function (writer) {
            var blob = new Blob([data.data]);
            writer.onwriteend = function () {
                var url = fileEntry.toURL();
                if(typeof (data.callback) != "undefined")
                    data.callback(url, data);
            };
            writer.write(blob);
        });
    });
}

/*From /pages/backend/common.js*/ 
function BRW_getOptionsThemesTabPages(callback, data) {
    chrome.tabs.query({ url: chrome.extension.getURL("/pages/options/options.html") }, function(tabs) {
        data = data || {};
        data.tabs = tabs;
        chrome.tabs.query({ url: chrome.extension.getURL("/pages/options/favorite.html") }, function(tabs) {
            if(data.tabs && data.tabs.length) {
                for(var i in tabs)
                    data.tabs.push(tabs[i]);
            } else
                data.tabs = tabs;
            if(callback)
                callback(data);
        });
    });
}//getOptionsThemesTabPages

/*From /pages/backend/theme.js*/ 
function BRW_sendThemeDownloadProgress(data) {
    var tabs = data.tabs;
    var tabsCount = tabs.length, i;
    for(i = 0; i < tabsCount; i++) {
        if(typeof (data.percentComplete) != "undefined")
            chrome.tabs.sendMessage(tabs[i].id, {"command" : data.messageCommand, "percentComplete" : data.percentComplete, "downloadingFile" : data.downloadingFile});
    }
}//BRW_sendThemeDownloadProgress


/*From /pages/backend/theme.js*/ 
function BRW_PARTLY_changeBackgroundImageFileLoadComplete(data){
    getNetTabPages(reloadTabPages);
    getOptionsThemesTabPages(function(data) {
        var tabs = data.tabs;
        var tabsCount = tabs.length, i;
        for(i = 0; i < tabsCount; i++) {
            if(typeof (data.image) != "undefined") {
                chrome.tabs.sendMessage(tabs[i].id, {
                    "command" : "changeStaticBackgroundToOptionsPage",
                    "image" : data.image,
                    "theme" : data.theme
                });
            }
        }
    }, data);
}//BRW_PARTLY_changeBackgroundImageFileLoadComplete

/*From /pages/backend/theme.js*/ 
function BRW_PARTLY_changeBackgroundFlixerVideoFileComplete(data){
    getNetTabPages(reloadTabPages);
    getOptionsThemesTabPages(function(data) {
        var tabs = data.tabs;
        var tabsCount = tabs.length, i;
        var response = {
            "command" : "changeFlixerBackgroundToOptionsPage",
            "videoThemeId" : data.theme.id,
            "currentImage" : getBackgroundImageFile(),
            "currentImageResolution" : getBackgroundImageFileResolution(),
            "currentVideo" : getBackgroundVideoFile(),
            "currentVideoResolution" : getBackgroundVideoFileResolution()
        };
        for(i = 0; i < tabsCount; i++) {
            if(typeof (data.video) != "undefined") {
                chrome.tabs.sendMessage(tabs[i].id, response);
            }
        }
    }, data);
}//BRW_PARTLY_changeBackgroundFlixerVideoFileComplete

/*From /pages/backend/common.js*/ 
function BRW_getSettingsTabPages(callback, data){
    chrome.tabs.query({ url: chrome.extension.getURL("/pages/options/settings.html") }, function(tabs) {
        if (typeof(tabs) != "undefined") {
            if(callback) {
                data = data || {};
                data.tabs = tabs;
                callback(data);
            }
        }
    });
}//BRW_getSettingsTabPages

/*From /pages/backend/common.js*/ 
function BRW_getOptionsTabPages(callback, data) {
    chrome.tabs.query({ url: chrome.extension.getURL("/pages/options/options.html") }, function(tabs) {
        if (typeof(tabs) != "undefined") {
            if(callback) {
                data = data || {};
                data.tabs = tabs;
                callback(data);
            }
        }
    });
}//BRW_getOptionsTabPages

/*From /pages/backend/common.js*/ 
function BRW_getFavoriteTabPages(callback, data) {
    chrome.tabs.query({ url: chrome.extension.getURL("/pages/options/favorite.html") }, function(tabs) {
        if (typeof(tabs) != "undefined") {
            if(callback) {
                data = data || {};
                data.tabs = tabs;
                callback(data);
            }
        }
    });
}//BRW_getFavoriteTabPages

/*From pages/backend/backend.js*/
function BRW_loadBackgroundVideoFile(fs, sendResponse, defaultResponse) {
    var filePath = getBackgroundVideoFile();
    defaultResponse = defaultResponse || {
            "video" : "",
            "image" : "",
            "parallaxValue" : getBackgroundParallaxValue(),
            "visibleDials" : getVisibleSpeedDialPanel(),
            "displayDials" : getDisplaySpeedDialPanel(),

            "isFlixelVideoContent" : isBackgroundVideoFlixelContent(),
            "flixelVideoContentAuthor" : getBackgroundVideoFlixelContentAuthor(),
            
            "visibleTodoPanel" : getVisibleTodoPanel(),
            "displayTodoDialPanel" : getDisplayTodoDialPanel(),
            "displayTodoCoordinates" : getDisplayTodoCoordinates(),
            "displayTodoSize" : getDisplayTodoSize()
        };
    defaultResponse.enableParallax = getDisplayParallaxVideoTheme();
        
    if(filePath) {
        fs.root.getFile(filePath, {}, function (fileEntry) {
            defaultResponse.video = fileEntry.toURL();
            sendResponse(defaultResponse);
        }, function (error) {
            var filePath = getStorageBackgroundVideoFile();
            var resolution = getBackgroundVideoFileResolution();
            var backgroundType = getBackgroundVideoContentType();
            var themeId = getThemeIdByFilePath(filePath);
                        
            if(themeId && resolution) {
                if(backgroundType == flixelBackgroundType)
                    getFileSystem(changeBackgroundFlixerVideoFile, {sendResponse: sendResponse, themeId: themeId, resolution: resolution});
                else
                    loadThemeConfig(themeId, startDownloadResolutionVideoTheme, {"resolution" : resolution});
            } else
                sendResponse(defaultResponse);
        });
    } else
        sendResponse(defaultResponse);
}//BRW_loadBackgroundVideoFile

/*From pages/backend/backend.js*/
function BRW_getFavoriteCurentTab(callback) {
    chrome.tabs.getCurrent(function(tab) {
        favoriteTabId = tab.id;
        callback();
    });
}//BRW_getFavoriteCurentTab

//////////////////// COMMON FUNCTIONS ////////////////////

function BRW_openDefaultTab(mode){
    var URL = "chrome-search://local-ntp/local-ntp.html";
    
    if(localStorage.getItem("browser-mode") == "opera"){
        URL = "chrome://startpage/";
    }
    
    if(mode && mode == "_background"){
        chrome.tabs.create({
            url: URL,
            active: false,
        }, function(Tab){
            chrome.tabs.update(Tab.id, {
                url: URL
            });
        });
    }else{
        chrome.tabs.update({
            url: URL
        });
    }//else
}

/*From /pages/backend/common.js*/ 
function BRW_openUrlInCurrentTab(url){
    chrome.tabs.update({
        url: url
    });
}

/*From /pages/backend/common.js*/ 
function BRW_openUrlInNewTab(url){
    chrome.tabs.create({
        url: url,
        active: true
    });
}

/*From /pages/backend/common.js*/     
function BRW_openUrlInBackgroundTab(url){
    chrome.tabs.create({
        url: url,
        active: false
    });
}//BRW_openUrlInBackgroundTab

function BRW_openUrlInPrivateTab(url){
    chrome.windows.create({
        url: url,
        incognito: true
    });
}

/*From /pages/backend/common.js*/  
function BRW_translate(key) {
    return chrome.i18n.getMessage(key);
}//translate

function BRW_langLoaded(func){
    func.call(true, chrome.i18n.getUILanguage());    
}//BRW_langLoaded


function BRW_getAcceptLanguages(func){
    chrome.i18n.getAcceptLanguages(function(languages){
        func.call(false, languages);
    });
}//BRW_getAcceptLanguages

function BRW_getUILanguage(func){
    func.call(false, chrome.i18n.getUILanguage());
}//function

function BRW_TabsGetCurrentID(func){
    chrome.tabs.getCurrent(function(tab) {
        func.call(false, tab.id);
    });
}//BRW_TabsGetCurrentID

function BRW_urlTunnel(url){
    return url;
}//BRW_urlTunnel

//Universal request function
function BRW_ajax(url, successFunction, errorFunction, param){
    var dataType = 'json';
    if(param && param.xml) dataType = 'xml';
    if(param && param.text) dataType = 'text';
    
    var send = {
        type: "GET",
        url: url,
        contentType: "application/json; charset=utf-8",
        dataType: dataType,
        success: function (data) {
            if(successFunction)
                successFunction.call(true, data);
        },
        error: function (error) {
            //console.log(error);
            if(errorFunction)
                errorFunction.call(true, error);
        }
    };
    
    if(param){
        if(param.type) send.type = param.type;
        if(param.dataType) send.dataType = param.dataType;
        if(param.contentType) send.contentType = param.contentType;
        if(param.headers) send.headers = param.headers;
        if(param.data) send.data = param.data;
    }//if
    
    //console.log(send);
    
    var ajax = $.ajax(send);
    
    return ajax;
}//BRW_ajax

function BRW_json(url, successFunction, errorFunction, param){
    $.getJSON(url,function(e) {
        if(successFunction)
            successFunction(e);
    });
}//BRW_json

//Universal POST function
function BRW_post(url, data, successFunction, errorFunction){
    $.post(url, data, successFunction)
        .fail(function(e) {
            if(errorFunction) errorFunction(e);
        })
    ;
}//BRW_ajax

//Universal getFile function
function BRW_fsGetFile(fs, filePath, successFunction, errorFunction){
    fs.root.getFile(filePath, {}, function(fileEntry) {
        var url = fileEntry.toURL();
        if(successFunction)
            successFunction.call(true, url);
    }, function(error) { // background video not found on local fs and try download
        if(errorFunction)
            errorFunction.call(true, error);
    });
}//BRW_fsGetFile

function BRW_fsRemoveFile(folder, fileName, sFunc, eFunc){
     getFileSystem(function(fs, data) {
          fs.root.getFile(folder+'/'+fileName, {create: false}, function(fileEntry) {
                fileEntry.remove(function() {
                    console.log('File removed. '+folder+'/'+fileName);
                }, function(){//delete error
                    console.log('Can`t delete: '+folder+'/'+fileName);
                });
          }, function(){//cant foud
              //console.log('Can`t found: '+folder+'/'+fileName);
          });
     });
    
}//function

function BRW_setVideoPosterImage(){
    return true;
}


//Load static XML file
function loadStaticXML(fileUrl, callbackSuccess, callbackError) {
    $.ajax({
        type: "GET",
        url: fileUrl,
        dataType: "xml",
        success: function (xml) {
            if(callbackSuccess) 
                callbackSuccess(xml);
        },
        error: function() {
            if(callbackError)
                callbackError();
        }
    });
}//loadStaticXML

function FF_whileLoaded(execFunction, condFunction, obj){
    execFunction.call(); 
}
/*
chrome.tabs.onActivated.addListener(function(){
    BRW_getNetTabPages(function(data){
        chrome.runtime.sendMessage({
            command: "pageBgVideoControl",
            tabs : data.tabs
        });        
    });
});
*/

/*
chrome.tabs.onActivated.addListener(function(){
    chrome.tabs.getCurrent(function(currentTab){
        BRW_getNetTabPages(
            function(data){
                if(data.tabs) for(let key in data.tabs){
                    //console.log(data.tabs[key].id + " vs " + currentTab.id);
                    if(data.tabs[key].id != currentTab.id){//pause
                        chrome.tabs.sendMessage(data.tabs[key].id, {
                            command: "pageBgVideoControl",
                            action : "deactivate"
                        });
                    }else{//play
                        //chrome.runtime.sendMessage({
                        chrome.tabs.sendMessage(data.tabs[key].id, {
                            command: "pageBgVideoControl",
                            action : "activate"
                        });
                    }//else
                }//if for
            },{
                current: currentTab.id
            }
        );
    });
});
*/

function checkH264(){
    var h264 = localStorage.getItem("html5-video-h264") || false;
    if (h264 == true || h264 == "true") return true;
    return false;
}

function mp4ToWebm(src){
    var url = String(src);
    
    if(checkH264()) return url;
    
    if(url.indexOf('flixels.s3.amazonaws.com') > -1 && url.indexOf('.mp4') > -1){
        url = url.replace('.tablet.mp4', '.webm').replace('.hd.mp4', '.webm').replace('.phone.mp4', '.webm');
    }
    
    return url;
}

function html5VideoDetectH264(){
    var v = document.createElement('video');
    
    if(v.canPlayType && v.canPlayType('video/mp4').replace(/no/, '')) {
       return true;
    }

    return false;
}//function


function BRW_setFullScreen(data){
    var State = data.mode == "fullscreen" ? "fullscreen" : "maximized";
    
    chrome.windows.getCurrent(/*object getInfo, */function(Window){
        chrome.windows.update(Window.id, {state:State}, function(){
            //console.log("updated");
        });

        /*
        setTimeout(function(){
            chrome.windows.update(Window.id, {state:"minimized"}, function(){
                console.log("minimized");
            });
        }, 3000);
        */

    });
}

var afterInstallIsActivated = false;
function BRW_routeAfterAppInstall(){
    if(browserName() == 'chrome'){
        currentThemeId(function(currentTheme) {
            if(currentTheme){
                checkChromeThemeForVideo(
                    currentTheme, 
                    function(){//succes
                        localStorage.setItem("settings-background-current-tab", 3);
                        localStorage.removeItem("available-themes-data-next-update");
                        localStorage.removeItem("flixel-themes-data-next-update");
                        
                        getAvailableThemesList(sendUpdatedAvailableThemes, {search:false, sendResponse:function(){
                            getFlixelThemesList(sendUpdatedFlixelThemes, {sendResponse : function(){
                                afterInstallIsActivated = true;
                                //console.log("Need to install theme!");
                                BRW_openPageAfterAppInstall();
                                //openUrlInNewTab(chrome.extension.getURL("/pages/newtab/newtab.html"));
                            }});
                        }});                        
                    }, 
                    function(){//no thteme
                        BRW_openPageAfterAppInstall();
                    }
                );
            }else{
                BRW_openPageAfterAppInstall();
            }
        });
    }else{
        BRW_openPageAfterAppInstall();
    }
    
    setTimeout(function(){
        if(!afterInstallIsActivated) BRW_openPageAfterAppInstall();
    }, 10000);
}

function BRW_openPageAfterAppInstall(){
    afterInstallIsActivated = true;
    
    var installDate = localStorage.getItem("install-key");
    var nowDate = new Date; nowDate = nowDate.getTime();
    var alterPage = chrome.extension.getURL("/pages/newtab/newtab.html");//"/pages/options/options.html";
    
    if(
        /*((nowDate - installDate) < 10000) &&*/
        !localStorage.getItem("install-interesting-theme")
    ){
        BRW_historyItems(
            function(visitedURLs){
                var themeId = false;
                
                for(var k in visitedURLs){
                    var url = String(visitedURLs[k].url);
                    
                    //url = "http://livestartpage.com/themes/world-of-worcraft-III?theme_id=adaef154ffe9ee88d56f4876ea75561c";
                    
                    //b27e410768f70fd20504bae6beb4e371";//5e7eb99a3f84d435f24594b6ef7472d9"//ed339a2bd0f76c8cfe0063f3a1e52f56;//DELETE ME!!!!!!!!!!!!!!!!
                    //image kaihobkfiojgflipfceoegdjbmopfhko
                    
                    if(url.indexOf("livestartpage.com/") > -1){
                        var u = new URL(url);
                        
                        if(u.search){
                            var params = String(u.search.replace('?', '')).split('&');
                            
                            for(var k2 in params){
                                var v2 = params[k2].split('=');
                                
                                if(v2[0] == 'theme_id'){
                                    themeId = v2[1];
                                }//if
                            }//for
                        }//if
                        
                        if(themeId) break;
                    }//if
                }//for
                
                if(themeId){
                    loadFrontThemeConfig(themeId, function(themeData){
                        
                        localStorage.setItem("install-interesting-theme", themeId);

                        if(themeData){
                            //themeData.handmade = 1;
                            //themeData.contentType = 3;

                            if(themeData.bgPoster) themeData.bgPoster     = getFullThemesContentUrl(themeData.id, themeData.bgPoster);
                            if(themeData.bgFileThumb) themeData.bgFileThumb  = getFullThemesContentUrl(themeData.id, themeData.bgFileThumb);
                            if(themeData.bgVideoThumb) themeData.bgVideoThumb = getFullThemesContentUrl(themeData.id, themeData.bgVideoThumb);
                            
                            if(themeData.bgVideoPath){
                                if(themeData.bgVideoPath['640' ])
                                    themeData.bgVideoPath['640' ] = getFullThemesContentUrl(themeData.id, themeData.bgVideoPath['640' ]);
                                if(themeData.bgVideoPath['640' ])
                                    themeData.bgVideoPath['1024'] = getFullThemesContentUrl(themeData.id, themeData.bgVideoPath['1024']);
                                if(themeData.bgVideoPath['1920'])
                                    themeData.bgVideoPath['1920'] = getFullThemesContentUrl(themeData.id, themeData.bgVideoPath['1920']);
                            }//if
                        }//if
                        
                        localStorage.setItem("install-interesting-theme-data", JSON.stringify(themeData));

                        setTimeout(function() {
                            openUrlInNewTab(chrome.extension.getURL("/pages/newtab/newtab.html"));
                        }, 951);
                    });
                }else{
                    openUrlInNewTab(alterPage);
                }//else
            }//function
        );
    }else{
        openUrlInNewTab(alterPage);
    }//else
}

//getLocationByService();