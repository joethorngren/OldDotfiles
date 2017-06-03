PASS = false;

$(function(){
    protectElements();
    
    waitAuth(function(authStatus, authEnabled){
        PASS = new PassCode(); 
        PASS.init(authStatus, authEnabled);
    });
});

function protectElements(){
    var $elements = $("#mv-tiles, #mv-clock, #sidebar-wrap, #todo-container, #header, #footer, #relax, #OFFsearchChoiseButton, #header-weather, .bba-wrap");
    var $passCode = $("#passcode-form");
    
    var locked = localStorage.getItem("pass-code-locked");
    
    if(locked && locked == "on"){
        $("#passcode-form #passcode").val("");
        $elements.addClass("force-hidden");
        $passCode.fadeIn("slow");
        
        $("#passcode-form #passcode-btn-restore")
            .removeClass("btn-success")
            .addClass("btn-warning")
            .attr("disabled", false)
            .text(translate("passcode_settings_pass_btn_restore"))
        ;
        
        $("#passcode-form .forgot-passcode").css("display", "initial");
        $("#passcode-form .restore-block").css("display", "none");
        $("#passcode-form .wrong-password").addClass("hide");
        $(".restore-hint").css("display", "none");
        
        var Path = String(document.location.pathname);
        
        if(
            Path.indexOf("/pages/newtab/newtab.html") == -1 
            ||
            Path.indexOf("/pages/options/") > -1
        ){
            var url = extensionGetUrl("/pages/newtab/newtab.html");
            
            
            setTimeout(function(){
                document.location = url;
                //openUrlInCurrentTab(url);
            }, Math.ceil(350+Math.random()*1500));
        }//if
    }else{
        $elements.removeClass("force-hidden");
        $passCode.fadeOut("fast");
    }
    
    if(PASS){
        PASS.getSettings();
    }
    
}

function PassCode(data){
    var self = this;
    
    self.API = {
        server: "http://livestartpage.com/pinmail.php"
    };
    
    self.state={
        el : {
            $email : $(".restore-email"),
            $hints : $(".restore-hint")
        },
        buttons : {
            menu: $(".menu-passcode"),
            all : $(".pass-btn"),
        },
        settings : {
            $block  : $("#passcode-block"),
            $func   : $("#passcode-block .passcode-func"),
            $promo  : $("#passcode-block .passcode-promo"),
            $isSet  : $(".ifPassSet, #pass-is-set, #pass-basic-OFF"),
            $notSet : $("#pass-welcome, #passcode-btn-set"),
            $pass   : $("#passcode-block #password-set"),
            $repass : $("#passcode-block #password-rpt"),
            $email  : $("#passcode-block #recovery-email"),
            $current: $("#passcode-block #password-cur"),
            $newpass: $("#passcode-block #password-new"),
            $nrepass: $("#passcode-block #password-new-rpt"),
            $btnSet : $("#passcode-block #passcode-btn-set"),
            $btnChng: $("#passcode-block #passcode-btn-change"),
            $btnDel : $("#passcode-block #passcode-btn-delete"),
            $btnRst : $("#passcode-block #passcode-btn-restore"),
            $btnEnbl: $("#passcode-block #passcode-enable"),
            $renders: $("#passcode-block .passRender"),
            $tabChng: $("#passcode-block #pass-change"),
            $tabs   : $("#passcode-block .nav-tabs"),
            fill    : {
                $pass   : 'pass',
                $repass : 'pass',
                $email  : 'email',
            }
        },
        newtab : {
            $block  : $("#passcode-form"),
            $pass   : $("#passcode-form #passcode"),
            $restore: $("#passcode-form .restore-block"),
            $forgot : $("#passcode-form .forgot-passcode"),
            $btnRst : $("#passcode-form #passcode-btn-restore"),
            $btnCncl: $("#passcode-form #passcode-btn-cancel"),
            $action : $("#passcode-form .passcode-action-form"),
            $cleared: $("#passcode-form .passcode-cleared"),
            $wrong  : $("#passcode-form .wrong-password"),
            $unlock : $("#passcode-form .passcode-unlock-button"),
        },
        form : {
            
        },
        auth : {
        },
        is : {},
        fails: 0
    };
    
    self.data = {};
    
    self.state.settings.$block.find("input").on("focus", function(){
        $(this).parents(".warning").removeClass("warning");
    });
    self.state.newtab.$block.find("input").on("keypress", function(){
        $(this).parents(".wrong").removeClass("wrong");
    });
    
    this.init = function(authStatus, authEnabled){
        self.state.auth.status  = authStatus;
        self.state.auth.enabled = authEnabled;
        
        self.getSettings(function(){
            self.lockCheck();
            self.render();
            self.fill(true);
                        
            var hash = String(document.location.search);
            if(hash.length && hash.indexOf("restore") == 1){
                self.unlock("newtab", hash);
            }//if
        });
        
        if(self.state.auth.enabled){
            self.state.buttons.all.on("click", function(){
                self.lock();
            });
            
            self.state.settings.$btnSet.on("click", function(){
                self.passCodeSet("settings");
            });
            
            self.state.settings.$btnChng.on("click", function(){
                self.passCodeChange("settings");
            });           
            
            self.state.settings.$btnDel.on("click", function(){
                self.passCodeDelete("settings");
            });
            
            self.state.settings.$btnRst.on("click", function(){
                self.passCodeRestore("settings");
            });

            self.state.newtab.$btnRst.on("click", function(){
                self.passCodeRestore("newtab");
            });

            self.state.settings.$renders.on("click", function(){
                self.render();
            }); 
            
            if(document.location.hash.split('?').shift() == "#set-password"){
                if(scrollAndHighlightBlock){
                    setTimeout(function(){
                        scrollAndHighlightBlock("#passcode-block");
                    }, 150);
                    
                }
                
                //self.showPassBlock();
            }
                        
            self.state.newtab.$pass.on("keyup", function(e){
                if(e && e.keyCode == 13){
                    self.unlock("newtab");
                }//if
            });
            
            self.state.newtab.$unlock.on("click", function(){
                self.unlock("newtab"); 
            });
            
            self.state.settings.$btnEnbl.on("click", function(){
                self.lock();
            }); 
            
            self.state.newtab.$block
                .on("mouseenter", function(){
                    self.formAnimate("fadeIn");
                })
                .on("mouseleave", function(){
                    self.formAnimate("fadeOut");
                })
            ;
            
            self.state.newtab.$pass.on("focus", function(){
                var obj = $(this);
                obj.attr("placeHolderDefault", obj.attr("placeholder")).attr("placeholder", "");
                self.formAnimate("fadeIn");
            });
            
            self.state.newtab.$pass.on("blur", function(){
                var obj = $(this);
                obj.attr("placeholder", obj.attr("placeHolderDefault"));
            });
            
            self.state.newtab.$forgot.on("click", function(){
                $(this).css("display", "none");
                
                self.state.newtab.$btnRst
                    .removeClass("btn-success")
                    .addClass("btn-warning")
                    .attr("disabled", false)
                    .text(translate("passcode_settings_pass_btn_restore"))
                ;
                self.state.el.$hints.css("display", "none");
                
                self.state.newtab.$restore.css("display", "block");
                self.state.newtab.$wrong.addClass("hide");
            });
            
            self.state.newtab.$btnCncl.on("click", function(){
                self.state.fails=0;
                self.state.newtab.$restore.css("display", "none");
                self.state.newtab.$forgot.css("display", "initial");
                self.state.newtab.$wrong.removeClass("hide");
            });
            
            
            self.state.settings.$tabs.on("click", function(){
                self.resetChangeForm("settings");
            }); 
        }//if
    },
    
    this.formAnimate = function(dir){
        if(dir != "fadeOut"){
            self.state.newtab.$block.animate({'opacity':1}, 410);
            //self.state.newtab.$block.animate({'background-color':'rgba(65,65,65,1)'}, 410);
            //self.state.newtab.$unlock.animate({'opacity':1}, 410);
        }else{
            //self.state.newtab.$block.stop(true,false).animate({'background-color':'rgba(0,0,0,0.4)'}, 410);
        }
    },
        
    this.lockCheck = function(){
        var store = localStorage.getItem("pass-code-locked");
        
        if(
            (self.data.lock == "on" && store != "on") ||
            (self.data.lock == "off" && store != "off")
        ){
            localStorage.setItem("pass-code-locked", self.data.lock);
            protectElements();
        }//if
    },
        
    this.unlock = function(form, hash){
        if(self.isLock()){
            var unlockPrm = false, cleared=false;
            
            if(!hash){
                var pass = String(self.state[form].$pass.val()).trim();
            }else{
                var pass = hash.replace("#", "").replace("?", "").replace("=", "").replace("restore", "").replace("CODE", "");
            }//else
            
            var crypt = self.crypt(pass);
            
            if(crypt == self.data.pass){
                unlockPrm = true;
            }else
            if(crypt == self.data.restore){
                unlockPrm = true;
                cleared   = true;
            }else{
                self.state[form].$block.addClass("wrong");
                
                if(++self.state.fails > 2){
                    self.state[form].$restore.css("display", "block");//fadeIn("slow");
                    self.state.newtab.$forgot.css("display", "none");
                    self.state.newtab.$wrong.addClass("hide");
                }else{
                    self.state[form].$restore.css("display", "none");//fadeIn("slow");
                    self.state.newtab.$forgot.css("display", "initial");
                    self.state.newtab.$wrong.removeClass("hide");
                    
                    self.state.el.$hints.css("display", "none");
                    self.state[form].$btnRst
                        .removeClass("btn-success")
                        .addClass("btn-warning")
                        .attr("disabled", false)
                        .text(translate("passcode_settings_pass_btn_restore"))
                    ;
                }//else
            }
            
            if(unlockPrm){
                self.setSettings(
                    {lock:"off"},
                    function(){
                        localStorage.setItem("pass-code-locked", "off");
                        
                        self.videoPause();
                        
                        setTimeout(function(){
                            BRW_TabsGetCurrentID(function(tab) {
                                if(BROWSER && BROWSER == 'chrome'){
                                    //BRW_sendMessage({command: "protectElements"});
                                }else{
                                    getNetTabPages(reloadTabPages, {skipTab: tab});
                                }//else
                                
                                //BRW_sendMessage({command: "protectElements"});
                            });
                        
                            if(!cleared){
                                protectElements();
                                BRW_sendMessage({command: "protectElements"});
                            }else{
                                self.state.newtab.$action.css( "display", "none");
                                self.state.newtab.$cleared.css("display","block");

                                setTimeout(function(){

                                    self.state.newtab.$cleared.css("display","none");
                                    self.state.newtab.$restore.css("display","none");

                                    self.state.newtab.$action.css("display","block");
                                    
                                    BRW_sendMessage({command: "protectElements"});
                                    protectElements();
                                }, 2500);
                            }//else
                        }, 150);
                    },
                    (cleared ? false : true)
                );
            }
        }//if
    },
        
    this.lock = function(){
        if(isAuthEnable()){
            
            if(!AUTH.isPremium("discovered", false, "passcode")) return false;

            if(!self.isPass()){
                openUrlInCurrentTab(
                    extensionGetUrl("/pages/options/settings.html#navi-settings-passcode")
                );
            }else{
                self.setSettings(
                    {lock:"on"},
                    function(){
                        localStorage.setItem("pass-code-locked", "on");
                        
                        self.videoPause();

                        setTimeout(function(){
                            BRW_TabsGetCurrentID(function(tab) {
                                if(BROWSER && BROWSER == 'chrome'){
                                    BRW_sendMessage({command: "protectElements"});
                                }else{
                                    getNetTabPages(reloadTabPages, {skipTab: tab});
                                    getOptionsTabPages(reloadTabPages, {skipTab: tab});
                                    getSettingsTabPages(reloadTabPages, {skipTab: tab});
                                    getFavoriteTabPages(reloadTabPages, {skipTab: tab});
                                }//else
                            });
                        }, 350);
                        
                        protectElements();
                    },
                    true
                );

            }//else
        }
    },
        
    this.videoPause = function(){
        return false;
        /*
        if(localStorage.getItem("background-video-state") == "play"){
            localStorage.setItem("background-video-stopper", 3500+Date.now());

            setTimeout(function(){
                localStorage.removeItem("background-video-stopper");
            }, 5000);
        }//if
        */
    },
    
    this.fill = function(Init){
        if(self.state.settings.$block.length){
            for(var key in self.state.settings.fill){
                var val = self.state.settings.fill[key];
                
                self.state.settings[key].val(self.data[val] || "");
            }//for
            
            if(Init && !self.data.email){
                self.state.settings.$email.val(AUTH.getLogin());
            }//if
        }//if
        
    },  
        
    this.render = function(Init){
        if(self.state.auth.enabled){
            //enabled
            if(self.state.settings.$block.length){//Settings page
                if(isAuthEnable()){
                    //self.state.settings.$block.css("display","block");
                    
                    if(AUTH.isPremium()){
                        //self.state.settings.$func.css("display","block");
                        self.state.settings.$promo.css("display","none");
                    }else{
                        self.state.settings.$promo.css("display","block");
                    }
                }//if
            }//if
            
            self.state.buttons.all.css("display","block");
            
            if(self.isPass()){
                self.state.settings.$notSet.css("display","none");
                self.state.settings.$isSet.css("display","initial");
                
                self.state.el.$email.text(self.data.email);
                
                self.state.settings.$isSet.filter("li").css("display","inline-block").removeClass("disabled").addClass("enabled");
            }else{
                self.state.settings.$isSet.css("display","none");
                self.state.settings.$notSet.css("display","initial");                
                
                self.state.settings.$isSet.filter("li").css("display","inline-block").removeClass("enabled").addClass("disabled");
            }//else
            
            if(self.isLock()){
                
            }else{
                
            }//else
        }else{
            //not enabled
        }
    },
        
    this.isPass = function(callback){
        self.state.is.pass = self.data.pass ? true : false;
        
        if(callback) callback(self.state.is.pass);
        return self.state.is.pass;
    }        
    
    this.isLock = function(callback){
        self.state.is.locked = (self.data.lock == "on" ? true : false);
        if(callback) callback(self.state.is.locked);
        return self.state.is.locked;
    },
    
    this.passCodeRestore = function(form){
        self.state[form].$btnRst.attr("disabled", "disabled");
        
        var Code = String(self.crypt(String(self.data.email)+String(Date.now()))).toUpperCase().substr(-10);
        
        var Link = extensionGetUrl("/pages/newtab/newtab.html")+"?restore=CODE"+Code;
        
        //console.debug(Link);
        
        self.POST(
            {
                email   : String(self.data.email).trim(),
                subject : translate("passcode_email_subject"),
                text    : String(translate("passcode_email_body")).replace("[code]", Code).replace("[link]", Link).replace("[link]", Link),
                link    : Link
            },
            //Success
            function(){
//              if(form == "settings"){
                self.state[form].$btnRst
                    .removeClass("btn-warning")
                    .addClass("btn-success")
                    .attr("disabled", "disabled")
                    .text(translate("passcode_settings_pass_btn_done"))
                ;
                
                self.state.el.$hints.css("display", "initial");
                
                self.setSettings(
                    {restore: self.crypt(Code)},
                    function(){},
                    true
                );
                
                self.state.fails = 0;
            },
            //Error
            function(){
                self.state[form].$btnRst.attr("disabled", false);
            }
        );
        
    },
        
    this.passCodeSet = function(form){
        var Prm = true;
        var pattern = /^([a-z0-9_\.-])+@[a-z0-9-]+\.([a-z]{2,4}\.)?[a-z]{2,4}$/i;
        
        var Set = {
            pass  : String(this.state[form].$pass.val()),
            repass: String(this.state[form].$repass.val()),
            email : String(this.state[form].$email.val())
        };
        
        if(!Set.pass){
            Prm  = false;
            this.state[form].$pass.parents("label, .main-label").addClass("warning");
        }else if(Set.pass != Set.repass){
            Prm  = false;
            this.state[form].$repass.parents("label, .main-label").addClass("warning");
        }
        
        if(
            !Set.email ||
            !pattern.test(Set.email)
        ){
            Prm  = false;
            this.state[form].$email.parents("label, .main-label").addClass("warning");
        }//if
        
        if(Prm){
            self.setSettings(
                {
                    pass  : self.crypt(Set.pass),
                    email : Set.email   
                },
                function(){
                    self.fill();
                    self.render();
                    
                    self.reloadOtherAddonPages();
                }
            );
        }//if
    },
        
    this.passCodeChange = function(form){
        var Prm = true;
        
        var Set = {
            current : String(this.state[form].$current.val()),
            newpass : String(this.state[form].$newpass.val()),
            nrepass : String(this.state[form].$nrepass.val())
        };
        
        if(
            !Set.current ||
            (
                (self.crypt(Set.current) != self.data.pass) &&
                (   
                    !self.data.restore || 
                    (self.crypt(Set.current) != self.data.restore)
                )
            )
        ){
            Prm  = false;
            this.state[form].$current.parents("label, .main-label").addClass("warning");
        }
        
        if(!Set.newpass){
            Prm  = false;
            this.state[form].$newpass.parents("label, .main-label").addClass("warning");
        }else if(Set.newpass != Set.nrepass){
            Prm  = false;
            this.state[form].$nrepass.parents("label, .main-label").addClass("warning");
        }//else
        
        if(Prm){
            self.setSettings(
                {
                    pass  : self.crypt(Set.newpass)
                },
                function(){
                    self.fill();
                    self.render();
                    
                    self.reloadOtherAddonPages();
                },
                true
            );
            
            self.state.settings.$btnChng
                .removeClass("btn-info")
                .addClass("btn-success")
                .attr("disabled", "disabled")
                .text(translate("passcode_settings_pass_btn_changed"))
            ;
            
            setTimeout(function(){
                self.clearChangeForm(form);
            }, 500);
        }//if
    },
        
    this.passCodeDelete = function(form){
        var Prm = true;
        
        var Set = {
            current : String(this.state[form].$current.val())
        };
        
        //console.log(self.data);
        
        if(
            !Set.current ||
            (
                (self.crypt(Set.current) != self.data.pass) &&
                (   
                    !self.data.restore || 
                    (self.crypt(Set.current) != self.data.restore)
                )
            ) 
        ){
            Prm  = false;
            this.state[form].$current.parents("label, .main-label").addClass("warning");
        }

        if(Prm){
            self.setSettings(
                {},
                function(){
                    self.fill(true);
                    //self.render();
                    
                    self.reloadOtherAddonPages();
                }
            );
            
            self.state.settings.$btnDel
                .removeClass("btn-danger")
                .addClass("btn-success")
                .attr("disabled", "disabled")
                .text(translate("passcode_settings_pass_btn_deleted"))
            ;
            
            self.state.settings.$btnChng
                .attr("disabled", "disabled")
            ;
            
            this.state[form].$current.attr("disabled", "disabled");
            this.state[form].$newpass.attr("disabled", "disabled");
            this.state[form].$nrepass.attr("disabled", "disabled");
            
            setTimeout(function(){
                self.clearChangeForm(form);
            }, 500);
            
            //self.render();
        }//if
    },
    
    this.clearChangeForm = function(form, usable){
        this.state[form].$current.val("");
        this.state[form].$newpass.val("");
        this.state[form].$nrepass.val("");
        
        if(usable){
            this.state[form].$current.attr("disabled", false);
            this.state[form].$newpass.attr("disabled", false);
            this.state[form].$nrepass.attr("disabled", false);
        }//if
        
    },
    
    this.resetChangeForm = function(form){
        self.clearChangeForm(form, true);
        
        self.state.settings.$btnDel
            .removeClass("btn-success")
            .addClass("btn-danger")
            .attr("disabled", false)
            .text(translate("passcode_settings_pass_btn_delete"))
        ;
        
        self.state.settings.$btnChng
            .removeClass("btn-success")
            .addClass("btn-info")
            .attr("disabled", false)
            .text(translate("passcode_settings_pass_btn_change"))
        ;
        
        self.state.settings.$btnRst
            .removeClass("btn-success")
            .addClass("btn-warning")
            .attr("disabled", false)
            .text(translate("passcode_settings_pass_btn_restore"))
        ;

        self.state.el.$hints.css("display", "none");
        
        return true;
    },
        
    this.showPassBlock = function(){
        if(self.state.settings.$block.length){
            /*
            setTimeout(function(){
                $("html, body").animate( 
                    {scrollTop: self.state.settings.$block.offset().top },
                    350,
                    function(){
                        var Color1 = "#FFFFFF", Color2 = "#bfff00";
                        
                        self.state.settings.$block.find(".bs-callout")
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
                    }
                );
            }, 50);
            */
        }//if
    },
        
    this.getSettings = function(callback){
        getSettingsValue("passcode", null, function(vals) {
            //vals="{}";
            var vals = JSON.parse(vals || "{}");
            self.data = vals;
            if(callback) callback();
        });
    },
    
    this.setSettings = function(values, callback, merge){
        if(!merge) var Data = values;
        else{
            var Data = self.data;
            for(var k in values) Data[k] = values[k];
        }//else
        
        Data.update = Date.now();
        
        self.data = Data;
        
        setSettingsValue("passcode", JSON.stringify(self.data), function() {
            if(callback) callback();
        });
    },
    
    this.POST = function(send, callBack, errorFunc, options){
        var xhr = BRW_post(
            self.API.server, send,
            function(result){//success
                if(callBack) callBack(result);

                xhr = null;
            },//success
            function(error){//error
                console.info(error);
                if(error) errorFunc(error);
            }//error
        );
    },
    
    this.reloadOtherAddonPages = function(){
        setTimeout(function(){
            BRW_TabsGetCurrentID(function(tab) {
                getNetTabPages(reloadTabPages, {skipTab: tab});
                getOptionsTabPages(reloadTabPages, {skipTab: tab});
                getSettingsTabPages(reloadTabPages, {skipTab: tab});
                getFavoriteTabPages(reloadTabPages, {skipTab: tab});
            });
        }, 150);
    },
        
    this.crypt = function(str){
        var key = localStorage.getItem("install-key") || "key";
            
        str = CryptoJS.MD5(str).toString();
        key = CryptoJS.MD5(key).toString();
        
        str = CryptoJS.MD5(str + "/" + key).toString();
        
        return str;
    }
}//PassCode


