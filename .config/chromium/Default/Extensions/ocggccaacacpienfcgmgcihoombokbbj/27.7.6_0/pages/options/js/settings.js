/**
 * Application settings page
 */
    var settingsTabId;

    if(typeof NAVI != "undefined" && typeof onLoadNavi == "object"){
        onLoadNavi.push(onPageLoadSettings);
    }else{
        $(function() {
            onPageLoadSettings();
        });
    }

    function onPageLoadSettings (){
        BRW_langLoaded(function(){
            displayActiveOptionsTab(1);

            getSettingsCurentTab(function() {
                displaySearchOpenType();
                displaySearchFormBlock();
                displaySearchFormProviderType();
                displaySearchFormOpacitySlider();

                displaySpeedDialBlock();
                displaySpeedDialThumbBlock();
                displayPopularGroupBlock();
                displayCurrentDialsCount();
                displayDialsColumnsCount();
                displayDialsFormOpacitySlider();
                displayDialsOpenType();
                displayDialsSizeSlider();

                displayWeatherBlock();
                displayWeatherLocation();
                displayWeatherUnitFormat();
                displayWeatherTemperatureUnit();
                displayWeatherBackground();
                displayWeatherOpacitySlider();
                displayWeatherBackgroundOpacitySlider();

                displayClockType();
                displayClockSeconds();
                displayClockColorPickers();
                displayClockFormat();
                displayClockFormatLabel();
                displayClockDate();
                dateFormat();
                dateSeparator();
                displayClockVisibleLabel();
                displayClockFontBold();
                displayClockBackgroundType();
                displayClockBlock();
                displayClockOpacitySlider();
                displayClockBackgroundOpacitySlider();
                addClockColorSchemeTypeButtonHandler();
                addClockSizeHandler();

                displayParallaxVideoThemeStatus();
                displayRelaxStatus();
                displayBackgroundParallaxValueSlider();

                displayTodoBlock();
                displayAppsLink();
                
                displayBottomPanelOpacitySlider();
                reloadStartPageWhenColorsChanged();
                
                weatherAdvancedClickHandler();
                popularGroupDisplay();
                displayDialsBackgroundAndBorders();
                
                displayBackupBlock();
                settingsTooltip();
                setAsNewTabHandler();
                autoDownloadVideosHandler();
                customPreviewsHandler();
                
                relaxAutoShuffleHandler();
                
                searchEngineLabelHandler();
                
                if(document.location.hash && document.location.hash != "#set-password"){
                    scrollAndHighlightBlock(document.location.hash.split('?').shift());
                }
                
                
                sendToGoogleAnaliticMP(function() {
                    if(document.location.hash){
                        label = "hash";
                        value = String(document.location.hash).split('?').shift()
                            .replace('#', '')
                            .replace('focus-settings-wrap', 'focus')
                            .replace('set-password', 'passcode')
                            .replace('clock-settings-wrap', 'clock')
                            .replace('weather-settings-wrap', 'weather')
                            .replace('search-form', 'search')
                            .trim()
                        ;
                    }else{
                        label = false;
                        value = "main";
                    }
                    
                    //gamp('send', 'event', 'visit', 'settings', label, value);
                    gamp('send', 'event', 'visit', 'settings', value, 0);
                });
                
                
                /*randomizeButtonHandler();*/
            });
        });
    }

    function addClockSizeHandler() {
        var $select = $("[name='clock-size']");
        
        $select.val(getClockSize());
        
        $select.on("change", ()=>{
            
            if (isAuthEnable() && !AUTH.isPremium()) {
                AUTH.isPremium("discovered", false, "clock");
                $select.val(getClockSize());
            }else{
                setClockSize($select.val());

                setTimeout(()=>{
                    getNetTabPages(reloadTabPages);
                }, 150);
            }
            
        });
    }
    
    function relaxAutoShuffleHandler() {
        var $select = $("#relax-auto-shuffle-select");
        var current = parseInt(localStorage.getItem("relax-sidebar-shuffle-interval")) || 60000;
        var sec = translate("time_sec"); var min = translate("time_min");
        var options = [
            [30000 , "30 "+sec],
            [60000 , "1 "+min],
            [180000, "3 "+min],
            [300000, "5 "+min],
        ];
        
        for(var k in  options){
            var $opt = $("<option>").attr("value", options[k][0]).text(options[k][1]);
            if(options[k][0] == current) $opt.attr("selected", "selected");
            $select.append($opt);
        }
        
        $select.on("change", ()=>{
            //console.debug($select.val());
            localStorage.setItem("relax-sidebar-shuffle-interval", $select.val());
            
            setTimeout(()=>{
                getNetTabPages(reloadTabPages);
            }, 150); 
        });
    }    

    function searchEngineLabelHandler(){
        $checkbox = $("#show-search-engine-label");
        
        $checkbox.prop("checked", Boolean(getSearchEngineLabelMode()));
        
        $checkbox.unbind("change").on("change", function(e){
            setSearchEngineLabelMode($(this).prop("checked") ? 1 : 0);
            
            getNetTabPages(reloadTabPages);
        });
    }

    function customPreviewsHandler(){
        $checkbox = $("#custom-previews");
        
        $checkbox.prop("checked", Boolean(getCustomPreviewsMode()));
        
        $checkbox.unbind("change").on("change", function(e){
            setCustomPreviewsMode($(this).prop("checked") ? 1 : 0);
            
            getNetTabPages(reloadTabPages);
        });
    }


    function autoDownloadVideosHandler(){
        $checkbox = $("#auto-download-videos");
        
        $checkbox.prop("checked", Boolean(getAutoDownloadVideos()));
        
        $checkbox.unbind("change").on("change", function(e){
            setAutoDownloadVideos($(this).prop("checked") ? 1 : 0);
            
            getNetTabPages(reloadTabPages);
        });
    }

    function setAsNewTabHandler(){
        if(browserName() != "opera") return false;
        
        $checkbox = $("#setAsNewTabCheckbox");
        
        
        $checkbox.prop("checked", Boolean(getStartPagePremisson()));
        
        $checkbox.unbind("change").on("change", function(e){
            setStartPagePremisson($(this).prop("checked") ? 1 : 0);
        });
    }

    function settingsTooltip(){
        $('.settings-tooltip:not(.tooltip-hover)').tooltip();
        
        $('.tooltip-hover').popover({ trigger: "manual" , html: true, animation:false})
            .on("mouseenter", function () {
                var _this = this;
                $(this).popover("show");
                $(".popover").on("mouseleave", function () {
                    $(_this).popover('hide');
                });
            }).on("mouseleave", function () {
                var _this = this;
                setTimeout(function () {
                    if (!$(".popover:hover").length) {
                        $(_this).popover("hide");
                    }
                }, 300);
        });
    }

    function displayDialsBackgroundAndBorders() {
        var $background = $("#show-dials-background");
        var $borders = $("#show-dials-borders");
        var $bordersWrap = $("#show-dials-borders-wrap");
        
        $background.prop("checked", (getDialsBackground() ? true : false));
        $borders.prop("checked", (getDialsBorders() ? true : false));
        
        $background.trigger("change");
        
        if(getDialsBackground()) $bordersWrap.hide();
        else $bordersWrap.show();

        $background.on("change", function(e) {            
            var val = $background.prop("checked");
            
            if(val){
                $bordersWrap.hide();
                //$borders.prop("checked", true);
            }else{
                $bordersWrap.show();
                //$borders.prop("checked", false);
            }
            
            BRW_sendMessage({command: "setDialsBackground", val: val, tab: settingsTabId});
        });
        
        $borders.on("change", function(e) {            
            var val = $borders.prop("checked");
            BRW_sendMessage({command: "setDialsBorders", val: val, tab: settingsTabId});
        });
        
        
    }
    
    function popularGroupDisplay(){
        /*
        if(browserName() == "chrome"){
            $(".top-panel-links-wrap").removeClass("hide");
        }//if
        */
    }


    function weatherAdvancedClickHandler() {
        var $button = $(".weather-advanced");
        var $sattelite = $(".weather-advanced-sattelite");
        var $showpro = $(".weather-show-pro");
        
        waitAuth(function (useAuth) {
            if (isAuthEnable() && !AUTH.isPremium()) {/*weather on*/
                $button.removeClass("hide").show();
                $sattelite.removeClass("hide").show();
                $showpro.hide();
                
                $button.unbind("click").on("click", function (e) {
                    e.preventDefault(); e.stopPropagation();
                    AUTH.isPremium("discovered", false, "weather");
                });
            }else{
                $button.hide();
                $sattelite.hide();
                $showpro.removeClass("hide").show();
            }
        });
    }

    function scrollAndHighlightBlock(Hash){
        var Id = String(Hash).split(' ').shift().trim();
        
        if(Id.length && Id.indexOf("#") == 0){
            $block = $(Id);
            
            if($block && $block.length){
                $("html, body").animate( 
                    {scrollTop: $block.offset().top }, 350
                );
                
                setTimeout(function(){
                    var Color1 = "#FFFFFF", Color2 = "#e1ff86";//"#bfff00";
                    
                    if(Id == "#passcode-block"){
                        $target = $block.find(".bs-callout");
                    }else{
                        $target = $block;
                    }
                    
                    $target
                        .animate({"background-color": Color2}, 300)
                        .delay(150)
                        .animate({"background-color": Color1}, 390)
                        .animate({"background-color": Color2}, 300)
                        .delay(150)
                        .animate({"background-color": Color1}, 390)
                        .animate({"background-color": Color2}, 300)
                        .delay(150)
                        .animate({"background-color": Color1}, 1100)
                    ;
                }, 350)
            }//if
        }//Id
    }//if
    
    


    /**
     * Get settings current tab
     */
    /*Moved to browser choiser*/
    function getSettingsCurentTab(callback) {
         PGS_getSettingsCurentTab(callback);
    }

    /**
     * Display backup block
     */
    function displayBackupBlock() {
        var $el = $("#backup-enable");
        var $wrap = $("#backup-settings-container");
        
        if(getBackupEnable() == 1){
            $el.attr("checked", "checked");
            $wrap.removeClass("hide");
        }
        
        $el.trigger("change"); // New Settings

        $el.on("change", function(e) {
            var val = $el.is(':checked');
            
            if(val) {
                if(typeof BACK == "object") BACK.getBackup(true);
                
                $wrap.removeClass("hide");//.slideDown(); // Old Settings
            }
            else {
                //$wrap.slideUp(); // Old Settings
            }

            setBackupEnable(val);
        });
    }
    
    /**
     * Display weather block
     */
    function displayWeatherBlock() {
        var $el = $("#weather-display");
        
        getDisplayWeatherPanel(function(display) {
            if(display) {
                $el.attr("checked", "checked");
                $("#weather-settings").css({"display" : "block"}); // OLD
            }
            
            $el.trigger("change"); // New settings
            
            $el.on("change", function(e) {
                var val = $el.is(':checked');
                var $weatherSettingsEl = $("#weather-settings");
                if(val) {
                    $weatherSettingsEl.slideDown();
                }
                else {
                    $weatherSettingsEl.slideUp();
                    BRW_sendMessage({command: "resetWeatherPosition"});
                }

                BRW_sendMessage({command: "setDisplayWeatherPanel", val: val, tab: settingsTabId});
            });
        });

    }

    /**
     * Display weather temperature unit
     */
    function displayWeatherTemperatureUnit() {
        var $el = $("#weather-unit-display");
        getDisplayWeatherUnit(function(display) {
            if(display)
                $el.attr("checked", "checked");
        });

        $el.on("change", function(e) {
            var val = $el.is(':checked');
            BRW_sendMessage({command: "setDisplayWeatherUnit", val: val, tab: settingsTabId});
        });
    }

    /**
     * Display weather background
     */
    function displayWeatherBackground() {
        var $el = $("#weather-background-display");
        getDisplayWeatherBackground(function(display) {
            if(display) {
                $el.attr("checked", "checked");
                $("#weather-background-opacity").css({"display" : "block"}); // OLD
            }
            
            $el.trigger("change"); // New settings
            
            $el.on("change", function(e) {
                var val = $el.is(':checked');
                var $weatherSettingsEl = $("#weather-background-opacity");
                if(val) {
                    $weatherSettingsEl.slideDown();
                }
                else {
                    $weatherSettingsEl.slideUp();
                }
                BRW_sendMessage({command: "setDisplayWeatherBackground", val: val, tab: settingsTabId});
            });
        });

    }

    /**
     * Display storage weather opacity slider
     */
    function displayWeatherOpacitySlider() {
        var opacityProp = getWeatherOpacity();
        var minOpacityProp = getMinWeatherOpacity();
        var maxOpacityProp = getMaxWeatherOpacity();
        var diffOpacityProp = maxOpacityProp - minOpacityProp;
        var minOpacityVal = 1;
        var maxOpacityVal = 100;
        var currentOpacity = (opacityProp - minOpacityProp) / (maxOpacityProp - minOpacityProp) * 100;
        var sliderId = "#weather-opacity-slider";
        var sliderLabelId = "#weather-opacity-value";
        $(sliderId).slider({
            range: "min",
            value: currentOpacity,
            min: minOpacityVal,
            max: maxOpacityVal,
            slide: function( event, ui ) {
                var value = (minOpacityProp + ui.value * diffOpacityProp / 100).toFixed(2);
                var valuePercents = ((value - minOpacityProp) / diffOpacityProp * 100).toFixed(0);
                if(valuePercents < minOpacityVal) valuePercents = minOpacityVal;
                $(sliderLabelId).text(valuePercents  + "%");
            },
            stop: function( event, ui ) {
                var value = (minOpacityProp + ui.value * diffOpacityProp / 100).toFixed(2);
                BRW_sendMessage({command: "setWeatherOpacity", val: value, tab: settingsTabId});
            }
        });
        $(sliderLabelId).text($(sliderId).slider("value")+"%");
    }

    /**
     * Display bottom panel opacity slider
     */
    function displayBottomPanelOpacitySlider() {
        var opacityProp = getBottomPanelOpacity();
        var minOpacityProp = getMinTodoPanelOpacity();
        var maxOpacityProp = getMaxTodoPanelOpacity();
        var diffOpacityProp = maxOpacityProp - minOpacityProp;
        var minOpacityVal = 1;
        var maxOpacityVal = 100;
        var currentOpacity = (opacityProp - minOpacityProp) / (maxOpacityProp - minOpacityProp) * 100;
        var sliderId = "#page-bottom-panel-opacity-slider";
        var sliderLabelId = "#page-bottom-panel-opacity-value";

        $(sliderId).slider({
            range: "min",
            value: currentOpacity,
            min: minOpacityVal,
            max: maxOpacityVal,
            slide: function( event, ui ) {
                var value = (minOpacityProp + ui.value * diffOpacityProp / 100).toFixed(2);
                var valuePercents = ((value - minOpacityProp) / diffOpacityProp * 100).toFixed(0);
                if(valuePercents < minOpacityVal) valuePercents = minOpacityVal;
                $(sliderLabelId).text(valuePercents  + "%");
            },
            stop: function( event, ui ) {
                var value = (minOpacityProp + ui.value * diffOpacityProp / 100).toFixed(2);
                BRW_sendMessage({command: "setBottomPanelOpacity", val: value, tab: settingsTabId});
            }
        });
        $(sliderLabelId).text($(sliderId).slider("value")+"%");
    }

    /**
     * Display storage weather background opacity slider
     */
    function displayWeatherBackgroundOpacitySlider() {
        var opacityProp = getWeatherBackgroundOpacity();
        var minOpacityProp = getMinWeatherBackgroundOpacity();
        var maxOpacityProp = getMaxWeatherBackgroundOpacity();
        var diffOpacityProp = maxOpacityProp - minOpacityProp;
        var minOpacityVal = 1;
        var maxOpacityVal = 100;
        var currentOpacity = (opacityProp - minOpacityProp) / (maxOpacityProp - minOpacityProp) * 100;
        var sliderId = "#weather-background-opacity-slider";
        var sliderLabelId = "#weather-background-opacity-value";
        $(sliderId).slider({
            range: "min",
            value: currentOpacity,
            min: minOpacityVal,
            max: maxOpacityVal,
            slide: function( event, ui ) {
                var value = (minOpacityProp + ui.value * diffOpacityProp / 100).toFixed(2);
                var valuePercents = ((value - minOpacityProp) / diffOpacityProp * 100).toFixed(0);
                if(valuePercents < minOpacityVal) valuePercents = minOpacityVal;
                $(sliderLabelId).text(valuePercents  + "%");
            },
            stop: function( event, ui ) {
                var value = (minOpacityProp + ui.value * diffOpacityProp / 100).toFixed(2);
                BRW_sendMessage({command: "setWeatherBackgroundOpacity", val: value, tab: settingsTabId});
            }
        });
        $(sliderLabelId).text($(sliderId).slider("value")+"%");
    }

    /**
     * Display to do block
     */
    function displayTodoBlock() {
        var $el = $("#todo-display");
        if(getDisplayTodoDialPanel()) {
            $el.attr("checked", "checked");
        }
        
        $el.trigger("change"); // New settings
        
        $el.on("change", function(e) {
            var val = $el.is(':checked');
            if(!val) {
                BRW_sendMessage({command: "resetTodoPositionSize"});
            }
            BRW_sendMessage({command: "setDisplayTodoPanel", val: val, tab: settingsTabId});
        });
        
        /*SLIDER*/
        var opacityProp = getTodoPanelOpacity();
        
        var minOpacityProp = getMinTodoPanelOpacity();
        var maxOpacityProp = getMaxTodoPanelOpacity();
        var diffOpacityProp = maxOpacityProp - minOpacityProp;
        
        var minOpacityVal = 1;
        var maxOpacityVal = 100;
        var currentOpacity = (opacityProp - minOpacityProp) / (maxOpacityProp - minOpacityProp) * 100;
        
        var sliderId = "#page-todo-panel-opacity-slider";
        var sliderLabelId = "#page-todo-panel-opacity-value";
        $(sliderId).slider({
            range: "min",
            value: currentOpacity,
            min: minOpacityVal,
            max: maxOpacityVal,
            slide: function( event, ui ) {
                var value = (minOpacityProp + ui.value * diffOpacityProp / 100).toFixed(2);
                var valuePercents = ((value - minOpacityProp) / diffOpacityProp * 100).toFixed(0);
                if(valuePercents < minOpacityVal) valuePercents = minOpacityVal;
                $(sliderLabelId).text(valuePercents  + "%");
            },
            stop: function( event, ui ) {
                var value = (minOpacityProp + ui.value * diffOpacityProp / 100).toFixed(2);
                BRW_sendMessage({command: "setTodoPanelOpacity", val: value, tab: settingsTabId});
            }
        });
        $(sliderLabelId).text($(sliderId).slider("value")+"%");
    }

    /**
     * Display apps link
     */
    function displayAppsLink() {
        var $el = $("#apps-link-display");
        getDisplayAppsLink(function(display) {
            if(display)
                $el.attr("checked", "checked");
        });

        $el.on("change", function(e) {
            var val = $el.is(':checked');
            BRW_sendMessage({command: "setDisplayAppsLink", val: val, tab: settingsTabId});
        });
    }


    /**
     * Display clock block
     */
    function displayClockBlock() {
        var $el = $("#clock-display");
        if(getDisplayClockPanel()) {
            $el.attr("checked", "checked");
            //$("#clock-settings").show();//OLD
        }
        
        $el.trigger("change");
        
        $el.on("change", function(e) {
            var val = $el.is(':checked');

            var $clockSettingsEl = $("#clock-settings");
            if(val) {
                $clockSettingsEl.slideDown();
            }
            else {
                $clockSettingsEl.slideUp();
            }

            BRW_sendMessage({command: "setDisplayClockPanel", val: val, tab: settingsTabId});
        });
    }

    /**
     * Display clock seconds
     */
    function displayClockSeconds() {
        var $el = $("#clock-seconds");
        if(getVisibleClockSeconds())
            $el.attr("checked", "checked");

        $el.on("change", function(e) {
            var val = $el.is(':checked');
            setVisibleSpeedDialPanel(false);
            BRW_sendMessage({command: "setClockSecondsVisible", val: val, tab: settingsTabId});
        });
    }

    /**
     * Display speed dial block
     */
    function displaySpeedDialBlock() {
        var $el = $("#dials-display");
        
        if(getDisplaySpeedDialPanel()) {
            $el.attr("checked", "checked");
            $("#dials-settings").show(); // OLD
        }
        
        $el.trigger("change"); // New Settings
        
        $el.on("change", function(e) {
            var val = $el.is(':checked');
            var $dialsCountEl = $("#dials-settings");
            if(val) {
                $dialsCountEl.slideDown();
            }
            else {
                sendToGoogleAnaliticMP(function() {
                    gamp('send', 'event', 'dials', 'turnoff');
                });
                $dialsCountEl.slideUp();
            }

            BRW_sendMessage({command: "setDisplaySpeedDialPanel", val: val, tab: settingsTabId});
        });
    }

    /**
     * Display popular group block
     */
    function displayPopularGroupBlock() {
        var $el = $("#popular-group-display");
        if(getDisplayPopularGroup()) {
            $el.attr("checked", "checked");
            $("#popular-dials-settings").show(0);
        }

        $el.on("change", function(e) {
            var val = $el.is(':checked');
            var $popularGroupEl = $("#popular-dials-settings");
            if(val) {
                $popularGroupEl.slideDown();
            } else {
                $popularGroupEl.slideUp();
            }

            BRW_sendMessage({command: "setDisplayPopularGroup", val: val, tab: settingsTabId});
        });
    }

    /**
     * Display speed dial thumb block
     */
    function displaySpeedDialThumbBlock() {
        var $el = $(".speed-dial-generate-type-item");
        getNewSpeedDialThumbType(function(type) {
            var $currentEl = $(".speed-dial-generate-type-item[data-new-dial-thumb-generate-type=" + type + "]");
            if($currentEl.length) {
                $currentEl.each(function() {
                    var $item = $(this);
                    $item.attr("checked", "checked");
                });
            }
        });

        $el.on("click", function(e) {
            setVisibleSpeedDialPanel(true);
            var val = parseInt($(this).attr("data-new-dial-thumb-generate-type"));
            BRW_sendMessage({command: "setNewSpeedDialThumbType", val: val, tab: settingsTabId});
        });
    }

    /**
     * Display speed dial columns count block
     */
    function displayDialsColumnsCount() {
        var $el = $("#dials-columns-count-select");
        
        $el.on("change", function(e) {
            setVisibleSpeedDialPanel(true);
            var val = $el.val();
            BRW_sendMessage({command: "setDialsColumnsCount", val: val, tab: settingsTabId});
        });
        
        displayDialsColumnsCalc();
        
        /* // Task 438
        var $el = $(".dials-columns-count-item");
        getDialsColumnsCount(function(count) {
            var $currentEl = $(".dials-columns-count-item[data-dials-columns-count=" + count + "]");
            if($currentEl.length) {
                $currentEl.each(function() {
                    var $item = $(this);
                    $item.attr("checked", "checked");
                });
            }
        });

        $el.on("click", function(e) {
            setVisibleSpeedDialPanel(true);
            var val = parseInt($(this).attr("data-dials-columns-count"));
            BRW_sendMessage({command: "setDialsColumnsCount", val: val, tab: settingsTabId});
        });
        */
    }


    function displayDialsColumnsCalc() {
        var $el = $("#dials-columns-count-select");
        var cur = $el.val();
        var max = calcMaxColumns();
        
        $el.find("option:gt(0)").remove();
        for(var i = 1; i <= max; i++){
            $el.append(
                $("<option>")
                    .attr("value", i)
                    .text(i)
            );
        }
        
        getDialsColumnsCount(function(count) {
            if(count != "auto"){
                count = Math.min(parseInt(count), max);
            }
            
            $el.val(count);            
        });
    }

    /**
     * Display clock format
     */
    function displayClockFormat() {
        var $el = $(".clock-format-item");
        var $currentEl = $(".clock-format-item[data-clock-format=" + getClockFormat() + "]");
        if($currentEl.length) {
            $currentEl.each(function() {
                var $item = $(this);
                    $item.attr("checked", "checked");
                var itemVal = parseInt($item.attr("data-clock-format"));
                if(itemVal)
                    $("#clock-format-label-block").removeClass("disabled").addClass("enabled");//show();// OLD > New Settings.show();
            });
        }

        $el.on("click", function(e) {
            setVisibleSpeedDialPanel(false);
            var val = parseInt($(this).attr("data-clock-format"));
            var $clockFormatLabel = $("#clock-format-label-block");
            var $clockFormatLabelColor = $("#clock-ampm-label-color-block");
            var clockFormatLabel = getClockFormatLabel();
            if(val) {
                $clockFormatLabel.removeClass("disabled").addClass("enabled");//.slideDown();// OLD > New Settings
                if(clockFormatLabel) $clockFormatLabelColor.removeClass("disabled").addClass("enabled");
                //if(clockFormatLabel && !$clockFormatLabelColor.is(":visible")) $clockFormatLabelColor.slideDown();
            }
            else {
                $clockFormatLabel.removeClass("enabled").addClass("disabled");//.slideUp();// OLD > New Settings
                //if($clockFormatLabelColor.is(":visible")) $clockFormatLabelColor.slideUp();
                $clockFormatLabelColor.removeClass("enabled").addClass("disabled");// New Settings
            }
            BRW_sendMessage({command: "setClockFormat", val: val, tab: settingsTabId});
        });
    }

    /**
     * Display weather unit
     */
    function displayWeatherUnitFormat() {
        var $el = $(".weather-unit-item");
        getWeatherUnitVal(function(unit) {
            getLastLocationWeather(function(locationWear) {
                var localUnit = unit ? unit : (locationWear ? locationWear.unit : "");
                if(localUnit) {
                    var $currentEl = $(".weather-unit-item[data-weather-unit=" + localUnit + "]");
                    if($currentEl.length) {
                        $currentEl.each(function() {
                            var $item = $(this);
                            $item.attr("checked", "checked");
                        });
                    }
                }
            });
        });

        $el.on("click", function(e) {
            var val = $(this).attr("data-weather-unit");
            BRW_sendMessage({command: "setWeatherUnit", val: val, tab: settingsTabId});
        });
    }

    /**
     * Display clock format label
     */
    function displayClockFormatLabel() {
        var $el = $("#clock-format-label");
        if(getClockFormatLabel())
            $el.attr("checked", "checked");

        $el.on("change", function(e) {
            setVisibleSpeedDialPanel(false);
            var val = $el.is(':checked');
            var $clockFormatLabelColor = $("#clock-ampm-label-color-block");

            if(val) {
                //if(!$clockFormatLabelColor.is(":visible")) $clockFormatLabelColor.slideDown(); // OLD Settings
                $clockFormatLabelColor.removeClass("disabled").addClass("enabled");//slideDown(); // NEW Settings
            } else {
                //if($clockFormatLabelColor.is(":visible")) $clockFormatLabelColor.slideUp(); // OLD Settings
                $clockFormatLabelColor.addClass("enabled").removeClass("disabled");//slideDown(); // NEW Settings
            }

            BRW_sendMessage({command: "setClockFormatLabel", val: val, tab: settingsTabId});
        });
    }
    /**
     * Display clock date
     */
    function displayClockDate() {
        var $el = $("#clock-date");
        
        if(getClockDate())
            $el.attr("checked", "checked");
        
        $el.trigger("change"); // New Settings
        
        $el.on("change", function(e) {
            //setVisibleSpeedDialPanel(false);
            var val = $el.is(':checked');

            BRW_sendMessage({command: "setClockDate", val: val, tab: settingsTabId});
            
            setTimeout(()=>{
                showDateSeparator();
            }, 50);
        });
    }

    /**
     * Date format
     */
    function dateFormat() {
        var dateFormat = getDateFormat();
        
        showDateSeparator(dateFormat);
        
        $("#clock-date-format input").each(function(){
            if($(this).attr("value") == dateFormat) $(this).prop('checked', true);
        });
        
        $("#clock-date-format input").on("click", function(){
            var val = $("#clock-date-format input:checked").attr("value");
            BRW_sendMessage({command: "setDateFormat", val: val, tab:settingsTabId});
            showDateSeparator(val);
        });
    }//dateFormat

    function showDateSeparator(value){
        //value = value ? String(value) : getDateFormat();
        
        setTimeout(()=>{
            value = getDateFormat();

            var $block = $("#clock-date-separator");

            if(value != "auto" && getClockDate()){//hide
                $block.removeClass("disabled").addClass("enabled");//.css("display","none"); // OLD Settings > New Settings
            }else{//show
                $block.removeClass("enabled").addClass("disabled");//.css("display","block"); // OLD Settings > New Settings
            }//else
        }, 150);
        
    }//function

    /**
     * Date separator
     */
    function dateSeparator() {
        var $el = $("[name=clock-date-separator]");
        var dateSeparator = getDateSeparator();
        
        $el.val(dateSeparator);
        
        $el.on("change", function() {
            var val = $(this).val();
            BRW_sendMessage({command: "setDateSeparator", val: val, tab:settingsTabId});
        });
    }//dateSeparator

    /**
     * Display clock visible label
     */
    function displayClockVisibleLabel() {
        var $el = $("#clock-visible-label");
        if(getClockVisibleLabel())
            $el.attr("checked", "checked");

        $el.on("change", function(e) {
            setVisibleSpeedDialPanel(false);
            var val = $el.is(':checked');
            var $clockVisibleLabelColor = $("#clock-label-color-block");

            if(val) {
                if(!$clockVisibleLabelColor.is(":visible"))
                    $clockVisibleLabelColor.slideDown();
            } else {
                if($clockVisibleLabelColor.is(":visible"))
                    $clockVisibleLabelColor.slideUp();
            }

            BRW_sendMessage({command: "setClockVisibleLabel", val: val, tab: settingsTabId});
        });
    }

    /**
     * Display clock font bold
     */
    function displayClockFontBold() {
        var $el = $("#clock-font-bold");
        if(getClockFontBold())
            $el.attr("checked", "checked");

        $el.on("change", function(e) {
            setVisibleSpeedDialPanel(false);
            var val = $el.is(':checked');
            BRW_sendMessage({command: "setClockFontBold", val: val, tab: settingsTabId});
        });
    }

    /**
     * Display current dials count
     */
    function displayCurrentDialsCount() {
        var $el = $("#dials-count");
        $el.val(getDisplayTilesCount());

        $el.on("keyup", function(e) {
            var $el = $(this);
            var val = $el.val();
            var maxVal = getMaxDisplayTilesCount();
            if(val.length) {
                if(val > maxVal) {
                    $el.val(maxVal);
                    BRW_sendMessage({command: "setDisplayTilesCount", val: maxVal, tab: settingsTabId});
                }
                else if(val < 1) {
                    $el.val(1);
                    BRW_sendMessage({command: "setDisplayTilesCount", val: 1, tab: settingsTabId});
                }
            }
        });

        $el.on("change", function(e) {
            var $el = $(this);
            var val = $el.val();
            var maxVal = getMaxDisplayTilesCount();
            if(val > maxVal)
                val = maxVal;
            else if(val < 1)
                val = 1;
            BRW_sendMessage({command: "setDisplayTilesCount", val: val, tab: settingsTabId});
        });
    }

    /**
     * Display parallax video theme status
     */
    function displayParallaxVideoThemeStatus() {
        var $el = $("#parallax-display");
        if(getDisplayParallaxVideoTheme()) {
            $el.attr("checked", "checked");
            $("#background-parallax-value").show();
        }
        if(getDisplayVideoTheme())
            $("#background-parallax-display").show();
        $el.on("change", function(e) {
            var val = $el.is(':checked');
            BRW_sendMessage({command: "setDisplayParallaxVideoTheme", val: val, tab: settingsTabId});
            var $parallaxEl = $("#background-parallax-value");
            if(val)
                $parallaxEl.slideDown();
            else
                $parallaxEl.slideUp();
        });
    }


    /**
     * Display relax status
     */
    function displayRelaxStatus() {
        var $el = $("#relax-display");
        if(getDisplayRelax())
            $el.attr("checked", "checked");
        
        $el.trigger("change"); // New Settings

        $el.on("change", function(e) {
            var val = $el.is(':checked');
            BRW_sendMessage({command: "setDisplayRelax", val: val, tab: settingsTabId});
            if(!val) {
                sendToGoogleAnaliticMP(function() {
                    gamp('send', 'event', 'relax', 'off');
                });
            }
        });
    }

    /**
     * Display search form block
     */
    function displaySearchFormBlock() {
        var $el = $("#search-form-display");
        getDisplaySearchForm(function(display) {
            if(display) {
                $el.attr("checked", "checked");
                $("#search-form-settings").css({"display" : "block"});
            }
            
            $el.trigger("change"); // New Settings
                        
            $el.on("change", function(e) {
                var val = $el.is(':checked');

                if(!val) {
                    sendToGoogleAnaliticMP(function() {
                        gamp('send', 'event', 'searchbar', 'turnoff');
                    });
                }

                BRW_sendMessage({command: "setDisplaySearchForm", val: val, tab: settingsTabId});
                var $settings = $("#search-form-settings");
                if(val)
                    $settings.slideDown();
                else
                    $settings.slideUp();
            });
        });

    }

    /**
     * Display search form provider type
     */
    function displaySearchFormProviderType() {
        BRW_getAcceptLanguages(function(languages) {
            var hasRuLanguage = languages.indexOf("ru") != -1;
            
            waitAuth(function(useAuth){
                $(".premium-item").find("input").attr("disabled", "disabled");
                
                if(isAuthEnable() && !AUTH.isPremium()){
                    $(".premium-click").unbind("click").on("click", function(e){
                        e.preventDefault(); e.stopPropagation();
                        AUTH.isPremium("discovered");
                    });
                    
                    if(hasRuLanguage){
                        $(".ru-item").removeClass("premium-item").find("input").attr("disabled", false);
                    }//if
                }else{
                    $(".premium-item").removeClass("premium-item").find("input").attr("disabled", false);
                }//else
                
                
                if(
                   true
                   /*
                   (hasRuLanguage) &&
                   (
                       !isAuthEnable() ||
                       !useAuth ||
                       (!AUTH.state.auth || !AUTH.isPremium())
                   )
                   */
                ){
                    $("#search-form-provider").css({"display" : "block"});
                    
                    var $el = $(".search-form-provider-item");
                    getSearchFormProviderType(function(searchPorviderType) {
                        var $currentEl = $(".search-form-provider-item[data-search-provider=" + searchPorviderType + "]");
                        if($currentEl.length) {
                            $currentEl.each(function() {
                                var $item = $(this);
                                $item.attr("checked", "checked");
                            });
                        }
                    }, true);

                    $el.unbind("click").on("click", function(e) {
                        var val = parseInt($(this).attr("data-search-provider"));
                        BRW_sendMessage({command: "setSearchFormProviderType", val: val, tab: settingsTabId});
                    });
                    
                    $("#search-provider-more").unbind("click").on("click", function(event){
                        AUTH.isPremium("discovered");
                    });
                }else{
                    if(isAuthEnable()){
                        $("#search-form-provider-select").css({"display" : "block"});
                    }//if
                }//else
                
                getSearchFormProviderType(function(searchPorviderType) { return false;//!!!!!!!!!!!!!!!!!
                    var $select = $("#search-form-provider-select select");
                    
                    for(var key in searchProviders){
                        var $option = $("<option>")
                            .attr("value", searchProviders[key].val)
                            .text(searchProviders[key].name)
                        ;

                        if(searchProviders[key].val == searchPorviderType){
                            $option.attr("selected", true);
                        }//if

                        $select.append($option);

                    }//for        


                    $select.unbind("click").on("click", function(event){
                        searchProviderOpen(event);
                    });

                    $select.unbind("focus").on("focus", function(event){
                        searchProviderOpen(event);
                    });
                    
                    function searchProviderOpen(event){
                        if(AUTH){
                            if(AUTH.isPremium("discovered")){
                                $select.unbind("change").unbind("change").on("change", function(){
                                    var val = parseInt($select.val());

                                    BRW_TabsGetCurrentID(function(tab) {
                                        BRW_sendMessage({command: "setSearchFormProviderType", val: val, tab:tab});
                                    });

                                    localStorage.setItem("search-engine-selected", true);
                                    
                                    sendToGoogleAnaliticMP(function() {
                                        gamp('send', 'event', 'search', 'change_provider', 'settings', $select.find(":selected").text());
                                    });
                                });
                            }else{
                                $select.attr("disabled", "disabled");

                                setTimeout(function(){
                                    $select.attr("disabled", false);
                                }, 150);

                                //event.preventDefault();
                                //event.stopPropagation();
                            }//else
                        }//if
                    }//searchProviderOpen
                }, true);//getSearchFormProviderType

            });
        });
    }//
    
    /**
     * Display storage parallax distance slider
     */
    function displaySearchFormOpacitySlider() {
        var opacityProp = getSearchFormOpacity();
        var minOpacityProp = getMinSearchFormOpacity();
        var maxOpacityProp = getMaxSearchFormOpacity();
        var diffOpacityProp = maxOpacityProp - minOpacityProp;
        var minOpacityVal = 1;
        var maxOpacityVal = 100;
        var currentOpacity = (opacityProp - minOpacityProp) / (maxOpacityProp - minOpacityProp) * 100;
        var sliderId = "#search-form-min-opacity-slider";
        var sliderLabelId = "#search-form-min-opacity";
        $(sliderId).slider({
            range: "min",
            value: currentOpacity,
            min: minOpacityVal,
            max: maxOpacityVal,
            slide: function( event, ui ) {
                var value = (minOpacityProp + ui.value * diffOpacityProp / 100).toFixed(2);
                var valuePercents = ((value - minOpacityProp) / diffOpacityProp * 100).toFixed(0);
                if(valuePercents < minOpacityVal) valuePercents = minOpacityVal;
                $(sliderLabelId).text(valuePercents  + "%");
            },
            stop: function( event, ui ) {
                var value = (minOpacityProp + ui.value * diffOpacityProp / 100).toFixed(2);
                BRW_sendMessage({command: "setSearchFormOpacity", val: value, tab: settingsTabId});
            }
        });
        $(sliderLabelId).text($(sliderId).slider("value")+"%");
    }

    /**
     * Display storage clock opacity slider
     */
    function displayClockOpacitySlider() {
        var opacityProp = getClockOpacity();
        var minOpacityProp = getMinClockOpacity();
        var maxOpacityProp = getMaxClockOpacity();
        var diffOpacityProp = maxOpacityProp - minOpacityProp;
        var minOpacityVal = 1;
        var maxOpacityVal = 100;
        var currentOpacity = (opacityProp - minOpacityProp) / (maxOpacityProp - minOpacityProp) * 100;
        var sliderId = "#clock-opacity-slider";
        var sliderLabelId = "#clock-opacity-value";
        $(sliderId).slider({
            range: "min",
            value: currentOpacity,
            min: minOpacityVal,
            max: maxOpacityVal,
            slide: function( event, ui ) {
                var value = (minOpacityProp + ui.value * diffOpacityProp / 100).toFixed(2);
                var valuePercents = ((value - minOpacityProp) / diffOpacityProp * 100).toFixed(0);
                if(valuePercents < minOpacityVal) valuePercents = minOpacityVal;
                $(sliderLabelId).text(valuePercents  + "%");
            },
            stop: function( event, ui ) {
                var value = (minOpacityProp + ui.value * diffOpacityProp / 100).toFixed(2);
                BRW_sendMessage({command: "setClockOpacity", val: value, tab: settingsTabId});
            }
        });
        $(sliderLabelId).text($(sliderId).slider("value")+"%");
    }

    /**
     * Display storage clock background opacity slider
     */
    function displayClockBackgroundOpacitySlider() {
        var opacityProp = getClockBackgroundOpacity();
        var minOpacityProp = getMinClockBackgroundOpacity();
        var maxOpacityProp = getMaxClockBackgroundOpacity();
        var diffOpacityProp = maxOpacityProp - minOpacityProp;
        var minOpacityVal = 1;
        var maxOpacityVal = 100;
        var currentOpacity = (opacityProp - minOpacityProp) / (maxOpacityProp - minOpacityProp) * 100;
        var sliderId = "#clock-background-opacity-slider";
        var sliderLabelId = "#clock-background-opacity-value";
        $(sliderId).slider({
            range: "min",
            value: currentOpacity,
            min: minOpacityVal,
            max: maxOpacityVal,
            slide: function( event, ui ) {
                var value = (minOpacityProp + ui.value * diffOpacityProp / 100).toFixed(2);
                var valuePercents = ((value - minOpacityProp) / diffOpacityProp * 100).toFixed(0);
                if(valuePercents < minOpacityVal) valuePercents = minOpacityVal;
                $(sliderLabelId).text(valuePercents  + "%");
            },
            stop: function( event, ui ) {
                var value = (minOpacityProp + ui.value * diffOpacityProp / 100).toFixed(2);
                BRW_sendMessage({command: "setClockBackgroundOpacity", val: value, tab: settingsTabId});
                setClockBackgroundOpacity(value);
                setVisibleSpeedDialPanel(0);
                getNetTabPages(reloadTabPages);
            }
        });
        $(sliderLabelId).text($(sliderId).slider("value")+"%");
    }

    /**
     * Display background parallax value slider
     */
    function displayBackgroundParallaxValueSlider() {
        var multiplier = getBackgroundParallaxValue();
        var minParallaxMultiplier = getMinBackgroundParallaxValue();
        var maxParallaxMultiplier = getMaxBackgroundParallaxValue();
        var sliderId = "#parallax-value-slider";
        var sliderLabelId = "#parallax-value";
        $(sliderId).slider({
            range: "min",
            value: multiplier,
            min: minParallaxMultiplier,
            max: maxParallaxMultiplier,
            slide: function( event, ui ) {
                $(sliderLabelId).text(ui.value  + "%");
            },
            stop: function( event, ui ) {
                BRW_sendMessage({command: "setBackgroundParallaxValue", val: ui.value, tab: settingsTabId});
            }
        });
        $(sliderLabelId).text($(sliderId).slider("value")+"%");
    }

    /**
     * Display dials size
     */
    function displayDialsSizeSlider() {
        var dialsSize = getDialsSize();
        var minSize = getMinDialsSize();
        var maxSize = getMaxDialsSize();        
        
        var diffSizeProp = maxSize - minSize;
        var minSizeVal = 0;
        var maxSizeVal = 100;
        
        var currentSize = (dialsSize - minSize) / (maxSize - minSize) * 100;
        var sliderId = "#dials-size-slider";
        var sliderLabelId = "#dials-size-slider-value";
        
        $(sliderId).slider({
            range: "min",
            value: currentSize,
            min: minSizeVal,
            max: maxSizeVal,
            slide: function( event, ui ) {
                var value = (minSize + ui.value * diffSizeProp / 100).toFixed(0);
                var valuePercents = ((value - minSize) / diffSizeProp * 100).toFixed(0);
                //$(sliderLabelId).text(valuePercents  + "%");
                var s = getDialFullSize(value);
                $(sliderLabelId).text(s.width + "x" + s.height + "px");
            },
            stop: function( event, ui ) {
                var value = (minSize + ui.value * diffSizeProp / 100).toFixed(0);
                BRW_sendMessage({command: "setDialsSizeValue", val: value, tab: settingsTabId});
                setTimeout(function(){
                    displayDialsColumnsCalc();
                }, 170);
            }
        });
        
        //$(sliderLabelId).text($(sliderId).slider("value")+"%");
        var s = getDialFullSize(dialsSize);
        $(sliderLabelId).text(s.width + "x" + s.height + "px");
    }

    /**
     * Display storage parallax distance slider
     */
    function displayDialsFormOpacitySlider() {
        var opacityProp = getDialsFormOpacity();
        var minOpacityProp = getMinDialsFormOpacity();
        var maxOpacityProp = getMaxDialsFormOpacity();
        var diffOpacityProp = maxOpacityProp - minOpacityProp;
        var minOpacityVal = 1;
        var maxOpacityVal = 100;
        var currentOpacity = (opacityProp - minOpacityProp) / (maxOpacityProp - minOpacityProp) * 100;
        var sliderId = "#dials-form-min-opacity-slider";
        var sliderLabelId = "#dials-form-min-opacity";
        $(sliderId).slider({
            range: "min",
            value: currentOpacity,
            min: minOpacityVal,
            max: maxOpacityVal,
            slide: function( event, ui ) {
                var value = (minOpacityProp + ui.value * diffOpacityProp / 100).toFixed(2);
                var valuePercents = ((value - minOpacityProp) / diffOpacityProp * 100).toFixed(0);
                $(sliderLabelId).text(valuePercents  + "%");
            },
            stop: function( event, ui ) {
                var value = (minOpacityProp + ui.value * diffOpacityProp / 100).toFixed(2);
                BRW_sendMessage({command: "setDialsFormOpacity", val: value, tab: settingsTabId});
            }
        });
        $(sliderLabelId).text($(sliderId).slider("value")+"%");
    }

    /**
     * Display dials open type
     */
    function displayDialsOpenType() {
        var $container = $("#dials-open-type");
        var $el = $container.find("#dials-open");
        $el.val(getOpenDialType());
        $el.on("change", function() {
            BRW_sendMessage({command: "setOpenDialType", val: $(this).val(), tab: settingsTabId});
        });
    }

    /**
     * Display search open type
     */
    function displaySearchOpenType() {
        var $container = $("#search-open-type");
        var $el = $container.find("#search-open");
        $el.val(getOpenSearchType());
        
        $el.on("change", function() {
            BRW_sendMessage({command: "setOpenSearchType", val: $(this).val(), tab: settingsTabId});
        });
    }

    /**
     * Display search open type
     */
    function displayClockType() {
        var $container = $("#clock-type-block");
        var $el = $container.find("#clock-type");
        var clockType = getClockType();
        $el.val(clockType);
        
        if(checkClockTypeNoLabel(clockType))
            $("#clock-visible-label-block").css({"display" : "none"});
        
        $el.trigger("change");
        
        $el.on("change", function() {
            var val = parseInt($(this).val());
            BRW_sendMessage({command: "setClockType", val: val, tab: settingsTabId});

            clearClockSchemeContent();
            displayClockColorBlocks(val);

            var $clockVisibleLabel = $("#clock-visible-label-block");
            if(checkClockTypeNoLabel(val)) {
                if($clockVisibleLabel.is(":visible"))
                    $clockVisibleLabel.slideUp();
            } else {
                if(!$clockVisibleLabel.is(":visible"))
                    $clockVisibleLabel.slideDown();
            }
        });
        displayClockColorBlocks(clockType);
    }

    /**
     * Display clock background type
     */
    function displayClockBackgroundType() {
        var $el = $("#clock-background");
        var clockBackgroundType = getClockBackgroundType();
        var $clockBackgroundOpacity = $("#clock-background-opacity");
        $el.val(clockBackgroundType);
        
        if(clockBackgroundType)
            $clockBackgroundOpacity.removeClass("disabled").addClass("enabled");//.show();// OLD to NEW Settings

        $el.on("change", function() {
            var val = parseInt($(this).val());
            
            BRW_sendMessage({command: "setClockBackgroundType", val: val, tab: settingsTabId});

            var $clockBackgroundOpacity = $("#clock-background-opacity");
            if(val)
                $clockBackgroundOpacity.removeClass("disabled").addClass("enabled");//.slideDown();// OLD to NEW Settings
            else
                $clockBackgroundOpacity.removeClass("enabled").addClass("disabled");//.slideUp();// OLD to NEW Settings;
        });
    }

    /**
     * Clear clock scheme content
     */
    function clearClockSchemeContent() {
        $(".clock-color-scheme-btn").removeClass("clock-color-scheme-active");
        clearClockColorScheme();
    }

    /**
     * Display clock color blocks
     *
     * @param clockType Number
     */
    function displayClockColorBlocks(clockType) {
        /* OLD Settings
        var $container = $("#clock-colors-block-items");
        if($container.is(":visible")) {
            $container.slideUp(500, function() {
                displayClockColorBlocksItem(clockType, true);
            });
        } else {
            displayClockColorBlocksItem(clockType, false);
        }
        */
        
        displayClockColorBlocksItem(clockType, false);
    }

    /**
     * Display clock color block items
     *
     * @param clockType Number
     * @param animate Bool
     */
    function displayClockColorBlocksItem(clockType, animate) {
        var $colorItems = $(".clock-color-block");
        $colorItems.removeClass("enabled").addClass("disabled");//hide();// OLD > New Settings
        var $colorTime = $("#clock-time-color-block");
        var $colorLabel = $("#clock-label-color-block");
        var $colorAmPmLabel = $("#clock-ampm-label-color-block");
        var $colorDigitBg = $("#clock-digit-bg-color-block");
        var $colorDoneLine = $("#clock-circle-done-line-color-block");
        var $colorTotalLine = $("#clock-circle-total-line-color-block");
        var $colorBorderLine = $("#clock-border-line-color-block");
        $colorTime.removeClass("disabled").addClass("enabled");//show();// OLD > New Settings
        
        if(/*getClockFormat() && */getClockFormatLabel()) $colorAmPmLabel.removeClass("disabled").addClass("enabled");//show();// OLD > New Settings
        
        var lableIsVisible = getClockVisibleLabel();
        
        switch (clockType) {
            case 3:
            {
                if(lableIsVisible) $colorLabel.show();
                $colorBorderLine.removeClass("disabled").addClass("enabled");//show();// OLD > New Settings
                break;
            }
            case 6:
            {
                if(lableIsVisible) $colorLabel.show();
                $colorDigitBg.removeClass("disabled").addClass("enabled");//show();// OLD > New Settings
                break;
            }
            case 9:
            {
                if(lableIsVisible) $colorLabel.show();
                $colorDoneLine.removeClass("disabled").addClass("enabled");//show();// OLD > New Settings
                $colorTotalLine.removeClass("disabled").addClass("enabled");//show();// OLD > New Settings
                break;
            }
            case 10:
            {
                if(lableIsVisible) $colorLabel.show();
                $colorDigitBg.removeClass("disabled").addClass("enabled");//show();// OLD > New Settings
                break;
            }
        }
        
        updateClockColorPickers();
        
        setTimeout(function () {
            var $container = $("#clock-colors-block-items");
            if(animate) {
                if(!$(".clock-color-scheme-active").length)
                    $("#clock-color-scheme-default").addClass("clock-color-scheme-active");
                $container.slideDown();
            } else
                $container.show();
        }, 250);
        
    }

    /**
     * Add clock color scheme type button handler
     */
    function addClockColorSchemeTypeButtonHandler() {
        var $colorLightBtn = $("#clock-color-scheme-light");
        var $colorDarkBtn = $("#clock-color-scheme-dark");
        var $colorDefaultBtn = $("#clock-color-scheme-default");
            $colorLightBtn.attr("data-settings-color-scheme-type", clockColorSchemeLight);
            $colorDarkBtn.attr("data-settings-color-scheme-type", clockColorSchemeDark);
            $colorDefaultBtn.attr("data-settings-color-scheme-type", clockColorSchemeDefault);
        
        var colorSchemeType = getClockColorSchemeType();
        
        if(colorSchemeType == clockColorSchemeLight)
            $colorLightBtn.addClass("clock-color-scheme-active");
        else if(colorSchemeType == clockColorSchemeDark)
            $colorDarkBtn.addClass("clock-color-scheme-active");
        else
            $colorDefaultBtn.addClass("clock-color-scheme-active");


        $(document).on("click", ".clock-color-scheme-btn", function(e) {
            clearClockSchemeContent();
            var $el = $(this).addClass("clock-color-scheme-active");
            
            BRW_sendMessage({command: "setClockColorSchemeType", val: $el.attr("data-settings-color-scheme-type"), tab: settingsTabId});
            setTimeout(function() {
                updateClockColorPickers(true);
            }, 50);
        });
    }

    /**
     * Display color pickers
     */
    function displayClockColorPickers() {
        var clockColors = getClockColorScheme(getClockType());
        
        $("#clock-colors-block").find(".mini-colors").each(function () {
            var color = clockColors[$(this).attr("id")];
            
            if(!color && $(this).attr("id") == "clock-ampm-label-color") // if am/pm color not defined set as text color
                color = clockColors['clock-time-color'];
            $(this).
                val(color).
                css('border-color', color).
                colpick({
                    layout:'hex',
                    submit:0,
                    colorScheme:'dark',
                    color: color.substr(1),
                    onChange:function(hsb,hex,rgb,el,bySetColor) {
                        hex = hex.toUpperCase();
                        $(el).css('border-color','#'+hex);
                        if(!bySetColor) $(el).val('#' + hex);
                        if(getClockColorSchemeSkipClear()) {
                            clearClockColorSchemeSkipClear();
                        } else {
                            clearClockSchemeContent();
                        }
                        setTimeout(function() {
                            saveClockColorScheme();
                        }, 50);
                    }
                }).keyup(function(){
                    $(this).colpickSetColor(this.value);
            });
        });
    }

    /**
     * Update clock color pickers
     */
    function updateClockColorPickers(skipClear) {
        var clockColors = getClockColorScheme(getClockType());
        $("#clock-colors-block").find(".mini-colors").each(function () {
            var $el = $(this);
            var color = clockColors[$(this).attr("id")];
            if(!color && $(this).attr("id") == "clock-ampm-label-color") // if am/pm color not defined set as text color
                color = clockColors['clock-time-color'];
            if(skipClear)
                setClockColorSchemeSkipClear();
            $el.colpickSetColor(color).val(color);
        });
    }

    /**
     * Save clock color scheme
     */
    function saveClockColorScheme() {
        var colors = getClockColorsObject();
        $("#clock-colors-block-items").find(".mini-colors").each(function() {
            var $el = $(this);
            var val = $el.val();
            if(typeof (colors[$el.attr("id")]) != "undefined")
                colors[$el.attr("id")] = val ? val : defaultClockItemColor;
        });
        
        setClockColorScheme(colors);
    }
    
    /**
     * When color is changed update start page
     */
    function reloadStartPageWhenColorsChanged(){
        $("#clock-colors-block-items").find(".mini-colors").on("blur", function(){
            getNetTabPages(reloadTabPages);
        });
    }
