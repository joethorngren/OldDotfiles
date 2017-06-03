/**
 * Chrome application backend
 * run once when application start
 */
(function() {    
    /*Moved to browser choiser*/
    BRW_browserbrowserActionOnClicked();

    /**
     * Chrome tab update
     */
    /*chrome.tabs.onUpdated.addListener(function listener(tabId, changedProps) {
        if (changedProps.status != "complete") return;
        chrome.tabs.get(tabId, function(tab) {
            var pattern = new RegExp("(http://|https://)");
            if(typeof(tab) != "undefined" && typeof(tab.url) != "undefined" && pattern.test(tab.url)) {
                analyzeHistory(takePageScreen, getAnalyzeHistoryLength(), {"activeTab" : tab});
            }
        });
    });*/
    
    
    /**
     * Message listener from content scripts
     */
    
    /*Moved to browser choiser*/
    BRW_onMessageAddListener();
    
    localStorage.setItem("just-opened", 1);
})();

    /**
     * Take visit page screen
     * take site page image if site
     * in top of user visits
     *
     * @param mostVisitedURLs Array
     * @param data Object
     */
    function takePageScreen(mostVisitedURLs, data) {
        
        if(typeof(data.activeTab) != "undefined") {
            var tab = data.activeTab;
            var historyLength = mostVisitedURLs.length;
            var maxAnalyzeTilesCount = getAnalyzeLastTilesCount();
            var analyzedLastTiles = 0;
            var isTopTileUrl = false;
            if(historyLength >= getDisplayTilesLength()) {
                for (var i = 0; i < historyLength; i++) {
                    if(analyzedLastTiles > maxAnalyzeTilesCount) break;
                    if(typeof(mostVisitedURLs[i]) != "undefined") {
                        var mv = mostVisitedURLs[i];
                        if(checkTileFormat(mv)) {
                            if(mv.url == tab.url) {
                                isTopTileUrl = true;
                                break;
                            }
                            analyzedLastTiles++;
                        }
                    }
                }
            } else
                isTopTileUrl = true;

            if(isTopTileUrl) {
                var currentUrl = data.activeTab.url;
                setTimeout(function() {
                    chrome.tabs.get(tab.id, function(tabInfo) {
                        if(tabInfo.url == currentUrl &&  tabInfo.active) {
                            chrome.tabs.captureVisibleTab(function (screenShotUrl) {
                                getDb().transaction(function (tx) {
                                    tx.executeSql('DELETE FROM IMAGES WHERE url = ?', [tabInfo.url]);
                                    tx.executeSql('INSERT INTO IMAGES (id, url, image) VALUES (?,?,?)', [new Date().getTime(), tabInfo.url, screenShotUrl]);
                                });
                            });
                        }
                    });
                }, 1000);
            }
        }
    }



    /**
     * Update dial thumb by type
     *
     * @param tiles Array
     * @param imageObj Object (optional)
     */
    function updateDialThumbByType(tiles, imageObj, schemeObj, forceMode, passive) {
        //console.debug("updateDialThumbByType", tiles, imageObj, schemeObj, forceMode);
        
        if(tiles.length == 1) {
            var tile = tiles[0];
            var dialId = tile.dialId;
            
            if(passive && typeof thumbUpdatePassive == "object" && thumbUpdatePassive.indexOf(dialId) == -1) thumbUpdatePassive.push(dialId);
            
            if(dialId) {
                BRW_dbTransaction(function (tx) {
                    BRW_dbSelect(
                        {//Param
                            tx : tx,
                            from    :  'DIALS',
                            where   : {
                                'id'   : dialId
                            }
                        },
                        function(results){//Success
                            var imagesResults = results.rows;
                            var imagesResultsLength = imagesResults.length;
                            
                            if(imagesResultsLength) {
                                for (var i = 0; i < imagesResultsLength; i++) {
                                    var dial = imagesResults[i];
                                    
                                    //if(forceMode) tile.forceMode = forceMode;
                                    
                                    if(
                                        tile.thumbType
                                        &&
                                        forceMode && forceMode == "auto" 
                                    ){
                                        tile.thumbType = null;
                                    }
                                    
                                    if(dial.url){
                                        if(isLocalResourceUrl(dial.url)) dial.thumbType = showDialTextThumb;
                                        else if(isAmazonProductURL(dial.url)){
                                            if(
                                                !localStorage.getItem("sync-progress")
                                                ||
                                                [showDialTextThumb, showDialGalleryThumb].indexOf(dial.thumbType) > -1
                                            ){
                                                dial.thumbType = showDialScreenThumb;
                                            }
                                        }
                                    }
                                    
                                    if(typeof schemeObj == "object"){
                                        tile.colorScheme = schemeObj;
                                        dial.bg_color = schemeObj.color;
                                        dial.text_color = schemeObj.backgroundColor;
                                    }
                                    
                                    if(typeof imageObj == "object"){
                                        tile.thumbType = 2;
                                        loadCustomThumbImage(tile, imageObj);
                                    }else{
                                        if(forceMode == "text" || (dial.thumbType == showDialTextThumb && forceMode != "auto")) {//dial.thumb_type
                                            tile.thumbType = showDialTextThumb;
                                            getTextSitesThumbs([tile]);
                                        } else if(dial.thumbType == showDialGalleryThumb) {//dial.thumb_type
                                            tile.thumbType = showDialGalleryThumb;
                                            getEverhelperSitesThumbs([tile]);
                                        } else if(dial.thumbType == showDialScreenThumb) {//dial.thumb_type
                                            tile.thumbType = showDialScreenThumb;
                                            getEverhelperOrLiveSitesThumbs([tile]);
                                        } else {
                                            updateDialThumbByDefaultType(tiles);
                                        }
                                    }
                                }
                            } else {
                                updateDialThumbByDefaultType(tiles);
                            }
                        }       
                    );
                });
            } else {
                updateDialThumbByDefaultType(tiles);
            }
        } else {
            updateDialThumbByDefaultType(tiles);
        }
    }

    /**
     * Update dial thumb by default type
     *
     * @param tiles Array
     */
    function updateDialThumbByDefaultType(tiles) {
        getNewSpeedDialThumbType(function(newDialThumbType) {
            if(tiles && tiles.length == 1){
                if(isAmazonProductURL(tiles[0].url)) newDialThumbType = speedDialThumbTypeAutopreviewText;
            }
            
            if(newDialThumbType == speedDialThumbTypeText) {
                getTextSitesThumbs(tiles);
            } else if(newDialThumbType == speedDialThumbTypeAutopreviewText) {
                getLiveSitesThumbs(tiles);
            } else if(newDialThumbType == speedDialThumbTypeGalleryText) {
                getEverhelperSitesThumbs(tiles);
            } else if(newDialThumbType == speedDialThumbTypeGaleryAutoprevText) {
                getEverhelperOrLiveSitesThumbs(tiles);
            }
            
        });
    }

    /**
     * Send updated available themes list
     *
     * @param data String
     */
    function sendUpdatedAvailableThemes(data) {
        currentThemeId(getInstalledThemesData, {sendResponse : data.sendResponse, getCurrentThumb: false, getCurrentTheme: true});
    }

    /**
     * Send updated Flixel themes list
     *
     * @param data String
     */
    function sendUpdatedFlixelThemes(data) {
        
        data.sendResponse({});
    }

    /**
     * Get background new page params
     *
     * @param sendResponse Function
     * @returns Object
     */
    function getBackgroundNewPageParams(sendResponse) {
        
        var result = {
            "currentAppInstalled" : getAppInstalledDate(),
            "currentDownloadImage" : getDownloadImageThemeStatus(),
            "currentDownloadVideo" : getDownloadVideoThemeStatus(),
            "displayTilesCount" : getDisplayTilesCount(),
            "displayVideoTheme" : getDisplayVideoTheme(),
            "displayParallaxVideoTheme" : getDisplayParallaxVideoTheme(),
            "displaySpeedDialPanel" : getDisplaySpeedDialPanel(),
            "visibleTodoPanel" : getVisibleTodoPanel(),
            "displayTodoDialPanel" : getDisplayTodoDialPanel(),
            "displayTodoCoordinates" : getDisplayTodoCoordinates(),
            "displayTodoSize" : getDisplayTodoSize()
        };
        sendResponse(result);
    }

    /**
     * Load background file video
     *
     * @param fs FileSystem
     * @param sendResponse
     * @param defaultResponse Object
     */
    /*Moved to browser choiser*/
    function loadBackgroundVideoFile(fs, sendResponse, defaultResponse) {
         BRW_loadBackgroundVideoFile(fs, sendResponse, defaultResponse);
    }

    /**
     * Load background file image
     *
     * @param fs FileSystem
     * @param sendResponse
     * @param defaultResponse Object
     */
    function loadBackgroundImageFile(fs, sendResponse, defaultResponse) {
        defaultResponse = defaultResponse || {
                "image" : "",
                "parallaxValue" : getBackgroundParallaxValue(),
                "visibleDials" : getVisibleSpeedDialPanel(),
                "displayDials" : getDisplaySpeedDialPanel(),

                "visibleTodoPanel" : getVisibleTodoPanel(),
                "displayTodoDialPanel" : getDisplayTodoDialPanel(),
                "displayTodoCoordinates" : getDisplayTodoCoordinates(),
                "displayTodoSize" : getDisplayTodoSize()
            };
        defaultResponse.enableParallax = getDisplayParallaxVideoTheme();

        var filePath = getBackgroundImageFile();
        if(filePath) {
            BRW_fsGetFile(fs, filePath, 
                function(fileURL){//Success, file found
                    defaultResponse.image = fileURL;
                    sendResponse(defaultResponse);
                },
                function(fileURL){//File NOT found
                    var filePath = getStorageBackgroundImageFile();
                    var resolution = getBackgroundImageFileResolution();
                    var themeId = getThemeIdByFilePath(filePath);
                    if(themeId && resolution) {
                        getFileSystem(changeBackgroundImageFile, {sendResponse: sendResponse, themeId: themeId});
                    } else
                        sendResponse(defaultResponse);
                }         
            );
        } else
            sendResponse(defaultResponse);
    }

    /**
     * Load random background file
     *
     * @param fs FileSystem
     * @param sendResponse Function
     * @param defaultResponse Object
     */
    function loadRandomBackgroundFile(fs, sendResponse, defaultResponse) {
        var currentVideo = getBackgroundVideoFile();
        var currentImage = getBackgroundImageFile();
        var installedThemes = getInstalledThemes();
        var favoriteThemes = getFavoriteThemesObject();
        var favoriteInstalledThemes = [];
        var activeTheme;
        var displayCurrentBackgroundFile = getDisplayCurrentBackgroundFile();
        var randomFilter = getRandomThemesFilter();
        
        if(getRandomThemesDisplay() == 2){//show all downloaded themes
            favoriteThemes = installedThemes;
        }//if
        
        
        if(randomFilter != "both"){
            //console.debug(randomFilter);
            favoriteThemes = themesListFilter(favoriteThemes, randomFilter);
            installedThemes = themesListFilter(installedThemes, randomFilter);
        }
        
        if(getArrayLength(installedThemes) && getArrayLength(favoriteThemes)) {
            for(var i in installedThemes) {
                var installedTheme = installedThemes[i];
                var isActiveVideoTheme = currentVideo && currentVideo.indexOf(installedTheme['id']) >= 0;
                var isActiveImageTheme = currentImage && currentImage.indexOf(installedTheme['id']) >= 0;
                
                if(
                    (typeof (favoriteThemes[installedTheme['id']]) != "undefined")
                    || 
                    (
                        (!getArrayLength(favoriteThemes)) &&
                        (isActiveVideoTheme || isActiveImageTheme)
                    )
                ){
                    favoriteInstalledThemes.push(installedTheme);
                    if(isActiveVideoTheme || isActiveImageTheme)
                        activeTheme = installedTheme;
                }
            }
        }

        var favoriteInstalledTheme;
        var favoriteInstalledThemeLength = getArrayLength(favoriteInstalledThemes);

        if(favoriteInstalledThemeLength) {
            if(displayCurrentBackgroundFile && activeTheme) {
                favoriteInstalledTheme = activeTheme;
            } else {
                var index = Math.floor(Math.random()*favoriteInstalledThemes.length);
                favoriteInstalledTheme = favoriteInstalledThemes[index];
            }
            

            if(favoriteInstalledThemeLength > 1) { // skip random repeats
                var lastRandomThemesId = getLastRandomThemesId();
                if(lastRandomThemesId && lastRandomThemesId == favoriteInstalledTheme['id']) {
                    index++;
                    if(index >= favoriteInstalledThemeLength)
                        index = 0;
                    favoriteInstalledTheme = favoriteInstalledThemes[index];
                }
            }
        }

        if(displayCurrentBackgroundFile)
            clearDisplayCurrentBackgroundFile();

        var contentResolution, filePath;
        var isVideoContent = false;
        var isFlixelVideoContent = false;
        var flixelVideoContentAuthor = "";
        
        if(favoriteInstalledTheme) {
            var bgVideoPath = favoriteInstalledTheme['bgVideoPath'];
            var bgImagePath = favoriteInstalledTheme['bgFilePath'];

            if(getArrayLength(bgVideoPath) && getArrayLength(bgImagePath)) {
                isVideoContent = Math.round(Math.random());
                if(isVideoContent) {
                    isVideoContent = true;
                    if(favoriteInstalledTheme['lastInstallBgVideo'])
                        contentResolution = favoriteInstalledTheme['lastInstallBgVideo']['resolution'];
                    else
                        contentResolution = getArrayFirstKey(favoriteInstalledTheme['bgVideoPath']);

                    if(contentResolution)
                        filePath = getBackgroundFile(favoriteInstalledTheme['id'], favoriteInstalledTheme['bgVideoPath'][contentResolution]);
                    if(favoriteInstalledTheme['author'])
                        flixelVideoContentAuthor = favoriteInstalledTheme['author'];
                    if(favoriteInstalledTheme['isFlixelContent'])
                        isFlixelVideoContent = favoriteInstalledTheme['isFlixelContent'];
                } else {
                    isVideoContent = false;
                    contentResolution = getArrayFirstKey(favoriteInstalledTheme['bgFilePath']);
                    if(contentResolution)
                        filePath = getBackgroundFile(favoriteInstalledTheme['id'], favoriteInstalledTheme['bgFilePath'][contentResolution]);
                }
            } else if(getArrayLength(bgVideoPath)) {
                isVideoContent = true;
                if(favoriteInstalledTheme['lastInstallBgVideo'])
                    contentResolution = favoriteInstalledTheme['lastInstallBgVideo']['resolution'];
                else
                    contentResolution = getArrayFirstKey(favoriteInstalledTheme['bgVideoPath']);

                if(contentResolution)
                    filePath = getBackgroundFile(favoriteInstalledTheme['id'], favoriteInstalledTheme['bgVideoPath'][contentResolution]);
                if(favoriteInstalledTheme['author'])
                    flixelVideoContentAuthor = favoriteInstalledTheme['author'];
                if(favoriteInstalledTheme['isFlixelContent'])
                    isFlixelVideoContent = favoriteInstalledTheme['isFlixelContent'];
            } else if(getArrayLength(bgImagePath)) {
                isVideoContent = false;
                contentResolution = getArrayFirstKey(favoriteInstalledTheme['bgFilePath']);
                if(contentResolution)
                    filePath = getBackgroundFile(favoriteInstalledTheme['id'], favoriteInstalledTheme['bgFilePath'][contentResolution]);
            }
        }

        if(favoriteInstalledTheme && contentResolution && filePath) {
            setLastRandomThemesId(favoriteInstalledTheme['id']);
            
            
            defaultResponse = defaultResponse || {
                    "video" : "",
                    "image" : "",
                    "parallaxValue" : getBackgroundParallaxValue(),
                    "visibleDials" : getVisibleSpeedDialPanel(),
                    "displayDials" : getDisplaySpeedDialPanel(),

                    "isFlixelVideoContent"     : isFlixelVideoContent,
                    "flixelVideoContentAuthor" : flixelVideoContentAuthor,
                    "handmade"                 : favoriteInstalledTheme.handmade,

                    "visibleTodoPanel" : getVisibleTodoPanel(),
                    "displayTodoDialPanel" : getDisplayTodoDialPanel(),
                    "displayTodoCoordinates" : getDisplayTodoCoordinates(),
                    "displayTodoSize" : getDisplayTodoSize()
                };
            defaultResponse.enableParallax = getDisplayParallaxVideoTheme();
                        
            if(filePath) {
                BRW_fsGetFile(fs, filePath, 
                    function(fileURL){//Success, file found
                        if(isVideoContent)
                            defaultResponse.video = fileURL;
                        else
                            defaultResponse.image = fileURL;
                        
                        sendResponse(defaultResponse);
                    },
                    function(error){//File NOT found
                        //defaultResponse.video = video;
                        //defaultResponse.image = video.replace('hd.mp4', 'thumbnail.jpg').replace('webm', 'thumbnail.jpg');
                        //var video = extensionGetUrl("/default-content/video/"+downloadedLiveBackgroundContent.lastInstallBgVideo.fileName);
                        
                        sendResponse(defaultResponse);
                        
                        setTimeout(function(){
                            if(getBackgroundVideoFile() && getDisplayVideoTheme())
                                getFileSystem(loadBackgroundVideoFile, sendResponse);
                            else
                                getFileSystem(loadBackgroundImageFile, sendResponse);                    
                        }, 150);
                        
                    }         
                );
            } else
                sendResponse(defaultResponse);
        } else {
            if(getBackgroundVideoFile() && getDisplayVideoTheme())
                getFileSystem(loadBackgroundVideoFile, sendResponse);
            else
                getFileSystem(loadBackgroundImageFile, sendResponse);
        }
    }


if (BROWSER == "chrome") {
    //Save sessions

    var EventN = 0,
        WriteStop = true,
        removedWindows = [];

    chrome.storage.local.get("current", function (result) {
        //console.log("LAST", result);
        if (result['current']){
            var Last, upd=0;
            
            for(var key in result['current']){
                if(result['current'][key].updated > upd){
                    Last = result['current'][key].tabsList;
                    upd  = result['current'][key].updated;
                }
            }
            
            if(Last){
                chrome.storage.local.set({
                    last    : Last,
                    target  : "self"
                });
            }//if
        }
        /*
        */
        WriteStop = false;
    });

    chrome.windows.onRemoved.addListener(function (windowId) {
        removedWindows.push(windowId);
        
        chrome.storage.local.get("current", function (result) {
            if (result['current']) for(var key in result['current']){
                if(result['current'][key]['windowId'] == windowId){
                    
                    chrome.storage.local.set({
                        last   : result['current'][key].tabsList,
                        target : "window"
                    });
                    
                    localStorage.setItem("just-opened", 1);
                    localStorage.setItem("page-show-loading", 1);
                    
                    BRW_sendMessage({
                        command: "getPreviousSession", 
                        restore:false
                    });
                    
                    break;
                }//if
            }//if for
        });
    });

    chrome.tabs.onActivated.addListener(chromeTabsChange);
    chrome.tabs.onReplaced.addListener(chromeTabsChange);
    chrome.tabs.onAttached.addListener(chromeTabsChange);
    chrome.tabs.onDetached.addListener(chromeTabsChange);
    //chrome.tabs.onUpdated.addListener(chromeTabsChange);
    chrome.tabs.onCreated.addListener(chromeTabsChange);
    chrome.tabs.onMoved.addListener(chromeTabsChange);
    
    function chromeTabsChange(reason) {
        if (!WriteStop) WriteStop = true;
        else return false;

        setTimeout(function () {
            WriteStop = false;

            chrome.tabs.getAllInWindow(function (Tabs) {
                if (Tabs.length && Tabs[0].id != -1) {
                    var tabsList = [], windowId=false;

                    //console.info("Tabs: "+Tabs.length, Tabs[0].id);

                    for (let Tab of Tabs)
                        if (removedWindows.indexOf(Tab.windowId) == -1) {
                            
                            windowId = Tab.windowId;
                            
                            tabsList.push({
                                id: Tab.id,
                                url: Tab.url,
                                index: Tab.index,
                                pinned: Tab.pinned,
                                selected: Tab.selected,
                            });
                        }

                    if (tabsList.length) {
                        chrome.storage.local.get(["current", "last"], function (result) {
                            var current = result.current || {};
                            
                            current[windowId] = {
                                windowId: windowId,
                                updated : Date.now(),
                                tabsList: tabsList
                            }//if
                            
                            chrome.storage.local.set({
                                current: current
                            });
                        });
                    }
                } //if
            });
        }, 1000);

    }
    
    chrome.tabs.onUpdated.addListener(function(tabId, change){
        if(change.title && String(change.title).indexOf('###EVERFAUTH:{"errorCode":0') > -1){
            setTimeout(function(){
                chrome.tabs.remove(tabId);
            }, 500);
        }//if
    });
    
    /*   Context menu    */
    
    chrome.contextMenus.create({
        title: chrome.i18n.getMessage("context_menu_add"),
        contexts:["all"],
        onclick: function(tab, page){
            addCurrentTabToDefaultBg();
        }
    });
    
    chrome.contextMenus.create({
        title: chrome.i18n.getMessage("context_menu_all"),
        contexts:["all"],
        onclick: function(tab, page){
            saveTabsToNewGroupBg();
        }
    });
    
    // Add version cookie
    chrome.cookies.set({ 
        url: "https://livestartpage.com",
        name: "lsp-addon-version",
        value: chrome.app.getDetails().version,
        expirationDate: (2592000 + Date.now() / 1000)
    });
    
    localStorage.setItem("addon-version", chrome.app.getDetails().version);
    
    
}
