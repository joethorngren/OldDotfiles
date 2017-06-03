/**
 * Application options page
 */

    var favoriteTabId;

    $(function() {
        BRW_langLoaded(function(){
            displayActiveOptionsTab(2);

            getFavoriteCurentTab(function() {
                updateAvailableThemesListOnPageLoad();

                addInstallContentButtonHandler();
                addSettingsContentButtonHandler();
                addInstallResolutionLiveBackgroundHandler();
                addSettingsBackgroundViewButtonHandler();
                addToggleFavoriteStateButtonHandler();
                addToggleShowThemesRandomStateButtonHandler();
                addRemoveInstalledTheme();

                addTooltipsHideFix();
                
                sendToGoogleAnaliticMP(function() {                    
                    //gamp('send', 'event', 'visit', 'gallery', label, value);
                    gamp('send', 'event', 'visit', 'favorite', false, false);
                });
            });
        });
        
        randomizeButtonHandler();
    });

    function randomizeButtonHandler(){
        $(".randomize-backgrounds-button").on("click", function(){
            $(".randomize-backgrounds-button").fadeOut("normal", function(){
                $(".randomize-backgrounds-body").fadeIn();
            });
        });
    }

    /**
     * Get favorite current tab
     */
    /*Moved to brovser choiser*/
    function getFavoriteCurentTab(callback) {
         BRW_getFavoriteCurentTab(callback);
    }

    /**
     * Get available themes
     *
     * @param response Object
     * @param callback Function
     */
    function getAvailableThemes(response, callback) {
        var themesList = {};
        var installedTheme = null;
        var installedThemes = response.installedThemes, i, j;
        var currentContent = {
            "currentImage" : response.currentImage,
            "currentImageResolution" : response.currentImageResolution,
            "currentVideo" : response.currentVideo,
            "currentVideoResolution" : response.currentVideoResolution,
            "currentTheme" : response.currentThemeId,
            "videoContentAvailableResolutions" : response.videoContentAvailableResolutions,
            "flixelContentAvailableResolutions" : response.flixelContentAvailableResolutions
        };

        var favoriteThemes = getFavoriteThemesObject();
        if(getArrayLength(favoriteThemes)) {
            themesList = [];
            for(i in favoriteThemes) {
                var favoriteTheme = favoriteThemes[i];

                favoriteTheme['installed'] = false;
                favoriteTheme['hasDownloadedImage'] = false;
                favoriteTheme['hasDownloadedVideo'] = false;
                favoriteTheme['handmade'] = favoriteTheme.handmade ? true : false;

                for(j in installedThemes) {
                    installedTheme = installedThemes[j];
                    if(favoriteTheme['id'] == installedTheme['id']) {
                        if(favoriteTheme['contentType'] == liveThemesType || favoriteTheme['contentType'] == liveBackgroundType || favoriteTheme['contentType'] == staticBackgroundType) {
                            favoriteTheme['installed'] = true;
                            favoriteTheme['hasDownloadedImage'] = (installedTheme.bgFilePath && getArrayLength(installedTheme.bgFilePath)) ? true : false;
                            favoriteTheme['hasDownloadedVideo'] = (installedTheme.bgVideoPath && getArrayLength(installedTheme.bgVideoPath)) ? true : false;
                            break;
                        } else if(favoriteTheme['contentType'] == flixelBackgroundType) {
                            favoriteTheme['installed'] = true;
                            favoriteTheme['hasDownloadedVideo'] = (installedTheme.bgVideoPath && getArrayLength(installedTheme.bgVideoPath)) ? true : false;
                            break;
                        }
                    }
                }
                favoriteTheme['favorite'] = checkThemeIsFavorite(favoriteTheme, favoriteThemes);

                if(favoriteTheme['contentType'] == liveThemesType && typeof (favoriteTheme['bgVideoPath']) != "undefined" && typeof (favoriteTheme['bgFilePath']) != "undefined")
                    themesList.push(favoriteTheme);

                if((favoriteTheme['contentType'] == liveBackgroundType || favoriteTheme['contentType'] == liveThemesType) && typeof (favoriteTheme['bgVideoPath']) != "undefined")
                    themesList.push(favoriteTheme);

                if((favoriteTheme['contentType'] == staticBackgroundType || favoriteTheme['contentType'] == liveThemesType) && typeof (favoriteTheme['bgFilePath']) != "undefined")
                    themesList.push(favoriteTheme);

                if(favoriteTheme['contentType'] == flixelBackgroundType && typeof (favoriteTheme['bgVideoPath']) != "undefined")
                    themesList.push(favoriteTheme);
            }

            var $contentContainer = $("#available-favorite-themes").html('');

            themesList = sortByActiveContent(themesList, currentContent);
            for(i in themesList)
                addAvailableContentToList($contentContainer, themesList[i], themesList[i]['contentType'], currentContent);

            $('[data-toggle="tooltip"]').tooltip('hide').tooltip('fixTitle');
            if(callback)
                callback(response);
        } else {
            $("#not-available-themes-container").show();
        }
    }

    /**
     * Set thumb for user image
     *
     * @theme_id
     * @url
     */
    function setThumbForUserImage(theme_id, url){
        $("[need-thumb="+theme_id+"]").attr("src", url);
    }

    /**
     * Sort by active content
     *
     * @param themes Array
     * @param currentContent Object
     */
    function sortByActiveContent(themes, currentContent) {
        sortByDownloadedContent(themes);
        var totalThemes = themes.length;
        for(var i = 0; i < totalThemes; i++) {
            var theme = themes[i];
            var isActiveContent = false;
            if(theme['contentType'] == liveBackgroundType || theme['contentType'] == flixelBackgroundType)
                isActiveContent = currentContent.currentVideo && currentContent.currentVideo.indexOf(theme.id) >= 0;
            else if(theme['contentType'] == staticBackgroundType)
                isActiveContent = currentContent.currentImage && currentContent.currentImage.indexOf(theme.id) >= 0;
            else if(theme['contentType'] == liveThemesType)
                isActiveContent = theme.id == currentContent.currentTheme;
            if(isActiveContent)
                moveArrayElements(themes, i, 0);
        }
        return themes;
    }

    /**
     * Sort by downloaded content
     *
     * @param themes Array
     */
    function sortByDownloadedContent(themes) {
        var totalThemes = themes.length;
        for(var i = 0; i < totalThemes; i++) {
            var theme = themes[i];
            var isDownloadedContent = false;
            if(theme['contentType'] == liveBackgroundType || theme['contentType'] == flixelBackgroundType)
                isDownloadedContent = theme.hasDownloadedVideo;
            else if(theme['contentType'] == staticBackgroundType)
                isDownloadedContent = theme.hasDownloadedImage;
            else if(theme['contentType'] == liveThemesType)
                isDownloadedContent = false;
            if(isDownloadedContent)
                moveArrayElements(themes, i, 0);
        }
        return themes;
    }

    /**
     * Toggle content favorite state
     */
    function addToggleFavoriteStateButtonHandler() {
        $(document).on("click", ".av-content-favorite-img", function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $el = $(this);
            var $contentInstall = $el.closest(".av-content-container").find(".av-content-install");
            var contentType = $contentInstall.attr("data-content-type");
            var contentId = $contentInstall.attr("data-content-theme");
            if(contentType && contentId) {
                if($el.hasClass("av-content-favorite-img-active")) {
                    var $modalConfirmButton = $("#delete-from-favorite-dialog-confirm");
                    if($modalConfirmButton) {
                        $modalConfirmButton.attr("data-container-content-type", contentType);
                        $modalConfirmButton.attr("data-content-theme", contentId);
                        $modalConfirmButton.on("click", addConfirmRemoveFavoriteHandler);
                        $("#delete-from-favorite-dialog").modal();
                    }
                }
            }
        });
    }

    /**
     * Remove installed theme
     */
    function addRemoveInstalledTheme() {
        $(document).on("click", ".av-content-img-delete", function(e) {
            e.preventDefault(); e.stopPropagation();
            var $el = $(this);
            
            var $modalConfirmButton = $("#delete-theme-dialog-confirm");
            if($modalConfirmButton) {
                $("#delete-theme-dialog-text").text(translate($el.attr("message")));
                
                $modalConfirmButton.on("click", function(){
                    var $contentBlock = $el.closest(".available-themes-block");
                    var $itemContainer = $el.closest(".av-content-container");
                    var $contentInstall = $itemContainer.find(".av-content-install");
                    var $contentImgContainer = $itemContainer.find(".av-content-img-container");
                    var contentType = $contentBlock.attr("data-container-content-type");
                    var contentId = $contentInstall.attr("data-content-theme");
                    
                    if(/*contentType && */contentId) {
                        var themes = localStorage.getItem('installed-themes');
                        themes = JSON.parse(themes);

                        if(true || Object.keys(themes).length > 1){//Delete theme
                            if(themes[contentId]){
                                delete themes[contentId];
                                localStorage.setItem('installed-themes', JSON.stringify(themes));

                                BRW_fsRemoveFile('themes/'+contentId, contentId+'.hd.mp4');
                                BRW_fsRemoveFile('themes/'+contentId, contentId+'.hd.mp4');
                                BRW_fsRemoveFile('themes/'+contentId, contentId+'.tablet.mp4');
                                BRW_fsRemoveFile('thumbnails/'+contentId, contentId+'poster.png');
                                BRW_fsRemoveFile('thumbnails/'+contentId, contentId+'.thumbnail.jpg');
                                BRW_fsRemoveFile('themes/'+contentId, 'v640bg.mp4');
                                BRW_fsRemoveFile('themes/'+contentId, 'v1024bg.mp4');
                                BRW_fsRemoveFile('themes/'+contentId, 'v1920bg.mp4');

                                if(true){//reset block status
                                    $el.removeClass('active').removeClass('active-disabled');
                                    
                                    $installButton = $itemContainer.find(".av-content-install");
                                    $resolutionButtons = $itemContainer.find(".current-theme-download");

                                    if(contentType == flixelBackgroundType)
                                        var installButtonText = translate("options_tabs_item_buttons_install_flixer");
                                    else
                                        var installButtonText = translate("options_tabs_item_buttons_install");

                                    setInstallButtonClass($installButton, 'btn-danger');

                                    $installButton.text(installButtonText);

                                    $installButton.attr('data-content-installed', false);
                                                                        
                                    $resolutionButtons.removeClass("btn-success").addClass("btn-primary").attr("is-active-resolution", false);
                                    localStorage.setItem('download-queue', 0);
                                }//if

                                //getSettingsTabPages(reloadTabPages); getFavoriteTabPages(reloadTabPages);
                            }//if
                        }else{
                            alert('Сan not remove a single loaded theme!');
                        }
                    }//if
                    
                });
                $("#delete-theme-dialog").modal();
            }
        });
    }


    /**
     * Add toggle show themes random state button handler
     */
/*

    function addToggleShowThemesRandomStateButtonHandler() {
        var $el = $(".random-themes-display-label");
        if(getRandomThemesDisplay())
            $el.find("input[type=checkbox]").prop("checked", true);

        $el.on("click", function() {
            var $el = $(this).find("input[type=checkbox]");
            var val = $el.is(':checked');
            if(val) {
                $(".random-themes-display").each(function() {
                    var $item = $(this);
                    if(!$item.is(":checked"))
                        $item.prop("checked", true);
                });
            } else {
                $(".random-themes-display").each(function() {
                    var $item = $(this);
                    if($item.is(":checked"))
                        $item.prop("checked", false);
                });
            }

            BRW_sendMessage({command: "setRandomThemesDisplay", val: val, tab: favoriteTabId});
        });
    }
*/
    function addToggleShowThemesRandomStateButtonHandler() {
        $(".random-themes-display-label").each(function(){
            
            //var $el = $(".random-themes-display-label");
            var $el = $(this);
                $el.attr("data-toggle", "tooltip");
                $el.attr("data-placement", "bottom");
                $("#random-themes-display-label-flixel").attr("data-placement", "right");
          
            if($el.hasClass('random-themes-display-label-favorites')){
                $el.attr("title", translate("options_tabs_item_note_random_background_on_options_page"));
                $el.find("input[type=checkbox]").attr("setMode", 1);
            }else{
                $el.attr("title", translate("options_tabs_item_note_random_background_on_options_page_downloaded"));
                $el.find("input[type=checkbox]").attr("setMode", 2);
            }

            var randomThemesDisplayMode = getRandomThemesDisplay() || false;
            if(randomThemesDisplayMode == $el.find("input[type=checkbox]").attr("setMode"))
                $el.find("input[type=checkbox]").prop("checked", true);
            
            var bounce=false;
            $el.on("click", function() {
                if(bounce) return false;
                else{
                    bounce=true;
                    setTimeout(function(){
                        bounce=false;
                    }, 50);
                }//else
                
                var randomThemesDisplayMode = getRandomThemesDisplay() || false;
                
                var $el = $(this).find("input[type=checkbox]");
                
                if($el.attr("setMode") != randomThemesDisplayMode  /*$el.is(':checked')*/) 
                    var val = $el.attr("setMode");
                else 
                    var val = false;

                if(val) {
                    $(".random-themes-display").each(function() {
                        var $item = $(this);
                        if($item.attr("setMode") == val)
                            $item.prop("checked", true);
                        else
                            $item.prop("checked", false);
                    });
                } else {
                    $(".random-themes-display").each(function() {
                        var $item = $(this);
                        if($item.is(":checked"))
                            $item.prop("checked", false);
                    });
                }
                
                BRW_TabsGetCurrentID(function(tabID){
                    BRW_sendMessage({command: "setRandomThemesDisplaySettings", val: val, tab: tabID});
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
        if(contentType && contentId) {
            var $contentInstall = $(".av-content-install[data-content-theme=" + contentId + "]").filter("[data-content-type="+ contentType +"]");
            if($contentInstall) {
                var $contentItem = $contentInstall.closest(".av-content-container");
                if($contentItem) {
                    var $removeFavoriteBtn = $contentItem.find(".av-content-favorite-img-active");
                    if($removeFavoriteBtn) {
                        $el.off("click", addConfirmRemoveFavoriteHandler);
                        removeThemeElementFromFavorite(contentType, contentId);
                        $removeFavoriteBtn.removeClass("av-content-favorite-img-active");
                        $removeFavoriteBtn.attr('data-original-title',  translate("options_tabs_item_buttons_favorite")).tooltip('fixTitle');
                        $contentItem.fadeOut(600, function() {
                            $(this).remove();
                            $("#delete-from-favorite-dialog").modal('hide');
                            var favoriteThemes = getFavoriteThemesObject();
                            if(!getArrayLength(favoriteThemes)) {
                                $(".random-themes-container-wrap").hide();
                                $("#not-available-themes-container").fadeIn(600);
                            }
                        });
                        var data = {"contentType": contentType, "contentId": contentId};
                        BRW_sendMessage({command: "removeContentFavoriteMark", "data" : data});
                    }
                }
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

    /**
     * Hide favorite image on content hover
     *
     * @param e Event
     */
    function hideFavoriteImageOnContentHover(e) {
        $(this).find(".av-content-favorite-img").fadeOut(400);
    }

    /**
     * Add available content
     *
     * @param $container jQuery element
     * @param theme Object
     * @param contentType Int
     * @param currentContent Object
     */
    function addAvailableContentToList($container, theme, contentType, currentContent) {
        var $contentContainer = $("<div></div>");
        $contentContainer.addClass("av-content-container");

        var $contentTitle = $("<div></div>");
        $contentTitle.addClass("av-content-title");
        $contentTitle.text(theme.title);

        var $contentImgContainer = $("<div></div>");
        $contentImgContainer.addClass("av-content-img-container");
        if(contentType == flixelBackgroundType)
            $contentImgContainer.addClass("av-content-img-container-dark");

        var $contentImg = $("<img>");
        var contentThumbImage = null;
        $contentImg.addClass("av-content-img");
        $contentImg.on('load', function() {
            var $contentLoader = $(this).parent().find(".av-content-img-loader");
            if($contentLoader)
                $contentLoader.remove();
        });
        if(contentType == flixelBackgroundType)
            $contentImg.addClass("av-content-img-width-auto");

        if(!theme.downloadedByUser){
            if(contentType == liveBackgroundType || contentType == staticBackgroundType || contentType == liveThemesType)
                contentThumbImage = getThemeContentThumbImage(theme.id, theme.downloadedByUser);
            else if(contentType == flixelBackgroundType)
                contentThumbImage = theme.bgFileThumb;

            $contentImg.attr("src", contentThumbImage);
        }else{
            $contentImg.attr("need-thumb", theme.id);
            BRW_sendMessage({command: "getThumbForUserImage", theme:theme});
        }

        var $contentFavorite = $("<div></div>");
        $contentFavorite.addClass("av-content-favorite-img");
        if(typeof(theme['favorite']) != "undefined" && theme['favorite']) {
            $contentFavorite.addClass("av-content-favorite-img-active");
            $contentFavorite.attr("title", translate("options_tabs_item_buttons_favorite_remove"));
            $contentFavorite.css({"display" : "block"});
            $contentImgContainer.off("mouseenter", showFavoriteImageOnContentHover).off("mouseleave", hideFavoriteImageOnContentHover);
        } else {
            $contentFavorite.attr("title", translate("options_tabs_item_buttons_favorite"));
            $contentImgContainer.on("mouseenter", showFavoriteImageOnContentHover).on("mouseleave", hideFavoriteImageOnContentHover);
        }
        $contentFavorite.attr("data-toggle", "tooltip");
        $contentFavorite.attr("data-placement", "right");
        $contentImgContainer.append($contentFavorite);

        
        var $removeItem = $("<img>");
        if(contentType == staticBackgroundType || contentType == liveBackgroundType || contentType == flixelBackgroundType) {
            $removeItem.addClass("av-content-img-delete");
            $removeItem.attr("src", extensionGetUrl("/pages/options/css/img/buttons/delete.png"));
            $removeItem.attr("title", translate("options_tabs_item_buttons_control_delete"));
            $removeItem.attr("data-toggle", "tooltip");
            $removeItem.attr("data-placement", "left");
            
            if(contentType == staticBackgroundType) 
                $removeItem.attr("message", "options_tabs_delete_image");
            else
                $removeItem.attr("message", "options_tabs_delete_theme");
            
            $contentContainer.append($removeItem);
        }
        
        var $settingsItem = $("<img>");
        if(contentType == staticBackgroundType || contentType == liveBackgroundType || contentType == flixelBackgroundType) {
            $settingsItem.addClass("av-content-img-settings");
            $settingsItem.attr("src", extensionGetUrl("/pages/options/css/img/buttons/settings.png"));
            $settingsItem.attr("title", translate("options_tabs_item_buttons_control_settings"));
            $settingsItem.attr("data-toggle", "tooltip");
            $settingsItem.attr("data-placement", "left");
            $contentContainer.append($settingsItem);
        }

        if(contentType == flixelBackgroundType) {
            var $contentLoaderImg = $("<img>");
            $contentLoaderImg.addClass("av-content-img-loader");
            $contentLoaderImg.attr("src", extensionGetUrl("/pages/options/css/img/buttons/popup/loading-small.gif"));
            $contentImgContainer.append($contentLoaderImg);
        }

        var $contentFooter = $("<div></div>");
        $contentFooter.addClass("av-content-footer").addClass("av-content-footer-favorite");

        var $contentFooterText = $("<div></div>");
        $contentFooterText.addClass("av-content-footer-text");
        if(contentType == flixelBackgroundType)
            $contentFooterText.text(translate("options_tabs_title_flixel_bg"));
        else if(contentType == liveBackgroundType)
            $contentFooterText.text(translate("options_tabs_title_live_bg"));
        else if(contentType == staticBackgroundType)
            $contentFooterText.text(translate("options_tabs_title_static_bg"));
        else if(contentType == liveThemesType)
            $contentFooterText.text(translate("options_tabs_title_live_theme"));

        $contentFooter.append($contentFooterText);

        var $installButton = $("<a></a>");
        var installButtonText = "";
        var installButtonTitle = "";
        $installButton.addClass("btn").addClass("av-content-install");

        var $viewItem = $("<a></a>");
        $viewItem.text(translate("options_tabs_item_buttons_view_live_bg"));
        $viewItem.addClass("btn").addClass("btn-warning").addClass("av-content-view");

        var isActiveContent = false;
        var isInstalledContent = false;

        var $contentResolutionsButtons,
            $downloadButton,
            downloadButtonResolution,
            $downloadButtonTextResolution,
            downloadButtonSize,
            $downloadButtonTextSize;

        if(contentType == liveBackgroundType) {
            isActiveContent = currentContent.currentVideo && currentContent.currentVideo.indexOf(theme.id) >= 0;
            isInstalledContent = theme.hasDownloadedVideo;
            $installButton.attr("data-content-type", liveBackgroundType);
            $installButton.attr("data-content-installed", isInstalledContent);
            favoritesDownloadNote(isInstalledContent);
            $installButton.addClass("available-install-video");
            

            $contentResolutionsButtons = $("<div></div>");
            $contentResolutionsButtons.attr("data-content-type", liveBackgroundType);
            $contentResolutionsButtons.addClass("av-content-resolution-buttons");
            $contentResolutionsButtons.attr("data-theme", theme.id);
            for(w in currentContent.videoContentAvailableResolutions) {
                $downloadButton = $("<button></button>").addClass("current-theme-download");
                $downloadButton.addClass("btn");
                if(currentContent.currentVideo.indexOf(theme.id) != -1 && currentContent.currentVideoResolution && currentContent.currentVideoResolution == currentContent.videoContentAvailableResolutions[w]) {
                    $downloadButton.addClass("btn-success");
                    $downloadButton.attr("title", getVideoThemeResolutionButtonTitle(currentContent.videoContentAvailableResolutions[w], true));
                    $downloadButton.attr("is-active-resolution", true);
                } else {
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

            if(isInstalledContent) {
                if(isActiveContent) {
                    $contentResolutionsButtons.show();
                    if($viewItem && !$viewItem.hasClass("active"))
                        $viewItem.addClass("active");
                    if($settingsItem && !$settingsItem.hasClass("active"))
                        $settingsItem.addClass("active");
                }
            }
            addBackgroundVideoPreviewPopover(theme, $contentImgContainer);
        } else if(contentType == staticBackgroundType) {
            isActiveContent = currentContent.currentImage && currentContent.currentImage.indexOf(theme.id) >= 0;
            isInstalledContent = theme.hasDownloadedImage;
            $installButton.attr("data-content-type", staticBackgroundType);
            $installButton.attr("data-content-installed", isInstalledContent);
            favoritesDownloadNote(isInstalledContent);
            $installButton.addClass("available-install-static");
            if(isInstalledContent) {
                if(isActiveContent) {
                    if($viewItem && !$viewItem.hasClass("active"))
                        $viewItem.addClass("active");
                    if($settingsItem && !$settingsItem.hasClass("active"))
                        $settingsItem.addClass("active");
                }
            }
        } else if(contentType == liveThemesType) {
            isActiveContent = currentContent.currentVideo && currentContent.currentVideo.indexOf(theme.id) >= 0;
            
            isInstalledContent = theme.hasDownloadedVideo;
            
            
            $installButton.attr("data-content-type", liveThemesType);
            $installButton.attr("target", "_blank");
            $installButton.addClass("available-install-live-theme");
            //$installButton.attr("href", themeSourceInstallUrl + theme.id);
            if(theme.chromeThemeUrl){
                if(String(theme.chromeThemeUrl).indexOf('://') == -1) theme.chromeThemeUrl = themeSourceInstallUrl + theme.chromeThemeUrl;
                $installButton.attr("href", theme.chromeThemeUrl);//chrome theme
            }
            $installButton.attr("data-content-installed", isInstalledContent);
            favoritesDownloadNote(isInstalledContent);

            $contentResolutionsButtons = $("<div></div>");
            //$contentResolutionsButtons.addClass("av-content-resolution-buttons av-content-resolution-buttons-themes");
            $contentResolutionsButtons.addClass("av-content-resolution-buttons").addClass("av-content-resolution-flixel-buttons");
            $contentResolutionsButtons.attr("data-theme", theme.id);
            
            for (w in currentContent.flixelContentAvailableResolutions) {
                var loopResolution = currentContent.flixelContentAvailableResolutions[w];

                if(typeof (theme.fullHd) == "undefined") {
                    if(loopResolution == 1920 && typeof(theme.bgVideoPath[loopResolution]) == "undefined")
                        continue;
                } else {
                    if(!theme.fullHd && loopResolution == 1920 && typeof(theme.bgVideoPath[loopResolution]) == "undefined")
                        continue;
                }

                themeTitleMaxResolution = "";//(" + getFlixelThemeResolutionTitle(loopResolution, true) + ")" + " ";

                $downloadButton = $("<button></button>").addClass("current-theme-download");
                $downloadButton.addClass("btn");
                if (currentContent.currentVideo.indexOf(theme.id) != -1 && currentContent.currentVideoResolution && currentContent.currentVideoResolution == loopResolution) {
                    $downloadButton.addClass("btn-success");
                    $downloadButton.attr("is-active-resolution", true);
                } else {
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
            
            if(isInstalledContent) {
                if(isActiveContent) {
                    $contentResolutionsButtons.show();
                    if($viewItem && !$viewItem.hasClass("active"))
                        $viewItem.addClass("active");
                    if($settingsItem && !$settingsItem.hasClass("active"))
                        $settingsItem.addClass("active");
                }
            }
            
        }else if(contentType == flixelBackgroundType) {
            isActiveContent = currentContent.currentVideo && currentContent.currentVideo.indexOf(theme.id) >= 0;
            isInstalledContent = theme.hasDownloadedVideo;
            $installButton.attr("data-content-type", flixelBackgroundType);
            $installButton.attr("data-content-installed", isInstalledContent);
            favoritesDownloadNote(isInstalledContent);
            $installButton.addClass("available-install-flixer-video");

            $contentResolutionsButtons = $("<div></div>");
            $contentResolutionsButtons.addClass("av-content-resolution-buttons").addClass("av-content-resolution-flixel-buttons");
            $contentResolutionsButtons.attr("data-theme", theme.id);
            for (w in currentContent.flixelContentAvailableResolutions) {
                var loopResolution = currentContent.flixelContentAvailableResolutions[w];

                if(typeof (theme.fullHd) == "undefined") {
                    if(loopResolution == 1920 && typeof(theme.bgVideoPath[loopResolution]) == "undefined")
                        continue;
                } else {
                    if(!theme.fullHd && loopResolution == 1920 && typeof(theme.bgVideoPath[loopResolution]) == "undefined")
                        continue;
                }

                $downloadButton = $("<button></button>").addClass("current-theme-download");
                $downloadButton.addClass("btn");
                if (currentContent.currentVideo.indexOf(theme.id) != -1 && currentContent.currentVideoResolution && currentContent.currentVideoResolution == loopResolution) {
                    $downloadButton.addClass("btn-success");
                    $downloadButton.attr("is-active-resolution", true);
                } else {
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

            if(isInstalledContent) {
                if(isActiveContent) {
                    $contentResolutionsButtons.show();
                    if($viewItem && !$viewItem.hasClass("active"))
                        $viewItem.addClass("active");
                    if($settingsItem && !$settingsItem.hasClass("active"))
                        $settingsItem.addClass("active");
                }
            }

            if(typeof (theme.author) != "undefined" && theme.author) {
                var flixelUserChanelUrl = theme.handmade ? theme.author_url : getFlixelUserChanelUrl(theme.author);
                var $contentImgDescription = $("<div></div>");
                $contentImgDescription.addClass("av-content-img-description");
                $contentContainer.append($contentImgDescription);
                var $chanelText = $("<a></a>").addClass("av-content-img-description-text");
                $chanelText.attr("href", flixelUserChanelUrl);
                $chanelText.attr("target", "_blank");
                $chanelText.text(translate("options_tabs_item_chanel_description_text_flixel_bg"+(theme.handmade ? "_handmade" : "")) + " " + theme.author);
                $contentImgDescription.append($chanelText);

                $contentImgContainer.hover(function() {
                    var $el = $(this);
                    var $itemDescription = $el.find(".av-content-img-description");
                    var $itemContainer = $el.closest(".av-content-container");
                    if($itemContainer) {
                        var $itemResolutionButtons = $itemContainer.find(".av-content-resolution-buttons");
                        if($itemResolutionButtons && !$itemResolutionButtons.is(":visible"))
                            $itemDescription.fadeIn(400);
                    }
                }, function() {
                    var $el = $(this);
                    var $itemDescription = $el.find(".av-content-img-description");
                    if($itemDescription.is(":visible"))
                        $itemDescription.fadeOut(400);
                });
                $contentImgContainer.append($contentImgDescription);
            }
            addBackgroundVideoPreviewPopover(theme, $contentImgContainer);
        }

        $installButton.attr("data-content-active", isActiveContent);
        $installButton.attr("data-content-theme", theme.id);

        if(isInstalledContent && !isActiveContent) {
            $removeItem.addClass("active");
        }
        
        if(isActiveContent) {
            //$removeItem.addClass("active-disabled");
            $installButton.addClass("btn-primary");
            $installButton.addClass("btn-success");
            if(contentType == liveThemesType)
                installButtonText = translate("options_tabs_item_buttons_active_theme");
            else
                installButtonText = translate("options_tabs_item_buttons_active");
        } else {
            if(isInstalledContent) {
                $installButton.addClass("btn-primary");
                installButtonText = translate("options_tabs_item_buttons_enable");
            } else {
                $installButton.addClass("btn-danger");
                if(contentType == flixelBackgroundType)
                    installButtonText = translate("options_tabs_item_buttons_install_flixer");
                else
                    installButtonText = translate("options_tabs_item_buttons_install");
            }
        }

        $installButton.text(installButtonText);
        $contentImgContainer.append($contentImg);
        $contentFooter.append($installButton);
        if(contentType == staticBackgroundType || contentType == liveBackgroundType || contentType == flixelBackgroundType || contentType == liveThemesType) {
            $contentFooter.append($viewItem);
        }
        $contentContainer.append($contentTitle).append($contentImgContainer).append($contentFooter);

        $container.append($contentContainer);
    }

    /**
     * Add video preview popover
     *
     * @param theme Object
     * @param $contentContainer jQuery element
     */
    function addBackgroundVideoPreviewPopover(theme, $contentContainer) {
        if(typeof (theme["bgVideoThumb"]) != "undefined" && theme["bgVideoThumb"]) {
            var videoThumbSrc = null;
            if(theme.contentType == liveBackgroundType || theme.contentType == liveThemesType || theme.handmade)
                videoThumbSrc = getThemeContentThumbVideo(theme.id);
            else if(theme.contentType == flixelBackgroundType)
                videoThumbSrc = getFlixelVideoThumb(theme.id);

            var videoPosterSrc = extensionGetUrl("/pages/options/css/img/buttons/popup/circle-loader.gif");
            if(videoThumbSrc) {
                var content = '<video src="' + mp4ToWebm(videoThumbSrc) + '" poster="' + videoPosterSrc + '" loop width="320" height="180" class="popover-video-thumb"></video>';
                $contentContainer.popover({
                    "delay" : 750,
                    "html" : true,
                    "title" : theme.title,
                    "trigger" : "hover",
                    "placement" : "auto left",
                    "template" : $("#video-popover-block").html(),
                    "content" : content
                });
                $contentContainer.on("shown.bs.popover", function() {
                    var $player = $contentContainer.parent().find("video");
                    if($player) {
                        var player = $player.get(0);
                        if(player) {
                            player.play();
                        }
                    }
                }).on("hide.bs.popover", function() {
                    var $player = $contentContainer.parent().find("video");
                    if($player) {
                        $player.css({"display" : "none"});
                        var player = $player.get(0);
                        if(player) {
                            player.pause();
                            player.src = "";
                        }
                    }
                });
            }
        }
    }

    /**
     * Download available contents error
     *
     * @param message Object
     */
    function getAvailableContentError(message) {
        $.jGrowl(translate("options_refresh_themes_list_error"), { "life" : 10000 });
    }

    /**
     * Change background image file error
     *
     * @param message Object
     */
    function changeBackgroundImageFileError(message) {
        var currentThemeId = null;
        if(message.currentThemeId)
            currentThemeId = message.currentThemeId;

        $.jGrowl(translate("options_tabs_download_static_bg_error"));
        var $downloadItems = $("#available-favorite-themes").find(".av-content-install[data-content-downloading='true']");
        if($downloadItems.length) {
            $downloadItems.filter("[data-content-type=" + staticBackgroundType + "]");
            $downloadItems.each(function () {
                var $el = $(this);
                $el.attr('data-content-downloading', false);
                setInstallButtonClass($el, 'btn-danger');
                $el.text(translate("options_tabs_item_buttons_install"));
            });
        }

        if(currentThemeId) {
            var $activeItems = $("#available-favorite-themes").find(".av-content-install[data-content-theme='" + currentThemeId + "']");
            if($activeItems.length) {
                $activeItems.filter("[data-content-type=" + staticBackgroundType + "]");
                $activeItems.each(function() {
                    var $el = $(this);
                    if($el.attr('data-content-theme') == currentThemeId) {
                        setInstallButtonClass($el, 'btn-success');
                        var $viewItem = $el.parent().find(".av-content-view");
                        if($viewItem && !$viewItem.hasClass("active"))
                            $viewItem.addClass("active");
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
        changeBackgroundVideoContentError(message);
    }

     /**
     * Change background video file error
     *
     * @param message Object
     */
    function changeBackgroundVideoFileError(message) {
         changeBackgroundVideoContentError(message)
    }

    /**
     * Change background video content error
     *
     * @param message Object
     */
    function changeBackgroundVideoContentError(message) {
        var currentVideoThemeId = null;
        var installedThemeId = null;
        if(message.currentThemeId)
            currentVideoThemeId = message.currentThemeId;
        if(message.installedThemeId)
            installedThemeId = message.installedThemeId;

        $.jGrowl(translate("options_tabs_download_live_bg_error"));

        var $downloadItems = $("#available-favorite-themes").find(".av-content-install[data-content-downloading='true']");
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
                    if (!$button.hasClass("btn-primary"))
                        $button.addClass("btn-primary");
                });

                if (contentType == liveBackgroundType || contentType == flixelBackgroundType) {
                    $resolutionButtons.show();
                    setInstallButtonClass($downloadItem, 'btn-danger');
                    $downloadItem.text(translate("options_tabs_item_buttons_install_select_quality"));
                } else if (contentType == liveThemesType) {
                    var isActive = $downloadItem.attr("data-content-active");
                    isActive = isActive == "true";
                    if (isActive) {
                        setInstallButtonClass($downloadItem, 'btn-success');
                        $downloadItem.text(translate("options_tabs_item_buttons_active_theme"));
                    }
                }
            });
        }

        if(currentVideoThemeId) {
            var $activeItems = $("#available-favorite-themes").find(".av-content-install[data-content-theme='" + currentVideoThemeId + "'], .av-content-install[data-content-theme='" + installedThemeId + "']");
            if ($activeItems && $activeItems.length) {
                $activeItems.each(function () {
                    var $el = $(this);
                    var contentType = $el.attr("data-content-type");
                    var checkContentResolution;
                    
                    if( contentType == liveBackgroundType || contentType == flixelBackgroundType || contentType == liveThemesType) {
                        checkContentResolution = message.installedResolution;
                        setInstallButtonClass($el, 'btn-success');
                        var $viewItem = $el.parent().find(".av-content-view");
                        if ($viewItem && !$viewItem.hasClass("active"))
                            $viewItem.addClass("active");
                        
                        var $settingsItem = $el.parent().parent().find(".av-content-img-settings");
                        if ($settingsItem && !$settingsItem.hasClass("active"))
                            $settingsItem.addClass("active");
                        
                        var $removeItem = $el.parent().parent().find(".av-content-img-delete");
                        if($removeItem){
                            $("active-disabled").removeClass("active-disabled");
                            $removeItem.addClass("active").addClass("active-disabled");                          
                        }
                        
                        $el.text(translate("options_tabs_item_buttons_active"));
                    } else if (contentType == liveThemesType) {
                        checkContentResolution = message.installedThemeResolution;
                        var isActive = $el.attr("data-content-active");
                        isActive = isActive == "true";
                        if (isActive) {
                            setInstallButtonClass($el, 'btn-success');
                            $el.text(translate("options_tabs_item_buttons_active_theme"));
                        }
                    }

                    if (typeof(checkContentResolution) != "undefined" && checkContentResolution) {
                        var $resolutionButtons = $el.parent().parent().find(".av-content-resolution-buttons");
                        $resolutionButtons.find("button").each(function () {
                            var $button = $(this);
                            if ($button.attr("data-resolution") == checkContentResolution) {
                                $button.attr("is-active-resolution", true);
                                if ($button.hasClass("btn-primary"))
                                    $button.removeClass("btn-primary");
                                if (!$button.hasClass("btn-success"))
                                    $button.addClass("btn-success");
                            }
                        });
                    }
                });
            }
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
        
        var $downloadItems = $("#available-favorite-themes").find(".av-content-install[data-content-downloading='true'][data-content-theme='"+theme_id+"']");
        
        if($downloadItems.length) {
            $downloadItems.filter("[data-content-type=" + staticBackgroundType + "]");
            $downloadItems.each(function () {
                $(this).text(translate("options_tabs_item_buttons_download") + " " + message.percentComplete + "%");
            });
        } else {
            if(typeof (message.downloadingFile['themeId']) != "undefined" && message.downloadingFile['themeId']) {
                $downloadItems = $("#available-favorite-themes").find(".av-content-install[data-content-theme='" + message.downloadingFile.themeId + "']");
                if($downloadItems.length) {
                    $downloadItems.filter("[data-content-type=" + staticBackgroundType + "]");
                    $downloadItems.each(function () {
                        var $installButton = $(this);
                        $installButton.text(translate("options_tabs_item_buttons_download") + " " + message.percentComplete + "%");
                        $installButton.attr("data-content-current-click", true);
                        setInstallButtonClass($installButton, "btn-info");
                        var $viewItem = $installButton.parent().find(".av-content-view");
                        if($viewItem && $viewItem.hasClass("active"))
                            $viewItem.removeClass("active");
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
        changeBackgroundVideoContentProgress(message);
    }

    /**
     * Change background video file progress
     *
     * @param message Object
     */
    function changeBackgroundVideoFileProgress(message) {
        changeBackgroundVideoContentProgress(message);
    }

    /**
     * Return theme ID from theme downloading url
     *
     * @url - HTTP link
     */
    function getThemeIdFromUrl(url){
        var id=false; arr = decodeURIComponent(String(url)).split('/');
        
        for(var i = 3; i--; i>0){
            if(arr.length){
                var el = String(arr.pop());
                if(el.length >= 20){
                    id = el;
                    break;
                }
            }
        }
        
        if(id){
            id = id.split('.');
            id = id.shift();
        }
        
        
        return id;
    }//function

    /**
     * Change background video content progress
     *
     * @param message Object
     * @param contentType Int
     */
    function changeBackgroundVideoContentProgress(message) {
        var theme_id = getThemeIdFromUrl(message.downloadingFile.theme_url);
        message.downloadingFile['themeId'] = theme_id;
        
        var $itemsContainer = $("#available-favorite-themes");
        var $downloadItems = $itemsContainer.find(".av-content-install[data-content-downloading='true'][data-content-theme='"+theme_id+"']");
        var $activeItems = $itemsContainer.find(".av-content-install[data-content-active='true']");

        if($downloadItems.length) {
            $downloadItems.each(function () {
                var $downloadItem = $(this);
                var contentType = $downloadItem.attr("data-content-type");
                var outputTranslate = contentType == flixelBackgroundType ? translate("options_tabs_item_buttons_download_flixel") : translate("options_tabs_item_buttons_download");
                var outputText = outputTranslate + " " + message.percentComplete + "%";
                if(contentType == liveBackgroundType || contentType == flixelBackgroundType)
                    $downloadItem.text(outputText);
                else if(contentType == liveThemesType) {
                    var isActive = $downloadItem.attr("data-content-active");
                    isActive = isActive == "true";
                    if(isActive)
                        $downloadItem.text(outputText);
                }
            });
        } else {
            if(typeof (message.downloadingFile['themeId']) != "undefined" && message.downloadingFile['themeId']) {
                if($activeItems.length) {
                    $activeItems.each(function() {
                        var $installButton = $(this);
                        if($installButton.attr("data-content-theme") != message.downloadingFile.themeId) {
                            var contentType = $installButton.attr("data-content-type");
                            if(contentType == liveBackgroundType || contentType == flixelBackgroundType) {
                                var $downloadContainer = $installButton.parent().parent().find(".av-content-resolution-buttons");
                                if($downloadContainer.is(":visible"))
                                    $downloadContainer.hide();
                            }
                        }
                    });
                }

                $downloadItems = $itemsContainer.find(".av-content-install[data-content-theme='" + message.downloadingFile.themeId + "']");
                if($downloadItems.length) {
                    $downloadItems.each(function () {
                        var $installButton = $(this);
                        var contentType = $installButton.attr("data-content-type");
                        var isActive = $installButton.attr("data-content-active");
                        isActive = isActive == "true";

                        if(contentType == flixelBackgroundType || contentType == liveBackgroundType || (contentType == liveThemesType && isActive)) {
                            var outputTranslate = contentType == flixelBackgroundType ? translate("options_tabs_item_buttons_download_flixel") : translate("options_tabs_item_buttons_download");
                            $installButton.text(outputTranslate + " " + message.percentComplete + "%");
                            $installButton.attr("data-content-current-click", true);
                            setInstallButtonClass($installButton, "btn-info");
                            $installButton.attr("data-content-downloading", true);
                            var $viewItem = $installButton.parent().find(".av-content-view");
                            if($viewItem && $viewItem.hasClass("active"))
                                $viewItem.removeClass("active");
                            var $settingsItem = $installButton.parent().parent().find(".av-content-img-settings");
                            if($settingsItem && $settingsItem.hasClass("active"))
                                $settingsItem.removeClass("active");
                            
                            var $removeItem = $el.parent().parent().find(".av-content-img-delete");
                            if($removeItem){
                                $removeItem.removeClass("active-disabled");                          
                            }
                            
                            var $downloadContainer = $installButton.parent().parent().find(".av-content-resolution-buttons");
                            if(typeof(message.downloadingFile['resolution']) != "undefined") {
                                $downloadContainer.find("button").each(function() {
                                    var $item = $(this);
                                    var itemResolution = $item.attr("data-resolution");
                                    $item.removeClass("btn-success");
                                    if(message.downloadingFile.resolution == itemResolution) {
                                        $item.addClass("btn-success");
                                        $item.attr("is-active-resolution", true);
                                        if(contentType != flixelBackgroundType)
                                            $item.attr("title", getVideoThemeResolutionButtonTitle(itemResolution, true));
                                    } else {
                                        if(!$item.hasClass("btn-primary"))
                                            $item.addClass("btn-primary");
                                        $item.attr("is-active-resolution", false);
                                        if(contentType != flixelBackgroundType)
                                            $item.attr("title", getVideoThemeResolutionButtonTitle(itemResolution, false));
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
        $(".av-content-resolution-buttons").each(function() { $(this).hide(); });
        var $container = $("#available-favorite-themes");
        $container.find("a[data-content-theme='" + message.theme.id + "']").each(function() {
            var $el = $(this);
            setInstallButtonClass($el, "btn-success");
            $el.attr("data-content-downloading", false);
            $el.attr("data-content-installed", true);
            $el.attr("data-content-active", true);
            $el.text(translate("options_tabs_item_buttons_active"));

            var $viewItem = $(this).parent().find(".av-content-view");
            if($viewItem && !$viewItem.hasClass("active"))
                $viewItem.addClass("active");
            var $settingsItem = $el.parent().parent().find(".av-content-img-settings");
            if($settingsItem && !$settingsItem.hasClass("active"))
                $settingsItem.addClass("active");
            
            var $removeItem = $el.parent().parent().find(".av-content-img-delete");
            if($removeItem){
                $("active-disabled").removeClass("active-disabled");
                $removeItem.addClass("active").addClass("active-disabled");                          
            }
            
            $('[data-toggle="tooltip"]').tooltip('hide').tooltip('fixTitle');
        });
        
        setTimeout(()=>{
            try{
                BACK.check(false, true);
            }catch(ex){
                console.warn(ex);
            }
        }, 500);
    }

    /**
     * Change flixer background to options page
     *
     * @param message Object
     */
    function changeFlixerBackgroundToOptionsPage(message) {
        changeVideoBackgroundToOptionsPage(message);
    }

    /**
     * Change live background to options page
     *
     * @param message Object
     */
    function changeLiveBackgroundToOptionsPage(message) {
        changeVideoBackgroundToOptionsPage(message);
    }

    /**
     * Change video bacground to options page
     *
     * @param message Object
     */
    function changeVideoBackgroundToOptionsPage(message) {
        clearInstallContentButtons(staticBackgroundType);
        clearInstallContentButtons(liveBackgroundType);
        clearInstallContentButtons(flixelBackgroundType);
        checkDisplayRandomThemesActive();
        var $activeDataContainers = $(".favorite-themes-container");
        $activeDataContainers.find(".av-content-resolution-buttons").each(function() { $(this).hide(); });
        var $container = $("#available-favorite-themes");

        $container.find("a[data-content-theme='" + message.videoThemeId + "']").each(function () {
            var $el = $(this);
            var contentType = $el.attr("data-content-type");

            setInstallButtonClass($el, "btn-success");
            $el.attr("data-content-downloading", false);
            $el.attr("data-content-installed", true);
            $el.attr("data-content-active", true);

            if (contentType == liveBackgroundType || contentType == flixelBackgroundType || contentType == liveBackgroundType || contentType == liveThemesType) {
                $el.text(translate("options_tabs_item_buttons_active"));
                var $viewItem = $(this).parent().find(".av-content-view");
                if ($viewItem && !$viewItem.hasClass("active"))
                    $viewItem.addClass("active");
                
                var $settingsItem = $(this).parent().parent().find(".av-content-img-settings");
                if ($settingsItem && !$settingsItem.hasClass("active"))
                    $settingsItem.addClass("active");
                
                var $removeItem = $el.parent().parent().find(".av-content-img-delete");
                if($removeItem){
                    $("active-disabled").removeClass("active-disabled");
                    $removeItem.addClass("active").addClass("active-disabled");                          
                }
            } else if (contentType == liveThemesType)
                $el.text(translate("options_tabs_item_buttons_active_theme"));

            var $downloadContainer = $el.parent().parent().find(".av-content-resolution-buttons");
            $downloadContainer.find("button").each(function () {
                var $item = $(this);
                var itemResolution = $item.attr("data-resolution");
                $item.removeClass("btn-success");
                if (message.currentVideoResolution == itemResolution) {
                    $item.addClass("btn-success");
                    $item.attr("is-active-resolution", true);
                    if(contentType == liveBackgroundType)
                        $item.attr("title", getVideoThemeResolutionButtonTitle(itemResolution, true));
                } else {
                    if (!$item.hasClass("btn-primary"))
                        $item.addClass("btn-primary");
                    $item.attr("is-active-resolution", false);
                    if(contentType == liveBackgroundType)
                        $item.attr("title", getVideoThemeResolutionButtonTitle(itemResolution, false));
                }
            });

            if (contentType == liveBackgroundType || contentType == flixelBackgroundType || contentType == liveBackgroundType) {
                $downloadContainer.show();
            }

            $('[data-toggle="tooltip"]').tooltip('hide').tooltip('fixTitle');
        });
        
        setTimeout(()=>{
            try{
                BACK.check(false, true);
            }catch(ex){
                console.warn(ex);
            }
        }, 500);
    }

    /**
     * Set install button class
     *
     * @param $el
     * @param className
     * @returns {*}
     */
    function setInstallButtonClass($el, className) {
        return $el.removeClass("btn-primary")
            .removeClass("btn-danger")
            .removeClass("btn-info")
            .removeClass("btn-success")
            .addClass(className);
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
        if($progress.is(":visible"))
            $progress.hide();
        if(!$loading.is(":visible"))
            $loading.show();
        if(!$error.is(":visible"))
            $error.show();
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
        if(!$success.is(":visible"))
            $success.fadeIn(350);
        setTimeout(function() {
            var $success = $(".squaresLoadingSuccess");
            if($success.is(":visible"))
                $success.fadeOut(350);
        }, 2000);
    }

    /**
     * Add download in queue
     */
    var maxDownloadQueue = 3;
    localStorage.setItem('download-queue', 0);
    function downloadQueueAdd(){
        var queue = parseInt(localStorage.getItem('download-queue') || 0);
        
        if(queue < maxDownloadQueue){
            queue++;
            localStorage.setItem('download-queue', queue);
            //console.log(queue+' in queue');
            return queue;
        }else{
            $("#queue-over-dialog-text").text(String(translate("queue_over_dialog_text")).replace('#', queue));
            $("#queue-over-dialog").modal();
            
            return false;
        }//else
    }//downloadQueueAdd

    /**
     * Decrease download in queue
     */
    function downloadQueueDecreaseClient(){
        var queue = parseInt(localStorage.getItem('download-queue') || 0);
        var setQueue = Math.max(--queue, 0);

        if($ && $("#queue-over-dialog-text"))
            $("#queue-over-dialog-text").text(String(translate("queue_over_dialog_text")).replace('#', setQueue));

        localStorage.setItem('download-queue', setQueue);
    }

    /**
     * Add install resolution live background handler
     */
    function addInstallResolutionLiveBackgroundHandler() {
        $(document).on("click", ".current-theme-download", function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if(!downloadQueueAdd()) return false;//EXIT

            var $el = $(this);
            var isActiveResolution = $el.attr("is-active-resolution");
            isActiveResolution = isActiveResolution == "true";
            if(!isActiveResolution) {
                var themeId = $el.attr("data-theme");
                var resolution = $el.attr("data-resolution");
                var contentType = $el.attr("data-content-type");

                var elements = [];
                var $chainElements = null;

                elements.push($el);
                if(themeId) {
                    var $contentTypeContainer = $("#available-favorite-themes");

                    if($contentTypeContainer) {
                        if(contentType == liveThemesType) {
                            $contentTypeContainer.find(".av-content-resolution-buttons[data-content-type=" + contentType+ "]").each(function () {
                                var $contentTypeResolutionsEl = $(this);
                                var $contentTypeResolutionsElContentId = $contentTypeResolutionsEl.attr("data-theme");
                                if($contentTypeResolutionsElContentId == themeId) {
                                    if(!$contentTypeResolutionsEl.is(":visible"))
                                        $contentTypeResolutionsEl.show();
                                }  else
                                    $contentTypeResolutionsEl.hide();
                            });
                        }

                        $chainElements = $contentTypeContainer.find(".current-theme-download[data-theme='" + themeId + "']");
                        if($chainElements) {
                            var $chainElement = $chainElements.filter("[data-resolution='" + resolution + "']");
                            if($chainElement) {
                                var $chainInstallBtn = $chainElement.parent().parent().find(".av-content-install");
                                if($chainInstallBtn) {
                                    if(contentType == liveThemesType) {
                                        elements.push($chainElement);
                                    } else if(contentType == liveBackgroundType || contentType == flixelBackgroundType) {
                                        var chainInstallIsActive = $chainInstallBtn.attr("data-content-active");
                                        chainInstallIsActive = chainInstallIsActive == "true";
                                        if(chainInstallIsActive) {
                                            elements.push($chainElement);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                $.each(elements, function( index, $currentButton ) {
                    var $downloadButtons = $currentButton.parent();
                    $downloadButtons.find("button").each(function() {
                        var $downloadButton = $(this);
                        var eachDownloadButtonResolution = $downloadButton.attr("data-resolution");
                        $downloadButton.removeClass("btn-success");
                        if(!$downloadButton.hasClass("btn-primary"))
                            $downloadButton.addClass("btn-primary");
                        $downloadButton.attr("is-active-resolution", false);
                        if(contentType != flixelBackgroundType)
                            $downloadButton.attr("title", getVideoThemeResolutionButtonTitle(eachDownloadButtonResolution, false));
                    });
                    $currentButton.removeClass("btn-primary").addClass("btn-success");
                    $currentButton.attr("is-active-resolution", true);
                    if(contentType != flixelBackgroundType)
                        $currentButton.attr("title", getVideoThemeResolutionButtonTitle(resolution, true));

                    if(themeId && resolution) {
                        var $installButton = $currentButton.parent().parent().find(".av-content-install");
                        var $viewItem = $installButton.parent().find(".av-content-view");
                        if($viewItem && $viewItem.hasClass("active"))
                            $viewItem.removeClass("active");
                        
                        var $settingsItem = $installButton.parent().parent().find(".av-content-img-settings");
                        if($settingsItem && $settingsItem.hasClass("active"))
                            $settingsItem.removeClass("active");
                        
                        var $removeItem = $el.parent().parent().find(".av-content-img-delete");
                        if($removeItem){
                            $removeItem.removeClass("active-disabled");                          
                        }
                        
                        $installButton.attr("data-content-current-click", true);
                        setInstallButtonClass($installButton, "btn-info");
                        $installButton.attr("data-content-downloading", true);
                        var outputTranslate = contentType == flixelBackgroundType ? translate("options_tabs_item_buttons_download_flixel") : translate("options_tabs_item_buttons_download");
                        $installButton.text(outputTranslate + "...");
                    }
                });

                if(themeId && resolution) {
                    var command = contentType == flixelBackgroundType ? "changeFlixerVideoBackground" : "applyResolutionVideoTheme";
                    BRW_sendMessage({"command" : command, "theme" : themeId, "resolution" : resolution});
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
            case "640" : result = "480p";
                break;
            case "1024" : result = "720p";
                break;
            case "1920" : result = "1080p";
                break;
        }
        return result;
    }

    /**
     * Get flixel theme resolution title
     *
     * @param name String
     * @returns {string}
     */
    function getFlixelThemeResolutionTitle(name) {
        var result = "";
        switch (name) {
            case "1280" : result = "HD";
                break;
            case "1920" : result = "Full HD";
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
            case "640" : additionalText = translate("options_tabs_item_buttons_active_resolution_480p_live_bg");
                break;
            case "1024" : additionalText = translate("options_tabs_item_buttons_active_resolution_720p_live_bg");
                break;
            case "1920" : additionalText = translate("options_tabs_item_buttons_active_resolution_1080p_live_bg");
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
        if(typeof (theme['bgVideoSize']) != "undefined") {
            if(typeof (theme['bgVideoSize'][name]) != "undefined") {
                size = parseInt(theme['bgVideoSize'][name]);
                if(!isNaN(size)) {
                    result = (size / 1024 / 1024).toFixed(2) + "Mb";
                }
            }
        }
        return result;
    }

    /**
     * Display available themes list
     */
    function displayAvailableThemesList() {
        $(".random-themes-container-wrap").show();
        $("#available-themes").find(".tab-content").slideDown(500);
    }

    /**
     * Add install content button handler
     */
    function addInstallContentButtonHandler() {
        $(document).on("click", ".av-content-install", function(e) {
            e.preventDefault();
            
            var $el = $(this);
            var href = $el.attr("href");
            var contentType = $el.attr("data-content-type");
            var contentActive = $el.attr("data-content-active");
            var contentTheme = $el.attr("data-content-theme");
                contentActive = contentActive == "true";
            
            if(browserName() == "chrome" && contentType == liveThemesType && !contentActive) {
                $(".av-content-install[data-wait=install]").attr("data-wait", false);
                $el.attr("data-wait", "install");
                
                BRW_sendMessage({command: "openInstallThemeTab", url:href});
            } else if(contentType == liveBackgroundType || contentType == staticBackgroundType || contentType == flixelBackgroundType) {
                installThemeNow($el);
            }//else if
            
            $('[data-toggle="tooltip"]').tooltip('hide').tooltip('fixTitle');
        });
    }
    
    function installThemeNow($el){
        if(!$el) var $el = $(".av-content-install[data-wait=install]:eq(0)");
        if(!$el || !$el.length) return;
        
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
        if(contentType == flixelBackgroundType)
            installContentText = translate("options_tabs_item_buttons_install_flixer");

        var selectQualityText = translate("options_tabs_item_buttons_install_select_quality");

        
        if(!contentActive) {
            if(!contentDownloading) {
                $el.attr("data-content-current-click", true);
                if(contentType == liveBackgroundType || contentType == flixelBackgroundType || contentType == liveThemesType) {
                    $("#available-video-themes, #available-flixel-backgrounds, #available-live-themes").find(".av-content-resolution-buttons").hide();

                    $("#available-live-themes").find(".av-content-install[data-content-theme!='" + contentTheme + "']").each(function() {
                        var $resolutionButtons = $(this).parent().parent().find(".av-content-resolution-buttons");

                        $resolutionButtons.find("button").each(function() {
                            var $button = $(this);
                            if($button.hasClass("btn-success")) {
                                $button.attr("is-active-resolution", false);
                                $button.removeClass("btn-success");
                            }
                            if(!$button.hasClass("btn-primary")) {
                                $button.addClass("btn-primary");
                            }
                        });
                    });

                    $("#available-live-themes").find(".av-content-install[data-content-theme='" + contentTheme + "']").parents(".av-content-container").find(".av-content-resolution-buttons").css("display","block");

                    if(contentInstalled) {
                        var command = (contentType == liveBackgroundType)  ? "changeVideoBackground" : "changeFlixerVideoBackground";

                        BRW_sendMessage({command: command, theme: contentTheme});

                        setDownloadingButtonState($el, contentType);
                    } else {
                        $resolutionButtons = $el.parent().parent().find(".av-content-resolution-buttons");
                        $resolutionButtons.show();
                        clearSelectQualityButtonText(installContentText, selectQualityText);
                        $el.text(selectQualityText);
                    }
                } else if(contentType == staticBackgroundType) {
                    //console.log(contentTheme);
                    BRW_sendMessage({command: "changeImageBackground", theme: contentTheme});
                    setDownloadingButtonState($el, contentType);
                }
            }
        } else {
            if(contentType == liveBackgroundType || contentType == flixelBackgroundType || contentType == liveThemesType) {
                $("#available-video-themes, #available-flixel-backgrounds").find(".av-content-resolution-buttons").hide();
                var $itemResolutionContainer = $el.parent().parent().find(".av-content-resolution-buttons");
                    $itemResolutionContainer.show();
                clearSelectQualityButtonText(installContentText, selectQualityText);
            }
        }
    }//

    /**
     * Add settings button click handler
     */
    function addSettingsContentButtonHandler() {
        $(document).on("click", ".av-content-img-settings", function(e) {
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
        $(".av-content-install").each(function() {
            var $installEl = $(this);
            if($installEl.text() == selectQualityText)
                $installEl.text(installContentText);
        });
    }

    /**
     * Set downloading button state
     *
     * @param $el jQuery element
     * @param contentType Int
     */
    function setDownloadingButtonState($el, contentType) {
        if(contentType == liveBackgroundType || contentType == flixelBackgroundType)
            clearInstallContentButtons(contentType);

        setInstallButtonClass($el, "btn-info");
        $(".av-content-install").attr("data-content-downloading", false);
        $el.attr("data-content-downloading", true);
        if(contentType == flixelBackgroundType)
            $el.text(translate("options_tabs_item_buttons_download_flixel") + "...");
        else
            $el.text(translate("options_tabs_item_buttons_download") + "...");
    }

    /**
     * Clear install content buttons
     *
     * @param contentType Int
     */
    function clearInstallContentButtons(contentType) {
        var $activeDataContainer = $(".available-themes-block");
        $activeDataContainer.find(".av-content-install").each(function() {
            var text = "";
            var $item = $(this);
            $item.removeClass("btn-success");
            var isInstalled = $item.attr("data-content-installed");
            isInstalled = isInstalled && isInstalled == "true";
            if(isInstalled) {
                text = translate("options_tabs_item_buttons_enable");
                $item.removeClass("btn-danger");
                if(!$item.hasClass("btn-primary"))
                    $item.addClass("btn-primary");
            } else {
                text = translate("options_tabs_item_buttons_install");
                if(contentType == flixelBackgroundType)
                    text = translate("options_tabs_item_buttons_install_flixer");

                $item.removeClass("btn-primary");
                if(!$item.hasClass("btn-danger"))
                    $item.addClass("btn-danger");
            }
            $item.text(text);
        });

        $activeDataContainer.find("a[data-content-downloading='true']").each(function() {
            var $item = $(this);
            $item.attr("data-content-downloading", false);
            $item.removeClass("btn-info");
        });

        $activeDataContainer.find("a[data-content-active='true']").each(function() {
            var $item = $(this);
            $item.attr("data-content-active", false);
            $item.removeClass("btn-success");
            var $viewItem = $item.parent().find(".av-content-view");
            if($viewItem && $viewItem.hasClass("active"))
                $viewItem.removeClass("active");
            
            var $settingsItem = $item.parent().parent().find(".av-content-img-settings");
            if($settingsItem && $settingsItem.hasClass("active"))
                $settingsItem.removeClass("active");
            
            var $removeItem = $item.parent().parent().find(".av-content-img-delete");
            if($removeItem){
                $removeItem.removeClass("active-disabled");                          
            }
        });

        if(contentType == staticBackgroundType) {
            $activeDataContainer.find(".av-content-img-settings.active").each(function() {
                $(this).removeClass("active");
            });
        }
    }

    /**
     * Update available themes list
     */
    function updateAvailableThemesListOnPageLoad() {
        BRW_sendMessage({command: "updateAvailableThemesList"}, function (availableThemesResponse) {
            BRW_sendMessage({command: "updateFlixelThemesList"}, function () {
                getAvailableThemes(availableThemesResponse, displayAvailableThemesList);
            });
        });
    }

    /**
     * Add background view button handler
     */
    function addSettingsBackgroundViewButtonHandler() {
        $(document).on("click", ".av-content-view", function(e) {
            e.preventDefault();
            if(getRandomThemesDisplay())
                setDisplayCurrentBackgroundFile();
            openUrlInNewTab(extensionGetUrl("/pages/newtab/newtab.html"));
        });
    }

    /**
     * Hide tooltip fix
     */
    function addTooltipsHideFix() {
        $(document).on("mouseleave", ".current-theme-download, .av-content-install, .av-content-restore", hideAllPageTooltips);
        $(document).on("mouseleave", ".installed-item-budge, .av-content-view, .load-more-flixel-content", hideAllPageTooltips);
    }

    /**
     * Hide page all tooltips
     */
    function hideAllPageTooltips() {
        $('[data-toggle="tooltip"]').tooltip('hide');
    }
    
    /**
     * Show favorites download note
     */
    var allContentInstalled = true;
    function favoritesDownloadNote(isInstalled) {        
        if(allContentInstalled && !isInstalled){
            allContentInstalled = false;
            $(".favorites-need-download").removeClass("hide");
        }
        
    }



