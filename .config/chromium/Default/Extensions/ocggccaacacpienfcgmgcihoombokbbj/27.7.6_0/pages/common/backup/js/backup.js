var BACK = false;

if(typeof NAVI != "undefined" && typeof onLoadNavi == "object"){
    onLoadNavi.push(onPageLoadBackup);
}else{
    $(function() {
        onPageLoadBackup();
    });
}

function onPageLoadBackup (){
    BACK = new BackUp(); 
    BACK.init();
    setInterval(function(){
       if(getBackupEnable()) BACK.check(); 
    }, 5 * 60 * 60 * 1000);
};

function BackUp(){
    var self = this;
    
    this.options={
        period: 1 * 24 * 60 * 60 * 1000,
        waiter: 60 * 1000,
        maxLen: 10 * 1024 * 1024, // 10MB
        ui: false,
    };
    
    this.state={
        last: 0,
        date: {},
        n: 0,
        version: false,
        checked: false,
        links: {
            whyRu : "https://everhelper.desk.com/customer/portal/articles/2572955-%D0%9E%D1%88%D0%B8%D0%B1%D0%BA%D0%B0-%22%D0%A3%D0%BF%D1%81-%D0%B2%D0%B0%D1%88%D0%B0-%D0%B1%D0%B0%D0%B7%D0%B0-%D1%81%D1%83%D0%B4%D1%8F-%D0%BF%D0%BE-%D0%B2%D1%81%D0%B5%D0%BC%D1%83-%D0%BF%D0%BE%D0%B2%D1%80%D0%B5%D0%B6%D0%B4%D0%B5%D0%BD%D0%B0-%22?b_id=11251",
            whyEn : "https://everhelper.desk.com/customer/portal/articles/2572954-oops-looks-like-your-database-was-damaged---how-to-solve-"
        }
    };
    
    this.storage={
        
    };
    
    this.tables={
        'DIALS'     : {source:'datebase', allow_empty:false},
        'GROUPS'    : {source:'datebase', allow_empty:false},
        'TODO_ITEMS': {source:'datebase', allow_empty:true},
        'SETTINGS'  : {source:'datebase', allow_empty:true},
        //'IMAGES'    : {source:'datebase', allow_empty:true},
        'storage'   : {source:'localStorage', allow_empty:true},
    };
        
    this.obj={
        $container   : false,
        $settings_container  : $("#backup-settings-container"),
        $options_container   : $("#backup-options-container"),
        $newtab_container    : $("#backup-newtab-container"),
        $modal  : $("#backup-modal"),
        $why    : $(".backup-why")
    };
    
    this.init = function(){
        //self.state.last = localStorage.getItem("backup-date") || 0;
        self.state.started = localStorage.getItem("backup-started") || 0;
        
        if(self.obj.$settings_container.length){
            self.obj.$container = self.obj.$settings_container;
            self.options.ui = "settings";
        }else if(self.obj.$newtab_container.length){
            self.obj.$container = self.obj.$newtab_container;
            self.options.ui = "newtab";
        }else if(self.obj.$options_container.length){
            self.obj.$container = self.obj.$options_container;
            self.options.ui = "settings";
        }//else if
        
        self.obj.$container.load("../common/backup/backup.html", function(){
            var $informer = $("#backupInformer");

            self.obj.informer = {
                $informer   : $informer,
                $date       : $informer.find(".lastBackupDateValue"),
                $restored   : $informer.find(".lastBackupRestored"),
                $list       : $informer.find(".backupItems"),
                $version    : $informer.find(".backupVersions"),
                $desc       : $informer.find(".backup-description"),
                $restoreBtn : $informer.find("#backup-restore-btn"),
                $createBtn  : $informer.find("#backup-create-btn"),
                $doneBtn    : $informer.find("#backup-done-btn"),
                $doneTimer  : $informer.find("#backup-done-btn t"),
            }
            
            setTimeout(function(){
                autoTranslate($informer);
                
                if(self.options.ui == "settings"){
                    if(getBackupEnable()) self.getBackup(true);
                    self.obj.informer.$createBtn.removeClass("hide");
                    self.obj.informer.$restoreBtn.removeClass("hide");
                }else{
                    if(getBackupEnable()){
                        var last = parseInt(localStorage.getItem("backup-last-check") || 0);
                        var now = Date.now();
                        
                        if((now - last) > self.options.period){
                            localStorage.setItem("backup-last-check", now);
                            self.getBackup(true);
                        }//if
                        
                        self.obj.informer.$informer.addClass('backup-new-tab');
                    }//if
                    //self.newtabModal();
                }//else 
            }, 350);
            
            self.obj.informer.$restoreBtn.unbind("click").on("click", function(){
                var $btn = $(this);
                self.restoreConfirmation();
                                
                $btn.attr("disabled","disabled");
                
                setTimeout(function(){
                    $btn.attr("disabled",false);
                }, 500);
            });  
            
            self.obj.informer.$createBtn.unbind("click").on("click", function(){
                self.check(true);
            });  
            
            self.obj.informer.$doneBtn.unbind("click").on("click", function(){
                self.reloadAllPages();
            });
            
            self.obj.informer.$desc.find("a").unbind("click").on("click", function(e){
                e.preventDefault(); e.stopPropagation();
                
                openUrlInNewTab(
                    extensionGetUrl("/pages/options/settings.html#navi-settings-backup")
                );
            });
            
            self.obj.informer.$version.unbind("click").on("click", "li", function(e){
                self.printInformer($(this).attr("version"));
            });
            
            self.obj.$why.unbind("click").on("click", function(e){
                self.why();
            });
        });
    },
        
    this.getBackup = function(force){
        if(!self.storage || force){
            BRW_sendMessage({"command": "getBackup"});
        }//else
    },
    
    this.setBackup = function(Data, callBack){
        BRW_sendMessage({"command": "setBackup", data:Data}, function(result) {
            self.obj.informer.$createBtn.attr("disabled", false);
        });
    },
        
    this.readBackup = function(data){
        if(data){
            var Data = JSON.parse(data);
            
            var keys = Object.keys(Data).sort(function(a,b){return (a < b)});
            
            if(keys.length){
                self.storage = Data;
                self.state.keys    = keys;
                self.state.version = keys[0];
                
                self.printInformer();
                //console.log('readBackup', keys, Data);
            }//if
        }//if
        
        if(!self.state.checked){
            self.state.checked = true;
            
            setTimeout(function(){
                self.check();    
            }, 350);
        }//if
        
    },
    
    this.newtabModal = function(onSuccess, onModalExit, alternative){
        self.getBackup(true);
        
        setTimeout(function(){
            self.obj.informer.$desc.removeClass("hide")
                .find("span")
                .append($("<span>").text(translate("backup_confirm_line_1")))
                .append($("<br/>"))
                .append($("<span>").text(translate("backup_confirm_line_2")))
            ;

            if(self.printInformer()){
                self.obj.$modal.modal();
            }else{
                if(typeof onModalExit == "function") alternative();
            }//if

            self.obj.$modal.on('hidden.bs.modal', function (e) {
                if(!self.state.justRestore && typeof onModalExit == "function") onModalExit();
            });

            self.obj.informer.$restored.hide();
            self.obj.informer.$restoreBtn.hide();
            
            
            self.state.restoreMode = 'db';
            
            self.restore(false, alternative);
        }, 750);
    },
        
    this.restoreConfirmation = function(){
        /*
        var $html = $("<span>")
            .addClass("backup-confirm-message")
            .append(
                $("<span>")
                    .addClass("backup-confirm-text")
                    .text(translate("backup_confirm_recovery_text"))
            )
            .append(
                $("<span>")
                    .addClass("backup-confirm-attention")
                    .text(translate("backup_confirm_recovery_attention"))
            )
        ;
        */

        //btn-relative
        var $html = $("<div>")
            .append(
                $("<div>")
                .addClass("common-modal-body-buttons")
                .append(
                    $("<button>")
                        .attr("data-dismiss", "modal")
                        .addClass("btn btn-info options-common-popup-btn options-common-popup-hide relative min-w96")
                        .text(translate("backup_confirm_recovery_btn_db"))
                        .on("click", function(){
                            self.restore();
                        })
                        .append(
                            $("<span>")
                                .addClass("under-button")
                                .text(BACK.state.date.text)
                        )
                )
                .append(
                    $("<a>")
                        .attr("type", "file")
                        //.attr("data-dismiss", "modal")
                        .addClass("btn btn-info options-common-popup-btn options-common-popup-hide relative min-w96 btn-relative")
                        .append(
                            $("<span>")
                                .text(translate("backup_confirm_recovery_btn_file"))
                        )
                        .append(
                            $("<input>")
                                .attr("type", "file")
                                .attr("accept", ".lsp")
                                .text(translate("backup_confirm_recovery_btn_file"))
                                .on("change", function(){
                                    var file = $(this)[0].files[0]
                                    var name = String($(this).val()).split('\\').pop().split('/').pop();
                                    
                                    var start = 0, stop = file.size - 1;

                                    var reader = new FileReader();

                                    reader.onloadend = function (evt) {
                                        if (evt.target.readyState == FileReader.DONE) {
                                            var text = reader.result;
                                            
                                            $("#confirm-dialog").modal("hide");
                                            
                                            self.readBackupFile(text, name);
                                        }else{
                                            //$("#confirm-dialog").modal("hide");
                                            
                                        }//else
                                    };
                                    
                                    var blob = file.slice(start, stop + 1);
                                    reader.readAsBinaryString(blob);
                                })
                        )
                )
            )
            .append(
                $("<br />")
            )
        ;
        
        dialogConfirm({
            title: translate("backup_confirm_recovery_title"),
            message: $html,
            noButtons: true
        });
    },
        
    this.readBackupFile = function(raw, name){
        try{
            if(raw.indexOf('{') == -1 && raw.indexOf('%7B') != -1){
                raw = decodeURIComponent(raw);
            }//if
            
            var Data = JSON.parse(raw);
            
            if(typeof Data == "object" && parseInt(Data.date) > 0 && typeof Data.data  == "object"){
                self.state.date.stamp = Data.date;
                self.state.date.date  = new Date(self.state.date.stamp);
                self.state.date.text  = self.state.date.date.toLocaleDateString() + " " + self.state.date.date.toLocaleTimeString();
                
                self.obj.informer.$date.text(name);
                self.obj.informer.$restored.addClass("hide");
                
                self.state.restoreMode = 'file';
                
                self.restore(Data);
                
            }else{
                self.errorMessage("file");
            }
        }
        catch(e){
            console.log("CATCH", e);
            self.errorMessage("file");
        }
        
        
    },
        
    this.errorMessage = function(err){
        var msg = {};
        
        switch(err){
            case "file":
                msg.title   = translate("backup_restore_file_error");
                msg.message = $("<span>").addClass("common-message-warning").text(translate("backup_confirm_recovery_file_parse_error"));
            break;
        }//switch
        
        msg.noButtons = true;
        
        setTimeout(function(){
            dialogConfirm(msg);
        }, 500);
    },
        
    this.printInformer = function(setVersion){
        if(setVersion) self.state.version = setVersion;
        
        if(!self.state.version || !self.storage) return false;
        
        var Back = self.storage[self.state.version].data;
        var LastDate = self.storage[self.state.version].date;
        
        if(!Back || !LastDate) return false;
                
        var Restored = parseInt(localStorage.getItem("backup-restored") || 0);
        
        if(!setVersion) self.state.last = parseInt(LastDate);
        
        self.state.date.stamp = LastDate;
        self.state.date.date  = new Date(self.state.date.stamp);
        self.state.date.text  = self.state.date.date.toLocaleDateString() + " " + self.state.date.date.toLocaleTimeString();
        self.obj.informer.$date.text(self.state.date.text);
        
        self.obj.informer.$restoreBtn.removeClass("hide");
        
        if(Restored && Restored == LastDate){
            self.obj.informer.$restored.removeClass("hide");
        }else{
            self.obj.informer.$restored.addClass("hide");
        }//else
        
        for(var key in self.tables){
            if(Back[key]){
                if(!self.tables[key].$print){
                    self.tables[key].$print = $("<i>");
                    
                    self.tables[key].$list_item = $("<li>")
                        .append(
                            $("<b>").text(translate("backup_table_"+String(key).toLowerCase()))
                        )
                        .append(
                            $("<c>").text(": ")
                        )
                        .append(
                            $("<span>")
                                .append(self.tables[key].$print)
                                .append(
                                    $("<span>")
                                        .addClass("backup-table-items")
                                        .text(translate("backup_settings_item"))
                                )
                        )
                    ;
                    
                    
                    self.obj.informer.$list.append(self.tables[key].$list_item);
                    
                    //<li><b lang="backup_table_dials"></b>: <span><i></i> <span lang="backup_settings_item"></span></span></li>
                }//if
                
                if(!Back[key].length && !self.tables[key].allow_empty) self.tables[key].$list_item.addClass("err");
                else self.tables[key].$list_item.removeClass("err");
                
                self.tables[key].$print.text(Back[key].length);
                
                //console.log(Back[key].length, Back[key]);
            }//if
        }//for
        
        self.printVersions();
        
        return true;
    },
        
    this.printVersions = function(){
        var Restored = parseInt(localStorage.getItem("backup-restored") || 0);
        
        self.obj.informer.$version.find("li").remove();
        
        for(var k in self.state.keys){
            var key = parseInt(self.state.keys[k]);
            
            var $li = $("<li>");
            
            var date = new Date(parseInt(key));
            $li.text(date.toLocaleDateString() + " " + date.toLocaleTimeString());
            
            $li.attr("version", key);
            
            if(key == self.state.version){
                $li.addClass("act");
            }//if
            
            if(key == Restored){
                $li.append(
                    $("<i>").addClass("glyphicon").addClass("glyphicon-ok")
                );
            }//if
            
            self.obj.informer.$version.append($li);
        }//for
    },
       
    this.restore = function(FileData, alternative){
        if(self.state.restoring) return false;
        else if(!FileData && (!self.state.version || !self.storage)){
            if(alternative) alternative();
            return false;
        }else self.state.restoring = true;
        
        var now = Date.now();
        
        localStorage.setItem("restoring", now);
        
        if(FileData){
            var Back = FileData.data;
            var LastDate = FileData.date;
        }else{
            var Back = self.storage[self.state.version].data;
            var LastDate = self.storage[self.state.version].date;
        }
        
        if(!Back) return false;
        
        self.obj.informer.$restoreBtn.attr("disabled","disabled");
        self.obj.$container.find(".backup-table-items").addClass("hide");
        
        for(var key in self.tables){
            if(Back[key]){
                switch(self.tables[key].source){
                    case "datebase":
                        self.restoreTable(key, Back[key]);
                    break;
                    case "localStorage":
                        self.restoreLocalStorage(key, Back[key]);
                    break;
                }
            }//if
        }//for

    },
    
    this.restoreLocalStorage = function(Name, Data){
        self.tables[Name].need = Data.length;
        self.tables[Name].redy = 0;
        
        var updated = [];
        
        for (var key in Data) {
            self.tables[Name].redy++;
            
            if(
                (Data[key].key == 'restoring') ||
                (Data[key].key == 'browser-mode') ||
                (Data[key].key.indexOf("Dexie") != -1) ||
                (Data[key].key.indexOf("LargeLocalStorage") != -1)
            ) continue;
            
            if(Data[key].key == 'show-random-content-state'){
                if(self.state.restoreMode == 'file'){
                    Data[key].val = 0;
                }
            }
            
            localStorage.setItem(Data[key].key, Data[key].val);
            updated.push(Data[key].key);
        } //for
        
        var safe = ['install-key','installed-key','installed-themes','html5-video-h264','definedLocation','background-video-file','background-image-file','background-video-resolution','background-image-resolution','available-themes-data','available-themes-data-next-update','flixel-themes-data','flixel-themes-display-data','flixel-themes-data-next-update','flixel-themes-total-pages','background-video-resolution','background-video-content-type','background-video-content-author-url','background-video-content-author','available-themes-data','browser-mode','Dexie.DatabaseNames','LargeLocalStorage-meta', 'restoring'];
        
        for (var i=0; i < localStorage.length; i++)  {
            var key = localStorage.key(i);
            //var val = localStorage.getItem(key);
            
            if(
                (key.indexOf('_ondialsearch') != -1) ||
                (key.indexOf("Dexie") != -1) ||
                (key.indexOf("LargeLocalStorage") != -1)
            ) continue;
            
            if(
                (safe.indexOf(key) == -1) &&
                (updated.indexOf(key) == -1)
            ){
                localStorage.removeItem(key);
            }//if
        }//for
        
    }, 
    
    this.restoreTable = function(Name, Data){
        self.tables[Name].need = Data.length;
        self.tables[Name].redy = 0;
        
        
        BRW_dbUnsafeDeleteAll(Name, false, false, crc32(Name));
        
        setTimeout(function(){
            for (var key in Data) {
                self.restoreTableItem(Name, Data[key], key);
            } //for
        }, 250);
    }, 
        
    this.why = function(){
        BRW_getAcceptLanguages(function(languages){
            var hasRuLanguage = languages.indexOf("ru") != -1;
           
            if(hasRuLanguage){
                 openUrlInNewTab(self.state.links.whyRu);
            }else{
                openUrlInNewTab(self.state.links.whyEn);
            }
        });
    },
        
    this.restoreTableItem = function(Name, Item){
        //console.log(Name, Data);
        
        setTimeout(function(){
            BRW_dbTransaction(function (tx) {
                //console.log(Name, Item);
                
                if(Item.id) var where = {id:Item.id};
                else var where = {name:Item.name};
                
                //if(Item.id) var where = {key:'id', val:Item.id};
                //else var where = {key:'name', val:Item.name};
                
                var Update = {
                    param: {
                        tx: tx,
                        table: Name,
                        'set': Item
                    },
                    success: function (response) {
                        //console.log("OK", response);
                        self.tables[Name].redy++;
                        self.progress();
                    },
                    error: function (obj, err) {
                        console.log("ERR", err);
                        self.tables[Name].redy++;
                        self.progress();
                    }
                };
                
                BRW_dbSelect(
                    {
                        tx: tx, 
                        from: Name,
                        where: where,
                        limit: 1
                    },
                    function (data) {
                        if(data && data.rows && data.rows.length > 0){
                            if(where.id){
                                delete Update.param.set.id;
                                
                                Update.param.where = {
                                    key : 'id',
                                    val : where.id
                                }
                            }else{
                                delete Update.param.set.name;
                                Update.param.where = {
                                    key : 'name',
                                    val : where.name
                                }
                            }//else
                            
                            BRW_dbUpdate(Update.param, Update.success, Update.error);
                        }else{
                            BRW_dbInsert(Update.param, Update.success, Update.error);
                        }//else
                    },
                    function (err) {
                        console.log("DBSelect ERR: ", Name, where);
                    }
                );
            });
        }, (100 * (self.state.n++)));
    }, 
        
    this.progress = function(tx, Name, Item){
        var DonePrm = true;
        
        for(var key in self.tables) if(self.tables[key] && self.tables[key].$print){
            var text = "?";
            
            text = self.tables[key].redy + "/" + self.tables[key].need;
            self.tables[key].$print.text(text);
            
            if(self.tables[key].need > self.tables[key].redy){
                DonePrm = false;
            }else{
                self.tables[key].$print.append(
                    $("<i>").addClass("glyphicon").addClass("glyphicon-ok")
                );
            }//else
        }//for
        
        if(DonePrm){
            self.obj.informer.$restoreBtn.addClass("hide");
            self.obj.informer.$doneBtn.removeClass("hide");
            
            localStorage.setItem("backup-restored", self.state.date.stamp);
            
            self.obj.informer.$createBtn.addClass("hide");
            self.obj.informer.$restored.removeClass("hide");
            self.printVersions();
            
            
            self.state.justRestore = true;
            
            var delay = 15;
            
            self.obj.informer.$doneTimer.text(delay);
            setInterval(function(){
                if(delay < 0) self.reloadAllPages();
                else{
                    self.obj.informer.$doneTimer.text(delay);
                    delay--;
                }//else                
            }, 1000);
        }//if
    },
        
    this.check = function(manual, force){
        var now = Date.now();
        
        if(
            manual || force ||
            (
                (self.state.last !== false) &&
                ((now - self.state.last) > self.options.period) && 
                (!self.state.started || (now - self.state.started) > self.options.waiter)
            )
        ){
            
            if(!manual) self.create();
            else self.createAsk();
        }
    },
    
    this.createAsk = function(){
        var now = Date.now();
        
        var $html = $("<div>")
            .append(
                $("<div>")
                .addClass("common-modal-body-buttons")
                .append(
                    $("<button>")
                        .attr("data-dismiss", "modal")
                        .addClass("btn btn-info options-common-popup-btn options-common-popup-hide relative min-w96")
                        .text(translate("backup_confirm_create_btn_db"))
                        .on("click", function(){
                            self.obj.informer.$list.find("i").text("?");
                            self.obj.informer.$createBtn.attr("disabled","disabled");
                            self.obj.informer.$restored.addClass("hide");
                            self.obj.informer.$date.text(". . .");

                            localStorage.setItem("backup-started", now);
                            
                            self.create("save");
                        })
                )
                .append(
                    $("<button>")
                        .attr("data-dismiss", "modal")
                        .addClass("btn btn-info options-common-popup-btn options-common-popup-hide relative min-w96")
                        .text(translate("backup_confirm_create_btn_file"))
                        .append(
                            $("<span>")
                                .addClass("under-button")
                                .text(translate("sync_decide_btn_recomended"))
                        )
                        .on("click", function(){
                            self.obj.informer.$createBtn.attr("disabled","disabled");
                            
                            localStorage.setItem("backup-started", now);
                            
                            self.create("download");
                        })
                )
            )
            .append(
                $("<div>")
                .addClass("common-modal-bottom-hint")
                .text(translate("backup_confirm_create_note"))
            )
        ;
        
        dialogConfirm({
            title: translate("backup_confirm_create_title"),
            message: $html,
            noButtons: true
        });
    },
        
    this.create = function(mode){
        BRW_dbTransaction(function (tx) {
            for(var key in self.tables){
                if(self.tables[key].source == "datebase"){
                    self.dbRead(tx, key);   
                }else
                if(self.tables[key].source == "localStorage"){
                    self.localStorageRead(key);
                }
            }//for
        });
        
        var WaitInterval = setInterval(function(){
            var Done = true;
            for(var key in self.tables) if(self.tables[key].wait) Done = false;
            
            if(Done){
                clearInterval(WaitInterval);
                self.writeBackup(mode);
            }//if
        }, 750);
    },
        
    this.localStorageRead = function(Name){
        self.tables[Name].data=[];
        self.tables[Name].wait = true;
        
        for (var i=0; i < localStorage.length; i++)  {
            var key = localStorage.key(i);
            
            if(
                (key.indexOf('_ondialsearch') != -1) ||
                (key.indexOf("Dexie") != -1) ||
                (key.indexOf("LargeLocalStorage") != -1)
            ) continue;
            
            var val = localStorage.getItem(key);
            
            self.tables[Name].data.push({key:key, val:val});
        }//for
        
        self.tables[Name].success = true;
        self.tables[Name].wait = false;
    },

    this.writeBackup = function(mode){
        var writePrm = true, Data={};
        //console.log(self.tables);
        
        for(var key in self.tables){
            if(!self.tables[key].success) writePrm = false;
            if(
                !self.tables[key].allow_empty && 
                (!self.tables[key].data || !self.tables[key].data.length)
            ){
                writePrm = false;
            }
            
            Data[key] = self.tables[key].data;
        }//for
        
        Data = JSON.stringify({
            date: Date.now(),
            browser: browserName(),
            data: Data,
        });
        
        var Byte = byteLength(Data);
        
        var SizeMB = Math.round(1000*Byte/(1024*1024))/1000;
        
        //console.log("Backup size", SizeMB, "MB");
        
        if(Byte > self.options.maxLen && mode != "download"){
            writePrm = false;
            console.log("Backup too large: ", SizeMB, " MB");
            self.message("Backup too large: " + SizeMB + " MB");
        }//if
        
        if(writePrm){
            localStorage.removeItem("backup-started");
            
            if(mode == "download"){
                var date = new Date(Data.date);
                var name = "LSP_backup_"+browserName()+"_"+String(self.state.date.date.toLocaleDateString())
                    .replace('/', '_').replace('/', '_')
                    .replace('\\', '_').replace('\\', '_')
                    .replace('-', '_').replace('-', '_')
                    +".lsp"
                ;
                
                createDownloadLink("backupLink", Data, name, false, true);
                
                setTimeout(function(){
                    $("#backupLink").trigger("click");
                    self.obj.informer.$createBtn.attr("disabled", false);
                    self.printInformer();
                }, 150);
            }else{
                self.setBackup(Data);
            }//else
        }else self.printInformer();
    },

    this.dbRead = function(tx, Name){
        self.tables[Name].data=[];
        self.tables[Name].wait = true;
        
        BRW_dbSelect(
            {tx: tx, from: Name},
            function (data) {
                //console.log(data);
                if(data.rows) for(var key in data.rows) if(typeof data.rows[key] == "object"){// if(data.rows[key].id || data.rows[key].rowid){
                    var row = data.rows[key];
                    
                    if(Name == 'DIALS' && row.image){
                        var scheme = String(row.image).split('://').shift();
                        if(scheme.length > 5 || ['http','https','ftp'].indexOf(scheme) == -1) row.image = '';
                    }//if
                    self.tables[Name].data.push(row);
                }//if
                
                                
                if(self.tables[Name].data.length || self.tables[Name].allow_empty) self.tables[Name].success = true;
                else self.tables[Name].success = false;
                
                self.tables[Name].wait = false;
            },
            function (err) {
                console.log("BackUp ERR: ", Name, err);
                self.tables[Name].success = false;
                self.tables[Name].wait = false;
            }
        );
    },
    
    this.message = function(message){
        $.jGrowl(message, { "life" : 3000, position: "top-left"});
    },
    
    this.reloadAllPages = function(){
        localStorage.removeItem("restoring");
        
        setTimeout(function(){
            getFavoriteTabPages(reloadTabPages);
            getOptionsTabPages(reloadTabPages);
            getNetTabPages(reloadTabPages);
            
            setTimeout(function(){
                getSettingsTabPages(reloadTabPages);
            }, 250);
            
            setTimeout(function(){
                document.location.reload();
            }, 1500);
            
        }, 150);
    }
}//BackUp
    

