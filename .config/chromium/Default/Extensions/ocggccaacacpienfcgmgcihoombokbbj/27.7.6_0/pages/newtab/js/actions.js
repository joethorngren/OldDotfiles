var restoreInitialized = false, buttonsJustRedraw = false, TOUR = false;

$(function () {
    /*
    chrome.sessions.getRecentlyClosed(function(sessions){
       console.log(sessions); 
    });
    */
    BRW_sendMessage({command: "getBbaPremission"}, function(prm){
        if(/*true || */prm == 1){
            localStorage.setItem("just-opened", 0);

            BRW_sendMessage({
                command: "getPreviousSession", 
                restore:false
            });

        }//if
        
        //showBbaBlock();//REMOVE!!!!!!
    });
    
    BRW_langLoaded(function(){BRW_getFileSystem(function(){
        setTimeout(function(){
            TOUR = new TakeTour(); 
            //TOUR.init();
        }, 500);
    });});
});

function previousSessionButton(nTabs, sessionId){
    if(nTabs && nTabs > 0){
        var $wrap = $(".buttons-browser-action");
        var $button = $(".bba-restore");
        
        $button.css("display", "block");
        $button.attr("title", translate("bba_restore")+": "+nTabs);
        
        if(!restoreInitialized){
            restoreInitialized = true;
            
            $button.on("click", function(){
                $(".bba-wrap").fadeOut();
                
                BRW_sendMessage({
                    command  : "getPreviousSession", 
                    restore  : true,
                    sessionId: sessionId
                });
                
                setTimeout(function(){
                    //$("#relax").css("display", "block");
                    localStorage.setItem("just-opened", 0);
                    
                }, 150);
            });
        }//if
        
        //$("#relax").css("display", "none");
        showBbaBlock();
    }//if
}//previousSessionButton

function showBbaBlock(){
    //$(".bba-restore").css("display", "block");//REMOVE 
    
    if(BROWSER){
        if(BROWSER == 'chrome'){
            $(".bba-downloads").attr("href","chrome://downloads/").css("display","block");
            $(".bba-bookmarks").attr("href","chrome://bookmarks/").css("display","block");
            $(".bba-settings").attr("href","chrome://settings/").css("display","block");
            //$(".bba-addons" ).attr("href","chrome://extensions/").css("display","block");
            $(".bba-hystory").attr("href","chrome://history/").css("display","block");
        }else if(BROWSER == 'firefox'){
            $(".bba-downloads").css("display","block");
            $(".bba-bookmarks").css("display","block");
            $(".bba-settings").attr("href","about:preferences").css("display","block");
            //$(".bba-addons" ).attr("href","about:addons").css("display","inline-block");
            $(".bba-hystory").css("display","block");
            
            $(".bba-downloads").on("click", function(e){
                e.stopPropagation();
                CNT.serviceOpen("Downloads");
            });
            $(".bba-bookmarks").on("click", function(e){
                e.stopPropagation();
                CNT.serviceOpen("AllBookmarks");
            });
            $(".bba-hystory").on("click", function(e){
                e.stopPropagation();
                CNT.serviceOpen("History");
            });
            
        }//else if
        
        $(".bba-button").on("click", function(){
           if($(this).attr("href")){
               openUrlInNewTab($(this).attr("href"));
           }//if
        });
        
        redrawActionButtons("force");
    }  
    
    $(".sidebar-content-scroll").addClass("sidebar-content-scroll-shift");
}


function redrawActionButtons(reason){
    if((reason || false) != "force") buttonsJustRedraw = true;
    
    setTimeout(function(){
        
        $buttons = $(".bba-wrap");
        $buttons.fadeIn("slow");
    }, 350);//800
    
}

function TakeTour(data){
    var self = this;

    self.state = {
        show : false,
        align: false,
        object: {
            $wrap   : $(".fullscreen-tour"),
            $win    : $("#tour-start"),
            $corner : $("#tour-start:after"),
            $curt   : $(".fullscreen-tour .tcurtain"),
            $hole   : $(".fullscreen-tour .tcurtain .hole"),
            $success: $(".fullscreen-tour .btn-success"),
            $close  : $(".fullscreen-tour .q-close, .tour-close"),
            $next   : $(".fullscreen-tour .q-next"),
            $back   : $(".fullscreen-tour .q-back"),
        },
        tours: {
            Bottoms: {
                $body   : $("#Bottoms-tour"),
                $target : $("#footer"),
                //css     : {top:"auto",bottom:"61px",left:"23px",right:"auto"},
                corner  : "cbottom",
                enable  : true
            },
            Relax: {
                $body   : $("#Relax-tour"),
                $target : $("#relax-start-btn"),
                //css     : {top:"auto",bottom:"61px",left:"23px",right:"auto"},
                corner  : "cbottom",
                enable  : true,
                onShow  : ()=>{
                    $("#relax-start-btn").stop().css("opacity",1);
                }    
            },
            Groups: {
                $body   : $("#Groups-tour"),
                $target : $("#sidebar-toggle-panel"),
                //css     : {top:"100px",bottom:"auto",left:"auto",right:"295px"},
                corner  : "cright",
                enable  : Boolean(getDisplaySpeedDialPanel()),
                test    : getDisplaySpeedDialPanel,
            }
        },
    },
    
    this.init = function(){
        var $preload = $('#preload-modal-content');
        
        if(!$preload.length || $preload.css("display") != "block"){
            self.start();
        }else{
            $preload.on('hidden.bs.modal', function (e) {
                self.start();
            });
        }
    },
        
    this.start = function(){
        var Shown = self.shown(key);
        
        for(var key in self.state.tours){
            if(typeof self.state.tours[key].test == "function"){
                if(!self.state.tours[key].test.call()){
                    self.state.tours[key].$body.remove();
                    delete self.state.tours[key];
                    continue;
                }
            }
            
            self.state.tours[key].shown = Shown.length;
        }//for
        
        self.state.object.$close.on("click", function(){
            self.tourClose();
        });
                
        if(Shown && !Shown.length){
            var times=0, tourWait = setInterval(function(){
                if(
                    ++times > 30 ||
                    (
                        self.state.tours.Bottoms.$target.offset().top > 0 
                        &&
                        self.state.tours.Bottoms.$target.offset().left > 0 
                    )
                ){
                    clearInterval(tourWait);
                    self.state.show = true;
                    if(times < 31) self.tour("Bottoms");
                }//if
            }, 150);
        }//if
        
        if(!self.state.align){
            self.state.align = setInterval(()=>{
                self.highlight();
            }, 700);
        }
    },
    
    this.tour = function(tourName){
        //console.log(self.state.tours[tourName].$target.is("visible"));
        //self.state.tours[tourName];
        self.show();
        
        self.state.current = tourName;
        
        self.buttons(tourName);
        
        self.shown(tourName, true);
        
        var Tour = self.state.tours[tourName];
        
        if(typeof Tour.func == "function") Tour.func();
        
        for(var key in self.state.tours){
            if(key != tourName){
                self.state.tours[key].$body.css("display", "none");
                self.state.tours[key].$target.removeClass("tour-target");
            }//if
        }//for
        
        Tour.$body.fadeIn();
        Tour.$target.css("opacity", 1).addClass("tour-target");
        
        
        self.state.object.$win
            .removeClass("cbottom cright")
            .addClass(Tour.corner)
            .fadeIn("slow")
        ;

        self.highlight();
    },
        
    this.highlight = function(){
        if(!self.state.current) return;
        
        var Tour = self.state.tours[self.state.current];
        
        if(Tour.corner == "cbottom"){
            var pos = {
                top : 12 + parseInt(self.state.object.$win.outerHeight()),
                left: 2,
            }
        }else if(Tour.corner == "cright"){
            var pos = {
                top : 2,
                left: 12 + parseInt(self.state.object.$win.outerWidth()),
            }
        }
        
        self.state.object.$win.css({
            top  : Tour.$target.offset().top  - pos.top,
            left : Tour.$target.offset().left - pos.left,
        });//Tour.css
            
        self.state.object.$hole
            .css({
                top     : parseInt(Tour.$target.offset().top)-2,
                left    : parseInt(Tour.$target.offset().left)-2,
                width   : 4+parseInt(Tour.$target.outerWidth()),
                height  : 4+parseInt(Tour.$target.outerHeight()),
            })/*
            .delay(1000)
            .css({
                width   : 4+parseInt(Tour.$target.outerWidth()),
                height  : 4+parseInt(Tour.$target.outerHeight()),
            })*/
        ;
    },
        
    this.buttons = function(tourName){
        //self.stat.$next //self.stat.$back
        
        var all=0, cur=0;
        
        self.state.Prev = false;
        self.state.Next = false;
        
        for(var key in self.state.tours){
            if(!self.state.tours[key].enable) continue;
            
            all++;
            
            if(cur && !self.state.Next) self.state.Next = key;
            
            if(key == tourName){
                cur = all;
            }//if
            
            if(!cur) self.state.Prev = key;
        }//for
        
        if(!self.state.Prev){
            self.state.object.$back.css("display", "none");
        }else{
            self.state.object.$back
                .css("display", "initial")
                .unbind("click")
                .on("click", function(){
                    self.tour(self.state.Prev);
                })
            ;
        }//else
        
        if(!self.state.Next){
            self.state.object.$next
                .text(translate("tour_start_button"))
                .unbind("click")
                .on("click", function(){
                    self.tourClose();
                })
            ;
        }else{
            self.state.object.$next
                .text(translate("tour_start_next"))
                .unbind("click")
                .on("click", function(){
                    self.tour(self.state.Next);
                })
            ;
        }//else
    },
        
    this.show = function(){
        self.state.object.$wrap.fadeIn("slow");
        /*
        self.state.object.$wrap
            .css({
                "opacity": 0.1,
            })
            .animate({
                "opacity": 0.99,
            }, 500)
        ;
        */
        self.state.object.$curt.unbind("click").on("click", function(){
            var from = "#ffa812";
            var to   = "#5cb85c";
            
            self.state.object.$next
                .animate({"background-color": from}, 210)
                .delay(90)
                .animate({"background-color": to}, 210)
            
                .animate({"background-color": from}, 210)
                .delay(90)
                .animate({"background-color": to}, 210)
            
                .animate({"background-color": from}, 210)
                .delay(90)
                .animate({"background-color": to}, 210)
            ;
        });
    },
        
    this.tourClose = function(){
        self.state.show = false;
        self.state.object.$wrap.fadeOut("slow");
        
        for(var key in self.state.tours){
            self.state.tours[key].$body.fadeOut("slow");
            self.state.tours[key].$target.removeClass("tour-target");
        }//for
        
        if(self.state.align) clearInterval(self.state.align);
        
        self.shown(false, false, true);
        self.createBackup();
        
        //if(typeof WelcomeConfig == "object") WelcomeConfig.init();
    },
        
    this.shown = function(tour, action, write){
        var store = "tours-shown";//+tour;
        
        var shown = self.state.shown || JSON.parse(localStorage.getItem(store) || "[]");
        
        if(action){
            if(shown.indexOf(tour) == -1){
                shown.push(tour);
            }//if
        }//if
        
        if(write){
            localStorage.setItem(store, JSON.stringify(shown));
        }
        
        var instlled = getAppInstalledDate();
        
        if(
             instlled && 
            (Date.now() - instlled) > 900000
        ){
            shown = false;
        }//else
        
        
        self.state.shown = shown;
        
        return shown;
    },
    
    this.createBackup = function(){
        setTimeout(()=>{
            try{
                BACK.check(false, true);
            }catch(ex){
                console.warn(ex);
            }
        }, 500);        
    }
}

var mousePosition = {X:0, Y:0}, customTooltipTimeout = false;
function customTooltip($element, mode){
    var $el = $element;
    
    $(".cutom-tooltip").remove();
        
    if(mode == "hide") return;
    
    
    clearTimeout(customTooltipTimeout);
    customTooltipTimeout = setTimeout(()=>{
        if($el.is(":hover")){
            //console.debug("hover", $el.attr("custom-tooltip"));
            
            var $tag = $("<span>")
                .addClass("cutom-tooltip")
                .text($el.attr("custom-tooltip"))
            ;
            
            $("body").append($tag);
            
            $tag.css({
                top  : mousePosition.Y - $tag.height() - 15,
                left : mousePosition.X - $tag.width() / 2,
            });
        }
    }, 550);
}

function customTooltipMouse(event){
    mousePosition.X = event.clientX || event.screenX || 0;
    mousePosition.Y = event.clientY || event.screenY || 0;
}
    
    
    
    
    
    
    
    
    
    
    
    
    