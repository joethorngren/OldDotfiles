/**
 * Bg add new group
 *
 * @param group Object
 * @param collectGroups Array
 * @param sendResponse Function
 */

/*Moved to browser choiser*/
function bgAddNewGroup(group, collectGroups, sendResponse, topTop) {
     BRW_bgAddNewGroup(group, collectGroups, sendResponse, topTop);
}

/**
 * Bg edit new group
 *
 * @param group Object
 * @param collectGroups Array
 * @param sendResponse Bool
 */
function bgEditNewGroup(group, collectGroups, sendResponse) {
    var groups = collectGroups;
    
    BRW_dbTransaction(function(tx){
            var id = group.id;
            var title = group.title;
            if(id && title) { 
                BRW_dbUpdate(
                    { //Param
                        tx : tx,
                        table: 'GROUPS',
                        'set': {
                            title: group.title
                        },
                        where: {
                            key: 'id',
                            val: group.id
                        }

                    },
                    function (results) {//Success
                        sendResponse({"group" : group});
                    }
                );
                
                bgMoveGroupsOrder(groups);
            }
        });
}

/**
 * Delete group by id
 *
 * @param groupId String
 * @param collectGroups Array
 */
function bgDeleteGroup(groupId, collectGroups) {
    if(groupId) {
        var groups = collectGroups;
        
        BRW_dbTransaction(function(tx) {
            BRW_dbDelete(
                {//Param
                    tx : tx,
                    table   :  'GROUPS',
                    where   : {
                        key : 'id',
                        val : groupId
                    }
                },
                function(results){//Success
                    
                }       
            );
        });
    }
}

/**
 * Get group dials count
 *
 * @param groupId String
 * @param sendResponse Function
 */
function bgGetGroupDialsCount(groupId, sendResponse) {
    if(groupId) {
        BRW_dbTransaction(function(tx) {
                BRW_dbSelect(
                    {//Param
                        tx : tx,
                        from    :  'DIALS',
                        countAs : 'dialsCount',
                        where   : {
                            'groupId' : groupId
                        }
                    },
                    function(results){//Success
                        var countItems = results.rows;
                        var countItemsLength = countItems.length;
                        var dialsCount = countItemsLength && countItems[0].dialsCount ? parseInt(countItems[0].dialsCount) : 0;
                        sendResponse({"dialsCount" : dialsCount});
                    }       
                );
            });
    }
}

/**
 * Move groups order
 *
 * @param collectGroups Array
 */
function bgMoveGroupsOrder(collectGroups, start) {
    if(!start) start = 0;
    
    if(collectGroups.length) {
        var groups = collectGroups;
        
        BRW_dbTransaction(function (tx) {
                for(var i in groups) {
                    if(groups.hasOwnProperty(i)) {
                        i = parseInt(i);
                        
                        BRW_dbUpdate(
                            { //Param
                                tx : tx,
                                table: 'GROUPS',
                                'set': {
                                    orderNum: (i+start)
                                },
                                where: {
                                    key: 'id',
                                    val: groups[i]
                                }

                            }
                        );
                    }
                }
            });
    }
}

/**
 * Get default group
 *
 * @param withDials Bool
 * @param sendResponse Object
 */
function bgGetDefaultGroupData(withDials, sendResponse) {
    BRW_dbTransaction(function (tx) {
        BRW_dbSelect(
            {//Param
                tx : tx,
                from    :  'GROUPS',
                where   : {
                    'type' : GROUP_TYPE_DEFAULT
                }, 
                limit   : 1
            },
            function(results){//Success
                if(withDials)
                    bgFindGroupDials(results.rows, sendResponse);
                else
                    sendResponse({"group": results.rows.length ? results.rows[0] : null});
            },        
            function(){//Error
                bgFindGroupDialsError(sendResponse);
            }        
        );
    });
}
/**
 * Get default group
 *
 * @param groupId Number
 * @param withDials Bool
 * @param sendResponse Object
 */
function bgGetGroupData(groupId, withDials, sendResponse) {
    var findGroup = groupId;

    if(findGroup == GROUP_POPULAR_ID) {
        sendResponse({
            "group": {
                "id" : GROUP_POPULAR_ID,
                "type" : GROUP_TYPE_POPULAR,
                "title" : GROUP_POPULAR_TITLE,
                "dials" : []
            }
        });
    } else {
        BRW_dbTransaction(function (tx) {
            BRW_dbSelect(
                {//Param
                    tx : tx,
                    from    :  'GROUPS',
                    where   : {
                        'id' : findGroup
                    }, 
                    limit   : 1
                },
                function(results){//Success
                    if(withDials)
                        bgFindGroupDials(results.rows, sendResponse);
                    else
                        sendResponse({"group": results.rows.length ? results.rows[0] : null});
                },        
                function(){//Error
                    bgFindGroupDialsError(sendResponse);
                }        
            );
        });
    }
}

/**
 * Get active group
 *
 * @param groupId Number
 * @param withDials Bool
 * @param sendResponse Function
 */
function bgGetActiveGroup(groupId, withDials, sendResponse) {
    if(groupId)
        bgGetGroupData(groupId, withDials, sendResponse);
    else
        bgGetDefaultGroupData(withDials, sendResponse);
}

/**
 * Get available groups
 *
 * @param groupId Number
 * @param sendResponse Object
 * @param sortType String
 */
function bgGetAvailableGroups(groupId, sendResponse, sortType) {
    var activeGroupId = groupId;
    
    BRW_dbTransaction(function(tx) {
        BRW_dbSelect(
            {//Param
                tx : tx,
                from    :  'GROUPS',
                order   :  'orderNum'
            },
            function(results){//Success
                var groups = [];
                if(results.rows.length) {
                    var skipActiveCheck = false;
                    for(var i in results.rows) {
                        if(results.rows.hasOwnProperty(i)) {
                            var group = results.rows[i];
                            group.isActive = 0;
                            if(!skipActiveCheck) {
                                if (activeGroupId) {
                                    if (group.id == activeGroupId)
                                        group.isActive = 1;
                                } else {
                                    group.isActive = 1;
                                    skipActiveCheck = true;
                                }
                            }
                            if(group.isActive && sortType == GROUP_SORT_ADD_NEW_DIAL)
                                groups.unshift(group);
                            else
                                groups.push(group);
                        }
                    }
                }
                
                try{
                    sendResponse({"groups" : groups});
                }catch(ex){
                    if(typeof DEVMSG != "undefined" && DEVMSG) console.warn(ex);
                }
            },        
            function(){//Error
                    //console.log("Get available groups error");
                    sendResponse({"groups" : []});
            }        
        );
    });
}

/**
 * Change active group
 *
 * @param groupId Number
 * @param sendResponse Object
 */
function bgChangeActiveGroup(groupId, sendResponse) {
    var findGroupId = groupId;
    if(findGroupId) {
        setActiveGroup(groupId, function() {
            bgGetGroupData(groupId, true, sendResponse);
        });
    }
}

/**
 * Switch active group to default
 *
 * @param groupId Number
 * @param tabId Number
 */
function switchActiveGroupToDefault(groupId, tabId) {
    if(groupId == GROUP_POPULAR_ID) {
        BRW_dbTransaction(function(tx) {
                BRW_dbSelect(
                    {//Param
                        tx : tx,
                        from    :  'GROUPS',
                        where   : {
                            'type' : GROUP_TYPE_DEFAULT
                        }
                    },
                    function(results){//Success
                        if(results.rows.length) {
                            for(var i in results.rows) {
                                if(results.rows.hasOwnProperty(i)) {
                                    var group = results.rows[i];
                                    
                                    setActiveGroup(group.id);
                                    //setActiveGroup(10000000000000);//Task #645
                                    
                                    getNetTabPages(reloadTabPages);
                                    getSettingsTabPages(reloadTabPages, {skipTab: tabId});
                                    break;
                                }
                            }
                        } else {
                            getNetTabPages(reloadTabPages);
                            getSettingsTabPages(reloadTabPages, {skipTab: tabId});
                        }
                    },
                    function() {
                        //console.log("Switch group to default error");
                    }
                );
        });
    } else {
        getNetTabPages(reloadTabPages);
        getSettingsTabPages(reloadTabPages, {skipTab: tabId});
    }
}