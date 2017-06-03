var firstCalculation = true;
var clockCircleDoneColor = "#282828";
var clockCircleTotalColor = "#117D8B";
var clockBoardDigitColor = "#FFFFFF";
var clockBoardBgColor = "#191919";
var clockPlaceState = false;

$(function(){
    $(".wide-bg").on("mouseover", function(e){
        $("#mv-clock-wrap").addClass("hover-wide");
    });
    $(".wide-bg").on("mouseout", function(e){
        $("#mv-clock-wrap").removeClass("hover-wide");
    });
    
    clockScaleHandler();
    
});

function clockScaleHandler(){
    var $clockWrap = $("#mv-clock-wrap");
    
    var size = getClockSize();
    
    $clockWrap.addClass("clock-size-" + size);
}

/**
 * Show clock
 *
 * @param speed Number
 */
function showClock(speed) { 
    var $clockContainer = $("#clock-container");
    var $clockWrap = $("#mv-clock-wrap");
    
    if(!$clockContainer.is(":visible")){
        $("#mv-tiles-wrap").fadeOut(function(){
            
        });
        
        $clockContainer.fadeIn(speed || 1600);
        
        $clockWrap.fadeIn(speed || 1600);
        
        clockAlignment();
    }
    
    if(typeof FocusLikeClock == "function") FocusLikeClock("show");
}

/**
 * Hide clock
 *
 * @param speed Number
 */
function hideClock(speed) { 
    var $clockContainer = $("#clock-container");
    var $clockWrap = $("#mv-clock-wrap");
    
    if($clockContainer.is(":visible")){
        $clockContainer.fadeOut(speed || 150);
        $clockWrap.fadeOut(speed || 150);
    }
    
    if(typeof FocusLikeClock == "function") FocusLikeClock("hide");
}

/**
 * Display clock
 *
 * @param response Object
 */
function displayClock(response) { 
    if(!getDisplayClockPanel()){
        $("#mv-clock-wrap").css("display","none");
        $(".clock-corner").css("display","none");
        
        if(!getVisibleSpeedDialPanel()){
            if(typeof FocusLikeClock == "function") FocusLikeClock("show");
        }
        
        return;
    }
    
    getSettingsValue("clock-place", null, function(data) {
        createClock(response);
        
        if(data) clockPlaceState = JSON.parse(data || '{}');
        
        setTimeout(function(){
            if($(".ce-countdown .ce-seconds, .ce-countdown .seconds").length){
                $(".ce-countdown").addClass("ce-add-seconds");
            };
            if($(".date-block").length){
                $(".ce-countdown").addClass("ce-add-date");
            };
            
            clockAlignment();
            clockOnWindowResizeHandler();
            addClockBlockDraggableProperty();
            clockSettingsHandler();
        }, 50);
    });
}

function clockSettingsHandler(){
    $("#clock-settings").unbind("click").on("click", function(){
        
        if(!$("#mv-clock-wrap").hasClass("dragging")){
            openUrlInNewTab(
                extensionGetUrl("/pages/options/settings.html#navi-settings-clock")
            );
        }
        
    });
}

/**
 * Create clock
 *
 * @param response Object
 */
function createClock(response) { 
    if(!$(".ce-countdown").length) {
        var $clockContainer = $("#clock-container");
        var $clock = getClockTemplate(response);
        if($clock) {
            $clockContainer.html("").append($clock.template);
            
            initClock($clock.settings || {});
        }
    }
}

/**
 * Get clock template
 *
 * @param response Object
 * @returns {*}
 */
function getClockTemplate(response) { 
    var $container;
    var result = null;
    var $clock = $("<div></div>").addClass("ce-countdown");
        $clock.attr("id", "ce-countdown");
        $clock.css({"opacity" : getClockOpacity()});

    var clockType = getClockType();
    
    $("#mv-clock-wrap").addClass("theme-" + clockType + "-wrap");
    
    switch (clockType) {
        case 0  : result = getClockTemplateTheme0 ($clock); break;
        case 3  : result = getClockTemplateTheme3 ($clock); break;
        case 5  : result = getClockTemplateTheme5 ($clock); break;
        case 6  : result = getClockTemplateTheme6 ($clock); break;
        case 7  : result = getClockTemplateTheme7 ($clock); break;
        case 9  : result = getClockTemplateTheme9 ($clock); break;
        case 10 : result = getClockTemplateTheme10($clock); break;
    }

    var backgroundType = getClockBackgroundType();
    if(backgroundType == lightClockBackgroundType || backgroundType == darkClockBackgroundType)
        $container = $clock;
    else
        $container = $("#clock-container");
    $container.addClass("clock-background");

    var clockBackgroundOpacity = getClockBackgroundOpacity();
    switch (backgroundType) {
        case lightClockBackgroundType : {
            $container.css({"background-color" : "rgba(255,255,255," + clockBackgroundOpacity + ")"});
            break;
        }
        case lightLongClockBackgroundType : {
            $container.css({"background-color" : "rgba(255,255,255," + clockBackgroundOpacity + ")"});
            break;
        }
        case darkClockBackgroundType : {
            $container.css({"background-color" : "rgba(0,0,0," + clockBackgroundOpacity + ")"});
            break;
        }
        case darkLongClockBackgroundType : {
            $container.css({"background-color" : "rgba(0,0,0," + clockBackgroundOpacity + ")"});
            break;
        }
    }

    var clockFontBold = getClockFontBold();
    if(clockFontBold)
        $clock.addClass("clock-font-bold");

    return result;
}

/**
 * Init clock
 *
 * @param settings Object
 */
function initClock(settings) { 
    var $clock = $('.ce-countdown');
    var currentDate = new Date();
    var clockFormat = getClockFormat();
    var clockSettings = {
        day: currentDate.getDate(),
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        hour: 0,
        minute: 0,
        second: 0,
        countUp: true,
        hourLabel: translate("page_clock_hour_label"),
        hoursLabel: translate("page_clock_hours_label"),
        minuteLabel: translate("page_clock_minute_label"),
        minutesLabel: translate("page_clock_minutes_label"),
        secondLabel: translate("page_clock_second_label"),
        secondsLabel: translate("page_clock_seconds_label"),
        dayInMilliseconds: clockFormat ? 43200000 : 86400000,
        displayAmPmFormat: clockFormat,
        onChange: function(){
            printDate('onChange');
        },
        afterCalculation: function(){
            printDate('afterCalculation');
        },
        
    };
    
    for(var i in settings)
        clockSettings[i] = settings[i];
        
    $clock.countEverest(clockSettings);
    
    if(!getDisplaySpeedDialPanel() || !getVisibleSpeedDialPanel()) {
        showClock();
        
        if(clockFormat && getClockFormatLabel()) {
            setInterval(function() {
                var $label = $("#clock-format-label");
                var currentLabelText = $label.text();
                var labelText = getClockFormatLabelText();
                if($label && labelText != currentLabelText)
                    $label.text(labelText);
            }, 1000);
        }
    }
}

var lastDatePrint = false;
function printDate(){
    if(getClockDate()){
        
        var dateStr = getDateString();
        
        if(lastDatePrint != dateStr){
            var $el = $(".date-block");
            
            if(!$el.length){
                var $wr = $(".ce-countdown .ce-seconds, .ce-countdown .seconds");
                if(!$wr.length) $wr = $(".ce-countdown .ce-minutes, .ce-countdown .minutes");


                if(!$wr.length){
                    return false;
                 }else{
                    $el = $("<div></div>").addClass('date-block');
                    
                    if($('.clock-format-label').length) $el.addClass('date-and-label');
                     
                    $wr.append($el);
                }//else
            }

            $el.text(dateStr);
            
            var $AmPm = $("#clock-format-label");
            if($AmPm.length && $AmPm.css("color")){
                $(".date-block").css("color", $AmPm.css("color")+"!important");
            }//if
            
            lastDatePrint = dateStr;
        }
    }else return false;
}

/**
 * Add clock format label
 *
 * @param $clock jQuery element
 * @param color String
 */
function addClockFormatLabel($clock, color) { 
    if(getClockFormatLabel()) {
        var $label = $("<div></div>");
        $label.attr("id", "clock-format-label");
        $label.addClass("clock-format-label");
        if(color)
            $label.css({"color" : color});
        $label.text(getClockFormatLabelText());
        $clock.append($label);
        $clock.addClass("clock-format-label-padding");
    }
}

/**
 * Get clock format label text
 *
 * @returns {string}
 */
function getClockFormatLabelText() { 
    var hours = new Date().getHours();
    return (hours >= 12) ? "PM" : "AM";
}

/**
 * Get clock theme 0
 *
 * @param $clock jQuery element
 * @returns {*}
 */
function getClockTemplateTheme0($clock) { 
    var fontColor;
    var color = getClockColorScheme(0);
    loadjscssfile(getClockThemesResources(0, "font.css"), "css");
    loadjscssfile(getClockThemesResources(0, "css.css"), "css");

    $clock.addClass("ce-countdown--theme-0");

    var $clockHours = $("<span></span>").addClass("ce-hours");
    var $clockMinutes = $("<span></span>").addClass("ce-minutes");
    var $clockSeconds = $("<span></span>").addClass("ce-seconds");

    $clock.append($clockHours);
    $clock.html($clock.html() + "<span class='ce-delimiter'>:</span>");
    $clock.append($clockMinutes);
    if(getVisibleClockSeconds()) {
        $clock.html($clock.html() + "<span class='ce-delimiter'>:</span>");
        $clock.append($clockSeconds);
    }

    if(typeof (color["clock-time-color"]) != "undefined" && color["clock-time-color"]) {
        fontColor = color["clock-time-color"];
        $clock.css({"color" : fontColor});
    }

    if(getClockFormat())
        addClockFormatLabel($clock, color["clock-ampm-label-color"] || fontColor);

    return {"template" : $clock};
}

/**
 * Get clock theme 3
 *
 * @param $clock jQuery element
 * @returns {*}
 */
function getClockTemplateTheme3($clock) { 
    var fontColor;
    var color = getClockColorScheme(3);
    loadjscssfile(getClockThemesResources(3, "font.css"), "css");
    loadjscssfile(getClockThemesResources(3, "css.css"), "css");

    $clock.addClass("ce-countdown--theme-3");
    var $clockItemHours = $("<div></div>").addClass("ce-col");
    var $clockItemMinutes = $clockItemHours.clone();
    var $clockItemSeconds = $clockItemMinutes.clone();

    var $clockHours = $("<span></span>").addClass("ce-hours");
    var $clockHoursLabel = $("<span></span>").addClass("ce-hours-label");

    var $clockMinutes = $("<span></span>").addClass("ce-minutes");
    var $clockMinutesLabel = $("<span></span>").addClass("ce-minutes-label");

    var $clockSeconds = $("<span></span>").addClass("ce-seconds");
    var $clockSecondsLabel = $("<span></span>").addClass("ce-seconds-label");

    $clockItemHours.append($clockHours).append($clockHoursLabel);
    $clockItemMinutes.append($clockMinutes).append($clockMinutesLabel);
    $clockItemSeconds.append($clockSeconds).append($clockSecondsLabel);

    $clock.append($clockItemHours).append($clockItemMinutes);
    if(getVisibleClockSeconds())
        $clock.append($clockItemSeconds);

    if(typeof (color["clock-time-color"]) != "undefined" && color["clock-time-color"]) {
        fontColor = color["clock-time-color"];
        $clock.css({"color" : fontColor});
    }

    if(typeof (color["clock-label-color"]) != "undefined" && color["clock-label-color"]) {
        $clockHoursLabel.css({"color" : color["clock-label-color"]});
        $clockMinutesLabel.css({"color" : color["clock-label-color"]});
        $clockSecondsLabel.css({"color" : color["clock-label-color"]});
    }

    if(typeof (color["clock-border-line-color"]) != "undefined" && color["clock-border-line-color"]) {
        $clockItemHours.css({"border-color" : color["clock-border-line-color"]});
        $clockItemMinutes.css({"border-color" : color["clock-border-line-color"]});
        $clockItemSeconds.css({"border-color" : color["clock-border-line-color"]});
    }

    if(getClockFormat())
        addClockFormatLabel($clock, color["clock-ampm-label-color"] || fontColor);

    checkVisbleClockLabels($clockHoursLabel, $clockMinutesLabel, $clockSecondsLabel);

    return {"template" : $clock};
}

/**
 * Check visible clock labels
 *
 * @param $clockHoursLabel jQuery element
 * @param $clockMinutesLabel jQuery element
 * @param $clockSecondsLabel jQuery element
 * @return Bool
 */
function checkVisbleClockLabels($clockHoursLabel, $clockMinutesLabel, $clockSecondsLabel) { 
    var result = getClockVisibleLabel();
    if(!result) {
        var cssHide = {"display" : "none"};
        $clockHoursLabel.css(cssHide);
        $clockMinutesLabel.css(cssHide);
        $clockSecondsLabel.css(cssHide);
    }
    return result;
}

/**
 * Get clock theme 5
 *
 * @param $clock jQuery element
 * @returns {*}
 */
function getClockTemplateTheme5($clock) { 
    var fontColor;
    var color = getClockColorScheme(5);
    loadjscssfile(getClockThemesResources(5, "font.css"), "css");
    loadjscssfile(getClockThemesResources(5, "css.css"), "css");

    $clock.addClass("ce-countdown--theme-5");

    var $clockHours = $("<span></span>").addClass("ce-hours");
    var $clockMinutes = $("<span></span>").addClass("ce-minutes");
    var $clockSeconds = $("<span></span>").addClass("ce-seconds");

    $clock.append($clockHours);
    $clock.html($clock.html() + " : ");
    $clock.append($clockMinutes);
    if(getVisibleClockSeconds()) {
        $clock.html($clock.html() + " : ");
        $clock.append($clockSeconds);
    }

    if(typeof (color["clock-time-color"]) != "undefined" && color["clock-time-color"]) {
        fontColor = color["clock-time-color"];
        $clock.css({"color" : fontColor});
    }

    if(getClockFormat())
        addClockFormatLabel($clock, color["clock-ampm-label-color"] || fontColor);

    return {"template" : $clock};
}

/**
 * Get clock theme 6
 *
 * @param $clock jQuery element
 * @returns {*}
 */
function getClockTemplateTheme6($clock) { 
    var fontColor;
    var color = getClockColorScheme(6);
    loadjscssfile(getClockThemesResources(6, "font.css"), "css");
    loadjscssfile(getClockThemesResources(6, "css.css"), "css");

    $clock.addClass("ce-countdown--theme-6");
    var $clockItemHours = $("<div></div>").addClass("ce-col");
    var $clockItemMinutes = $clockItemHours.clone();
    var $clockItemSeconds = $clockItemMinutes.clone();

    var $clockHours = $("<div></div>").addClass("ce-hours");
    var $clockMinutes = $("<div></div>").addClass("ce-minutes");
    var $clockSeconds = $("<div></div>").addClass("ce-seconds");

    var $clockHoursContainer = $("<div></div>").addClass("ce-flip-wrap");
    var $clockMinutesContainer = $clockHoursContainer.clone();
    var $clockSecondsContainer = $clockMinutesContainer.clone();

    var $clockHoursFront = $("<div></div>").addClass("ce-flip-front");
    var $clockMinutesFront = $clockHoursFront.clone();
    var $clockSecondsFront = $clockMinutesFront.clone();

    var $clockHoursBack = $("<div></div>").addClass("ce-flip-back");
    var $clockMinutesBack = $clockHoursBack.clone();
    var $clockSecondsBack = $clockMinutesBack.clone();

    $clockHoursContainer.append($clockHoursFront).append($clockHoursBack);
    $clockMinutesContainer.append($clockMinutesFront).append($clockMinutesBack);
    $clockSecondsContainer.append($clockSecondsFront).append($clockSecondsBack);

    var $clockHoursLabel = $("<span></span>").addClass("ce-hours-label");
    var $clockMinutesLabel = $("<span></span>").addClass("ce-minutes-label");
    var $clockSecondsLabel = $("<span></span>").addClass("ce-seconds-label");

    $clockHours.append($clockHoursContainer);
    $clockMinutes.append($clockMinutesContainer);
    $clockSeconds.append($clockSecondsContainer);

    $clockItemHours.append($clockHours).append($clockHoursLabel);
    $clockItemMinutes.append($clockMinutes).append($clockMinutesLabel);
    $clockItemSeconds.append($clockSeconds).append($clockSecondsLabel);

    $clock.append($clockItemHours).append($clockItemMinutes);
    if(getVisibleClockSeconds())
        $clock.append($clockItemSeconds);

    if(typeof (color["clock-time-color"]) != "undefined" && color["clock-time-color"]) {
        fontColor = color["clock-time-color"];
        $clockHours.css({"color" : fontColor});
        $clockMinutes.css({"color" : fontColor});
        $clockSeconds.css({"color" : fontColor});
    }

    if(typeof (color["clock-label-color"]) != "undefined" && color["clock-label-color"]) {
        $clockHoursLabel.css({"color" : color["clock-label-color"]});
        $clockMinutesLabel.css({"color" : color["clock-label-color"]});
        $clockSecondsLabel.css({"color" : color["clock-label-color"]});
    }

    if(typeof (color["clock-digit-bg-color"]) != "undefined" && color["clock-digit-bg-color"]) {
        var bgColorRgb = hexToRgb(color["clock-digit-bg-color"]);
        if(bgColorRgb) {
            var bgColor = "rgba(" + bgColorRgb.r + "," + bgColorRgb.g + "," + bgColorRgb.b + ", 0.65)";
            $clockHoursFront.css({"background-color" : bgColor});
            $clockHoursBack.css({"background-color" : bgColor});

            $clockMinutesFront.css({"background-color" : bgColor});
            $clockMinutesBack.css({"background-color" : bgColor});

            $clockSecondsFront.css({"background-color" : bgColor});
            $clockSecondsBack.css({"background-color" : bgColor});
        }
    }

    if(getClockFormat())
        addClockFormatLabel($clock, color["clock-ampm-label-color"] || fontColor);

    checkVisbleClockLabels($clockHoursLabel, $clockMinutesLabel, $clockSecondsLabel);

    var settings = {
        hoursWrapper: '.ce-hours .ce-flip-back',
        minutesWrapper: '.ce-minutes .ce-flip-back',
        secondsWrapper: '.ce-seconds .ce-flip-back',
        wrapDigits: false,
        onChange: function() {
            redrawFlipClock($('.ce-countdown .ce-col>div'), this);
        }
    };
    return {"template" : $clock, "settings" : settings};
}

/**
 * Get clock theme 7
 *
 * @param $clock jQuery element
 * @returns {*}
 */
function getClockTemplateTheme7($clock) { 
    var fontColor;
    var color = getClockColorScheme(7);
    loadjscssfile(getClockThemesResources(7, "font.css"), "css");
    loadjscssfile(getClockThemesResources(7, "css.css"), "css");

    $clock.addClass("ce-countdown--theme-7");

    var $digitsContainer = $("<div></div>").addClass("ce-digits-container");

    var $clockHours = $("<span></span>").addClass("ce-digits").addClass("ce-hours");
    var $clockMinutes = $("<span></span>").addClass("ce-digits").addClass("ce-minutes");
    var $clockSeconds = $("<span></span>").addClass("ce-digits").addClass("ce-seconds");

    $digitsContainer.append($clockHours);
    $digitsContainer.html($digitsContainer.html() + " :     ");
    $digitsContainer.append($clockMinutes);
    if(getVisibleClockSeconds()) {
        $digitsContainer.html($digitsContainer.html() + " :     ");
        $digitsContainer.append($clockSeconds);
        
        $clock.css('width','auto');//firefox
    }

    if(typeof (color["clock-time-color"]) != "undefined" && color["clock-time-color"]) {
        fontColor = color["clock-time-color"];
        $clock.css({"color" : color["clock-time-color"]});
    }

    if(getClockFormat())
        addClockFormatLabel($digitsContainer, color["clock-ampm-label-color"] || fontColor);

    $clock.append($digitsContainer);

    var settings = {
        onChange: function() {
            redrawSlidUpClock($('.ce-digits span'));
        }
    };
    return {"template" : $clock, "settings" : settings};
}

/**
 * Get clock theme 9
 *
 * @param $clock jQuery element
 * @returns {*}
 */
function getClockTemplateTheme9($clock) { 
    var fontColor;
    var color = getClockColorScheme(9);
    loadjscssfile(getClockThemesResources(9, "font.css"), "css");
    loadjscssfile(getClockThemesResources(9, "css.css"), "css");

    $clock.addClass("ce-countdown--theme-9");
    var $clockItemHours = $("<div></div>").addClass("ce-circle");
    var $clockItemCanvasHours = $("<canvas></canvas>");
    $clockItemCanvasHours.attr("id", "ce-hours");
    $clockItemCanvasHours.attr("width", "408").attr("height", "408");
    var $clockItemValuesHours = $("<div></div>");
    $clockItemValuesHours.addClass("ce-circle__values");
    var $clockItemMinutes = $clockItemHours.clone();
    var $clockItemCanvasMinutes = $clockItemCanvasHours.clone();
    $clockItemCanvasMinutes.attr("id", "ce-minutes");
    var $clockItemValuesMinutes = $clockItemValuesHours.clone();
    var $clockItemSeconds = $clockItemMinutes.clone();
    var $clockItemCanvasSeconds = $clockItemCanvasMinutes.clone();
    $clockItemCanvasSeconds.attr("id", "ce-seconds");
    var $clockItemValuesSeconds = $clockItemValuesMinutes.clone();

    var $clockHours = $("<span></span>").addClass("ce-hours").addClass("ce-digit");
    var $clockHoursLabel = $("<span></span>").addClass("ce-hours-label").addClass("ce-label");

    var $clockMinutes = $("<span></span>").addClass("ce-minutes").addClass("ce-digit");
    var $clockMinutesLabel = $("<span></span>").addClass("ce-minutes-label").addClass("ce-label");

    var $clockSeconds = $("<span></span>").addClass("ce-seconds").addClass("ce-digit");
    var $clockSecondsLabel = $("<span></span>").addClass("ce-seconds-label").addClass("ce-label");

    $clockItemValuesHours.append($clockHours).append($clockHoursLabel);
    $clockItemValuesMinutes.append($clockMinutes).append($clockMinutesLabel);
    $clockItemValuesSeconds.append($clockSeconds).append($clockSecondsLabel);

    $clockItemHours.append($clockItemCanvasHours).append($clockItemValuesHours);
    $clockItemMinutes.append($clockItemCanvasMinutes).append($clockItemValuesMinutes);
    $clockItemSeconds.append($clockItemCanvasSeconds).append($clockItemValuesSeconds);

    $clock.append($clockItemHours).append($clockItemMinutes);
    if(getVisibleClockSeconds())
        $clock.append($clockItemSeconds);

    if(typeof (color["clock-time-color"]) != "undefined" && color["clock-time-color"]) {
        fontColor = color["clock-time-color"];
        $clockHours.css({"color" : fontColor});
        $clockMinutes.css({"color" : fontColor});
        $clockSeconds.css({"color" : fontColor});
    }

    if(typeof (color["clock-label-color"]) != "undefined" && color["clock-label-color"]) {
        $clockHoursLabel.css({"color" : color["clock-label-color"]});
        $clockMinutesLabel.css({"color" : color["clock-label-color"]});
        $clockSecondsLabel.css({"color" : color["clock-label-color"]});
    }

    if(typeof (color["clock-circle-done-line-color"]) != "undefined" && color["clock-circle-done-line-color"])
        clockCircleDoneColor = color["clock-circle-done-line-color"];

    if(typeof (color["clock-circle-total-line-color"]) != "undefined" && color["clock-circle-total-line-color"])
        clockCircleTotalColor = color["clock-circle-total-line-color"];

    if(getClockFormat())
        addClockFormatLabel($clock, color["clock-ampm-label-color"] || fontColor);

    if(!checkVisbleClockLabels($clockHoursLabel, $clockMinutesLabel, $clockSecondsLabel)) {
        $clockItemValuesHours.addClass("clock-label-hidden");
        $clockItemValuesMinutes.addClass("clock-label-hidden");
        $clockItemValuesSeconds.addClass("clock-label-hidden");
    }

    var settings = {
        leftHandZeros: false,
        onChange: clockRedrawCircles
    };
    return {"template" : $clock, "settings" : settings};
}

/**
 * Get clock theme 3
 *
 * @param $clock jQuery element
 * @returns {*}
 */
function getClockTemplateTheme10($clock) { 
    var fontColor;
    var color = getClockColorScheme(10);
    loadjscssfile(getClockThemesResources(10, "font1.css"), "css");
    loadjscssfile(getClockThemesResources(10, "font2.css"), "css");
    loadjscssfile(getClockThemesResources(10, "css.css"), "css");

    $clock.addClass("ce-countdown--theme-10");

    var $clockItemHours = $("<div></div>").addClass("ce-unit-wrap");
    var $clockItemMinutes = $clockItemHours.clone();
    var $clockItemSeconds = $clockItemMinutes.clone();

    var $clockHoursValue = $("<div></div>").addClass("hours");
    var $clockMinutesValue = $("<div></div>").addClass("minutes");
    var $clockSecondsValue = $("<div></div>").addClass("seconds");

    var $clockHoursLabel = $("<span></span>").addClass("ce-hours-label");
    var $clockMinutesLabel = $("<span></span>").addClass("ce-minutes-label");
    var $clockSecondsLabel = $("<span></span>").addClass("ce-seconds-label");

    $clockItemHours.append($clockHoursValue).append($clockHoursLabel);
    $clockItemMinutes.append($clockMinutesValue).append($clockMinutesLabel);
    $clockItemSeconds.append($clockSecondsValue).append($clockSecondsLabel);

    $clock.append($clockItemHours).append($clockItemMinutes);
    if(getVisibleClockSeconds())
        $clock.append($clockItemSeconds);

    if(typeof (color["clock-time-color"]) != "undefined" && color["clock-time-color"]) {
        fontColor = color["clock-time-color"];
        clockBoardDigitColor = fontColor;
    }

    if(typeof (color["clock-label-color"]) != "undefined" && color["clock-label-color"]) {
        $clockHoursLabel.css({"color" : color["clock-label-color"]});
        $clockMinutesLabel.css({"color" : color["clock-label-color"]});
        $clockSecondsLabel.css({"color" : color["clock-label-color"]});
    }

    if(typeof (color["clock-digit-bg-color"]) != "undefined" && color["clock-digit-bg-color"])
        clockBoardBgColor = color["clock-digit-bg-color"];

    if(getClockFormat())
        addClockFormatLabel($clock, color["clock-ampm-label-color"] || fontColor);

    checkVisbleClockLabels($clockHoursLabel, $clockMinutesLabel, $clockSecondsLabel);

    var settings = {
        leftHandZeros: false,
        afterCalculation: clockRedrawBoard
    };

    return {"template" : $clock, "settings" : settings};
}

/**
 * Redraw board values
 */
var clockFormatCached = null;
function clockRedrawBoard() { 
    var $countdown = $('.ce-countdown');
    if(!$countdown.length)
        return;
    
    var pHours = this.hours
        
    var cHours = new Date().getHours();
    
    if(cHours == 12 && pHours == 0) pHours = cHours;
    else if(pHours == 0 && cHours == 0){
        if(clockFormatCached === null) clockFormatCached = getClockFormat();
        //1 = 12, 0 = 24
        if(clockFormatCached == 1) pHours = 12;
    }//else
    
    var plugin = this;
    var units = {
            hours: pHours,//this.hours,
            minutes: this.minutes,
            seconds: this.seconds
        },
        maxValues = { //max values per unit
            hours: '23',
            minutes: '59',
            seconds: '59'
        },
        actClass = 'active',
        befClass = 'before';

    if (firstCalculation == true) { //build necessary elements
        firstCalculation = false;

        $countdown.find('.ce-unit-wrap div').each(function () { //build necessary markup
            var $this = $(this),
                className = $this.attr('class'),
                value = units[className],
                sub = '',
                dig = '';

            for(var x = 0; x < 10; x++) { //build markup per unit digit
                sub += [
                    '<div class="digits-inner">',
                    '<div class="flip-wrap">',
                    '<div class="up">',
                    '<div class="shadow"></div>',
                    '<div class="inn" style="color: ' + clockBoardDigitColor + '; background-color: ' + clockBoardBgColor + '">' + x + '</div>',
                    '</div>',
                    '<div class="down">',
                    '<div class="shadow"></div>',
                    '<div class="inn" style="color: ' + clockBoardDigitColor + '; background-color: ' + clockBoardBgColor + '">' + x + '</div>',
                    '</div>',
                    '</div>',
                    '</div>'
                ].join('');
            }

            for (var i = 0; i < 2; i++) { //build markup for number
                dig += '<div class="digits">' + sub + '</div>';
            }
            $this.append(dig);
        });
    }

    $.each(units, function(unit) { //iterate through units
        var digitCount = $countdown.find('.' + unit + ' .digits').length,
            maxValueUnit = maxValues[unit],
            maxValueDigit,
            value = plugin.strPad(this, digitCount, '0');

        for (var i = 0; i < value.length; i++) { //iterate through digits of an unit
            var $digitsWrap = $countdown.find('.' + unit + ' .digits:eq(' + (i) + ')'),
                $digits = $digitsWrap.find('div.digits-inner');

            if (maxValueUnit) { //use defined max value for digit or simply 9
                maxValueDigit = (maxValueUnit[i] == 0) ? 9 : maxValueUnit[i];
            } else {
                maxValueDigit = 9;
            }

            var activeIndex = parseInt(value[i]), //which numbers get the active and before class
                beforeIndex = (activeIndex > maxValueDigit) ? 0 : activeIndex - 1;

            if ($digits.eq(beforeIndex).hasClass(actClass)) { //check if value change is needed
                $digits.parent().addClass('play');
            }

            $digits //remove all classes
                .removeClass(actClass)
                .removeClass(befClass);

            //set classes
            $digits.eq(activeIndex).addClass(actClass);
            $digits.eq(beforeIndex).addClass(befClass);
        }
    });
}


/**
 * Redraw slide up clock
 *
 * @param $el
 */
function redrawSlidUpClock($el) { 
    $el.each( function() {
        var $this = $(this),
            fieldText = $this.text(),
            fieldData = $this.attr('data-value'),
            fieldOld = $this.attr('data-old');
        if (typeof fieldOld === 'undefined') {
            $this.attr('data-old', fieldText);
        }
        if (fieldText != fieldData) {
            $this.attr('data-value', fieldText).attr('data-old', fieldData).addClass('ce-animate');
            setTimeout(function() {
                $this.removeClass('ce-animate').attr('data-old', fieldText);
            }, 300);
        }
    });
}

/**
 * Redraw flip clock
 *
 * @param $el
 * @param data
 */
function redrawFlipClock($el, data) { 
    $el.each(function() {
        var $this = $(this),
            $flipFront = $this.find('.ce-flip-front'),
            $flipBack = $this.find('.ce-flip-back'),
            field = $flipBack.text(),
            fieldOld = $this.attr('data-old');
        if (typeof fieldOld === 'undefined') {
            $this.attr('data-old', field);
        }
        if (field != fieldOld) {
            $this.addClass('ce-animate');
            setTimeout(function() {
                $flipFront.text(field);
                $this.removeClass('ce-animate').attr('data-old', field);
            }, 800);
        }
    });
}

/**
 * Redraw circle values
 */
function clockRedrawCircles() { 
    drawCircle($('#ce-hours').get(0), this.hours, 24);
    drawCircle($('#ce-minutes').get(0), this.minutes, 60);
    if($('#ce-seconds').length)
        drawCircle($('#ce-seconds').get(0), this.seconds, 60);
}

/**
 * Draw clock type circle
 *
 * @param canvas
 * @param value
 * @param max
 */
function drawCircle(canvas, value, max) { 
    var	primaryColor = clockCircleTotalColor,
        secondaryColor = clockCircleDoneColor,
        circle = canvas.getContext('2d');

    circle.clearRect(0, 0, canvas.width, canvas.height);
    circle.lineWidth = 4;

    circle.beginPath();
    circle.arc(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2 - circle.lineWidth,
        clockRotateDeg(0),
        clockRotateDeg(360 / max * (max - value)),
        false);
    circle.strokeStyle = secondaryColor;
    circle.stroke();

    circle.beginPath();
    circle.arc(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2 - circle.lineWidth,
        clockRotateDeg(0),
        clockRotateDeg(360 / max * (max - value)),
        true);
    circle.strokeStyle = primaryColor;
    circle.stroke();
}

/**
 * Calculate clock rotate deg
 *
 * @param v
 * @returns {number}
 */
function clockRotateDeg(v) { 
    return (Math.PI/180) * v - (Math.PI/2);
}



//clockPlaceState = data;
clockOnWindowResizeHandlerOff = false;
function clockOnWindowResizeHandler(){
    onWindowResizeFunctions["clock"] = function(event){
        clockAlignment();
    }
    
    /*
    window.onresize = function (event) {
        clockAlignment();
        
        //if(clockOnWindowResizeHandlerOff) return;
        //clockOnWindowResizeHandlerOff = true;
        //setTimeout(function(){
        //    clockOnWindowResizeHandlerOff = false;
        //    clockAlignment();
        //}, 15);
    }//window onresize
    */
}


function addClockBlockDraggableProperty() { 
    var $wrap = $("#mv-clock-wrap");
    var $move = $(".mv-clock-move");
    /*
    $wrap.on("mouseover", function(){
       $move.stop(true, true).delay(450).animate({"opacity":0.85});
    });
    
    $wrap.on("mouseout", function(){
       $move.stop(true, true).animate({"opacity":0});
    });
    */
    $wrap.draggable({
        $move: ".mv-clock-move", 
        //containment: "#background-borders", 
        scroll: false,
        delay : 150,
        start: function( event, ui ) {
            $wrap.addClass("dragging");
        },
        stop : function(event, ui) {
            updateClockCoordinates();

            setTimeout(()=>{
                $wrap.removeClass("dragging");
            }, 75);
        }
    });
}

function updateClockCoordinates(){
    var clock = getClockPlace(true);
    
    var upd = {
        top  : Math.max(-210, parseInt(clock.$wrap.css("top"))),
        left : Math.max(-500, parseInt(clock.$wrap.css("left")))
    }//upd
    
    getSettingsValue("clock-place", null, function(data) {
        var data = JSON.parse(data || '{}');
        
        data.top   = Math.round(10000 * (upd.top  + clock.h/2) / clock.win.h) / 100;
        data.left  = Math.round(10000 * (upd.left + clock.w/2) / clock.win.w) / 100;
        
        clockPlaceState = data;
        
        setSettingsValue("clock-place", JSON.stringify(data), function(data2) {
            clockAlignment();
        });
    });
    
}

function clockAlignment(){
    var clock = getClockPlace(true, false);
    
    clock.$wrap.css({
        top  : clock.top  + "px",
        left : clock.left  + "px"
    });
    
    if(clock.$wrap.find(".clock-container").hasClass("clock-background")){
        if(!clock.$wrap.hasClass("wide-background")){
            clock.$wrap.addClass("wide-background");
            clock.$wrap.find(".wide-bg").animate({
                "background-color": clock.$wrap.find("#clock-container").css("background-color")
            }, 1600);
            
            
        }//if
    }//if
}

function getClockPlace(safe, align){
    var $clock = $("#mv-clock-wrap");
    
    var clock = {
        $wrap: $clock,
        w : $clock.width(),
        h : $clock.height(),
        win: {
            w : $(window).width(),
            h : $(window).height()
        }
    };
    
    if(safe){
        var hSafe = 210, wSafe = 600;
        
        if(getClockSize() != "large"){
            hSafe = 20;
            wSafe = 50;
        }
        
        clock.w = Math.max(parseInt(clock.w), wSafe);
        clock.h = Math.max(parseInt(clock.h), hSafe);
    }//if
    
    if(!clockPlaceState || typeof clockPlaceState.top == "undefined"){
        clock.top  = Math.max(Math.min(Math.floor(clock.win.h / 2), (300 + clock.h/2)), (50 + clock.h/2));
        clock.top -= clock.h/2;
    }else{
        clock.top = Math.floor(
            Math.min(
                (clock.win.h - (clock.h * 0.65)), 
                Math.max(
                    (-0.25 * clock.h), 
                    ((clock.win.h * clockPlaceState.top / 100) - clock.h/2)
                )
            )
        );        
    }//else
    
    if(!clockPlaceState || typeof clockPlaceState.left == "undefined"){
        clock.left  = Math.floor(clock.win.w / 2);
        clock.left -= clock.w/2;
    }else{
        clock.left = Math.floor(
            Math.min(
                (clock.win.w - (clock.w * 0.75)), 
                Math.max(
                    (-0.25 * clock.w), 
                    ((clock.win.w * clockPlaceState.left / 100) - clock.w/2)
                )
            )
        );
    }//else
    
    return clock;
}