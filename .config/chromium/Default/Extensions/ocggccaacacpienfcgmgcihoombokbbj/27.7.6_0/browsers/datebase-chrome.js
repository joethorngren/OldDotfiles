
/*From pages/common.js*/
function BRW_getDb(){
    if(!appDB) {
        appDB = openDatabase('speeddial', '1.0', 'Parallax Speed Dial Background', 100 * 1024 * 1024);
        appDB.transaction(function (tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS IMAGES (id unique, url, image, bg_color, text_color, thumb_type)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS TODO_ITEMS (id unique, title, done, item_date, item_order)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS SETTINGS (name, value)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS HOST_BLACKLIST (id unique, host)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS GROUPS (id unique, type, title, addDate, orderNum)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS DIALS (id unique, groupId, url, title, addDate, orderNum, image, bg_color, text_color, thumb_type, is_deleted)');
            createColumnsIfNotExist(tx, "IMAGES", ["bg_color", "text_color", "thumb_type"]);
            installDefaultGroupsIfNotExist();

            //tx.executeSql('DELETE FROM IMAGES');
            //tx.executeSql('DELETE FROM TODO_ITEMS');
            //tx.executeSql('DELETE FROM SETTINGS');
            //tx.executeSql('DELETE FROM HOST_BLACKLIST');
            //tx.executeSql('DELETE FROM GROUPS');
            //tx.executeSql('DELETE FROM DIALS');
        });
        return appDB;
    }else{
        return appDB;
    }//else
}//BRW_getDb
    
/*From /pages/common.js*/       
function BRW_setSettingsValue(key, val, callback){
    getDb().transaction(function (tx) {
        tx.executeSql('SELECT * FROM SETTINGS WHERE name = ?', [key], function (tx, results) {
            if(!results.rows.length)
                tx.executeSql('INSERT INTO SETTINGS (name, value) VALUES (?,?)', [key, val]);
            else
                tx.executeSql('UPDATE SETTINGS SET value = ? WHERE name = ?', [val, key]);

            if(callback)
                callback(val);
        });
    });
}
            

/*From /pages/backend/common.js*/  
function BRW_setDefaultGroup(callback) {
    if(localStorage.getItem('defaultGroupsInstalled')) return false;
    else localStorage.setItem('defaultGroupsInstalled', true);
    
    var addDate = new Date().getTime();
    var id = generateUniqueId(addDate);
    getDb().transaction(function(tx) {
        tx.executeSql('SELECT * FROM GROUPS WHERE type = ?', [GROUP_TYPE_POPULAR], function (tx, results) {
            if(!results.rows.length) {
                tx.executeSql('INSERT INTO GROUPS (id, type, title, addDate, orderNum) VALUES (?,?,?,?,?)', [
                    GROUP_POPULAR_ID.toString(),
                    GROUP_TYPE_POPULAR,
                    GROUP_POPULAR_TITLE,
                    addDate,
                    0
                ]);
            }
            tx.executeSql('SELECT * FROM GROUPS WHERE type = ?', [GROUP_TYPE_DEFAULT], function (tx, results) {
                if(!results.rows.length) {
                    var group = {
                        "id" :  id,
                        "type" : GROUP_TYPE_DEFAULT,
                        "title" : GROUP_DEFAULT_TITLE,
                        "addDate" : addDate,
                        "orderNum" : 1,
                        "dials" : []
                    };

                    tx.executeSql('INSERT INTO GROUPS (id, type, title, addDate, orderNum) VALUES (?,?,?,?,?)', [
                        group.id,
                        group.type,
                        group.title,
                        group.addDate,
                        group.orderNum
                    ], function() {
                        
                        //setActiveGroup(group.id, function() { 
                        setActiveGroup(10000000000000, function() {//Task #645
                            $.ajax({
                                type: "GET",
                                url: "http://everhelper.me/spec/country.php",
                                success : function(data) {
                                    var country = "";
                                    var searchBy = COUNTRY_SEARCH_BY_DEFAULT;
                                    if(data && data.length == 2)
                                        country = data.toUpperCase();
                                    if(!checkCountryIsActual(country)) {
                                        var language = chrome.i18n.getUILanguage();
                                        if(language.length > 1) {
                                            country = language.substr(0, 2).toUpperCase();
                                            if(!checkCountryIsActual(country)) {
                                                country = defaultUserCountry;
                                            } else {
                                                searchBy = COUNTRY_SEARCH_BY_LANGUAGE;
                                            }
                                        }
                                    } else {
                                        searchBy = COUNTRY_SEARCH_BY_SERVICE;
                                    }
                                    callback(group, country, searchBy);
                                },
                                error : function() {
                                    callback(group, defaultUserCountry, COUNTRY_SEARCH_BY_DEFAULT);
                                }
                            });
                        });
                    });
                }
            });
        });
    });
}//BRW_setDefaultGroup

/*From /pages/backend/common.js*/  
function BRW_setDefaultDials(group, country, searchBy) {
    var defaultDials = getDefaultDialsList(country, searchBy);

    getDb().transaction(function(tx) {
        var defaultDialsLength = defaultDials.length;
        for(var i = 0; i < defaultDialsLength; i++) {
            var defaultDial = defaultDials[i];
            var id = group.addDate.toString() + (i + 1).toString();
            var dial = {
                "id": id,
                "groupId": group.id,
                "url": addUrlHttp(defaultDial.url),
                "title": defaultDial.title,
                "addDate": group.addDate,
                "orderNum": parseInt(i),
                "image" : defaultDial.image,
                "thumbType" : showDialGalleryThumb
            };
            tx.executeSql('INSERT INTO DIALS (id, groupId, url, title, addDate, orderNum, image, bg_color, text_color, thumb_type, is_deleted) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [
                dial.id,
                dial.groupId,
                dial.url,
                dial.title,
                dial.addDate,
                dial.orderNum,
                dial.image,
                null,
                null,
                dial.thumbType,
                0
            ]);
            group.dials.push(dial);
        }
    });
}//BRW_setDefaultDials

/*From /pages/backend/common.js*/ 
function BRW_getSettingsValue(key, defaultValue, callback) {
    
    getDb().transaction(function (tx) {
        tx.executeSql('SELECT * FROM SETTINGS WHERE name = ?', [key], function (tx, results) {
            var val;
            var itemsLength = results.rows.length;

            if(itemsLength) {
                for(var i = 0; i < itemsLength; i++)
                    val = results.rows[i].value;
            } else {
                if(typeof (defaultValue) != "undefined") {
                    if(defaultValue !== false) {
                        val = defaultValue;
                        tx.executeSql('INSERT INTO SETTINGS (name, value) VALUES (?,?)', [key, val]);
                    }
                }
            }

            if(callback)
                callback(val);
        });
    });
}//BRW_getSettingsValue

/*From /pages/backend/groups.js*/ 
function BRW_bgAddNewGroup(group, collectGroups, sendResponse, toTop, fake) {
    var groups = (collectGroups && !toTop ? collectGroups : []);
    
    getDb().transaction(function(tx) {
            var addDate = group.addDate || new Date().getTime();
            var id = group.id || generateUniqueId(addDate);
            var title = group.title;
            //tx.executeSql('SELECT MAX(orderNum) AS orderNum FROM GROUPS', [], function (tx, results) {
            tx.executeSql('SELECT * FROM GROUPS ORDER BY orderNum', [], function (tx, results) {
                var orderNum = 0, nameStep = 0;
                //console.log(results);
                
                if(results && results.rows){
                    for(var key in results.rows){
                        var val = results.rows[key];
                        
                        if(val && val.id){
                            orderNum = Math.max(orderNum, parseInt(val.orderNum));
                            
                            var gTitle = String(val.title).trim();
                            if(gTitle == title && nameStep == 0) nameStep = 1;
                            else if(gTitle.length > title.length && gTitle.indexOf(title) === 0){
                                var inc = String(gTitle.split(title)[1]).replace('-', '').trim();
                                
                                if(inc && Boolean(parseInt(inc)) && String(parseInt(inc)) == inc && parseInt(inc) >= nameStep){
                                    nameStep = 1 + parseInt(inc);
                                }//if
                            }//else if
                            
                            if(toTop && groups.indexOf(val.id) == -1 && val.type == 1) groups.push(val.id);
                        }//if
                    }//for
                }//if
                if(nameStep != 0) title += " - "+nameStep;
                
                /*
                var maxOrders = results.rows;
                var maxOrdersLength = maxOrders.length;
                var orderNum = maxOrdersLength && maxOrders[0].orderNum ? parseInt(maxOrders[0].orderNum) : 0;
                    orderNum = parseInt(orderNum);
                */
                
                if(toTop) orderNum = 0;

                var group = {
                    "id": id,
                    "type": GROUP_TYPE_USER,
                    "title": title,
                    "addDate": addDate,
                    "orderNum" : ++orderNum
                };

                if(fake){
                    sendResponse({"group" : group});
                }else{
                    tx.executeSql('INSERT INTO GROUPS (id, type, title, addDate, orderNum) VALUES (?,?,?,?,?)', [
                        group.id,
                        group.type,
                        group.title,
                        group.addDate,
                        group.orderNum
                    ], function() {
                        setActiveGroup(group.id);
                        sendResponse({"group" : group});

                    });

                    bgMoveGroupsOrder(groups, (toTop ? 2 : 0));
                }//else
            });
        });
}//BRW_bgAddNewGroup

function BRW_dbTransaction(callback){
   getDb().transaction(function(tx){
       callback.call(true, tx);
   });
}//BRW_dbTransaction

function BRW_dbSelect(obj, successFunction, errorFunction){
    var param = obj, whereArr = [], sql='SELECT';
    
    if(param.maxOf){//Max of item
        sql += ' MAX('+param.maxOf.field+') AS '+param.maxOf.name;
    }else if(param.countAs){//Count of items as key
        sql += ' COUNT(id) AS '+param.countAs;
    }else sql += ' *';

    sql += ' FROM '+param.from;
    
    if(param.where || param.whereIn){
        sql += ' WHERE';
        
        if(param.where){
            for(var w in param.where){
                if(whereArr.length) sql += ' AND';
                whereArr[whereArr.length] = param.where[w];
                sql += ' '+w+' = ?';
            }//for
        }//if
        
        if(param.whereIn){
            sql += ' '+param.whereIn.key + ' IN('+createParams(param.whereIn.arr)+')';
            whereArr = param.whereIn.arr;
        }//if
    }//if
        
    if(param.order) sql += ' ORDER BY '+param.order+' ASC';
    if(param.limit) sql += ' LIMIT '+param.limit;
          
    //console.log(obj, sql);

    param.tx.executeSql(sql, whereArr, function (tx, results) {
        if(successFunction) {
            try{
                successFunction.call(true, results);
            }catch(ex){
                console.warn(ex);
            }
        }
    }, function() {
        if(errorFunction) 
            errorFunction.call();
    });
}//function BRW_dbSelect

function BRW_dbUpdate(obj, successFunction, errorFunction){
    var param = obj, arr=[];
    var sql = 'UPDATE '+param.table+' SET';
    
    for(var i in param.set){
        if(arr.length) sql += ' ,';
        sql += ' ' + i + '=?';
        arr[arr.length] = param.set[i];
    }//for
    
    if(param.where){
        sql += ' WHERE '+param.where.key+'=?';
        arr[arr.length] = param.where.val;
    }//if
    
    //console.log(sql, arr);
    param.tx.executeSql(sql, arr, 
        function(){//success
            if(successFunction) 
                successFunction.call();
        }, function(obj, error){//error
            console.info(sql, arr, error);
            if(errorFunction) 
                errorFunction.call(obj, error);
        }
    );
    
    changeUpTimes(obj, "update");
}//function BRW_dbUpdate

function BRW_dbInsert(obj, successFunction, errorFunction){
    var param = obj;
    
    var arr = []; for(var i in param.set) arr[arr.length] = param.set[i];
    var keys = Object.keys(param.set);
    
    var sql = 'INSERT INTO '+param.table+' (';
    sql += keys.join(', ');
    sql += ') VALUES (';
    keys.fill('?')
    sql += keys.join(', ');
    sql += ')';
    
    //console.log(obj, sql, arr);
    
    param.tx.executeSql(sql, arr, 
        function(result){//success
            if(successFunction) 
                successFunction.call(false, result);
        }, function(obj, error){//error
            if(errorFunction) 
                errorFunction.call(false, obj, error);
        }
    );
    
    changeUpTimes(obj, "insert");
}//function BRW_dbInsert

function BRW_dbDelete(obj, successFunction, errorFunction){
    var param = obj, arr=[];
    
    var sql = 'DELETE FROM '+param.table;
    /*
    //Delete ToDo and write deleted uuid
    if(param.table == "TODO_ITEMS"){
        console.trace();
    }
    */
    
    if(param.where){
        sql += ' WHERE '+param.where.key+'=?';
        arr[0] = param.where.val;
    }//if
    
    //console.log(obj, sql, arr);
    
    param.tx.executeSql(sql, arr);
    changeUpTimes(obj, "delete");
}//function BRW_dbDelete

var logPauseTimeout = false;
function changeUpTimes(obj, act){
    
    if(localStorage.getItem("sync-account")){
        var param = obj;
        
        if(param.table == "DIALS" && param['set']){
            if(
                typeof thumbUpdatePassive == "object" 
                && 
                param.where && param.where.key == 'id' && param['set'].image
                && 
                thumbUpdatePassive.indexOf(param.where.val) != -1
            ){  
                thumbUpdatePassive.splice(thumbUpdatePassive.indexOf(param.where.val), 1);
                
                setTimeout(function(){
                    var index = thumbUpdatePassive.indexOf(param.where.val);
                    if(index != -1) thumbUpdatePassive.splice(index, 1);
                }, 2500);
                
                //console.debug("Break", param);
                return;
            }
            
            if(!param['set'].orderNum && param['set'].orderNum !== 0){
                logPauseTimeout = true;
                setTimeout(function(){
                    logPauseTimeout = false;
                }, 1000);
            }else{
                if(logPauseTimeout) return;
            }
        }
        
        var Now = Date.now();
        var UPD = false;

        if(
            param.table == "GROUPS" && 
            (!param.passive || param.passive.indexOf('groups') == -1)
        ){
            UPD = "groups";
        }//if

        if(
            param.table == "DIALS" && 
            (!param.passive || param.passive.indexOf('dials') == -1)
        ){
            UPD = "dials";
        }//if

        if(
            param.table == "TODO_ITEMS" && 
            (!param.passive || param.passive.indexOf('todo') == -1)
        ){
            UPD = "todo";
        }//if


        if(UPD){
            //console.debug("changeUpTimes", param);
            
            localStorage.setItem('sync-need-push', 1);

            if(param && param.where && param.where.key == "id"){
                var list = JSON.parse(localStorage.getItem('sync-'+UPD+'-changed') || "{}");           

                if(act == "update" && obj.set && obj.set.is_deleted == 1){
                    var action = "delete";
                }else if(act == "update" && obj.set && (obj.set.item_order && !obj.set.title)){
                    var action = "sorted";
                }else var action = act;

                if(!list[param.where.val]) list[param.where.val] = {};
                list[param.where.val][action] = 1;
                list[param.where.val]["time"] = Now;

                localStorage.setItem('sync-'+UPD+'-changed', JSON.stringify(list));
                localStorage.setItem('sync-need-push', 1);
            }//if

            //console.log(act, obj, action);
        }//if
        return true;
    }else{
        return false;
    }
}//function


function BRW_dbUnsafeDeleteAll(name, successFunction, errorFunction, key) {
    if (key != crc32(name)) {
        if (errorFunction) errorFunction();
        return;
    } else {
        BRW_dbTransaction(function (tx) {
            BRW_dbDelete({
                tx: tx,
                table: name
            })
        });
    }//else
}//function




















