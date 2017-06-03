var RelaxAdv, RelaxPlayer, RelaxTune;
var DevModeRelax = false; // DEV !!!

$(function(){
    BRW_langLoaded(function(){
        RelaxAdv    = new RelaxAdvanced(); RelaxAdv.init(); 
        RelaxPlayer = new RelaxAudioPlayer($("#audio-player")); RelaxPlayer.init("player"); 
        RelaxTune   = new RelaxAudioPlayer($("#audio-tune")); RelaxTune.init("tune"); 
    });
});

function audioKeepButton(){
    if(RelaxPlayer.state.playback || RelaxTune.state.audio.tunes > 0){
        $("#relax-done-btn-audio").removeClass("hide");
    }else{
        $("#relax-done-btn-audio").addClass("hide");
    }
}

function RelaxAudioPlayer($skin){
    var ts = this;
    
    var ONCE = [], INTERVAL = [], LOADER = [];
    
    var vars = {
        $wrap : $skin,
        SRV   : "https://livestartpage.com",
        list  : "/api/getMeditationAudio",
        tune  : "/api/getMeditationAudio",
        maxFreeTunes: 4, // Task #567
        freeTunes : ['Music pure relaxation', 'Campfire', 'Birds in Forest', 'River'/*, 'Cat Purr'*/],
        Notes : ['music','[music]','музыка','[музыка]'],
    };
    
    var ui = {
        $wrap   : vars.$wrap,
        $audio  : vars.$wrap.find("audio"),
        $keep   : $("#relax-done-btn-audio"),
        $done   : $(".relax-done-btn"),
        $mover  : vars.$wrap.find(".move-handler"),
        control : {
            $wrap  : vars.$wrap.find(".audio-buttons"),
            $all   : vars.$wrap.find(".audio-buttons .audio-btn"),
            $prev  : vars.$wrap.find(".audio-buttons .audio-prev"),
            $next  : vars.$wrap.find(".audio-buttons .audio-next"),
            $play  : vars.$wrap.find(".audio-buttons .audio-play"),
            $pause : vars.$wrap.find(".audio-buttons .audio-pause"),
            $loop  : vars.$wrap.find(".audio-track-loop"),
            $trigger : vars.$wrap.find(".audio-buttons .audio-pause-trigger"),
            $playPauseButtons : vars.$wrap.find(".glyphicon-play, .glyphicon-pause"),
        },
        winbtn : {
            $wrap  : vars.$wrap.find(".audio-window"),
            $all   : vars.$wrap.find(".audio-window .audio-win"),
            $mini  : vars.$wrap.find(".audio-window .audio-min"),
            $list  : vars.$wrap.find(".audio-window .audio-list"),
            $close : vars.$wrap.find(".audio-window .audio-close"),
            $move  : vars.$wrap.find(".audio-window .audio-move"),
            $open  : $(".relax-control-player"),
        },
        volume : {
            $wrap  : vars.$wrap.find(".audio-volume"),
            $button: vars.$wrap.find(".audio-vol-btn"),
            $icon  : vars.$wrap.find(".audio-vol-btn .glyphicon"),
            $slider: vars.$wrap.find(".audio-volume-slider slider"),
            $outBtn: $(".relax-control-volume"),
            $outIco: $(".relax-control-volume, .volume-icon-image"),
        },
        track : {
            $wrap  : vars.$wrap.find(".audio-track"),
            $name  : vars.$wrap.find("#track-name"),
            $slider: vars.$wrap.find(".audio-track-slider slider"),
            $timer : vars.$wrap.find(".audio-track-value"),
        },
        playlist : {
            $wrap  : vars.$wrap.find("#audio-playlist-wrap, #tune-playlist-wrap"),
            $list  : vars.$wrap.find("#audio-playlist, #tune-playlist"),
        },
        langs : {
            $wrap  : vars.$wrap.find(".audio-languages"),
        },
        alltrack : {
            $on  : vars.$wrap.find(".tune-all-track-on"),
            $off : vars.$wrap.find(".tune-all-track-off"),
        },
        
    };
    
    this.skin = false;
    
    this.state = {
        play: false,
        time: 0,
        volume: 30,
        meditation: false,
        playback : false,
        PRO : undefined, RU : false,
        created : false,
        relaxExit : false,
        keyPaused : false,
        audio : {
            list : {},
            
            listExample : [],
            order : [],
            loop  : localStorage.getItem("relax-audio-loop") || "off",
            volume: 0.7,
            langsAll : [],
            langsUse : JSON.parse(localStorage.getItem("relax-audio-langs") || '["en","ru"]'),
            tunes : 0,
            paused: false,
            loading: false,
            gap: 0.126,
        },
        current: {
            trackId : false
        },
        mode : {
            
        },
        trackTimer  : false,
        mouseInMove : false,
    };
    
    this.init =(skin)=> {
        ts.skin = skin || "player";
        
        ts.state.audio.volume = parseFloat(localStorage.getItem("relax-volume-"+ts.skin)) || ts.state.audio.volume;
        ts.state.widgetView = localStorage.getItem("relax-audio-widget-view-"+ts.skin) || "full",
        ts.state.widgetShow = localStorage.getItem("relax-audio-widget-show-"+ts.skin) || "open",
        
        //console.debug("Relax Audio Player", "init", skin);
        
        ts.listeners();
        
        if(DevModeRelax){
            setTimeout(()=>{
                ts.once("create"); ui.$wrap.css({opacity:1}).removeClass("only-relax");// DEV
            }, 1000);
        }
        
    };
    
    this.listeners =()=> {
        ui.$keep.on("click", ()=>{
            ts.state.keep = true;
        });
        
        
        if(ts.skin == "tune"){
            ui.playlist.$list.on("mousedown", "li", (event)=>{
                if($(event.currentTarget).hasClass("audio-disallow")){
                    AUTH.isPremium("discovered", false, "relax");
                }else{
                    var $button = $(event.currentTarget).find(".audio-track-queue");

                    ts.setTrackTune(
                        $(event.currentTarget).attr("trackId"),
                        !$button.hasClass("track-queue-on"),
                        $(event.currentTarget),
                        $button
                    );
                }
            });
        }
        
        if(ts.skin == "player"){
            ui.playlist.$list.on("click", "li", (event)=>{
                if($(event.currentTarget).hasClass("audio-disallow")){
                    AUTH.isPremium("discovered", false, "relax");
                }else{
                    ts.setTrack($(event.currentTarget).attr("trackId"));
                }
            });
        }
        /*
        ui.playlist.$list.on("mouseenter", "li", (event)=>{
            //console.debug(event);
            customTooltip($(event.currentTarget), "show");
            customTooltipMouse(event);
            
            $(event.currentTarget).on("mousemove", (event2)=>{
                customTooltipMouse(event2);
            });
        });
        
        ui.playlist.$list.on("mouseleave", "li", (event)=>{
            customTooltip($(event.currentTarget), "hide");
            $(event.currentTarget).off("mousemove");
        });
        */
        if(ui.langs.$wrap.length)
        ui.langs.$wrap.on("click", ".btn-lang", (event)=>{
            ts.setLang($(event.currentTarget).attr("langName"));
        });

        if(ui.winbtn.$mini.length)
        ui.winbtn.$mini.unbind("click").on("click", ()=>{
            ts.widgetView("mini");
        });

        if(ui.winbtn.$list.length)
        ui.winbtn.$list.unbind("click").on("click", ()=>{
            ts.widgetView("full");
        });

        if(ui.winbtn.$close.length)
        ui.winbtn.$close.unbind("click").on("click", ()=>{
            ts.widgetShow("close");
        });

        if(ts.skin == "player")
        ui.winbtn.$open.unbind("click").on("click", ()=>{
            if(!ui.winbtn.$open.hasClass("active")) ts.widgetShow("open");
            else ts.widgetShow("close");
        });

        if(ui.control.$play.length)
        ui.control.$play.unbind("click").on("click", ()=>{
            ts.playerControl("play", "nostat");
        });

        if(ui.control.$pause.length)
        ui.control.$pause.unbind("click").on("click", ()=>{
            ts.playerControl("pause");
        });

        if(ui.control.$trigger.length)
        ui.control.$trigger.unbind("click").on("click", ()=>{
            if(!ui.control.$trigger.hasClass("disabled")){
                if(ui.control.$trigger.hasClass("active")) ts.playerControl("play");
                else ts.playerControl("pause");
            }
        });

        if(ui.control.$prev.length)
        ui.control.$prev.unbind("click").on("click", ()=>{
            ts.playerControl("prev");
        });
        
        if(ui.control.$next.length)
        ui.control.$next.unbind("click").on("click", ()=>{
            ts.playerControl("next");
        });
        
        if(ui.control.$loop.length)
        ui.control.$loop.unbind("click").on("click", ()=>{
            ts.switchLoop();
        });
        
        if(ui.volume.$button.length)
        ui.volume.$button.unbind("click").on("click", ()=>{
            ts.setVolume("2 steps", "button");
        });
        
        if(ui.alltrack.$on.length)
        ui.alltrack.$on.unbind("click").on("click", ()=>{
            ts.setAllTrack("on");
        });
        
        if(ui.alltrack.$off.length)
        ui.alltrack.$off.unbind("click").on("click", ()=>{
            ts.setAllTrack("off");
        });
        
        if(ts.skin == "tune")
        ui.volume.$outBtn.unbind("click").on("click", ()=>{
            if(ui.volume.$outBtn.hasClass("active")) ts.widgetShow("close");
            else ts.widgetShow("open");
        });
        
        $(document).on("keyup", function (event) {
            if(event.keyCode == 122 || event.keyCode == 27){
                ts.state.relaxExit = true;
            } 
            else
            if(event.keyCode == 32){ // Space
                ts.hotKey(event.keyCode);
            }            
        });
        
        ui.$done.on("click", ()=>{
            ts.state.relaxExit = true;
        });
        
        /*
        ui.volume.$outBtn.unbind("click").on("click", ()=>{
            ts.setVolume("3 steps", "button");
        }); 
        */
    }; 
    
    this.once =(action)=> {
        if(ONCE.indexOf(action) != -1) return;
        else ONCE.push(action);
        
        switch(action){
            case "create":
                ui.playlist.$list.addClass("loading");
                
                ts.state.created = true;
                
                ts.getPlayList();
                ts.volumeSlider();
                ts.keepButton();

                ts.render();

                ts.draggable();
                ts.getCoord();
                
                if(ts.skin == "player"){
                    ts.trackSlider();
                }
                /*
                ui.control.$playPauseButtons.tooltip({
                    //"placement": "top",
                    "placement": "top",
                    "delay": {show: 600},
                    "trigger": "hover",
                    "title": translate("relax_space_bar_hint")
                });
                */
                //ts.volumeIcons();
            break;
            
            case "scrollbar":
               //ui.playlist.$wrap.mCustomScrollbar({
               ui.playlist.$list.mCustomScrollbar({
                    theme:"light",
                    axis: "y",
                    //autoHideScrollbar: false,

                    scrollInertia: 150,
                    scrollEasing: "easeOut",

                    mouseWheel: {
                        enable: true,
                        axis: "y",
                        normalizeDelta: true,
                        scrollAmount: 100,
                        deltaFactor: 10,
                        normalizeDelta: true
                    },

                    advanced: {
                        //updateOnContentResize: true
                    }
                });
                
            break;
                
            case "redrawPRO":
               ts.getPlayList();
            break;
        }//switch
        
    };
    
    this.render =(elements, mode)=> {
        var all = false;
        if(!elements){
            all = true;
            var elements = ['all'];
        }else if(typeof elements != "object"){
            var elements = [elements];
        }
        
        if(typeof mode != "object") mode = [mode || false];
        
        for(var key in elements){
            var el = elements[key];
            
            if(all || el == "widget"){
                if(ts.state.widgetShow == "open"){
                    ui.$wrap.removeClass("hide").css({opacity:0}).animate({opacity:1}, 700);
                    
                    if(ts.skin == "player") ui.winbtn.$open.addClass("active");//.addClass("hide");
                    else
                    if(ts.skin == "tune") ui.volume.$outBtn.addClass("active");//.addClass("hide");
                }else if(ts.state.widgetShow == "close"){
                    ui.$wrap.addClass("hide");
                    
                    if(mode.indexOf("soft") == -1) ts.playerControl("pause");
                                        
                    if(ts.skin == "player") ui.winbtn.$open.removeClass("active");//.addClass("hide");
                    else
                    if(ts.skin == "tune") ui.volume.$outBtn.removeClass("active");//.addClass("hide");
                }                
                
                if(ts.state.widgetView == "full"){
                    ui.$wrap.removeClass("audio-mini");
                    ui.winbtn.$mini.show();
                    ui.winbtn.$list.hide();
                }else if(ts.state.widgetView == "mini"){
                    ui.$wrap.addClass("audio-mini");
                    ui.winbtn.$mini.hide();
                    ui.winbtn.$list.show();
                }
                
                if(ts.state.audio.loop == "on"){
                    ui.control.$loop.addClass("active");
                }else{
                    ui.control.$loop.removeClass("active");
                }
            }
            
            if(all || el == "langs"){
                if(ts.state.audio.langsAll.length > 1){
                    var $list = [];

                    for(var key in ts.state.audio.langsAll){
                        var $el = $("<span>")
                            .attr("langName", ts.state.audio.langsAll[key])
                            .addClass("btn-common btn-lang")
                            .text(ts.state.audio.langsAll[key])
                        ;

                        if(ts.state.audio.langsUse.indexOf(ts.state.audio.langsAll[key]) != -1){
                            $el.addClass("active");
                        }

                        $list.push($el);
                    }
                }else{
                    $list = "";
                }
                
                
                ui.langs.$wrap.html($list);
            }
        }
    };
    
    this.hotKey =(keyCode)=> {
        if(ts.state.meditation || !ui.$wrap.hasClass("only-relax")){
            //swtich(keyCode){}
            //ts.state.playback || ts.state.audio.tunes

            //ts.state.keyPaused;

            var command = false;

            if(ts.skin == "player"){
                if(ts.state.playback){
                    command = "pause";
                    ts.state.keyPaused = true;
                }
                else if(ts.state.audio.paused){
                    if(RelaxTune.state.audio.tunes == 0){
                        if(ts.state.keyPaused || !RelaxTune.state.keyPaused){
                            command = "play";
                        }
                    }
                }
            }else if(ts.skin == "tune"){            
                if(ts.state.audio.tunes > 0){
                    command = "pause";
                    ts.state.keyPaused = true;
                }
                else if(ts.state.audio.paused){
                    if(!RelaxPlayer.state.playback){
                        if(ts.state.keyPaused || !RelaxPlayer.state.keyPaused){
                            command = "play";
                        }
                    }
                }
            }

            if(command){
                setTimeout(()=>{
                    ts.playerControl(command);
                }, 100);
            }
        }
        
    };
        
    this.keepButton =()=> {
        //console.info("keepButton", ts.state.playback);
        audioKeepButton();
    };
    
    this.relaxMode =(mode)=> {
        if(mode == "start"){
            ts.state.meditation = true;
            ts.once("create");
            ui.$wrap.removeClass("only-relax");
            
            if(ts.state.autoplay){
                if(ts.skin == "player") ts.playerControl("play");
                else
                if(ts.skin ==  "tune" ) ts.playerControl("each");
            }
        }else{//stop
            ts.state.meditation = false;
            
            setTimeout(()=>{
                if((ts.state.playback || ts.state.audio.tunes) && (!ts.state.keep || ts.state.relaxExit)){
                    //ts.state.autoplay = true; // Task 524 / 10 
                    //ts.state.autoplay = false;
                    
                    if(!ts.state.relaxExit) ts.state.autoplay = true;
                    else ts.state.autoplay = false;
                }else{
                    ts.state.autoplay = false;
                }
                
                if(!ts.state.keep || (!ts.state.playback && !ts.state.audio.tunes)){
                    ts.playerControl("pause");
                    ui.$wrap.addClass("only-relax");
                }else{ }
            }, 55);
            
            setTimeout(()=>{
                ts.state.keep = false;            
                ts.state.relaxExit = false;
            }, 500);
        }//else
        
        setTimeout(()=>{
            ts.getCoord();
        }, 150);
    };
    
    this.fadeMode =(mode, speed, hard)=> {
        if(mode == "auto" && ts.skin == "tune"){
            if(!ui.volume.$outBtn.hasClass("active")) mode = "show";
            else mode = "hide";
        }        
        
        if(mode == "show"){
            ui.$wrap.stop(true, false)
                /*
                .css({
                    display: "block",
                    opacity: 0
                })
                */
                .animate({opacity: 1}, 1000)
            ;
            
            //if(ts.skin == "tune") ui.volume.$outBtn.addClass("active");
        }else {
            setTimeout(()=>{
                if(!ts.state.keep || (!ts.state.playback && !ts.state.audio.tunes)){
                    ui.$wrap.animate({opacity: 0}, 1000, ()=>{
                        if(hard) ui.$wrap.addClass("only-relax");
                    });
                }
            }, 50);
            
            //if(ts.skin == "tune") ui.volume.$outBtn.removeClass("active")
        }
    };
    
    this.draggable =()=> {
        ui.$wrap.draggable({
            handle: ui.$mover,//ui.winbtn.$move, 
            scroll: false,
            delay : 0,
            //containment: "#background-borders", 
            start: function( event, interface ) {
                ui.$wrap.addClass("dragging");
            },
            stop : function(event, interface) {
                //ts.setCoord("align");
                ts.updateCoord();
                
                setTimeout(()=>{
                    ui.$wrap
                        .removeClass("dragging")
                        .css("height", "auto")
                    ;
                }, 75);
            }
        });
    };
    
    this.updateCoord =()=> {
        var upd = {
            top  : Math.max(0, parseInt(ui.$wrap.css("top"))),
            left : Math.max(0, parseInt(ui.$wrap.css("left")))
        };
                
        var win = {
            w : $(window).width(),
            h : $(window).height()
        };
        
        upd.bottom = win.h - (upd.top + ui.$wrap.height());
        
        var prc = {
            top : Math.round(10000 * (upd.top ) / win.h) / 100,
            left: Math.round(10000 * (upd.left) / win.w) / 100,
            bottom : Math.round(10000 * (upd.bottom ) / win.h) / 100,
        };
        
        //console.debug(prc);
        
        localStorage.setItem("relax-audio-widget-coord-"+ts.skin, JSON.stringify(prc));
    };
    
    this.getCoord =()=> {
        var coord = localStorage.getItem("relax-audio-widget-coord-"+ts.skin) || false;
        
        if(!coord) return false;
        
        coord = JSON.parse(coord);
                
        var win = {
            w : $(window).width(),
            h : $(window).height()
        };
        
        if(!coord.bottom){
            coord.bottom = 100 - coord.top - (Math.round(10000 * (ui.$wrap.height() / win.h) / 100));
        }
                
        //console.debug(win, coord);
        //console.debug('set', win.w * coord.left / 100, win.h * coord.bottom  / 100);
        
        ui.$wrap.css({
            top  : "auto",//win.h * coord.top  / 100,
            left : win.w * coord.left / 100,
            right: "auto",
            bottom: Math.max(Math.min((win.h * coord.bottom  / 100), (win.h - ui.$wrap.height())), 0),
        });
        
    };
    
    this.setAllTrack =(mode)=> {
        if(mode == "on"){
            
            var enabled = parseInt(ts.state.audio.tunes);
            
            if(!ts.state.PRO && enabled >= vars.maxFreeTunes){
                AUTH.isPremium("discovered", false, "relax");
                return;
            }
            
            ui.playlist.$list
                .find("li:not(.audio-disallow)")
                .each((el, self)=>{
                     if(ts.state.PRO || enabled < vars.maxFreeTunes){
                         $(self).addClass("active")
                            .find(".audio-track-queue")
                            .addClass("track-queue-on")
                        ;
                         
                         enabled++;
                     }
                })
            ;
            
            //ui.playlist.$list.find(".audio-track-queue").addClass("track-queue-on");
        }else{
            ui.playlist.$list.find("li").removeClass("active");
            ui.playlist.$list.find(".audio-track-queue").removeClass("track-queue-on");
            
            if(!ts.state.meditation/* && !ts.state.audio.tunes*/){
                setTimeout(()=>{
                    ts.fadeMode("hide", false, true);
                }, 250);
            }
        }
        
        ts.GA("tune", "all", (mode == "on" ? 1 : 0));
        
        ts.playerControl("each");
    };
    
    this.setTrackTune =(trackId, on, $li, $button)=> {
        if(on == true){
            $li.addClass("active");
            $button.removeClass("track-queue-off").addClass("track-queue-on");
        }else{
            $li.removeClass("active");
            $button.removeClass("track-queue-on").addClass("track-queue-off");
        }
        
        ts.GA("tune", ts.state.audio.list[trackId].name, (on ? 1 : 0));
        
        ts.playerControl("each");
    };
    
    this.setLang =(lang)=> {
        var index = ts.state.audio.langsUse.indexOf(lang);
        
        if(index == -1){
            ts.state.audio.langsUse.push(lang)
        }else{
            ts.state.audio.langsUse.splice(index, 1);
        }
        
        localStorage.setItem("relax-audio-langs", JSON.stringify(ts.state.audio.langsUse));
        
        ts.render("langs");
        ts.drawPlaylist();
    };
    
    this.fillLangs =()=> {
        ts.state.audio.langsAll = [];
        
        for(var key in ts.state.audio.list){
            var lang = ts.state.audio.list[key].lang || false;
            
            if(
                lang && lang != "all"
                &&
                ts.state.audio.langsAll.indexOf(lang) == -1
            ){
                ts.state.audio.langsAll.push(lang);
            }
        }
        
        ts.render("langs");
    };
    
    this.playerControl =(action, mode)=> {
        if(action == "play"){
            ui.control.$play.css("display","none");
            ui.control.$pause.css("display","inline-block");
            ts.state.audio.paused = false;
            ts.state.keyPaused = false;
            
            if(ts.skin == "player"){
                if(!ts.state.current.trackId){
                    ts.setTrack(ts.state.audio.order[0]);
                }else{
                    //ui.$audio[0].play(); // auto
                }
                
            }else{
                /*
                if(!ts.state.audio.tunes){
                    ui.playlist.$list
                        .find("li:eq(0)")
                        .addClass("active")
                        .find(".audio-track-queue")
                        .removeClass("track-queue-off")
                        .addClass("track-queue-on")
                    ;
                }
                */
                
                ui.control.$trigger.removeClass("active");
                
                ts.playerControl("each", mode);
                return;
            }
            
            
        }else 
        if(action == "pause"){
            ts.state.playback = false;
            ts.state.audio.tunes = 0;
            ts.state.audio.paused = true;
            
            ui.control.$pause.css("display","none");
            ui.control.$play.css("display","inline-block");
            
            if(ts.skin == "player"){
                ui.$audio[0].pause();
                ts.GA("stop", String(ts.state.current.name), ui.$audio[0].currentTime);
            }
            
            if(ts.skin == "tune"){
                ui.playlist.$list.find("li").each((i, el)=>{
                    if($(el).find(".audio-track-queue").hasClass("track-queue-on")){
                        ts.soundStop($(el).find("audio"));
                    }
                });
                
                ui.control.$trigger.addClass("active");
            }
            
        }else 
        if(action == "next"){
            var index = ts.state.audio.order.indexOf(ts.state.current.trackId);
            
            if(
                ts.state.current.trackId 
                && 
                index > -1 
                && 
                index < ts.state.audio.order.length - 1
            ){
                ts.setTrack(ts.state.audio.order[index + 1]);
            }else{
                ts.setTrack(ts.state.audio.order[0]);
            }
        }else 
        if(action == "prev"){
            var index = ts.state.audio.order.indexOf(ts.state.current.trackId);
            
            if(
                ts.state.current.trackId 
                && 
                index > 0
            ){
                ts.setTrack(ts.state.audio.order[index - 1]);
            }else{
                ts.setTrack(ts.state.audio.order[ts.state.audio.order.length - 1]);
            }
            
        }else 
        if(action == "after"){
            var index = ts.state.audio.order.indexOf(ts.state.current.trackId);
            ts.GA("listened", String(ts.state.current.name), ui.$audio[0].currentTime);
            
            if(ts.state.audio.loop == "on"){
                var trackId = ts.state.current.trackId;
                ts.state.current.trackId = false;
                ts.setTrack(trackId);
            }else{
                ts.playerControl("next", "nostat");
            }
            
        }else
        if(action == "each"){
            ts.state.audio.tunes = 0;
            var allOn = true, allOff = true;
            ts.state.keyPaused = false;
            
            ui.playlist.$list.find("li").each((i, el)=>{
                var audio = $(el).find("audio")[0];
                var src   = $(el).find("audio").attr("src");
                
                if($(el).find(".audio-track-queue").hasClass("track-queue-on")){
                    allOff = false;
                    ts.state.audio.tunes++;
                    ts.soundLoop($(el).find("audio"));
                }else{
                    ts.soundStop($(el).find("audio"));
                    allOn = false;
                }
            });
            
            ui.alltrack.$on.removeClass("active");
            ui.alltrack.$off.removeClass("active");
            
            if(allOn ) ui.alltrack.$on.addClass("active");
            if(allOff){
                ui.alltrack.$off.addClass("active");
                /*
                if(!ts.state.meditation){
                    setTimeout(()=>{
                        ts.fadeMode("hide");
                    }, 250);
                }
                */
                
                ui.control.$trigger.addClass("disabled");//.removeClass("active")
            }else{
                ui.control.$trigger.removeClass("disabled");
            }
            
            if(ts.state.audio.tunes > 0){
                ui.control.$pause.css("display","inline-block");
                ui.control.$play.css("display","none");
            }else{
                ui.control.$pause.css("display","none");
                ui.control.$play.css("display","inline-block");
                //ui.control.$trigger.addClass("active");
            }
            
            ui.control.$trigger.removeClass("active");
            
            /* // Task #551 -> #567 
            if(!ts.state.PRO && ts.state.audio.tunes >= vars.maxFreeTunes){
                
                ui.playlist.$list.find(".audio-track-queue:not(.track-queue-on)").parents("li").addClass("audio-disallow");
            }else{
                ui.playlist.$list.find(".audio-disallow").removeClass("audio-disallow");
            }
            */
        } 
        
        
        if(['play', 'next', 'prev'].indexOf(action) != -1){
            ts.state.playback = true;
            ts.state.keyPaused = false;
            ui.$audio[0].play();
            
            if(mode != "nostat") ts.GA("play", String(ts.state.current.name));
        }
        
        ts.keepButton();
    };
    
    this.soundLoop =($audio)=> {
        if($audio[0].paused && $audio[1].paused){
            //$audio.attr("preload", "auto");
            
            var cur = 0;
            var interval = Math.max(50, Math.round(1000 * ts.state.audio.gap / 30));
            var startLoad = Date.now();
            
            $audio[1].currentTime = ts.state.audio.gap;
            $audio[0].currentTime = ts.state.audio.gap;
            $audio[0].load();
            
            var listenerIsActive = true;
            
            $audio[0].addEventListener("canplaythrough", (e)=> {
                if(listenerIsActive){
                    listenerIsActive = false;
                    
                    setTimeout(()=>{
                        $audio[0].play();
                    }, 50);
                    
                    //console.debug($audio.attr("src").split('/').pop(), "oncanplaythrough", $audio[0].buffered, $audio[0].readyState, Date.now() - startLoad, e);
                }
            });
            
            //$audio[0].oncanplaythrough =;
            
            var $li = $audio.parent("li");
            
            //console.debug($li);
            
            var i = 0;
            clearInterval(LOADER[$audio.attr("src")]);
            
            
            LOADER[$audio.attr("src")] = setInterval(()=>{
                if($audio[0].currentTime > ts.state.audio.gap){
                    clearInterval(LOADER[$audio.attr("src")]);
                    ts.soundLoopInterval($audio);
                    $li.removeClass("loading");
                }else if(i * interval < 650 && i * interval > 450){
                    $li.addClass("loading");
                }
                /*else if(i > 1000){
                    clearInterval(LOADER[$audio.attr("src")]);
                }*/

                i++;
            }, interval);
        }
    };
    
    this.soundLoopInterval =($audio)=> {
        var cur = 0;
        
        clearInterval(INTERVAL[$audio.attr("src")]);
        
        //console.debug("Start", $audio.attr("src").split('/').pop(), $audio[0].duration);
        
        INTERVAL[$audio.attr("src")] = setInterval(
            ()=>{
                if(($audio[cur].duration - $audio[cur].currentTime) < 2 * ts.state.audio.gap){
                    var pre = cur;
                    ts.soundLoopPrepare($audio, pre);
                    cur = cur ? 0 : 1;
                    $audio[cur].play();
                }
                
                //console.debug($audio.attr("src").split('/').pop(), "Main: ", cur, " | Paused [0]: ", $audio[0].paused, ' / ',  $audio[0].currentTime, " | Paused [1]: ", $audio[1].paused, ' / ', $audio[1].currentTime);
            },
            1000 * ts.state.audio.gap
            //1000 * ($audio[0].duration - 2 * ts.state.audio.gap)
        );
    };
    
    this.soundLoopPrepare =($audio, cur)=> {
        
        var v = 0;
        var interval = setInterval(// volume down
            ()=>{
                v++;
                $audio[cur].volume = (10-v) * ts.state.audio.volume / 10;
                if(v == 9) clearInterval(interval);
            },
            210 * ts.state.audio.gap
        );
        
        setTimeout(
            ()=>{
                //console.debug(cur, 'pause');
                $audio[cur].pause();
                $audio[cur].currentTime = ts.state.audio.gap;
                $audio[cur].volume = ts.state.audio.volume;
            }, 
            3000 * ts.state.audio.gap
        );
    };
    
    this.soundStop =($audio)=> {
        $audio[0].pause();
        $audio[1].pause();
        //$audio[0].currentTime = 0;
        clearInterval(INTERVAL[$audio.attr("src")]);
    };
    
    this.setTrack =(trackId)=> {
        if(ts.state.current.trackId == trackId) return;
        
        ui.track.$slider.slider("value", 0);
        
        var track = ts.state.audio.list[trackId];
        ts.state.current = ts.state.audio.list[trackId];
        ts.state.current.trackId = trackId;
        //ts.state.current.aligned = false;
        
        ui.playlist.$list.find(".active").removeClass("active");
        ui.playlist.$list.find(".loading").removeClass("loading");
        
        var $li = ui.playlist.$list.find("[trackId="+trackId+"]");
        
        $li.addClass("active");//.addClass("loading");
        
        ui.track.$name.text(track.title);
        
        ui.$audio.find("source").remove();
        
        //ui.$audio.stop();
        ui.$audio.attr("src", track.url);
        ui.$audio[0].volume = ts.state.audio.volume;
        ts.playerControl("play");
        
        ui.track.$timer.text("0:00 / " + ts.state.current.duration);
        ts.trackTimer();
        
        var i = 0;
        clearInterval(ts.state.audio.loading);
        ts.state.audio.loading = setInterval(()=>{
            if(ui.$audio[0].currentTime > 0.05){
                clearInterval(ts.state.audio.loading);
                $li.removeClass("loading");
            }else if(i == 0){
                $li.addClass("loading");
            }
            /*else if(i > 1000){
                clearInterval(ts.state.audio.loading);
            }*/
            
            i++;
        }, 110);
        
        ui.track.$wrap.removeClass("audio-track-empty");
    };
    
    this.trackTimer =()=> {
        clearInterval(ts.state.trackTimer);
        
        ts.state.trackTimer = setInterval(()=>{
            var time = Math.round(ui.$audio[0].currentTime);
            var duration = Math.round(ui.$audio[0].duration);
                        
            //var all = secToTime(ui.$audio[0].duration);
            ui.track.$timer.text(secToTime(time) + " / " + /*all*/ ts.state.current.duration);
            
            if(!ui.track.$slider.hasClass("inSlide")){
                ui.track.$slider.slider("value", (1000 * time / duration));
            }
            
            if(time == duration){
                ts.playerControl("after");
            }
        }, 1000);
    };
    
    this.setTrackTime =(valPerThousand)=>{
        if(ts.state.current.trackId){
            var duration = Math.round(ui.$audio[0].duration);
            var setTime = Math.round(duration * valPerThousand / 1000);
            ui.$audio[0].currentTime = setTime;
        }
    };
    
    this.widgetView =(mode)=> {
        if(!mode || ['full','mini'].indexOf(String(mode)) == -1){
            var mode = (ts.state.widgetView == "full" ? "mini" : "full");
        }
        localStorage.setItem("relax-audio-widget-view-"+ts.skin, mode);
        ts.state.widgetView = mode;
        ts.render("widget");
    };
    
    this.switchLoop =(mode)=> {
        if(!mode || ['on','off'].indexOf(String(mode)) == -1){
            var mode = (ts.state.audio.loop == "on" ? "off" : "on");
        }
        localStorage.setItem("relax-audio-loop", mode);
        ts.state.audio.loop = mode;
        ts.render("widget", "soft");
    };
        
    this.widgetShow =(mode)=> {
        if(mode == "close" && !ts.state.meditation){
            ts.playerControl("pause");
            ui.$wrap.addClass("only-relax");            
        }else{
            if(!mode || ['open','close'].indexOf(String(mode)) == -1){
                var mode = (ts.state.widgetShow == "open" ? "close" : "open");
            }
            localStorage.setItem("relax-audio-widget-show-"+ts.skin, mode);
            ts.state.widgetShow = mode;
            ts.render("widget", "soft");
        }
    };
        
    this.trackSlider =()=> {
        ui.track.$slider.slider({
            range: "min",
            value: 0,
            min: 0,
            max: 1000,
            slide: ( event, jqui ) => {
                //console.debug("Track Slider", jqui.value);
            },
            start: ( event, jqui ) => {
                ui.track.$slider.addClass("inSlide");
            },
            stop: ( event, jqui ) => {
                ui.track.$slider.removeClass("inSlide");
                ts.setTrackTime(jqui.value);
            }
        });
        /*
        setInterval(()=>{
            ui.track.$slider.slider("value", Math.round(300 * Math.random()));
        }, 1000);
        */
    };
    
    this.volumeSlider =()=> {
        ui.volume.$slider.slider({
            range: "min",
            value: 100 * ts.state.audio.volume,
            min: 0,
            max: 100,
            slide: function( event, jqui ) {
                //console.debug("Volume Slider", jqui.value);
                ts.setVolume(jqui.value / 100);
            },
            stop: function( event, jqui ) {
                //console.debug("Volume Slider", jqui.value);
                ts.setVolume(jqui.value / 100, "write");
            }
        });
    };
    
    this.setVolume =(vol, mode)=> {
        if(String(vol).indexOf("steps") != -1){
            var steps = parseInt(vol);
            
            if(ts.state.audio.volume == 1) var vol = 0;
            else{
                var part = 1 / steps;
                var vol = (1 + Math.floor(ts.state.audio.volume / part)) * part;
            }
        }
        
        if(ts.skin == "player"){
            ui.$audio[0].volume = vol;            
        }else{
            ui.playlist.$list.find("audio").each((i, el)=>{
                el.volume = vol;
            });
        }
        
        
        ts.state.audio.volume = vol;
        
        if(mode == "write" || mode == "button") localStorage.setItem("relax-volume-"+ts.skin, vol);
        if(mode == "button") ui.volume.$slider.slider("value", Math.round(100 * vol));
        
        ts.volumeIcons();
    };
    
    this.volumeIcons =()=> {
        var vol = ts.state.audio.volume;
        
        if(true){
            if(vol == 0){
                ui.volume.$icon.removeClass("glyphicon-volume-up glyphicon-volume-down").addClass("glyphicon-volume-off");
            }else{
                if(vol < 0.6){
                    ui.volume.$icon.removeClass("glyphicon-volume-up glyphicon-volume-off").addClass("glyphicon-volume-down");
                }else{
                    ui.volume.$icon.removeClass("glyphicon-volume-down glyphicon-volume-off").addClass("glyphicon-volume-up");
                }
            }
        }    
        
        if(false){
            if(vol == 0){
                ui.volume.$outIco.attr("src", "img/common/volume_0.png");
            }else{
                if(vol < 0.35){
                    ui.volume.$outIco.attr("src", "img/common/volume_1.png");
                }else if(vol < 0.75){
                    ui.volume.$outIco.attr("src", "img/common/volume_2.png");
                }else{
                    ui.volume.$outIco.attr("src", "img/common/volume_3.png");
                }
            }
        }
        
    };
    
    this.getPlayList =()=> {
        if(!ts.state.created) return;
        
        var statePRO = AUTH.isPremium() || false;
        
        if(
            ts.state.PRO == undefined
            ||
            statePRO != ts.state.PRO
        ){
            ts.state.PRO = statePRO;
        }else{
            return;
        }        
        
        //console.debug(ts.skin, ts.state.PRO);
        
        //BRW_getAcceptLanguages(function(languages){
        //    ts.state.RU = languages.indexOf("ru") != -1;
            ts.state.RU = getActualLanguage().toLowerCase() == "ru";
            
            var API = ts.skin == "player" ? vars.list : vars.tune;
            
            ts.GET({
                api: vars.list,
                success: (response)=>{
                    var demoRu = false, demoEn = false, demoTune = false;
                    
                    ts.state.audio.list = {};
                    
                    /*if(ts.skin == "player") */
                    //response = ts.state.audio.listExample; // DEV !!!
                    
                    var result = JSON.parse(JSON.stringify(response));
                    
                    if(ts.state.RU){
                        var listRu = [];
                        for(var key in result) if(result[key].lang == "ru") listRu.push(result[key]);
                        for(var key in result) if(result[key].lang != "ru") listRu.push(result[key]);
                        result = listRu;
                    }
                    
                    for(var key in result){
                        var val = result[key];
                        
                        if(!ts.state.RU && val.lang == 'ru') continue;
                        if(ts.skin == "tune" && parseInt(val.sound) == 0) continue;
                        if(ts.skin == "player" && parseInt(val.sound) == 1) continue;
                        
                        
                        if(!val.url) val.url = "https://livestartpage.com/gallery/audio/" + val.file;
                        
                        if(
                            val.category == "Sound"
                            &&
                            vars.Notes.indexOf(String(val.name).split(' ').shift().toLowerCase()) === -1
                        ){
                            //console.debug(String(val.name).split(' ').shift().toLowerCase());
                            val.url = extensionGetUrl(
                                String(val.url)
                                    .replace('%20', ' ')
                                    .replace('https://livestartpage.com/gallery/audio/Sounds/', '/default-content/sound/')
                            );
                            //console.debug("URL: " + val.url);
                        }
                        //console.debug(val.url);
                        
                        var id = "id"+String(crc32(val.file || val.url));

                        if(!val.lang) val.lang = "all";
                        
                        if(ts.state.PRO) val.allow = true;
                        else if(ts.skin == "player"){
                            if(
                                val.duration < 350
                                &&
                                (
                                    (val.lang == 'en' && !demoEn)
                                    ||
                                    (val.lang == 'ru' && !demoRu && ts.state.RU)
                                )
                            ){
                                val.allow = true;
                                
                                if(val.lang == 'en') demoEn = true;
                                else
                                if(val.lang == 'ru') demoRu = true;
                            }else{
                                val.allow = false;
                            }
                        }
                        else if(ts.skin == "tune"){
                            //val.allow = true;
                            /* Task #567 */ 
                            /*
                            if(!demoTune){
                                val.allow = true;
                                demoTune = true;
                            }else{
                                val.allow = false;
                            }
                            */
                            
                            //console.debug(val.name);
                            
                            if(key == 0 || vars.freeTunes.indexOf(val.name) != -1){
                                val.allow = true;
                            }else{
                                val.allow = false;
                            }
                        }

                        val.duration = String(secToTime(val.duration));
                        ts.state.audio.list[id] = val;
                    }
                    
                    ts.fillLangs();
                    ts.drawPlaylist();
                }
            });        
        //});        
    };
    
    this.drawPlaylist =()=> {
        ts.state.audio.order = [];
        
        var $ul = {
            'allow' : [],
            'disallow' : [],
        };
        
        for(var key in ts.state.audio.list){
            if(
                ts.state.audio.list[key].lang != "all"
                &&
                ts.state.audio.langsUse.indexOf(ts.state.audio.list[key].lang) == -1
            ){
                continue;
            }
            
            
            var $li = $("<li>").addClass("audio-track").attr("trackId", key).attr("source", ts.state.audio.list[key].url);
            //$li.addClass("loading");
            if(key == ts.state.current.trackId) $li.addClass("active");
            
            if(
                ts.state.audio.list[key].lang != "en" 
                && 
                ts.state.audio.list[key].name_ru
                && 
                ts.state.RU 
            ){
                var title = ts.state.audio.list[key].name_ru;
            }else{
                var title = ts.state.audio.list[key].name;
            }
            
            ts.state.audio.list[key].title = title;
            
            //console.debug(ts.state.RU, ts.state.audio.list[key].name_ru, ts.state.audio.list[key]);
            
            var titleClasses = "audio-track-name";
            
            if(ts.skin == "tune"){
                var First = String(title.split(' ').shift()).toLowerCase().trim();
                
                if(vars.Notes.indexOf(First) != -1){
                    title = title.split(' ');
                    title.shift();
                    title = String(title.join(' ')).trim();
                    
                    titleClasses += " icon-notes";
                }
            }
            
            
            $li
                .attr("custom-tooltip", title)
                .append(
                    $("<span>")
                        .addClass(titleClasses)
                        .text(title)
                )
                .append(
                    $("<span>")
                        .addClass("audio-track-duration")
                        .text(ts.state.audio.list[key].duration)
                )
                .append(
                    $("<span>")
                        .addClass("audio-track-queue")
                        .addClass(false ? "track-queue-on" : "track-queue-off")
                )
                .append(
                    $("<span>")
                        .addClass("audio-track-pro")
                )
                .append(
                    $("<span>")
                        .addClass("audio-track-loading")
                )
            ;
            
            if(ts.skin == "tune"){
                //console.debug(ts.state.audio.list[key].url);
                
                $audio = $("<audio>")
                    //.attr("loop", "loop")
                    .attr("src" , ts.state.audio.list[key].url)
                    //.attr("preload" , "auto")
                ;
                $audio[0].volume = ts.state.audio.volume;
                
                $li.append($audio);
                
                $audio = $("<audio>")
                    //.attr("loop", "loop")
                    .attr("src" , ts.state.audio.list[key].url)
                    //.attr("preload" , "auto")
                ;
                $audio[0].volume = ts.state.audio.volume;
                
                $li.append($audio);
            }
            
            if(ts.state.audio.list[key].allow){
                ts.state.audio.order.push(key);
            }else{
                $li.addClass("audio-disallow");
            }
            
            $ul[(ts.state.audio.list[key].allow ? 'allow' : 'disallow')].push($li);
        }//for
        
        
        
        if(
            ui.playlist.$list.hasClass("mCustomScrollbar")
            ||
            ONCE.indexOf("scrollbar") != -1
        ){
            ui.playlist.$list.mCustomScrollbar("destroy");
            ONCE.splice(ONCE.indexOf("scrollbar"), 1);
        }
        
        ui.playlist.$list.html("").removeClass("loading");
        if(Size($ul['allow'])) ui.playlist.$list.append($ul['allow']);
        if(Size($ul['disallow'])) ui.playlist.$list.append($ul['disallow']);
                
        ts.once("scrollbar");
        
    };  
    
    this.GA = function(action, label, value){
        sendToGoogleAnaliticMP(function() {
            gamp('send', 'event', 'audio', action, label, parseInt(value || "") || 0);
        });
    };

    this.GET = function(opt){
        var options = opt;
        
        //console.debug(vars.SRV + options.api);
        
        var xhr = BRW_json(
            vars.SRV + options.api,
            function(result){
                if(result.error == 0){
                    if(options.success) options.success(result.list);
                }else{
                    if(options.error) options.error(result);
                }
                xhr = null;
            },
            function(error){
                if(errorFunc) errorFunc(error);
            }
        );
        
        return xhr;
    };
};  

function RelaxAdvanced(){
    var ts = this;
    
    var ONCE = [];
    
    var vars = {
        sidebar : {
            $el : $("#relax-sidebar"),
            hideTime : !DevModeRelax ? 1500 : 1e5,//DEV !!!
            shuffleTime : parseInt(localStorage.getItem("relax-sidebar-shuffle-interval")) || 60000,
        }
        //API    : "http://everhelper.me/sdpreviews/",
    };
    
    var ui = {
        $fades  : $("#relax-sidebar, #relax"),//, #audio-player
        $curtain: $("#cursor-hide-curtain"),
        $done   : $("#relax-done-btn"),
        sidebar   : {
            $wrap : vars.sidebar.$el,
            $area : vars.sidebar.$el.find("#relax-video-list-wrap"),
            $list : vars.sidebar.$el.find("#relax-video-list"),
            $btn  : vars.sidebar.$el.find("#relax-sidebar-btn"),
            btns  : {
                $up  : vars.sidebar.$el.find("#relax-sidebar-btn .sidebar-up"),
                $down: vars.sidebar.$el.find("#relax-sidebar-btn .sidebar-down"),
            },
            $shuffle:  vars.sidebar.$el.find("#relax-sidebar-controls .relax-control-shuffle"),
            $video  :  vars.sidebar.$el.find("#relax-sidebar-controls .relax-control-video"),
        },
        noHide : $("#audio-player, #audio-tune, #relax-sidebar-btn, .relax-control, .relax-done-btn"),
    };
    
    this.state = {
        relax: false,
        sidebar : {
            open: true,
            fill: false,
            list: false,
            keys: [],
            status: localStorage.getItem("relax-sidebar") || "show",
            fade : false,
            shuffle: false,
            shuffleTimer: false,
        },
        themes : false,
        themeId: false,
        themeDefault: false,
        touch: 0,
        touchInterval: false,
        playDefault : false,
    };
    
    this.init =()=> {
        //console.debug("Relax Advanced", "init");
        /*
        ts.listeners();
        ts.getThemesList();
        ts.sidebarToggle("fast");
        */
    };
    
    this.listeners =()=> {
        ui.sidebar.$btn.unbind("click").on("click", ()=>{
            ts.sidebarSwitch();
        });
        
        ui.sidebar.$list.on("click", "li", (event)=>{
            if($(event.currentTarget).hasClass("more-themes-button")){
                ui.$done.trigger("click")
                openUrlInNewTab(extensionGetUrl("/pages/options/options.html"));
            }else{
                ts.setTheme($(event.currentTarget).attr("themeId"));
            }
        });
        
        ui.sidebar.$shuffle.unbind("click").on("click", ()=>{
            ts.themeShuffle();
        });
        
    };
    
    this.once =(action)=> {
        if(ONCE.indexOf(action) != -1) return;
        else ONCE.push(action);
        
        switch(action){
            case "init":
                ts.listeners();
                ts.getThemesList();
                ts.sidebarToggle("fast");
            break;
            
            case "sideTimer":
                $(document).on("mousemove", function(e){
                    ts.state.touch = Date.now();
                    
                    if(ts.state.relax && ts.state.sidebar.fade){
                        if(!ts.state.mouseInMove){
                            ts.state.mouseInMove = {status:"compare", pageX:e.pageX, pageY:e.pageY};//"wait"
/*
                            setTimeout(()=>{
                                if(typeof ts.state.mouseInMove == "object") ts.state.mouseInMove.status = "compare";
                            }, 350);
                            */
                        }else if(typeof ts.state.mouseInMove == "object" && ts.state.mouseInMove.status == "compare"){
                            var diff = Math.abs(ts.state.mouseInMove.pageX - e.pageX) + Math.abs(ts.state.mouseInMove.pageY - e.pageY);
                            
                            if(diff > 50){
                                //console.debug("Mouse coord diff", diff);
                                if(ts.state.sidebar.fade) ts.sidebarFade("show");
                            }
                        }
                    }
                });
                
                $(document).on("keyup", function(e){
                    ts.state.touch = Date.now();
                    
                    if(e.keyCode != 32){
                        ts.state.mouseInMove = false;

                        if(ts.state.relax && ts.state.sidebar.fade){
                            ts.sidebarFade("show");
                        }
                    }
                    
                });
                
            break;
                
            case "scrollbar":
               //ui.sidebar.$area.mCustomScrollbar({
               ui.sidebar.$list.mCustomScrollbar({
                    theme:"dark",
                    axis: "y",
                    autoHideScrollbar: true,

                    scrollInertia: 150,
                    scrollEasing: "easeOut",

                    mouseWheel: {
                        enable: true,
                        axis: "y",
                        normalizeDelta: true,
                        scrollAmount: 100,
                        deltaFactor: 10,
                        normalizeDelta: true
                    },

                    advanced: {
                        //updateOnContentResize: true
                    }
                });
                
            break;
        }//switch
        
    };
    
    this.themeShuffle =()=> {
        if(ts.state.sidebar.shuffle){
            ts.state.sidebar.shuffle = false;
            ui.sidebar.$shuffle.removeClass("active");
            clearInterval(ts.state.sidebar.shuffleTimer);
        }else{
            ts.state.sidebar.shuffle = true;
            ui.sidebar.$shuffle.addClass("active");
            
            ts.state.sidebar.shuffleTimer = setInterval(()=>{
                ts.themeShuffleNext();
            }, vars.sidebar.shuffleTime);
        }
    };
    
    this.themeShuffleNext =()=> {
        var setTheme = false, len = ts.state.sidebar.keys.length, trys=0;
        
        do{
            setTheme = ts.state.sidebar.keys[Math.floor(Math.random()*len)];            
        }while(
            setTheme == ts.state.themeId
            && (len > 1) && (++trys < 10)
        );
        
        ts.setTheme(setTheme);
    };
        
    this.relaxMode =(mode)=> {
        //console.debug("ADV relaxMode", mode);
                
        if(mode == "start"){
            ts.once("init");
            
            ts.state.relax = true;
            ts.state.playDefault = backgroundVideoActionsState();
            
            setTimeout(()=>{
                ts.sidebarFade("show");
            }, 450);
            
            ts.once("sideTimer");
            ts.touchTimer("start");
            
            var toggleCounter = 0;
            var toggleInterval = setInterval(()=>{
                ts.sidebarToggle("fast");
                if(++toggleCounter >= 3) clearInterval(toggleInterval);
            }, 350);
            
            //RelaxPlayer.once("create");
            //RelaxTune.once("create");
        }else{//stop
            ts.state.relax = false;
            ui.sidebar.$wrap.hide();
            ts.sidebarFade("hide", "fast");
            ts.touchTimer("stop");
            if(ts.state.sidebar.shuffle) ts.themeShuffle();
            
            if(ts.state.themeDefault){
                //localStorage.setItem("background-video-autoplay", "off");
                
                if(ts.state.playDefault){
                    backgroundVideoActionsState(ts.state.playDefault);
                    backgroundVideoActionsButtons(true, true);
                    
                    backgroundVideoActions(ts.state.playDefault);
                }
                
                ts.setTheme(ts.state.themeDefault, "fast");
            }else{
                if(ts.state.imageDefault) ts.setImage(ts.state.imageDefault, "fast");
            }
            
            setTimeout(()=>{
                clearRandomIgnore();
            });
        }//else
        
        RelaxPlayer.relaxMode(mode);
        RelaxTune.relaxMode(mode);
    };
    
    this.touchTimer =(mode)=> {
        clearInterval(ts.state.touchInterval);
        
        if(mode == "start"){
            ts.state.touch = Date.now();
            
            ts.state.touchInterval = setInterval(()=>{
                var timeDiff = Date.now() - ts.state.touch;
                
                if(
                    !ts.state.sidebar.fade
                    &&
                    timeDiff > vars.sidebar.hideTime
                ){
                    var isHover = false;
                    
                    ui.noHide.each((i, el)=>{
                        if($(el).is(":hover")) isHover = true;               
                    });     
                    
                    if(
                        !isHover
                        ||
                        timeDiff > 3 * vars.sidebar.hideTime
                    ){
                        ts.sidebarFade("hide");
                        ui.$curtain.css("display","block");
                        $(".cutom-tooltip").remove();
                        //$("[title]").attr("title", "123");
                    }
                    //ts.state.touch = Date.now();
                }
            }, 800);
        }
    };
    
    this.sidebarFade =(mode, speed)=> {
        //console.debug("sidebarFade", mode, speed);
        
        if(mode == "show"){
            ts.state.sidebar.fade = false;
            
            ui.sidebar.$wrap.css({
                display: "block",
                opacity: 0
            });
            
            ui.$fades.stop(true, true)
                .animate({opacity: 1}, 500, ()=>{
                })
            ;
            
            setTimeout(()=>{
                ts.once("scrollbar");
            }, 510);
            
            ui.$curtain.css("display","none");
        }else{
            ts.state.sidebar.fade = true;
            
            if(speed == "fast"){
                ui.sidebar.$wrap.hide();
            }else{
                ui.$fades.stop(true, true)
                    .animate({opacity: 0}, 700)
                ;
            }
            
            //ui.$curtain.css("display","block");
        }
        
        RelaxPlayer.fadeMode(mode, speed);
        RelaxTune.fadeMode(mode, speed);
        
        ts.state.mouseInMove = false;
    };
    
    this.setImage =(themeId, mode)=> {
        ts.highlightTheme(themeId);
        ts.state.themeId = themeId;
        
        if(themeId) {
            localStorage.setItem("dont-reload-tabs", "3s-"+Date.now());
            BRW_sendMessage({command: "changeImageBackground", theme: themeId});
            ts.reloadBackground(mode || false);
        }
    };
    
    this.setTheme =(themeId, mode)=> {
        if(!themeId || themeId == ts.state.themeId) return;
        else ts.state.themeId = themeId;
        
        ts.highlightTheme(themeId);
        
        var command = {
            theme: themeId,
        };
        
        if(ts.state.sidebar.list[themeId].lastInstallBgVideo){
            command.resolution = ts.state.sidebar.list[themeId].lastInstallBgVideo ? ts.state.sidebar.list[themeId].lastInstallBgVideo.resolution : false;
            
            if(ts.state.sidebar.list[themeId].isFlixelContent){
                command.command = "changeFlixerVideoBackground";
            }else{
                command.command = "changeVideoBackground";
            }
        }else{
            command.command = "changeImageBackground";
        }
        console.debug(command);
        if(command.command && command.theme) {
            localStorage.setItem("dont-reload-tabs", "3s-"+Date.now());
            ts.reloadBackground(mode || false);
            setRandomIgnore();
            
            console.debug(command);
            
            BRW_sendMessage(command);
            
            /*            
            if(command.theme == "d0r8ss4laixq6bu2o9ym"){
                
                setTimeout(()=>{
                    if(String(localStorage.getItem("background-image-file")).indexOf(ts.state.themeId) == -1){
                        localStorage.setItem("background-image-file", "d0r8ss4laixq6bu2o9ym/d0r8ss4laixq6bu2o9ym.hd.mp4");
                    }
                }, 1000);
            }
            */
        }
    };
    
    this.highlightTheme =(themeId)=> {
        ui.sidebar.$list.find(".active").removeClass("active");
        ui.sidebar.$list.find("[themeId="+themeId+"]").addClass("active");  
    };
    
    this.reloadBackground =(mode)=> {
        var cur = localStorage.getItem("background-video-url");
        
        var bgWait = setInterval(function() { 
            if(
                String(localStorage.getItem("background-image-file")).indexOf(ts.state.themeId) > -1
                ||
                String(localStorage.getItem("background-video-file")).indexOf(ts.state.themeId) > -1
            ) {  
                clearInterval(bgWait);  
                
                var $body  = $("body");
                var $image = $("#background-container");
                var $video = $("#background-container video");
                var $img   = $("#background-container img");
                
                setTimeout(()=>{
                    if($video.length){
                        $video
                            .css({
                                position: "absolute",
                                top: 0, left: 0
                            })
                            .animate({"opacity":"0.01"}, (mode == "fast" ? 100 : 1000))
                        ;
                    }else{
                        $body.css("background-image","");
                        $image.animate({"opacity":"0.01"}, (mode == "fast" ? 100 : 1000), ()=>{
                            $image.delay(15).css({
                                opacity: 1,
                                "background-image":"",
                            });
                        });
                    }
                }, 430);
                
                setTimeout(
                    ()=>{
                        $img.remove();
                        $video.remove();
                        //getBackgroundImage();

                        BRW_sendMessage({command: "getBackgroundImage"}, function(response) {                            
                            if(response){
                                if(typeof (response.video) != "undefined" && response.video) {
                                    updatePageBackgroundVideo(response, (mode == "fast" ? "fast" : "slide"));
                                    ui.sidebar.$video.removeClass("hide");
                                } else if(typeof (response.image) != "undefined" && response.image) {
                                    updatePageBackgroundImage(response);
                                    ui.sidebar.$video.addClass("hide");
                                    
                                    if(ts.state.relax){
                                        $image.css({opacity: 0}).animate({"opacity":1}, 650);
                                        
                                        setMeditationBgImage();
                                    }
                                }
                            }//if
                        });
                    },
                    (450 + (mode == "fast" ? 100 : 1000))
                );
            }
        }, 150);
        
    };
    
    this.sidebarSwitch =()=> {
        if(ts.state.sidebar.status == "show"){
            ts.state.sidebar.status = "hide";
        }else{
            ts.state.sidebar.status = "show";
        }
        
        localStorage.setItem("relax-sidebar", ts.state.sidebar.status);
        ts.sidebarToggle("slide");
    };
    
    this.sidebarToggle =(mode)=>{
        var win = {
            h : parseInt($(window).height())
        };
        
        if(ts.state.sidebar.status == "show"){
            ui.sidebar.btns.$up.hide();
            ui.sidebar.btns.$down.show();
            ui.sidebar.$btn.addClass("active");
                
            ui.sidebar.$area.animate({top: 0}, 500);
            ui.sidebar.$wrap.removeClass("relax-sidebar-roll");
        }else{//hide
            ui.sidebar.btns.$down.hide();
            ui.sidebar.btns.$up.show();
            ui.sidebar.$btn.removeClass("active");
                        
            if(mode == "fast"){
                ui.sidebar.$area.css("top", win.h-35);
            }else if(mode == "slide"){
                ui.sidebar.$area.animate({top: win.h-35}, 500);
            }
            ui.sidebar.$wrap.addClass("relax-sidebar-roll");
        }
    };
    
    this.getThemesList =()=>{
        ts.state.sidebar.list = getInstalledThemes();
        
        for(var k in ts.state.sidebar.list){
            if(!ts.state.sidebar.list[k].isFlixelContent || ts.state.sidebar.list[k].handmade){
                ts.state.sidebar.list[k].thumbImage = getThemeContentThumbImage(ts.state.sidebar.list[k].id, ts.state.sidebar.list[k].downloadedByUser);
            }else{
                ts.state.sidebar.list[k].thumbImage = getFlixelFileThumb(ts.state.sidebar.list[k].id);//ts.state.sidebar.list[k].bgFileThumb || ts.state.sidebar.list[k].bgPoster;
            }
            
            //console.debug(ts.state.sidebar.list[k]); 
        }//for
        
        ts.drawThemesList();
        
    };
    
    this.drawThemesList =()=>{
        if(ts.state.sidebar.fill) return;
        var current = String(localStorage.getItem("background-video-file"));
        
        var $ul = [], n=0;
        
        ts.state.themeDefault = false;
        ts.state.imageDefault = false;
        ts.state.themeId = false;
                
        for(var k in ts.state.sidebar.list){
            //console.debug(current, ts.state.sidebar.list[k].id);
            if(current && current.indexOf(ts.state.sidebar.list[k].id) != -1){
                ts.state.themeDefault =  ts.state.sidebar.list[k].id;
                ts.state.themeId =  ts.state.sidebar.list[k].id;
            }//if
            
            //console.debug(ts.state.sidebar.list[k].bgFilePath);
            
            if(
                ts.state.sidebar.list[k].lastInstallBgVideo
                ||
                (
                    typeof ts.state.sidebar.list[k].bgFilePath == "object"
                    &&
                    Size(ts.state.sidebar.list[k].bgFilePath)
                    /*
                    (
                        ts.state.sidebar.list[k].bgFilePath['1920']
                        ||
                        ts.state.sidebar.list[k].bgFilePath['1280']
                    )
                    */
                )
            ){
                ts.state.sidebar.keys.push(ts.state.sidebar.list[k].id);
                
                var $li = $("<li>").attr("themeId", ts.state.sidebar.list[k].id);

                $li
                    .append(
                        $("<img>")
                            .addClass("thumb-image")
                            //.attr("src", ts.state.sidebar.list[k].thumbImage)
                    )
                    .append(
                        $("<span>")
                            .addClass("thumb-title")
                            .text(ts.state.sidebar.list[k].title)
                    )
                    .append(
                        $("<span>")
                            .addClass("thumb-curt")
                    )
                ;
                
                if(ts.state.sidebar.list[k].thumbImage){
                    $li.find("img").attr("src", ts.state.sidebar.list[k].thumbImage);
                }else{
                    $li.find("img").attr("need-thumb", ts.state.sidebar.list[k].id);
                    BRW_sendMessage({command: "getThumbForUserImage", theme: ts.state.sidebar.list[k]});
                }
                
                if(ts.state.themeDefault && ts.state.themeDefault ==  ts.state.sidebar.list[k].id){
                    $li.addClass("active");
                }

                $ul.push($li);
            }//if
            n++;
        }//for
        
        if(n > 1) ui.sidebar.$shuffle.removeClass("hide");
            
        var $btn = $("<li>").addClass("more-themes-button").text(translate("more_themes_button"));
        
        $ul.push($btn);
        
        ui.sidebar.$list.html($ul);
        
        if(!ts.state.themeDefault){
            
            ts.state.imageDefault = String(localStorage.getItem("background-image-file")).split("/").shift();
            
            //console.debug(ts.state.imageDefault);
        }
    };
};


function setThumbForUserImage(theme_id, url) {
    var $img = $("[need-thumb=" + theme_id + "]");
    if ($img.length) {
        var oldSrc = $img.attr("src");
        if (!oldSrc || String(oldSrc).length < 10) $img.attr("src", url);
    } //if
}


