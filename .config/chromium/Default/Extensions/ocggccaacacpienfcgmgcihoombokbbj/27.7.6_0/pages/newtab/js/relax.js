var relaxModeIsActive = false;
var relaxModeBodyClickTimer;
var relaxStartTime;
var windowsResizeListenerOff = false;

localStorage.setItem("fullscreen-meditation", 0);

$(function() {
    $(document).on("click", "#options-relax-popup-close", function(e) {
        e.preventDefault();
        $("#relax-modal-content").modal('hide');
        BRW_sendMessage({command: "setRelaxModalDisable"});
    });

    var $modal = $('#relax-modal-content');
    $modal.on('hide.bs.modal', function() {
        $modal.css("display","none");
        
        startRelaxMode();
        
        var $stopRelaxBtn = $("#relax-done-btn, #relax-done-btn-audio");
            $stopRelaxBtn.stop().css({"opacity" : 0, "display" : "inline-block"}).animate({"opacity" : 0.75}, {"duration" : 400, "queue" : false});
            enableRelaxBtnHoverEffect($stopRelaxBtn);
        if(relaxBtnTimeOut)
            clearTimeout(relaxBtnTimeOut);
        relaxBtnTimeOut = setTimeout(function() {
            /*
            if(!$stopRelaxBtn.is(":hover"))
                $stopRelaxBtn.animate({"opacity" : 0}, {"duration" : 1000, "queue" : false});
            */
        }, 2000);
    });
    
    fullScreenKeyHandler();
    meditationFaqLinkHandler();
});

function meditationFaqLinkHandler(){
    $(".options-relax-popup-body-bottom-text-link").on("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        
        BRW_getAcceptLanguages(function(languages){
            var hasRulanguage = languages.indexOf("ru") != -1;
            
            if(hasRulanguage){
                var url = "http://livestartpage.com/ru/meditation";
            }else{
                var url = "http://livestartpage.com/meditation";
            }
            
            openUrlInNewTab(url);
        });
        
    });
    
}

var Bounce122 = false;
function fullScreenKeyHandler() {
    if(getDisplayRelax() != true) return false;
    
    if (browserName() == 'firefox') {
        $(window).keypress(function (event) {
            var code = event.keyCode;// || event.which;
            
            if (code == 122)
                if (!Bounce122) {
                    Bounce122 = true;

                    var isFullScreen = localStorage.getItem("fullscreen-meditation");

                    if (
                        (isFullScreen != 1) &&
                        (window.screen.height - 10 > window.innerHeight)
                    ) {
                        localStorage.setItem("fullscreen-meditation", 1);
                        
                        setTimeout(function () {
                            Bounce122 = false;
                            relaxSwitcher("start");
                        }, 150);
                    } else {
                        localStorage.setItem("fullscreen-meditation", 0);
                        
                        setTimeout(function () {
                            Bounce122 = false;
                            relaxSwitcher("stop");
                        }, 150);
                    }
                }

        });
    } else { //Chrome | Opera
        onWindowResizeFunctions["relax"] = function(event){            
            if(windowsResizeListenerOff) return;
            
            var prm = true;
            
            if (browserName() == 'opera') {
                var maxHeight = window.screen.height,
                    maxWidth = window.screen.width,
                    curHeight = window.innerHeight,
                    curWidth = window.innerWidth;
                
                if(
                    (maxWidth == curWidth)
                    &&
                    ((maxHeight - curHeight) < 41)
                ){
                    prm = false;
                }else{
                    prm = true;
                }
            }
            
            
            if (checkIsNotFullScreen() == false) { //fullscreen
                relaxSwitcher("start");
            } else {
                if (prm && localStorage.getItem("fullscreen-meditation") == 1) {
                    relaxSwitcher("stop");
                }
            }
        }
        
        /*
        window.onresize = function (event) {
            if(windowsResizeListenerOff) return;
            
            var maxHeight = window.screen.height,
                maxWidth = window.screen.width,
                curHeight = window.innerHeight,
                curWidth = window.innerWidth;

            if (checkIsNotFullScreen() == false){// maxWidth == curWidth && maxHeight == curHeight) { //fullscreen
                relaxSwitcher("start");
            } else {
                if (localStorage.getItem("fullscreen-meditation") == 1) {
                    relaxSwitcher("stop");
                }
            }
        }//window onresize
        */
    }//else
}

/**
 * Start relax mode
 */


function startRelaxMode() {
    suspendResizeListener();
    
    toggleFullScreen(document.body, true);
    
    $(document).on("keyup", relaxModeCloseHandler);
    
    if(relaxModeBodyClickTimer)
        clearTimeout(relaxModeBodyClickTimer);
    
    relaxModeBodyClickTimer = setTimeout(function() {
        $(document).on("click", relaxModeShowCurrentButton);
    }, 400);
    
    relaxModeIsActive = true;
    relaxStartTime = new Date().getTime();
}

/**
 * Stop relax mode
 */
function stopRelaxMode(){
    suspendResizeListener();
    
    toggleFullScreen(document.body, false);
    
    $(document).off("keyup", relaxModeCloseHandler);
    if(relaxModeBodyClickTimer)
        clearTimeout(relaxModeBodyClickTimer);
    $(document).off("click", relaxModeShowCurrentButton);
    relaxModeIsActive = false;
    
    if(relaxStartTime) {
        var relaxTimeDiff = Math.ceil((new Date().getTime() - relaxStartTime)/* / 1000*/);
        
        sendToGoogleAnaliticMP(function() {
            gamp('send', 'event', 'relax', 'interval', 'seconds', relaxTimeDiff);
        });
    }
    
    $("#cursor-hide-curtain").css("display","none");
}

var suspendResizeListenerTimeout = false;
function suspendResizeListener(){
    if(suspendResizeListenerTimeout) clearTimeout(suspendResizeListenerTimeout);
    
    windowsResizeListenerOff = true;
    
    //console.info("LISTENER OFF");
    
    suspendResizeListenerTimeout = setTimeout(function(){
        //console.info("LISTENER ON");
        suspendResizeListenerTimeout = false;
        windowsResizeListenerOff = false;
    }, 250);
}

document.addEventListener("mozfullscreenchange", function() {//firefox
    if(document.mozFullScreen != undefined && document.mozFullScreen === false){   
        if(relaxModeIsActive){
            var $stopRelaxBtn = $("#relax-done-btn:eq(0)");
            if($stopRelaxBtn)
                $stopRelaxBtn.trigger("click");
        }
    }
});

/**
 * Relax mode close handler
 *
 * @param e Event
 */
function relaxModeCloseHandler(e) {
    if (e.keyCode == 27 && relaxModeIsActive) {
        var $stopRelaxBtn = $("#relax-done-btn:eq(0)");
        if($stopRelaxBtn)
            $stopRelaxBtn.trigger("click");
    }
}

/**
 * Toggle page FullScreen mode
 *
 * @param elem Node element
 * @param state Bool
 */
function toggleFullScreen(elem, state) {
    if (state) {
        if(checkIsNotFullScreen()) {
            if (elem.requestFullScreen)
                elem.requestFullScreen();
            else if (elem.mozRequestFullScreen)
                elem.mozRequestFullScreen();
            else if (elem.webkitRequestFullScreen)
                elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        BRW_sendMessage({command: "setFullScreen", data:{"mode":"exit"}});
        
        
        /*
        if(!checkIsNotFullScreen()) {
            if (document.cancelFullScreen)
                document.cancelFullScreen();
            else if (document.mozCancelFullScreen)
                document.mozCancelFullScreen();
            else if (document.webkitCancelFullScreen)
                document.webkitCancelFullScreen();
        }
        */
    }
}

/**
 * Check now is not FullScreen mode
 *
 * @returns {boolean}
 */
function checkIsNotFullScreen() {
    //console.log(window.innerWidth, screen.width, window.innerHeight, screen.height);
    return (document.fullScreenElement !== undefined && document.fullScreenElement === null) 
        || (document.mozFullScreen !== undefined && !document.mozFullScreen)
        || (window.innerWidth != screen.width || window.innerHeight != screen.height)
        //|| (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)
    
    ;
}