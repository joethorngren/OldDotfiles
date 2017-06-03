$(function() {
    BRW_langLoaded(function(){
        BRW_sendMessage({command: "getSidebarStatus"}, function(data) { 

            var $wraperSideBarToogleButton = $("#sidebar-toggle-panel");
            var $sideBarTogglePanel = $("#sidebar-toggle-button");
            var $sideBar = $("#sidebar-wrap");
            var $sideContent = $sideBar.find(".sidebar-content");
            
            $sideBar.find("#sidebar-settings-button").on("click", function(e) {
                e.preventDefault();
                var url = extensionGetUrl("/pages/options/settings.html");
                
                var event = window.event || e;//Firefox
                
                if(event.ctrlKey || e.which == 2)
                    openUrlInNewTab(url);
                else
                    openUrlInCurrentTab(url);
            });
            var sideBarTogglePanelTitle = "";
            if(data.status) {
                $sideBar.addClass("open");
                sideBarTogglePanelTitle = translate("page_sidebar_toggle_button_title_off");
                
            } else {
                $sideBar.addClass("sidebar-toggle-animation");
                sideBarTogglePanelTitle = translate("page_sidebar_toggle_button_title_on");
                
            }
            $wraperSideBarToogleButton.tooltip({"placement": "left", "delay": {show: 600}, "trigger": "hover", "title": sideBarTogglePanelTitle});
            
            $sideBarTogglePanel.on("click", function(e) {
                sidebarToggleHandler();
            }).hover(function(){
                $(this).addClass('hover');
            }, function() {
                $(this).removeClass('hover');
                $(this).tooltip('hide');
            });
            
            addDefaultTabLink();
            addSidebarScrollBar();
        });
    });
});

function sidebarToggleHandler(action){
    var $el = $("#sidebar-toggle-button");
    var $sideBar = $("#sidebar-wrap");
        $sideBar.addClass("sidebar-toggle-animation");
    var wasActive = $sideBar.hasClass("open");
    var $wraperSideBarToogleButton = $("#sidebar-toggle-panel");
    
    if(
        action &&
        (action == "open"  && wasActive == true) ||
        (action == "close" && wasActive == false)
    ){
        return false;
    }
    
    BRW_sendMessage({command: "setSidebarStatus", "val" : wasActive ? 0 : 1});
    
    setTimeout(function(){
        if(wasActive){
            setTimeout(function(){
                recalculateDialsSize();
            }, 250);
        }else{
            recalculateDialsSize();
        }
    }, 100);
    
    $sideBar.toggleClass("open");

    $wraperSideBarToogleButton.tooltip('hide');
    if(wasActive)
        $wraperSideBarToogleButton.attr('data-original-title', translate("page_sidebar_toggle_button_title_on")).tooltip('fixTitle');
    else
        $wraperSideBarToogleButton.attr('data-original-title', translate("page_sidebar_toggle_button_title_off")).tooltip('fixTitle');

    if(!wasActive)
        hideClockWhenSidebarAction(10);

    setTimeout(function() {
        var $sideBar = $("#sidebar-wrap");
        var isActive = $sideBar.hasClass("open");
        if(!isActive) {
            $wraperSideBarToogleButton.removeClass('hover');
        }
    }, 500);
}

function addSidebarScrollBar(){
    $(".sidebar-content-scroll").mCustomScrollbar({
        //theme:"minimal",
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
    });
}

function addDefaultTabLink(){
    $li = $('.default-tab li');
    
    $el = $("<span></span>").addClass("a");
    
    if(BROWSER && BROWSER == 'firefox'){
        $el.text('Firefox Tab');
    }else{
        if(localStorage.getItem("browser-mode") != "opera"){
            $el.text('Chrome Tab');
        }else{
            $el.text('Opera Tab');
        }
    }
    
    $li.append($el);
    
    $(document).on("mousedown", ".default-tab", function(e){
        e.preventDefault(); e.stopPropagation();
        
        if(e && e.which == 3){
            return;
        }else if(e && e.which == 2){
            BRW_openDefaultTab("_background");
        }else{
            BRW_openDefaultTab();
        }//else
    });
}//addDefaultTabLink


/**
 * Init sidebar groups
 *
 * @param groups Array
 */

var groupsInSorting;//firefox

function initSidebarGroups(groups) {
    BRW_sendMessage({command: "getDisplayPopularGroup"}, function(data) {
        var displayPopularGroup = data.display;
        var $sideBar = $("#sidebar-wrap");
        var $groups = $("#sidebar-groups");
        
        $groups.fadeOut(0, function() {
            var $el = $(this);
            var $container = $("#sidebar-groups").html("");
            $(".sidebar-group-item").each(function() {
                $(this).removeClass("selected");
            });

            var hasGroups = false;

            for(var i in groups) {
                if(groups.hasOwnProperty(i)) {
                    var group = groups[i];
                    if(group.type == GROUP_TYPE_POPULAR && !displayPopularGroup)
                        continue;
                    $container.append(displayGroup(group));
                    hasGroups = true;
                }
            }

            if(hasGroups) {
                $container.sortable({
                    placeholder: "mv-placeholder",
                    forcePlaceholderSize: true,
                    delay: 100,
                    tolerance: "pointer",
                    cursor: "move",
                    appendTo: "#sidebar-groups",
                    axis: "y",
                    start: function(ev, ui) {
                        groupsInSorting = true;//firefox
                        
                        $(ui.item).addClass("mv-group-sortable");
                    },
                    stop: function(ev, ui) {
                        $(ui.item).removeClass("mv-group-sortable");
                        setTimeout(function() {
                            groupsInSorting = false;//firefox
                            
                            BRW_sendMessage({command: "moveGroupsOrder", "collectGroups" : collectCurrentDirectoryGroups()});
                        }, 250);
                    }
                });
            }

            $el.fadeIn(50);
            setTimeout(function() {
                initGroupContextMenu();
                $sideBar.show(0);
            }, 400);
        });
    });
}

/**
 * Show add new dial popup
 */
function showAddNewGroupPopup() {
    var $modal = $('#add-new-group-dialog');
    var $modalTitle = $modal.find("#add-new-group-dialog-title");
    var $form = $modal.find("#add-new-group-form");
    if($form) {
        $modalTitle.text(translate("add_new_group_dialog_title"));
        if($form.hasClass("edit-group-dialog"))
            $form.removeClass("edit-group-dialog");
        $form.attr("data-edit-groupId", 0);
    }

    $modal.modal();
}

/**
 * Init add new group popup
 */
function initAddNewGroupPopup() {
    var $modal = $('#add-new-group-dialog');
    $modal.on('shown.bs.modal', function () {
        $('#newGroupTitle').focus();
        
        var newGroupTitleVal = $('#newGroupTitle').val();
        $('#newGroupTitle').val('').focus().val(newGroupTitleVal);//Move cursor to end of the line
    });
    $modal.on('hidden.bs.modal', function () {
        var $title = $("#newGroupTitle");
        clearNewGroupStatus($title);
        $title.val("");
    });
    $("#add-new-group-form").on("submit", addNewGroup);
    $("#sidebar-add-group-container").on("click", showAddNewGroupPopup);
    $("#sidebar-add-icon").on("click", showAddNewGroupPopup);
}

/**
 * Init delete group popup
 */
function initDeleteGroupPopup() {
    var $modal = $('#delete-group-dialog');
    $modal.on('hidden.bs.modal', function () {
        var $deleteInput = $("#deleteGroupId");
        $deleteInput.val("");
    });
    $("#delete-group-form").on("submit", deleteGroup);
}

/**
 * Add new group
 *
 * @param e Event
 */
function addNewGroup(e) {
    e.preventDefault();
    var $modal = $('#add-new-group-dialog');
    var isUpdate = false;
    var $form = $modal.find("#add-new-group-form");
    var editGroupId = 0;
    if($form) {
        editGroupId = $form.attr("data-edit-groupId") || 0;
        isUpdate = $form.hasClass("edit-group-dialog") && editGroupId;
    }

    var $title = $("#newGroupTitle");
    if($title) {
        var title = $title.val().trim();
        var hasError = false;

        clearNewGroupStatus($title);
        if(title) {
            addNewGroupSuccess($title);
        } else {
            addNewGroupError($title, translate("add_new_group_dialog_name_require"));
            hasError = true;
        }

        if(!hasError)
            confirmGroup(title, editGroupId, isUpdate, $modal);
    }
}

/**
 * Clear new group status
 *
 * @param $el jQuery element
 */
function clearNewGroupStatus($el) {
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
 * Confirm dial data
 *
 * @param title String
 * @param editGroupId Number
 * @param isUpdate Bool
 * @param $modal jQuery element
 */
function confirmGroup(title, editGroupId, isUpdate, $modal) {
    var upDate = new Date().getTime();
    if (isUpdate) {
        var editedGroup = {"id": editGroupId, "title": title, "addDate": upDate};
        editGroup(editedGroup);
        setTimeout(function () {
            BRW_sendMessage({
                command: "bgEditNewGroup",
                group: editedGroup,
                collectGroups: collectCurrentDirectoryGroups(),
                tab : newtabPageTabId
            }, function(data) {
                //console.log(data);
            });
        }, 250);
    } else {
        var newGroup = {"id": generateUniqueId(upDate), "title": title, "addDate": upDate};
            newGroup.isActive = 1;
        refreshSidebarGroupListData(newGroup);
        setTimeout(function () {
            BRW_sendMessage({
                command: "bgAddNewGroup",
                group: newGroup,
                collectGroups: collectCurrentDirectoryGroups(),
                tab : newtabPageTabId
            }, function(data) {
                if(data && data.group) getNewDialGroups();
                
                try{
                    $("#sidebar-groups [data-group='"+data.group.id+"']").find(".sidebar-group-title").text(data.group.title);
                }
                catch(e){};
            });
        }, 250);
    }
    $modal.modal('hide');
    hideClockWhenSidebarAction();
}

/**
 * Refresh sidebar new group data
 *
 * @param newGroup Object
 */
function refreshSidebarGroupListData(newGroup) {
    $(".sidebar-group-item").each(function() {
        $(this).removeClass("selected");
    });

    $("#sidebar-groups").append(addContextMenuToGroupElement(displayGroup(newGroup)));
    var $dialsContainer = $("#mv-tiles");
    $dialsContainer.fadeOut(250, function() {
        $dialsContainer.find(".mv-tile").each(function () {
            $(this).remove();
        });
        $dialsContainer.find(".mv-new-dial").each(function () {
            $(this).remove();
        });
        $dialsContainer.append(displayAddNewDial());
        $dialsContainer.fadeIn(250);
    });

    var $container = $("#newDialGroup");
    var $option = $("<option></option>");
    $option.val(newGroup.id);
    $option.text(newGroup.title);
    $container.append($option);
}


/**
 * Edit group
 *
 * @param group Object
 */
function editGroup(group) {
    var $container = $("#sidebar-groups");
    $container.find("li.sidebar-group-item[data-group=" + group.id + "]").each(function() {
        var $el = $(this);
        var $title = $el.find(".sidebar-group-title");
        if ($title) {
            $title.text(group.title);

            var $groupsContainer = $("#newDialGroup");
            $groupsContainer.find("option[value=" + group.id + "]").each(function() {
                $(this).text(group.title);
            });
        }
    });
}

/**
 * Display group
 *
 * @param group Object
 */
function displayGroup(group) {
    var $list = $("<li></li>");
    $list.addClass("sidebar-group-item");
    $list.attr("data-group", group.id);
    if(group.isActive)
        $list.addClass("selected");

    var imgSrc = extensionGetUrl("pages/newtab/img/groups/icon.png"); 
    if(group.type == GROUP_TYPE_DEFAULT) {
        $list.addClass("group-is-default");
        imgSrc = extensionGetUrl("pages/newtab/img/groups/fav.png");
    } else if(group.type == GROUP_TYPE_POPULAR) {
        $list.addClass("group-is-popular");
        imgSrc = extensionGetUrl("pages/newtab/img/groups/fav.png");
    }

    var $description = $("<div></div>");
    $description.addClass("sidebar-group-description");

    var $descriptionImg = $("<img>");
    $descriptionImg.addClass("sidebar-group-image");
    $descriptionImg.attr("src", imgSrc);

    var $descriptionTitle = $("<span></span>");
    $descriptionTitle.addClass("sidebar-group-title");

    if(group.type == GROUP_TYPE_DEFAULT) {
        if(group.title)
            $descriptionTitle.text(group.title);
        else
            $descriptionTitle.text(translate("page_dials_default_group_title"));
    } else if(group.type == GROUP_TYPE_POPULAR) {
        $descriptionTitle.text(translate("page_dials_popular_group_title"));
    } else {
        $descriptionTitle.text(group.title);
    }

    if(group.type != GROUP_TYPE_POPULAR) {
        var $contextMenuBtnContainer = $("<div></div>").addClass("group-context-menu-container");
        var $contextMenuBtn = $("<img>").addClass("group-context-menu-btn");
        $contextMenuBtn.attr("src", extensionGetUrl("pages/newtab/img/context/context_group.png"));
        $contextMenuBtnContainer.append($contextMenuBtn);
        $description.append($contextMenuBtnContainer);
    }

    $description.append($descriptionImg).append($descriptionTitle);

    $list.append($description);

    $list.on("click", function(e) {
        e.preventDefault();
        
        var groupId = $(this).attr("data-group");
        
        if(groupId && !$(this).hasClass("selected")) {
            /*
            $(".sidebar-group-item").each(function() {
                $(this).removeClass("selected");
            });
            $(".sidebar-group-item[data-group=" + groupId + "]").each(function() {
                $(this).addClass("selected");
            });
            */
            changeActiveGroupHandler(groupId);
        }
    });

    return $list;
}

/**
 * Change active group handler
 *
 * @param groupId Number
 */
function changeActiveGroupHandler(groupId) {
    if(groupsInSorting) return false;//firefox
    
    $(".sidebar-group-item.selected").removeClass("selected");
    
    $(".sidebar-group-item[data-group=" + groupId + "]").addClass("selected");
    
    if($("#mv-tiles .mCustomScrollBox").length){
        //$("#mv-tiles").mCustomScrollbar("destroy");
    }//if
    //tilesContainerHeight(false, -30);
    
    TIMER = Date.now();
    
    currentActiveGroup = groupId;
    BRW_sendMessage({command: "changeActiveGroup", groupId: groupId}, function(data) {
        //console.debug("changeActiveGroup", (Date.now()-TIMER)/1000, "sec; Dials count:", Size(data.group.dials));
        
        var $restoreContainerWrap = $("#mv-restore-container-wrap");
        if($restoreContainerWrap && $restoreContainerWrap.is(":visible"))
            $restoreContainerWrap.hide(0);

        if(lastRestoredDialTimer)
            clearTimeout(lastRestoredDialTimer);
        if(lastRestoredDialUrl)
            lastRestoredDialUrl = null;

        if(groupId == GROUP_POPULAR_ID) {
            analyzeHistory(buildTilesList);
        } else {
            displayGroupDials(data.group/*, data.allDials || false*/);
        }
        getNewDialGroups();
        hideClockWhenSidebarAction();
        
        //tilesContainerHeight();
        setTimeout(function(){
            //tilesContainerHeight(true);
        }, 350);
        
    });
}

/**
 * Hide clock when side bar action
 *
 * @param timer Number
 */
function hideClockWhenSidebarAction(timer) {
    setTimeout(function() {
        var $tilesWrap = $("#mv-tiles-wrap");
        var $tilesContainer = $(".mv-tiles");
        if(!$tilesContainer.is(":visible")) {
            var $popup = $("#dials-notifications");
            var $clock = $("#clock-container");
            BRW_sendMessage({"command": "setVisibleSpeedDialPanel", "val" : true});
            //$("#footer-visible-dials").text(translate("page_footer_visible_dials_link_off"));
            $("#footer-visible-dials").attr("title", translate("page_footer_visible_dials_link_off"));
            if(displayPopupTimeOut)
                clearTimeout(displayPopupTimeOut);
            if($popup.is(":visible")) {
                hideClock(150);
                $popup.fadeOut(250, function() {
                    $tilesWrap.fadeIn(250);
                    $tilesContainer.fadeIn(250);
                });
            } else {
                var $clockWrap = $("#mv-clock-wrap");
                
                if($clock.is(":visible")) {
                    $clock.fadeOut(150, function() {
                        $tilesWrap.fadeIn(250);
                        $tilesContainer.fadeIn(250);
                    });
                    
                     $clockWrap.fadeOut(150);
                    
                     if(typeof FocusLikeClock == "function") FocusLikeClock("hide");
                } else {
                    $tilesWrap.fadeIn(250);
                    $tilesContainer.fadeIn(250);
                }
            }
        }
    }, timer || 500);
}

/**
 * Collect groups list
 *
 * @return Array
 */
function collectCurrentDirectoryGroups() {
    var list = [];
    var $container = $("#sidebar-groups");
    $container.find(".sidebar-group-item").each(function() {
        var $el = $(this);
        var groupId = $el.attr("data-group");
        if (groupId && list.indexOf(groupId) !== false)
            list.push(groupId);
    });
    return list;
}

/**
 * Add new group error
 *
 * @param $el jQuery element
 */
function addNewGroupSuccess($el) {
    var $formGroup = $el.closest(".form-group");
    if($formGroup) {
        $formGroup.addClass("has-success");
        var $label = $formGroup.find(".glyphicon");
        if($label)
            $label.addClass("glyphicon-ok");
    }
}

/**
 * Add new group error
 *
 * @param $el jQuery element
 * @param text String
 */
function addNewGroupError($el, text) {
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

/**
 * Delete group
 *
 * @param e Event
 */
function deleteGroup(e) {
    e.preventDefault();
    var $deleteInput = $("#deleteGroupId");
    var deleteGroupId = $deleteInput.val();
    var $group = $(".sidebar-group-item[data-group=" + deleteGroupId + "]");
    if($group)
        deleteGroupConfirm($group);
}

/**
 * Delete group
 *
 * @param $el jQuery element
 */
function deleteGroupConfirm($el) {
    if ($el) {
        var $modal = $("#delete-group-dialog");
        var groupId = $el.attr("data-group");
        var groupWasActive = $el.hasClass("selected");
        $el.fadeOut(350, function() {
            $(this).remove();
            setTimeout(function() {
                BRW_sendMessage({
                    "command": "deleteGroupById",
                    "groupId" : groupId,
                    "collectGroups" : collectCurrentDirectoryGroups(),
                    "tab" : newtabPageTabId
                });
            }, 250);
        });

        var $groupsContainer = $("#newDialGroup");
        $groupsContainer.find("option[value=" + groupId + "]").each(function() {
            $(this).remove();
        });

        if(groupWasActive) {
            var $prevGroup = $el.prev();
            if($prevGroup) {
                var prevGroupId = $prevGroup.attr("data-group");
                if(prevGroupId) {
                    $(".sidebar-group-item").each(function() {
                        $(this).removeClass("selected");
                    });
                    $(".sidebar-group-item[data-group=" + prevGroupId + "]").each(function() {
                        $(this).addClass("selected");
                    });
                    changeActiveGroupHandler(prevGroupId);
                }
            }
        }

        $modal.modal('hide');
    }
}

function sidebarDialsUpdate(){
    if(getDisplaySpeedDialPanel()){
        getSidebarGroups();

        if(getVisibleSpeedDialPanel()){
            setTimeout(function(){
                $(".sidebar-group-item.selected").removeClass("selected").trigger("click");
            }, 180);
        }//if
    }//if
}//if

var sidebarWithScrollTriggerValue=false;
function sidebarWithScrollTrigger(mode){
    sidebarWithScrollTriggerValue = mode;
    
    setTimeout(function(){
        if(sidebarWithScrollTriggerValue == "with-scroll"){
            $(".sidebar-wrap").removeClass("not-sidebar-wrap-page-scroll").addClass("sidebar-wrap-page-scroll");
        }else if($(".sidebar-wrap").hasClass("sidebar-wrap-page-scroll")){
            $(".sidebar-wrap").removeClass("sidebar-wrap-page-scroll").addClass("not-sidebar-wrap-page-scroll");
        }
    }, 150);
}//function

