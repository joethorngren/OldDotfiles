var weatherShowTimer, weatherForecastStopper=false, weatherInEdit=false, weatherForecastPrinted=false, stateForecastInScroll=false;
var defaultWeatherStyle = {"right" : 25 + "px", "left" : "auto", "top" : 10 + "px", "bottom" : "auto"};

/**
 * Get client current location
 */
function getCurrentLocation(force) {
    var $text = $("#weather-intro-text");
    var $intro = $("#weather-intro");
    var $active = $("#weather-active");
    
    if(!force){
        getSettingsValue("location-weather-geo", false, function(values){
            if(!values){
                if(!Boolean(localStorage.getItem("dont-ask-weather-location"))){
                    getCurrentLocation(true);
                }else{
                    $active.css({"display" : "none"});
                    $intro.css({"display" : "inline-block"});
                }
            }else{
                var geo = JSON.parse(values);
                //console.log("GEO saved", geo);
                getLocationWeather(geo, true);
                endEditClientPlace($("#weather-city"));
            }//else
        });
        
    }else if(
        force ||
        !Boolean(localStorage.getItem("dont-ask-weather-location"))
    ){
        localStorage.setItem("dont-ask-weather-location", 1);
        
        $text.attr("def-text", $text.text()).text(translate("weather_loading"));
        addWeatherLoadingAnimation($text);
        
        navigator.geolocation.getCurrentPosition(function(geo) {
            var data = {
                coords:{
                    accuracy : geo.coords.accuracy,
                    latitude : geo.coords.latitude,
                    longitude: geo.coords.longitude,
                }
            };
            
            setSettingsValue("location-weather-geo", JSON.stringify(data));
            
            getLocationWeather(geo, true);
            endEditClientPlace($("#weather-city"));
            
            localStorage.removeItem("dont-ask-weather-location");
        }, getLocationError);
    }else{
        $active.css({"display" : "none"});
        $intro.css({"display" : "inline-block"});
    }//else
    
    setTimeout(function(){
        $text.html('').text($text.attr("def-text"));
    }, 10000);
}

function addWeatherLoadingAnimation($object){
    $(".circleGM").remove();
    
    $object.append(
        $("<div>").addClass("circleGM")
        .append(
            $("<div>").addClass("circleG").addClass("circleG_1")
        )
        .append(
            $("<div>").addClass("circleG").addClass("circleG_2")
        )
        .append(
            $("<div>").addClass("circleG").addClass("circleG_3")
        )
    );
}

function isAccuWeather(){
    
    var accuErr = parseInt(localStorage.getItem("accuweather-error")) || false;
    
    if(accuErr){
        //console.info("isAccuWeather", accuErr);
        if((Date.now() - accuErr) < accuweatherErrorTimeout) return false;
        else localStorage.removeItem("accuweather-error");
    }
    
    if(AUTH && AUTH.isPremium()) return true;
    
    return false;
}

/**
 * Get location weather by client coordinates
 *
 * @param geo Object
 * @param skipCache Bool
 */
function getLocationWeather(geo, skipCache) {
    locationWeatherCacheNeedUpdate(function(update) {
        getLastLocationWeather(function(locationWeather) {
            
            if(isAccuWeather()) $(".weather").addClass("weather-accuweather");/*weather on*/
            else $(".weather").removeClass("weather-accuweather");
            
            if(skipCache) update = true;
            else if(isAccuWeather()){/*weather on*/
                if(locationWeather.source != "accuweather") update = true;
            }else{
                if(locationWeather.source == "accuweather") update = true;
            }//else
            
            if(update) {
                if(isAccuWeather()){//For premium /*weather on*/
                    //console.log(locationWeather);
                    if(geo){
                        //Get location
                        getPlaceWeatherAccuweather(geo, displayWeather);
                    }else{
                        if(!locationWeather.location.key){
                            getCurrentLocation();
                        }else{
                            //Weather
                            getWeatherAccuweather(locationWeather.location.key, locationWeather.location, displayWeather);
                        }//else
                    }//else
                }else{//Free weather
                    BRW_getAcceptLanguages(function(languages) {
                        var hasRuLanguage = languages.indexOf("ru") != -1;
                        
                        if(!locationWeather || locationWeather.source != "accuweather" || geo){
                            if(geo) {
                                if(hasRuLanguage)
                                    getPlaceWeatherYandex(geo, displayWeather);
                                else
                                    getPlaceWeather(geo.coords.latitude+","+geo.coords.longitude, displayWeather);
                            } else {
                                if(typeof (locationWeather['source']) != "undefined") {
                                    if(locationWeather.source == locationWeatherSourceYandex)
                                        getWeatherYandex(locationWeather.location.woeid, locationWeather.location, displayWeather);
                                    else
                                        getWeather(locationWeather.location.woeid, locationWeather.location, displayWeather);
                                } else {
                                    getWeather(locationWeather.location.woeid, locationWeather.location, displayWeather);
                                }
                            }
                        }else{
                            getCurrentLocation();
                        }//else
                    });
                }//else
            } else
                displayWeather(locationWeather);
        });

    });
}

/**
 * Get client current location error
 *
 * @param e Error
 */
function getLocationError(e) { 
    localStorage.setItem("dont-ask-weather-location", 1);
    
    var $block = $("#header-weather");
        $block.css(defaultWeatherStyle);
    var $intro = $("#weather-intro");
    var $active = $("#weather-active");
    var $error = $("#weather-error");
    if($active.is(":visible"))
        $active.css({"display" : "none"});
    if($intro.is(":visible"))
        $intro.css({"display" : "none"});
    if(!$error.is(":visible"))
        $error.css({"display" : "inline-block"});
    $("#weather-input-city-field").focus();
}

/**
 * Display client weather
 *
 * @param locationWeather Object
 */
function displayWeather(locationWeather) {
    var $weatherUnits = $("#weather-units");
    var $weatherBackground = $("#header-weather");
    var $weatherForecast   = $(".weather-forecast");
    
    if(isAccuWeather() && locationWeather.source == locationWeatherSourceAccuweather){/*weather on*/
       $("#weather-icon")
            .html("")
            .addClass("accuweather-icon-mini")
            .attr("title", locationWeather.weather.text ? locationWeather.weather.text.capitalizeFirstLetter() : "")
            .append(
                $("<img>")
                    .addClass("accuweather-img")
                    .attr(
                        "src",
                        "./img/weather/icons/" + ("0" + locationWeather.weather.code).substr(-2) + "-s.png"
                    )
            )
            .removeAttr("data-icon")
        ;
    }else{
        $(".accuweather-img").remove();
        $("#weather-icon").attr("title", locationWeather.weather.text ? locationWeather.weather.text.capitalizeFirstLetter() : "")
            .attr("data-icon", getWeatherImage(locationWeather.weather.code));
       
    }
    
    $("#weather-temperature").html(locationWeather.weather.temp + "&deg;");
    $("#weather-city").html(locationWeather.location.city);
    $weatherUnits.html(locationWeather.unit.toUpperCase());

    getDisplayWeatherUnit(function(display) {
        if(display)
            $weatherUnits.css({"display" : "inline"});
    });

    getDisplayWeatherBackground(function(display) {
        var opacity = 0;
        if(display)
            opacity = getWeatherBackgroundOpacity();
        $weatherBackground.css({"background-color": "rgba(0, 0, 0, " + opacity + ")"});
        $weatherForecast.css({"background-color": "rgba(0, 0, 0, " + (1.2 * Math.max(opacity, 0.35)) + ")"});
    });
    
    //$weatherBackground.css({"opacity" : getWeatherOpacity()});
    //console.log($weatherBackground.length);
    
    var $intro = $("#weather-intro");
    var $active = $("#weather-active");
    var $error = $("#weather-error");

    $("#weather-input-city-field").val("");

    if($intro.is(":visible"))
        $intro.css({"display" : "none"});
    if($error.is(":visible"))
        $error.css({"display" : "none"});
    if(!$active.is(":visible")) {
        addWeatherListDraggableProperty();
        displayWeatherContainer();
        $active.fadeIn();
    }
    
    setTimeout(function(){
        weatherForecastInit();
    }, 300);
                                          
    //if(typeof redrawActionButtons != "undefined") redrawActionButtons();
}

weatherForecastInitTime = 0;
function weatherForecastInit(){
    var now = Date.now();
    
    if(now - weatherForecastInitTime > 1500){
        weatherForecastInitTime = now;
        
        printWeatherForecast();
        handleWeatherForecastHide(); 
    }//if
}//weatherForecastInit

/**
 * Display weather container
 */
function displayWeatherContainer() {
    var $weatherContainer = $("#header-weather");
    var windowHeight = parseInt($(window).height());
    var windowWidth = parseInt($(window).width());
    var containerHeight = parseInt($weatherContainer.height());
    var containerWidth = parseInt($weatherContainer.width());
    var displayWeatherCoordinates = getDisplayWeatherCoordinates();
    if (typeof (displayWeatherCoordinates) != "undefined") {
        var displayTop, displayLeft;

        if (displayWeatherCoordinates) {
            displayTop = parseInt(displayWeatherCoordinates.top);
            displayLeft = parseInt(displayWeatherCoordinates.left);
        }

        if (((displayLeft + containerWidth) > windowWidth) || (displayLeft < 0) || ((displayTop + containerHeight) > windowHeight) || (displayTop < 0))
            $weatherContainer.css(defaultWeatherStyle);
        else {
            if (displayWeatherCoordinates)
                $weatherContainer.css({"left": displayLeft + "px", "right" : "auto", "top": displayTop + "px", "bottom" : "auto"});
            else
                $weatherContainer.css(defaultWeatherStyle);
        }


        $(window).resize(function () {
            var $weatherContainer = $("#header-weather");
            if ($weatherContainer.is(":visible")) {
                if (weatherShowTimer)
                    clearTimeout(weatherShowTimer);
                weatherShowTimer = setTimeout(function () {
                    calculateNewWeatherPosition();
                }, 20);
            }
        });
    }
}

/**
 * Add weather list draggable
 */
function addWeatherListDraggableProperty() {
    $("#header-weather").draggable({ handle: "#weather-active", containment: "#background-borders", scroll: false, delay:450,
        start: function(event, ui) {
            weatherForecastStopper=true;
        },
        stop: function(event, ui) {
            setTimeout(function(){
                weatherForecastStopper=false;
            }, 400);
            
            updateWeatherCoordinates($(this));
        }
    });
}

/**
 * Update weather list coordinates
 *
 * @param $el jQuery element
 */
function updateWeatherCoordinates($el) { 
    var Stoppos = $el.position();
    var left = parseInt(Stoppos.left);
    var top = parseInt(Stoppos.top);
    
    var right = parseInt(Stoppos.left);
    
    BRW_sendMessage({command: "changeWeatherItemCoordinates", "left": left,  "top": top});
}

/**
 * Calculate new weather position
 */
function calculateNewWeatherPosition() { 
    var $weatherContainer = $("#header-weather");

    var coordinates = getDisplayWeatherCoordinates();
    var windowHeight = parseInt($(window).height());
    var windowWidth = parseInt($(window).width());

    var Stoppos = $weatherContainer.position();
    var displayLeft = parseInt(Stoppos.left);
    var displayTop = parseInt(Stoppos.top);

    var containerWidth = $weatherContainer.width();
    var containerHeight = $weatherContainer.height();

    var displayLeftStyle = false;
    var displayTopStyle = false;

    if(displayLeft + containerWidth >= windowWidth) {
        $weatherContainer.css(defaultWeatherStyle);
    } else {
        if(coordinates) {
            if(coordinates.left + containerWidth >= windowWidth)
                $weatherContainer.css(defaultWeatherStyle);
            else
                displayLeftStyle = true;
        }
        else
            $weatherContainer.css(defaultWeatherStyle);
    }

    if(windowHeight - containerHeight >= 0) {
        if(displayTop + containerHeight >= windowHeight) {
            $weatherContainer.css(defaultWeatherStyle);
        } else {
            if(coordinates) {
                if(coordinates.top + containerHeight >= windowHeight)
                    $weatherContainer.css(defaultWeatherStyle);
                else
                    displayTopStyle = true;
            } else
                $weatherContainer.css(defaultWeatherStyle);
        }
    } else
        $weatherContainer.css(defaultWeatherStyle);

    if(displayLeftStyle && displayTopStyle)
        $weatherContainer.css({"right" : "auto", "left" : coordinates.left, "top" : coordinates.top, "bottom" : "auto"});
    else
        $weatherContainer.css(defaultWeatherStyle);

    if(displayLeft < 0)
        $weatherContainer.css(defaultWeatherStyle);
    else if(displayTop < 0)
        $weatherContainer.css(defaultWeatherStyle);
}

/**
 * Set client default location weather
 */
function setDefaultLocationWeather() { 
    getLastLocationWeather(function(locationWeather) {
        if(locationWeather)
            displayWeather(locationWeather);
    });
}

/**
 * Edit client place
 *
 * @param e Event
 */
function editClientPlace(e) { 
    weatherForecastStopper = true;
    weatherInEdit = true;
    
    var $el = $("#weather-city");//$(this);
    if(!$el.hasClass("editing"))
        $el.addClass("editing");
    if(!$el.hasClass("pulse"))
        $el.addClass("pulse");
    $el.attr("contenteditable",true);
    $("#weather-location-current").fadeIn();
    $("#weather-city").attr("title", "");
    
    $el.focus();//.text(city);
    placeCaretAtEnd( $el[0] );
    
    setTimeout(()=>{
        if(typeof WeatherSuggest == "object") WeatherSuggest.change();
    }, 250);
}

function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

/**
 * Client place input key press event handler
 *
 * @param e Event
 */
function onClientPlaceKeypress(e) { 
    var $el = $(this);
    if(e.keyCode == 13) {
        confirmClientPlace($el);
    }
}

/**
 * Client place input key down event handler
 *
 * @param e Event
 */
function onClientPlaceKeydown(e) { 
    var $el = $(this);
    if(e.keyCode == 27) { // cancel input client place
        setDefaultLocationWeather();
        endEditClientPlace($el);
    }
}

/**
 * Client place input focus out event handler
 *
 * @param e Event
 */
function onClientPlaceFocusOut(e) {
    var $el = $(this);
    setDefaultLocationWeather();
    endEditClientPlace($el);
}

/**
 * Confirm client place
 *
 * @param $el jQuery element
 */
function confirmClientPlace($el, placeByKey) { 
    if(typeof WeatherSuggest == "object" && WeatherSuggest.state.cursor.cur && !placeByKey) return;
    
    var val = $el.text().trim();
    
    if(val || placeByKey) {
        if(isAccuWeather()){//For premium /*weather on*/
            if(!placeByKey) searchPlaceByDirectInputAccuweather(val, displayWeather);
            else searchPlaceByDirectInputAccuweather(placeByKey, displayWeather, true);
        }else{
            if(!placeByKey){
                //console.debug('wrong way', placeByKey);
                BRW_getAcceptLanguages(function(languages) {
                    var hasRuLanguage = languages.indexOf("ru") != -1;
                    if (hasRuLanguage)
                        searchPlaceByDirectInputYandex(val, displayWeather);
                    else
                        searchPlaceByDirectInput(val, displayWeather);
                });
            }else{
                searchPlaceByDirectInput(placeByKey, displayWeather, true);
            }
            
        }//else
    } else
        setDefaultLocationWeather();

    endEditClientPlace($el);
}

/**
 * End edit client place
 *
 * @param $el jQuery element
 */
function endEditClientPlace($el) { 
    $el.attr("contenteditable",false).removeClass("editing").removeClass("pulse").addClass("pulse");
    $("#weather-location-current").fadeOut();
    $("#weather-city").attr("title", translate("options_application_weather_city"));
    weatherInEdit = false;
    
    setTimeout(()=>{
        if(typeof WeatherSuggest == "object") WeatherSuggest.draw("hide");
    }, 250);
}

/**
 * Set intro click button
 */
function setIntroClickHandler() { 
    $("#weather-intro").unbind("click").on("click", function(e) {
        e.preventDefault();
        getCurrentLocation(true);
    });
}

/**
 * Client form place submit
 *
 * @param e Event
 */
function onClientPlaceFormSubmit(e) { 
    e.preventDefault();
    
    addWeatherLoadingAnimation($("#weather-input-city-form .weather-loading-container"));
    
    var val = $("#weather-input-city-field").val().trim();
    if(val) {
        if(isAccuWeather()){//For premium /*weather on*/
            searchPlaceByDirectInputAccuweather(val, displayWeather);
        }else{
            BRW_getAcceptLanguages(function(languages) {
                var hasRuLanguage = languages.indexOf("ru") != -1;
                if (hasRuLanguage)
                    searchPlaceByDirectInputYandex(val, displayWeather);
                else
                    searchPlaceByDirectInput(val, displayWeather);
            });
        }
    } else
        setDefaultLocationWeather();
}

/**
 * Client place current click
 *
 * @param e Event
 */
function onClientPlaceCurrentClick(e) { 
    e.preventDefault();
    getCurrentLocation(true);
}

/**
 * Set location weather click handler
 */
var setLocationWeatherCLickHandler_INIT = false;
function setLocationWeatherCLickHandler() {     
    if(setLocationWeatherCLickHandler_INIT) return;
    else setLocationWeatherCLickHandler_INIT = true;
    
    $("#weather-active").on("dblclick", editClientPlace);
    
    $("#weather-active").on("click", displayWeatherForecast);
    
    $("#weather-city")
        //.on("dblclick", editClientPlace)
        .on("keydown", onClientPlaceKeydown)
        .on("keyup", onClientPlaceKeypress)
        .on("focusout", onClientPlaceFocusOut);
    $("#weather-input-city-form").on("submit", onClientPlaceFormSubmit);
    $("#weather-location-current").on("click", onClientPlaceCurrentClick);
}

/**
 * Init location weather
 */
function initLocationWeather() { 
    var $intro = $("#weather-intro");
    var $active = $("#weather-active");
    
    getLastLocationWeather(function(locationWeather) {
        if(locationWeather) {
            $intro.css({"display" : "none"});
            getLocationWeather();
            setInterval(function() {
                getLocationWeather();
            }, locationWeatherRefreshTime);
        } else {
            $active.css({"display" : "none"});
            $intro.css({"display" : "inline-block"});
        }//else
        
    });
    
    setIntroClickHandler();
    setLocationWeatherCLickHandler();
}

$(function() {
    $("#header-weather").hide();
    
    getDisplayWeatherPanel(function(display) {
        if(display) {
            var trys = 0;
            
            var intervalID = setInterval(function() {
                if(
                    ++trys > 15 ||
                    (AUTH && AUTH.state.loaded) ||
                    (trys > 5 && typeof AUTHOFF != "undefined" && AUTHOFF == true)
                ){
                    clearInterval(intervalID);
                    
                    initLocationWeather();

                    $("#header-weather")
                        .css({
                            "opacity" : 0.01,
                            "display" : "block"
                        })
                        .animate({
                            "opacity" : getWeatherOpacity()
                        }, 500)
                    ;

                    hourlyWeatherSwitch();

                    //displayWeatherForecast();

                    $(".weather-buttons .wb-settings").on("click", function(e) {
                        e.preventDefault();
                        var url = extensionGetUrl("/pages/options/settings.html#navi-settings-weather");

                        var event = window.event || e;//Firefox

                        if(event.ctrlKey || e.which == 2)
                            openUrlInNewTab(url);
                        else
                            openUrlInCurrentTab(url);
                    });

                    $(".weather-buttons .wb-close").on("click", function(e) {
                        e.preventDefault();
                        displayWeatherForecast("hide");
                    });

                }//if
            }, 350);
        }//if
    });
});

function displayWeatherForecast(force){    
    setTimeout(function(){//Wait for dbl click
        if(weatherInEdit && force != 'hide'){
            return false;
        }else if(weatherForecastStopper && force != 'hide'){
            setTimeout(function(){
                weatherForecastStopper = false;    
            }, 550);
        }else{
            //$.jGrowl(translate("weather_forecast_cooming_soon"), { "life" : 3000, position: "top-right"});/*weather on*/
            //return false;/*weather on*/
            
            if(!AUTH || !AUTH.isPremium("discovered", false, "weather") || !isAccuWeather()) return false; 

            if(!weatherForecastPrinted && force != 'hide'){
                printWeatherForecast(true);
                return;
            }//if
            
            var $wrap = $(".header-weather");
            var $forecast = $(".weather-forecast");
            var coord = JSON.parse(localStorage.getItem("weather-block-display-coordinates") || "{}");
            
            $wrap.fadeOut("fast", function(){
                if(!$wrap.hasClass("header-weather-active") && force != 'hide'){//Show
                    if(
                        !coord || 
                        (!coord.left && coord.left !== 0) || 
                        ($(document).width() - coord.left < 341)
                    ){
                        $("#sidebar-wrap").addClass("force-hide");
                    }
                    
                    $forecast.fadeIn("fast", function(){
                        $wrap.addClass("header-weather-active").show();
                        weatherAlign();
                        
                        $(".weather-list .wf-arrow").each(function(){
                            $(this).css("transform", "rotate(-115deg)");
                            AnimateRotate($(this), false, 210);
                        });                        
                        
                    });//show("slow");

                }else{//Hide
                    
                    $forecast.fadeOut("fast", function(){
                        $("#sidebar-wrap").removeClass("force-hide");
                        
                        $wrap.removeClass("header-weather-active").show();
                    });//hide("slow");
                }
            });
        }//else
        
        sendToGoogleAnaliticMP(function() {
            gamp('send', 'event', 'weather', 'forecast', 'show');
        });
    }, 300);
}

//$(".weather-buttons .wb-settings")

//displayWeatherForecast();

function handleWeatherForecastHide(){
    $("html").on("click", function(event){
        if ($(event.target).closest(".header-weather").length) return false;
        
        if($(".header-weather").hasClass("header-weather-active")){//Hide
            displayWeatherForecast("hide");
            
            //if(!stateForecastInScroll) displayWeatherForecast("hide");
            //else stateForecastInScroll = false;
        }//if
    });
}//handleWeatherForecastHide

function hourlyWeatherSwitch(){
    $wrap = $(".weather-hourly");
    $btns = $(".whs-btn");
    
    $btns.on("click", function(){
        hourlyWeatherChoise($(this));
    });
    
    //whr-temp
}

function hourlyWeatherChoise($button){
    if($button){
         var $button = $button;
    }else{
        var $button = $(".whs-btn.wactive");
        if(!$button.length) $(".whs-btn:eq(0)");
    }//else
    
    $wrap = $(".weather-hourly");
    $btns = $(".whs-btn");
    
    $btns.each(function(){
        $(this).removeClass("wactive");
        $wrap.find("li."+$(this).attr("mode")).css("display","none");
        $wrap.find("li."+$(this).attr("mode")+"-head").css("display","none");
    });

    $button.addClass("wactive");
    $wrap.find("li."+$button.attr("mode")).css("display","inline-block");
    $wrap.find("li."+$button.attr("mode")+"-head").css("display","block");
}

var printAutoRepeat = false;
function printWeatherForecast(Display, Repeat){
    //if(localStorage.getItem("test-features") !== "on") return false;
    if(!isAccuWeather()) return false;/*weather on*/
        
    getWeatherUnit(function(getUnit){
        //console.log(getUnit);
        getWeatherForecast(function(weather){
            if(!weather || !weather.Hourly || !weather.Daily || !weather.Daily.DailyForecasts){
                console.info("Can't display weather forecast", weather);
                             
                var rpt = parseInt(Repeat) || 0;
                
                if(rpt < 2){
                    printAutoRepeat = true;
                    
                    setTimeout(function(){
                        //console.info(rpt);
                        printWeatherForecast(Display, (rpt + 1));
                    }, 1500);
                }
                
                return;
            }//if
            
            printAutoRepeat = false;
            
            if(!getUnit){
                if(weather && weather.Hourly && weather.Hourly[0]) getUnit = weather.Hourly[0].Temperature.Unit;
            }
            
            if(Display && weather && weather.Hourly){
                displayWeatherForecast();
            }
            
            if(weather == null) return false;
            
            var forecast = weather.Daily.DailyForecasts;
            var hourly   = weather.Hourly;
            //hourly = hourly.slice(0, 12);       
            //console.log(forecast);

            var units    = forecast[0].Temperature.Minimum.Unit,
                $list    = $(".weather-list"),
                $weather = $(".weather-advanced"),
                $hourly  = $(".weather-hourly-list"),
                $heads   = $(".weather-hourly-list-heads")
            ;

            $heads.html("");
            $hourly.html("");
            $weather.html("");
            
            $list.find("li").remove(); //$list.find("li:gt(0)").remove(); //Task#619

            //console.info("FORECAST: ", forecast);
            
            var cmpToday = new Date;
            cmpToday = Date.parse(cmpToday.toDateString());

            var n=0, item=0;
            for (var key in forecast) {
                var val = forecast[key];
                var cur  = new Date;
                var now  = Date.now();
                var date = Date.parse(val.Date);
                
                var cmpDay = new Date(val.Date);
                cmpDay = Date.parse(cmpDay.toDateString());
                                
                //if ((date + 24*60*60*1000) > now && n++ < 7) {
                if (cmpToday <= cmpDay && n++ < 11) {
                    var date = new Date(date); 

                    if(
                        key > 0 ||
                        (cur.getHours() > 7 && cur.getHours() < 21)
                    ){
                        var Period = "Day";
                    }else{
                        var Period = "Night";
                    }//else

                    var text = val[Period].LongPhrase;

                    var calendar = date.toLocaleDateString();
                                    
                    /*
                    var weekday  = date.toLocaleDateString(true, {
                        weekday: 'long' //'short'
                    });
                    */
                    
                    if(!item++){
                        var weekday = translate("week_today");
                    }else{
                        var weekday = translate("week_"+date.getDay());
                    }
                    
                    /*
                    .toLocaleDateString(true, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    */

                    var $li = $list.append(
                        $("<li>")
                        .addClass("wf-item")
                        .append(
                            $("<span>")
                            .addClass("wf-date").text(weekday)
                            .append(
                                $("<small>")
                                .text(calendar)
                            )
                        )
                        .append(
                            $("<span>")
                                .addClass("wf-img")
                                .append(
                                    $("<img>")
                                        .addClass("wf-imgww")
                                        //.attr("title", text)
                                        .attr("src", "./img/weather/icons/" + ("0" + val[Period].Icon).substr(-2) + "-s.png")
                                )   
                        )
                        .append(
                            $("<span>")
                                .addClass("wf-barometer")
                                .attr("title", translate("weather_precipitation_probability")+": "+val[Period].PrecipitationProbability+"%")
                                .append(
                                    $("<img>")
                                        .addClass("wf-glass")
                                        .attr("src", "./img/weather/humidity/glass.png")
                                )                             
                                .append(
                                    $("<img>")
                                        .addClass("wf-dash")
                                        .attr("src", "./img/weather/humidity/dash.png")
                                )   
                                .append(
                                    $("<img>")
                                        .addClass("wf-dash").addClass("wf-arrow")
                                        .attr("src", "./img/weather/humidity/arrow.png")
                                        .attr("rotate", String(2.3 * (val[Period].PrecipitationProbability - 50)))
                                        .css("transform", "rotate(" + String(2.3 * (val[Period].PrecipitationProbability - 50)) + "deg)")
                                )
                                .append(
                                    $("<span>")
                                        .addClass("wf-probability")
                                        //.attr("title", text)
                                        .text(val[Period].PrecipitationProbability+"%")
                                )   
                        )
                        .append(
                            $("<span>")
                            .addClass("wf-low")
                            .text(Math.round(weatherUnitNormalize(val.Temperature.Minimum.Value, val.Temperature.Minimum.Unit, getUnit)) + "°")
                            .append(
                                $("<u>").addClass("w-unit").text(getUnit)//val.Temperature.Minimum.Unit)
                            )
                        )
                        .append(
                            $("<span>")
                            .addClass("wf-high")
                            .text(Math.round(weatherUnitNormalize(val.Temperature.Maximum.Value, val.Temperature.Minimum.Unit, getUnit)) + "°")
                            .append(
                                $("<u>").addClass("w-unit").text(getUnit)//val.Temperature.Maximum.Unit)
                            )
                        )
                        .append(
                            $("<span>")
                            .addClass("wf-text")
                            //.attr("title", val[Period].LongPhrase)
                            .text(val[Period].IconPhrase)
                        )
                        .append(
                            $("<span>")
                            .addClass("wf-desc")
                            .text(val[Period].LongPhrase + ". " + translate("weather_pp")+ ": " + val[Period].PrecipitationProbability + "%")
                        )
                    );

                } //if
            } //for


            var $pp=[], $temp=[], $wind=[], $times=[];
            var cur  = new Date;
            var now  = Date.now();
            var temp={};
            //var showTime = ['0','4','7','11'];
            var showTime = ['0','2','4','6','8','10','12','14','16','18','20','22','24'];

            var colHeight = 65;

            for (var key in hourly) {
                var val = hourly[key];
                temp.max = Math.max(val.Temperature.Value, temp.max || -273);
                temp.min = Math.min(val.Temperature.Value, temp.min ||  273);
            }

            temp.diff = temp.max - temp.min;

            if(temp.diff < 5){
                temp.max += 5 - temp.diff/2;
                temp.min -= 5 - temp.diff/2;

                temp.diff = temp.max - temp.min;
            }

            $pp.push(
                $("<li>")
                    .addClass("whr-head").addClass("whr-pp-head").css("display","block")
                    .text(translate("weather_pp")/*+", %"*/)
            );

            $temp.push(
                $("<li>")
                    .addClass("whr-head").addClass("whr-temp-head")
                    .text(translate("weather_temperature")+", " + getUnit.toUpperCase())
            );

            var WindUnit = windUnitNormalize(0, hourly[0].Wind.Speed.Unit, getUnit);
            $wind.push(
                $("<li>")
                    .addClass("whr-head").addClass("whr-wind-head")
                    .text(translate("weather_wind")+", " + WindUnit.unit)
            );

            var ppLast = false; ppRpt=0;

            for (var key in hourly) {
                var val = hourly[key];
                var date = new Date(Date.parse(val.DateTime));
                var time = shortTime(date.toLocaleTimeString());
                //console.log(key, val);

                var ppVal = val.PrecipitationProbability + "%";
                if(ppVal == ppLast && ppRpt < 2){
                    ppVal = "";
                    ppRpt++;
                }else{
                    ppLast = ppVal;
                    ppRpt = 0;
                }//else

                $pp.push(
                    $("<li>")
                        .addClass("whr-info").addClass("whr-pp").css("display","inline-block")
                        .attr("title", time+", "+val.PrecipitationProbability+"%")
                        .append(
                            $("<span>")
                                .addClass("whr-inli")
                                .append(
                                    $("<span>")
                                        .addClass("whr-txt")
                                        .text(ppVal)
                                )
                                .append(
                                    $("<span>")
                                        .addClass("whr-col")
                                        .css({"height": (colHeight * val.PrecipitationProbability/100)+"px"})
                                )
                        )
                );

                var tHeight = (colHeight * (val.Temperature.Value - temp.min) / temp.diff);

                // ############ TEMPERATURE ############ //
                var TemperatureValue = weatherUnitNormalize(val.Temperature.Value, val.Temperature.Unit, getUnit);
                var WindValue = windUnitNormalize(val.Wind.Speed.Value, val.Wind.Speed.Unit, getUnit);
                
                $temp.push(
                    $("<li>")
                        .addClass("whr-info").addClass("whr-temp")
                        .attr("title", time+", "+TemperatureValue+"°"+getUnit.toUpperCase())
                        .append(
                            $("<span>")
                            .addClass("whr-inli")
                            .append(
                                $("<span>")
                                    .addClass("whr-text")
                                    .text(TemperatureValue + "°")
                                    /*
                                    .append(
                                        $("<u>").text(val.Temperature.Unit)
                                    )*/
                            )
                            .append(
                                $("<span>")
                                    .addClass("whr-col")
                                    .css({
                                        height: tHeight + "px"
                                    })
                                   //s.text(tHeight)
                            )
                        )
                );

                // ############ WIND ############ //
                $wind.push(
                    $("<li>")
                        .addClass("whr-info").addClass("whr-wind")
                        .attr("title", time+", "+val.Wind.Direction.Localized+" "+WindValue.val+" "+WindValue.unit)
                        .append(
                            $("<span>")
                            .addClass("whr-wind-inli")
                            .append(
                                $("<span>")
                                    .addClass("whr-text")
                                    .text(WindValue.val/* + " " + val.Wind.Direction.Localized*/)
                            )

                            .append(
                                $("<span>")
                                    .addClass("whr-wind-icon")//Degrees
                                    .css("transform", "rotate(" + val.Wind.Direction.Degrees + "deg)")
                            )

                            .append(
                                $("<span>")
                                    .addClass("whr-tmin")
                                    .text(/*val.Wind.Speed.Value + " " + */val.Wind.Direction.Localized)
                            )
                        )
                );

                // ############ TIME ############ //
                $times.push(
                    $("<li>")
                        .addClass("whr-time")
                        .append(
                            $("<span>")
                                .text(showTime.indexOf(key) > -1 ? time : "")//val.DateTime
                        )
                );

            }//for
            
            
            $heads
                .append($pp.shift())
                .append($temp.shift())
                .append($wind.shift())
            ;
            
            $hourly
                .append($pp)
                .append($temp)
                .append($wind)
                .append($times)
            ;
            
            

            var WindNow = windUnitNormalize(hourly[0].Wind.Speed.Value, hourly[0].Wind.Speed.Unit, getUnit);

            $weather
                /*
                .append(
                    $("<li>")
                        .append(
                            $("<span>").addClass("wfh-name").attr("lang", "weather_sun")
                        )
                        .append(
                            $("<span>").addClass("wfh-sun")
                                .append(
                                    $("<icon>")
                                        .addClass("wfh-icon-mini")
                                        .attr("lang", "weather_sunrise")
                                        .attr("data-icon", "A")
                                )
                                .append(
                                    $("<span>").addClass("wfh-sun-txt").text(shortTime(forecast[0].Sun.Rise, ['parse','minutes']))
                                )
                        )
                        .append(
                            $("<span>").addClass("wfh-sun")
                                .append(
                                    $("<icon>")
                                        .addClass("wfh-icon-mini")
                                        .attr("lang", "weather_sunset")
                                        .attr("data-icon", "C")
                                )
                                .append(
                                    $("<span>").addClass("wfh-sun-txt").text(shortTime(forecast[0].Sun.Set, ['parse','minutes']))
                                )
                        )

                )
                */
                .append(
                    $("<li>")
                        .append(
                            $("<span>").addClass("wfh-name").attr("lang", "weather_pp_mini")
                        )
                        .append(
                            $("<span>").addClass("wfh-info").addClass("wfh-big").text(hourly[0].PrecipitationProbability+"%")
                        )
                        .append(
                            $("<span>").addClass("wfh-unit").text()
                        )
                )
                .append(
                    $("<li>")
                        .append(
                            $("<span>").addClass("wfh-name").attr("lang", "weather_wind")
                        )
                        .append(
                            $("<span>").addClass("wfh-info").text(WindNow.val)//hourly[0].Wind.Direction.Localized
                        )
                        .append(
                            $("<span>").addClass("wfh-unit").text(WindNow.unit)//attr("lang", "weather_"+translatePrepare(hourly[0].Wind.Speed.Unit))
                        )
                )
                .append(
                    $("<li>")
                        .append(
                            $("<span>").addClass("wfh-name").attr("lang", "weather_humidity")
                        )
                        .append(
                            $("<span>").addClass("wfh-info").addClass("wfh-big").text(hourly[0].RelativeHumidity+"%")
                        )
                        .append(
                            $("<span>").addClass("wfh-unit").text()
                        )
                )
                /*
                .append(
                    $("<li>")
                        .append(
                            $("<span>").addClass("wfh-name").text("Pressure")
                        )
                        .append(
                            $("<span>").addClass("wfh-info").text(weather.atmosphere.pressure)
                        )
                        .append(
                            $("<span>").addClass("wfh-unit").text(units.pressure)
                        )
                )
                */
            ;

            $(".weather-list  li").on({
                "mouseenter": function(){
                    var $desc = $(this).find(".wf-desc");
                    
                    $desc.attr("mouseWait", "on");
                    
                    setTimeout(function(){
                        if($desc.attr("mouseWait") == "on"){
                            $desc
                                .attr("mouseWait", "off")
                                .stop()
                                .css({
                                    "max-height": 0,
                                    "padding": "0px 8px"
                                })/*
                                .animate({
                                }, 35)*/
                                .animate({
                                    "padding": "3px 8px",
                                    "max-height": 70
                                }, 270)
                            ;
                        }//if
                        
                    }, 550)
                    

                    //AnimateRotate($(this).find(".wf-arrow"), 180);
                },
                "mouseleave": function(){
                    var $desc = $(this).find(".wf-desc");
                    $desc.attr("mouseWait", "off");
                    
                    $desc
                        .stop()
                        .animate({
                            "max-height": 0,
                            "padding": "0px 8px"
                        }, 210)
                    ;
                }
            });

            /*Texts */
            autoTranslate($weather);
            //autoTranslate($list, "weather");
            
            weatherAlign();
            
            hourlyWeatherChoise();
            
            getDisplayWeatherUnit(function(display) {
                if(!display) $(".w-unit").css("display","none");
            });
            
            weatherForecastPrinted = true;
            setTimeout(function(){
                addWeatherScroll();
            }, 1550);
        });
    });
    
}

function AnimateRotate($elem, angle, delay) {
    var $txt = $elem.siblings(".wf-probability");
    
    
    if(angle === false){
        var angle = $elem.attr("rotate");
    }
    
    $({deg: -115}).delay(delay || 0).animate({deg: angle/* + 2000*/}, {
        duration: 500,
        step: function(now) {
            var pos = now;
            
            $elem.css({
                transform: 'rotate(' + pos + 'deg)'
            });
            
            $txt.text(Math.round((115+pos) / 2.3)+"%");
        }
    });
}

function weatherAlign(){
    $(".weather-list .wf-text").each(function(){
        if($(this).height() > 20){
            $(this).addClass("wf-2-lines");
        }
    });
}

function shortTime(time, param){
    if(!param) param=[];
    
    if(param.indexOf("parse") > -1){
        var date = new Date(Date.parse(time));
        time = date.toLocaleTimeString();
    }//if
    
    var str = String(time).toLowerCase();
    var arr = str.split(" ");
    arr[0]  = arr[0].split(":");
    
    if(arr[1]){
        str = arr[0][0] + (param.indexOf("minutes") > -1 ? ":"+arr[0][1] : "") + " " + arr[1];
    }else{
        str = arr[0][0] + ":" + arr[0][1];
    }//else
    
    return str;
}//function

function timeToLocal(time){
    var time = String(time);
    var loc = localStorage.getItem('definedLocation') || "EN";

    if(!loc || ['us','en','ca'].indexOf(String(loc).toLowerCase().split('-').shift()) > -1){//AM/PM
        //return time;
    }else{//24
        time = time.toLowerCase();
        
        if(time.indexOf("am") > -1){
            time = time.replace('am', '').trim();
        }else if(time.indexOf("pm") > -1){
            time = time.replace('pm', '').trim();
            
            time = time
                .replace("1:","13~")
                .replace("2:","14~")
                .replace("3:","15~")
                .replace("4:","16~")
                .replace("5:","17~")
                .replace("6:","18~")
                .replace("7:","19~")
                .replace("8:","20~")
                .replace("9:","21~")
                .replace("10:","22~")
                .replace("11:","23~")
                .replace("12:","24~")
                .replace("~",":")
            ;
        }
        
        time = time.split(":");
        time[1] = String("0"+time[1]).substr(-2);
        time = time.join(":");
    }//else
    
    return time;
}

function weatherUnitNormalize(val, cur, need){
    var ans = val;
    var cur  = String(cur).toLowerCase();
    var need = String(need).toLowerCase();
    
    
    if(cur == "c" && need == "f"){
        ans = calculateWeatherTemperatureCtoF(parseInt(ans));
        if(ans) ans = ans.temp;
    }else if(cur == "f" && need == "c"){
        ans = calculateWeatherTemperatureFtoC(parseInt(ans));
        if(ans) ans = ans.temp;
    }//else if
    
    return ans;
}//function

function windUnitNormalize(val, speed, degree){
    var ans = {val:val, unit:speed};
    var degree = String(degree).toLowerCase();
    var speed  = String(speed).toLowerCase().replace('.','').replace('/','');
    
    if(degree == "c" && speed == "mih"){
        ans.val  = Math.round(parseFloat(val) * 1.61 * 10)/10;
        ans.unit = "km/h";
    }if(degree == "f" && speed == "kmh"){
        ans.val  = Math.round(parseFloat(val) * 0.62 * 10)/10;
        ans.unit = "mi/h";
    }//else if
    
    return ans;
}//function


var addWeatherScrollApplied = false;
function addWeatherScroll(){
    if(false && addWeatherScrollApplied) return;
    else addWeatherScrollApplied = true;
    
    $(".weather-hourly-wrap").mCustomScrollbar({
        theme:"minimal",
        axis: "x",
        autoHideScrollbar: false,
        //setLeft: 0,
        
        scrollInertia: 250,
        scrollEasing: "easeOut",

        mouseWheel:{
            enable: true,
            axis: "y",
            normalizeDelta: true,
            scrollAmount: 70,
            deltaFactor: 10,
            normalizeDelta: true
        },

        advanced:{
            updateOnContentResize: true,
            autoExpandHorizontalScroll: true,
            //autoScrollOnFocus: "li:eq(0)"
        },
        
        callbacks:{
            onScrollStart: function(){
                stateForecastInScroll = true;
            }
        }
    });
    
    $(".weather-list-wrap").mCustomScrollbar({
        theme:"minimal",
        axis: "y",
        autoHideScrollbar: false,
        
        scrollInertia: 250,
        scrollEasing: "easeOut",

        mouseWheel:{
            enable: true,
            axis: "y",
            normalizeDelta: true,
            scrollAmount: 70,
            deltaFactor: 10,
            normalizeDelta: true
        },

        advanced:{
            updateOnContentResize: true
        },
        
        callbacks:{
            onScrollStart: function(){
                stateForecastInScroll = true;
            }
        }
    });
    
    
}

















