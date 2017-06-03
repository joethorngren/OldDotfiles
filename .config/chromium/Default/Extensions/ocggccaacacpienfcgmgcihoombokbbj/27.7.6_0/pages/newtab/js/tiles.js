    /**
     * Application new tab page tiles
     */
    var pageTiles;
    var displayPopupTimeOut;
    var lastRestoredDialId;
    var lastRestoredDialUrl;
    var lastRestoredDialTimer;
    var needLoadTextTilesList;
    var needLoadTilesList;
    var tilesInMove = false;//firefox
    var currentActiveGroup = false;
    var initTilesCount = 0;

    /**
     * Build most viewed URLs
     *
     * @param mostVisitedURLs Array
     */
    function buildTilesList(mostVisitedURLs) { 
        if(mostVisitedURLs.length)
            getTilesDomainsTopLinks(mostVisitedURLs, analyzeTilesList);
        else
            analyzeTilesList([]);
    }

    /**
     * Analyze tiles list content
     * get db content
     *
     * @param tiles Array
     */
    function analyzeTilesList(tiles) { 
        var tilesURLs = [], i;
        var displayTilesCount = getDisplayTilesCount();
        pageTiles = [];
        for(i = 0; i < displayTilesCount; i++) {
            if(typeof (tiles[i]) != "undefined") {
                pageTiles.push(tiles[i]);
                tilesURLs.push(tiles[i].url);
            }
        }
        getTilesFromDB(pageTiles, tilesURLs);
    }

    /**
     * Get tiles from DB
     *
     * @param tiles Array
     * @param URLs Array
     */
    function getTilesFromDB(tiles, URLs) {
        var searchUrlList = [];
        var tilesLength = tiles.length;
        for (var j in URLs) {
            searchUrlList.push(getUrlHost(URLs[j]));
            searchUrlList.push(URLs[j]);
        }
                                          
        BRW_dbTransaction(function (tx) {                                  
            BRW_dbSelect(
                {//Param
                    tx : tx,
                    from    :  'IMAGES',
                    whereIn   : {
                        'key' : 'url',
                        'arr' : searchUrlList
                    }
                },
                function(results){//Success
                    var imagesResults = results.rows;
                    var imagesResultsLength = imagesResults.length;
                    var i, j;
                    for (j = 0; j < tilesLength; j++) {
                        tiles[j]['hostUrl'] = getUrlHost(tiles[j].url);
                        tiles[j].thumbType = null;
                        for (i = 0; i < imagesResultsLength; i++) {
                            if (tiles[j].url == imagesResults[i].url || tiles[j]['hostUrl'] == imagesResults[i].url) {
                                if(imagesResults[i].image)
                                    tiles[j].image = imagesResults[i].image;
                                if(imagesResults[i].bg_color && imagesResults[i].text_color)
                                    tiles[j].colorScheme = {"backgroundColor" : imagesResults[i].bg_color , "color" : imagesResults[i].text_color};
                                tiles[j].hostData = tiles[j]['hostUrl'].split(".");
                                tiles[j].thumbType = imagesResults[i].thumb_type;
                            }
                        }
                    }

                    BRW_sendMessage({command: "getDialsColumnsCount"}, function(data) {
                        if(data && data.maxColumns) {
                            setTimeout(function() {
                                applyTilesAreaSize(data);
                            }, 50);

                            var callback = (tiles.length && !$(".mv-tile, .mv-new-dial").length) || !tiles.length ? getBackgroundImage : null;
                            getBackgroundParams(callback, {"dials" : tiles});
                        }
                    });
                },        
                function(error){//Error

                }        
            );
        });
    }

    /**
     * Start prepare group tiles
     */
    function startPrepareCurrentGroupTiles() { 
        BRW_sendMessage({command: "getDialsColumnsCount"}, function(data) {
            
            if(data && data.maxColumns) {
                setTimeout(function() {
                    applyTilesAreaSize(data);
                    prepareCurrentGroupTiles();
                }, 50);
            }
        });
    }

    function applyTilesAreaSize(columns){
        getSidebarStatus(function(sidebar){
            var $container = $("#mv-tiles");
            var size = getDialFullSize();
            var browserWidth = Math.round($(window).width()) || 500;
            var max = calcMaxColumns(sidebar);
            
            if(columns.maxColumns == "auto") columns.maxColumns = max;
            var maxColumns = Math.min(max, (columns.maxColumns || 4));

            var setWidth = ((size.width || 200) + 20) * maxColumns;

            if(setWidth > browserWidth) setWidth = browserWidth;
            
            $container.css({width: setWidth});
            
            if(parseInt(setWidth) < 425) {
                $container.css({"min-width": "300px"});
            }
        });
        
        /*
        if(!$container.hasClass("page-dials-container-max-cols" + columns.maxColumns)){
            $container.addClass("page-dials-container-max-cols" + columns.maxColumns);
        }
        */
    }

    function recalculateDialsSize(){
        BRW_sendMessage({command: "getDialsColumnsCount"}, function(data) {
            
            if(data && data.maxColumns) {
                setTimeout(function() {
                    applyTilesAreaSize(data);
                }, 50);
            }
        });
    }

    /**
     * Prepare current group page dials
     */
    function prepareCurrentGroupTiles(dontRefresh) { 
        if(getDisplaySpeedDialPanel()) {
            BRW_sendMessage({command: "getActiveGroup", withDials: true}, function(data) {
                //console.debug("Get Active Group", data);
                
                if(data && data.group) {
                    currentActiveGroup = data.group.id;
                    
                    data.group = prepareCurrentGroupTilesEnd(data.group);
                    
                    if(!dontRefresh || (data.group.dials && data.group.dials.length)){
                        removeCurrentThemeVideo();
                        getBackgroundParams(getBackgroundImage, {"dials" : data.group.dials, "group" : data.group});
                    }
                        
                    if(!dontRefresh && (!data.group.dials || !data.group.dials.length)){
                        setTimeout(function(){
                            prepareCurrentGroupTiles(true);
                        }, 500);
                    }//if
                }
                else
                if(!localStorage['install-key'] || Date.now() - localStorage['install-key'] < 60000){
                    //console.debug("ReInit");
                    
                    setTimeout(function(){
                        prepareCurrentGroupTiles(true);
                    }, 750);
                }
                else{
                    getBackgroundParams(getBackgroundImage, {"dials" : [], "group" : {}});
                    
                    setTimeout(function(){
                        var slient = parseInt(localStorage.getItem("backup-slient") || 0);
                        var restoring = parseInt(localStorage.getItem("restoring") || 0);
                        var now = Date.now();
                        
                        if((now - restoring) > (60 * 1000)){
                            if(typeof BACK == "object" && slient < 3){
                                BACK.newtabModal(
                                    function(){//success

                                    }, 
                                    function(){//modal close
                                        localStorage.setItem("backup-slient", ++slient);
                                        restoreDefaultActions();
                                    }, 
                                    function(){//modal close
                                        restoreDefaultActions();
                                    }
                                );
                            }else{
                                restoreDefaultActions();
                            }//else
                        }//if
                        
                    }, 999); 
                    
                }
            });
        } else {
            getBackgroundParams(getBackgroundImage, {"dials" : [], "group" : {}});
        }
    }

    var restoreDefaultActions = function(){
        if(setDefaultGroup && setDefaultDials){
            localStorage.removeItem('defaultGroupsInstalled');

            setDefaultGroup(setDefaultDials);

            setTimeout(function(){
                prepareCurrentGroupTiles(true);
                getSidebarGroups();
            }, 999);
        }//if
    };
    /**
     * Prepare current group tiles end
     *
     * @param group Object
     * @returns {object}
     */
    function prepareCurrentGroupTilesEnd(group) { 
        var dials = [];
        for(var i in group.dials) {
            if(group.dials.hasOwnProperty(i)) {
                var dial = group.dials[i];
                if(checkTileFormat(dial, true)) {
                    dial.thumbType = dial.thumb_type;
                    if(dial.bg_color && dial.text_color)
                        dial.colorScheme = {"backgroundColor" : dial.bg_color, "color" : dial.text_color};
                    dial.hostUrl = getUrlHost(dial.url);
                    dial.hostData = dial.hostUrl.split(".");
                    dials.push(dial);
                }
            }
        }
        group.dials = dials;
        return group;
    }

    /**
     * Display history items
     *
     * @param data Object
     */
    function displayHistoryItems(data) { 
        var group = data.group;
        var tiles = data.dials;
        var $tilesContainer = $("#mv-tiles");
        var showContainerAnimation = !$tilesContainer.css("opacity");

            needLoadTilesList = [];
            needLoadTextTilesList = [];
        
        $tilesContainer.fadeOut(135, function () {
            var $el = $(this).html('');
            if (data.displaySpeedDialPanel) {                
                for (var i = 0; i < tiles.length; i++) {
                    var mv = tiles[i];
                        mv.title = mv.title ? mv.title : mv.url;
                        mv.dialId = group ? mv.id  : null;
                    var $tile = mv.url ? displayTileItem(mv, i) : addEmptyTileItem();
                    $el.append($tile);
                }
                initTilesContextMenu(group);
                
                if(group) {
                    var $addNewDial = displayAddNewDial();
                    $el.append($addNewDial);
                    $addNewDial.animate({
                        "opacity" : ($addNewDial.filter(':hover').length/*.is(":hover")*/ ? getMaxDialsFormOpacity() : getDialsFormOpacity())
                    }, {"duration" : getDisplayDialsSpeed(), "queue" : true});

                    $tilesContainer.sortable({
                        placeholder: "mv-placeholder",
                        forcePlaceholderSize: true,
                        delay: 100,
                        tolerance: "pointer",
                        cursor: "move",
                        appendTo: "body",
                        items: "> .mv-tile",
                        "disabled" : false,
                        start: function (ev, ui) {
                            tilesInMove = true;
                            $(ui.item).addClass("mv-dial-sortable");
                        },
                        stop: function (ev, ui) {
                            $(ui.item).removeClass("mv-dial-sortable");
                            setTimeout(function () {
                                tilesInMove = false;
                                
                                BRW_sendMessage({
                                    command: "moveDialsOrder",
                                    collectDials: collectCurrentDirectoryDials()
                                });
                            }, 250);
                        }
                    });
                } else {
                    $tilesContainer.sortable({
                        "disabled" : true
                    });
                }

                setLoadTilesThumbsList(needLoadTilesList);
                setLoadTilesTextThumbsList(needLoadTextTilesList);

                setTimeout(function () {
                    setTilesHoverBlockFadeEffects($el);
                    displayTiles(showContainerAnimation);
                }, 1);
            }

            setTimeout(function () {
                displaySearch();
                displayClock();
            }, 1);
        });
    }

/*    
    var tilesContainerFadeTime = 100;
    function displayHistoryItems(data) { 
        console.debug("Prepare dials wrap (start)", (Date.now()-TIMER)/1000, "sec");
        
        var group = data.group;
        var tiles = data.dials;
        var $tilesContainer = $("#mv-tiles");
        var showContainerAnimation = !$tilesContainer.css("opacity");
        initTilesCount = tiles.length;

        needLoadTilesList = [];
        needLoadTextTilesList = [];
        
        var $allTiles = [];
        setTimeout(()=>{
            for (var i = 0; i < tiles.length; i++) {
                var mv = tiles[i];
                    mv.title = mv.title ? mv.title : mv.url;
                    mv.dialId = group ? mv.id  : null;
                var $tile = mv.url ? displayTileItem(mv, i) : addEmptyTileItem();

                $allTiles.push($tile);
            }
        },1);
        
        $tilesContainer.fadeOut(tilesContainerFadeTime);
        
        console.debug("Start interval");
        
        var N=0; tilesInterval = setInterval(function(){
            N++;
            
            //console.debug(N, tiles.length, $allTiles.length);
            
            if(
                (tiles.length == $allTiles.length && N*55 >= tilesContainerFadeTime)
                ||
                (N > 300)
            ){
                clearInterval(tilesInterval);
                tilesContainerFadeTime = 150;
                
                var $el = $tilesContainer.html('');
                if (data.displaySpeedDialPanel) {           
                    $el.append($allTiles);
                    //console.debug("Add Tiles", (Date.now()-TIMER)/1000, "sec");

                    initTilesContextMenu(group);

                    if(group) {
                        var $addNewDial = displayAddNewDial();
                        $el.append($addNewDial);
                        $addNewDial.animate({
                            "opacity" : ($addNewDial.filter(':hover').length ? getMaxDialsFormOpacity() : getDialsFormOpacity())
                        }, {"duration" : getDisplayDialsSpeed(), "queue" : true});

                        $tilesContainer.sortable({
                            placeholder: "mv-placeholder",
                            forcePlaceholderSize: true,
                            delay: 100,
                            tolerance: "pointer",
                            cursor: "move",
                            appendTo: "body",
                            items: "> .mv-tile",
                            "disabled" : false,
                            start: function (ev, ui) {
                                tilesInMove = true;
                                $(ui.item).addClass("mv-dial-sortable");
                            },
                            stop: function (ev, ui) {
                                $(ui.item).removeClass("mv-dial-sortable");
                                setTimeout(function () {
                                    tilesInMove = false;

                                    BRW_sendMessage({
                                        command: "moveDialsOrder",
                                        collectDials: collectCurrentDirectoryDials()
                                    });
                                }, 250);
                            }
                        });
                    } else {
                        $tilesContainer.sortable({
                            "disabled" : true
                        });
                    }

                    setLoadTilesThumbsList(needLoadTilesList);
                    setLoadTilesTextThumbsList(needLoadTextTilesList);

                    setTimeout(function () {
                        //console.debug("Prepare dials wrap (end)", (Date.now()-TIMER)/1000, "sec");
                        setTilesHoverBlockFadeEffects($el);
                        displayTiles(showContainerAnimation);
                        
                        addScrollDials();
                    }, 1);
                }

                setTimeout(function () {
                    displaySearch();
                    displayClock();
                }, 1);
            }
        }, 55);
    }
*/

    /**
     * Display add new dial block
     */
    function displayAddNewDial() { 
        var $dial = $("<a></a>");
        $dial.addClass("mv-new-dial");
        
        applySizeToDial($dial, -1, -1);
        
        $dial.tooltip({
            "placement": "bottom",
            "delay": {show: 600},
            "trigger": "hover",
            "title": translate("page_new_dial_tooltip")
        });
        $dial.on("click", showAddNewDialPopup);
        var $newDialImg = $("<img>");
        $newDialImg.attr("src", extensionGetUrl("pages/newtab/img/dials/new_dial_plus.png"));
        $newDialImg.addClass("mv-new-dial-img");
        $dial.append($newDialImg);

        displayTileWithOpacityEffect($dial);
        addHoverFadeEffectToElements($dial);

        return $dial;
    }

    /**
     * Show add new dial popup
     *
     * @param e Event
     */
    function showAddNewDialPopup(e) {
        e.preventDefault();
        var $modal = $('#add-new-dial-dialog');
        var $modalTitle = $modal.find("#add-new-dial-dialog-title");
        var $form = $modal.find("#add-new-dial-form");
        if($form) {
            $modalTitle.text(translate("add_new_dial_dialog_title"));
            if($form.hasClass("edit-dial-dialog"))
                $form.removeClass("edit-dial-dialog");
            $form.attr("data-edit-dial-groupId", 0);
            $form.attr("data-edit-dial-dialId", 0);
            //getNewDialGroups();
        }

        $modal.modal();
    }

    /**
     * Add empty tile item if no url
     *
     * @returns {*|jQuery|HTMLElement}
     */
    function addEmptyTileItem() { 
        var $tile = $("<div></div>");
        $tile.addClass("mv-tile");
        $tile.addClass("mv-no-select");
        
        applySizeToDial($tile);
        
        addTileFooterShadow($tile);
        
        return $tile;
    }
    
    var dialSizeCache = false; 
    function applySizeToDial($tile, wFix, hFix){
        var size = (dialSizeCache || getDialFullSize());
        
        //if(!getDialsBackground()) size.height -= 28;
        
        $tile.css({
           width:  size.width + parseInt(wFix || 0) + "px",
           height: size.height + parseInt(hFix || 0) + "px",
        });
        
        /*
        $thumb = $tile.find(".mv-thumb");
        if($thumb.length){
            var min = getMinDialsSize();
            var max = getMaxDialsSize();
            
            var ratio = (size.width - min) / (max-min);
            
            var height = 65 + (26 * ratio);
            
            $thumb.css({
               height: height + "%",
            });  
        }
        */
        
        return $tile;
    }

    function addTilesSizeLiveHandler() {
        $(document).on("DOMNodeInserted", ".mv-new-dial, .mv-placeholder", function(){
            applySizeToDial($(this));
        });
    }
    

    function redrawTilesLinks(){
        $("#mv-container").find(".mv-tile[fullHref]").each(function(){
            var link = String($(this).attr("fullHref"));
            if(
                link.indexOf("://") != -1
                &&
                link.indexOf("amazon.") != -1
            ){
                if(link.indexOf("tag=param_fvd") != -1){
                    link = link.replace("?tag=param_fvd", "&tag=param_fvd").split("&tag=param_fvd").shift();
                }
                
                $(this).attr("fullHref", link);
            }
        });
    }
    
    function clickDial($el, whichTab){
        sendToGoogleAnaliticMP(function() {
            gamp('send', 'event', 'dial', 'click');
        });
        
        if(!tilesInMove){
            BRW_sendMessage({
                command: "openSelectedDialUrl", url: $el.attr("fullHref"),
                newtab: whichTab
            });
        }//if
    }

    /**
     * Display tile item
     *
     * @param mv Object
     * @returns {*|jQuery|HTMLElement}
     */
    function displayTileItem(mv, i) {     
        mv.cleanURL = String(getCleanRedirectUrl(getCleanRedirectTxt(mv.url, true)));
        
        var ahref = mv.cleanURL;
        
        if(ahref.indexOf("://") == -1) ahref = 'http://'+ahref;
        
        var $tile = $("<a></a>");
            $tile.attr("defHref", ahref);
            $tile.attr("fullHref", addLinkProtocol(mv.url));
            $tile.attr("title", mv.title);
            $tile.attr("data-tileid", i);
            $tile.attr("data-dialId", mv.dialId);
            $tile.attr("data-groupId", mv.groupId);
            $tile.addClass("mv-tile");
            $tile.addClass("mv-tile-instance");
            $tile.addClass("mv-no-select");
            
            $tile.on("mousedown", function(e) {   
                if(e.which == 2){
                    e.preventDefault();
                    clickDial($(this), 2);
                }
            });
            
            $tile.on("click", function(e) {
                //e.stopPropagation(); e.preventDefault();
                if(e.which != 2){
                    var whichTab = false;

                    if((window.event||e).ctrlKey || e.which == 2){

                        if((window.event||e).shiftKey == true) whichTab = 1;
                        else whichTab = 2;
                    }//if

                    clickDial($(this), whichTab);
                }
            });
            /*
            $tile.on("mouseup", function(e) {
                e.stopPropagation(); e.preventDefault();
                return false;
            });
            */
        
        var $tileContainer = $("<div></div>").addClass("mv-tile-container");

        var $favicon = $("<div></div>").addClass("mv-favicon");
        var $faviconImg = $("<img>").attr("src", BRW_favicon(mv.url));
            $favicon.append($faviconImg);

        var $title = $("<div></div>")
            .addClass("mv-title")
            .text(String(mv.title).replace('http://', '').replace('https://', '').replace('ftp://', '').replace('file:///', ''))
        ;
        var $thumb = $("<div></div>").addClass("mv-thumb");

        var $mvRightButtons = $("<div></div>").addClass("mv-right-buttons");
        var $mvRightButtonsContainer = $("<div></div>").addClass("mv-right-buttons-container");

        var $settings = $("<div></div>").addClass("mv-settings");
            $settings.attr("title", translate("page_speed_dials_settings_title"));
        var $close = $("<div></div>").addClass("mv-close");
            $close.attr("title", translate("page_speed_dials_close_title"));
            $close.attr("data-url", mv.url);
            $close.attr("data-dialId", mv.dialId);
            $close.on("click", deleteHistoryItem);
        
        
        var searchService = OnDialSearch.getSearchForUrl("http://"+mv.cleanURL);
        
        if  (
                (searchService && searchService.site) ||
                mv.cleanURL.indexOf('booking.com') > -1 ||
                mv.cleanURL.indexOf('amazon.') > -1 ||
                mv.cleanURL.indexOf('ebay.com') > -1
            ){
                var $search = $("<div></div>").addClass("mv-search");
                    $search.attr("title" , translate("page_speed_dials_search_title")+" "+mv.cleanURL);
                    $search.attr("search", mv.cleanURL);
                    
                var srch = new DialsSearch();
                    srch.init($search, mv.cleanURL, Date.now(), searchService, mv.image);
            }//if
        else var $search = false;

        var $focusTileMask = $("<div></div>");
            $focusTileMask.addClass("mv-mask");

            $tile.on("focusin", function() {
                $(this).find(".mv-mask").addClass("mv-mask-bg");
                $("#search-suggestion").hide();
                $("#search-input-box").removeClass('with-suggestions');
            });
            $tile.on("focusout", function() {
                $(this).find(".mv-mask").removeClass("mv-mask-bg");
            });

        $tileContainer.append($focusTileMask);

        var $dotBg = $("<div></div>").addClass("mv-dot-bg");
        var $dotImage = $("<div></div>").addClass("mv-dot");

        var loadingImg = extensionGetUrl("pages/newtab/css/img/buttons/tiles/loading.gif");
        var $thumbImg = $("<div></div>");
        
        if(mv.image){
            if(
                (mv.image.indexOf('chrome-extension') != -1 && browserName(true) == 'ff') ||
                (mv.image.indexOf('at-livestartpage-dot-com') != -1 && browserName(true) != 'ff')
            ){
                mv.image = "";
            }
        }//if
        
        if((mv.image && mv.image == getNoTileImageFileName()) || mv.thumbType == showDialTextThumb) {
            if(typeof (mv.colorScheme) == "undefined") {
                $thumb.append($dotBg.append($dotImage));
                needLoadTextTilesList.push(mv);
            } else {
                prepareTextDial($thumb, mv);
            }
        } else if(mv.image && mv.image != 'undefined') {
            if(checkUrlHasGoogleHost(mv.url)  && (!mv.thumbType || mv.thumbType == showDialGalleryThumb) && mv.image.indexOf("data:image") == -1 && mv.image.indexOf("filesystem") == -1 && mv.image.indexOf("resource") == -1) {
                if(typeof (mv.colorScheme) == "undefined") {
                    $thumb.append($dotBg.append($dotImage));
                    needLoadTextTilesList.push(mv);
                } else{
                    prepareTextDial($thumb, mv);
                }
            } else {
                if(mv.image.indexOf("data:image") < 0/* && mv.image.indexOf("blob:resource") < 0*/) {
                    $thumbImg = $("<div></div>");
                    $thumbImg.addClass("thumbnail");
                    $thumb.append($thumbImg);
                    
                    $thumb.addClass("mv-thumb-image");
                    
                    if(mv.thumbType && mv.thumbType == 3) $thumb.addClass("mv-thumb-screen");
                    
                    $thumbImg.css({"background" : "url('" + noCacheImage( mv.image ) + "') 50% 50% / contain no-repeat"});
                    $thumbImg.attr("image", mv.image);
                    //$thumbImg.text(mv.image.split('/').pop());
                } else {
                    if (mv.thumbType == showDialGalleryThumb) {
                        if(typeof (mv.colorScheme) == "undefined") {
                            $thumb.append($dotBg.append($dotImage));
                            needLoadTextTilesList.push(mv);
                        } else
                            prepareTextDial($thumb, mv);
                    } else {
                        $thumbImg = $("<div></div>");
                        $thumbImg.addClass("thumbnail");
                        $thumb.append($thumbImg);
                        $thumb.addClass("mv-thumb-live");
                        $thumbImg.css({"background" : "url('" + noCacheImage( mv.image ) + "') 50% 50% / contain no-repeat"});
                        $thumbImg.attr("image", mv.image);
                    }
                }
            }
        } else {
            $thumb.addClass("mv-thumb-loading");
            $thumbImg.css({"background" : "url('" + loadingImg + "') 50% 50% no-repeat"});
            $thumbImg.addClass("thumbnail").addClass("thumbnail-loading");
            $thumb.append($thumbImg);
            needLoadTilesList.push(mv);
        }
        
        if($thumbImg) displayTileItemReDraw($thumbImg, mv);//firefox

        $mvRightButtonsContainer.append($settings).append($close);
        $mvRightButtons.append($mvRightButtonsContainer);
        $tileContainer.append($mvRightButtons).append($favicon).append($title).append($thumb);
        $tile.append($tileContainer);
        if($search) $tileContainer.append($search);

        displayTileWithOpacityEffect($tile);
        
        applySizeToDial($tile);
        addTileFooterShadow($tile);
        /*
        $tileContainer.on("mouseup", function(e){
            e.preventDefault();
        });
        $tileContainer.on("click", function(e){
            e.preventDefault();
        });
        */
        return $tile;
    }
    
    /**
     * Re generate lost blob image for thumbnail
     *
     * @param $thumbImg jQuery element
     * @param mv Object
     */
    function displayTileItemReDraw($thumbImg, mv){//firefox
        if(BROWSER && BROWSER == 'firefox' && mv.image && mv.image.indexOf("blob:resource") >= 0){
            if(isAmazonProductURL(mv.url)) var Name = mv.hostUrl + "_" + crc32(mv.url);// + ".jpg";
            else var Name = mv.hostUrl;// + ".jpg";
            
            var NamePast = Name + ".jpg";
            //var NameNew  = Name + "_" + String(mv.dialId).substr(-5) + ".jpg";
            var NameNew = dialImageFileName(Name, mv.dialId);
            
            BRW_getFileSystem(function(){//Wait for load filesystem
                fileStorage.getAttachment('thumbs', NamePast).then(function(blob){
                    //console.debug(NamePast, blob);
                    
                    if(blob) displayTileItemReDrawUpdate($thumbImg, mv, blob);
                    else{
                        fileStorage.getAttachment('thumbs', NameNew).then(function(blob_new){
                            //console.debug(NameNew, blob_new);
                            if(blob_new) displayTileItemReDrawUpdate($thumbImg, mv, blob_new);
                        });
                    }
                });
            });
        }//if
    }

    function displayTileItemReDrawUpdate($thumbImg, mv, blob){//firefox
        var blobURL = URL.createObjectURL(blob);                        
        $thumbImg.css("background", "url('" + blobURL + "') 50% 50% / contain no-repeat");
        //$thumbImg.attr("image", mv.image);
        $thumbImg.attr("image", blobURL); // #Task 618
    }

    /**
     * Display tiel with opacity effect
     *
     * @param $tile jQuery element
     */
    function displayTileWithOpacityEffect($tile) { 
        $tile.animate({
            "opacity" : ($tile.filter(':hover').length/*.is(":hover")*/ ? getMaxDialsFormOpacity() : getDialsFormOpacity())
        }, {"duration" : 0, "queue" : true});
    }

    /**
     * Try load tile thumbs that has no images
     *
     * @param needLoadTilesList array
     */
    var tilesThumbsListReloaded=false;
    function setLoadTilesThumbsList(needLoadTilesList) { 
        if(tilesThumbsListReloaded) return;
        else tilesThumbsListReloaded = true;
        
        if(needLoadTilesList.length) {
            setTimeout(function() {
                BRW_sendMessage({
                    "command": "thumbLoad",
                    "tiles" : needLoadTilesList
                });
            }, 1500);
        }
    }

    /**
     * Try load tile thumbs that has no images
     *
     * @param needLoadTextTilesList array
     */
    function setLoadTilesTextThumbsList(needLoadTextTilesList) { 
        if(needLoadTextTilesList.length) {
            setTimeout(function() {
                BRW_sendMessage({
                    "command": "textThumbLoad",
                    "tiles" : needLoadTextTilesList
                });
            }, 1500);
        }
    }

    /**
     * Set tiles block fade effect
     *
     * @param $tilesContainer jQuery element
     */
    function setTilesHoverBlockFadeEffects($tilesContainer) { 
        var $dials = $tilesContainer.find(".mv-tile, .mv-new-dial");
        addHoverFadeEffectToElements($dials);
    }

    /**
     * Add hover fade effect to elements
     *
     * @param $dials Array|Object
     */
    function addHoverFadeEffectToElements($dials) { 
        var minDialsOpacity = getDialsFormOpacity();
        var maxDialsOpacity = getMaxDialsFormOpacity();
        var dialsOpcatitySpeed = getDisplayDialsSpeed();

        $dials.off('hover').hover(function() {
            $(this).animate({"opacity" : maxDialsOpacity}, {"duration" : dialsOpcatitySpeed, "queue" : false});
        }, function() {
            $(this).animate({"opacity" : minDialsOpacity}, {"duration" : dialsOpcatitySpeed, "queue" : false});
        });
        $dials.off("focusin").on("focusin", function(){
            $(this).animate({"opacity" : maxDialsOpacity}, {"duration" : dialsOpcatitySpeed, "queue" : false});
        });
        $dials.off("focusout").on("focusout", function(){
            $(this).animate({"opacity" : minDialsOpacity}, {"duration" : dialsOpcatitySpeed, "queue" : false});
        });
    }

    /**
     * Add restore dial block
     *
     * @param $container jQuery element
     */
    function setRestoreTileBlock($container) { 
        var $restoreContainerWrap = $("<div></div>").addClass("mv-restore-container-wrap");
        $restoreContainerWrap.attr("id", "mv-restore-container-wrap");
        var $restoreContainer = $("<div></div>").addClass("mv-restore-container");
        $restoreContainer.attr("id", "mv-restore-container");
        var $restoreText = $("<span></span>").addClass("mv-restored-dial-text").text(translate("page_tiles_remove_text"));
        var $restoreLink = $("<a></a>").addClass("mv-restore-dial").text(translate("page_tiles_restore_text"));
        $restoreLink.attr("id", "mv-restore-dial");
        $restoreLink.on("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            if(lastRestoredDialId) {
                BRW_sendMessage({"command": "restoreRemovedDialById", "val" : lastRestoredDialId}, function(data) {
                    if(lastRestoredDialTimer)
                        clearTimeout(lastRestoredDialTimer);
                    $(".mv-tile[data-dialId=" + lastRestoredDialId + "]").each(function() {
                        var $el = $(this);
                        if(!$el.is(":visible")) {
                            var $restoreContainer = $("#mv-restore-container-wrap");
                            if($restoreContainer.is(":visible"))
                                $restoreContainer.hide(0);
                            $el.show(0, function() {
                                setTimeout(function () {
                                    BRW_sendMessage({
                                        command: "moveDialsOrder",
                                        "collectDials": collectCurrentDirectoryDials()
                                    });
                                }, 250);
                            });
                        }
                    });
                    lastRestoredDialUrl = null;
                    lastRestoredDialId = null;
                });
            } else if(lastRestoredDialUrl) {
                BRW_sendMessage({"command": "restoreRemovedDialByUrl", "val" : lastRestoredDialUrl}, function(data) {
                    if(lastRestoredDialTimer)
                        clearTimeout(lastRestoredDialTimer);
                    lastRestoredDialUrl = null;
                    lastRestoredDialId = null;
                    analyzeHistory(buildTilesList);
                });
            }
        });

        var $restoreCloseBtn = $("<div></div>").addClass("mv-restore-close");
        $restoreCloseBtn.on("click", function() {
            if(lastRestoredDialId)
                $(".mv-tile[data-dialId=" + lastRestoredDialId + "]").each(function() {
                    $(this).remove();
                });

            if(lastRestoredDialTimer)
                clearTimeout(lastRestoredDialTimer);
            lastRestoredDialUrl = null;
            lastRestoredDialId = null;

            if($restoreContainerWrap.is(":visible"))
                $restoreContainerWrap.fadeOut(350);
        });

        $restoreContainer.append($restoreText);
        $restoreContainer.append($restoreLink);
        $restoreContainer.append($restoreCloseBtn);
        $restoreContainerWrap.append($restoreContainer);
        $container.append($restoreContainerWrap);

        var lastRestoredDialHost = getUrlHost(lastRestoredDialUrl);
        if((lastRestoredDialId || lastRestoredDialUrl) && lastRestoredDialHost)
            $restoreContainerWrap.show(0);
    }

    /**
     * Display tiles
     *
     * @param showContainerAnimation Bool
     */
    function displayTiles(showContainerAnimation) { 
        var minDialsOpacity = getDialsFormOpacity();
        var displayPageSpeed = getDisplayPageSpeed();

        BRW_sendMessage({"command": "getVisibleSpeedDialPanel"}, function(data) {
            var $tilesContainer = $("#mv-tiles");
            var $dials = $tilesContainer.find(".mv-tile, .mv-new-dial");
            var tilesBlockVisibleState = data.visible;
            
            if(tilesBlockVisibleState) {
                if(showContainerAnimation) $dials.css({"opacity" : 0});
                $tilesContainer.css({"display" : "block"}).animate({"opacity" : 1}, {"duration" : displayPageSpeed, "queue" : true});
                dialsShowMode();
            } else {
                $tilesContainer.css({"display" : "none", "opacity" : 1});
                $dials.css({"opacity" : minDialsOpacity});
                if(getDisplaySpeedDialPanel()) {
                    if(!getDialsNoticeHideState()) {
                        var $popup = $("#dials-notifications");
                        $popup.fadeIn(displayPageSpeed);
                        displayPopupTimeOut = setTimeout(function(){
                            var $popup = $("#dials-notifications");
                            if($popup.is(":visible"))
                                $popup.fadeOut(250);
                            clearTimeout(displayPopupTimeOut);
                        }, 2500);
                    }
                }
            }
            
            setRestoreTileBlock($tilesContainer);
        });
    }
    
    function dialsShowMode(){
        var $tilesContainer = $("#mv-tiles");
        
        if(!getDialsBackground()){
            $tilesContainer.addClass("dials-no-background");
            
            if(!getDialsBorders()) $tilesContainer.addClass("dials-no-borders");
            else $tilesContainer.removeClass("dials-no-borders");
            
        }else $tilesContainer.removeClass("dials-no-background").removeClass("dials-no-borders");
    }

    /**
     * Display search
     */
    function displaySearch() { 
        var minSearchOpacity = getSearchFormOpacity();
        var maxSearchOpacity = getMaxSearchFormOpacity();
        var toggleOpacitySpeed = getToggleOpacitySpeed();
        var displayPageSpeed = getDisplayPageSpeed();

        getDisplaySearchForm(function(display) {
            var $searchForm = $("#search-input-box");
            
            if(display && !$searchForm.is(":visible")) {
                setTimeout(function() {
                    var $formContainer = $("#search-input-box");
                    var $searchInput = $("#search-input");
                    var $searchField = $("#search-input-field");
                    var $speechInput = $("#search-speed-container");
                    var fadeTimeOut = false;
                    
                    
                    $formContainer.on("focusin", function(){
                        clearTimeout(fadeTimeOut);
                        $searchForm.stop().animate({"opacity" : maxSearchOpacity}, {"duration" : toggleOpacitySpeed / 3, "queue" : false});
                        $searchField.addClass("hover");
                    });
                    
                    $formContainer.on("focusout", function(){
                        clearTimeout(fadeTimeOut);
                        fadeTimeOut = setTimeout(()=>{
                            if(!$("#search-input").filter(':hover').length && !$("#search-provider-selector").hasClass("opened")){
                                $searchForm.stop().animate({"opacity" : minSearchOpacity}, {"duration" : toggleOpacitySpeed, "queue" : false, complete: function(){
                                    $searchField.removeClass("hover");
                                }});
                            }
                        }, 1000);
                            
                        //$("#search-suggestion").hide();//#117 added
                    });
                    
                    $formContainer.hover(function(){
                        clearTimeout(fadeTimeOut);
                        $searchForm.stop().animate({"opacity" : maxSearchOpacity}, {"duration" : toggleOpacitySpeed / 3, "queue" : false});
                        $searchField.addClass("hover");
                    }, function(){
                        clearTimeout(fadeTimeOut);
                        fadeTimeOut = setTimeout(()=>{
                            //console.debug($("#search-input").is(":focus") , $("#search-provider-selector").hasClass("opened"));
                            if(!$("#search-input").is(":focus") && !$("#search-provider-selector").hasClass("opened")){
                                $searchForm.stop().animate({"opacity" : minSearchOpacity}, {"duration" : toggleOpacitySpeed, "queue" : false, complete: function(){
                                    $searchField.removeClass("hover");
                                }});
                            }   
                        }, 1000);
                            
                        //$("#search-suggestion").show();//#117 added
                    });
                    
                    if(!$("#search-input:hover, #search-input:focus, #search-speed-container:hover, #search-speed-container:focus").length){//Firefox
                        if(!$("#search-provider-selector").hasClass("opened")){
                            $searchForm.animate({"opacity" : minSearchOpacity}, 2000, function(){
                                $searchField.removeClass("hover");
                            });  
                        }                    
                    }
                }, 3000);

                $searchForm.css({"opacity" : 0, "display" : "inline-block"}).animate({"opacity" : maxSearchOpacity}, displayPageSpeed);
                
                searchEngineSelector();
            }
        });
    }

    function searchEngineSelector(){
        if(!localStorage.getItem("search-engine-selected")){}//if        
        
        $settingsButton = $("#searchChoiseButton");
        $speechButton = $("#search-speed-container");
        //$settingsButton.css("display", "block");

        $("#search-input-box")
            .on("mouseenter", function(){
                $settingsButton.stop(true,true).fadeIn("fast");
                if(BROWSER != "firefox") $speechButton.stop(true,true).fadeIn("fast");
            })
            .on("mouseleave", function(){
                $settingsButton.stop(true,true).delay(0).fadeOut("fast");
                if(BROWSER != "firefox") $speechButton.stop(true,true).delay(0).fadeOut("fast");
            })
        ;
        
        getSearchFormProviderType(function(searchPorviderType) {
            BRW_getAcceptLanguages(function(languages){
                var hasRuLanguage = languages.indexOf("ru") != -1;
                
                var waitAuthN = 0, waitAuth = setInterval(()=>{
                    //console.debug(waitAuthN*250, typeof AUTH);
                    
                    if(typeof AUTH == "object" || ++waitAuthN > 10){
                        clearInterval(waitAuth);
                        
                        var premium = (AUTH && AUTH.isPremium());
                        
                        $wrap = $("#search-container");

                        var UI = {
                            $wrap    : $wrap.find("#search-provider-selector"),
                            $current : $wrap.find("#current-provider"),
                            $select  : $wrap.find("#provider-list"),
                        };

                        for(var key in searchProviders){
                            var $option = $("<li>")
                                .attr("value", searchProviders[key].val)
                                .append(
                                    $("<span>").addClass("searh-round")
                                        .append(
                                            $("<img>")
                                                .attr("src", "img/search/provider-" + searchProviders[key].val + ".png")
                                        )
                                )
                                .append(
                                    $("<span>").addClass("searh-name")
                                        .text(searchProviders[key].name)
                                )    
                            ;

                            if(searchProviders[key].val == searchPorviderType){
                                $option.addClass("selected");
                                
                                UI.$current.find("img")
                                    .attr("src", "img/search/provider-" + searchProviders[key].val + ".png")
                                    .attr("title", searchProviders[key].name)
                                    .addClass("shown")
                                ;
                                
                            }//if

                            if(
                                !premium && (searchProviders[key].val !== 1 ) && (searchProviders[key].val !== 2 || !hasRuLanguage)
                            ){
                                $option.addClass("disabled");
                            }

                            UI.$select.append($option);
                        }//for


                        UI.$current.on("click", ()=>{
                            if(!UI.$wrap.hasClass("opened")) UI.$wrap.addClass("opened");
                            else UI.$wrap.removeClass("opened");
                        });

                        $(document).on('click', (e)=>{
                            if(!UI.$wrap.has(e.target).length){
                                if(UI.$wrap.hasClass("opened")) UI.$wrap.removeClass("opened");
                            }
                        });

                        UI.$select.on("click", "li", function(event){
                            var val = parseInt($(event.currentTarget).attr("value"));

                            if(!val) return;

                            if(
                                (val === 1 )
                                ||
                                (val === 2 && hasRuLanguage)
                                ||
                                (AUTH && AUTH.isPremium())
                            ){
                                UI.$select.find(".selected").removeClass("selected");
                                $(event.currentTarget).addClass("selected");

                                UI.$current.find("img")
                                    .attr("src", "img/search/provider-" + val + ".png")
                                    .attr("title", $(event.currentTarget).find(".searh-name").text())
                                ;

                                BRW_TabsGetCurrentID(function(tab) {
                                    BRW_sendMessage({command: "setSearchFormProviderType", val: val, tab:tab});
                                });

                                sendToGoogleAnaliticMP(function() {
                                    gamp('send', 'event', 'search', 'change_provider', 'start_page', UI.$select.find(":selected").text());
                                });

                                mySearchProvider = val;

                                localStorage.setItem("search-engine-selected", true);

                                setTimeout(()=>{
                                    UI.$wrap.removeClass("opened").addClass("no-opened");
                                    setTimeout(()=>{
                                        UI.$wrap.removeClass("no-opened");
                                    }, 500);
                                }, 350);
                            }else{
                                if(AUTH) AUTH.isPremium("discovered");
                            }
                        });
                    }
                }, 250);
                
            });
        }, true);//getSearchFormProviderType
    }//function

    /**
     * Prepare text dial
     *
     * @param $thumb jQuery element
     * @param mv Object
     */
    function prepareTextDial($thumb, mv) { //console.info("prepareTextDial", 0, mv);
        if(typeof(mv.colorScheme) != "undefined") {
            var $textBg = $("<div></div>").addClass("mv-text-bg").attr("data-scheme", JSON.stringify(mv.colorScheme || {}));
            
            $textBg.css({"background-color" : mv.colorScheme.backgroundColor});
            $thumb.append($textBg);
            var $overlayImage = $("<img>").addClass("mv-text-bg-overlay");
            $overlayImage.attr("src", extensionGetUrl("pages/newtab/css/img/buttons/tiles/overlay.png"));
            $thumb.append($overlayImage);
            
            if(typeof mv.hostData == "object"){
                mv.hostData = Trim(String(mv.hostData.join('.').toLowerCase()).replace('wwwww.','').replace('wwww.','').replace('www.',''), '/\\').split(".");
            }
            
            if(String(mv.url).indexOf("file://") > -1){
                var fileName = String(mv.url).split("/").pop().split("\\").pop().split(".");
                
                if(fileName.length > 1){
                    var fileExt  = fileName.pop();
                    mv.hostData = [fileName.join('.'), fileExt];
                }else{
                    mv.hostData = [fileName.join('.')];
                }//else
            }//if
            
            //console.info("prepareTextDial", 1, mv.hostData);
            
            if(typeof (mv.hostData) != "undefined") {
                if(typeof (mv.hostData[0])) {
                    var dialSize = (dialSizeCache || getDialFullSize());
                    
                    //console.log(dialSize);
                    
                    mv.hostData[0] = clearUrlProtocol(mv.hostData[0]);
                    var itemHost = mv.hostData[0];
                    var $hostName = $("<div></div>").addClass("mv-host-name");
                    
                    if(true){//default
                        var containerHeight = 114;
                        var domainFontSize = 13;
                        var domainFirstFontSize = 16;
                        var hostMaxFontSize = 48;
                        var hostMinFontSize = 24;
                        var minDomainTopOffset = 0;
                        var maxDomainTopOffset = 5;
                        var itemsTopDiffOffset = 5;
                    }//if
                    
                    if(dialSize && dialSize.height && dialSize.height != 145){
                        var Height = parseInt(dialSize.height);
                        
                        var containerHeight = Height - 28;
                        
                        if(Height >= 220){
                            var domainFontSize = 18;
                            var domainFirstFontSize = 22;
                            var hostMaxFontSize = 62;
                            var hostMinFontSize = 36;
                        }else
                        if(Height >= 195){
                            var domainFontSize = 16;
                            var domainFirstFontSize = 20;
                            var hostMaxFontSize = 56;
                            var hostMinFontSize = 32;
                        }else
                        if(Height >= 170){
                            var domainFontSize = 14;
                            var domainFirstFontSize = 18;
                            var hostMaxFontSize = 52;
                            var hostMinFontSize = 28;
                        } else
                        if(Height >= 140){
                            //Default size
                        }else
                        if(Height >= 125){
                            var domainFontSize = 12;
                            var domainFirstFontSize = 14;
                            var hostMaxFontSize = 42;
                            var hostMinFontSize = 20;
                        }else
                        if(Height >= 100){
                            var domainFontSize = 10;
                            var domainFirstFontSize = 12;
                            var hostMaxFontSize = 34;
                            var hostMinFontSize = 18;
                        }                        
                    }//if
                    
                    if(!getDialsBackground()){
                         containerHeight += 28;
                        
                    }
                    
                    var hostDiffFontSize = hostMaxFontSize - hostMinFontSize;
                    var hostFontSizePercents = Math.round(itemHost.length / 4);
                    var hostFontSize = hostMaxFontSize;
                    if(hostFontSizePercents > 1) {
                        hostFontSize = hostMinFontSize + Math.round(hostDiffFontSize / hostFontSizePercents);
                        hostFontSize = hostFontSize < hostMinFontSize ? hostMinFontSize : hostFontSize;
                        hostFontSize = hostFontSize > hostMaxFontSize ? hostMaxFontSize : hostFontSize;
                    }
                    var hostNameTopOffset = containerHeight / 2 - hostFontSize / 2 - itemsTopDiffOffset;
                    if(typeof (mv.hostData[1]))
                        hostNameTopOffset = containerHeight / 2 - (hostFontSize + domainFontSize) / 2 - itemsTopDiffOffset;

                    $hostName.css({
                        "font-size" : hostFontSize + "px",
                        "top" : hostNameTopOffset + "px",
                        "text-transform" : itemHost.length < 7 ? "capitalize" : "none",
                        "color" : mv.colorScheme.color
                    });
                    var $hostNameText = $("<span></span>");
                    $hostNameText.text(itemHost);
                    $thumb.append($hostName.append($hostNameText));

                    if(typeof (mv.hostData[1])) {
                        var $hostDomain = $("<div></div>").addClass("mv-host-domain");
                        var domainPartLength = mv.hostData.length;
                        if(mv.hostData.length > 2) {
                            var $domainNameEl = $("<span></span>").addClass("mv-host-domain-first");
                            $domainNameEl.css({
                                "font-size" : domainFirstFontSize + "px"
                            });
                            $domainNameEl.append(mv.hostData[1]);
                            $hostDomain.append($domainNameEl);
                        } else
                            $hostDomain.append(mv.hostData[1]);

                        for(var t = 2; t < domainPartLength; t++)
                            $hostDomain.append("." + mv.hostData[t]);

                        var diffDomainTopOffset = maxDomainTopOffset - minDomainTopOffset;
                        var additionalDomainTopOffset = (hostMinFontSize - hostFontSize) / hostDiffFontSize * diffDomainTopOffset;
                        var domainTopOffset = containerHeight / 2 + hostFontSize / 2 + additionalDomainTopOffset - itemsTopDiffOffset;

                        $hostDomain.css({
                            "font-size" : domainFontSize + "px",
                            "top" : domainTopOffset + "px",
                            "color" : mv.colorScheme.color
                        });
                        $thumb.append($hostDomain);
                    }
                }
            }
        }
    }

    /**
     * Error load gallery thumb
     *
     * @param data Objetc
     */
    var lastGalleryThumbErrorHostName = false, lastGalleryThumbErrorTime=0;
    function errorLoadGalleryThumb(data) { 
        if(data.mv) {
            var mv = data.mv;
            if(mv.url) {
                var hostName = getUrlHost(mv.url);
                if(hostName) {
                    var time = 3000;
                    var now  = Date.now();
                    
                    if(
                        (hostName != lastGalleryThumbErrorHostName) ||
                        ((now - lastGalleryThumbErrorTime) > (time + 500))
                    ){
                        $.jGrowl(translate("page_dial_thumb_load_gallery_problem") + "<br>" + hostName, { "life" : time , position:"top-left"});
                        lastGalleryThumbErrorHostName = hostName;
                        lastGalleryThumbErrorTime = now;
                    }
                }
            }
        }
    }

    /**
     * Add tile footer shadow
     *
     * @param $tile jQuery element
     */
    function addTileFooterShadow($tile) { 
        var top = $tile.height();
        
        if(getDialsBackground()){
            if(top < 90) top -= 2;
            else if(top < 130) top -= 1;
        }else{
            if(top < 90) top -= 5;
            else if(top < 130) top -= 4;
            else top -= 2;
        }
        
        var $footer = $("<div></div>").addClass("mv-footer").css("top", top+"px");
        var $footerShadow = $("<img>").addClass("tile-footer-shadow");
        $footerShadow.attr("src", extensionGetUrl("pages/newtab/css/img/buttons/tiles/bottom_shadow.png"));
        $footer.append($footerShadow);
        $tile.append($footer);
    }

    /**
     * Delete history item handler
     *
     * @param e Event
     */
    function deleteHistoryItem(e) { 
        e.preventDefault();
        e.stopPropagation();
        deleteHistoryItemHandler($(this));
    }

    /**
     * Delete history item handler
     *
     * @param $el jQuery element
     */
    function deleteHistoryItemHandler($el) { 
        if($el) {
            var removeUrl = $el.attr('data-url');
            var dialId = $el.attr('data-dialId');
            var groupId = $el.parents(".mv-tile").attr('data-groupId');
            
            if(dialId) {
                var $link = $el.closest(".mv-tile");
                if($link) {
                    //var prepare = prepareSyncRemoveURL(removeUrl);
                    var prepare = prepareSyncRemoveURL(dialId, removeUrl, groupId);
                    
                    $link.fadeOut(350, function() {
                        BRW_sendMessage({
                            "command": "deleteDialById",
                            "dialId": dialId,
                            "collectDials": collectCurrentDirectoryDials()
                        }, function () {
                            if (lastRestoredDialTimer)
                                clearTimeout(lastRestoredDialTimer);
                            lastRestoredDialTimer = setTimeout(function () {
                                if(lastRestoredDialId)
                                    $(".mv-tile[data-dialId=" + lastRestoredDialId + "]").each(function() {
                                        $(this).remove();
                                    });
                                lastRestoredDialUrl = null;
                                lastRestoredDialId = null;
                                var $restoreContainer = $("#mv-restore-container-wrap");
                                if ($restoreContainer.is(":visible"))
                                    $restoreContainer.fadeOut(350);
                            }, 15000);
                            lastRestoredDialId = dialId;

                            var $restoreContainerWrap = $("#mv-restore-container-wrap");
                            $restoreContainerWrap.show(0);
                        });
                    });
                }
            } else if(removeUrl) {
                $el.off("click", deleteHistoryItem).on(function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
                BRW_sendMessage({"command": "addHostToBlackList", "val" : removeUrl}, function() {
                    if(lastRestoredDialTimer)
                        clearTimeout(lastRestoredDialTimer);
                    lastRestoredDialTimer = setTimeout(function() {
                        if(lastRestoredDialId)
                            $(".mv-tile[data-dialId=" + lastRestoredDialId + "]").each(function() {
                                $(this).remove();
                            });
                        lastRestoredDialUrl = null;
                        lastRestoredDialId = null;
                        var $restoreContainer = $("#mv-restore-container-wrap");
                        if($restoreContainer.is(":visible"))
                            $restoreContainer.fadeOut(350);
                    }, 15000);
                    lastRestoredDialUrl = removeUrl;
                    analyzeHistory(buildTilesList);
                });
            }
        }
    }
    
    function prepareSyncRemoveURL(dialId, url, groupId){
        if(localStorage.getItem("sync-account")){
            setTimeout(function(){
                var list = JSON.parse(localStorage.getItem('sync-dials-changed') || "{}");

                var group = ["default", groupId];
                for(var k in group){
                    var hash = createDialId(url, group[k]);
                    if(!list[hash]) list[hash] = {};
                    list[hash]["delete"] = 1; 
                    list[hash][ "time" ] = Date.now();
                }//for

                if(!list[dialId]) list[dialId] = {};
                list[dialId]["delete"] = 1; 
                list[dialId][ "time" ] = Date.now();
                
                //console.log(list);

                localStorage.setItem('sync-dials-changed', JSON.stringify(list));

                return true;
            }, 350);
        }//if
        
        return false;
    }

    /**
     * Display async loaded tile thumb image
     *
     * @param message Object
     */
    function displayLoadedTileThumbImage(message) { 
        var mv = message.mv;
        if(typeof (mv) != "undefined" && mv && mv.url) {
            $("#mv-tiles").find(".mv-tile").each(function() {
                var $el = $(this);
                
                if(mv.dialId) {
                    if($el.attr('data-dialId') == mv.dialId){
                        endDisplayLoadedTileThumbImage($el, mv);
                    }
                } else {
                    if ($el.attr('href') == mv.url || $el.attr('fullHref') == mv.url) {
                        getActiveGroup(function (val) {
                            if (val == GROUP_POPULAR_ID) {
                                endDisplayLoadedTileThumbImage($el, mv);
                            }
                        });
                    }
                }
            });
        }
    }

    /**
     * End display loaded tile thumb image
     *
     * @param $el jQuery element
     * @param mv Object
     */

    var tileThumbImageCache = {};
    function endDisplayLoadedTileThumbImage($el, mv) { 
        if(mv.id){
            var UPD = crc32(JSON.stringify(mv));
            if(tileThumbImageCache[mv.id] && tileThumbImageCache[mv.id] == UPD) return;
            else tileThumbImageCache[mv.id] = UPD;
        }//if
        
        var $mvThumb = $el.find(".mv-thumb");
        var $thumbnail = $el.find(".thumbnail");
        $mvThumb.fadeOut(350, function () {
            $mvThumb.removeClass("mv-thumb-loading").removeClass("mv-thumb-image").removeClass("mv-thumb-live");
            $thumbnail.removeClass("thumbnail-loading");

            var $dotBg = $("<div></div>");
            var $dotImage = $("<div></div>");

            if(!mv.thumbType)
                mv.thumbType = null;
            
            if ((mv.image && mv.image == getNoTileImageFileName()) || mv.thumbType == showDialTextThumb) { // display no tile image
                $mvThumb.html('');
                if (typeof (mv.colorScheme) == "undefined")
                    $mvThumb.append($dotBg.addClass("mv-dot-bg").append($dotImage.addClass("mv-dot")));
                else
                    prepareTextDial($mvThumb, mv);
            } else if(mv.image) { // display tile image
                if (checkUrlHasGoogleHost(mv.url) && (!mv.thumbType || mv.thumbType == showDialGalleryThumb) && mv.image.indexOf("data:image") == -1 && mv.image.indexOf("filesystem") == -1 && mv.image.indexOf("resource") == -1) {
                    $mvThumb.html('');
                    if (typeof (mv.colorScheme) == "undefined")
                        $mvThumb.append($dotBg.addClass("mv-dot-bg").append($dotImage.addClass("mv-dot")));
                    else
                        prepareTextDial($mvThumb, mv);
                } else {
                    if(mv.image.indexOf("data:image") < 0) {
                        $mvThumb.addClass("mv-thumb-image");
                        
                        $thumbnail.css({"background": "url('" + noCacheImage(mv.image) + "') 50% 50% / contain no-repeat"});
                        $thumbnail.attr("image", mv.image);
                    } else {
                        if (mv.thumbType == showDialGalleryThumb) {
                            $mvThumb.html('');
                            if (typeof (mv.colorScheme) == "undefined")
                                $mvThumb.append($dotBg.addClass("mv-dot-bg").append($dotImage.addClass("mv-dot")));
                            else
                                prepareTextDial($mvThumb, mv);
                        } else {
                            
                            $thumbnail.css({"background": "url('" + noCacheImage( mv.image )  + "') 50% 50% / contain no-repeat"});
                            $thumbnail.attr("image", mv.image);
                            $mvThumb.addClass("mv-thumb-live");
                        }
                    }
                }
            } else {
                $mvThumb.html('');
                if (typeof (mv.colorScheme) == "undefined")
                    $mvThumb.append($dotBg.addClass("mv-dot-bg").append($dotImage.addClass("mv-dot")));
                else
                    prepareTextDial($mvThumb, mv);
            }
            $mvThumb.fadeIn(500);
        });
    }

    /**
     * Display async not loaded tiles thumb images
     */
    function displayNotLoadedTilesThumbImages() { 
        $(".mv-thumb-loading").each(function() {
            var $mvThumb = $(this);
            var $thumbnail = $mvThumb.find(".thumbnail-loading");
            setTimeout(function() {
            if($mvThumb.hasClass("mv-thumb-loading") && $thumbnail.hasClass("thumbnail-loading") /*&& !$mvThumb.hasClass("manual-preview")*/) {
                    $mvThumb.fadeOut(350, function() {
                        $mvThumb.removeClass("mv-thumb-loading");
                        $thumbnail.removeClass("thumbnail-loading");
                        $thumbnail.hide();

                        var $dotBg = $("<div></div>");
                        $dotBg.addClass("mv-dot-bg");
                        var $dotImage = $("<div></div>");
                        $dotImage.addClass("mv-dot");
                        $dotBg.append($dotImage);
                        $mvThumb.append($dotBg);
                        $mvThumb.fadeIn(500);
                    });
                }
            }, 1500);
        });
    }

    /**
     * Add dials panel visible dbl click handler
     */
    function addDialsPanelVisibleDblClickHandler() { 
        //if(getDisplaySpeedDialPanel()) {
            setTimeout(function() {
                $(document).on("dblclick", (e)=>{
                    dialsPanelVisibleChange(e, "sidebar-sense");
                });
            }, 1600);
        //}
    }

    /**
     * Dials panel visible change
     *
     * @param e Event
     */
    function dialsPanelVisibleChange(e, mode) {
        e.preventDefault();
        var mode = mode || false;
        
        var $targetEl = $(e.target);
        
        var relaxIsVisible = $("#relax-start-btn").is(":visible");
        //console.log($targetEl.attr("id"), $targetEl.attr("class"));
        var needReturn = false;
        if( $targetEl.context.nodeName.toLowerCase() != "html" &&
            $targetEl.attr("id") != "search-container" &&
            $targetEl.attr("id") != "footer-visible-dials" &&
            $targetEl.attr("id") != "dials-notification" &&
            $targetEl.attr("id") != "dials-notification-message" &&
            $targetEl.attr("id") != "mv-container" && 
            $targetEl.attr("id") != "mv-clock-wrap" && 
            $targetEl.attr("id") != "mCSB_3_container" &&
            $targetEl.attr("id") != "mv-tiles-wrap-wide" &&
            $targetEl.attr("id") != "mv-tiles-wrap" &&
            $targetEl.attr("id") != "mv-tiles" && //firefox
            $targetEl.attr("id") != "mCSB_3" && //firefox
            $targetEl.attr("id") != "relax"
          )
            needReturn = true;
        else if($targetEl.hasClass("search-input") ||
                $targetEl.hasClass("search-placeholder") ||
                $targetEl.hasClass("search-suggestion-img") ||
                $targetEl.hasClass("search-suggestion-text") ||
                $targetEl.hasClass("search-suggestion-item"))
            needReturn = true;
        else if($targetEl.hasClass("relax-start-btn") ||
                $targetEl.hasClass("relax-done-btn") ||
                $targetEl.hasClass("relax-done-btn-audio")
               )
        {
            needReturn = true;
        }
        
        if(
            $targetEl.length && 
            (
                ($targetEl.hasClass("dials-switch")) ||
                ($targetEl.attr && (
                    $targetEl.attr("action") == "change") ||
                    $targetEl.hasClass("wide-bg")
                )
            
            )
        ){
            needReturn = false;
        }//if
        
        if(!needReturn) {
            var $tilesContainer = $(".mv-tiles");
            var $tilesWrap = $("#mv-tiles-wrap");
            var $popup = $("#dials-notifications");
            var $clock = $("#clock-container");
            var onlyClock = !getDisplaySpeedDialPanel();
            
            if(onlyClock){
                var $clockWrap = $("#mv-clock-wrap");

                if($clock.is(":visible")) {
                    $clock.fadeOut(150, function() {});

                    if(typeof FocusLikeClock == "function") FocusLikeClock("hide");

                    $clockWrap.fadeOut(150);
                } else {
                    showClock(250);
                }
            }
            else
            if($tilesContainer.is(":visible")) {
                if(!$popup.is(":visible")) {
                    BRW_sendMessage({"command": "setVisibleSpeedDialPanel", "val" : false});
                    
                    //$("#footer-visible-dials").text(translate("page_footer_visible_dials_link_on"));
                    $("#footer-visible-dials").attr("title", translate("page_footer_visible_dials_link_on"));
                    
                    if(!getDialsNoticeHideState()) {
                        if(displayPopupTimeOut) clearTimeout(displayPopupTimeOut);
                        displayPopupTimeOut = setTimeout(function(){
                            var $popup = $("#dials-notifications");
                            if($popup.is(":visible"))
                                $popup.fadeOut(250);
                            clearTimeout(displayPopupTimeOut);
                        }, 3000);
                    }
                    $tilesWrap.fadeOut(250);
                    $tilesContainer.fadeOut(250, function() {
                        if(!getDialsNoticeHideState())
                            $popup.fadeIn(250);
                        showClock(250);
                    });
                }
                
                sidebarToggleHandler('close');
            } else {
                BRW_sendMessage({"command": "setVisibleSpeedDialPanel", "val" : true});
                
                
                //$("#footer-visible-dials").text(translate("page_footer_visible_dials_link_off"));
                $("#footer-visible-dials").attr("title", translate("page_footer_visible_dials_link_off"));
                
                if(displayPopupTimeOut) clearTimeout(displayPopupTimeOut);
                
                if($popup.is(":visible")) {
                    hideClock(150);
                    $popup.fadeOut(250, function() {
                        $tilesWrap.fadeIn(250);
                        $tilesContainer.fadeIn(250);
                    });
                } else {
                    var $clockWrap = $("#mv-clock-wrap");
                    
                    if($clock.is(":visible")) {
                        $clock.fadeOut(150, function() {
                            $tilesWrap.fadeIn(250);
                            $tilesContainer.fadeIn(250);
                        });
                        
                        if(typeof FocusLikeClock == "function") FocusLikeClock("hide");
                        
                        $clockWrap.fadeOut(150);
                    } else {
                        $tilesWrap.fadeIn(250);
                        $tilesContainer.fadeIn(250);
                    }
                }
                
                if(mode == "sidebar-sense"){
                    if(getSideBarAutoOpenState()){
                        mode = false;   
                    }
                }
                
                if(mode != "sidebar-sense"){
                    sidebarToggleHandler('open');
                }
                
                if(
                    (
                        typeof currentActiveGroup != "undefined" &&
                        currentActiveGroup != $(".sidebar-group-item.selected").attr("data-group")
                    )
                    ||
                    (needRedrawAfterSync)
                ){
                    $(".sidebar-group-item.selected").removeClass("selected").trigger("click");
                    needRedrawAfterSync = false;
                }//if
            }
        }
        e.stopPropagation();
    }

    $(function() {
        addDialsPanelVisibleDblClickHandler();
        
        $('#tileSearchModal').modal('hide');
        
        setTimeout(function(){
            tilesContainerHeight(true);
            
            var calcPlanned = false;

            $(window).resize(function() {
                if(!calcPlanned){
                    calcPlanned = true;
                    setTimeout(function(){
                        tilesContainerHeight();
                        calcPlanned = false;
                    }, 50);
                }//if
            });
            
        }, 450);
        
        addTilesSizeLiveHandler();
        addOnResizeColumnsCounter();
        /*
        $(document).on("mousedown", ".mv-tile", (e)=>{
            console.debug("MDW", e);
        });
        */
    });

    var rowHeight = 0;
    function tilesContainerHeight(addScroll, correct){
        var dialSize = (dialSizeCache || getDialFullSize());
        
        $row = 171;
        
        if(dialSize && dialSize.height) $row = dialSize.height + 25;
        
        $container = $("#mv-tiles-wrap-wide");
        //$container = $("#mv-tiles-wrap");
        $maxheight = parseInt($(window).height())-4;
        //$maxheight = parseInt($(window).height())-190;
        //$maxheight = $row * Math.floor($maxheight / $row);
        
        $maxheight = Math.max($maxheight, $row) - 15;
        
        if(correct) $maxheight += correct;
        
        $container.css({
            "max-height"    : $maxheight+"px",
            "overflow"  : "hidden"
        });
        
        rowHeight = $row;
        
        //$("#mv-tiles-wrap-wide").mCustomScrollbar({mouseWheel:{scrollAmount:100}})
        
        if(addScroll){
            addScrollDials();
        }//if
        
        /*
        var $inner = $("#mv-tiles"); var ScrollWait = false;;
        $(document).on("mousewheel", function (e) {
            if(ScrollWait) return;
            else{
                ScrollWait = true;
                
                setTimeout(function(){
                    ScrollWait = false;
                }, 100);
            }//else
            
            if(e.deltaY > 0) var direction = "up";
            else var direction = "down";
            
            tilesScroll($container, $inner, direction, $row, $row/2);
        });
        
        $(document).on("keydown", function (e) {
            if(['input','textarea'].indexOf(String(e.target.tagName.toLowerCase())) != -1) return;
            
            var direction = false, delta=$row;
            
            if(e.keyCode == 32){
                if(e.shiftKey) direction = "up";
                else direction = "down";
            }else            
            if(e.keyCode == 38 || e.keyCode == 36 || e.keyCode == 33){
                direction = "up";
            }else            
            if(e.keyCode == 40 || e.keyCode == 35 || e.keyCode == 34){
                direction = "down";
            }//if
            //console.log(e.keyCode);
            
            if(e.keyCode == 38 || e.keyCode == 40) delta=$row/2;
            if(e.keyCode == 36 || e.keyCode == 35) delta=99999;
            
            if(direction){
                tilesScroll($container, $inner, direction, $row, delta);
            }//if
        });
        */
    }

    function addScrollDials(){
        rowHeight = rowHeight || 171;
        
        $container = $("#mv-tiles-wrap-wide");
        
        getDialsColumnsCount((count)=>{
            var module = 1.5;

            if(parseInt(count) == 1) module = 2.5;
            else
            if(parseInt(count) == 2) module = 2.1;

            if(parseInt(initTilesCount) > 30) module *= 2.5;
            
            //console.debug("addScrollDials", module);
            
            if($container.hasClass("mCustomScrollbar")){
                $container.mCustomScrollbar("destroy");
            }
            
            $container.mCustomScrollbar({
                theme:"3d-thick",
                axis: "y",
                autoHideScrollbar: false,
                scrollEasing: "linear",
                documentTouchScroll: true,

                scrollInertia: 70,
                scrollEasing: "easeInOut",
                //scrollEasing: "easeOut",
                //scrollbarPosition: "outside",
                //scrollButtons:{ enable: true },

                mouseWheel:{
                    enable: true,
                    axis: "y",
                    normalizeDelta: true,
                    scrollAmount: module * rowHeight / 4,
                    deltaFactor: 20
                },

                keyboard:{ 
                    scrollAmount: rowHeight / 15 
                },

                advanced:{
                    updateOnContentResize: true,
                    releaseDraggableSelectors: "body"
                },

                callbacks: {
                    onOverflowY: function(){
                        sidebarWithScrollTrigger("with-scroll");
                        $("#mv-tiles-wrap").addClass("mv-tiles-with-scroll");
                    },
                    onOverflowYNone: function(){
                        sidebarWithScrollTrigger("not-scroll");
                        $("#mv-tiles-wrap").removeClass("mv-tiles-with-scroll");
                    }
                }
            });
        });
    }
    
    var needTop = 0;
    function tilesScroll($container, $inner, direction, row, delta){
        //console.log(direction);
        
        if(!$inner) $inner = $("#mv-tiles");
        if(!$container) $container = $("#mv-tiles-wrap");
                
        var inner = $inner.height();
        var wrap  = $container.height();
        
        if(inner <= wrap) return;
        
        $container.stop(true, true);
        
        var top = $container.scrollTop();
        
        //console.log($container.height(), $container.scrollTop(), $inner.height());
        
        
        var approx = delta * 0.5;
        
        if(direction == "up"){
            var setTop = top - delta;
            
            if(setTop <= approx) setTop = 0;
            else if(setTop%row <= approx){
                setTop = Math.floor(setTop/row)*row;
            }//else
            
            
        }else{//down
            var setTop = top + delta;
            var scrollLim = inner-wrap;
            
            if(setTop >= (scrollLim - approx)) setTop = scrollLim;
            else if(setTop%row <= approx){
                setTop = Math.floor(setTop/row)*row;
            }//else
            
            
        }//else
        
        if(setTop != top) $container/*.stop(true, false)*/.animate({scrollTop:setTop}, 100);
        
    }//function

    /**
     * Dials search 
     */



function DialsSearch(data){
    var myself = this;
    myself.searchModal = $('#tileSearchModal');
    myself.form =  myself.searchModal.find('#tile-search-form');
    myself.input = myself.searchModal.find('#tileSearchText');
    myself.button= myself.searchModal.find('#buttonSubmit');
    myself.list  = myself.searchModal.find('#tileSearchList');
    myself.img   = myself.searchModal.find('#tileSearchImg');
    myself.top   = myself.searchModal.find('.tileSearchTop');
    myself.title = myself.searchModal.find('.tileSearchTitle');
    
    myself.last  = '';
    myself.xhr   = null;
    
    myself.actions = {
        "booking": {
            search : "http://fvdmedia.com/addon_search/booking.php?q={query}",
            hintUrl: "http://www.booking.com/autocomplete_2?lang={lang}&aid=0&term={query}",
            image  : "./css/img/search/booking.png",
            parser : function (r) {
                return JSON.parse(r);
            },
            getArray: function (obj) {
                var arr = [];
                if (obj && obj.city/* && obj.city.lenght*/) {
                        //console.log(obj.city);

                    for (var k in obj.city){
                        //console.log(obj.city[k].label);
                        arr.push(obj.city[k].label);
                    }
                } //if
                return arr;
            }
        },
        "amazon": {
            search : "http://fvdmedia.com/addon_search/amazon.php?q={query}",
            hintUrl: "http://completion.amazon.com/search/complete?method=completion&mkt=1&client=amazon-search-ui&x=String&search-alias=aps&q={query}&qs=&cf=1&fb=1&sc=1",
            image  : "./css/img/search/amazon.png",
            parser : function (r) {
                var m = r.match(/^completion\s*=\s*(.+)/i);
                var text = m[1];
                text = text.replace(/String\(\);$/, "");
                text = text.replace(/;+$/, "");
                return JSON.parse(text);
            },
            getArray: function (obj) {
                var arr = [];
                if (obj && obj[1]) arr = obj[1];
                return arr;
            }
        },
        "ebay": {
            search : "http://fvdmedia.com/addon_search/ebay_new.php?q={query}",
            hintUrl: "http://autosug.ebay.com/autosug?kwd={query}&version=1279292363&_jgr=1&sId=0&_ch=0&callback=GH_ac_callback",
            image  : "./css/img/search/ebay.png",
            parser: function (r) {
                var m = r.match(/AutoFill\._do\((.+?)\)$/i);
                return JSON.parse(m[1]);
            },
            getArray: function (obj) {
                var arr = [];
                if (obj && obj.res && obj.res.sug) arr = obj.res.sug;
                return arr;
            }
        }
    }
    
    // Init actions
    this.init = function(obj, system, id, service, image){
        myself.id  = id;  // unique searcher ID
        myself.obj = obj; // dial object
        myself.system = String(system); //search system
        
        myself.form.on("submit", function(e){
            e.preventDefault();
            //myself.handleSubmit();
        });
        
        myself.button.on("click", function(e){
            myself.handleSubmit();
        });
        
        for(let key in myself.actions){
            if(myself.system.indexOf(key) > -1){
                myself.current = myself.actions[key]; //current search system actions
                break;
            }//if
        }//for
        
        if(service && service.site){
            OnDialSearch.getSearchURL(service.site, function(err, url) {
                if(!myself.current) myself.current={};
                
                myself.current.search = url;
                myself.current.site = service.site;
                
                if(!myself.current.image && image) myself.current.image = image;
                
                if(!myself.current.hintUrl){
                    if(typeof OnDialSearch.Autocomplete.sites[service.site] != "undefined"){
                        myself.current.hintAPI = true;
                    }//if
                }//if
            });
        }//if
        
        
        myself.obj.on("click", function(e){
            e.preventDefault(); e.stopPropagation();
            myself.modalShow();
        });
        
        myself.input.on("keyup", function(e){
            e.preventDefault(); e.stopPropagation();
            //console.log(e.keyCode);
            
            switch(e.keyCode){
                case 13://enter
                    myself.handleSubmit(true, myself.input.val());
                break;
                case 37: case 38://up
                    myself.dropDownNav('up')
                break;
                case 39: case 40://down
                    myself.dropDownNav('down');
                break;
                default: 
                    myself.modalHint();
            }//switch
        });
    }//init
    
    this.modalShow = function(){
        if(myself.current.image && myself.current.image != "no-image.png"){
            myself.img.attr("src", myself.current.image);
            myself.top.removeClass("noLogo");
        }else{
            myself.img.attr("src", "./css/img/search/default.png");
            myself.top.addClass("noLogo");
        }
        
        myself.title.text(myself.system);
        
        myself.input.attr({
            "search-id"  : myself.id,
            "placeholder": translate("page_speed_dials_search_title")+" "+myself.system
        }).val('').focus();
        myself.list.css("display","none").find("li").remove();
        myself.form.attr("action", myself.current.search);
        
        setTimeout(function(){
            myself.input.focus();
        }, 700);
        
        myself.searchModal.modal('show');
    }
    
    this.handleSubmit = function(dropdown, text){
        if(myself.id != myself.input.attr("search-id")) return false;
        
        var drop  =  myself.list.find("li.active");
        if(drop && drop.text()) myself.input.val(drop.text());
        
        var query = myself.input.val() || text;
        
        if(query.length){
            window.location = String(myself.current.search).replace('{query}', encodeURIComponent(String(query).trim()));
        }//if
    },
    
    this.dropDownNav = function(dir){
        if(myself.id != myself.input.attr("search-id")) return false;
        
        var list  =  myself.list.find("li");
        var count =  list.length;
        
        if(count){
            var n=0, cur = -1;
            
            list.each(function(){
                if($(this).hasClass('active')) cur = n;
                n++;
            });
            
            if(dir == 'down'){
                if(cur < count-1){
                    list.removeClass('active');
                    $(list[++cur]).addClass('active');
                }
            }else if(dir == 'up'){
                list.removeClass('active');
                
                if(cur > 0){
                    $(list[--cur]).addClass('active');
                }
            }//else if
            
            
        }//if
    },
    
    this.modalHint = function(){
        if(myself.id != myself.input.attr("search-id")) return false;
        
        var query = myself.input.val().trim();
        
        if(!query.length){//reset datalist
            myself.list.css("display","none").find("li").remove();
        }else if(query != myself.last){
            myself.last = query;
            
            if(myself.current.hintUrl){
                if(myself.xhr) 
                    myself.xhr.abort();

                var url = myself.current.hintUrl
                            .replace('{query}', encodeURIComponent(query))
                            .replace('{lang}' , encodeURIComponent(navigator.language))
                          ;
                //console.log(url);

                myself.xhr = BRW_ajax(
                    url,
                    function(response){//successFunction
                        //if(myself.xhr){
                            var searchResponse = myself.xhr.responseText;

                            searchResponse = myself.current.parser(searchResponse);
                            response = myself.current.getArray(searchResponse);

                            //console.log(searchResponse); console.log(response);
                            //var response = ['Paris','Prague','Portugal'];

                            myself.modalHintDraw(response);

                            //myself.xhr = null;
                        //}//if
                    },//successFunction
                    false, {'text':true}
                );
            }else if(myself.current.hintAPI){
                OnDialSearch.getSearchSuggestions(myself.current.site, query, function(err, result) {
                    
                    myself.modalHintDraw(result);
                    
                });
            }//else
            
            
        }//if
    },
    
    this.modalHintDraw = function(response){
        var elements = [];
        for(let key in response){
            elements.push(
                $("<li>").text(response[key])
                //$("<option>").attr("value", response[key])
            );

            if(key == 5) break; //dropdown limit
        }//for

        if(elements.length){
            myself.list.css("display","block").html(elements);

            myself.list.find('li').on('click', function(){
                myself.list.find('.active').removeClass('active');
                $(this).addClass('active');
                myself.handleSubmit(true);
            });
        }
        else myself.list.css("display","none").find("li").remove();
        
        return true;
    }
    
    return this;
}//function setDials()

var amazonPathRegExps = [
/^\/[^\/]+?\/[a-z]{2}\/(B[a-z0-9]{9})(?:\/|\?|$)/i,
/^\/[a-z]{2}\/(B[a-z0-9]{9})(?:\/|\?|$)/i,
/^\/[a-z]{2}\/product\/(B[a-z0-9]{9})(?:\/|\?|$)/i
];

function isAmazonProductPath(path) {
      for (var i = 0; i != amazonPathRegExps.length; i++) {
          var regExp = amazonPathRegExps[i];
          if (regExp.test(path)) {
              return true;
          }
      }
      return false;
  }

  function addTagToUrl(url, tag) {
      if (url.indexOf("?") !== -1) {
          url += "&tag=" + encodeURIComponent(tag);
      } else {
          url += "?tag=" + encodeURIComponent(tag);
      }
      return url;
  }


  function addOnResizeColumnsCounter() {
      var calculateWaiting = false;

      onWindowResizeFunctions["columns"] = function (event) {
          if (calculateWaiting) return;
          else{
              calculateWaiting = true;

              setTimeout(function () {
                  calculateWaiting = false;
                  recalculateDialsSize();
              }, 190);
          }
      }
  }




