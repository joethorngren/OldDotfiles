var SYNC, authButtonWarning = false, needRedrawAfterSync = false;//false

$(function () {
    setTimeout(function(){//Wait for loading
        if(isAuthEnable()){
            SYNC = new SyncLSP(); SYNC.init();
            
            if(_PAGE == "newtab" && getDisplaySpeedDialPanel()){
                $("#sync-link").removeClass("hide");
                SYNC.autoUpdate(20 * 60e3);
            }
                        
            //SYNC.listenUpdates(15*1000);
        }//if
    }, 650);
    
    if(localStorage.getItem("sync-warning")){
        authButtonInfo("warning");
    }//if
});

function authButtonInfo(state){
    var $link = $("#sync-link");
    var $img  = $("#sync-link").find(".footer-link-ico img");
    
    switch(state || false){
        case "warning":
            if(!authButtonWarning){
                authButtonWarning = true;
                
                $link.removeClass("sync-error").addClass("sync-need-decision");
                $img.attr("src", "/pages/newtab/css/footer/sync_o.png");

                setTimeout(()=>{
                    //authButtonInfo("normal");
                    $link.addClass("sync-white-force");
                    $img.attr("src", $img.attr("default") ? $img.attr("default") : "/pages/newtab/css/footer/sync_w.png");
                }, 5000);
            }
        break;

        case "error":
            $link.removeClass("sync-need-decision").addClass("sync-error");
            $img.attr("src", "/pages/newtab/css/footer/sync_r.png");   
        break;

        default:
            $link.removeClass("sync-error").removeClass("sync-need-decision");
            $img.attr("src", $img.attr("default") ? $img.attr("default") : "/pages/newtab/css/footer/sync_w.png");
    }//switch
};

function SyncLSP(data){
    var self = this;
    var $modal = $("#sync-wrap");
    var $close = $modal.find(".sync-modal-close");
    var $menu   = $("#menu-sync");
    var $button = $("#sync-link, .manual-sync");
    
    self.API = {
        auth  : "https://everhelper.me/auth/process.php?",
        server: "https://sync.everhelper.me"
    };
    self.cookies={};
    self.queue={};
    
    self.state={
        group_default: {
            id: "default",//"30000000000000",
            title: "My dials", //"LSP Default Group",
            real_id: 0
        },
        uptime:{},
        auto:{
            counter:0
        },
        refresh: {},
        touch: Date.now(),
        syncTimer : false,
        inProgress: false,
        messages  : {},
        ThenResetDials : true,
        ThenResetDialsInterval : 0,
        ThenResetGroups: true,
        ignoreClick : false,
    };
    
    self.login = {window: $modal.find("#form_login")};
    self.login.form      = self.login.window.find("form");
    self.login.button    = self.login.window.find("[name=loginButton]");
    self.login.success   = self.login.window.find(".sync-form-message");
    self.login.error     = self.login.window.find(".sync-form-error");
    
    self.register = {window: $modal.find("#form_register")};
    self.register.form      = self.register.window.find("form");
    self.register.button    = self.register.window.find("[name=registerButton]");
    self.register.success   = self.register.window.find(".sync-form-message");
    self.register.error     = self.register.window.find(".sync-form-error");

    self.remind = {window: $modal.find("#form_remind")};
    self.remind.form      = self.remind.window.find("form");
    self.remind.button    = self.remind.window.find("[name=restoreButton]");
    self.remind.success   = self.remind.window.find(".sync-form-message");
    self.remind.error     = self.remind.window.find(".sync-form-error");
    
    self.tabs = {
        'login'   : $modal.find('.tab-login'),
        'register': $modal.find('.tab-register'),
        'restore' : $modal.find('.tab-restore'),
        'buttons' : $modal.find('.tab-login, .tab-restore, .tab-register')
    }
    
    this.init = function(){
        $button.css("display","block");
        $menu.css("display","block");
        
        $button.on("click", function(){
            if(self.state.ignoreClick) return;
            else{
                self.state.ignoreClick = true;
                
                setTimeout(()=>{
                    self.state.ignoreClick = false;
                }, 5000);
            }
            
            var lastProgress = parseInt(localStorage.getItem("sync-progress")) || 0;
            
            if(
                !self.state.inProgress &&
                (!lastProgress || Date.now() - lastProgress > 60000)
            ){
                self.checkAuth(true);
            }
            
            $button.addClass("sync-rotate");
            setTimeout(()=>{
                $button.removeClass("sync-rotate");
            }, 1400);
        });
        
        $menu.on("click", function(){
            self.checkAuth(true);
        });
        
        if(localStorage.getItem("sync-warning")){
            authButtonInfo("warning");
        }//if
        
        $(document).on("mousemove", function(){
            self.state.touch = Date.now();
            //console.log("move", self.state.touch);
        });
        
        $(document).on("keyup", function(){
            self.state.touch = Date.now();
            //console.log("key", self.state.touch);
        });
        
        $(window).on("focus", function () {
            self.otherSyncInformer();
        });
    }, 
    
    //Login and registration form
    this.userLogin = function(){
        $modal.show().stop()
            .animate({"background-color": "yellow"}, 500).animate({"background-color": "rgba(255, 255, 255, 0.9)"}, 500)
            .animate({"opacity": 1}, 200)
            .animate({"background-color": "yellow"}, 500).animate({"background-color": "rgba(255, 255, 255, 0.9)"}, 500)
            .animate({"opacity": 1}, 200)
            .animate({"background-color": "yellow"}, 500).animate({"background-color": "rgba(255, 255, 255, 0.9)"}, 500)
        ;
    },     
        
    this.ajax = function(send, callBack, errorFunc, options){
        var xhr = BRW_post(
            self.API.server, JSON.stringify(send),
            function(result){//success
                //console.info(result);
                if(
                    (result.errorCode == 0) || 
                    (
                        (options && options.errors) &&
                        (options.errors === true || options.errors.indexOf(result.errorCode) > -1)
                    )
                ){//success
                    if(callBack) callBack(result.body, result.errorCode);
                }else{//error
                    if(errorFunc) errorFunc(result);
                }//else

                xhr = null;
            },//success
            function(error){//error
                self.errorMessage("network");
                if(errorFunc) errorFunc(error);
            }//error
        );
    },
    
    //Form send universal
    this.sendForm = function(tab, command, callback, error){
        var data = tab.form.serialize();
        
        var xhr = BRW_post(
            self.API.auth+command, data,
            function(result){//success
                //console.log(result);
                if(result.errorCode === 0){
                    tab.form.hide();
                    tab.error.hide();
                    tab.success.show();
                    
                    if(String(command).indexOf("remind") == -1){
                        self.state.auth = true;
                        self.syncStart();
                    }//if
                    
                    setTimeout(function(){
                        $modal.animate({"opacity":0.05}, 750, function(){
                            $modal.hide().css("opacity", 1);
                        });
                    }, 8000);
                    
                    if(callback) callback(result);
                }else{
                    tab.error.show();
                    if(error) console.error(result);
                }//else
                
                xhr = null;
            },//success
            function(error){//error
                console.info(error);
                if(errorFunc) errorFunc(error);
            }//error
        );
        
    },
       
    //Sync start
    this.syncStart = function(param){
        var last = localStorage.getItem("sync-account") || false;
        var login = AUTH.getLogin();
        
        //console.info("syncStart", last, login);
        
        var loginWin = true;
        if(!param || !param.popup) loginWin = false;
        
        AUTH.check(loginWin, function(){
            if(last && login && last == login && _PAGE == "newtab"){
                self.state.route = "normal";
                self.syncTodoCheck(function(options){});

                self.GA("start", false, "manual");
            }else if( _PAGE == "newtab"){//init merge
                
                self.state.route = "merge";
                self.GA("start", "mode", self.state.route);
                self.syncTodoCheck(function(options){});
                localStorage.setItem("sync-account", login);
                
                //console.debug(self.state.route);
            }else if( _PAGE == "settings"){//modal
                self.ajax({"action": "list_dials"}, function(Dials){
                    self.ajax({
                            "action": "lists:get",
                            "body": {"key": "mylist"}
                        }, function(ToDo){
                            //console.info(Date.now(), Groups, ToDo);

                            if(
                                (!ToDo.items.length) &&
                                (!Dials.dials.length)
                            ){
                                if(AUTH.isPremium()){
                                    self.state.route = "client";
                                    self.syncTodoCheck(function(options){});
                                    localStorage.setItem("sync-account", login);
                                    self.GA("start", "mode", "first");
                                }
                            }else{
                                if(!param || !param.popup){
                                    if(AUTH.isPremium()){
                                        authButtonInfo("warning");
                                        localStorage.setItem("sync-warning", 1);
                                    }//if

                                }else{
                                    $dmodal = $("#sync-decide-modal");
                                    $cmodal = $("#sync-decide-confirm");

                                    if(!last) $dmodal.find(".decide-line-1").text(translate("sync_decide_clean"));

                                    $dmodal.find(".common-modal-body-buttons button").unbind("mouseover").on("mouseleave", function(){
                                        $dmodal.find(".sync-decide-hints div").stop(true,true).hide();
                                    });
                                        
                                    $dmodal.find(".common-modal-body-buttons button").unbind("mouseover").on("mouseover", function(){
                                        var mode = $(this).attr("id");

                                        $dmodal.find(".sync-decide-hints div").stop(true,true).hide();
                                        $dmodal.find("."+mode+"-hint").fadeIn("fast");
                                        $cmodal.find(".decide-line-1").text(translate("sync_decide_confirm_"+mode.split('-').pop()));
                                    });

                                    $dmodal.modal();

                                    if(!last) self.GA("popup", "reason", "new_sync");
                                    else  self.GA("popup", "reason", "change_account");

                                    $dmodal.find(".common-modal-body-buttons button").unbind("click").on("click", function(){
                                        Route = $(this).attr("action");

                                        $cmodal.modal();

                                        $cmodal.find("#sync-confirm-start").unbind("click").on("click", function(){
                                            self.state.route = Route;
                                            
                                            self.GA("manual", "mode", self.state.route);

                                            self.syncTodoCheck(function(options){});
                                            localStorage.setItem("sync-account", login);
                                        });

                                        $cmodal.find("#sync-confirm-cancel").unbind("click").on("click", function(){
                                            self.syncStart(param);
                                        });
                                    });
                                }//else
                            }//else
                        }//ToDo
                    );
                });
            }
        }, true);
    },
    
    //Get client last updates time
    this.getUpTime = function(){
        self.state.uptime = {
            groups  : parseInt(localStorage.getItem('sync-groups-time'))|| 0,
            dials   : parseInt(localStorage.getItem('sync-dials-time')) || 0,
            todo    : parseInt(localStorage.getItem('sync-todo-time'))  || 0,
            token   : parseInt(localStorage.getItem('sync-todo-token')) || null,
            favorites : parseInt(localStorage.getItem('sync-favorites-token')) || null,
        };
        
        return self.state.uptime;
    },
    
    //Set client last updates time
    this.setUpTime = function(elements, upTime, token){
        //console.debug(elements, upTime);
        var Now = upTime || Date.now();
        
        if(elements.indexOf("groups") > -1)
            self.setMaxTime('sync-groups-time', Now);
        
        if(elements.indexOf("dials") > -1)
            self.setMaxTime('sync-dials-time', Now);
        
        if(elements.indexOf("todo") > -1){
            self.setMaxTime('sync-todo-time', Now);
            if(token)
            self.setMaxTime('sync-todo-token', token);
        }//if
        
        if(elements.indexOf("favorites") > -1){
            self.setMaxTime('sync-favorites-token', token);
        }//if
        
        return self.getUpTime();
    },
        
    this.setMaxTime = function(key, time){
        var last = parseInt(localStorage.getItem(key)) || 0;
        localStorage.setItem(key, Math.max(time, last));
        //console.debug(key, last, Math.max(time, last));
    },
    
    // Check updates time
    // run - automatically sync after check
    // callBack - callback function
    this.syncTodoCheck = function (run, callBack) {
        self.syncProgress("on", true);
        
        authButtonInfo(false);
        
        localStorage.removeItem("sync-warning");
        
        //console.info("syncTodoCheck");

        self.getUpTime();
        
        self.syncFavorites({},
            function (fActions) {
            
                self.syncToDo({},
                    function (actions) {
                        if(self.state.refresh.todo == true){//Update ToDo UI if necessary
                            BRW_sendMessage({"command": "todoListUpdate"});
                        }//if

                        self.syncDialsCheck(run, function () {
                            self.syncProgress("off", true);
                        });
                    },
                    function (error) {
                        console.log("syncTodoCheck ERR", error);
                    }
                ); //todo      
            
            },
            function (fError) {
                console.log("syncFavorites ERR", error);
            }
        ); //todo    
        
    },
    
    this.syncDialsCheck = function(run, callBack){
        self.ajax(
            {
                "action": "found_changes",
                "lastUpdateTimeDials": self.state.uptime.dials,
                "lastUpdateTimeGroups": self.state.uptime.groups    
            },
            function(Server){
                self.syncGroupsBoth({Found:Server}, function(actions){
                    
                    self.syncDialsBoth(actions, function(){
                        if(self.state.refresh.dial){
                            BRW_sendMessage({"command": "sidebarDialsUpdate"});
                        }//if
                        
                        if(callBack) callBack();
                    });
                });
            }//function
        );
    },
      
    this.syncGroupsBoth = function(actions, callBack){
        self.getUpTime();
        
        //console.log("syncGroupsBoth");
        
        self.state.refresh.dial = false;
        
        self.ajax(
            {
                "action": "list_groups",
                //"lastUpdateTime": lastUpdateTime
            },
            function(Server){
                //console.log('GROUPS', Server);
                BRW_dbTransaction(function(tx) {
                    BRW_dbSelect(
                        {tx: tx, from: 'GROUPS'},
                        function(Client){//Success
                            var Only = false, ServerUpd = 0;
                            self.state.ThenResetGroups = true;
                            
                            if(actions && actions.Found){
                                if(actions.Found.lastUpdateTimeGroups == 0) Only = "push";
                                else ServerUpd = actions.Found.lastUpdateTimeGroups;
                            }//if
                            
                            //GROUPS
                            var Log = JSON.parse(localStorage.getItem("sync-groups-changed") || "{}");
                            
                            //console.log("Both groups", Server, Client, Log, actions);
                            
                            var ClientIDs = [], ClientByID = {}, ServerIDs = [], ServerByID = {}, BothIDs = [];
                            
                            for(var key in Client.rows) if((Client.rows[key].id) && (Client.rows[key].id != 10000000000000))
                            {
                                ClientIDs.push(Client.rows[key].id);
                                BothIDs.push(Client.rows[key].id);
                                
                                //if(!Client.rows[key].title){
                                if(Client.rows[key].type == 0){
                                    self.state.group_default.real_id = Client.rows[key].id;
                                }//if
                                
                                ClientByID[Client.rows[key].id] = Client.rows[key];
                            }//for if
                            
                            for(var key in Server.groups){
                                ServerIDs.push(Server.groups[key].global_id);
                                var idForAll = (Server.groups[key].global_id != "default" ? Server.groups[key].global_id : self.state.group_default.real_id);
                                if(BothIDs.indexOf(idForAll) == -1) BothIDs.push(idForAll);
                                
                                ServerByID[idForAll] = Server.groups[key];
                            }//for
                            
                            //console.log(BothIDs, ClientIDs, ServerIDs);
                            //console.log(ClientByID, ServerByID);
                            
                            var sendServerAdd = {
                                "action": "put_groups",
                                "groups": []
                            };
                            
                            var sendServerDel = {
                                "action": "remove_groups",
                                "groupIds": []
                            };
                            
                            for(var keyId in BothIDs){
                                var valId = BothIDs[keyId];
                                var decision = false;
                                
                                //console.log(valId, ClientByID[valId], ServerByID[valId]);
                                
                                //############ Decision ############//
                                if(ClientByID[valId] && ServerByID[valId]){//Both
                                    //console.log("Both", valId, ClientByID[valId], ServerByID[valId]);
                                    
                                    if(
                                        Only == "push" ||
                                        (
                                             Log[valId] && 
                                            (Log[valId].time > self.state.uptime.groups)
                                        )
                                    ){
                                        decision = "server update";
                                    }else if(
                                        (
                                            (ClientByID[valId].title || ServerByID[valId].name != "My dials")  && 
                                            (ClientByID[valId].title != ServerByID[valId].name)
                                        ) 
                                        || ClientByID[valId].orderNum != ServerByID[valId].position // ????
                                    ){
                                        decision = "client update";
                                        
                                    }//else
                                }else if(ClientByID[valId]){//Only on client
                                    //console.log("Client", valId, ClientByID[valId]);
                                    if(!self.state.route || self.state.route == "normal"){
                                        if(
                                            Only == "push" ||
                                            !self.state.uptime.groups || 
                                            (
                                                self.state.uptime.groups &&
                                                ClientByID[valId].addDate > self.state.uptime.groups
                                            )
                                            /*
                                            (
                                                 Log[valId] && 
                                                (
                                                    !Log[valId]["insert"] || 
                                                    Log[valId].time > self.state.uptime.groups
                                                )
                                            )
                                            */
                                        ){
                                            decision = "server add";
                                        }else{
                                            decision = "client delete";
                                        }//else
                                    }else{//route
                                        if(self.state.route == "server"){
                                            decision = "client delete";
                                        }else /*if(self.state.route == "merge")*/{
                                            decision = "server add";
                                        }
                                    }//else
                                }else if(ServerByID[valId]){//Only on server
                                    //console.log("Server", valId, ServerByID[valId]);
                                    
                                    if(!self.state.route || self.state.route == "normal"){
                                        if(
                                             Log[valId] && 
                                            (Log[valId]["delete"])// && Log[valId].time > ServerUpd)
                                        ){
                                            decision = "server delete";
                                        }else{
                                            decision = "client add";
                                        }//else
                                    }else{//route
                                        if(self.state.route == "client"){
                                            decision = "server delete";
                                        }else /*if(self.state.route == "merge")*/{
                                            decision = "client add";
                                        }
                                    }//else
                                }//else if
                                
                                //############ Actions & pice execution ############//
                                if(decision) switch(decision){
                                    case "client add"://use
                                        self.state.refresh.dial = true;
                                        
                                        if(ServerByID[valId].global_id != self.state.group_default.id){
                                            var insert = {
                                                id      : ServerByID[valId].global_id,
                                                type    :(ServerByID[valId].global_id == self.state.group_default.id) ? 0 : 1,
                                                title   : ServerByID[valId].name,
                                                addDate : Date.now(),
                                                orderNum: ServerByID[valId].position
                                            };
                                            
                                            //console.log("INSERT", insert);
                                            
                                            BRW_dbInsert(
                                                { //Param
                                                    tx   : tx,
                                                    table: 'GROUPS',
                                                    'set'  : insert,
                                                    passive: ['groups','dials']
                                                },
                                                function(){},//success
                                                function(){//error
                                                    console.log("Can't insert sync group", response.groups[key]);
                                                }
                                            );
                                        }//if
                                    break;
                                        
                                    case "client update":
                                        self.state.refresh.dial = true;
                                        
                                        var title = ServerByID[valId].name;
                                        
                                        if(
                                            ServerByID[valId].name == "My dials" && 
                                            ServerByID[valId].global_id == self.state.group_default.id
                                        ){
                                            title = "";
                                        }//if
                                        
                                        BRW_dbUpdate(
                                            { //Param
                                                tx : tx,
                                                table: 'GROUPS',
                                                'set': {
                                                    //title   : (ServerByID[valId].global_id != self.state.group_default.id ? ServerByID[valId].name : ""),
                                                    title   : title,
                                                    orderNum: ServerByID[valId].position
                                                },
                                                where: {
                                                    key: 'id', val: valId
                                                },
                                                passive: ['groups','dials']
                                            },
                                            function(){},//success
                                            function(){//error
                                                console.log("Can't change sync group", response.groups[key]);
                                            }
                                        );
                                    break;
                                        
                                    case "client delete"://use
                                        self.state.refresh.dial = true;
                                        
                                        BRW_dbDelete(
                                            {//Param
                                                tx      : tx,
                                                table   : 'GROUPS',
                                                where   : {
                                                    key : 'id', val : valId
                                                },
                                                passive: ['groups','dials']
                                            }
                                        );
                                        
                                        //Switch to popular group if deleting is active
                                        BRW_dbUpdate(
                                            { //Param
                                                tx : tx,
                                                table: 'SETTINGS',
                                                'set': {value: 10000000000000},
                                                where: {
                                                    key: 'value', val: valId
                                                },
                                                passive: ['groups','dials']
                                            }
                                        );
                                    break;
                                        
                                    case "server add":/*use*/ case "server update":
                                        var add = {
                                            "global_id" : ClientByID[valId].id,
                                            "name"      : ClientByID[valId].title,
                                            "position"  : ClientByID[valId].orderNum
                                        };

                                        //if(ClientByID[valId].title == ""){
                                        if(ClientByID[valId].type == 0){
                                            if(!add["name"]) add["name"] = self.state.group_default.title;
                                            add["global_id"] = self.state.group_default.id;
                                        }

                                        sendServerAdd.groups.push(add);
                                    break;
                                        
                                    case "server delete"://use
                                        if(ServerByID[valId].global_id != self.state.group_default.id){
                                            sendServerDel.groupIds.push(valId);
                                        }//if
                                    break;
                                }//if switch
                                
                                //console.log("GRP Decision", decision, "Route", self.state.route);
                            }//for
                            
                            //############ Overall execution ############//
                            if(sendServerAdd.groups.length){//Send "add" to server
                                //console.log("Add to server", sendServerAdd);
                                
                                self.ajax(sendServerAdd, function(addResp){
                                    //console.log(addResp);
                                    self.setUpTime(["groups"], addResp.lastUpdateTime);
                                }, function(addErr){
                                    self.syncError("Can't push groups", addErr);
                                    self.state.ThenResetGroups = false;
                                });
                            }//if
                            
                            
                            if(sendServerDel.groupIds.length){//Send "add" to server
                                //console.log("Del from server", sendServerDel);
                                
                                self.ajax(sendServerDel, function(delResp){
                                    //console.log(delResp);
                                }, function(delErr){
                                    self.syncError("Can't del groups on server", delErr);
                                    self.state.ThenResetGroups = false;
                                });
                            }//if
                            
                            //############ Callback & Values reset ############//
                            setTimeout(function(){
                                if(self.state.ThenResetGroups){
                                    localStorage.setItem("sync-groups-changed", "{}");
                                    
                                }
                                
                                self.setUpTime(["groups"], false);
                                
                                if(callBack){
                                    callBack(actions);
                                }//if
                                
                            }, 1500);
                            
                            needRedrawAfterSync = true;
                        }//Success
                    )
                });
            }
        );
    },    
        
    //Sync groups both
    this.syncDialsBoth = function (actions, callBack) {
        self.getUpTime();

        self.ajax({
                "action": "list_dials"
            },
            function (Server) {
                BRW_dbTransaction(function (tx) {
                        BRW_dbSelect({
                                tx: tx,
                                from: 'IMAGES'
                            },
                            function (Images) { //Success
                                BRW_dbSelect({
                                            tx: tx,
                                            from: 'DIALS'
                                        },
                                        function (Client) { //Success
                                            //console.info("Dials", Server, Client, Images);
                                        
                                            var Only = false,
                                                ServerUpd = 0;
                                            self.state.ThenResetDials = true;

                                            if (actions && actions.Found) {
                                                if (actions.Found.lastUpdateTimeGroups == 0) Only = "push";
                                                else ServerUpd = actions.Found.lastUpdateTimeGroups;
                                            } //if

                                            var Log = JSON.parse(localStorage.getItem("sync-dials-changed") || "{}");

                                            var ClientIDs = {}, ClientByID = {}, ServerIDs = {}, ServerByID = {}, BothIDs = {}, Similar = {};

                                            var ClientIDs = {};
                                            for (var key in Client.rows) {
                                                if (Client.rows[key].id) {
                                                    var group = Client.rows[key].groupId;
                                                    if(group == self.state.group_default.real_id) group = self.state.group_default.id;
                                                    var global_id = createDialId(Client.rows[key].url, group);

                                                    ClientIDs[Client.rows[key].id] = global_id;
                                                    BothIDs[Client.rows[key].id]   = Client.rows[key].id;
                                                    Similar[global_id] = {"client":Client.rows[key].id};

                                                    ClientByID[Client.rows[key].id] = Client.rows[key];
                                                    
                                                    for(var img in Images.rows){
                                                        var image = Images.rows[img];

                                                        if(image.url == "dial_"+Client.rows[key].id){
                                                            ClientByID[Client.rows[key].id]["custom_image"] = image.image;
                                                            break;
                                                        }
                                                    }
                                                } //if
                                            }//for
                                        
                                            //console.info("Client", ClientByID);

                                            for (var key in Server.dials) {
                                                if(Server.dials[key]['_previewUrl']) Server.dials[key]['thumb_url'] = Server.dials[key]['_previewUrl'];
                                                
                                                var local_id = String(Server.dials[key].global_id);
                                                local_id = createDialId(Server.dials[key].url, Server.dials[key].group_global_id);

                                                ServerIDs[Server.dials[key].global_id] = local_id;

                                                if(!BothIDs[Server.dials[key].global_id]) BothIDs[Server.dials[key].global_id] = Server.dials[key].global_id;

                                                if(!Similar[local_id]) Similar[local_id] = {};
                                                Similar[local_id].server = Server.dials[key].global_id;

                                                ServerByID[Server.dials[key].global_id] = Server.dials[key];
                                            } //for

                                            var sendServerAdd = {
                                                "action": "put_dials",
                                                "dials": []
                                            };

                                            var sendServerDel = {
                                                "action": "remove_dials",
                                                "dialIds": []
                                            };

                                            //console.log("ALL DIALS", ClientByID, ServerByID); return;
                                            //console.log("Server DIALS", ServerByID); 
                                            //console.log("Client DIALS", ClientByID); 

                                            for(var valId in BothIDs){
                                                //var keyId = BothIDs[valId];

                                                var decision = false, idClient=valId, idServer=valId;

                                                //############ Decision ############//
                                                if((valId in ClientByID) && (valId in ServerByID) && ClientByID[valId].is_deleted != 1){//Both
                                                    //console.debug(self.state.uptime.dials, Log[valId]);
                                                    
                                                    if(
                                                        Only == "push" ||
                                                        (
                                                            Log[valId] && (Log[valId].time > self.state.uptime.dials)
                                                            && 2000 < parseInt(Log[valId].time || 0) - parseInt(self.state.uptime.dials || 0) // Fix for local images upload
                                                        )
                                                        ||
                                                        ( // fix for old version without local image sync
                                                            Log[valId] && (Log[valId].time == self.state.uptime.dials) 
                                                            && 
                                                            !ServerByID[valId].storedfile_id && Boolean(ClientByID[valId].image) && !Boolean(ClientByID[valId].custom_image)
                                                        )
                                                    ){
                                                        /*
                                                        //console.debug("Server Update", 
                                                            parseInt(Log[valId].time || 0) - parseInt(self.state.uptime.dials || 0),
                                                            (
                                                                Log[valId] && (Log[valId].time > self.state.uptime.dials)
                                                                && 1500 < parseInt(Log[valId].time || 0) - parseInt(self.state.uptime.dials || 0) // Fix for local images upload
                                                            ),
                                                            ( // fix for old version without local image sync
                                                                Log[valId] && (Log[valId].time == self.state.uptime.dials) 
                                                                && 
                                                                !ServerByID[valId].storedfile_id && Boolean(ClientByID[valId].image) && !Boolean(ClientByID[valId].custom_image)
                                                            )
                                                        );
                                                        
                                                        //console.debug(Log[valId].time, self.state.uptime.dials);
                                                        //console.debug(ClientByID[valId], ServerByID[valId]);
                                                        */
                                                        decision = "server update";
                                                    }else if(
                                                        (
                                                            (ClientByID[valId].url != ServerByID[valId].url) ||
                                                            (ClientByID[valId].title != ServerByID[valId].title) ||
                                                            (ClientByID[valId].orderNum != ServerByID[valId].position) ||
                                                            (
                                                                (Boolean(ClientByID[valId].custom_image) || Boolean(ServerByID[valId].thumb_url))
                                                                &&
                                                                ClientByID[valId].custom_image != ServerByID[valId].thumb_url
                                                                //&&
                                                                //String(ClientByID[valId].custom_image).indexOf("LSP_dial") == -1
                                                            ) 
                                                            ||
                                                            (
                                                                (!Boolean(ClientByID[valId].image) && !Boolean(ServerByID[valId].storedfile_id)) // Local files
                                                            )
                                                        )
                                                        &&
                                                        (self.state.uptime.dials < ServerByID[valId].last_update_time)
                                                    ){
                                                        //console.info("fire", 1, ClientByID[valId].custom_image, ServerByID[valId].thumb_url);
                                                        /*
                                                        //console.debug(
                                                            "Client Update",
                                                            //Log[valId].time - self.state.uptime.dials,
                                                            ClientByID[valId].url != ServerByID[valId].url,
                                                            ClientByID[valId].title != ServerByID[valId].title,
                                                            ClientByID[valId].orderNum != ServerByID[valId].position,
                                                            (
                                                                (Boolean(ClientByID[valId].custom_image) || Boolean(ServerByID[valId].thumb_url))
                                                                &&
                                                                ClientByID[valId].custom_image != ServerByID[valId].thumb_url
                                                                //&&
                                                                //String(ClientByID[valId].custom_image).indexOf("LSP_dial") == -1
                                                            ),
                                                            (!Boolean(ClientByID[valId].image) && !Boolean(ServerByID[valId].storedfile_id))
                                                        );
                                                        
                                                        //console.debug(ClientByID[valId], ServerByID[valId]);
                                                        //console.debug(ServerByID[valId].last_update_time, self.state.uptime.dials);
                                                        */
                                                        decision = "client update";
                                                    }//else
                                                }
                                                else if(
                                                    (!ClientByID[valId] && ('client' in Similar[ServerIDs[valId]]))
                                                    ||
                                                    (
                                                        (ClientByID[valId] && ClientByID[valId].is_deleted != 1)
                                                        &&
                                                        (!ServerByID[valId] && ('server' in Similar[ClientIDs[valId]]))
                                                    )
                                                ){//Similar ???????
                                                    var Sim = Similar[(ServerIDs[valId] || ClientIDs[valId])];

                                                    if(
                                                        Only == "push" ||
                                                        (Log[Sim.client] && (Log[Sim.client].time > self.state.uptime.dials))
                                                    ){
                                                        decision = "server update";
                                                    }else if(
                                                        (ClientByID[Sim.client].url != ServerByID[Sim.server].url) ||
                                                        (ClientByID[Sim.client].title != ServerByID[Sim.server].title) ||
                                                        (ClientByID[Sim.client].orderNum != ServerByID[Sim.server].position) ||
                                                        (
                                                            (Boolean(ClientByID[Sim.client].custom_image) || Boolean(ServerByID[Sim.server].thumb_url))
                                                            &&
                                                            ClientByID[Sim.client].custom_image != ServerByID[Sim.server].thumb_url
                                                        )
                                                    ){
                                                        decision = "client update";
                                                    }//else

                                                    idClient = Sim.client;
                                                    idServer = Sim.server;

                                                    //console.log("Similar", Sim, decision);
                                                }
                                                else if(ClientByID[valId] && ClientByID[valId].is_deleted != 1){//Only on client
                                                    if(!self.state.route || self.state.route == "normal"){
                                                        if(
                                                            Only == "push" ||
                                                            !self.state.uptime.dials || 
                                                            (
                                                                self.state.uptime.dials &&
                                                                ClientByID[valId].addDate > self.state.uptime.dials
                                                            )
                                                        ){
                                                            decision = "server add";
                                                        }else{
                                                            decision = "client delete";
                                                        }//else
                                                    }else{//route
                                                        if(self.state.route == "server"){
                                                            decision = "client delete";
                                                        }else /*if(self.state.route == "merge")*/{
                                                            decision = "server add";
                                                        }
                                                    }//else
                                                }
                                                else if(ServerByID[valId]){//Only on server
                                                    //console.log("Server", valId, ServerByID[valId]);

                                                    if(!self.state.route || self.state.route == "normal"){
                                                        if(
                                                            (Log[valId] && Log[valId]["delete"])
                                                            || 
                                                            (Log[ServerIDs[valId]] && Log[ServerIDs[valId]]["delete"])
                                                            || 
                                                            (ClientByID[valId] && ClientByID[valId].is_deleted == 1)
                                                            //|| (ServerByID[valId].last_update_time < self.state.uptime.dials)
                                                        ){
                                                            decision = "server delete";
                                                        }else{
                                                            decision = "client add";
                                                        }//else

                                                    }else{//route
                                                        if(self.state.route == "client"){
                                                            decision = "server delete";
                                                        }else /*if(self.state.route == "merge")*/{
                                                            decision = "client add";
                                                        }
                                                    }//else
                                                }//else if
                                                
                                                //############ Actions & pice execution ############//
                                                
                                                //decision = "server update"; // DEV !!!                                                
                                                
                                                
                                                if(ServerByID[idServer]){
                                                    var serverDial = {
                                                        "title"             : ServerByID[idServer].title,
                                                        "url"               : ServerByID[idServer].url,
                                                        "orderNum"          : ServerByID[idServer].position,
                                                        "is_deleted"        : 0,
                                                        "groupId"           :(ServerByID[idServer].group_global_id != self.state.group_default.id ? ServerByID[idServer].group_global_id : self.state.group_default.real_id),
                                                    };
                                                    
                                                    //if(ServerByID[idServer].thumb_url) serverDial.custom_image = ServerByID[idServer].thumb_url; // Local images
                                                }else var serverDial ={};
                                                
                                                //if(decision) console.debug(decision, ClientByID[idClient], ServerByID[idServer]); 

                                                if(decision) switch(decision){
                                                    case "client add"://use
                                                        self.state.refresh.dial = true;

                                                        //if(ServerByID[valId].global_id != self.state.group_default.id){
                                                            var Color = getTileRandomColorScheme();

                                                            serverDial.id         = idServer;//String("sync_"+self.crcDial(ServerByID[valId].url));
                                                            serverDial.thumb_type = ServerByID[idServer].thumb_url || 0;
                                                            serverDial.addDate    = Date.now();
                                                            serverDial.bg_color   = Color.backgroundColor;
                                                            serverDial.text_color = Color.color;
                                                        
                                                            var thumbLoadMessage = {
                                                                "command": "thumbLoad",
                                                                "tiles"  : [{
                                                                    dialId : serverDial.id,
                                                                    title  : serverDial.title,
                                                                    url    : serverDial.url,
                                                                }],
                                                                image  : false,
                                                                scheme : false,
                                                                passive: true
                                                            };
                                                        
                                                            if(ServerByID[idServer].thumb_url){
                                                                thumbLoadMessage.image = {
                                                                    type  : "url",
                                                                    image : ServerByID[idServer].thumb_url
                                                                };
                                                            }
                                                        
                                                            var param = { //Param
                                                                tx   : tx,
                                                                table: 'DIALS',
                                                                'set'  : serverDial,
                                                                passive: ['groups','dials']
                                                            };
                                                            
                                                            var insertDial =(param, thumbLoadMessage)=>{
                                                                BRW_dbInsert(
                                                                    param,
                                                                    function(insertResult){
                                                                        BRW_sendMessage(thumbLoadMessage);
                                                                        
                                                                        if(ServerByID[idServer].thumb_url) self.imagesUpdate(ServerByID[idServer].thumb_url, serverDial.id, Images, tx);
                                                                    },//success
                                                                    function(){//error
                                                                        console.log("Can't insert sync Dial", serverDial);
                                                                    }
                                                                );
                                                            };
                                                            
                                                            insertDial(param, thumbLoadMessage);
                                                        //}//if
                                                    break;

                                                    case "client update":
                                                        var thumbLoadMessage = false;
                                                        self.state.refresh.dial = true;
                                                        
                                                        if(ServerByID[idServer] && ServerByID[idServer].thumb_url){
                                                            var imgUpdPrm = true;
                                                            
                                                            for(var key in Images.rows){
                                                                var val = Images.rows[key];
                                                                
                                                                if(val.url == "dial_"+serverDial.id){
                                                                    if(ServerByID[idServer].thumb_url == val.image){
                                                                        imgUpdPrm = false;
                                                                    }
                                                                    break;
                                                                }
                                                            }
                                                            
                                                            if(imgUpdPrm) thumbLoadMessage = {
                                                                "command": "thumbLoad",
                                                                "tiles"  : [{
                                                                    id     : idClient,
                                                                    dialId : idClient,
                                                                    title  : serverDial.title,
                                                                    url    : serverDial.url,
                                                                }],
                                                                image : {
                                                                    type  : "url",
                                                                    image : ServerByID[idServer].thumb_url
                                                                },
                                                                passive: true
                                                            };
                                                        }
                                                        
                                                        var param = { //Param
                                                            tx : tx,
                                                            table: 'DIALS',
                                                            'set': serverDial,
                                                            where: {key: 'id', val: idClient},
                                                            passive: ['groups','dials']
                                                        };
                                                        
                                                        var updateDial =(param, thumbLoadMessage)=>{
                                                            BRW_dbUpdate(
                                                                param,
                                                                function(){
                                                                    //console.info("client update", "img", 3, thumbLoadMessage);
                                                                    if(thumbLoadMessage) BRW_sendMessage(thumbLoadMessage);
                                                                    if(ServerByID[idServer].thumb_url) self.imagesUpdate(ServerByID[idServer].thumb_url, idClient, Images, tx);
                                                                },//success
                                                                function(){//error
                                                                    console.log("Can't change sync Dial", serverDial);
                                                                }
                                                            );
                                                        };

                                                        updateDial(param, thumbLoadMessage);
                                                    break;

                                                    case "client delete"://use
                                                        self.state.refresh.dial = true;

                                                        BRW_dbDelete(
                                                            {//Param
                                                                tx      : tx,
                                                                table   : 'DIALS',
                                                                where   : {
                                                                    key : 'id', val : idClient
                                                                },
                                                                passive: ['groups','dials']
                                                            }
                                                        );

                                                    break;

                                                    case "server add": case "server update":
                                                        var group_global_id = (ClientByID[idClient].groupId != self.state.group_default.real_id ? ClientByID[idClient].groupId : self.state.group_default.id);

                                                        //if(ServerByID[valId]) var global_id = ServerByID[valId].global_id;
                                                        //else var global_id = createDialId(ClientByID[valId].url, group_global_id)

                                                        var add = {
                                                            "global_id": idClient,//global_id,
                                                            "title"    : ClientByID[idClient].title,
                                                            "url"      : ClientByID[idClient].url,
                                                            "position" : ClientByID[idClient].orderNum,
                                                            "group_global_id": group_global_id,
                                                        };
                                                        
                                                        for(var key in Images.rows){
                                                            var val = Images.rows[key];
                                                            
                                                            if(val.url == "dial_"+idClient){
                                                                add.thumb_url = val.image;
                                                                break;
                                                            }
                                                        }
                                                        
                                                        if(
                                                            (
                                                                ClientByID[idClient].image
                                                                //&& (!add.thumb_url || String(add.thumb_url).indexOf("LSP_dial") == 0)
                                                            )
                                                            &&
                                                            (
                                                                ClientByID[idClient].image.indexOf('filesystem:') === 0
                                                                ||
                                                                ClientByID[idClient].image.indexOf('blob:resource') === 0
                                                                //|| // for Firefox
                                                            )
                                                        ){ // Local image file
                                                            self.filesPreUpload(idClient, ClientByID[idClient], add);
                                                        }
                                                        
                                                        //console.debug(ClientByID[idClient].image);
                                                        
                                                        if(decision == "server update") add.global_id = idServer;
                                                        else add.global_id = idClient;

                                                        //console.debug("Dial, server add", add);

                                                        sendServerAdd.dials.push(add);
                                                    break;

                                                    case "server delete"://use
                                                        sendServerDel.dialIds.push(idServer);
                                                    break;

                                                }//if switch

                                                //console.log("Dial Decision: ", decision, ' | ', idClient, ' | ', idServer, ' | ', "Route: ", self.state.route);
                                                //if(decision) console.log(ServerByID[valId]);
                                            }//for

                                            //############ Overall execution ############//
                                            if(sendServerAdd.dials.length){//Send "add" to server
                                                //console.log("Dials to srv", sendServerAdd);

                                                self.ajax(sendServerAdd, function(addResp){
                                                    //console.log(addResp);
                                                    self.setUpTime(["dials"], addResp.lastUpdateTime);
                                                    self.state.synchronized = true;
                                                }, function(addErr){
                                                    self.syncError("Can't push dials", addErr);
                                                    self.state.ThenResetDials = false;
                                                });
                                            }else{
                                                self.state.synchronized = true;
                                            }

                                            if(sendServerDel.dialIds.length){
                                                //console.log("Del from server", sendServerDel);

                                                self.ajax(sendServerDel, function(delResp){
                                                    //console.log(delResp);
                                                }, function(delErr){
                                                    self.syncError("Can't del groups on server", delErr);
                                                    self.state.ThenResetDials = false;
                                                });
                                            }//if

                                            //############ Callback & Values reset ############//
                                            self.clearChangedMarker();
                                            setTimeout(function(){
                                                //displayGroupDials(data.group);

                                                self.setUpTime(["dials"], false);

                                                if(callBack){
                                                    callBack(actions);
                                                }//if
                                            }, 1500);

                                        } //Success
                                    ) // Db Dials Read
                            } //Success
                        ) // Db Images Read
                    }) //Transaction
            } //Get from server
        );
    },
        
    this.clearChangedMarker =()=> {
        if(self.state.ThenResetDials){
            clearTimeout(self.state.ThenResetDialsInterval);
            
            self.state.ThenResetDialsInterval = setTimeout(()=>{
                localStorage.setItem("sync-dials-changed", "{}");
            }, 1450);
            
        }else console.warn("Can`t clear sync changed");
    },
        
    this.imagesUpdate =(thumbUrl, dialId, Images, tx)=> {
        var where = false;
        var data = {
                url  : "dial_"+dialId,
                image: thumbUrl,
        };
                
        if(Images && Images.rows){
            for(var img in Images.rows){
                var image = Images.rows[img];
                if(image.url == data.url){
                    where = {
                        key : 'id', 
                        val : image.id
                    };
                    
                    break;
                }
            }
        }
        
        if(where){
            BRW_dbUpdate({
                    tx   : tx,
                    table: 'IMAGES',
                    'set': data,
                    where: where, 
                },
                function(updateImage){
                    //console.debug("IMAGES Upd", updateImage);
                },
                function(err){
                    console.debug("IMAGES Err", err, data);
                }
            );
        }else{
            data.id = Date.now();
            
            BRW_dbInsert({
                    tx   : tx,
                    table: 'IMAGES',
                    'set'  : data,
                },
                function(insertImage){
                    //console.debug("IMAGES Insert", data);
                },
                function(err){
                    //console.debug("IMAGES Err", err, data);
                }
            );
        }
        
        //console.debug(thumbUrl, dialId, Images);
    },
        
    this.filesPreUpload =(idClient, ClientItem, ServerItem)=> {
        if(!ClientItem.image) return;
        var f = new FormData();
        
        //console.debug("filesPreUpload", idClient, ClientItem);
                
        if(ClientItem.image.indexOf("filesystem:") === 0){
            var xmlHTTP = new XMLHttpRequest();

            xmlHTTP.open('GET', ClientItem.image, true);
            xmlHTTP.responseType = 'arraybuffer';
            xmlHTTP.onload = function(e) {
                var blob = new Blob([this.response]);
                //var src = window.URL.createObjectURL(blob);
                
                f.append( "file", blob, "LSP_dial_"+idClient+"_"+crc32(String(ClientItem.url))+".png");

                //console.debug("Success", blob);
                
                self.filesToServer(idClient, ServerItem, f);
            };
            xmlHTTP.onloadstart = function(e) {/*console.debug("startImgLoad", e);*/};
            xmlHTTP.onerror = function(err) {console.debug("Image ERR", err);};
            xmlHTTP.send();
        }
        else
        if(ClientItem.image.indexOf("blob:resource") === 0){
            var FileName = dialImageFileName(ClientItem.url, idClient);
            //console.debug(FileName);
            
            BRW_getFileSystem(function(){//Wait for load filesystem
                fileStorage.getAttachment('thumbs', FileName).then(function(blob){
                    //console.debug(FileName, blob);
                    
                    f.append( "file", blob, "LSP_dial_"+idClient+"_"+crc32(String(ClientItem.url))+".png");
                    self.filesToServer(idClient, ServerItem, f);
                });
            });
        }
    },
    
    this.filesToServer =(idClient, ServerItem, formData)=> {
        //console.debug("filesToServer", idClient, ServerItem, formData);
        
        self.formPost(
            self.API.server + "/files:preupload",
            formData,
            function( response ){ // success
                //console.debug(response);
                
                if(response.errorCode == 0 && response.body.files.file){
                    //console.debug(response.body.files.file);
                    
                    var tryUpdateDialImageTimer = setInterval(function(){
                        if(self.state.synchronized){
                            clearInterval(tryUpdateDialImageTimer);
                            
                            ServerItem['_tempfilename'] = response.body.files.file;
                                                        
                            self.ajax(
                                {
                                    "action": "put_dials", 
                                    "dials": [ServerItem]
                                }, 
                                function (addResp) {
                                    //console.log(addResp);
                                    self.setUpTime(["dials"], addResp.lastUpdateTime);
                                    self.clearChangedMarker();
                                }, 
                                function (addErr) {
                                    console.debug("Can't push dial", addErr);
                                }
                            );
                        }
                    }, 1500);
                    
                    
                    
                }else{//error
                    console.debug("Image File ERR", response);
                }
            },
            function( error ){ // error
                console.debug("Image File ERR", error);
            }
        );
    },
        
    this.formPost = function(url, formData, onSuccess, onError){
        try{
            if(BROWSER && BROWSER == "firefox" && false){//Firefox
                BRW_post(
                    url, 
                    formData, 
                    function(response){
                        //console.debug("Request onload\n", response);

                        var data = JSON.parse(response.currentTarget.responseText);

                        if(onSuccess) onSuccess(data);
                    }, 
                    function(error){
                        console.debug("Request ERR\n", error);
                        if(onError) onError(error);
                    }
                );

            }else{//Chrome and Opera
                    var xhr = new XMLHttpRequest();

                    xhr.open( 'POST', url, true );
                    xhr.onreadystatechange = function ( response ) {
                        //console.debug("Request response\n", response);
                    };
                    xhr.onload = function ( response ) {
                        //console.debug("Request onload\n", response);

                        var data = JSON.parse(response.currentTarget.responseText);

                        if(onSuccess) onSuccess(data);
                    };
                    xhr.onerror = function( error ) {
                        console.debug("Request ERR\n", error);
                        if(onError) onError(error);
                    };
                    xhr.withCredentials = true;
                    xhr.send( formData );
            }
        }catch(ex){
            if(onError) onError(ex);
        }
        
    },
        
    this.syncFavorites = function(actions, callBack){
        //return callBack();
        
        var Now = Date.now();
        self.getUpTime(); //self.state.uptime
                
        //console.debug(self.state.uptime);
        
        self.ajax(
            {
                "action": "lists:get",
                "body": {
                    "key"  : "favorites"
                }
            },
            function(Server, Error){//Success
                self.ajax(
                    {
                        "action": "lists:get",
                        "body": {
                            "key"  : "favorites",
                            "token": self.state.uptime.favorites || false,
                        }
                    },
                    function(ServerUPD, ErrorUPD){//Success
                        if(
                            (Error == 0) ||
                            (self.state.uptime.token == null && Error == -5)
                        ){  
                            if(!Server.items) Server.items = [];
                            if(!Server.token) Server.token = null;
                            if(!ServerUPD.items) ServerUPD.items = [];
                            if(!ServerUPD.removedUuids) ServerUPD.removedUuids = [];

                            var Client = getFavoriteThemesObject() || {};

                            var sUUID = [], sValUUID = {}, sUpdUUID = [], cUUID = [], BothUUID=[], sDateUUID = {}, removedUuids = [];
                            var serverAdd = [], serverDelete = [], clientTouch = false;

                            for(var key in Client){
                                cUUID.push(key);
                                BothUUID.push(key);
                            }
                            
                            for(var key in Server.items){                                
                                var val = Server.items[key];
                                var uuid = String(val.uuid).split('-').shift();
                                
                                sDateUUID[uuid] = val.uuid;
                                
                                sUUID.push(uuid);
                                sValUUID[uuid] = JSON.parse(val.value);
                                if(BothUUID.indexOf(uuid) === -1) BothUUID.push(uuid);
                            }
                            
                            for(var key in ServerUPD.items){
                                var val = ServerUPD.items[key];
                                var uuid = String(val.uuid).split('-').shift();
                                sUpdUUID.push(uuid);
                            }
                            
                            for(var key in ServerUPD.removedUuids){
                                var val = ServerUPD.removedUuids[key];
                                removedUuids.push(val.split('-').shift());
                            }
                            
                            //console.debug("Favorites", Server, ServerUPD, Client);

                            for(var key in BothUUID){
                                var uuid = BothUUID[key];
                                var decision = false;

                                if(
                                    cUUID.indexOf(uuid) !== -1
                                    &&
                                    sUUID.indexOf(uuid) !== -1
                                ){
                                    //Both //Skip
                                    
                                }else if(cUUID.indexOf(uuid) !== -1){// Only client
                                    decision = "server add";
                                    
                                    if(self.state.route != "client"){
                                        if(removedUuids.indexOf(uuid) !== -1){
                                            decision = "client delete";
                                        }
                                    }
                                    
                                }else if(sUUID.indexOf(uuid) !== -1){ // Only server
                                    decision = "client add";
                                    
                                    if(self.state.route != "server"){
                                        if(sUpdUUID.indexOf(uuid) === -1){
                                            decision = "server delete";
                                        }
                                    }
                                }

                                //console.debug(uuid, decision);

                                if(decision) switch(decision){
                                    case "server add":
                                        serverAdd.push({
                                            uuid : uuid + '-' + String(Date.now()).substr(-4),
                                            value: JSON.stringify(Client[uuid])
                                        });
                                    break;
                                    case "server delete":
                                        for(var key2 in Server.items){
                                            if(
                                                uuid
                                                &&
                                                String(Server.items[key2].uuid).indexOf(uuid) === 0
                                            ){
                                                serverDelete.push(Server.items[key2].uuid);
                                            }
                                        }
                                    break;
                                    case "client add":
                                        clientTouch = true;
                                        Client[uuid] = sValUUID[uuid];
                                    break;
                                    case "client delete":
                                        clientTouch = true;
                                        delete Client[uuid];
                                    break;
                                }

                            }

                            //self.state.route = normal | client | server
                            
                            if(clientTouch){
                                //favorite-themes-data
                                
                                var clientList = [];
                                for(var key in Client){
                                    clientList.push(Client[key]);
                                }
                                
                                localStorage.setItem("favorite-themes-data", JSON.stringify(clientList));
                            }

                            if(serverDelete.length){
                                self.ajax(
                                    {
                                        "action": "lists:delete",
                                        "body": {
                                            "key": "favorites",
                                            "uuid": serverDelete
                                        },
                                    },
                                    function(PushResp){//PUSH Success
                                        //console.debug("Favorites DEL Success", PushResp);
                                        if(PushResp.token){
                                            self.setUpTime(["favorites"], false, PushResp.token);
                                        }
                                    }//Success
                                    ,
                                    function(Err){//Error
                                        console.info("Favorites DEL ERR", Err);
                                    }//Error
                                );
                            }

                            if(serverAdd.length){
                                var send = {
                                    "action": "lists:set",
                                    "body": {
                                        "key": "favorites",
                                        "item": serverAdd
                                    }
                                };
                                
                                //console.debug("Send to server", send);
                                
                                self.ajax(
                                    send,
                                    function(PushResp){//PUSH Success
                                        //console.debug("Favorites PUSH Success", PushResp);

                                        if(PushResp.token){
                                            self.setUpTime(["favorites"], false, PushResp.token);
                                        }
                                    }//Success
                                    ,
                                    function(Err){//Error
                                        console.info("Favorites push ERR", Err);
                                    }//Error
                                );
                            }
                            
                            if(!serverDelete.length && !serverAdd.length && Server.token){
                                self.setUpTime(["favorites"], false, Server.token);
                            }
                            
                            setTimeout(()=>{
                                if(clientTouch) {
                                    BRW_sendMessage({command: "reloadOptionsTabPages"});
                                    BRW_sendMessage({command: "reloadFavoritesTabPages"});
                                }
                                
                               if(callBack) callBack(); 
                            }, 50);

                            //self.state.uptime.favorites;

                        }
                    }//Success
                );//ajax
            }//Success
        );//ajax
        
        return true;
    },
    
    this.syncToDo = function(actions, callBack){
        var Now = Date.now();
        self.getUpTime(); //self.state.uptime
        self.state.last = self.state.uptime;
        
        self.state.refresh.todo = false;
        
        self.ajax(
            {
                "action": "lists:get",
                "body": {
                    "key"  : "mylist",
                    //"token": self.state.uptime.token
                }
            },
            function(Server, Error){//Success
                if(
                    (Error == 0) ||
                    (self.state.uptime.token == null && Error == -5)
                ){
                    if(!Server.items) Server.items = [];
                    if(!Server.token) Server.token = null;
                    
                    BRW_dbTransaction(function(tx) {
                        BRW_dbSelect(
                            {tx: tx, from: 'TODO_ITEMS'},
                            function(Client){//Success
                                //console.log("syncToDo", Server, Client);
                                
                                var Changed  = self.changedToDo(false, "changed");
                                var Removed  = self.changedToDo(false, "removed");
                                var Switched = self.changedToDo(false, "switched");
                                
                                //console.log(Changed); console.log(Switched);
                                
                                self.changedToDo("clear", "removed");
                                self.changedToDo("clear", "switched");
                                self.changedToDo("clear", "changed");
                                
                                var sUUID = [], cUUID = [], BothUUID=[], CbyUUID={}, SbyUUID={};
                                
                                for(var sKey in Server.items) if(Server.items[sKey].uuid) {
                                    sUUID.push(Server.items[sKey].uuid);
                                    BothUUID.push(Server.items[sKey].uuid);
                                    
                                    
                                    Server.items[sKey].value = JSON.parse(Server.items[sKey].value);
                                    SbyUUID[Server.items[sKey].uuid] = Server.items[sKey].value;
                                }//for
                                
                                for(var cKey in Client.rows) if(Client.rows[cKey].id) {
                                    var uuid = self.todoUUID(Client.rows[cKey]);
                                    
                                    cUUID.push(uuid);
                                    if(BothUUID.indexOf(uuid) == -1) BothUUID.push(uuid);
                                    
                                    CbyUUID[uuid] = Client.rows[cKey];
                                }//for
                                
                                /*
                                console.log(sUUID, cUUID);
                                console.log(SbyUUID);
                                console.log(CbyUUID);
                                return;
                                */
                                
                                for(var kBoth in BothUUID){
                                    var vBoth = BothUUID[kBoth];
                                    
                                    var decision = false;
                                    
                                    if(
                                        (sUUID.indexOf(vBoth) > -1 && cUUID.indexOf(vBoth) > -1)
                                    ){//both
                                        if(
                                            (CbyUUID[vBoth].done != SbyUUID[vBoth].done)
                                            ||
                                            (CbyUUID[vBoth].title != SbyUUID[vBoth].title)
                                        ){//Param
                                            if(
                                                (Switched.indexOf(vBoth) > -1)
                                                ||
                                                (typeof Changed[CbyUUID[vBoth].id] != "undefined" && Changed[CbyUUID[vBoth].id].update)
                                            )
                                            {
                                                decision = "server update";
                                            }else{//Server is main
                                                decision = "client update";
                                            }//else
                                        }else if(CbyUUID[vBoth].item_order != SbyUUID[vBoth].item_order){//Order
                                            //console.log('order', Changed);
                                            if(typeof Changed[CbyUUID[vBoth].id] != "undefined" && Changed[CbyUUID[vBoth].id].sorted){
                                                decision = "server update";
                                            }else{//Server is main
                                                decision = "client update";
                                            }//else
                                        }//else
                                    }else if(cUUID.indexOf(vBoth) > -1){//only on client
                                        /*
                                        console.log("On Cleint", CbyUUID[vBoth], vBoth);
                                        console.log(cUUID);
                                        console.log(CbyUUID);
                                        */
                                        
                                        if(!self.state.route || self.state.route == "normal"){
                                            if(CbyUUID[vBoth].id > self.state.last.todo){
                                                decision = "server add";
                                            }else{
                                                decision = "client delete";
                                            }//else
                                        
                                        }else{//route
                                            if(self.state.route == "server"){
                                                decision = "client delete";
                                            }else /*if(self.state.route == "merge")*/{
                                                decision = "server add";
                                            }
                                        }//else
                                    }else if(sUUID.indexOf(vBoth) > -1){//only on server
                                        //console.log("On Server")
                                        
                                        if(!self.state.route || self.state.route == "normal"){
                                            if(
                                                (Removed.indexOf(vBoth) > -1)
                                                ||
                                                (String(vBoth) != String(self.todoUUID(SbyUUID[vBoth])))
                                            ){
                                                decision = "server delete";
                                            }else{
                                                decision = "client add";
                                            }

                                        }else{//route
                                            if(self.state.route == "client"){
                                                decision = "server delete";
                                            }else /*if(self.state.route == "merge")*/{
                                                decision = "client add";
                                            }
                                        }//else
                                    }
                                    
                                    //console.log("ToDo Decision", decision, kBoth, vBoth, "Route", self.state.route);
                                    
                                    //############ Actions & execution ############//
                                    
                                    var sendServerAdd = {
                                        "action": "lists:set",
                                        "body": {
                                            "key": "mylist",
                                            "item": []
                                        }
                                    };
                                    
                                    var sendServerDel = {
                                        "action": "lists:delete",
                                        "body": {
                                            "key": "mylist",
                                            "uuid": []
                                        }
                                    };
                                    
                                    if(decision) switch(decision){
                                        case "client add"://use
                                            self.state.refresh.todo = true;
                                            
                                            var Item = {
                                                id          : SbyUUID[vBoth].id,
                                                title       : SbyUUID[vBoth].title,
                                                done        : SbyUUID[vBoth].done,
                                                item_date   : SbyUUID[vBoth].item_date,
                                                item_order  : SbyUUID[vBoth].item_order,
                                            };
                                            
                                            //console.log("TODO ADD", Item);
                                            
                                            BRW_dbInsert(
                                                { //Param
                                                    tx   : tx,
                                                    table: 'TODO_ITEMS',
                                                    'set'  : Item,
                                                    passive: ['todo']
                                                },
                                                function(){
                                                    //console.log("ADD: ", Item);
                                                },//success
                                                function(){//error
                                                    console.log("Can't insert ToDO Item", Item);
                                                }
                                            );//dbInsert
                                        break;

                                        case "client update":
                                            self.state.refresh.todo = true;
                                            
                                            var Item = {
                                                title       : SbyUUID[vBoth].title,
                                                done        : SbyUUID[vBoth].done,
                                                //item_date   : SbyUUID[vBoth].item_date,
                                                item_order  : SbyUUID[vBoth].item_order,
                                            };
                                            
                                            //console.log("TODO UPD", Item);
                                            
                                            BRW_dbUpdate(
                                                { //Param
                                                    tx   : tx,
                                                    table: 'TODO_ITEMS',
                                                    'set'  : Item,
                                                    where: {key: 'id', val: CbyUUID[vBoth].id},
                                                    passive: ['todo']
                                                },
                                                function(){
                                                    //console.log("ADD: ", Item);
                                                },//success
                                                function(){//error
                                                    console.log("Can't update ToDO Item", Item);
                                                }
                                            );
                                        break;

                                        case "client delete":
                                            self.state.refresh.todo = true;
                                            
                                            BRW_dbDelete(
                                                {//Param
                                                    tx : tx,
                                                    table   :  'TODO_ITEMS',
                                                    where   : {
                                                        key : 'id', val : CbyUUID[vBoth].id
                                                    }
                                                }
                                            );
                                        break;

                                        case "server add": 
                                        case "server update":
                                            var Item  = CbyUUID[vBoth];
                                            Item.sync = Now;
                                                                                        
                                            sendServerAdd.body.item.push({
                                                uuid  : vBoth,
                                                value : JSON.stringify(Item)
                                            });
                                        break;

                                        case "server delete"://use
                                            sendServerDel.body.uuid.push(vBoth);
                                        break;
                                    }//if switch
                                    
                                    //console.log("TODO decision", decision);
                                    
                                    if(sendServerDel.body.uuid.length){
                                        //console.log("TODO S DEL", sendServerDel.uuid);

                                        self.ajax(
                                            sendServerDel,
                                            function (DelResp, PushErr) { //DEL Success
                                                if (DelResp.token) {
                                                    //self.changedToDo("clear", "removed");
                                                }
                                            }//Del success
                                            ,
                                            function(Err){//Error
                                                localStorage.setItem("sync-todo-removed", JSON.stringify(Removed));
                                            }//Error
                                        );
                                    }//if
                                    
                                
                                    //self.changedToDo("clear", "switched");
                                
                                    if(sendServerAdd.body.item.length){
                                        //console.log("SEND todo", sendServerAdd.body.item);

                                        //if(false)
                                        self.ajax(
                                            sendServerAdd,
                                            function(PushResp, PushErr){//PUSH Success
                                                if(PushResp.token){
                                                    self.setUpTime(["todo"], false, PushResp.token);
                                                }
                                            }//Success
                                            ,
                                            function(Err){//Error
                                                localStorage.setItem("sync-todo-removed", JSON.stringify(Switched));
                                                localStorage.setItem("sync-todo-switched", JSON.stringify(Switched));
                                                localStorage.setItem("sync-todo-changed", JSON.stringify(Switched));
                                            }//Error
                                        );
                                    }//if

                                }//for
                                
                                
                                setTimeout(function(){
                                    if(callBack){
                                        //self.changedToDo("clear", "switched");
                                        //self.changedToDo("clear", "changed");
                                        
                                        callBack(actions);
                                    }//if
                                }, 510);
                            }//Success
                        );
                    });//transaction
                }//if
            }//Success
            
        );//ajax
        
        return true;
    },
        
    this.changedToDo = function(uuid, property){
        var storeKey = (property ? "sync-todo-"+property : "sync-todo-removed");
        
        var values = JSON.parse(localStorage.getItem(storeKey) || "[]");
        
        if(uuid){
            if(uuid == 'clear'){
                if(property != 'changed') values = [];
                else  values = {};
            }else{
                values.push(uuid);
                values = arrUnique(values);
            }//if
                
            
            localStorage.setItem(storeKey, JSON.stringify(values));
        }//if
        
        return values;
    },
        
    this.deleteToDo = function(item){
        var uuid = self.todoUUID(item);
        self.changedToDo(uuid, "removed");
        return uuid;
    },
        
    this.switchToDo = function(item){
        var uuid = self.todoUUID(item);
        self.changedToDo(uuid, "switched");
        return uuid;
    },
        
    this.changeToDo = function(item){
        var uuid = self.todoUUID(item);
        self.changedToDo(uuid, "changed");
        return uuid;
    },
        
    this.todoUUID = function(item){
        var uuid = [];
        
        //console.log(item);
        
        //uuid.push(crc32(item.title).toString("16"));
        uuid.push(crc32(String(item.id)).toString("16"));
        
        var date = new Date(item.id);
        
        uuid.push(date.getFullYear());
        
        uuid.push(
            String("0"+String(date.getMonth()+1)).slice(-2)
            +
            String("0"+String(date.getDate())).slice(-2)
        );
        
        uuid.push(
            String("0"+String(date.getHours())).slice(-2)
            +
            String("0"+String(date.getMinutes())).slice(-2)
        );
        
        uuid.push(String(String(item.id).substr(1)));
        
        uuid = String(uuid.join('-'));
        
        //console.log(uuid);
        
        return uuid;
    },
        
    this.crcDial = function(url){
        var out = urlCleanSync(url);
        out = crc32(out);
        
        return out;
    },
    this.hashDial = function(url){
        //console.log(url);
        var out = urlCleanSync(url);
        out = crc32(out).toString("16");
        
        return out;
    },
    
    /*        
    this.urlClean = function(url){
        var out = String(url).trim().toLowerCase();
        
        if(out.indexOf("http://" ) == 0 ) out = out.substr(7);
        if(out.indexOf("https://") == 0 ) out = out.substr(8);
        if(out.indexOf(  "www."  ) == 0 ) out = out.substr(4);
        
        var len = out.length - 1;
        
        while(len > 0 && out.length[len] == "/"){
            out = out.substr(0, len);
            len--;
        }//while
        
        return out;
    },
    */

    this.syncError = function(reason, error){
        console.info("Sync fail: ", reason);//, error);
    }
    
    this.checkAuth = function(signup){
        if(AUTH){
            if(AUTH.state.networkError){
                self.errorMessage("network");
            }else if(AUTH.isPremium("discovered")){
                self.syncStart({popup:true});                
            }else{
                self.GA("button", false, "Dont_auth");
            }//else
        }else{
            console.info("AUTH is undefined");
            self.GA("button", false, "Dont_auth");
        }
    },
        
    this.GA = function(action, label, value){
        sendToGoogleAnaliticMP(function() {
            gamp('send', 'event', 'sync', action, label, value);
        });
    },
        
    this.listenUpdates = function(interval){
        setInterval(function(){
            AUTH.check(false, function(){
                if(localStorage.getItem('sync-need-push') ==  1){
                    localStorage.setItem('sync-need-push', 0);
                    localStorage.setItem('sync-last-auto-update', Date.now());
                    //console.log("Sync. Reason: changes on client");
                    self.syncStart();
                }//if
            });
        }, interval);
    },
    
    this.autoUpdate = function(interval){
        var last = localStorage.getItem("sync-account") || false;
        var login = AUTH.getLogin();
        
        if(!last && login){
            setTimeout(function(){
                if(!localStorage.getItem("sync-progress")){
                    self.autoStart();
                }
            }, 5500);
        }
        
        setInterval(function(){
            var last = localStorage.getItem('sync-last-auto-update') || 0;
            var now = Date.now();
            
            if(
                !localStorage.getItem("sync-progress") &&
                ((now - self.state.touch) >= interval) &&
                ((now - last) >= interval)
            ){
                self.autoStart();
            }else{
                self.pickUpSync();
            }//else
        }, 10000);
        
        self.pickUpSync();
    },
            
    this.pickUpSync = function(){
        var progress = localStorage.getItem("sync-progress") || false;
        
        if(progress){
            var waitStart, waitDisplay;
            
            waitStart = setTimeout(function(){
                var current = localStorage.getItem("sync-progress") || false;

                if(current && current == progress){
                    localStorage.setItem("sync-progress", Date.now());
                    self.autoStart();
                }//if
            }, 5500);
            
            waitDisplay = setTimeout(function(){
                var current = localStorage.getItem("sync-progress") || false;
                if(current && current == progress){
                    clearTimeout(waitStart);
                }
            }, 1025);
            
            self.otherSyncInformer();
        }//if
    },
        
    this.otherSyncInformer = function(){
        if(self.state.inProgress) return;
        
        var progress = localStorage.getItem("sync-progress") || false;
        
        if(progress){
            self.syncProgress('on');
            var n = 0;
            var displayInterval = setInterval(function(){
                
                if(self.state.inProgress){
                    clearInterval(displayInterval);
                }else{
                    var current = localStorage.getItem("sync-progress") || false;
                    
                    if(!current){
                        clearInterval(displayInterval);
                        self.syncProgress('off');
                    }
                }
            }, 1500);
        }
    },
        
    this.autoStart = function(){
        AUTH.check(false, function(){
            localStorage.setItem('sync-need-push', 0);
            localStorage.setItem('sync-last-auto-update', Date.now());
            
            self.syncStart();
        });
    },
        
    this.errorMessage = function(type){
        switch(type){
            case "network":
                authButtonInfo("error");
                $.jGrowl(translate("error_sync_network"), { "life" : 3000, position: "top-left"});
            break;
        }//switch
    },
        
    //Everhelper cookies
    this.evhCookies = function(cookies){
        var need = ['eversessionid','auth','auth_login'];
        
        for(var k in cookies) if(need.indexOf(cookies[k].name) > -1){
            self.cookies[cookies[k].name] = cookies[k];
        }//for
        
        if(!self.cookies || !self.cookies.auth){
            if(self.queue.signup){
                self.queue.signup = false;
                self.userLogin();
            }   
        }else self.syncStart();
    },

    //Change modal tab
    this.setTab = function(tab){
        self.login.window.css("display", "none");
        self.register.window.css("display", "none");
        self.remind.window.css("display", "none");
        
        self[tab].window.css("display", "block");
    },
    
    this.syncProgress = function(status, timer){
        if(timer) self.syncTimer(status);
        
        //console.debug("sync animation", status, timer);
        //console.trace();
        
        if(status == "on"){//on
            if(timer) self.state.inProgress = true;
            $button.find('.animation').show();
            $button.find('.animation > div > div').css({"background-color":"white", "opacity":1});
        }else{//off
            self.state.inProgress = false;
            setTimeout(function(){
                //$button.find('.animation').hide();
                $button.find('.animation > div > div')
                    .animate({"background-color":"#61FEFF"}, 800).delay(400)
                  //.animate({"background-color":"#FBFF61"}, 800).delay(400)
                    .animate({"background-color":"#75FF82"}, 800).delay(1200)
                    .animate({"opacity":0.0}, 100, function(){
                        $button.find('.animation').delay(100).fadeOut("slow");//.hide("slow"); 
                    });
                ;
            }, 3500);
        }//else
    },
    
    this.syncTimer = function(status){
        if(status == "on"){//on
            var now = Date.now();
            localStorage.setItem("sync-progress", now);
            
            if(!self.state.syncTimer){
                self.state.syncTimer = setInterval(function(){
                    self.syncTimer("on");
                }, 1000);
            }//if
        }else{//off
            clearInterval(self.state.syncTimer);
            self.state.syncTimer = false;
            
            setTimeout(()=>{
                localStorage.removeItem("sync-progress");
            }, 1500);
        }//else
    }//if
    
    return self;
}//function

function indexUn(ArrOrObj, find, field){
    for(var x in ArrOrObj){
        if(
            (!field && ArrOrObj[x] == find) ||
            ( field && ArrOrObj[x][field] == find)
        ){
            return x;
            break;
        }//if
    }//for
    return -1;
}

function similarObjects(obj1, obj2, skipEmpty){
    for(var key in obj1){
        if(key in obj2){
            if(obj1[key] != obj2[key]) return key;
        }else if(!skipEmpty) return key;
    }//for
    
    for(var key in obj2){
        if(key in obj1){
            if(obj2[key] != obj1[key]) return key;
        }else if(!skipEmpty) return key;
    }//for
    
    return true;
}

function arrUnique(arr) {
    var i = arr.length;
    arr.sort();

    while (i--) {
        if (arr[i] == arr[i - 1]) {
            arr.splice(i, 1);
        }
    }
    
    return arr;
}








