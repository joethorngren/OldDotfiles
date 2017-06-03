/**
 * Bg add new dial
 *
 * @param dial Object
 * @param collectDials Array
 * @param sendResponse Function
 */
function bgAddNewDial(dial, collectDials, sendResponse) {
    var dials = collectDials;

    BRW_dbTransaction(function (tx) {
        var addDate = dial.addDate || new Date().getTime();
        var id = dial.id || generateUniqueId(addDate);
        var url = addUrlHttp(dial.url);
        var title = dial.title;

        var groupId = dial.groupId;

        BRW_dbSelect({ //Param
                tx: tx,
                from: 'DIALS',
                maxOf: {
                    field: 'orderNum',
                    name: 'orderNum'
                },
                where: {
                    'groupId': groupId,
                    'is_deleted': 0
                }
            },
            function (results) { //Success
                var maxOrders = results.rows;
                var maxOrdersLength = maxOrders.length;

                var orderNum = maxOrdersLength && maxOrders[0].orderNum ? parseInt(maxOrders[0].orderNum) : 0;
                orderNum = parseInt(orderNum);
                var dial = {
                    "id": id,
                    "groupId": groupId,
                    "url": url,
                    "title": title,
                    "addDate": addDate,
                    "orderNum": ++orderNum,
                    "image": null,
                    "bgColor": null,
                    "textColor": null,
                    "thumbType": null,
                    "colorScheme": null
                };

                BRW_dbInsert({ //Param
                    tx: tx,
                    table: 'DIALS',
                    'set': {
                        id: dial.id,
                        groupId: dial.groupId,
                        url: dial.url,
                        title: dial.title,
                        addDate: dial.addDate,
                        orderNum: dial.orderNum,
                        image: dial.image,
                        bg_color: dial.bgColor,
                        text_color: dial.textColor,
                        thumb_type: dial.thumbType,
                        is_deleted: 0
                    }
                });

                sendDialResponse(dial.id, sendResponse);
                bgMoveDialsOrder(dials);
            }
        );
    });
}

/**
 * Bg add new dial
 *
 * @param dial Object
 * @param collectDials Array
 * @param sendResponse Function
 */
function bgAddFewDials(dials, sendResponse) {
    if(!dials || !dials.length) return;
    
    BRW_dbTransaction(function (tx) {
        var groupId = dials[0].groupId;

        BRW_dbSelect({ //Param
                tx: tx,
                from: 'DIALS',
                maxOf: {
                    field: 'orderNum',
                    name: 'orderNum'
                },
                where: {
                    'groupId': groupId,
                    'is_deleted': 0
                }
            },
            function (results) { //Success
                var maxOrders = results.rows;
                var maxOrdersLength = maxOrders.length;
                var orderNum = maxOrdersLength && maxOrders[0].orderNum ? parseInt(maxOrders[0].orderNum) : 0;
                orderNum = parseInt(orderNum);
                
                for(var key in dials) if(dials[key].id && dials[key].url){
                    var dial = dials[key];
                    
                    dial["orderNum"] = ++orderNum;
                    
                    
                    BRW_dbInsert({ //Param
                        tx: tx,
                        table: 'DIALS',
                        'set': {
                            id: dial.id,
                            groupId: dial.groupId,
                            url: dial.url,
                            title: dial.title,
                            addDate: dial.addDate,
                            orderNum: dial.orderNum,
                            image: (dial.image || ""),
                            bg_color: dial.bg.backgroundColor,
                            text_color: dial.bg.color,
                            thumb_type: (dial.thumbType || 2),
                            is_deleted: 0
                        }
                    });
                }
            
                if(sendResponse){
                    setTimeout(function(){
                        sendResponse();
                    }, 350);
                }
            }
        );
    });
}

/**
 * Bg edit new dial
 *
 * @param dial Object
 * @param collectDials Array
 * @param groupChanged Bool
 * @param sendResponse Bool
 */
function bgEditNewDial(dial, collectDials, groupChanged, sendResponse) {
    var dials = collectDials;
    BRW_dbTransaction(function (tx) {
        var id = dial.id;
        var url = addUrlHttp(dial.url);
        var title = dial.title;
        var groupId = dial.groupId;
        if (id && groupId && url && title) {

            //tx.executeSql('SELECT * FROM DIALS WHERE id = ? AND is_deleted = 0', [id], function (tx, results) {
            BRW_dbSelect({ //Param
                    tx: tx,
                    from: 'DIALS',
                    where: {
                        'id': id,
                        'is_deleted': 0
                    }
                },
                function (results) {
                    var dialsList = results.rows;

                    if (dialsList.length) {
                        var item, image, bgColor, textColor, thumbType;
                        item = dialsList[0];

                        if (item.url == url) {
                            if (groupChanged) {
                                BRW_dbSelect({ //Param
                                        tx: tx,
                                        from: 'DIALS',
                                        maxOf: {
                                            field: 'orderNum',
                                            name: 'orderNum'
                                        },
                                        where: {
                                            'groupId': groupId,
                                            'is_deleted': 0
                                        }
                                    },
                                    function (results) { //Success
                                        var maxOrders = results.rows;
                                        var maxOrdersLength = maxOrders.length;
                                        var orderNum = maxOrdersLength && maxOrders[0].orderNum ? parseInt(maxOrders[0].orderNum) : 0;
                                        orderNum = parseInt(orderNum);

                                        BRW_dbUpdate({ //Param
                                            tx: tx,
                                            table: 'DIALS',
                                            'set': {
                                                groupId: dial.groupId,
                                                url: dial.url,
                                                title: dial.title,
                                                orderNum: (++orderNum)
                                            },
                                            where: {
                                                key: 'id',
                                                val: dial.id
                                            }
                                        }, function () {
                                            sendDialResponse(dial.id, sendResponse);
                                            dials.splice(dials.indexOf(dial.id), 1);
                                            bgMoveDialsOrder(dials);
                                        });
                                    });


                            } else {
                                BRW_dbUpdate({ //Param
                                    tx: tx,
                                    table: 'DIALS',
                                    set: {
                                        groupId: dial.groupId,
                                        url: dial.url,
                                        title: dial.title
                                    },
                                    where: {
                                        key: 'id',
                                        val: dial.id
                                    }
                                }, function () {
                                    sendDialResponse(dial.id, sendResponse);
                                    bgMoveDialsOrder(dials);
                                });
                            }
                        } else {
                            image = null;
                            bgColor = null;
                            textColor = null;
                            thumbType = null;

                            if (groupChanged) {
                                //tx.executeSql('SELECT MAX(orderNum) AS orderNum FROM DIALS WHERE groupId = ? AND is_deleted = 0', [groupId], function (tx, results) {
                                BRW_dbSelect({ //Param
                                        tx: tx,
                                        from: 'DIALS',
                                        maxOf: {
                                            field: 'orderNum',
                                            name: 'orderNum'
                                        },
                                        where: {
                                            'groupId': groupId,
                                            'is_deleted': 0
                                        }
                                    },
                                    function (results) { //Success                          
                                        var maxOrders = results.rows;
                                        var maxOrdersLength = maxOrders.length;
                                        var orderNum = maxOrdersLength && maxOrders[0].orderNum ? parseInt(maxOrders[0].orderNum) : 0;
                                        orderNum = parseInt(orderNum);

                                        BRW_dbUpdate({ //Param
                                            tx: tx,
                                            table: 'DIALS',
                                            'set': {
                                                groupId: dial.groupId,
                                                url: dial.url,
                                                title: dial.title,
                                                orderNum: (++orderNum),
                                                image: image,
                                                bg_color: bgColor,
                                                text_color: textColor,
                                                thumb_type: thumbType
                                            },
                                            where: {
                                                key: 'id',
                                                val: dial.id
                                            }
                                        }, function () {
                                            sendDialResponse(dial.id, sendResponse);
                                            dials.splice(dials.indexOf(dial.id), 1);
                                            bgMoveDialsOrder(dials);
                                        });
                                    });
                            } else {
                                BRW_dbUpdate({ //Param
                                    tx: tx,
                                    table: 'DIALS',
                                    'set': {
                                        groupId: dial.groupId,
                                        url: dial.url,
                                        title: dial.title,
                                        image: image,
                                        bg_color: bgColor,
                                        text_color: textColor,
                                        thumb_type: thumbType
                                    },
                                    where: {
                                        key: 'id',
                                        val: dial.id
                                    }
                                }, function () {
                                    sendDialResponse(dial.id, sendResponse);
                                    bgMoveDialsOrder(dials);
                                });
                            }
                        }
                    }
                });
        }
    });
}

/**
 * Edit dial send response
 *
 * @param dialId
 * @param sendResponse Function
 */
function sendDialResponse(dialId, sendResponse) {
    BRW_dbTransaction(function (tx) {

        BRW_dbSelect({ //Param
                tx: tx,
                from: 'DIALS',
                where: {
                    'id': dialId,
                    'is_deleted': 0
                }
            },
            function (results) { //Success
                var dials = results.rows;

                if (dials.length) {
                    var item = dials[0];
                    var dial = {
                        "id": item.id,
                        "dialId": dialId,
                        "groupId": item.groupId,
                        "url": item.url,
                        "title": item.title,
                        "addDate": item.addDate,
                        "orderNum": item.orderNum,
                        "image": item.image,
                        "bgColor": item.bg_color,
                        "textColor": item.text_color,
                        "thumbType": item.thumb_type,
                        "colorScheme": {
                            "backgroundColor": item.bg_color,
                            "color": item.text_color
                        }
                    };
                    sendResponse({
                        "dial": dial
                    });
                }
            }
        );
    });
}

/**
 * Delete dial by id
 *
 * @param dialId String
 * @param collectDials Array
 * @param sendResponse Function
 */
function bgDeleteDial(dialId, collectDials, sendResponse) {
    if (dialId) {
        var dials = collectDials;

        BRW_dbTransaction(function (tx) {
            BRW_dbDelete({ //Param
                tx: tx,
                table: 'DIALS',
                where: {
                    key: 'is_deleted',
                    val: 1
                }
            });

            BRW_dbUpdate({ //Param
                tx: tx,
                table: 'DIALS',
                'set': {
                    is_deleted: 1
                },
                where: {
                    key: 'id',
                    val: String(dialId)
                }
            });

            bgMoveDialsOrder(dials);
            sendResponse({
                "dialId": dialId
            });
        });
    }
}

/**
 * Restore dial by id
 *
 * @param dialId String
 * @param sendResponse Function
 */
function bgRestoreRemovedDialById(dialId, sendResponse) {
    if (dialId) {
        BRW_dbTransaction(function (tx) {
            BRW_dbUpdate({ //Param
                tx: tx,
                table: 'DIALS',
                'set': {
                    is_deleted: 0
                },
                where: {
                    key: 'id',
                    val: dialId
                }

            });

            /*
            tx.executeSql('UPDATE DIALS SET is_deleted = 0 WHERE id = ?', [dialId]);
            */
        });
        sendResponse({
            "dialId": dialId
        });
    }
}

/**
 * Move dials order
 *
 * @param collectDials Array
 */
function bgMoveDialsOrder(collectDials) {
    if (collectDials.length) {
        var dials = collectDials;
        BRW_dbTransaction(function (tx) {
            for (var i in dials) {
                if (dials.hasOwnProperty(i))
                    BRW_dbUpdate({ //Param
                        tx: tx,
                        table: 'DIALS',
                        'set': {
                            orderNum: parseInt(i)
                        },
                        where: {
                            key: 'id',
                            val: dials[i]
                        }
                    });
            }
        });
    }
}

/**
 * Find group dials
 *
 * @param groups Array
 * @param sendResponse Function
 */
function bgFindGroupDials(groups, sendResponse) {
    var groupsLength = groups.length;
    var group = groupsLength ? groups[0] : null;
    if (group)
        group.dials = [];
    if (group && group.id == GROUP_POPULAR_ID) {
        sendResponse({
            "group": group
        });
    } else {
        getGroupDials(group, sendResponse);
    }
}

/**
 * Find group dials
 *
 * @param sendResponse Function
 */
function bgFindGroupDialsError(sendResponse) {
    //console.log("Get default group error");
    sendResponse({
        "group": null
    });
}

/**
 * Get group dials
 *
 * @param group Object
 * @param sendResponse Function
 */
function getGroupDials(group, sendResponse) {
    BRW_dbTransaction(function (tx) {
        if (group) {
            BRW_dbSelect({ //Param
                    tx: tx,
                    from: 'DIALS',
                    where: {
                        'groupId': group.id,
                        'is_deleted': 0
                    },
                    order: 'orderNum'
                },
                function (results) { //Success
                    var dials = results.rows;

                    for (var i in dials) {
                        if (dials.hasOwnProperty(i)) {
                            group.dials.push(dials[i]);
                        }
                    }
                    
                    //console.log('group', group);
                    
                    sendResponse({
                        "group": group,
                        //"allDials": group.dials,
                    });
                },
                function () { //Error
                    //console.log("Get group " + group.id + " dials error");
                    sendResponse({
                        "group": group
                    });
                }
            );
        } else
            sendResponse({
                "group": null
            });

    });
}

function addDialsToDefaultGroup(Dials, callBack, Notif){
    //console.log(Dials);
    bgGetDefaultGroupData(true, function(defaultGroup){
        if(defaultGroup.group){
            var collectDials=[], addDials=[];
            var upDate = new Date().getTime();

            for(var key in Dials){
                var Dial = Dials[key], createPrm = true;

                var newDial = {
                    "title" : Dial.title, 
                    "url" : addUrlHttp(Dial.url), 
                    "id" : generateUniqueId(upDate), 
                    "groupId" : defaultGroup.group.id, 
                    "addDate": upDate,
                    "bg": getTileRandomColorScheme()
                };

                if(defaultGroup.group.dials && defaultGroup.group.dials.length){
                    for(var key in defaultGroup.group.dials) if(defaultGroup.group.dials[key].id){
                        collectDials.push(defaultGroup.group.dials[key].id);

                        if(defaultGroup.group.dials[key].url == Dial.url) createPrm--;
                    }//for
                }//if

                if(createPrm) addDials.push(newDial);
            }//for

            if(addDials.length){
                bgAddFewDials(addDials, function(){
                    BRW_sendMessage({"command": "sidebarDialsUpdate"});
                    
                    if(callBack) callBack();
                });
            }//if
            
            if(Notif){
                var message = translate("dial_saved_to_folder").replace("[name]", '"' + (defaultGroup.group.title || translate("page_dials_default_group_title")) + '"' );
                addonNotification(message);
            }//if
        }//if
    });
}//addDialsToDefaultGroup

function addDialsToNewGroup(Group, Dials, callBack, Notif){
    if(!Dials || !Dials.length){
        //BRW_sendMessage({"command": "cantAddNewGroupWithNoDials"});
        addonNotification(translate("cant_add_new_group_with_no_dials"));
        return false;
    }//if
    
    var date = new Date();
    var addDate = date;
    var upDate = date.getTime();
    
    if(!Group) Group = {};
    
    if(!Group.addDate) Group.addDate = upDate;
    else addDate = new Date(parseInt(Group.addDate));
    
    if(!Group.id) Group.id = generateUniqueId(addDate.getTime());
    if(!Group.title) Group.title = String(addDate.toLocaleDateString());
    if(!Group.isActive) Group.isActive = 0;
    
    BRW_bgAddNewGroup(Group, [], function(insertGroup){
        for(var key in Dials){
            upDate++;
            
            Dials[key] = {
                "title" : Dials[key].title, 
                "url" : addUrlHttp(Dials[key].url), 
                "id" : generateUniqueId(upDate), 
                "groupId" : insertGroup.group.id, 
                "addDate": upDate,
                "bg": getTileRandomColorScheme()
            };
        }//for
        
        bgAddFewDials(Dials, function(){
            BRW_sendMessage({"command": "sidebarDialsUpdate"});
            
            if(Notif){
                var message = translate("dial_saved_to_folder").replace("[name]", '"' + insertGroup.group.title + '"' );
                addonNotification(message);
            }//if
        });
    }, true);
}//addDialsToNewGroup


var titleQueue = [];
function addTitleQueue(url, tile) {}

function urlToTitle(url){
    var title = '';
    
    var url = String(url).toLowerCase().split('://');
    
    if(url.length > 1){
        var scheme = url.shift();
    }else{
        var scheme = 'site';
    }
    
    url = url.join('');
    
    if(['http','https','ftp','site'].indexOf(scheme) != -1){
        title = url.split('/').shift().split('.').shift();
    }else{//file 
        title = url.split('/').pop().split('.').shift();
    }
    
    return title;
}

function getTitle(url, callback) {
    var title = false;
    var url = String(url);
    
    //callback(title || url); return;
    
    if(url.indexOf('://') == -1) url = "http://"+url;
    
    var scheme = url.split('://').shift().toLowerCase();
    
    if(['http','https','ftp'].indexOf(scheme) != -1){
        try{
            setTimeout(()=>{
                BRW_ajax(
                    url,
                    (success)=>{//success
                        var titleMatch = String(success).match(/<(title|h1|h2|h3)>([^<]*)<\/(title|h1|h2|h3)>/i);
                        
                        if(typeof titleMatch == "object" && titleMatch[2]) title = titleMatch[2];
                        
                        /*
                        //console.debug(titleMatch);
                        //console.debug(success);
                        //console.debug(title);
                        */
                        
                        /*
                        var $html = $.parseHTML(success);//, document, false);

                        $.each( $html, function( i, el ) {
                            var tag = String(el.nodeName).toLowerCase();

                            if(tag == "title") {
                                title = el.text.trim() || title;
                            }
                            else 
                            if(!title && (tag == "h1" || tag == "h2")){
                                title = el.text.trim();
                            }
                        });
                        */
                        
                        callback(title);
                    },
                    (error)=>{//error
                        console.info("error", error);
                        callback(title);
                    },
                    {text: true}
                );
            }, 100);
        }catch(ex){
            console.info("catch", ex);
            callback(title || url);
        }
    }else{
        callback(title || url);
    }
}

function getAutoTitle(dial, callback){
    getTitle(dial.url, function(title){
        if(!title) title = urlToTitle(dial.url);
        
        dial.title = title;
        
        BRW_dbTransaction(function (tx) {
            BRW_dbUpdate({ //Param
                tx: tx,
                table: 'DIALS',
                'set': {
                    title: dial.title
                },
                where: {
                    key: 'id',
                    val: dial.id
                }
            }, function (success) {
                if(callback) callback(dial);
            }, function (err) {
                if(callback) callback(dial);
                console.warn(err);
            });
        });
        
        BRW_sendMessage({"command": "dialTitleUpdate", dial:dial});
    });
}























