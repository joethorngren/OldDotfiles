    /**
     * Application theme popup
     * video and image theme
     */

    /**
     * Popup apply click handler
     *
     * @param e Event
     */
    function onPopupApplyClickHandler(e) { 
        var $popup = $("#popupDownloadVideoThemeOverlay");
        var $el = $popup.find("#applyThemeBg");
        var themeId = $el.attr("data-theme-id");
        
        BRW_sendMessage({command: "applyVideoThemeOffer", theme: themeId}, function (response) {
            if (response.startDownloadVideoTheme) {
                var $popup = $("#popupDownloadVideoThemeOverlay");
                var $buttons = $popup.find(".control-buttons");
                if($buttons.is(":visible")) {
                    //getPageCloseVideoPopupEl().off("click", themeVideoOfferPopupCloseHandler);
                    $buttons.slideUp(250);
                }
                //$popup.find(".loading").show();
            }
        });
    }

    /**
     * Popup cancel click handler
     *
     * @param e Event
     */
    function onPopupCancelClickHandler(e) { 
        var $el = $(this);
        var themeId = $el.attr("data-theme-id");
        BRW_sendMessage({command: "cancelVideoThemeOffer", theme: themeId});
    }

    /**
     * Check display video theme offer
     *
     * @param response Object
     */
    function checkPageDisplayVideoThemeOffer(response) { 
        if(response && response.display) {
            if(typeof (response.theme) != "undefined") {
                var $popup = $("#popupDownloadVideoThemeOverlay");
                var $buttons = $popup.find(".control-buttons");
                var $applyButton = $popup.find("#applyThemeBg");
                var $cancelButton = $popup.find("#cancelThemeBg");

                $applyButton.off("click", onPopupApplyClickHandler)
                    .on ("click", onPopupApplyClickHandler)
                    .attr("data-theme-id", response.theme.id);

                $cancelButton.off("click", onPopupCancelClickHandler)
                    .on ("click", onPopupCancelClickHandler)
                    .attr("data-theme-id", response.theme.id);

                if(response.currentDownloadVideo) {
                    $buttons.hide();
                } else
                    $buttons.show();

                if(!response.alreadyDisplayVideo) {
                    setTimeout(function() {
                        displayDownloadVideoThemeOffer(response.theme, !response.currentDownloadVideo);
                    }, response.currentDownloadVideo ? 0 : 1000);
                }
            }
        } else {
            closeNewTabPagePopup();
        }
    }

    /**
     * Close new tab page popup
     */
    function closeNewTabPagePopup() { 
       var popup = $("#popupDownloadVideoThemeOverlay");
       var currentOpacity = popup.css("opacity");
       if(currentOpacity)
           themeVideoHidePopup(popup, function(popup) {
               popup.hide();
           });
    }

    /**
     * Display download video theme offer
     *
     * @param theme Object
     * @param showDownloadButtons Bool
     */
    function displayDownloadVideoThemeOffer(theme, showDownloadButtons) { 
        var popup = $("#popupDownloadVideoThemeOverlay");
        if(popup.is(":visible"))
            themeVideoHidePopup(popup, function(popup) {
                popup.hide();
                popup.find(".loading").hide();
                animateDownloadVideoThemeOffer(popup, theme, showDownloadButtons);
            });
        else
            animateDownloadVideoThemeOffer(popup, theme, showDownloadButtons);
    }

    /**
     * Animate download video theme
     *
     * @param popup jQuery element
     * @param theme Object
     * @param showDownloadButtons Bool
     */
    function animateDownloadVideoThemeOffer(popup, theme, showDownloadButtons) { 
        var popupContent = popup.find("#themeBackgroundAdjustPreviewContainer");
        var $applyButton = popup.find("#applyThemeBg");
        var $cancelButton = popup.find("#cancelThemeBg");

        $applyButton.off("click", onPopupApplyClickHandler)
            .on ("click", onPopupApplyClickHandler)
            .attr("data-theme-id", theme.id);

        $cancelButton.off("click", onPopupCancelClickHandler)
            .on ("click", onPopupCancelClickHandler)
            .attr("data-theme-id", theme.id);

        var image = new Image();
        image.onload = function() {
            var currentOpacity = popup.css("opacity");
            if(currentOpacity)
                themeVideoHidePopup(popup, function(popup) {
                    popup.hide();
                    popup.find(".loading").hide();
                    themeVideoShowPopup(popup, showDownloadButtons);
                });
            else
                themeVideoShowPopup(popup, showDownloadButtons);
        };

        var hash = new Date().getTime();
        theme.thumbImage += "?t=" + hash;
        theme.thumbVideo += "?t=" + hash;

        $(image).attr("src", theme.thumbImage)
                .attr("data-video", theme.thumbVideo);
        $(image).attr("id", "themeBackgroundAdjustPreview");
        popupContent.find("img").each(function() { // remove all theme thumbs
            $(this).remove();
        });
        popupContent.find("video").each(function() { // remove all video video preview
            $(this).remove();
        });
        popupContent.prepend(image);
    }

    /**
     * Popup close event handler
     */
    function themeVideoOfferPopupCloseHandler() { 
        var popup = $("#popupDownloadVideoThemeOverlay");
        var searchForm = $("#search-input");
        if(!searchForm.is(":focus")) {
            themeVideoHidePopup(popup, function(popup) {
                popup.hide()
                    .find(".loading")
                    .hide();
            });
        }
    }

    /**
     * Video theme offer popup
     * show animation
     *
     * @param $popup jQuery element
     * @param addEventHandler Bool
     * @param showTime Int
     */
    function themeVideoShowPopup($popup, addEventHandler, showTime) { 
        var $el = getPageCloseVideoPopupEl();
        $el.off("click", themeVideoOfferPopupCloseHandler);
        //if(addEventHandler)
            $el.on("click", themeVideoOfferPopupCloseHandler);

        $popup = $popup || $("#popupDownloadVideoThemeOverlay");
        showTime = showTime || 250;
        $popup.show().animate({ opacity: 1 }, showTime);
    }

    /**
     * Video theme offer popup
     * hide animation
     *
     * @param $popup jQuery element
     * @param callback Function
     * @param hideTime Int
     */
    function themeVideoHidePopup($popup, callback, hideTime) { 
        var $el = getPageCloseVideoPopupEl();
        $el.off("click", themeVideoOfferPopupCloseHandler);

        $popup = $popup || $("#popupDownloadVideoThemeOverlay");
        hideTime = hideTime || 250;
        $popup.animate({ opacity: 0 }, hideTime, "swing", function() {
            callback($popup);
        });
    }

    /**
     * Get close video popup elements
     *
     * @returns {*|jQuery|HTMLElement}
     */
    function getPageCloseVideoPopupEl() { 
        return $("body, #cancelThemeBg");
    }

    $(function () {
        BRW_sendMessage({command: "checkDisplayVideoThemeOffer"}, checkPageDisplayVideoThemeOffer);

        $("#offerAdjustBgToTheme").on("click", function (e) { // Popup prevent close event handler
            e.stopPropagation();
        });
    });