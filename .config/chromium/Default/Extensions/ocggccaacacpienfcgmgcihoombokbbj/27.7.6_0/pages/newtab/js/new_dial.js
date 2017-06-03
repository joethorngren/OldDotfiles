/**
 * Init add new dial popup
 */
function initAddNewDialPopup() { 
    var $modal = $('#add-new-dial-dialog');
    $modal.on('shown.bs.modal', function () {
        //$('#newDialUrl').focus();
        
        var newDialUrlVal = $('#newDialUrl').val();
        $('#newDialUrl').val('').focus().val(newDialUrlVal);//Move cursor to end of the line
        
        setTimeout(function(){
            //Preview.clearHostData();
        
            if(typeof Preview == "object"){
                Preview.checkInput('soft');
            }
        }, 100);
        
    });
    $modal.on('hidden.bs.modal', function () {
        var $url = $("#newDialUrl");
        var $title = $("#newDialTitle");
        var $group = $("#newDialGroup");
        var $groupName = $("#newDialGroupName");
        clearNewDialStatus($url);
        clearNewDialStatus($title);
        clearNewDialStatus($group);
        clearNewDialStatus($groupName);

        $url.val("");
        $title.val("");
        $groupName.val("");

        var $newGroupBlock = $("#add-new-dial-new-group-block");
        $newGroupBlock.hide(0);
        
        setTimeout(function(){
            if(typeof Preview == "object") Preview.reset("hard");
        }, 550);
    });
    
    $("#add-new-dial-form").on("submit", addNewDial);
}

/**
 * Display new dial groups
 */
function getNewDialGroups() { 
    
    BRW_sendMessage({command: "getAddNewDialGroups"}, function(data) {
        if(data.groups)
            initNewDialDialogGroupSelector(data.groups);
    });
}

/**
 * Display new dial groups
 */
function getSidebarGroups() { 
    BRW_sendMessage({command: "getAvailableGroups"}, function(data) {
        if(data.groups){
            initSidebarGroups(data.groups);
        }
    });
}

/**
 * Refresh new dial groups
 */
function refreshSidebarGroups() { 
    if(getDisplaySpeedDialPanel()){
        getSidebarGroups();

        if(getVisibleSpeedDialPanel()){
            setTimeout(function(){
                $(".sidebar-group-item.selected").trigger("click");
            }, 180);
        }//if
    }//if
}

/**
 * Init new dial dialog group selector
 *
 * @param groups Array
 */
function initNewDialDialogGroupSelector(groups) { 
    var $container = $("#newDialGroup").html("");
    var groupLength = groups.length;
    groups.push({
        'id' : 0,
        'type' : GROUP_TYPE_USER,
        'title' : translate("page_dials_new_group_title")
    });
    for(var i in groups) {
        if(groups.hasOwnProperty(i)) {
            var group = groups[i];
            if(group.type != GROUP_TYPE_POPULAR) {
                var $option = $("<option></option>");
                $option.val(group.id);
                if(group.type == GROUP_TYPE_DEFAULT) {
                    if(group.title)
                        $option.text(group.title);
                    else
                        $option.text(translate("page_dials_default_group_title"));
                } else
                    $option.text(group.title);
                if(i == groupLength)
                    $option.addClass("page-new-dial-add-new-group-text");
                $container.append($option);
            }
        }
    }
    $container.off("change", newDialDialogGroupSelectorChangeHandler).on("change", newDialDialogGroupSelectorChangeHandler);
}

/**
 * Init new dial dialog new group name visible state
 *
 * @param $container jQuery element
 */
function initNewDialDialogNewGroupNameVisibleState($container) { 
    var val = $container.val();
    var $newGroupBlock = $("#add-new-dial-new-group-block");
    if(val == 0)
        $newGroupBlock.slideDown();
    else
        $newGroupBlock.slideUp();
}

/**
 * New dial dialog group selector change handler
 *
 * @param e Event
 */
function newDialDialogGroupSelectorChangeHandler(e) { 
    initNewDialDialogNewGroupNameVisibleState($(this), true);
    var $groupName = $("#newDialGroupName");
    clearNewDialStatus($groupName);
}

/**
 * Display group dials
 *
 * @param group Object
 */
function displayGroupDials(group, allDials) {
    group = prepareCurrentGroupTilesEnd(group);
    displayHistoryItems({dials : /*allDials || */group.dials, group : group, displaySpeedDialPanel : true});
}

/**
 * Collect current directory dials
 *
 * @return Array
 */
function collectCurrentDirectoryDials() { 
    var list = [];
    var $container = $("#mv-tiles");
    $container.find(".mv-tile").filter(":visible").each(function() {
        var dialId = $(this).attr("data-dialid");
        if(dialId && list.indexOf(dialId) !== false)
            list.push(dialId);
    });
    return list;
}

/**
 * Show add new dial popup
 *
 * @param e Event
 */
function showAddNewDialPopup(e) {
    if(e) e.preventDefault();
    
    var $modal = $('#add-new-dial-dialog');
    var $modalTitle = $modal.find("#add-new-dial-dialog-title");
    var $form = $modal.find("#add-new-dial-form");
    if($form) {
        $modalTitle.text(translate("add_new_dial_dialog_title"));
        if($form.hasClass("edit-dial-dialog"))
            $form.removeClass("edit-dial-dialog");
        $form.attr("data-edit-dial-groupId", 0);
        $form.attr("data-edit-dial-dialId", 0);
        getNewDialGroups();
    }
    
    $modal.modal();
}

/**
 * Add new dial
 *
 * @param e Event
 */
function addNewDial(e) {
    e.preventDefault();
    
    var $modal = $('#add-new-dial-dialog');

    var isUpdate = false;
    var $form = $modal.find("#add-new-dial-form");
    var lastGroupId = 0;
    var editDialId = 0;
    if($form) {
        lastGroupId = $form.attr("data-edit-dial-groupId") || 0;
        editDialId = $form.attr("data-edit-dial-dialId") || 0;
        isUpdate = $form.hasClass("edit-dial-dialog") && lastGroupId && editDialId;
    }

    var $url = $("#newDialUrl");
    var $title = $("#newDialTitle");
    var $group = $("#newDialGroup");
    var $groupName = $("#newDialGroupName");
    
    if($url && $title && $group) {
        var url = $url.val().trim();
        var title = $title.val().trim() || translate("newtab_getting_title");
        var groupId = $group.val();
        var newGroupName = $groupName.val().trim();
        var hasError = false;
        clearNewDialStatus($url);
                
        if(url) {
            url = addUrlHttp(url);
            addNewDialSuccess($url);
        } else {
            addNewDialError($url, translate("add_new_dial_dialog_url_require"));
            hasError = true;
        }
        
        clearNewDialStatus($title);
        if(title) {
            addNewDialSuccess($title);
        } else {
            addNewDialError($title, translate("add_new_dial_dialog_name_require"));
            hasError = true;
        }
        
        clearNewDialStatus($group);
        clearNewDialStatus($groupName);
        if(groupId == 0) {
            if(newGroupName) {
                addNewDialSuccess($groupName);
            } else {
                addNewDialError($groupName, translate("add_new_dial_dialog_group_name_require"));
                hasError = true;
            }
        } else {
            newGroupName= "";
            addNewDialSuccess($group);
        }
    
        if(!hasError)
            confirmDial(url, title, groupId, hasError, lastGroupId, editDialId, isUpdate, newGroupName, $modal);
    }
}

/**
 * Confirm dial data
 *
 * @param url String
 * @param title String
 * @param groupId String
 * @param hasError Bool
 * @param lastGroupId String
 * @param editDialId String
 * @param isUpdate Bool
 * @param newGroupName Bool
 * @param $modal jQuery element
 */
function confirmDial(url, title, groupId, hasError, lastGroupId, editDialId, isUpdate, newGroupName, $modal) { 
    if(!hasError) {
        var upDate = new Date().getTime();
        var newGroup = {"id": generateUniqueId(upDate), "title": newGroupName, "addDate": upDate};
        newGroup.isActive = 1;
        if(isUpdate) {
            var groupChanged = isUpdate && (lastGroupId != groupId);
            var editedDial = {"id" : editDialId, "groupId" : groupId, "url" : url, "title" : title, "addDate": upDate};
            if(newGroupName) {
                refreshSidebarGroupListData(newGroup);
                setTimeout(function () {
                    BRW_sendMessage({command: "bgAddNewGroup", group: newGroup, collectGroups: collectCurrentDirectoryGroups(), tab: newtabPageTabId}, function(data) {
                        if(data && data.group) {
                            getNewDialGroups();
                            editedDial.groupId = data.group.id;
                            confirmMoveDialToNewGroup(editedDial, groupChanged, true);
                        }
                    });
                }, 250);
            } else
                confirmMoveDialToNewGroup(editedDial, groupChanged, false);
        } else {
            var newDial = {"id" : generateUniqueId(upDate), "groupId" : groupId, "url" : addUrlHttp(url), "title" : title, bg: getTileRandomColorScheme(), "addDate": upDate};
            if(newGroupName) {
                refreshSidebarGroupListData(newGroup);
                setTimeout(function () {
                    BRW_sendMessage({command: "bgAddNewGroup", group: newGroup, collectGroups: collectCurrentDirectoryGroups(), tab: newtabPageTabId}, function(data) {
                        if(data && data.group) {
                            getNewDialGroups();
                            newDial.groupId = data.group.id;
                            confirmCreateNewDial(newDial);
                        }
                    });
                }, 250);
            } else
                confirmCreateNewDial(newDial);
        }
        $modal.modal('hide');
                
        setTimeout(function () {
            //initTilesContextMenu(false, true);
        }, 350);
    }
}

/**
 * Confirm edited dial
 *
 * @param editedDial Object
 * @param groupChanged Bool
 * @param isNewGroup Bool
 */
function confirmMoveDialToNewGroup(editedDial, groupChanged, isNewGroup) {
    setTimeout(function() {
        BRW_sendMessage({
            command: "bgEditNewDial",
            dial: editedDial,
            collectDials : collectCurrentDirectoryDials(),
            groupChanged : groupChanged
        }, function(data) {
            if(data && data.dial) {
                editDial(data.dial, groupChanged, isNewGroup);
            }
            
            initTilesContextMenu(false, true);
        });
    }, 250);
}

/**
 * Confirm create new dial
 *
 * @param newDial Object
 */
function confirmCreateNewDial(newDial) { 
    setTimeout(function() {
        BRW_sendMessage({
            command: "bgAddNewDial",
            dial: newDial,
            collectDials : collectCurrentDirectoryDials()
        }, function(data) {
            if(data && data.dial) {
                var dial = data.dial;
                BRW_sendMessage({command: "getActiveGroup", withDials: false}, function(data) {
                    if(data && data.group && data.group.id == newDial.groupId)
                        addContextMenuToTileElement(displayDial(dial)).insertBefore("#mv-tiles .mv-new-dial");
                    
                    setTimeout(function() {
                        if(typeof Preview == "object" && typeof Preview.getImage == "function"){
                            var image = Preview.getImage();
                            var scheme = Preview.getColorScheme();
                            var mode   = Preview.state.mode || false;
                        }
                        else {var image = false; var scheme = false; var mode = false;}
                        
                        var thumbLoadMessage = {"command": "thumbLoad", "tiles" : [dial], "image": image, "scheme":scheme, "mode":mode};
                        
                        if(typeof tileThumbImageCache == "object" && tileThumbImageCache[dial.id]) tileThumbImageCache[dial.id] = false;
                            
                        BRW_sendMessage(thumbLoadMessage);
                        
                        if(dial.title == translate("newtab_getting_title")){
                            BRW_sendMessage({"command": "getAutoTitle", "dial" : dial}, (updDial)=>{
                                //BRW_sendMessage(thumbLoadMessage);
                            });
                        }else{
                            //BRW_sendMessage(thumbLoadMessage);
                        }
                        
                        //console.info(dial);
                        
                        initTilesContextMenu(false, true);
                    }, 210);
                });
            }
        });
    }, 250);
}

/**
 * Edit dial
 *
 * @param dial Object
 * @param groupChanged Bool
 * @param isNewGroup Bool
 */
function editDial(dial, groupChanged, isNewGroup) { 
    var $container = $("#mv-tiles");
    if(isNewGroup) {
        addContextMenuToTileElement(displayDial(dial)).insertBefore("#mv-tiles .mv-new-dial");
        setTimeout(function() {
            if(typeof Preview == "object" && typeof Preview.getImage == "function"){
                var image = Preview.getImage();
                var scheme = Preview.getColorScheme();
                var mode   = Preview.state.mode || false;
            }
            else {var image = false; var scheme = false; var mode = false;}
            
            var thumbLoadMessage = {"command": "thumbLoad", "tiles" : [dial], "image": image, "scheme":scheme, "mode":mode};
            
            if(typeof tileThumbImageCache == "object" && tileThumbImageCache[dial.id]) tileThumbImageCache[dial.id] = false;
            
            if(dial.title == translate("newtab_getting_title")){
                BRW_sendMessage({"command": "getAutoTitle", "dial" : dial}, (updDial)=>{
                    BRW_sendMessage(thumbLoadMessage);
                });
            }else{
                BRW_sendMessage(thumbLoadMessage);
            }
            
            //BRW_sendMessage({"command": "thumbLoad", "tiles" : [dial], "image": image, "scheme":scheme});
        }, 100);
    } else {
        $container.find("a.mv-tile[data-dialId=" + dial.id + "]").each(function() {
            var $el = $(this);
            var previousHref = $el.attr("href") || $el.attr("defHref");
            var newHref = dial.url;
            
            if (groupChanged) {
                $el.fadeOut(350, function () {
                    $(this).remove();
                });
            } else {
                $el.attr("data-groupId", dial.groupId);
                $el.attr("data-dialId", dial.id);
                
                $el.attr("defHref", dial.url);
                $el.attr("fullHref", dial.url);

                $el.attr("title", dial.title);
                var $faviconImg = $el.find(".mv-favicon img");
                if ($faviconImg)
                    
                    $faviconImg.attr("src", BRW_favicon(getUrlDomain(dial.url)));
                
                var $title = $el.find(".mv-title");
                if ($title)
                    $title.text(dial.title);
            }

            if(typeof Preview == "object" && typeof Preview.getImage == "function"){
                var image = Preview.getImage();
                var scheme = Preview.getColorScheme();
                var mode   = Preview.state.mode || false;
            }
            else {var image = false; var scheme = false; var mode = false;}
            
            if(previousHref != newHref || image || scheme) {
                var $thumb = $el.find(".mv-thumb");
                if($thumb) {
                    $thumb.fadeOut(250, function() {
                        if($thumb.hasClass("mv-thumb-live"))
                            $thumb.removeClass("mv-thumb-live");

                        if($thumb.hasClass("mv-thumb-image"))
                            $thumb.removeClass("mv-thumb-image");

                        if(!$thumb.hasClass("mv-thumb-loading")) {
                            $thumb.addClass("mv-thumb-loading");
                            var $thumbImg = $("<div></div>");
                            var loadingImg = extensionGetUrl("pages/newtab/css/img/buttons/tiles/loading.gif");
                            $thumbImg.css({"background" : "url('" + loadingImg + "') 50% 50% no-repeat"});
                            $thumbImg.addClass("thumbnail").addClass("thumbnail-loading");
                            $thumb.html("").append($thumbImg);
                        }
                        $thumb.fadeIn(250);
                    });
                }
                setTimeout(function() {
                    /*
                    BRW_sendMessage({
                        "command": "thumbLoad",
                        "tiles" : [dial],
                        "image": image,
                        "scheme":scheme
                    });
                    */
                    var thumbLoadMessage = {
                        "command": "thumbLoad",
                        "tiles" : [dial],
                        "image" : image,
                        "scheme": scheme,
                        "mode"  : mode
                    };
                    
                    if(typeof tileThumbImageCache == "object" && tileThumbImageCache[dial.id]) tileThumbImageCache[dial.id] = false;
                    
                    if(dial.title == translate("newtab_getting_title")){
                        BRW_sendMessage({"command": "getAutoTitle", "dial" : dial}, (updDial)=>{
                            BRW_sendMessage(thumbLoadMessage);
                        });
                    }else{
                        BRW_sendMessage(thumbLoadMessage);
                    }
                    
                    
                }, 100);
            }
        });
    }
}

/**
 * Display dial
 *
 * @param dial Object
 * @return jQuery element
 */
function displayDial(dial) { 
    dial.dialId = dial.id;
    dial.title = dial.title ? dial.title : dial.url;
    dial.hostUrl = getUrlHost(dial.url);
    
    dial.hostData = Trim(String(dial.hostUrl).toLowerCase().replace('wwwww.','').replace('wwww.','').replace('www.',''), '/\\').split(".");
    
    var $tile = displayTileItem(dial, dial.orderNum);
    addHoverFadeEffectToElements($tile);
    return $tile;
}

/**
 * Clear new dial status
 *
 * @param $el jQuery element
 */
function clearNewDialStatus($el) { 
    var $formGroup = $el.closest(".form-group");
    if($formGroup) {
        if($formGroup.hasClass("has-success"))
            $formGroup.removeClass("has-success");
        if($formGroup.hasClass("has-error"))
            $formGroup.removeClass("has-error");
        var $label = $formGroup.find(".glyphicon");
        if($label) {
            if($label.hasClass("glyphicon-ok"))
                $label.removeClass("glyphicon-ok");
            if($label.hasClass("glyphicon-remove"))
                $label.removeClass("glyphicon-remove");
        }
        var $error = $formGroup.find(".form-control-error");
        if($error)
            $error.text("");
    }
}

/**
 * Add new dial error
 *
 * @param $el jQuery element
 */
function addNewDialSuccess($el) { 
    var $formGroup = $el.closest(".form-group");
    if($formGroup) {
        $formGroup.addClass("has-success");
        var $label = $formGroup.find(".glyphicon");
        if($label)
            $label.addClass("glyphicon-ok");
    }
}

/**
 * Add new dial error
 *
 * @param $el jQuery element
 * @param text String
 */
function addNewDialError($el, text) { 
    var $formGroup = $el.closest(".form-group");
    if($formGroup) {
        $formGroup.addClass("has-error");
        var $label = $formGroup.find(".glyphicon");
        if($label)
            $label.addClass("glyphicon-remove");
        var $error = $formGroup.find(".form-control-error");
        if($error)
            $error.text(text);
    }
}

function dialTitleUpdate(dial) {
    $("#mv-container")
        .find("[data-dialId='"+dial.id+"']").attr("title", dial.title)
        .find(".mv-title").text(dial.title)
    ;
    
    return true;
}














