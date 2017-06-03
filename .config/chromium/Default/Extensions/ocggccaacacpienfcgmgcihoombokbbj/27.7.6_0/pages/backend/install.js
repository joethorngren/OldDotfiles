/**
 * Application install page
 * get sites preview from external resource
 */

    var startTiles = [], startIds,
        printScreensBuildTimeout,
        liveScreensBuildTimeout,
        installService,
        installWindow,
        loadedTiles,
        everhelperInstall,
        textDialsInstall,
        everhelperLiveInstall
    ;

    /**
     * Check install mode
     * start load thumbs
     * for history items
     */
    //startApplication();
    startApplicationService();

    /**
     * Start application with service
     * for print screen
     */

    //m START
    function startApplicationService() {
        setAppUninstallHandler();
        setTilesColorSchemes();
        
        var installKey = localStorage.getItem("install-key") || false;
        
        if (!installKey) {
            //console.debug("No Install Key");
            
            storageBackup(
                function(){//has backup
                    console.debug("Storage Backup");
                },
                function(){//no backup
                    analyzeHistory(getSitesThumbEverhelperService);
                    sendGoogleAnalyticInstallApp();
                                        
                    localStorage.setItem("install-key", new Date().getTime());
                    
                    setApplicationRatingShowStartTime();
                    
                    currentThemeId(function(currentTheme) {
                        BRW_setDefaultDownloadedLiveBackground(currentTheme, downloadedLiveBackgroundContent);
                    });

                    setDefaultGroup(setDefaultDials);
                    setTimeout(function() {
                        getNetTabPages(refreshNewTabPages);
                        currentThemeId(tryLoadBackgroundImage);
                    }, 1500);
                }
            );
        } else {
            //console.debug("Has Install Key");
            getNetTabPages(refreshNewTabPages);
            currentThemeId(tryLoadBackgroundImage);

            if(Date.now() - installKey < 60000 && !localStorage.getItem("default-content-installed")){
                currentThemeId(function(currentTheme) {
                    BRW_setDefaultDownloadedLiveBackground(currentTheme, downloadedLiveBackgroundContent);
                });
            }
        }
        
        
    }

    /**
     * Start application
     */
    //m START
    function startApplication() {
        /* !!! Depricated by startApplicationService !!! */
        
        getNetTabPages(refreshNewTabPages);
        currentThemeId(tryLoadBackgroundImage);
        setAppUninstallHandler();
        
        var installKey = localStorage.getItem("install-key");
        
        if (!installKey) {
            analyzeHistory(getSitesThumb);
            sendGoogleAnalyticInstallApp();
            localStorage.setItem("install-key", new Date().getTime());
            setApplicationRatingShowStartTime();
            

        }
        
        if(
            (!installKey || Date.now() - installKey < 60000)
            &&
            (!localStorage.getItem("default-content-installed"))
        
        ){
            currentThemeId(function(currentTheme) {
                BRW_setDefaultDownloadedLiveBackground(currentTheme, downloadedLiveBackgroundContent);
            });
        }
        
        
    }

    /**
     * Set application uninstall handler
     */
    
    //m START
    /*Moved to browser choiser*/
    function setAppUninstallHandler(){
        BRW_setAppUninstallHandler();
    }
    
    /**
     * Set default downloaded live background
     *
     * @param currentTheme String
     * @param defaultContent Object
     */
    //m START
    /*Moved to browser choiser*/
    function setDefaultDownloadedLiveBackground(currentTheme, defaultContent) {
        BRW_setDefaultDownloadedLiveBackground(currentTheme, defaultContent);
    }

    /**
     * Get available themes list
     *
     * @param callback Function
     * @param data Object
     */
    function getAvailableThemesList(callback, data) {
        var nextUpdate  = localStorage.getItem("available-themes-data-next-update");
        var currentTime = new Date().getTime();
        var sortType    = getRouteSortType();
        var themeTabId = getSettingsBackgroundTabId();
        
        if(!data.search && nextUpdate && nextUpdate > currentTime) {
            if(callback)
                callback(data);
        } else {
            if(sortType == 2 || themeTabId == 3 || (localStorage.getItem("pending-themes-reload") && themeTabId != 0)){//featured themes
                
                if(themeTabId == 3){// task 459
                    //if(parseInt(sortType) == 0) sortType = 2; // task 
                    var url = getFlixelChanelUrl(0, sortType);
                }else{
                    var url = getThemesListApiUrl();
                }
                
                //var url = getThemesListApiUrl();
                                
                if(themeTabId == 0 && sortType == 2) localStorage.removeItem("pending-themes-reload");
                
                
                //if(sortType == 2) localStorage.removeItem("full-reload-pending");
                
            }else if(sortType == 4){//search themes
                var url = getFlixelChanelUrl(0, 1);
                url += "&top=1&search="+data.search;
            }else{
                var nextPage = getFlixelContentNextPage();
                var url = getFlixelChanelUrl(nextPage);
            }
                        
            var xhrAvailableContent = new XMLHttpRequest();
            
            xhrAvailableContent.open('GET', url, true);
            xhrAvailableContent.onload = function () {
                if(xhrAvailableContent.readyState == 4) {
                    if (this.status == 200) {
                        if(this.response) {
                            var response = JSON.parse(this.response);
                            
                            if(
                                ((sortType < 2 || sortType > 3) && response && themeTabId != 3)
                                || (themeTabId == 3)// task 459
                                // || (themeTabId == 3 && sortType == 0)// task 459
                            ){
                                response.flixel_top = response.results;
                                response.flixel_count = response.count;
                            }//if
                            
                            if(sortType == 3){//downloaded themes
                                response.flixel_top = [];
                            }//if
                            
                            if(themeTabId == 3 && parseInt(sortType) == 0){
                                //for(var k0 in response.results) response.results[k0].title = response.results[k0].updated_at || response.results[k0].created_at;
                                //console.debug(response.results);
                                
                                response.results.sort(
                                    function (x, y) {
                                        var xDate = Date.parse(x['updated_at']) || Date.parse(x['created_at']) || 0;
                                        var yDate = Date.parse(y['updated_at']) || Date.parse(y['created_at']) || 0;
                                        
                                        return yDate - xDate;
                                    }
                                );
                            }
                            
                            
                            //console.info("checkH264", checkH264());
                            if(!checkH264()){
                                for(var nm in {results:1, body:1, flixel_top:1}) if(response[nm]){
                                    var len = response[nm].length - 1;
                                    if(len > 0) for(h = len; h--; h >= 0) if(response[nm][h].handmade == 1){
                                        if(response[nm][h].webm_video_enable){
                                            delete response[nm][h].video_hd;// = response[nm][h].webm_video_hd;
                                            response[nm][h].video_tablet = response[nm][h].webm_video_hd;
                                            response[nm][h].fullHd = 0;
                                            response[nm][h].video_phone = response[nm][h].webm_video_preview;
                                            
                                        }else{
                                            response[nm].splice(h, 1);
                                        }
                                    }
                                }
                            }
                            
                            
                            // save live video data
                            currentTime = new Date().getTime();
                            
                            if(getSettingsBackgroundTabId() == 3){//chrome theme
                                var liveThemesIDs = JSON.parse(localStorage.getItem("live-themes-ids") || "[]");
                                
                                for(var nm in {results:1, body:1, flixel_top:1}) if(response[nm]){
                                    for(var h in response[nm]){
                                        if(response[nm][h]['chromeThemeUrl'] && response[nm][h]['chromeThemeUrl'].length){
                                            response[nm][h]['contentType'] = liveThemesType;
                                            //console.debug(response[nm][h]);
                                            if(liveThemesIDs.indexOf(response[nm][h]['hash']) === -1){
                                                liveThemesIDs.push(response[nm][h]['hash']);
                                            }
                                        }
                                    }
                                }
                                
                                if(liveThemesIDs.length){
                                    localStorage.setItem("live-themes-ids", JSON.stringify(liveThemesIDs.slice(0, 350)));
                                }
                            }
                            
                            if(response.body){
                                localStorage.setItem("available-themes-data", JSON.stringify(response.body));
                                
                                if(response.body.length > 10){
                                    localStorage.setItem("available-themes-data-next-update", currentTime + themesApiCacheTime);
                                }else{
                                    localStorage.setItem("available-themes-data-next-update", currentTime + themesApiCacheTime);
                                    //localStorage.setItem("available-themes-data-next-update", currentTime + 1000);
                                }
                            }//if
                            
                            
                            // save top flixel data
                            var saveContent = {"results" : []};
                            var availableFlixerContent = response.flixel_top;
                            var totalFlixerContent = response.flixel_count;
                            var installedContent = getInstalledThemes();
                            
                            if(sortType == 3) for(var i in installedContent) {//Installed content
                                var contentItem = installedContent[i];
                                if(contentItem.isFlixelContent) {
                                    contentItem['contentType'] = flixelBackgroundType;
                                    if(!contentItem.handmade) {
                                        if(!contentItem['bgFileThumb'])
                                            contentItem['bgFileThumb'] = getFlixelFileThumb(contentItem['id']);
                                        if(!contentItem['bgVideoThumb'])
                                            contentItem['bgVideoThumb'] = getFlixelVideoThumb(contentItem['id']);
                                        contentItem = addFlixelHdVideoIfNotSetForFullHd(contentItem);
                                    } else {
                                        if(!contentItem['bgFileThumb'])
                                            contentItem['bgFileThumb'] = getThemeFileThumb(contentItem['id']);
                                        
                                        if(!contentItem['bgVideoThumb']){
                                            contentItem['bgVideoThumb'] = getThemeVideoThumb(contentItem['id']);
                                        }
                                    }
                                    
                                    saveContent.results.push(contentItem);
                                }
                            }
                            
                            if (typeof (availableFlixerContent) != "undefined") {//new contents
                                for(var j in availableFlixerContent) {
                                    var flixelThemeData = availableFlixerContent[j];
                                    if(sortType != 3 || typeof(installedContent[flixelThemeData['hash']]) == "undefined") {
                                        var flixelTheme = convertFlixelContentToInstallContent(flixelThemeData);
                                        if(flixelTheme) {
                                            saveContent.results.push(flixelTheme);
                                        }
                                    }
                                }
                            }
                            
                            setFlixelTotalPagesCount(totalFlixerContent);
                            
                            saveContent = JSON.stringify(saveContent);
                            
                            currentTime = new Date().getTime();
                            
                            if(saveContent && saveContent.results && saveContent.results.length > 10){
                                localStorage.setItem("flixel-themes-data-next-update", currentTime + themesApiCacheTime);
                            }else{
                                localStorage.setItem("flixel-themes-data-next-update", currentTime + themesApiCacheTime);
                                //localStorage.setItem("flixel-themes-data-next-update", currentTime + 1000);
                            }
                            
                            localStorage.setItem("flixel-themes-data", saveContent);
                            localStorage.setItem("flixel-themes-display-data", saveContent);
                            
                            localStorage.setItem("flixel-themes-current-page", sortType < 2 ? 1 : 0);

                            if(callback)
                                callback(data);
                            
                            //console.debug("getAvailableThemesList", "callback", data);
                        }
                    } else {
                        var errorMessage = translate("options_refresh_themes_list_error");
                        getOptionsThemesTabPages(sendTabsMessage, {"messageCommand" : "availableContentDownloadError"});
                        //console.log('Error: ' + errorMessage + ' by path', url);
                    }
                }
            };

            xhrAvailableContent.onerror = function () {
                var errorMessage = translate("options_refresh_themes_list_error");
                getOptionsThemesTabPages(sendTabsMessage, {"messageCommand" : "availableContentDownloadError"});
                //console.log('Error: ' + errorMessage + ' by path', url);
            };
            xhrAvailableContent.send();
        }
    }

    /**
     * Add flixel hd video if not set for full hd video
     *
     * @param contentItem Object
     * @returns {Object}
     */
    function addFlixelHdVideoIfNotSetForFullHd(contentItem) {
                                                             
        if(typeof (contentItem['bgVideoPath']) != "undefined") {
            if(typeof (contentItem['bgVideoPath']["1920"]) != "undefined" && contentItem['bgVideoPath']["1920"]) {
                if(contentItem['bgVideoPath']["1280"] == "undefined")
                    contentItem['bgVideoPath']["1280"] = contentItem['bgVideoPath']["1920"].replace(".hd.", ".tablet.");
            }
        }
        return contentItem;
    }

    /**
     * Get Flixel themes list
     *
     * @param callback Function
     * @param data Object
     */
    function getFlixelThemesList(callback, data) {
        var nextUpdate = localStorage.getItem("flixel-themes-data-next-update");
        var currentTime = new Date().getTime();
        var displayFlixerContentData = localStorage.getItem("flixel-themes-display-data");
        
        var sortType = getRouteSortType();

        if(nextUpdate && nextUpdate > currentTime && displayFlixerContentData) {
            localStorage.setItem("flixel-themes-current-page", sortType < 2 ? 1 : 0);

            var saveContent = {"results" : []};

            var displayFlixerContent = JSON.parse(displayFlixerContentData);
            var installedContent = getInstalledThemes();
            
            if(sortType == 3) for(var i in installedContent) {
                var contentItem = installedContent[i];
                if(contentItem.isFlixelContent) {
                    contentItem['contentType'] = flixelBackgroundType;
                    if(!contentItem.handmade) {
                        if(!contentItem['bgFileThumb'])
                            contentItem['bgFileThumb'] = getFlixelFileThumb(contentItem['id']);
                        if(!contentItem['bgVideoThumb'])
                            contentItem['bgVideoThumb'] = getFlixelVideoThumb(contentItem['id']);
                        contentItem = addFlixelHdVideoIfNotSetForFullHd(contentItem);
                    } else {
                        if(!contentItem['bgFileThumb'])
                            contentItem['bgFileThumb'] = getThemeFileThumb(contentItem['id']);
                        if(!contentItem['bgVideoThumb'])
                            contentItem['bgVideoThumb'] = getThemeVideoThumb(contentItem['id']);
                    }
                    saveContent.results.push(contentItem);
                }
            }
            
            if (typeof (displayFlixerContent['results']) != "undefined") {
                for(var j in displayFlixerContent['results']) {
                    var flixelThemeData = displayFlixerContent['results'][j];
                    if(sortType != 3 || typeof(installedContent[flixelThemeData['id']]) == "undefined") {
                        flixelThemeData = addFlixelHdVideoIfNotSetForFullHd(flixelThemeData);
                        saveContent.results.push(flixelThemeData);
                    }
                }
            }

            saveContent = JSON.stringify(saveContent);
            localStorage.setItem("flixel-themes-display-data", saveContent);
        }

        if(callback)
            callback(data);
    }

    /**
     * Load more flixel content
     *
     * @param data Object
     */
    function loadMoreFlixelContentBackend(data) {
        var nextPage = getFlixelContentNextPage();
        var url = getFlixelChanelUrl(nextPage);
        var xhrFlixelContent = new XMLHttpRequest();
        
        xhrFlixelContent.open('GET', url, true);
                                                 
        xhrFlixelContent.onload = function () {
            if(xhrFlixelContent.readyState == 4) {
                if (this.status == 200) {
                    if(this.response) {
                        var saveContent = {"results" : []};
                        
                        var allExistAvailableContent = localStorage.getItem("flixel-themes-data");
                        if(allExistAvailableContent) {
                            allExistAvailableContent = JSON.parse(allExistAvailableContent);
                            if (typeof (allExistAvailableContent['results']) != "undefined") {
                                for(var i in allExistAvailableContent['results']) {
                                    var existData = allExistAvailableContent['results'][i];
                                    if(!existData.handmade)
                                        existData = addFlixelHdVideoIfNotSetForFullHd(existData);
                                    saveContent.results.push(existData);
                                }
                            }
                        }


                        var availableFlixerContent = JSON.parse(this.response);
                        var existAvailableContent = localStorage.getItem("flixel-themes-display-data");
                        var existAvailableContentList = {};
                        if(existAvailableContent) {
                            existAvailableContent = JSON.parse(existAvailableContent);
                            if (typeof (existAvailableContent['results']) != "undefined") {
                                for(var i in existAvailableContent['results']) {
                                    var contentData = existAvailableContent['results'][i];
                                    if(!contentData.handmade)
                                        contentData = addFlixelHdVideoIfNotSetForFullHd(contentData);
                                    existAvailableContentList[contentData.id] = contentData;
                                }
                            }
                        }

                        var newAvailableContentList = [];
                        if (typeof (availableFlixerContent['results']) != "undefined") {
                            for(var j in availableFlixerContent['results']) {
                                var flixelThemeData = availableFlixerContent['results'][j];
                                if(typeof(existAvailableContentList[flixelThemeData['hash']]) == "undefined") {
                                    var flixelTheme = convertFlixelContentToInstallContent(flixelThemeData);
                                        saveContent.results.push(flixelTheme);
                                        newAvailableContentList.push(flixelTheme);
                                }
                            }
                        }

                        localStorage.setItem("flixel-themes-data", JSON.stringify(saveContent));
                        localStorage.setItem("flixel-themes-current-page", nextPage);

                        currentThemeId(function(themeId, data) {
                            var newAvailableContentList = data.newAvailableContentList;
                            data = getInstalledThemesResponse(themeId, data).response;
                            data["newAvailableContentList"] = newAvailableContentList;

                            getOptionsTabPages(function(data) {
                                data["command"] = "loadMoreLixerContentEnd";
                                
                                if(BROWSER && BROWSER == 'firefox') BRW_sendMessage(data); //For firefox
                                else{//For chrome
                                    var tabs = data.tabs;
                                    var tabsCount = tabs.length, i;
                                    for(i = 0; i < tabsCount; i++)
                                        chrome.tabs.sendMessage(tabs[i].id, data);
                                }
                            }, data);
                        }, {"newAvailableContentList" : newAvailableContentList});
                    }
                } else {
                    var errorMessage = translate("options_refresh_themes_list_error");
                    getOptionsTabPages(sendTabsMessage, {"messageCommand" : "flixelContentDownloadError"});
                    //console.log('Error: ' + errorMessage + ' by path', url);
                }
            }
        };

        xhrFlixelContent.onerror = function () {
            var errorMessage = translate("options_refresh_themes_list_error");
            getOptionsTabPages(sendTabsMessage, {"messageCommand" : "flixelContentDownloadError"});
            //console.log('Error: ' + errorMessage + ' by path', url);
        };

        xhrFlixelContent.send();
    }

    /**
     * Send tabs message
     *
     * @param data Object
     */
    function sendTabsMessage(data) {
        
        if(BROWSER && BROWSER == 'firefox') BRW_sendMessage({"command" : data.messageCommand}); //For firefox
        else{//For chrome
            var tabs = data.tabs;
            var tabsCount = tabs.length, i;
            for(i = 0; i < tabsCount; i++)
                chrome.tabs.sendMessage(tabs[i].id, {"command" : data.messageCommand});
        }//else
        
    }

    /**
     * Get site thumbs service
     *
     * @param mostVisitedURLs Array
     */
    function getSitesThumbService(mostVisitedURLs) {
                                                    
        getTilesDomainsTopLinks(mostVisitedURLs, analyzeSitesThumbService);
    }

    /**
     * Get site thumbs everhelper service
     *
     * @param mostVisitedURLs Array
     */
    function getSitesThumbEverhelperService(mostVisitedURLs) {
        getTilesDomainsTopLinks(mostVisitedURLs, analyzeSitesThumbEverhelperService);
    }

    /**
     * Analyze site thumb service
     * load images
     *
     * @param tiles Array
     */
    function analyzeSitesThumbService(tiles) {
        //console.debug("TILES", "analyzeSitesThumbService", tiles);
        
        var installTilesCount = getInstallTilesCount(), i;
        startTiles = []; startIds = [];
        for(i = 0; i < installTilesCount; i++)
            if(typeof (tiles[i]) != "undefined")
                startTiles.push(tiles[i]);
        startLoadTilesThumbsService();
    }

    /**
     * Analyze site thumb service
     * load images
     *
     * @param tiles Array
     */
    function analyzeSitesThumbEverhelperService(tiles) {
        //console.debug("TILES", "analyzeSitesThumbEverhelperService", tiles);
        
        var installTilesCount = getInstallTilesCount(), i;
        startTiles = []; startIds = [];
        for(i = 0; i < installTilesCount; i++)
            if(typeof (tiles[i]) != "undefined")
                startTiles.push(tiles[i]);
        startLoadTilesThumbsEverhelperService();
    }

    /**
     * Get site thumbs
     *
     * @param mostVisitedURLs Array
     */
    function getSitesThumb(mostVisitedURLs) {
        getTilesDomainsTopLinks(mostVisitedURLs, analyzeSitesThumb);
    }

    /**
     * Analyze site thumb
     * load images
     *
     * @param tiles Array
     */
    function analyzeSitesThumb(tiles) {
        //console.debug("TILES", "analyzeSitesThumb", tiles);
        
        var installTilesCount = getInstallTilesCount(), i;
        startTiles = []; startIds = [];
        for(i = 0; i < installTilesCount; i++)
            if(typeof (tiles[i]) != "undefined")
                startTiles.push(tiles[i]);
        startLoadTilesThumbs();
    }

    /**
     * Get live load site thumbs
     * when enable application during some not working time
     * or remove some history items
     *
     * @param mostVisitedURLs Array
     */
    function getLiveSitesThumbs(mostVisitedURLs) {
        //console.info("getLiveSitesThumbs", mostVisitedURLs);
        
        if(typeof (mostVisitedURLs) != "undefined") {
            var tilesLength = mostVisitedURLs.length, i;
            if(tilesLength) {
                if(installWindow || installService || (liveThumbsAfterSync() /*&& BROWSER != 'firefox'*/)) { // install window open
                    for (i = 0; i < tilesLength; i++) {
                        addSiteForThumbLoad(mostVisitedURLs[i]);
                        //console.debug(startTiles);
                    }
                } else { //install window close
                    //console.debug("TILES", "getLiveSitesThumbs", mostVisitedURLs);
                    /*
                    if(typeof startTiles != "object" ) startTiles = [];
                    for (i = 0; i < tilesLength; i++) startTiles.push(mostVisitedURLs[i]);
                    */
                    startTiles = mostVisitedURLs;
                    
                    if(!printScreenOutsideService()) startLoadTilesThumbs();
                    else startLoadTilesThumbsService();//FIREFOX
                }
            }
        }
    }

    var liveThumbsAfterSyncPending = false;
    function liveThumbsAfterSync(){
        var inSync = localStorage.getItem("sync-progress") || false;
        
        //console.debug("liveThumbsAfterSync", "inSync", inSync);
        
        if(!inSync) return false;
        else{
            if(liveThumbsAfterSyncPending) clearTimeout(liveThumbsAfterSyncPending);
            //console.debug("liveThumbsAfterSync", "liveThumbsAfterSyncPending", liveThumbsAfterSyncPending);
            
            liveThumbsAfterSyncPending = setTimeout(function(){
                clearTimeout(liveThumbsAfterSyncPending);
                    
                    if(!printScreenOutsideService()) startLoadTilesThumbs();
                    else startLoadTilesThumbsService();//FIREFOX
                
                setTimeout(function(){
                    clearTimeout(printScreensBuildTimeout);
                }, 1000);
            }, 3500);
            
            return true;
        }
    }

    /**
     * Get everhelper load site thumbs
     * when enable application during some not working time
     * or remove some history items
     *
     * @param mostVisitedURLs Array
     */
    function getEverhelperSitesThumbs(mostVisitedURLs) {
        if(typeof (mostVisitedURLs) != "undefined") {
            var tilesLength = mostVisitedURLs.length, i;
            if(tilesLength) {
                if(everhelperInstall) { // install everhelper images process
                    for (i = 0; i < tilesLength; i++)
                        addSiteForThumbLoad(mostVisitedURLs[i]);
                } else { //install start
                    startTiles = mostVisitedURLs;
                    startLoadTilesThumbsEverhelperService();
                }
            }
        }
    }

    /**
     * Get everhelper live load site thumbs
     * when enable application during some not working time
     * or remove some history items
     *
     * @param mostVisitedURLs Array
     */
    function getEverhelperOrLiveSitesThumbs(mostVisitedURLs) {
        if(typeof (mostVisitedURLs) != "undefined") {
            var tilesLength = mostVisitedURLs.length, i;
            if(tilesLength) {
                if(everhelperLiveInstall) { // install everhelper or live images process.
                    for (i = 0; i < tilesLength; i++) {
                        addSiteForThumbLoad(mostVisitedURLs[i]);
                    }
                } else { //install start
                    startTiles = mostVisitedURLs;
                    startLoadTilesThumbsEverhelperOrLiveService();
                }
            }
        }
    }

    /**
     * Load everhelper load site thumbs
     * when change dial thumb type
     *
     * @param mostVisitedURL Object
     */
    function loadSitesEverhelperServiceThumb(mostVisitedURL) {
        
        if(typeof (mostVisitedURL) != "undefined") {
            var mv = mostVisitedURL;
            mv.image = getNoTileImageFileName();
            var hostUrl = getUrlHost(mv.url);
            var thumbType = null;
            var dialId = mv.dialId;

            if (typeof (mv.thumbType) != "undefined" && checkThumbType(mv.thumbType))
                thumbType = mv.thumbType;

            mv.hostUrl = hostUrl;
            mv.hostData = mv.hostUrl.split(".");
            mv.thumbType = thumbType;

            var searchUrlList = [];
            if(dialId) {
                searchUrlList.push(dialId);
                
                //getDb().transaction(function (tx) {
                //    tx.executeSql('SELECT * FROM DIALS WHERE id IN(' + createParams(searchUrlList) + ')', searchUrlList, function (tx, results) {
                BRW_dbTransaction(function (tx) {
                    BRW_dbSelect({ //Param
                            tx : tx,
                            from: 'DIALS',
                            whereIn: {
                                'key': 'id', 'arr': searchUrlList
                            }
                        },
                        function (results) { //Success

                            var imagesResults = results.rows;
                            var imagesResultsLength = imagesResults.length;
                            var i;
                            var colorScheme;
                            if(imagesResultsLength) {
                                for (i = 0; i < imagesResultsLength; i++) {
                                    if (mv.url == imagesResults[i].url || hostUrl == imagesResults[i].url) {
                                        if (!imagesResults[i].bg_color || !imagesResults[i].text_color)
                                            colorScheme = getTileRandomColorScheme();
                                        else
                                            colorScheme = {backgroundColor : imagesResults[i].bg_color, color: imagesResults[i].text_color};
                                        mv.colorScheme = colorScheme;
                                        mv.image = imagesResults[i].image;

                                    }
                                }
                            } else {
                                /*
                                if(!mv.colorScheme){//added
                                    colorScheme = getTileRandomColorScheme();
                                    mv.colorScheme = colorScheme;
                                }
                                */
                                mv.colorScheme = safeGetTileRandomColorScheme(mv.colorScheme);
                            }

                            if(thumbType == showDialScreenThumb) {
                                mv.error = function(mv) {
                                    getNetTabPages(function(data) {
                                        if(BROWSER && BROWSER == 'firefox') BRW_sendMessage({"command" : "errorLoadLiveThumb", "mv" : data.mv}); //For firefox
                                        else{//For chrome
                                            var tabs = data.tabs;
                                            var tabsCount = tabs.length, i;
                                            for(i = 0; i < tabsCount; i++)
                                                chrome.tabs.sendMessage(tabs[i].id, {"command" : "errorLoadLiveThumb", "mv" : data.mv});
                                        }
                                    }, {"mv" : mv});
                                };
                                getLiveSitesThumbs([mv]);
                            } else
                                makePrintScreenOnEverhelperService(mv, null, function(mv) {
                                    getNetTabPages(function(data) {
                                        if(BROWSER && BROWSER == 'firefox') BRW_sendMessage({"command" : "errorLoadGalleryThumb", "mv" : data.mv}); //For firefox
                                        else{//For chrome
                                            var tabs = data.tabs;
                                            var tabsCount = tabs.length, i;
                                            for(i = 0; i < tabsCount; i++)
                                                chrome.tabs.sendMessage(tabs[i].id, {"command" : "errorLoadGalleryThumb", "mv" : data.mv});
                                        }
                                    }, {"mv" : mv});
                                });
                    }, null);
                });
            } else {
                searchUrlList.push(hostUrl);
                searchUrlList.push(mv.url);
                
                //getDb().transaction(function (tx) {
                //    tx.executeSql('SELECT * FROM IMAGES WHERE url IN(' + createParams(searchUrlList) + ')', searchUrlList, function (tx, results) {      
                BRW_dbTransaction(function (tx) {
                    BRW_dbSelect({ //Param
                            tx : tx,
                            from: 'IMAGES',
                            whereIn: {
                                'key': 'url', 'arr': searchUrlList
                            }
                        },
                        function (results) { //Success

                            var imagesResults = results.rows;
                            var imagesResultsLength = imagesResults.length;
                            var i;
                            var colorScheme;
                            if(imagesResultsLength) {
                                for (i = 0; i < imagesResultsLength; i++) {
                                    if (mv.url == imagesResults[i].url || hostUrl == imagesResults[i].url) {
                                        if (!imagesResults[i].bg_color || !imagesResults[i].text_color)
                                            colorScheme = getTileRandomColorScheme();
                                        else
                                            colorScheme = {backgroundColor : imagesResults[i].bg_color, color: imagesResults[i].text_color};
                                        mv.colorScheme = colorScheme;
                                        mv.image = imagesResults[i].image;

                                    }
                                }
                            } else {
                                /*
                                if(!mv.colorScheme){//added
                                    colorScheme = getTileRandomColorScheme();
                                    mv.colorScheme = colorScheme;
                                }
                                */
                                mv.colorScheme = safeGetTileRandomColorScheme(mv.colorScheme);
                            }
                            
                            if(thumbType == showDialScreenThumb) {
                                mv.error = function(mv) {
                                    getNetTabPages(function(data) {
                                        if(BROWSER && BROWSER == 'firefox') BRW_sendMessage({"command" : "errorLoadLiveThumb", "mv" : data.mv}); //For firefox
                                        else{//For chrome
                                            var tabs = data.tabs;
                                            var tabsCount = tabs.length, i;
                                            for(i = 0; i < tabsCount; i++)
                                                chrome.tabs.sendMessage(tabs[i].id, {"command" : "errorLoadLiveThumb", "mv" : data.mv});
                                        }
                                    }, {"mv" : mv});
                                };
                                getLiveSitesThumbs([mv]);
                            } else
                                makePrintScreenOnEverhelperService(mv, null, function(mv) {
                                    getNetTabPages(function(data) {
                                        if(BROWSER && BROWSER == 'firefox') BRW_sendMessage({"command" : "errorLoadLiveThumb", "mv" : data.mv}); //For firefox
                                        else{//For chrome
                                            var tabs = data.tabs;
                                            var tabsCount = tabs.length, i;
                                            for(i = 0; i < tabsCount; i++)
                                                chrome.tabs.sendMessage(tabs[i].id, {"command" : "errorLoadGalleryThumb", "mv" : data.mv});
                                        }
                                    }, {"mv" : mv});
                                });
                    }, null);
                });
            }
        }
    }

    /**
     * Get site text thumbs
     * for old version dials support
     *
     * @param mostVisitedURLs Array
     * @param callback Function
     */
    function getSitesTextThumbs(mostVisitedURLs, callback) {
        if(typeof (mostVisitedURLs) != "undefined") {
            var tiles = mostVisitedURLs;
            var tilesLength = mostVisitedURLs.length, i;
            var searchUrlList = [];
            for (i = 0; i < tilesLength; i++) {
                var mv = mostVisitedURLs[i];
                searchUrlList.push(getUrlHost(mv.url));
                searchUrlList.push(mv.url);
            }

            //getDb().transaction(function (tx) {
            //    tx.executeSql('SELECT * FROM IMAGES WHERE url IN(' + createParams(searchUrlList) + ')', searchUrlList, function (tx, results) {
            BRW_dbTransaction(function (tx) {
                BRW_dbSelect({ //Param
                        tx : tx,
                        from: 'IMAGES',
                        whereIn: {
                            'key': 'url', 'arr': searchUrlList
                        }
                    },
                    function (results) { //Success
                        var imagesResults = results.rows;
                        var imagesResultsLength = imagesResults.length;
                        var i, j;
                        for (j = 0; j < tilesLength; j++) {
                            for (i = 0; i < imagesResultsLength; i++) {
                                var hostUrl = getUrlHost(tiles[j].url);
                                var thumbType = null;
                                if(typeof (tiles[j].thumbType) != "undefined" && checkThumbType(tiles[j].thumbType))
                                    thumbType = tiles[j].thumbType;

                                if (tiles[j].url == imagesResults[i].url || hostUrl == imagesResults[i].url) {
                                    if (!imagesResults[i].bg_color || !imagesResults[i].text_color) {
                                        var colorScheme = getTileRandomColorScheme();
                                        
                                        //console.debug("Update", "getSitesTextThumbs", tiles[j], hostUrl);
                                        
                                        BRW_dbUpdate(
                                            { //Param
                                                tx : tx,
                                                table: 'IMAGES',
                                                'set': {
                                                    bg_color  : colorScheme.backgroundColor,
                                                    text_color: colorScheme.color,
                                                    thumb_type: thumbType
                                                },
                                                where: {
                                                    key: 'url', val: tiles[j].url
                                                }
                                            }
                                        );
                                        
                                        BRW_dbUpdate(
                                            { //Param
                                                tx : tx,
                                                table: 'IMAGES',
                                                'set': {
                                                    bg_color  : colorScheme.backgroundColor,
                                                    text_color: colorScheme.color,
                                                    thumb_type: thumbType
                                                },
                                                where: {
                                                    key: 'url', val: hostUrl
                                                }
                                            }
                                        );
                                        
                                        /*
                                        tx.executeSql('UPDATE IMAGES SET bg_color = ? , text_color = ? , thumb_type = ? WHERE url = ?',
                                            [colorScheme.backgroundColor, colorScheme.color, thumbType, tiles[j].url]);
                                        tx.executeSql('UPDATE IMAGES SET bg_color = ? , text_color = ? , thumb_type = ? WHERE url = ?',
                                            [colorScheme.backgroundColor, colorScheme.color, thumbType, hostUrl]);
                                        */
                                    }
                                }
                            }
                        }
                }, null);
            });
        }
    }

    /**
     * Get text site thumbs
     * when enable application during some not working time
     * or remove some history items
     *
     * @param mostVisitedURLs Array
     */
    function getTextSitesThumbs(mostVisitedURLs) {
        if(typeof (mostVisitedURLs) != "undefined") {
            var tilesLength = mostVisitedURLs.length, i;
            if(tilesLength) {
                if(textDialsInstall) { // install images text process
                    for (i = 0; i < tilesLength; i++)
                        addSiteForThumbLoad(mostVisitedURLs[i]);
                } else { //install start
                    startTiles = mostVisitedURLs;
                    startLoadTilesThumbsText();
                }
            }
        }
    }

    /**
     * Load site text thumb
     * when change dial thumb type
     *
     * @param mostVisitedURL Array
     */
    function loadSitesTextThumb(mostVisitedURL) {
        if(typeof (mostVisitedURL) != "undefined") {
            var mv = mostVisitedURL;
                mv.image = getNoTileImageFileName();
            var hostUrl = getUrlHost(mv.url);
            
            var thumbType = null;
            if (typeof (mv.thumbType) != "undefined" && checkThumbType(mv.thumbType))
                thumbType = mv.thumbType;

            mv.hostUrl = hostUrl;
            mv.hostData = mv.hostUrl.split(".");
            mv.thumbType = thumbType;

            var searchUrlList = [];

            if(mv.dialId) {
                searchUrlList.push(mv.dialId);
                
                //getDb().transaction(function (tx) {
                //    tx.executeSql('SELECT * FROM DIALS WHERE id IN(' + createParams(searchUrlList) + ')', searchUrlList, function (tx, results) {      
                BRW_dbTransaction(function (tx) {
                    BRW_dbSelect({ //Param
                            tx : tx,
                            from: 'DIALS',
                            whereIn: {
                                'key': 'id', 'arr': searchUrlList
                            }
                        },
                        function (results) { //Success
                            var imagesResults = results.rows;
                            var imagesResultsLength = imagesResults.length;
                            var i;
                            var colorScheme;
                        
                            if(imagesResultsLength) {
                                for (i = 0; i < imagesResultsLength; i++) {
                                    if (mv.dialId == imagesResults[i].id) {
                                        var current = imagesResults[i];
                                        
                                        if(parseInt(current.thumb_type) != 1 && current.bg_color && current.text_color){
                                            colorScheme = {
                                                color : current.text_color,
                                                backgroundColor : current.bg_color
                                            };
                                        }else{
                                            colorScheme = getTileRandomColorScheme();
                                        }
                                        
                                        mv.colorScheme = colorScheme;
                                        
                                        mv.image = imagesResults[i].image;
                                        
                                        BRW_dbUpdate(
                                            { //Param
                                                tx : tx,
                                                table: 'DIALS',
                                                'set': {
                                                    bg_color  : colorScheme.backgroundColor,
                                                    text_color: colorScheme.color,
                                                    thumb_type: thumbType
                                                },
                                                where: {
                                                    key: 'id', val: mv.dialId
                                                }
                                            }
                                        );
                                        /*
                                        tx.executeSql('UPDATE DIALS SET bg_color = ? , text_color = ? , thumb_type = ? WHERE id = ?',
                                            [colorScheme.backgroundColor, colorScheme.color, thumbType, mv.dialId]);
                                        */
                                    }
                                }
                            }
                            setTimeout(function() {
                                getNetTabPages(sendThumbToApp, {"mv" : mv});
                            }, 250);
                    }, null);
                });
            } else {
                searchUrlList.push(hostUrl);
                searchUrlList.push(mv.url);
                    //getDb().transaction(function (tx) {
                    //tx.executeSql('SELECT * FROM IMAGES WHERE url IN(' + createParams(searchUrlList) + ')', searchUrlList, function (tx, results) {
                    BRW_dbTransaction(function (tx) {
                        BRW_dbSelect({ //Param
                                tx : tx,
                                from: 'IMAGES',
                                whereIn: {
                                    'key': 'url', 'arr': searchUrlList
                                }
                            },
                            function (results) { //Success
                                var imagesResults = results.rows;
                                var imagesResultsLength = imagesResults.length;
                                var i;
                                var colorScheme;
                                if(imagesResultsLength) {
                                    for (i = 0; i < imagesResultsLength; i++) {
                                        if (mv.url == imagesResults[i].url || hostUrl == imagesResults[i].url) {
                                            colorScheme = getTileRandomColorScheme();
                                            mv.colorScheme = colorScheme;
                                            mv.image = imagesResults[i].image;
                                            
                                            //console.debug("Update", "loadSitesTextThumb", mv, hostUrl);
                                            
                                            BRW_dbUpdate(
                                                { //Param
                                                    tx : tx,
                                                    table: 'IMAGES',
                                                    'set': {
                                                        bg_color  : colorScheme.backgroundColor,
                                                        text_color: colorScheme.color,
                                                        thumb_type: thumbType
                                                    },
                                                    where: {
                                                        key: 'url', val: mv.url
                                                    }
                                                }
                                            );

                                            BRW_dbUpdate(
                                                { //Param
                                                    tx : tx,
                                                    table: 'IMAGES',
                                                    'set': {
                                                        bg_color  : colorScheme.backgroundColor,
                                                        text_color: colorScheme.color,
                                                        thumb_type: thumbType
                                                    },
                                                    where: {
                                                        key: 'url', val: hostUrl
                                                    }
                                                }
                                            );
                                            
                                            /*
                                            tx.executeSql('UPDATE IMAGES SET bg_color = ? , text_color = ? , thumb_type = ? WHERE url = ?',
                                                [colorScheme.backgroundColor, colorScheme.color, thumbType, mv.url]);
                                            tx.executeSql('UPDATE IMAGES SET bg_color = ? , text_color = ? , thumb_type = ? WHERE url = ?',
                                                [colorScheme.backgroundColor, colorScheme.color, thumbType, hostUrl]);
                                            */
                                        }
                                    }
                                } else {
                                    colorScheme = getTileRandomColorScheme();
                                    mv.colorScheme = colorScheme;
                                    
                                    BRW_dbInsert(
                                        { //Param
                                            tx : tx,
                                            table: 'IMAGES',
                                            'set': {
                                                id      : new Date().getTime(),
                                                url     : hostUrl,
                                                image   : null,
                                                bg_color: colorScheme.backgroundColor,
                                                text_color: colorScheme.color,
                                                thumb_type: thumbType
                                            } 
                                        }
                                    );
                                    
                                    /*
                                    tx.executeSql('INSERT INTO IMAGES (id, url, image, bg_color, text_color, thumb_type) VALUES (?,?,?,?,?,?)', [new Date().getTime(), hostUrl, null, colorScheme.backgroundColor, colorScheme.color, thumbType]);
                                    */
                                }

                                setTimeout(function() {
                                    getNetTabPages(sendThumbToApp, {"mv" : mv});
                                }, 250);
                    }, null);
                });
            }
        }
    }

    /**
     * Add site for thumb load
     * if not in loading queue
     *
     * @param mv Object
     */
    function addSiteForThumbLoad(mv) {
        var existInLoadingList = false;
        
        for(var i in startTiles){
            if(
                (mv.dialId == startTiles[i].dialId)
                ||
                (
                    (!mv.dialId || !startTiles[i].dialId)
                    && (mv.url == startTiles[i].url)
                )
            ) {
                existInLoadingList = true;
                break;
            }
        }
        
        //console.debug("addSiteForThumbLoad", existInLoadingList, mv);

        if(!existInLoadingList)
            startTiles.push(mv);
        
        //console.debug("TILES", "addSiteForThumbLoad", mv);
    }

    /**
     * Start load tiles thumb images with service
     */
    function startLoadTilesThumbsService() {
        if(startTiles.length) {
            if(!installService)
            loadTilesThumbsInService(startTiles);
        } else {
            setAppInstalledDate();
            getNetTabPages(endSendThumbToApp);
        }
    }

    /**
     * Start load everhelper tiles thumb images with service
     */
    function startLoadTilesThumbsEverhelperService() {
        if(startTiles.length) {
            if(!everhelperInstall)
                loadTilesThumbsInEverhelperService(startTiles);
        } else {
            setAppInstalledDate();
            getNetTabPages(endSendThumbToApp);
        }
    }

    /**
     * Start load everhelper or live tiles thumb images with service
     */
    function startLoadTilesThumbsEverhelperOrLiveService() {
        if(startTiles.length) {
            if(!everhelperLiveInstall) {
                loadTilesThumbsInEverhelperOrLiveService(startTiles);
            }
        } else {
            setAppInstalledDate();
            getNetTabPages(endSendThumbToApp);
        }
    }

    /**
     * Start load tiles thumb images text
     */
    function startLoadTilesThumbsText() {
        if(startTiles.length) {
            if(!textDialsInstall)
                loadTilesThumbsText(startTiles);
        } else {
            setAppInstalledDate();
            getNetTabPages(endSendThumbToApp);
        }
    }

    /**
     * Start load tiles thumb images
     */
    function startLoadTilesThumbs() {
        if(startTiles.length) {
            if(!installWindow){
                loadTilesThumbsInIFrame(startTiles);
            }
        } else {
            setAppInstalledDate();
            getNetTabPages(endSendThumbToApp);
        }
    }

    /**
     * Load thumbs images in service
     *
     * @param startTiles
     */
    function loadTilesThumbsInService(startTiles) {
        loadedTiles = 0;
        installService = true;
        setLastInstallState(1);
        printScreenOnServiceLoadComplete(startTiles[loadedTiles]);
    }

    /**
     * Load thumbs images in everhelper service
     *
     * @param startTiles
     */
    function loadTilesThumbsInEverhelperService(startTiles) {
        //console.debug("loadTilesThumbsInEverhelperService", "AAAAA", startTiles);
        
        loadedTiles = 0;
        everhelperInstall = true;
        setLastInstallState(1);
        printScreenOnEverhelperServiceLoadComplete(startTiles[loadedTiles]);
    }

    /**
     * Load thumbs images in everhelper or live service
     *
     * @param startTiles
     */
    function loadTilesThumbsInEverhelperOrLiveService(startTiles) {
        //console.debug("loadTilesThumbsInEverhelperOrLiveService", "AAAAA", startTiles);
        
        loadedTiles = 0;
        everhelperLiveInstall = true;
        setLastInstallState(1);
        printScreenOnEverhelperOrLiveServiceLoadComplete(startTiles[loadedTiles]);
    }

    /**
     * Load thumbs images text
     *
     * @param startTiles
     */
    function loadTilesThumbsText(startTiles) {
        //console.debug("loadTilesThumbsText", "AAAAA", startTiles);
        
        loadedTiles = 0;
        textDialsInstall = true;
        setLastInstallState(1);
        makeTextThumbImageOnHostParseComplete(startTiles[loadedTiles]);
    }

    /**
     * Load thumbs images in IFrame
     *
     * @param startTiles
     */
    function loadTilesThumbsInIFrame(startTiles) {
        //console.debug("loadTilesThumbsInIFrame", startTiles);
        
        loadedTiles = 0;

        var windowsParams = {
            focused: false,
            url: startTiles[loadedTiles].url,
            left: dialsPopupScreenCoordinate,
            top: dialsPopupScreenCoordinate,
            width: 1,
            height: 1,
            type: "popup"
        };
        
        var lastWindowId = getLastInstallWindow();
        if(typeof (lastWindowId) == "undefined") {
            lastWindowId = parseInt(lastWindowId);
            if(isNaN(lastWindowId)) {
                chrome.windows.getAll(function(allWindows) {
                    for(var i in allWindows) {
                        var eachWindow = allWindows[i];
                        if(eachWindow.type == "popup"){
                            //chrome.windows.remove(eachWindow.id);
                            windowsRemoveSafe(eachWindow.id);
                        }
                    }
                    chrome.windows.create(windowsParams, getInstallWindow);
                });
            } else {
                chrome.app.window.get(lastWindowId, function() {
                    /*
                    chrome.windows.remove(lastWindowId, function() {
                        chrome.windows.create(windowsParams, getInstallWindow);
                    });
                    */
                    
                    windowsRemoveSafe(lastWindowId, function() {
                        chrome.windows.create(windowsParams, getInstallWindow);
                    });
                    
                    
                }, function() {
                    chrome.windows.create(windowsParams, getInstallWindow);
                });
            }
        } else {
            chrome.windows.create(windowsParams, getInstallWindow);
        }
    }

    /**
     * Get install window for thumb loading
     *
     * @param w Window
     */
    function getInstallWindow(w) {
        
        if(typeof (w) != "undefined") {
            
            setLastInstallState(1);
            setLastInstallWindow(w.id);

            installWindow = w;

            if(isWindowsPlatform())
                chrome.windows.update(w.id, {top: dialsPopupScreenCoordinate, left: dialsPopupScreenCoordinate, width: screen.width, height: screen.height});
            else
                chrome.windows.update(w.id, {state: "minimized", top: dialsPopupScreenCoordinate, left: dialsPopupScreenCoordinate, width: screen.width, height: screen.height});

            printScreensBuildTimeout = setTimeout(function(){
                stopPrintScreenBuild(w);
            }, getTilesScreenBuiltTime());

            chrome.tabs.query({"windowId" : w.id, "windowType" : "popup"}, function(tabs) {
                for(var t in tabs)
                    chrome.tabs.update(tabs[t].id, {"muted" : true}, function(tabInfo) {
                        chrome.tabs.executeScript(tabInfo.id, {
                            code: getHiddenCaptureInjectScript()
                        }, function() {
                            if (tabInfo && tabInfo.status == "complete")
                                chrome.tabs.executeScript(tabInfo.id, {code: getHiddenCaptureInjectScript()});
                        });
                    });
            });

            printScreenOnPageLoadComplete(w, w.tabs[0], startTiles[loadedTiles]);
            chrome.windows.onRemoved.addListener(onInstallWindowRemove);
        }
    }

    /**
     * Install window remove handler
     *
     * @param windowId
     */
    function onInstallWindowRemove(windowId) {
        
        if(installWindow && installWindow.id == windowId) {

            clearLastInstallState();
            clearLastInstallWindow();

            chrome.windows.onRemoved.removeListener(onInstallWindowRemove);
            installWindow = null;

            clearTimeout(printScreensBuildTimeout);
            setAppInstalledDate();
            getNetTabPages(endSendThumbToApp);
        }
    }

    /**
     * Install live screen window remove handler
     *
     * @param windowId
     */
    function onLiveScreenInstallWindowRemove(windowId) {
        
        chrome.windows.onRemoved.removeListener(onLiveScreenInstallWindowRemove);
        if(liveScreensBuildTimeout)
            clearTimeout(liveScreensBuildTimeout);
    }

    /**
     * Print screen site page
     * on service load
     *
     * @param mv Object
     */
    function printScreenOnServiceLoadComplete(mv, callback) {
        var nextCalled = false;
        function callNextEmbded(){
            //console.trace();
            
            if(nextCalled) return;
            else{
                nextCalled = true;
                
                setTimeout(function(){
                    callNextTilePrintScreenService();
                }, 1500);
            }
        }
        
        if(typeof (mv) == "undefined" || typeof (mv.url) == "undefined"){
            callNextEmbded(); //callNextTilePrintScreenService();   
        } else {

            var hostName = getUrlHost(mv.url);
            mv.image = getNoTileImageFileName();
            //if(!mv.colorScheme) mv.colorScheme = getTileRandomColorScheme();
            mv.colorScheme = safeGetTileRandomColorScheme(mv.colorScheme);
            mv.hostData = hostName.split(".");

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(){
                if (this.readyState == 4){
                    if(this.status == 200) {
                        if(this.response && this.response.byteLength && this.response.byteLength <= thumbFileMaxSize) {
                            try {
                                var data = new Blob([new Uint8Array(this.response)]);
                                
                                if(isAmazonProductURL(mv.url)) var Name = hostName + "_" + crc32(mv.url);
                                else var Name = hostName;
                                
                                Name += "_" + String(mv.dialId).substr(-5) + ".jpg";
                                
                                getFileSystem(saveFile, {
                                    "path": getThumbsFileSystemPath(),
                                    "name": Name,
                                    "mv" : mv,
                                    "data": data,
                                    "callback": function(url) {
                                        mv.image = url;
                                        saveSiteThumbImage(mv);
                                        
                                        setTimeout(function(){
                                            callNextEmbded(); //callNextTilePrintScreenEverhelperService();
                                        }, 100);
                                        
                                        if(typeof callback == "function") callback();
                                    }
                                });
                            } catch(e) {
                                saveSiteThumbImage(mv);
                                callNextEmbded(); //callNextTilePrintScreenEverhelperService();
                            }
                        } else {
                            saveSiteThumbImage(mv);
                            callNextEmbded(); //callNextTilePrintScreenEverhelperService();
                        }
                    }
                    saveSiteThumbImage(mv);
                    
                    callNextEmbded(); //callNextTilePrintScreenService();
                    
                }
            };
            xhr.onerror = function (){
                saveSiteThumbImage(mv);
                callNextEmbded(); //callNextTilePrintScreenService();
            };
            xhr.open('GET', "http://mini.s-shot.ru/D6/1024x680/212/png/?" + mv.url, true);
            xhr.responseType = 'arraybuffer';
            
            //console.debug("http://mini.s-shot.ru/D6/1024x680/212/png/?" + mv.url);
            
            try {
                if(hostName) {
                    xhr.send();
                } else {
                    saveSiteThumbImage(mv);
                    callNextEmbded(); //callNextTilePrintScreenService();
                }
            } catch(e) {
                saveSiteThumbImage(mv);
                callNextEmbded(); //callNextTilePrintScreenService();
            }
        }
    }

    /**
     * Print screen site page
     * on everhelper service load
     *
     * @param mv Object
     */
    function printScreenOnEverhelperServiceLoadComplete(mv) {
        if(typeof (mv) == "undefined" || typeof (mv.url) == "undefined")
            callNextTilePrintScreenEverhelperService();
        else {
            
            if(mv.url && String(mv.url).indexOf('amazon.') > -1 && String(mv.url).length > 30){
                makePrintScreenOnEverhelperOrLiveService(mv, callNextTilePrintScreenEverhelperService);
            }else{
                makePrintScreenOnEverhelperService(mv, callNextTilePrintScreenEverhelperService);
            }
            
        }
    }

    /**
     * Print screen site page
     * on everhelper or live service load
     *
     * @param mv Object
     */
    function printScreenOnEverhelperOrLiveServiceLoadComplete(mv) {
        
        if(typeof (mv) == "undefined" || typeof (mv.url) == "undefined")
            callNextTilePrintScreenEverhelperOrLiveService();
        else {
            makePrintScreenOnEverhelperOrLiveService(mv, callNextTilePrintScreenEverhelperOrLiveService);
        }
    }

    /**
     * Make text thumb image
     * on host parse
     *
     * @param mv Object
     */
    function makeTextThumbImageOnHostParseComplete(mv) {
        
        if(typeof (mv) == "undefined" || typeof (mv.url) == "undefined")
            callNextTileMakeTextThumbImage();
        else {
            makeTextThumbImageOnHostParse(mv, callNextTileMakeTextThumbImage);
        }
    }
    
    function loadCustomThumbImage(mv, previewItem, callback, error) {
        var hostName = getUrlHost(mv.url);
        
        var xhrCustomUrl = new XMLHttpRequest();
        xhrCustomUrl.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    
                    if (this.response && this.response.byteLength && this.response.byteLength <= thumbFileMaxSize) {
                        try {
                            //console.info(this.response);
                            //console.info([new Uint8Array(this.response)]);
                            
                            var data = new Blob([new Uint8Array(this.response)]);

                            if (isAmazonProductURL(mv.url)) var Name = hostName + "_" + crc32(mv.url);
                            else var Name = hostName;
                            
                            Name += "_" + String(mv.dialId).substr(-5) + ".jpg";
                            
                            getFileSystem(saveFile, {
                                "path": getThumbsFileSystemPath(),
                                "name": Name,
                                "mv": mv,
                                "data": data,
                                "callback": function (url) {
                                    mv.image = url;
                                    saveSiteThumbImage(mv);
                                    if (callback) callback();
                                    if (error) {
                                        if (checkUrlHasGoogleHost(mv.url) && mv.thumbType == showDialGalleryThumb)
                                            error(mv);
                                    }
                                }
                            });
                            
                            var dial_id = "dial_"+mv.id;
                            
                            BRW_dbTransaction(function (tx) {
                                BRW_dbSelect(
                                    {
                                        tx : tx,
                                        from: 'IMAGES',
                                        where: {'url': dial_id}
                                    },
                                    function (selectResults) {//Success      
                                        //console.info(1,selectResults.rows.length);  
                                        
                                        if(selectResults.rows.length == 0){
                                            BRW_dbInsert({
                                                tx : tx,
                                                table: 'IMAGES',
                                                'set': {
                                                    id      : new Date().getTime(),
                                                    'url'   : dial_id,
                                                    'image' : previewItem.image
                                                }
                                            });
                                        }else{
                                            var updImgMessage = {
                                                tx : tx,
                                                table: 'IMAGES',
                                                'set': {
                                                    'image': previewItem.image
                                                },
                                                where: {
                                                    key: 'url', val: dial_id
                                                }
                                            };
                                            
                                            //console.info(updImgMessage);
                                            
                                            BRW_dbUpdate(updImgMessage);
                                        }
                                        
                                        
                                    }
                                );
                            });
                            
                            

                        } catch (e) {
                            saveSiteThumbImage(mv);
                            if (callback) callback();
                            if (error) error(mv);
                        }
                    } else {
                        saveSiteThumbImage(mv);
                        if (callback) callback();
                        if (error) error(mv);
                    }
                } else {
                    saveSiteThumbImage(mv);
                    if (callback) callback();
                    if (error) error(mv);
                }
            }
        };
        xhrCustomUrl.onerror = function () {
            saveSiteThumbImage(mv);
            if (callback) callback();
            //if(error) error(mv);
        };

        if (previewItem.type == "url") {
            var customUrl = BRW_urlTunnel(previewItem.image);
            
            xhrCustomUrl.open('GET', customUrl, true);
            xhrCustomUrl.responseType = 'arraybuffer';
            
            try {
                xhrCustomUrl.send();
            } catch (e) {
                saveSiteThumbImage(mv);
                if (callback) callback();
                if (error) error(mv);
            }
        } else if(previewItem.type == "base64") {
            var b64 = previewItem.image.split(',');
            b64.shift();
            b64 = b64.join(',');
            
            var data = b64toBlob(b64, "image");
            //var blobUrl = URL.createObjectURL(data);
            
            if (isAmazonProductURL(mv.url)) var Name = hostName + "_" + crc32(mv.url);// + ".jpg";
            else var Name = hostName;// + ".jpg";
            
            //var Name = String(Name).split('://').pop().split(' ').join('_')/*.split('.').join('')*/.split('/').join('');
            //Name += "_" + String(mv.dialId).substr(-5) + ".jpg";
            
            var Name = dialImageFileName(Name, mv.dialId);
            
            //console.debug(Name);
            
            getFileSystem(saveFile, {
                 "path": getThumbsFileSystemPath(),
                 "name": Name,
                 "mv": mv,
                 "data": data,
                 "callback": function (url) {
                     //console.debug(url);
                     mv.image = url;
                     saveSiteThumbImage(mv);
                     if (callback) callback();
                    
                     if (error) {
                        console.info(error);
                         
                         if (checkUrlHasGoogleHost(mv.url) && mv.thumbType == showDialGalleryThumb)
                             error(mv);
                     }
                 }
             });
            
            /*
            saveSiteThumbImage(mv);
            if (callback) callback();
            if (error) error(mv);
            */
        }
        
    }

    /**
     * Make print screen on everhelper service
     *
     * @param mv Object
     * @param callback Function
     * @param error Function
     */
    function makePrintScreenOnEverhelperService(mv, callback, error) {
        //console.debug("makePrintScreenOnEverhelperService", mv);
        
        var hostName = getUrlHost(mv.url);
        if(!mv.image)
            mv.image = getNoTileImageFileName();
        
        //if(!mv.colorScheme) mv.colorScheme = getTileRandomColorScheme();
        mv.colorScheme = safeGetTileRandomColorScheme(mv.colorScheme);
        
        if(!mv.hostData)
            mv.hostData = hostName.split(".");
        var xhr = new XMLHttpRequest();
        
        xhr.onreadystatechange = function() {
            if (this.readyState == 4){
                
                if(this.status == 200) {
                    if(this.response) {
                        if(this.response.errorCode) {
                            saveSiteThumbImage(mv);
                            if(callback) callback();
                            if(error) error(mv);
                        } else {
                            if(this.response.body && getArrayLength(this.response.body)) {
                                var xhrEeverhelper = new XMLHttpRequest();
                                xhrEeverhelper.onreadystatechange = function(){
                                    if (this.readyState == 4){
                                        if(this.status == 200) {
                                            if(this.response && this.response.byteLength && this.response.byteLength <= thumbFileMaxSize) {
                                                try {
                                                    var data = new Blob([new Uint8Array(this.response)]);
                                                    
                                                    if(isAmazonProductURL(mv.url)) var Name = hostName + "_" + crc32(mv.url);
                                                    else var Name = hostName;
                                                    
                                                    Name += "_" + String(mv.dialId).substr(-5) + ".jpg";
                                                    
                                                    getFileSystem(saveFile, {
                                                        "path": getThumbsFileSystemPath(),
                                                        "name": Name,
                                                        "mv" : mv,
                                                        "data": data,
                                                        "callback": function(url) {
                                                            mv.image = url;
                                                            saveSiteThumbImage(mv);
                                                            if(callback) callback();
                                                            if(error) {
                                                                if(checkUrlHasGoogleHost(mv.url) && mv.thumbType == showDialGalleryThumb)
                                                                    error(mv);
                                                            }
                                                        }
                                                    });
                                                    
                                                } catch(e) {
                                                    
                                                    saveSiteThumbImage(mv);
                                                    if(callback) callback();
                                                    if(error) error(mv);
                                                }
                                            } else {
                                                saveSiteThumbImage(mv);
                                                if(callback) callback();
                                                if(error) error(mv);
                                            }
                                        } else {
                                            saveSiteThumbImage(mv);
                                            if(callback) callback();
                                            if(error) error(mv);
                                        }
                                    }
                                };
                                xhrEeverhelper.onerror = function (){
                                    saveSiteThumbImage(mv);
                                    if(callback) callback();
                                    //if(error) error(mv);
                                };

                                var previewItem = this.response.body[getArrayFirstKey(this.response.body)];
                                if(previewItem) {
                                    xhrEeverhelper.open('GET', BRW_urlTunnel(previewItem.url), true);
                                    xhrEeverhelper.responseType = 'arraybuffer';

                                    try {
                                        xhrEeverhelper.send();
                                    } catch(e) {
                                        saveSiteThumbImage(mv);
                                        if(callback) callback();
                                        if(error) error(mv);
                                    }
                                } else {
                                    saveSiteThumbImage(mv);
                                    if(callback) callback();
                                    if(error) error(mv);
                                }
                            } else {
                                saveSiteThumbImage(mv);
                                if(callback) callback();
                                if(error) error(mv);
                            }
                        }
                    } else {
                        saveSiteThumbImage(mv);
                        if(callback) callback();
                        if(error) error(mv);
                    }
                } else {
                    saveSiteThumbImage(mv);
                    if(callback) callback();
                    if(error) error(mv);
                }
            }
        };
        xhr.onerror = function (){
            saveSiteThumbImage(mv);
            if(callback) callback();
            if(error) error(mv);
        };
        xhr.open('GET', "http://everhelper.me/sdpreviews/listing.php?p=0&order=rating&on_page=1&host=" + encodeURI(hostName), true);//https
        xhr.responseType = 'json';
        
        try {
            if(hostName) {
                xhr.send();
            } else {
                saveSiteThumbImage(mv);
                if(callback) callback();
                if(error) error(mv);
            }
        } catch(e) {
            saveSiteThumbImage(mv);
            if(callback) callback();
            if(error) error(mv);
        }
    }

    /**
     * Make print screen on everhelper or live service
     *
     * @param mv Object
     * @param callback Function
     */
    function makePrintScreenOnEverhelperOrLiveService(mv, callback) {
        var hostName = getUrlHost(mv.url);
        
        if(!mv.image)
            mv.image = getNoTileImageFileName();
        
        //if(!mv.colorScheme) mv.colorScheme = getTileRandomColorScheme();
        mv.colorScheme = safeGetTileRandomColorScheme(mv.colorScheme);
        
        if(!mv.hostData)
            mv.hostData = hostName.split(".");
        var xhr = new XMLHttpRequest();
                
        xhr.onreadystatechange = function() {
            if (this.readyState == 4){
                if(this.status == 200) {
                    if(this.response) {
                        //this.response.errorCode = true;
                        if(this.response.errorCode) {
                            liveScreenOnPageLoadComplete(mv, callback);
                        } else {
                            if(this.response.body && getArrayLength(this.response.body)) {
                                var xhrEeverhelper = new XMLHttpRequest();
                                xhrEeverhelper.onreadystatechange = function(){
                                    if (this.readyState == 4){
                                        if(this.status == 200) {
                                            if(this.response && this.response.byteLength && this.response.byteLength <= thumbFileMaxSize) {
                                                try {
                                                    var data = new Blob([new Uint8Array(this.response)]);
                                                    
                                                    if(isAmazonProductURL(mv.url)) var Name = hostName + "_" + crc32(mv.url);
                                                    else var Name = hostName;
                                                    
                                                    Name += "_" + String(mv.dialId).substr(-5) + ".jpg";
                                                    
                                                    getFileSystem(saveFile, {
                                                        "path": getThumbsFileSystemPath(),
                                                        "name": Name,
                                                        "mv" : mv,
                                                        "data": data,
                                                        "callback": function(url) {
                                                            mv.image = url;
                                                            saveSiteThumbImage(mv);
                                                            callback();
                                                        }
                                                    });
                                                } catch(e) {
                                                    liveScreenOnPageLoadComplete(mv, callback);
                                                }
                                            } else {
                                                liveScreenOnPageLoadComplete(mv, callback);
                                            }
                                        } else {
                                            liveScreenOnPageLoadComplete(mv, callback);
                                        }
                                    }
                                };
                                xhrEeverhelper.onerror = function (){
                                    liveScreenOnPageLoadComplete(mv, callback);
                                };

                                var previewItem = this.response.body[getArrayFirstKey(this.response.body)];
                                if(previewItem) {
                                    xhrEeverhelper.open('GET', previewItem.url, true);
                                    xhrEeverhelper.responseType = 'arraybuffer';

                                    try {
                                        xhrEeverhelper.send();
                                    } catch(e) {
                                        liveScreenOnPageLoadComplete(mv, callback);
                                    }
                                } else {
                                    liveScreenOnPageLoadComplete(mv, callback);
                                }
                            } else {
                                liveScreenOnPageLoadComplete(mv, callback);
                            }
                        }
                    } else {
                        liveScreenOnPageLoadComplete(mv, callback);
                    }
                } else {
                    liveScreenOnPageLoadComplete(mv, callback);
                }
            }
        };
        xhr.onerror = function (){
            liveScreenOnPageLoadComplete(mv, callback);
        };
        
        xhr.open('GET', "http://everhelper.me/sdpreviews/listing.php?p=0&order=rating&on_page=1&host=" + encodeURI(hostName), true);//https
        xhr.responseType = 'json';
        
        if(isLocalResourceUrl(mv.url)){
            saveSiteThumbImage(mv);
            if(callback) callback();
        }else 
        if(isAmazonProductURL(mv.url)){
            if(printScreenOutsideService()){
                printScreenOnServiceLoadComplete(mv, callback);
            }else{
                liveScreenOnPageLoadComplete(mv, callback);
            }
        }else
        if(!checkUrlHasGoogleHost(mv.url)) {
            try {
                if(hostName) {
                    xhr.send();
                } else {
                    liveScreenOnPageLoadComplete(mv, callback);
                }
            } catch(e) {
                liveScreenOnPageLoadComplete(mv, callback);
            }
        } else {
            liveScreenOnPageLoadComplete(mv, callback);
        }
    }

    /**
     * Update screen site page
     * on page load
     *
     * @param mv Object
     * @param callback Function
     */
    function liveScreenOnPageLoadComplete(mv, callback) {
        if(printScreenOutsideService()){
            makePrintScreenOnEverhelperOrLiveService(mv, callback);
            return true;
        }
        
        var windowsParams = {
            focused: false,
            url: mv.url,
            left: dialsPopupScreenCoordinate,
            top: dialsPopupScreenCoordinate,
            width: 1,
            height: 1,
            type: "popup"
        };
        
        chrome.windows.create(windowsParams, function(w) {
            if(typeof (w) != "undefined") {
                if(isWindowsPlatform())
                    chrome.windows.update(w.id, {top: dialsPopupScreenCoordinate, left: dialsPopupScreenCoordinate, width: screen.width, height: screen.height});
                else
                    chrome.windows.update(w.id, {state: "minimized", top: dialsPopupScreenCoordinate, left: dialsPopupScreenCoordinate, width: screen.width, height: screen.height});

                chrome.windows.onRemoved.addListener(onLiveScreenInstallWindowRemove);
                var tab = w.tabs[0];

                liveScreensBuildTimeout = setTimeout(function(){
                    saveSiteThumbImage(mv);
                    callback();
                    
                    //chrome.windows.remove(w.id);
                    windowsRemoveSafe(w.id);
                    
                }, getTilesScreenBuiltTime());
                
                chrome.tabs.update(tab.id, {url: mv.url, muted: true}, function(tab) {
                    chrome.windows.update(w.id, {top: dialsPopupScreenCoordinate, left: dialsPopupScreenCoordinate});
                    if(tab) {
                        var counter = 0;
                        var interval = setInterval(function() {
                            try {
                                chrome.tabs.get(tab.id, function(tabInfo) {
                                    if (chrome.runtime.lastError) {
                                        chrome.runtime.lastError = null;
                                        if(interval)
                                            clearTimeout(interval);
                                        
                                        saveSiteThumbImage(mv);
                                        callback();
                                        
                                        //chrome.windows.remove(w.id);
                                        
                                        //clearTimeout(liveScreensBuildTimeout);
                                        windowsRemoveSafe(w.id);
                                        
                                    } else {
                                        if(tabInfo && tabInfo.status == "loading") {
                                            chrome.windows.update(w.id, {top: dialsPopupScreenCoordinate, left: dialsPopupScreenCoordinate});
                                            if(++counter == 15) {
                                                if(interval)
                                                    clearTimeout(interval);
                                                var hostName = getUrlHost(mv.url);
                                                if(!mv.image)
                                                    mv.image = getNoTileImageFileName();
                                                
                                                //if(!mv.colorScheme) mv.colorScheme = getTileRandomColorScheme();
                                                mv.colorScheme = safeGetTileRandomColorScheme(mv.colorScheme);
                                                
                                                if(!mv.hostData)
                                                    mv.hostData = hostName.split(".");
                                                saveSiteThumbImage(mv);
                                                callback();
                                                
                                                //chrome.windows.remove(w.id);
                                                
                                                //clearTimeout(liveScreensBuildTimeout);
                                                windowsRemoveSafe(w.id);
                                                
                                            }
                                        } else if (tabInfo && tabInfo.status == "complete") {
                                            chrome.windows.update(w.id, {top: dialsPopupScreenCoordinate, left: dialsPopupScreenCoordinate});
                                            
                                            chrome.tabs.executeScript(tabInfo.id, {
                                                code: getHiddenCaptureInjectScript()
                                            }, function() {
                                                if(interval)
                                                    clearInterval(interval);
                                                
                                                setTimeout(function() {
                                                    var hostName = getUrlHost(mv.url);
                                                    if(!mv.image)
                                                        mv.image = getNoTileImageFileName();
                                                    
                                                    //if(!mv.colorScheme) mv.colorScheme = getTileRandomColorScheme();
                                                    mv.colorScheme = safeGetTileRandomColorScheme(mv.colorScheme);
                                                    
                                                    if(!mv.hostData)
                                                        mv.hostData = hostName.split(".");
                                                    
                                                    try {
                                                        chrome.tabs.captureVisibleTab(w.id, function (image) {
                                                            if (image) {
                                                                mv.image = image;
                                                                saveSiteThumbImage(mv);
                                                            }
                                                            
                                                            chrome.tabs.executeScript(tabInfo.id, {
                                                                code: getHiddenCaptureInjectScript()
                                                            }, function () {
                                                                callback();
                                                                
                                                                //chrome.windows.remove(w.id);
                                                                
                                                                //clearTimeout(liveScreensBuildTimeout);
                                                                windowsRemoveSafe(w.id);
                                                                
                                                            });
                                                        });
                                                    } catch (e) {
                                                        saveSiteThumbImage(mv);
                                                        chrome.tabs.executeScript(tabInfo.id, {
                                                            code: getHiddenCaptureInjectScript()
                                                        }, function () {
                                                            callback();
                                                            
                                                            //chrome.windows.remove(w.id);
                                                            
                                                             //clearTimeout(liveScreensBuildTimeout);
                                                            windowsRemoveSafe(w.id);
                                                            
                                                        });
                                                    }
                                                }, 3000);
                                            });
                                        }
                                    }
                                });
                            } catch (e) {
                                if(interval)
                                    clearTimeout(interval);
                                
                                saveSiteThumbImage(mv);
                                callback();
                                
                                //chrome.windows.remove(w.id);
                                
                                //clearTimeout(liveScreensBuildTimeout);
                                windowsRemoveSafe(w.id);
                                
                            }
                        }, 1000);
                    } else {
                        saveSiteThumbImage(mv);
                        callback();
                        
                        //chrome.windows.remove(w.id);
                        
                        //clearTimeout(liveScreensBuildTimeout);
                        windowsRemoveSafe(w.id);
                        
                    }
                });
            }
        });
    }

    /**
     * Make thumb text image on host parse
     *
     * @param mv Object
     * @param callback Function
     * @param error Function
     */
    function makeTextThumbImageOnHostParse(mv, callback, error) {
        //var hostName = getUrlHost(mv.url);
        
        var hostName = getCleanRedirectUrl(mv.url);//JD firefox
        
        if(!mv.image)
            mv.image = getNoTileImageFileName();
        
        mv.colorScheme = safeGetTileRandomColorScheme(mv.colorScheme);
        
        if(!mv.hostData)
            mv.hostData = hostName.split(".");
        
        saveSiteThumbImage(mv);
        if(callback) callback();
    }

    function safeGetTileRandomColorScheme(colorScheme){
        if(
            !colorScheme 
            || 
            (
                typeof colorScheme == "object" 
                && 
                (
                    !colorScheme.color 
                    || 
                    !colorScheme.backgroundColor
                )
            )
        ){
            colorScheme = getTileRandomColorScheme();
        }
        
        return colorScheme;
    }

    /**
     * Print screen site page
     * on page load
     *
     * @param w Window
     * @param tab Tab
     * @param mv Object
     */
    function printScreenOnPageLoadComplete(w, tab, mv) {        
        if(typeof (mv) == "undefined" || typeof (mv.url) == "undefined") {
            callNextTilePrintScreen(w, tab);  
        } else {
            updateScreenOnPageLoadComplete(w, tab, mv);
        }
    }

    /**
     * Update screen site page
     * on page load
     *
     * @param w Window
     * @param tab Tab
     * @param mv Object
     */
    function updateScreenOnPageLoadComplete(w, tab, mv) {
        //console.debug("updateScreenOnPageLoadComplete", mv);
        
        var error = mv.error;
        
        if(typeof tab == "object" && tab.id){
            chrome.tabs.query({}, (tabs)=>{
                var tabExist = false;
                for(var key in tabs) if(tabs[key].id == tab.id){
                    tabExist = true;
                    break;
                }
                
                if(tabExist){
                    chrome.tabs.update(tab.id, {url: mv.url, muted: true}, function(tab) {
                        if(tab)
                        //chrome.windows.update(w.id, {top: dialsPopupScreenCoordinate, left: dialsPopupScreenCoordinate});

                        if(tab) {
                            var counter = 0, forceComplete = false;
                            var interval = setInterval(function() {
                                try {
                                    chrome.tabs.get(tab.id, function(tabInfo) {
                                        if (chrome.runtime.lastError) {
                                            chrome.runtime.lastError = null;
                                            if(interval)
                                                clearTimeout(interval);
                                            saveSiteThumbImage(mv);
                                            callNextTilePrintScreen(w, tab);
                                            if(error) error(mv);
                                        } else {
                                            if( 
                                                tabInfo 
                                                && 
                                                (
                                                    tabInfo.status == "loading" &&
                                                    counter >= 14 &&
                                                    tabInfo.title && String(tabInfo.title).length > 10 &&
                                                    tabInfo.favIconUrl &&
                                                    tabInfo.height
                                                )
                                            ){
                                                forceComplete = true;
                                                //console.info("forceComplete", forceComplete, counter);
                                            }
                                            
                                            //console.debug("trys", counter, tabInfo.status, tabInfo.title, tabInfo.favIconUrl, tabInfo.height);

                                            if(tabInfo && (tabInfo.status == "loading" && !forceComplete)) {
                                                chrome.windows.update(w.id, {top: dialsPopupScreenCoordinate, left: dialsPopupScreenCoordinate});
                                                if(++counter == 15) {
                                                    if(interval)
                                                        clearTimeout(interval);
                                                    var hostName = getUrlHost(mv.url);
                                                    mv.image = getNoTileImageFileName();

                                                    //if(!mv.colorScheme)  mv.colorScheme = getTileRandomColorScheme();
                                                    mv.colorScheme = safeGetTileRandomColorScheme(mv.colorScheme);

                                                    mv.hostData = hostName.split(".");
                                                    saveSiteThumbImage(mv);
                                                    callNextTilePrintScreen(w, tab);
                                                }
                                            } else if (tabInfo && (tabInfo.status == "complete" || forceComplete)) {
                                                chrome.windows.update(w.id, {top: dialsPopupScreenCoordinate, left: dialsPopupScreenCoordinate});
                                                chrome.tabs.executeScript(tabInfo.id, {
                                                    code: getHiddenCaptureInjectScript()
                                                }, function() {
                                                    if(interval)
                                                        clearInterval(interval);
                                                    setTimeout(function() {
                                                        var hostName = getUrlHost(mv.url);
                                                        mv.image = getNoTileImageFileName();

                                                        //if(!mv.colorScheme)  mv.colorScheme = getTileRandomColorScheme();
                                                        mv.colorScheme = safeGetTileRandomColorScheme(mv.colorScheme);

                                                        mv.hostData = hostName.split(".");
                                                        try {
                                                            chrome.tabs.captureVisibleTab(w.id, function (image) {
                                                                if (image) {
                                                                    mv.image = image;
                                                                    saveSiteThumbImage(mv);
                                                                }
                                                                chrome.tabs.executeScript(tabInfo.id, {
                                                                    code: getHiddenCaptureInjectScript()
                                                                }, function () {
                                                                    callNextTilePrintScreen(w, tabInfo);
                                                                });
                                                            });
                                                        } catch (e) {
                                                            saveSiteThumbImage(mv);
                                                            chrome.tabs.executeScript(tabInfo.id, {
                                                                code: getHiddenCaptureInjectScript()
                                                            }, function () {
                                                                callNextTilePrintScreen(w, tabInfo);
                                                            });
                                                        }
                                                    }, 3000);
                                                });
                                            }
                                        }
                                    });
                                } catch (e) {
                                    if(interval)
                                        clearTimeout(interval);
                                    saveSiteThumbImage(mv);
                                    callNextTilePrintScreen(w, tab);
                                    if(error) error(mv);
                                }
                            }, 1000);
                        } else {
                            stopPrintScreenBuildService();
                        }
                    });
                }//if
            });
        }
        
    }

    /**
     * Call next tile page
     * make print screen with service
     */
    function callNextTilePrintScreenService() {
        //console.trace();
        
        if(typeof (startTiles[loadedTiles]) == "undefined")
            stopPrintScreenBuildService();
        else
            printScreenOnServiceLoadComplete(startTiles[++loadedTiles]);
    }

    /**
     * Call next tile page
     * make print screen with everhelper service
     */
    function callNextTilePrintScreenEverhelperService() {
        
        if(typeof (startTiles[loadedTiles]) == "undefined")
            stopPrintScreenBuildEverhelperService();
        else
            printScreenOnEverhelperServiceLoadComplete(startTiles[++loadedTiles]);
    }

    /**
     * Call next tile page
     * make print screen with everhelper or live service
     */
    function callNextTilePrintScreenEverhelperOrLiveService() {
        //console.debug("callNextTilePrintScreenEverhelperOrLiveService", startTiles);
        
        if(typeof (startTiles[loadedTiles]) == "undefined")
            stopPrintScreenBuildEverhelperOrLiveService();
        else
            printScreenOnEverhelperOrLiveServiceLoadComplete(startTiles[++loadedTiles]);
    }

    /**
     * Call next tile page
     * make text image with host information
     */
    function callNextTileMakeTextThumbImage() {
        
        if(typeof (startTiles[loadedTiles]) == "undefined")
            stopBuildTextThumbImage();
        else
            makeTextThumbImageOnHostParseComplete(startTiles[++loadedTiles]);
    }

    /**
     * Call next tile page
     * make print screen
     *
     * @param w Window
     * @param tab Tab
     */
    function callNextTilePrintScreen(w, tab) {
        //console.debug("callNextTilePrintScreen", loadedTiles, startTiles);
        
        if(typeof (startTiles[loadedTiles]) == "undefined")
            stopPrintScreenBuild(w);
        else
            printScreenOnPageLoadComplete(w, tab, startTiles[++loadedTiles]);
    }

    /**
     * Stop make tile page
     * print screen with service
     *
     */
    function stopPrintScreenBuildService() {
        
        if(installService) {
            clearLastInstallState();
            installService = null;
            setAppInstalledDate();
        }
    }

    /**
     * Stop make tile page
     * print screen with everhelper service
     *
     */
    function stopPrintScreenBuildEverhelperService() {
        
        if(everhelperInstall) {
            clearLastInstallState();
            everhelperInstall = null;
            setAppInstalledDate();
        }
    }

    /**
     * Stop make tile page
     * print screen with everhelper or live service
     *
     */
    function stopPrintScreenBuildEverhelperOrLiveService() {
        
        if(everhelperLiveInstall) {
            clearLastInstallState();
            everhelperLiveInstall = null;
            setAppInstalledDate();
        }
    }

    /**
     * Stop make tile page
     * thumb text image
     *
     */
    function stopBuildTextThumbImage() {
        
        if(textDialsInstall) {
            clearLastInstallState();
            textDialsInstall = null;
            setAppInstalledDate();
        }
    }

    /**
     * Stop make tile page
     * print screen
     *
     * @param w
     */
    function stopPrintScreenBuild(w) {
        if(w && w.id) {
            //chrome.windows.remove(w.id);
            
            windowsRemoveSafe(w.id);
            
        }
    }

    /**
     * Save thumb data to DB
     *
     * @param mv Array
     */
    function saveSiteThumbImage(mv) {
        //console.debug("saveSiteThumbImage", mv);
        
        BRW_dbTransaction(function (tx) {
            var hostUrl= getUrlHost(mv.url);
            var dialId = mv.dialId;
            
            var thumbType = typeof (mv.thumbType) != "undefined" && checkThumbType(mv.thumbType) ? mv.thumbType : null;
            if(mv.url && mv.image && isAmazonProductURL(mv.url)){
                thumbType = speedDialThumbTypeAutopreviewText;
                mv.thumbType = thumbType;
            }
            //if(mv.forceMode)
            
            var searchUrlList = [];
            if(dialId) {
                searchUrlList.push(dialId);
                
                BRW_dbSelect({ //Param
                        tx : tx,
                        from: 'DIALS',
                        whereIn: {
                            'key': 'id',
                            'arr': searchUrlList
                        }
                    },
                    function (results) { //Success
                        var imagesResults = results.rows;
                        var imagesResultsLength = imagesResults.length;
                        var i;
                        if(imagesResultsLength) {
                            for (i = 0; i < imagesResultsLength; i++) {
                                if (mv.dialId == imagesResults[i].id) {
                                    var colorScheme;
                                    if (!imagesResults[i].bg_color || !imagesResults[i].text_color) {
                                        colorScheme = getTileRandomColorScheme();
                                    }
                                    
                                    if (mv.colorScheme || !imagesResults[i].bg_color || !imagesResults[i].text_color){
                                        if(mv.colorScheme) colorScheme = mv.colorScheme;
                                        else colorScheme = getTileRandomColorScheme();
                                    }else{
                                        colorScheme = {backgroundColor : imagesResults[i].bg_color, color: imagesResults[i].text_color};
                                    }
                                    
                                    mv.colorScheme = colorScheme;
                                    
                                    
                                    var upd = {
                                            image: mv.image,
                                            bg_color: colorScheme.backgroundColor, 
                                            text_color: colorScheme.color,
                                            thumb_type: thumbType,
                                        };
                                    
                                    //console.info("saveSiteThumbImage", "UPD", mv, upd);
                                    
                                    BRW_dbUpdate(
                                        { //Param
                                            tx : tx,
                                            table: 'DIALS',
                                            'set': upd,
                                            where: {
                                                key: 'id', val: mv.dialId
                                            }
                                            
                                        },
                                        function (results) {//Success
                                            //console.log("Success", results);
                                        },
                                        function (error) {//Error
                                            //console.log("Error", error);
                                        }
                                    );
                                    
                                    /*
                                    tx.executeSql('UPDATE DIALS SET image = ?, bg_color = ? , text_color = ? , thumb_type = ? WHERE id = ?',
                                        [mv.image, colorScheme.backgroundColor, colorScheme.color, thumbType, mv.dialId]);
                                    */
                                }
                            }
                        }
                    
                        setTimeout(function() {
                            getNetTabPages(sendThumbToApp, {"mv" : mv});
                        }, 250);
                    },
                    function (error) { //Error
                        //console.log("[error] saveSiteThumbImage -> BRW_dbSelect (1)", error);
                    }
                );
            } else {
                searchUrlList.push(hostUrl);
                searchUrlList.push(mv.url);
                
                BRW_dbSelect({ //Param
                        tx : tx,
                        from: 'IMAGES',
                        whereIn: {
                            'key': 'url',
                            'arr': searchUrlList
                        }
                    },
                    function (results) { //Success
                        var imagesResults = results.rows;
                        var imagesResultsLength = imagesResults.length;
                        var i;
                        if(imagesResultsLength) {
                            for (i = 0; i < imagesResultsLength; i++) {
                                if (mv.url == imagesResults[i].url || hostUrl == imagesResults[i].url) {
                                    if (!imagesResults[i].bg_color || !imagesResults[i].text_color) {
                                        var colorScheme = getTileRandomColorScheme();
                                    }

                                    if (!imagesResults[i].bg_color || !imagesResults[i].text_color)
                                        colorScheme = getTileRandomColorScheme();
                                    else
                                        colorScheme = {backgroundColor : imagesResults[i].bg_color, color: imagesResults[i].text_color};
                                    mv.colorScheme = colorScheme;
                                    
                                    //console.debug("Update", "getSitesTextThumbs", mv, hostUrl);
                                    
                                    BRW_dbUpdate(
                                        { //Param
                                            tx : tx,
                                            table: 'IMAGES',
                                            'set': {
                                                image: mv.image,
                                                bg_color: colorScheme.backgroundColor, 
                                                text_color: colorScheme.color,
                                                thumb_type: thumbType,
                                            },
                                            where: {
                                                key: 'url', val: mv.url
                                            } 
                                        }
                                    );
                                    
                                    BRW_dbUpdate(
                                        { //Param
                                            tx : tx,
                                            table: 'IMAGES',
                                            'set': {
                                                image: mv.image,
                                                bg_color: colorScheme.backgroundColor, 
                                                text_color: colorScheme.color,
                                                thumb_type: thumbType,
                                            },
                                            where: {
                                                key: 'url', val: hostUrl
                                            } 
                                        }
                                    );
                                }
                            }
                        } else {
                            colorScheme = getTileRandomColorScheme();
                            mv.colorScheme = colorScheme;
                            
                            BRW_dbInsert(
                                { //Param
                                    tx : tx,
                                    table: 'IMAGES',
                                    'set': {
                                        id      : new Date().getTime(),
                                        url     : hostUrl,
                                        image   : mv.image,
                                        bg_color: colorScheme.backgroundColor, 
                                        text_color: colorScheme.color,
                                        thumb_type: thumbType
                                    } 
                                }
                            );
                            /*
                            tx.executeSql('INSERT INTO IMAGES (id, url, image, bg_color, text_color, thumb_type) VALUES (?,?,?,?,?,?)',
                                [new Date().getTime(), hostUrl, mv.image, colorScheme.backgroundColor, colorScheme.color, thumbType]);
                            */
                        }
                        setTimeout(function() {
                            getNetTabPages(sendThumbToApp, {"mv" : mv});
                        }, 250);
                    },
                    function (error) { //Error
                        //console.log("[error] saveSiteThumbImage -> BRW_dbSelect (1)", error);
                    }
                );
            }
        });
    }

    /**
     * Send thumb to app
     * when loading complete
     *
     * @param data Object
     */
    function sendThumbToApp(data) {
        if(BROWSER != "chrome") BRW_sendMessage({"command" : "tileThumbLoadComplete", "mv" : data.mv}); //For firefox
        else{//For chrome
            var tabs = data.tabs;
            var tabsCount = tabs.length, i;
            for(i = 0; i < tabsCount; i++)
                chrome.tabs.sendMessage(tabs[i].id, {"command" : "tileThumbLoadComplete", "mv" : data.mv});
        }
    }

    /**
     * Send thumb to app end message
     * when loading complete
     *
     * @param data Object
     */
    function endSendThumbToApp(data) {
        
        // end send thumbs to application
    }

    function printScreenOutsideService(){
        if(BROWSER && BROWSER == 'firefox') return true;
//        return true;
        return false;
    }

    function windowsRemoveSafe(winId, callback) {
        chrome.windows.getAll((wins)=>{
            var winExists = false;
            for(var key in wins) if(wins[key].id == winId) winExists = true;
            
            if( winExists ){
                var callBackInfo =()=> {
                    console.info("Removed", winId);
                };

                try{
                    chrome.windows.remove(winId, callback || callBackInfo);
                }catch(ex){
                    console.debug(winId, ex);
                }
            }else{
                if(callback) callback();
            }
        });
    }

