var Focus;

if(typeof NAVI != "undefined" && typeof onLoadNavi == "object"){
    onLoadNavi.push(onPageLoadFocus);
}else{
    $(function() {
        onPageLoadFocus();
    });
}

function onPageLoadFocus (){
    BRW_langLoaded(function(){
        Focus = new FocusLSP(); 
        Focus.init();
    });
};

function FocusLikeClock(mode, trys){
    if(typeof Focus == "object" && typeof Focus.likeClock == "function"){
        Focus.likeClock(mode);
    }else{
        var trys = trys || 0;
        if(trys < 5){
            setTimeout(function(){
                FocusLikeClock(mode, (trys+1))
            }, 150);
        }
    }
}

function FocusLSP(){
    var ts = this;
    
    var tmp = {
        $set_wrap  : $("#focus-settings-wrap"),
        $page_wrap : $("#focus-newtab"),
    };
    
    var def = {
        show  : true,
        font  : "medium",
        color : "#FFFFFF",
        bg    : {
            show : true,
            opacity: 15,
            min: 0,
            max: 100,
        },
        fonts  : {
            "small"  : 20,
            "medium" : 26,
            "large"  : 38,
            "extrime": 56,
        },
        coord  : {
            top : 80,
            left: 49.7
        }
    };
    
    var ui = {
        "newtab": {
            $wrap  : tmp.$page_wrap,
            $text  : tmp.$page_wrap.find(".focus-text"),
            $font  : tmp.$page_wrap.find(".focus-font"),
            $icon  : tmp.$page_wrap.find(".focus-icon"),
            $line  : tmp.$page_wrap.find(".focus-add, .focus-task"),
            $input : tmp.$page_wrap.find("[name='focus-input']"),
            $status: tmp.$page_wrap.find(".focus-status-text"),
            $corner: tmp.$page_wrap.find(".focus-corner .focus-icon"),
            $header: tmp.$page_wrap.find(".focus-header"),
            $colorBg:tmp.$page_wrap.find(".focus-color-bg"),
            
            button : {
                $check  : tmp.$page_wrap.find(".ico-check"),
                $square : tmp.$page_wrap.find(".ico-square"),
                $cross  : tmp.$page_wrap.find(".ico-cross"),
                $move   : tmp.$page_wrap.find(".ico-move"),
                $settings : tmp.$page_wrap.find(".ico-settings"),
                $checkBox : tmp.$page_wrap.find(".focus-check"),
            },
            
            lines: {
                $add : tmp.$page_wrap.find(".focus-add"),
                $text : tmp.$page_wrap.find(".focus-task"),
                $status : tmp.$page_wrap.find(".focus-status"),
            },
            
            iconSize   : "16px",
            lineHeight : "36px",
        },
        "settings": {
            $wrap  : tmp.$set_wrap,
            $param : tmp.$set_wrap.find("#focus-param"),
            $show  : tmp.$set_wrap.find("[name=focus-show]"),
            $font  : tmp.$set_wrap.find("[name=focus-font]"),
            $color : tmp.$set_wrap.find("[name=focus-color]"),
            $message : tmp.$set_wrap.find("#focus-message"),
            bg : {
                $show : tmp.$set_wrap.find("[name=focus-bg-show]"),
                $opWrap : tmp.$set_wrap.find("#focus-bg-opacity-wrap"),
                $opSlide: tmp.$set_wrap.find("#focus-bg-opacity"),                
                $opLabel: tmp.$set_wrap.find("#focus-bg-opacity-value"),                
            }
        }
    };
    
    this.state = {
        current : false,
        message : localStorage.getItem("focus-message") || false,
        messageDef : translate("focus_question"),
        prevVal : false,
        timeout : false,
    };
    
    this.coord = {
        store : false
    };
    
    this.init =()=> {
        //console.info("Focus init:", ts.mode());
        
        if(ts.mode() == "settings"){
            ts.settingsDraw();
            ui.settings.$show.trigger("change"); // New Settings
            ui.settings.bg.$show.trigger("change"); // New Settings
            
            ts.settingsActions();
        }
        else
        if(ts.mode() == "newtab"){
            ts.newtabInit();
        }
    };
    
    this.hider =(mode)=> {
        if([true, "start"].indexOf(mode) != -1){
            ui.newtab.$wrap.addClass("hide");
        }
        else
        if([false, "stop"].indexOf(mode) != -1){
            ui.newtab.$wrap.removeClass("hide");
        }
    };
    
    this.newtabInit =()=> {
        if(ts.getShow() != true){
            ui.newtab.$wrap.remove();
            return false;
        }
        
        var color = ts.getColor();
        ts.state.size  = parseInt(ts.getFont(true));
        
        //ui.newtab.iconSize = Math.floor(ts.state.size / 1.7) + "px";
        ui.newtab.lineHeight = String(ts.state.size) + "px";
        
        var icoMargin = String((parseInt(ui.newtab.lineHeight) - parseInt(ui.newtab.iconSize)) / 2) + "px";
        
        if(ts.getBg()){
            ui.newtab.$wrap.css({
                "background" :
                "rgba(0,0,0, "+(ts.getBgOpacity() / 100 )+")"
            });
            
            /*
            ui.newtab.$status.css({
                "background" :
                "rgba(0,0,0, "+(ts.getBgOpacity() / 100 )+")"
            });
            */
        }
        
        ui.newtab.$font.css({
            "color" : color,
            "font-size" : ts.state.size + "px"
        });
        
        ui.newtab.$header.css({
            "font-size" : (ts.state.size - 6) + "px"
        });
        
        ui.newtab.$input.css({
            "border-bottom-color" : color
        });
        
        $("input[placeholder]").css({
            "color" : color
        });
        
        ui.newtab.$colorBg.css({
            "background-color" : color
        });
        
        $("head")
            .append($("<style>").text("[name='focus-input']::-webkit-input-placeholder{color:"+color+";}"))
            .append($("<style>").text("[name='focus-input']::-moz-placeholder{color:"+color+"; opacity:1!important;}"))
        ;
                
        ui.newtab.$status.css({
            "font-size" : Math.floor(ts.state.size / 1.7) + "px"
        });
        ui.newtab.$wrap.css({
            "padding-bottom": Math.floor(ts.state.size / 1.7) + "px"
        });
        
        ui.newtab.$icon.css({
            //"color" : color,
            //"font-size" : String(2*Math.floor((ts.state.size-3)/2)) + "px",
            //"line-height" : ts.state.size + "px"
            
            width  : ui.newtab.iconSize,
            height : ui.newtab.iconSize,
            "font-size" : ui.newtab.iconSize,
            margin : icoMargin,
            
        });
        
        ui.newtab.button.$checkBox.css({
            width  : ui.newtab.iconSize,
            height : ui.newtab.iconSize,
            margin : icoMargin,
        });
        
        ui.newtab.$corner.css({
            width  : parseInt(ui.newtab.iconSize) + 10,
            height : parseInt(ui.newtab.iconSize) + 10,
            "font-size" : parseInt(ui.newtab.iconSize) + 3,
            margin : "0 0 0 0",
        });
        
        ui.newtab.$line.css({
            "min-height" : ts.state.size
        });
        
        
        //ui.newtab.$wrap.delay(800).removeClass("hide").fadeIn(2100);
        switch(ts.getFont()){
            case "large":
                ui.newtab.$input.css({
                    "width" : "610px"
                });
                ui.newtab.$wrap.css({
                    "min-height" : "140px"
                });
                ui.newtab.$status.css({
                    "top" : "-10px"
                });
            break;
                
            case "extrime":
                ui.newtab.$input.css({
                    "width" : "910px"
                });
                ui.newtab.$wrap.css({
                    "min-height" : "195px"
                });
                ui.newtab.$status.css({
                    "top" : "-20px"
                });
            break;
        }
        
        if(ts.state.message){
            ui.newtab.$input.attr("placeholder", ts.state.message);
        }else{
            ui.newtab.$input.attr("placeholder", ts.state.messageDef);
        }
        
        ts.newtabHandlers();
        ts.draggable();
        ts.printFocus();
        ts.setStatus("load");
    };
    
    this.likeClock =(status)=> {
        //console.info("likeClock", status);
        
        if(status == "show"){
            if(ui.newtab.$wrap.hasClass("hide")) ui.newtab.$wrap.removeClass("hide").delay(210).fadeIn(2100);
            else ui.newtab.$wrap.fadeIn(950);
            
            ts.align();
            ts.align();
            
            /*
            var counter = 0;
            var aligns = setInterval(()=>{
                ts.align();
                //console.debug("align", counter);
                if(++counter > 20) clearInterval(aligns);
            }, 50);
            */
        }else{
            ui.newtab.$wrap.fadeOut(350);
        }
    };
    
    this.align =()=> {
        ts.coordinates(true);
        
        //console.debug(ts.coord);
        
        ui.newtab.$wrap.css({
            top : ts.coord.abs.top,
            left: ts.coord.abs.left,
            //"max-width": ts.coord.win.w - 30
        });
        
        ui.newtab.$wrap.css({"height" : "auto"});
        ui.newtab.$line.css({"max-height" : ts.coord.win.h - 100});
        
        /*
        ui.newtab.$text.css({
            "max-width" : (ts.coord.win.w - 80) + "px"
        });
        */
    };
    
    this.coordinates =(safe, read)=> {
        ts.getCoord();
        
        ui.newtab.$text.css({
            "max-width" : "none",
            "white-space" : "nowrap"
        });
        
        ts.coord.win = {
            w : parseInt($(window).width()),
            h : parseInt($(window).height())
        };
        
        ts.coord.el = {
            w : parseInt(ui.newtab.$wrap.width())
        };        
        if(true){
            if(ts.coord.el.w > (ts.coord.win.w - 170)){
                ts.coord.el.w = ts.coord.win.w - 170;
                
                ui.newtab.$text.css({
                    "max-width" : ts.coord.el.w,
                    "white-space" : "normal"
                });
            }
        }
        
        ts.coord.el.h = parseInt(ui.newtab.$wrap.height());
        
        if(read == "read"){
            ts.coord.pos = {
                top  : Math.ceil(1e8 * ((parseInt(ui.newtab.$wrap.css("top") ) + (ts.coord.el.h / 2)) / ts.coord.win.h)) / 1e6,
                left : Math.ceil(1e8 * ((parseInt(ui.newtab.$wrap.css("left")) + (ts.coord.el.w / 2)) / ts.coord.win.w)) / 1e6,
            };
        }else{
            if(ts.coord.store){
                //console.info("Store", ts.coord.store);
                ts.coord.pos = ts.coord.store;
            }else{
                ts.coord.pos = def.coord;
            }
        }
        
        ts.coord.abs = {
            top  : ((ts.coord.win.h * ts.coord.pos.top  / 100) - (ts.coord.el.h / 2)),
            left : ((ts.coord.win.w * ts.coord.pos.left / 100) - (ts.coord.el.w / 2)),
        };
        
        if(safe){
            ts.coord.abs.top = Math.max(0, ts.coord.abs.top);
            ts.coord.abs.top = Math.min((ts.coord.win.h - ts.coord.el.h), ts.coord.abs.top);
            
            ts.coord.abs.left = Math.max(0, ts.coord.abs.left);
            ts.coord.abs.left = Math.min((ts.coord.win.w - ts.coord.el.w), ts.coord.abs.left);
        }
        
        return ts.coord;
    };
    
    this.getCoord =()=> {
        var data = localStorage.getItem("focus-coord");
        
        if(data) ts.coord.store = JSON.parse(data);
        else ts.coord.store = false;
        
        return ts.coord.store;
    };    
    
    this.setCoord =(align)=> {
        ts.coordinates(true, "read");
        localStorage.setItem("focus-coord", JSON.stringify(ts.coord.pos));
        
        if(align == "align") ts.align();
        
        return ts.getCoord();
    };
    
    this.setStatus =(type)=> {
        var states = String(translate("focus_status_"+type)).split('|');
        status = String(states[Math.floor(Math.random() * states.length)]).trim();
        
        ui.newtab.$status
            .stop(true, true).hide()
            .text(status)
            .fadeIn(450)
            .delay(1000)
            .fadeOut(1100)
        ;
        
        ui.newtab.$wrap.css({"width":"auto"});
    };
    
    this.printFocus =()=> {
        ts.getList((list) => {
            if(list && list.length){
                var Now = Date.now();
                var Limit = Now - 24 * 60 * 60 * 1000; // 1 day
                
                for(var key in list){
                    if(parseInt(list[key].time) > Limit){
                        ts.state.current = list[key];
                        ts.state.current.time = parseInt(ts.state.current.time);
                        break;
                    }//if
                }//for
                
                if(ts.state.current) {
                    ui.newtab.$text.text(ts.state.current.focus);
                    ts.focusMode(true, ts.state.current.done);
                }else{
                    ts.focusMode(false);
                }
            }else{
                ts.focusMode(false);
            }
            
        });
    };
                         
    this.focusMode =(mode, done)=> {
        //console.info("focusMode", mode);
        if(mode == true){
            ui.newtab.lines.$add.stop(true,true).fadeOut(500, ()=>{
                ts.align();
            });
            
            ui.newtab.lines.$text.stop(true,true).delay(500).fadeIn(150, ()=>{
                //console.info("focusMode", {"opacity":1});
                ui.newtab.lines.$text.css({"opacity":1});
                ts.align();
            });
            
            ui.newtab.$header.addClass("focus-header-active");
        }else{
            //ui.newtab.lines.$status.fadeOut();
            ui.newtab.lines.$text.stop(true,true).fadeOut(500, ()=>{
                ui.newtab.lines.$add.fadeIn();
                
                ui.newtab.$input.val('');
                
                setTimeout(function(){
                    //ui.newtab.$input.focus();
                    ts.align();
                }, 350);
                ts.align();
            });
            
            ui.newtab.$header.removeClass("focus-header-active");
        }//else
        
        if(done != "skip"){
            if(typeof done != "undefined" && parseInt(done) == 1){
                ui.newtab.$text.addClass("focus-done");
                ui.newtab.button.$check.show(150);
                ui.newtab.button.$cross.removeClass("cross-remove").addClass("cross-add").attr("title", translate("focus_hint_add"));
            }else{
                ui.newtab.$text.removeClass("focus-done");
                ui.newtab.button.$check.hide(150);
                ui.newtab.button.$cross.removeClass("cross-add").addClass("cross-remove").attr("title", translate("focus_hint_remove"));
            }
        }
    };
    
    this.crossButton =()=> {
        if(ui.newtab.button.$cross.hasClass("cross-add")){//add
            ts.focusMode(false, "skip");
            ts.setStatus("new");
        }else{//remove
            var list;
            ts.getList((list) => {                
                for(var key in list){
                    if(parseInt(list[key].time) == parseInt(ts.state.current.time)){
                        list.splice(key, 1);
                        break;
                    }//if
                }//for
                
                ui.newtab.lines.$text.stop(true,true).fadeOut(350, ()=>{
                    ts.setFocus(list, (saved)=>{
                        ts.printFocus();
                        if(typeof callback == "function") callback(saved);
                    });
                    
                    ts.setStatus("load");
                });
                
            });
            
        }
    };
    
    this.toggleDone =(done, callback)=> {
        if(!ts.state.current) return false;
        
        if(typeof done == "undefined" || done == "auto"){
            var done = parseInt(ts.state.current.done);
            done = (done == 1 ? 0 : 1);
            
            if(done) ts.setStatus("done");
            else ts.setStatus("save");
            
        }
        
        ts.getList((list) => {
            for(var key in list){
                if(parseInt(list[key].time) == parseInt(ts.state.current.time)){
                    list[key].done = done;
                    break;
                }//if
            }//for
            
            ts.setFocus(list, (saved)=>{
                ts.printFocus();
                if(callback) callback(saved);
            });
        });
    };
    
    this.addFocus =(focusText)=> {
        var focus = String(focusText);
        
        if(!focus || focus.length == 0 || focus == ts.state.prevVal) return;
                
        ts.state.prevVal = focus;
        clearTimeout(ts.state.timeout);
        ts.state.timeout = setTimeout(()=>{
            ts.state.prevVal = false;
        }, 5000);
        
        ts.getList((list) => {
            list.unshift({
                "focus" : focus,
                "done"  : 0,
                "date"  : new Date().toString(),
                "time"  : Date.now()
            });
            
            ts.setFocus(list, (saved)=>{
                ts.printFocus();
            });
            
            ts.setStatus("save");
        });
    };
    
    this.setFocus =(list, callback)=> {
        if(typeof list != "string") list = JSON.stringify(list);
        
        setSettingsValue("user-focus", list, (saved)=>{
            if(callback) callback(saved);
        });
    };
    
    this.getList =(callback)=> {
        getSettingsValue("user-focus", false, (data)=>{
            var list = [];
            
            try{
                list = JSON.parse(data || "[]");
            }catch(ex){
                //console.warn(ex);
            }
            
            list = list.slice(0, 19);
            
            if(callback) callback(list);
        });
    };
    
    this.newtabHandlers =()=> {
        ui.newtab.button.$checkBox.unbind("click").on("click", (event)=>{
            ts.toggleDone();
        });
        
        ui.newtab.button.$cross.unbind("click").on("click", (event)=>{
            ts.crossButton();
        });
        
        ui.newtab.button.$settings.unbind("click").on("click", (event)=>{
            if(ui.newtab.$wrap.hasClass("dragging")) return;
            
            openUrlInNewTab(
                extensionGetUrl("/pages/options/settings.html#navi-settings-focus")
            );
        });
        
        ui.newtab.$input.on("focus", (event)=>{
            if(ui.newtab.$input.attr("placeholder")){
                ui.newtab.$input.attr("hidden-placeholder", ui.newtab.$input.attr("placeholder"));
                ui.newtab.$input.attr("placeholder", "");
            }
        });
        
        ui.newtab.$input.on("focusout", (event)=>{
            if(ui.newtab.$input.attr("hidden-placeholder")){
                ui.newtab.$input.attr("placeholder", ui.newtab.$input.attr("hidden-placeholder"));
            }
            
            if(ui.newtab.$input.val()){
                //console.debug("focus focusout");
                ts.checkInputAddFocus();
            }
        });
                
        ui.newtab.$input.unbind("keypress").on("keypress", (event)=>{
            if(event.keyCode == 13){
                //console.debug("focus keypress 13");
                ts.checkInputAddFocus();
            }//if
        });
        
        window.addEventListener("beforeunload", function (e) {
            //console.debug("focus beforeunload");
            ts.checkInputAddFocus();
        });
                
        ui.newtab.$text.on("dblclick", (event)=>{
            ts.toggleDone();
        });
        
        onWindowResizeFunctions["focus"] = function(event){
            ts.align();
        };
    };
    
    this.checkInputAddFocus =()=> {
        var val = String(ui.newtab.$input.val()).trim();
        if(val) ts.addFocus(val);
    };
    
    this.draggable =()=> {
        ui.newtab.$wrap.draggable({
            move: ui.newtab.button.$move, 
            containment: "#background-borders", 
            scroll: false,
            delay : 150,
            start: function( event, interface ) {
                ui.newtab.$wrap.addClass("dragging");
            },
            stop : function(event, interface) {
                ts.setCoord("align");
                
                setTimeout(()=>{
                    ui.newtab.$wrap.removeClass("dragging");
                }, 75);
            }
        });
    };
    
    this.settingsActions =()=> {
        ui.settings.$font.on("change", ()=>{
            ts.setFont(ui.settings.$font.val());
        });
        
        ui.settings.$show.on("change", ()=>{
            ts.setShow(ui.settings.$show.prop("checked"));
            ts.settingsDraw(true);
        });
        
        ui.settings.bg.$show.on("change", ()=>{
            ts.setBg(ui.settings.bg.$show.prop("checked"));
            ts.settingsDraw(true);
        });
        
        ui.settings.$message.on("change", ()=>{
            ts.setMessage();
        });
        
        ts.bgOpacity();
    };
    
    this.settingsDraw =(redraw)=> {
        ui.settings.$font.val(ts.getFont());
        ui.settings.$show.prop("checked", ts.getShow());
        ui.settings.bg.$show.prop("checked", ts.getBg());
        
        /* // OLD Settings
        if(ts.getShow()){
            ui.settings.$param.removeClass("hide");
            
            if(!redraw) ui.settings.$param.show();
            else ui.settings.$param.slideDown();
        }else{
            if(!redraw) ui.settings.$param.hide();
            else ui.settings.$param.slideUp();
        }//else
        
        if(ts.getBg()){
            if(!redraw) ui.settings.bg.$opWrap.show();
            else ui.settings.bg.$opWrap.slideDown();
        }else{
            if(!redraw) ui.settings.bg.$opWrap.hide();
            else ui.settings.bg.$opWrap.slideUp();
        }
        */
        
        if(!redraw){
            var color = ts.getColor();
            ui.settings.$color.
                val(color).
                css('border-color', color).
                colpick({
                    layout:'hex',
                    submit:0,
                    //colorScheme:'dark',
                    color: color.substr(1),
                    onChange:function(hsb,hex,rgb,el,bySetColor) {
                        hex = '#' + hex.toUpperCase();
                        
                        ui.settings.$color.css('border-color', hex);
                        
                        if(!bySetColor) ui.settings.$color.val(hex);
                        
                        setTimeout(function() {
                            ts.setColor(hex);
                        }, 50);
                    },
                    onHide: function() {
                        ts.reloadNewTab();
                    }
                }).keyup(function(){
                    //console.info(this.value);
                })
            ;
            
            if(ts.state.message) ui.settings.$message.val(ts.state.message);
            
        }
    };
    
    this.setMessage =()=> {
        var message = String(ui.settings.$message.val()).substr(0, 500);
        localStorage.setItem("focus-message", message);
        ts.state.message = message;
        ts.reloadNewTab();
    };
    
    this.getBg =()=> {
        var show = localStorage.getItem("focus-bg-show");
        return show !== null ? Bool(show) : def.bg.show;
    };   
    
    this.setBg =(show)=> {
        localStorage.setItem("focus-bg-show", String(Bool(show)));
        ts.reloadNewTab();
        return ts.getShow();
    };  
    
    this.getBgOpacity =()=> {
        return 1 * (localStorage.getItem("focus-bg-opacity") || def.bg.opacity);
    };  
    
    this.bgOpacity =()=> {
        var current = ts.getBgOpacity();
        ui.settings.bg.$opLabel.text(current + "%");
        
        ui.settings.bg.$opSlide.slider({
            range: "min",
            value: current,
            min: def.bg.min,
            max: def.bg.max,
            slide: function( event, slide ) {
                ui.settings.bg.$opLabel.text(slide.value + "%");
            },
            stop: function( event, slide ) {
                localStorage.setItem("focus-bg-opacity", slide.value);
                ts.reloadNewTab();
            }
        });
    };
    
    this.getShow =()=> {
        var show = localStorage.getItem("focus-show");
        return show !== null ? Bool(show) : def.show;
    };   
    
    this.setShow =(show, mode)=> {
        localStorage.setItem("focus-show", String(Bool(show)));
        if(!mode || mode != "passive" )ts.reloadNewTab();
        return ts.getShow();
    };
    
    this.getColor =()=> {
        return localStorage.getItem("focus-font-color") || def.color;
    };   
    
    this.setColor =(color)=> {
        localStorage.setItem("focus-font-color", color || def.color);
        return ts.getColor();
    };
    
    this.getFont =(int)=> {
        var font = localStorage.getItem("focus-font-size") || "undefined";
        if(typeof def.fonts[font] == "undefined") font = def.font;
        
        if(int) return def.fonts[font];
        else return font;
    };   
    
    this.setFont =(font)=> {
        var set_font = false;
        
        if(typeof def.fonts[font] != "undefined") set_font = font;
        else{
            font = parseInt(font);
            for(var key in def.fonts) if(font == def.fonts[key]) set_font = key;
        }//else
        
        localStorage.setItem("focus-font-size", set_font || def.font);
        
        ts.reloadNewTab();
        
        //console.info("font", set_font);
        
        return ts.getFont();
    };
    
    this.mode =()=> {
        var loc = String(document.location.pathname);
        
        if(loc.indexOf("newtab") != -1) return "newtab";
        else if(loc.indexOf("settings") != -1) return "settings";
        else return false;
    };
    
    this.reloadNewTab =()=> {
        if(!tmp.pendingReload){
            tmp.pendingReload = true;
            
            
            setTimeout(()=>{
                tmp.pendingReload = false;
                getNetTabPages(reloadTabPages);
            }, 150);
        }
    };
    
    
    //выбор цвета - или палитру или просто надор 6ти разных чтобы под разные обои можно было подстраивать и Font Size селект и там Small / Medium/ Large
};
    