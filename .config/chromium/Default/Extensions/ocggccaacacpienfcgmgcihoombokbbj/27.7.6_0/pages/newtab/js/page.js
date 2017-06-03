    /**
     * New tab page speed dial
     * display thumbs, remove
     */

    var imageBgParallaxScene = null;
    var videoBgParallaxScene = null;
    var newtabPageTabId;
    //var groupsAndDialsLastRefresh;

    /**
     * Get background params
     *
     * @param callback Function
     * @param data Object
     */
    function getBackgroundParams(callback, data) { 
        //console.debug("getBackgroundParams (start)", (Date.now()-TIMER)/1000, "sec");
        
        BRW_sendMessage({command: "getBackgroundParams"}, function(response) {
            //console.debug("getBackgroundParams (stop)", (Date.now()-TIMER)/1000, "sec");
            
            data.installed = response.currentAppInstalled;
            data.currentDownloadImage = response.currentDownloadImage;
            data.currentDownloadVideo = response.currentDownloadVideo;
            data.displayTilesCount = response.displayTilesCount;
            data.displayVideoTheme = response.displayVideoTheme;
            data.displayParallaxVideoTheme = response.displayParallaxVideoTheme;
            data.displaySpeedDialPanel = response.displaySpeedDialPanel;
            
            if(callback)
                callback(displayHistoryItems, data);
            else
                displayHistoryItems(data);
        });
    }

    /**
     * Process messages
     * from application background
     */
    
    /*Moved to browser (page) choiser*/
    PGS_addNewtabListener();

    /**
     * Clear page body element
     */
    function clearPageBody() { 
        var body = $('body');
        var bodyCount = body.length;
        
        if(localStorage.getItem("background-video-file")){
            $("#loading").fadeOut("slow");
        }else{
            $("#loading").remove();
        }
        
        if(bodyCount) {
            body.each(function(index) {
                if(index < bodyCount - 1)
                    $(this).remove();
            });
        }
    }

    /**
     * Translate page content
     */
    function translatePage() { 
        $("title").text(translate("page_meta_title"));
        $("meta[name=description]").attr("content", translate("page_meta_description"));
        $("meta[name=keywords]").attr("content", translate("page_meta_keywords"));

        $("#popup-live-bg-title").text(translate("popup_live_bg_title"));
        $("#popup-live-bg-text").text(translate("popup_live_bg_text"));
        $("#applyThemeBg").text(translate("popup_live_bg_apply"));
        $("#cancelThemeBg").text(translate("popup_live_bg_cancel"));
        $("#popup-static-bg-updating").text(translate("popup_static_bg_updating"));

        $("#search-placeholder").text(translate("page_search_placeholder"));

        $("#dials-notification-message-text").html(translate("page_dials_notification_message"));
        $("#dials-notification-message-close").attr('title', translate("page_footer_description_close"));
        $("#page-bottom-notice-settings").html(translate("page_bottom_notice_settings"));
        $("#footer-description-close").attr("title", translate("page_footer_description_close"));

        $("#footer-settings-link").text(translate("page_footer_settings_link"));
        $("#footer-themes-link").text(translate("page_footer_themes_link"));
        //$("#relax-start-btn-text").text(translate("page_relax_start_btn"));
        $("#relax-done-btn-text").text(translate("page_relax_done_btn"));
        $("#terms-link").text(translate("page_terms_link"));
        $("#privacy-link").text(translate("page_privacy_link"));
        $("#todo-link-text").text(translate("page_todo_link"));
        
        $(".sync-link-text").text(translate("sync_link_text"));

        $("#todo-header-counter-text").text(translate("page_todo_header_counter_text"));
        $("#todo-footer-input").attr("placeholder", translate("page_todo_footer_input"));
        $("#todo-header-toggle").text(translate("page_todo_header_toggle"));
        $("#empty-todo-list-title").text(translate("page_empty_todo_list_title"));
        $("#empty-todo-list-description").text(translate("page_empty_todo_list_description"));
        $("#done-todo-list-title").text(translate("page_done_todo_list_title"));
        $("#done-todo-list-description").text(translate("page_done_todo_list_description"));
        $("#todo-footer-input-submit").text(translate("page_todo_footer_input_submit"));
        
        $(".search-button-item-text").text(translate("page_search_form_button_text"));
        $("#search-speed-container").attr('title', translate("page_voice_search_form_button_text"));

        $("#options-application-rating-popup-title-mark").text(translate("options_application_rating_popup_title_mark"));
        $("#options-application-rating-popup-item-bad").text(translate("options_application_rating_popup_item_bad"));
        $("#options-application-rating-popup-item-better").text(translate("options_application_rating_popup_item_better"));
        $("#options-application-rating-popup-item-awesome").text(translate("options_application_rating_popup_item_awesome"));
        $("#options-application-rating-popup-item-already").text(translate("options_application_rating_popup_item_already"));
        $("#options-application-rating-popup-title-thanks").text(translate("options_application_rating_popup_title_thanks"));

        $("#weather-intro-text").text(translate("options_application_weather_intro_text"));
        $("#weather-location-current").attr("title", translate("options_application_weather_location_current"));
        $("#weather-city").attr("title", translate("options_application_weather_city"));
        $("#weather-error-text-location").text(translate("options_application_weather_error_text_location"));
        $("#weather-input-city-field").attr("placeholder", translate("options_application_weather_error_text_location_placeholder"));

        $("#options-bookmarks-popup-title").text(translate("options_bookmarks_popup_title"));
        
        $("#options-relax-popup-body-top-text").text(translate("options_relax_popup_body_top_text"));
        $("#options-relax-popup-body-bottom-text-1").text(translate("options_relax_popup_body_bottom_text_1"));
        $("#options-relax-popup-body-bottom-text-2").text(translate("options_relax_popup_body_bottom_text_2"));
        $("#options-relax-popup-body-bottom-text-3").text(translate("options_relax_popup_body_bottom_text_3"));
        $("#options-relax-popup-body-bottom-text-4").text(translate("options_relax_popup_body_bottom_text_4"));
        $("#options-relax-popup-body-bottom-text-5").text(translate("options_relax_popup_body_bottom_text_5"));
        $("#options-relax-popup-body-bottom-tip").text(translate("options_relax_popup_body_bottom_tip"));

        $("#options-bookmarks-popup-close").text(translate("options_bookmarks_popup_close"));
        $("#options-bookmarks-popup-hide").text(translate("options_bookmarks_popup_hide"));

        $("#options-relax-popup-title").text(translate("options_relax_popup_title"));
        $("#options-relax-popup-close").text(translate("options_relax_popup_close"));
        $("#options-relax-popup-hide").text(translate("options_relax_popup_hide"));

        $("#sidebar-title").text(translate("page_sidebar_title"));
        $("#sidebar-settings-button").attr('title', translate("page_footer_settings_link"));
        $("#sidebar-add-group").text(translate("page_sidebar_add_group"));

        $("#add-new-dial-dialog-title").text(translate("add_new_dial_dialog_title"));
        $("#add-new-dial-field-url").text(translate("add_new_dial_field_url"));
        $("#add-new-dial-field-name").text(translate("add_new_dial_field_name"));
        $("#add-new-dial-field-group").text(translate("add_new_dial_field_group"));
        $("#add-new-dial-text-groupName").text(translate("add_new_dial_text_groupName"));
        $("#add-new-dial-field-groupName").text(translate("add_new_dial_field_groupName"));
        $("#add-new-dial-dialog-close").text(translate("add_new_dial_dialog_close"));
        $("#add-new-dial-dialog-apply").text(translate("add_new_dial_dialog_apply"));

        $("#add-new-group-dialog-title").text(translate("add_new_group_dialog_title"));
        $("#add-new-group-field-name").text(translate("add_new_group_field_name"));
        $("#add-new-group-dialog-close").text(translate("add_new_group_dialog_close"));
        $("#add-new-group-dialog-apply").text(translate("add_new_group_dialog_apply"));

        $("#delete-group-dialog-title").text(translate("delete_group_dialog_title"));
        $("#delete-group-dialog-body-1").text(translate("delete_group_dialog_body_1"));
        $("#delete-group-dialog-body-2").text(translate("delete_group_dialog_body_2"));
        $("#delete-group-dialog-close").text(translate("delete_group_dialog_close"));
        $("#delete-group-dialog-apply").text(translate("delete_group_dialog_apply"));
        
        //Universal translator
        autoTranslate($("body"));
        /*
        $("[lang]").each(function(){
            var text = translate($(this).attr("lang"));
            
            if(text.indexOf("DOLLAR") > -1) text = text.split("DOLLAR").join("$");
            if(text.indexOf("ROUBLE") > -1) text = text.split("ROUBLE").join("₽");
            
            switch(String($(this)[0].tagName).toLocaleLowerCase()){
                case "input":
                    $(this).attr("placeholder", text);
                break;
                    
                case "img": case "icon":
                    $(this).attr("title", text);
                break;
                    
                default:
                    $(this).text(text);
            }//switch
        });
        */
    }

    $(function() {
        BRW_langLoaded(function(){
            getNewTabCurentTab(function() {
                clearPageBody();
                translatePage();
                
                if(getDisplaySpeedDialPanel()) {
                    getSidebarGroups();
                    initAddNewGroupPopup();
                    initDeleteGroupPopup();
                    initAddNewDialPopup();
                    getNewDialGroups();
                }
                
                checkMenuActionsHandler();
            });
        });
        
        onWindowResizeHandler();
        
        if(browserName() == "firefox" && !localStorage['install-key'] || Date.now() - localStorage['install-key'] < 10000){
            $("body").addClass("notloaded");
            
            setTimeout(()=>{
                $("body").removeClass("notloaded");
            }, 2500);
        }
    });
    

    function checkMenuActionsHandler(){
        if(browserName(true) != "ff") return false;
        
        BRW_sendMessage({"command": "checkContextMenu"});
    }//function

    /**
     * Get newtab current tab
     */
    /*Moved to browser (page) choiser*/
    function getNewTabCurentTab(callback) { 
        PGS_getNewTabCurentTab(callback);
    }
    
    
    function cantAddGroupWithNoSites(){
        $.jGrowl(translate("cant_add_new_group_with_no_dials"), { "life" : 3000 , position:"top-left"});
    }

    onWindowResizeFunctions = {};
    function onWindowResizeHandler(){
        window.onresize = function(event){
            //console.info("Window Resize", event);
            if(typeof onWindowResizeFunctions == "object"){
                for(var key in onWindowResizeFunctions){
                    if(typeof onWindowResizeFunctions[key] == "function"){
                        //console.info(key);
                        onWindowResizeFunctions[key].call(false, event);
                    }
                }
            }
        }
    }

    function pageLoadActions(){
        if(getDisplaySpeedDialPanel()){
            BRW_sendMessage({"command": "getActiveGroup", "withDials" : false}, function(data) {
                var groupId = data && data.group ? data.group.id : null;

                if(groupId) $("body").removeClass("notloaded");

                if(groupId == GROUP_POPULAR_ID) {
                    analyzeHistory(buildTilesList);
                } else {
                    startPrepareCurrentGroupTiles();
                }
            });
        }else{
            getBackgroundParams(getBackgroundImage, {"dials" : [], "group" : {}}); // Task #768
        }
    }


$(()=>{
    pageLoadActions();
});