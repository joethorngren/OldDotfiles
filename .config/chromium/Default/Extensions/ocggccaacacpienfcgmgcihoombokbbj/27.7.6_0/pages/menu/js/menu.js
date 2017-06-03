$(function(){
    autoTranslate($("body"));
    
    PANEL = new PanelMenu(); 
    PANEL.init();
    
    $.fn.selectText = function(){
       var doc = document;
       var element = this[0];
       //console.log(this, element);
       if (doc.body.createTextRange) {
           var range = document.body.createTextRange();
           range.moveToElementText(element);
           range.select();
       } else if (window.getSelection) {
           var selection = window.getSelection();        
           var range = document.createRange();
           range.selectNodeContents(element);
           selection.removeAllRanges();
           selection.addRange(range);
       }
    };
});

function PanelMenu(){
    var self = this;

    self.state={
        loggedOut: false,
        shownPro : false
    };

    self.obj = {
        $menu   : $("#menuPanel"),
        li  : {
            $newtab     : $("#menuPanelNewTab"),
            $themes     : $("#menuPanelSelectTheme"),
            $settings   : $("#menuPanelSettings"),
            $contact    : $("#menuPanelContactUs"),
            $logout     : $("#menuPanelLogout"),
            $login      : $("#menuPanelLogin"),
            $saveAll    : $("#menuPanelSaveAllTabs"),
            $saveSome   : $("#menuPanelSaveSomeTabs"),
            $saveCurrent: $("#menuPanelSaveCurrentTab"),
            $getPremium : $("#menuPanelGetPRO"),
            $setAsWrap  : $("#setAsWrap"),
            $setAsNewTab: $("#setAsNewTab"),
        },
        some :{
            $wrap    : $("#saveSomeTabsWrap"),
            $listWrap: $("#tabsListWrap"),
            $list    : $("#tabsList"),
            $name    : $("#newGroupName"),
            $switch  : $("#tabsSwitch"),
            $submit  : $("#newGroupSubmit"),
            $done    : $("#newGroupSubmit .done"),
        },
        btns :{
            $back    : $(".backButton")
        }
    };

    this.init = function(){
        self.obj.li.$newtab.unbind("click").on("click", function(e){
            if($(e.target).attr("id") == "#setAsWrap" || $(e.target).parents("#setAsWrap").length){
                //return false;
            }else{
                e.preventDefault(); e.stopPropagation();
                openUrlInNewTab(extensionGetUrl("/pages/newtab/newtab.html"));
            }//else
        });

        self.obj.li.$themes.unbind("click").on("click", function(e){
            e.preventDefault(); e.stopPropagation();
            openUrlInNewTab(extensionGetUrl("/pages/options/options.html"));
        });     

        self.obj.li.$settings.unbind("click").on("click", function(e){
            e.preventDefault(); e.stopPropagation();
            openUrlInNewTab(extensionGetUrl("/pages/options/settings.html"));
        });            

        self.obj.li.$contact.unbind("click").on("click", function(e){
            e.preventDefault(); e.stopPropagation();
            //openUrlInNewTab(extensionGetUrl("/pages/options/settings.html#contact-us"));
            openUrlInNewTab(extensionGetUrl("/pages/options/settings.html#navi-faq-feedback"));//New Settings
        });

        self.obj.li.$saveAll.unbind("click").on("click", function(e){
            e.preventDefault(); e.stopPropagation();
            BRW_sendMessage({"command": "saveTabsToNewGroupBg"});
            self.closePanel();
        });    

        self.obj.li.$saveCurrent.unbind("click").on("click", function(e){
            e.preventDefault(); e.stopPropagation();
            BRW_sendMessage({"command": "addCurrentTabToDefault"});
            self.closePanel();
        });

        self.obj.li.$saveSome.unbind("click").on("click", function(e){
            e.preventDefault(); e.stopPropagation();
            self.saveSomeTabs();
        });

        self.obj.some.$switch.unbind("click").on("click", function(e){
            e.preventDefault(); e.stopPropagation();
            self.switchAll();
        });

       self.obj.btns.$back.unbind("click").on("click", function(e){
            e.preventDefault(); e.stopPropagation();
            self.backButton();
        });

        self.obj.li.$login.unbind("click").on("click", function(e){
            e.preventDefault(); e.stopPropagation();
            openUrlInNewTab(extensionGetUrl("/pages/newtab/newtab.html#login-"+Date.now()));
        });
        
        self.obj.li.$getPremium.unbind("click").on("click", function(e){
            e.preventDefault(); e.stopPropagation();
            openUrlInNewTab(extensionGetUrl("/pages/newtab/newtab.html#getPro-"+Date.now()));
        });
        
        self.obj.some.$list.unbind("click", ".item-edit").on("click", ".item-edit", function(e){
            e.preventDefault(); e.stopPropagation();
            self.editTab($(this));
        });
        
        self.logoutButtonPrepare();
        self.getPremium();
        self.setAsNewTab();
    };
    
    this.setAsNewTab = function(){
        if(
            (head.browser.name == 'ff')
            || (!localStorage || localStorage.getItem("browser-mode") != "opera")
            || (typeof setStartPagePremisson != "function" || typeof getStartPagePremisson != "function")
        ) {
            return false;
        }//if
        
        self.obj.li.$setAsWrap.removeClass('hide');
        
        self.obj.li.$setAsNewTab.prop("checked", Boolean(getStartPagePremisson()));
        
        self.obj.li.$setAsNewTab.unbind("change").on("change", function(e){
            setStartPagePremisson($(this).prop("checked") ? 1 : 0);
        });
    };
    
    this.setAsNewTabStatus = function(){
        
    };
    
    this.editTab = function($btn){
        var $li    = $btn.parents("li");
        var $title = $li.find(".site-title");
        var $url   = $li.find(".site-url");
        var $check = $li.find("[type='checkbox']");
        
        if($title.attr("contenteditable") != "true" && $title.attr("contenteditable") !== true && $title.attr("contenteditable") !== "typing" && $title.attr("contenteditable") !== "plaintext-only") {
            self.obj.some.$list.find(".in-edit").find(".item-edit").trigger("click");
            
            var width = $title.width();
            
            $li.addClass("in-edit");
            
            $check.prop("disabled", true);//.attr("data-checked", $check.prop("checked")).prop("checked", false);
            
            $title.attr("contenteditable", "true");
            $url.removeClass("hide").text($title.attr("title")).attr("contenteditable", "true");
            $btn.removeClass("glyphicon-pencil").addClass("glyphicon-floppy-disk");
            
            
            $title.css({
                "width": width,
                "max-width": width
            });
            $url.css({
                "width": width,
                "max-width": width
            });
            
            setTimeout(function(){
                $title.focus().selectText();
            }, 50);
        }else{
            var reject = false;
            var url    = String($url.text());
            var title  = String($title.text());
            
            if(!title.length){
                reject=true;
                $title.animate({"background-color":"#FFA2AB"}, 250).animate({"background-color":"transparent"}, 750);
            }//if
            
            if(url.length < 3){
                reject=true;
                $url.animate({"background-color":"#FFA2AB"}, 250).animate({"background-color":"transparent"}, 750);
            }//if
            
            if(!reject){
                if(url.indexOf('://') == -1 && url.indexOf('about:') !== 0){
                    if(url.indexOf('ftp.') > -1) url = "ftp://"+url;
                    else url = "http://"+url;
                }//if
                
                $check.prop("disabled", false);//.prop("checked", $check.attr("data-checked"));

                $title.attr("contenteditable", false).attr("title", url);
                $url.addClass("hide").attr("contenteditable", false);

                $btn.removeClass("glyphicon-floppy-disk").addClass("glyphicon-pencil");                
                
                $li.removeClass("in-edit");
                
                $title.animate({"background-color":"#99FF33"}, 250).animate({"background-color":"transparent"}, 750);
                $url.animate({"background-color":"#99FF33"}, 250).animate({"background-color":"transparent"}, 750);
            }//else
        }//if
        
        if(self.obj.some.$list.find(".in-edit").length){
            self.obj.some.$list.addClass("has-edit");
        }else{
            self.obj.some.$list.removeClass("has-edit");
        }//else
        
        self.getCheckboxList();
    };
    
    this.getPremium = function(){
        if(typeof getLocalStorage == "function"){
            getLocalStorage("auth-hide-pro-buttons", self.getPremiumDisplay);
        }else{
            self.getPremiumDisplay(localStorage.getItem("auth-hide-pro-buttons") || null);
        }//else
    };
    
    this.getPremiumDisplay = function(value){
        if(parseInt(value) != 1){
            self.state.shownPro = true;
            self.obj.li.$getPremium.removeClass("hide");
            if(typeof setPanelSize == "function") setPanelSize(410, 355);
        }
    };
    
    this.closePanel = function(){
        if(typeof closePanel == "function") closePanel();
        else window.close();
    };   
    
    this.backButton = function(){
        self.obj.some.$wrap.fadeOut(function(){
            self.obj.$menu.fadeIn();
            
            if(typeof setPanelSize == "function"){
                if(self.state.shownPro) var h = 355;
                else var h = 315;
                
                setPanelSize(410, h);
            }
        });
    };
    
    this.saveSomeTabs = function(){
        self.getGroupName();
        
        self.obj.$menu.fadeOut(function(){
            self.obj.some.$wrap.fadeIn();

            self.obj.some.$list.html("");

            getTabsList(function(Data){
                if(Data && Data.length){
                    for(var k in Data){
                        if(Data[k].title && String(Data[k].title).indexOf("file://") == 0){
                            Data[k].title = String(Data[k].title).split('/').pop();
                        }//if
                        
                        var $li = $("<li>")
                            .append(
                                $("<label>")
                                    .append(
                                        $("<input>").attr("type", "checkbox").attr("checked", "checked").attr("data-id", Data[k].id)
                                    )
                                    .append(
                                        $("<img>").attr("src", self.favicon(Data[k].url, Data[k].favicon))
                                    )
                                    .append(
                                        $("<span>")
                                            .addClass("site-title")
                                            .attr("title", Data[k].url)
                                            //.attr("placeholder", "title")
                                            .text(Data[k].title)
                                    )
                                    .append(
                                        $("<span>")
                                            .addClass("hide")
                                            .addClass("site-url")
                                            //.attr("placeholder", "URL")
                                            .text(Data[k].url)
                                    )
                            )
                            .append(
                                $("<i>")
                                    .addClass("item-edit glyphicon glyphicon-pencil")
                            )
                        ;

                        self.obj.some.$list.append($li);
                    }//for

                    if(typeof setPanelSize == "function"){
                        setPanelSize(
                            Math.min(560, Math.max(410, self.obj.some.$wrap.width())),
                            Math.min(700, Math.max(199, (self.obj.some.$wrap.height() + 30)))
                        );
                    }//if

                    self.getCheckboxList();
                }//if
            });
        });

        self.obj.some.$listWrap.mCustomScrollbar({
            theme:"dark",
            axis: "y",
            autoHideScrollbar: false,

            scrollInertia: 150,
            scrollEasing: "easeOut",

            mouseWheel:{
                enable: true,
                axis: "y",
                normalizeDelta: true,
                scrollAmount: 100,
                deltaFactor: 10,
                normalizeDelta: true
            },

            advanced:{
                updateOnContentResize: true
            },
            
            callbacks:{
                  onOverflowY: function(){
                      $(".mCSB_container").css({"margin-right":"15px"});
                  }
            }
        });
        
        

        self.obj.some.$list.unbind("change", "input").on("change", "input", function(){
            self.getCheckboxList();
        });

        self.obj.some.$submit.unbind("click").on("click", function(e){
            e.preventDefault(); e.stopPropagation();
            self.saveSomeTabsSubmit();
        });
    };

    this.getGroupName = function(){
        if(!self.obj.some.$title){
            self.obj.some.$title = $("<input>").attr("type","text").attr("class","form-control").attr("data-modified", false);

            self.obj.some.$title.unbind("change").on("change", function(e){
                $(this).attr("data-name", $(this).val());
            });

            self.obj.some.$name.append(self.obj.some.$title);
        }//if

        if(
            (!self.obj.some.$title.attr("data-name")) ||
            (!self.obj.some.$title.attr("data-modified"))
        ){
            var date = new Date();
            var upDate = date.getTime();

            var Name = String(date.toLocaleDateString());
        }else{
            var Name = self.obj.some.$title.attr("data-name");
        }//else

        self.obj.some.$title.attr("data-name", Name);

        BRW_bgAddNewGroup(
            {
                addDate: upDate,
                title : Name
            }, 
            false, 
            function(group){
                self.obj.some.$title.val(group.group.title);

                if(!self.state.focused){
                    self.state.focused = true;

                    setTimeout(function(){
                        self.obj.some.$title.trigger("focus").select();
                    }, 550);
                }//if
            }, 
            false, true
        );
    };

    this.saveSomeTabsSubmit = function(){
        self.obj.some.$list.find(".in-edit").find(".item-edit").trigger("click");
        
        
        var inEdit = self.obj.some.$list.find(".in-edit");
        
        if(!inEdit.length){
            var list = self.getCheckboxList();
            var title  = self.obj.some.$title.val() || false;

            BRW_sendMessage({
                "command": "saveTabsToNewGroupBg",
                "title" : title,
                "filter": list.filter,
                "tabs"  : list.tabs,
            });

            self.state.done = true;
            self.obj.some.$submit.attr("disabled", "disabled");
            self.obj.some.$done.stop(true, true).fadeIn("slow", function(){
                self.obj.some.$done.fadeOut(3000);
            });

            setTimeout(function(){
                self.closePanel();
            }, 250);
        }//if
        
    };

    this.switchAll = function(){
        if(self.obj.some.$list.find("input:eq(0)").prop("checked")){
            self.obj.some.$list.find("input").prop("checked", false);
        }else{
            self.obj.some.$list.find("input").prop("checked", true);
        }//else

        self.getCheckboxList();
    };

    this.getCheckboxList = function(){
        var checked = [], urlList = [];

        self.obj.some.$list.find("input").each(function(){
            if($(this).prop("checked")){
                var $site = $(this).parents("li").find(".site-title");
                
                checked.push($(this).attr("data-id"));
                urlList.push({
                    title: $site.text(),
                    url  : $site.attr("title")
                });
            }
        });       

        self.obj.some.$submit.find("n").text(checked.length);

        if(checked.length) self.obj.some.$submit.attr("disabled", false);
        else self.obj.some.$submit.attr("disabled", "disabled");

        if(self.state.done){
            self.state.done = false;
            self.getGroupName();
        }//if

        return {filter: checked, tabs: urlList};
    };
    
    
    this.logoutButtonPrepare = function(){
        if(head.browser.name == 'ff'){
            getAuth(function(auth){
                auth = JSON.parse(auth);
                self.logoutButton(auth.state, auth);
            });
        }else{//chrome //opera
            var state = parseInt(localStorage.getItem("auth-state") || 0);
            
            if(state){
                getSettingsValue("auth-info", null, function(auth) {   
                    if(auth){
                        auth = JSON.parse(auth);
                        self.logoutButton(state, auth);
                    }else{
                        self.logoutButton(0);
                    }
                });   
            }else{
                self.logoutButton(state);
            }
        }
    };
    
    this.logout = function(){
        if(head.browser.name == 'ff'){
            authLogout();
        }else{//chrome //opera
            localStorage.setItem("auth-state", 0);
            AUTH.logout(true);
        }//else
    };
    
    this.logoutButton = function(state, auth){
        if(state == 1 || state == "1"){
            $username = self.obj.li.$logout.find(".username");

            self.obj.li.$login.addClass("hide");
            self.obj.li.$logout.removeClass("hide");
                     
            $username.text(auth.login);

            self.obj.li.$logout.unbind("click").on("click", function(e){
                e.preventDefault(); e.stopPropagation();

                if(!self.state.loggedOut){
                    self.state.loggedOut = true;

                    $username.fadeOut(function(){
                        self.obj.li.$logout.addClass("disabled").remove();   
                        self.obj.li.$login.removeClass("hide");
                    });

                    self.logout();
                }//if
            });
        }else{
            self.obj.li.$logout.addClass("hide");
            self.obj.li.$login.removeClass("hide");
        }//else
    };
                                  
    this.log = function(message){
        var $el = $("<div>").text(JSON.stringify(message)).css({'border-top':'1px solid red'});
        $("body").append($el);
    };
    
    this.favicon = function(url, favicon){
        var domain = "";
        var url = String(url);
        
        var arr = url.split('/');
        if(
            arr.length > 2
            &&
            arr[0].indexOf(':') != -1
            &&
            arr[1] == ""
        ){
            domain = arr[2];
        }//if
        
        if(
            String(url).indexOf("chrome://newtab") > -1 ||
            String(url).indexOf("at-livestartpage-dot") > -1 ||
            String(url).indexOf("/pages/newtab/newtab.html") > -1 ||
            String(url).indexOf("/pages/options/options.html") > -1 ||
            String(url).indexOf("/pages/options/settings.html") > -1 ||
            String(url).indexOf("/pages/options/favorite.html") > -1
        ){
            return extensionGetUrl("/img/icon/icon16.png");
        }
        else
        if(String(url).indexOf("file://") > -1) return extensionGetUrl("/pages/newtab/img/dials/file.png");
        else 
        if(String(url).indexOf("resource://") > -1) return extensionGetUrl("/pages/newtab/img/dials/puzzle.png");
        else 
        if(String(url).indexOf("chrome") === 0) return extensionGetUrl("/pages/newtab/img/dials/puzzle.png");
        else 
        if(String(url).indexOf("about:") === 0) return extensionGetUrl("/pages/newtab/img/dials/puzzle.png");
        else 
        if(favicon) return favicon;
        else 
        return "http://www.google.com/s2/favicons?domain=" + domain;
    };
};

