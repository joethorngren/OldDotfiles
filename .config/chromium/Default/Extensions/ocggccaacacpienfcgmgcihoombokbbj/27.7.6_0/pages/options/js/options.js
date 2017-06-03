var naviRenderID = false;
/**
 * Application options page
 */
localStorage.setItem("flixel-themes-current-page", 0);

var optionsTabId;
var autoLoadMoreCounter = 0;
if (typeof NAVI != "undefined" && typeof onLoadNavi == "object") {
    onLoadNavi.push(onPageLoadOptions);
}
else {
    $(function () {
        onPageLoadOptions();
    });
}

function onPageLoadOptions() {
    toggleH264VisibleBlocks();
    BRW_langLoaded(function () {
        displayActiveOptionsTab(0);
        BRW_options_page_prepare();
        getOptionsCurentTab(function () {
            displayTabContentLoader();
            updateAvailableThemesListOnPageLoad();
            addThemesSortButtonHandler();
            addLiveThemesSortButtonHandler();
            addImagesSortButtonHandler();
            addImagesUploadButtonHandler();
            addDisableImageButtonHandler();
            addDisableVideoButtonHandler();
            addUpdateAvailableThemesHandler();
            addInstallContentButtonHandler();
            addSettingsContentButtonHandler();
            addInstallResolutionLiveBackgroundHandler();
            addRestoreDefaultThemeHandler();
            addSettingsBackgroundTabsButtonHandler();
            addSettingsBackgroundViewButtonHandler();
            addLoadMoreFlixelContentButtonHandler();
            addToggleFavoriteStateButtonHandler();
            addToggleShowThemesRandomStateButtonHandler();
            addRemoveInstalledTheme();
            addShareModalHandler();
            displaySettingsBackgroundTabs();
            displaySettingsWelcomePage();
            displayWelcomeSettingsPageAlwaysHideStatus();
            displaySettingsFlixelVideoBtn();
            displayLiveThemesTab();
            addTooltipsHideFix();
            setVisibleElementsBySortType();
            randomizeButtonHandler();
            trimGalleryListener();
            //getInterestingTheme();
            sendToGoogleAnaliticMP(function () {
                var label = "section"
                    , value = false;
                switch (parseInt(localStorage.getItem('settings-background-current-tab')) || 0) {
                case 1:
                    value = "live backgrounds";
                    break;
                case 2:
                    value = "static backgrounds";
                    break;
                case 3:
                    value = "live themes";
                    break;
                case 0:
                default:
                    value = "live motion photos";
                    switch (parseInt(localStorage.getItem('themes-sort-type')) || 2) {
                    case 1:
                        value += " | popular";
                        break;
                    case 2:
                        value += " | featured";
                        break;
                    case 3:
                        value += " | downloaded";
                        break;
                    case 3:
                        value += " | search";
                        break;
                    case 0:
                        value += " | newest";
                        break;
                    }
                    break;
                }
                //console.info(value, localStorage.getItem('themes-sort-type'));
                //gamp('send', 'event', 'visit', 'gallery', label, value);
                gamp('send', 'event', 'visit', 'gallery', value, 0);
            });
        });
    });
};

function displayLiveThemesTab() {
    /* Depricated for new settings
    if (browserName() == "chrome") {
        var $liveThemesTab = $("#available-live-themes-button");
        $liveThemesTab.parent().removeClass("hide");
    }
    */
}

function randomizeButtonHandler() {
    $(".randomize-backgrounds-button").on("click", function () {
        $(".randomize-backgrounds-button").fadeOut("normal", function () {
            $(".randomize-backgrounds-body").fadeIn();
        });
    });
}
/**
 * Toggle visible block depend H.264
 */
function toggleH264VisibleBlocks() {
    var switcher = checkH264();
    if (switcher) {
        $("#video-themes-coming-soon-note").css('display', 'none');
        $("#video-themes-coming-soon-block").css('display', 'block');
    }
    else {
        $("#video-themes-coming-soon-note").css('display', 'block');
        $("#video-themes-coming-soon-block").css('display', 'none');
        $(".hideForWebm").css("display", "none");
    }
} //function
/**
 * Get options current tab
 */
function getOptionsCurentTab(callback) {
    BRW_TabsGetCurrentID(function (tabID) {
        optionsTabId = tabID;
        callback();
    });
}
/**
 * Get available themes
 *
 * @param response Object
 * @param callback Function
 */
function getAvailableThemes(response, callback, interest) {
    //console.debug("getAvailableThemes", response);
    /*
    getAvailableThemesFavorites(response, callback);
    return;
    */
    var themesList = {};
    var installedTheme = null;
    var installedThemes = response.installedThemes
        , i, j;
    var currentContent = {
        "currentImage": response.currentImage
        , "currentImageResolution": response.currentImageResolution
        , "currentVideo": response.currentVideo
        , "currentVideoResolution": response.currentVideoResolution
        , "currentTheme": response.currentThemeId
        , "videoContentAvailableResolutions": response.videoContentAvailableResolutions
        , "flixelContentAvailableResolutions": response.flixelContentAvailableResolutions
    };
    var availableThemesData = localStorage.getItem("available-themes-data");
    var favoriteThemes = getFavoriteThemesObject();
    
    var naviTabs = NAVI.state.page.tab || [];
    var isLiveTheme = (naviTabs.indexOf("downloaded-live-themes") !== -1) || (NAVI.state.page.sub === "navi-bg-live-themes");
    
    if (availableThemesData) {
        themesList["live_backgrounds"] = [];
        themesList["static_backgrounds"] = [];
        themesList["static_backgrounds_user"] = [];
        themesList["live_themes"] = [];
        
        var availableThemes = JSON.parse(availableThemesData);
        var uploadedThemesData = getUploadedThemes();
        for (var nn in uploadedThemesData) availableThemes[availableThemes.length] = uploadedThemesData[nn];
                
        for (i in availableThemes) {
            var availableTheme = availableThemes[i];
            availableTheme['installed'] = false;
            availableTheme['hasDownloadedImage'] = false;
            availableTheme['hasDownloadedVideo'] = false;
            
            for (j in installedThemes) {
                installedTheme = installedThemes[j];
                if (availableTheme['id'] == installedTheme['id']) {
                    availableTheme['installed'] = true;
                    availableTheme['hasDownloadedImage'] = (installedTheme.bgFilePath && getArrayLength(installedTheme.bgFilePath)) ? true : false;
                    availableTheme['hasDownloadedVideo'] = (installedTheme.bgVideoPath && getArrayLength(installedTheme.bgVideoPath)) ? true : false;
                    break;
                }
            }
            
            availableTheme['favorite'] = checkThemeIsFavorite(availableTheme, favoriteThemes);
            
            if (
                typeof (availableTheme['bgVideoPath']) != "undefined"
                && 
                (
                    availableTheme['contentType'] == liveThemesType 
                    || 
                    availableTheme['chromeThemeUrl']
                )
            ) {
                themesList["live_themes"].push(availableTheme);
            }
            
            //console.debug(typeof (availableTheme['bgVideoPath']) != "undefined", availableTheme['contentType'] == liveThemesType , availableTheme['chromeThemeUrl']);
                                    
            if ((availableTheme['contentType'] == liveBackgroundType || availableTheme['contentType'] == liveThemesType) && typeof (availableTheme['bgVideoPath']) != "undefined"){
                themesList["live_backgrounds"].push(availableTheme);
            } 
            
            if ((availableTheme['contentType'] == staticBackgroundType || availableTheme['contentType'] == liveThemesType) && typeof (availableTheme['bgFilePath']) != "undefined") {
                if (!availableTheme['downloadedByUser']) themesList["static_backgrounds"].push(availableTheme);
                else themesList["static_backgrounds_user"].push(availableTheme);
            }
        }
        
        //console.debug(themesList);
        
        var $liveThemes = $("#available-live-themes").html('').attr("data-container-content-type", liveThemesType);
        var $liveBackgrounds = $("#available-video-themes").html('').attr("data-container-content-type", liveBackgroundType);
        var $staticBackgrounds = $("#available-image-themes") /*.html('')*/ .attr("data-container-content-type", staticBackgroundType);
        
        addDefaultThemeToList($liveThemes);
        themesList["live_themes"] = sortByActiveContent(themesList["live_themes"], liveThemesType, currentContent);
        setTimeout(() => {
            for (i in themesList["live_themes"]) {
                addAvailableContentToList($liveThemes, themesList["live_themes"][i], liveThemesType, currentContent);
            }
        }, 1);
        
        var imagesActiveTab = getImagesSortType();
        if (imagesActiveTab != 2) {
            $staticBackgrounds.html('');
            addClearContentItemToList($staticBackgrounds, staticBackgroundType);
        }
        themesList["static_backgrounds"] = sortByActiveContent(themesList["static_backgrounds"], staticBackgroundType, currentContent);
        if (imagesActiveTab == 0) { //gallery
            for (i in themesList["static_backgrounds"]) addAvailableContentToList($staticBackgrounds, themesList["static_backgrounds"][i], staticBackgroundType, currentContent);
        }
        if (imagesActiveTab == 1 || typeof NAVI == "object" && NAVI.state.page.sub == "navi-bg-downloaded") { //by user
            for (i in themesList["static_backgrounds_user"]) addAvailableContentToList($staticBackgrounds, themesList["static_backgrounds_user"][i], staticBackgroundType, currentContent);
        }
        if (imagesActiveTab == 2) { //photohosting
            //available-image-themes
        }
    }
    
    var flixelThemesData = localStorage.getItem("flixel-themes-display-data");
    if (flixelThemesData) {
        var $liveThemes = $("#available-live-themes");//.html('').attr("data-container-content-type", liveThemesType); // FIX
        themesList["flixel_backgrounds"] = [];
        var flixelThemes = JSON.parse(flixelThemesData);
        flixelThemes = flixelThemes.results;
        for (i in flixelThemes) {
            var flixelTheme = flixelThemes[i];
            flixelTheme['installed'] = false;
            flixelTheme['hasDownloadedImage'] = false;
            flixelTheme['hasDownloadedVideo'] = false;
            flixelTheme['handmade'] = flixelTheme.handmade ? true : false;
            for (j in installedThemes) {
                installedTheme = installedThemes[j];
                if (flixelTheme['id'] == installedTheme['id']) {
                    flixelTheme['installed'] = true;
                    flixelTheme['hasDownloadedVideo'] = (installedTheme.bgVideoPath && getArrayLength(installedTheme.bgVideoPath)) ? true : false;
                    break;
                }
            }
            flixelTheme['favorite'] = checkThemeIsFavorite(flixelTheme, favoriteThemes);
            if (flixelTheme['contentType'] == flixelBackgroundType && typeof (flixelTheme['bgVideoPath']) != "undefined") {
                themesList["flixel_backgrounds"].push(flixelTheme);
            }
        }
        var $flixelBackgrounds = $("#available-flixel-backgrounds").html('').attr("data-container-content-type", flixelBackgroundType);
        $(".load-more-content-container").removeClass("hide");
        addClearContentItemToList($flixelBackgrounds, flixelBackgroundType);
        themesList["flixel_backgrounds"] = sortByActiveContent(themesList["flixel_backgrounds"], flixelBackgroundType, currentContent);
        var themeTabId = getSettingsBackgroundTabId();
        var displayCounter = 0
            , allCounter = themesList["flixel_backgrounds"].length;
        
        for (i in themesList["flixel_backgrounds"]) {
            addAvailableContentToList($flixelBackgrounds, themesList["flixel_backgrounds"][i], flixelBackgroundType, currentContent);
            if (!themesList["flixel_backgrounds"][i]['hasDownloadedVideo']) displayCounter++;
            
            //console.debug(themesList["flixel_backgrounds"][i]);
            //console.debug(isLiveTheme);
            
            if (themeTabId == 3 || isLiveTheme) { //chrome theme
                //console.debug(themesList["flixel_backgrounds"][i]);
                addAvailableContentToList($liveThemes, themesList["flixel_backgrounds"][i], liveThemesType, currentContent);
            }
        }
        
        if (displayCounter < 16 && allCounter > 25 && ++autoLoadMoreCounter < 5 && parseInt(localStorage.getItem("flixel-themes-current-page") || 0) <= 5 && parseInt(localStorage.getItem("themes-sort-type")) < 3) {
            loadMoreFlixelContent($("#load-more-flixel-content"));
        }
    }
    if (availableThemesData || flixelThemesData) {
        $('[data-toggle="tooltip"]').tooltip('hide').tooltip('fixTitle');
        if (callback) callback(response);
    }
}

function updateAvailableThemesListFavorites() {
    //console.debug(UPDListener);
    if (typeof UPDListener != "undefined" && UPDListener === false) return;
    var startDate = Date.now();
    naviRenderID = startDate * 1;
    var $waiter = $(".navi-themes").addClass("wait-for-themes").html("");
    BRW_sendMessage({
        command: "updateAvailableThemesList"
    }, function (availableThemesResponse) {
        BRW_sendMessage({
            command: "updateFlixelThemesList"
        }, function () {
            if (naviRenderID != startDate) return;
            getAvailableThemesFavorites(availableThemesResponse, displayAvailableThemesList);
            $waiter.removeClass("wait-for-themes");
            if (typeof NAVI == "object") NAVI.draw("counters");
        });
    });
}

function getAvailableThemesFavorites(response, callback) {
    var themesList = {};
    var installedTheme = null;
    var installedThemes = response.installedThemes
        , i, j;
    var currentContent = {
        "currentImage": response.currentImage
        , "currentImageResolution": response.currentImageResolution
        , "currentVideo": response.currentVideo
        , "currentVideoResolution": response.currentVideoResolution
        , "currentTheme": response.currentThemeId
        , "videoContentAvailableResolutions": response.videoContentAvailableResolutions
        , "flixelContentAvailableResolutions": response.flixelContentAvailableResolutions
    };
    var favoriteThemes = getFavoriteThemesObject();
    if (getArrayLength(favoriteThemes)) {
        themesList = [];
        for (i in favoriteThemes) {
            var favoriteTheme = favoriteThemes[i];
            favoriteTheme['installed'] = false;
            favoriteTheme['hasDownloadedImage'] = false;
            favoriteTheme['hasDownloadedVideo'] = false;
            favoriteTheme['handmade'] = favoriteTheme.handmade ? true : false;
            for (j in installedThemes) {
                installedTheme = installedThemes[j];
                if (favoriteTheme['id'] == installedTheme['id']) {
                    if (favoriteTheme['contentType'] == liveThemesType || favoriteTheme['contentType'] == liveBackgroundType || favoriteTheme['contentType'] == staticBackgroundType) {
                        favoriteTheme['installed'] = true;
                        favoriteTheme['hasDownloadedImage'] = (installedTheme.bgFilePath && getArrayLength(installedTheme.bgFilePath)) ? true : false;
                        favoriteTheme['hasDownloadedVideo'] = (installedTheme.bgVideoPath && getArrayLength(installedTheme.bgVideoPath)) ? true : false;
                        break;
                    }
                    else if (favoriteTheme['contentType'] == flixelBackgroundType) {
                        favoriteTheme['installed'] = true;
                        favoriteTheme['hasDownloadedVideo'] = (installedTheme.bgVideoPath && getArrayLength(installedTheme.bgVideoPath)) ? true : false;
                        break;
                    }
                }
            }
            favoriteTheme['favorite'] = checkThemeIsFavorite(favoriteTheme, favoriteThemes);
            if (favoriteTheme['contentType'] == liveThemesType && typeof (favoriteTheme['bgVideoPath']) != "undefined" && typeof (favoriteTheme['bgFilePath']) != "undefined") themesList.push(favoriteTheme);
            if ((favoriteTheme['contentType'] == liveBackgroundType || favoriteTheme['contentType'] == liveThemesType) && typeof (favoriteTheme['bgVideoPath']) != "undefined") themesList.push(favoriteTheme);
            if ((favoriteTheme['contentType'] == staticBackgroundType || favoriteTheme['contentType'] == liveThemesType) && typeof (favoriteTheme['bgFilePath']) != "undefined") themesList.push(favoriteTheme);
            if (favoriteTheme['contentType'] == flixelBackgroundType && typeof (favoriteTheme['bgVideoPath']) != "undefined") themesList.push(favoriteTheme);
        }
        var $themeBgContainer = $("#available-favorite-themes").html('');
        var $imageBgContainer = $("#available-favorite-images").html('');
        var $liveThemeContainer = $("#available-favorite-live-themes").html('');
        themesList = sortByActiveContent(themesList, currentContent);
        for (i in themesList) {
            var $container = $themeBgContainer;
            if (themesList[i].chromeThemeUrl) $container = $liveThemeContainer;
            else
            if (!themesList[i].bgVideoThumb) $container = $imageBgContainer;
            addAvailableContentToList($container, themesList[i], themesList[i]['contentType'], currentContent);
        }
        $('[data-toggle="tooltip"]').tooltip('hide').tooltip('fixTitle');
        if (callback) callback(response);
    }
    else {
        $("#not-available-themes-container").show();
    }
}
/**
 * Sort by active content
 *
 * @param themes Array
 * @param contentType String
 * @param currentContent Object
 */
function sortByActiveContent(themes, contentType, currentContent) {
    sortByDownloadedContent(themes, contentType);
    var totalThemes = themes.length;
    for (var i = 0; i < totalThemes; i++) {
        var theme = themes[i];
        var isActiveContent = false;
        if (contentType == liveBackgroundType || contentType == flixelBackgroundType || contentType == liveThemesType) isActiveContent = currentContent.currentVideo && currentContent.currentVideo.indexOf(theme.id) >= 0;
        else if (contentType == staticBackgroundType) isActiveContent = currentContent.currentImage && currentContent.currentImage.indexOf(theme.id) >= 0;
        else if (contentType == liveThemesType) isActiveContent = theme.id == currentContent.currentTheme;
        if (isActiveContent) moveArrayElements(themes, i, 0);
    }
    return themes;
}
/**
 * Sort by downloaded content
 *
 * @param themes Array
 * @param contentType String
 */
function sortByDownloadedContent(themes, contentType) {
    var totalThemes = themes.length;
    for (var i = 0; i < totalThemes; i++) {
        var theme = themes[i];
        var isDownloadedContent = false;
        if (contentType == liveBackgroundType || contentType == flixelBackgroundType || contentType == liveThemesType) isDownloadedContent = theme.hasDownloadedVideo;
        else if (contentType == staticBackgroundType) isDownloadedContent = theme.hasDownloadedImage;
        else if (contentType == liveThemesType) isDownloadedContent = false;
        if (isDownloadedContent) moveArrayElements(themes, i, 0);
    }
    return themes;
}
/**
 * Add clear content item to list
 *
 * @param $container jQuery
 * @param contentType Int
 */
function addClearContentItemToList($container, contentType) {
    var $contentContainer = $("<div></div>");
    $contentContainer.addClass("av-content-container").addClass("av-restore-default-container");
    var $contentTitle = $("<div></div>");
    $contentTitle.addClass("av-content-title");
    $contentTitle.text(translate("options_tabs_item_disable"));
    var $contentImgContainer = $("<div></div>");
    $contentImgContainer.addClass("av-content-img-container");
    $contentImgContainer.attr("src", extensionGetUrl("/pages/options/img/chrome-disable-content.png"));
    var $contentImg = $("<img>");
    $contentImg.addClass("av-content-img av-restore-default-theme-img");
    $contentImg.attr("src", extensionGetUrl("/pages/options/img/chrome-disable-content.png"));
    var $contentFooter = $("<div></div>");
    $contentFooter.addClass("av-content-footer");
    var $installButton = $("<a></a>");
    var installButtonText = translate("options_tabs_item_buttons_disable");
    var contentButtonId = "";
    if (contentType == liveBackgroundType) contentButtonId = "disable-current-video";
    else if (contentType == staticBackgroundType) contentButtonId = "disable-current-image";
    else if (contentType == flixelBackgroundType) contentButtonId = "disable-current-flixel";
    $installButton.attr("id", contentButtonId);
    $installButton.addClass("btn").addClass("btn-warning").addClass("av-content-restore");
    $installButton.attr("data-content-type", contentType);
    $installButton.text(installButtonText);
    $contentImgContainer.append($contentImg);
    $contentFooter.append($installButton);
    $contentContainer.append($contentTitle).append($contentImgContainer).append($contentFooter);
    $container.append($contentContainer);
}

function addDefaultThemeToList($container) {
    var $contentContainer = $("<div></div>");
    $contentContainer.addClass("av-content-container").addClass("av-restore-default-container");
    var $contentTitle = $("<div></div>");
    $contentTitle.addClass("av-content-title");
    $contentTitle.text(translate("options_tabs_item_restore"));
    var $contentImgContainer = $("<div></div>");
    $contentImgContainer.addClass("av-content-img-container");
    var $contentImg = $("<img>");
    $contentImg.addClass("av-content-img av-restore-default-theme-img");
    $contentImg.attr("src", extensionGetUrl("/pages/options/img/chrome-default-theme.png"));
    var $contentFooter = $("<div></div>");
    $contentFooter.addClass("av-content-footer");
    //$contentFooter.attr("data-toggle", "tooltip");
    //$contentFooter.attr("data-placement", "bottom");
    //$contentFooter.attr("title", translate("options_tabs_item_buttons_restore_title"));
    var $installButton = $("<a></a>");
    var installButtonText = translate("options_tabs_item_buttons_restore");
    $installButton.attr("id", "restore-default-theme");
    $installButton.addClass("btn").addClass("btn-warning").addClass("av-content-restore");
    $installButton.attr("data-content-type", liveThemesType);
    $installButton.attr("data-toggle", "modal");
    $installButton.attr("data-target", "#restore-default-theme-dialog");
    var restoreThemeFileName = "restore-theme-description_";
    var restoreThemeFileExt = ".jpg";
    var restoreThemeShowUrlEn = restoreThemeFileName + "en" + restoreThemeFileExt;
    var restoreThemeShowUrlRu = restoreThemeFileName + "ru" + restoreThemeFileExt;
    var restoreThemeShowLangUrl = translate("page_header_bookmarks_help_img");
    var $restoreThemeModalBody = $("#restore-default-theme-dialog-body");
    var restoreThemeImageUrl = restoreThemeShowUrl;
    if (!restoreThemeShowLangUrl) restoreThemeImageUrl += hasRuLanguage ? restoreThemeShowUrlRu : restoreThemeShowUrlEn;
    else restoreThemeImageUrl += restoreThemeFileName + restoreThemeShowLangUrl + restoreThemeFileExt;
    var $restoreThemeImage;
    $('#restore-default-theme-dialog').on('show.bs.modal', function (e) {
        if (!$restoreThemeImage) {
            $restoreThemeImage = $("<img>").attr("src", restoreThemeImageUrl).addClass("restore-default-theme-description");
            $restoreThemeImage.attr("id", "restore-default-theme-description");
            $restoreThemeImage.on("load", function () {
                $("#options-restore-theme-popup-body-load").hide();
            });
            if (!$restoreThemeModalBody.find(".restore-default-theme-description").length) {
                $restoreThemeModalBody.append($restoreThemeImage);
            }
        }
    });
    $installButton.text(installButtonText);
    $contentImgContainer.append($contentImg);
    $contentFooter.append($installButton);
    $contentContainer.append($contentTitle).append($contentImgContainer).append($contentFooter);
    $container.append($contentContainer);
}
/**
 * Toggle content favorite state
 */
function addToggleFavoriteStateButtonHandler() {
    $(document).on("click", ".av-content-favorite-img", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $el = $(this);
        var $contentBlock = $el.closest(".available-themes-block");
        var $itemContainer = $el.closest(".av-content-container");
        var $contentInstall = $itemContainer.find(".av-content-install");
        var $contentImgContainer = $itemContainer.find(".av-content-img-container");
        var contentType = $contentBlock.attr("data-container-content-type") || $contentInstall.attr("data-content-type");
        var contentId = $contentInstall.attr("data-content-theme");
        if (contentType && contentId) {
            if ($el.hasClass("av-content-favorite-img-active")) {
                var $modalConfirmButton = $("#delete-from-favorite-dialog-confirm");
                if ($modalConfirmButton) {
                    $modalConfirmButton.attr("data-container-content-type", contentType);
                    $modalConfirmButton.attr("data-content-theme", contentId);
                    $modalConfirmButton.on("click", addConfirmRemoveFavoriteHandler);
                    $("#delete-from-favorite-dialog").modal();
                }
            }
            else {
                var themes = getInstalledThemes();
                if (themes[contentId]) {
                    if (addThemeElementToFavorite(contentType, contentId)) {
                        $el.addClass("av-content-favorite-img-active");
                        $el.css({
                            "display": "block"
                        });
                        $contentImgContainer.off("mouseenter", showFavoriteImageOnContentHover).off("mouseleave", hideFavoriteImageOnContentHover);
                        $el.attr('data-original-title', translate("options_tabs_item_buttons_favorite_remove")).tooltip('fixTitle').tooltip('show');
                        getFavoriteTabPages(reloadTabPages);
                    }
                }
                else {
                    $("#add-to-favorite-dialog").modal();
                }
            }
        }
    });
}
/**
 * Remove installed theme
 */
function addRemoveInstalledTheme() {
    $(document).on("click", ".av-content-img-delete", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $el = $(this);
        var $modalConfirmButton = $("#delete-theme-dialog-confirm");
        if ($modalConfirmButton) {
            $("#delete-theme-dialog-text").text(translate($el.attr("message")));
            $modalConfirmButton.on("click", function () {
                var $contentBlock = $el.closest(".available-themes-block");
                var $itemContainer = $el.closest(".av-content-container");
                var $contentInstall = $itemContainer.find(".av-content-install");
                var $contentImgContainer = $itemContainer.find(".av-content-img-container");
                var contentType = $contentBlock.attr("data-container-content-type");
                var contentId = $contentInstall.attr("data-content-theme");
                if ( /*contentType && */ contentId) {
                    var themes = localStorage.getItem('installed-themes');
                    themes = JSON.parse(themes);
                    if (true || Object.keys(themes).length > 1) { //Delete theme
                        if (themes[contentId]) {
                            if (themes[contentId].downloadedByUser) { //delete user theme
                                BRW_fsRemoveFile('themes/' + contentId, themes[contentId]['bgFilePath'][1920]);
                                var uploadedThemes = JSON.parse(localStorage.getItem("uploaded-themes-data") || "[]");
                                for (var u in uploadedThemes)
                                    if (uploadedThemes[u].id == contentId) {
                                        uploadedThemes.splice(u, 1);
                                        break;
                                    }
                                localStorage.setItem("uploaded-themes-data", JSON.stringify(uploadedThemes || []));
                                $itemContainer.remove();
                            }
                            else if (typeof NAVI == "object" && NAVI.state.page.sub == "navi-bg-downloaded") { // delete block from downloaded
                                $itemContainer.fadeOut(350, () => {
                                    $itemContainer.remove();
                                });
                            }
                            else { //reset block status
                                $el.removeClass('active').removeClass('active-disabled');
                                $installButton = $itemContainer.find(".av-content-install");
                                if (contentType == flixelBackgroundType) var installButtonText = translate("options_tabs_item_buttons_install_flixer");
                                else var installButtonText = translate("options_tabs_item_buttons_install");
                                setInstallButtonClass($installButton, 'btn-danger');
                                $installButton.text(installButtonText);
                                $installButton.attr('data-content-installed', false);
                                $resolutionButtons = $itemContainer.find(".current-theme-download");
                                $resolutionButtons.removeClass("btn-success").addClass("btn-primary").attr("is-active-resolution", false);
                            } //if
                            BRW_fsRemoveFile('themes/' + contentId, contentId + '.hd.mp4');
                            BRW_fsRemoveFile('themes/' + contentId, contentId + '.hd.mp4');
                            BRW_fsRemoveFile('themes/' + contentId, contentId + '.tablet.mp4');
                            BRW_fsRemoveFile('thumbnails/' + contentId, contentId + 'poster.png');
                            BRW_fsRemoveFile('thumbnails/' + contentId, contentId + '.thumbnail.jpg');
                            BRW_fsRemoveFile('themes/' + contentId, 'v640bg.mp4');
                            BRW_fsRemoveFile('themes/' + contentId, 'v1024bg.mp4');
                            BRW_fsRemoveFile('themes/' + contentId, 'v1920bg.mp4');
                            delete themes[contentId];
                            localStorage.setItem('installed-themes', JSON.stringify(themes));
                            localStorage.setItem('download-queue', 0);
                        } //if
                    }
                    else {
                        alert('Сan not remove a single loaded theme!');
                    }
                } //if
            });
            $("#delete-theme-dialog").modal();
        }
    });
}
/**
 * Add toggle show themes random state button handler
 */
function addToggleShowThemesRandomStateButtonHandler() {
    $(".random-themes-display-label").each(function () {
        var $el = $(this);
        $el.attr("data-toggle", "tooltip");
        $el.attr("data-placement", "bottom");
        $("#random-themes-display-label-flixel").attr("data-placement", "right");
        if ($el.hasClass('random-themes-display-label-favorites')) {
            $el.attr("title", translate("options_tabs_item_note_random_background_on_options_page"));
            $el.find("input[type=checkbox]").attr("setMode", 1);
        }
        else {
            $el.attr("title", translate("options_tabs_item_note_random_background_on_options_page_downloaded"));
            $el.find("input[type=checkbox]").attr("setMode", 2);
        }
        var randomThemesDisplayMode = getRandomThemesDisplay() || false;
        if (randomThemesDisplayMode == $el.find("input[type=checkbox]").attr("setMode")) $el.find("input[type=checkbox]").prop("checked", true);
        var bounce = false;
        $el.on("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (bounce) return false;
            else {
                bounce = true;
                setTimeout(function () {
                    bounce = false;
                }, 150);
            } //else
            var randomThemesDisplayMode = getRandomThemesDisplay() || false;
            var $el = $(this).find("input[type=checkbox]");
            if ($el.attr("setMode") != randomThemesDisplayMode /*$el.is(':checked')*/ ) var val = $el.attr("setMode");
            else var val = false;
            setTimeout(function () {
                if (val) {
                    $(".random-themes-display").each(function () {
                        var $item = $(this);
                        if ($item.attr("setMode") == val) $item.prop("checked", true);
                        else $item.prop("checked", false);
                    });
                }
                else {
                    $(".random-themes-display").each(function () {
                        var $item = $(this);
                        if ($item.is(":checked")) $item.prop("checked", false);
                    });
                }
            }, 50);
            BRW_TabsGetCurrentID(function (tabID) {
                BRW_sendMessage({
                    command: "setRandomThemesDisplaySettings"
                    , val: val
                    , tab: tabID
                });
            });
        });
    });
}
/**
 * Add confirm remove favorite handler
 *
 * @param e Event
 */
function addConfirmRemoveFavoriteHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    var $el = $(this);
    var contentType = $el.attr("data-container-content-type");
    var contentId = $el.attr("data-content-theme");
    if (contentType && contentId) {
        var $contentInstall = $(".av-content-install[data-content-theme=" + contentId + "]");
        if ($contentInstall) {
            var $contentItem = $contentInstall.closest(".av-content-container");
            var $contentImgContainer = $contentItem.find(".av-content-img-container");
            if ($contentItem) {
                var $removeFavoriteBtn = $contentItem.find(".av-content-favorite-img-active");
                if ($removeFavoriteBtn) {
                    $el.off("click", addConfirmRemoveFavoriteHandler);
                    removeThemeElementFromFavorite(contentType, contentId);
                    $removeFavoriteBtn.removeClass("av-content-favorite-img-active");
                    $removeFavoriteBtn.hide();
                    $contentImgContainer.on("mouseenter", showFavoriteImageOnContentHover).on("mouseleave", hideFavoriteImageOnContentHover);
                    $removeFavoriteBtn.attr('data-original-title', translate("options_tabs_item_buttons_favorite")).tooltip('fixTitle');
                    $("#delete-from-favorite-dialog").modal('hide');
                    getFavoriteTabPages(reloadTabPages);
                    var $contentFavorite = $("#available-favorite-themes, #available-favorite-images").find(".av-content-install[data-content-theme=" + contentId + "]").closest(".av-content-container");
                    $contentFavorite.fadeOut(600, function () {
                        $contentFavorite.remove();
                        if (typeof NAVI == "object") NAVI.draw("counters");
                    });
                }
            }
        }
    }
}
/*
function addConfirmRemoveFavoriteHandler(e) {
    e.preventDefault();
    e.stopPropagation();

    var $el = $(this);
    var contentType = $el.attr("data-container-content-type");
    var contentId = $el.attr("data-content-theme");
    if (contentType && contentId) {
        
        var $contentBlock = $(".available-themes-block[data-container-content-type=" + contentType + "]");
        
        var $contentInstall = $contentBlock.find(".av-content-install[data-content-theme=" + contentId + "]");
        
        if ($contentBlock && $contentInstall) {
            var $contentItem = $contentInstall.closest(".av-content-container");
            var $contentImgContainer = $contentItem.find(".av-content-img-container");
            if ($contentItem) {
                var $removeFavoriteBtn = $contentItem.find(".av-content-favorite-img-active");
                if ($removeFavoriteBtn) {
                    $el.off("click", addConfirmRemoveFavoriteHandler);
                    removeThemeElementFromFavorite(contentType, contentId);
                    $removeFavoriteBtn.removeClass("av-content-favorite-img-active");
                    $removeFavoriteBtn.hide();
                    $contentImgContainer.on("mouseenter", showFavoriteImageOnContentHover).on("mouseleave", hideFavoriteImageOnContentHover);
                    $removeFavoriteBtn.attr('data-original-title', translate("options_tabs_item_buttons_favorite")).tooltip('fixTitle');
                    $("#delete-from-favorite-dialog").modal('hide');
                    getFavoriteTabPages(reloadTabPages);
                    
                    
                }
            }
        }
    }
}
*/
/**
 * Remove content favorite mark
 *
 * @param response Object
 */
function removeContentFavoriteMark(response) {
    var contentType = response.contentType;
    var contentId = response.contentId;
    if (contentType && contentId) {
        var $itemsContainer = $(".available-themes-block[data-container-content-type=" + contentType + "]");
        var $items = $itemsContainer.find(".av-content-install[data-content-theme='" + contentId + "']");
        if ($items.length) {
            $items.each(function () {
                var $installButton = $(this);
                var $itemContainer = $installButton.closest(".av-content-container");
                var $contentImgContainer = $itemContainer.find(".av-content-img-container");
                var $removeFavoriteBtn = $itemContainer.find(".av-content-favorite-img");
                if ($removeFavoriteBtn.hasClass("av-content-favorite-img-active")) {
                    $removeFavoriteBtn.removeClass("av-content-favorite-img-active");
                    $("#delete-from-favorite-dialog-confirm").off("click", addConfirmRemoveFavoriteHandler);
                    $removeFavoriteBtn.removeClass("av-content-favorite-img-active");
                    $removeFavoriteBtn.hide();
                    $contentImgContainer.on("mouseenter", showFavoriteImageOnContentHover).on("mouseleave", hideFavoriteImageOnContentHover);
                    $removeFavoriteBtn.attr('data-original-title', translate("options_tabs_item_buttons_favorite")).tooltip('fixTitle');
                    $("#delete-from-favorite-dialog").modal('hide');
                }
            });
            $('[data-toggle="tooltip"]').tooltip('hide').tooltip('fixTitle');
        }
    }
}
/**
 * Show favorite image on content hover
 *
 * @param e Event
 */
function showFavoriteImageOnContentHover(e) {
    $(this).find(".av-content-favorite-img").fadeIn(400);
}

function showShareImageOnContentHover(e) {
    $(this).find(".av-content-share-img").fadeIn(400);
}
/**
 * Hide favorite image on content hover
 *
 * @param e Event
 */
function hideFavoriteImageOnContentHover(e) {
    $(this).find(".av-content-favorite-img").fadeOut(400);
}

function hideShareImageOnContentHover(e) {
    $(this).find(".av-content-share-img").fadeOut(400);
}
/**
 * Add available content
 *
 * @param $container jQuery element
 * @param theme Object
 * @param contentType Int
 * @param currentContent Object
 */
function addAvailableContentToList($container, theme, contentType, currentContent) { //return;
    var section, tabs, sortType = getThemesSortType()
        , installedId = getLastInstalledThemeId();
    try {
        if (typeof VAL === "object" && typeof NAVI === "object") {
            section = VAL.get("navi-section-options");
            tabs = NAVI.state.page.tab || [];
            if (section === "navi-bg-favorites") {}
            else
            if (section === "navi-bg-downloaded") {
                if (!theme.hasDownloadedVideo && !theme.hasDownloadedImage) return;
            }
            else
            if (
                (theme.id != installedId) && (theme.hasDownloadedVideo || theme.hasDownloadedImage)
                && 
                (tabs.indexOf("live-bg-search") == -1) 
                && 
                (tabs.indexOf("walpapers-custom") == -1)
                && 
                (section != "navi-bg-live-themes") 
            ){
                return;
            }
            else {
                if (getSettingsBackgroundTabId() === 0 && getThemesSortType() === 4) { // Task #668
                    if ($container.find("[data-theme=" + theme.id + "]").length) return;
                }
            }
            //if(sortType === 4 && section === "navi-bg-live-backgrounds"){ // Themes search
            //    $container = $("#available-flixel-backgrounds");
            //}
        }
    }
    catch (ex) {
        console.warn(ex);
    }
    var $contentContainer = $("<div></div>");
    $contentContainer.addClass("av-content-container");
    var $contentTitle = $("<div></div>");
    $contentTitle.addClass("av-content-title");
    var $contentImgContainer = $("<div></div>");
    $contentImgContainer.addClass("av-content-img-container");
    if (contentType == flixelBackgroundType) $contentImgContainer.addClass("av-content-img-container-dark");
    var $contentImg = $("<img>");
    var contentThumbImage = null;
    $contentImg.addClass("av-content-img");
    $contentImg.on('load', function () {
        var $contentLoader = $(this).parent().find(".av-content-img-loader");
        if ($contentLoader) $contentLoader.remove();
    });
    if (contentType == flixelBackgroundType) $contentImg.addClass("av-content-img-width-auto");
    if (!theme.downloadedByUser) {
        if (contentType == liveBackgroundType || contentType == staticBackgroundType || contentType == liveThemesType) contentThumbImage = getThemeContentThumbImage(theme.id, theme.downloadedByUser);
        else if (contentType == flixelBackgroundType) contentThumbImage = theme.bgFileThumb;
        $contentImg.attr("src", contentThumbImage);
    }
    else {
        $contentImg.attr("need-thumb", theme.id);
        BRW_sendMessage({
            command: "getThumbForUserImage"
            , theme: theme
        });
    }
    var $contentFavorite = $("<div></div>");
    $contentFavorite.addClass("av-content-favorite-img");
    if (typeof (theme['favorite']) != "undefined" && theme['favorite']) {
        $contentFavorite.addClass("av-content-favorite-img-active");
        $contentFavorite.attr("title", translate("options_tabs_item_buttons_favorite_remove"));
        $contentFavorite.css({
            "display": "block"
        });
        $contentImgContainer.off("mouseenter", showFavoriteImageOnContentHover).off("mouseleave", hideFavoriteImageOnContentHover);
    }
    else {
        $contentFavorite.attr("title", translate("options_tabs_item_buttons_favorite"));
        $contentImgContainer.on("mouseenter", showFavoriteImageOnContentHover).on("mouseleave", hideFavoriteImageOnContentHover);
    }
    $contentFavorite.attr("data-toggle", "tooltip");
    $contentFavorite.attr("data-placement", "right");
    $contentImgContainer.append($contentFavorite);
    /*Add share*/
    if (
        (contentType != staticBackgroundType) && (theme.shareFb || theme.shareOd || theme.shareTw || theme.shareVk)) {
        var $contentShare = $("<a></a>");
        $contentShare.addClass("av-content-share-img");
        $contentShare.attr("title", translate("options_share_this_video"));
        $contentShare.attr("href", "#");
        $contentShare.data(theme);
        $contentShare.attr("data-toggle", "tooltip");
        $contentShare.attr("data-placement", "right");
        $contentImgContainer.append($contentShare);
        $contentImgContainer.on("mouseenter", showShareImageOnContentHover).on("mouseleave", hideShareImageOnContentHover);
    } //else return false;
    /*Add share*/
    var $removeItem = $("<img>");
    if (contentType == staticBackgroundType || contentType == liveBackgroundType || contentType == flixelBackgroundType) {
        $removeItem.addClass("av-content-img-delete");
        $removeItem.attr("src", extensionGetUrl("/pages/options/css/img/buttons/delete.png"));
        $removeItem.attr("title", translate("options_tabs_item_buttons_control_delete"));
        $removeItem.attr("data-toggle", "tooltip");
        $removeItem.attr("data-placement", "left");
        if (contentType == staticBackgroundType) $removeItem.attr("message", "options_tabs_delete_image");
        else $removeItem.attr("message", "options_tabs_delete_theme");
        $contentContainer.append($removeItem);
    }
    var $settingsItem = $("<img>");
    if (contentType == staticBackgroundType || contentType == liveBackgroundType || contentType == flixelBackgroundType) {
        $settingsItem.addClass("av-content-img-settings");
        $settingsItem.attr("src", extensionGetUrl("/pages/options/css/img/buttons/settings.png"));
        $settingsItem.attr("title", translate("options_tabs_item_buttons_control_settings"));
        $settingsItem.attr("data-toggle", "tooltip");
        $settingsItem.attr("data-placement", "left");
        //$contentContainer.append($settingsItem); // Task #707 - 6
    }
    if (contentType == flixelBackgroundType) {
        var $contentLoaderImg = $("<img>");
        $contentLoaderImg.addClass("av-content-img-loader");
        $contentLoaderImg.attr("src", extensionGetUrl("/pages/options/css/img/buttons/popup/loading-small.gif"));
        $contentImgContainer.append($contentLoaderImg);
    }
    var $contentFooter = $("<div></div>");
    $contentFooter.addClass("av-content-footer");
    var $installButton = $("<a></a>");
    var installButtonText = "";
    $installButton.addClass("btn").addClass("av-content-install");
    var $viewItem = $("<a></a>");
    $viewItem.text(translate("options_tabs_item_buttons_view_live_bg"));
    $viewItem.addClass("btn").addClass("btn-warning").addClass("av-content-view");
    var isActiveContent = false;
    var isInstalledContent = false;
    var $contentResolutionsButtons
        , $downloadButton
        , downloadButtonResolution
        , $downloadButtonTextResolution
        , downloadButtonSize
        , $downloadButtonTextSize
        , themeTitleMaxResolution = "";
    
    if (typeof (theme.author) != "undefined" && theme.author) {
        var flixelUserChanelUrl = theme.handmade ? theme.author_url : getFlixelUserChanelUrl(theme.author);
        var $contentImgDescription = $("<div></div>");
        $contentImgDescription.addClass("av-content-img-description");
        $contentContainer.append($contentImgDescription);
        var $chanelText = $("<a></a>").addClass("av-content-img-description-text");
        $chanelText.attr("href", flixelUserChanelUrl);
        $chanelText.attr("target", "_blank");
        $chanelText.text(translate("options_tabs_item_chanel_description_text_flixel_bg" + (theme.handmade ? "_handmade" : "")) + " " + theme.author);
        $contentImgDescription.append($chanelText);
        $contentImgContainer.hover(function () {
            var $el = $(this);
            var $itemDescription = $el.find(".av-content-img-description");
            var $itemContainer = $el.closest(".av-content-container");
            if ($itemContainer) {
                var $itemResolutionButtons = $itemContainer.find(".av-content-resolution-buttons");
                if ($itemResolutionButtons && !$itemResolutionButtons.is(":visible")) $itemDescription.fadeIn(400);
            }
        }, function () {
            var $el = $(this);
            var $itemDescription = $el.find(".av-content-img-description");
            if ($itemDescription.is(":visible")) $itemDescription.fadeOut(400);
        });
        $contentImgContainer.append($contentImgDescription);
    }
    
    if (contentType == liveBackgroundType) {
        isActiveContent = currentContent.currentVideo && currentContent.currentVideo.indexOf(theme.id) >= 0;
        isInstalledContent = theme.hasDownloadedVideo;
        $installButton.attr("data-content-type", liveBackgroundType);
        $installButton.attr("data-content-installed", isInstalledContent);
        $installButton.addClass("available-install-video");
        $contentResolutionsButtons = $("<div></div>");
        $contentResolutionsButtons.addClass("av-content-resolution-buttons");
        $contentResolutionsButtons.attr("data-theme", theme.id);
        for (w in currentContent.videoContentAvailableResolutions) {
            $downloadButton = $("<button></button>").addClass("current-theme-download");
            $downloadButton.addClass("btn");
            if (currentContent.currentVideo.indexOf(theme.id) != -1 && currentContent.currentVideoResolution && currentContent.currentVideoResolution == currentContent.videoContentAvailableResolutions[w]) {
                $downloadButton.addClass("btn-success");
                $downloadButton.attr("title", getVideoThemeResolutionButtonTitle(currentContent.videoContentAvailableResolutions[w], true));
                $downloadButton.attr("is-active-resolution", true);
            }
            else {
                $downloadButton.addClass("btn-primary");
                $downloadButton.attr("title", getVideoThemeResolutionButtonTitle(currentContent.videoContentAvailableResolutions[w], false));
                $downloadButton.attr("is-active-resolution", false);
            }
            $downloadButton.attr("data-toggle", "tooltip");
            $downloadButton.attr("data-content-type", liveBackgroundType);
            $downloadButton.attr("data-resolution", currentContent.videoContentAvailableResolutions[w]);
            $downloadButton.attr("data-theme", theme.id);
            downloadButtonResolution = getVideoThemeResolutionTitle(currentContent.videoContentAvailableResolutions[w]);
            $downloadButtonTextResolution = "<span class='download-resolution'>" + downloadButtonResolution + "</span>";
            downloadButtonSize = getVideoThemeResolutionSize(theme, currentContent.videoContentAvailableResolutions[w]);
            $downloadButtonTextSize = "<span class='download-size'>" + downloadButtonSize + "</span>";
            $downloadButton.html($downloadButtonTextResolution + $downloadButtonTextSize);
            $contentResolutionsButtons.append($downloadButton);
        }
        $contentContainer.append($contentResolutionsButtons);
        if (isInstalledContent) {
            if (isActiveContent) {
                $contentResolutionsButtons.show();
                if ($viewItem && !$viewItem.hasClass("active")) $viewItem.addClass("active");
                if ($settingsItem && !$settingsItem.hasClass("active")) $settingsItem.addClass("active");
            }
        }
        addBackgroundVideoPreviewPopover(theme, $contentImgContainer);
    }
    else if (contentType == staticBackgroundType) {
        isActiveContent = currentContent.currentImage && currentContent.currentImage.indexOf(theme.id) >= 0;
        isInstalledContent = theme.hasDownloadedImage;
        $installButton.attr("data-content-type", staticBackgroundType);
        $installButton.attr("data-content-installed", isInstalledContent);
        $installButton.addClass("available-install-static");
        if (isInstalledContent) {
            if (isActiveContent) {
                if ($viewItem && !$viewItem.hasClass("active")) $viewItem.addClass("active");
                if ($settingsItem && !$settingsItem.hasClass("active")) $settingsItem.addClass("active");
            }
        }
    }
    else if (contentType == liveThemesType) {
        if (localStorage.getItem("background-video-content-type") == 4) {
            isActiveContent = currentContent.currentVideo && currentContent.currentVideo.indexOf(theme.id) >= 0;
        }
        else {
            isActiveContent = false;
        }
        if (localStorage.getItem("chrome-theme-video-id") == theme.id) {
            isInstalledContent = theme.hasDownloadedVideo;
        }
        else {
            isInstalledContent = false;
        }
        $installButton.attr("data-content-type", liveThemesType);
        $installButton.attr("target", "_blank");
        $installButton.addClass("available-install-live-theme");
        //$installButton.attr("href", themeSourceInstallUrl + theme.id);
        if (theme.chromeThemeUrl) {
            if (String(theme.chromeThemeUrl).indexOf('://') == -1) theme.chromeThemeUrl = themeSourceInstallUrl + theme.chromeThemeUrl;
            $installButton.attr("href", theme.chromeThemeUrl); //chrome theme
        }
        $installButton.attr("data-content-installed", isInstalledContent);
        $contentResolutionsButtons = $("<div></div>");
        //$contentResolutionsButtons.addClass("av-content-resolution-buttons av-content-resolution-buttons-themes");
        $contentResolutionsButtons.addClass("av-content-resolution-buttons").addClass("av-content-resolution-flixel-buttons");
        $contentResolutionsButtons.attr("data-theme", theme.id);
        for (w in currentContent.flixelContentAvailableResolutions) {
            var loopResolution = currentContent.flixelContentAvailableResolutions[w];
            if (typeof (theme.fullHd) == "undefined") {
                if (loopResolution == 1920 && typeof (theme.bgVideoPath[loopResolution]) == "undefined") continue;
            }
            else {
                if (!theme.fullHd && loopResolution == 1920 && typeof (theme.bgVideoPath[loopResolution]) == "undefined") continue;
            }
            themeTitleMaxResolution = ""; //(" + getFlixelThemeResolutionTitle(loopResolution, true) + ")" + " ";
            $downloadButton = $("<button></button>").addClass("current-theme-download");
            $downloadButton.addClass("btn");
            if (currentContent.currentVideo.indexOf(theme.id) != -1 && currentContent.currentVideoResolution && currentContent.currentVideoResolution == loopResolution) {
                $downloadButton.addClass("btn-success");
                $downloadButton.attr("is-active-resolution", true);
            }
            else {
                $downloadButton.addClass("btn-primary");
                $downloadButton.attr("is-active-resolution", false);
            }
            $downloadButton.attr("data-content-type", flixelBackgroundType);
            $downloadButton.attr("data-resolution", loopResolution);
            $downloadButton.attr("data-theme", theme.id);
            downloadButtonResolution = getFlixelThemeResolutionTitle(loopResolution);
            $downloadButtonTextResolution = "<span class='download-resolution'>" + downloadButtonResolution + "</span>";
            $downloadButton.html($downloadButtonTextResolution);
            $contentResolutionsButtons.append($downloadButton);
        }
        $contentContainer.append($contentResolutionsButtons);
        if (isInstalledContent) {
            if (isActiveContent) {
                $contentResolutionsButtons.show();
                if ($viewItem && !$viewItem.hasClass("active")) $viewItem.addClass("active");
                if ($settingsItem && !$settingsItem.hasClass("active")) $settingsItem.addClass("active");
            }
        }
        $contentContainer.append($contentResolutionsButtons);
    }
    else if (contentType == flixelBackgroundType) {
        /*
        if(localStorage.getItem("background-video-content-type") == 4){
            isActiveContent = false;
        }else{
            isActiveContent = currentContent.currentVideo && currentContent.currentVideo.indexOf(theme.id) >= 0;
        }//if
        */
        isActiveContent = currentContent.currentVideo && currentContent.currentVideo.indexOf(theme.id) >= 0;
        isInstalledContent = theme.hasDownloadedVideo;
        if (isInstalledContent && !isActiveContent && getRouteSortType() != 3 && section != "navi-bg-favorites" && section != "navi-bg-downloaded") return; // Why?
        $installButton.attr("data-content-type", flixelBackgroundType);
        $installButton.attr("data-content-installed", isInstalledContent);
        $installButton.addClass("available-install-flixer-video");
        $contentResolutionsButtons = $("<div></div>");
        $contentResolutionsButtons.addClass("av-content-resolution-buttons").addClass("av-content-resolution-flixel-buttons");
        $contentResolutionsButtons.attr("data-theme", theme.id);
        for (w in currentContent.flixelContentAvailableResolutions) {
            var loopResolution = currentContent.flixelContentAvailableResolutions[w];
            if (typeof (theme.fullHd) == "undefined") {
                if (loopResolution == 1920 && typeof (theme.bgVideoPath[loopResolution]) == "undefined") continue;
            }
            else {
                if (!theme.fullHd && loopResolution == 1920 && typeof (theme.bgVideoPath[loopResolution]) == "undefined") continue;
            }
            themeTitleMaxResolution = ""; //(" + getFlixelThemeResolutionTitle(loopResolution, true) + ")" + " ";
            $downloadButton = $("<button></button>").addClass("current-theme-download");
            $downloadButton.addClass("btn");
            if (currentContent.currentVideo.indexOf(theme.id) != -1 && currentContent.currentVideoResolution && currentContent.currentVideoResolution == loopResolution) {
                $downloadButton.addClass("btn-success");
                $downloadButton.attr("is-active-resolution", true);
            }
            else {
                $downloadButton.addClass("btn-primary");
                $downloadButton.attr("is-active-resolution", false);
            }
            $downloadButton.attr("data-content-type", flixelBackgroundType);
            $downloadButton.attr("data-resolution", loopResolution);
            $downloadButton.attr("data-theme", theme.id);
            downloadButtonResolution = getFlixelThemeResolutionTitle(loopResolution);
            $downloadButtonTextResolution = "<span class='download-resolution'>" + downloadButtonResolution + "</span>";
            $downloadButton.html($downloadButtonTextResolution);
            $contentResolutionsButtons.append($downloadButton);
        }
        $contentContainer.append($contentResolutionsButtons);
        if (isInstalledContent) {
            if (isActiveContent) {
                $contentResolutionsButtons.show();
                if ($viewItem && !$viewItem.hasClass("active")) $viewItem.addClass("active");
                if ($settingsItem && !$settingsItem.hasClass("active")) $settingsItem.addClass("active");
            }
        }
        /*
        if (typeof (theme.author) != "undefined" && theme.author) {
            var flixelUserChanelUrl = theme.handmade ? theme.author_url : getFlixelUserChanelUrl(theme.author);
            var $contentImgDescription = $("<div></div>");
            $contentImgDescription.addClass("av-content-img-description");
            $contentContainer.append($contentImgDescription);
            var $chanelText = $("<a></a>").addClass("av-content-img-description-text");
            $chanelText.attr("href", flixelUserChanelUrl);
            $chanelText.attr("target", "_blank");
            $chanelText.text(translate("options_tabs_item_chanel_description_text_flixel_bg" + (theme.handmade ? "_handmade" : "")) + " " + theme.author);
            $contentImgDescription.append($chanelText);
            $contentImgContainer.hover(function () {
                var $el = $(this);
                var $itemDescription = $el.find(".av-content-img-description");
                var $itemContainer = $el.closest(".av-content-container");
                if ($itemContainer) {
                    var $itemResolutionButtons = $itemContainer.find(".av-content-resolution-buttons");
                    if ($itemResolutionButtons && !$itemResolutionButtons.is(":visible")) $itemDescription.fadeIn(400);
                }
            }, function () {
                var $el = $(this);
                var $itemDescription = $el.find(".av-content-img-description");
                if ($itemDescription.is(":visible")) $itemDescription.fadeOut(400);
            });
            $contentImgContainer.append($contentImgDescription);
        }
        */
        addBackgroundVideoPreviewPopover(theme, $contentImgContainer);
    }
    $contentTitle.text(themeTitleMaxResolution + String(theme.title).replace('&amp;', '').replace('#039;', '`'));
    $installButton.attr("data-content-active", isActiveContent);
    
    $installButton.attr("data-content-theme", theme.id);
    if (isInstalledContent) {
        $removeItem.addClass("active");
    }
    if (isActiveContent) {
        $removeItem.addClass("active-disabled");
        $installButton.addClass("btn-primary");
        $installButton.addClass("btn-success");
        
        if (contentType == liveThemesType) installButtonText = translate("options_tabs_item_buttons_active_theme");
        else installButtonText = translate("options_tabs_item_buttons_active");
        
        $viewItem.addClass("active");  
    }
    else {
        if (isInstalledContent) {
            $installButton.addClass("btn-primary");
            installButtonText = translate("options_tabs_item_buttons_enable");
        }
        else {
            $installButton.addClass("btn-danger");
            if (contentType == flixelBackgroundType) installButtonText = translate("options_tabs_item_buttons_install_flixer");
            else installButtonText = translate("options_tabs_item_buttons_install");
        }
    }
    $installButton.text(installButtonText);
    $contentImgContainer.append($contentImg);
    $contentFooter.append($installButton);
    if (contentType == staticBackgroundType || contentType == liveBackgroundType || contentType == flixelBackgroundType || contentType == liveThemesType) {
        $contentFooter.append($viewItem);
    }
    $contentContainer.append($contentTitle).append($contentImgContainer).append($contentFooter);
    $container.append($contentContainer);
    if (theme.id == localStorage.getItem("install-interesting-theme")) {
        $contentContainer.insertAfter($container.find(".av-content-container:eq(0)"));
        $installButton.trigger("click");
        $contentResolutionsButtons.find(".current-theme-download:last").trigger("click");
        localStorage.setItem("install-interesting-theme", true);
    }
    else {
        //Standart
        $container.append($contentContainer);
    }
    trimGallery();
    setTimeout(trimGallery, 150)
}
/**
 * Add share button handler
 *
 */
function addShareModalHandler() {
    //$("#available-flixel-backgrounds, #available-live-themes, #available-video-themes").on("click", ".av-content-share-img", function () {
    $("#tree-navi-body").on("mousedown", ".av-content-share-img", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $button = $(this);
        var $container = $button.parents(".av-content-container")
        var theme = $button.data();
        var image = $container.find(".av-content-img").attr("src");
        var $modal = $("#modal-share-content");
        var $buttons = $modal.find(".options-share-buttons li");
        if (typeof (theme["bgVideoThumb"]) != "undefined" && theme["bgVideoThumb"]) {
            var videoThumbSrc = null;
            if (theme.contentType == liveBackgroundType || theme.contentType == liveThemesType || theme.handmade) videoThumbSrc = getThemeContentThumbVideo(theme.id);
            else if (theme.contentType == flixelBackgroundType) videoThumbSrc = getFlixelVideoThumb(theme.id);
            if (videoThumbSrc) {
                var $content = '<video src="' + mp4ToWebm(videoThumbSrc) + '" poster="' + image + '" loop width="400" height="226" class="modal-share-video"></video>';
                $modal.find(".options-share-video span").html("").append($content);
                $modal.find(".options-share-video video")[0].play();
                $buttons.addClass("hide");
                $buttons.each(function () {
                    var type = $(this).attr("social");
                    if (theme[type]) {
                        //var link = "https://www.facebook.com/share.php?u="theme[type]
                        //console.log(theme[type]);
                        var link = false;
                        var text = translate("options_share_desc_" + String(Math.floor(Math.random() * 4) + 1));
                        text = text.replace('[Theme_Name]', theme.title).replace('#ThemeName', '#' + capitalizeEachWord(theme.title).replace(/[\s\_\,]/g, '')).replace('[LINK]', theme[type]);
                        text = encodeURIComponent(text);
                        switch (type) {
                        case "shareFb":
                            var link = "https://www.facebook.com/sharer.php?m2w&src=sp&s=100&p[url]=" + encodeURIComponent(theme[type]) +
                                //"&p[title]="+text+
                                //"&p[text]="+text+
                                //"&p[desc]="+text+
                                //"&p[description]="+text+
                                "&p[summary]=" + text;
                            break;
                        case "shareTw":
                            var link = "https://twitter.com/intent/tweet?&url=" + //+encodeURIComponent(theme[type])+
                                "&text=" + text + ""; //"&hashtags=LiveStartPage,LiveWallpapers";
                            break;
                        case "shareVk":
                            var link = "https://vk.com/share.php?url=" + encodeURIComponent(theme[type]) + "&title=" + encodeURIComponent(translate("options_share_title")) + "&description=" + text;
                            break;
                        case "shareOd":
                            var link = "https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=" + encodeURIComponent(theme[type]);
                            break;
                        } //switch
                        $(this).removeClass("hide").find("a").unbind('click').on("click", function () {
                            if (link) {
                                var params = "width=600,height=400,left=100,top=150,menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes";
                                var openedWindow = window.open(link, "Share", params);
                            } //if
                        });
                    } //if
                });
                $modal.modal();
            } //
        } //
    });
}
/**
 * Set thumb for user image
 *
 * @theme_id
 * @url
 */
function setThumbForUserImage(theme_id, url) {
    var $img = $("[need-thumb=" + theme_id + "]");
    if ($img.length) {
        var oldSrc = $img.attr("src");
        if (!oldSrc || String(oldSrc).length < 10) $img.attr("src", url);
    } //if
}
/**
 * Add video preview popover
 *
 * @param theme Object
 * @param $contentContainer jQuery element
 */
function addBackgroundVideoPreviewPopover(theme, $contentContainer) {
    //if (String(theme.bgVideoThumb).indexOf('webm') > 0) console.debug("addAvailableContentToList", theme);
    if (typeof (theme["bgVideoThumb"]) != "undefined" && theme["bgVideoThumb"]) {
        var videoThumbSrc = null;
        if (theme.contentType == liveBackgroundType || theme.contentType == liveThemesType || theme.handmade) videoThumbSrc = getThemeContentThumbVideo(theme.id, theme.bgVideoThumb || "");
        else if (theme.contentType == flixelBackgroundType) videoThumbSrc = getFlixelVideoThumb(theme.id);
        var videoPosterSrc = extensionGetUrl("/pages/options/css/img/buttons/popup/circle-loader.gif");
        if (videoThumbSrc) {
            var content = '<video src="' + mp4ToWebm(videoThumbSrc) + '" poster="' + videoPosterSrc + '" loop width="320" height="180" class="popover-video-thumb"></video>';
            $contentContainer.popover({
                "delay": 750
                , "html": true
                , "title": theme.title
                , "trigger": "hover"
                , "placement": "auto left"
                , "template": $("#video-popover-block").html()
                , "content": content
            });
            $contentContainer.on("shown.bs.popover", function () {
                var $player = $contentContainer.parent().find("video");
                if ($player) {
                    var player = $player.get(0);
                    if (player) {
                        player.play();
                    }
                }
            }).on("hide.bs.popover", function () {
                var $player = $contentContainer.parent().find("video");
                if ($player) {
                    $player.css({
                        "display": "none"
                    });
                    var player = $player.get(0);
                    if (player) {
                        player.pause();
                        player.src = "";
                    }
                }
            });
        }
    }
}
/**
 * Display loaded flixer content
 *
 * @param response Object
 */
function displayLoadedFlixerContent(response) {
    if (typeof (response['newAvailableContentList']) != "undefined") {
        var $flixelBackgrounds = $("#available-flixel-backgrounds");
        var $loadMoreButtonCountainer = $("#load-more-content-container");
        
        var currentContent = {
            "currentImage": response.currentImage
            , "currentImageResolution": response.currentImageResolution
            , "currentVideo": response.currentVideo
            , "currentVideoResolution": response.currentVideoResolution
            , "currentTheme": response.currentThemeId
            , "videoContentAvailableResolutions": response.videoContentAvailableResolutions
            , "flixelContentAvailableResolutions": response.flixelContentAvailableResolutions
        };
        var favoriteThemes = getFavoriteThemesObject();
        for (var i in response.newAvailableContentList) {
            var flixelTheme = response.newAvailableContentList[i];
            flixelTheme['installed'] = false;
            flixelTheme['hasDownloadedImage'] = false;
            flixelTheme['hasDownloadedVideo'] = false;
            flixelTheme['favorite'] = checkThemeIsFavorite(flixelTheme, favoriteThemes);
            addAvailableContentToList($flixelBackgrounds, flixelTheme, flixelBackgroundType, currentContent);
        }
        if (getFlixelContentCurrentPage() < (getFlixelTotalPagesCount() - 1)) {
            if (response.newAvailableContentList.length) {
                var $icon = $loadMoreButtonCountainer.find(".glyphicon");
                if ($icon && $icon.hasClass("rotating")) $icon.removeClass("rotating");
                $loadMoreButtonCountainer.on("click", loadMoreFlixelContentButtonHandler);
            }
            else{
                hideMoreButton(response);
            }
        }
        else{
            hideMoreButton(response);
        }
    }
}

var MoreButtonTest = false;
function hideMoreButton(response){
    if(
        parseInt(getFlixelContentCurrentPage()) > 2
        &&
        getRouteSortType() < 2
    ){
        $loadMoreButtonCountainer.hide();
        
        if(MoreButtonTest){
            console.info(response);
            console.info(response.newAvailableContentList.length);
            console.trace();
        }
    }
    
}

/**
 * Download available contents error
 *
 * @param message Object
 */
function getAvailableContentError(message) {
    $.jGrowl(translate("options_refresh_themes_list_error"), {
        "life": 10000
    });
}
/**
 * Change background image file error
 *
 * @param message Object
 */
function changeBackgroundImageFileError(message) {
    var currentThemeId = null;
    if (message.currentThemeId) currentThemeId = message.currentThemeId;
    $.jGrowl(translate("options_tabs_download_static_bg_error"));
    var $downloadItems = $("#available-image-themes, #available-favorite-images").find(".av-content-install[data-content-downloading='true']");
    if ($downloadItems.length) {
        $downloadItems.each(function () {
            var $el = $(this);
            $el.attr('data-content-downloading', false);
            setInstallButtonClass($el, 'btn-danger');
            $el.text(translate("options_tabs_item_buttons_install"));
        });
    }
    if (currentThemeId) {
        var $activeItems = $("#available-image-themes, #available-favorite-images").find(".av-content-install[data-content-theme='" + currentThemeId + "']");
        if ($activeItems.length) {
            $activeItems.each(function () {
                var $el = $(this);
                if ($el.attr('data-content-theme') == currentThemeId) {
                    setInstallButtonClass($el, 'btn-success');
                    var $viewItem = $el.parent().find(".av-content-view");
                    if ($viewItem && !$viewItem.hasClass("active")) false; //$viewItem.addClass("active");
                    $el.text(translate("options_tabs_item_buttons_active"));
                }
            });
        }
    }
}
/**
 * Change background flixer file error
 *
 * @param message Object
 */
function changeBackgroundFlixerVideoFileErrorToPage(message) {
    changeBackgroundVideoContentError(message, flixelBackgroundType);
}
/**
 * Change background video file error
 *
 * @param message Object
 */
function changeBackgroundVideoFileError(message) {
    changeBackgroundVideoContentError(message, liveBackgroundType);
}
/**
 * Change background video content error
 *
 * @param message Object
 * @param contentType Int
 */
function changeBackgroundVideoContentError(message, contentType) {
    var currentVideoThemeId = null;
    var installedThemeId = null;
    if (message.currentThemeId) currentVideoThemeId = message.currentThemeId;
    if (message.installedThemeId) installedThemeId = message.installedThemeId;
    if (contentType == flixelBackgroundType) $.jGrowl(translate("options_tabs_download_flixer_bg_error"));
    else $.jGrowl(translate("options_tabs_download_live_bg_error"));
    $("#available-video-themes, #available-flixel-backgrounds, #available-live-themes, #available-favorite-themes").each(function () {
        var $downloadItems = $(this).find(".av-content-install[data-content-downloading='true']");
        if ($downloadItems.length) {
            $downloadItems.each(function () {
                var $downloadItem = $(this);
                var contentType = $downloadItem.attr("data-content-type");
                $downloadItem.attr('data-content-downloading', false);
                var $resolutionButtons = $downloadItem.parent().parent().find(".av-content-resolution-buttons");
                $resolutionButtons.find("button").each(function () {
                    var $button = $(this);
                    if ($button.hasClass("btn-success")) {
                        $button.attr("is-active-resolution", false);
                        $button.removeClass("btn-success");
                    }
                    if (!$button.hasClass("btn-primary")) $button.addClass("btn-primary");
                });
                if (contentType == liveBackgroundType || contentType == flixelBackgroundType || contentType == liveThemesType) {
                    $resolutionButtons.show();
                    setInstallButtonClass($downloadItem, 'btn-danger');
                    $downloadItem.text(translate("options_tabs_item_buttons_install_select_quality"));
                }
                else if (contentType == liveThemesType) {
                    var isActive = $downloadItem.attr("data-content-active");
                    isActive = isActive == "true";
                    if (isActive) {
                        setInstallButtonClass($downloadItem, 'btn-success');
                        $downloadItem.text(translate("options_tabs_item_buttons_active_theme"));
                    }
                }
            });
        }
    });
    if (currentVideoThemeId) {
        $("#available-video-themes, #available-flixel-backgrounds, #available-live-themes").each(function () {
            var $activeItems = null;
            var $activeItemsContainer = $(this);
            if ($activeItemsContainer.attr("id") == "available-video-themes") $activeItems = $activeItemsContainer.find(".av-content-install[data-content-theme='" + currentVideoThemeId + "']");
            else if ($activeItemsContainer.attr("id") == "available-live-themes" || $activeItemsContainer.attr("id") == "available-flixel-backgrounds") $activeItems = $activeItemsContainer.find(".av-content-install[data-content-theme='" + installedThemeId + "']");
            if ($activeItems && $activeItems.length) {
                $activeItems.each(function () {
                    var $el = $(this);
                    var contentType = $el.attr("data-content-type");
                    var checkContentResolution;
                    if (contentType == liveBackgroundType || contentType == flixelBackgroundType || contentType == liveThemesType) {
                        checkContentResolution = message.installedResolution;
                        setInstallButtonClass($el, 'btn-success');
                        var $viewItem = $el.parent().find(".av-content-view");
                        if ($viewItem && !$viewItem.hasClass("active")) false; //$viewItem.addClass("active");
                        var $settingsItem = $el.parent().parent().find(".av-content-img-settings");
                        if ($settingsItem && !$settingsItem.hasClass("active")) $settingsItem.addClass("active");
                        var $removeItem = $el.parent().parent().find(".av-content-img-delete");
                        if ($removeItem) {
                            $("active-disabled").removeClass("active-disabled");
                            $removeItem.addClass("active").addClass("active-disabled");
                        }
                        $el.text(translate("options_tabs_item_buttons_active"));
                    }
                    else if (contentType == liveThemesType) {
                        checkContentResolution = message.installedThemeResolution;
                        var isActive = $el.attr("data-content-active");
                        isActive = isActive == "true";
                        if (isActive) {
                            setInstallButtonClass($el, 'btn-success');
                            $el.text(translate("options_tabs_item_buttons_active_theme"));
                        }
                    }
                    if (typeof (checkContentResolution) != "undefined" && checkContentResolution) {
                        var $resolutionButtons = $el.parent().parent().find(".av-content-resolution-buttons");
                        $resolutionButtons.find("button").each(function () {
                            var $button = $(this);
                            if ($button.attr("data-resolution") == checkContentResolution) {
                                $button.attr("is-active-resolution", true);
                                if ($button.hasClass("btn-primary")) $button.removeClass("btn-primary");
                                if (!$button.hasClass("btn-success")) $button.addClass("btn-success");
                            }
                        });
                    }
                });
            }
        });
    }
    $('[data-toggle="tooltip"]').tooltip('hide').tooltip('fixTitle');
}
/**
 * Change background image file progress
 *
 * @param message Object
 */
function changeBackgroundImageFileProgress(message) {
    var theme_id = getThemeIdFromUrl(message.downloadingFile.theme_url);
    message.downloadingFile['themeId'] = theme_id;
    var $downloadItems = $("#available-image-themes, #available-favorite-images").find(".av-content-install[data-content-downloading='true'][data-content-theme='" + theme_id + "']");
    if ($downloadItems.length) {
        $downloadItems.each(function () {
            $(this).text(translate("options_tabs_item_buttons_download") + " " + message.percentComplete + "%");
        });
    }
    else {
        if (typeof (message.downloadingFile['themeId']) != "undefined" && message.downloadingFile['themeId']) {
            $downloadItems = $("#available-image-themes, #available-favorite-images").find(".av-content-install[data-content-theme='" + message.downloadingFile.themeId + "']");
            if ($downloadItems.length) {
                $downloadItems.each(function () {
                    var $installButton = $(this);
                    $installButton.text(translate("options_tabs_item_buttons_download") + " " + message.percentComplete + "%");
                    $installButton.attr("data-content-current-click", true);
                    setInstallButtonClass($installButton, "btn-info");
                    var $viewItem = $installButton.parent().find(".av-content-view");
                    if ($viewItem && $viewItem.hasClass("active")) $viewItem.removeClass("active");
                    $installButton.attr("data-content-downloading", true);
                });
                $('[data-toggle="tooltip"]').tooltip('hide').tooltip('fixTitle');
            }
        }
    }
}
/**
 * Change background flixer video file progress
 *
 * @param message Object
 */
function changeBackgroundFlixerVideoFileProgressToPage(message) {
    changeBackgroundVideoContentProgress(message, flixelBackgroundType);
}
/**
 * Change background video file progress
 *
 * @param message Object
 */
function changeBackgroundVideoFileProgress(message) {
    changeBackgroundVideoContentProgress(message, liveBackgroundType);
}
/**
 * Return theme ID from theme downloading url
 *
 * @url - HTTP link
 */
function getThemeIdFromUrl(url) {
    var id = false;
    arr = decodeURIComponent(String(url)).split('/');
    for (var i = 3; i--; i > 0) {
        if (arr.length) {
            var el = String(arr.pop());
            if (el.length >= 20) {
                id = el;
                break;
            }
        }
    }
    if (id) {
        id = id.split('.');
        id = id.shift();
    }
    return id;
} //function
/**
 * Change background video content progress
 *
 * @param message Object
 * @param contentType Int
 */
function changeBackgroundVideoContentProgress(message, contentType) {
    var theme_id = getThemeIdFromUrl(message.downloadingFile.theme_url);
    message.downloadingFile['themeId'] = theme_id;
    //var $itemsContainer = $("#available-video-themes, #available-flixel-backgrounds, #available-live-themes");
    var $itemsContainer = $("#available-video-themes, #available-flixel-backgrounds, #available-live-themes, #available-favorite-themes");
    // //var $downloadItems = $itemsContainer.find(".av-content-install[data-content-downloading='true'][data-content-theme='"+message.downloadingFile.themeId+"']");
    var $downloadItems = $itemsContainer.find(".av-content-install[data-content-downloading='true'][data-content-theme='" + theme_id + "']");
    var $activeItems = $itemsContainer.find(".av-content-install[data-content-active='true']");
    if ($downloadItems.length) {
        $downloadItems.each(function () {
            var $downloadItem = $(this);
            var contentType = $downloadItem.attr("data-content-type");
            var outputTranslate = contentType == flixelBackgroundType ? translate("options_tabs_item_buttons_download_flixel") : translate("options_tabs_item_buttons_download");
            var outputText = outputTranslate + " " + message.percentComplete; // + "%";
            if (String(message.percentComplete).indexOf("M") == -1) outputText += "%" //Hack to display MB instead %
            if (contentType == liveBackgroundType || contentType == flixelBackgroundType) $downloadItem.text(outputText);
            else if (contentType == liveThemesType) {
                var isActive = $downloadItem.attr("data-content-active");
                isActive = isActive == "true";
                if (isActive) $downloadItem.text(outputText);
            }
        });
    }
    else {
        if (typeof (message.downloadingFile['themeId']) != "undefined" && message.downloadingFile['themeId']) {
            if ($activeItems.length) {
                $activeItems.each(function () {
                    var $installButton = $(this);
                    if ($installButton.attr("data-content-theme") != message.downloadingFile.themeId) {
                        var contentType = $installButton.attr("data-content-type");
                        if (contentType == liveBackgroundType || contentType == flixelBackgroundType || contentType == liveThemesType) {
                            var $downloadContainer = $installButton.parent().parent().find(".av-content-resolution-buttons");
                            if ($downloadContainer.is(":visible")) $downloadContainer.hide();
                        }
                    }
                });
            }
            $downloadItems = $itemsContainer.find(".av-content-install[data-content-theme='" + message.downloadingFile.themeId + "']");
            if ($downloadItems.length) {
                $downloadItems.each(function () {
                    var $installButton = $(this);
                    var contentType = $installButton.attr("data-content-type");
                    var isActive = $installButton.attr("data-content-active");
                    isActive = isActive == "true";
                    if (contentType == flixelBackgroundType || contentType == liveBackgroundType || (contentType == liveThemesType && isActive)) {
                        var outputTranslate = contentType == flixelBackgroundType ? translate("options_tabs_item_buttons_download_flixel") : translate("options_tabs_item_buttons_download");
                        $installButton.text(outputTranslate + " " + message.percentComplete + "%");
                        $installButton.attr("data-content-current-click", true);
                        setInstallButtonClass($installButton, "btn-info");
                        $installButton.attr("data-content-downloading", true);
                        var $viewItem = $installButton.parent().find(".av-content-view");
                        if ($viewItem && $viewItem.hasClass("active")) $viewItem.removeClass("active");
                        var $settingsItem = $installButton.parent().parent().find(".av-content-img-settings");
                        if ($settingsItem && $settingsItem.hasClass("active")) $settingsItem.removeClass("active");
                        var $removeItem = $installButton.parent().parent().find(".av-content-img-delete");
                        if ($removeItem) {
                            $removeItem.removeClass("active-disabled");
                        }
                        var $downloadContainer = $installButton.parent().parent().find(".av-content-resolution-buttons");
                        if (typeof (message.downloadingFile['resolution']) != "undefined") {
                            $downloadContainer.find("button").each(function () {
                                var $item = $(this);
                                var itemResolution = $item.attr("data-resolution");
                                $item.removeClass("btn-success");
                                if (message.downloadingFile.resolution == itemResolution) {
                                    $item.addClass("btn-success");
                                    $item.attr("is-active-resolution", true);
                                    if (contentType != flixelBackgroundType) $item.attr("title", getVideoThemeResolutionButtonTitle(itemResolution, true));
                                }
                                else {
                                    if (!$item.hasClass("btn-primary")) $item.addClass("btn-primary");
                                    $item.attr("is-active-resolution", false);
                                    if (contentType != flixelBackgroundType) $item.attr("title", getVideoThemeResolutionButtonTitle(itemResolution, false));
                                }
                            });
                        }
                        $downloadContainer.show();
                    }
                });
                $('[data-toggle="tooltip"]').tooltip('hide').tooltip('fixTitle');
            }
        }
    }
}
/**
 * Change static background to options page
 *
 * @param message Object
 */
function changeStaticBackgroundToOptionsPage(message) {
    clearInstallContentButtons(staticBackgroundType);
    clearInstallContentButtons(liveBackgroundType);
    clearInstallContentButtons(flixelBackgroundType);
    checkDisplayRandomThemesActive();
    addSelectedTxt();
    //var $activeDataContainer = $(".available-themes-block[data-container-content-type=" + liveBackgroundType + "], .available-themes-block[data-container-content-type=" + flixelBackgroundType + "]");
    var $activeDataContainer = $(".available-themes-block");
    $activeDataContainer.find(".av-content-resolution-buttons").each(function () {
        $(this).hide();
    });
    var $container = $("#available-image-themes, #available-favorite-images");
    $container.find("a[data-content-theme='" + message.theme.id + "']").each(function () {
        var $el = $(this);
        setInstallButtonClass($el, "btn-success");
        $el.attr("data-content-downloading", false);
        $el.attr("data-content-installed", true);
        $el.attr("data-content-active", true);
        
        $el.text(translate("options_tabs_item_buttons_active"));
        var $viewItem = $(this).parent().find(".av-content-view");
        if ($viewItem && !$viewItem.hasClass("active")) $viewItem.addClass("active"); //false;
        var $settingsItem = $el.parent().parent().find(".av-content-img-settings");
        if ($settingsItem && !$settingsItem.hasClass("active")) $settingsItem.addClass("active");
        var $removeItem = $el.parent().parent().find(".av-content-img-delete");
        if ($removeItem) {
            $("active-disabled").removeClass("active-disabled");
            $removeItem.addClass("active").addClass("active-disabled");
        }
        $('[data-toggle="tooltip"]').tooltip('hide').tooltip('fixTitle');
    });
    try {
        BACK.check(false, true);
    }
    catch (ex) {
        console.warn(ex);
    }
}
/**
 * Change flixer background to options page
 *
 * @param message Object
 */
function changeFlixerBackgroundToOptionsPage(message) {
    changeVideoBackgroundToOptionsPage(message, flixelBackgroundType);
}
/**
 * Change live background to options page
 *
 * @param message Object
 */
function changeLiveBackgroundToOptionsPage(message) {
    changeVideoBackgroundToOptionsPage(message, liveBackgroundType);
}
/**
 * Change video bacground to options page
 *
 * @param message Object
 * @param contentType Int
 */
function changeVideoBackgroundToOptionsPage(message, contentType) {
    clearInstallContentButtons(staticBackgroundType);
    clearInstallContentButtons(liveBackgroundType);
    clearInstallContentButtons(flixelBackgroundType);
    checkDisplayRandomThemesActive();
    addSelectedTxt();
    //$("#available-video-themes, #available-flixel-backgrounds").find(".av-content-resolution-buttons").each(function () {
    $("#available-video-themes, #available-flixel-backgrounds", "#available-favorite-themes").find(".av-content-resolution-buttons").each(function () {
        $(this).hide();
    });
    //var $activeDataContainers = $(".available-themes-block[data-container-content-type=" + contentType + "]");
    var $activeDataContainers = $(".available-themes-block");
    $activeDataContainers.find(".av-content-resolution-buttons").each(function () {
        $(this).hide();
    });
    //$("#available-video-themes, #available-flixel-backgrounds, #available-live-themes").each(function () {
    $("#available-video-themes, #available-flixel-backgrounds, #available-live-themes, #available-favorite-themes").each(function () {
        var $container = $(this);
        var containerId = $container.attr("id");
        $container.find("a[data-content-theme='" + message.videoThemeId + "']").each(function () {
            var $el = $(this);
            setInstallButtonClass($el, "btn-success");
            $el.attr("data-content-downloading", false);
            $el.attr("data-content-installed", true);
            $el.attr("data-content-active", true);
            
            if (containerId == "available-video-themes" || containerId == "available-flixel-backgrounds" || containerId == "available-live-themes" || containerId == "available-favorite-themes") {
                $el.text(translate("options_tabs_item_buttons_active"));
                var $viewItem = $(this).parent().find(".av-content-view");
                if ($viewItem && !$viewItem.hasClass("active")) $viewItem.addClass("active");
                var $settingsItem = $(this).parent().parent().find(".av-content-img-settings");
                if ($settingsItem && !$settingsItem.hasClass("active")) $settingsItem.addClass("active");
                var $removeItem = $el.parent().parent().find(".av-content-img-delete");
                if ($removeItem) {
                    $("active-disabled").removeClass("active-disabled");
                    $removeItem.addClass("active").addClass("active-disabled");
                }
            }
            else if (containerId == "available-live-themes") {
                $el.text(translate("options_tabs_item_buttons_active_theme"));
            }
            var $downloadContainer = $el.parent().parent().find(".av-content-resolution-buttons");
            $downloadContainer.find("button").each(function () {
                var $item = $(this);
                var itemResolution = $item.attr("data-resolution");
                $item.removeClass("btn-success");
                if (message.currentVideoResolution == itemResolution) {
                    $item.addClass("btn-success");
                    $item.attr("is-active-resolution", true);
                    if (contentType == liveBackgroundType) $item.attr("title", getVideoThemeResolutionButtonTitle(itemResolution, true));
                }
                else {
                    if (!$item.hasClass("btn-primary")) $item.addClass("btn-primary");
                    $item.attr("is-active-resolution", false);
                    if (contentType == liveBackgroundType) $item.attr("title", getVideoThemeResolutionButtonTitle(itemResolution, false));
                }
            });
            if (containerId == "available-video-themes" || containerId == "available-flixel-backgrounds") {
                $downloadContainer.show();
            }
            $('[data-toggle="tooltip"]').tooltip('hide').tooltip('fixTitle');
        });
    });
    try {
        BACK.check(false, true);
    }
    catch (ex) {
        console.warn(ex);
    }
    //changeVideoBackgroundToOptionsPageFavorites(message);
}
/**
 * Set install button class
 *
 * @param $el
 * @param className
 * @returns {*}
 */
function setInstallButtonClass($el, className) {
    return $el.removeClass("btn-primary").removeClass("btn-danger").removeClass("btn-info").removeClass("btn-success").addClass(className);
}
/**
 * Display loading video theme error
 *
 * @param message Object
 */
function displayLoadingVideoThemeError(message) {
    var $popup = $("#current-theme-image-container");
    var $loading = $popup.find(".loading");
    var $progress = $(".squaresLoadingProgress");
    var $error = $(".squaresLoadingError");
    if ($progress.is(":visible")) $progress.hide();
    if (!$loading.is(":visible")) $loading.show();
    if (!$error.is(":visible")) $error.show();
    $error.find("#squaresLoadingError").text(message.errorMessage);
}
/**
 * Display loaded background video theme
 *
 * @param message Object
 */
function displayLoadedBackgroundVideoTheme(message) {
    var popup = $("#current-theme-image-container");
    var $progress = $(".squaresLoadingProgress");
    var $error = $(".squaresLoadingError");
    var $success = $(".squaresLoadingSuccess");
    popup.find(".loading").hide();
    $progress.find("#squaresLoadingProgress").text("0");
    $error.find("#squaresLoadingError").text("");
    if (!$success.is(":visible")) $success.fadeIn(350);
    setTimeout(function () {
        var $success = $(".squaresLoadingSuccess");
        if ($success.is(":visible")) $success.fadeOut(350);
    }, 2000);
}
/**
 * Add download in queue
 */
var maxDownloadQueue = 3;
localStorage.setItem('download-queue', 0);

function downloadQueueAdd() {
    var queue = parseInt(localStorage.getItem('download-queue') || 0);
    if (queue < maxDownloadQueue) {
        queue++;
        localStorage.setItem('download-queue', queue);
        //console.log(queue+' in queue');
        return queue;
    }
    else {
        $("#queue-over-dialog-text").text(String(translate("queue_over_dialog_text")).replace('#', queue));
        $("#queue-over-dialog").modal();
        return false;
    } //else
} //downloadQueueAdd
/**
 * Decrease download in queue
 */
function downloadQueueDecreaseClient() {
    var queue = parseInt(localStorage.getItem('download-queue') || 0);
    var setQueue = Math.max(--queue, 0);
    if ($ && $("#queue-over-dialog-text")) $("#queue-over-dialog-text").text(String(translate("queue_over_dialog_text")).replace('#', setQueue));
    localStorage.setItem('download-queue', setQueue);
}
/**
 * Add install resolution live background handler
 */
function addInstallResolutionLiveBackgroundHandler() {
    $(document).on("click", ".current-theme-download", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!downloadQueueAdd()) return false; //EXIT
        var $el = $(this);
        var isActiveResolution = $el.attr("is-active-resolution");
        isActiveResolution = isActiveResolution == "true";
        if (!isActiveResolution) {
            var themeId = $el.attr("data-theme");
            var resolution = $el.attr("data-resolution");
            var contentType = $el.attr("data-content-type");
            var elements = [];
            var $chainElements = null;
            elements.push($el);
            if (themeId) {
                var $contentTypeContainer = null;
                if (contentType == liveThemesType) $contentTypeContainer = $("#available-video-themes");
                else if (contentType == liveBackgroundType || contentType == flixelBackgroundType) $contentTypeContainer = $("#available-live-themes, #available-flixel-backgrounds");
                if ($contentTypeContainer) {
                    if (contentType == liveThemesType) {
                        $contentTypeContainer.find(".av-content-resolution-buttons").each(function () {
                            var $contentTypeResolutionsEl = $(this);
                            var $contentTypeResolutionsElContentId = $contentTypeResolutionsEl.attr("data-theme");
                            if ($contentTypeResolutionsElContentId == themeId) {
                                if (!$contentTypeResolutionsEl.is(":visible")) $contentTypeResolutionsEl.show();
                            }
                            else $contentTypeResolutionsEl.hide();
                        });
                    }
                    $chainElements = $contentTypeContainer.find(".current-theme-download[data-theme='" + themeId + "']");
                    if ($chainElements) {
                        var $chainElement = $chainElements.filter("[data-resolution='" + resolution + "']");
                        if ($chainElement) {
                            var $chainInstallBtn = $chainElement.parent().parent().find(".av-content-install");
                            if ($chainInstallBtn) {
                                if (contentType == liveThemesType) {
                                    elements.push($chainElement);
                                }
                                else if (contentType == liveBackgroundType || contentType == flixelBackgroundType) {
                                    var chainInstallIsActive = $chainInstallBtn.attr("data-content-active");
                                    chainInstallIsActive = chainInstallIsActive == "true";
                                    if (chainInstallIsActive) {
                                        elements.push($chainElement);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            $.each(elements, function (index, $currentButton) {
                var $downloadButtons = $currentButton.parent();
                $downloadButtons.find("button").each(function () {
                    var $downloadButton = $(this);
                    var eachDownloadButtonResolution = $downloadButton.attr("data-resolution");
                    $downloadButton.removeClass("btn-success");
                    if (!$downloadButton.hasClass("btn-primary")) $downloadButton.addClass("btn-primary");
                    $downloadButton.attr("is-active-resolution", false);
                    if (contentType != flixelBackgroundType) $downloadButton.attr("title", getVideoThemeResolutionButtonTitle(eachDownloadButtonResolution, false));
                });
                $currentButton.removeClass("btn-primary").addClass("btn-success");
                $currentButton.attr("is-active-resolution", true);
                if (contentType != flixelBackgroundType) $currentButton.attr("title", getVideoThemeResolutionButtonTitle(resolution, true));
                if (themeId && resolution) {
                    var $installButton = $currentButton.parent().parent().find(".av-content-install");
                    var $viewItem = $installButton.parent().find(".av-content-view");
                    if ($viewItem && $viewItem.hasClass("active")) $viewItem.removeClass("active");
                    var $settingsItem = $installButton.parent().parent().find(".av-content-img-settings");
                    if ($settingsItem && $settingsItem.hasClass("active")) $settingsItem.removeClass("active");
                    var $removeItem = $el.parent().parent().find(".av-content-img-delete");
                    if ($removeItem) {
                        $removeItem.removeClass("active-disabled");
                    }
                    $installButton.attr("data-content-current-click", true);
                    setInstallButtonClass($installButton, "btn-info");
                    $installButton.attr("data-content-downloading", true);
                    var outputTranslate = contentType == flixelBackgroundType ? translate("options_tabs_item_buttons_download_flixel") : translate("options_tabs_item_buttons_download");
                    $installButton.text(outputTranslate + "...");
                }
            });
            if (themeId && resolution) {
                var command = contentType == flixelBackgroundType ? "changeFlixerVideoBackground" : "applyResolutionVideoTheme";
                BRW_sendMessage({
                    "command": command
                    , "theme": themeId
                    , "resolution": resolution
                });
            }
        }
        $('[data-toggle="tooltip"]').tooltip('hide').tooltip('fixTitle');
    });
}
/**
 * Get video theme resolution title
 *
 * @param name String
 * @returns {string}
 */
function getVideoThemeResolutionTitle(name) {
    var result = "";
    switch (name) {
    case "640":
        result = "480p";
        break;
    case "1024":
        result = "720p";
        break;
    case "1920":
        result = "1080p";
        break;
    }
    return result;
}
/**
 * Get flixel theme resolution title
 *
 * @param name String
 * @param shortName Bool
 * @returns {string}
 */
function getFlixelThemeResolutionTitle(name, shortName) {
    var result = "";
    switch (name) {
    case "1280":
        result = "HD";
        break;
    case "1920":
        result = shortName ? "FHD" : "Full HD";
        break;
    }
    return result;
}
/**
 * Get video theme resolution title
 *
 * @param resolution String
 * @param isActive Bool
 * @returns {string}
 */
function getVideoThemeResolutionButtonTitle(resolution, isActive) {
    var additionalText = "";
    switch (resolution) {
    case "640":
        additionalText = translate("options_tabs_item_buttons_active_resolution_480p_live_bg");
        break;
    case "1024":
        additionalText = translate("options_tabs_item_buttons_active_resolution_720p_live_bg");
        break;
    case "1920":
        additionalText = translate("options_tabs_item_buttons_active_resolution_1080p_live_bg");
        break;
    }
    return additionalText;
}
/**
 * Get video theme resolution size
 *
 * @param theme Object
 * @param name String
 * @returns {string}
 */
function getVideoThemeResolutionSize(theme, name) {
    var result = "";
    var size = 0;
    if (typeof (theme['bgVideoSize']) != "undefined") {
        if (typeof (theme['bgVideoSize'][name]) != "undefined") {
            size = parseInt(theme['bgVideoSize'][name]);
            if (!isNaN(size)) {
                result = (size / 1024 / 1024).toFixed(2) + "Mb";
            }
        }
    }
    return result;
}

function getUploadedThemes() {
    var themes = localStorage.getItem("uploaded-themes-data") || "[]";
    return JSON.parse(themes);
}

function setUploadedThemes(themes) {
    localStorage.setItem("uploaded-themes-data", JSON.stringify(themes || []));
    return true;
}

function addToInstalledThemes(theme) {
    var themes = localStorage.getItem("installed-themes") || "{}";
    themes = JSON.parse(themes);
    if (!themes[theme.id]) themes[theme.id] = theme;
    localStorage.setItem("installed-themes", JSON.stringify(themes));
    return true;
}

function checkImageURL(url) {
    if (!url) return false;
    else var url = String(url);
    if (url.indexOf('://') == -1) return false;
    var ext = url.split('#').shift().split('?').shift().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'JPG', 'JPEG', 'PNG', 'GIF'].indexOf(ext) == -1) return false;
    return true;
}

function clearFileNameForTitle(src) {
    var name = String(src);
    name = name.split('/').pop().split('\\').pop().split('.').shift();
    name = name.replace('_', ' ').replace('-', ' ');
    return name;
}
/**
 * Add images upload button handler
 */
function addImagesUploadButtonHandler() {
    var $uploadDialog = $("#upload-image-dialog");
    var $uploadButton = $("#options-settings-images-upload");
    var $uploadApply = $uploadDialog.find("[type=submit]");
    var $uploadDialogTitle = $("#newImageTitle");
    $uploadButton.on('click', function (e) {
        $("#upload-image-dialog-progress").css("display", "none");
        $("#upload-image-dialog-apply").css("display", "block");
        $uploadDialog.find("input").attr("disabled", false).val('');
        $(".upload-image-dialog-error").css("display", "none");
        $uploadDialogTitle.attr("touched", "no");
        $uploadDialog.modal();
        //$uploadDialog.modal('hide');
    });
    $uploadDialogTitle.on("change", function () {
        if ($(this).attr("touched") != 'yes') $(this).attr("touched", "yes");
    });
    $("#upload-image-file, #newImageUrl").on("change", function () {
        changeTitleFromFileName($(this));
    });
    $("#upload-image-file, #newImageUrl").on("keyup", function () {
        changeTitleFromFileName($(this));
    });

    function changeTitleFromFileName(obj) {
        var src = obj.val();
        if (src && $uploadDialogTitle.attr("touched") != 'yes') {
            var title = String(clearFileNameForTitle(src));
            if (title.length > 45) title = title.substring(0, 45);
            $uploadDialogTitle.val(title);
        }
    }
    $uploadApply.on('click', function (e) {
        e.preventDefault();
        //e.stopPropagation();
        var formData = {
                title: $uploadDialog.find("#newImageTitle").val()
                , url: $uploadDialog.find("#newImageUrl").val()
                , file: $uploadDialog.find("#upload-image-file")[0].files[0]
            }
            //console.log(formData);
        $(".upload-image-dialog-error").css("display", "none");
        if (formData.title && ((formData.url && checkImageURL(formData.url)) || formData.file)) {
            $("#upload-image-dialog-apply").css("display", "none");
            $("#upload-image-dialog-progress").css("display", "block");
            $uploadDialog.find("input").attr("disabled", "disabled");
            uploadLocalImages(formData);
        }
        else { //need to add data
            if (!formData.title) $("#upload-image-dialog-error-title").css("display", "block");
            if (!(formData.url || formData.file)) $("#upload-image-dialog-error-file").css("display", "block");
            else if (formData.url && !checkImageURL(formData.url)) $("#upload-image-dialog-error-url").css("display", "block");
        }
    });
}

function uploadLocalImages(formData) {
    var themes = getUploadedThemes();
    var theme = {
        id: 'usr' + Date.now()
        , title: formData.title
        , downloadedByUser: 1
        , contentType: staticBackgroundType
        , hasDownloadedImage: true
        , bgFilePath: {
            1920: "file.jpg"
        }
        , bgVideoPath: {}
        , isFlixelContent: 0
        , author: ''
        , author_ur: ''
        , bgPoster: ''
        , fullHd: false
        , handmade: 0
    };
    if (formData.file) { //type=file
        theme['bgFilePath'][1920] = 'bgFile.' + String(formData.file.name).split('.').pop();
        var file = formData.file;
        var start = 0
            , stop = file.size - 1;
        var ext = String(file.name).toLocaleLowerCase().split('#').shift().split('?').shift().split('.').pop();
        var reader = new FileReader();
        reader.onloadend = function (evt) {
            if (evt.target.readyState == FileReader.DONE) { // DONE == 2
                //console.log(['Read bytes: ', start + 1, ' - ', stop + 1, ' of ', file.size, ' byte file'].join(''));
            }
        };
        var blob = file.slice(start, stop + 1);
        reader.readAsBinaryString(blob);
        getFileSystem(saveFile, {
            "path": getThemesFileSystemPath(theme.id)
            , "name": theme['bgFilePath'][1920]
            , "data": blob
            , "theme": theme
            , "resolution": 1920
            , "pageCallback": false
            , "download": true
            , "callback": function (url, data) {
                BRW_sendMessage({
                    command: "changeBackgroundImageFileLoadComplete"
                    , url: url
                    , data: data
                });
            }
        });
    }
    else if (formData.url) { //from url
        theme['bgFilePath'][1920] = 'bgFile.' + String(formData.url).split('.').pop().split('#').shift().split('?').shift() || 'jpeg';
        BRW_sendMessage({
            command: "loadBackgroundImageFromUser"
            , theme: theme
            , url: formData.url
        });
    }
    themes.unshift(theme);
    setUploadedThemes(themes);
    //BRW_sendMessage({command: "changeImageBackground", theme: theme});
    //localStorage.setItem('background-image-file', 'http://ukrautonews.com/wp-content/uploads/2015/07/1437304385_model-s-tesla.jpg');
    addToInstalledThemes(theme);
}

function downloadImageByUserComplete() {
    var $uploadDialog = $("#upload-image-dialog");
    
    $uploadDialog.modal('hide');
    
    if(typeof NAVI == "object" && NAVI.state.page.sub == "navi-bg-wallpapers"){
        updateAvailableThemesListOnPageLoad();
    }
    
    if (typeof PHOTO == "object" && PHOTO.Complete) {
        PHOTO.Complete();
    }
}
/**
 * Add images sort button handler
 */
function addImagesSortButtonHandler() {
    // Depricated for new settings
    /*
    var sort = getImagesSortType();
    
    //var $el = $(".options-settings-images-sort-item"); // Old Settings
    var $el = $(".nav-settings-images-sort > li"); // New Settings
    var $item = $el.filter("[data-sort=" + sort + "]");
    
    //if ($item) $item.addClass("active"); // Old Settings
    if(NAVI) NAVI.setTab($item);// New Settings
    
    if (sort == 0) { //gallery
        $("#options-settings-images-upload").css('display', 'none');
    } else if (sort == 1) { //your uploads
        $("#options-settings-images-upload").css('display', 'block');
    }

    $el.on("click", function () {
        var $el = $(this);
        var val = parseInt($el.attr("data-sort"));
        var currentSort = getImagesSortType();

        if (currentSort != val) {
            BRW_sendMessage({
                command: "setImagesSortType",
                val: val
            });
        } //if
    });
    */
}
/**
 * Add themes sort button handler
 */
function addThemesSortButtonHandler() {
    // Depricated for new settings
    /*
    //var $el = $(".options-settings-themes-sort-item"); // Old Settings
    var $el = $(".nav-settings-themes-sort > li, [nav=navi-bg-downloaded]"); // New Settings
    var $item = $el.filter("[data-sort=" + getThemesSortType() + "]");
    
    //if ($item) $item.addClass("active"); // Old Settings
    if(NAVI && $item.length) NAVI.setTab($item);// New Settings
        
    $el.on("click", function () {
        var $el = $(this);
        
        var val = parseInt($el.attr("data-sort"));
        
        if(!val){
            if($el.attr("nav") == "navi-bg-downloaded") val = 3;
        }
        
        
        var currentSort = getThemesSortType();
        if (currentSort != val) {
            BRW_sendMessage({
                command: "setThemesSortType",
                val: val
            });
        } //if
    });
    */
}
/**
 * Add live themes sort button handler
 */
function addLiveThemesSortButtonHandler() {
    // Depricated for new settings
    /*
    //var $el = $(".options-settings-live-themes-sort-item"); // Old Settings
    var $el = $(".nav-settings-live-themes-sort > li"); // New Settings
    
    var $item = $el.filter("[data-sort=" + getLiveThemesSortType() + "]");
    
    //if ($item) $item.addClass("active"); // Old Settings
    if(NAVI) NAVI.setTab($item);// New Settings
    
    $el.on("click", function () {
        var $el = $(this);
        var val = parseInt($el.attr("data-sort"));
        var currentSort = getLiveThemesSortType();

        if (currentSort != val) {
            BRW_sendMessage({
                command: "setLiveThemesSortType",
                val: val
            });
        } //if
    });
    */
}
var srchThemes;

function setVisibleElementsBySortType(val, tab) {
    if (typeof val == "undefined") val = localStorage.getItem('themes-sort-type') || 2;
    if (typeof tab == "undefined") tab = localStorage.getItem('settings-background-current-tab') || 0;
    if (tab == 0) { //flixels tab
        switch (parseInt(val)) {
        case 2: //featured themes
            $('#load-more-content-container').css({
                display: 'none'
            });
            //$('.random-themes-container').css({display:'none'});
            showThemesDisableDial();
            break;
        case 0:
        case 1: //newsest & popular themes
            $('#load-more-content-container').css({
                display: 'block'
            });
            //$('.random-themes-container').css({display:'none'});
            //localStorage.setItem("flixel-themes-current-page", '1');
            showThemesDisableDial();
            break;
        case 3: //downloaded themes
            $('#load-more-content-container').css({
                display: 'none'
            });
            //$('.random-themes-container').css({display:'block'});
            showThemesDisableDial();
            break;
        case 4: //search themes
            $('#load-more-content-container').css({
                display: 'none'
            });
            //$('.random-themes-container').css({display:'none'});
            /* //Old Settings
            if(typeof srchThemes != "object"){
                srchThemes = new themesSearch();
                srchThemes.init();
            }
            */
            hideThemesDisableDial();
            break;
        } //switch
    }
    else { //others tabs
        $('#load-more-content-container').css({
            display: 'block'
        });
        //$('.random-themes-container').css({display:'none'});
        showThemesDisableDial();
    }
    if (typeof srchThemes != "object") { // New Settings
        srchThemes = new themesSearch();
        srchThemes.init();
    }
}
/**
 * Show themes disable dial
 */
function showThemesDisableDial() {
    $('.hide-first-av-content').removeClass('hide-first-av-content');
}
/**
 * Hide themes disable dial
 */
function hideThemesDisableDial() {
    $('.available-themes-block').addClass('hide-first-av-content');
}
/**
 * Disable image button
 */
function addDisableImageButtonHandler() {
    $(document).on("click", "#disable-current-image", function () {
        BRW_sendMessage({
            command: "disableCurrentImage"
        }, function (response) {
            clearInstallContentButtons(staticBackgroundType);
            $('[data-toggle="tooltip"]').tooltip('hide').tooltip('fixTitle');
        });
    });
}
/**
 * Disable video button
 */
function addDisableVideoButtonHandler() {
    $(document).on("click", "#disable-current-video, #disable-current-flixel", function () {
        BRW_sendMessage({
            command: "disableCurrentVideo"
        }, function (response) {
            $(".current-theme-download").each(function () {
                var $el = $(this);
                var eachElResolution = $el.attr('data-resolution');
                if ($el.hasClass("btn-success")) $el.removeClass("btn-success");
                if (!$el.hasClass("btn-primary")) $el.addClass("btn-primary");
                $el.attr("title", getVideoThemeResolutionButtonTitle(eachElResolution, false));
            });
            clearInstallContentButtons(liveBackgroundType);
            clearInstallContentButtons(flixelBackgroundType);
            $(".av-content-resolution-buttons").hide();
            var clockType = parseInt(localStorage.getItem("page-clock-type"));
            if (isNaN(clockType)) setClockColorScheme(getClockColorsObject());
            $('[data-toggle="tooltip"]').tooltip('hide').tooltip('fixTitle');
        });
    });
}
/**
 * Add update available theme handler
 */
function addUpdateAvailableThemesHandler() {
    $(document).on("click", "#available-themes-update", function (e) {
        e.preventDefault();
        $("#available-themes").find(".tab-content").slideUp(500, function () {
            BRW_sendMessage({
                command: "updateAvailableThemesList"
            }, function (response) {
                getAvailableThemes(response, displayAvailableThemesList);
            });
        });
    });
}
/**
 * Display available themes list
 */
function displayAvailableThemesList() {
    hideTabContentLoader();
    var $moreBackgroundsBtn = $("#load-more-flixel-content");
    $moreBackgroundsBtn.html("<span class='glyphicon glyphicon-globe more-flixel-content-img' aria-hidden='true'></span><span class='more-flixel-content-text'>" + translate("options_tabs_content_flixer_load_button") + "</span>");
    $('[data-toggle="tooltip"]').tooltip('hide').tooltip('fixTitle');
    $("#available-themes").find(".tab-content").slideDown(500);
}
/**
 * Add install content button handler
 */
function addInstallContentButtonHandler() {
    $(document).on("click", ".av-content-install", function (e) {
        e.preventDefault();
        var $el = $(this);
        var href = $el.attr("href");
        var contentType = $el.attr("data-content-type");
        var contentActive = $el.attr("data-content-active");
        var contentTheme = $el.attr("data-content-theme");
        contentActive = contentActive == "true";
        if (browserName() == "chrome" && contentType == liveThemesType && !contentActive) {
            $(".av-content-install[data-wait=install]").attr("data-wait", false);
            $el.attr("data-wait", "install");
            BRW_sendMessage({
                command: "openInstallThemeTab"
                , url: href
            });
        }
        else if (contentType == liveBackgroundType || contentType == staticBackgroundType || contentType == flixelBackgroundType) {
            installThemeNow($el);
        } //else if
        $('[data-toggle="tooltip"]').tooltip('hide').tooltip('fixTitle');
    });
}

function installThemeNow($el) {
    if (!$el) var $el = $(".av-content-install[data-wait=install]:eq(0)");
    if (!$el || !$el.length) return;
    var href = $el.attr("href");
    var contentType = $el.attr("data-content-type");
    var contentDownloading = $el.attr("data-content-downloading");
    var contentInstalled = $el.attr("data-content-installed");
    var contentActive = $el.attr("data-content-active");
    var contentTheme = $el.attr("data-content-theme");
    contentActive = contentActive == "true";
    contentDownloading = contentDownloading == "true";
    contentInstalled = contentInstalled == "true";
    var $resolutionButtons;
    var installContentText = translate("options_tabs_item_buttons_install");
    if (contentType == flixelBackgroundType) installContentText = translate("options_tabs_item_buttons_install_flixer");
    var selectQualityText = translate("options_tabs_item_buttons_install_select_quality");
    if (!contentActive) {
        if (!contentDownloading) {
            $el.attr("data-content-current-click", true);
            if (contentType == liveBackgroundType || contentType == flixelBackgroundType || contentType == liveThemesType) {
                //$("#available-video-themes, #available-flixel-backgrounds, #available-live-themes").find(".av-content-resolution-buttons").hide();
                $("#available-video-themes, #available-flixel-backgrounds, #available-live-themes, #available-favorite-themes").find(".av-content-resolution-buttons").hide();
                $("#available-live-themes").find(".av-content-install[data-content-theme!='" + contentTheme + "']").each(function () {
                    var $resolutionButtons = $(this).parent().parent().find(".av-content-resolution-buttons");
                    $resolutionButtons.find("button").each(function () {
                        var $button = $(this);
                        if ($button.hasClass("btn-success")) {
                            $button.attr("is-active-resolution", false);
                            $button.removeClass("btn-success");
                        }
                        if (!$button.hasClass("btn-primary")) {
                            $button.addClass("btn-primary");
                        }
                    });
                });
                $("#available-live-themes").find(".av-content-install[data-content-theme='" + contentTheme + "']").parents(".av-content-container").find(".av-content-resolution-buttons").css("display", "block");
                if (contentInstalled) {
                    var command = (contentType == liveBackgroundType) ? "changeVideoBackground" : "changeFlixerVideoBackground";
                    BRW_sendMessage({
                        command: command
                        , theme: contentTheme
                    });
                    setDownloadingButtonState($el, contentType);
                }
                else {
                    $resolutionButtons = $el.parent().parent().find(".av-content-resolution-buttons");
                    $resolutionButtons.show();
                    clearSelectQualityButtonText(installContentText, selectQualityText);
                    $el.text(selectQualityText);
                }
            }
            else if (contentType == staticBackgroundType) {
                //console.log(contentTheme);
                BRW_sendMessage({
                    command: "changeImageBackground"
                    , theme: contentTheme
                });
                setDownloadingButtonState($el, contentType);
            }
        }
    }
    else {
        if (contentType == liveBackgroundType || contentType == flixelBackgroundType || contentType == liveThemesType) {
            $("#available-video-themes, #available-flixel-backgrounds, #available-favorite-themes").find(".av-content-resolution-buttons").hide();
            var $itemResolutionContainer = $el.parent().parent().find(".av-content-resolution-buttons");
            $itemResolutionContainer.show();
            clearSelectQualityButtonText(installContentText, selectQualityText);
        }
    }
} //
/**
 * Add settings button click handler
 */
function addSettingsContentButtonHandler() {
    $(document).on("click", ".av-content-img-settings", function (e) {
        e.preventDefault();
        openUrlInNewTab(extensionGetUrl("/pages/options/settings.html"));
    });
}
/**
 * Clear select quality button text
 *
 * @param installContentText String
 * @param selectQualityText String
 */
function clearSelectQualityButtonText(installContentText, selectQualityText) {
    $(".av-content-install").each(function () {
        var $installEl = $(this);
        if ($installEl.text() == selectQualityText) $installEl.text(installContentText);
    });
}
/**
 * Set downloading button state
 *
 * @param $el jQuery element
 * @param contentType Int
 */
function setDownloadingButtonState($el, contentType) {
    if (contentType == liveBackgroundType || contentType == flixelBackgroundType || contentType == liveThemesType) clearInstallContentButtons(contentType);
    setInstallButtonClass($el, "btn-info");
    $(".av-content-install").attr("data-content-downloading", false);
    $el.attr("data-content-downloading", true);
    if (contentType == flixelBackgroundType) $el.text(translate("options_tabs_item_buttons_download_flixel") + "...");
    else $el.text(translate("options_tabs_item_buttons_download") + "...");
}
/**
 * Clear install content buttons
 *
 * @param contentType Int
 */
function clearInstallContentButtons(contentType) {
    //var $activeDataContainer = $(".available-themes-block[data-container-content-type=" + contentType + "]");
    var $activeDataContainer = $(".available-themes-block");
    $activeDataContainer.find(".av-content-install").each(function () {
        var text = "";
        var $item = $(this);
        $item.removeClass("btn-success");
        var isInstalled = $item.attr("data-content-installed");
        isInstalled = isInstalled && isInstalled == "true";
        if (isInstalled) {
            text = translate("options_tabs_item_buttons_enable");
            $item.removeClass("btn-danger");
            if (!$item.hasClass("btn-primary")) $item.addClass("btn-primary");
        }
        else {
            text = translate("options_tabs_item_buttons_install");
            if (contentType == flixelBackgroundType) text = translate("options_tabs_item_buttons_install_flixer");
            $item.removeClass("btn-primary");
            if (!$item.hasClass("btn-danger")) $item.addClass("btn-danger");
        }
        $item.text(text);
    });
    $activeDataContainer.find("a[data-content-downloading='true']").each(function () {
        var $item = $(this);
        $item.attr("data-content-downloading", false);
        $item.removeClass("btn-info");
    });
    $activeDataContainer.find("a[data-content-active='true']").each(function () {
        var $item = $(this);
        $item.attr("data-content-active", false);
        $item.removeClass("btn-success");
        var $viewItem = $item.parent().find(".av-content-view");
        if ($viewItem && $viewItem.hasClass("active")) $viewItem.removeClass("active");
        var $settingsItem = $item.parent().parent().find(".av-content-img-settings");
        if ($settingsItem && $settingsItem.hasClass("active")) $settingsItem.removeClass("active");
        var $removeItem = $item.parent().parent().find(".av-content-img-delete");
        if ($removeItem) {
            $removeItem.removeClass("active-disabled");
        }
    });
    if (contentType == staticBackgroundType) {
        $activeDataContainer.find(".av-content-img-settings.active").each(function () {
            $(this).removeClass("active");
        });
    }
}
/**
 * Display tab content loader
 */
function displayTabContentLoader() {
    var $el = $("#tab-content-loader");
    var nextUpdate, currentTime = new Date().getTime();
    var currentTab = getSettingsBackgroundTabId();
    if (currentTab == 0) {
        nextUpdate = localStorage.getItem("flixel-themes-data-next-update");
        if (!nextUpdate || nextUpdate < currentTime)
            if (!$el.is(":visible")) $el.show();
    }
    else if (currentTab == 1) {
        nextUpdate = localStorage.getItem("available-themes-data-next-update");
        if (!nextUpdate || nextUpdate < currentTime)
            if (!$el.is(":visible")) $el.show();
    }
}
/**
 * Hide content loader
 */
function hideTabContentLoader() {
    var $el = $("#tab-content-loader");
    if ($el.is(":visible")) $el.fadeOut(100);
    else $el.hide();
}
/**
 * Update available themes list
 */
function updateAvailableThemesListOnPageLoad() {
    //window.postMessage("Message from content script","*");
    //console.debug(UPDListener);
    if (typeof UPDListener != "undefined" && UPDListener === false) return;
    var startDate = Date.now();
    naviRenderID = startDate * 1;
    var $waiter = $(".navi-themes").addClass("wait-for-themes").html("");
    BRW_sendMessage({
        command: "updateAvailableThemesList"
    }, function (availableThemesResponse) {
        BRW_sendMessage({
            command: "updateFlixelThemesList"
        }, function () {
            if (naviRenderID != startDate) return;
            getAvailableThemes(availableThemesResponse, displayAvailableThemesList);
            $waiter.removeClass("wait-for-themes");
            /*
            getInterestingTheme(function(interestTheme){
                getAvailableThemes(availableThemesResponse, displayAvailableThemesList, interestTheme); 
            });
            */
        });
    });
}
/**
 * Add restore default handler
 */
function addRestoreDefaultThemeHandler() {
    $(document).on("click", "#open-chrome-settings-url", function (e) {
        e.preventDefault();
        chrome.tabs.create({
            url: 'chrome://settings/'
        });
    });
    $(document).on("click", "#restore-default-theme-dialog-body", function (e) {
        e.preventDefault();
        openUrlInNewTab($(this).find("#restore-default-theme-description").attr("src"));
    });
}
/**
 * Add background view button handler
 */
function addSettingsBackgroundViewButtonHandler() {
    $(document).on("click", ".av-content-view", function (e) {
        e.preventDefault();
        if (getRandomThemesDisplay()) setDisplayCurrentBackgroundFile();
        openUrlInNewTab(extensionGetUrl("/pages/newtab/newtab.html"));
    });
}
/**
 * Display settings background tabs
 */
function displaySettingsBackgroundTabs() {
    var $tabButton = $(".settings-background-tab-button[data-settings-tabid=" + getSettingsBackgroundTabId() + "]");
    $tabButton.tab('show');
    addSelectedTxt();
    blinkActiveSortType();
}
/**
 * Add settings background tabs button click handler
 */
function addSettingsBackgroundTabsButtonHandler() {
    // Depricated for new settings
    /*
    $(document).on("click", ".settings-background-tab-button", function (e) {
        var $el = $(this);

        BRW_sendMessage({
            command: "changeSettingsBackgroundCurrentTab",
            tabid: $el.attr("data-settings-tabid")
        });

    });
    */
}

function redrawElements() {
    setTimeout(function () {
        blinkActiveSortType();
        setVisibleElementsBySortType();
        trimGallery();
    }, 150);
}
/**
 * Active sort type button blinking
 */
function blinkActiveSortType() {
    var $actives = $(".options-settings-themes-sort-item, .options-settings-live-themes-sort-item, .options-settings-images-sort-item").filter('.active');
    var color = {
        's': "#449d44"
        , 'b': "#b2fe08" //"#4CE6DD"
    };
    var speed = 250;
    $actives.each(function () {
        $(this).stop(true, true).css({
            "background-color": color.s
        }).animate({
            "opacity": 1
        }, 500).animate({
            "background-color": color.b
        }, speed).animate({
            "background-color": color.s
        }, speed).animate({
            "background-color": color.b
        }, speed).animate({
            "background-color": color.s
        }, speed).animate({
            "background-color": color.b
        }, speed).animate({
            "background-color": color.s
        }, speed);
    });
}
/**
 * Add (selected) txt to active button
 */
function addSelectedTxt() {
    /* // Depricated for new settings
    $tabButton = false;

    if (localStorage.getItem("background-image-file")) {
        //Image
        $tabButton = $("#available-image-themes-button");

    } else if (localStorage.getItem("background-video-file")) {
        if (localStorage.getItem("background-video-content-type") == 1) {
            //Video
            $tabButton = $("#available-video-themes-button");
        } else if (localStorage.getItem("background-video-content-type") == 4) { //live-theme
            $tabButton = $("#available-live-themes-button");
        } else { //3
            //Flixel
            $tabButton = $("#available-flixel-themes-button");
        } //else
    } else {
        //None
        $tabButton = $("#available-flixel-themes-button");
    } //else
    
    //$(".navi-item.selected").removeClass("selected");
    //$tabButton.addClass("selected"); //$(".selectedTxt"));
    */
}
/**
 * Add load more flixel content button handler
 */
function addLoadMoreFlixelContentButtonHandler() {
    $("#load-more-flixel-content").on("click", loadMoreFlixelContentButtonHandler);
}
/**
 * Load more flixer content button handler
 */
function loadMoreFlixelContentButtonHandler() {
    hideAllPageTooltips();
    if (getShareAppStatus() || (AUTH && AUTH.isPremium())) {
        loadMoreFlixelContent($(this));
    }
    else {
        var $popup = $("#share-app-dialog");
        $popup.on('hide.bs.modal', function () {
            if (!getShareAppStatus()) BRW_sendMessage({
                command: "setShareAppStatus"
            });
            loadMoreFlixelContent($("#load-more-flixel-content"));
            var $shareTopContainer = $("#share42init-top");
            if (!$("#shareTopContainer").is(":visible")) $shareTopContainer.fadeIn();
            if (!getShareGaEventStatus()) {
                sendToGoogleAnaliticMP(function () {
                    gamp('send', 'event', 'flixel', 'share', '', 0);
                });
                setShareGaEventStatus();
            }
        });
        $popup.modal();
    }
}
/**
 * Load more flixel content
 *
 * @param $button jQuery element
 */
function loadMoreFlixelContent($button) {
    $button.off("click", loadMoreFlixelContentButtonHandler);
    var $icon = $button.find(".glyphicon");
    if ($icon && !$icon.hasClass("rotating")) $icon.addClass("rotating");
    
    BRW_sendMessage({
        command: "loadMoreFlixelContentBackend"
    });
}
/**
 * Hide tooltip fix
 */
function addTooltipsHideFix() {
    $(document).on("mouseleave", ".current-theme-download, .av-content-install, .av-content-restore", hideAllPageTooltips);
    $(document).on("mouseleave", ".installed-item-budge, .av-content-view, .load-more-flixel-content", hideAllPageTooltips);
    $(document).on("mouseleave", ".random-themes-display-label", hideAllPageTooltips).on("focusout", ".options-settings-random-themes-enable-notice", hideAllPageTooltips);
}
/**
 * Hide page all tooltips
 */
function hideAllPageTooltips() {
    $('[data-toggle="tooltip"]').tooltip('hide');
}
/**
 * Update available themes on search
 */
function updateAvailableThemesListOnSearch(query) {
    var query = String(query);
    var $waiter = $(".navi-themes").addClass("wait-for-themes").html("");
    var $found = $(".search-themes-found").addClass("hide");
    var startDate = Date.now();
    naviRenderID = startDate * 1;
    if (query.length) {
        BRW_sendMessage({
            command: "updateAvailableThemesList"
            , search: query
        }, function (availableThemesResponse) {
            BRW_sendMessage({
                command: "updateFlixelThemesList"
            }, function () {
                if (naviRenderID != startDate) return;
                getAvailableThemes(availableThemesResponse, displayAvailableThemesList);
                setTimeout(() => {
                    $waiter.removeClass("wait-for-themes");
                    var response = JSON.parse(localStorage.getItem("flixel-themes-data"));
                    //console.debug(response.results.length, response.results);
                    if (response.results.length == 0) {
                        $found.removeClass("hide").text(translate("search_no_themes_found"));
                    }
                    else {
                        $found.removeClass("hide").text(translate("search_themes_found").replace('[N]', response.results.length));
                    }
                }, 150);
            });
        });
    }
}

function themesSearch(data) {
    var myself = this;
    myself.searchBlock = $('#themes-search-form-wrap');
    myself.form = myself.searchBlock.find('#themes-search-form');
    myself.input = myself.searchBlock.find('#themes-search-text');
    myself.button = myself.searchBlock.find('#themes-search-submit');
    myself.list = myself.searchBlock.find('#themesSearchList');
    myself.input.focus();
    $('body').on('click', function () {
        myself.list.css("display", "none");
    });
    myself.last = '';
    myself.xhr = null;
    myself.actions = {
            "themes": {
                //hintUrl: "http://parallaxnewtab.com/api/getComplexThemesSettings?tsort=1&count=6&top=1&search={query}",
                hintUrl: "http://parallaxnewtab.com/api/getComplexFlixelThemes?tsort=1&count=6&top=1&flixel_status_ignore=1&search={query}"
                , parser: function (r) {
                    return JSON.parse(r);
                }
                , getArray: function (obj) {
                    var arr = [];
                    if (obj && obj.results) {
                        for (var k in obj.results) {
                            arr.push(obj.results[k].title);
                        }
                    } //if
                    return arr;
                }
            }
        }
        // Init actions
    this.init = function () {
            myself.input.focus();
            /*
            myself.id  = id;  // unique searcher ID
            myself.obj = obj; // dial object
            */
            myself.system = "themes"; //search system
            myself.form.on("submit", function (e) {
                e.preventDefault();
                //myself.handleSubmit();
            });
            myself.button.on("click", function (e) {
                if (myself.list.find("li.active").length) var text = myself.list.find("li.active").text();
                else var text = myself.input.val()
                myself.handleSubmit(true, text);
            });
            for (let key in myself.actions) {
                if (myself.system.indexOf(key) > -1) {
                    myself.current = myself.actions[key]; //current search system actions
                    break;
                } //if
            } //for
            myself.input.on("keyup", function (e) {
                e.preventDefault();
                e.stopPropagation();
                switch (e.keyCode) {
                case 13: //enter
                    if (myself.list.find("li.active").length) var text = myself.list.find("li.active").text();
                    else var text = myself.input.val()
                    myself.handleSubmit(true, text);
                    break;
                case 37:
                case 38: //up
                    myself.dropDownNav('up')
                    break;
                case 39:
                case 40: //down
                    myself.dropDownNav('down');
                    break;
                default:
                    myself.modalHint();
                } //switch
            });
        }, //init
        this.handleSubmit = function (dropdown, text) {
            if (myself.id != myself.input.attr("search-id")) return false;
            if (myself.xhr) myself.xhr.abort();
            //var drop  =  myself.list.find("li.active");
            //if(drop && drop.text()) 
            if (text && myself.input.val() != text) myself.input.val(text);
            myself.list.css("display", "none").find("li").remove();
            var query = myself.input.val() || text;
            //console.log(query);
            query = String(query).trim();
            query = query.split("'").join("`").split('"').join("`").split("`");
            if (query[1] && query[1].length > query[0].length) query = query[1];
            else query = query[0];
            //console.debug( query );
            if (query.length) {
                updateAvailableThemesListOnSearch(encodeURIComponent(query));
                myself.list.css("display", "none");
                //window.location = myself.current.search+'?q='+encodeURIComponent(String(query).trim());
            } //if
        }
        , this.dropDownNav = function (dir) {
            if (myself.id != myself.input.attr("search-id")) return false;
            var list = myself.list.find("li");
            var count = list.length;
            if (count) {
                var n = 0
                    , cur = -1;
                list.each(function () {
                    if ($(this).hasClass('active')) cur = n;
                    n++;
                });
                if (dir == 'down') {
                    if (cur < count - 1) {
                        list.removeClass('active');
                        $(list[++cur]).addClass('active');
                    }
                }
                else if (dir == 'up') {
                    list.removeClass('active');
                    if (cur > 0) {
                        $(list[--cur]).addClass('active');
                    }
                } //else if
            } //if
        }
        , this.modalHint = function () {
            var query = myself.input.val().trim();
            if (!query.length) { //reset datalist
                myself.list.css("display", "none").find("li").remove();
            }
            else if (query != myself.last) {
                myself.last = query;
                if (myself.xhr) myself.xhr.abort();
                var url = myself.current.hintUrl.replace('{query}', encodeURIComponent(query)).replace('{lang}', encodeURIComponent(navigator.language));
                //console.log(url);
                myself.xhr = BRW_ajax(url, function (response) { //successFunction
                        var searchResponse = myself.xhr.responseText;
                        searchResponse = myself.current.parser(searchResponse);
                        response = myself.current.getArray(searchResponse);
                        //console.log(searchResponse); console.log(response);
                        var keys = []
                            , elements = [];
                        for (let key in response)
                            if (keys.indexOf(response[key]) === -1) {
                                keys.push(response[key]);
                                elements.push($("<li>").text(response[key]));
                                if (key == 5) break; //dropdown limit
                            } //for
                        if (elements.length) {
                            myself.list.css("display", "block").html(elements);
                            myself.list.find('li').on('click', function () {
                                myself.list.find('.active').removeClass('active');
                                $(this).addClass('active');
                                myself.handleSubmit(true, $(this).text());
                            });
                        }
                        else myself.list.css("display", "none").find("li").remove();
                    }, //successFunction
                    false, {
                        'text': true
                    });
            } //if
        }
    return this;
} //function setDials()
function getInterestingTheme(callback) {
    var installDate = localStorage.getItem("install-key");
    var nowDate = new Date;
    nowDate = nowDate.getTime();
    if (
        //((nowDate - installDate) < 10000) && //COMMENT!!!!!!!!!!!!!!!!
        !localStorage.getItem("install-interesting-theme")) {
        BRW_historyItems(function (visitedURLs) {
                var themeId = false;
                for (var k in visitedURLs) {
                    var url = String(visitedURLs[k].url);
                    //url = "http://livestartpage.com/themes/world-of-worcraft-III?theme_id=ed339a2bd0f76c8cfe0063f3a1e52f56";
                    //b27e410768f70fd20504bae6beb4e371";//5e7eb99a3f84d435f24594b6ef7472d9"//ed339a2bd0f76c8cfe0063f3a1e52f56;//DELETE ME!!!!!!!!!!!!!!!!
                    if (url.indexOf("livestartpage.com/themes") > -1) {
                        var u = new URL(url);
                        if (u.search) {
                            var params = String(u.search.replace('?', '')).split('&');
                            for (var k2 in params) {
                                var v2 = params[k2].split('=');
                                if (v2[0] == 'theme_id') {
                                    themeId = v2[1];
                                } //if
                            } //for
                        } //if
                        if (themeId) break;
                    } //if
                } //for
                if (themeId) {
                    loadFrontThemeConfig(themeId, function (themeData) {
                        localStorage.setItem("install-interesting-theme", themeId);
                        //console.log("themeData", themeData);
                        var flixelThemesData = localStorage.getItem("flixel-themes-display-data");
                        var flixelThemes = JSON.parse(flixelThemesData);
                        var newThemesData = [];
                        //console.info(2, themeData);
                        //console.log(1, flixelThemes);
                        if (themeData) {
                            themeData.handmade = 1;
                            themeData.contentType = 3;
                            themeData.bgPoster = getFullThemesContentUrl(themeData.id, themeData.bgPoster);
                            themeData.bgFileThumb = getFullThemesContentUrl(themeData.id, themeData.bgFileThumb);
                            themeData.bgVideoThumb = getFullThemesContentUrl(themeData.id, themeData.bgVideoThumb);
                            themeData.bgVideoPath['640'] = getFullThemesContentUrl(themeData.id, themeData.bgVideoPath['640']);
                            themeData.bgVideoPath['1024'] = getFullThemesContentUrl(themeData.id, themeData.bgVideoPath['1024']);
                            themeData.bgVideoPath['1920'] = getFullThemesContentUrl(themeData.id, themeData.bgVideoPath['1920']);
                        } //if
                        for (var k3 in flixelThemes.results) {
                            if (flixelThemes.results[k3].id == themeId) {
                                themeData = flixelThemes.results[k3];
                            }
                            else newThemesData.push(flixelThemes.results[k3]);
                        } //for
                        flixelThemes.results = [].concat([themeData], newThemesData);
                        //console.log(3, flixelThemes);
                        //console.log(4, themeData);
                        localStorage.setItem("flixel-themes-data", JSON.stringify(flixelThemes));
                        localStorage.setItem("flixel-themes-display-data", JSON.stringify(flixelThemes));
                        callback(themeData);
                        /*
                        var url = extensionGetUrl("/pages/newtab/newtab.html");
                        openUrlInCurrentTab(url);
                        */
                    });
                }
                else {
                    callback(false);
                } //else
            } //function
        );
    }
    else {
        callback(false);
    } //else
} //function installInterestingTheme()
function trimGalleryListener() {
    window.onresize = trimGallery;
}
var TRIMMING = false;

function trimGallery() {
    if (TRIMMING) return;
    else TRIMMING = true;
    if (getThemesSortType() === 3) return;
    setTimeout(() => {
        TRIMMING = false;
    }, 100);
    var wraps = [
        $("#available-flixel-backgrounds")
    ];
    for (var k in wraps) {
        var $wrap = $(wraps[k]);
        $wrap.find(".av-content-container").removeClass("hide");
        var width = $wrap.width();
        if (width < 300) continue;
        var count = $wrap.find(".av-content-container").length;
        var line = Math.floor(width / 294);
        var full = Math.floor(count / line);
        var trim = count - full * line;
        if (count > 20 && trim && trim > 0) {
            $wrap.find(".av-content-container:gt(" + (full * line - 1) + ")").addClass("hide");
        }
    } //for
}