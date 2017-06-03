var WelcomeDevMode = false;//DEV!!!

var WelcomeConfig = false;

$(function(){
    
    setTimeout(function(){
        WelcomeConfig = new WelcomeTourMod();
        WelcomeConfig.init();
    }, 350);
});

function WelcomeTourMod(){
    var ts = this;
    
    var ONCE = [], CACHE = {}, REPEAT = {};
    
    var VARS = {
        $wrap : $("#welcome-tour")
    };
        
    var UI = {
        $wrap  : VARS.$wrap,
        $slider: VARS.$wrap.find('#welcome-slider'),
        $slides: VARS.$wrap.find('#welcome-slider .wslide'),
        $preload : $('#preload-modal-content'),
        button : {
            $prev : VARS.$wrap.find('.welcome-left'),
            $next : VARS.$wrap.find('.welcome-right'),
            $done : VARS.$wrap.find('.welcome-done'),
            $close: VARS.$wrap.find('.welcome-close, #welcome-start'),
            $skip : VARS.$wrap.find('.welcome-skip'),
        },
        $checkbox : VARS.$wrap.find('.wcheck'),
        widget : {
            dials : "#mv-tiles-wrap-wide, #sidebar-wrap, #footer-visible-dials",
            todo  : "#todo-container, #todo-link",
            clock : "#mv-clock-wrap",
            focus : "#focus-newtab",
            weather : "#header-weather",
        },
        $video : VARS.$wrap.find('#wslide-video'),
    };
    
    this.state = {
        opened  : false,
        current : 0,
        checkbox : {
            dials : true,
            todo  : true,
            clock : true,
            weather: true,
            focus : true,            
        }
    };
         
    this.init =()=> {
        var N=0, shown = parseInt(localStorage.getItem("welcome-config-shown"));
        
        var welcomeInitInterval = setInterval(()=>{
            var instlled = parseInt(localStorage.getItem("installed-key")) || parseInt(localStorage.getItem("install-key"));
            
            if(!isNaN(instlled) || ++N > 20){
                clearInterval(welcomeInitInterval);
                
                if(
                    (
                        isNaN(shown)
                        && instlled
                        && (Date.now() - instlled) < 900000
                    )
                    || WelcomeDevMode
                ){
                    //ts.start();
                    ts.preload();
                }else{
                    //console.debug("Welcome disabled", shown === NaN, instlled, (Date.now() - instlled) < 600000);
                    return false;
                }
            }
            
        }, 500);
    };
    
    this.preload =()=> {
        if(!UI.$preload.length || UI.$preload.css("display") != "block"){
            ts.start();
        }else{
            UI.$preload.on('hidden.bs.modal', function (e) {
                ts.start();
            });
        }
    };
    
    this.start =()=> {        
        ts.listeners();
        ts.draw("show");
        ts.draw("video");
    };
    
    this.listeners =()=> {
        UI.button.$close.on("click", ()=>{
            ts.close();
        });
        
        UI.button.$prev.on("click", ()=>{
            ts.draw("prev");
        });
        
        UI.button.$next.on("click", ()=>{
            ts.draw("next");
        });
        
        UI.$checkbox.on("click", (event)=>{
            ts.checkbox($(event.currentTarget));
        });
        
        $(document).on("keydown", (event)=>{
            if(ts.state.opened){
                if([13,32].indexOf(event.keyCode) != -1){//right force
                    ts.draw("next", {finish:true});
                }else
                if([39,40].indexOf(event.keyCode) != -1){//right
                    ts.draw("next");
                }else
                if([37,38].indexOf(event.keyCode) != -1){//left
                    ts.draw("prev");
                }else
                if(event.keyCode == 27){//esc
                    ts.close();
                }
            }
        });
    };
    
    this.draw =(actions, mode)=>{
        if(typeof actions != "object") actions = [String(actions)];
        if(typeof mode != "object") mode = {mode: mode || false};
        
        for(var k in actions){
            //console.debug("draw", actions[k]);
            
            if(
                actions[k] != "check"
                &&
                REPEAT[actions[k]] 
                && 
                (Date.now() - REPEAT[actions[k]]) < 700
            ){
                continue;
            }else{
                REPEAT[actions[k]] = Date.now();
            }
            
            
            switch(actions[k]){
                case "show":
                    UI.$wrap.removeClass("hide").fadeIn("slow");
                    
                    ts.state.current = 0;
                    
                    UI.$slides.removeClass("active");
                    $(UI.$slides[0]).fadeIn("slow").addClass("active");
                    ts.draw("button");
                    
                    ts.state.opened = true;
                break;
                    
                case "hide":
                    UI.$wrap.fadeOut("slow", ()=>{
                        UI.$wrap.addClass("hide");
                        ts.draw("play");
                        UI.$video.html("");
                    });
                    
                    ts.state.opened = false;
                break;
                    
                case "next":
                    if(ts.state.current >= (UI.$slides.length - 1)){
                        if(mode.finish) ts.close();
                        else return;
                    }
                    
                    UI.$slides.removeClass("active");
                    
                    $(UI.$slides[ts.state.current]).fadeOut("fast", ()=>{
                        $(UI.$slides[++ts.state.current]).fadeIn("fast").addClass("active");
                        ts.draw("play");
                        ts.draw("button");
                    });
                    
                break;
                    
                case "prev":
                    if(ts.state.current <= 0) return;
                    
                    UI.$slides.removeClass("active");
                    
                    $(UI.$slides[ts.state.current]).fadeOut("fast", ()=>{
                        $(UI.$slides[--ts.state.current]).fadeIn("fast").addClass("active");
                        ts.draw("play");
                        ts.draw("button");
                    });
                break;
                    
                case "button":
                    if(ts.state.current > 0){
                        UI.button.$prev.addClass("active");
                    }else{
                        UI.button.$prev.removeClass("active");
                    }
                    
                    if(ts.state.current < (UI.$slides.length - 1)){
                        UI.button.$next.addClass("active");
                        UI.button.$skip.addClass("active");
                        UI.button.$done.removeClass("active").addClass("hide");
                    }else{
                        UI.button.$next.removeClass("active");
                        UI.button.$skip.removeClass("active");
                        UI.button.$done.removeClass("hide").addClass("active");
                    }
                break;
                    
                case "check":
                    UI.$checkbox.each((N, el)=>{
                        //console.debug(N, el, $(el).attr("wcheck"));
                        var check = String($(el).attr("wcheck"));
                        
                        if(ts.state.checkbox[check]){
                            $(el).addClass("active");
                        }else{
                            $(el).removeClass("active");
                        }
                        
                    });
                break;
                
                case "play":           
                    var $video = $(UI.$slides[ts.state.current]).find("video");
                    
                    if(ts.state.opened && $video.length){
                        $video[0].play(); 
                        backgroundVideoActions('pause');
                        //console.debug('play');
                    }else{
                        $video = UI.$video.find("video");
                        if($video.length) $video[0].pause();
                        backgroundVideoActions('play');
                        //console.debug('pause');
                    }
                break;
                                    
                case "video":
                    var video = "/default-content/welcome/welcome.webm";//.mp4";
                    
                    UI.$video
                        .html("")
                        .append(
                            $("<video>")
                                //.attr("poster", "")
                                .attr("loop", "loop")
                                .attr("muted", "muted")
                                //.attr("autoplay", "autoplay")
                                .attr("src", video)
                                .append(
                                    $("<source>")
                                        .attr("type", "video/mp4")
                                        .attr("src", video)
                                )
                        )
                    ;
                    
                break;
            }
        }
        
        return true;
    };
    
    this.checkbox =($el)=> {
        var check = String($el.attr("wcheck"));
        
        //console.debug($el, check);
        
        ts.state.checkbox[check] = !ts.state.checkbox[check];
        
        ts.draw("check");
        ts.setConfig(check, ts.state.checkbox[check]);
    };
    
    this.setConfig =(widget, status)=>{
        //console.debug(widget, status);
        
        if(status){
            $(UI.widget[widget]).removeClass("hide-force");
        }else{
            $(UI.widget[widget]).addClass("hide-force");
        }
        
        switch(widget){
            case "dials":
                setDisplaySpeedDialPanel(status);
            break;
                
            case "todo":
                setDisplayTodoPanel(status);
            break;
                
            case "clock":
                setDisplayClockPanel(status);
            break;
                
            case "weather":
                setDisplayWeatherPanel(status, ()=>{});
            break;
                
            case "focus":
                Focus.setShow(status, "passive");
            break;
        }
    };
    
    this.close =()=>{
        localStorage.setItem("welcome-config-shown", Date.now());
        ts.state.opened = false;
        ts.draw("hide");
        ts.createBackup();
        
        if(typeof TOUR == "object") TOUR.init();
    };
    
    this.createBackup = function(){
        setTimeout(()=>{
            try{
                BACK.check(false, true);
            }catch(ex){
                console.warn(ex);
            }
        }, 500);        
    };
    
    //this.init();
}
















