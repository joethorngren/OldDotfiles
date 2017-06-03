var AUTH = false;
var AUTHOFF = false;

$(function(){
    if(isAuthEnable()){
        setTimeout(function(){
            AUTH = new LspAuth();// AUTH.init();
            
            if(AUTH){
                var schedule = parseInt(localStorage.getItem("auth-check-schedule")) || 0;//Date.now();
                
                if((Date.now() - schedule) < (1000 * 60 * 60 * 24)){
                    //console.debug("Auth check schedule", Date.now() - schedule, schedule);
                    
                    AUTH.check(false, false, false, false, true);
                }
                
                //AUTH.autoCheck(3 * 60 * 1000);
            }//if
        }, 550);
    
        $(".premium-hidden").removeClass("premium-hidden");
    }
});

function isAuthEnable(){
    var Loc = String(localStorage.getItem('definedLocation')).toLowerCase().split('-').shift();
    var hasRuLanguage = Loc.indexOf("OFFru") != -1;
    
    if(AUTHOFF || hasRuLanguage){
        AUTHOFF = true;
        return false;
    }else return true;
}//isAuthEnable

// Return callback with two options: 1) auth status boolean, 2) auth functions enabled boolean
function waitAuth(callback){
    if(!callback) callback = function(){};
    
    if(AUTHOFF){
        callback(false, false);
    }//if
    
    if(AUTH && AUTH.loaded && AUTH.state.loaded){
        callback(false, true);
    }else{
        var t = 0;
        var authWait = setInterval(function() { 
            if(AUTH && AUTH.state && AUTH.state.loaded){
                clearInterval(authWait);  
                callback(true, true);
            }else if(++t > 50){
                clearInterval(authWait);
                callback(false, true);
            }//else
        }, 150);
    }//else
}//function

function LspAuth(data){
    var self = this;
    
    self.mode = {
        trial_disabled : true,
    };
    
    self.API = {
        server : "https://sync.everhelper.me",
        trial  : "http://trial-api.everhelper.me/v1",
        lang   : "http://livestartpage.com/user/lang",
        weather: "http://livestartpage.com/user/weather/key",
        everhelper : "https://livestartpage.everhelper.me/rdr/?url="
    };
    
    self.state={
        loaded  : false,
        auth    : false,
        checked : false,
        noclose : false,
        info    : {},
        $head   : $(".options-header-right-block"),
        loaded  : false,
        tab     : false,
        promo   : false,
        currncy : false,
        links   : {
            site   : "http://livestartpage.com",
            
            pricing: self.API.everhelper + encodeURIComponent("https://livestartpage.com/pricing"),
            billing: self.API.everhelper + encodeURIComponent("https://livestartpage.com/auth"),
            
            buyEnM : self.API.everhelper + encodeURIComponent("https://livestartpage.com/billing/?s=0&plan=monthly-pro"),
            buyEnY : self.API.everhelper + encodeURIComponent("https://livestartpage.com/billing/?s=0&plan=yearly-pro"),
            buyRuM : self.API.everhelper + encodeURIComponent("https://livestartpage.com/billingrub/?plan=monthly-pro"),
            buyRuY : self.API.everhelper + encodeURIComponent("https://livestartpage.com/billingrub/?plan=yearly-pro"),            
            
            /*
            buyEnM : self.API.everhelper + "https://livestartpage.com/btest/?plan=monthly-pro",
            buyEnY : self.API.everhelper + "https://livestartpage.com/btest/?plan=yearly-pro",
            buyRuM : self.API.everhelper + "https://livestartpage.com/btestrub/?plan=monthly-pro",
            buyRuY : self.API.everhelper + "https://livestartpage.com/btestrub/?plan=yearly-pro",
            */   
            //buyRuM : "https://livestartpage.com/ru/billing/systems/walletone/pay.php?plan=monthly-pro",
            //buyRuY : "https://livestartpage.com/ru/billing/systems/walletone/pay.php?plan=yearly-pro",
            //billing: "http://livestartpage.com/user-billing/",
        },
        ru_paid : ["ru", "ua", "by", "be", "uk", "kk", "uz"],
        touch   : Date.now(),
        buyJustShown : false,
    },
    
    $("body").append(
        $("<div>")
            .attr("id", "auth-wrap")
    );
    
    $("#auth-wrap").load("../common/auth/auth.html", function(){
        var $wrap = $("#auth-wrap");
        
        setTimeout(function(){
            autoTranslate($wrap);
        }, 350);
        
        setTimeout(function(){
            autoTranslate($wrap);
        }, 2500);
        
        self.obj = {
            $wrap : $wrap,
            $curt : $wrap.find("#acurtain"),
            $aside: $wrap.find(".lsp-auth-aside"),
            $screens: $wrap.find("#auth-screens"),
            $tooltip: $wrap.find('[data-toggle="tooltip"]'),
            tabs    : {
                login: {
                    $el: $wrap.find("#auth-login"),
                    $email : $wrap.find("#auth-login [type=email]"),
                },
                signup: {
                    $el: $wrap.find("#auth-signup"),
                    $email : $wrap.find("#auth-signup [type=email]"),
                },
                restore: {
                    $el: $wrap.find("#auth-restore"),
                },
                discovered: {
                    $el: $wrap.find("#auth-discovered"),
                    $site : $wrap.find("#auth-discovered [name='discovered-site']"),
                    $login: $wrap.find("#auth-discovered [name='discovered-login']"),
                    $side : $wrap.find("#auth-discovered .lsp-side-content"),
                    $inner: $wrap.find("#auth-discovered .lsp-side-inner"),
                    $head : $wrap.find("#auth-discovered .lsp-side-head"),
                    $text : $wrap.find("#auth-discovered .lsp-side-text"),
                    $img  : $wrap.find("#auth-discovered .lsp-side-img"),
                    $sides: $wrap.find("#auth-discovered").find(".lsp-side-img, .lsp-side-head, .lsp-side-text, .lsp-side-inner, .lsp-side-clocks"),
                    $view : $wrap.find("#auth-discovered .lsp-side-all-features"),
                    $plans: $wrap.find("#auth-discovered .choise-plan"),
                    $clocks: $wrap.find("#auth-discovered .lsp-side-clocks"),
                    $behind: $wrap.find("#auth-discovered .behind-message"),
                    $btnTrial : $wrap.find("#auth-discovered .choise-plan #get-trial"),
                    $btnsMain : $wrap.find("#auth-discovered .discovered-buttons"),
                    $btnsPlan : $wrap.find("#auth-discovered .choise-plan .plan-buttons"),
                    $btnNotNow: $wrap.find("#auth-discovered .not-now"),
                },
            },
            groups: {
                $switchers : $wrap.find(".switch-screen"),
                $services  : $wrap.find(".auth-service"),
                $bodies    : $wrap.find(".auth-body, .lsp-banner-content"),
                $buttons   : $wrap.find("button"),
                $forms     : $wrap.find("form"),
                $pricing   : $wrap.find(".premium-pricing"),
                $currency  : $wrap.find(".currency"),
                $username  : $(".auth-print-username"),
                $authonly  : $(".auth-only-visible"),
                $getPremium: $wrap.find(".lsp-get-premium-button button"),
                $trial : {
                    possible  : $wrap.find(".trial-possible"),
                    impossible: $wrap.find(".trial-impossible"),
                } 
            },
            expire: {
                $block: $(".options-header-account-info"),
                $message: $(".options-header-account-info span span"),
            }
        } //self.obj
        
        self.obj.tabs.discovered.$side.on("click", function(){
            self.state.noclose = true;
        });
        
        self.obj.groups.$bodies.on("click", function(){
            self.state.noclose = true;
        });
        
        $wrap.on("click", function(){
            if(self.state.noclose) self.state.noclose = false;
            else{
               self.modalClose(); 
            }
        });
        
        $wrap.find(".modal-close").on("click", function(){
            self.modalClose();
        });
        
        self.obj.tabs.discovered.$site.on("click", function(){
            self.openBuyPage("choice");
        });
        
        self.obj.tabs.discovered.$login.on("click", function(){
            self.wait(true);
            self.check(true, false, true, function(){
                var login = String(self.getLogin());
                
                if(login.length > 20) login = login.split("@").shift();
                
                self.obj.tabs.discovered.$login.find("span").text(login);
                
                self.obj.tabs.discovered.$btnNotNow.text(translate("auth_d_close"));
                
                setTimeout(function(){
                    //self.reloadAllPages();
                }, 900);
            });
        });
        
        self.obj.tabs.discovered.$btnTrial.on("click", function(){
            self.getTrial();
        });
        
        
        $(document).on("mousemove", function(){
            self.state.touch = Date.now();           
        });
        
        $(document).on("keyup", function(){
            self.state.touch = Date.now();
        });
        
        setTimeout(function(){
            self.obj.$tooltip.tooltip();
        }, 450);
        
        //self.state.loaded = true;
        
        self.init();
    });
    
    this.init = function(){
        self.listeners();
        
        if(browserName(true) == 'ff' && localStorage.getItem("auth-need-logout")){
            localStorage.removeItem("auth-need-logout");
            self.logout(false);
        }else{
            getSettingsValue("auth-info", null, function(info) {            
                if(info){
                    var info = JSON.parse(info);
                    self.state.info = info;
                    self.state.auth = true;
                    self.updateAccuweatherKey();
                }//if

                self.authButton();
                self.state.loaded = true;

                getSettingsValue("already-display-promotion", "C3F0X", function(data) {
                    if(data == "C3F0X") self.state.promo = true;
                });
            });
        }//else
        
        $(document).on("keyup", function(e){
            if(e.keyCode == 27){
                self.modalClose(); 
            }//if
        });
        
        
        /*
        BRW_getAcceptLanguages(function(languages){
            var hasRuLanguage = languages.indexOf("ru") != -1;
           
            if(hasRuLanguage){
                self.state.links.billing += "?lang=ru";
            }
        });
        */
        
        if(document.location.hash){
            var hash = String(document.location.hash.split('?').shift()).split('-');
            var now = Date.now();
            if(!hash[1] || (now - parseInt(hash[1]) < 3000)){
                if(hash[0] == '#login'){
                    self.check(true);
                }else if(hash[0] == '#getPro'){
                    self.openBuyPage("choice");
                    //self.auth();
                }
            }//if
        }//if
    },
    
    this.listeners = function(){
        self.obj.groups.$switchers.on("click", function(){
            self.tab($(this).attr("target"));
        });
        
        self.obj.groups.$services.on("click", function(e){
            e.preventDefault();
            self.otherLogin($(this).attr("service"));
        });        
        
        self.obj.groups.$getPremium.on("click", function(e){
            e.preventDefault();
            self.openBuyPage("year");
        });
        
        self.obj.groups.$forms.off("submit").on("submit", function(e){
            e.preventDefault();
            self.submit($(this));
        });  
    },
        
    this.updateAccuweatherKey = function(callback){
        var last = parseInt(localStorage.getItem("weather-hash-date") || 0);
        var now  = Date.now();
        
        if((now - last) > (24 * 60 * 60 * 1000)){
            BRW_ajax(
                self.API.weather
                ,function(response){//success
                    if(response && !response.error && response.body && response.body.api){
                        localStorage.setItem("weather-hash", response.body.api);
                        localStorage.setItem("weather-hash-date", now);
                    }
                    
                    if(callback) callback();
                }//success
                ,function(err){//error
                    if(callback) callback();
                }//error
            );
        }else{
            if(callback) callback();
        }
    },
    
    this.getTrial = function(){
        self.wait(true);
        
        self.askTrial(
            function(){//success
                self.obj.tabs.discovered.$btnNotNow.text(translate("auth_d_close"));
                
                self.obj.tabs.discovered.$plans.css("display","none");
                self.obj.tabs.discovered.$behind.css("display","block");
                
                self.getInfo(function(){
                    setTimeout(function(){
                        self.afterProLogin(true);
                        //self.infoTrial();
                    }, 230);
                });
                
                setSettingsValue("already-display-promotion", "04ZNX");
                
                self.loginSuccess();
            },
            function(message){//error
                if(!message) message = translate("auth_trial_activate_failed");
                
                $.jGrowl(message, { "life" : 3000, position: "top-left"});
                self.wait(false);
            }
        );
    },
        
    this.askTrial = function(successFunc, errorFunc){
        var xhr = BRW_ajax(
            self.API.trial+"/trial"
            ,function(response){//success
                if(response && response.state == "active"){
                    if(successFunc) successFunc(response);
                }else{
                    errorFunc();
                }//else
            }//success
            ,function(err){//error
                console.log("askTrial ERR");
                if(err && err.responseJSON) var message = err.responseJSON.message;
                else var message = false;
                
                if(errorFunc) errorFunc(message);
            }//error
            ,{
                data: JSON.stringify({service:"lst"}),
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                headers: {
                    "Authorization": "Cookie lsp_"+browserName(true)
                },
            }
        );  
    },
    
    this.infoTrial = function(){
        if(self.mode.trial_disabled) return false;
        
        var xhr = BRW_ajax(
            self.API.trial+"/trial"
            ,function(response){//success
                //console.log(response);
                if(response && response.daysRemain != "undefined"){
                    //setSettingsValue("already-display-promotion", "04ZNX");
                    self.state.trialInfo = response;
                    self.state.promo = false;
                    self.authButton();
                    
                    self.obj.expire.$block.removeClass("hide");
                    self.obj.expire.$message.attr("title", translate("auth_trial_will_expire_title"));
                    
                    var message = String(translate("auth_trial_will_expire")).replace("N", response.daysRemain);
                    
                    self.obj.expire.$message.text(message);
                    self.obj.tabs.discovered.$behind.text(message);
                    
                    self.obj.expire.$message.unbind("click").on("click", function(){
                        self.openBuyPage("choice");
                    });
                }//if
            }//success
            ,function(err){//error
                //console.log("infoTrial ERR", err);
            }//error
            ,{
                data: JSON.stringify({service:"lst"}),
                type: "GET",
                dataType: "json",
                contentType: "application/json",
                headers: {
                    "Authorization": "Cookie lsp_"+browserName(true)
                },
            }
        );  
    },
    
    this.isTrialPossible = function(){
        if(self.mode.trial_disabled) return false;
        else return self.state.promo;
    },
        
    this.openBilling = function(){
        if(self.isPremium()){
            openUrlInNewTab(self.state.links.billing);
        }else{
            openUrlInNewTab(self.state.links.pricing);
        }//else
    },
        
    this.openBuyPage = function(period){
        self.currencyGet(function(currency){
            if(String(currency) == "ru") var hasRuPaid = true;
            else var hasRuPaid = false;
            
            //console.log("openBuyPage", period, currency);
            
            if(period == "pricing"){
                openUrlInNewTab(self.state.links.pricing);
            }else if(period != "choice" && !hasRuPaid){//Pay by card
                /* // Task 458
                if(hasRuPaid) openUrlInNewTab(self.state.links.buyRuM);
                else openUrlInNewTab(self.state.links.buyEnM);
                */
                
                self.checkSchedule();
                
                if(period == "year"){
                    if(hasRuPaid) openUrlInNewTab(self.state.links.buyRuY);
                    else openUrlInNewTab(self.state.links.buyEnY);
                }else{
                    if(hasRuPaid) openUrlInNewTab(self.state.links.buyRuM);
                    else openUrlInNewTab(self.state.links.buyEnM);
                }//else
                
            }else{
                if(period == "choice"){
                    if(self.state.tab != "discovered") self.tab("discovered");
                                    
                    self.obj.tabs.discovered.$behind.css("display", "none");
                    /*
                    if(false){ // task 436
                        setTimeout(function(){
                            if(self.state.auth){
                                self.obj.tabs.discovered.$btnsMain.fadeOut("fast", function(){
                                    self.obj.tabs.discovered.$plans.fadeIn();//css("display","block");
                                    self.obj.tabs.discovered.$btnsPlan.fadeIn();//css("display","block");
                                });//css("display","none");
                            }//if                        

                            self.wait(false);
                        }, 210);
                        
                        self.obj.tabs.discovered.$btnsPlan.find("button").unbind("click").on("click", function(){
                            self.openBuyPage($(this).attr("period"));
                        });
                    }//else
                    */
                }else if(period == "year"){
                    self.checkSchedule();
                    if(hasRuPaid) openUrlInNewTab(self.state.links.buyRuY);
                    else openUrlInNewTab(self.state.links.buyEnY);
                }else{
                    self.checkSchedule();
                    if(hasRuPaid) openUrlInNewTab(self.state.links.buyRuM);
                    else openUrlInNewTab(self.state.links.buyEnM);
                }//else
            }//else
        });
    },
        
    this.checkSchedule = function(){
        localStorage.setItem("auth-check-schedule", Date.now());
        AUTH.autoCheck(60 * 1000);
    },
        
    this.authButton = function(mode){
        if(isAuthEnable()){
            self.state.$head.find(".auth-head").remove();

            $span = $("<span>").addClass("auth-head");

            $menu = {
                auth : $(".menu-get-auth"),
                user : $(".menu-username"),
                pro  : $(".menu-get-pro"),
                day7 : $(".menu-weather-forecast")
            };

            $menu.auth.css("display","block");
            
            var $become = $("<span>").addClass("btn btn-success head-become-premium").text(translate("become_premium"));
            $become.unbind("click").on("click", function(){
                self.openBuyPage("pricing");
            });
            
            if(this.state.auth){
                localStorage.setItem("auth-has-been-logged", 1);

                var $user = $("<span>").addClass("auth-username").text(this.state.info.login);
                
                //self.obj.groups.$username.text(this.state.info.login);
                //self.obj.groups.$authonly.removeClass("hide");

                $menu.auth.text(translate("menu_float_logout"));
                //$menu.user.css("display","block").find("div span").text(this.state.info.login).attr("title", this.state.info.login);
                $menu.user.css("display","block").find("div span").text(this.state.info.login).attr("title", translate("auth_username_float_title"));

                if(this.isPremium()){
                    $billing = $("<button>")
                        .addClass("btn btn-info btn-head btn-margin-right")
                        .text(translate("auth_billing"))
                    ;

                    $billing.on("click", function(){
                        self.openBilling();
                    });

                    $user.append(
                        $("<img>")
                            .addClass("auth-pro")
                            .attr("src", "/pages/common/auth/site_images/pro.png")
                    );

                    $span.append($user);
                    $span.append($billing);

                    //$menu.pro.text(translate("auth_billing"));
                    $menu.pro.addClass("hide");
                    $menu.day7.addClass("hide");
                    
                    if(self.state.trialInfo && self.state.trialInfo.daysRemain != "undefined"){
                        $menu.pro.removeClass("hide");
                        $menu.day7.removeClass("hide");
                        
                        $menu.pro.unbind("click").on("click", function(){
                            self.openBuyPage("choice");
                        });
                        
                        if(self.obj.tabs.discovered.$behind.css("display") != "block"){
                            self.obj.tabs.discovered.$btnsMain.css("display","none");
                            self.obj.tabs.discovered.$btnsPlan.css("display","block");
                        }//if
                        
                        //localStorage.setItem("auth-show-pro-buttons", 1);
                        localStorage.removeItem("auth-hide-pro-buttons");
                    }else{
                        $menu.pro.unbind("click").on("click", function(){
                            if(self.isPremium()) self.openBilling();
                        }).find("span").text(translate("menu_float_get_pro_buy"));
                        
                        $menu.pro.addClass("hide");
                        $menu.day7.addClass("hide");
                        
                        self.obj.tabs.discovered.$btnsMain.css("display","none");
                        self.obj.tabs.discovered.$btnsPlan.css("display","none");
                        
                        if(self.obj.tabs.discovered.$behind.css("display") != "block"){
                            self.obj.tabs.discovered.$behind.css("display","block").text(translate("auth_pro_message"));
                        }
                        
                        localStorage.setItem("auth-hide-pro-buttons", 1);
                    }//else
                    
                    self.obj.tabs.discovered.$btnNotNow.text(translate("auth_d_close"));
                }else{
                    //localStorage.setItem("auth-show-pro-buttons", 1);
                    localStorage.removeItem("auth-hide-pro-buttons");
                    
                    $menu.pro.removeClass("hide");
                    $menu.day7.removeClass("hide");
                    
                    $span.append($become);
                    $span.append($user);
                    
                    $menu.pro.unbind("click").on("click", function(){
                        self.openBuyPage("pricing");
                        //self.openBuyPage("choice");
                    });
                }//else
                
                $menu.pro.css("display","block");

                $menu.user.unbind("click").on("click", function(){
                    self.openBilling();
                });

                $button = $("<button>")
                    .addClass("btn btn-info btn-head")
                    .attr("title", this.state.info.login)
                    .text(translate("auth_logout"))
                ;

                $button.on("click", function(){
                    self.logout(true);
                });

                $menu.auth.on("click", function(){
                    self.logout(true);
                });

                $span.append($button);
            }else{
                $button = $("<button>").addClass("btn btn-info btn-head").text(translate("auth_login"));
                $menu.auth.text(translate("menu_float_login"));
                //$menu.pro.css("display","none");
                $menu.user.css("display","none");
                $(".auth-username").remove();
                $(".auth-head").remove();

                $menu.auth.on("click", function(){
                    self.check(true);
                });

                $button.on("click", function(){
                    self.check(true);
                });
                
                $span.append($become);
                $span.append($button);
                
                $menu.pro.removeClass("hide").show().unbind("click").on("click", function(){
                    self.openBuyPage("pricing");
                    //self.auth();
                });
                
                $menu.day7.removeClass("hide");
            }//else
            
            $menu.day7.unbind("click").on("click", function(){
                self.tab("discovered", "weather");
            });

            self.state.$head.prepend($span);
        }//if
    },
        
    this.logout = function(reload){
        self.state.auth = false;
        self.state.info = false;
        setSettingsValue("auth-info", null);
        localStorage.removeItem("auth-login");
        localStorage.removeItem("auth-need-logout");
        
        self.GA("logout");
        
        self.POST(
            {//Send data
                "action": "user:logout"
            }, function(response){//Success
                self.logOutActions(reload);
            }, function(error){//Error
                self.logOutActions(reload);
            }
        );        
    },
        
    this.logOutActions = function(reload){
        setTimeout(function(){
            self.authButton();
            self.afterProDisabled();
            localStorage.setItem("auth-state", 0);
            localStorage.removeItem("clock-size");
            if(typeof BRW_reloadPanel == 'function') BRW_reloadPanel();
        }, 150);
        
        if(reload) setTimeout(function(){
            self.reloadAllPages();
        }, 390);
    },
    
    this.loginSuccess = function(callBack){
        self.GA("login");
        self.wait(true);
        
        self.authButton();
        
        localStorage.setItem("auth-state", 1);
        
        setTimeout(function(){
            self.check(false, false, false, function(){
                if(callBack) callBack();
                self.wait(false);
                
                if(!self.isPremium()){
                    if(self.state.buyJustShown){
                        self.openBuyPage(self.state.buyJustShown);
                        self.modalClose();
                    }else{
                        self.openBuyPage("choice");
                    }
                }else{
                    self.afterProLogin();
                }//else              
                
                if(typeof BRW_reloadPanel == 'function') BRW_reloadPanel();
            });
        }, 150);
    },
        
    this.reloadAllPages = function(){
        setTimeout(function(){
            getSettingsTabPages(reloadTabPages);
            getOptionsTabPages(reloadTabPages);
            getFavoriteTabPages(reloadTabPages);
            getNetTabPages(reloadTabPages);
            
            setTimeout(function(){
                document.location.reload();
            }, 4500);
        }, 150);
    },
    
    this.modalClose = function(){
        self.state.tab = false;
        self.obj.$wrap.hide();
        self.obj.tabs.discovered.$behind.css("display","none");
        self.obj.$screens.addClass("hide");
        
    },    
    this.modalShow = function(){
        self.obj.$curt.css("display", "block");
        self.obj.$wrap.show();
        
        if(!self.state.tab){
            self.tab("login");
        }
    },
    
    this.afterProLogin = function(noModalClose){
        if(!noModalClose) self.modalClose();
        if(typeof displaySearchFormProviderType == "function") displaySearchFormProviderType();
        
        self.updateAccuweatherKey(function(){
            setTimeout(()=>{
                if(typeof initLocationWeather == "function") initLocationWeather();
                if(typeof weatherAdvancedClickHandler == "function") weatherAdvancedClickHandler();
            }, 250);
        });
        
        var passWaitN = 0;
        var passWait = setInterval(function(){
            if(typeof PASS != "undefined" && typeof PASS.render == "function"){
                clearInterval(passWait);
                PASS.render();
                PASS.fill(true);
            }else if(++passWaitN > 15) clearInterval(passWait);
        }, 250);
        
        setTimeout(()=>{
            if(typeof RelaxPlayer == "object" && typeof RelaxPlayer.once == "function") RelaxPlayer.once("redrawPRO");
            if(typeof RelaxTune == "object" && typeof RelaxTune.once == "function") RelaxTune.once("redrawPRO");
        }, 1000);
    },
        
    this.afterProDisabled = function(){
        if(typeof initLocationWeather == "function"){
            initLocationWeather();
        }
        
        if(typeof resetSearchFormProviderType == "function"){
            resetSearchFormProviderType();
        }
    },
        
    this.autoCheck = function(interval){
        setInterval(function(){
            var last = localStorage.getItem('auth-last-auto-update') || 0;
            var now = Date.now();
            
            if(
                //((now - self.state.touch) >= interval) &&
                ((now - last) >= interval)
            ){
                AUTH.check(false, false, true, false, true);
            }//if
        }, 10000);
    },
        
    this.check = function(login, callBack, force, getInfoCallBack, passive){
        self.wait(false);
        
        passive = passive || false;
        
        //console.debug("AUTH check", passive);
        
        if(!self.state.auth || force){
            var state = parseInt(localStorage.getItem("auth-state") || 0);
            
            if(login || state || !self.state.checked){
                self.wait(true);
                self.state.checked = true;
                localStorage.setItem('auth-last-auto-update', Date.now());
                
                self.POST(
                    {//Send data
                        "action": "user:authstate",
                    }, function(response){//Success
                        self.state.networkError = false;
                        
                        if(response && response.body.authorized){
                            self.state.auth = true;
                            
                            self.getInfo(function(){                                
                                if(getInfoCallBack) getInfoCallBack();
                                else{
                                    if(login && !self.isPremium()){
                                        self.openBuyPage("choice");
                                    }else{
                                        self.afterProLogin(true);
                                    }
                                }//else
                                
                                localStorage.setItem("auth-state", 1);
                            }, passive || false);
                            
                            if(callBack) callBack();
                        }else if(!passive){
                            if(self.state.info && self.state.info.user_id){
                                self.logout(/*true*/);
                            }//if
                            
                            if(login){
                                self.auth();
                            }//if
                            
                            localStorage.setItem("auth-state", 0);
                            if(typeof BRW_reloadPanel == 'function') BRW_reloadPanel();
                            
                            if(getInfoCallBack) getInfoCallBack();
                        }
                        self.wait(false);
                    }, function(error){//Error                        
                        self.wait(false);
                        self.state.networkError = true;
                        
                        
                        if(parseInt(localStorage.getItem("auth-state") == 1)){
                            $.jGrowl(translate("error_auth_network"), { "life" : 2500, position: "top-left"});
                        }//if
                    }
                );
            }else{
                //console.log("reject", Date.now());
                //if(callBack) callBack();
            }//else
        }else{
            self.authButton();
            if(callBack) callBack();
        }//else
    },   
        
    this.getInfo = function(successCallBack, passive){
        //console.debug("getInfo");
        
        //console.trace();
        
        if(self.state.auth){
            self.POST(
                {//Send data
                    "action": "user:info"
                }, function(response){//Success
                    if(response && response.errorCode == 0){
                        if(response.body && response.body.premium){
                            
                            if(response.body.premium.active == true || response.body.premium.active == "true"){
                                response.body.source = "x03Bfc";
                                
                                var trialTime = 14 * 24 * 60 * 60 * 1000;
                                var dateEnd   = Date.parse(response.body.premium.end_date);
                                var dateStart = Date.parse(response.body.premium.start_date);
                                //var now = Date.now();
                                
                                if(dateEnd - dateStart == trialTime) self.infoTrial();
                            }else if(!passive){                        
                                response.body.source = "a54fB0";
                                self.afterProDisabled(true);
                            }//else
                            
                        }//if
                        
                        if(!passive || response.body.source == "x03Bfc"){
                            setSettingsValue("auth-info", JSON.stringify(response.body));
                            localStorage.setItem("auth-login", response.body.login);

                            self.state.info = response.body;
                        }
                        
                        self.authButton();
                        
                        if(successCallBack) successCallBack();
                    }else{
                        self.errorCodeMessage(response.errorCode, false);
                        self.authButton();
                    }
                    
                    self.state.loaded = true;
                }, function(error){//Error
                    self.errorCodeMessage(error.errorCode, false);
                    self.authButton();
                }
            );
        }else{
            console.log("No user info");
            localStorage.removeItem("auth-login");
        }//else
    },
        
    this.auth = function(){
        self.wait(false);
        
        if(localStorage.getItem("auth-has-been-logged") == 1){
            self.tab("login");
        }else{
            self.tab("signup");
        }//else
    },
    
    this.otherLogin = function(service, callBack){
        //var url = "https://everhelper.me/auth/openidconnect.php?env=app&provider="+service;
        var url = "https://livestartpage.everhelper.me/auth/openidconnect.php?env=app&provider="+service;
        var params = "width=600,height=400,left=100,top=150,menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes";
        var openedWindow = window.open(url, "Auth", params);
        
        var wait = 0;
        var timer = setInterval(function() {
            /*
            if(false && openedWindow.closed) {  
                wait++;
                
                if(wait == 3){
                    clearInterval(timer);  

                    self.loginSuccess();
                }//if
            }//if
            */
            
            self.loginSuccess(function(){
                if(openedWindow && openedWindow.close) openedWindow.close();
            });
            
            if(openedWindow.closed) {  
                wait++;
                if(wait == 3){
                    clearInterval(timer);
                }//if
            }//if
        }, 1700); 
    },
        
    this.submit = function($form, callBack){
        var send = self.getForm($form);
        
        self.obj.$wrap.find(".lsp-main-error-active").removeClass("lsp-main-error-active");
        
        if(send.valid){
            self.wait(true);
            
            switch($form.attr("name")){
                case "auth-login":
                    self.POST(
                        {//Send data
                            "action": "user:auth",
                            "body": send.form
                        }, function(response){//Success
                            if(response.errorCode == 0){//Auth
                                self.loginSuccess(callBack);
                            }else{
                                localStorage.setItem("auth-state", 0);
                                self.errorCodeMessage(response.errorCode);
                            }//else
                            
                            self.wait(false);
                        }, function(error){//Error
                            //console.log("ERR", error);                            
                            self.errorCodeMessage(error.errorCode);
                            self.wait(false);
                        }
                    );
                    
                break;
                    
                case "auth-signup":
                    send.form.service = "lst";//"lsp";
                    
                    self.POST({ //Send data
                        "action": "user:register",
                        "body": send.form
                    }, function (response) { //Success
                        if(response.errorCode == 0){//Auth
                            self.loginSuccess(callBack);
                        }else{
                            localStorage.setItem("auth-state", 0);
                            self.errorCodeMessage(response.errorCode);
                        }//else
                        
                        self.GA("registration");
                        self.wait(false);
                    }, function (error) { //Error
                        self.errorCodeMessage(error.errorCode);
                        self.wait(false);
                    });

                break;
                    
                case "auth-restore":
                    self.POST(
                        {//Send data
                            "action" : "remind_password",
                            "email"  : send.form.email
                        }, function(response){//Success
                            if(response.errorCode == 0){//Auth
                                self.showMessage("restore_success", "error", true);
                            }else{
                                self.errorCodeMessage(response.errorCode);
                            }//else
                            self.wait(false);
                        }, function(error){//Error
                            //console.log("ERR", error);
                            self.errorCodeMessage(error.errorCode);
                            self.wait(false);
                        }
                    );
                break;
            }//switch
        }//if
        
    },
        
    this.wait = function(status){
        if(
            !self || !self.obj ||
            !self.obj.$wrap || !self.obj.groups ||
            !self.obj.groups.$buttons
        ){
            return;
        }
        
        if(status == true){
            self.obj.$wrap.css("cursor","wait");
            self.obj.groups.$buttons.css("cursor","wait");
        }else{
            self.obj.$wrap.css("cursor","default");
            self.obj.groups.$buttons.css("cursor","pointer");
        }//else
    },
    
    this.errorCodeMessage = function(errorCode){
        var text = translate("server_code_"+String(Math.abs(errorCode))) || ("Error "+errorCode);
        self.showMessage(text, "error");
    },
        
    this.showMessage = function(message, reason, transl){
        if(transl) var text = translate(message);
        else var text = message;
        
        if(self.obj.tabActive) self.obj.tabActive.find(".lsp-main-error-text").addClass("lsp-main-error-active").text(text);
    },
        
    this.getForm = function($form){
        var form = {valid:true, form:{}, errors:{}};
        
        $form.find("input").each(function(){
            var $el     = $(this);
            var $parent = $el.parent();
            $parent.removeClass("lsp-error");
                        var name  = $el.attr("name");
            var type  = $el.attr("type");
            var value = $el.val();
                        
            switch(type){
                case 'text'     : 
                case 'email'    :
                case 'password' :
                    form.form[name] = value;
                    
                    if($(this).attr("min")){
                        if(value.length < $(this).attr("min")){
                            form.errors[name] = "Minimum 8 characters";
                        }//if
                    }//if

                    if($(this).attr("require") == "required"){
                        if(!value || !value.length){
                            form.errors[name] = "Required";
                        }//if
                    }//if

                    if($(this).attr("same")){
                        if(value != form.form[$(this).attr("same")]){
                            form.errors[name] = "Isn't same";
                        }//if
                    }//if
                    
                    if(type == "email"){
                        var pattern = /^([a-z0-9_\.-])+@[a-z0-9-]+\.([a-z]{2,4}\.)?[a-z]{2,4}$/i;
                        
                        if(!pattern.test(value)){
                            form.errors[name] = "Email isn't correct";
                        }//if
                    }//if
                break;
            }//switch
            
            if(form.errors[name]){
                $parent.addClass("lsp-error");
                
                if(form.valid){
                    $el.focus();
                    form.valid = false;
                }//if
                
                $el.on("change", function(){
                    $parent.removeClass("lsp-error");
                });
            }//if
        });
        
        return form;
    },
    
    this.currencyLocal = function(callback){
       BRW_getAcceptLanguages(function(languages){
            var lang = "en";
            
            for(var k in self.state.ru_paid){
                if(languages.indexOf(self.state.ru_paid[k]) != -1){
                    lang = "ru";
                }//if
            }//for
            
            self.state.currncy = lang;
            
            //console.log("Currency from browser: ", self.state.currncy);
           
            if(callback) callback(self.state.currncy);
       });
    },
        
    this.currencyGet = function(callback){
        if(self.state.currncy){
            if(callback) callback(self.state.currncy);
        }else{
            BRW_ajax(
                self.API.lang
                ,function(response){//success
                    if(response && !response.error && response.body && response.body.lang){
                        self.state.currncy = response.body.lang;
                        //console.log("Currency from site: ", self.state.currncy);
                        if(callback) callback(self.state.currncy);
                    }else{
                        //console.log("Can not define currency from site", response);
                        self.currencyLocal(callback);
                    }//else
                }//success
                ,function(err){//error
                    //console.log("Currency from site error", err);
                    self.currencyLocal(callback);
                }//error
            );
        }
    },
        
    this.currencyText = function(){
        self.currencyGet(function(currncy){
            var language = (String(currncy) == "ru" ? "ru" : "en");
            
            self.obj.groups.$currency.each(function(){
                var lang = $(this).attr("currency").replace("_lang", "_"+language);
                $(this).attr("lang", lang);
                    autoTranslateElement($(this));
            });
        });
    },
        
    this.tab = function(Tab, Mode){
        self.currencyText();
        
        self.state.tab = Tab;
        self.modalShow();
        self.wait(false);
        
        if(self.isTrialPossible()){
            self.obj.tabs.discovered.$plans.addClass("tight");
            self.obj.groups.$trial.possible.css("display","initial");
            self.obj.groups.$trial.impossible.css("display","none");
        }else{
            self.obj.tabs.discovered.$plans.removeClass("tight");
            self.obj.groups.$trial.impossible.css("display","initial");
            self.obj.groups.$trial.possible.css("display","none");
        }
        
        //self.obj.groups.$pricing.text(String(self.obj.groups.$pricing.text()).split('DOLLAR').join('$'));
        
        for(var key in self.obj.tabs){
            self.obj.tabs[key].$el.hide().css("display","none");
        }//for
        
        if(Tab != "discovered"){
            self.obj.tabs[Tab].$el.find(".aside-container").prepend(self.obj.$aside);
            self.obj.$aside.css("display","block");
            self.obj.$screens.addClass("overflow-y-visible");
            
            if(Tab == "login"){
                setTimeout(()=>{
                    self.obj.tabs.login.$email.focus(); 
                }, 100);
            }else if(Tab == "signup"){
                setTimeout(()=>{
                    self.obj.tabs.signup.$email.focus(); 
                }, 100);
            }
        }else{//discovered
            if(self.obj.tabs.discovered.$behind.css("display") != "block"){
                self.obj.tabs.discovered.$btnsMain.css("display","block");
                self.obj.tabs.discovered.$plans.css("display","none");
            }//if
            
            //Left side
            if(self.state.auth){
                self.obj.tabs[Tab].$site.css("display","block");
                self.obj.tabs[Tab].$login.css("display","none");
                //self.openBilling();
            }else{
                self.obj.tabs[Tab].$login.css("display","block");
                self.obj.tabs[Tab].$site.css("display","none");
            }//else
            
            //Right side
            self.obj.tabs.discovered.$el.removeClass("discovered-all").removeClass("discovered-clock");
            self.obj.tabs.discovered.$sides.css("display","none");
            self.obj.tabs.discovered.$head.html("");
            self.obj.tabs.discovered.$view.removeClass("lsp-side-all-features-white");
            self.obj.tabs.discovered.$behind.css("display","none");
            
            switch(Mode){
                case "passcode":
                    self.obj.tabs.discovered.$head.css("display","initial")
                        .append(
                            $("<big>").text(translate("auth_banner_passcode_head"))
                        )
                        .append(
                            $("<span>").text(translate("auth_banner_passcode_text"))
                        )
                    ;
                    
                    if(translate("language") == "ru"){
                        self.obj.tabs.discovered.$img.attr("src", "/pages/common/auth/site_images/protect-side-ru.png");
                    }else{
                        self.obj.tabs.discovered.$img.attr("src", "/pages/common/auth/site_images/protect-side.png");
                    }//else
                    
                    self.obj.tabs.discovered.$img.css("display","initial");
                    self.obj.tabs.discovered.$view.css("display","initial");
                break;
                
                case "weather":
                    self.obj.tabs.discovered.$head.css("display","initial").text(translate("auth_high_priority_weather"));
                    self.obj.tabs.discovered.$img.css("display","initial").attr("src", "/pages/common/auth/site_images/weather-side.png");
                    self.obj.tabs.discovered.$view.css("display","initial");
                break;
                
                case "clock":
                    self.obj.tabs.discovered.$head.css("display","initial").text(translate("auth_customize_clocks_size"));
                    self.obj.tabs.discovered.$img.css("display","initial").attr("src", "/pages/common/auth/site_images/clock-side.png");
                    self.obj.tabs.discovered.$el.addClass("discovered-clock");
                    self.obj.tabs.discovered.$view.css("display","initial");
                    self.obj.tabs.discovered.$clocks.css("display","block");
                break;
                
                case "relax":
                    if(translate("language") == "ru"){
                        self.obj.tabs.discovered.$img.attr("src", "/pages/common/auth/site_images/meditation-side-ru.png");
                    }else{
                        self.obj.tabs.discovered.$img.attr("src", "/pages/common/auth/site_images/meditation-side.png");
                    }//else
                    
                    self.obj.tabs.discovered.$img.css("display","initial");
                    self.obj.tabs.discovered.$view.css("display","initial").addClass("lsp-side-all-features-white");
                break;
                
                case "all":
                default:
                    
                    
                    self.obj.tabs.discovered.$inner.css("display","initial").append(self.obj.$aside);
                    self.obj.tabs.discovered.$view.css("display","none");
                    self.obj.tabs.discovered.$el.addClass("discovered-all");
                break;
            }//switch
            
            self.obj.tabs.discovered.$view.unbind("click").on("click", function(){
                self.tab("discovered", "all");
            });
            
            self.obj.$screens.removeClass("overflow-y-visible");
            
            if(true){ // task 436
                self.obj.tabs.discovered.$btnsMain.hide();
                self.obj.tabs.discovered.$plans.show();
                self.obj.tabs.discovered.$btnsPlan.show();

                setTimeout(function(){
                    if(self.state.auth || true){
                        self.obj.tabs.discovered.$btnsPlan.find("button").unbind("click").on("click", function(){
                            var period = $(this).attr("period");
                            self.openBuyPage(period);
                        });
                    }else{ // Disabled Task #665
                        self.obj.tabs.discovered.$btnsPlan.find("button").unbind("click").on("click", function(){
                            var period = $(this).attr("period");
                            self.state.buyJustShown = period;
                            self.auth();
                            
                            /*
                            if(localStorage.getItem("auth-has-been-logged") == 1){
                                self.tab("login");
                            }else{
                                self.tab("signup");
                            }//else
                            */
                        });
                    }

                    self.wait(false);
                }, 210);
            }//if
            
        }//else
        
        self.obj.tabs[Tab].$el.show().css("display","block");
        
        self.obj.tabActive = self.obj.tabs[Tab].$el;
        
        self.obj.$wrap.find(".lsp-main-error-active").removeClass("lsp-main-error-active");
        
        self.obj.$screens.removeClass("hide").css("display","block");
        
        return self.obj.tabs[Tab].$el;
    },
        
    this.isPremium = function(action, callBack, side){
        if(
            self.state.auth == true &&
            localStorage.getItem("test-features") === "on"
        ) return true;

        if(self.getLocalPremiumState()){
            return true;
        }else{
            if(action && action == "discovered"){
                var forcePopup = setTimeout(()=>{
                    self.discovered(side);
                }, 250);
                
                self.check(false, false, true, function(){
                    clearTimeout(forcePopup);
                    
                    if(self.getLocalPremiumState()){
                        setTimeout(function(){
                            //self.reloadAllPages();
                        }, 900);
                    }else{
                        self.discovered(side);
                    }
                });
            }//if
            
            return false;
        }//else
    },
        
    this.getLocalPremiumState = function(){
        if(
            self.state &&
            self.state.info &&
            self.state.info.source == "x03Bfc"
        ){
            return true;
        }else{
            return false;
        }
    },
        
    this.discovered = function(side){
        self.tab("discovered", side || "all");
        self.GA("banner");
    },
    
    this.GA = function(action, label, value){
        sendToGoogleAnaliticMP(function() {
            gamp('send', 'event', 'auth', action, label, value);
        });
    },
        
    this.getLogin = function(){
        if(
            self.state &&
            self.state.info &&
            self.state.info.username
        ){
            return self.state.info.login;
        }else{
            return "Not authorized";
        }//else
    },
    
    this.POST = function(send, callBack, errorFunc, options){
        if(options && options.server) var server = options.server;
        else var server = self.API.server;
        
        var xhr = BRW_post(
            server, JSON.stringify(send),

            function(result){//success
                if(
                    (result.errorCode == 0) || 
                    (
                        (options && options.errors) &&
                        (options.errors === true || options.errors.indexOf(result.errorCode) > -1)
                    )
                ){//success
                    if(callBack) callBack(result);//.body, result.errorCode);
                }else{//error
                    if(errorFunc) errorFunc(result);
                }//else

                xhr = null;
            },//success
            function(error){//error
                if(errorFunc) errorFunc(error);
            }//error
        );
    }
};//AUTH
    
    
    