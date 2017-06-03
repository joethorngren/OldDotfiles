var PickURL, Preview;

$(function(){
    PickURL = new URLPicker(); PickURL.init();
    Preview = new CustomPreview(); Preview.init();
    
});

function CustomPreview(){
    var ts = this;
    
    var CACHE = {}, TMP = {}, ONCE = [];
    
    var vars = {
        $wrap  : $("#add-new-dial-dialog"),
        API    : "http://everhelper.me/sdpreviews/",
        order  : "rating",
        services : {
            "Google Images" : "http://www.google.com/search?hl=en&site=imghp&tbm=isch&source=hp&q={name}",
            "Icon Finder"   : "https://www.iconfinder.com/search/?q={name}+icon",
            "Find Icons"    : "http://findicons.com/search/{name}",
            "Icon Archive"  : "http://www.iconarchive.com/search?q={name}",
            "Icons Pedia"   : "http://www.iconspedia.com/search/{name}/",
        },
        scheme : setTilesColorSchemes(),
        whiteList : [],
    };
    
    var ui = {
        $wrap   : vars.$wrap,
        $header : vars.$wrap.find("#add-new-dial-dialog-title"),
        $input  : vars.$wrap.find("#newDialUrl"),
        $title  : vars.$wrap.find("#newDialTitle"),
        $prevWrap : vars.$wrap.find(".dial-previews-wrap"),  
        $prevList : vars.$wrap.find(".dial-previews-wrap .previews-list"),  
        $prevScroll : vars.$wrap.find(".dial-previews-wrap .previews-list-wrap"),  
        $moreWrap   : vars.$wrap.find(".previews-more"),  
        $moreBtn    : vars.$wrap.find("#previews-more-button"),
        $moreBack   : vars.$wrap.find("#preview-back"),
        $orderBest  : vars.$wrap.find(".previews-order-best"),
        $orderNew   : vars.$wrap.find(".previews-order-new"),
        $prevMode   : vars.$wrap.find("[name='preview-mode']"),
        $autoType   : vars.$wrap.find(".auto_type_title"),
        $localBlock : vars.$wrap.find(".local-image-block"),
        $colorScheme: vars.$wrap.find(".choose-color-scheme"),
        $schemeList : vars.$wrap.find(".schemes-list"),  
        example   : {
            $wrap   : vars.$wrap.find(".dial-example-wrap"),
            $icon   : vars.$wrap.find(".dial-example-wrap .dialex-icon"),
            $title  : vars.$wrap.find(".dial-example-wrap .dialex-title"),
            $image  : vars.$wrap.find(".dial-example-wrap .dialex-image"),
            $domain : vars.$wrap.find(".dial-example-wrap .dialex-domain"),
            $zone   : vars.$wrap.find(".dial-example-wrap .dialex-zone"),
        },
        load   : {
            $input  : vars.$wrap.find("#newImageUrl"),
            $file   : vars.$wrap.find("#upload-image-file"),
        },
    };
    
    this.state = {
        host  : false,
        image : false,
        wide  : false,
        order : vars.order,
        page  : 0,
        mode  : "auto",
        preview: false,
        printedPreviews : [],
        autoRepeat : 0,
        checkPending: false
    };
    
    this.init =()=> {
        ts.enabled = getCustomPreviewsMode();
        //if(ts.enabled) 
        ts.listeners();
        
        getNewSpeedDialThumbType((type)=>{
            var title;
            
            if(type == 1) title = translate("options_speed_dial_generate_type_text");
            else
            if(type == 2) title = translate("options_speed_dial_generate_type_gallery_text");
            else
            if(type == 3) title = translate("options_speed_dial_generate_type_autopreview_text");
            else
            if(type == 4) title = translate("options_speed_dial_generate_type_gallery_autopreview_text");
            
            //console.info(type, title);
            
            ui.$autoType.attr("title", title);
        });
        
        if(!getCustomPreviewsMode()) ts.prevModeStatus("enabled");
    };
    
    this.getImage =()=> {
        if(ts.state.mode == "auto") return false;
        else{
            //console.debug(ts.state.preview);
            return ts.state.preview;
        }
    };
    
    
    this.listeners =()=> {
        ui.$input.on("change", (event)=>{
            ts.checkInputPending();
        });
        
        ui.$input.on("keyup", (event)=>{
            ts.checkInputPending();
        });
        
         ui.$input.on("click", (event)=>{
            ts.checkInputPending();
        });
        
        ui.$title.on("change", (event)=>{
            ts.checkTitle();
        });
        
        ui.$title.on("keyup", (event)=>{
            ts.checkTitle();
        });
        
        ui.load.$input.on("change", (event)=>{
            ts.loadImageFromURL();
        });
        
        ui.load.$file.on("change", (event)=>{
            ts.loadImageFromFile();
        });
        
        ui.$moreBtn.on("click", (event)=>{
            ts.showMoreMode(true);
            ui.$prevScroll.mCustomScrollbar("scrollTo", 0, {scrollInertia:0});
        });
        
        ui.$moreBack.on("click", (event)=>{
            ts.showMoreMode(false);
            //ui.$prevScroll.mCustomScrollbar("scrollTo", 0);
        });
        
        ui.$orderBest.on("click", (event)=>{
            ui.$orderBest.addClass("active");
            ui.$orderNew.removeClass("active");
            ts.setOrder("rating");
        });
        
        ui.$orderNew.on("click", (event)=>{
            ui.$orderNew.addClass("active");
            ui.$orderBest.removeClass("active");
            ts.setOrder("new");
        });
        
        ui.$prevMode.on("click", (event)=>{
            ts.setMode($(event.currentTarget).val(), true);
        });
        
        ui.$colorScheme.on("click", (event)=>{
            ts.showColorSchemes();
        });
        
        ui.$prevList.on("mousedown", "li", (event)=>{
            //console.info(event);
            var id = $(event.currentTarget).attr("prevId");
            
            if($(event.originalEvent.target).hasClass("violation")){
                ts.violationReport(id, $(event.currentTarget));
            }else{
                if(id){
                    if(!$(event.currentTarget).hasClass("inappropriate")){
                        
                        ts.previewSelect(id, $(event.currentTarget));
                    }
                }
                
            }//else
            
        });   
        
        ui.$schemeList.on("click", ".dial-example", (event)=>{
            var id = $(event.currentTarget).attr("schemeId");
            
            if([null, undefined].indexOf(id) == -1){
                ts.setColorScheme(id);
            }
        });        
    };
    
    this.checkInputPending =()=> {
        clearTimeout(ts.state.checkPending);
        
        ts.state.checkPending = setTimeout(()=>{
            ts.checkInput('soft');
        }, 350);
    };
    
    this.violationReport =(id, $el)=> {
        var $li = $el, id = id;
        
        $li.addClass("inappropriate").append(
            $("<div>")
                .addClass("vi-curtain")
                .append(
                    $("<div>")
                        .addClass("vi-button btn btn-warning")
                        .text(translate("preview_violation_button"))
                        .on("click", ()=>{
                            $li.find(".vi-curtain")
                                .html("")
                                .addClass("violationed-fade")
                                .text(translate("preview_violation_status"))
                                .animate({"color":"transparent"}, 5000);
                            
                            if(ts.state.image.id == id){
                                ts.previewSelect(id, $li);
                            }
                            
                            ts.violationReportSend(id);
                        })
                )
                .append(
                    $("<span>")
                        .addClass("vi-close")
                        .on("click", ()=>{
                            $li.removeClass("inappropriate")
                                .find(".vi-curtain").remove()
                        })
                )
        );  
        
    };
    
    this.violationReportSend =(id)=>{
        //https://everhelper.me/sdpreviews/report.php?sdpreview_id=498430&type=inappropriate
        
        ts.GET({
            service: "report.php",
            param  : {
                sdpreview_id : id,
                type : "inappropriate"
            },
            success: (data, param)=>{                
                //console.info(data);
            },
            error: (err)=>{
                console.warn("Can't get:", err);
            }
        });
    };
    
    this.setMode =(mode, force)=> {
        if(ts.state.mode != mode || force){
            ts.state.mode = mode;

            $("[name='preview-mode'][value="+mode+"]").prop("checked", true);
            
            ui.$wrap.removeClass("withColorScheme");

            if(mode == "auto"){
                ts.reset();
                if(ts.state.scheme) ui.example.$image.addClass("dialex-image-text");
                ui.$localBlock.addClass("hide");
                ui.$colorScheme.addClass("hide");
            }else if(mode == "custom"){
                ui.$localBlock.removeClass("hide");
                ui.$wrap.addClass("manualPreviewsMode");
                ts.clearHostData();  // ????
                ts.checkInput('soft');
                //ts.checkInput();
                ui.$colorScheme.addClass("hide");
            }else if(mode == "text"){
                ts.reset('soft');
                ui.$localBlock.addClass("hide");
                ui.$colorScheme.removeClass("hide");
                
                if(ts.state.scheme){
                    ui.$wrap.addClass("withColorScheme");
                    ui.example.$image.addClass("dialex-image-text");
                }else{
                    ts.noEmptyColorScheme();
                }
                
                
                /*
                if(ts.state.host){
                    ts.checkTitle(ts.state.host);
                    ts.checkFavicon();
                }
                */
                
                ts.checkInput();
            }
        }
        
        return ts.state.mode;
    };
    
    
    
    this.reset =(mode)=> {
        ts.state.host = false;
        ts.setExampleImage(false);
        ts.showMoreMode(false);
        ts.setOrder("rating");
        ts.checkTitle();
        ts.sidePreviewsUI("hide");
        ts.checkFavicon();
        ui.$wrap.removeClass("manualPreviewsMode");
        
        if(mode == "hard"){
            ui.$localBlock.addClass("hide");
            ui.$colorScheme.addClass("hide");
            ui.$colorScheme.text(translate("choose_color_scheme"));
            ui.$wrap.removeClass("withColorScheme");
            ts.state.scheme = false;
            ts.setMode("auto");
            ts.clearHostData();
            ui.load.$input.val('');
        }
    };
    
    this.clearHostData =()=> {
        ts.state.hostCom = false;
        ts.state.tryHostCom = false;
        ts.state.printedPreviews = [];
    };
    
    this.loadImageFromURL =(url)=>{
        if(!url) var url = String(ui.load.$input.val());
        
        if(
            !url || !url.length
            || url.indexOf("://") == -1
        ){
            ts.setExampleImage(false);
        }else{
            ts.setExampleImage(url, "url");
        }
    };
        
    this.loadImageFromFile =()=>{
        ts.setExampleImage("loading");
        
        setTimeout(()=>{
            ui.load.$file.val('');
        }, 1000);
        
        try{
            
            var file = ui.load.$file[0].files[0];
            
            //console.info(file.size);
            
            if(file.size > 524288){//512KB
                dialogConfirm({
                    title   : translate("preview_maxsize_title"), 
                    message : translate("preview_maxsize_text"), 
                    confirmTxt:"OK", 
                    cancelHide:true
                });
                
                ts.setExampleImage(false);
                
                return;
            }
            
            var start = 0, stop = file.size - 1;

            var ext = String(file.name).toLocaleLowerCase().split('#').shift().split('?').shift().split('.').pop();

            var reader = new FileReader();

            reader.onloadend = function (evt) {
                if (evt.target.readyState == FileReader.DONE) { // DONE == 2
                    //console.log(['Read bytes: ', start + 1, ' - ', stop + 1, ' of ', file.size, ' byte file'].join(''));
                    var bin = evt.target.result;
                    ts.setExampleImage(evt.target.result, "base64");
                }
            };

            var blob = file.slice(start, stop + 1);
            reader.readAsDataURL(blob);
            //reader.readAsBinaryString(blob);
            
            ui.example.$image.removeClass("dialex-image-text");
        }catch(ex){
            console.warn("Can't load local file: ", ex);
        }
    };
    
    this.setExampleImage =(image, mode, handly)=> {
        //console.debug("setExampleImage", image);
        //console.trace();
        
        ts.state.preview = false;
        
        
        if(typeof image != "undefined" && image == "loading"){
            ui.$wrap.addClass("withExample");
            ui.example.$image.addClass("dialex-loading");
        }else{
            ui.example.$image.removeClass("dialex-loading"); 
            
            ui.example.$image.css(
                "background-image", 
                image ? "url("+image+")" : "none"
            );
            
            
            if(image){
                ts.state.preview = {
                    image: image,
                    type : mode
                };
                
                ts.setMode("custom");
                ui.$wrap.addClass("withExample");
                ui.example.$image.removeClass("dialex-image-text");// Task #544
            }
            else{
                ts.state.preview = false;
                
                ui.$wrap.removeClass("withExample");
                
                //if(ts.state.mode == "custom") ts.setMode("auto");
            }
            
            //console.debug(ui.example.$image);
        }
        
    };
    
    this.setOrder =(order)=>{
        if(order != ts.state.order){
            ts.clearHostData();
            
            ts.state.page = 0;
            ts.state.order = order;
            ts.getPreview(ts.state.host);
        }
    };
    
    this.loadMorePreviews =()=>{
        if
            (ts.state.page < (ts.state.totalPages - 1)
            ||
            ts.state.hostCom
        ){
            ts.getPreview(ts.state.host, (ts.state.page + 1));
        }else{
            ts.findMoreIcons(true);
        }
    };
    
    this.findMoreIcons =(add)=>{
        //console.debug("findMoreIcons", add);
        
        ui.$prevList.find(".find-icons").remove();
        
        if(!add) return;
        
        var name = String(ts.state.host).split('://').pop().toLowerCase().replace('wwwww.','').replace('wwww.','').replace('www.','').split('.').shift();
        //console.info(ts.state.host, name);
        var $block = $("<span>");
        $block.addClass("find-icons")
            .append(
                $("<span>").addClass("find-icons-title")
                .text(translate("dialog_pick_user_pics_not_found_title").replace('{host}', ts.state.host))
            )
        ;
        
        var appended = false;
        for(var key in vars.services){
            if(appended) $block.append($("<i>").text(', '));
            else appended = true;
            
            $block.append(
                $("<a>").attr("target","_blank")
                    .text(key)
                    .attr("href", vars.services[key].replace('{name}', name))
            );
            
        }//for
        
        $block.append(
            $("<span>").addClass("find-icons-footer")
                .text(translate("dialog_pick_user_pics_not_found_enter_in"))
        );
            
        $block.append(
            $("<img>")
                .attr("src", "/pages/newtab/img/common/local-preview.png")
                .on("click", (event)=>{
                    ts.showMoreMode(false);
                    ts.setMode("custom");
                })
        );
        
        ui.$prevList.append($block);
    };
    
    this.showMoreMode =(wide)=> {
        //console.debug(wide);
        
        if(wide == true){
            ts.state.wide = true;
            ui.$wrap.addClass("showMoreMode");
            ui.$header.text(translate("add_new_dial_dialog_preview_title"));
            
            if(ts.state.totalPages == 1){
                if(ts.state.hostCom && !ts.state.tryHostCom){
                    ts.loadMorePreviews();
                }else{
                    ts.findMoreIcons(true);
                }
            }
        }else{
            ts.state.wide = false;
            ts.findMoreIcons(false);
            ui.$wrap.removeClass("showMoreMode addDialColorSchemes");
            ui.$header.text(translate("add_new_dial_dialog_title"));
        }
        
        //ui.$prevScroll.mCustomScrollbar("scrollTo", 0);
    };
    
    this.previewSelect =(imageId, $el)=> {
        var $li = $el;
        
        clearTimeout(ts.state.checkPending);
        ui.$prevList.find(".prevCheckBox").remove();
        ui.example.$image.removeClass("dialex-image-text");
        
        if(!ts.state.image || ts.state.image.id != imageId){
            ts.state.image = {
                id : imageId,
                src : $li.find(".previewImage").attr("src")
            };
            
            if(ts.state.wide) ts.showMoreMode(false);
            
            setTimeout(()=>{
                ts.setExampleImage(ts.state.image.src, "url");
                
                /*$li*/
                ui.$prevList.find("[prevId="+ts.state.image.id+"] .previewImage")
                .append(
                    $("<span>")
                        .addClass("prevCheckBox")
                );
            }, 150);
        }else if(ts.state.image.id == imageId){
            ts.state.image = false;
            ts.state.preview = false;
            
            ui.$wrap.removeClass("withExample");
                        
            /*
            if(ts.state.scheme){
                ui.example.$image.addClass("dialex-image-text");
                ts.setMode("text");
            }else{
                ui.$wrap.removeClass("withExample");
                //ts.setMode("auto");
            }
            */
        }
    };
    
    this.checkInput =(mode)=> {
        //if(!ts.enabled) return;
        
        if(!mode || mode != 'soft'){
            ts.reset();
            ts.clearHostData();
        }
        
        //if(ts.state.mode) ts.setMode(ts.state.mode, true);
        
        var url = ui.$input.val();
        
        try{
            var host = String(getUrlHost(url));
    
            if(host.indexOf(' ') > -1) {
                ts.previewBreak("wrong host", host);
                
                if(url.indexOf('://')) ts.prevModeStatus("enabled");
                
                var forceHost = host.replace(':///', '://').split('://').pop().split('.');
                
                ts.printExampleHost({
                    domain: forceHost[0] || "example",
                    zone  : forceHost[1] || "",
                    title : url
                });
                
                return false;
            }
            
            if(host != ts.state.host){
                ts.state.page = 0;
                ts.state.order = vars.order;
                
                ts.getPreview(host);
                
                if(host && host != 'http://') ts.prevModeStatus("enabled");
                else ts.prevModeStatus("disabled");
            }else{
                //ui.$prevMode.prop("disabled", true);
            }
            
            //console.info("Host", host);
        }catch(ex){
            ts.prevModeStatus("disabled");
            console.info("Can't read the host", ex);
            ts.previewBreak("can't detect", url);
            return false;
        }
        
        ts.printExampleHost();
    };
    
    this.prevModeStatus =(status)=> {
        if(status == "disabled"/* && getCustomPreviewsMode() == 1*/){
            ui.$prevMode.prop("disabled", true);
        }else{
            ui.$prevMode.prop("disabled", false);
        }
    };
    
    this.checkTitle =(instead)=> {
        var title = ui.$title.val();
        if(!title && instead) title = instead;
        ui.example.$title.text(title);
    };
    
    this.checkFavicon =()=> {
        var icon = ts.state.host ? BRW_favicon(ts.state.host) : "";
        
        if(!icon || typeof icon == "undefined") icon = "/pages/newtab/img/dials/favicons.png";
        
        ui.example.$icon.attr("src", icon);
        return icon;
    };
    
    this.showColorSchemes =()=>{
        //console.info("showColorSchemes", vars.scheme);
        
        var host = ts.getExampleHost();
        
        if(!ts.state.schemesDrawn){
            ts.state.schemesDrawn = true;
        
            ui.$schemeList.find("li").remove();


            for(var key in vars.scheme) if(key != 18){
                var val = vars.scheme[key];

                $li = $("<item>").addClass("dial-example").attr("schemeId", key);

                $li.append(
                    $("<div>").addClass("dialex-header")
                        .append(
                            $("<img>").addClass("dialex-icon").attr("img", ts.checkFavicon())
                        )
                        .append(
                            $("<span>").addClass("dialex-title capitalize").text(val.name)
                        )
                );

                $li.append(
                    $("<div>").addClass("dialex-image-wrap")
                        .append(
                            $("<div>").addClass("dialex-image dialex-image-text").css("background-color", val.backgroundColor)
                                .append(
                                    $("<div>")
                                        .addClass("dialex-domain")
                                        .css("color", val.color)
                                        .text(host.domain)
                                )
                                 .append(
                                    $("<div>")
                                        .addClass("dialex-zone")
                                        .css("color", val.color)
                                        .text(host.zone)
                                )
                        )
                );

                ui.$schemeList.append($li);
            }

            ts.onceAction("scroll-schemes", false);
        }else{
            ui.$schemeList.find(".dialex-domain").text(host.domain);
            ui.$schemeList.find(".dialex-zone").text(host.zone);
        }
        
        ui.$wrap.addClass("addDialColorSchemes");
        ts.showMoreMode(true, "colors");  
    };
    
    this.setColorScheme =(id, randMode)=>{
        ts.printExampleHost();
        
        var scheme = vars.scheme[id]; scheme.id = id;
        ts.state.scheme = scheme;
        
        if(!randMode) ui.$colorScheme.text(ts.state.scheme.name);
        ui.$wrap.addClass("withColorScheme");
        
        if(!ts.state.preview) ui.example.$image.addClass("dialex-image-text");
        ui.example.$image.css("background-color", ts.state.scheme.backgroundColor);
        ui.example.$domain.css("color", ts.state.scheme.color);
        ui.example.$zone.css("color", ts.state.scheme.color);
        
        ts.showMoreMode(false);
    };
    
    this.noEmptyColorScheme =()=> {
        if(!ts.state.scheme){
            ts.setColorScheme(Math.floor(Math.random()*vars.scheme.length), true);
        }
    };
    
    this.detectScheme =(scheme)=> {
        if(typeof scheme != "object" || !scheme.color || !scheme.backgroundColor) return;
        
        for(var key in vars.scheme){
            var val = vars.scheme[key];
            
            if(
                val.color == scheme.color
                &&
                val.backgroundColor == scheme.backgroundColor
            ){
                //console.info(val, " VS ", scheme);
                ts.setColorScheme(key);
                ts.setMode("text");
                break;
            }
        }
    };
    
    this.getColorScheme =()=>{
        return ts.state.scheme || false;
    };
    
    this.printExampleHost =(host)=>{
        if(!host)  host = ts.getExampleHost();
        
        ui.example.$zone.text(host.zone);
        ui.example.$domain.text(host.domain);
        
        if(host.title){
            ui.example.$title.text(host.title);
        }
    };
    
    this.getExampleHost =()=> {
        var host = ts.state.host || "example.com";
        host = host.split('.');

        var zone = host.length > 1 ? host.pop() : "com";
        var domain = host.join('.').toLowerCase().replace('wwwww.','').replace('wwww.','').replace('www.','');
        
        return {domain:domain, zone:zone};
    };
    
    this.sidePreviewsPrint =(list, page)=> {
        //console.trace();
        if(!list || !list.previews || !list.previews.length){
            if(ts.state.hostCom){
                if(!ts.state.tryHostCom){
                    ts.state.tryHostCom = ts.state.hostCom;
                    ts.getPreview(ts.state.hostCom, 0);
                    ts.state.hostCom = false;
                }else{
                    /*
                    setTimeout(()=>{
                        ts.findMoreIcons(true);
                    }, 500);
                    */
                }
                
                return;
            };
            
            console.info("Exit", list.previews.length);
            
            ui.$prevWrap.removeClass("withShowMore");
            if(ts.state.page == 0) ts.sidePreviewsUI("no-image");
            if(ts.state.wide == true) ts.findMoreIcons(true);
            
            return;
        }else if(
            list.previews.length < 5
            &&
            ts.state.hostCom
            &&
            !ts.state.tryHostCom
            &&
            !ts.state.wide
            &&
            !page
        ){
            setTimeout(()=>{
                //console.debug("Side upload FIRE", list.previews.length);
                ts.state.tryHostCom = ts.state.hostCom;
                ts.getPreview(ts.state.hostCom, 0);
                ts.state.hostCom = false;
            }, 250);
            //turn;
        }
        
        if(page || ts.state.tryHostCom) ts.sidePreviewsUI(["show"]);
        else{
            ts.sidePreviewsUI(["clear", "show", "wait"]);
        }
        
        var li = [], printed=0;
        for(var key in list.previews) if(ts.state.printedPreviews.indexOf(list.previews[key].url) == -1){
            ts.state.printedPreviews.push(list.previews[key].url);
            printed++;
            
            var $li = $("<li>")
                .addClass( key < 10 ? "show-side" : "show-wide")
                .attr("prevId", list.previews[key].id)
                .append(
                    $("<span>")
                        .addClass("previewImage")
                        //.css("background-image", "url("+list.previews[key].url+")")
                        .attr("src", list.previews[key].url)
                )
                .append(
                    $("<span>")
                        .addClass("violation")
                        .attr("title", translate("preview_violation_title"))
                )
            ;
            
            if(!CACHE[list.previews[key].url]) ts.imgLoad(list.previews[key]);
            else $li.find(".previewImage").addClass("previewImageComplete").css("background-image", "url("+CACHE[list.previews[key].url]+")");
            
            li.push($li);
        }
        
        //console.debug("ALL: ", list.previews.length, " VS ", printed);
        
        if(
            !printed 
            && list.previews.length > 10
            //&& ts.state.tryHostCom 
            && ++ts.state.autoRepeat < 10
            && ts.state.wide
        ){
            setTimeout(()=>{
                ts.getPreview(ts.state.host, ((ts.state.page || 0) + 1));
            }, 250);
            
            return;
        }else{
            ts.state.autoRepeat = 0;
        }
        
        if(list.previews.length > 10 || ts.state.hostCom || ts.state.tryHostCom) {
            ui.$prevWrap.addClass("withShowMore");
        }else{
            ui.$prevWrap.removeClass("withShowMore");
        }
        
        ts.sidePreviewsUI("show");
        
        if(!page && !ts.state.tryHostCom) ui.$prevList.html("");
        ui.$prevList.append(li);
        
        //console.debug("TEST", ts.state.page, ts.state.totalPages, ts.state.hostCom, ts.state.tryHostCom);
        if(
            ts.state.wide == true
            &&
            (ts.state.page >= (ts.state.totalPages - 1) || list.previews.length < 10)
            &&
            (!ts.state.hostCom || ts.state.tryHostCom)
        ){
            ts.findMoreIcons(true);
        }
    };
    
    this.imgLoad =(data)=> {
        var xmlHTTP = new XMLHttpRequest();
        var imgLoaded = false;
        
        xmlHTTP.open('GET', data.url, true);
        xmlHTTP.responseType = 'arraybuffer';
        xmlHTTP.onload = function(e) {
            var blob = new Blob([this.response]);
            var src = window.URL.createObjectURL(blob);
            CACHE[data.url] = src;
            imgLoaded = true;
            
            setTimeout(()=>{
                ts.imageApply(data.id, src, 30);
            }, 50);
        };
        xmlHTTP.onprogress = function(e) {
            //console.info("completedPercentage", parseInt((e.loaded / e.total) * 100));
        };
        xmlHTTP.onloadstart = function() {
            //console.info("startImgLoad", data.url);
        };
        xmlHTTP.onerror = function() {
            ts.imageApply(data.id, null, 30);
        };
        xmlHTTP.send();
        
        setTimeout(()=>{
            if(!imgLoaded) ts.imageApply(data.id, null, 30);
        }, 5000);
    };
    
    this.imageApply =(id, src, delay)=> {
        var $span = ui.$prevList.find("[prevId='"+id+"'] .previewImage");
        
        if(src){
            $span.addClass("previewImageComplete");
        }else{
            $span.addClass("previewImageErr");
            src = "/pages/newtab/img/common/face-sad.png";
        }
        
        setTimeout(()=>{
            $span.css("background-image", "url("+src+")");
        }, delay || 0);        
    };
    
    this.sidePreviewsUI =(mode)=>{
        if(typeof mode == "string") mode = [mode];
        
        for(var k in mode){
            //console.info("sidePreviewsUI", mode[k]);
            
            switch(mode[k]){
                case "show":
                    if(ts.enabled){
                        ui.$wrap.addClass("addDialWithPreviews");
                        ui.$prevScroll.removeClass("waitPreviews");
                        ui.$prevList.find(".scroll-loading").remove();
                        ui.$prevList.find(".find-icons").remove();
                        ts.onceAction("scroll");
                    }
                break;
                case "wait":
                    ui.$prevScroll.removeClass("previews-error");
                    ui.$prevWrap.removeClass("withShowMore");
                    ui.$prevScroll.addClass("waitPreviews");
                break;
                case "hide":
                    ui.$wrap.removeClass("addDialWithPreviews");
                break;
                case "clear":
                    ui.$prevScroll.removeClass("previews-error");
                    ui.$prevList.find(".scroll-loading").remove();
                    ui.$prevWrap.find("li, .no-image-domain").remove();
                break;
                case "no-image":
                    ui.$prevScroll.removeClass("waitPreviews");
                    ui.$prevList.find(".scroll-loading").remove();
                    ui.$prevList.find(".no-image-domain").remove();
                    ui.$prevList.append(
                        $("<span>").addClass("no-image-domain").text(translate("preview_no_image"))                      
                    );
                break;
                case "subload":
                    ui.$prevScroll.removeClass("previews-error");
                    ui.$prevList.find(".scroll-loading").remove();
                    ui.$prevList.find(".find-icons").remove();
                    
                    if(ts.state.wide){
                        ui.$prevList.append(
                            $("<span>").addClass("scroll-loading")                 
                        );
                    }
                break;
                case "error":
                    ui.$prevScroll.addClass("previews-error");
                break;
                case "noerror":
                    ui.$prevScroll.removeClass("previews-error");
                break;
            }
        }
        
        return true;
    };
    
    this.onceAction =(action, force)=>{
        if(ONCE.indexOf(action) != -1 && !force) return;
        else ONCE.push(action);
        
        switch(action){
            case "scroll":
                ui.$prevScroll.mCustomScrollbar({
                    theme:"dark",
                    axis: "y",
                    autoHideScrollbar: false,

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
                        updateOnContentResize: true
                    },
                    callbacks: {
                        onScroll: ()=>{
                            if(ui.$wrap.hasClass("showMoreMode")){
                                var position = 100 * (ui.$prevScroll.find(".mCSB_dragger").position().top + ui.$prevScroll.find(".mCSB_dragger").height()) / ui.$prevScroll.find(".mCSB_draggerContainer").height();

                                if(position > 95) ts.loadMorePreviews();
                            }
                            
                        }
                        
                    }
                });
                
            break;
                
            case "scroll-schemes":
                ui.$schemeList.mCustomScrollbar({
                    theme:"dark",
                    axis: "y",
                    autoHideScrollbar: false,

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
                        updateOnContentResize: true
                    }
                });
                
            break;
        }//switch
    };
    
    this.hostDotCom = (host) => {
        var host = String(host).trim();
        
        if(ts.state.tryHostCom) return ts.state.hostCom;
        
        if(host.indexOf('.com') > -1) return host;
        
        /*
        for(var key in vars.whiteList){
            if(host.indexOf(vars.whiteList[key]) > -1){
                //console.debug("White List", vars.whiteList[key]);
                return host;
            }
        }
        */
        
        var hostArr = host.split('.');
        hostArr.pop();
        
        if(!hostArr.length) return host;
        
        ts.state.hostCom = hostArr.join('.') + ".com";
        return host;
    };
    
    this.getPreview =(host, page)=> {
        
        var host = ts.hostDotCom(host);
        
        //console.debug("getPreview", host, page);
        
        if(page){
            if(ts.state.page >= page || page > (ts.state.totalPages || 0)){
                //if(ts.state.wide) ts.findMoreIcons(true);
                
                return;
            }else{
                ts.state.page = page;
            }
        }else{
            ts.state.page = 0;
        }
        
        if(checkUrlHasGoogleHost(host)){
            ts.sidePreviewsUI(["show", "clear", "no-image"]);
            return false;
        }
        
        if(
            !host
            || host.indexOf('://') != -1
            || host.indexOf('.') == -1
            || host.split('.').pop().length < 2
        ){
            //ui.$prevMode.prop("disabled", true);
            return false;
        }
        
        //ui.$prevMode.prop("disabled", false);
        
        ts.state.host = host;
        
        if(page || ts.state.tryHostCom) ts.sidePreviewsUI(["subload"]);
        else{
            ts.sidePreviewsUI(["show", "clear", "wait"]);
        }
        
        ts.checkTitle(host);
        ts.checkFavicon();
        
        var listLoaded = false;
        
        if(ts.enabled){
            ts.GET({
                service: "listing.php",
                param  : {
                    host : host,
                    order: ts.state.order,
                    p    : ts.state.page || 0,
                },
                success: (data, param)=>{     
                    //var stringParam = JSON.stringify(param);

                    listLoaded = true;
                    ts.sidePreviewsUI(["noerror"]);

                    if(
                        (
                            param.host != ts.state.host 
                            && 
                            param.host != ts.state.hostCom
                        ) 
                        || param.p != ts.state.page
                        || param.order != ts.state.order
                        //|| stringParam == ts.state.lastParam
                    ){
                        return;
                    }
                    /*
                    ts.state.lastParam = stringParam;
                    setTimeout(()=>{
                        if(stringParam == ts.state.lastParam) ts.state.lastParam = false;
                    }, 350);
                    */

                    ts.state.totalPages = data.totalPages;

                    //console.debug("Previews for '"+host+"' :", data);

                    ts.sidePreviewsPrint(data, page);
                },
                error: (err)=>{
                    console.warn("Can't get previews:", err);
                }
            });

            setTimeout(()=>{
                if(listLoaded == false && ts.state.host == host){
                    ts.sidePreviewsUI(["error"]);
                }
            }, 10000);
        }else{
            ts.sidePreviewsUI(["noerror"]);
            return;
            
        }
    };   
    
    this.previewBreak =(reason, url)=> {
        console.info("previewBreak", reason, url);
    };
    
    
    this.GET = function(opt){
        var options = opt;
        var server = vars.API + options.service;
        
        if(options.param){
            var param = [];
            for(var key in options.param) param.push(key+'='+options.param[key]);
                
            server += "?"+param.join("&");
        }
        
        //console.debug("GET", server);
        
        if(CACHE[server] && options.success){
            options.success(CACHE[server].result, CACHE[server].param);
            return;
        }
        
        var xhr = BRW_json(
            server,
            function(result){
                if(result.errorCode == 0){
                    CACHE[server] = {result: result.body, param: options.param};
                    if(options.success) options.success(result.body, options.param);
                }else{
                    if(options.error) options.error(result, options);
                }
                xhr = null;
            },
            function(error){
                if(errorFunc) errorFunc(error, options);
            }
        );
        
        return xhr;
    };
    
    this.POST = function(options){
        var server = vars.API + options.service;
        
        var xhr = BRW_post(
            server, JSON.stringify(options.param),
            function(result){
                if(result.errorCode == 0){
                    if(options.success) options.success(result.body);
                }else{
                    if(options.error) options.error(result);
                }
                xhr = null;
            },
            function(error){
                if(errorFunc) errorFunc(error);
            }
        );
    }
};
    
// ------------------------------------------------------------------------------------------------------

function URLPicker(){
    var ts = this;
    
    var vars = {
        $wrap  : $("#add-new-dial-dialog"),
        mostPopularUrl : "https://everhelper.me/sdpreviews/country_top.php",
    };
    
    var ui = {
        $wrap   : vars.$wrap,
        $button : vars.$wrap.find(".pick-menu"),
        $input  : vars.$wrap.find("#newDialUrl"),
        
    };
    
    this.state = {
        current : false,
        popular : false,
    };
    
    this.init =()=> {
        ts.handlers();
    };
    
    this.handlers =()=> {
        ui.$button.unbind("click").on("click", (event)=>{
            var $target = $(event.currentTarget);
            if(!$target.hasClass("pick-menu")) return false;
            ts.changeMenu($target.attr("mode"), $target);
        });
        
        ui.$button.on("click", "li", (event)=>{
            var $li = $(event.currentTarget);            
            ts.setUrl($li.text());
        });
        
        $( "body" ).on("click", (event)=>{
            var $target = $(event.target);
            if($target.parents(".pick-menu").length) return false;
            //console.info(event);
            
            ts.closeMenu();
        });
        
    };
    
    this.setUrl =(url)=> {
        ui.$input.val(url);
        if(typeof Preview == "object") Preview.checkInput();
    };
    
    this.changeMenu =(mode, $menu)=> {
        var create = true;
        //console.debug(mode, $menu);
        
        if(mode){
            if(mode == ts.state.current) create = false;
            ts.closeMenu();
        }//if
        
        if(!create) return;
        else ts.state.current = mode;
        
        ts.getList(mode, (list)=>{
            var $ul = $("<ul>");
            
            for(var key in list){
                var $li = $("<li>")
                    .append(
                        $("<img>")
                            .attr("src", (list[key].favicon || BRW_favicon(list[key].url)))
                    )
                    .append(
                        $("<url>")
                            .text(list[key].url)
                            .attr("title", list[key].url)
                    )
                ;
                
                $ul.append($li);
            }//for
            
            $menu.addClass("pick-active").append($ul);
        });
    };
    
    this.closeMenu =()=> {
        ui.$button.removeClass("pick-active").find("ul").fadeOut("fast").remove();
        ts.state.current = false;
        return true;
    };
    
    this.getList =(mode, cb)=> {
        var test = [ {url:"http://yandex.ru"}, {url:"http://google.com"}, {url:"http://livestartpage.com"}, {url:"http://gearbest.com"}, {url:"http://aliexpress.com"} ];
        
        if(mode == "opened"){
            getTabsList(function(Data){
                if(Data && Data.length){
                    if(cb) cb(Data);
                }//if
            });
        }
        else
        if(mode == "popular"){
            if(ts.state.popular) cb(ts.state.popular);
            else{
                var xhr = BRW_json(
                    vars.mostPopularUrl,
                    function (result) {
                        //console.info(result);
                        if (result.errorCode == 0) { //success
                            try{
                                var items = [];

                                for(var k in result.body.domains){
                                    items.push({
                                        url: "http://" + result.body.domains[k],
                                        title: result.body.domains[k]
                                    });
                                }
                                
                                ts.state.popular = items;
                                
                                if(cb) cb(items);
                            }catch(ex){
                                console.warn("Can not load most popular URLs", ex)
                            }
                        } else { //error
                            console.warn("Can not load most popular URLs", result)
                        } //else

                        xhr = null;
                    },
                    function (error) {
                        console.warn("Error loading most popular URLs", error)
                    }
                );
            }
        }        
        else
        if(mode == "visited"){
            BRW_mostVisitedURLs((result)=>{
                //console.debug(result);
                
                if(typeof result == "object"){
                    var arr = [];
                    for(var k in result) arr.push({
                        url: k,
                        result: result
                    });
                    result = arr;
                }
                
                if(cb) cb(result.splice(0, 50));
            });
            
        }
    };
    
};//URLPicker()






















