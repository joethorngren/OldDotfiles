var relaxBtnTimeOut;

/**
 * Get background image
 *
 * @param callback Function
 * @param data Object
 */

$(function(){
    BRW_langLoaded(function(){BRW_getFileSystem(function(){

        
        applyInterestBackground();
    });});
});

function getBackgroundImage(callback, data) {
    //console.debug("getBackgroundImage (start)", (Date.now()-TIMER)/1000, "sec");

    BRW_langLoaded(function(){
        //console.debug("getBackgroundImage (lang)", (Date.now()-TIMER)/1000, "sec");

        BRW_getFileSystem(function(){
        //console.debug("getBackgroundImage (fs)", (Date.now()-TIMER)/1000, "sec");
            
            
        var alreadyRun = false, gotResponse = false;        
        var runAnyway = setTimeout(
            function(){
                alreadyRun = true;
                //console.debug("getBackgroundImage (anyway)", (Date.now()-TIMER)/1000, "sec");

                if(callback) callback(data);
                
                displayPageHeader({
                    "parallaxValue" : getBackgroundParallaxValue(),
                    "visibleDials" : getVisibleSpeedDialPanel(),
                    "displayDials" : getDisplaySpeedDialPanel(),
                    "visibleTodoPanel" : getVisibleTodoPanel(),
                    "displayTodoDialPanel" : getDisplayTodoDialPanel(),
                    "displayTodoCoordinates" : getDisplayTodoCoordinates(),
                    "displayTodoSize" : getDisplayTodoSize()
                });
            }, 
            ((!BROWSER || BROWSER != "firefox") ? 1100 : 700/*250*/)
        );
        
        //if(!localStorage.getItem("flixel-themes-data"))
        var loadThemes = setTimeout(function(){
            localStorage.setItem("available-themes-data-next-update", 0);
            BRW_sendMessage({command: "updateAvailableThemesList"}, function (availableThemesResponse) {
                BRW_sendMessage({command: "updateFlixelThemesList"}, function () {
                    if(!gotResponse){
                        BRW_sendMessage({command: "getBackgroundImage"}, function(responseUPD) {
                            responseHandler(responseUPD);
                        });
                    }//if
                });
            });
        }, 3500);
        
        BRW_sendMessage({command: "getBackgroundImage"}, function(response) {
            if(
                typeof response == "object"
                && 
                (response.video || response.image)
            ){
                clearTimeout(runAnyway);
                clearTimeout(loadThemes);
            
                gotResponse = true;
                responseHandler(response);
            }//if
        });
        
        function responseHandler(response){
            if(typeof (response.video) != "undefined" && response.video) {
                updatePageBackgroundVideo(response);
            } else if(typeof (response.image) != "undefined" && response.image) {
                updatePageBackgroundImage(response);
            }
            
            if(!alreadyRun){
                if(callback) callback(data);
                displayPageHeader(response);
            }//if
        }//funuction
        
    });});
    
    $(window).on("focus", function(){
        backgroundVideoActionsButtons(true);
        //recalculateMediaSize();
    });
}

/**
 * Display page footer
 *
 * @param response Object
 */
function displayPageFooter(response) { 
    var $footer = $("#footer");
    var $footerLinksBlock = $footer.find("#footer-links-list-block");

    if(!$footer.is(":visible")) {

        if(!getDisplayTodoDialPanel() && !getDisplaySpeedDialPanel()) {
            $footer.addClass("footer-settings-only");
        } else if(!getDisplaySpeedDialPanel()) {
            $footer.addClass("footer-speed-dial-link-hide");
        } else if(!getDisplayTodoDialPanel()) {
            $footer.addClass("footer-todo-link-hide");
        }

        if(response.displayDials) {
            var $footerVisibleDials = $("<a></a>");
            var footerVisibleDialsText = response.visibleDials ? translate("page_footer_visible_dials_link_off") : translate("page_footer_visible_dials_link_on");
            $footerVisibleDials.attr("id", "footer-visible-dials");
            $footerVisibleDials.addClass("footer-visible-dials");
            $footerVisibleDials.addClass("footer-no-margin");
            $footerVisibleDials.attr("title", footerVisibleDialsText);
            //$footerVisibleDials.text(footerVisibleDialsText);
            
            $footerVisibleDials.append(
                $("<span>")
                    .addClass("footer-link-ico")
                    .append(
                        $("<img/>")
                            .addClass("dials-switch")
                            .attr("src", "./css/footer/dial_w.png")
                            .attr("action", "change")
                    )
            );
            
            
            setTimeout(function() {
                $footerVisibleDials.on("click", dialsPanelVisibleChange);
            }, 1500);
            
            
            $footerLinksBlock.append($footerVisibleDials);
        }

        getApplicationNewtabRatingModal(function(alreadyCloseModal) { // get rate modal window already show
            if(!alreadyCloseModal) {
                getApplicationRating(function(rating) { // get current application rating
                    if(!rating) {
                        getApplicationRatingShowStartTime(function(showTime) {
                            var currentTime = new Date().getTime();
                            if(currentTime > showTime) {
                                var $footerRateUs = $("<a></a>");
                                $footerRateUs.attr("id", "footer-rate-us");
                                $footerRateUs.addClass("footer-rate-us");
                                $footerRateUs.addClass("footer-settings-link");
                                
                                var $footerRateUsImg = $("<img>");
                                $footerRateUsImg.attr("src", extensionGetUrl("/pages/newtab/css/img/buttons/rate/star.png"));
                                $footerRateUs.html($footerRateUsImg);
                                $footerRateUs.html($footerRateUs.html() + translate("page_footer_rate_us"));
                                $footerRateUs.on("click", rateUsVisibleChange);
                                
                                $footerLinksBlock.prepend($footerRateUs);
                            }
                        });
                    }
                });
            }
        });

        toggleFooterLinksColor((typeof (response.image) != "undefined" && response.image) ||
            (typeof (response.video) != "undefined" && response.video));

        if(!$footer.is(":visible")) {
            var $toggleFooterLinksBtn = $("#footer-links-display-block");
            var toggleFooterLinksBtnTitle;
            if(true || getFooterLinksBlockDisplay()) {
                toggleFooterLinksBtnTitle = translate("page_footer_toggle_display_links_title_hide");
                $toggleFooterLinksBtn.attr("data-toggle", "tooltip");
                var $footerLinksListBlock = $("#footer-links-list-block");
                $footerLinksListBlock.addClass("footer-links-list-block-show");
            } else {
                toggleFooterLinksBtnTitle = translate("page_footer_toggle_display_links_title_show");
            }
            $toggleFooterLinksBtn.on("mouseleave", function() {
                $(this).tooltip('hide');
            });
            $toggleFooterLinksBtn.on("focusout", function() {
                $(this).tooltip('hide');
            });
            $toggleFooterLinksBtn.tooltip({"placement" : "top", "title" : toggleFooterLinksBtnTitle});
            
            
            $footer.find("#footer-toggle-display-links").on("click", function(e) {
                e.preventDefault();
                var $toggleFooterLinksBtn = $("#footer-links-display-block");
                var $footerLinksListBlock = $("#footer-links-list-block");
                var footerLinksListBlockIsVisible = $footerLinksListBlock.hasClass("footer-links-list-block-show");
                var toggleFooterLinksBtnTitle;
                if(footerLinksListBlockIsVisible) {
                    $footerLinksListBlock.removeClass("footer-links-list-block-show");
                    toggleFooterLinksBtnTitle = translate("page_footer_toggle_display_links_title_show");
                } else {
                    $footerLinksListBlock.addClass("footer-links-list-block-show");
                    toggleFooterLinksBtnTitle = translate("page_footer_toggle_display_links_title_hide");
                }
                $toggleFooterLinksBtn.attr("title", toggleFooterLinksBtnTitle);
                $toggleFooterLinksBtn.tooltip('hide').tooltip('fixTitle');
                BRW_sendMessage({command: "setFooterLinksBlockDisplay", val: !footerLinksListBlockIsVisible, tab: newtabPageTabId});
            });
            
            
            $footer.find("#footer-settings-link").on("click", function(e) {
                e.preventDefault();
                var url = extensionGetUrl("/pages/options/settings.html");
                
                var event = window.event || e;//Firefox
                
                if(event.ctrlKey || e.which == 2)//if(window.event.ctrlKey || e.which == 2)
                    openUrlInNewTab(url);
                else
                    openUrlInCurrentTab(url);
            });
            $footer.find("#footer-themes-link").on("click", function(e) {
                e.preventDefault();
                var url = extensionGetUrl("/pages/options/options.html");
               
                var event = window.event || e;//Firefox
                
                if(event.ctrlKey || e.which == 2)//if(window.event.ctrlKey || e.which == 2)
                    openUrlInNewTab(url);
                else
                    openUrlInCurrentTab(url);
            });

            var minBottomPanelOpacity = getBottomPanelOpacity();
            var maxBottomPanelOpacity = getMaxBottomPanelOpacity();
            var toggleOpacitySpeed = 500;
            var displayPageSpeed = 750;

            setTimeout(function() {
                $footer.on("focusin", function(){
                    $(this).animate({"opacity" : maxBottomPanelOpacity}, {"duration" : toggleOpacitySpeed, "queue" : false});
                });
                $footer.on("focusout", function(){
                    if(!$(this).filter(':hover').length/*.is(":hover")*/ && footerHidePrm())
                        $(this).animate({"opacity" : minBottomPanelOpacity}, {"duration" : toggleOpacitySpeed, "queue" : false});
                });
                $footer.hover(function(){
                    $(this).animate({"opacity" : maxBottomPanelOpacity}, {"duration" : toggleOpacitySpeed, "queue" : false});
                }, function() {
                    if(!$("#search-input").is(":focus") && footerHidePrm())
                        $(this).animate({"opacity" : minBottomPanelOpacity}, {"duration" : toggleOpacitySpeed, "queue" : false});
                });

                if(!$footer.filter(':hover').length/*.is(":hover")*/ && footerHidePrm())
                    $footer.animate({"opacity" : minBottomPanelOpacity}, 2000);
            }, 3000);

            $footer.css({"opacity" : 0, "display" : "inline-block"}).animate({"opacity" : maxBottomPanelOpacity}, displayPageSpeed);

        }
    }

    displayPageRelax(response);//displayPageFooterDescription(response);//porting
    
    floatMenuBottom();
}


function footerHidePrm(){
    var $footer = $("#footer");
    var $menu   = $("#footer-left-menu");
    if(
        (!$footer.hasClass("tour-target")) && 
        (!$menu.length || $menu.css("display") != "block")
    ){
        return true;
    }else{
        return false;
    }
}

/**
 * Display bottom float menu
 *
 */
function floatMenuBottom(){
    var $footer = $("#footer");
    var $block  = $("#float-menu-bottom");
    var $body   = $block.find(".float-menu-body");
    var $button = $block.find(".float-menu-toggle");
    var maxBottomPanelOpacity = getMaxBottomPanelOpacity();
    
    $todo = $(".todo-container");
	
	var closePrm = false;
    
    $button.on("click", function(){
        if($body.css("display") == "none"){
            handleMenuAction("show");
        }else{
            handleMenuAction("hide");
        }//else
    });
    
    $(document).on("mouseup", function(e){
		if(closePrm){
			if (
				!$block.is(e.target) &&
				!$block.has(e.target).length
			){
				handleMenuAction("hide");
			}//if
		}//if
    });
    
    $block.on("click", "li:not(.noClose)", function(){
        handleMenuAction("hide");
    });
	
	function handleMenuAction(action){
		if(action == "show"){
            $footer.stop(true, false).animate({"opacity" : maxBottomPanelOpacity}, 250);
			$body.fadeIn("fast");
			$todo.addClass("todo-container-back");
			
			setTimeout(function(){
				closePrm = true;
			}, 500);
		}else if(closePrm){
			$body.fadeOut("fast", function(){
				$todo.removeClass("todo-container-back");
			});
			closePrm = false;
		}//else
	}
}//function

/**
 * Display page relax block
 *
 * @param response Object
 */
function displayPageRelax(response) {
    if(getDisplayRelax()) {
        var $relax = $("#relax");
        var $startRelaxBtn = $relax.find("#relax-start-btn");
        if(!$startRelaxBtn.is(":visible")) {
            var $toggleRelaxBtn = $relax.find("button");
            $startRelaxBtn.attr("title", translate("page_relax_start_title").replace('Enjoy', "Enjoy"));
            $startRelaxBtn.attr("data-toggle", "tooltip");
            var $stopRelaxBtn = $relax.find("#relax-done-btn, #relax-done-btn-audio");

            $startRelaxBtn.on("mouseleave", function() {
                $(this).tooltip('hide');
            });
            $startRelaxBtn.on("focusout", function() {
                $(this).tooltip('hide');
            });
            $startRelaxBtn.tooltip({"placement" : "top", "delay": {show: 600}});

            var $relaxItems;
            var $relaxItemsSelector = "#mv-container, #header, #header-weather, #footer-description, #todo-container, #footer, #tou, #sidebar-wrap";
            var displayPageSpeed = 1500;

            $startRelaxBtn.on("click", function(e) {
                e.preventDefault();
                relaxSwitcher("start");
            });

            $stopRelaxBtn.on("click", function(e) {
                e.preventDefault();
                relaxSwitcher("stop");
            });

            disableRelaxBtnHoverEffect($toggleRelaxBtn);
            enableRelaxBtnHoverEffect($startRelaxBtn, 3000);

            setTimeout(function() {
                if(typeof TOUR == "object" && TOUR.state.show) return;
                
                if(!$startRelaxBtn.filter(':hover').length/*.is(":hover")*/)
                    $startRelaxBtn.animate({"opacity" : 0}, {"duration" : 2000, "queue" : false});
            }, 3000);

            $startRelaxBtn.css({"opacity" : 0, "display" : "inline-block"}).animate({"opacity" : 0.75}, displayPageSpeed);
        }
    }
    displayPageFooterDescription(response);
}

var relaxSwitcherLastState = false;
function relaxSwitcher(action){
    //console.debug("relaxSwitcher", action);
    if(typeof RelaxAdv == "object") RelaxAdv.relaxMode(action);
    
    if(action == relaxSwitcherLastState) return false;
    else relaxSwitcherLastState = action;
    
    var $relax = $("#relax");
    var $startRelaxBtn = $relax.find("#relax-start-btn");
    var $toggleRelaxBtn = $relax.find("button");
    var $stopRelaxBtn = $relax.find("#relax-done-btn, #relax-done-btn-audio");
    var $relaxItems;
    var $relaxItemsSelector = "#mv-container, #header, #header-weather, #footer-description, #todo-container, #footer, #tou, #sidebar-wrap";
    var displayPageSpeed = 1500;
    
   //-----------------------------//
    
    switch (action){
        case "start":
            localStorage.setItem("fullscreen-meditation", 1);
            
            var relaxModeDisableState = getRelaxModalDisable();
            $toggleRelaxBtn.tooltip('hide');

            var $startRelaxBtn = $("#relax-start-btn");
            disableRelaxBtnHoverEffect($toggleRelaxBtn);
            $startRelaxBtn.hide();

            if(relaxModeDisableState) {
                var $stopRelaxBtn = $("#relax-done-btn, #relax-done-btn-audio");
                $stopRelaxBtn.stop().css({"opacity" : 0, "display" : "inline-block"}).animate({"opacity" : 0.75}, {"duration" : 400, "queue" : false});
                if(relaxBtnTimeOut)
                    clearTimeout(relaxBtnTimeOut);
                relaxBtnTimeOut = setTimeout(function() {
                    var $stopRelaxBtn = $("#relax-done-btn, #relax-done-btn-audio");
                    /*
                    if(!$stopRelaxBtn.filter(':hover').length.is(":hover"))
                        $stopRelaxBtn.animate({"opacity" : 0}, {"duration" : 1000, "queue" : false});
                    */
                }, 2000);
                enableRelaxBtnHoverEffect($stopRelaxBtn);
            }

            $relaxItems = $($relaxItemsSelector);
            $relaxItems.each(function() {
                var $el = $(this);
                if(!$el.hasClass("item-relax-mode") && $el.is(":visible"))
                    $el.addClass("item-relax-mode");
            });
            sendToGoogleAnaliticMP(function() {
                gamp('send', 'event', 'relax', 'click');
            });

            if(relaxModeDisableState) {
                startRelaxMode();
            } else {
                var $modal = $('#relax-modal-content');
                setTimeout(function(){
                    $modal.modal();
                    
                }, 50);
            }
            
            setMeditationBgImage();
            
            $("#cursor-hide-curtain").css("display","none");
        break;
            
        case "stop":
            $('#relax-modal-content').modal("hide");
            
            localStorage.setItem("fullscreen-meditation", 0);

            $toggleRelaxBtn.tooltip('hide');

            var $startRelaxBtn = $("#relax-start-btn");
            var $stopRelaxBtn = $("#relax-done-btn, #relax-done-btn-audio");

            disableRelaxBtnHoverEffect($toggleRelaxBtn);
            $stopRelaxBtn.hide();
            $startRelaxBtn.stop().css({"opacity" : 0, "display" : "inline-block"}).animate({"opacity" : 0.75}, {"duration" : 400, "queue" : false});

            if(relaxBtnTimeOut)
                clearTimeout(relaxBtnTimeOut);
            relaxBtnTimeOut = setTimeout(function() {
                var $startRelaxBtn = $("#relax-start-btn");
                if(!$startRelaxBtn.filter(':hover').length/*.is(":hover")*/)
                    $startRelaxBtn.animate({"opacity" : 0}, {"duration" : 1000, "queue" : false});
            }, 2000);
            enableRelaxBtnHoverEffect($startRelaxBtn);

            $relaxItems = $($relaxItemsSelector);
            $relaxItems.each(function() {
                var $el = $(this);
                if($el.hasClass("item-relax-mode"))
                    $el.removeClass("item-relax-mode");
            });
            stopRelaxMode();
            
            calculateNewTodoPosition();
            
            if(localStorage.getItem("background-image-file") && !localStorage.getItem("background-video-file")){
                $("#background-container").css({
                    width: "auto",
                    height: "auto",
                    "background-image": "none"
                });
            }
            
            $("#cursor-hide-curtain").css("display","none");
        break;
    }//switch
        
    if(typeof Focus == "object" && typeof Focus.hider == "function") Focus.hider(action);
    
    var $popup = $("#dials-notifications");
    if($popup.is(":visible")) {
        if(displayPopupTimeOut) clearTimeout(displayPopupTimeOut);
        $popup.fadeOut();
    }
}

function setMeditationBgImage(){
    if(localStorage.getItem("background-image-file") && !localStorage.getItem("background-video-file")){
        $("#background-container").css({
            width: screen.width,
            height: screen.height,
            "background-image": $("body").css("background-image")
        });
    }
}

/**
 * Relax mode show current button
 */
function relaxModeShowCurrentButton() {
    var $stopRelaxBtn = $("#relax-done-btn, #relax-done-btn-audio");
    //$stopRelaxBtn.stop().css({"opacity" : 0, "display" : "inline-block"}).animate({"opacity" : 0.75}, {"duration" : 400, "queue" : false}); // Task #553
    if(relaxBtnTimeOut)
        clearTimeout(relaxBtnTimeOut);
    relaxBtnTimeOut = setTimeout(function() {
        /*
        if(!$stopRelaxBtn.is(":hover"))
            $stopRelaxBtn.animate({"opacity" : 0}, {"duration" : 1000, "queue" : false});
        */
    }, 2000);
}

/**
 * Enable relax buttons hover effect
 *
 * @param $btn jQuery element
 * @param time Number
 */
function enableRelaxBtnHoverEffect($btn, time) {
    if($btn.hasClass('relax-done-btn')) return; // Task #553
    
    setTimeout(function() {
        $btn.off("mouseenter", relaxBtnHoverEffectEnter).on("mouseenter", relaxBtnHoverEffectEnter);
        $btn.off("mouseleave", relaxBtnHoverEffectLeave).on("mouseleave", relaxBtnHoverEffectLeave);
    }, time || 2000);
}

/**
 * Relax buttons hover effect enter
 */
function relaxBtnHoverEffectEnter() {
    $(this).stop().animate({"opacity" : 0.75}, {"duration" : 750, "queue" : false});
}

/**
 * Relax buttons hover effect leave
 */
function relaxBtnHoverEffectLeave() {
    $(this).stop().animate({"opacity" : 0}, {"duration" : 750, "queue" : false});
}

/**
 * Disable relax buttons hover effect
 *
 * @param $btn jQuery element
 */
function disableRelaxBtnHoverEffect($btn) {
    $btn.off('mouseenter', relaxBtnHoverEffectEnter).off("mouseleave", relaxBtnHoverEffectLeave);
}

/**
 * Display page footer description
 *
 * @param response Object
 */
function displayPageFooterDescription(response) { 
    var $footerDescription = $("#footer-description");
    if(!$footerDescription.is(":visible")) {
        toggleTouLinksColor(
            (typeof (response.image) != "undefined" && response.image) ||
            (typeof (response.video) != "undefined" && response.video) ||
            (BROWSER && BROWSER == "firefox")
        );
        if (!getWelcomePageState()) {
            $(document).on("click", "#footer-description-close", function () {
                changeWelcomePageState();
                $("#footer-description").fadeOut(750);
            });
            setTimeout(function () {
                $footerDescription.fadeIn(750);
            }, 2500);
        }
    }
    displayTermsOfUse(response);
}

/**
 * Display page dials notice
 *
 * @param response Object
 */
function addPageDialsNoticeCloseHandler(response) { 
    $(document).on("click", "#dials-notification-message-close", function () {
        changeDialsNoticeHideState();
        var $popup = $("#dials-notifications");
        if($popup.is(":visible")) {
            if(displayPopupTimeOut) clearTimeout(displayPopupTimeOut);
            $popup.fadeOut(displayPopupTimeOut);
        }
    });
}

/**
 * Display application terms of use
 *
 * @param response Object
 */
function displayTermsOfUse(response) { 
    var $tou = $("#tou");
    if(!$tou.is(":visible")) {
        setTimeout(function() {
            $tou.fadeIn(750);
        }, 250);
    }
    displayTodoLink(response);
}

/**
 * Toggle footer links color
 *
 * @param lightTheme Bool
 */
function toggleFooterLinksColor(lightTheme) { 
    var lightThemeClass = "footer-settings-link";
    var darkThemeClass = "footer-settings-link-dark";
    var footerClass = lightTheme ? lightThemeClass : darkThemeClass;
    var $footer = $("#footer");
    var footerLinks = $footer.find("a");
    if(lightTheme) {
        if(!footerLinks.hasClass(lightThemeClass))
            footerLinks.removeClass(darkThemeClass).addClass(lightThemeClass);
    }
    else {
        if(!footerLinks.hasClass(darkThemeClass))
            footerLinks.removeClass(lightThemeClass).addClass(darkThemeClass);
    }
    footerLinks.addClass(footerClass);
}

/**
 * Display page header
 *
 * @param response Object
 */
var displayPageHeaderShown = false;
function displayPageHeader(response) { 
    if(displayPageHeaderShown) return;
    else displayPageHeaderShown = true;
    
    var $header = $("#header");
    
    $header.html("");
    
    var hideHeader = (localStorage.getItem("browser-mode") == "opera") || false;
    
    if(!$header.is(":visible") && !hideHeader) {
        toggleHeaderLinksColor((typeof (response.image) != "undefined" && response.image) ||
                               (typeof (response.video) != "undefined" && response.video));

        getDisplayAppsLink(function(display) {
            if(display) {
                var $headerApps = $("<a></a>");
                $headerApps.attr("id", "header-settings-link");
                $headerApps.attr("tabindex", "-1");
                $headerApps.addClass("header-apps");
                $headerApps.addClass("header-settings-link");
                $headerApps.attr("href", "chrome://apps/");
                $headerApps.off("click", onOpenAppsPageClick).on("click", onOpenAppsPageClick);

                var $headerAppsImg = $("<img>");
                $headerAppsImg.attr("id", "page-header-links-apps-img");
                $headerAppsImg.attr("src", extensionGetUrl("/pages/newtab/css/img/buttons/background/apps.png"));
                $headerAppsImg.attr("title", translate("page_header_links_apps_img"));

                var $headerAppsText = $("<span></span>");
                $headerAppsText.attr("id", "page-header-links-apps");
                //$headerAppsText.text(translate("page_header_links_apps"));  // Task 514

                $headerApps.append($headerAppsImg).append($headerAppsText);
                $header.append($headerApps);
            }
        });

        getBookmarksDisable(function(disable) { // get current application bookmarks disable status
            if (!disable) {
                var $headerBookmarks = $("<a></a>");
                $headerBookmarks.attr("id", "header-bookmarks");
                $headerBookmarks.attr("tabindex", "-1");
                $headerBookmarks.addClass("header-bookmarks");
                $headerBookmarks.addClass("header-settings-link");
                $headerBookmarks.html($headerBookmarks.html() + translate("page_header_bookmarks"));
                $headerBookmarks.on("click", bookmarksVisibleChange);
                $header.append($headerBookmarks);
            }
        });

        setTimeout(function() {
            $header.fadeIn(750);
        }, 250);
    }
    displayPageFooter(response);
}

/**
 * Open applications page click handler
 *
 * @param e Event
 */
function onOpenAppsPageClick(e) { 
    var url = 'chrome://apps/';
    var event = window.event || e;//Firefox

    if(event.ctrlKey || e.which == 2)//if(window.event.ctrlKey || e.which == 2)
        openUrlInNewTab(url);
    else
        openUrlInCurrentTab(url);
}

/**
 * Toggle header links color
 *
 * @param lightTheme Bool
 */
function toggleHeaderLinksColor(lightTheme) { 
    var lightThemeClass = "header-settings-link";
    var darkThemeClass = "header-settings-link-dark";
    var headerClass = lightTheme ? lightThemeClass : darkThemeClass;
    var $header = $("#header");
    var $headerLinks = $header.find("a");
    if(lightTheme) {
        if(!$headerLinks.hasClass(lightThemeClass))
            $headerLinks.removeClass(darkThemeClass).addClass(lightThemeClass);
    }
    else {
        if(!$headerLinks.hasClass(darkThemeClass))
            $headerLinks.removeClass(lightThemeClass).addClass(darkThemeClass);
    }
    $headerLinks.addClass(headerClass);
}

/**
 * Toggle terms of use links color
 *
 * @param lightTheme Bool
 */
function toggleTouLinksColor(lightTheme) { 
    var lightThemeClass = "tou-link";
    var darkThemeClass = "tou-link-dark";
    var headerClass = lightTheme ? lightThemeClass : darkThemeClass;
    var $header = $("#tou");
    var $headerLinks = $header.find("a");
    if(lightTheme) {
        if(!$headerLinks.hasClass(lightThemeClass))
            $headerLinks.removeClass(darkThemeClass).addClass(lightThemeClass);
    }
    else {
        if(!$headerLinks.hasClass(darkThemeClass))
            $headerLinks.removeClass(lightThemeClass).addClass(darkThemeClass);
    }
    $headerLinks.addClass(headerClass);
}

/**
 * Update page background image
 *
 * @param data Object
 */
function updatePageBackgroundVideo(data, mode) {
    //console.debug("updatePageBackgroundVideo", data, mode);
    
    var $body = $("body");
    if(!$body.hasClass("dark-background"))
        $body.addClass("dark-background");
        
    data.video = data.video ? data.video : "";
    
    //$("#background").remove();
    //$("#background-container").remove();
    
    var $videoContainer = $("#background-container");
    var $video = $("<video></video>");
    $video.attr("id", "background");
    $video.attr("autoplay", "autoplay");
    $video.attr("loop", "loop");
    $video.attr("src", data.video);
    $video.css({"opacity" : 0});
    
    $video[0].volume = 0;
                                          
    $video.addClass("layer").attr("data-depth", 0.0065 * data.parallaxValue);
    $video.addClass("fill");
    
    $videoContainer/*.html("")*/.append($video);
    
    if(data.enableParallax) {
        $videoContainer.addClass("parallax");
        if(videoBgParallaxScene)
            videoBgParallaxScene.parallax('updateLayers');
        else
            videoBgParallaxScene = $videoContainer.parallax();
    } else {
        $videoContainer.addClass("static");
    }
    
    var $poweredLink = $("#powered-link");
    var $createdLink = $("#created-link");
    var $termsLink = $("#terms-link");
    var $privacyLink = $("#privacy-link");
    
    if(typeof (data['isFlixelVideoContent']) != "undefined" && data['isFlixelVideoContent']) {
        $poweredLink.css({"display" : "inline-block", "opacity" : 0.85});
        if(typeof (data['flixelVideoContentAuthor']) != "undefined" && data['flixelVideoContentAuthor'] != "undefined" && data['flixelVideoContentAuthor']) {
            var Author = String(data.flixelVideoContentAuthor).replace('https://','').replace('http://','').replace('www.','');
            
            $createdLink.css({"display" : "inline-block", "opacity" : 0.85});
            $createdLink.text(translate("page_created_link") + " " + Author);
            
            if(localStorage.getItem("background-video-content-handmade") && localStorage.getItem("background-video-content-handmade") ==1){
                $createdLink.text(translate("page_created_link_handmade") + " " + Author);
            }
            
            var authorUrl = String(getBackgroundVideoFlixelContentAuthorUrl(data.flixelVideoContentAuthor));
            
            $createdLink.attr("href", authorUrl);
            
            if(authorUrl.indexOf('flixel.com') !== -1){
                $poweredLink.removeClass('hide');
            }else{
                $poweredLink.addClass('hide');
            }
        }
    }
    
    var showTime = 750;
    var opacity = 0.35;
    
    setTimeout(function() {
        var $poweredLink = $("#powered-link");
        var $createdLink = $("#created-link");

        $poweredLink.animate({ opacity: opacity }, showTime);
        $createdLink.animate({ opacity: opacity }, showTime);
    }, 3500);
    
    
    isAcceptedLocation((allow)=>{
        if(allow){
            $termsLink.css({"display" : "inline-block", "opacity" : 0.85});
            $privacyLink.css({"display" : "inline-block", "opacity" : 0.85});

            setTimeout(function() {
                var $termsLink = $("#terms-link");
                var $privacyLink = $("#privacy-link");

                $termsLink.animate({ opacity: opacity }, showTime);
                $privacyLink.animate({ opacity: opacity }, showTime);
            }, 3500);
        }else{
            $termsLink.remove();
            $privacyLink.remove();
            $("#powered-link").css("margin-right", 0);
        }
    });
    
    themeVideoShow($video, mode == "slide" ? 1000 : false);
}

/**
 * Video show animation
 *
 * @param $video jQuery element
 * @param showTime Int
 */
function themeVideoShow($video, showTime) { 
    var player = backgroundVideoActionsState();
    
    showTime = showTime || 300;
    
    $video.show();
    
    if(
        player != "pause"
        &&
        (
            !localStorage.getItem("background-video-stopper") ||
            Date.now() > parseInt(localStorage.getItem("background-video-stopper"))
        )
    ){
        videoBackgroundForcePlay(document.getElementById("background"));//firefox
    }else{
        backgroundVideoActions("pause");
    }
    
    var delay=250;
    if(browserName() == "opera") delay = 370;
    
    setTimeout(function() {
        $video.animate({ opacity: 1 }, showTime);
        $("#background-container img").animate({ opacity: 1 }, showTime);//firefox
        
        recalculateMediaSize();
        
        setTimeout(()=>{
            //recalculateMediaSize();
        }, showTime + 30);
    }, delay);//210
    
    backgroundVideoActionsButtons();
}

//firefox forced play stack video
function videoBackgroundForcePlay(video){
    //console.log("Video status: "+video.currentTime+" / "+video.duration);
    
    if(backgroundVideoActionsState() == "play"){
        if(video.currentTime == 0){
            video.play();
            video.volume = 0;
        }
    }
}

function removeCurrentThemeVideo() { 
    var $body = $("body");
    if($body.hasClass("dark-background"))
        $body.removeClass("dark-background");

    var $videoContainer = $("#background-container");
    $videoContainer.find("video").each(function() {
        $(this).hide().remove();
    });
}

/**
 * Update page background image
 *
 * @param data Object
 * @param callback Function
 */
function updatePageBackgroundImage(data, callback) { 
    var $body = $("body");
    if(!$body.hasClass("dark-background"))
        $body.addClass("dark-background");

    var $termsLink = $("#terms-link");
    var $privacyLink = $("#privacy-link");
    
    isAcceptedLocation((allow)=>{
        if(allow){
            $termsLink.css({"display" : "inline-block", "opacity" : 0.85});
            $privacyLink.css({"display" : "inline-block", "opacity" : 0.85});

            setTimeout(function() {
                var $termsLink = $("#terms-link");
                var $privacyLink = $("#privacy-link");
                var showTime = 750;
                var opacity = 0.35;

                $termsLink.animate({ opacity: opacity }, showTime);
                $privacyLink.animate({ opacity: opacity }, showTime);
            }, 3500);
        }else{
            $termsLink.remove();
            $privacyLink.remove();
            $("#powered-link").css("margin-right", 0);
        }
    });

    if(data.enableParallax) {
        data.image = data.image ? data.image : "";
        var $imageContainer = $("#background-image-container");
        var $image = $("<img/>");
        $image.attr("id", "background-image");
        $image.attr("src", data.image);
        $image.css({"opacity" : 0});
        $image.addClass("layer").attr("data-depth", 0.0065 * data.parallaxValue);
        $image.addClass("fill");
        $imageContainer.html("").append($image);
        if(data.enableParallax) {
            $imageContainer.addClass("parallax");
            if(imageBgParallaxScene)
                imageBgParallaxScene.parallax('updateLayers');
            else
                imageBgParallaxScene = $imageContainer.parallax();
        } else {
            $imageContainer.addClass("static");
        }
        themeImageShow($image);
    } else {
         data.image = data.image ? data.image + "?d=" + new Date().getTime() : "";
         
         $("body"/*document.documentElement*/).css({
             "background-image" : "url("+ data.image.replace( "(", "\\(" ).replace( ")", "\\)" ) +")",
             "background-position" : "center center",
             "background-size" : "cover",
             "background-repeat" : "no-repeat",
             "background-attachment" : "fixed",
             //"width": "100%",
             //"height": "100%",
         });

         $("#squaresLoadingProgress").text(0);
         setTimeout(function() {
         if(typeof (callback) != "undefined")
            callback(data);
         }, 250);
    }

}

/**
 * Image show animation
 *
 * @param $image jQuery element
 * @param showTime Int
 */
function themeImageShow($image, showTime) { 
    showTime = showTime || 300;
    $image.show(0);
    
    var delay=250;
    if(browserName() == "opera") delay = 370;
    
    setTimeout(function() {
        recalculateMediaSize();
        $image.animate({ opacity: 1 }, showTime);
    }, delay);//200
}

/**
 * Get media scale size
 *
 * @param boxWidth Int
 * @param boxHeight Int
 * @param imgWidth Int
 * @param imgHeight Int
 * @returns {{width: *, height: (number|*)}}
 */
function getMediaScaleSize(boxWidth, boxHeight, imgWidth, imgHeight) {// 
    var ratio = imgHeight / imgWidth;
    imgWidth = boxWidth;
    imgHeight = boxWidth * ratio;
    if (imgHeight < boxHeight) {
        imgHeight = boxHeight;
        imgWidth = imgHeight / ratio;
    }
    return {
        "width": imgWidth,
        "height": imgHeight
    };
}

/**
 * Recalculate media size
 */
var consoleRecalculateMediaSize = 0, mediaSizeWidthAdd = false;
function recalculateMediaSize(mW, mH) {    
    //console.debug("recalculateMediaSize");
    //console.trace();
    
    var isParallax = getDisplayParallaxVideoTheme();
    var isVideoTheme = getBackgroundVideoFile() && getDisplayVideoTheme();
    
    var browserHeight = Math.round($(window).height());
    if(isVideoTheme) {
        if(isParallax)
            browserHeight = parseInt(browserHeight * 1.2);
        else
            browserHeight += 40;
    }
    
    if(mediaSizeWidthAdd === false){
        if(browserName() == "opera") mediaSizeWidthAdd = 20;
        else mediaSizeWidthAdd = 5;
    }//if
    
    var browserWidth = Math.round($(window).width());
    
    //console.log("WINDOW SIZE", browserWidth, " x ", Math.round($(window).height()), " > ", browserWidth, " x ", browserHeight);
                
    if(isVideoTheme) {
        if(isParallax)
            browserWidth = parseInt(browserWidth * 1.2);
        else
            browserWidth += 30;
    }
    
    //console.log(browserWidth);

    var fills = $('.fill');
    fills.each(function () {
        var mediaWidth = $(this).width();
        var mediaHeight = $(this).height();
        
        //console.log("MEDIA SIZE real", mediaWidth, " x ", mediaHeight);
        
        if(mediaWidth <= 300 && mediaHeight <= 150) {
            mediaWidth = 1920;
            mediaHeight = 1080 + parseInt(mediaSizeWidthAdd);
        }
        
        if(mediaHeight == 1080) mediaHeight += parseInt(mediaSizeWidthAdd);
        
        if(mW) mediaWidth = mW;
        if(mH) mediaHeight = mH;
        
        //console.log("MEDIA SIZE safe", mediaWidth, " x ", mediaHeight);
        
        var newSize = getMediaScaleSize(browserWidth, browserHeight, mediaWidth, mediaHeight);
        
        //console.log("NEW SIZE", JSON.stringify(newSize));
        
        $(this).width(newSize.width).height(newSize.height)
            .css("margin-left", ((browserWidth - newSize.width)/2))
            .css("margin-top", ((browserHeight - newSize.height)/2));
    });
}

/**
 * Change window size handler
 */
$(function() {
    //var calcPlanned = false;
    
    $(window).resize(function() {
        recalculateMediaSize();
        /*
        if(!calcPlanned){
            calcPlanned = true;
            
            setTimeout(function(){
                recalculateMediaSize();
                calcPlanned = false;
            }, 50);
        }//if
        */
    });
});

/**
 * Display loading video theme error
 *
 * @param message Object
 */
function displayLoadingVideoThemeError(message) { 
    var $popup = $("#popupDownloadVideoThemeOverlay");
    var $buttons = $popup.find(".control-buttons");

    var $progress = $(".squaresLoadingProgress");
    var $error = $(".squaresLoadingError");
    if($progress.is(":visible"))
        $progress.hide();
    if(!$error.is(":visible"))
        $error.show();
    $error.find("#squaresLoadingError").text(message.errorMessage);

    if(!$buttons.is(":visible")) {
        getPageCloseVideoPopupEl().on("click", themeVideoOfferPopupCloseHandler);
        $buttons.slideDown(250);
    }
}

/**
 * Display loading video theme progress
 *
 * @param message Object
 */
function displayLoadingVideoThemeProgress(message) { 
    var $popup = $("#popupDownloadVideoThemeOverlay");

    var $buttons = $popup.find(".control-buttons");
    if($buttons.is(":visible")) {
        getPageCloseVideoPopupEl().off("click", themeVideoOfferPopupCloseHandler);
        $buttons.hide();
    }

    var currentOpacity = $popup.css("opacity");
    if(currentOpacity)
        updateLoadingVideoThemeProgress(message.percentComplete);
    
    displayLoadingProgressInPopup(message);
}

/**
 * Update loading video theme progress
 *
 * @param progress Int
 */
function updateLoadingVideoThemeProgress(progress) {     
    var $popup = $("#popupDownloadVideoThemeOverlay");
    var $loading = $popup.find(".loading");
    var $progress = $(".squaresLoadingProgress");
    var $error = $(".squaresLoadingError");
    if($error.is(":visible"))
        $error.hide();
    if(!$loading.is(":visible"))
        $loading.show();
    if(!$progress.is(":visible"))
        $progress.show();

    $progress.find("#squaresLoadingProgress").text(progress);
}

/**
 * Display loaded background video theme
 *
 * @param message Object
 */
function displayLoadedBackgroundVideoTheme(message) { 
    $("#squaresLoadingProgress").text(100);
    var popup = $("#popupDownloadVideoThemeOverlay");
    var currentOpacity = popup.css("opacity");
    if(currentOpacity)
        themeVideoHidePopup(popup, function(popup) {
            popup.hide();
        });

    if(message.display)
        updatePageBackgroundVideo(message);
}

/**
 * Display loading image theme error
 *
 * @param message Object
 */
function displayLoadingImageThemeError(message) { 
    var $popup = $("#popupDownloadImageTheme");
    var currentOpacity = $popup.css("opacity");
    if(currentOpacity) {
        var $progress = $(".circleLoadingProgress");
        var $error = $(".circleLoadingError");
        if($progress.is(":visible"))
            $progress.hide();
        if(!$error.is(":visible"))
            $error.show();
        $error.find("#circleLoadingError").text(message.errorMessage);
        setTimeout(function() {
            $popup.fadeOut(500, function() {
                $("#circleLoadingProgress").text(0);
            });
        }, 1500);
    }
}

/**
 * Display loading image theme progress
 *
 * @param message Object
 */
function displayLoadingImageThemeProgress(message) { 
    var stopper  = localStorage.getItem("dont-install-theme") || false;
    var interest = localStorage.getItem("install-interesting-theme") || false;
    var sheduled = localStorage.getItem("chrome-theme-video-sheduled") || false;
    
    if(
        $("#preload-modal-content").is(":visible") ||
        (interest && interest != "installed") ||
        (sheduled) ||
        (stopper)
    ) return;
    
    var $popup = $("#popupDownloadImageTheme");
    if(!$popup.is(":visible"))
        $popup.show();
    updateLoadingImageThemeProgress(message.percentComplete);
    
    displayLoadingProgressInPopup(message);
}

/**
 * Update loading image theme progress
 *
 * @param progress Int
 */
function updateLoadingImageThemeProgress(progress) { 
    var $progress = $(".circleLoadingProgress");
    var $error = $(".circleLoadingError");
    if($error.is(":visible"))
        $error.hide();
    if(!$progress.is(":visible"))
        $progress.show();
    $progress.find("#circleLoadingProgress").text(progress);
}

/**
 * Display loaded background video theme
 *
 * @param message Object
 */
function displayLoadedBackgroundImageTheme(message) { 
    
    
    $("#circleLoadingProgress").text(100);
    var $popup = $("#popupDownloadImageTheme");
    $popup.fadeOut(500, function() {
        $("#circleLoadingProgress").text(0);
    });
    removeCurrentThemeVideo();
    updatePageBackgroundImage(message);
    displayPageHeader(message);
}

/**
 * Display loading theme progress in popup
 *
 * @param message Object
 */
function displayLoadingProgressInPopup(message){
    var $container = $(".preload-progress");
    
    if($container.length){
        $container.text(message.percentComplete+"%");
    }//if
}//function

/**
 * Hide theme video download offer
 *
 * @param message
 */
function hideThemeVideoDownloadOffer(message) { 
    themeVideoOfferPopupCloseHandler();
}

function backgroundVideoActions(action){
    var video = document.getElementById("background");
    
    try{
        if(action == 'play'){
            video.play();
            video.volume = 0;
        }else if(action == 'pause'){
            video.pause();
        }else{
            return 'Unknown action: "action"; Try "play" or "pause".';
        }
    }catch(ex){
        if(typeof DEVMSG != "undefined" && DEVMSG) console.warn(ex);
    }
    
    return action;
}

function backgroundVideoActionsButtons(justRender, forceRender){
    if(!localStorage.getItem("background-video-file")){
        return false;
    }
    
    var $player = $(".player");
    var $menu   = $(".menu-player");
    var $relaxBtn = $(".relax-control-video");
    
    var state = backgroundVideoActionsState();
    $menu.css({"display": "block"});
    $relaxBtn.removeClass("hide");
    
    var $btn  = {
        play  : $player.find(".ico-play "),
        pause : $player.find(".ico-pause"),
    };
    
    if(!justRender){
        //$player.css("display","block").attr("visible", true);
        
        $btn.play.unbind("click").on("click", function(){
            state = backgroundVideoActionsState("play");
            backgroundVideoActions(state);
            btnRender();
        });

        $btn.pause.unbind("click").on("click", function(){
            state = backgroundVideoActionsState("pause");
            backgroundVideoActions(state);
            btnRender();
        });
        
        $relaxBtn.unbind("click").on("click", function(){
            var setState = $relaxBtn.hasClass("active") ? "pause" : "play";
            state = backgroundVideoActionsState(setState);
            backgroundVideoActions(setState);
            btnRender();
        });
        
        $menu.unbind("click").on("click", function(){
            if(backgroundVideoActionsState() == "pause"){
                var setState = "play";
            }else{
                var setState = "pause";
            }//else
            
            
            state = backgroundVideoActionsState(setState);
            backgroundVideoActions(state);
            btnRender();
        });
        
    }else if($player.css("display") != "block" && !forceRender){
        return false;
    }//else
    
    btnRender();
    
    function btnRender(){
        
        if(state == "play"){
            $btn.play.css("display","none");
            $btn.pause.css("display","block");
            $menu.find("span").text(translate("menu_float_pause"));
            $menu.find(".glyphicon").removeClass("glyphicon-play").addClass("glyphicon-pause");
            $relaxBtn.addClass("active");
        }else{
            $btn.play.css("display","block");
            $btn.pause.css("display","none");
            $menu.find("span").text(translate("menu_float_play"));
            $menu.find(".glyphicon").removeClass("glyphicon-pause").addClass("glyphicon-play");
            $relaxBtn.removeClass("active");
        }//else
    }
}

function backgroundVideoActionsState(setState){
    if(
        typeof setState != "undefined"
        &&
        (["play", "pause"].indexOf(String(setState)) != -1)
    ){
        localStorage.setItem("background-video-state", setState);
    }
    
    return localStorage.getItem("background-video-state") || "play";
}


function applyInterestBackground(){
    if(getAutoDownloadVideos() != 1) return false;
    
    var install  = localStorage.getItem("install-key") || false;
    var interest = localStorage.getItem("install-interesting-theme");
    var sheduled = localStorage.getItem("chrome-theme-video-sheduled") || false;
    var process  = localStorage.getItem("install-interesting-in-process") || false;
    
    if(
        (
            (!install || (Date.now()-install) < 15000)
            &&
            (BROWSER == 'chrome' || MEDIA)
            &&
            (interest && interest != "installed")
        )
        ||
        (sheduled && parseInt(sheduled) == 1)
    ){//&&
        localStorage.setItem("dont-reload-tabs", "15s-"+Date.now());
        
        if(!sheduled){
            var data = JSON.parse(localStorage.getItem("install-interesting-theme-data"));
        }else{
            var data = JSON.parse(localStorage.getItem("chrome-theme-video-data"));
        }//else
        
        if(
            process 
            &&
            String(process).split('|')[0] == String(data.id)
            &&
            Date.now() - parseInt(String(process).split('|')[1]) < 15 * 60 * 1000
        ){
            console.debug('theme rejected');
            return false;
        }
        
        localStorage.setItem("install-interesting-in-process", data.id + "|" + Date.now());
        
        var thumb = getFullThemesContentUrl(data.id, data.bgFileThumb);
        
        $(".options-preload-popup-body-img-big").attr("src", thumb);
        
        var $modal = $('#preload-modal-content');
        
        $modal.modal();
        
        /*
        $modal.click(function(event){
            event.preventDefault();
            event.stopPropagation();
        });
        */
        
        //console.log(data);
        
        var command = {
            theme: data.id
        };
        
        switch(data.contentType){
            case liveBackgroundType:
                command.command = "changeVideoBackground";
                for(var k in data.bgVideoSize){
                    command.resolution = k;
                }
            break;
            
            case flixelBackgroundType:
                command.command = "changeFlixerVideoBackground";
                
                for(var k in data.bgVideoSize){
                    command.resolution = k;
                }//for
            break;
                
            case staticBackgroundType:
            case liveThemesType:
                command.command = "changeImageBackground";
            break;
        }//switch
        
        if(!command.resolution){
            for(var k in data.bgVideoPath){
                command.resolution = k;
            }
        }
                
        if(command.command && command.theme) {
            localStorage.setItem("settings-welcome-state", 1);
            
            //console.info(command);
            
            BRW_sendMessage(command);
            
            var bgWait = setInterval(function() { 
                if(
                    String(localStorage.getItem("background-image-file")).indexOf(data.id) > -1
                    ||
                    String(localStorage.getItem("background-video-file")).indexOf(data.id) > -1
                ) {  
                    clearInterval(bgWait);  
                    
                    var $video = $("#background-container video");
                    var $img   = $("#background-container img");

                    $modal.find(".preload-modal-loading").hide();
                    $modal.find(".preload_modal_status").text(translate("preload_modal_done"));
                    $modal.find("#options-preload-popup-hide").text(translate("preload_modal_done"));
                    $modal.find("#options-preload-break").addClass("hide");

                    $video
                        .delay(450)
                        .css({
                            position: "absolute",
                            top: 0,
                            left: 0
                        })
                        .animate({"opacity":"0.01"}, function(){
                            $("#popupDownloadImageTheme").remove();
                            $img.remove();
                            $video.remove();
                        })
                    ;

                    $("#created-link").html("").attr("href","").hide();
                    $(".menu-player").css({"display": "none"});
                    $(".player icon").hide();
                    $(".relax-control-video").addClass("hide");

                    //console.debug(".relax-control-video", "HIDE");
                    
                    localStorage.setItem("background-video-content-author", (data.username ? data.username : ""));
                    localStorage.setItem("background-video-content-author-url", (data.author_url ? data.author_url : ""));

                    getBackgroundImage();

                    displayLoadingProgressInPopup({percentComplete:100});

                    localStorage.setItem("install-interesting-theme", "installed");
                    localStorage.removeItem("install-interesting-theme-data");
                    localStorage.removeItem("install-interesting-in-process")
                    
                    var contentType = 3;

                    if(sheduled){
                        localStorage.setItem("settings-background-current-tab", 3);
                        localStorage.removeItem("chrome-theme-video-data");
                        localStorage.removeItem("chrome-theme-video-sheduled");
                        localStorage.removeItem("available-themes-data-next-update");
                        localStorage.removeItem("flixel-themes-data-next-update");

                        contentType = 4;

                    }//if

                    if(localStorage.getItem("background-video-file")){
                        localStorage.setItem("background-video-content-type", contentType);

                        setTimeout(function(){
                            localStorage.setItem("background-video-content-type", contentType);
                            
                        }, 1500);
                    }//if
                                            
                    setTimeout(function(){
                        //localStorage.removeItem("dont-reload-tabs");
                        $modal.modal("hide");
                    }, 15000);
                    
                    setTimeout(function(){
                        localStorage.removeItem("dont-reload-tabs");
                        BRW_sendMessage({command: "reloadOptionsTabPages"});
                        BRW_sendMessage({command: "reloadFavoritesTabPages"});
                        BRW_sendMessage({command: "reloadNewTabPages", tab: newtabPageTabId});
                    }, 1000);
                    
                    
                    if(parseInt(localStorage.getItem("settings-background-current-tab")) != 3){
                        BRW_sendMessage({command: "updateAvailableThemesList"}, function (availableThemesResponse) {
                            BRW_sendMessage({command: "updateFlixelThemesList"}, function () {
                                if(typeof RelaxAdv == "object") RelaxAdv.getThemesList();
                            });
                        });
                    }
                }//if
            }, 500);
            
            $modal.on('hidden.bs.modal', function (e) {
                
            });
            
            $("#options-preload-break").on("click", function(){
                localStorage.setItem("dont-install-theme", data.id + "-180s-" + Date.now());
                
                localStorage.removeItem("install-interesting-theme");
                localStorage.removeItem("install-interesting-theme-data");
                
                localStorage.removeItem("chrome-theme-video-data");
                localStorage.removeItem("chrome-theme-video-sheduled");
                
                setTimeout(()=>{
                    //console.debug("reloadNewTabPages", newtabPageTabId);
                    BRW_sendMessage({command: "reloadNewTabPages", tab: newtabPageTabId});
                }, 90);
            });
            
            //console.debug("newtabPageTabId", newtabPageTabId);
        }//if
        
    }//if
}//applyInterestBackground