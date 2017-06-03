    if(typeof NAVI != "undefined" && typeof onLoadNavi == "object"){
        onLoadNavi.push(onPageLoadCommon);
    }else{
        $(function() {
            onPageLoadCommon();
        });
    }
    
    function onPageLoadCommon(){
        BRW_langLoaded(function(language){
            translatePage();
            
            //console.log(language);
            
            if(language.indexOf("ru") != -1){
                $('#vk-group-link').css('display','inline-block');
            }//if
        });

        displayBackToNewtabPageLink();
        displayTopShareButtons();
        
        addFeedbackLinkClickButtonHandler();
        addHelpLinkClickButtonHandler();
        addApplicationRatingClickHandler();
        simpleTooltipHandler();
        browserInstallLinksHandler();
        
        browsersOnlyShow();
    }

    /**
     * Application options common page
     */

    /**
     * Process messages
     * from application background
     */
    
    /*Moved to browser page script*/
    PGS_addOptionsListener();
    
    /**
     * Translate page content
     */
    function translatePage() {
        var translateText = "";

        $("title").text(translate("options_meta_title"));
        $("meta[name=description]").attr("content", translate("page_meta_description"));
        $("meta[name=keywords]").attr("content", translate("page_meta_keywords"));

        $("#options-page-title").text(translate("options_header_title"));
        $("#settings-content-tab-button").text(translate("options_header_buttons_select_live_bg"));
        $("#settings-favorite-tab-button").text(translate("options_header_buttons_select_favorite_bg"));
        $("#settings-control-tab-button").text(translate("options_header_buttons_control_settings"));
        $("#feedback-link").text(translate("options_header_buttons_feedback"));
        //$("#help-link").text(translate("options_header_buttons_help"));
        $("#back-to-newtab-link").text(translate("options_header_buttons_close_settings"));

        $("#current-powered-video-text").text(translate("options_tabs_content_flixel_bg_notice"));
        $("#available-flixel-themes-button  span").text(translate("options_tabs_title_flixel_bg"));
        $("#available-video-themes-button span").text(translate("options_tabs_title_live_bg"));
        $("#available-image-themes-button span").text(translate("options_tabs_title_static_bg"));
        $("#available-live-themes-button  span").text(translate("options_tabs_title_live_theme"));
        $(".selectedTxt").text(translate("selected_txt"));
        $("#current-theme-video-note").text(translate("options_tabs_content_live_bg_notice"));
        $("#current-theme-live-note").text(translate("options_tabs_content_live_theme_notice"));
        $("#video-themes-coming-soon-note").text(translate("options_tabs_content_live_theme_notice"));
        $("#tab-content-loading-text").text(translate("options_tabs_content_loader_text"));

        $(".options-settings-random-themes-enable-notice").text(translate("options_settings_random_themes_enable_notice_short"));
        $(".options-settings-random-themes-enable-favorites").text(translate("options_settings_random_themes_enable_notice_favorites"));
        $(".options-settings-random-themes-enable-downloaded").text(translate("options_settings_random_themes_enable_notice_downloaded"));
        
        
        $("#not-available-themes-container-text").text(translate("options_tabs_favorite_no_bg"));
        
        $("#options-settings-themes-sort-new").text(translate("options_settings_themes_sort_new"));
        $("#options-settings-themes-sort-popular").text(translate("options_settings_themes_sort_popular"));
        $("#options-settings-themes-sort-featured").text(translate("options_settings_themes_sort_featured"));
        $("#options-settings-themes-sort-downloaded").text(translate("options_settings_themes_sort_downloaded"));
        $("#options-settings-themes-sort-search").text(translate("options_settings_themes_sort_search"));
        
        $("#delete-from-favorite-dialog-text").text(translate("options_tabs_delete_from_favorite"));
        $("#delete-from-favorite-dialog-close").text(translate("options_tabs_delete_from_favorite_close"));
        $("#delete-from-favorite-dialog-confirm").text(translate("options_tabs_delete_from_favorite_confirm"));

        $("#delete-theme-dialog-text").text(translate("options_tabs_delete_theme"));
        $("#delete-theme-dialog-close").text(translate("options_tabs_delete_theme_close"));
        $("#delete-theme-dialog-confirm").text(translate("options_tabs_delete_theme_confirm"));
        
        $("#queue-over-dialog-text").text(translate("queue_over_dialog_text"));
        $("#queue-over-dialog-ok").text(translate("queue_over_dialog_ok"));
        
        $("#vk-group-link").text(translate("vk_our_group"));

        $("#options-settings-images-sort-gallery").text(translate("options_settings_images_sort_gallery"));
        $("#options-settings-images-sort-your"  ).text(translate("options_settings_images_sort_your"));
        $("#options-settings-images-add").text(translate("options_settings_images_add"));

        $("#upload-image-dialog-title").text(translate("upload_image_dialog_title"));
        $(".upload-image-progress-text").text(translate("upload_image_progress_text"));
        $("#upload-image-dialog-close").text(translate("upload_image_dialog_close"));
        $("#upload-image-dialog-apply").text(translate("upload_image_dialog_apply"));
        $("#upload-image-name").text(translate("upload_image_name"));
        $("#upload-image-url").text(translate("upload_image_url"));
        $("#upload-image-dialog-choise").text(translate("upload_image_dialog_choise"));
        $("#upload-image-dialog-or").text(translate("upload_image_dialog_or"));
        $("#upload-image-dialog-error-title").text(translate("upload_image_dialog_error_title"));
        $("#upload-image-dialog-error-file").text(translate("upload_image_dialog_error_file"));
        $("#upload-image-dialog-error-url").text(translate("upload_image_dialog_error_url"));
        $("#newImageTitle").attr("placeholder", translate("upload_image_dialog_placeholder"));
        
        $("#options-settings-clock-basic-href").text(translate("options_settings_clock_basic_href"));
        $("#options-settings-clock-advanced-href").text(translate("options_settings_clock_advanced_href"));
        $("#options-settings-clock-title").text(translate("options_settings_clock_title"));
        $("#options-settings-clock-show").text(translate("options_settings_clock_show"));
        $("#options-settings-clock-seconds-show").text(translate("options_settings_clock_seconds_show"));

        $("#clock-color-text-h").text(translate("options_settings_clock_color_text_h"));
        $("#clock-time-color-text").text(translate("options_settings_clock_color_text_time"));
        $("#clock-label-color-text").text(translate("options_settings_clock_color_text_label"));
        $("#clock-ampm-label-color-text").text(translate("options_settings_clock_color_text_ampm_label"));
        $("#clock-digit-bg-color-text").text(translate("options_settings_clock_color_text_digit_bg"));
        $("#clock-circle-done-line-color-text").text(translate("options_settings_clock_color_text_done_line"));
        $("#clock-circle-total-line-color-text").text(translate("options_settings_clock_color_text_total_line"));
        $("#clock-border-line-color-text").text(translate("options_settings_clock_color_text_border_line"));

        $("#options-settings-weather-title").text(translate("options_settings_weather_title"));
        $("#options-settings-weather-show").text(translate("options_settings_weather_show"));
        $("#options-settings-weather-location").text(translate("options_settings_weather_location"));
        $("#weather-location").attr('placeholder', translate("options_settings_weather_location_placeholder"));
        $("#options-settings-weather-location-change").attr("title", translate("options_settings_weather_location_change"));
        $("#options-settings-weather-location-set").attr("title", translate("options_settings_weather_location_set"));
        $("#options-settings-weather-location-cancel").attr("title", translate("options_settings_weather_location_cancel"));
        $("#weather-location-current-img").attr('title', translate("options_settings_weather_location_img_title"));
        $("#weather-location-current-block-text").text(translate("options_settings_weather_location_block_text"));
        $("#options-settings-weather-reset-position").text(translate("options_settings_weather_reset_position"));
        $("#weather-reset-position-btn").text(translate("options_settings_weather_reset_position_btn"));
        $("#options-settings-weather-unit").text(translate("options_settings_weather_unit"));
        $("#options-settings-weather-unit-show").text(translate("options_settings_weather_unit_show"));
        $("#options-settings-weather-background-show").text(translate("options_settings_weather_background_show"));
        $("#options-settings-weather-opacity").text(translate("options_settings_weather_opacity"));
        $("#options-settings-weather-background-opacity").text(translate("options_settings_weather_background_opacity"));

        $("#options-settings-todo-title").text(translate("options_settings_todo_title"));
        $("#options-settings-todo-show").text(translate("options_settings_todo_show"));
        $("#options-settings-todo-position").text(translate("options_settings_todo_position"));
        $("#todo-position-btn").text(translate("options_settings_todo_position_btn"));

        $("#options-settings-top-panel").text(translate("options_settings_page_top_panel"));
        $("#options-settings-apps-link-display").text(translate("options_settings_apps_link_display"));
        $("#options-settings-bottom-panel").text(translate("options_settings_bottom_panel"));
        $("#options-settings-page-bottom-panel-opacity").text(translate("options_settings_page_bottom_panel_opacity"));

        $("#options-settings-speed-dial-title").text(translate("options_settings_speed_dial_title"));
        $("#options-settings-speed-dial-show").text(translate("options_settings_speed_dial_show"));
        $("#options-settings-speed-dial-count").text(translate("options_settings_speed_dial_count"));
        $("#options-settings-popular-group-show").text(translate("options_settings_popular_group_show"));
        $("#options-settings-popular-group-show-name").text(translate("page_dials_popular_group_title"));
        $("#options-settings-speed-dial-count-max").text(translate("options_settings_speed_dial_count_max"));
        $("#options-settings-speed-dial-open-type").text(translate("options_settings_speed_dial_open_type"));
        $("#options-settings-speed-dial-open-type-current").text(translate("options_settings_speed_dial_open_type_current"));
        $("#options-settings-speed-dial-open-type-new").text(translate("options_settings_speed_dial_open_type_new"));
        $("#options-settings-speed-dial-open-type-background").text(translate("options_settings_speed_dial_open_type_background"));
        $("#options-settings-speed-dial-opacity").text(translate("options_settings_speed_dial_opacity"));

        $("#options-settings-speed-search-title").text(translate("options_settings_speed_search_title"));
        $("#options-settings-search-form-display").text(translate("options_settings_search_form_display"));
        $("#options-settings-speed-search-opacity").text(translate("options_settings_speed_search_opacity"));
        $("#options-settings-search-open-type").text(translate("options_settings_search_open_type"));
        $("#options-settings-search-open-type-current").text(translate("options_settings_speed_dial_open_type_current"));
        $("#options-settings-search-open-type-new").text(translate("options_settings_speed_dial_open_type_new"));
        $("#options-settings-search-open-type-background").text(translate("options_settings_speed_dial_open_type_background"));
        $("#options-settings-search-form-provider").text(translate("options_settings_search_form_provider"));

        $("#options-settings-clock-date").text(translate("options_settings_clock_date"));
        $("#options-settings-clock-type").text(translate("options_settings_clock_type"));
        $("#options-settings-clock-format").text(translate("options_settings_clock_format"));
        $("#options-settings-clock-format-label").text(translate("options_settings_clock_format_label"));
        $("#options-settings-clock-visible-label").text(translate("options_settings_clock_visible_label"));
        $("#options-settings-clock-font-bold").text(translate("options_settings_clock_font_bold"));
        $("#clock-color-scheme-default").text(translate("options_settings_clock_scheme_default"));
        $("#clock-color-scheme-light").text(translate("options_settings_clock_scheme_light"));
        $("#clock-color-scheme-dark").text(translate("options_settings_clock_scheme_dark"));

        $("#options-settings-clock-background").text(translate("options_settings_clock_background"));
        $("#options-settings-clock-background-none").text(translate("options_settings_clock_background_none"));
        $("#options-settings-clock-background-light").text(translate("options_settings_clock_background_light"));
        $("#options-settings-clock-background-dark").text(translate("options_settings_clock_background_dark"));
        $("#options-settings-clock-background-light-long").text(translate("options_settings_clock_background_light_long"));
        $("#options-settings-clock-background-dark-long").text(translate("options_settings_clock_background_dark_long"));

        $("#options-settings-clock-opacity").text(translate("options_settings_clock_opacity"));
        $("#options-settings-clock-background-opacity").text(translate("options_settings_clock_background_opacity"));
        $("#options-settings-clock-type-0").text(translate("options_settings_clock_type_0"));
        $("#options-settings-clock-type-3").text(translate("options_settings_clock_type_3"));
        $("#options-settings-clock-type-5").text(translate("options_settings_clock_type_5"));
        $("#options-settings-clock-type-6").text(translate("options_settings_clock_type_6"));
        $("#options-settings-clock-type-7").text(translate("options_settings_clock_type_7"));
        $("#options-settings-clock-type-9").text(translate("options_settings_clock_type_9"));
        $("#options-settings-clock-type-10").text(translate("options_settings_clock_type_10"));

        $("#options-settings-parallax-title").text(translate("options_settings_parallax_title"));
        $("#options-settings-parallax-subtitle").text(translate("options_settings_parallax_subtitle"));
        $("#options-settings-parallax-enable").text(translate("options_settings_parallax_enable"));
        $("#options-settings-parallax-enable-notice").text(translate("options_settings_parallax_enable_notice"));
        $("#options-settings-parallax-strength").text(translate("options_settings_parallax_strength"));
        
        $("#options-settings-relax-title").text(translate("options_settings_relax_title"));
        $("#options-settings-relax-enable").text(translate("options_settings_relax_enable"));

        $("#popup-restore-default-theme-title").text(translate("popup_restore_default_theme_title"));
        $("#popup-restore-default-theme-open-settings").text(translate("popup_restore_default_theme_open_settings"));
        $("#popup-restore-default-theme-open-settings-text2").text(translate("popup_restore_default_theme_open_settings_text2"));

        $("#popup-welcome-options-title").text(translate("popup_welcome_options_title"));
        $("#popup-welcome-options-body-text1").text(translate("popup_welcome_options_body_text1"));
        $("#popup-welcome-options-body-text2").text(translate("popup_welcome_options_body_text2"));
        $("#welcome-options-close").text(translate("welcome_options_close"));
        $("#popup-welcome-options-not-show").text(translate("popup_welcome_options_not_show"));

        $("#popup-feedback-dialog-title").text(translate("popup_feedback_dialog_title"));
        $("#popup-feedback-dialog-label-email").text(translate("popup_feedback_dialog_label_email"));
        $("#popup-feedback-dialog-label-subject").text(translate("popup_feedback_dialog_label_subject"));
        $("#popup-feedback-dialog-label-description").text(translate("popup_feedback_dialog_label_description"));
        $("#feedBackConfirm").text(translate("popup_feedback_dialog_button_submit"));
        $("#popup-feedback-dialog-success-text").text(translate("popup_feedback_dialog_success_text"));
        $("#feedback-close-btn").text(translate("popup_feedback_dialog_success_button_text"));
        $(".feedback-form-field-required").text(translate("popup_feedback_dialog_field_required_text"));

        $("#options-application-rating-popup-title-mark").text(translate("options_application_rating_popup_title_mark"));
        $("#options-application-rating-popup-item-bad").text(translate("options_application_rating_popup_item_bad"));
        $("#options-application-rating-popup-item-better").text(translate("options_application_rating_popup_item_better"));
        $("#options-application-rating-popup-item-awesome").text(translate("options_application_rating_popup_item_awesome"));
        $("#options-application-rating-popup-item-already").text(translate("options_application_rating_popup_item_already"));
        $("#options-application-rating-popup-title-thanks").text(translate("options_application_rating_popup_title_thanks"));

        $("#add-user-flixel-btn").html(translate("add_user_flixel_btn"));
        $("#popup-add-user-flixel-title").html(translate("popup_add_user_flixel_title"));
        $("#popup-add-user-flixel-body-text").html(translate("popup_add_user_flixel_body_text"));
        $("#popup-add-user-flixel-body-links-text").html(translate("popup_add_user_flixel_body_links_text"));
        $("#popup-add-user-flixel-body-link-how-create").html(translate("popup_add_user_flixel_body_link_how_create"));
        $("#popup-add-user-flixel-body-link-how-create-fb").html(translate("popup_add_user_flixel_body_link_how_create_fb"));
        $("#popup-add-user-flixel-body-code").html(translate("popup_add_user_flixel_body_code"));
        $("#popup-add-user-flixel-link-iphone").html(translate("popup_add_user_flixel_link_iphone"));
        $("#popup-add-user-flixel-link-mac").html(translate("popup_add_user_flixel_link_mac"));
        $("#popup-add-user-flixel-link-cloud").html(translate("popup_add_user_flixel_link_cloud"));

        $("#options-settings-speed-dial-generate-type").text(translate("options_settings_speed_dial_generate_type"));
        translateText = translate("options_speed_dial_generate_type_text");
        if(translateText)
            $("#speed-dial-generate-type-text-label").text(translateText);
        translateText = translate("options_speed_dial_generate_type_gallery_text");
        if(translateText)
            $("#speed-dial-generate-type-gallery-text-label").text(translateText);
        translateText = translate("options_speed_dial_generate_type_autopreview_text");
        if(translateText)
            $("#speed-dial-generate-type-autopreview-text-label").text(translateText);
        translateText = translate("options_speed_dial_generate_type_gallery_autopreview_text");
        if(translateText)
            $("#speed-dial-generate-type-gallery-autopreview-text-label").text(translateText);

        $("#options-settings-speed-dial-dials-columns-count").text(translate("options_settings_dials_columns_count"));

        $("#options-settings-speed-dial-count-max-description").text(translate("options_settings_speed_dial_count_max_description"));
        $("#options-settings-speed-dial-count-max-group-name").text(translate("page_dials_popular_group_title"));
        
        $("#themes-search-button-text").text(translate("themes_search_button_text"));
        $("#themes-search-text").attr('placeholder', translate("themes_search_text"));
        
        //Universal translator
        autoTranslate($("body"));
        
        /*
        $("[lang]").each(function(){
            var text = translate($(this).attr("lang"));
            //console.log(text);
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

    function browsersOnlyShow(){
        var className = "." + String(browserName()) + "-only";
        $(className).removeClass("hide");
        
        var className = "." + String(browserName()) + "-hide";
        $(className).addClass("hide");        
    }

    function simpleTooltipHandler(){
        $('.simple-tooltip').tooltip();
    }
    

    function browserInstallLinksHandler(){
        /* Depricated for New Settings
        var $wrap = $(".other-browsers");
        var current  = browserName();
        var browsers = {
            chrome  : "https://chrome.google.com/webstore/detail/live-start-page-living-wa/ocggccaacacpienfcgmgcihoombokbbj?utm_source=site&utm_medium=install", 
            firefox : "https://addons.mozilla.org/en-US/firefox/addon/live-start-page-lst/?utm_source=site&utm_medium=install",
            opera   : "https://addons.opera.com/en-gb/extensions/details/live-start-page-living-wallpapers/?display=en"
        };
        
        for(var key in browsers){
            if(key == current) continue;
            //if(key == "opera") continue;
            
            $wrap.find(".item-"+key)
                .removeClass("hide")
                .find(".other-browser").attr("data-href", browsers[key])
                .unbind("click").on("click", function(e){
                    //e.preventDefault();// e.stopPropagation();
                    openUrlInNewTab($(this).attr("data-href"));
                })
            ;
        }//for
        */
    }










